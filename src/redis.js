require('dotenv').config();

var redis = require('node-redis');

var client = redis.createClient(
  process.env.REDIS_PORT,
  process.env.REDIS_HOST
);

module.exports = client;
