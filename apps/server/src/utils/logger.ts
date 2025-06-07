import winston from 'winston';
import config from '@/config/config';

const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error) {
    // Create a new object instead of modifying the original Error object
    return {
      ...info,
      message: info.stack || info.message,
    };
  }
  return info;
});

const logger = winston.createLogger({
  level: config.NODE_ENV === 'production' ? 'error' : 'debug',
  format: winston.format.combine(
    enumerateErrorFormat(),
    config.NODE_ENV === 'production' ? winston.format.uncolorize() : winston.format.colorize(),
    winston.format.splat(),
    winston.format.printf(({ level, message }) => `${level}: ${message}`)
  ),
});

logger.add(new winston.transports.Console());

export default logger;
