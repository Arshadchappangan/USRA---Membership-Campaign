const { createLogger, format, transports } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

const logDir = path.join(__dirname, '../logs');

const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.json()
);

const consoleFormat = format.combine(
  format.colorize(),
  format.timestamp({ format: 'HH:mm:ss' }),
  format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level}: ${message}${metaStr}`;
  })
);

const logger = createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: logFormat,
  transports: [
    // Rotate error logs daily
    new DailyRotateFile({
      dirname: logDir,
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '30d',
      maxSize: '20m',
      zippedArchive: true,
    }),
    // Rotate combined logs daily
    new DailyRotateFile({
      dirname: logDir,
      filename: 'combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
      maxSize: '20m',
      zippedArchive: true,
    }),
  ],
  exceptionHandlers: [
    new DailyRotateFile({
      dirname: logDir,
      filename: 'exceptions-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d',
    }),
  ],
  rejectionHandlers: [
    new DailyRotateFile({
      dirname: logDir,
      filename: 'rejections-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d',
    }),
  ],
});

// Console transport in non-production
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({ format: consoleFormat }));
} else {
  // In production, still log errors to console (for PM2/Docker log capture)
  logger.add(new transports.Console({
    level: 'error',
    format: consoleFormat,
  }));
}

module.exports = logger;
