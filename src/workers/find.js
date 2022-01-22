require('dotenv').config();

const { Queue } = require('bullmq');
const get = require('lodash/get');

const { TUMBLR_QUEUE, MESSAGE_QUEUE } = require('../queues');
const { getSession } = require('../server/session');
const connection = require('../redis');
const TumblrClient = require('../tumblr');

const queue = new Queue(TUMBLR_QUEUE, { connection });

/**
 * @typedef FindJobData
 * @property {String}      sessionId
 * @property {String}      blog
 * @property {MethodName}  methodName
 * @property {String[]}    find
 * @property {Options}     options
 * @property {Object}      params
 */
module.exports = async (job) => {
  const {
    sessionId,
    blog,
    methodName,
    find,
    options,
    params,
  } = job.data;

  const session = await getSession(sessionId);
  const messageQueue = new Queue(MESSAGE_QUEUE(sessionId), { connection });
  const token = get(session, 'grant.response.access_token'); 
  const client = new TumblrClient({
    token,
    blog,
    options,
  });

  const response = await client.findPostsWithTags(methodName, find, params);

  await messageQueue.add('message', {
    jobType: `${TUMBLR_QUEUE}:find`,
    methodName,
    blog,
    find,
    posts: response.posts,
    complete: response.complete,
  });

  if (!response.complete) {
    await queue.add('find', {
      ...job.data,
      params: response.params,
    });
  }

  return;
};