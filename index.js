require('dotenv').config();

var express = require('express');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var Grant = require('grant-express');

var client = require('./src/redis');


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
  saveUninitialized: false,
  secret: process.env.SECRET
}));

app.use(grant);

// routes

app.get('/', function(req, res) {
  console.log(req.session)
  console.log(req.session.grant.response)
  res.send('/')
});

app.get('/callback', function(req, res) {
  if (req.session && req.session.grant && req.session.grant.step1) {
    if (req.session.grant.step1.oauth_callback_confirmed === 'true') {
      res.redirect('/');
    }
  } else {
    console.log(req);
    console.log('some sort of oauth error');
  }
});

// listen

app.listen(process.env.PORT, function() {
  console.log('tag replacer server running on port ' + process.env.PORT);
});
