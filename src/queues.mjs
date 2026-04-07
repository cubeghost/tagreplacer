import { Queue } from 'bullmq';

import connection from './redis.mjs';
import { TUMBLR_QUEUE, MESSAGE_QUEUE } from './consts.mjs';

export const tumblrQueue = new Queue(TUMBLR_QUEUE, { connection });

export const getMessageQueueName = sessionId => `${MESSAGE_QUEUE}:${sessionId}`;
export const getMessageQueue = sessionId => new Queue(getMessageQueueName(sessionId), { connection });