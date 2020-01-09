import 'mocha';

import { expect } from 'chai';
import * as httpMocks from 'node-mocks-http';
import * as sinon from 'sinon';
import { getViolationList } from '../../../../api/controllers/agencySetup/configViolation';
import { AppError } from '../../../../api/errors';
import ConfigViolationService from '../../../../api/service/agencySetup/configViolation';

describe('Configviolation Controller: getViolationList method', () => {
  let responseBody: IConfigXerceViolationList[];
  let request;
  let response;
  let sandbox;
  const agencyId = 1;
  let user: IAgencyUserClaim | ISuperAdminClaim;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    user = {
      id: 0,
      agencyId: 1,
      agencyName: 'City of Alabama',
      email: 'cyberdynesupport@comcate.com',
      firstName: 'Comcate',
      lastName: 'Support',
      agencyTimezone: 'America/Los_Angeles',
      scopes: {
        superAdmin: true,
        xerce: {
          id: 1,
          productAdmin: true,
          reportAccess: ReportAccess.ALL_STAFF,
          dashboardAccess: DashboardAccess.ALL_STAFF_DASHBOARD,
          feesAccess: FeesAccess.CAN_VOID,
          violationTypeScope: {
            11: {
              violationTypeAccess: ViolationTypeACL.OVERWRITE,
              isActive: true,
            },
            12: {
              violationTypeAccess: ViolationTypeACL.OVERWRITE,
              isActive: true,
            },
            13: {
              violationTypeAccess: ViolationTypeACL.OVERWRITE,
              isActive: true,
            },
            14: {
              violationTypeAccess: ViolationTypeACL.OVERWRITE,
              isActive: true,
            },
          },
        },
      },
    };

    responseBody = [
      {
        id: 1,
        label: 'Animal Control',
      },
      {
        id: 3,
        label: 'Osbstructing Vehicles',
      },
      {
        id: 2,
        label: 'Vehicle Control',
      },
    ];

    request = httpMocks.createRequest({
      method: 'GET',
      url: '/xerce/config/violations/list',
      swagger: {
        params: {},
      },
      user,
    });

    response = httpMocks.createResponse();
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 with list of violations', async () => {
    sandbox
      .stub(ConfigViolationService.prototype, 'getViolationList')
      .withArgs(agencyId, user.scopes.xerce.id)
      .resolves(responseBody);

    await getViolationList(request, response);

    expect(response.statusCode).to.equal(200);
    expect(JSON.parse(response._getData())).to.deep.equal(
      responseBody,
      'response body did not match'
    );
  });

  it('Should throw error when getting config violation list', async () => {
    const errorMsg = 'Something went wrong. Please try again later.';
    sandbox
      .stub(ConfigViolationService.prototype, 'getViolationList')
      .withArgs(agencyId, user.scopes.xerce.id)
      .throws(
        new AppError('Something went wrong. Please try again later.', 400)
      );

    await getViolationList(request, response);

    expect(response.statusCode).to.equal(400);
    expect(JSON.parse(response._getData())).to.deep.equal(
      { message: errorMsg },
      'response body did not match'
    );
  });
});
