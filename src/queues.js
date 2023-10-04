const { Queue } = require('bullmq');

const connection = require('./redis');
const { TUMBLR_QUEUE, MESSAGE_QUEUE } = require('./consts');

const tumblrQueue = new Queue(TUMBLR_QUEUE, { connection });

const getMessageQueueName = sessionId => `${MESSAGE_QUEUE}:${sessionId}`;
const getMessageQueue = sessionId => new Queue(getMessageQueueName(sessionId), { connection });

module.exports = {
  tumblrQueue,
  getMessageQueue,
  getMessageQueueName,
};