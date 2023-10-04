require('dotenv').config();

const get = require('lodash/get');

const { tumblrQueue, getMessageQueue } = require('../queues');
const { getSession } = require('../server/session');
const TumblrClient = require('../tumblr');

/**
 * @typedef ReplaceJobData
 * @property {String}      sessionId
 * @property {String}      blog
 * @property {String}      postId
 * @property {String[]}    tags
 * @property {String[]}    find
 * @property {String[]}    replace
 * @property {Options}     options
 */
module.exports = async (job) => {
  const {
    sessionId,
    blog,
    postId,
    tags,
    find,
    replace,
    options,
  } = job.data;

  const session = await getSession(sessionId);
  const messageQueue = getMessageQueue(sessionId);
  const token = get(session, 'grant.response.access_token');
  const secret = get(session, 'grant.response.access_secret');
  const client = new TumblrClient({
    token,
    secret,
    blog,
    options,
  });

  const response = await client.replacePostTags(postId, tags, find, replace);

  await messageQueue.add('message', {
    jobType: `${tumblrQueue.name}:replace`,
    blog,
    postId,
    find,
    replace,
    tags: response.tags,
  });

  return;
};