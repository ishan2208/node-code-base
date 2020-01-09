import { expect } from 'chai';
import 'mocha';
import * as httpMocks from 'node-mocks-http';
import * as sinon from 'sinon';
import { get } from '../../../../api/controllers/xerce/xerceCaseHistory';
import XerceCaseHistory from '../../../../api/service/xerce/xerceCaseHistory';

describe('XerceCaseHistory Controller: get Method', () => {
  let sandbox;
  const agencyId = 1;
  const caseId = 57;
  let responseBody;
  const user: IAgencyUserClaim | ISuperAdminClaim = {
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
          1: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
          2: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
          3: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
          4: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
        },
      },
    },
  };

  let request;
  let response;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    responseBody = [
      {
        createdBy: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
        },
        description: 'Case Created',
        createdAt: '2019-02-16T06:29:32.814Z',
        action: CaseHistoryActions.CASE_CREATED,
      },
      {
        createdBy: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
        },
        description: 'Case Closed',
        createdAt: '2019-02-16T06:29:32.814Z',
        action: CaseHistoryActions.CASE_CLOSED,
      },
    ];

    request = httpMocks.createRequest({
      method: 'GET',
      url: `xerce/cases/${caseId}/case-history`,
      swagger: {
        params: {
          caseId: {
            value: caseId,
          },
        },
      },
      user,
    });

    response = httpMocks.createResponse();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return status code 200 with case history', async () => {
    sandbox
      .stub(XerceCaseHistory.prototype, 'get')
      .withArgs(agencyId, caseId)
      .resolves(responseBody);

    await get(request, response);

    expect(response.statusCode).to.equal(200);
    expect(JSON.parse(response._getData())).to.deep.equal(
      responseBody,
      'response body did not match'
    );
  });

  it('should throw error', async () => {
    sandbox
      .stub(XerceCaseHistory.prototype, 'get')
      .withArgs(agencyId, caseId)
      .throws('Error');

    await get(request, response).catch(err =>
      expect(err.name).to.deep.equal('Error')
    );
  });
});
