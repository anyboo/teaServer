import express from 'express'
import debug from 'debug'
import {
  check, validationResult
}
from 'express-validator'
import fs from 'fs'

let trace = debug('teaServ:update');
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
  check('version').exists({
    checkFalsy: true
  }).isInt({
    min: 1,
    max: 5
  }).withMessage('1 < version < 5')
], (req, res, next) => {
  trace('%s request -> %s', req.baseUrl, JSON.stringify(req.query));

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array()
    })
  }

  if ('668ff3637394e3457153238' != req.query.cpuid) {
    return res.status(200).json({
      code: 0,
      msg: "请求成功,无升级"
    })
  }

  let version = 2
  try {
    let filesize = fs.statSync('./update/shareTeaV2.bin').size;
    trace('version compare', parseInt(req.query.version) < version)
    if (parseInt(req.query.version) < version) {

      return res.status(200).json({
        code: 1,
        msg: "请求成功",
        version: version,
        check: 26,
        size: filesize
      })
    }

    return res.status(200).json({
      code: 0,
      msg: "请求成功,无升级"
    })

  } catch (err) {
    trace(err)
  }

});

module.exports = router;
