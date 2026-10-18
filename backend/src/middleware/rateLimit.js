const rateLimit = require("express-rate-limit");

exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300, // raised from 100 — dev has many re-renders
  message: { error: "Too many requests, please try again later." },
  skip: (req) => process.env.NODE_ENV === "development", // skip in dev
});

exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // raised from 10
  message: { error: "Too many auth attempts." },
});
