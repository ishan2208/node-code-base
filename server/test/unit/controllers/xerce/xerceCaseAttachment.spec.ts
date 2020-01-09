import 'mocha';

import { expect } from 'chai';
import * as httpMocks from 'node-mocks-http';
import * as sinon from 'sinon';
import {
  create,
  deleteCaseAttachments,
  edit,
  getAll,
} from '../../../../api/controllers/xerce/xerceCaseAttachment';
import { AppError } from '../../../../api/errors';
import XerceCaseAttachmentService from '../../../../api/service/xerce/xerceCaseAttachment';

describe('xerceCaseAttachment Controller: Delete Case Attachment', () => {
  let sandbox;
  const agencyId = 1;
  const caseId = 2;
  const userId = 3;
  const attachmentId = 4;

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
  let errorMessage;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    responseBody = {
      status: 'OK',
    };

    request = httpMocks.createRequest({
      method: 'DELETE',
      url: '/xerce/cases/2/attachments/3',
      swagger: {
        params: {
          caseId: {
            value: caseId,
          },
          body: {
            value: {
              attachmentIds: {
                value: [attachmentId],
              },
            },
          },
        },
      },
      user,
    });

    response = httpMocks.createResponse();

    errorMessage = 'Error occurred while deleting case attachment';
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200', async () => {
    const deleteAttachments = sandbox.stub(
      XerceCaseAttachmentService.prototype,
      'delete'
    );
    deleteAttachments
      .withArgs(agencyId, caseId, [attachmentId])
      .returns(responseBody);

    await deleteCaseAttachments(request, response);

    expect(response.statusCode).to.equal(200);
    expect(JSON.parse(response._getData())).to.deep.equal(
      responseBody,
      'response body did not match'
    );
  });

  it('Should return status code 400', async () => {
    const deleteAttachments = sandbox.stub(
      XerceCaseAttachmentService.prototype,
      'delete'
    );
    deleteAttachments
      //.withArgs(agencyId, caseId, [attachmentId])
      .throws(
        new AppError('Error occurred while deleting case attachment', 400)
      );

    await deleteCaseAttachments(request, response);

    expect(response.statusCode).to.equal(400);
    expect(JSON.parse(response._getData())).to.deep.equal(
      { message: errorMessage },
      'response body did not match'
    );
  });
});

describe('xerceCaseAttachment Controller: Get All Case Attachments', () => {
  let sandbox;
  const agencyId = 1;
  const caseId = 2;
  const userId = 3;
  const attachmentId = 4;

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
  let errorMessage;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    responseBody = [
      {
        id: attachmentId,
        title: 'This is PNG attachment ',
        description: 'this is a description',
        fileName: 'This is a file name1',
        fileSize: '20KB',
        fileURL:
          'https://cyberdyne-dev.s3.amazonaws.com/agency_1/cases/case_8/attachments/22_11_18_1_17_49.pdf',
        contentType: 'PDF',
        createdBy: {
          id: userId,
          firstName: 'John',
          lastName: 'Doe',
        },
        updatedBy: {
          id: userId,
          firstName: 'John',
          lastName: 'Doe',
        },
        createdAt: '2019-03-01T09:24:14.642Z',
        updatedAt: '2019-03-01T09:24:14.642Z',
      },
    ];

    request = httpMocks.createRequest({
      method: 'GET',
      url: '/xerce/cases/2/attachments/',
      swagger: {
        params: {
          caseId: {
            value: caseId,
          },
          attachmentId: {
            value: attachmentId,
          },
        },
      },
      user,
    });

    response = httpMocks.createResponse();

    errorMessage = 'Error occurred while fetching case attachments';
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 with case attachments details', async () => {
    sandbox
      .stub(XerceCaseAttachmentService.prototype, 'getAll')
      .withArgs(agencyId, caseId)
      .returns([...responseBody]);

    await getAll(request, response);

    expect(response.statusCode).to.equal(200);
    expect(JSON.parse(response._getData())).to.deep.equal(
      responseBody,
      'response body did not match'
    );
  });

  it('Should return status code 400', async () => {
    sandbox
      .stub(XerceCaseAttachmentService.prototype, 'getAll')
      .withArgs(agencyId, caseId)
      .throws(
        new AppError('Error occurred while fetching case attachments', 400)
      );

    await getAll(request, response);

    expect(response.statusCode).to.equal(400);
    expect(JSON.parse(response._getData())).to.deep.equal(
      { message: errorMessage },
      'response body did not match'
    );
  });
});

describe('xerceCaseAttachment Controller: Create Case Attachment', () => {
  let sandbox;
  const agencyId = 1;
  const caseId = 2;
  const userId = 3;
  const attachmentId = 4;

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
  let requestBody;
  let request;
  let errorMessage;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    requestBody = {
      attachments: [
        {
          title: 'This is PNG attachment ',
          description: 'this is a description',
          fileName: 'This is a file name1',
          fileSize: '20KB',
          fileURL:
            'https://cyberdyne-dev.s3.amazonaws.com/agency_1/staging/cases/22_11_18_1_17_49.pdf',
        },
      ],
    };

    responseBody = [
      {
        id: attachmentId,
        title: 'This is PNG attachment ',
        description: 'this is a description',
        fileName: 'This is a file name1',
        fileSize: '20KB',
        fileURL:
          'https://cyberdyne-dev.s3.amazonaws.com/agency_1/cases/case_8/attachments/22_11_18_1_17_49.pdf',
        contentType: 'PDF',
        createdBy: {
          id: userId,
          firstName: 'John',
          lastName: 'Doe',
        },
        updatedBy: {
          id: userId,
          firstName: 'John',
          lastName: 'Doe',
        },
        createdAt: '2019-03-01T09:24:14.642Z',
        updatedAt: '2019-03-01T09:24:14.642Z',
      },
    ];

    request = httpMocks.createRequest({
      method: 'POST',
      url: '/xerce/cases/2/attachments/',
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

    errorMessage = 'Error occurred while fetching case attachments';
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 with case attachments details', async () => {
    sandbox
      .stub(XerceCaseAttachmentService.prototype, 'create')
      .withArgs(agencyId, caseId)
      .returns([...responseBody]);

    await create(request, response);

    expect(response.statusCode).to.equal(200);
    expect(JSON.parse(response._getData())).to.deep.equal(
      responseBody,
      'response body did not match'
    );
  });

  it('Should return status code 400', async () => {
    sandbox
      .stub(XerceCaseAttachmentService.prototype, 'create')
      .withArgs(agencyId, caseId)
      .throws(
        new AppError('Error occurred while fetching case attachments', 400)
      );

    await create(request, response);

    expect(response.statusCode).to.equal(400);
    expect(JSON.parse(response._getData())).to.deep.equal(
      { message: errorMessage },
      'response body did not match'
    );
  });
});

describe('xerceCaseAttachment Controller: Edit Case Attachment', () => {
  let sandbox;
  const agencyId = 1;
  const caseId = 2;
  const userId = 3;
  const attachmentId = 4;

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
  let requestBody;
  let request;
  let errorMessage;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    requestBody = {
      attachments: [
        {
          attachmentId,
          title: 'This is PNG attachment ',
          description: 'This is a description',
        },
      ],
    };

    responseBody = [
      {
        id: attachmentId,
        title: 'This is PNG attachment ',
        description: 'this is a description',
        fileName: 'This is a file name1',
        fileSize: '20KB',
        fileURL:
          'https://cyberdyne-dev.s3.amazonaws.com/agency_1/cases/case_8/attachments/22_11_18_1_17_49.pdf',
        contentType: 'PDF',
        createdBy: {
          id: userId,
          firstName: 'John',
          lastName: 'Doe',
        },
        updatedBy: {
          id: userId,
          firstName: 'John',
          lastName: 'Doe',
        },
        createdAt: '2019-03-01T09:24:14.642Z',
        updatedAt: '2019-03-01T09:24:14.642Z',
      },
    ];

    request = httpMocks.createRequest({
      method: 'PUT',
      url: '/xerce/cases/2/attachments/',
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

    errorMessage = 'Error occurred while editing case attachments';
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 with case attachments details', async () => {
    sandbox
      .stub(XerceCaseAttachmentService.prototype, 'edit')
      .withArgs(agencyId, caseId)
      .returns([...responseBody]);

    await edit(request, response);

    expect(response.statusCode).to.equal(200);
    expect(JSON.parse(response._getData())).to.deep.equal(
      responseBody,
      'response body did not match'
    );
  });

  it('Should return status code 400', async () => {
    sandbox
      .stub(XerceCaseAttachmentService.prototype, 'edit')
      .withArgs(agencyId, caseId)
      .throws(
        new AppError('Error occurred while editing case attachments', 400)
      );

    await edit(request, response);

    expect(response.statusCode).to.equal(400);
    expect(JSON.parse(response._getData())).to.deep.equal(
      { message: errorMessage },
      'response body did not match'
    );
  });
});
