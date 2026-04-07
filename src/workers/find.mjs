import 'dotenv/config';

import get from 'lodash-es/get.js';

import { tumblrQueue, getMessageQueue } from '../queues.mjs';
import { getSession } from '../server/session.mjs';
import TumblrClient from '../tumblr.mjs';

/**
 * @typedef FindJobData
 * @property {String}      sessionId
 * @property {String}      blog
 * @property {MethodName}  methodName
 * @property {String[]}    find
 * @property {Options}     options
 * @property {Object}      params
 */
export default async (job) => {
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
  const secret = get(session, 'grant.response.access_secret');
  const client = new TumblrClient({
    token,
    secret,
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