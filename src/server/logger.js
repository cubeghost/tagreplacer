const winston = require('winston');

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
  ],
  format: IS_PRODUCTION ?
    winston.format.json() :
    winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
});

module.exports = logger;
