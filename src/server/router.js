const path = require('path');
const express = require('express');
const asyncHandler = require('express-async-handler');
const bodyParser = require('body-parser');
const { Queue } = require('bullmq');

const TumblrClient = require('../tumblr');
const { TUMBLR_QUEUE } = require('../queues');
const connection = require('../redis');
const logger = require('../logger');

const tumblrQueue = new Queue(TUMBLR_QUEUE, { connection });

// web router
const webRouter = express.Router();
const buildDir = path.resolve('build');

webRouter.use(express.static(buildDir));

const render = (_req, res) => {
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
    // console.log(req.session.id, req.session.grant.response)
    next();
  } else {
    res.statusMessage = 'No user session';
    res.status(401).json({
      message: 'No user session'
    });
  }
});

apiRouter.get('/user', function(req, res, next) {
  if (req.session.tumblr?.name && req.session.tumblr?.blogs) {
    res.json(req.session.tumblr);
    return;
  }

  const token = req.session.grant.response.access_token;

  const client = new TumblrClient({ token });

  client.getUserInfo()
    .then(result => {
      req.session.tumblr = {
        name: result.user.name,
        blogs: result.user.blogs.map(blog => blog.name),
      };
      res.json(req.session.tumblr);
    })
    .catch(error => next(error));
});

apiRouter.post('/find', asyncHandler(async (req, res) => {
  const sessionId = req.session.id;
  const { blog, find, options } = req.body;

  if (!(blog && find)) {
    res.status(400).send('POST body must include "blog" and "find"');
    return;
  }

  const params = { sessionId, blog, find, options };

  await tumblrQueue.add('find', { ...params, methodName: TumblrClient.methods.POSTS });
  // includeQueue and includeDrafts feels out of date, maybe the front end can send 'methods'?
  if (options.includeQueue) {
    await tumblrQueue.add('find', { ...params, methodName: TumblrClient.methods.QUEUED });
  }
  if (options.includeDrafts) {
    await tumblrQueue.add('find', { ...params, methodName: TumblrClient.methods.DRAFTS });
  }

  res.json({
    success: true,
  });
}));

apiRouter.post('/replace', asyncHandler(async (req, res) => {
  const sessionId = req.session.id;
  const { blog, find, replace, options, posts } = req.body;

  if (!(blog && find && replace && posts?.length)) {
    res.status(400).send('POST body must include "blog", "find", "replace", and "posts"');
    return;
  }

  const params = { sessionId, blog, find, replace, options };

  for await (let post of posts) {
    await tumblrQueue.add('replace', { ...params, postId: post.id_string, tags: post.tags });
  }

  // TODO queue something to check for done and notify

  res.json({
    success: true,
  });
}));

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
