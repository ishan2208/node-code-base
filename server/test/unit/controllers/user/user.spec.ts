import 'mocha';

import { expect } from 'chai';
import * as httpMocks from 'node-mocks-http';
import * as sinon from 'sinon';

import {
  deleteDigitalSignature,
  editProfile,
  getProfile,
  resetPassword,
  updateDigitalSignature,
  updateSignature,
} from '../../../../api/controllers/user/user';
import { AppError } from '../../../../api/errors';
import UserService from '../../../../api/service/user/user';

describe('User Controller: getProfile method', () => {
  let sandbox;
  let request;
  let response;
  let userProfile: IUserProfile;
  const agencyId = 1;
  const errorMessage = 'Error occurred while fetching user profile';

  const user: IAgencyUserClaim | ISuperAdminClaim = {
    id: 1,
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

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    userProfile = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@comcate.com',
      phone: '9999888800',
      title: 'CEO',
      department: 'IT',
      signature: 'johnDoe',
      signatureFileURL:
        'https://cyberdyne-dev.s3.amazonaws.com/agency_1/agency_config/download.jpeg',
    };

    request = httpMocks.createRequest({
      method: 'GET',
      url: '/users/profile',
      swagger: {
        params: {},
      },
      user,
    });

    response = httpMocks.createResponse();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return the user profile', async () => {
    sandbox
      .stub(UserService.prototype, 'getProfile')
      .withArgs(agencyId, userProfile.id)
      .resolves(Object.assign({}, userProfile));

    await getProfile(request, response);

    expect(response.statusCode).to.equal(200);
    expect(JSON.parse(response._getData())).to.deep.equal(
      userProfile,
      'response body did not match'
    );
  });

  it('Should return status code 400 with error message', async () => {
    sandbox
      .stub(UserService.prototype, 'getProfile')
      .withArgs(agencyId, userProfile.id)
      .throws(new AppError('Error occurred while fetching user profile', 400));

    await getProfile(request, response);

    expect(response.statusCode).to.equal(400);
    expect(JSON.parse(response._getData())).to.deep.equal(
      { message: errorMessage },
      'response body did not match'
    );
  });
});

describe('User Controller: editProfile method', () => {
  let sandbox;
  let request;
  let response;
  let userProfile: IUserProfile;
  let editRequest: IUserProfileEditRequest;
  const agencyId = 1;
  const errorMessage = 'Error occurred while editing user profile';

  const user: IAgencyUserClaim | ISuperAdminClaim = {
    id: 1,
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

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    editRequest = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@comcate.com',
      phone: '9999888800',
      title: 'CEO',
      department: 'IT',
    };

    userProfile = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@comcate.com',
      phone: '9999888800',
      title: 'CEO',
      department: 'IT',
      signature: 'johnDoe',
      signatureFileURL:
        'https://cyberdyne-dev.s3.amazonaws.com/agency_1/agency_config/download.jpeg',
    };

    request = httpMocks.createRequest({
      method: 'PUT',
      url: '/users/profile',
      swagger: {
        params: {
          body: {
            value: editRequest,
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

  it('should return the updated user profile', async () => {
    sandbox
      .stub(UserService.prototype, 'editProfile')
      .withArgs(agencyId, userProfile.id, editRequest)
      .resolves(Object.assign({}, userProfile));

    await editProfile(request, response);

    expect(response.statusCode).to.equal(200);
    expect(JSON.parse(response._getData())).to.deep.equal(
      userProfile,
      'response body did not match'
    );
  });

  it('Should return status code 400 with error message', async () => {
    sandbox
      .stub(UserService.prototype, 'editProfile')
      .withArgs(agencyId, userProfile.id, editRequest)
      .throws(new AppError('Error occurred while editing user profile', 400));

    await editProfile(request, response);

    expect(response.statusCode).to.equal(400);
    expect(JSON.parse(response._getData())).to.deep.equal(
      { message: errorMessage },
      'response body did not match'
    );
  });
});

describe('User Controller: resetPassword method', () => {
  let sandbox;
  let request;
  let response;
  let userProfile: IUserProfile;
  let resetPasswordRequest: IResetPasswordRequest;
  const agencyId = 1;
  let responseBody;
  const errorMessage = 'Error occurred while updating the password';

  const user: IAgencyUserClaim | ISuperAdminClaim = {
    id: 1,
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

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    resetPasswordRequest = {
      old: 'test@123',
      new: 'Hello@world',
    };

    userProfile = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@comcate.com',
      phone: '9999888800',
      title: 'CEO',
      department: 'IT',
      signature: 'johnDoe',
      signatureFileURL:
        'https://cyberdyne-dev.s3.amazonaws.com/agency_1/agency_config/download.jpeg',
    };

    request = httpMocks.createRequest({
      method: 'PUT',
      url: '/users/profile/reset-password',
      swagger: {
        params: {
          body: {
            value: resetPasswordRequest,
          },
        },
      },
      user,
    });

    responseBody = { response: 'ok' };

    response = httpMocks.createResponse();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return the success response', async () => {
    sandbox
      .stub(UserService.prototype, 'resetPassword')
      .withArgs(agencyId, userProfile.id, resetPasswordRequest)
      .resolves(Object.assign({}, responseBody));

    await resetPassword(request, response);

    expect(response.statusCode).to.equal(200);
    expect(JSON.parse(response._getData())).to.deep.equal(
      responseBody,
      'response body did not match'
    );
  });

  it('Should return status code 400 with error message', async () => {
    sandbox
      .stub(UserService.prototype, 'editProfile')
      .withArgs(agencyId, userProfile.id, resetPasswordRequest)
      .throws(new AppError('Error occurred while updating the password', 400));

    await editProfile(request, response);

    expect(response.statusCode).to.equal(400);
    expect(JSON.parse(response._getData())).to.deep.equal(
      { message: errorMessage },
      'response body did not match'
    );
  });
});

describe('User Controller: updateSignature method', () => {
  let sandbox;
  let request;
  let response;
  const userId = 1;
  let signature: string;
  const agencyId = 1;
  let responseBody;

  const user: IAgencyUserClaim | ISuperAdminClaim = {
    id: 1,
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

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    signature = 'johnDoe';
    request = httpMocks.createRequest({
      method: 'PUT',
      url: '/users/profile/signature',
      swagger: {
        params: {
          body: {
            value: { signature },
          },
        },
      },
      user,
    });

    responseBody = { signature };

    response = httpMocks.createResponse();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return the success response', async () => {
    sandbox
      .stub(UserService.prototype, 'updateSignature')
      .withArgs(agencyId, userId, signature)
      .resolves(Object.assign({}, responseBody));

    await updateSignature(request, response);

    expect(response.statusCode).to.equal(200);
    expect(JSON.parse(response._getData())).to.deep.equal(
      responseBody,
      'response body did not match'
    );
  });
});

describe('User Controller: updateDigitalSignature method', () => {
  let sandbox;
  let request;
  let deleteRequest;
  let deleteResponseBody;
  let response;
  const userId = 1;
  let signatureURL: string;
  const agencyId = 1;
  let responseBody;

  const user: IAgencyUserClaim | ISuperAdminClaim = {
    id: 1,
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

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    signatureURL =
      'https://cyberdyne-dev.s3.amazonaws.com/agency_1/agency_config/download.jpeg';

    request = httpMocks.createRequest({
      method: 'PUT',
      url: '/users/profile/digital-signature',
      swagger: {
        params: {
          body: {
            value: { signatureURL },
          },
        },
      },
      user,
    });

    deleteRequest = httpMocks.createRequest({
      method: 'DELETE',
      url: '/users/profile/digital-signature',
      swagger: {
        params: {
          body: {
            value: { signatureURL },
          },
        },
      },
      user,
    });

    responseBody = { signatureURL };
    deleteResponseBody = {
      message: 'OK',
    };
    response = httpMocks.createResponse();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return the success response', async () => {
    sandbox
      .stub(UserService.prototype, 'updateDigitalSignature')
      .withArgs(agencyId, userId, signatureURL)
      .resolves(signatureURL);

    await updateDigitalSignature(request, response);

    expect(response.statusCode).to.equal(200);
    expect(JSON.parse(response._getData())).to.deep.equal(
      responseBody,
      'response body did not match'
    );
  });

  it('should return the success response after delete', async () => {
    sandbox
      .stub(UserService.prototype, 'deleteDigitalSignature')
      .withArgs(agencyId, userId, signatureURL)
      .resolves({});

    await deleteDigitalSignature(deleteRequest, response);

    expect(response.statusCode).to.equal(200);
    expect(JSON.parse(response._getData())).to.deep.equal(
      deleteResponseBody,
      'response body did not match'
    );
  });
});
