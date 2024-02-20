/* eslint-disable new-cap */

require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const TumblrClient = require('./tumblr');
const logger = require('./logger');


// web router
const webRouter = express.Router();
const buildDir = path.resolve('build');

webRouter.use(express.static(buildDir));

const render = (req, res) => {
  res.sendFile(path.join(buildDir, '/index.html'));
};

// TODO smarter routing?
webRouter.get('/', render);
webRouter.get('/help', render);
webRouter.get('/privacy', render);

// api router
// prefixed with '/api'
const apiRouter = express.Router();

apiRouter.use(bodyParser.json());

apiRouter.use(function(req, res, next) {
  if (req.session && req.session.grant && req.session.grant.response && !req.session.grant.response.error) {
    next();
  } else {
    res.statusMessage = 'No user session';
    res.status(401).json({
      message: 'No user session'
    });
  }
});

apiRouter.get('/user', function(req, res, next) {
  const token = req.session.grant.response.access_token;
  const secret = req.session.grant.response.access_secret;

  const client = new TumblrClient({ token, secret });

  client.getUserInfo()
    .then(result => res.json(result.user))
    .catch(error => next(error));
});

apiRouter.post('/find', function(req, res, next) {
  if (req.body.blog && req.body.find) {
    const token = req.session.grant.response.access_token;
    const secret = req.session.grant.response.access_secret;
    const blog = req.body.blog;
    const options = req.body.options;

    const client = new TumblrClient({ token, secret, blog, options });

    client.findPostsWithTags(req.body.find)
      .then(result => res.json(result))
      .catch(error => next(error));
  } else {
    res.status(400).json({ message: 'POST body must include "blog" and "find"' });
  }
});

apiRouter.post('/replace', function(req, res, next) {
  if (req.body.blog && req.body.find && req.body.replace) {
    const token = req.session.grant.response.access_token;
    const secret = req.session.grant.response.access_secret;
    const blog = req.body.blog;
    const options = req.body.options;

    const client = new TumblrClient({ token, secret, blog, options });

    client.findAndReplaceTags(req.body.find, req.body.replace)
      .then(result => res.json(result))
      .catch(error => next(error));
  } else {
    res.status(400).json({ message: 'POST body must include "blog", "find", and "replace"' });
  }
});

// error handling
apiRouter.use(function(error, req, res, next) {
  logger.error(error.message, {
    error: {
      stack: error.stack,
      code: error.code,
    },
    request: {
      headers: req.headers,
      method: req.method,
      body: req.body,
      originalUrl: req.originalUrl,
    }
  });
  res.status(500).json({ message: error.message });
});


module.exports = {
  webRouter,
  apiRouter
};
