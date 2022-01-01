const { Queue } = require('bullmq');
const get = require('lodash/get');

const { FIND_QUEUE, MESSAGE_QUEUE } = require('../queues');
const { getSession } = require('../session');
const TumblrClient = require('../tumblr');

const queue = new Queue(FIND_QUEUE);

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
  const messageQueue = new Queue(MESSAGE_QUEUE(sessionId));
  const token = get(session, 'grant.response.access_token'); 
  const client = new TumblrClient({
    token,
    blog,
    options,
  });

  const response = await client.findPostsWithTags(methodName, find, params);

  await messageQueue.add('posts', {
    methodName,
    blog,
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