var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');

var api = require('./api');

var webRouter = express.Router();
var apiRouter = express.Router();

// web router

/*webRouter.use(function(req, res, next) {
  if (req.session.grant && req.session.grant.response) {
    next();
  } else {
    res.redirect('/');
  }
});*/

webRouter.use(express.static(path.dirname(require.main.filename) + '/public'));

function render(req, res) {
  res.sendFile(path.join(path.dirname(require.main.filename) + '/public/index.html'));
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
    res.status(401).send('No user session');
  }
});


apiRouter.get('/user', function(req, res) {
  api(req.session.grant.response.access_token, req.session.grant.response.access_secret)
  .getUserInfo().then(function(result) {
    res.json(result.user);
  }).catch(handleError);
});

apiRouter.post('/posts', function(req, res) {
  if (req.body.blog && req.body.tag) {
    api(req.session.grant.response.access_token, req.session.grant.response.access_secret)
    .findPostsWithTag(req.body.blog, req.body.tag)
    .then(function(result) {
      res.json(result);
    }).catch(handleError);
  } else {
    res.status(400).send('POST body must include "blog" and "tag"');
  }
});

apiRouter.post('/replace', function(req, res) {
  if (req.body.blog && req.body.find && req.body.replace) {
    api(req.session.grant.response.access_token, req.session.grant.response.access_secret)
    .replaceTags(req.body.blog, req.body.find, req.body.replace)
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
