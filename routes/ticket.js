import express from 'express'
import {
  check, validationResult
}
from 'express-validator'
import got from 'got'
import debug from 'debug'
import Utility from './Utility'
import sqlite from 'sqlite'
const dbPromise = sqlite.open('./db/teaServer.db', {
  Promise
})

let trace = debug('teaServ:ticket');
let router = express.Router();

router.get('/id', (req, res, next) => {
  trace('get id')
  res.send('/id method')
  res.end();
});

router.get('/', (req, res, next) => {
  trace('get /')
  res.send('Please use post method')
  res.end();
});
/* GET home page. */
router.post('/buy', [
  check('openid').exists({
    checkFalsy: true
  }),
  check('total_fee').exists({
    checkFalsy: true
  }),
  check('clientip').exists({
    checkFalsy: true
  }),
  check('ticket').exists({
    checkFalsy: true
  })
], (req, res, next) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array()
    })
  }

  var out_trade_no = Utility.out_trade_no()
  var ticket = req.body.ticket;

  for (var i in ticket) {
    const rv = Promise.resolve(
      add_ticket(ticket[i].count,
        ticket[i].type, out_trade_no)
    );
    rv.then(() => trace('LOOP', typeof rv))
  }
  //order
  //add_ticket_type_1(out_trade_no, count)
  //add_ticket_type_2(out_trade_no, count)

  //prepay_id
  var openid = req.body.openid;
  var spbill_create_ip = req.body.clientip;
  var total_fee = req.body.total_fee;

  const rv = Promise.resolve(
    unifiedorder(openid, out_trade_no,
      total_fee, spbill_create_ip)
  );

  rv.then((data) => {
    trace('WX unifiedorder ', typeof data, data)
    return res.status(200).json({
      code: 0,
      msg: 'success',
      data: {
        result: req.body.test
      }
    })
  });
});

async function add_ticket(count, type, out_trade_no) {
  if (type == 1) {
    const db = await dbPromise;
    const rv = await Promise.all([
      db.run(
        `INSERT INTO ticket (out_trade_no, name, count, price, type, send_type, enabled, create_time, modify_time)
        VALUES (?,?,?,?,?,1,0,datetime('now','localtime'),datetime('now','localtime'))`,
        out_trade_no, '68卡券', count, 6800, 1
      )
    ]);
    trace('add ticket type =', 1, typeof rv, rv);
  }
  if (type == 2) {
    const db = await dbPromise;
    const rv = Promise.all([
      db.run(
        `INSERT INTO ticket (out_trade_no, name, count, price, type, send_type, enabled, create_time, modify_time)
        VALUES (?,?,?,?,?,1,0,datetime('now','localtime'),datetime('now','localtime'))`,
        out_trade_no, '108卡券', count, 10800, 1
      )
    ]);
    trace('add ticket type =', 2, typeof rv, rv);
  }
}

async function unifiedorder(openid, out_trade_no, total_fee, spbill_create_ip) {
  let order = {
    appid: 'wx3a2cfa88186ea9e1',
    mch_id: '1543631391',
    nonce_str: Utility.nonce(),
    body: '题墨自助茶室-卡劵充值',
    out_trade_no: out_trade_no,
    total_fee: total_fee,
    spbill_create_ip: spbill_create_ip,
    notify_url: 'https://www.teamcs.cn/paydone',
    trade_type: 'JSAPI',
    openid: openid
  };

  let secret = '5f79064fa12f6b9366338e40088dd89a';
  let data = Utility.addSign(order, secret);
  let raw = Utility.toXml(data);
  trace('raw data =>', raw);

  const response = got.post('https://api.mch.weixin.qq.com/pay/unifiedorder')
    .on('request', (request) => {
      request.write(raw)
      request.end()
    });

  response.then((response) => {
    trace(response)
    let rv = Utility.toJSON(response.body)
    return rv
  });
}

module.exports = router;
