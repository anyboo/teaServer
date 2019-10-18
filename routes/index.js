import express from 'express'
import debug from 'debug'
import QRCode from 'qrcode'

let trace = debug('teaServ:index')
let router = express.Router()

async function qrcode2file(path, text, color) {
  await QRCode.toFile(path, text, {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    color: {
      drak: '#00F',
      light: `${color}`
    },
    rendererOpts: {
      quality: 0.9
    }
  });
}

qrcode2file('./public/images/qrcode_right.png', 'right_qrcode', '#0FF2');
qrcode2file('./public/images/qrcode_wrong.png', 'wrong_qrcode', '#FF02');
qrcode2file('./public/images/qrcode_today.png', 'today_qrcode_20191018', '#fff');
/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', {
    title: '测试用二维码',
    right: '/images/qrcode_right.png',
    wrong: '/images/qrcode_wrong.png',
    today: '/images/qrcode_today.png'
  })
});

module.exports = router;
