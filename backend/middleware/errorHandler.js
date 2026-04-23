const logger = require('../utils/logger');

// Async wrapper — eliminates try/catch boilerplate in route handlers
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// 404 handler
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// Global error handler
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;

  // Log all 5xx errors
  if (statusCode >= 500) {
    logger.error('Server error', {
      message: err.message,
      stack: err.stack,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      body: req.method !== 'GET' ? '[redacted]' : undefined,
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: messages.join('. ') });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({ success: false, message: `Duplicate value for ${field}` });
  }

  // Mongoose cast error (invalid ObjectId etc.)
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid ID format' });
  }

  // Multer errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ success: false, message: err.message });
  }

  // JWT errors (future-proofing)
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired' });
  }

  // Default error — never leak stack trace in production
  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 && process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

module.exports = { asyncHandler, notFound, errorHandler };
