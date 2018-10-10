require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const TumblrClient = require('./tumblr');
const logger = require('./logger');


// web router
/* eslint-disable new-cap */
const webRouter = express.Router();
const buildDir = path.resolve('build');

webRouter.use(express.static(buildDir));

const render = (req, res) => {
  res.sendFile(path.join(buildDir, '/index.html'));
};

// TODO better routing?
webRouter.get('/', render);
webRouter.get('/help', render);

// api router
// prefixed with '/api'
const apiRouter = express.Router();

apiRouter.use(bodyParser.json());

apiRouter.use(function(req, res, next) {
  if (req.session.grant && req.session.grant.response) {
    next();
  } else {
    res.statusMessage = 'No user session';
    res.status(401).json({
      message: 'No user session'
    });
  }
});

apiRouter.get('/user', function(req, res) {
  const token = req.session.grant.response.access_token;
  const secret = req.session.grant.response.access_secret;

  const client = new TumblrClient({ token, secret });

  client.getUserInfo()
    .then(result => res.json(result.user))
    .catch(error => {
      logger.error(error.message, { error: error, request: req });
      res.status(500).send(error);
    });
});

apiRouter.post('/find', function(req, res) {
  if (req.body.blog && req.body.find) {
    const token = req.session.grant.response.access_token;
    const secret = req.session.grant.response.access_secret;
    const blog = req.body.blog;
    const options = req.body.options;

    const client = new TumblrClient({ token, secret, blog, options });

    client.findPostsWithTags(req.body.find)
      .then(result => res.json(result))
      .catch(error => {
        logger.error(error.message, { error: error, request: req });
        res.status(500).send(error);
      });
  } else {
    res.status(400).send('POST body must include "blog" and "find"');
  }
});

apiRouter.post('/replace', function(req, res) {
  if (req.body.blog && req.body.find && req.body.replace) {
    const token = req.session.grant.response.access_token;
    const secret = req.session.grant.response.access_secret;
    const blog = req.body.blog;
    const options = req.body.options;

    const client = new TumblrClient({ token, secret, blog, options });

    client.findAndReplaceTags(req.body.find, req.body.replace)
      .then(result => res.json(result))
      .catch(error => {
        logger.error(error.message, { error: error, request: req });
        res.status(500).send(error);
      });
  } else {
    res.status(400).send('POST body must include "blog", "find", and "replace"');
  }
});


module.exports = {
  webRouter,
  apiRouter
};
