require('dotenv').config();

var express = require('express');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var Grant = require('grant-express');

var client = require('./src/redis');
var router = require('./src/router');
var api = require('./src/api');


// setup

var app = express();

var grant = grant = new Grant({
  server: {
    protocol: 'http',
    host: 'localhost:' + process.env.PORT,
    callback: '/callback',
    transport: 'session'
  },
  tumblr: {
    key: process.env.TUMBLR_API_KEY,
    secret: process.env.TUMBLR_API_SECRET,
  }
});

app.use(session({
  store: new RedisStore({
    client: client
  }),
  resave: false,
  //secure: true,
  saveUninitialized: false,
  secret: process.env.SECRET
}));

app.use(grant);

// routes

app.use('/', router.web);
app.use('/api', router.api);

app.get('/callback', function(req, res) {
  res.redirect('/');
});

app.get('/disconnect', function(req, res) {
  req.session.destroy(function(err) {
    res.redirect('/');
  });
});

// listen

app.listen(process.env.PORT, function() {
  // :)
});
