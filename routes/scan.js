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

  if (req.query.qrcode == 'right_qrcode_fixed_20191024120000') {

    return res.status(200).json({
      code: 1,
      msg: "请求成功",
      voice: `欢迎${req.query.qrcode}光临茶室`,
      door: 1,
      air: 1,
      socket: 1,
      lamp: 1
    });
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
var qrcode_temparoy = [
  'c4ca4238a0b923820dcc509a6f75849b',
  'c81e728d9d4c2f636f067f89cc14862c',
  'eccbc87e4b5ce2fe28308fd9f2a7baf3',
  'a87ff679a2f3e71d9181a67b7542122c',
  'e4da3b7fbbce2345d7772b0674a318d5',
  '1679091c5a880faf6fb5e6087eb1b2dc',
  '8f14e45fceea167a5a36dedd4bea2543',
  'c9f0f895fb98ab9159f51fd0297e236d',
  '45c48cce2e2d7fbdea1afc51c7c6ad26',
  'd3d9446802a44259755d38e6d163e820'
]
