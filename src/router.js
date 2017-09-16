require('dotenv').config();

var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');

var api = require('./api');

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
  api(req.session.grant.response.access_token, req.session.grant.response.access_secret)
  .getUserInfo().then(function(result) {
    res.json(result.user);
  }).catch(handleError);
});

apiRouter.post('/find', function(req, res) {
  if (req.body.blog && req.body.find) {
    var access_token = req.session.grant.response.access_token;
    var access_secret = req.session.grant.response.access_secret;

    var findFunction = api(access_token, access_secret).findPostsWithTag;
    if (Array.isArray(req.body.find)) {
      findFunction = api(access_token, access_secret).findPostsWithTags;
    }

    findFunction(req.body.blog, req.body.find, req.body.config)
    .then(function returnJSON(result) {
      res.json(result);
    }).catch(handleError);
  } else {
    res.status(400).send('POST body must include "blog" and "tag"');
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
