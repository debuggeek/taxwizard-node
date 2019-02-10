const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const CognitoExpress = require("cognito-express");

const routes = require('./routes/index');
const salesComp = require('./routes/salesComp');
const batch = require('./routes/batch');
const wcad = require('./routes/wcad');
const admin = require('./routes/admin');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Initializing CognitoExpress constructor
const cognitoExpress = new CognitoExpress({
  region: "us-west-2",
  cognitoUserPoolId: "us-west-2_DTpJ5tgkq",
  tokenUse: "access", //Possible Values: access | id
  tokenExpiration: 3600000 //Up to default expiration of 1 hour (3600000 ms)
});

//Our middleware that authenticates all APIs under our 'authenticatedRoute' Router
app.use(function(req, res, next) {
    
  //I'm passing in the access token in header under key accessToken
  let accessTokenFromClient = req.headers.accesstoken;

  //Fail if token not present in header. 
  if (!accessTokenFromClient) return res.status(401).send("Access Token missing from header");

  cognitoExpress.validate(accessTokenFromClient, function(err, response) {
      
      //If API is not authenticated, Return 401 with error message. 
      if (err) return res.status(401).send(err);
      
      //Else API has been authenticated. Proceed.
      res.locals.user = response;
      next();
  });
});

app.use('/', routes);
app.use('/salesComp', cors(), salesComp);
app.use('/batch', cors(), batch);
app.use('/wcad', cors(), wcad);
app.use('/admin', cors(), admin);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
