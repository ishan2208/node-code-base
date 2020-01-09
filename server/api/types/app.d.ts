declare interface IAppConfig {
  app: {
    uploadDir: string;
  };
  db: {
    username: string;
    password: string;
    database: string;
    dialect: string;
    protocol: string;
    port: number;
    host: string;
    logging: boolean;
    force: boolean;
    dialectOptions: {
      supportBigNumbers: boolean;
      bigNumberStrings: boolean;
      multipleStatements: boolean;
    };
    pool: {
      max: number;
      min: number;
      idle: number;
      acquire: number;
    };
  };
  jwt: {
    jwtSecret: string;
    jwtSessionTimeOut: string;
    saltRounds: number;
  };
  geoserver: {
    url: string;
    username: string;
    password: string;
    workspace: string;
    datastore: string;
    layerUrl: string;
  };
  mapbox: {
    accessToken: string;
    layers: IMapLayer[];
  };
  aws: {
    accessKeyToken: string;
    secretKey: string;
    region: string;
    s3: IS3Config;
  };
  host: {
    url: string;
  };
  mailgun: {
    apiKey: string;
    domain: string;
    from: string;
    templatePath: string;
    emailExpiryTime: string;
  };
}

declare interface IS3Config {
  bucket: string;
}
