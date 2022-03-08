var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
global.session = require('./helper/session');
global.helper = require('./helper/helper');
global.knex = require('./bin/db_handler');
global.root_path = path.join(__dirname);
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("khsdgfiyghdfghdfgwuer3456tgdf"));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', require('./routes/index'));
app.use('/admin', require('./routes/admin'));
app.use('/admin_action', require('./routes/admin_action'));
app.use('/admin_pagination', require('./routes/admin_pagination'));

app.use('/manager', require('./routes/manager'));
app.use('/manager_action', require('./routes/manager_action'));
app.use('/manager_pagination', require('./routes/manager_pagination'));

app.use('/user', require('./routes/user'));
app.use('/user_action', require('./routes/user_action'));
app.use('/user_pagination', require('./routes/user_pagination'));


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
