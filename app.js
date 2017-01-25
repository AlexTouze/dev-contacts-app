//"C:\Program Files\MongoDB\Server\3.2\bin\mongod.exe" --dbpath "E:\data"
// set DEBUG=*,-not_this
//https://rethink.tlabscloud.com/
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var debug = require('debug')('http')
var http = require('http')
var name = 'dev-contacts-app';
var cors = require('cors');
var passport = require('passport');

// Database
var mongoose = require('mongoose');
var configAPP = require('./config/configapp.js');
mongoose.Promise = global.Promise;
mongoose.connect(configAPP.url);
require('./config/passport'); // pass passport for configuration

//Global registry
var globlaRegistryUrl = ""

//PassPort 
var session = require('express-session');
var flash = require('connect-flash');

//routes
var connect = require('./routes/connect');
var home = require('./routes/home');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'config')));
app.use(session({ secret: 'rethink', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session("combined")); // persistent login sessions
app.use(flash());

app.use(function (req, res, next) {
  req.flash = flash;
  req.globalRegistryUrl = configAPP.globlaRegistryUrl;
  req.globalRegistryPort = configAPP.globlaRegistryPort;
  req.title = "Contacts App";
  req.currentDomain = "https://hello.rethink3.orange-labs.fr/";
  //req.currentDomain = "https://rethink.tlabscloud.com/";
  // req.currentDomain =  req.get('host');
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//Add passport 
app.use('/', connect);
app.use('/login', connect);
app.use('/signup', connect);
app.use('/home', home)
app.use('/profile', home)
app.use('/users', users);
app.use('/adduser', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
