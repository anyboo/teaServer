import express from 'express'
import debug from 'debug'

let trace = debug('teaServ:heartbeat')
let router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.send('Please use post method')
  res.end();
});

router.post('/', (req, res, next) => {
  trace('%s request -> %s', req.baseUrl, JSON.stringify(req.query));
  let _voice = `欢迎${req.query.cpuid}光临茶室`;
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
