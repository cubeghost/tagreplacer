/**
 * @typedef MethodName
 * @property {string} POSTS posts
 * @property {string} QUEUED queued
 * @property {string} DRAFTS drafts
 */
const METHODS = {
  POSTS: 'posts',
  QUEUED: 'queued',
  DRAFTS: 'drafts',
};

const TUMBLR_QUEUE = 'tumblr';
const MESSAGE_QUEUE = 'messages';

module.exports = {
  METHODS,
  TUMBLR_QUEUE,
  MESSAGE_QUEUE,
};