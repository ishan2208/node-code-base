import * as httpContext from 'express-http-context';
import * as fs from 'fs';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

// TODO
// Take environment as input and configure logger accordingly.
const initLogger = () => {
  const logDir = 'logs';

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }

  const tsFormat = 'YYYY-MM-DD HH:mm:ss.SSS';

  const myFormat = winston.format.printf(info => {
    const reqId = httpContext.get('reqId');

    return `${info.timestamp} ${info.level} ${reqId}: ${info.message}`;
  });

  const console = new winston.transports.Console({
    level: 'debug',
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.prettyPrint(),
      winston.format.timestamp({
        format: tsFormat,
      }),
      myFormat
    ),
  });

  const files = new DailyRotateFile({
    filename: `${logDir}/cyberdyne-%DATE%.log`,
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: false,
    maxSize: '2m',
    format: winston.format.combine(
      winston.format.prettyPrint(),
      winston.format.timestamp({
        format: tsFormat,
      }),
      myFormat
    ),
  });

  winston.configure({
    transports: [files, console],
    exceptionHandlers: [console],
  });

  return winston;
};

export { initLogger };
export default winston;
