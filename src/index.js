require('dotenv').config();

const express = require('express');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const Grant = require('grant-express');
const Sentry = require('@sentry/node');
const Tracing = require('@sentry/tracing');
const helmet = require('helmet');

const client = require('./server/redis');
const { webRouter, apiRouter } = require('./server/router');
const logger = require('./server/logger');

// setup
const app = express();

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

const grant = new Grant({
  defaults: {
    protocol: process.env.PROTOCOL,
    host: process.env.HOST_HOSTNAME,
    callback: '/callback',
    transport: 'session',
    state: true,
  },
  tumblr: {
    request_url: 'https://www.tumblr.com/oauth/request_token',
    authorize_url: 'https://www.tumblr.com/oauth/authorize',
    access_url: 'https://www.tumblr.com/oauth/access_token',
    oauth: 1,
    scope: ['write'],
    key: process.env.TUMBLR_API_KEY,
    secret: process.env.TUMBLR_API_SECRET,
  },
});

app.use(
  session({
    store: new RedisStore({
      client: client,
      disableTouch: true,
    }),
    name: 'tagreplacer_session',
    resave: false,
    secure: process.env.PROTOCOL === 'https',
    saveUninitialized: false,
    secret: process.env.SECRET,
  })
);

app.use(grant);

app.use(helmet());

// routes
app.use('/', webRouter);
app.use('/api', apiRouter);

app.use((req, res, next) => {
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
  req.session.destroy(err => res.redirect('/'));
});

if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.errorHandler());
}

app.use((error, req, res, next) => {
  logger.error(error.message, {
    stack: error.stack,
  });
  res.status(500).json({
    code: error.code,
    message: error.message
  });
});

// listen
app.listen(process.env.PORT, () => {
  logger.info('express server started', { port: process.env.PORT });
});
