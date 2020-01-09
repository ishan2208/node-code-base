import 'mocha';

import { expect } from 'chai';
import * as httpMocks from 'node-mocks-http';
import * as sinon from 'sinon';
import { getAgencyName } from '../../../../api/controllers/admin/agency';
import { AppError } from '../../../../api/errors';
import AgencyService from '../../../../api/service/admin/agency';

describe('Agency Controller: getAgencyName method', () => {
  let responseBody: IAgencyName;
  let request;
  let response;
  let sandbox;
  const agencyId = 1;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    responseBody = {
      id: 1,
      name: 'City of Henderson',
    };

    request = httpMocks.createRequest({
      method: 'GET',
      url: '/agency/1/info',
      swagger: {
        params: {
          agencyId: {
            value: agencyId,
          },
        },
      },
    });

    response = httpMocks.createResponse();
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 with agency name', async () => {
    sandbox
      .stub(AgencyService.prototype, 'getAgencyName')
      .withArgs(agencyId)
      .resolves(responseBody);

    await getAgencyName(request, response);

    expect(response.statusCode).to.equal(200);
    expect(JSON.parse(response._getData())).to.deep.equal(
      responseBody,
      'response body did not match'
    );
  });

  it('Should throw error when getting agency name', async () => {
    const errorMsg = 'Something went wrong. Please try again later.';
    sandbox
      .stub(AgencyService.prototype, 'getAgencyName')
      .withArgs(agencyId)
      .throws(
        new AppError('Something went wrong. Please try again later.', 400)
      );

    await getAgencyName(request, response);

    expect(response.statusCode).to.equal(400);
    expect(JSON.parse(response._getData())).to.deep.equal(
      { message: errorMsg },
      'response body did not match'
    );
  });
});
