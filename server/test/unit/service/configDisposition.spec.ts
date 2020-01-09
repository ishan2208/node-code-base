import 'mocha';

import { expect } from 'chai';
import * as sinon from 'sinon';
import db from '../../../api/models';
import ConfigDispositionService from '../../../api/service/agencySetup/configDisposition';

const configDispositionService = new ConfigDispositionService();

describe('ConfigDisposition Service: getByIds method', () => {
  let sandbox;
  const agencyId = 1;
  let configDispositionsRespObj: IConfigDisposition[];
  let dispositionsInstance;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    configDispositionsRespObj = [
      {
        id: 1,
        label: 'Duplicate',
        dispositionType: DispositionType.INVALID_DISPOSITION,
        compliantDispositionType: null,
        isDefault: true,
        isActive: true,
        sequence: 1,
      },
      {
        id: 2,
        label: 'Invalid',
        dispositionType: DispositionType.INVALID_DISPOSITION,
        compliantDispositionType: null,
        isDefault: false,
        isActive: true,
        sequence: 2,
      },
    ];

    dispositionsInstance = [
      {
        id: 1,
        agencyId,
        xerceId: 1,
        label: 'Duplicate',
        dispositionType: DispositionType.INVALID_DISPOSITION,
        compliantDispositionType: null,
        isDefault: true,
        sequence: 1,
        isActive: true,
        createdAt: new Date('2019-08-30T17:12:23.561Z'),
        updatedAt: new Date('2019-08-30T17:12:23.561Z'),
        deletedAt: null,
      },
      {
        id: 2,
        agencyId,
        xerceId: 1,
        label: 'Invalid',
        dispositionType: DispositionType.INVALID_DISPOSITION,
        compliantDispositionType: null,
        isDefault: false,
        sequence: 2,
        isActive: true,
        createdAt: new Date('2019-08-30T17:12:23.561Z'),
        updatedAt: new Date('2019-08-30T17:12:23.561Z'),
        deletedAt: null,
      },
    ];
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('should return dispositions with success', async () => {
    sandbox
      .stub(db.ConfigDisposition, 'findAll')
      .withArgs({
        where: {
          id: [1, 2],
          agencyId,
          isActive: true,
        },
      })
      .resolves(dispositionsInstance);

    const result = await configDispositionService.getByIds(agencyId, [1, 2]);

    expect(result).to.deep.equal(
      configDispositionsRespObj,
      'Response does not match.'
    );
  });

  it('should throw error while fetching dispositions', async () => {
    sandbox
      .stub(db.ConfigDisposition, 'findAll')
      .withArgs({
        where: {
          id: [1, 2],
          agencyId,
          isActive: true,
        },
      })
      .throws('Error');

    await configDispositionService
      .getByIds(agencyId, [1, 2])
      .catch(err => expect(err.name).to.equal('InternalServerError'));
  });
});
