require('dotenv').config();

const express = require('express');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const Grant = require('grant-express');
const Sentry = require('@sentry/node');
const helmet = require('helmet');

const client = require('./server/redis');
const { webRouter, apiRouter } = require('./server/router');
const logger = require('./server/logger');

// setup
const app = express();

if (process.env.SENTRY_DSN) {
  Sentry.init({ dsn: process.env.SENTRY_DSN });
  app.use(Sentry.Handlers.requestHandler());
}

const grant = new Grant({
  server: {
    protocol: process.env.PROTOCOL,
    host: process.env.HOSTNAME,
    callback: '/callback',
    transport: 'session',
  },
  tumblr: {
    request_url: 'https://www.tumblr.com/oauth/request_token',
    authorize_url: 'https://www.tumblr.com/oauth/authorize',
    access_url: 'https://www.tumblr.com/oauth/access_token',
    oauth: 1,
    key: process.env.TUMBLR_API_KEY,
    secret: process.env.TUMBLR_API_SECRET,
  },
});

app.use(
  session({
    store: new RedisStore({
      client: client,
    }),
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

app.get('/callback', (req, res) => res.redirect('/'));

app.get('/disconnect', (req, res) => {
  req.session.destroy(err => res.redirect('/'));
});

if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.errorHandler());
}


// listen
app.listen(process.env.PORT, () => {
  logger.info('express server started', { port: process.env.PORT });
});
