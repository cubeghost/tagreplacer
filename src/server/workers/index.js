const path = require('path');
const { Worker } = require('bullmq');

const { FIND_QUEUE, REPLACE_QUEUE } = require('../queues');

const findProcessor = path.join(__dirname, 'find.js');
const findWorker = new Worker(FIND_QUEUE, findProcessor);

const replaceProcessor = path.join(__dirname, 'replace.js');
const replaceWorker = new Worker(REPLACE_QUEUE, replaceProcessor);

findWorker.on('error', err => {
  console.error(err);
});

replaceWorker.on('error', err => {
  console.error(err);
});

module.exports = {
  findWorker,
  replaceWorker,
};