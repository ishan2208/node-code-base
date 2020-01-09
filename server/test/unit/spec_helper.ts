// tslint:disable-next-line:no-reference
/// <reference path="../../api/types/models.d.ts" />
// tslint:disable-next-line:no-reference
/// <reference path="../../api/types/controller.d.ts" />
// tslint:disable-next-line:no-reference
/// <reference path="../../api/types/app.d.ts" />
// tslint:disable-next-line:no-reference
/// <reference path="../../api/types/admin.d.ts" />
// tslint:disable-next-line:no-reference
/// <reference path="../../api/types/agencySetup.d.ts" />

import * as winston from 'winston';
import { dbTestInit } from '../../api/models';
import { initLogger } from '../../logger';

const logger = initLogger();
logger.info('Initialized logger');

const dbModels = [
  'Agency',
  'AgencyLocation',
  'CDBG',
  'CDBGFileName',
  'ComcateAdmin',
  'ConfigDisposition',
  'ConfigContactCustomField',
  'ConfigCaseRole',
  'ConfigCaseCustomTile',
  'ConfigXerceNotice',
  'ConfigXercePaymentType',
  'ConfigFee',
  'ConfigForcedAbatementActivity',
  'ConfigForcedAbatementField',
  'ConfigHTMLFormImage',
  'ConfigLocationField',
  'ConfigKML',
  'ConfigMunicipalCode',
  'ConfigNoticeForm',
  'ConfigXerceViolation',
  'ConfigXerceViolationType',
  'Contact',
  'FileMetadata',
  'LocationFlagHistory',
  'Parcel',
  'User',
  'XerceCaseStatusActivity',
  'XerceCaseAttachment',
  'Xerce',
  'XerceCase',
  'XerceCaseContact',
  'XerceCaseInspection',
  'XerceCaseInspectionAttachment',
  'XerceCaseInspectionViolation',
  'XerceCaseForcedAbatementActivity',
  'XerceCaseNote',
  'XerceCaseNotice',
  'XerceCaseLocation',
  'XerceCaseViolation',
  'XerceCaseHistory',
  'XerceCaseTimeTracking',
  'sequelize',
  'Sequelize',
  'SystemXerceViolationType',
];

const modelStubs = {};
const sequelizeMethods = {
  // tslint:disable-next-line:no-empty
  create() {},
  // tslint:disable-next-line:no-empty
  bulkCreate() {},
  // tslint:disable-next-line:no-empty
  findOne() {},
  // tslint:disable-next-line:no-empty
  findAll() {},
  // tslint:disable-next-line:no-empty
  findbulkCreateOne() {},
  // tslint:disable-next-line:no-empty
  update() {},
  // tslint:disable-next-line:no-empty
  max() {},
  // tslint:disable-next-line:no-empty
  destroy() {},
  // tslint:disable-next-line:no-empty
  findAndCountAll() {},
  // tslint:disable-next-line:no-empty
  count() {},
};

for (const dbModel of dbModels) {
  modelStubs[dbModel] = Object.assign({}, sequelizeMethods);
}

// tslint:disable-next-line:no-string-literal
modelStubs['Sequelize'] = {
  Op: ['notILike', 'iLike', 'notIn'],
  // tslint:disable-next-line:no-empty
  col: () => {},
  // tslint:disable-next-line:no-empty
  fn: () => {},
  // tslint:disable-next-line:no-empty
  where: () => {},
  // tslint:disable-next-line:no-empty
  literal: () => {},
};

// tslint:disable-next-line:no-string-literal
modelStubs['sequelize'] = {
  QueryTypes: ['SELECT'],
  // tslint:disable-next-line:no-empty
  query: () => {},
  // tslint:disable-next-line:no-empty
  literal: () => {},
  // tslint:disable-next-line:no-empty
  col: () => {},
  // tslint:disable-next-line:no-empty
  fn: () => {},
  // tslint:disable-next-line:no-empty
  where: () => {},
};

dbTestInit(modelStubs);

winston.remove(winston.transports.Console);
