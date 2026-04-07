import 'dotenv/config';

import server from './server/index.mjs';
import logger from './logger.mjs';

server.listen(process.env.PORT, () => {
  logger.info('express server started', { port: process.env.PORT });
});
