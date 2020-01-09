import { expect } from 'chai';
import 'mocha';
import * as httpMocks from 'node-mocks-http';
import * as sinon from 'sinon';
import { get } from '../../../../api/controllers/dashboard/dashboard';
import { AppError } from '../../../../api/errors';
import DashboardService from '../../../../api/service/dashboard/dashboard';

describe('Dashboard Controller: get method', () => {
  let errorMessage;
  let responseBody;
  let request;
  let response;
  let sandbox;
  const dashboardAccess = DashboardAccess.SELF_DASHBOARD;
  const agencyId = 1;
  const authScope = {
    comcateAdmin: true,
    siteAdmin: true,
  };

  const userProfile = {
    id: 5,
    agencyId,
    firstName: 'John',
    middleName: 'John',
    lastName: 'Doe',
    email: 'john.doe@alabama.com',
    scopes: authScope,
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    responseBody = {
      cases: {
        open: {
          all: 5,
          mine: 2,
        },
      },
      inspections: {
        dueToday: 1,
        overdue: 1,
        total: 2,
      },
    };

    request = httpMocks.createRequest({
      method: 'GET',
      url: '/dashboard',
      user: userProfile,
      swagger: {
        params: {
          dashboardAccess: {
            value: DashboardAccess.SELF_DASHBOARD,
          },
        },
      },
    });

    response = httpMocks.createResponse();

    errorMessage = 'Error while fetching open case counts';
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 with open case count.', async () => {
    sandbox
      .stub(DashboardService.prototype, 'get')
      .withArgs(agencyId, dashboardAccess, userProfile)
      .returns(responseBody);

    await get(request, response);

    expect(response.statusCode).to.equal(200);
    expect(JSON.parse(response._getData())).to.deep.equal(
      responseBody,
      'response body did not match'
    );
  });

  it('Should throw error message with status code 400.', async () => {
    sandbox
      .stub(DashboardService.prototype, 'get')
      .withArgs(agencyId, dashboardAccess, userProfile)
      .throws(new AppError(errorMessage, 400));

    await get(request, response);

    expect(response.statusCode).to.equal(400);
    expect(JSON.parse(response._getData())).to.deep.equal(
      { message: errorMessage },
      'response body did not match'
    );
  });
});
