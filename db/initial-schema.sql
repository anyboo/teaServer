---优惠券 商品 用户
CREATE TABLE room (id INTEGER PRIMARY KEY,create_time DATETIME, modify_time DATETIME);

CREATE TABLE ticket (id INTEGER PRIMARY KEY,create_time DATETIME, modify_time DATETIME);

CREATE TABLE user (id INTEGER PRIMARY KEY, type TEXT, create_time DATETIME, modify_time DATETIME);
--- 现金支付的订单（充值优惠券，结算后支付订单）
CREATE TABLE order (id INTEGER PRIMARY KEY, appid TEXT, mch_id TEXT, body TEXT, detail TEXT, attach TEXT, openid TEXT,
                    out_trade_no TEXT, total_fee INTEGER, spbill_create_ip TEXT, goods_tag TEXT, trade_type TEXT,
                    time_start TEXT, time_expire TEXT,
                    cash_fee INTEGER, transaction_id TEXT, time_end TEXT,
                    create_time DATETIME, modify_time DATETIME);

CREATE TABLE prepayOrder (id INTEGER PRIMARY KEY,appid TEXT, mch_id TEXT, openid TEXT, trade_type TEXT, prepay_id TEXT,
                          create_time DATETIME, modify_time DATETIME);

CREATE TABLE closedOrder (id INTEGER PRIMARY KEY, appid TEXT, mch_id TEXT, out_trade_no TEXT,
                          create_time DATETIME, modify_time DATETIME);
---update
CREATE TABLE update (id INTEGER PRIMARY KEY, bin_path TEXT, version INTEGER, check TEXT, create_time DATETIME, modify_time DATETIME)
