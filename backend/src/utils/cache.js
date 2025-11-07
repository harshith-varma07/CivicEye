const { getRedisClient } = require('../config/database');

const CACHE_TTL = 3600; // 1 hour in seconds

const getFromCache = async (key) => {
  try {
    const client = getRedisClient();
    if (!client) return null;
    
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
};

const setToCache = async (key, value, ttl = CACHE_TTL) => {
  try {
    const client = getRedisClient();
    if (!client) return false;
    
    await client.setEx(key, ttl, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Redis set error:', error);
    return false;
  }
};

const deleteFromCache = async (key) => {
  try {
    const client = getRedisClient();
    if (!client) return false;
    
    await client.del(key);
    return true;
  } catch (error) {
    console.error('Redis delete error:', error);
    return false;
  }
};

const deleteCachePattern = async (pattern) => {
  try {
    const client = getRedisClient();
    if (!client) return false;
    
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
    }
    return true;
  } catch (error) {
    console.error('Redis pattern delete error:', error);
    return false;
  }
};

module.exports = {
  getFromCache,
  setToCache,
  deleteFromCache,
  deleteCachePattern,
};
