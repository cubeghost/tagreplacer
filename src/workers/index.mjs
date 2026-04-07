import 'dotenv/config';

import { Worker } from 'bullmq';

import { tumblrQueue } from '../queues.mjs';
import connection from '../redis.mjs';
import processFind from './find.mjs';
import processReplace from './replace.mjs';

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

export const tumblrWorker = new Worker(tumblrQueue.name, processor, {
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