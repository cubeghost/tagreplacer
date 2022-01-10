const Session = require('express-session');
const RedisStore = require('connect-redis')(Session);

const { client, connection } = require('./redis');

const sessionStore = new RedisStore({
  client: connection,
  disableTouch: true,
});

const session = Session({
  store: sessionStore,
  name: 'tagreplacer_session',
  resave: false,
  secure: process.env.PROTOCOL === 'https',
  saveUninitialized: false,
  secret: process.env.SECRET,
});

const getSession = sessionId => new Promise((resolve, reject) => (
  sessionStore.get(sessionId, (error, response) => {
    if (error) {
      reject(error);
    } else {
      resolve(response);
    }
  })
));

module.exports = {
  session,
  sessionStore,
  getSession,
};