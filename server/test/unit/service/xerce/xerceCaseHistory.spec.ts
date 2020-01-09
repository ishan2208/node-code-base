import { expect } from 'chai';
import 'mocha';
import * as sinon from 'sinon';

import db from '../../../../api/models';
import ConfigCaseCustomTileService from '../../../../api/service/agencySetup/configCaseCustomTile';
import CaseRoleService from '../../../../api/service/agencySetup/configCaseRole';
import ConfigForcedAbatementActivityService from '../../../../api/service/agencySetup/configForcedAbatementActivity';
import LocationFieldService from '../../../../api/service/agencySetup/configLocationField';
import ConfigViolationService from '../../../../api/service/agencySetup/configViolation';
import ConfigNoticeService from '../../../../api/service/agencySetup/configXerceNotice';
import XerceCaseHistoryService from '../../../../api/service/xerce/xerceCaseHistory';

const xerceCaseHistoryService = new XerceCaseHistoryService();

describe('XerceCaseHistory Service: get Method', () => {
  let sandbox;
  const agencyId = 1;
  const xerceCaseId = 2;
  let response: ICaseHistory[];
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    response = [
      {
        description: 'Case Created',
        createdAt: new Date('2019-02-16T06:29:32.814Z'),
        action: CaseHistoryActions.CASE_CREATED,
        createdByUser: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
        },
      },
      {
        description: 'Case Closed',
        createdAt: new Date('2019-02-18T06:29:32.814Z'),
        action: CaseHistoryActions.CASE_CLOSED,
        createdByUser: {
          id: 1,
          firstName: 'John',
          lastName: 'Wick',
        },
      },
    ];
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('should return 200 with case history', async () => {
    sandbox.stub(db.XerceCaseHistory, 'findAll').resolves(response);

    const result = await xerceCaseHistoryService.get(agencyId, xerceCaseId);

    expect(result).to.deep.equal(response);
  });

  it('should throw InternalServerError while fetching history', async () => {
    sandbox.stub(db.XerceCaseHistory, 'findAll').throws('Error');

    await xerceCaseHistoryService
      .get(agencyId, xerceCaseId)
      .catch(err => expect(err.name).to.equal('InternalServerError'));
  });
});

describe('XerceCaseHistory Service: create Method', () => {
  let sandbox;
  let transaction;
  const agencyId = 1;
  let action;
  let description;
  const caseId = 2;
  const userId = 3;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    transaction = sinon.stub();
    action = CaseHistoryActions.CASE_CREATED;
    description = 'Case created';
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('should create case history', async () => {
    sandbox.stub(db.XerceCaseHistory, 'create').resolves(undefined);

    const result = await (xerceCaseHistoryService as any).create(
      agencyId,
      caseId,
      userId,
      action,
      description,
      transaction
    );

    expect(result).to.deep.equal(undefined);
  });

  it('should throw error while creating case history', async () => {
    sandbox.stub(db.XerceCaseHistory, 'create').throws('InternalServerError');
    await (xerceCaseHistoryService as any)
      .create(agencyId, caseId, userId, action, description, transaction)
      .catch(err => expect(err.name).to.equal('InternalServerError'));
  });
});

describe('XerceCaseHistory Service: createCaseSummaryHistory Method', () => {
  let sandbox;
  let transaction;
  const agencyId = 1;
  let action;
  const caseId = 2;
  const userId = 3;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    transaction = sinon.stub();
    action = CaseHistoryActions.CASE_CREATED;
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('should create case history for case summary - case created', async () => {
    sandbox.stub(db.XerceCaseHistory, 'create').resolves(undefined);

    const result = await xerceCaseHistoryService.createCaseSummaryHistory(
      agencyId,
      caseId,
      userId,
      action,
      transaction
    );

    expect(result).to.deep.equal(undefined);
  });

  it('should create case history for case summary  - case closed', async () => {
    sandbox.stub(db.XerceCaseHistory, 'create').resolves(undefined);
    action = CaseHistoryActions.CASE_CLOSED;
    const result = await xerceCaseHistoryService.createCaseSummaryHistory(
      agencyId,
      caseId,
      userId,
      action,
      transaction
    );

    expect(result).to.deep.equal(undefined);
  });

  it('should create case history for case summary  - case reopened', async () => {
    sandbox.stub(db.XerceCaseHistory, 'create').resolves(undefined);
    action = CaseHistoryActions.CASE_REOPENED;
    const result = await xerceCaseHistoryService.createCaseSummaryHistory(
      agencyId,
      caseId,
      userId,
      action,
      transaction
    );

    expect(result).to.deep.equal(undefined);
  });

  it('should create case history for case summary  - case assignee changed', async () => {
    sandbox.stub(db.XerceCaseHistory, 'create').resolves(undefined);
    action = CaseHistoryActions.CASE_ASSIGNEE_CHANGED;
    const result = await xerceCaseHistoryService.createCaseSummaryHistory(
      agencyId,
      caseId,
      userId,
      action,
      transaction,
      'John Doe'
    );

    expect(result).to.deep.equal(undefined);
  });
});

describe('XerceCaseHistory Service: createCaseAttachmentsHistory Method', () => {
  let sandbox;
  let transaction;
  const agencyId = 1;
  let action;
  const caseId = 2;
  const userId = 3;
  let attachments = [];
  let exitingAttachments = [];
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    transaction = sinon.stub();
    action = CaseHistoryActions.ATTACHMENTS_ADDED;
    attachments = [
      {
        fileName: 'demo.jpg',
        fileSize: '1MB',
        description: 'demo',
        title: 'this is a new title',
        fileUrl: 'https://demo.com',
      },
    ];
    exitingAttachments = [
      {
        id: 1,
        fileMetadata: {
          id: 1,
          title: 'this is a old title',
          description: 'this is a old description',
          fileName: 'demo.jpg',
        },
      },
    ];
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('should create case history for attachment added', async () => {
    sandbox.stub(db.XerceCaseHistory, 'bulkCreate').resolves(undefined);

    const result = await xerceCaseHistoryService.createCaseAttachmentsHistory(
      agencyId,
      caseId,
      userId,
      action,
      attachments,
      transaction
    );

    expect(result).to.deep.equal(undefined);
  });

  it('should create case history for attachment edited', async () => {
    sandbox.stub(db.XerceCaseHistory, 'bulkCreate').resolves(undefined);
    action = CaseHistoryActions.ATTACHMENTS_EDITED;
    attachments = [
      {
        attachmentId: 1,
        title: 'this is a new title',
        description: 'this is an old description',
      },
    ];
    const result = await xerceCaseHistoryService.createCaseAttachmentsHistory(
      agencyId,
      caseId,
      userId,
      action,
      attachments,
      transaction,
      exitingAttachments
    );

    expect(result).to.deep.equal(undefined);
  });

  it('should return undefined if no attachment field is updated', async () => {
    sandbox.stub(db.XerceCaseHistory, 'bulkCreate').resolves(undefined);
    action = CaseHistoryActions.ATTACHMENTS_EDITED;
    attachments = [
      {
        attachmentId: 1,
        title: 'this is a old title',
        description: 'this is a old description',
      },
    ];
    const result = await xerceCaseHistoryService.createCaseAttachmentsHistory(
      agencyId,
      caseId,
      userId,
      action,
      attachments,
      transaction,
      exitingAttachments
    );

    expect(result).to.deep.equal(undefined);
  });

  it('should return undefined if invalid attachmentId is found', async () => {
    sandbox.stub(db.XerceCaseHistory, 'bulkCreate').resolves(undefined);
    action = CaseHistoryActions.ATTACHMENTS_EDITED;
    attachments = [
      {
        attachmentId: 2,
        title: 'this is a old title',
        description: 'this is a old description',
      },
    ];
    const result = await xerceCaseHistoryService.createCaseAttachmentsHistory(
      agencyId,
      caseId,
      userId,
      action,
      attachments,
      transaction,
      exitingAttachments
    );

    expect(result).to.deep.equal(undefined);
  });
});

describe('XerceCaseHistory Service: createCaseLocationHistory Method', () => {
  let sandbox;
  let transaction;
  const agencyId = 1;
  let xerceCase;
  let caseLocationEditReq: ICaseLocationRequest;
  const caseId = 2;
  const userId = 3;
  let locationField;
  let response;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    transaction = sinon.stub();
    xerceCase = {
      id: caseId,
      agencyId,
      assigneeId: 1,
      agencyLocationId: 17,
      caseNumber: 'CE-19-1',
      issueDescription: 'Test Issue Desc.',
      status: XerceCaseStatus.OPEN,
      customCaseFieldValues: [],
      customForcedAbatementFieldValues: [],
      locationManualFields: {
        1: 'Ward I',
        2: 23,
        3: 1,
      },
      locationParcelFields: {},
      isCDBGApproved: true,
      createdBy: 1,
      updatedBy: 2,
      closedBy: 3,
      createdAt: new Date('2019-02-16T06:29:32.814Z'),
      updatedAt: new Date('2019-02-16T06:29:32.814Z'),
      closedAt: new Date('2019-02-16T06:29:32.814Z'),
      caseLocation: {
        id: 17,
        agencyId,
        streetAddress: '547,Alabama',
        city: 'Alabama',
        state: 'AL',
        zip: '94016',
        latitude: 34.0401465212326,
        longitude: -78.0749587334245,
        mapZoomLevel: 12,
        parcelId: 22,
        isAgencyAddress: true,
        isCDBGEligible: false,
      },
      xerceCaseLocation: {
        apn: '1234',
        assessorAddress: '123456',
        isMapPinDropped: false,
        save: () => Promise.resolve(),
      },
      save: () => Promise.resolve(),
    };
    locationField = {
      id: 2,
      label: 'Ward',
      type: 'SELECT',
      isActive: true,
      isMandatory: true,
    };
    response = {
      id: 1,
      action: CaseHistoryActions.LOCATION_ADDRESS_EDITED,
      agencyId: 1,
      description: 'Case address edited (547,Alabama 2)',
      userId: 3,
      xerceCaseId: 2,
      createdAt: new Date('2019-02-16T06:29:32.814Z'),
      updatedAt: new Date('2019-02-16T06:29:32.814Z'),
    };
    caseLocationEditReq = {
      isCDBGApproved: false,
      streetAddress: '547,Alabama 2',
      manualFields: {
        1: 'Ward I',
        2: 23,
        3: 1,
      },
      apn: '1234321',
      assessorAddress: 'Assessor street',
      isMapPinDropped: true,
      zip: '123456',
      city: 'Alabama',
      state: 'AL',
      latitude: 34.0401465212326,
      longitude: -78.0749587334245,
      isCDBGEligible: true,
      parcelFields: {},
      parcelId: 22,
    };
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('should create case history for updated case location', async () => {
    sandbox.stub(db.XerceCaseHistory, 'bulkCreate').resolves(response);

    const result = await xerceCaseHistoryService.createCaseLocationHistory(
      agencyId,
      xerceCase,
      userId,
      caseLocationEditReq,
      transaction
    );

    expect(result).to.deep.equal(undefined);
  });

  it('should create case history for updated case location for pin edited', async () => {
    sandbox.stub(db.XerceCaseHistory, 'bulkCreate').resolves(response);
    caseLocationEditReq = {
      isCDBGApproved: false,
      streetAddress: '547,Alabama 2',
      manualFields: {
        1: 'Ward I',
        2: 23,
        3: 1,
      },
      apn: '1234321',
      assessorAddress: 'Assessor street',
      isMapPinDropped: true,
      zip: '123456',
      city: 'Alabama',
      state: 'AL',
      latitude: 34.2431465212326,
      longitude: -72.0749587334245,
      isCDBGEligible: true,
      parcelFields: {},
      parcelId: 22,
    };
    const result = await xerceCaseHistoryService.createCaseLocationHistory(
      agencyId,
      xerceCase,
      userId,
      caseLocationEditReq,
      transaction
    );

    expect(result).to.deep.equal(undefined);
  });

  it('should create case history for updated case location for manual fields', async () => {
    caseLocationEditReq.manualFields = {
      2: 22,
    };

    sandbox.stub(db.XerceCaseHistory, 'bulkCreate').resolves(response);

    sandbox
      .stub(LocationFieldService.prototype, 'getLocationField')
      .withArgs(agencyId, 2)
      .resolves(locationField);

    const result = await xerceCaseHistoryService.createCaseLocationHistory(
      agencyId,
      xerceCase,
      userId,
      caseLocationEditReq,
      transaction
    );

    expect(result).to.deep.equal(undefined);
  });

  it('should return undefined if no location field is updated', async () => {
    caseLocationEditReq = {
      isCDBGApproved: true,
      streetAddress: '547,Alabama',
      manualFields: {
        1: 'Ward I',
        2: 23,
        3: 1,
      },
      apn: '1234',
      assessorAddress: '123456',
      isMapPinDropped: false,
      zip: '94016',
      city: 'Alabama',
      state: 'AL',
      latitude: 34.0401465212326,
      longitude: -78.0749587334245,
      isCDBGEligible: false,
      parcelFields: {},
      parcelId: 22,
    };
    sandbox.stub(db.XerceCaseHistory, 'bulkCreate').resolves(response);

    const result = await xerceCaseHistoryService.createCaseLocationHistory(
      agencyId,
      xerceCase,
      userId,
      caseLocationEditReq,
      transaction
    );

    expect(result).to.deep.equal(undefined);
  });
});

describe('XerceCaseHistory Service: createForcedAbatementHistory Method', () => {
  let sandbox;
  let transaction;
  const agencyId = 1;
  let action;
  const userId = 1;
  const caseId = 2;
  let forcedAbatementActivity;
  let xerceCaseFAA;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    transaction = sinon.stub();
    action = CaseHistoryActions.FORCED_ABATEMENT_INITIATED;
    forcedAbatementActivity = {
      id: 1,
      label: 'Property Lein',
      configFAAId: 2,
      forcedAbatementFields: [
        {
          id: 1,
          label: 'demo',
        },
      ],
    };
    xerceCaseFAA = {
      xerceCaseId: 1,
      configFAAId: 2,
      activityFieldsValues: {
        1: '1',
        2: '4',
      },
    };
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('should create case history for forced abatement initiated', async () => {
    sandbox.stub(db.XerceCaseHistory, 'bulkCreate').resolves(undefined);

    const result = await xerceCaseHistoryService.createForcedAbatementHistory(
      agencyId,
      caseId,
      userId,
      action,
      transaction
    );

    expect(result).to.deep.equal(undefined);
  });

  it('should create case history for adding forced abatement activity', async () => {
    sandbox.stub(db.XerceCaseHistory, 'bulkCreate').resolves(undefined);
    action = CaseHistoryActions.FORCED_ABATEMENT_ACTIVITY_ADDED;
    const result = await xerceCaseHistoryService.createForcedAbatementHistory(
      agencyId,
      caseId,
      userId,
      action,
      transaction,
      forcedAbatementActivity.label
    );

    expect(result).to.deep.equal(undefined);
  });

  it('should create case history for deleting forced abatement activity', async () => {
    sandbox.stub(db.XerceCaseHistory, 'bulkCreate').resolves(undefined);
    action = CaseHistoryActions.FORCED_ABATEMENT_ACTIVITY_DELETED;

    sandbox
      .stub(ConfigForcedAbatementActivityService.prototype, 'get')
      .withArgs(agencyId)
      .resolves(forcedAbatementActivity);

    const result = await xerceCaseHistoryService.createForcedAbatementHistory(
      agencyId,
      caseId,
      userId,
      action,
      transaction,
      forcedAbatementActivity.configFAAId
    );

    expect(result).to.deep.equal(undefined);
  });

  it('should create case history for editing forced abatement note', async () => {
    sandbox.stub(db.XerceCaseHistory, 'bulkCreate').resolves(undefined);
    action = CaseHistoryActions.FORCED_ABATEMENT_NOTE_EDITED;
    const content = 'Edited';
    const result = await xerceCaseHistoryService.createForcedAbatementHistory(
      agencyId,
      caseId,
      userId,
      action,
      transaction,
      content
    );

    expect(result).to.deep.equal(undefined);
  });

  it('should create case history for editing forced abatement activity', async () => {
    sandbox.stub(db.XerceCaseHistory, 'bulkCreate').resolves(undefined);
    action = CaseHistoryActions.FORCED_ABATEMENT_ACTIVITY_EDITED;

    sandbox
      .stub(ConfigForcedAbatementActivityService.prototype, 'get')
      .withArgs(agencyId, xerceCaseFAA.configFAAId)
      .resolves(forcedAbatementActivity);

    const request = {
      1: '2',
      2: '4',
    };
    const result = await xerceCaseHistoryService.createForcedAbatementHistory(
      agencyId,
      caseId,
      userId,
      action,
      transaction,
      request,
      xerceCaseFAA
    );

    expect(result).to.deep.equal(undefined);
  });

  it('should return undefined if invalid action is called', async () => {
    sandbox.stub(db.XerceCaseHistory, 'bulkCreate').resolves(undefined);
    action = CaseHistoryActions.LOCATION_CUSTOM_FIELDS_EDITED;
    const result = await xerceCaseHistoryService.createForcedAbatementHistory(
      agencyId,
      caseId,
      userId,
      action,
      transaction,
      forcedAbatementActivity.label
    );

    expect(result).to.deep.equal(undefined);
  });
});

describe('XerceCaseHistory Service: createModifiedDatesHistory Method', () => {
  let sandbox;
  let transaction;
  const agencyId = 1;
  let modifiedDates: IModifyAbatementActivitiesDatesReq;
  let xerceCase;
  const notice = {
    id: 1,
    label: 'Verbal Warning',
  };
  const user: IAgencyUserClaim | ISuperAdminClaim = {
    id: 5,
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
          11: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
          12: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
          13: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
          14: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
        },
      },
    },
  };
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    transaction = sinon.stub();
    xerceCase = {
      id: 15,
      agencyId: 1,
      caseNumber: 'CE-19-7',
      createdBy: 4,
      updatedBy: 4,
      closedBy: null,
      reopenedBy: 4,
      createdAt: new Date('2019-09-01T09:13:12.177Z'),
      updatedAt: new Date('2019-09-01T09:13:12.177Z'),
      closedAt: new Date('2019-09-01T09:13:12.177Z'),
      reopenedAt: new Date('2019-09-01T09:13:12.177Z'),
      deletedAt: null,
      xerceCaseStatusActivities: [
        {
          id: 1,
          createdAt: new Date('2019-09-04T09:13:12.177Z'),
          status: XerceCaseStatus.OPEN,
        },
        {
          id: 2,
          createdAt: new Date('2019-09-05T09:13:12.177Z'),
          status: XerceCaseStatus.CLOSED,
        },
        {
          id: 3,
          createdAt: new Date('2019-09-06T09:13:12.177Z'),
          status: XerceCaseStatus.OPEN,
        },
      ],
      xerceCaseNotices: [
        { id: 1, issuedAt: new Date('2019-09-01T09:13:12.177Z') },
      ],
    };
    modifiedDates = {
      caseStatusActivity: [
        { id: 2, modifiedDate: new Date('2019-09-02T09:13:12.177Z') },
        { id: 1, modifiedDate: new Date('2019-09-01T09:13:12.177Z') },
        { id: 3, modifiedDate: new Date('2019-09-03T09:13:12.177Z') },
      ],
      notices: [{ id: 1, modifiedDate: new Date('2019-09-01T09:13:12.177Z') }],
      inspections: [],
    };
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('should create case history for case modified dates', async () => {
    sandbox.stub(db.XerceCaseHistory, 'bulkCreate').resolves(undefined);

    const result = await xerceCaseHistoryService.createModifiedDatesHistory(
      agencyId,
      xerceCase,
      user,
      modifiedDates,
      transaction
    );
    expect(result).to.deep.equal(undefined);
  });

  it('should create case history for case modified notice dates', async () => {
    xerceCase = {
      id: 15,
      xerceCaseStatusActivities: [],
      xerceCaseNotices: [
        {
          id: 1,
          issuedAt: new Date('2019-08-05T09:14:58.661Z'),
        },
      ],
    };

    modifiedDates = {
      caseStatusActivity: [],
      notices: [{ id: 1, modifiedDate: new Date('2019-09-01T09:13:12.177Z') }],
      inspections: [],
    };

    sandbox.stub(db.XerceCaseHistory, 'bulkCreate').resolves(undefined);

    sandbox
      .stub(ConfigNoticeService.prototype, 'get')
      .withArgs(agencyId)
      .resolves(notice);

    const result = await xerceCaseHistoryService.createModifiedDatesHistory(
      agencyId,
      xerceCase,
      user,
      modifiedDates,
      transaction
    );
    expect(result).to.deep.equal(undefined);
  });

  it('should return undefined if no field is updated', async () => {
    modifiedDates = {
      caseStatusActivity: [
        { id: 2, modifiedDate: new Date('2019-09-05T09:13:12.177Z') },
        { id: 1, modifiedDate: new Date('2019-09-04T09:13:12.177Z') },
        { id: 3, modifiedDate: new Date('2019-09-06T09:13:12.177Z') },
      ],
      notices: [{ id: 1, modifiedDate: new Date('2019-09-01T09:13:12.177Z') }],
      inspections: [],
    };

    const result = await xerceCaseHistoryService.createModifiedDatesHistory(
      agencyId,
      xerceCase,
      user,
      modifiedDates,
      transaction
    );
    expect(result).to.deep.equal(undefined);
  });
});

describe('XerceCaseHistory Service: createCaseCustomTileHistory Method', () => {
  let sandbox;
  let transaction;
  const agencyId = 1;
  const xerceCaseId = 1;
  let customTile: ICaseCustomTile;
  let customCaseFieldValues: object[];
  let editCaseTileRequest: object[];
  const user: IAgencyUserClaim | ISuperAdminClaim = {
    id: 5,
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
          11: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
          12: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
          13: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
          14: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
        },
      },
    },
  };
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    transaction = sinon.stub();
    customCaseFieldValues = [
      {
        1: {
          8: new Date('2019-09-05T09:13:12.177Z'),
          9: 'Input One',
          10: 'Input Two',
        },
        2: {
          11: 'Input three',
          12: 'Input four',
        },
      },
    ];
    editCaseTileRequest = [
      {
        1: {
          8: new Date('2019-09-03T09:13:12.177Z'),
          9: 'Input One Updated',
          10: 'Input Two',
        },
        2: {
          11: 'Input three',
          12: 'Input four',
        },
      },
    ];
    customTile = {
      id: 1,
      label: 'Property Lein',
      isActive: true,
      caseCustomFields: [
        {
          id: 8,
          label: 'Case Date',
          isActive: true,
          isMergeField: true,
          type: CustomFieldType.DATE,
          options: null,
          sequence: null,
        },
        {
          id: 9,
          label: 'Case Input 1',
          isActive: true,
          isMergeField: true,
          type: CustomFieldType.TEXT,
          options: null,
          sequence: null,
        },
        {
          id: 10,
          label: 'Case Input 2',
          isActive: true,
          isMergeField: true,
          type: CustomFieldType.TEXT,
          options: null,
          sequence: null,
        },
      ],
    };
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });
  it('should create case history for case custom tile', async () => {
    sandbox.stub(db.XerceCaseHistory, 'bulkCreate').resolves(undefined);

    sandbox
      .stub(ConfigCaseCustomTileService.prototype, 'getCaseCustomTile')
      .withArgs(agencyId, 1, transaction)
      .resolves(customTile);

    const result = await xerceCaseHistoryService.createCaseCustomTileHistory(
      agencyId,
      xerceCaseId,
      user,
      customCaseFieldValues,
      editCaseTileRequest,
      transaction
    );
    expect(result).to.deep.equal(undefined);
  });

  it('should return undefined if no field is updated', async () => {
    sandbox.stub(db.XerceCaseHistory, 'bulkCreate').resolves(undefined);

    editCaseTileRequest = [
      {
        1: {
          8: new Date('2019-09-05T09:13:12.177Z'),
          9: 'Input One',
          10: 'Input Two',
        },
        2: {
          11: 'Input three',
          12: 'Input four',
        },
      },
    ];

    sandbox
      .stub(ConfigCaseCustomTileService.prototype, 'getCaseCustomTile')
      .withArgs(agencyId, 1, transaction)
      .resolves(customTile);

    const result = await xerceCaseHistoryService.createCaseCustomTileHistory(
      agencyId,
      xerceCaseId,
      user,
      customCaseFieldValues,
      editCaseTileRequest,
      transaction
    );
    expect(result).to.deep.equal(undefined);
  });
});

describe('XerceCaseHistory Service: createPerformInspectionHistory Method', () => {
  let sandbox;
  let transaction;

  const agencyId = 1;
  const xerceCaseId = 1;
  const user: IAgencyUserClaim | ISuperAdminClaim = {
    id: 5,
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
          11: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
          12: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
          13: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
          14: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
        },
      },
    },
  };

  let caseViolations;
  let inspections: ICaseInspection[];
  let notice: IXerceCaseNotice;
  let performInspectionReq: IPerformInspectionRequest;
  let configXerceViolations: IConfigXerceViolation[];

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    transaction = sinon.stub();

    caseViolations = [
      {
        id: 1,
        configViolationId: 2,
        configViolationTypeId: 3,
      },
      {
        id: 2,
        configViolationId: 12,
        configViolationTypeId: 3,
      },
      {
        id: 3,
        configViolationId: 22,
        configViolationTypeId: 4,
      },
      {
        id: 4,
        configViolationId: 33,
        configViolationTypeId: 4,
      },
    ];

    const caseUser = {
      id: 2,
      firstName: 'John',
      lastName: 'Doe',
    };

    notice = {
      id: 11,
      noticeContent: [
        {
          0: 'My Notice',
        },
      ],
      issuedAt: new Date('2019-09-03T09:13:12.177Z'),
      mergedFields: {},
      note: null,
      configNotice: {
        id: 22,
        label: 'Final Notice',
        proposeForcedAbatement: true,
      },
      certifiedMailNumber: '1234567890',
      noticeNumber: 'NOT-123',
      createdBy: caseUser,
      updatedBy: caseUser,
      createdAt: new Date('2019-09-03T09:13:12.177Z'),
      updatedAt: new Date('2019-09-03T09:13:12.177Z'),
    };

    inspections = [
      {
        id: 1,
        name: 'Follow-up Inspection',
        dueDate: new Date('2019-09-03T09:13:12.177Z'),
        actualDate: new Date('2019-09-03T09:13:12.177Z'),
        assignee: caseUser,
        note: null,
        notice,
        isNoNoticeChosen: false,
        createdAt: new Date('2019-09-03T09:13:12.177Z'),
        createdBy: caseUser,
        closedBy: caseUser,
        closedAt: new Date('2019-09-03T09:13:12.177Z'),
        updatedAt: new Date('2019-09-03T09:13:12.177Z'),
        updatedBy: caseUser,
      },
    ];

    performInspectionReq = {
      existingViolations: [
        {
          caseViolationId: 1,
          status: XerceViolationStatus.OPEN,
          complyByDate: new Date('2019-03-05T16:23:14.912Z'),
          entity: {
            'Animal Colour': 'Red',
            'License Number': '2345',
            Age: 1,
            Breed: 'breedA',
            Note: 'This animal is a pet cat',
          },
        },
        {
          caseViolationId: 2,
          status: XerceViolationStatus.CLOSED_INVALID,
          configDispositionId: 1,
          complyByDate: new Date('2019-03-05T16:23:14.912Z'),
          entity: {
            'Animal Colour': 'Red',
            'License Number': '2345',
            Age: 1,
            Breed: 'breedA',
            Note: 'This animal is a pet cat',
          },
        },
      ],
      newViolations: [
        {
          configViolationId: 22,
          status: XerceViolationStatus.CLOSED_INVALID,
          configDispositionId: 1,
          entity: {
            'Animal Colour': 'Black',
            'License Number': '2345',
            Age: 4,
            Breed: '',
            Note: '',
          },
        },
        {
          configViolationId: 33,
          status: XerceViolationStatus.OPEN,
          complyByDate: new Date('2019-03-05T16:23:14.912Z'),
          entity: {
            'Animal Colour': 'Black',
            'License Number': '2345',
            Age: 4,
            Breed: '',
            Note: '',
          },
        },
      ],
      noteContent: 'This is my inspection note!',
      attachments: [
        {
          title: 'This is PNG attachment ',
          description: 'this is a description',
          fileName: 'This is a file name1',
          fileSize: '20KB',
          fileURL:
            'https://cyberdyne-dev.s3.amazonaws.com/agency_1/staging/cases/actionspopup.png',
        },
      ],
      scheduledInspection: {
        plannedDate: new Date('2020-03-05T16:23:14.912Z'),
        assigneeId: 1,
      },
      notice: {
        certifiedMailNumber: '1234567890',
        issuedAt: new Date('2020-03-05T16:23:14.912Z'),
        configNoticeId: 1,
        noticeContent: ['<p>This is a test</p>', '<p>This is also a test</p>'],
      },
      caseAssigneeId: null,
    };

    configXerceViolations = [
      {
        id: 2,
        label: 'Animal Bark',
        configViolationTypeId: 3,
        configMunicipalCodeId: 1,
        complyByDays: 5,
        isActive: true,
        sequence: 1,
      },
      {
        id: 12,
        label: 'Animal Bite',
        configViolationTypeId: 3,
        configMunicipalCodeId: 1,
        complyByDays: 5,
        isActive: true,
        sequence: 1,
      },
      {
        id: 22,
        label: 'Vehicle Pollution',
        configViolationTypeId: 4,
        configMunicipalCodeId: 1,
        complyByDays: 5,
        isActive: true,
        sequence: 1,
      },
      {
        id: 33,
        label: 'Vehicle Pressure Horn',
        configViolationTypeId: 4,
        configMunicipalCodeId: 1,
        complyByDays: 5,
        isActive: true,
        sequence: 1,
      },
    ];
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('should create perform inspection history', async () => {
    sandbox.stub(db.XerceCaseHistory, 'bulkCreate');

    sandbox
      .stub(ConfigViolationService.prototype, 'getAll')
      .withArgs(agencyId)
      .resolves(configXerceViolations);

    await xerceCaseHistoryService
      .createPerformInspectionHistory(
        agencyId,
        xerceCaseId,
        user.id,
        caseViolations,
        inspections,
        notice,
        performInspectionReq,
        transaction
      )
      .catch(err => expect(err.name).to.be.equal('Error'));
  });
});

describe('XerceCaseHistory Service: createUpdateInspectionHistory Method', () => {
  let sandbox;
  let transaction;

  const agencyId = 1;
  const xerceCaseId = 1;

  let inspection;

  const user: IAgencyUserClaim | ISuperAdminClaim = {
    id: 5,
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
          11: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
          12: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
          13: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
          14: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
        },
      },
    },
  };

  const performInspectionEditReq: IInspectionRequest = {
    assigneeId: 2,
    plannedDate: new Date('2019-09-05T09:13:12.177Z'),
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    transaction = sinon.stub();

    inspection = {
      id: 1,
      name: 'Follow-up Inspection',
      plannedDate: new Date('2019-09-03T09:13:12.177Z'),
      assigneeId: 1,
      inspectionAssignee: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
      },
      isNoNoticeChosen: false,
      createdAt: new Date('2019-09-03T09:13:12.177Z'),
      createdBy: 12,
      closedBy: null,
      closedAt: new Date('2019-09-03T09:13:12.177Z'),
      updatedAt: new Date('2019-09-03T09:13:12.177Z'),
      updatedBy: 12,
    };
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('should create case history after updating inspection', async () => {
    sandbox.stub(db.XerceCaseHistory, 'bulkCreate');

    await xerceCaseHistoryService
      .createUpdateInspectionHistory(
        agencyId,
        xerceCaseId,
        performInspectionEditReq,
        inspection,
        inspection,
        user,
        transaction
      )
      .catch(err => expect(err.name).to.be.equal('Error'));
  });
});

describe('XerceCaseHistory Service: createContactHistory Method', () => {
  let sandbox;
  let transaction;

  const agencyId = 1;
  const xerceCaseId = 1;
  const contactName = 'John Doe';

  const user: IAgencyUserClaim | ISuperAdminClaim = {
    id: 5,
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
          11: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
          12: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
          13: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
          14: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
        },
      },
    },
  };

  let contactReq: IXerceCaseContactEditRequest;

  const caseContact: any = {
    id: 1,
    name: 'John Doe',
    isBillable: false,
    caseContactRole: {
      id: 1,
      label: 'Owner',
    },
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    transaction = sinon.stub();

    contactReq = {
      billableContact: true,
      caseRoleId: 2,
    };
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('should create case history for contact case role change', async () => {
    sandbox.stub(db.XerceCaseHistory, 'create');

    sandbox
      .stub(CaseRoleService.prototype, 'get')
      .withArgs(agencyId, contactReq.caseRoleId)
      .resolves({ id: contactReq.caseRoleId, label: 'Tenant' });

    await xerceCaseHistoryService
      .createContactHistory(
        agencyId,
        xerceCaseId,
        user.id,
        contactReq,
        caseContact,
        contactName,
        null,
        transaction
      )
      .catch(err => expect(err.name).to.be.equal('Error'));
  });

  it('should create case history for billing contact change', async () => {
    contactReq = {
      billableContact: false,
      caseRoleId: 2,
    };

    sandbox.stub(db.XerceCaseHistory, 'create');

    sandbox
      .stub(CaseRoleService.prototype, 'get')
      .withArgs(agencyId, contactReq.caseRoleId)
      .resolves({ id: contactReq.caseRoleId, label: 'Tenant' });

    await xerceCaseHistoryService
      .createContactHistory(
        agencyId,
        xerceCaseId,
        user.id,
        contactReq,
        caseContact,
        contactName,
        null,
        transaction
      )
      .catch(err => expect(err.name).to.be.equal('Error'));
  });

  it('should create case history for adding contact to case', async () => {
    sandbox.stub(db.XerceCaseHistory, 'create');

    sandbox
      .stub(CaseRoleService.prototype, 'get')
      .withArgs(agencyId, contactReq.caseRoleId)
      .resolves({ id: contactReq.caseRoleId, label: 'Tenant' });

    await xerceCaseHistoryService
      .createContactHistory(
        agencyId,
        xerceCaseId,
        user.id,
        contactReq,
        caseContact,
        contactName,
        CaseHistoryActions.CONTACT_ADDED,
        transaction
      )
      .catch(err => expect(err.name).to.be.equal('Error'));
  });

  it('should create case history for removing contact from case', async () => {
    sandbox.stub(db.XerceCaseHistory, 'create');

    sandbox
      .stub(CaseRoleService.prototype, 'get')
      .withArgs(agencyId, contactReq.caseRoleId)
      .resolves({ id: contactReq.caseRoleId, label: 'Tenant' });

    await xerceCaseHistoryService
      .createContactHistory(
        agencyId,
        xerceCaseId,
        user.id,
        contactReq,
        caseContact,
        contactName,
        CaseHistoryActions.CONTACT_REMOVED,
        transaction
      )
      .catch(err => expect(err.name).to.be.equal('Error'));
  });
});

describe('XerceCaseHistory Service: createMailNumberHistory Method', () => {
  let sandbox;
  let transaction;

  const agencyId = 1;
  const xerceCaseId = 1;
  const certifiedMailNumber = 'qwerty';
  const noticeName = 'Final Notice';

  const user: IAgencyUserClaim | ISuperAdminClaim = {
    id: 5,
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
          11: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
          12: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
          13: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
          14: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
        },
      },
    },
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    transaction = sinon.stub();
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('should create case history after updating certified mail number', async () => {
    sandbox.stub(db.XerceCaseHistory, 'create');

    await xerceCaseHistoryService
      .createMailNumberHistory(
        agencyId,
        xerceCaseId,
        user.id,
        certifiedMailNumber,
        noticeName,
        transaction
      )
      .catch(err => expect(err.name).to.be.equal('Error'));
  });
});

describe('XerceCaseHistory Service: createNotesHistory Method', () => {
  let sandbox;
  let transaction;

  const agencyId = 1;
  const xerceCaseId = 1;
  const noteContent = 'qwerty';

  const user: IAgencyUserClaim | ISuperAdminClaim = {
    id: 5,
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
          11: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
          12: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
          13: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
          14: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
        },
      },
    },
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    transaction = sinon.stub();
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('should create case history after updating case notes', async () => {
    sandbox.stub(db.XerceCaseHistory, 'create');

    await xerceCaseHistoryService
      .createNotesHistory(
        agencyId,
        xerceCaseId,
        user.id,
        noteContent,
        CaseHistoryActions.CASE_NOTE_MODIFIED,
        transaction
      )
      .catch(err => expect(err.name).to.be.equal('Error'));
  });
});

describe('XerceCaseHistory Service: bulkCreate Method', () => {
  let sandbox;
  let transaction;

  const agencyId = 1;
  const xerceCaseId = 1;

  const user: IAgencyUserClaim | ISuperAdminClaim = {
    id: 5,
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
          11: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
          12: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
          13: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
          14: {
            violationTypeAccess: ViolationTypeACL.OVERWRITE,
            isActive: true,
          },
        },
      },
    },
  };

  const historyObjAttrs = [
    {
      agencyId,
      xerceCaseId,
      userId: user.id,
      action: CaseHistoryActions.CASE_NOTE_MODIFIED,
      description: 'Case Note Modified',
    },
  ];

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    transaction = sinon.stub();
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('should create case history after updating case notes', async () => {
    sandbox.stub(db.XerceCaseHistory, 'bulkCreate').throws('Error');

    await (xerceCaseHistoryService as any)
      .bulkCreate(historyObjAttrs, transaction)
      .catch(err => expect(err.name).to.be.equal('InternalServerError'));
  });
});
