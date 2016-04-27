var express = require('express'),
path = require('path'),
favicon = require('serve-favicon'),
logger = require('morgan'),
cookieParser = require('cookie-parser'),
bodyParser = require('body-parser'),
methodOverride = require('method-override'),
passport = require('passport'),
flash = require('connect-flash'),
session = require('express-session'),
config = require('./config')
var app = express();

// Globbing model files
config.getGlobbedFiles('./app/models/**/*.js').forEach(function(modelPath) {
  require(path.resolve(modelPath));
});


// view engine setup
app.engine(".html", require("ejs").__express);
app.set('views', path.join(__dirname, '../app/views'));
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
    extended: true
}))

app.use(cookieParser());
app.use(bodyParser.json());
app.use(methodOverride());

// Express session
app.use(session({
  secret: config.sessionSecret,
  resave: true,
  saveUninitialized: true,
  cookie: { httpOnly: false }
}));

// use passport session
app.use(passport.initialize());
app.use(passport.session());

// connect flash for flash messages
app.use(flash());


app.use(express.static(path.join(__dirname, '../public')));

// Environment dependent middleware
if (process.env.NODE_ENV === 'development') {
  // Disable views cache
  app.set('view cache', false);
} else if (process.env.NODE_ENV === 'production') {
  app.locals.cache = 'memory';
}
// Globbing routing files
config.getGlobbedFiles('./app/routes/**/*.js').forEach(function(routePath) {
  require(path.resolve(routePath))(app);
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  res.render('404page.html', {
    title : 'We cannot find the page',
    keywords : config.app.keywords,
    description : config.app.description,
    user : req.user
  });

  // next(err);
});




// error handlers

// development error handler
//will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      title : 'Sorry, There is something wrong',
      keywords : config.app.keywords,
      description : config.app.description,
      user : req.user,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    title : 'Sorry, There is something wrong',
    keywords : config.app.keywords,
    description : config.app.description,
    user : req.user,
    error: {}
  });
});


module.exports = app;
