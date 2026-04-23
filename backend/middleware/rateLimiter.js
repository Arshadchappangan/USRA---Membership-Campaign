const rateLimit = require('express-rate-limit');

// General API limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
  skip: (req) => process.env.NODE_ENV === 'development',
});

// Strict limiter for registration (prevent spam)
const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many registration attempts. Please try again in an hour.' },
  keyGenerator: (req) => req.ip,
  skip: (req) => process.env.NODE_ENV === 'development',
});

// Payment endpoint limiter
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many payment attempts. Please try again later.' },
  skip: (req) => process.env.NODE_ENV === 'development',
});

module.exports = { apiLimiter, registrationLimiter, paymentLimiter };
