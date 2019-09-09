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
  check('cpuid').exists(),
  check('qrcode').exists()
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array()
    })
  }

  trace('%s request -> %s', req.baseUrl, JSON.stringify(req.query));

  let _voice = `欢迎${req.query.qrcode}光临茶室`;
  res.json({
    code: 1,
    msg: "请求成功",
    voice: _voice,
    door: 1,
    air: 1,
    socket: 1,
    lamp: 1
  });
});

module.exports = router;
