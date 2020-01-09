import 'mocha';

import * as bcrypt from 'bcrypt';
import { expect } from 'chai';
import * as sinon from 'sinon';

import db from '../../../../api/models';
import UserService from '../../../../api/service/user/user';

const userService = new UserService();

describe('User Service: getProfile method', () => {
  let sandbox;
  const agencyId = 1;
  const userId = 1;
  let userProfile: IUserProfile;
  let userInstance;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    userProfile = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      phone: '9999888800',
      email: 'john.doe@comcate.com',
      department: 'IT',
      title: 'CEO',
      signature: 'johnDoe',
      signatureFileURL:
        'https://cyberdyne-dev.s3.amazonaws.com/agency_1/agency_config/download.jpeg',
    };

    userInstance = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      phone: '9999888800',
      email: 'john.doe@comcate.com',
      department: 'IT',
      title: 'CEO',
      signature: 'johnDoe',
      signatureFileURL:
        'https://cyberdyne-dev.s3.amazonaws.com/agency_1/agency_config/download.jpeg',
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return the user profile', async () => {
    sandbox
      .stub(db.User, 'findOne')
      .withArgs({
        where: { id: userId, agencyId },
        attributes: [
          'id',
          'firstName',
          'lastName',
          'email',
          'phone',
          'department',
          'title',
          'signature',
          'signatureFileURL',
        ],
      })
      .resolves(userInstance);

    const result = await userService.getProfile(agencyId, userId);

    expect(result).to.deep.equal(userProfile);
  });

  it('should throw error for invalid user id', async () => {
    sandbox
      .stub(db.User, 'findOne')
      .withArgs({
        where: { id: userId, agencyId },
        attributes: [
          'id',
          'firstName',
          'lastName',
          'email',
          'phone',
          'department',
          'title',
          'signature',
          'signatureFileURL',
        ],
      })
      .resolves(null);

    await userService
      .getProfile(agencyId, userId)
      .catch(err => expect(err.name).to.equal('DBMissingEntityError'));
  });

  it('should throw error while getting user profile', async () => {
    sandbox
      .stub(db.User, 'findOne')
      .withArgs({
        where: { id: userId, agencyId },
        attributes: [
          'id',
          'firstName',
          'lastName',
          'email',
          'phone',
          'department',
          'title',
          'signature',
          'signatureFileURL',
        ],
      })
      .throws('Error');

    await userService
      .getProfile(agencyId, userId)
      .catch(err => expect(err.name).to.equal('InternalServerError'));
  });
});

describe('User Service: editProfile method', () => {
  let sandbox;
  const agencyId = 1;
  const userId = 1;
  let userProfile: IUserProfile;
  let userInstance;
  let userprofileEditReq: IUserProfileEditRequest;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    userprofileEditReq = {
      firstName: 'John',
      lastName: 'Doe',
      phone: '9999888800',
      email: 'john.doe@comcate.com',
      department: 'IT',
      title: 'CEO',
    };

    userProfile = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      phone: '9999888800',
      email: 'john.doe@comcate.com',
      department: 'IT',
      title: 'CEO',
      signature: 'joenDoe',
      signatureFileURL:
        'https://cyberdyne-dev.s3.amazonaws.com/agency_1/agency_config/download.jpeg',
    };

    userInstance = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      phone: '9999888800',
      email: 'john.doe@comcate.com',
      department: 'IT',
      title: 'CEO',
      save: () => Promise.resolve(),
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return the user profile', async () => {
    sandbox
      .stub(db.User, 'findOne')
      .withArgs({
        where: { agencyId, id: userId },
        attributes: [
          'id',
          'firstName',
          'lastName',
          'email',
          'phone',
          'department',
          'title',
        ],
      })
      .resolves(userInstance);

    sandbox.stub(UserService.prototype, 'getProfile').resolves(userProfile);

    const result = await userService.editProfile(
      agencyId,
      userId,
      userprofileEditReq
    );

    expect(result).to.deep.equal(userProfile);
  });

  it('should throw error for invalid user id', async () => {
    sandbox
      .stub(db.User, 'findOne')
      .withArgs({
        where: { id: userId, agencyId },
        attributes: [
          'id',
          'firstName',
          'lastName',
          'email',
          'phone',
          'department',
          'title',
        ],
      })
      .resolves(null);

    await userService
      .editProfile(agencyId, userId, userprofileEditReq)
      .catch(err => expect(err.name).to.equal('DBMissingEntityError'));
  });

  it('should throw error while getting user profile', async () => {
    sandbox
      .stub(db.User, 'findOne')
      .withArgs({
        where: { id: userId, agencyId },
        attributes: [
          'id',
          'firstName',
          'lastName',
          'email',
          'phone',
          'department',
          'title',
        ],
      })
      .throws('Error');

    await userService
      .editProfile(agencyId, userId, userprofileEditReq)
      .catch(err => expect(err.name).to.equal('Error'));
  });

  it('should throw error while updating user profile', async () => {
    userInstance = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      phone: '9999888800',
      email: 'john.doe@comcate.com',
      department: 'IT',
      title: 'CEO',
      save: () => Promise.reject({ name: 'InternalServerError' }),
    };

    sandbox
      .stub(db.User, 'findOne')
      .withArgs({
        where: { id: userId, agencyId },
        attributes: [
          'id',
          'firstName',
          'lastName',
          'email',
          'phone',
          'department',
          'title',
        ],
      })
      .resolves(userInstance);

    await userService
      .editProfile(agencyId, userId, userprofileEditReq)
      .catch(err => expect(err.name).to.equal('InternalServerError'));
  });

  it('should throw conflict error while updating user profile', async () => {
    userInstance = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      phone: '9999888800',
      email: 'john.doe@comcate.com',
      department: 'IT',
      title: 'CEO',
      save: () => Promise.reject({ name: 'SequelizeUniqueConstraintError' }),
    };

    sandbox
      .stub(db.User, 'findOne')
      .withArgs({
        where: { id: userId, agencyId },
        attributes: [
          'id',
          'firstName',
          'lastName',
          'email',
          'phone',
          'department',
          'title',
        ],
      })
      .resolves(userInstance);

    await userService
      .editProfile(agencyId, userId, userprofileEditReq)
      .catch(err => expect(err.name).to.equal('DBConflictError'));
  });
});

describe('User Service: resetPassword method', () => {
  let sandbox;
  const agencyId = 1;
  const userId = 1;
  let userInstance;
  const newPasswordHash = 'hhjasdh.837483.hjdjkhdkj.kdwed/kjewdewhjk';
  let resetPasswordRequest: IResetPasswordRequest;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    resetPasswordRequest = {
      old: 'test@123',
      new: 'Hello@123',
    };

    userInstance = {
      id: 1,
      password: 'qwertyiuytghghdghjdgjh.12h.jkdjkhkjwfkhwfhj',
      save: () => Promise.resolve(),
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return the success response', async () => {
    sandbox
      .stub(db.User, 'findOne')
      .withArgs({
        where: { id: userId, agencyId },
        attributes: ['id', 'password'],
      })
      .resolves(userInstance);

    sandbox
      .stub(bcrypt, 'compareSync')
      .withArgs(resetPasswordRequest.old, userInstance.password)
      .resolves(true);

    sandbox
      .stub(bcrypt, 'hashSync')
      .withArgs(resetPasswordRequest.new, 10)
      .resolves(newPasswordHash);

    await userService
      .resetPassword(agencyId, userId, resetPasswordRequest)
      .catch(err => expect(err.name).to.equal('Error'));
  });

  it('should throw error while updating password', async () => {
    userInstance = {
      id: 1,
      password: 'qwertyiuytghghdghjdgjh.12h.jkdjkhkjwfkhwfhj',
      save: () => Promise.reject({ name: 'InternalServerError' }),
    };

    sandbox
      .stub(db.User, 'findOne')
      .withArgs({
        where: { id: userId, agencyId },
        attributes: ['id', 'password'],
      })
      .resolves(userInstance);

    sandbox
      .stub(bcrypt, 'compareSync')
      .withArgs(resetPasswordRequest.old, userInstance.password)
      .returns(true);

    sandbox
      .stub(bcrypt, 'hashSync')
      .withArgs(resetPasswordRequest.new, 10)
      .returns(newPasswordHash);

    await userService
      .resetPassword(agencyId, userId, resetPasswordRequest)
      .catch(err => expect(err.name).to.equal('InternalServerError'));
  });

  it('should throw error while fetching user', async () => {
    sandbox
      .stub(db.User, 'findOne')
      .withArgs({
        where: { id: userId, agencyId },
        attributes: ['id', 'password'],
      })
      .throws('Error');

    await userService
      .resetPassword(agencyId, userId, resetPasswordRequest)
      .catch(err => expect(err.name).to.equal('InternalServerError'));
  });

  it('should throw error for incorrect old password', async () => {
    sandbox
      .stub(db.User, 'findOne')
      .withArgs({
        where: { id: userId, agencyId },
        attributes: ['id', 'password'],
      })
      .resolves(userInstance);

    sandbox
      .stub(bcrypt, 'compareSync')
      .withArgs(resetPasswordRequest.old, userInstance.password)
      .returns(false);

    await userService
      .resetPassword(agencyId, userId, resetPasswordRequest)
      .catch(err => expect(err.name).to.equal('InvalidRequestError'));
  });

  it('should throw error for invalid user id', async () => {
    sandbox
      .stub(db.User, 'findOne')
      .withArgs({
        where: { id: userId, agencyId },
        attributes: ['id', 'password'],
      })
      .resolves(null);

    await userService
      .resetPassword(agencyId, userId, resetPasswordRequest)
      .catch(err => expect(err.name).to.equal('DBMissingEntityError'));
  });
});

describe('User Service: updateSignature method', () => {
  let sandbox;
  const agencyId = 1;
  const userId = 1;
  let signature: string;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    signature = 'johnDoe';
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return the success response', async () => {
    sandbox
      .stub(db.User, 'update')
      .withArgs({
        where: { id: userId, agencyId },
      })
      .resolves({});

    await userService
      .updateSignature(agencyId, userId, signature)
      .catch(err => expect(err.name).to.equal('Error'));
  });
});

describe('User Service: updateDigitalSignature method', () => {
  let sandbox;
  const agencyId = 1;
  const userId = 1;
  let signatureURL: string;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    signatureURL =
      'https://cyberdyne-dev.s3.amazonaws.com/agency_1/agency_config/download.jpeg';
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return the success response', async () => {
    sandbox
      .stub(db.User, 'update')
      .withArgs({
        where: { id: userId, agencyId },
      })
      .resolves({});

    const result = await userService.updateDigitalSignature(
      agencyId,
      userId,
      signatureURL
    );
    expect(result).to.deep.equal(signatureURL);
  });
});
