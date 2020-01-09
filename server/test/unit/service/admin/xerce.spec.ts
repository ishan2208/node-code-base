import 'mocha';

import { expect } from 'chai';
import * as sinon from 'sinon';

import db from '../../../../api/models';
import XerceService from '../../../../api/service/admin/xerce';

const xerceService = new XerceService();

describe('Xerce Service: getNextCaseNumber method', () => {
  let sandbox;
  const agencyId = 1;
  const nextCaseNumber = 'CE-19-1';
  const agency = {
    id: agencyId,
    xerce: {
      nextCaseNumber,
    },
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return the next case number', async () => {
    sandbox.stub(db.Agency, 'findOne').resolves(agency);

    sandbox
      .stub(XerceService.prototype, 'getNextCaseNumber')
      .withArgs(agencyId)
      .resolves(nextCaseNumber);

    const result = await (xerceService as any).getNextCaseNumber(agencyId);

    expect(result).to.equal(nextCaseNumber);
  });

  it('should throw error while fetching next case number', async () => {
    sandbox.stub(db.Agency, 'findOne').throws('Error');

    await (xerceService as any)
      .getNextCaseNumber(agencyId)
      .catch(err => expect(err.name).to.equal('InternalServerError'));
  });
});

describe('Xerce Service: updateNextCaseNumber method', () => {
  let sandbox;
  const agencyId = 1;
  const caseNumber = 'CE-19-1';
  let transaction;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    transaction = sandbox.stub();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should update next case number', async () => {
    sandbox.stub(db.Xerce, 'update');

    await (xerceService as any)
      .updateNextCaseNumber(agencyId, caseNumber, transaction)
      .catch(err => expect(err.name).to.equal('Error'));
  });

  it('should throw error while updating next case number', async () => {
    sandbox.stub(db.Xerce, 'update').throws('Error');

    (xerceService as any)
      .updateNextCaseNumber(agencyId, caseNumber, transaction)
      .catch(err => expect(err.name).to.equal('InternalServerError'));
  });
});
