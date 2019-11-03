import express from 'express'
import {
  check, validationResult
}
from 'express-validator'
import debug from 'debug'
import Utility from './Utility.js'
import sqlite from 'sqlite'
let trace = debug('teaServ:paydone');
let router = express.Router();
const dbPromise = sqlite.open('./db/teaServer.db', {
  Promise
})
router.get('/', (req, res, next) => {
  res.send('Please use post method')
  res.end();
});
/* GET home page. */
router.post('/ticket', (req, res, next) => {
  trace(req.body)
  trace('/ticket', typeof req.body, req.body)
  var d = req.body.xml
    //  Utility.toJSON(rv)

  if ('return_code' in d) {

    if (d.return_code == 'SUCCESS') {
      trace(d)
        //var d = Utility.toJSON(rv)
      if (d.result_code == 'SUCCESS') {
        const verify = verify_ticket_checkout([d.openid, d.total_fee,
          d.transaction_id, d.out_trade_no
        ]);
        verify.then(() => {
          return res.send(
            '<xml><return_code><![CDATA[FAIL]]</return_code></xml>')
        });
      }
    }

    return res.send(
      '<xml><return_code><![CDATA[FAIL]]</return_code></xml>');
  }
});

async function verify_ticket_checkout(data) {
  trace('verify_ticket_checkout =>', data);
  [openid, total_fee, transaction_id, out_trade_no] = data;
  try {
    const db = await dbPromise;
    const [checkout, user] = await Promise.all([
      db.get(
        'SELECT openid, total_fee, cash_fee FROM checkout WHERE out_trade_no = ?',
        out_trade_no),
      // db.get(
      //   'SELECT id FROM user WHERE openid = ?',
      //   openid)
    ]);

    trace(1, checkout, user);
    if (typeof checkout == 'object' && 'id' in checkout) {

      const [u1, u2, ticket] = await Promise.all([
        db.run(
          `UPDATE checkout SET cash_fee = ?, transaction_id = ?, confirmed = ?,modify_time = datetime('now','localtime') WHERE out_trade_no = ?`,
          cash_fee, transaction_id, 1, out_trade_no),
        db.each(
          `UPDATE ticket SET enabled = ?,modify_time = datetime('now','localtime') WHERE out_trade_no = ?`,
          1, out_trade_no),
        db.each(
          'SELECT id FROM ticket WHERE out_trade_no = ? AND enabled = 1',
          out_trade_no, (err, row) => {
            trace(row)
            db.run(
              `INSERT INTO ticket_verify (ticket_id, user_id, transaction_id, create_time, modify_time) values (?,?,?,datetime('now','localtime'),datetime('now','localtime'))`,
              row.id, user.id, transaction_id)
          })
      ]);
      trace(2, u1, u2, ticket);
      return true || []
    }
    return false || []
  } catch (err) {
    trace(4, 'verify_ticket_checkout!', err)
    return false;
  }
}

module.exports = router;
