import express from 'express'
import debug from 'debug'
import {
  check, validationResult
}
from 'express-validator'
import sqlite from 'sqlite'
const dbPromise = sqlite.open('./db/teaServer.db', {
  Promise
})
let trace = debug('teaServ:heartbeat')
let router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.send('Please use post method')
  res.end();
});

router.post('/', [
  check('cpuid').exists({
    checkFalsy: true
  })
], (req, res, next) => {
  trace('%s request -> %s', req.baseUrl, JSON.stringify(req.query));
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array()
    })
  }

  const status = room_getstatus(req.query.cpuid);
  status.then((room) => {
    if (typeof room == 'object' && 'cpuid' in room) {
      return res.status(200).json({
        code: 0,
        msg: '请求成功',
        voice: '',
        door: room.door,
        lamp: room.lamp,
        socket: room.socket,
        air: room.air
      })
    } else return res.status(200).json({
      code: 0,
      msg: "请求失败"
    })
  });

  // if (req.query.cpuid != "") {
  //   let _voice = `欢迎${req.query.cpuid}光临茶室`;
  //   return res.status(200).json({
  //     code: 1,
  //     msg: "请求成功",
  //     voice: _voice,
  //     door: 0,
  //     air: 0,
  //     socket: 0,
  //     lamp: 0
  //   });
  // }
  //
  // return res.status(200).json({
  //   code: 0,
  //   msg: "请求失败"
  // })
});


async function room_getstatus(uuid) {
  const db = await dbPromise;
  const [room] = await Promise.all([
    db.get(
      `SELECT name,cpuid, door,lamp,socket,air FROM room WHERE cpuid = ?`,
      uuid
    )
  ]);

  trace('room_getstatus select:', typeof room, room);

  if (typeof room == 'object' && 'cpuid' in room) {
    return room
  }

  return [];
}

module.exports = router;
