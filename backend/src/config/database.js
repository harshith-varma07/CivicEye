const mongoose = require('mongoose');
const redis = require('redis');

let redisClient;

const connectDB = async () => {
  try {
    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Connect to Redis
    redisClient = redis.createClient({
      url: process.env.REDIS_URL,
    });

    redisClient.on('error', (err) => console.log('Redis Client Error', err));
    redisClient.on('connect', () => console.log('Redis Connected'));

    await redisClient.connect();

    return { mongoConnection: conn, redisClient };
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const getRedisClient = () => redisClient;

module.exports = { connectDB, getRedisClient };
