import { createLogger, format, transports } from 'winston';

const { combine, json, timestamp, colorize } = format;

const consoleFormat = format.combine(
  format.colorize(),
  format.printf(({ level, message, timestamp }) => {
    return `{${timestamp}} [${level}]: ${message}`;
  })
);

const logger = createLogger({
  level: 'info',
  format: combine(colorize(), timestamp(), json()),
  transports: [
    new transports.Console({
      format: consoleFormat,
    }),
  ],
});

export default logger;
