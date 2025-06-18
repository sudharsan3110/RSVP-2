import winston from 'winston';
import config from '@/config/config';

const isProd = config.NODE_ENV === 'production';

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

const devFormat = winston.format.combine(
  enumerateErrorFormat(),
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const msg = typeof message === 'object' ? JSON.stringify(message, null, 2) : message;

    const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';

    return `${timestamp} ${level}: ${msg}${metaStr}`;
  })
);

const prodFormat = winston.format.combine(
  enumerateErrorFormat(),
  winston.format.timestamp(),
  winston.format.json()
);

export default winston.createLogger({
  level: isProd ? 'info' : 'debug',
  format: isProd ? prodFormat : devFormat,
  transports: [new winston.transports.Console()],
});
