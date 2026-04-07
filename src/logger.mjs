import winston from 'winston';

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
  ],
  exceptionHandlers: [
    new winston.transports.Console(),
  ],
  format: winston.format.json(),
});

export default logger;
