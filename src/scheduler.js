require('dotenv').config();

const { QueueScheduler } = require('bullmq');

const { FIND_QUEUE, REPLACE_QUEUE } = require('./queues');
const { connection } = require('./server/redis');

const findScheduler = new QueueScheduler(FIND_QUEUE, { connection });
const replaceScheduler = new QueueScheduler(REPLACE_QUEUE, { connection });

process.on('SIGTERM', async () => {
  await findScheduler.close();
  await replaceScheduler.close();
});