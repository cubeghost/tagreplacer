const FIND_QUEUE = 'tumblr:find';
const REPLACE_QUEUE = 'tumblr:replace';

const MESSAGE_QUEUE = sessionId => `messages:${sessionId}`;

module.exports = {
  FIND_QUEUE,
  REPLACE_QUEUE,
  MESSAGE_QUEUE,
};