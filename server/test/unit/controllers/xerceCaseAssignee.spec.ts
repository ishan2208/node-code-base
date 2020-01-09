import 'mocha';

import { expect } from 'chai';
import * as httpMocks from 'node-mocks-http';
import * as sinon from 'sinon';

import {
  editCaseAssignee,
  getCaseAssignee,
} from '../../../api/controllers/xerceCaseAssignee';
import { AppError } from '../../../api/errors';
import XerceCaseAssigneeService from '../../../api/service/xerce/xerceCaseAssignee';

describe('XerceCaseAssignee Controller: editCaseAssignee Method', () => {
  let sandbox;
  const agencyId = 1;
  const userId = 3;
  const xerceId = 5;
  const caseId = 10;
  let response;
  let responseBody: ICaseUser;
  let request;
  let requestBody: ICaseAssigneeEditRequest;

  const user: IAgencyUserClaim | ISuperAdminClaim = {
    id: userId,
    agencyId,
    agencyName: 'City of Alabama',
    email: 'john.doe@comcate.com',
    firstName: 'John',
    lastName: 'Doe',
    agencyTimezone: 'America/Los_Angeles',
    scopes: {
      superAdmin: true,
      xerce: {
        id: xerceId,
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

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    requestBody = {
      assigneeId: userId,
    };

    responseBody = {
      id: userId,
      firstName: 'John',
      lastName: 'Doe',
    };

    request = httpMocks.createRequest({
      method: 'PUT',
      url: '/xerce/cases/10/assignees',
      swagger: {
        params: {
          caseId: {
            value: 10,
          },
          body: {
            value: requestBody,
          },
        },
      },
      user,
    });

    response = httpMocks.createResponse();
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 and return case user', async () => {
    sandbox
      .stub(XerceCaseAssigneeService.prototype, 'editCaseAssignee')
      .withArgs(agencyId, userId, caseId, requestBody)
      .returns(responseBody);

    await editCaseAssignee(request, response);

    expect(response.statusCode).to.equal(200);
    expect(JSON.parse(response._getData())).to.deep.equal(
      responseBody,
      'response body did not match'
    );
  });

  it('Should throw error code 400 with error message', async () => {
    const errorMessage = 'Could not find the Xerce case.';
    sandbox
      .stub(XerceCaseAssigneeService.prototype, 'editCaseAssignee')
      .withArgs(agencyId, userId, caseId, requestBody)
      .throws(new AppError(errorMessage, 400));

    await editCaseAssignee(request, response);

    expect(response.statusCode).to.equal(400);
    expect(JSON.parse(response._getData())).to.deep.equal(
      { message: errorMessage },
      'response body did not match'
    );
  });
});

describe('XerceCaseAssignee Controller: getCaseAssignee Method', () => {
  let sandbox;
  const agencyId = 1;
  const userId = 3;
  const xerceId = 5;
  const caseId = 10;
  let response;
  let responseBody: ICaseUser;
  let request;

  const user: IAgencyUserClaim | ISuperAdminClaim = {
    id: userId,
    agencyId,
    agencyName: 'City of Alabama',
    email: 'john.doe@comcate.com',
    firstName: 'John',
    lastName: 'Doe',
    agencyTimezone: 'America/Los_Angeles',
    scopes: {
      superAdmin: true,
      xerce: {
        id: xerceId,
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

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    responseBody = {
      id: userId,
      firstName: 'John',
      lastName: 'Doe',
    };

    request = httpMocks.createRequest({
      method: 'GET',
      url: '/xerce/cases/10/assignees',
      swagger: {
        params: {
          caseId: {
            value: 10,
          },
        },
      },
      user,
    });

    response = httpMocks.createResponse();
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 and return case user', async () => {
    sandbox
      .stub(XerceCaseAssigneeService.prototype, 'getCaseAssignee')
      .withArgs(agencyId, caseId)
      .returns(responseBody);

    await getCaseAssignee(request, response);

    expect(response.statusCode).to.equal(200);
    expect(JSON.parse(response._getData())).to.deep.equal(
      responseBody,
      'response body did not match'
    );
  });

  it('Should throw error code 400 with error message', async () => {
    const errorMessage = 'Could not find the Xerce case.';
    sandbox
      .stub(XerceCaseAssigneeService.prototype, 'getCaseAssignee')
      .withArgs(agencyId, caseId)
      .throws(new AppError(errorMessage, 400));

    await getCaseAssignee(request, response);

    expect(response.statusCode).to.equal(400);
    expect(JSON.parse(response._getData())).to.deep.equal(
      { message: errorMessage },
      'response body did not match'
    );
  });
});
