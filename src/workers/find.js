require('dotenv').config();

const get = require('lodash/get');

const { tumblrQueue, getMessageQueue } = require('../queues');
const { getSession } = require('../server/session');
const TumblrClient = require('../tumblr');

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
  const messageQueue = getMessageQueue(sessionId);
  const token = get(session, 'grant.response.access_token'); 
  const client = new TumblrClient({
    token,
    blog,
    options,
  });

  const response = await client.findPostsWithTags(methodName, find, params);

  await messageQueue.add('message', {
    jobType: `${tumblrQueue.name}:find`,
    methodName,
    blog,
    find,
    posts: response.posts,
    complete: response.complete,
  });

  if (!response.complete) {
    await tumblrQueue.add('find', {
      ...job.data,
      params: response.params,
    });
  }

  return;
};