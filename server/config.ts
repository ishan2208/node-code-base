import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as _ from 'lodash';
import * as path from 'path';

const config: IAppConfig = {
  app: {
    uploadDir: '',
  },
  db: {
    username: '',
    password: '',
    database: '',
    dialect: 'postgres',
    protocol: 'postgres',
    port: 5432,
    host: '127.0.0.1',
    logging: false,
    force: false,
    dialectOptions: {
      supportBigNumbers: true,
      bigNumberStrings: false,
      multipleStatements: true,
    },
    pool: {
      max: 5,
      min: 0,
      idle: 10000,
      acquire: 10000,
    },
  },
  jwt: {
    jwtSecret: '',
    jwtSessionTimeOut: '',
    saltRounds: 10,
  },
  geoserver: {
    url: 'http://localhost:8080/geoserver/rest',
    username: 'geoserver',
    password: 'password',
    workspace: 'cyberdyne',
    datastore: 'cyberdyne_pg',
    layerUrl: '',
  },
  mapbox: {
    accessToken: '',
    layers: [],
  },
  aws: {
    accessKeyToken: '',
    secretKey: '',
    region: '',
    s3: {
      bucket: '',
    },
  },
  host: {
    url: '',
  },
  mailgun: {
    apiKey: '',
    domain: '',
    from: '',
    templatePath: '',
    emailExpiryTime: '',
  },
};

const initConfig = (): IAppConfig => {
  /*
   * TODO
   * Merge default.yaml and the env.yaml
   */
  const env = process.env.NODE_ENV || 'development';
  const configFile = path.join(__dirname, 'config', 'env', `${env}.yaml`);

  const envConfig = yaml.safeLoad(fs.readFileSync(configFile, 'UTF-8'));
  _.merge(config, envConfig);

  return config;
};

const enviroment = process.env.NODE_ENV || 'development';

export default config;
export { initConfig, enviroment };
