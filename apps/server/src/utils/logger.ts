import winston from 'winston';
const NewRelicTransport = require("newrelic-winston-transport");
import config from '../config/config';

const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.stack });
  }
  return info;
});

const logger = winston.createLogger({
  level: config.env === 'production' ? 'error' : 'debug',
  format: winston.format.combine(
    enumerateErrorFormat(),
    config.env === 'production' ? winston.format.uncolorize() : winston.format.colorize(),
    winston.format.splat(),
    winston.format.printf(({ level, message }) => `${level}: ${message}`)
  )
});

if (config.env === "production") {
  logger.add(new NewRelicTransport());
} else {
  logger.add(new winston.transports.Console());
}

export default logger;
