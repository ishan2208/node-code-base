import 'mocha';

import { expect } from 'chai';
import * as sinon from 'sinon';

import db from '../../../../api/models';
import UserService from '../../../../api/service/user/user';
import XerceCaseListingService from '../../../../api/service/xerce/caseListing';
import XerceCaseAssigneeService from '../../../../api/service/xerce/xerceCaseAssignee';
import XerceCaseViolationService from '../../../../api/service/xerce/xerceCaseViolation';
import XerceCaseHistoryService from './../../../../api/service/xerce/xerceCaseHistory';

const xerceCaseAssigneeService = new XerceCaseAssigneeService();

describe('XerceCaseAssignee Service: editCaseAssignee method', () => {
  let sandbox;
  const agencyId = 1;
  const userId = 9;
  const xerceCaseId = 3;
  let caseAssigneeEditReq: ICaseAssigneeEditRequest;
  let xerceCase;
  let responseObj: ICaseUser;
  let transaction;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    transaction = sinon.stub();

    caseAssigneeEditReq = {
      assigneeId: 8,
    };

    xerceCase = {
      id: xerceCaseId,
      agencyId,
      assigneeId: 5,
      agencyLocationId: 3,
      caseNumber: '#CE-19-2',
      initiationType: 'PROACTIVE',
      issueDescription: 'This is a test issue description',
      status: 'OPEN',
      customCaseFieldValues: [],
      customForcedAbatementFieldValues: [],
      locationManualFields: [],
      locationParcelFields: [],
      isCDBGApproved: true,
      createdByUser: {
        id: 5,
        firstName: 'John',
        lastName: 'Doe',
      },
      caseAssignee: {
        id: 5,
        firstName: 'John',
        lastName: 'Doe',
      },
      closedByUser: null,
      closedAt: null,
      createdAt: new Date('2019-02-16T06:29:32.814Z'),
      updatedAt: new Date('2019-02-16T06:29:32.814Z'),
      save: () => Promise.resolve(),
    };

    responseObj = {
      id: 8,
      firstName: 'Jane',
      lastName: 'Doe',
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('Should update new case assignee and return new case assignee details', async () => {
    sandbox
      .stub(db.XerceCase, 'findOne')
      .withArgs({
        where: { id: xerceCaseId, agencyId },
      })
      .returns(xerceCase);

    sandbox
      .stub(XerceCaseAssigneeService.prototype, 'validateAssignee')
      .withArgs(agencyId, xerceCaseId, caseAssigneeEditReq.assigneeId);

    sandbox.stub(XerceCaseListingService.prototype, 'refreshCaseListing');

    sandbox.stub(xerceCase, 'save').withArgs({
      transaction,
    });

    sandbox
      .stub(XerceCaseAssigneeService.prototype, 'getCaseAssignee')
      .withArgs(agencyId, xerceCaseId)
      .returns(responseObj);

    sandbox
      .stub(XerceCaseHistoryService.prototype, 'createCaseSummaryHistory')
      .withArgs(
        CaseHistoryActions.CASE_ASSIGNEE_CHANGED,
        agencyId,
        userId,
        xerceCaseId,
        transaction,
        `${responseObj.firstName} ${responseObj.lastName}`
      )
      .returns(null);

    const result = await xerceCaseAssigneeService.editCaseAssignee(
      agencyId,
      userId,
      xerceCaseId,
      caseAssigneeEditReq
    );

    expect(result).to.deep.equal(responseObj, 'response did not match');
  });

  it('Should throws InternalServerError when searching case', async () => {
    sandbox
      .stub(db.XerceCase, 'findOne')
      .withArgs({
        where: { id: xerceCaseId, agencyId },
      })
      .throws({ name: 'Error' });

    await xerceCaseAssigneeService
      .editCaseAssignee(agencyId, userId, xerceCaseId, caseAssigneeEditReq)
      .catch(err => expect(err.name).to.equal('InternalServerError'));
  });

  it('Should throws DBMissingEntityError when case is not found', async () => {
    sandbox
      .stub(db.XerceCase, 'findOne')
      .withArgs({
        where: { id: xerceCaseId, agencyId },
      })
      .returns(null);

    await xerceCaseAssigneeService
      .editCaseAssignee(agencyId, userId, xerceCaseId, caseAssigneeEditReq)
      .catch(err => {
        expect(err.name).to.deep.equal('DBMissingEntityError');
        expect(err.message).to.deep.equal('Could not find the Xerce case.');
      });
  });

  it('Should throws InternalServerError when saving case', async () => {
    sandbox
      .stub(db.XerceCase, 'findOne')
      .withArgs({
        where: { id: xerceCaseId, agencyId },
      })
      .returns(xerceCase);

    sandbox
      .stub(XerceCaseAssigneeService.prototype, 'validateAssignee')
      .withArgs(agencyId, xerceCaseId, caseAssigneeEditReq.assigneeId);

    sandbox.stub(xerceCase, 'save').throws({ name: 'Error' });

    await xerceCaseAssigneeService
      .editCaseAssignee(agencyId, userId, xerceCaseId, caseAssigneeEditReq)
      .catch(err => expect(err.name).to.deep.equal('InternalServerError'));
  });
});

describe('XerceCaseAssignee Service: getCaseAssignee method', () => {
  let sandbox;
  const agencyId = 1;
  const xerceCaseId = 3;
  let xerceCase;
  let responseObj: ICaseUser;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    xerceCase = {
      id: xerceCaseId,
      agencyId,
      assigneeId: 5,
      agencyLocationId: 3,
      caseNumber: '#CE-19-2',
      initiationType: 'PROACTIVE',
      issueDescription: 'This is a test issue description',
      status: 'OPEN',
      customCaseFieldValues: [],
      customForcedAbatementFieldValues: [],
      locationManualFields: [],
      locationParcelFields: [],
      isCDBGApproved: true,
      createdByUser: {
        id: 5,
        firstName: 'John',
        lastName: 'Doe',
      },
      caseAssignee: {
        id: 5,
        firstName: 'John',
        lastName: 'Doe',
      },
      closedByUser: null,
      closedAt: null,
      createdAt: new Date('2019-02-16T06:29:32.814Z'),
      updatedAt: new Date('2019-02-16T06:29:32.814Z'),
      save: () => Promise.resolve(),
    };

    responseObj = {
      id: 5,
      firstName: 'John',
      lastName: 'Doe',
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('Should update new case assignee and return new case assignee details', async () => {
    sandbox.stub(db.XerceCase, 'findOne').returns(xerceCase);

    const result = await xerceCaseAssigneeService.getCaseAssignee(
      agencyId,
      xerceCaseId
    );

    expect(result).to.deep.equal(responseObj, 'response did not match');
  });

  it('Should throws InternalServerError when querying for case', async () => {
    sandbox.stub(db.XerceCase, 'findOne').throws({ name: 'Error' });

    await xerceCaseAssigneeService
      .getCaseAssignee(agencyId, xerceCaseId)
      .catch(err => expect(err.name).to.deep.equal('InternalServerError'));
  });

  it('Should throws DBMissingEntityError when case is not found', async () => {
    sandbox
      .stub(db.XerceCase, 'findOne')
      .withArgs({
        where: { id: xerceCaseId, agencyId },
        include: [
          {
            model: db.User,
            as: 'caseAssignee',
          },
        ],
      })
      .returns(null);

    await xerceCaseAssigneeService
      .getCaseAssignee(agencyId, xerceCaseId)
      .catch(err => {
        expect(err.name).to.deep.equal('DBMissingEntityError');
        expect(err.message).to.deep.equal('Could not find the Xerce case.');
      });
  });
});

describe('XerceCaseAssignee Service: validateAssignee method', () => {
  let sandbox;
  const agencyId = 1;
  const xerceCaseId = 3;
  const assigneeId = 4;
  let xerceCaseViolations: ICaseViolation[];
  let caseUser;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    caseUser = {
      id: 4,
      firstName: 'John',
      lastName: 'Doe',
    };

    xerceCaseViolations = [
      {
        id: 1001,
        configDispositionId: 1,
        status: XerceViolationStatus.CLOSED_INVALID,
        complyByDate: new Date('2018-03-30T08:36:22.338Z'),
        configViolation: {
          id: 111,
          label: 'Animal Control',
          complyByDays: 7,
          configMunicipalCode: {
            id: 1,
            articleNumber: '11.21.3',
            description: 'Test Desc for Municipal Code',
            resolutionAction: 'Resolution Action for Municipal Code',
          },
          configViolationType: {
            id: 11,
            label: 'Animal',
            iconURL:
              'https://cyberdyne-dev.s3.amazonaws.com/agency_0/system_icon/animal.png',
          },
        },
        entity: {
          'Animal Colour': 'Black',
          'License Number': '1234',
          Age: 12,
          Breed: '',
          Note: '',
        },
        createdAt: new Date('2018-03-30T08:36:22.338Z'),
        updatedAt: new Date('2018-03-30T08:36:22.338Z'),
        closedAt: new Date('2018-03-30T08:36:22.338Z'),
        createdBy: caseUser,
        updatedBy: caseUser,
        closedBy: caseUser,
      },
      {
        id: 1002,
        configDispositionId: 1,
        status: XerceViolationStatus.VERIFICATION_PENDING,
        complyByDate: new Date('2018-03-30T08:36:22.338Z'),
        configViolation: {
          id: 111,
          label: 'Animal Control',
          complyByDays: 7,
          configMunicipalCode: {
            id: 1,
            articleNumber: '11.21.3',
            description: 'Test Desc for Municipal Code',
            resolutionAction: 'Resolution Action for Municipal Code',
          },
          configViolationType: {
            id: 11,
            label: 'Animal',
            iconURL:
              'https://cyberdyne-dev.s3.amazonaws.com/agency_0/system_icon/animal.png',
          },
        },
        entity: {
          'Animal Colour': 'White',
          'License Number': '',
          Age: 5,
          Breed: '',
          Note: 'Puppy',
        },
        createdAt: new Date('2018-03-30T08:36:22.338Z'),
        updatedAt: new Date('2018-03-30T08:36:22.338Z'),
        closedAt: null,
        createdBy: caseUser,
        updatedBy: caseUser,
        closedBy: null,
      },
      {
        id: 1003,
        configDispositionId: 1,
        status: XerceViolationStatus.VERIFICATION_PENDING,
        complyByDate: new Date('2018-03-30T08:36:22.338Z'),
        configViolation: {
          id: 112,
          label: 'General',
          complyByDays: 9,
          configMunicipalCode: {
            id: 1,
            articleNumber: '11.21.3',
            description: 'Test Desc for Municipal Code',
            resolutionAction: 'Resolution Action for Municipal Code',
          },
          configViolationType: {
            id: 12,
            label: 'General',
            iconURL:
              'https://cyberdyne-dev.s3.amazonaws.com/agency_0/system_icon/general.png',
          },
        },
        entity: null,
        createdAt: new Date('2018-03-30T08:36:22.338Z'),
        updatedAt: new Date('2018-03-30T08:36:22.338Z'),
        closedAt: null,
        createdBy: caseUser,
        updatedBy: caseUser,
        closedBy: null,
      },
    ];
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('Should validate assignee successfuly and does not throw exception', async () => {
    const getAllViolations = sandbox.stub(
      XerceCaseViolationService.prototype,
      'getAll'
    );
    getAllViolations
      .withArgs(agencyId, xerceCaseId, sinon.match.any)
      .returns(xerceCaseViolations);

    const isValidAssignee = sandbox.stub(
      UserService.prototype,
      'isValidAssignee'
    );
    isValidAssignee
      .withArgs(agencyId, assigneeId, sinon.match.any)
      .returns(true);

    await xerceCaseAssigneeService.validateAssignee(
      agencyId,
      xerceCaseId,
      assigneeId
    );
  });

  it('Should fail validatation of assignee and throw exception', async () => {
    const getAllViolations = sandbox.stub(
      XerceCaseViolationService.prototype,
      'getAll'
    );
    getAllViolations
      .withArgs(agencyId, xerceCaseId, sinon.match.any)
      .returns(xerceCaseViolations);

    const isValidAssignee = sandbox.stub(
      UserService.prototype,
      'isValidAssignee'
    );
    isValidAssignee
      .withArgs(agencyId, assigneeId, sinon.match.any)
      .returns(false);

    await xerceCaseAssigneeService
      .validateAssignee(agencyId, xerceCaseId, assigneeId)
      .catch(err => expect(err.name).to.deep.equal('InvalidRequestError'));
  });
});
