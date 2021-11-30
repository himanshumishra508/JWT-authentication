const redis = require("redis");

const redis_client = redis.createClient(process.env.REDIS_PORT);

module.exports = redis_client;
