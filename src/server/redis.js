require('dotenv').config();

const redis = require('redis');
const IORedis = require('ioredis');

const client = redis.createClient(process.env.REDIS_URL);

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

module.exports = {
  client,
  connection,
};
