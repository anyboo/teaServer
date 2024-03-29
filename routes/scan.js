import express from 'express'
import {
  check, validationResult
}
from 'express-validator'
import sqlite from 'sqlite'
import debug from 'debug'
import Promise from 'bluebird'
import chinaTime from 'china-time'
import got from 'got'
import querystring from 'querystring'

const trace = debug('teaServ:scan');
const router = express.Router();
const dbPromise = sqlite.open('./db/teaServer.db', {
  Promise
})

router.post('/', (req, res, next) => {
  res.send('Please use post method')
  res.end();
});
/* GET home page. */
router.get('/', [
  check('cpuid').exists({
    checkFalsy: true
  }),
  check('qrcode').exists({
    checkFalsy: true
  })
], (req, res, next) => {
  trace('%s request -> %s', req.baseUrl, JSON.stringify(req.query));

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array()
    })
  }

  if (req.query.qrcode == 'wrong_qrcode') {
    const changes = room_changestatus(req.query.cpuid, {
      door: 0,
      air: 2,
      socket: 2,
      lamp: 2
    })
    changes.then((ok) => {
      trace('wrong_qrcode', 1)
      if (!ok) return res.status(200).json({
        code: 0,
        msg: "请求失败"
      });
      if (ok) return res.status(200).json({
        code: 1,
        msg: "请求成功",
        voice: `谢谢惠顾`,
        door: 0,
        air: 2,
        socket: 2,
        lamp: 2
      });
    })
  }

  const check = check_qrcode_vailed(req.query.qrcode);
  check.then(ok => {
    if (ok) {
      trace('ok')
      const changes = room_changestatus(req.query.cpuid, {
        door: 0,
        air: 1,
        socket: 1,
        lamp: 1
      })
      changes.then((ok) => {
        if (!ok) return res.status(200).json({
          code: 0,
          msg: "请求失败"
        });
        if (ok) return res.status(200).json({
          code: 1,
          msg: "请求成功",
          voice: `欢迎光临茶室`,
          door: 1,
          air: 1,
          socket: 1,
          lamp: 1
        });
      })
    } else {
      const check2 = check_qrcode_vailed_2(req.query.qrcode, req.query.cpuid)
      check2.then(pass => {
        if (pass) {
          trace('pass')
          const changes = room_changestatus(req.query.cpuid, {
            door: 0,
            air: 1,
            socket: 1,
            lamp: 1
          })
          changes.then((ok) => {
            if (!ok) return res.status(200).json({
              code: 0,
              msg: "请求失败"
            });
            if (ok) return res.status(200).json({
              code: 1,
              msg: "请求成功",
              voice: `欢迎光临茶室`,
              door: 1,
              air: 1,
              socket: 1,
              lamp: 1
            });
          })
        } else {
          return res.status(200).json({
            code: 0,
            msg: "请求失败"
          })
        }
      });
    }
  })
});

async function check_qrcode_vailed_2(code, uuid) {
  try {
    const query = querystring.stringify({
      p: [`${code}`],
      uuid: [`${uuid}`]
    });
    trace('querystring ->', query);
    const response = await got.post(
      'https://www.jiadaoyun.com/tmcs/api/v1/hardware/receiveData', {
        query
      }).then((res) => {
      let pass = JSON.parse(res.body);
      trace('pass =>', pass);
      if (pass.code == 500) {
        trace('pass room change')
        throw 'pass code is invailed!'
      }
    });
    return true;
  } catch (e) {
    trace('check_qrcode_vailed', e);
    return false
  }
}

async function check_qrcode_vailed(code) {
  try {
    const db = await dbPromise;
    const result = await Promise.all([
      db.get('SELECT * FROM qrcode WHERE code = ? AND vaild = 1',
        code)
    ]).then(result => {
      trace('qrcode', result)
      let qrcode = result[0]
      if (qrcode == undefined)
        throw 'is invailed!';

      const ctime = chinaTime('YYYY-MM-DD HH:mm:ss')
      trace('ctime:', ctime)
      trace('qrtime:', qrcode.last_time)
      let d1 = Date.parse(ctime)
      let d2 = Date.parse(qrcode.last_time)
      trace('t1 :', d1)
      trace('t2 :', d2)
      if (d1 >= d2)
        throw 'Game Over'

      if (qrcode.last_time == null) {
        db.run(
          `UPDATE qrcode SET first_time = datetime('now','localtime'), last_time = datetime('now','+3 hours','localtime') WHERE id = ?`,
          qrcode.id);
      }
    });
    return true;
  } catch (err) {
    trace('check_qrcode_vailed', err);
    return false
  }
  //trace('check', check)
}

async function To3rdPartySend(qrcode) {
  trace('To3rdPartySend', qrcode);
  try {
    const query = querystring.stringify({
      p: [`${qrcode}`]
    });
    trace('querystring ->', query);
    const response = got.post(
      'https://www.jiadaoyun.com/tmcs/api/v1/hardware/receiveData', {
        query
      });
    response.then((res) => {
      trace(res.body);
    })
  } catch (e) {
    trace(e)
  }
}

async function room_changestatus(uuid, device_status) {
  trace('room_changestatus', uuid, device_status)
  try {
    const db = await dbPromise;
    const [room] = await Promise.all([
      db.run(
        `UPDATE room SET door = ?,lamp = ?,socket = ?,air =? WHERE cpuid = ?`,
        device_status.door, device_status.lamp, device_status.socket,
        device_status.air, uuid
      )
    ]);

    trace('room_changestatus select:', typeof room, room);

    if (typeof room == 'object' && room.changes == 1) {
      return 1;
    }

    return 0;
  } catch (err) {
    trace('room_changestatus', err)
  }
}

module.exports = router;
