import { expect } from 'chai';
import 'mocha';
import { fn as momentProto } from 'moment';
import * as sinon from 'sinon';
import * as unroll from 'unroll';

import db from '../../../../api/models';
import UserService from '../../../../api/service/user/user';
import XerceCaseListingService from '../../../../api/service/xerce/caseListing';
import XerceCaseHistoryService from '../../../../api/service/xerce/xerceCaseHistory';
import XerceCaseInspectionService from '../../../../api/service/xerce/xerceCaseInspection';
import XerceCaseNoteService from '../../../../api/service/xerce/xerceCaseNote';
import XerceCaseViolationService from '../../../../api/service/xerce/xerceCaseViolation';
import DBUtil from '../../../../api/utils/dbUtil';

const xerceCaseInspectionService = new XerceCaseInspectionService();
unroll.use(it);

describe('XerceCaseInspection service: create method', () => {
  let sandbox;
  let inspectionInsertResponse;
  let inspectionObj;
  let inspectionRequest: IInspectionRequest;
  let transaction;
  const agencyId = 1;
  const xerceCaseId = 1;
  const createdById = 1;
  const assigneeId = 1;
  const inspectionStatus = InspectionStatus.SCHEDULED;
  const isVerificationInspection = true;
  const inspectionPlannedDate = new Date('2018-04-27T06:38:16.606Z');
  const violationTypeIds = [2, 3];

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    inspectionInsertResponse = {
      attachmentIds: [],
      id: 23,
      agencyId,
      xerceCaseId,
      plannedDate: inspectionPlannedDate,
      assigneeId,
      isVerificationInspection: true,
      status: inspectionStatus,
      createdBy: createdById,
      updatedAt: '2019-02-26T21:36:38.744Z',
      createdAt: '2019-02-26T21:36:38.744Z',
      actualDate: null,
      noteId: null,
      noticeId: null,
      updatedBy: null,
    };

    inspectionObj = {
      agencyId,
      xerceCaseId,
      plannedDate: inspectionPlannedDate,
      assigneeId,
      isVerificationInspection,
      status: inspectionStatus,
      createdBy: createdById,
    };

    inspectionRequest = {
      assigneeId,
      plannedDate: inspectionPlannedDate,
    };

    transaction = sinon.stub();
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 with inspection details', async () => {
    sandbox
      .stub(XerceCaseViolationService.prototype, 'getCaseViolationTypeIds')
      .withArgs(agencyId, xerceCaseId)
      .resolves(violationTypeIds);

    sandbox
      .stub(XerceCaseInspectionService.prototype, 'validateInspectionRequest')
      .withArgs(agencyId, assigneeId, inspectionPlannedDate);

    sandbox
      .stub(XerceCaseInspectionService.prototype, 'createInspectionObj')
      .withArgs(
        agencyId,
        xerceCaseId,
        createdById,
        isVerificationInspection,
        inspectionStatus,
        inspectionRequest
      )
      .resolves(inspectionObj);

    sandbox
      .stub(db.XerceCaseInspection, 'create')
      .resolves(inspectionInsertResponse);

    await xerceCaseInspectionService.create(
      agencyId,
      xerceCaseId,
      createdById,
      inspectionRequest,
      isVerificationInspection,
      transaction
    );
  });

  it('Should throws DBMissingEntityError exception', async () => {
    sandbox
      .stub(XerceCaseViolationService.prototype, 'getCaseViolationTypeIds')
      .withArgs(agencyId, xerceCaseId)
      .resolves(violationTypeIds);

    sandbox
      .stub(XerceCaseInspectionService.prototype, 'validateInspectionRequest')
      .withArgs(agencyId, assigneeId, inspectionPlannedDate);

    sandbox
      .stub(XerceCaseInspectionService.prototype, 'createInspectionObj')
      .withArgs(
        agencyId,
        xerceCaseId,
        createdById,
        isVerificationInspection,
        inspectionStatus,
        inspectionRequest
      )
      .returns(inspectionObj);

    sandbox
      .stub(db.XerceCaseInspection, 'create')
      .withArgs(inspectionObj, { transaction })
      .throws({ name: 'DBMissingEntityError' });

    await xerceCaseInspectionService
      .create(
        agencyId,
        xerceCaseId,
        createdById,
        inspectionRequest,
        isVerificationInspection,
        transaction
      )
      .catch(err => {
        expect(err.name).to.deep.equal('DBConflictError');
      });
  });

  it('Should throws an exception error', async () => {
    sandbox
      .stub(XerceCaseViolationService.prototype, 'getCaseViolationTypeIds')
      .withArgs(agencyId, xerceCaseId)
      .resolves(violationTypeIds);

    sandbox
      .stub(XerceCaseInspectionService.prototype, 'validateInspectionRequest')
      .withArgs(agencyId, assigneeId, inspectionPlannedDate);

    sandbox
      .stub(XerceCaseInspectionService.prototype, 'createInspectionObj')
      .withArgs(
        agencyId,
        xerceCaseId,
        createdById,
        isVerificationInspection,
        inspectionStatus,
        inspectionRequest
      )
      .returns(inspectionObj);

    sandbox
      .stub(db.XerceCaseInspection, 'create')
      .withArgs(inspectionObj, { transaction })
      .throws({ name: 'Error' });

    await xerceCaseInspectionService
      .create(
        agencyId,
        xerceCaseId,
        createdById,
        inspectionRequest,
        isVerificationInspection,
        transaction
      )
      .catch(err => {
        expect(err.name).to.deep.equal('InternalServerError');
        expect(err.message).to.deep.equal(
          'Something went wrong. Please try again later.'
        );
      });
  });
});

describe('XerceCaseInspection service: get method', () => {
  const agencyId = 1;
  const xerceCaseId = 1;
  const inspectionId = 1;
  let sandbox;
  let inspectionQueryResponse;
  let inspectionResponseObj;
  let errorMessage;
  let transaction;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    inspectionQueryResponse = {
      id: 1,
      agencyId,
      xerceCaseId,
      plannedDate: '2019-08-30T17:12:23.561Z',
      actualDate: null,
      assigneeId: 1,
      noteId: null,
      attachmentIds: [],
      noticeId: null,
      status: 'SCHEDULED',
      isVerificationInspection: true,
      createdBy: 1,
      updatedBy: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
      },
      createdAt: '2019-02-14T10:54:16.905Z',
      updatedAt: '2019-02-14T10:54:16.905Z',
      caseAssignee: {
        id: 1,
        agencyId: 1,
        email: 'John.doe@alabama.com',
        password:
          '$2b$10$4NKfTlIbH2J/vI185B42QO3L0e11g65Ibd/JDCTtmGj/wkxKgvyOO',
        firstName: 'John',
        lastName: 'Doe',
        phone: '12345161',
        title: 'manager',
        department: 'IT',
        isSiteAdmin: true,
        isWelcomeEmailSent: true,
        emailToken: 'oo7aer6jbkca07eh56fyqxr99qz47z0r',
        emailTokenExpiry: '2019-02-14T11:44:05.757Z',
        lastLogin: null,
        isActive: true,
        createdAt: '2019-02-14T10:54:05.830Z',
        updatedAt: '2019-02-14T10:54:05.830Z',
        deletedAt: null,
      },
    };

    inspectionResponseObj = {
      id: 1,
      name: 'Verification Inspection',
      dueDate: '2019-08-30T17:12:23.561Z',
      assignee: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
      },
    };

    errorMessage = 'Could not find the Inspection.';

    transaction = sinon.stub();
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 with case inspection details', async () => {
    sandbox
      .stub(db.XerceCaseInspection, 'findOne')
      .withArgs({
        where: { id: inspectionId, xerceCaseId, agencyId },
        include: [
          {
            model: db.User,
            as: 'inspectionAssignee',
          },
          {
            model: db.User,
            as: 'createdByUser',
            attributes: ['id', 'firstName', 'lastName'],
          },
          {
            model: db.User,
            as: 'updatedByUser',
            attributes: ['id', 'firstName', 'lastName'],
          },
        ],
        transaction,
      })
      .resolves(inspectionQueryResponse);

    sandbox
      .stub(XerceCaseInspectionService.prototype, 'createCaseInspectionRespObj')
      .withArgs(inspectionQueryResponse)
      .resolves(inspectionResponseObj);

    const result = await xerceCaseInspectionService.get(
      agencyId,
      xerceCaseId,
      inspectionId,
      transaction
    );

    expect(result).to.deep.equal(
      inspectionResponseObj,
      'response did not match'
    );
  });

  it('Should return status code 400 with case inspection not found', async () => {
    sandbox
      .stub(db.XerceCaseInspection, 'findOne')
      .withArgs({
        where: { id: inspectionId, xerceCaseId, agencyId },
        include: [
          {
            model: db.User,
            as: 'inspectionAssignee',
          },
          {
            model: db.User,
            as: 'createdByUser',
            attributes: ['id', 'firstName', 'lastName'],
          },
          {
            model: db.User,
            as: 'updatedByUser',
            attributes: ['id', 'firstName', 'lastName'],
          },
        ],
        transaction,
      })
      .resolves(null);

    await xerceCaseInspectionService
      .get(agencyId, xerceCaseId, inspectionId, transaction)
      .catch(err => {
        expect(err.name).to.deep.equal('DBMissingEntityError');
        expect(err.message).to.deep.equal(errorMessage);
      });
  });

  it('Should return status code 400 with internal error', async () => {
    sandbox
      .stub(db.XerceCaseInspection, 'findOne')
      .withArgs({
        where: { id: inspectionId, xerceCaseId, agencyId },
        include: [
          {
            model: db.User,
            as: 'inspectionAssignee',
          },
          {
            model: db.User,
            as: 'createdByUser',
            attributes: ['id', 'firstName', 'lastName'],
          },
          {
            model: db.User,
            as: 'updatedByUser',
            attributes: ['id', 'firstName', 'lastName'],
          },
        ],
        transaction,
      })
      .throws({ name: 'InternalServerError' });

    await xerceCaseInspectionService
      .get(agencyId, xerceCaseId, inspectionId, transaction)
      .catch(err => {
        expect(err.name).to.deep.equal('InternalServerError');
      });
  });
});

describe('XerceCaseInspection service: getAll method', () => {
  const agencyId = 1;
  const xerceCaseId = 1;
  let sandbox;
  let inspectionQueryResponse;
  let inspection;
  let inspectionResponse;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    inspection = {
      id: 1,
      agencyId,
      xerceCaseId,
      plannedDate: '2019-08-30T17:12:23.561Z',
      actualDate: null,
      assigneeId: 1,
      noteId: null,
      attachmentIds: [],
      noticeId: null,
      status: 'SCHEDULED',
      isVerificationInspection: true,
      createdBy: 1,
      updatedBy: null,
      createdAt: '2019-02-14T10:54:16.905Z',
      updatedAt: '2019-02-14T10:54:16.905Z',
      caseAssignee: {
        id: 1,
        agencyId: 1,
        email: 'John.doe@alabama.com',
        password:
          '$2b$10$4NKfTlIbH2J/vI185B42QO3L0e11g65Ibd/JDCTtmGj/wkxKgvyOO',
        firstName: 'John',
        lastName: 'Doe',
        phone: '12345161',
        title: 'manager',
        department: 'IT',
        isSiteAdmin: true,
        isWelcomeEmailSent: true,
        emailToken: 'oo7aer6jbkca07eh56fyqxr99qz47z0r',
        emailTokenExpiry: '2019-02-14T11:44:05.757Z',
        lastLogin: null,
        isActive: true,
        createdAt: '2019-02-14T10:54:05.830Z',
        updatedAt: '2019-02-14T10:54:05.830Z',
        deletedAt: null,
      },
    };

    inspectionQueryResponse = [inspection];

    inspectionResponse = {
      id: 1,
      name: 'Verification Inspection',
      dueDate: '2019-08-30T17:12:23.561Z',
      assignee: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
      },
    };
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 with case inspection details', async () => {
    sandbox.stub(db.XerceCaseInspection, 'findAll').resolves([inspection]);

    sandbox
      .stub(XerceCaseInspectionService.prototype, 'createCaseInspectionRespObj')
      .withArgs(inspection)
      .resolves(inspectionResponse);

    sandbox.stub(Array.prototype, 'map').returns([inspectionResponse]);

    const result = await xerceCaseInspectionService.getAll(
      agencyId,
      xerceCaseId
    );

    expect(result).to.deep.equal(
      [inspectionResponse],
      'response did not match'
    );
  });

  it('Should return status code 200 with an empty array', async () => {
    sandbox.stub(db.XerceCaseInspection, 'findAll').resolves([]);

    sandbox
      .stub(XerceCaseInspectionService.prototype, 'createCaseInspectionRespObj')
      .withArgs(inspectionQueryResponse)
      .resolves([]);

    const result = await xerceCaseInspectionService.getAll(
      agencyId,
      xerceCaseId
    );

    expect(result).to.deep.equal([], 'response did not match');
  });

  it('Should return status code 400 with internal error', async () => {
    sandbox
      .stub(db.XerceCaseInspection, 'findAll')
      .throws({ name: 'InternalServerError' });

    await xerceCaseInspectionService
      .getAll(agencyId, xerceCaseId)
      .catch(err => {
        expect(err.name).to.deep.equal('InternalServerError');
        expect(err.message).to.deep.equal(
          'Something went wrong. Please try again later.'
        );
      });
  });
});

describe('XerceCaseInspection Service: createInspectionObj method', () => {
  let sandbox;
  let scheduledInspection: IXerceCaseInspectionAttributes;
  const agencyId = 1;
  const xerceCaseId = 3;
  const createdBy = 4;
  const assigneeId = 5;
  const isVerificationInspection = true;
  const inspectionPlannedDate = new Date('2018-04-27T06:38:16.606Z');
  const status = InspectionStatus.SCHEDULED;
  const inspectionRequest: IInspectionRequest = {
    assigneeId,
    plannedDate: inspectionPlannedDate,
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    scheduledInspection = {
      agencyId,
      xerceCaseId,
      plannedDate: new Date('2018-04-27T06:38:16.606Z'),
      assigneeId,
      isVerificationInspection,
      status,
      createdBy,
    };
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should create object with success', async () => {
    const result = (xerceCaseInspectionService as any).__proto__.createInspectionObj(
      agencyId,
      xerceCaseId,
      createdBy,
      isVerificationInspection,
      inspectionRequest
    );
    expect(result).to.deep.equal(
      scheduledInspection,
      'response body did not match'
    );
  });
});

describe('XerceCaseInspection Service: createCaseInspectionRespObj method', () => {
  let sandbox;
  let inspectionObj;
  let inspection;
  let noticeObj;
  const isVerificationInspection = true;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    inspectionObj = {
      id: 20,
      plannedDate: '2018-04-27T06:38:16.606Z',
      assigneeId: 10,
      isVerificationInspection,
      isNoNoticeChosen: false,
      inspectionAssignee: {
        id: 10,
        firstName: 'John',
        lastName: 'Doe',
      },
      closedByUser: null,
      closedAt: null,
      note: null,
      updatedAt: null,
      updatedByUser: null,
      createdByUser: {
        id: 10,
        firstName: 'John',
        lastName: 'Doe',
      },
      createdAt: new Date('2018-03-30T08:36:22.338Z'),
      notice: {
        id: 4,
        agencyId: 1,
        xerceCaseId: 2,
        configNoticeId: 3,
        issuedAt: new Date('2018-03-30T08:36:22.338Z'),
        noticeContent: '<p>This is a test</p>',
        mergedFields: {},
        noteId: 6,
        certifiedMailNumber: '1234567890',
        noticeNumber: '04',
        createdByUser: {
          id: 10,
          firstName: 'John',
          lastName: 'Doe',
        },
        configNotice: {
          id: 3,
          label: 'Court Notice',
          proposeForcedAbatement: false,
        },
        updatedBy: 3,
        createdAt: new Date('2018-03-30T08:36:22.338Z'),
        updatedAt: new Date('2018-03-30T08:36:22.338Z'),
      },
    };

    noticeObj = {
      id: 4,
      noticeContent: '<p>This is a test</p>',
      issuedAt: new Date('2018-03-30T08:36:22.338Z'),
      mergedFields: {},
      certifiedMailNumber: '1234567890',
      noticeNumber: '04',
      note: null,
      configNotice: {
        id: 3,
        label: 'Court Notice',
        proposeForcedAbatement: false,
      },
      createdBy: {
        id: 10,
        firstName: 'John',
        lastName: 'Doe',
      },
      updatedBy: null,
      createdAt: new Date('2018-03-30T08:36:22.338Z'),
      updatedAt: null,
    };

    inspection = {
      id: 20,
      name: 'Verification Inspection',
      dueDate: '2018-04-27T06:38:16.606Z',
      assignee: {
        id: 10,
        firstName: 'John',
        lastName: 'Doe',
      },
      note: null,
      isNoNoticeChosen: false,
      notice: noticeObj,
      closedBy: null,
      closedAt: null,
      updatedAt: null,
      updatedBy: null,
      createdBy: {
        id: 10,
        firstName: 'John',
        lastName: 'Doe',
      },
      createdAt: new Date('2018-03-30T08:36:22.338Z'),
    };
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should create object successfully with isVerificationInspection equal true', async () => {
    const result = (xerceCaseInspectionService as any).__proto__.createCaseInspectionRespObj(
      inspectionObj
    );
    expect(result).to.deep.equal(inspection, 'response body did not match');
  });

  it('Should create object successfully with isVerificationInspection equal false', async () => {
    inspectionObj.isVerificationInspection = false;
    inspection.name = 'Follow-up Inspection';

    const result = (xerceCaseInspectionService as any).__proto__.createCaseInspectionRespObj(
      inspectionObj
    );
    expect(result).to.deep.equal(inspection, 'response body did not match');
  });
});

describe('XerceCaseInspection Service: validateInspectionRequest method', () => {
  let sandbox;
  const isValidCaseAssignee = true;
  const agencyId = 1;
  const assigneeId = 2;
  const plannedDate = '2018-04-27T06:38:16.606Z';

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should validate request with success', async () => {
    sandbox
      .stub(UserService.prototype, 'isValidAssignee')
      .resolves(isValidCaseAssignee);

    sandbox.stub(momentProto, 'isSameOrAfter').resolves(true);

    await (xerceCaseInspectionService as any).__proto__.validateInspectionRequest(
      agencyId,
      assigneeId,
      plannedDate
    );
  });

  it('Should validate request with error with invalid assignee', async () => {
    sandbox.stub(UserService.prototype, 'isValidAssignee').resolves(false);

    (xerceCaseInspectionService as any).__proto__
      .validateInspectionRequest(agencyId, assigneeId, plannedDate)
      .catch(err => {
        expect(err.name).to.deep.equal('InvalidRequestError');
        expect(err.message).to.deep.equal('Assignee does not exist.');
      });
  });

  it('Should valid request with error with invalid plannedDate', async () => {
    sandbox
      .stub(UserService.prototype, 'isValidAssignee')
      .resolves(isValidCaseAssignee);

    sandbox
      .stub(momentProto, 'isSameOrAfter')
      .withArgs('2018-05-27', 'day')
      .resolves(false);

    (xerceCaseInspectionService as any).__proto__
      .validateInspectionRequest(agencyId, assigneeId, plannedDate)
      .catch(err => {
        expect(err.name).to.deep.equal('InvalidRequestError');
        expect(err.message).to.deep.equal(
          'Planned date should not be the past date'
        );
      });
  });
});

describe('XerceCaseInspection service: getInstance method', () => {
  const agencyId = 1;
  const xerceCaseId = 2;
  const inspectionId = 3;
  let sandbox;
  let xerceCaseInspection;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    xerceCaseInspection = {
      id: 1,
      agencyId,
      xerceCaseId,
      plannedDate: '2019-08-30T17:12:23.561Z',
      actualDate: null,
      assigneeId: 1,
      noteId: null,
      attachmentIds: [],
      noticeId: null,
      status: 'SCHEDULED',
      isVerificationInspection: true,
      createdBy: 1,
      updatedBy: null,
      createdAt: '2019-02-14T10:54:16.905Z',
      updatedAt: '2019-02-14T10:54:16.905Z',
      caseAssignee: {
        id: 1,
        agencyId: 1,
        email: 'John.doe@alabama.com',
        password:
          '$2b$10$4NKfTlIbH2J/vI185B42QO3L0e11g65Ibd/JDCTtmGj/wkxKgvyOO',
        firstName: 'John',
        lastName: 'Doe',
        phone: '12345161',
        title: 'manager',
        department: 'IT',
        isSiteAdmin: true,
        isWelcomeEmailSent: true,
        emailToken: 'oo7aer6jbkca07eh56fyqxr99qz47z0r',
        emailTokenExpiry: '2019-02-14T11:44:05.757Z',
        lastLogin: null,
        isActive: true,
        createdAt: '2019-02-14T10:54:05.830Z',
        updatedAt: '2019-02-14T10:54:05.830Z',
        deletedAt: null,
      },
      xerceCaseInspectionAssignee: {
        id: 1,
        agencyId: 1,
        email: 'John.doe@alabama.com',
        password:
          '$2b$10$4NKfTlIbH2J/vI185B42QO3L0e11g65Ibd/JDCTtmGj/wkxKgvyOO',
        firstName: 'John',
        lastName: 'Doe',
        phone: '12345161',
        title: 'manager',
        department: 'IT',
        isSiteAdmin: true,
        isWelcomeEmailSent: true,
        emailToken: 'oo7aer6jbkca07eh56fyqxr99qz47z0r',
        emailTokenExpiry: '2019-02-14T11:44:05.757Z',
        lastLogin: null,
        isActive: true,
        createdAt: '2019-02-14T10:54:05.830Z',
        updatedAt: '2019-02-14T10:54:05.830Z',
        deletedAt: null,
      },
      closedByUser: {
        id: 5,
        firstName: 'John',
        lastName: 'Doe',
      },
    };
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 with case inspection instance', async () => {
    sandbox
      .stub(db.XerceCaseInspection, 'findOne')
      .resolves(xerceCaseInspection);

    const result = await xerceCaseInspectionService.getInstance(
      agencyId,
      xerceCaseId,
      inspectionId
    );

    expect(result).to.deep.equal(xerceCaseInspection, 'response did not match');
  });

  it('Should return status code 400 with InternalServerError', async () => {
    sandbox.stub(db.XerceCaseInspection, 'findOne').throws('Error');

    await xerceCaseInspectionService
      .getInstance(agencyId, xerceCaseId, inspectionId)
      .catch(err => expect(err.name).to.equal('InternalServerError'));
  });

  it('Should return status code 400 with InvalidRequestError', async () => {
    sandbox
      .stub(db.XerceCaseInspection, 'findOne')
      .withArgs({
        where: { agencyId, xerceCaseId, id: inspectionId },
        include: [
          {
            model: db.User,
            as: 'inspectionAssignee',
          },
        ],
      })
      .resolves(null);

    await xerceCaseInspectionService
      .getInstance(agencyId, xerceCaseId, inspectionId)
      .catch(err => expect(err.name).to.equal('InvalidRequestError'));
  });
});

describe('XerceCaseInspection service: closeCurrentInspection method', () => {
  const agencyId = 1;
  const xerceCaseId = 2;
  const userId = 5;
  let transaction;

  let sandbox;
  let currentInspection;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    currentInspection = {
      id: 1,
      agencyId,
      xerceCaseId,
      plannedDate: '2019-08-30T17:12:23.561Z',
      actualDate: null,
      assigneeId: 1,
      noteId: null,
      attachmentIds: [],
      noticeId: null,
      status: 'CLOSED',
      isVerificationInspection: true,
      createdBy: 1,
      updatedBy: null,
      createdAt: '2019-02-14T10:54:16.905Z',
      updatedAt: '2019-02-14T10:54:16.905Z',
      caseAssignee: {
        id: 1,
        agencyId: 1,
        email: 'John.doe@alabama.com',
        password:
          '$2b$10$4NKfTlIbH2J/vI185B42QO3L0e11g65Ibd/JDCTtmGj/wkxKgvyOO',
        firstName: 'John',
        lastName: 'Doe',
        phone: '12345161',
        title: 'manager',
        department: 'IT',
        isSiteAdmin: true,
        isWelcomeEmailSent: true,
        emailToken: 'oo7aer6jbkca07eh56fyqxr99qz47z0r',
        emailTokenExpiry: '2019-02-14T11:44:05.757Z',
        lastLogin: null,
        isActive: true,
        createdAt: '2019-02-14T10:54:05.830Z',
        updatedAt: '2019-02-14T10:54:05.830Z',
        deletedAt: null,
      },
      xerceCaseInspectionAssignee: {
        id: 1,
        agencyId: 1,
        email: 'John.doe@alabama.com',
        password:
          '$2b$10$4NKfTlIbH2J/vI185B42QO3L0e11g65Ibd/JDCTtmGj/wkxKgvyOO',
        firstName: 'John',
        lastName: 'Doe',
        phone: '12345161',
        title: 'manager',
        department: 'IT',
        isSiteAdmin: true,
        isWelcomeEmailSent: true,
        emailToken: 'oo7aer6jbkca07eh56fyqxr99qz47z0r',
        emailTokenExpiry: '2019-02-14T11:44:05.757Z',
        lastLogin: null,
        isActive: true,
        createdAt: '2019-02-14T10:54:05.830Z',
        updatedAt: '2019-02-14T10:54:05.830Z',
        deletedAt: null,
      },
      closedByUser: {
        id: 5,
        firstName: 'John',
        lastName: 'Doe',
      },
      save: () => Promise.resolve(),
    };

    transaction = sinon.stub();
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should update case status as CLOSED', async () => {
    await xerceCaseInspectionService.closeCurrentInspection(
      currentInspection,
      userId,
      transaction
    );
  });

  it('Should throw DBConflictError', async () => {
    currentInspection = {
      id: 1,
      agencyId,
      xerceCaseId,
      plannedDate: '2019-08-30T17:12:23.561Z',
      actualDate: null,
      assigneeId: 1,
      noteId: null,
      attachmentIds: [],
      noticeId: null,
      status: 'CLOSED',
      isVerificationInspection: true,
      createdBy: 1,
      updatedBy: null,
      createdAt: '2019-02-14T10:54:16.905Z',
      updatedAt: '2019-02-14T10:54:16.905Z',
      caseAssignee: {
        id: 1,
        agencyId: 1,
        email: 'John.doe@alabama.com',
        password:
          '$2b$10$4NKfTlIbH2J/vI185B42QO3L0e11g65Ibd/JDCTtmGj/wkxKgvyOO',
        firstName: 'John',
        lastName: 'Doe',
        phone: '12345161',
        title: 'manager',
        department: 'IT',
        isSiteAdmin: true,
        isWelcomeEmailSent: true,
        emailToken: 'oo7aer6jbkca07eh56fyqxr99qz47z0r',
        emailTokenExpiry: '2019-02-14T11:44:05.757Z',
        lastLogin: null,
        isActive: true,
        createdAt: '2019-02-14T10:54:05.830Z',
        updatedAt: '2019-02-14T10:54:05.830Z',
        deletedAt: null,
      },
      xerceCaseInspectionAssignee: {
        id: 1,
        agencyId: 1,
        email: 'John.doe@alabama.com',
        password:
          '$2b$10$4NKfTlIbH2J/vI185B42QO3L0e11g65Ibd/JDCTtmGj/wkxKgvyOO',
        firstName: 'John',
        lastName: 'Doe',
        phone: '12345161',
        title: 'manager',
        department: 'IT',
        isSiteAdmin: true,
        isWelcomeEmailSent: true,
        emailToken: 'oo7aer6jbkca07eh56fyqxr99qz47z0r',
        emailTokenExpiry: '2019-02-14T11:44:05.757Z',
        lastLogin: null,
        isActive: true,
        createdAt: '2019-02-14T10:54:05.830Z',
        updatedAt: '2019-02-14T10:54:05.830Z',
        deletedAt: null,
      },
      closedByUser: {
        id: 5,
        firstName: 'John',
        lastName: 'Doe',
      },
      save: () =>
        Promise.reject({ name: 'SequelizeForeignKeyConstraintError' }),
    };

    await xerceCaseInspectionService
      .closeCurrentInspection(currentInspection, userId, transaction)
      .catch(err => {
        expect(err.name).to.deep.equal('DBConflictError');
        expect(err.message).to.deep.equal(
          'Conflict while trying to close current inspection.'
        );
      });
  });

  it('Should throw InternalServerError', async () => {
    currentInspection = {
      id: 1,
      agencyId,
      xerceCaseId,
      plannedDate: '2019-08-30T17:12:23.561Z',
      actualDate: null,
      assigneeId: 1,
      noteId: null,
      attachmentIds: [],
      noticeId: null,
      status: 'CLOSED',
      isVerificationInspection: true,
      createdBy: 1,
      updatedBy: null,
      createdAt: '2019-02-14T10:54:16.905Z',
      updatedAt: '2019-02-14T10:54:16.905Z',
      caseAssignee: {
        id: 1,
        agencyId: 1,
        email: 'John.doe@alabama.com',
        password:
          '$2b$10$4NKfTlIbH2J/vI185B42QO3L0e11g65Ibd/JDCTtmGj/wkxKgvyOO',
        firstName: 'John',
        lastName: 'Doe',
        phone: '12345161',
        title: 'manager',
        department: 'IT',
        isSiteAdmin: true,
        isWelcomeEmailSent: true,
        emailToken: 'oo7aer6jbkca07eh56fyqxr99qz47z0r',
        emailTokenExpiry: '2019-02-14T11:44:05.757Z',
        lastLogin: null,
        isActive: true,
        createdAt: '2019-02-14T10:54:05.830Z',
        updatedAt: '2019-02-14T10:54:05.830Z',
        deletedAt: null,
      },
      xerceCaseInspectionAssignee: {
        id: 1,
        agencyId: 1,
        email: 'John.doe@alabama.com',
        password:
          '$2b$10$4NKfTlIbH2J/vI185B42QO3L0e11g65Ibd/JDCTtmGj/wkxKgvyOO',
        firstName: 'John',
        lastName: 'Doe',
        phone: '12345161',
        title: 'manager',
        department: 'IT',
        isSiteAdmin: true,
        isWelcomeEmailSent: true,
        emailToken: 'oo7aer6jbkca07eh56fyqxr99qz47z0r',
        emailTokenExpiry: '2019-02-14T11:44:05.757Z',
        lastLogin: null,
        isActive: true,
        createdAt: '2019-02-14T10:54:05.830Z',
        updatedAt: '2019-02-14T10:54:05.830Z',
        deletedAt: null,
      },
      closedByUser: {
        id: 5,
        firstName: 'John',
        lastName: 'Doe',
      },
      save: () => Promise.reject({ name: 'Error' }),
    };

    await xerceCaseInspectionService
      .closeCurrentInspection(currentInspection, userId, transaction)
      .catch(err => {
        expect(err.name).to.deep.equal('InternalServerError');
      });
  });
});

describe('XerceCaseInspection Service: edit method', () => {
  let sandbox;
  let transaction;
  let scheduledInspection;
  const agencyId = 1;
  const caseId = 8;
  const inspectionId = 1;
  const scheduledInspectionRequest = {
    plannedDate: new Date('2019-07-15T04:52:48.740Z'),
    assigneeId: 4,
  };
  const scheduledInspectionRequestInvalid = {
    plannedDate: new Date('2019-05-15T04:52:48.740Z'),
    assigneeId: 4,
  };
  const nullResp = {};
  const authScope = {
    comcateAdmin: true,
    siteAdmin: true,
  };
  const userProfile: IAgencyUserClaim = {
    agencyName: 'City of Alabama',
    id: 11,
    agencyId: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@gmail.com',
    scopes: authScope,
    agencyTimezone: 'PST',
  };
  const violationTypeIds = [2, 3];

  const xerceCaseInspection = {
    id: 1,
    agencyId,
    xerceCaseId: caseId,
    plannedDate: '2019-08-30T17:12:23.561Z',
    actualDate: null,
    assigneeId: 1,
    noteId: null,
    attachmentIds: [],
    noticeId: null,
    status: 'SCHEDULED',
    isVerificationInspection: true,
    createdBy: 1,
    updatedBy: null,
    createdAt: '2019-02-14T10:54:16.905Z',
    updatedAt: '2019-02-14T10:54:16.905Z',
    caseAssignee: {
      id: 1,
      agencyId: 1,
      email: 'John.doe@alabama.com',
      password: '$2b$10$4NKfTlIbH2J/vI185B42QO3L0e11g65Ibd/JDCTtmGj/wkxKgvyOO',
      firstName: 'John',
      lastName: 'Doe',
      phone: '12345161',
      title: 'manager',
      department: 'IT',
      isSiteAdmin: true,
      isWelcomeEmailSent: true,
      emailToken: 'oo7aer6jbkca07eh56fyqxr99qz47z0r',
      emailTokenExpiry: '2019-02-14T11:44:05.757Z',
      lastLogin: null,
      isActive: true,
      createdAt: '2019-02-14T10:54:05.830Z',
      updatedAt: '2019-02-14T10:54:05.830Z',
      deletedAt: null,
    },
    xerceCaseInspectionAssignee: {
      id: 1,
      agencyId: 1,
      email: 'John.doe@alabama.com',
      password: '$2b$10$4NKfTlIbH2J/vI185B42QO3L0e11g65Ibd/JDCTtmGj/wkxKgvyOO',
      firstName: 'John',
      lastName: 'Doe',
      phone: '12345161',
      title: 'manager',
      department: 'IT',
      isSiteAdmin: true,
      isWelcomeEmailSent: true,
      emailToken: 'oo7aer6jbkca07eh56fyqxr99qz47z0r',
      emailTokenExpiry: '2019-02-14T11:44:05.757Z',
      lastLogin: null,
      isActive: true,
      createdAt: '2019-02-14T10:54:05.830Z',
      updatedAt: '2019-02-14T10:54:05.830Z',
      deletedAt: null,
    },
    closedByUser: {
      id: 5,
      firstName: 'John',
      lastName: 'Doe',
    },
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    transaction = sinon.stub();

    scheduledInspection = {
      id: 1,
      agencyId: 1,
      xerceCaseId: 8,
      plannedDate: '2019-03-13T07:00:00.000Z',
      actualDate: null,
      assigneeId: 1,
      noteId: null,
      attachmentIds: [],
      noticeId: null,
      status: 'SCHEDULED',
      isVerificationInspection: true,
      createdBy: 1,
      updatedBy: null,
      createdAt: '2019-03-05T16:23:15.191Z',
      updatedAt: '2019-03-05T17:56:07.671Z',
      save: () => Promise.resolve(),
    };
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  unroll(
    'Should edit scheduled inspection with success: #params ',
    async (done, testArgs) => {
      transaction = sandbox.stub(DBUtil, 'createTransaction');

      sandbox
        .stub(XerceCaseViolationService.prototype, 'getCaseViolationTypeIds')
        .withArgs(agencyId, caseId)
        .resolves(violationTypeIds);

      sandbox
        .stub(XerceCaseInspectionService.prototype, 'validateInspectionRequest')
        .withArgs(
          agencyId,
          scheduledInspectionRequest.assigneeId,
          scheduledInspectionRequest.plannedDate
        );

      sandbox.stub(db.XerceCaseInspection, 'update').resolves({});

      sandbox
        .stub(db.XerceCase, 'update')
        .withArgs({
          inspectionAssigneeId: scheduledInspectionRequest.assigneeId,
        })
        .resolves({});

      sandbox
        .stub(XerceCaseInspectionService.prototype, 'getInstance')
        .withArgs(agencyId, caseId, inspectionId)
        .resolves(xerceCaseInspection);

      sandbox
        .stub(
          XerceCaseHistoryService.prototype,
          'createUpdateInspectionHistory'
        )
        .withArgs(
          agencyId,
          caseId,
          scheduledInspectionRequest,
          xerceCaseInspection,
          userProfile,
          transaction
        );

      sandbox.stub(DBUtil, 'commitTransaction').withArgs({ transaction });

      sandbox.stub(XerceCaseListingService.prototype, 'refreshCaseListing');
      sandbox
        .stub(XerceCaseInspectionService.prototype, 'get')
        .returns(testArgs['scheduledInspection']);

      if (testArgs.params === 'valid') {
        const resp = await xerceCaseInspectionService.edit(
          agencyId,
          caseId,
          inspectionId,
          testArgs.inspectionRequest,
          userProfile
        );

        expect(resp).to.deep.equal(testArgs['scheduledInspection']);

        done();
      } else {
        await xerceCaseInspectionService
          .edit(
            agencyId,
            caseId,
            inspectionId,
            testArgs.inspectionRequest,
            userProfile
          )
          .catch(err => expect(err.name).to.equal('InvalidRequestError'));

        done();
      }
    },
    [
      ['params', 'inspectionRequest', 'scheduledInspection'],
      ['valid', scheduledInspectionRequest, scheduledInspection],
      ['invalid', scheduledInspectionRequestInvalid, nullResp],
    ]
  );

  it('Should throws DBMissingEntityError exception', async () => {
    transaction = sandbox.stub(DBUtil, 'createTransaction');

    sandbox
      .stub(XerceCaseViolationService.prototype, 'getCaseViolationTypeIds')
      .withArgs(agencyId, caseId)
      .resolves(violationTypeIds);

    sandbox
      .stub(XerceCaseInspectionService.prototype, 'validateInspectionRequest')
      .withArgs(
        agencyId,
        scheduledInspectionRequest.assigneeId,
        scheduledInspectionRequest.plannedDate
      );

    sandbox
      .stub(XerceCaseInspectionService.prototype, 'getInstance')
      .withArgs(agencyId, caseId, inspectionId)
      .resolves(xerceCaseInspection);

    sandbox
      .stub(XerceCaseHistoryService.prototype, 'createUpdateInspectionHistory')
      .withArgs(
        agencyId,
        caseId,
        scheduledInspectionRequest,
        xerceCaseInspection,
        userProfile,
        transaction
      );

    sandbox
      .stub(db.XerceCaseInspection, 'update')
      .throws({ name: 'SequelizeForeignKeyConstraintError' });

    sandbox
      .stub(db.XerceCase, 'update')
      .withArgs({
        inspectionAssigneeId: scheduledInspectionRequest.assigneeId,
      })
      .resolves({});

    sandbox.stub(DBUtil, 'rollbackTransaction').withArgs({ transaction });

    sandbox.stub(XerceCaseListingService.prototype, 'refreshCaseListing');

    await xerceCaseInspectionService
      .edit(
        agencyId,
        caseId,
        inspectionId,
        scheduledInspectionRequest,
        userProfile
      )
      .catch(err => {
        expect(err.name).to.equal('DBConflictError');
        expect(err.message).to.deep.equal('Inspection does not exists.');
      });
  });

  it('Should throws DBMissingEntityError exception', async () => {
    sandbox
      .stub(XerceCaseViolationService.prototype, 'getCaseViolationTypeIds')
      .withArgs(agencyId, caseId)
      .resolves(violationTypeIds);

    sandbox
      .stub(XerceCaseInspectionService.prototype, 'validateInspectionRequest')
      .withArgs(
        agencyId,
        scheduledInspectionRequest.assigneeId,
        scheduledInspectionRequest.plannedDate
      );

    transaction = sandbox.stub(DBUtil, 'createTransaction');

    sandbox.stub(XerceCaseListingService.prototype, 'refreshCaseListing');

    sandbox
      .stub(db.XerceCaseInspection, 'update')
      .throws({ name: 'InvalidRequestError' });

    sandbox
      .stub(db.XerceCase, 'update')
      .withArgs({
        inspectionAssigneeId: scheduledInspectionRequest.assigneeId,
      })
      .resolves({});

    sandbox.stub(DBUtil, 'rollbackTransaction').withArgs({ transaction });

    sandbox
      .stub(XerceCaseInspectionService.prototype, 'getInstance')
      .withArgs(agencyId, caseId, inspectionId)
      .resolves(xerceCaseInspection);

    sandbox
      .stub(XerceCaseHistoryService.prototype, 'createUpdateInspectionHistory')
      .withArgs(
        agencyId,
        caseId,
        scheduledInspectionRequest,
        xerceCaseInspection,
        userProfile,
        transaction
      );

    await xerceCaseInspectionService
      .edit(
        agencyId,
        caseId,
        inspectionId,
        scheduledInspectionRequest,
        userProfile
      )
      .catch(err => {
        expect(err.name).to.equal('InvalidRequestError');
        expect(err.message).to.deep.equal(
          'Planned date should not be the past date'
        );
      });
  });
});

describe('XerceCaseInspection Service: editInspectionNote method', () => {
  let sandbox;
  let transaction;
  const agencyId = 1;
  const caseId = 8;
  const inspectionId = 1;
  const userId = 1;
  const noteRequest: INoteRequest = {
    noteContent: 'This is a note',
  };
  const inspection = {
    id: 1,
    agencyId,
    caseId,
    plannedDate: '2019-08-30T17:12:23.561Z',
    actualDate: null,
    assigneeId: 1,
    noteId: 1,
    attachmentIds: [],
    noticeId: null,
    status: 'SCHEDULED',
    isVerificationInspection: true,
    createdBy: 1,
    updatedBy: null,
    createdAt: '2019-02-14T10:54:16.905Z',
    updatedAt: '2019-02-14T10:54:16.905Z',
    caseAssignee: {
      id: 1,
      agencyId: 1,
      email: 'John.doe@alabama.com',
      password: '$2b$10$4NKfTlIbH2J/vI185B42QO3L0e11g65Ibd/JDCTtmGj/wkxKgvyOO',
      firstName: 'John',
      lastName: 'Doe',
      phone: '12345161',
      title: 'manager',
      department: 'IT',
      isSiteAdmin: true,
      isWelcomeEmailSent: true,
      emailToken: 'oo7aer6jbkca07eh56fyqxr99qz47z0r',
      emailTokenExpiry: '2019-02-14T11:44:05.757Z',
      lastLogin: null,
      isActive: true,
      createdAt: '2019-02-14T10:54:05.830Z',
      updatedAt: '2019-02-14T10:54:05.830Z',
      deletedAt: null,
    },
    save: () => Promise.resolve(),
  };

  const userProfile: IAgencyUserClaim | ISuperAdminClaim = {
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

  const noteObj = {
    id: 1,
    agencyId,
    caseId,
    noteContent: 'This is a note',
    createdByUser: {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
    },
    createdBy: 1,
    createdAt: new Date('2019-10-18T06:14:50.572Z'),
    updatedByUser: {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
    },
    updatedBy: 1,
    updatedAt: new Date('2019-10-18T06:14:50.572Z'),
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  unroll(
    'Should edit inspection note with success, #params',
    async (done, testArgs) => {
      sandbox
        .stub(XerceCaseInspectionService.prototype, 'getInstance')
        .withArgs(agencyId, caseId, inspectionId)
        .resolves(testArgs['inspection']);

      transaction = sandbox.stub(DBUtil, 'createTransaction');

      sandbox.stub(XerceCaseNoteService.prototype, 'create').resolves(noteObj);

      sandbox
        .stub(XerceCaseNoteService.prototype, 'delete')
        .withArgs(
          agencyId,
          caseId,
          testArgs.inspection.noteId,
          userProfile,
          transaction
        )
        .resolves(noteObj);

      sandbox
        .stub(XerceCaseNoteService.prototype, 'edit')
        .withArgs(
          agencyId,
          caseId,
          noteObj.id,
          userId,
          testArgs.noteRequest,
          transaction
        )
        .resolves(noteObj);

      sandbox.stub(DBUtil, 'commitTransaction').withArgs({ transaction });

      sandbox
        .stub(XerceCaseInspectionService.prototype, 'getAll')
        .resolves(testArgs.response);

      const resp = await xerceCaseInspectionService.editInspectionNote(
        agencyId,
        caseId,
        inspectionId,
        userProfile,
        testArgs.noteRequest
      );

      expect(resp).to.deep.equal(testArgs.response);

      done();
    },
    [
      ['params', 'noteRequest', 'inspection', 'response'],
      [
        'when note content is present but no note present on inspection',
        noteRequest,
        { ...inspection, noteId: null },
        [inspection],
      ],
      [
        'when note content is present and noteID was present on inspection',
        noteRequest,
        inspection,
        [inspection],
      ],
      [
        'when note content is null but initially note was present ',
        { ...noteRequest, noteContent: null },
        inspection,
        [{ ...inspection, noteId: null }],
      ],
    ]
  );

  it('should throw Error when db transaction fails', async () => {
    sandbox
      .stub(XerceCaseInspectionService.prototype, 'getInstance')
      .withArgs(agencyId, caseId, inspectionId)
      .resolves(inspection);

    transaction = sandbox.stub(DBUtil, 'createTransaction');

    sandbox.stub(XerceCaseNoteService.prototype, 'create').throws({
      name: 'InternalServerError',
    });

    sandbox.stub(DBUtil, 'rollbackTransaction').withArgs({ transaction });

    await xerceCaseInspectionService
      .editInspectionNote(
        agencyId,
        caseId,
        inspectionId,
        userProfile,
        noteRequest
      )
      .catch(err => {
        expect(err.name).to.deep.equal('InternalServerError');
        expect(err.message).to.deep.equal(
          'Error while editing Inspection Note'
        );
      });
  });
});
