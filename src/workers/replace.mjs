import 'dotenv/config';

import get from 'lodash-es/get.js';

import { tumblrQueue, getMessageQueue } from '../queues.mjs';
import { getSession } from '../server/session.mjs';
import TumblrClient from '../tumblr.mjs';

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
export default async (job) => {
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