import express from 'express'
import createError from 'http-errors'
import path from 'path'
import cookieParser from 'cookie-parser'
import xmlparser from 'express-xml-bodyparser'
import logger from 'morgan'
import debug from 'debug'
import indexRouter from './routes/index'
import usersRouter from './routes/users'

import scanRouter from './routes/scan'
import heartbeatRouter from './routes/heartbeat'
import updateRouter from './routes/update'
import updatesizeRouter from './routes/updatesize'

import bookroom from './routes/bookroom'
import checkout from './routes/checkout'
import register from './routes/register'
import schedule from './routes/schedule'
import ticket from './routes/ticket'
import paydone from './routes/paydone'
import login from './routes/login'
import room from './routes/room'


let trace = debug('teaServ:app')
let app = express();

app.listen(8000, () => {
  console.log('server running http://localhost:8000')
  trace('start')
});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(xmlparser({
  explicitArray: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/scan', scanRouter);
app.use('/heartbeat', heartbeatRouter);
app.use('/update', updateRouter);
app.use('/bookroom', bookroom);
app.use('/checkout', checkout);
app.use('/register', register);
app.use('/schedule', schedule);
app.use('/ticket', ticket);
app.use('/paydone', paydone);
app.use('/login', login);
app.use('/room', room);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
