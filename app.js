var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var async = require('async');
var fs = require('fs');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
// app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended : false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message : err.message,
      error : err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message : err.message,
    error : {}
  });
});

var active = require('./active.json');
var activities = active.activities;
var currentBatchPicture;

var play = function() {
  async.eachSeries(activities, function(activity, cb) {
    var values = Array.isArray(activity.value) ? activity.value : [activity.value];
    var subActivities = values.map(function(value) {
      return {
        type : activity.type,
        value : value
      };
    });
    async.eachSeries(subActivities, function(subActivity, cb) {
      async.waterfall([
      function(cb) {
        if (active.batchPictures) {
          fs.readdir('./public/' + active.batchPictures.path, function(error, files) {
            if (files.length > 0) {
              var index = 0;
              if (active.batchPictures.strategy === 'random') {
                index = Math.round(Math.random() * (files.length - 1));
              } else {
                index = (files.indexOf(currentBatchPicture) + 1) % files.length;
              }
              currentBatchPicture = files[index];
              global.currentActivity = {
                type : 'picture',
                value : active.batchPictures.path + '/' + currentBatchPicture
              };
              global.io.emit('switch-activity', JSON.stringify(global.currentActivity));
              setTimeout(function() {
                cb();
              }, (active.batchPictures.timeout || active.timeout) * 1000);
            } else {
              cb();
            }
          });
        } else {
          cb();
        }
      },
      function(cb) {
        global.currentActivity = subActivity;
        global.io.emit('switch-activity', JSON.stringify(subActivity));
        setTimeout(function() {
          cb();
        }, (activity.timeout || active.timeout) * 1000);
      }], function() {
        cb();
      });
    }, function() {
      cb();
    });
  }, function() {
    play();
  });
};

app.play = play;

module.exports = app;
