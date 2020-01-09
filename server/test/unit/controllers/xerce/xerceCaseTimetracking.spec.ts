import { expect } from 'chai';
import 'mocha';
import * as httpMocks from 'node-mocks-http';
import * as sinon from 'sinon';
import {
  create,
  deleteTimeLog,
  get,
} from '../../../../api/controllers/xerce/xerceCaseTimetracking';
import XerceCaseTimeTrackingService from '../../../../api/service/xerce/xerceCaseTimetracking';

describe('XerceCaseTimeTracking Controller: get Method', () => {
  let sandbox;
  const agencyId = 1;
  const caseId = 57;
  let responseBody;
  const user: IAgencyUserClaim | ISuperAdminClaim = {
    id: 9,
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
        user: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
        },
        id: 1,
        hours: 2.0,
        date: '2019-02-16T06:29:32.814Z',
      },
      {
        user: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
        },
        id: 2,
        hours: 3.0,
        date: '2019-02-16T06:29:32.814Z',
      },
    ];

    request = httpMocks.createRequest({
      method: 'GET',
      url: `xerce/cases/${caseId}/time-tracking`,
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

  it('should return status code 200 with case time tracking', async () => {
    sandbox
      .stub(XerceCaseTimeTrackingService.prototype, 'get')
      .withArgs(agencyId, caseId)
      .resolves(responseBody);

    await get(request, response);

    expect(response.statusCode).to.equal(200);
    expect(JSON.parse(response._getData())).to.deep.equal(
      responseBody,
      'response body did not match'
    );
  });

  it('should throw error while getting case time tracking', async () => {
    sandbox
      .stub(XerceCaseTimeTrackingService.prototype, 'get')
      .withArgs(agencyId, caseId)
      .throws('Error');

    await get(request, response).catch(err =>
      expect(err.name).to.deep.equal('Error')
    );
  });
});

describe('XerceCaseTimeTracking Controller: create Method', () => {
  let sandbox;
  const agencyId = 1;
  const caseId = 57;
  let responseBody;
  const user: IAgencyUserClaim | ISuperAdminClaim = {
    id: 9,
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
  let requestBody;
  let response;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    responseBody = [
      {
        user: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
        },
        id: 1,
        hours: 2.0,
        date: '2019-02-16T06:29:32.814Z',
      },
      {
        user: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
        },
        id: 2,
        hours: 3.0,
        date: '2019-02-16T06:29:32.814Z',
      },
    ];

    request = httpMocks.createRequest({
      method: 'GET',
      url: `xerce/cases/${caseId}/time-tracking`,
      swagger: {
        params: {
          caseId: {
            value: caseId,
          },
          body: {
            value: {
              userId: 1,
              date: '2019-02-16T06:29:32.814Z',
              hours: 2.0,
            },
          },
        },
      },
      user,
    });
    requestBody = {
      userId: 1,
      date: '2019-02-16T06:29:32.814Z',
      hours: 2.0,
    };

    response = httpMocks.createResponse();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return status code 201 with case time tracking', async () => {
    sandbox
      .stub(XerceCaseTimeTrackingService.prototype, 'create')
      .withArgs(agencyId, user.id, caseId, requestBody)
      .resolves(responseBody);

    await create(request, response);

    expect(response.statusCode).to.equal(201);
    expect(JSON.parse(response._getData())).to.deep.equal(
      responseBody,
      'response body did not match'
    );
  });

  it('should throw error while getting case time tracking', async () => {
    sandbox
      .stub(XerceCaseTimeTrackingService.prototype, 'create')
      .withArgs(agencyId, user.id, caseId, requestBody)
      .throws('Error');

    await create(request, response).catch(err =>
      expect(err.name).to.deep.equal('Error')
    );
  });
});
describe('XerceCaseTimeTracking Controller: deleteTimeLog Method', () => {
  let sandbox;
  const agencyId = 1;
  const caseId = 57;
  const timeTrackingId = 123;
  let responseBody;

  const user: IAgencyUserClaim | ISuperAdminClaim = {
    id: 9,
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
        user: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
        },
        id: 1,
        hours: 2.0,
        date: '2019-02-16T06:29:32.814Z',
      },
      {
        user: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
        },
        id: 2,
        hours: 3.0,
        date: '2019-02-16T06:29:32.814Z',
      },
    ];

    request = httpMocks.createRequest({
      method: 'DELETE',
      url: `xerce/cases/${caseId}/time-tracking/${timeTrackingId}`,
      swagger: {
        params: {
          caseId: {
            value: caseId,
          },
          timeTrackingId: {
            value: timeTrackingId,
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

  it('should return status code 200 with case time tracking', async () => {
    sandbox
      .stub(XerceCaseTimeTrackingService.prototype, 'delete')
      .withArgs(agencyId, caseId, timeTrackingId, user.id)
      .resolves(responseBody);

    await deleteTimeLog(request, response);

    expect(response.statusCode).to.equal(200);
    expect(JSON.parse(response._getData())).to.deep.equal(
      responseBody,
      'response body did not match'
    );
  });

  it('should throw error while deleting case time log', async () => {
    sandbox
      .stub(XerceCaseTimeTrackingService.prototype, 'delete')
      .withArgs(agencyId, caseId, timeTrackingId, user.id)
      .throws('Error');

    await deleteTimeLog(request, response).catch(err =>
      expect(err.name).to.deep.equal('Error')
    );
  });
});
