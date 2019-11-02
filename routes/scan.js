import express from 'express'
import {
  check, validationResult
}
from 'express-validator'
import sqlite from 'sqlite'
import debug from 'debug'
import Promise from 'bluebird'
import chinaTime from 'china-time'

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

  const check = check_qrcode_vailed(req.query.qrcode);
  check.then(ok => {
    if (ok) {
      trace('ok')
      return res.status(200).json({
        code: 1,
        msg: "请求成功",
        voice: `欢迎光临茶室`,
        door: 1,
        air: 1,
        socket: 1,
        lamp: 1
      });
    }
  })

  check.then(ok => {
    if (!ok)
      return res.status(200).json({
        code: 0,
        msg: "请求失败"
      })
  })

  if (req.query.qrcode == 'wrong_qrcode') {
    return res.status(200).json({
      code: 1,
      msg: "请求成功",
      voice: `谢谢惠顾`,
      door: 0,
      air: 2,
      socket: 2,
      lamp: 2
    });
  }

});

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

module.exports = router;
