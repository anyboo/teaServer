import express from 'express'
import debug from 'debug'
import {
  check, validationResult
}
from 'express-validator'
import got from 'got'
import queryString from 'query-string'

let trace = debug('teaServ:wxpay')
let router = express.Router()

router.get('/login', [
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
  let query = queryString.stringify({
      appid: 'wx3a2cfa88186ea9e1',
      secret: '5f79064fa12f6b9366338e40088dd89a',
      js_code: req.body.code,
      grant_type: authorization_code
    })
    //'GET https://api.weixin.qq.com/sns/jscode2session?appid=APPID&secret=SECRET&js_code=JSCODE&grant_type=authorization_code'
  const response = got.get('https://api.weixin.qq.com/sns/jscode2session', {
      query
    })
    .on('request', request => setTimeout(() => request.abort(), 50));

  response.then((response) => {
    trace(response.body)
    let res = response.body
    if (res.errcode == 0) {
      trace(res.openid, res.session_key, res.UnionID)
      res.status(200).json({
        code: res.errcode,
        msg: res.errmsg,
        UnionID: res.UnionID,
        openid: res.openid
      })
    }
  })
});
/* GET home page. */
router.post('/bookroom', [
  check('openid').exists({
    checkFalsy: true
  }),
  check('orderID').exists({
    checkFalsy: true
  }),
  check('roomID').exists({
    checkFalsy: true
  }),
  check('duration').exists({
    checkFalsy: true
  }),
  check('startTime').exists({
    checkFalsy: true
  }),
  check('endTime').exists({
    checkFalsy: true
  }),
  check('price').exists({
    checkFalsy: true
  })
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array()
    })
  }

  trace(req.body, req.body.code)

  res.status(200).json({
    prepayId: 'prepayId',
    orderID: 'orderID',
    roomID: 'roomID',
    duration: 'duration',
    startTime: 'startTime',
    endTime: 'endTime',
    price: 'price'
  })
});

module.exports = router;
