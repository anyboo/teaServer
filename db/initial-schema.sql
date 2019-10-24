---优惠券 商品 用户
CREATE TABLE room (id INTEGER PRIMARY KEY, name TEXT, schedule_id INTEGER, price INTEGER, cpuid TEXT, device_status INTEGER,
  create_time DATETIME, modify_time DATETIME);

CREATE TABLE user (id INTEGER PRIMARY KEY, code TEXT, openid TEXT, session_key TEXT,unionid TEXT, type TEXT,
  name TEXT, cellphone TEXT, female INTEGER, balance INTEGER, create_time DATETIME, modify_time DATETIME);
--- 现金支付的订单（充值优惠券，结算后支付订单）
--- price = unit price send_type = allow_send_type
CREATE TABLE ticket (id INTEGER PRIMARY KEY, name TEXT, count INTEGER, price INTEGER, type INTEGER(3),send_type INTEGER(3),
  enabled BOOLEAN, expire_date DATETIME,create_time DATETIME, modify_time DATETIME);

CREATE TABLE schedule (id INTEGER PRIMARY KEY, room_id INTEGER, startTime DATETIME, endTime DATETIME, time_index TEXT,
  duration INTEGER, create_time DATETIME, modify_time DATETIME);

CREATE TABLE qrcode (id INTEGER PRIMARY KEY, code TEXT, out_trade_no TEXT, create_time DATETIME, modify_time DATETIME);
-- code = out_trade_no
CREATE TABLE order_list (id INTEGER PRIMARY KEY, out_trade_no TEXT,user_id INTEGER, room_id INTEGER, price INTEGER, startTime DATETIME, endTime DATETIME,
  prepay_id TEXT, ticket_id INTEGER, pay_status INTEGER(3), create_time DATETIME, modify_time DATETIME);

CREATE TABLE checkout (id INTEGER PRIMARY KEY, appid TEXT, mch_id TEXT, body TEXT, detail TEXT, attach TEXT, openid TEXT,
                    out_trade_no TEXT, total_fee INTEGER, spbill_create_ip TEXT, goods_tag TEXT, trade_type TEXT, trade_state TEXT,
                    bank_type TEXT, settlement_total_fee INTEGER,time_start TEXT, time_expire TEXT,cash_fee INTEGER, transaction_id TEXT, time_end TEXT,
                    prepay_id TEXT, create_time DATETIME, modify_time DATETIME);

CREATE TABLE ticket_verify (id INTEGER PRIMARY KEY, ticket_id INTEGER, user_id INTEGER, transaction_id INTEGER,verify INTEGER(3),
  sendout INTEGER(3), create_time DATETIME, modify_time DATETIME);
-- update
CREATE TABLE version_control (id INTEGER PRIMARY KEY, bin_path TEXT, version INTEGER, check_update TEXT, create_time DATETIME, modify_time DATETIME);
