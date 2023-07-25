require('dotenv').config();

const http = require('http');
const express = require('express');
const Grant = require('grant-express');
const Sentry = require('@sentry/node');
const Tracing = require('@sentry/tracing');
const helmet = require('helmet');
const WebSocket = require('ws');

const { session } = require('./session');
const { webRouter, apiRouter } = require('./router');
const webSocketHandler = require('./websockets');
const logger = require('../logger');

// setup
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Tracing.Integrations.Express({
        router: apiRouter,
      }),
    ],
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  });
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
}

if (process.env.NODE_ENV === 'development') {
  const { createBullBoard } = require('@bull-board/api');
  const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter');
  const { ExpressAdapter } = require('@bull-board/express');

  const { tumblrQueue } = require('../queues');

  const serverAdapter = new ExpressAdapter();

  const board = createBullBoard({
    queues: [new BullMQAdapter(tumblrQueue)],
    serverAdapter: serverAdapter,
  });

  serverAdapter.setBasePath('/admin/queues');
  app.use('/admin/queues', serverAdapter.getRouter());
}

const grant = new Grant({
  defaults: {
    protocol: process.env.PROTOCOL,
    host: process.env.HOST_HOSTNAME,
    callback: '/callback',
    transport: 'session',
    state: true,
  },
  tumblr: {
    authorize_url: 'https://www.tumblr.com/oauth2/authorize',
    access_url: 'https://api.tumblr.com/v2/oauth2/token',
    origin: `${process.env.PROTOCOL}://${process.env.HOST_HOSTNAME}`,
    oauth: 2,
    scope: ['write'],
    key: process.env.TUMBLR_API_KEY,
    secret: process.env.TUMBLR_API_SECRET,
  },
});

app.use(session);

app.use(grant);

app.use(helmet());

// routes
app.use('/', webRouter);
app.use('/api', apiRouter);

app.use((req, _res, next) => {
  if (!req.session) {
    next(new Error('No session'));
  }
  next();
});

app.get('/callback', (req, res) => {
  if (req.session.grant.response && !req.session.grant.response.error) {
    req.session.cookie.maxAge = req.session.grant.response.raw.expires_in * 1000;
    req.session.save(() => res.redirect('/'));
  } else {
    res.redirect('/');
  }
});

app.get('/disconnect', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

wss.on('connection', (ws, req) => (
  session(req, {}, () => (
    webSocketHandler(ws, req)
  ))
));

if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.errorHandler());
}

app.use((error, _req, res) => {
  logger.error(error.message, {
    stack: error.stack,
  });
  res.status(500).json({
    code: error.code,
    message: error.message
  });
});

module.exports = server;