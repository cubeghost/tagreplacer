const winston = require('winston');

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
  ],
  exceptionHandlers: [
    new winston.transports.Console(),
  ],
  format: winston.format.json(),
});

module.exports = logger;
