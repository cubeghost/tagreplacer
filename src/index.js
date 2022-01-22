require('dotenv').config();

const server = require('./server');
const logger = require('./logger');

server.listen(process.env.PORT, () => {
  logger.info('express server started', { port: process.env.PORT });
});
