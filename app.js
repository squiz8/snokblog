var createError = require('http-errors');
var express = require('express');
var path = require('path');
var serveFavicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var logger = require('morgan');
var expressMessage = require('express-messages');
var session = require('express-session');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var multer = require('multer');
var moment = require('moment');
var mongo = require('mongodb');
var db = require('monk')('localhost/snokeblog')

var indexRouter = require('./routes/index');
var postsRouter = require('./routes/posts');
var categoriesRouter = require('./routes/categories');

var app = express();

//A global variable is made with locals, Moment is used for date formating
app.locals.moment = require('moment');

//Shorteen text
app.locals.shortenText = function(text, length){
  var shortenText = text.substring(0, length);
  return shortenText;
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//Handle File Uploads
/*app.use(multer({
  dest: path.join(__dirname, 'public/images/uploads')
}).any());
*/
app.use(multer({dest:'./public/images/uploads'}).single('mainimage'));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//Handle express sessions
app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true
}));

//Validator
app.use(expressValidator({
  errorFormatter: function (param, msg, value) {
    var namespace = param.split('.')
      , root = namespace.shift()
      , formParam = root;

    while (namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param: formParam,
      msg: msg,
      value: value
    };
  }
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use(flash());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});


//Make database available or accessible to the routes
app.use((req, res, next) => {
  req.db = db;
  next();
});


app.use('/', indexRouter);
app.use('/posts', postsRouter);
app.use('/categories', categoriesRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
