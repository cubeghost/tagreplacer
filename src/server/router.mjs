import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';

import TumblrClient from '../tumblr.mjs';
import { tumblrQueue } from '../queues.mjs';
import logger from '../logger.mjs';
import { METHODS } from '../consts.mjs';

// web router
export const webRouter = express.Router();
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
export const apiRouter = express.Router();

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
  const secret = req.session.grant.response.access_secret;

  const client = new TumblrClient({ token, secret });

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

apiRouter.post('/find', async (req, res) => {
  const sessionId = req.session.id;
  const { blog, find, options, methods } = req.body;

  if (!(blog && find)) {
    res.status(400).send('POST body must include "blog" and "find"');
    return;
  }

  const params = { sessionId, blog, find, options };
  for (const method of methods) {
    if (!Object.values(METHODS).includes(method)) {
      logger.warn(`Unsupported find method ${method}`);
      return;
    }

    await tumblrQueue.add('find', { ...params, methodName: method });
  } 

  res.json({
    success: true,
  });
});

apiRouter.post('/replace', async (req, res) => {
  const sessionId = req.session.id;
  const { blog, find, replace, options, posts } = req.body;

  if (!(blog && find && replace && posts?.length)) {
    res.status(400).send('POST body must include "blog", "find", "replace", and "posts"');
    return;
  }

  const params = { sessionId, blog, find, replace, options };

  for await (let post of posts) {
    await tumblrQueue.add('replace', { ...params, postId: post.id, tags: post.tags });
  }

  // TODO queue something to check for done and notify

  res.json({
    success: true,
  });
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