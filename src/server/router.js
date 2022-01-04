/* eslint-disable new-cap */

require('dotenv').config();

const path = require('path');
const express = require('express');
const asyncHandler = require('express-async-handler');
const bodyParser = require('body-parser');
const { Queue } = require('bullmq');

const TumblrClient = require('./tumblr');
const { FIND_QUEUE, REPLACE_QUEUE } = require('./queues');
const logger = require('./logger');

const findQueue = new Queue(FIND_QUEUE);
const replaceQueue = new Queue(REPLACE_QUEUE);

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

apiRouter.post('/find', asyncHandler(async (req, res) => {
  if (req.body.blog && req.body.find) {
    const sessionId = req.session.id;
    const blog = req.body.blog;
    const find = req.body.find;
    const options = req.body.options;

    const params = { sessionId, blog, find, options };

    // TODO do we want to create jobs for `drafts` and `queued` here, or should
    // the front end decide that and send multiple post requests?
    const job = await findQueue.add('find', { ...params, methodName: 'posts' });

    res.json({ jobId: job.id });
  } else {
    res.status(400).send('POST body must include "blog" and "find"');
  }
}));

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
    res.status(400).send('POST body must include "blog", "find", and "replace"');
  }
});

// error handling
apiRouter.use(function(error, req, res) {
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
  res.status(500).send(error);
});


module.exports = {
  webRouter,
  apiRouter
};
