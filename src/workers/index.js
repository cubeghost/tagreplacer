require('dotenv').config();

const { Worker } = require('bullmq');

const { tumblrQueue } = require('../queues');
const connection = require('../redis');

const processFind = require('./find');
const processReplace = require('./replace');

const processor = async (job) => {
  switch (job.name) {
    case 'find':
      return await processFind(job);
    case 'replace':
      return await processReplace(job);
    default:
      // eslint-disable-next-line no-console
      console.warn(`Unhandled ${tumblrQueue.name} job`, job);
      return;
  }
}

const tumblrWorker = new Worker(tumblrQueue.name, processor, {
  connection,
  // https://www.tumblr.com/docs/en/api/v2#rate-limits
  limiter: {
    max: 300,
    duration: 1000 * 60 // minute
  }
});

tumblrWorker.on('error', err => {
  // eslint-disable-next-line no-console
  console.error(err);
});

module.exports = {
  tumblrWorker,
};