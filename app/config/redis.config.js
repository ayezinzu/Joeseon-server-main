const env = process.env.NODE_ENV;

  const production = {
    HOST: "127.0.0.1",
    USER: "",
    PASSWORD: "",
    PORT: 6379,
    REDIS_URL: "127.0.0.1:6379"
  }

  const development =  {
    REDIS_URL:"redis://:p0b66f880d5e97362b97e727622202d763a4e198194d9ea6bad14f822aa5418f0@ec2-54-88-171-166.compute-1.amazonaws.com:17939"
  }

  const redisConfig = {
    production,
    development
  };

module.exports = redisConfig[env];

  