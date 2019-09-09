import express from 'express'
import debug from 'debug'
import {
  check, validationResult
}
from 'express-validator'

let trace = debug('teaServ:heartbeat')
let router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.send('Please use post method')
  res.end();
});

router.post('/', [
  check('cpuid').exists({
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

  if (req.query.cpuid != "") {
    let _voice = `欢迎${req.query.cpuid}光临茶室`;
    return res.status(200).json({
      code: 1,
      msg: "请求成功",
      voice: _voice,
      door: 0,
      air: 0,
      socket: 0,
      lamp: 0
    });
  }

  return res.status(200).json({
    code: 0,
    msg: "请求失败"
  })
});

module.exports = router;
