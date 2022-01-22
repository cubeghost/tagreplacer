require('dotenv').config();

const { QueueScheduler } = require('bullmq');

const { TUMBLR_QUEUE } = require('./queues');
const connection = require('./redis');

const tumblrScheduler = new QueueScheduler(TUMBLR_QUEUE, { connection });

process.on('SIGTERM', async () => {
  await tumblrScheduler.close();
});