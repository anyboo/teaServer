import express from 'express'
import debug from 'debug'
import {
  check, validationResult
}
from 'express-validator'
import fs from 'fs'
import {
  Buffer
}
from 'buffer'

import base64 from 'base-64'
import * as txb from "@thi.ng/transducers-binary"
import mimeType from 'mime-types'
import iconv from 'iconv-lite'

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
    min: 0
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
  let fd, data, bytesRead, base64String = ''
  try {
    fd = fs.openSync('./update/test.bin', 'r')
    data = Buffer.alloc(1024)
    trace(data, req.query.offset)
    bytesRead = fs.readSync(fd, data, 0, data.length, parseInt(req.query.offset));
    if (bytesRead > 0) {
      base64String = txb.base64Encode(data)
    }

    trace('fd : %d, buffer :%s, offset : %d, length : %d, bytesRead:%d', fd,
      base64String, req.query.offset, base64String.length, bytesRead)

  } catch (err) {
    trace('open file exception', err)
  } finally {
    if (fd !== undefined)
      fs.closeSync(fd);
  }

  res.json({
    code: 1,
    msg: "请求成功",
    versoin: version,
    check: 'BBC校验值',
    size: bytesRead,
    data: `${base64String}`
  })
});

module.exports = router;
