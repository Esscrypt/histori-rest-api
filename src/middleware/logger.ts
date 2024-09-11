import { createLogger, format, transports } from 'winston';
import path from 'path';

const { combine, timestamp, printf, errors, json } = format;

// Define the log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

// Create logger configuration
const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp(),
    errors({ stack: true }), // capture stack trace for errors
    process.env.NODE_ENV === 'production' ? json() : logFormat // log in JSON for production, pretty print in dev
  ),
  defaultMeta: { service: 'evm-token-api' },
  transports: [
    new transports.File({ filename: 'logs/error.log', level: 'error' }), // error logs
    new transports.File({ filename: 'logs/combined.log' }) // all logs
  ],
});

// If not in production, also log to console with the log format
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: combine(
        timestamp(),
        errors({ stack: true }),
        logFormat
      )
    })
  );
}

export default logger;
