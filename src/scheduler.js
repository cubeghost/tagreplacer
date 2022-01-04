const { QueueScheduler } = require('bullmq');

const { FIND_QUEUE, REPLACE_QUEUE } = require('./server/queues');

const findScheduler = new QueueScheduler(FIND_QUEUE);
const replaceScheduler = new QueueScheduler(REPLACE_QUEUE);

process.on('SIGTERM', async () => {
  await findScheduler.close();
  await replaceScheduler.close();
});