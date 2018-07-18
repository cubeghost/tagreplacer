require('dotenv').config();

var express = require('express');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var Grant = require('grant-express');

var client = require('./src/redis');
var router = require('./src/router');


// setup

var app = express();

var grant = new Grant({
  server: {
    protocol: process.env.PROTOCOL,
    host: process.env.HOSTNAME,
    callback: '/callback',
    transport: 'session'
  },
  tumblr: {
    request_url: 'https://www.tumblr.com/oauth/request_token',
    authorize_url: 'https://www.tumblr.com/oauth/authorize',
    access_url: 'https://www.tumblr.com/oauth/access_token',
    oauth: 1,
    key: process.env.TUMBLR_API_KEY,
    secret: process.env.TUMBLR_API_SECRET,
  }
});

app.use(session({
  store: new RedisStore({
    client: client
  }),
  resave: false,
  secure: (process.env.PROTOCOL === 'https'),
  saveUninitialized: false,
  secret: process.env.SECRET
}));

app.use(grant);

// routes

app.use('/', router.web);
app.use('/api', router.api);

app.use(function(req, res, next) {
  if (!req.session) {
    next(new Error('No session'));
  }
  next();
});

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
