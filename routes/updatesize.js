import express from 'express'
import debug from 'debug'

let trace = debug('teaServ:updatesize')
let router = express.Router();

router.post('/', (req, res, next) => {
  res.send('Please use post method')
  res.end()
});
/* GET home page. */
router.get('/', (req, res, next) => {
  trace('%s request -> %s', req.baseUrl, JSON.stringify(req.query));

  res.json({
    code: 1,
    msg: "请求成功",
    versoin: 1,
    size: 1024,
    check: 50,
    size: "1024",
    data: "hfuegifegefbheyu------"
  })
});

module.exports = router;
