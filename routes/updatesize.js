import express from 'express'
import debug from 'debug'
import {
  check, validationResult
}
from 'express-validator'

let trace = debug('teaServ:updatesize')
let router = express.Router();

router.post('/', (req, res, next) => {
  res.send('Please use post method')
  res.end()
});
/* GET home page. */
router.get('/', [
  check('version').exists({
    checkFalsy: true
  }).isInt({
    min: 1,
    max: 5
  }).withMessage('1 < version < 5'),
  check('offset').exists({
    checkFalsy: true
  }).isInt({
    min: 32,
    max: 1024
  }).withMessage('取值区间[32,1024]')
], (req, res, next) => {
  trace('%s request -> %s', req.baseUrl, JSON.stringify(req.query));

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array()
    })
  }

  let version = 2
  let update_total_size = 20 * 1024

  res.json({
    code: 1,
    msg: "请求成功",
    versoin: `${version}`,
    check: 'BBC校验值',
    size: `${update_total_size}`,
    data: "hfuegifegefbheyu------"
  })
});

module.exports = router;
