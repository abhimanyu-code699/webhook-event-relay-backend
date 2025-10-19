const IORedis = require('ioredis');

const redisClient = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
  maxRetriesPerRequest: null, // 👈 required by BullMQ v5
});

redisClient.on('connect', () => console.log('Redis connected successfully ✌️'));
redisClient.on('error', (err) => console.log('Redis connection failed', err));

module.exports = redisClient;
