import express from 'express'
import {
  check, validationResult
}
from 'express-validator'
import debug from 'debug'

let trace = debug('teaServ:register');
let router = express.Router();

router.get('/', (req, res, next) => {
  res.send('Please use post method')
  res.end();
});
/* GET home page. */
router.post('/', [
  check('test').exists({
    checkFalsy: true
  })
], (req, res, next) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array()
    })
  }

  return res.status(200).json({
    code: 0,
    msg: 'success',
    data: {
      result: req.body.test
    }
  })
});

module.exports = router;
