import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as httpContext from 'express-http-context';
import * as expressJWT from 'express-jwt';
import * as helmet from 'helmet';
import * as multer from 'multer';
import * as SwaggerExpress from 'swagger-express-mw';
import * as uuid from 'uuid/v1';

import { dbInit } from './api/models';
import { initConfig } from './config';
import { initLogger } from './logger';

const logger = initLogger();
logger.info('Initialized logger');

// It will stringify the objects that are logged
overwriteLoggers();

const config = initConfig();
logger.info('Initialized app config.');

const db = dbInit(config);
logger.info('Initialized database.');

const app = express();

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use((req: any, res: any, next: any) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

app.use(bodyParser.json());

if (config.app.uploadDir.length === 0) {
  // throw error
} else {
  app.use(multer({ dest: config.app.uploadDir }).any());
}

app.use(
  expressJWT({ secret: config.jwt.jwtSecret }).unless({
    path: [
      '/admin/login',
      '/health-check',
      /^\/agency\/([0-9]*)\/info/,
      /^\/agencies\/([0-9]*)\/login/,
      /^\/agencies\/([0-9]*)\/users\/set-password\/*/,
      /^\/agencies\/([0-9]*)\/users\/forgot-password/,
    ],
  })
);

app.use(helmet());

app.use(httpContext.middleware);

app.use((req, res, next) => {
  httpContext.set('reqId', uuid());
  next();
});

const swaggerConfig = {
  appRoot: __dirname,
};

SwaggerExpress.create(swaggerConfig, (err, swaggerExpress) => {
  if (err) {
    logger.error('Error occurred while intializing swagger.');
    logger.error(err);
  }
  swaggerExpress.register(app);
});

let server;
db.sequelize.sync().then(() => {
  server = app.listen(3000, '0.0.0.0', () => {
    logger.info('server started on port 3000');
  });
});

// TODO
// Use async await instead of callbacks.
process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);

function shutDown() {
  logger.info('Received kill signal, shutting down gracefully');
  server.close(() => {
    db.sequelize.close().then(() => {
      logger.info('Closed all the DB connections');
      process.exit(0);
    });
  });
}

function overwriteLoggers() {
  const logLevels = ['debug', 'verbose', 'info', 'warn', 'error'];

  for (const logLevel of logLevels) {
    const log = logger[logLevel];
    logger[logLevel] = message => {
      if (typeof message === 'object') {
        log(JSON.stringify(message));
      } else {
        log(message);
      }

      return null;
    };
  }
}

export default app;
