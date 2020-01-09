import 'mocha';

import { expect } from 'chai';
import * as sinon from 'sinon';
import db from '../../../../api/models';
import AgencyService from '../../../../api/service/admin/agency';

const agencyService = new AgencyService();

describe('Agency Service: getAgencyName', () => {
  let sandbox;
  const agencyId = 1;

  let responseObj;
  let agency = null;
  let result;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    agency = {
      id: agencyId,
      name: 'City of Henderson',
    };

    responseObj = {
      id: agencyId,
      name: 'City of Henderson',
    };
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 with agency name', async () => {
    sandbox
      .stub(db.Agency, 'findOne')
      .withArgs({
        attributes: ['id', 'name'],
        where: {
          id: agencyId,
          isActive: true,
        },
      })
      .resolves(agency);

    result = await agencyService.getAgencyName(agencyId);

    expect(result).to.deep.equal(responseObj, 'response did not match');
  });

  it('Should return status code 200 with agency name being null', async () => {
    sandbox
      .stub(db.Agency, 'findOne')
      .withArgs({
        attributes: ['id', 'name'],
        where: {
          id: agencyId,
          isActive: true,
        },
      })
      .resolves(null);

    result = await agencyService.getAgencyName(agencyId);

    expect(result).to.deep.equal(null, 'response did not match');
  });

  it('Should throw internal server error', async () => {
    const errorMessage = 'Error while getting the agency information.';
    sandbox
      .stub(db.Agency, 'findOne')
      .withArgs({
        attributes: ['id', 'name'],
        where: {
          id: agencyId,
          isActive: true,
        },
      })
      .throws({ name: 'Error' });

    await agencyService.getAgencyName(agencyId).catch(err => {
      expect(err.name).to.deep.equal('InternalServerError');
      expect(err.message).to.deep.equal(errorMessage);
    });
  });
});
