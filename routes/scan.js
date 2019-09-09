import express from 'express'
import {
  check, validationResult
}
from 'express-validator'
import debug from 'debug'

let trace = debug('teaServ:scan');
let router = express.Router();

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

  if (req.query.qrcode == 'right_qrcode') {
    let _voice = `欢迎${req.query.qrcode}光临茶室`;
    return res.status(200).json({
      code: 1,
      msg: "请求成功",
      voice: _voice,
      door: 1,
      air: 1,
      socket: 1,
      lamp: 1
    });
  }

  return res.status(200).json({
    code: 0,
    msg: "请求失败"
  })

});

module.exports = router;
