require('dotenv').config();

var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');

var api = require('./api');
var TumblrAPI = require('./api_2');

var webRouter = express.Router();
var apiRouter = express.Router();

// web router

var webDir = '/public';
if (process.env.NODE_ENV === 'production') {
  webDir = '/dist';
}

webRouter.use(express.static(path.dirname(require.main.filename) + webDir));

function render(req, res) {
  res.sendFile(path.join(path.dirname(require.main.filename) + webDir + '/index.html'));
}

webRouter.get('/', render);
webRouter.get('/help', render);

// api router
// prefixed with '/api'

function handleError(error) {
  console.log(error);
  res.status(500).send(error);
}

apiRouter.use(bodyParser.json());

apiRouter.use(function(req, res, next) {
  if (req.session.grant && req.session.grant.response) {
    next();
  } else {
    res.statusMessage = 'No user session';
    res.status(401).send('No user session');
  }
});


apiRouter.get('/user', function(req, res) {
  const token = req.session.grant.response.access_token;
  const secret = req.session.grant.response.access_secret;

  const client = new TumblrAPI({ token, secret });

  client.getUserInfo()
    .then(result => res.json(result.user))
    .catch(handleError);
});

apiRouter.post('/find', function(req, res) {
  if (req.body.blog && req.body.find) {
    const token = req.session.grant.response.access_token;
    const secret = req.session.grant.response.access_secret;
    const blog = req.body.blog;
    const options = req.body.config;

    const client = new TumblrAPI({ token, secret, blog, options });

    client.findPostsWithTags(req.body.find)
      .then(result => res.json(result))
      .catch(handleError);
  } else {
    res.status(400).send('POST body must include "blog" and "find"');
  }
});

apiRouter.post('/replace', function(req, res) {
  if (req.body.blog && req.body.find && req.body.replace) {
    api(req.session.grant.response.access_token, req.session.grant.response.access_secret)
    .replaceTags(req.body.blog, req.body.find, req.body.replace, req.body.config)
    .then(function(result) {
      res.json(result);
    }).catch(handleError);
  } else {
    res.status(400).send('POST body must include "blog", "find", and "replace"');
  }
});


module.exports = {
  web: webRouter,
  api: apiRouter
};
