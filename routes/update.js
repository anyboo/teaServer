import express from 'express'
import debug from 'debug'

let trace = debug('teaServ:update');
let router = express.Router();

router.post('/', (req, res, next) => {
  res.send('Please use post method')
  res.end();
});
/* GET home page. */
router.get('/', (req, res, next) => {
  trace('%s request -> %s', req.baseUrl, JSON.stringify(req.query));

  res.json({
    code: 1,
    msg: "请求成功",
    version: 1,
    check: 26,
    size: 25600
  })
});

module.exports = router;
