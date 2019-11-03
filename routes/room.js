import express from 'express'
import {
  check, validationResult
}
from 'express-validator'
import debug from 'debug'
import Utility from './Utility'
let trace = debug('teaServ:room');
let router = express.Router();
import sqlite from 'sqlite'
const dbPromise = sqlite.open('./db/teaServer.db', {
  Promise
})
router.get('/', (req, res, next) => {
  res.send('Please use post method')
  res.end();
});

router.post('/auth', [
  check('appid').exists({
    checkFalsy: true
  })
], (req, res, next) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array()
    })
  }

  const create = create_token(req.query.appid);
  create.then((token) => {
    trace('auth result 1', token)
    if (token) return res.status(200).json({
      code: 0,
      msg: 'success',
      data: {
        token: token
      }
    })
    else return res.status(200).json({
      code: 9997,
      msg: 'no appid',
      data: {}
    })
  })
});

router.post('/getinfo', [
  check('token').exists({
    checkFalsy: true
  })
], (req, res, next) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array()
    })
  }

  const vaild = vaild_token(req.query.token);
  vaild.then((ok) => {
    if (!ok) return res.status(200).json({
      code: 9998,
      msg: 'token failed!',
      data: {}
    })
    if (ok) {
      const getinfo = room_getinfo();
      getinfo.then((roomlist) => {
        trace('getinfo', roomlist)
        return res.status(200).json({
          code: 0,
          msg: 'success',
          data: roomlist
        })
      })
    }
  })
});

router.post('/getstatus', [
  check('uuid').exists({
    checkFalsy: true
  }),
  check('token').exists({
    checkFalsy: true
  })
], (req, res, next) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array()
    })
  }

  const vaild = vaild_token(req.query.token);
  vaild.then((ok) => {
    if (!ok) return res.status(200).json({
      code: 9998,
      msg: 'token failed!',
      data: {}
    })
    if (ok) {
      const getstatus = room_getstatus(req.query.uuid)
      getstatus.then((room) => {
        if (typeof room == 'object' && 'cpuid' in room) {
          return res.status(200).json({
            code: 0,
            msg: 'success',
            data: {
              uuid: room.cpuid,
              door: room.door,
              lamp: room.lamp,
              socket: room.socket,
              air: room.air
            }
          })
        } else return res.status(200).json({
          code: 9999,
          msg: 'uuid failed!',
          data: {}
        })
      });
    }
  })
});
/* GET home page. */
router.post('/changestatus', [
  check('uuid').exists({
    checkFalsy: true
  }),
  check('token').exists({
    checkFalsy: true
  }),
  check('door').exists({
    checkFalsy: true
  }),
  check('lamp').exists({
    checkFalsy: true
  }),
  check('socket').exists({
    checkFalsy: true
  }),
  check('air').exists({
    checkFalsy: true
  })
], (req, res, next) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array()
    })
  }

  var device_status = {
    door: req.query.door,
    lamp: req.query.lamp,
    socket: req.query.socket,
    air: req.query.air
  }

  const vaild = vaild_token(req.query.token);
  vaild.then((ok) => {
    if (!ok) return res.status(200).json({
      code: 9998,
      msg: 'token failed!',
      data: {}
    });
    if (ok) {
      const change = room_changestatus(req.query.uuid, device_status);
      change.then((done) => {
        if (done) return res.status(200).json({
          code: 0,
          msg: 'success',
          data: {}
        })
        else return res.status(200).json({
          code: 9999,
          msg: 'failed',
          data: {}
        })
      })
    }
  });

});

async function create_token(appid) {
  trace('appid', appid)
  try {
    const db = await dbPromise;
    const [accesstoken] = await Promise.all([
      db.get(
        `SELECT token,appid,vaild FROM accesstoken WHERE appid = ? `,
        appid
      )
    ]);
    trace('create_token select:', typeof accesstoken, accesstoken);

    if (typeof accesstoken == 'object' && 'appid' in accesstoken) {
      var token = Utility.nonce()
      const [rv] = await Promise.all([
        db.run(
          `UPDATE accesstoken SET token = ?, vaild = 1, expire_date = datetime('now','+24 hour','localtime'), modify_time = datetime('now','localtime')`,
          token
        )
      ]);
      trace('create_token insert:', typeof rv, rv);
      return token || [];
    }
  } catch (err) {
    trace('create_token!', err)
  }
}

async function vaild_token(token) {
  const db = await dbPromise;
  const [accesstoken] = await Promise.all([
    db.get(
      `SELECT token,appid,vaild FROM accesstoken WHERE token = ? `,
      token
    )
  ]);
  trace('vaild_token select:', typeof accesstoken, accesstoken);

  if (typeof accesstoken == 'object' && 'token' in accesstoken) {
    return true;
  }
  return false;
}

async function room_getinfo() {
  const db = await dbPromise;
  const [rooms] = await Promise.all([
    db.all(
      `SELECT name,cpuid FROM room`
    )
  ]);
  trace('room_getinfo select:', typeof rooms, rooms);

  if (typeof rooms == 'object') {
    return rooms;
  }
  return [];
}

async function room_getstatus(uuid) {
  const db = await dbPromise;
  const [room] = await Promise.all([
    db.get(
      `SELECT name,cpuid, door,lamp,socket,air FROM room WHERE cpuid = ?`,
      uuid
    )
  ]);

  trace('room_getstatus select:', typeof room, room);

  if (typeof room == 'object' && 'cpuid' in room) {
    return room
  }

  return [];
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
