require('dotenv').config();

const { Queue } = require('bullmq');
const get = require('lodash/get');

const { TUMBLR_QUEUE, MESSAGE_QUEUE } = require('../../queues');
const { getSession } = require('../session');
const { connection } = require('../redis');
const TumblrClient = require('../tumblr');

/**
 * @typedef ReplaceJobData
 * @property {String}      sessionId
 * @property {String}      blog
 * @property {String}      postId
 * @property {String[]}    find
 * @property {String[]}    replace
 * @property {Options}     options
 */
module.exports = async (job) => {
  const {
    sessionId,
    blog,
    postId,
    find,
    replace,
    options,
  } = job.data;

  const session = await getSession(sessionId);
  const messageQueue = new Queue(MESSAGE_QUEUE(sessionId), { connection });
  const token = get(session, 'grant.response.access_token');
  const client = new TumblrClient({
    token,
    blog,
    options,
  });

  const response = await client.replacePostTags(postId, find, replace);

  await messageQueue.add('message', {
    jobType: `${TUMBLR_QUEUE}:replace`,
    blog,
    postId,
    find,
    replace,
    tags: response.tags,
  });

  return;
};