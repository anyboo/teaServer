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

function product_qrcode_expires() {
  /// 需要增加过滤条件
  var qrcode_temparoy = [
    'cec315e3d0975e5cc2811d5d8725f149', //MD5 ("fixed") = cec315e3d0975e5cc2811d5d8725f149
    //'098f6bcd4621d373cade4e832627b4f6', //MD5 ("test") = 098f6bcd4621d373cade4e832627b4f6
    // 'c4ca4238a0b923820dcc509a6f75849b',
    // 'c81e728d9d4c2f636f067f89cc14862c',
    // 'eccbc87e4b5ce2fe28308fd9f2a7baf3',
    // 'a87ff679a2f3e71d9181a67b7542122c',
    // 'e4da3b7fbbce2345d7772b0674a318d5',
    // '1679091c5a880faf6fb5e6087eb1b2dc',
    // '8f14e45fceea167a5a36dedd4bea2543',
    // 'c9f0f895fb98ab9159f51fd0297e236d',
    // '45c48cce2e2d7fbdea1afc51c7c6ad26',
    // 'd3d9446802a44259755d38e6d163e820'
  ]

  for (var i in qrcode_temparoy) {
    trace(i, qrcode_temparoy[i])
    let image = '/Users/yukan/Downloads/qrcodeTest/';
    image = image.concat('qrcode_fixed_00', i, '.png')
    qrcode2file(image, qrcode_temparoy[i], '#fff')
  }
}
//qrcode2file('./public/images/qrcode_right_new.png','right_qrcode_fixed_20191024120000', '#fff');
//qrcode2file('./public/images/qrcode_wrong.png', 'wrong_qrcode', '#FF02');
//qrcode2file('./public/images/qrcode_today.png', 'today_qrcode_20191018', '#fff');
/* GET home page. */
router.get('/', (req, res, next) => {
  product_qrcode_expires();
  res.render('index', {
    title: '测试用二维码',
    right: '/images/qrcode_right.png',
    wrong: '/images/qrcode_wrong.png',
    today: '/images/qrcode_today.png'
  })
});

module.exports = router;
