require('dotenv').config();

var express = require('express');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var Grant = require('grant-express');

var client = require('./src/redis');
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
  saveUninitialized: false,
  secret: process.env.SECRET
}));

app.use(grant);

// routes

app.get('/', function(req, res) {
  if (req.session.grant && req.session.grant.response) {

    var access_token = req.session.grant.response.access_token;
    var access_secret = req.session.grant.response.access_secret;

    api(access_token, access_secret).getUserInfo().then(function(userinfo){
      res.send(userinfo.user.name);
    });

  } else {
    res.send('/');
  }
});

app.get('/callback', function(req, res) {
  res.redirect('/');
});

// listen

app.listen(process.env.PORT, function() {
  console.log('tag replacer server running on port ' + process.env.PORT);
});
