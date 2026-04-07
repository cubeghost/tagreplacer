import {RedisStore} from 'connect-redis';
import initSession from 'express-session';

import connection from '../redis.mjs';

export const sessionStore = new RedisStore({
  client: connection,
  disableTouch: true,
});

export const session = initSession({
  store: sessionStore,
  name: 'tagreplacer_session',
  resave: false,
  secure: process.env.PROTOCOL === 'https',
  saveUninitialized: false,
  secret: process.env.SECRET,
});

export const getSession = sessionId => new Promise((resolve, reject) => (
  sessionStore.get(sessionId, (error, response) => {
    if (error) {
      reject(error);
    } else {
      resolve(response);
    }
  })
));