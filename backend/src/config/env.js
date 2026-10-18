// require('dotenv').config();

// module.exports = {
//   PORT:            process.env.PORT || 5000,
//   MONGODB_URI:     process.env.MONGODB_URI,
//   JWT_SECRET:      process.env.JWT_SECRET,
//   REFRESH_SECRET:  process.env.REFRESH_SECRET,
//   CLIENT_URL:      process.env.CLIENT_URL || 'http://localhost:3000',
//   OPENAI_API_KEY:  process.env.OPENAI_API_KEY,
//   S3_BUCKET:       process.env.S3_BUCKET,
//   AWS_REGION:      process.env.AWS_REGION || 'ap-south-1',
//   FCM_KEY:         process.env.FCM_KEY,
//   MSG91_AUTH_KEY:  process.env.MSG91_AUTH_KEY,
//   REDIS_URL:       process.env.REDIS_URL,
//   NODE_ENV:        process.env.NODE_ENV || 'development',
// };

// new config

require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  REFRESH_SECRET: process.env.REFRESH_SECRET,
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",
  GROQ_API_KEY: process.env.GROQ_API_KEY, // FREE - get at https://console.groq.com
  S3_BUCKET: process.env.S3_BUCKET,
  AWS_REGION: process.env.AWS_REGION || "ap-south-1",
  FCM_KEY: process.env.FCM_KEY,
  MSG91_AUTH_KEY: process.env.MSG91_AUTH_KEY,
  REDIS_URL: process.env.REDIS_URL,
  NODE_ENV: process.env.NODE_ENV || "development",
};
