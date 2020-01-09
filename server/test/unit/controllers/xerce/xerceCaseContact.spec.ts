import 'mocha';

import { expect } from 'chai';
import * as httpMocks from 'node-mocks-http';
import * as sinon from 'sinon';
import {
  create,
  edit,
} from '../../../../api/controllers/xerce/xerceCaseContact';
import { AppError } from '../../../../api/errors';
import XerceCaseContactService from '../../../../api/service/xerce/xerceCaseContact';

describe('xerceCaseContact Controller: Edit Billable Contact', () => {
  let sandbox;
  const agencyId = 1;
  const caseId = 2;
  const userId = 3;
  const caseContactId = 4;

  const user: IAgencyUserClaim | ISuperAdminClaim = {
    id: userId,
    agencyId: 1,
    agencyName: 'City of Alabama',
    email: 'john.doe@comcate.com',
    firstName: 'John',
    lastName: 'Doe',
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

  let response;
  let responseBody;
  let request;
  let requestBody;
  let errorMessage;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    responseBody = {
      id: 4,
      caseContactId,
      name: 'Janet Doe',
      contactType: 'LEGAL_ENTITY',
      isVendor: false,
      isGisPopulated: true,
      email: 'janet@doe.com',
      cellPhone: '+9198765456',
      workPhone: '+9198765456',
      streetAddress: '545,Alabama',
      city: 'Alabama',
      state: 'AL',
      zip: '94016',
      note: null,
      contactCustomFieldValues: null,
      isBillable: false,
      caseContactRole: null,
    };

    requestBody = {
      billableContact: false,
      caseRoleId: 2,
    };

    request = httpMocks.createRequest({
      method: 'PUT',
      url: '/cases/2/case-contacts/4/bill',
      swagger: {
        params: {
          caseContactId: {
            value: caseContactId,
          },
          caseId: {
            value: caseId,
          },
          body: {
            value: requestBody,
          },
        },
      },
      user,
    });

    response = httpMocks.createResponse();

    errorMessage = 'Error occurred while editing billable contact';
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 with contact details', async () => {
    sandbox
      .stub(XerceCaseContactService.prototype, 'edit')
      .withArgs(agencyId, caseId, user.id, caseContactId, requestBody)
      .returns(Object.assign({}, responseBody));

    await edit(request, response);

    expect(response.statusCode).to.equal(200);
    expect(JSON.parse(response._getData())).to.deep.equal(
      responseBody,
      'response body did not match'
    );
  });

  it('Should return status code 400 with error message', async () => {
    sandbox
      .stub(XerceCaseContactService.prototype, 'edit')
      .withArgs(agencyId, caseId, user.id, caseContactId, requestBody)
      .throws(
        new AppError('Error occurred while editing billable contact', 400)
      );

    await edit(request, response);

    expect(response.statusCode).to.equal(400);
    expect(JSON.parse(response._getData())).to.deep.equal(
      { message: errorMessage },
      'response body did not match'
    );
  });
});

describe('xerceCaseContact Controller: create method', () => {
  let sandbox;
  const agencyId = 1;
  const caseId = 2;
  const userId = 3;
  const caseContactId = 4;

  const user: IAgencyUserClaim | ISuperAdminClaim = {
    id: userId,
    agencyId: 1,
    agencyName: 'City of Alabama',
    email: 'john.doe@comcate.com',
    firstName: 'John',
    lastName: 'Doe',
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

  let response;
  let responseBody;
  let request;
  let requestBody;
  let errorMessage;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    responseBody = {
      id: 5,
      caseContactId,
      name: 'Janet Doe',
      contactType: ContactType.INDIVIDUAL,
      isVendor: true,
      isGisPopulated: true,
      email: 'janet@doe.com',
      cellPhone: '+9198765456',
      workPhone: '+9198765456',
      streetAddress: '545,Alabama',
      city: 'Alabama',
      state: 'AL',
      zip: '94016',
      note: '',
      contactCustomFieldValues: null,
      isBillable: false,
      caseContactRole: null,
    };

    requestBody = {
      id: 5,
      isBillable: true,
    };

    request = httpMocks.createRequest({
      method: 'POST',
      url: '/xerce/cases/2/contacts',
      swagger: {
        params: {
          caseId: {
            value: caseId,
          },
          body: {
            value: requestBody,
          },
        },
      },
      user,
    });

    response = httpMocks.createResponse();

    errorMessage = 'Error occurred while adding contact to case';
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 with contact details', async () => {
    sandbox
      .stub(XerceCaseContactService.prototype, 'create')
      .withArgs(agencyId, caseId, user.id, [requestBody])
      .returns(Object.assign({}, responseBody));

    await create(request, response);

    expect(response.statusCode).to.equal(200);
    expect(JSON.parse(response._getData())).to.deep.equal(
      responseBody,
      'response body did not match'
    );
  });

  it('Should return status code 400 with error message', async () => {
    sandbox
      .stub(XerceCaseContactService.prototype, 'create')
      .withArgs(agencyId, caseId, user.id, [requestBody])
      .throws(new AppError('Error occurred while adding contact to case', 400));

    await create(request, response);

    expect(response.statusCode).to.equal(400);
    expect(JSON.parse(response._getData())).to.deep.equal(
      { message: errorMessage },
      'response body did not match'
    );
  });
});
