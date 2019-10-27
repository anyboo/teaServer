import express from 'express'
import {
  check, validationResult
}
from 'express-validator'
import got from 'got'
import debug from 'debug'
import Promise from 'bluebird'
import sqlite from 'sqlite'
const dbPromise = sqlite.open('./db/teaServer.db', {
  Promise
})

let trace = debug('teaServ:login');
let router = express.Router();

router.get('/', (req, res, next) => {
  update_db_user(req.body.openid, req.body.session_key, req.body.code);
  res.send('Please use post method')
  res.end();
});
/* GET home page. */
router.post('/', [
  check('code').exists({
    checkFalsy: true
  })
], (req, res, next) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array()
    })
  }

  var code = req.body.code;

  const query = new URLSearchParams([
    ['appid', 'wx3a2cfa88186ea9e1'],
    ['secret', '5f79064fa12f6b9366338e40088dd89a'],
    ['js_code', code],
    ['grant_type', 'authorization_code']
  ]);
  trace(query.toString());
  const response = got.get('https://api.weixin.qq.com/sns/jscode2session?'.concat(
    query.toString()));

  response.then((response) => {
    trace(response.body, typeof response.body)
    var rv = JSON.parse(response.body);
    if ('errcode' in rv) {
      trace(2)
      return res.status(200).json({
        code: rv.errcode,
        msg: rv.errmsg,
        data: {}
      })
    }
    if ('openid' in rv && 'session_key' in rv) {
      update_db_user(rv.openid, rv.session_key, code);
      return res.status(200).json({
        code: 0,
        msg: 'success',
        data: {
          openid: rv.openid,
          session_key: rv.session_key
        }
      })
    }
    return res.status(200).json({
      code: 9999,
      msg: '未知错误',
      data: {}
    })
  });
});

async function update_db_user(openid, session_key, code) {
  trace('update_db_user', openid, session_key, code)
  try {
    const db = await dbPromise;
    const [rv] = await Promise.all([
      db.get(
        'SELECT id,code,session_key,openid FROM user WHERE openid = ?',
        openid)
    ]);
    trace(1, rv, typeof rv);

    if (typeof rv == 'object' && 'id' in rv) {
      const rv2 = await Promise.all([
        db.run(
          `UPDATE user SET code = ?, session_key = ?, modify_time = datetime('now','localtime') WHERE openid = ?`,
          code, session_key, openid)
      ]);
      trace(2, typeof rv2);
      return []
    }

    if (typeof rv == 'undefined') {
      const rv3 = await Promise.all([
        db.run(
          `INSERT INTO user (code,openid,session_key,create_time,modify_time) values (?,?,?,datetime('now','localtime'),datetime('now','localtime'))`,
          code, openid, session_key)
      ]);
      trace(3, typeof rv3);
      return []
    }
  } catch (err) {
    trace(4, 'update_db_user failed!', err);
  }
}
module.exports = router;
