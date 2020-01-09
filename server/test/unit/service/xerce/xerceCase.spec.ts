import 'mocha';

import { expect } from 'chai';
import * as sinon from 'sinon';

import db from '../../../../api/models';
import XerceService from '../../../../api/service/admin/xerce';
import ConfigDispositionService from '../../../../api/service/agencySetup/configDisposition';
import ConfigViolationService from '../../../../api/service/agencySetup/configViolation';
import LocationService from '../../../../api/service/caseLocation';
import S3Service from '../../../../api/service/common/s3';
import UserService from '../../../../api/service/user/user';
import XerceCaseListingService from '../../../../api/service/xerce/caseListing';
import XerceCaseService from '../../../../api/service/xerce/xerceCase';
import XerceCaseAbatementService from '../../../../api/service/xerce/xerceCaseAbatement';
import XerceCaseAttachmentService from '../../../../api/service/xerce/xerceCaseAttachment';
import XerceCaseContactService from '../../../../api/service/xerce/xerceCaseContact';
import XerceCaseHistoryService from '../../../../api/service/xerce/xerceCaseHistory';
import XerceCaseInspectionService from '../../../../api/service/xerce/xerceCaseInspection';
import XerceCaseStatusActivityService from '../../../../api/service/xerce/xerceCaseStatusActivity';
import XerceCaseTileService from '../../../../api/service/xerce/xerceCaseTile';
import XerceCaseViolationService from '../../../../api/service/xerce/xerceCaseViolation';
import DBUtil from '../../../../api/utils/dbUtil';

const xerceCaseService = new XerceCaseService();

describe('xerceCase Service: getSummary Method', () => {
  let sandbox;
  let caseSummary: ICaseSummary;
  let xerceCase;
  let createdBy: ICaseUser;
  let caseAssignee: ICaseUser;
  let result;
  let transaction;
  const caseId = 1;
  const agencyId = 4;
  const timezone = 'PST';

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    transaction = sinon.stub();

    createdBy = {
      id: 1,
      firstName: 'johne',
      lastName: 'Doe',
    };

    caseAssignee = {
      id: 2,
      firstName: 'Jane',
      lastName: 'Doe',
    };

    xerceCase = {
      id: caseId,
      agencyId,
      assigneeId: caseAssignee.id,
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
      createdByUser: createdBy,
      caseAssignee,
      closedByUser: null,
      closedAt: null,
      createdAt: new Date('2019-02-16T06:29:32.814Z'),
      updatedAt: new Date('2019-02-16T06:29:32.814Z'),
    };

    caseSummary = {
      caseNumber: '#CE-19-2',
      status: 'OPEN',
      hoursLogged: 2.0,
      abatementStage: AbatementStage.VERIFICATION_PENDING,
      caseAge: 2,
      createdBy,
      caseAssignee,
      createdAt: new Date('2019-02-16T06:29:32.814Z'),
      updatedAt: new Date('2019-02-16T06:29:32.814Z'),
      closedBy: null,
      closedAt: null,
    };
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 with case details', async () => {
    sandbox
      .stub(db.XerceCase, 'findOne')
      .withArgs({
        where: { id: caseId },
        include: [
          {
            model: db.User,
            as: 'createdByUser',
            attributes: ['id', 'firstName', 'lastName'],
          },
          {
            model: db.User,
            as: 'caseAssignee',
            attributes: ['id', 'firstName', 'lastName'],
          },
          {
            model: db.User,
            as: 'closedByUser',
            attributes: ['id', 'firstName', 'lastName'],
          },
        ],
        transaction,
      })
      .resolves(xerceCase);

    sandbox
      .stub(XerceCaseService.prototype, 'createCaseSummaryRespObj')
      .withArgs(xerceCase, timezone)
      .returns(caseSummary);

    result = await xerceCaseService.getCaseSummary(
      caseId,
      timezone,
      transaction
    );

    expect(result).to.deep.equal(caseSummary, 'response did not match');
  });

  it('Should return status code 400 for case does not exist', async () => {
    sandbox
      .stub(db.XerceCase, 'findOne')
      .withArgs({
        where: { id: caseId },
        include: [
          {
            model: db.User,
            as: 'createdByUser',
            attributes: ['id', 'firstName', 'lastName'],
          },
          {
            model: db.User,
            as: 'caseAssignee',
            attributes: ['id', 'firstName', 'lastName'],
          },
          {
            model: db.User,
            as: 'closedByUser',
            attributes: ['id', 'firstName', 'lastName'],
          },
        ],
        transaction,
      })
      .returns(null);

    await xerceCaseService
      .getCaseSummary(caseId, timezone, transaction)
      .catch(err => {
        expect(err.name).to.deep.equal('DBMissingEntityError');
        expect(err.message).to.deep.equal('Could not find the Xere case.');
      });
  });

  it('Should return status code 400 if throws an exception', async () => {
    sandbox
      .stub(db.XerceCase, 'findOne')
      .withArgs({
        where: { id: caseId },
        include: [
          {
            model: db.User,
            as: 'createdByUser',
            attributes: ['id', 'firstName', 'lastName'],
          },
          {
            model: db.User,
            as: 'caseAssignee',
            attributes: ['id', 'firstName', 'lastName'],
          },
          {
            model: db.User,
            as: 'closedByUser',
            attributes: ['id', 'firstName', 'lastName'],
          },
        ],
        transaction,
      })
      .throws({ name: 'Error' });

    await xerceCaseService
      .getCaseSummary(caseId, timezone, transaction)
      .catch(err => {
        expect(err.name).to.deep.equal('InternalServerError');
        expect(err.message).to.deep.equal(
          'Something went wrong. Please try again later.'
        );
      });
  });
});

describe('XerceCase Service: closeCase method', () => {
  let sandbox;
  let transaction;
  const agencyId = 1;
  const caseId = 1;
  const xerceCaseObj: IXerceCaseAttributes = {
    closedAt: new Date(),
    closedBy: 1,
    status: XerceCaseStatus.CLOSED,
    abatementStage: 'Voluntary',
  };

  const abatementStage = 'Voluntary';

  const authScope = {
    comcateAdmin: true,
    siteAdmin: true,
  };

  const userProfile: IAgencyUserClaim = {
    agencyName: 'City of Alabama',
    id: 11,
    agencyId,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@gmail.com',
    scopes: authScope,
    agencyTimezone: 'PST',
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    transaction = sinon.stub();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should close the case with success', async () => {
    sandbox
      .stub(XerceCaseAbatementService.prototype, 'setAbatementStage')
      .withArgs(agencyId, caseId, abatementStage, transaction);

    sandbox.stub(db.XerceCase, 'update').withArgs(xerceCaseObj, {
      where: {
        agencyId,
        id: caseId,
      },
      transaction,
    });

    sandbox
      .stub(XerceCaseStatusActivityService.prototype, 'create')
      .withArgs(
        agencyId,
        caseId,
        XerceCaseStatus.CLOSED,
        userProfile.id,
        transaction
      );

    await new XerceCaseService().closeCase(
      agencyId,
      caseId,
      userProfile.id,
      abatementStage,
      transaction
    );
  });

  it('should throw error while closing the case', async () => {
    sandbox
      .stub(XerceCaseAbatementService.prototype, 'setAbatementStage')
      .withArgs(agencyId, caseId, abatementStage, transaction);

    sandbox
      .stub(db.XerceCase, 'update')
      .withArgs(xerceCaseObj, {
        where: {
          agencyId,
          id: caseId,
        },
        transaction,
      })
      .throws('Error');

    await new XerceCaseService()
      .closeCase(agencyId, caseId, userProfile.id, 'Voluntary', transaction)
      .catch(err => expect(err.name).to.equal('InternalServerError'));
  });
});

describe('xerceCase Service: getAll Method', () => {
  let sandbox;
  let xerceCasesInstance;
  let assignee: ICaseUser;
  let result;
  let xerceCases;
  const agencyId = 4;
  let queryParams: ICaseListQueryParams;
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

    queryParams = {
      caseAssigneeId: 22,
      searchQuery: 'CE-19',
      violationTypeIds: [11, 12],
      violationIds: [1, 2],
      forcedAbatementActivityIds: [1],
      caseStatus: CaseStatusFilter.OPEN,
      openAbatementStages: [AbatementStage.VERIFICATION_PENDING],
      closedAbatementStages: [AbatementStage.INVALID],
      createdCaseStartDate: new Date('2019-03-05T16:23:14.912Z'),
      createdCaseEndDate: new Date('2019-03-05T16:23:14.912Z'),
      closedCaseStartDate: new Date('2019-03-05T16:23:14.912Z'),
      closedCaseEndDate: new Date('2019-03-05T16:23:14.912Z'),
      inspectionAssigneeIds: [1],
      nextScheduledInspectionStartDate: new Date('2019-03-05T16:23:14.912Z'),
      nextScheduledInspectionEndDate: new Date('2019-03-05T16:23:14.912Z'),
      lastCompletedInspectionStartDate: new Date('2019-03-05T16:23:14.912Z'),
      lastCompletedInspectionEndDate: new Date('2019-03-05T16:23:14.912Z'),
      sortBy: CaseListSortParams.CASE_CREATED_AT,
      sortOrder: SortOrder.ASC,
      limit: 3,
      offset: 0,
    };

    assignee = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
    };

    xerceCasesInstance = [
      {
        id: 101,
        caseNumber: 'CE-19-1',
        status: 'OPEN',
        total: 10,
        abatementStage: AbatementStage.VERIFICATION_PENDING,
        location: '547,Alabama, Alabama, AL, 94016',
        caseAssignee: 'John Doe',
        createdAt: '2019-02-16T06:29:32.814Z',
        updatedAt: '2019-02-16T06:29:32.814Z',
        closedAt: null,
        isMigratedCase: true,
        contacts:
          'abc user,Janet Doe,zuser,Ayush Bhadauria,tenant,john dow,xvx',
        migratedCaseURL:
          'https://comcate-jira.atlassian.net/browse/CYBERD-2365',
        inspectionAssignee: 'John Doe',
        nextScheduledInspection: '2019-04-24T07:00:00.000Z',
        lastCompletedInspection: '2019-04-04T17:51:09.851Z',
        violationTypes: ['https://app-stage.comcateprime.com/icons/animal.png'],
        violations: ['Animal Control'],
        configViolationTypeLabels: ['Animal'],
        forcedAbatementActivities: 'Property Lien, Court Hearing',
      },
      {
        id: 102,
        caseNumber: 'CE-19-2',
        status: 'OPEN',
        total: 10,
        abatementStage: AbatementStage.VERIFICATION_PENDING,
        location: '547,Alabama, Alabama, AL, 94016',
        caseAssignee: assignee,
        isMigratedCase: false,
        migratedCaseURL: null,
        createdAt: '2019-02-16T06:29:32.814Z',
        updatedAt: '2019-02-16T06:29:32.814Z',
        closedAt: null,
        contacts:
          'abc user,Janet Doe,zuser,Ayush Bhadauria,tenant,john dow,xvx',
        inspectionAssignee: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
        },
        nextScheduledInspection: '2019-04-24T07:00:00.000Z',
        lastCompletedInspection: '2019-04-04T17:51:09.851Z',
        violationTypes: ['https://app-stage.comcateprime.com/icons/animal.png'],
        violations: ['Animal Control'],
        configViolationTypeLabels: ['Animal'],
        forcedAbatementActivities: 'Property Lien, Court Hearing',
      },
      {
        id: 103,
        caseNumber: 'CE-19-3',
        status: 'OPEN',
        total: 10,
        abatementStage: AbatementStage.VERIFICATION_PENDING,
        location: '547,Alabama, Alabama, AL, 94016',
        caseAssignee: assignee,
        createdAt: '2019-02-16T06:29:32.814Z',
        updatedAt: '2019-02-16T06:29:32.814Z',
        closedAt: null,
        contacts:
          'abc user,Janet Doe,zuser,Ayush Bhadauria,tenant,john dow,xvx',
        isMigratedCase: false,
        migratedCaseURL: null,
        inspectionAssignee: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
        },
        nextScheduledInspection: '2019-04-24T07:00:00.000Z',
        lastCompletedInspection: '2019-04-04T17:51:09.851Z',
        violationTypes: [
          'https://app-stage.comcateprime.com/icons/vehicle.png',
        ],
        violations: ['Vehicle Control'],
        configViolationTypeLabels: ['Vehicle'],
        forcedAbatementActivities: 'Property Lien, Court Hearing',
      },
    ];

    xerceCases = {
      data: [
        {
          id: 101,
          caseNumber: 'CE-19-1',
          status: 'OPEN',
          abatementStage: AbatementStage.VERIFICATION_PENDING,
          location: '547,Alabama, Alabama, AL, 94016',
          caseAssignee: 'John Doe',
          createdAt: '2019-02-16T06:29:32.814Z',
          updatedAt: '2019-02-16T06:29:32.814Z',
          closedAt: null,
          contacts:
            'abc user,Janet Doe,zuser,Ayush Bhadauria,tenant,john dow,xvx',
          isMigratedCase: true,
          migratedCaseURL:
            'https://comcate-jira.atlassian.net/browse/CYBERD-2365',
          inspectionAssignee: 'John Doe',
          nextScheduledInspection: '2019-04-24T07:00:00.000Z',
          lastCompletedInspection: '2019-04-04T17:51:09.851Z',
          violationTypes: [
            'https://app-stage.comcateprime.com/icons/animal.png',
          ],
          violations: ['Animal Control'],
          configViolationTypeLabels: ['Animal'],
          forcedAbatementActivities: 'Property Lien, Court Hearing',
        },
        {
          id: 102,
          caseNumber: 'CE-19-2',
          status: 'OPEN',
          abatementStage: AbatementStage.VERIFICATION_PENDING,
          location: '547,Alabama, Alabama, AL, 94016',
          caseAssignee: assignee,
          isMigratedCase: false,
          migratedCaseURL: null,
          createdAt: '2019-02-16T06:29:32.814Z',
          updatedAt: '2019-02-16T06:29:32.814Z',
          closedAt: null,
          contacts:
            'abc user,Janet Doe,zuser,Ayush Bhadauria,tenant,john dow,xvx',
          inspectionAssignee: {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
          },
          nextScheduledInspection: '2019-04-24T07:00:00.000Z',
          lastCompletedInspection: '2019-04-04T17:51:09.851Z',
          violationTypes: [
            'https://app-stage.comcateprime.com/icons/animal.png',
          ],
          violations: ['Animal Control'],
          configViolationTypeLabels: ['Animal'],
          forcedAbatementActivities: 'Property Lien, Court Hearing',
        },
        {
          id: 103,
          caseNumber: 'CE-19-3',
          status: 'OPEN',
          abatementStage: AbatementStage.VERIFICATION_PENDING,
          location: '547,Alabama, Alabama, AL, 94016',
          caseAssignee: assignee,
          createdAt: '2019-02-16T06:29:32.814Z',
          updatedAt: '2019-02-16T06:29:32.814Z',
          closedAt: null,
          contacts:
            'abc user,Janet Doe,zuser,Ayush Bhadauria,tenant,john dow,xvx',
          isMigratedCase: false,
          migratedCaseURL: null,
          inspectionAssignee: {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
          },
          nextScheduledInspection: '2019-04-24T07:00:00.000Z',
          lastCompletedInspection: '2019-04-04T17:51:09.851Z',
          violationTypes: [
            'https://app-stage.comcateprime.com/icons/vehicle.png',
          ],
          violations: ['Vehicle Control'],
          configViolationTypeLabels: ['Vehicle'],
          forcedAbatementActivities: 'Property Lien, Court Hearing',
        },
      ],
      count: 10,
    };
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 with all case details', async () => {
    sandbox.stub(db.sequelize, 'query').resolves(xerceCasesInstance);
    result = await xerceCaseService.getAll(agencyId, user, queryParams);

    expect(result).to.deep.equal(xerceCases, 'response did not match');
  });

  it('Should return status code 200 with all case details with open abatement stages', async () => {
    queryParams = {
      caseAssigneeId: 22,
      searchQuery: 'CE-19',
      violationTypeIds: [11, 12],
      violationIds: [1, 2],
      forcedAbatementActivityIds: [1],
      caseStatus: CaseStatusFilter.OPEN,
      openAbatementStages: [AbatementStage.VERIFICATION_PENDING],
      createdCaseStartDate: new Date('2019-03-05T16:23:14.912Z'),
      createdCaseEndDate: new Date('2019-03-05T16:23:14.912Z'),
      closedCaseStartDate: new Date('2019-03-05T16:23:14.912Z'),
      closedCaseEndDate: new Date('2019-03-05T16:23:14.912Z'),
      inspectionAssigneeIds: [1],
      nextScheduledInspectionStartDate: new Date('2019-03-05T16:23:14.912Z'),
      nextScheduledInspectionEndDate: new Date('2019-03-05T16:23:14.912Z'),
      lastCompletedInspectionStartDate: new Date('2019-03-05T16:23:14.912Z'),
      lastCompletedInspectionEndDate: new Date('2019-03-05T16:23:14.912Z'),
      sortBy: CaseListSortParams.CASE_CREATED_AT,
      sortOrder: SortOrder.ASC,
      limit: 3,
      offset: 0,
    };

    sandbox.stub(db.sequelize, 'query').resolves(xerceCasesInstance);
    result = await xerceCaseService.getAll(agencyId, user, queryParams);

    expect(result).to.deep.equal(xerceCases, 'response did not match');
  });

  it('Should return status code 200 with all case details with open abatement stages', async () => {
    queryParams = {
      caseAssigneeId: 22,
      searchQuery: 'CE-19',
      violationTypeIds: [11, 12],
      violationIds: [1, 2],
      forcedAbatementActivityIds: [1],
      caseStatus: CaseStatusFilter.OPEN,
      closedAbatementStages: [AbatementStage.INVALID],
      createdCaseStartDate: new Date('2019-03-05T16:23:14.912Z'),
      createdCaseEndDate: new Date('2019-03-05T16:23:14.912Z'),
      closedCaseStartDate: new Date('2019-03-05T16:23:14.912Z'),
      closedCaseEndDate: new Date('2019-03-05T16:23:14.912Z'),
      inspectionAssigneeIds: [1],
      nextScheduledInspectionStartDate: new Date('2019-03-05T16:23:14.912Z'),
      nextScheduledInspectionEndDate: new Date('2019-03-05T16:23:14.912Z'),
      lastCompletedInspectionStartDate: new Date('2019-03-05T16:23:14.912Z'),
      lastCompletedInspectionEndDate: new Date('2019-03-05T16:23:14.912Z'),
      sortBy: CaseListSortParams.CASE_CREATED_AT,
      sortOrder: SortOrder.ASC,
      limit: 3,
      offset: 0,
    };
    sandbox.stub(db.sequelize, 'query').resolves(xerceCasesInstance);
    result = await xerceCaseService.getAll(agencyId, user, queryParams);

    expect(result).to.deep.equal(xerceCases, 'response did not match');
  });

  it('Should return status code 200 with all case details sort by location', async () => {
    queryParams = {
      caseAssigneeId: 22,
      searchQuery: 'CE-19',
      violationTypeIds: [11, 12],
      violationIds: [1, 2],
      forcedAbatementActivityIds: [1],
      caseStatus: CaseStatusFilter.CLOSED,
      createdCaseStartDate: new Date('2019-03-05T16:23:14.912Z'),
      createdCaseEndDate: new Date('2019-03-05T16:23:14.912Z'),
      closedCaseStartDate: new Date('2019-03-05T16:23:14.912Z'),
      closedCaseEndDate: new Date('2019-03-05T16:23:14.912Z'),
      inspectionAssigneeIds: [1],
      nextScheduledInspectionStartDate: new Date('2019-03-05T16:23:14.912Z'),
      nextScheduledInspectionEndDate: new Date('2019-03-05T16:23:14.912Z'),
      lastCompletedInspectionStartDate: new Date('2019-03-05T16:23:14.912Z'),
      lastCompletedInspectionEndDate: new Date('2019-03-05T16:23:14.912Z'),
      sortBy: CaseListSortParams.LOCATION,
      sortOrder: SortOrder.ASC,
      limit: 3,
      offset: 0,
    };

    sandbox.stub(db.sequelize, 'query').resolves(xerceCasesInstance);
    result = await xerceCaseService.getAll(agencyId, user, queryParams);

    expect(result).to.deep.equal(xerceCases, 'response did not match');
  });

  it('Should return status code 200 with all case details sort by hours logged', async () => {
    queryParams = {
      caseAssigneeId: 22,
      searchQuery: 'CE-19',
      violationTypeIds: [11, 12],
      violationIds: [1, 2],
      forcedAbatementActivityIds: [1],
      caseStatus: CaseStatusFilter.CLOSED,
      createdCaseStartDate: new Date('2019-03-05T16:23:14.912Z'),
      createdCaseEndDate: new Date('2019-03-05T16:23:14.912Z'),
      closedCaseStartDate: new Date('2019-03-05T16:23:14.912Z'),
      closedCaseEndDate: new Date('2019-03-05T16:23:14.912Z'),
      inspectionAssigneeIds: [1],
      nextScheduledInspectionStartDate: new Date('2019-03-05T16:23:14.912Z'),
      nextScheduledInspectionEndDate: new Date('2019-03-05T16:23:14.912Z'),
      lastCompletedInspectionStartDate: new Date('2019-03-05T16:23:14.912Z'),
      lastCompletedInspectionEndDate: new Date('2019-03-05T16:23:14.912Z'),
      sortBy: CaseListSortParams.HOURS_LOGGED,
      sortOrder: SortOrder.ASC,
      limit: 3,
      offset: 0,
    };

    sandbox.stub(db.sequelize, 'query').resolves(xerceCasesInstance);
    result = await xerceCaseService.getAll(agencyId, user, queryParams);

    expect(result).to.deep.equal(xerceCases, 'response did not match');
  });

  it('Should return status code 200 with all case details sort by contacts', async () => {
    queryParams = {
      caseAssigneeId: 22,
      searchQuery: 'CE-19',
      violationTypeIds: [11, 12],
      violationIds: [1, 2],
      forcedAbatementActivityIds: [1],
      caseStatus: CaseStatusFilter.OPEN,
      createdCaseStartDate: new Date('2019-03-05T16:23:14.912Z'),
      createdCaseEndDate: new Date('2019-03-05T16:23:14.912Z'),
      closedCaseStartDate: new Date('2019-03-05T16:23:14.912Z'),
      closedCaseEndDate: new Date('2019-03-05T16:23:14.912Z'),
      inspectionAssigneeIds: [1],
      nextScheduledInspectionStartDate: new Date('2019-03-05T16:23:14.912Z'),
      nextScheduledInspectionEndDate: new Date('2019-03-05T16:23:14.912Z'),
      lastCompletedInspectionStartDate: new Date('2019-03-05T16:23:14.912Z'),
      lastCompletedInspectionEndDate: new Date('2019-03-05T16:23:14.912Z'),
      sortBy: CaseListSortParams.CONTACTS,
      sortOrder: SortOrder.ASC,
      limit: 3,
      offset: 0,
    };

    sandbox.stub(db.sequelize, 'query').resolves(xerceCasesInstance);
    result = await xerceCaseService.getAll(agencyId, user, queryParams);

    expect(result).to.deep.equal(xerceCases, 'response did not match');
  });
  it('Should return status code 200 with all case details sort by contacts', async () => {
    queryParams = {
      caseAssigneeId: 22,
      searchQuery: 'CE-19',
      violationTypeIds: [11, 12],
      violationIds: [1, 2],
      forcedAbatementActivityIds: [1],
      caseStatus: CaseStatusFilter.OPEN,
      createdCaseStartDate: new Date('2019-03-05T16:23:14.912Z'),
      createdCaseEndDate: new Date('2019-03-05T16:23:14.912Z'),
      closedCaseStartDate: new Date('2019-03-05T16:23:14.912Z'),
      closedCaseEndDate: new Date('2019-03-05T16:23:14.912Z'),
      inspectionAssigneeIds: [1],
      nextScheduledInspectionStartDate: new Date('2019-03-05T16:23:14.912Z'),
      nextScheduledInspectionEndDate: new Date('2019-03-05T16:23:14.912Z'),
      lastCompletedInspectionStartDate: new Date('2019-03-05T16:23:14.912Z'),
      lastCompletedInspectionEndDate: new Date('2019-03-05T16:23:14.912Z'),
      sortBy: CaseListSortParams.CONTACTS,
      sortOrder: SortOrder.ASC,
      limit: 3,
      offset: 0,
    };

    sandbox.stub(db.sequelize, 'query').resolves(xerceCasesInstance);
    result = await xerceCaseService.getAll(agencyId, user, queryParams);

    expect(result).to.deep.equal(xerceCases, 'response did not match');
  });

  it('Should return status code 200 with all case details sort by case closed', async () => {
    queryParams = {
      caseAssigneeId: 22,
      searchQuery: 'CE-19',
      violationTypeIds: [11, 12],
      violationIds: [1, 2],
      forcedAbatementActivityIds: [1],
      caseStatus: CaseStatusFilter.OPEN,
      createdCaseStartDate: new Date('2019-03-05T16:23:14.912Z'),
      createdCaseEndDate: new Date('2019-03-05T16:23:14.912Z'),
      closedCaseStartDate: new Date('2019-03-05T16:23:14.912Z'),
      closedCaseEndDate: new Date('2019-03-05T16:23:14.912Z'),
      inspectionAssigneeIds: [1],
      nextScheduledInspectionStartDate: new Date('2019-03-05T16:23:14.912Z'),
      nextScheduledInspectionEndDate: new Date('2019-03-05T16:23:14.912Z'),
      lastCompletedInspectionStartDate: new Date('2019-03-05T16:23:14.912Z'),
      lastCompletedInspectionEndDate: new Date('2019-03-05T16:23:14.912Z'),
      sortBy: CaseListSortParams.CASE_CLOSED_AT,
      sortOrder: SortOrder.ASC,
      limit: 3,
      offset: 0,
    };

    sandbox.stub(db.sequelize, 'query').resolves(xerceCasesInstance);
    result = await xerceCaseService.getAll(agencyId, user, queryParams);

    expect(result).to.deep.equal(xerceCases, 'response did not match');
  });

  it('Should return status code 200 with all case details sort by status', async () => {
    queryParams = {
      caseAssigneeId: 22,
      searchQuery: 'CE-19',
      violationTypeIds: [11, 12],
      violationIds: [1, 2],
      forcedAbatementActivityIds: [1],
      caseStatus: CaseStatusFilter.OPEN,
      createdCaseStartDate: new Date('2019-03-05T16:23:14.912Z'),
      createdCaseEndDate: new Date('2019-03-05T16:23:14.912Z'),
      closedCaseStartDate: new Date('2019-03-05T16:23:14.912Z'),
      closedCaseEndDate: new Date('2019-03-05T16:23:14.912Z'),
      inspectionAssigneeIds: [1],
      nextScheduledInspectionStartDate: new Date('2019-03-05T16:23:14.912Z'),
      nextScheduledInspectionEndDate: new Date('2019-03-05T16:23:14.912Z'),
      lastCompletedInspectionStartDate: new Date('2019-03-05T16:23:14.912Z'),
      lastCompletedInspectionEndDate: new Date('2019-03-05T16:23:14.912Z'),
      sortBy: CaseListSortParams.CASE_STATUS,
      sortOrder: SortOrder.ASC,
      limit: 3,
      offset: 0,
    };

    sandbox.stub(db.sequelize, 'query').resolves(xerceCasesInstance);
    result = await xerceCaseService.getAll(agencyId, user, queryParams);

    expect(result).to.deep.equal(xerceCases, 'response did not match');
  });

  it('Should return status code 200 with all case details sort by last completed inspection', async () => {
    queryParams = {
      caseAssigneeId: 22,
      searchQuery: 'CE-19',
      violationTypeIds: [11, 12],
      violationIds: [1, 2],
      forcedAbatementActivityIds: [1],
      caseStatus: CaseStatusFilter.OPEN,
      createdCaseStartDate: new Date('2019-03-05T16:23:14.912Z'),
      createdCaseEndDate: new Date('2019-03-05T16:23:14.912Z'),
      closedCaseStartDate: new Date('2019-03-05T16:23:14.912Z'),
      closedCaseEndDate: new Date('2019-03-05T16:23:14.912Z'),
      inspectionAssigneeIds: [1],
      nextScheduledInspectionStartDate: new Date('2019-03-05T16:23:14.912Z'),
      nextScheduledInspectionEndDate: new Date('2019-03-05T16:23:14.912Z'),
      lastCompletedInspectionStartDate: new Date('2019-03-05T16:23:14.912Z'),
      lastCompletedInspectionEndDate: new Date('2019-03-05T16:23:14.912Z'),
      sortBy: CaseListSortParams.LAST_COMPLETED_INSPECTION,
      sortOrder: SortOrder.ASC,
      limit: 3,
      offset: 0,
    };

    sandbox.stub(db.sequelize, 'query').resolves(xerceCasesInstance);
    result = await xerceCaseService.getAll(agencyId, user, queryParams);

    expect(result).to.deep.equal(xerceCases, 'response did not match');
  });

  it('Should return status code 200 with all case details sort by next scheduled inspection', async () => {
    queryParams = {
      caseAssigneeId: 22,
      searchQuery: 'CE-19',
      violationTypeIds: [11, 12],
      violationIds: [1, 2],
      forcedAbatementActivityIds: [1],
      caseStatus: CaseStatusFilter.OPEN,
      createdCaseStartDate: new Date('2019-03-05T16:23:14.912Z'),
      createdCaseEndDate: new Date('2019-03-05T16:23:14.912Z'),
      closedCaseStartDate: new Date('2019-03-05T16:23:14.912Z'),
      closedCaseEndDate: new Date('2019-03-05T16:23:14.912Z'),
      inspectionAssigneeIds: [1],
      nextScheduledInspectionStartDate: new Date('2019-03-05T16:23:14.912Z'),
      nextScheduledInspectionEndDate: new Date('2019-03-05T16:23:14.912Z'),
      lastCompletedInspectionStartDate: new Date('2019-03-05T16:23:14.912Z'),
      lastCompletedInspectionEndDate: new Date('2019-03-05T16:23:14.912Z'),
      sortBy: CaseListSortParams.NEXT_SCHEDULED_INSPECTION,
      sortOrder: SortOrder.ASC,
      limit: 3,
      offset: 0,
    };

    sandbox.stub(db.sequelize, 'query').resolves(xerceCasesInstance);
    result = await xerceCaseService.getAll(agencyId, user, queryParams);

    expect(result).to.deep.equal(xerceCases, 'response did not match');
  });

  it('Should throw validation error for missing created case start & end date', async () => {
    queryParams = {
      caseAssigneeId: 22,
      searchQuery: 'CE-19',
      violationTypeIds: [11, 12],
      violationIds: [1, 2],
      forcedAbatementActivityIds: [1],
      caseStatus: CaseStatusFilter.OPEN,
      createdCaseStartDate: new Date('2019-03-05T16:23:14.912Z'),
      closedCaseStartDate: new Date('2019-03-05T16:23:14.912Z'),
      closedCaseEndDate: new Date('2019-03-05T16:23:14.912Z'),
      inspectionAssigneeIds: [1],
      nextScheduledInspectionStartDate: new Date('2019-03-05T16:23:14.912Z'),
      nextScheduledInspectionEndDate: new Date('2019-03-05T16:23:14.912Z'),
      lastCompletedInspectionStartDate: new Date('2019-03-05T16:23:14.912Z'),
      lastCompletedInspectionEndDate: new Date('2019-03-05T16:23:14.912Z'),
      sortBy: CaseListSortParams.CASE_CREATED_AT,
      sortOrder: SortOrder.ASC,
      limit: 3,
      offset: 0,
    };

    await xerceCaseService.getAll(agencyId, user, queryParams).catch(err => {
      expect(err.name).to.be.equal('InvalidRequestError');
      expect(err.message).to.be.equal(
        'Either case created start date or end date not received'
      );
    });
  });

  it('Should throw validation error for wrong created case start & end date', async () => {
    queryParams = {
      caseAssigneeId: 22,
      searchQuery: 'CE-19',
      violationTypeIds: [11, 12],
      violationIds: [1, 2],
      forcedAbatementActivityIds: [1],
      caseStatus: CaseStatusFilter.OPEN,
      createdCaseStartDate: new Date('2019-03-06T16:23:14.912Z'),
      createdCaseEndDate: new Date('2019-03-05T16:23:14.912Z'),
      closedCaseStartDate: new Date('2019-03-05T16:23:14.912Z'),
      closedCaseEndDate: new Date('2019-03-05T16:23:14.912Z'),
      inspectionAssigneeIds: [1],
      nextScheduledInspectionStartDate: new Date('2019-03-05T16:23:14.912Z'),
      nextScheduledInspectionEndDate: new Date('2019-03-05T16:23:14.912Z'),
      lastCompletedInspectionStartDate: new Date('2019-03-05T16:23:14.912Z'),
      lastCompletedInspectionEndDate: new Date('2019-03-05T16:23:14.912Z'),
      sortBy: CaseListSortParams.CASE_CREATED_AT,
      sortOrder: SortOrder.ASC,
      limit: 3,
      offset: 0,
    };

    await xerceCaseService.getAll(agencyId, user, queryParams).catch(err => {
      expect(err.name).to.be.equal('InvalidRequestError');
      expect(err.message).to.be.equal(
        'Created Case start date is greater than end date'
      );
    });
  });

  it('Should throw validation error for mising closed case start & end date', async () => {
    queryParams = {
      caseAssigneeId: 22,
      searchQuery: 'CE-19',
      violationTypeIds: [11, 12],
      violationIds: [1, 2],
      forcedAbatementActivityIds: [1],
      caseStatus: CaseStatusFilter.OPEN,
      createdCaseStartDate: new Date('2019-03-05T16:23:14.912Z'),
      createdCaseEndDate: new Date('2019-03-05T16:23:14.912Z'),
      closedCaseStartDate: new Date('2019-03-05T16:23:14.912Z'),
      inspectionAssigneeIds: [1],
      nextScheduledInspectionStartDate: new Date('2019-03-05T16:23:14.912Z'),
      nextScheduledInspectionEndDate: new Date('2019-03-05T16:23:14.912Z'),
      lastCompletedInspectionStartDate: new Date('2019-03-05T16:23:14.912Z'),
      lastCompletedInspectionEndDate: new Date('2019-03-05T16:23:14.912Z'),
      sortBy: CaseListSortParams.CASE_CREATED_AT,
      sortOrder: SortOrder.ASC,
      limit: 3,
      offset: 0,
    };

    await xerceCaseService.getAll(agencyId, user, queryParams).catch(err => {
      expect(err.name).to.be.equal('InvalidRequestError');
      expect(err.message).to.be.equal(
        'Either case closed start date or end date not received'
      );
    });
  });

  it('Should throw validation error for wrong closed case start & end date', async () => {
    queryParams = {
      caseAssigneeId: 22,
      searchQuery: 'CE-19',
      violationTypeIds: [11, 12],
      violationIds: [1, 2],
      forcedAbatementActivityIds: [1],
      caseStatus: CaseStatusFilter.OPEN,
      createdCaseStartDate: new Date('2019-03-05T16:23:14.912Z'),
      createdCaseEndDate: new Date('2019-03-05T16:23:14.912Z'),
      closedCaseStartDate: new Date('2019-03-06T16:23:14.912Z'),
      closedCaseEndDate: new Date('2019-03-05T16:23:14.912Z'),
      inspectionAssigneeIds: [1],
      nextScheduledInspectionStartDate: new Date('2019-03-05T16:23:14.912Z'),
      nextScheduledInspectionEndDate: new Date('2019-03-05T16:23:14.912Z'),
      lastCompletedInspectionStartDate: new Date('2019-03-05T16:23:14.912Z'),
      lastCompletedInspectionEndDate: new Date('2019-03-05T16:23:14.912Z'),
      sortBy: CaseListSortParams.CASE_CREATED_AT,
      sortOrder: SortOrder.ASC,
      limit: 3,
      offset: 0,
    };

    await xerceCaseService.getAll(agencyId, user, queryParams).catch(err => {
      expect(err.name).to.be.equal('InvalidRequestError');
      expect(err.message).to.be.equal(
        'Closed Case start date is greater than end date'
      );
    });
  });

  it('Should throw validation error for missing last completed inspection start & end date', async () => {
    queryParams = {
      caseAssigneeId: 22,
      searchQuery: 'CE-19',
      violationTypeIds: [11, 12],
      violationIds: [1, 2],
      forcedAbatementActivityIds: [1],
      caseStatus: CaseStatusFilter.OPEN,
      createdCaseStartDate: new Date('2019-03-05T16:23:14.912Z'),
      createdCaseEndDate: new Date('2019-03-05T16:23:14.912Z'),
      closedCaseStartDate: new Date('2019-03-05T16:23:14.912Z'),
      closedCaseEndDate: new Date('2019-03-05T16:23:14.912Z'),
      inspectionAssigneeIds: [1],
      nextScheduledInspectionStartDate: new Date('2019-03-05T16:23:14.912Z'),
      nextScheduledInspectionEndDate: new Date('2019-03-05T16:23:14.912Z'),
      lastCompletedInspectionEndDate: new Date('2019-03-05T16:23:14.912Z'),
      sortBy: CaseListSortParams.CASE_CREATED_AT,
      sortOrder: SortOrder.ASC,
      limit: 3,
      offset: 0,
    };

    await xerceCaseService.getAll(agencyId, user, queryParams).catch(err => {
      expect(err.name).to.be.equal('InvalidRequestError');
      expect(err.message).to.be.equal(
        'Either last completed inspection start date or end date not received'
      );
    });
  });

  it('Should throw validation error for wrong last completed inspection start & end date', async () => {
    queryParams = {
      caseAssigneeId: 22,
      searchQuery: 'CE-19',
      violationTypeIds: [11, 12],
      violationIds: [1, 2],
      forcedAbatementActivityIds: [1],
      caseStatus: CaseStatusFilter.OPEN,
      createdCaseStartDate: new Date('2019-03-05T16:23:14.912Z'),
      createdCaseEndDate: new Date('2019-03-05T16:23:14.912Z'),
      closedCaseStartDate: new Date('2019-03-05T16:23:14.912Z'),
      closedCaseEndDate: new Date('2019-03-05T16:23:14.912Z'),
      inspectionAssigneeIds: [1],
      nextScheduledInspectionStartDate: new Date('2019-03-05T16:23:14.912Z'),
      nextScheduledInspectionEndDate: new Date('2019-03-05T16:23:14.912Z'),
      lastCompletedInspectionStartDate: new Date('2019-03-05T16:23:14.912Z'),
      lastCompletedInspectionEndDate: new Date('2019-03-04T16:23:14.912Z'),
      sortBy: CaseListSortParams.CASE_CREATED_AT,
      sortOrder: SortOrder.ASC,
      limit: 3,
      offset: 0,
    };

    await xerceCaseService.getAll(agencyId, user, queryParams).catch(err => {
      expect(err.name).to.be.equal('InvalidRequestError');
      expect(err.message).to.be.equal(
        'Last Completed Inspection start date is greater than end date'
      );
    });
  });

  it('Should throw validation error for missing next scheduled inspection start & end date', async () => {
    queryParams = {
      caseAssigneeId: 22,
      searchQuery: 'CE-19',
      violationTypeIds: [11, 12],
      violationIds: [1, 2],
      forcedAbatementActivityIds: [1],
      caseStatus: CaseStatusFilter.OPEN,
      createdCaseStartDate: new Date('2019-03-05T16:23:14.912Z'),
      createdCaseEndDate: new Date('2019-03-05T16:23:14.912Z'),
      closedCaseStartDate: new Date('2019-03-05T16:23:14.912Z'),
      closedCaseEndDate: new Date('2019-03-05T16:23:14.912Z'),
      inspectionAssigneeIds: [1],
      nextScheduledInspectionStartDate: new Date('2019-03-05T16:23:14.912Z'),
      lastCompletedInspectionStartDate: new Date('2019-03-05T16:23:14.912Z'),
      lastCompletedInspectionEndDate: new Date('2019-03-05T16:23:14.912Z'),
      sortBy: CaseListSortParams.CASE_CREATED_AT,
      sortOrder: SortOrder.ASC,
      limit: 3,
      offset: 0,
    };

    await xerceCaseService.getAll(agencyId, user, queryParams).catch(err => {
      expect(err.name).to.be.equal('InvalidRequestError');
      expect(err.message).to.be.equal(
        'Next Scheduled Inspection End date not received'
      );
    });
  });

  it('Should throw validation error for wrong next scheduled inspection start & end date', async () => {
    queryParams = {
      caseAssigneeId: 22,
      searchQuery: 'CE-19',
      violationTypeIds: [11, 12],
      violationIds: [1, 2],
      forcedAbatementActivityIds: [1],
      caseStatus: CaseStatusFilter.OPEN,
      createdCaseStartDate: new Date('2019-03-05T16:23:14.912Z'),
      createdCaseEndDate: new Date('2019-03-05T16:23:14.912Z'),
      closedCaseStartDate: new Date('2019-03-05T16:23:14.912Z'),
      closedCaseEndDate: new Date('2019-03-05T16:23:14.912Z'),
      inspectionAssigneeIds: [1],
      nextScheduledInspectionStartDate: new Date('2019-03-05T16:23:14.912Z'),
      nextScheduledInspectionEndDate: new Date('2019-03-04T16:23:14.912Z'),
      lastCompletedInspectionStartDate: new Date('2019-03-05T16:23:14.912Z'),
      lastCompletedInspectionEndDate: new Date('2019-03-05T16:23:14.912Z'),
      sortBy: CaseListSortParams.CASE_CREATED_AT,
      sortOrder: SortOrder.ASC,
      limit: 3,
      offset: 0,
    };

    await xerceCaseService.getAll(agencyId, user, queryParams).catch(err => {
      expect(err.name).to.be.equal('InvalidRequestError');
      expect(err.message).to.be.equal(
        'Next Scheduled Inspection start date is greater than end date'
      );
    });
  });

  it('Should throw validation error for duplicate violation Ids', async () => {
    queryParams = {
      caseAssigneeId: 22,
      searchQuery: 'CE-19',
      violationTypeIds: [11, 12],
      violationIds: [1, 2, 1],
      forcedAbatementActivityIds: [1],
      caseStatus: CaseStatusFilter.OPEN,
      createdCaseStartDate: new Date('2019-03-05T16:23:14.912Z'),
      createdCaseEndDate: new Date('2019-03-05T16:23:14.912Z'),
      closedCaseStartDate: new Date('2019-03-05T16:23:14.912Z'),
      closedCaseEndDate: new Date('2019-03-05T16:23:14.912Z'),
      inspectionAssigneeIds: [1],
      nextScheduledInspectionStartDate: new Date('2019-03-05T16:23:14.912Z'),
      nextScheduledInspectionEndDate: new Date('2019-03-05T16:23:14.912Z'),
      lastCompletedInspectionStartDate: new Date('2019-03-05T16:23:14.912Z'),
      lastCompletedInspectionEndDate: new Date('2019-03-05T16:23:14.912Z'),
      sortBy: CaseListSortParams.CASE_CREATED_AT,
      sortOrder: SortOrder.ASC,
      limit: 3,
      offset: 0,
    };

    await xerceCaseService.getAll(agencyId, user, queryParams).catch(err => {
      expect(err.name).to.be.equal('InvalidRequestError');
      expect(err.message).to.be.equal('Duplicate Violation Ids received');
    });
  });

  it('Should throw validation error for duplicate violation type Ids', async () => {
    queryParams = {
      caseAssigneeId: 22,
      searchQuery: 'CE-19',
      violationTypeIds: [12, 11, 12],
      violationIds: [1, 2],
      forcedAbatementActivityIds: [1],
      caseStatus: CaseStatusFilter.OPEN,
      createdCaseStartDate: new Date('2019-03-05T16:23:14.912Z'),
      createdCaseEndDate: new Date('2019-03-05T16:23:14.912Z'),
      closedCaseStartDate: new Date('2019-03-05T16:23:14.912Z'),
      closedCaseEndDate: new Date('2019-03-05T16:23:14.912Z'),
      inspectionAssigneeIds: [1],
      nextScheduledInspectionStartDate: new Date('2019-03-05T16:23:14.912Z'),
      nextScheduledInspectionEndDate: new Date('2019-03-05T16:23:14.912Z'),
      lastCompletedInspectionStartDate: new Date('2019-03-05T16:23:14.912Z'),
      lastCompletedInspectionEndDate: new Date('2019-03-05T16:23:14.912Z'),
      sortBy: CaseListSortParams.CASE_CREATED_AT,
      sortOrder: SortOrder.ASC,
      limit: 3,
      offset: 0,
    };

    await xerceCaseService.getAll(agencyId, user, queryParams).catch(err => {
      expect(err.name).to.be.equal('InvalidRequestError');
      expect(err.message).to.be.equal('Duplicate Violation Type Ids received');
    });
  });

  it('Should throw validation error for duplicate inspection assignee Ids', async () => {
    queryParams = {
      caseAssigneeId: 22,
      searchQuery: 'CE-19',
      violationTypeIds: [11, 12],
      violationIds: [2, 1],
      forcedAbatementActivityIds: [1],
      caseStatus: CaseStatusFilter.OPEN,
      createdCaseStartDate: new Date('2019-03-05T16:23:14.912Z'),
      createdCaseEndDate: new Date('2019-03-05T16:23:14.912Z'),
      closedCaseStartDate: new Date('2019-03-05T16:23:14.912Z'),
      closedCaseEndDate: new Date('2019-03-05T16:23:14.912Z'),
      inspectionAssigneeIds: [1, 1],
      nextScheduledInspectionStartDate: new Date('2019-03-05T16:23:14.912Z'),
      nextScheduledInspectionEndDate: new Date('2019-03-05T16:23:14.912Z'),
      lastCompletedInspectionStartDate: new Date('2019-03-05T16:23:14.912Z'),
      lastCompletedInspectionEndDate: new Date('2019-03-05T16:23:14.912Z'),
      sortBy: CaseListSortParams.CASE_CREATED_AT,
      sortOrder: SortOrder.ASC,
      limit: 3,
      offset: 0,
    };

    await xerceCaseService.getAll(agencyId, user, queryParams).catch(err => {
      expect(err.name).to.be.equal('InvalidRequestError');
      expect(err.message).to.be.equal(
        'Duplicate Inspection Assignee Ids received'
      );
    });
  });

  it('Should return status code 200 when cases not found', async () => {
    xerceCases = {
      data: [],
      count: 0,
    };
    xerceCasesInstance = [];

    sandbox.stub(db.sequelize, 'query').resolves(xerceCasesInstance);
    result = await xerceCaseService.getAll(agencyId, user, queryParams);

    expect(result).to.deep.equal(xerceCases, 'response did not match');
  });

  it('Should return status code 400 when exception occurs', async () => {
    sandbox.stub(db.sequelize, 'query').throws('Error');

    await xerceCaseService.getAll(agencyId, user, queryParams).catch(err => {
      expect(err.name).to.deep.equal('InternalServerError');
      expect(err.message).to.deep.equal(
        'Something went wrong. Please try again later.'
      );
    });
  });
});

describe('XerceCase Service: create Method', () => {
  let sandbox = null;

  let transaction = null;
  let customCaseFieldValues: any = null;
  let caseRequest: ICaseRequest = null;
  let newCase = null;
  let caseUser: ICaseUser = null;
  let caseSummary: ICaseSummary = null;
  let inspections: ICaseInspection[] = [];
  let location: ICaseLocation = null;
  let caseViolations: ICaseViolation[] = [];
  let attachments: IXerceCaseAttachment[] = [];
  let xerceCaseContacts: IXerceCaseContact[] = [];
  let responseBody: ICaseResponse = null;

  const agencyId = 1;
  const locationId = 17;
  const caseNumber = 'CE-19-1';

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
  let inspectionRequest: IInspectionRequest;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    transaction = sinon.stub();

    customCaseFieldValues = [
      {
        'Property Lien': {
          'Start Date': '2017-08-30',
          'End Date': '2022-08-30',
          'Property Lien Type': 'Long Term',
          'Property Lien By': 'Mr. jhon Doe',
        },
      },
    ];

    caseRequest = {
      assigneeId: 4,
      inspectionAssigneeId: 4,
      inspectionDate: new Date('2019-02-16T06:29:32.814Z'),
      issueDescription: '',
      location: {
        streetAddress: '547,Alabama',
        city: 'Alabama',
        state: 'AL',
        zip: '94016',
        latitude: 34.0401465212326,
        longitude: -78.0749587334245,
        flagAddress: {
          isFlagged: true,
          reasonForFlagging: 'Test reason for flagging',
        },
        isCDBGEligible: true,
        isCDBGApproved: true,
        parcelFields: {},
        manualFields: {
          Ward: 'Ward I',
          Lot: 23,
          Block: 1,
        },
        apn: '1234321',
        assessorAddress: 'Assessor street',
        isMapPinDropped: true,
      },
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
      violations: [
        {
          configXerceViolationId: 45,
          entities: [
            {
              'Animal Colour': 'Black',
              'License Number': 1234,
              Age: 12,
              Breed: '',
              Note: '',
            },
          ],
        },
      ],
      customCaseFieldValues,
      contacts: [
        {
          id: 9,
          isBillable: false,
        },
      ],
    };

    inspectionRequest = {
      assigneeId: caseRequest.inspectionAssigneeId,
      plannedDate: caseRequest.inspectionDate,
    };

    caseUser = {
      id: 4,
      firstName: 'Jhon',
      lastName: 'Doe',
    };

    newCase = {
      id: 4,
      agencyId,
      assigneeId: caseRequest.assigneeId,
      agencyLocationId: locationId,
      status: XerceCaseStatus.OPEN,
      customCaseFieldValues,
      caseNumber,
      issueDescription: caseRequest.issueDescription,
      locationManualFields: caseRequest.location.manualFields,
      locationParcelFields: caseRequest.location.parcelFields,
      isCDBGApproved: caseRequest.location.isCDBGApproved,
      createdBy: caseUser,
      updatedBy: caseUser,
      createdAt: new Date('2019-02-16T06:29:32.814Z'),
      updatedAt: new Date('2019-02-16T06:29:32.814Z'),
      closedAt: null,
    };

    caseSummary = {
      caseNumber,
      status: 'OPEN',
      abatementStage: AbatementStage.VERIFICATION_PENDING,
      caseAge: 12,
      hoursLogged: 2.0,
      createdBy: caseUser,
      caseAssignee: caseUser,
      createdAt: new Date('2019-02-06T06:29:32.814Z'),
      updatedAt: new Date('2019-02-06T06:29:32.814Z'),
      closedBy: null,
      closedAt: null,
    };

    inspections = [
      {
        id: 11,
        name: 'Verification Inspection',
        dueDate: new Date('2019-02-16T06:29:32.814Z'),
        closedBy: {
          id: 4,
          firstName: 'John',
          lastName: 'Doe',
        },
        assignee: {
          id: 4,
          firstName: 'John',
          lastName: 'Doe',
        },
        closedAt: new Date('2019-02-16T06:29:32.814Z'),
        note: null,
        notice: null,
        isNoNoticeChosen: false,
        updatedBy: {
          id: 4,
          firstName: 'John',
          lastName: 'Doe',
        },
        updatedAt: new Date('2019-02-16T06:28:32.814Z'),
        createdBy: {
          id: 4,
          firstName: 'John',
          lastName: 'Doe',
        },
        createdAt: new Date('2019-02-16T06:28:32.814Z'),
      },
    ];

    location = {
      id: 17,
      streetAddress: '547,Alabama',
      city: 'Alabama',
      state: 'AL',
      zip: '94016',
      latitude: 34.0401465212326,
      longitude: -78.0749587334245,
      parcelId: 22,
      manualFields: {
        Ward: 'Ward I',
        Lot: 23,
        Block: 1,
      },
      parcelFields: {},
      flagHistory: [
        {
          id: 22,
          isFlagged: true,
          reasonForFlagging: 'Test reason for flagging',
          updatedBy: caseUser,
          updatedAt: new Date('2019-02-16T06:29:32.814Z'),
        },
      ],
      isCDBGApproved: true,
      apn: '1234321',
      assessorAddress: 'Assessor street',
      isMapPinDropped: true,

      parcel: {
        id: 1,
        apn: '',
        siteAddress: '547,Alabama',
        siteCity: 'Alabama',
        siteState: 'AL',
        siteZip: '94016',
        ownerName: 'Jena Doe',
        ownerAddress: '547,Alabama',
        ownerCity: 'Alabama',
        ownerState: 'AL',
        ownerZip: '94016',
        isOwnerBusiness: false,
        customFields: {},
        cdbgCensusTract: '',
        cdbgBlockGroup: '',
        cdbgLowModPercent: 10,
        isCDBGEligible: true,
        mapboxAddress: '',
        mapboxCity: '',
        mapboxState: '',
        mapboxZip: 94016,
        mapboxFullAddress: '547,Alabama, Alabama, AL, 94016',
        flagHistory: [
          {
            id: 22,
            isFlagged: true,
            reasonForFlagging: 'Test reason for flagging',
            updatedBy: caseUser,
            updatedAt: new Date('2019-02-16T06:29:32.814Z'),
          },
        ],
      },
      associatedCases: {
        openCases: 2,
        closedCases: 3,
      },
    };

    caseViolations = [
      {
        id: 1,
        configDispositionId: 30,
        status: XerceViolationStatus.OPEN,
        complyByDate: new Date('2019-02-16T06:29:32.814Z'),
        configViolation: {
          id: 45,
          label: 'Animal Control',
          complyByDays: 2,
          configViolationType: {
            id: 4,
            label: 'Animal Violation',
            iconURL:
              'https://cyberdyne-dev.s3.amazonaws.com/agency_0/system_icon/animal.png',
          },
          configMunicipalCode: {
            id: 33,
            articleNumber: '10.10.9',
            description: 'Animal Control Municipal Code',
            resolutionAction: 'Test resolution action',
          },
        },
        entity: {
          'Animal Colour': 'Black',
          'License Number': 1234,
          Age: 12,
          Breed: '',
          Note: '',
        },
        createdBy: caseUser,
        updatedBy: caseUser,
        closedBy: caseUser,
        createdAt: new Date('2019-02-16T06:29:32.814Z'),
        updatedAt: new Date('2019-02-16T06:29:32.814Z'),
        closedAt: new Date('2019-02-16T06:29:32.814Z'),
      },
    ];

    attachments = [
      {
        id: 22,
        title: 'This is PNG attachment ',
        description: 'this is a description',
        fileName: 'This is a file name1',
        fileSize: '20KB',
        mimeType: 'image/png',
        fileURL:
          'https://cyberdyne-dev.s3.amazonaws.com/agency_1/cases/actionspopup.png',
        createdBy: {
          id: 4,
          firstName: 'John',
          lastName: 'Doe',
        },
        updatedBy: null,
        createdAt: new Date('2019-02-16T06:29:32.814Z'),
        updatedAt: new Date('2019-02-16T06:29:32.814Z'),
      },
    ];

    xerceCaseContacts = [
      {
        id: 66,
        caseContactId: 11,
        name: 'Jenna Doe',
        contactType: ContactType.INDIVIDUAL,
        isVendor: true,
        email: 'jena.doe@test.com',
        cellPhone: '123456789',
        workPhone: '123456789',
        streetAddress: '547,Alabama',
        city: 'Alabama',
        state: 'AL',
        zip: '94016',
        note: 'test note',
        contactCustomFieldValues: {},
        isBillable: true,
        caseContactRole: null,
        isGisPopulated: true,
      },
    ];

    responseBody = {
      id: 4,
      caseSummary,
      customCaseFieldValues,
      issueDescription: '',
      inspections,
      location,
      caseViolations,
      attachments,
      caseContacts: xerceCaseContacts,
      caseNotices: [],
      caseNotes: [],
      caseStatusActivity: [],
      forcedAbatement: null,
      recommendFAMetadata: {
        isEligible: false,
        notice: null,
      },
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return response code 200 with case details', async () => {
    sandbox
      .stub(XerceCaseService.prototype, 'validateCreateCaseOperation')
      .withArgs(agencyId, caseRequest);

    sandbox.stub(DBUtil, 'createTransaction').resolves(transaction);

    sandbox.stub(DBUtil, 'rollbackTransaction').withArgs(transaction);

    sandbox.stub(DBUtil, 'commitTransaction').withArgs(transaction);

    sandbox.stub(LocationService.prototype, 'create').resolves(locationId);

    sandbox
      .stub(XerceCaseTileService.prototype, 'validateCreateCaseCustomTileReq')
      .withArgs(agencyId, caseRequest.customCaseFieldValues);

    sandbox
      .stub(XerceService.prototype, 'getNextCaseNumber')
      .withArgs(agencyId)
      .resolves(caseNumber);

    sandbox.stub(db.XerceCase, 'create').resolves(newCase);

    sandbox
      .stub(XerceCaseStatusActivityService.prototype, 'create')
      .withArgs(
        agencyId,
        newCase.id,
        XerceCaseStatus.OPEN,
        userProfile.id,
        transaction
      );

    sandbox
      .stub(XerceCaseService.prototype, 'updateCaseNumber')
      .withArgs(newCase, caseNumber, transaction);

    sandbox
      .stub(XerceService.prototype, 'updateNextCaseNumber')
      .withArgs(agencyId, caseNumber, transaction);

    sandbox
      .stub(XerceCaseViolationService.prototype, 'create')
      .withArgs(
        agencyId,
        newCase.id,
        caseRequest.violations,
        XerceViolationOrigin.CREATE_CASE,
        caseUser.id,
        transaction
      );

    sandbox
      .stub(XerceCaseContactService.prototype, 'create')
      .withArgs(
        agencyId,
        newCase.id,
        caseRequest.contacts,
        null,
        caseUser.id,
        transaction
      );

    sandbox
      .stub(XerceCaseAttachmentService.prototype, 'create')
      .withArgs(
        agencyId,
        newCase.id,
        caseUser.id,
        caseRequest.attachments,
        transaction
      );

    sandbox
      .stub(XerceCaseInspectionService.prototype, 'create')
      .withArgs(
        agencyId,
        newCase.id,
        caseUser.id,
        inspectionRequest,
        true,
        transaction
      );

    sandbox.stub(XerceCaseListingService.prototype, 'refreshCaseListing');

    sandbox.stub(XerceCaseService.prototype, 'get').resolves(responseBody);

    const xerceCase = await xerceCaseService
      .create(agencyId, userProfile, caseRequest)
      .catch(err => expect(err.name).to.deep.equal('Error'));

    expect(xerceCase).to.equal(responseBody);
  });

  it('should throw error while Creating the location.', async () => {
    sandbox
      .stub(XerceCaseService.prototype, 'validateCreateCaseOperation')
      .withArgs(agencyId, caseRequest);

    sandbox.stub(DBUtil, 'createTransaction').resolves(transaction);

    sandbox.stub(DBUtil, 'rollbackTransaction').withArgs(transaction);

    sandbox.stub(DBUtil, 'commitTransaction').withArgs(transaction);

    sandbox
      .stub(LocationService.prototype, 'create')
      .throws('InternalServerError');

    sandbox.stub(XerceCaseListingService.prototype, 'refreshCaseListing');

    await xerceCaseService
      .create(agencyId, userProfile, caseRequest)
      .catch(err => expect(err.name).to.deep.equal('InternalServerError'));
  });

  it('should throw error while validating case custom tile fields', async () => {
    sandbox
      .stub(XerceCaseService.prototype, 'validateCreateCaseOperation')
      .withArgs(agencyId, caseRequest);

    sandbox.stub(DBUtil, 'createTransaction').resolves(transaction);

    sandbox.stub(DBUtil, 'rollbackTransaction').withArgs(transaction);

    sandbox.stub(DBUtil, 'commitTransaction').withArgs(transaction);

    sandbox.stub(XerceCaseListingService.prototype, 'refreshCaseListing');

    sandbox.stub(LocationService.prototype, 'create').resolves(locationId);

    sandbox
      .stub(XerceCaseTileService.prototype, 'validateCreateCaseCustomTileReq')
      .withArgs(agencyId, caseRequest.customCaseFieldValues)
      .throws('InvalidRequestError');

    await xerceCaseService
      .create(agencyId, userProfile, caseRequest)
      .catch(err => expect(err.name).to.deep.equal('InvalidRequestError'));
  });

  it('should throw UniqueConstraint Error while creating case', async () => {
    sandbox
      .stub(XerceCaseService.prototype, 'validateCreateCaseOperation')
      .withArgs(agencyId, caseRequest);

    sandbox.stub(DBUtil, 'createTransaction').resolves(transaction);

    sandbox.stub(DBUtil, 'rollbackTransaction').withArgs(transaction);

    sandbox.stub(DBUtil, 'commitTransaction').withArgs(transaction);

    sandbox.stub(XerceCaseListingService.prototype, 'refreshCaseListing');

    sandbox.stub(LocationService.prototype, 'create').resolves(locationId);

    sandbox
      .stub(XerceCaseTileService.prototype, 'validateCreateCaseCustomTileReq')
      .withArgs(agencyId, caseRequest.customCaseFieldValues);

    sandbox
      .stub(XerceService.prototype, 'getNextCaseNumber')
      .withArgs(agencyId)
      .resolves(caseNumber);

    sandbox
      .stub(db.XerceCase, 'create')
      .throws('SequelizeUniqueConstraintError');

    await xerceCaseService
      .create(agencyId, userProfile, caseRequest)
      .catch(err => expect(err.name).to.deep.equal('DBConflictError'));
  });

  it('should throw InternalServerError while creating case', async () => {
    sandbox
      .stub(XerceCaseService.prototype, 'validateCreateCaseOperation')
      .withArgs(agencyId, caseRequest);

    sandbox.stub(DBUtil, 'createTransaction').resolves(transaction);

    sandbox.stub(DBUtil, 'rollbackTransaction').withArgs(transaction);

    sandbox.stub(DBUtil, 'commitTransaction').withArgs(transaction);

    sandbox.stub(XerceCaseListingService.prototype, 'refreshCaseListing');

    sandbox.stub(LocationService.prototype, 'create').resolves(locationId);

    sandbox
      .stub(XerceCaseTileService.prototype, 'validateCreateCaseCustomTileReq')
      .withArgs(agencyId, caseRequest.customCaseFieldValues);

    sandbox
      .stub(XerceService.prototype, 'getNextCaseNumber')
      .withArgs(agencyId)
      .resolves(caseNumber);

    sandbox.stub(db.XerceCase, 'create').throws('InternalServerError');

    await xerceCaseService
      .create(agencyId, userProfile, caseRequest)
      .catch(err => expect(err.name).to.deep.equal('InternalServerError'));
  });

  it('should throw error while adding case to location', async () => {
    sandbox
      .stub(XerceCaseService.prototype, 'validateCreateCaseOperation')
      .withArgs(agencyId, caseRequest);

    sandbox.stub(DBUtil, 'createTransaction').resolves(transaction);

    sandbox.stub(DBUtil, 'rollbackTransaction').withArgs(transaction);

    sandbox.stub(DBUtil, 'commitTransaction').withArgs(transaction);

    sandbox.stub(XerceCaseListingService.prototype, 'refreshCaseListing');

    sandbox.stub(LocationService.prototype, 'create').resolves(locationId);

    sandbox
      .stub(XerceCaseTileService.prototype, 'validateCreateCaseCustomTileReq')
      .withArgs(agencyId, caseRequest.customCaseFieldValues);

    sandbox
      .stub(XerceService.prototype, 'getNextCaseNumber')
      .withArgs(agencyId)
      .resolves(caseNumber);

    sandbox.stub(db.XerceCase, 'create').resolves(newCase);

    sandbox
      .stub(XerceService.prototype, 'updateNextCaseNumber')
      .withArgs(agencyId, caseNumber, transaction);

    sandbox
      .stub(XerceCaseViolationService.prototype, 'create')
      .withArgs(
        agencyId,
        newCase.id,
        caseRequest.violations,
        XerceViolationOrigin.CREATE_CASE,
        caseUser.id,
        transaction
      );

    sandbox
      .stub(XerceCaseContactService.prototype, 'create')
      .withArgs(
        agencyId,
        newCase.id,
        caseRequest.contacts,
        caseUser.id,
        transaction
      );

    sandbox
      .stub(XerceCaseAttachmentService.prototype, 'create')
      .throws('InternalServerError');

    await xerceCaseService
      .create(agencyId, userProfile, caseRequest)
      .catch(err => expect(err.name).to.deep.equal('InternalServerError'));
  });

  it('should throw error creating violation', async () => {
    sandbox
      .stub(XerceCaseService.prototype, 'validateCreateCaseOperation')
      .withArgs(agencyId, caseRequest);

    sandbox.stub(DBUtil, 'createTransaction').resolves(transaction);

    sandbox.stub(DBUtil, 'rollbackTransaction').withArgs(transaction);

    sandbox.stub(DBUtil, 'commitTransaction').withArgs(transaction);

    sandbox.stub(XerceCaseListingService.prototype, 'refreshCaseListing');

    sandbox.stub(LocationService.prototype, 'create').resolves(locationId);

    sandbox
      .stub(XerceCaseTileService.prototype, 'validateCreateCaseCustomTileReq')
      .withArgs(agencyId, caseRequest.customCaseFieldValues);

    sandbox
      .stub(XerceService.prototype, 'getNextCaseNumber')
      .withArgs(agencyId)
      .resolves(caseNumber);

    sandbox.stub(db.XerceCase, 'create').resolves(newCase);

    sandbox
      .stub(XerceService.prototype, 'updateNextCaseNumber')
      .withArgs(agencyId, caseNumber, transaction);

    sandbox
      .stub(XerceCaseViolationService.prototype, 'create')
      .withArgs(
        agencyId,
        newCase.id,
        caseRequest.violations,
        XerceViolationOrigin.CREATE_CASE,
        caseUser.id,
        transaction
      );

    sandbox
      .stub(XerceCaseContactService.prototype, 'create')
      .withArgs(
        agencyId,
        newCase.id,
        caseRequest.contacts,
        caseUser.id,
        transaction
      );

    sandbox
      .stub(XerceCaseAttachmentService.prototype, 'create')
      .throws('InternalServerError');

    await xerceCaseService
      .create(agencyId, userProfile, caseRequest)
      .catch(err => expect(err.name).to.deep.equal('InternalServerError'));
  });

  it('should throw error while creating case violations', async () => {
    sandbox
      .stub(XerceCaseService.prototype, 'validateCreateCaseOperation')
      .withArgs(agencyId, caseRequest);

    sandbox.stub(DBUtil, 'createTransaction').resolves(transaction);

    sandbox.stub(DBUtil, 'rollbackTransaction').withArgs(transaction);

    sandbox.stub(DBUtil, 'commitTransaction').withArgs(transaction);

    sandbox.stub(XerceCaseListingService.prototype, 'refreshCaseListing');

    sandbox.stub(LocationService.prototype, 'create').resolves(locationId);

    sandbox
      .stub(XerceCaseTileService.prototype, 'validateCreateCaseCustomTileReq')
      .withArgs(agencyId, caseRequest.customCaseFieldValues);

    sandbox
      .stub(XerceService.prototype, 'getNextCaseNumber')
      .withArgs(agencyId)
      .resolves(caseNumber);

    sandbox.stub(db.XerceCase, 'create').resolves(newCase);

    sandbox
      .stub(XerceService.prototype, 'updateNextCaseNumber')
      .withArgs(agencyId, caseNumber, transaction);

    sandbox
      .stub(XerceCaseViolationService.prototype, 'create')
      .withArgs(
        agencyId,
        newCase.id,
        caseRequest.violations,
        XerceViolationOrigin.CREATE_CASE,
        caseUser.id,
        transaction
      )
      .throws('Error');

    await xerceCaseService
      .create(agencyId, userProfile, caseRequest)
      .catch(err => expect(err.name).to.deep.equal('InternalServerError'));
  });

  it('should throw error while creating attachments', async () => {
    sandbox
      .stub(XerceCaseService.prototype, 'validateCreateCaseOperation')
      .withArgs(agencyId, caseRequest);

    sandbox.stub(DBUtil, 'createTransaction').resolves(transaction);

    sandbox.stub(DBUtil, 'rollbackTransaction').withArgs(transaction);

    sandbox.stub(DBUtil, 'commitTransaction').withArgs(transaction);

    sandbox.stub(XerceCaseListingService.prototype, 'refreshCaseListing');

    sandbox.stub(LocationService.prototype, 'create').resolves(locationId);

    sandbox
      .stub(XerceCaseTileService.prototype, 'validateCreateCaseCustomTileReq')
      .withArgs(agencyId, caseRequest.customCaseFieldValues);

    sandbox
      .stub(XerceService.prototype, 'getNextCaseNumber')
      .withArgs(agencyId)
      .resolves(caseNumber);

    sandbox.stub(db.XerceCase, 'create').resolves(newCase);

    sandbox
      .stub(XerceService.prototype, 'updateNextCaseNumber')
      .withArgs(agencyId, caseNumber, transaction);

    sandbox
      .stub(XerceCaseViolationService.prototype, 'create')
      .withArgs(
        agencyId,
        newCase.id,
        caseRequest.violations,
        XerceViolationOrigin.CREATE_CASE,
        caseUser.id,
        transaction
      );

    sandbox
      .stub(XerceCaseContactService.prototype, 'create')
      .withArgs(
        agencyId,
        newCase.id,
        caseRequest.contacts,
        caseUser.id,
        transaction
      );

    sandbox
      .stub(XerceCaseAttachmentService.prototype, 'create')
      .throws('InternalServerError');

    await xerceCaseService
      .create(agencyId, userProfile, caseRequest)
      .catch(err => expect(err.name).to.deep.equal('InternalServerError'));
  });

  it('should throw error while creating inspection', async () => {
    sandbox
      .stub(XerceCaseService.prototype, 'validateCreateCaseOperation')
      .withArgs(agencyId, caseRequest);

    sandbox.stub(DBUtil, 'createTransaction').resolves(transaction);

    sandbox.stub(DBUtil, 'rollbackTransaction').withArgs(transaction);

    sandbox.stub(DBUtil, 'commitTransaction').withArgs(transaction);

    sandbox.stub(XerceCaseListingService.prototype, 'refreshCaseListing');

    sandbox.stub(LocationService.prototype, 'create').resolves(locationId);

    sandbox
      .stub(XerceCaseTileService.prototype, 'validateCreateCaseCustomTileReq')
      .withArgs(agencyId, caseRequest.customCaseFieldValues);

    sandbox
      .stub(XerceService.prototype, 'getNextCaseNumber')
      .withArgs(agencyId)
      .resolves(caseNumber);

    sandbox.stub(db.XerceCase, 'create').resolves(newCase);

    sandbox
      .stub(XerceService.prototype, 'updateNextCaseNumber')
      .withArgs(agencyId, caseNumber, transaction);

    sandbox
      .stub(XerceCaseViolationService.prototype, 'create')
      .withArgs(
        agencyId,
        newCase.id,
        caseRequest.violations,
        XerceViolationOrigin.CREATE_CASE,
        caseUser.id,
        transaction
      );

    sandbox
      .stub(XerceCaseContactService.prototype, 'create')
      .withArgs(
        agencyId,
        newCase.id,
        caseRequest.contacts,
        null,
        caseUser.id,
        transaction
      );

    sandbox
      .stub(XerceCaseAttachmentService.prototype, 'create')
      .withArgs(
        agencyId,
        newCase.id,
        caseUser.id,
        caseRequest.attachments,
        transaction
      );

    sandbox
      .stub(XerceCaseInspectionService.prototype, 'create')
      .withArgs(
        agencyId,
        newCase.id,
        caseUser.id,
        inspectionRequest,
        true,
        transaction
      )
      .throws('Error');

    await xerceCaseService
      .create(agencyId, userProfile, caseRequest)
      .catch(err => expect(err.name).to.deep.equal('InternalServerError'));
  });
});

describe('XerceCase Service: validateCreateCaseOperation method', () => {
  let sandbox;
  let caseRequest: ICaseRequest;
  const agencyId = 1;
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

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    caseRequest = {
      assigneeId: 4,
      inspectionAssigneeId: 4,
      inspectionDate: new Date('2019-02-16T06:29:32.814Z'),
      issueDescription: '',
      location: {
        streetAddress: '547,Alabama',
        city: 'Alabama',
        state: 'AL',
        zip: '94016',
        latitude: 34.0401465212326,
        longitude: -78.0749587334245,
        flagAddress: {
          isFlagged: true,
          reasonForFlagging: 'Test reason for flagging',
        },
        isCDBGEligible: true,
        isCDBGApproved: true,
        parcelFields: {},
        manualFields: {
          Ward: 'Ward I',
          Lot: 23,
          Block: 1,
        },
        apn: '1234321',
        assessorAddress: 'Assessor street',
        isMapPinDropped: true,
      },
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
      violations: [
        {
          configXerceViolationId: 45,
          entities: [
            {
              'Animal Colour': 'Black',
              'License Number': 1234,
              Age: 12,
              Breed: '',
              Note: '',
            },
          ],
        },
      ],
      customCaseFieldValues: [
        {
          'Property Lien': {
            'Start Date': '2017-08-30',
            'End Date': '2022-08-30',
            'Property Lien Type': 'Long Term',
            'Property Lien By': 'Mr. jhon Doe',
          },
        },
      ],
      contacts: [
        {
          id: 9,
          isBillable: false,
        },
      ],
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should validate the request without any error', async () => {
    sandbox
      .stub(XerceService.prototype, 'isCreateCaseConfigurationValid')
      .withArgs(agencyId)
      .resolves(true);

    sandbox
      .stub(LocationService.prototype, 'validateLocationCustomFieldsCreateReq')
      .withArgs(
        agencyId,
        caseRequest.location.manualFields,
        caseRequest.location.parcelFields
      );

    sandbox
      .stub(ConfigViolationService.prototype, 'getViolationTypeIds')
      .withArgs(agencyId, [45])
      .resolves([11]);

    sandbox.stub(UserService.prototype, 'isValidAssignee').resolves(true);

    await (xerceCaseService as any)
      .validateCreateCaseOperation(agencyId, userProfile, caseRequest)
      .catch(err => expect(err.name).to.equal('Error'));
  });

  it('should throw error as no violations and issue desc present', async () => {
    caseRequest = { ...caseRequest, violations: [] };

    sandbox
      .stub(XerceService.prototype, 'isCreateCaseConfigurationValid')
      .withArgs(agencyId)
      .resolves(true);

    await (xerceCaseService as any)
      .validateCreateCaseOperation(agencyId, userProfile, caseRequest)
      .catch(err => expect(err.name).to.equal('InvalidRequestError'));
  });

  it('should throw error because of invalid assignee', async () => {
    sandbox
      .stub(XerceService.prototype, 'isCreateCaseConfigurationValid')
      .withArgs(agencyId)
      .resolves(true);

    sandbox
      .stub(LocationService.prototype, 'validateLocationCustomFieldsCreateReq')
      .withArgs(
        agencyId,
        caseRequest.location.manualFields,
        caseRequest.location.parcelFields
      );

    sandbox
      .stub(ConfigViolationService.prototype, 'getViolationTypeIds')
      .withArgs(agencyId, [45])
      .resolves([11]);

    sandbox.stub(UserService.prototype, 'isValidAssignee').resolves(false);

    await (xerceCaseService as any)
      .validateCreateCaseOperation(agencyId, userProfile, caseRequest)
      .catch(err => expect(err.name).to.equal('InvalidRequestError'));
  });
});

describe('XerceCase Service: reopen method', () => {
  let sandbox;
  let xerceCase;
  let result;
  let transaction;
  const agencyId = 1;
  const userId = 3;
  const caseId = 1;

  let reopenCaseRequest: IReopenCaseRequest;
  let caseUser: ICaseUser = null;

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

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    transaction = sinon.stub();

    caseUser = {
      id: 4,
      firstName: 'Jhon',
      lastName: 'Doe',
    };

    xerceCase = {
      id: 101,
      agencyId,
      assigneeId: 1,
      agencyLocationId: 3,
      caseNumber: 'CE-19-1',
      issueDescription: 'This is a test issue description',
      forcedAbatementInitiatedAt: null,
      status: 'OPEN',
      customCaseFieldValues: [],
      customForcedAbatementFieldValues: [],
      locationManualFields: [],
      locationParcelFields: [],
      isCDBGApproved: true,
      createdByUser: caseUser,
      createdAt: '2019-02-16T06:29:32.814Z',
      updatedAt: '2019-02-16T06:29:32.814Z',
      inspectionAssigneeId: 1,
      closedAt: null,
      caseViolations: [
        {
          id: 1,
          violationType: {
            id: 11,
            label: 'Animal',
            violationTypeIcon: {
              id: 111,
              fileUrl: 'https://app-stage.comcateprime.com/icons/animal.png',
            },
          },
          configViolation: {
            id: 1,
            label: 'Animal Control',
          },
        },
      ],
      save: () => Promise.resolve(),
    };

    reopenCaseRequest = {
      inspection: {
        plannedDate: new Date('2019-02-16T06:29:32.814Z'),
        assigneeId: 1,
      },
      openViolationIds: [1],
    };
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 case details', async () => {
    sandbox
      .stub(XerceCaseService.prototype, 'validateReopenCaseRequest')
      .resolves(xerceCase);

    sandbox.stub(DBUtil, 'createTransaction').resolves(transaction);

    sandbox.stub(DBUtil, 'rollbackTransaction').withArgs(transaction);

    sandbox.stub(DBUtil, 'commitTransaction').withArgs(transaction);

    sandbox
      .stub(XerceCaseViolationService.prototype, 'updateViolationStatus')
      .withArgs(
        reopenCaseRequest.openViolationIds,
        xerceCase.caseViolations,
        transaction
      );

    sandbox
      .stub(XerceCaseInspectionService.prototype, 'create')
      .withArgs(
        agencyId,
        caseId,
        user.id,
        reopenCaseRequest.inspection.assigneeId,
        InspectionStatus.SCHEDULED,
        reopenCaseRequest.inspection.plannedDate,
        false,
        transaction
      );

    sandbox
      .stub(ConfigDispositionService.prototype, 'getForcedDisposition')
      .withArgs(agencyId)
      .resolves({ label: 'Forced' });

    sandbox
      .stub(XerceCaseStatusActivityService.prototype, 'create')
      .withArgs(agencyId, caseId, XerceCaseStatus.OPEN, user.id, transaction);

    sandbox
      .stub(XerceCaseHistoryService.prototype, 'createCaseSummaryHistory')
      .withArgs(
        CaseHistoryActions.CASE_REOPENED,
        agencyId,
        user.id,
        caseId,
        transaction
      )
      .resolves(null);

    sandbox
      .stub(XerceCaseService.prototype, 'get')
      .withArgs(agencyId, caseId, user.agencyTimezone)
      .resolves(xerceCase);

    result = await xerceCaseService.reopen(
      agencyId,
      caseId,
      user,
      reopenCaseRequest
    );

    expect(result).to.deep.equal(xerceCase, 'response did not match');
  });

  it('Should return throw error', async () => {
    xerceCase = {
      id: 101,
      agencyId,
      assigneeId: 1,
      agencyLocationId: 3,
      caseNumber: 'CE-19-1',
      issueDescription: 'This is a test issue description',
      status: 'OPEN',
      customCaseFieldValues: [],
      customForcedAbatementFieldValues: [],
      locationManualFields: [],
      locationParcelFields: [],
      isCDBGApproved: true,
      createdByUser: caseUser,
      createdAt: '2019-02-16T06:29:32.814Z',
      updatedAt: '2019-02-16T06:29:32.814Z',
      inspectionAssigneeId: 1,
      closedAt: null,
      caseViolations: [
        {
          id: 1,
          violationType: {
            id: 11,
            label: 'Animal',
            violationTypeIcon: {
              id: 111,
              fileUrl: 'https://app-stage.comcateprime.com/icons/animal.png',
            },
          },
          configViolation: {
            id: 1,
            label: 'Animal Control',
          },
        },
      ],
      save: () => Promise.reject(),
    };

    sandbox
      .stub(XerceCaseService.prototype, 'validateReopenCaseRequest')
      .resolves(xerceCase);

    sandbox.stub(DBUtil, 'createTransaction').resolves(transaction);

    sandbox.stub(DBUtil, 'rollbackTransaction').withArgs(transaction);

    sandbox.stub(DBUtil, 'commitTransaction').withArgs(transaction);

    sandbox
      .stub(XerceCaseViolationService.prototype, 'updateViolationStatus')
      .withArgs(
        reopenCaseRequest.openViolationIds,
        xerceCase.caseViolations,
        transaction
      );

    sandbox
      .stub(XerceCaseInspectionService.prototype, 'create')
      .withArgs(
        agencyId,
        caseId,
        user.id,
        reopenCaseRequest.inspection.assigneeId,
        InspectionStatus.SCHEDULED,
        reopenCaseRequest.inspection.plannedDate,
        false,
        transaction
      );

    sandbox
      .stub(ConfigDispositionService.prototype, 'getForcedDisposition')
      .withArgs(agencyId)
      .resolves({ label: 'Forced' });

    sandbox
      .stub(XerceCaseStatusActivityService.prototype, 'create')
      .withArgs(agencyId, caseId, XerceCaseStatus.OPEN, user.id, transaction);

    sandbox
      .stub(XerceCaseService.prototype, 'get')
      .withArgs(agencyId, caseId, user.agencyTimezone)
      .resolves(xerceCase);

    await xerceCaseService
      .reopen(agencyId, caseId, user, reopenCaseRequest)
      .catch(err => expect(err.name).to.equal('InternalServerError'));
  });
});

describe('XerceCase Service: validateReopenCaseRequest method', () => {
  let sandbox;
  let xerceCase;
  let result;
  const agencyId = 1;
  const caseId = 1;
  const caseViolationIds = [1];

  let reopenCaseRequest: IReopenCaseRequest;
  let caseUser: ICaseUser = null;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    caseUser = {
      id: 4,
      firstName: 'Jhon',
      lastName: 'Doe',
    };

    xerceCase = {
      id: 101,
      agencyId,
      assigneeId: 1,
      agencyLocationId: 3,
      caseNumber: 'CE-19-1',
      issueDescription: 'This is a test issue description',
      status: 'CLOSED',
      customCaseFieldValues: [],
      customForcedAbatementFieldValues: [],
      locationManualFields: [],
      locationParcelFields: [],
      isCDBGApproved: true,
      createdByUser: caseUser,
      createdAt: '2019-02-16T06:29:32.814Z',
      updatedAt: '2019-02-16T06:29:32.814Z',
      inspectionAssigneeId: 1,
      closedAt: null,
      caseViolations: [
        {
          id: 1,
          violationType: {
            id: 11,
            label: 'Animal',
            violationTypeIcon: {
              id: 111,
              fileUrl: 'https://app-stage.comcateprime.com/icons/animal.png',
            },
          },
          configViolation: {
            id: 1,
            label: 'Animal Control',
          },
        },
      ],
    };

    reopenCaseRequest = {
      inspection: {
        plannedDate: new Date('2019-02-16T06:29:32.814Z'),
        assigneeId: 1,
      },
      openViolationIds: [1],
    };
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 case details:', async () => {
    sandbox
      .stub(db.XerceCase, 'findOne')
      .withArgs({
        where: { agencyId, id: caseId, isMigratedCase: false },
        attributes: ['id', 'status', 'forcedAbatementInitiatedAt'],
        include: [
          {
            model: db.XerceCaseViolation,
            as: 'caseViolations',
            where: {
              id: caseViolationIds,
            },
            attributes: ['id', 'status'],
            required: false,
            include: [
              {
                model: db.ConfigXerceViolation,
                as: 'configViolation',
                attributes: ['id', 'complyByDays'],
              },
            ],
          },
        ],
      })
      .resolves(xerceCase);

    result = await (xerceCaseService as any).validateReopenCaseRequest(
      agencyId,
      caseId,
      reopenCaseRequest
    );

    expect(result).to.deep.equal(xerceCase, 'response did not match');
  });

  it('Should return throw error', async () => {
    sandbox
      .stub(db.XerceCase, 'findOne')
      .withArgs({
        where: { agencyId, id: caseId, isMigratedCase: false },
        attributes: ['id', 'status', 'forcedAbatementInitiatedAt'],
        include: [
          {
            model: db.XerceCaseViolation,
            as: 'caseViolations',
            where: {
              id: caseViolationIds,
            },
            attributes: ['id', 'status'],
            required: false,
            include: [
              {
                model: db.ConfigXerceViolation,
                as: 'configViolation',
                attributes: ['id', 'complyByDays'],
              },
            ],
          },
        ],
      })
      .throws('Error');

    await (xerceCaseService as any)
      .validateReopenCaseRequest(agencyId, caseId, reopenCaseRequest)
      .catch(err => expect(err.name).to.equal('InternalServerError'));
  });

  it('Should return throw error for no violation ids received', async () => {
    reopenCaseRequest = {
      inspection: {
        plannedDate: new Date('2019-02-16T06:29:32.814Z'),
        assigneeId: 1,
      },
      openViolationIds: [],
    };

    await (xerceCaseService as any)
      .validateReopenCaseRequest(agencyId, caseId, reopenCaseRequest)
      .catch(err => {
        expect(err.name).to.equal('InvalidRequestError');
        expect(err.message).to.equal('No violation ids received');
      });
  });

  it('Should return throw error for duplicate violation ids received', async () => {
    reopenCaseRequest = {
      inspection: {
        plannedDate: new Date('2019-02-16T06:29:32.814Z'),
        assigneeId: 1,
      },
      openViolationIds: [1, 1],
    };

    await (xerceCaseService as any)
      .validateReopenCaseRequest(agencyId, caseId, reopenCaseRequest)
      .catch(err => {
        expect(err.name).to.equal('InvalidRequestError');
        expect(err.message).to.equal('Duplicate Case Violation Ids received');
      });
  });

  it('Should return throw error for invalid case', async () => {
    xerceCase = null;

    sandbox
      .stub(db.XerceCase, 'findOne')
      .withArgs({
        where: { agencyId, id: caseId, isMigratedCase: false },
        attributes: ['id', 'status', 'forcedAbatementInitiatedAt'],
        include: [
          {
            model: db.XerceCaseViolation,
            as: 'caseViolations',
            where: {
              id: caseViolationIds,
            },
            attributes: ['id', 'status'],
            required: false,
            include: [
              {
                model: db.ConfigXerceViolation,
                as: 'configViolation',
                attributes: ['id', 'complyByDays'],
              },
            ],
          },
        ],
      })
      .resolves(xerceCase);

    await (xerceCaseService as any)
      .validateReopenCaseRequest(agencyId, caseId, reopenCaseRequest)
      .catch(err => {
        expect(err.name).to.equal('DBMissingEntityError');
        expect(err.message).to.equal(
          'Invalid Request. Case Id does not belong to this agency'
        );
      });
  });

  it('Should return throw error for open case received', async () => {
    xerceCase = {
      id: 101,
      agencyId,
      assigneeId: 1,
      agencyLocationId: 3,
      caseNumber: 'CE-19-1',
      issueDescription: 'This is a test issue description',
      status: 'OPEN',
      customCaseFieldValues: [],
      customForcedAbatementFieldValues: [],
      locationManualFields: [],
      locationParcelFields: [],
      isCDBGApproved: true,
      createdByUser: caseUser,
      forcedAbatementInitiatedAt: null,
      createdAt: '2019-02-16T06:29:32.814Z',
      updatedAt: '2019-02-16T06:29:32.814Z',
      inspectionAssigneeId: 1,
      closedAt: null,
      caseViolations: [
        {
          id: 1,
          violationType: {
            id: 11,
            label: 'Animal',
            violationTypeIcon: {
              id: 111,
              fileUrl: 'https://app-stage.comcateprime.com/icons/animal.png',
            },
          },
          configViolation: {
            id: 1,
            label: 'Animal Control',
          },
        },
      ],
    };

    sandbox
      .stub(db.XerceCase, 'findOne')
      .withArgs({
        where: { agencyId, id: caseId, isMigratedCase: false },
        attributes: ['id', 'status', 'forcedAbatementInitiatedAt'],
        include: [
          {
            model: db.XerceCaseViolation,
            as: 'caseViolations',
            where: {
              id: caseViolationIds,
            },
            attributes: ['id', 'status'],
            required: false,
            include: [
              {
                model: db.ConfigXerceViolation,
                as: 'configViolation',
                attributes: ['id', 'complyByDays'],
              },
            ],
          },
        ],
      })
      .resolves(xerceCase);

    await (xerceCaseService as any)
      .validateReopenCaseRequest(agencyId, caseId, reopenCaseRequest)
      .catch(err => {
        expect(err.name).to.equal('InvalidRequestError');
        expect(err.message).to.equal(
          'Invalid Request. Case status is already open.'
        );
      });
  });

  it('Should return throw error for open case received', async () => {
    xerceCase = {
      id: 101,
      agencyId,
      assigneeId: 1,
      agencyLocationId: 3,
      caseNumber: 'CE-19-1',
      issueDescription: 'This is a test issue description',
      status: 'CLOSED',
      customCaseFieldValues: [],
      customForcedAbatementFieldValues: [],
      locationManualFields: [],
      locationParcelFields: [],
      isCDBGApproved: true,
      createdByUser: caseUser,
      createdAt: '2019-02-16T06:29:32.814Z',
      updatedAt: '2019-02-16T06:29:32.814Z',
      inspectionAssigneeId: 1,
      closedAt: null,
      caseViolations: [],
    };

    sandbox
      .stub(db.XerceCase, 'findOne')
      .withArgs({
        where: { agencyId, id: caseId, isMigratedCase: false },
        attributes: ['id', 'status', 'forcedAbatementInitiatedAt'],
        include: [
          {
            model: db.XerceCaseViolation,
            as: 'caseViolations',
            where: {
              id: caseViolationIds,
            },
            attributes: ['id', 'status'],
            required: false,
            include: [
              {
                model: db.ConfigXerceViolation,
                as: 'configViolation',
                attributes: ['id', 'complyByDays'],
              },
            ],
          },
        ],
      })
      .resolves(xerceCase);

    await (xerceCaseService as any)
      .validateReopenCaseRequest(agencyId, caseId, reopenCaseRequest)
      .catch(err => {
        expect(err.name).to.equal('InvalidRequestError');
        expect(err.message).to.equal(
          'Some or all case violation id does not exist'
        );
      });
  });
});

describe('XerceCase Service: setUpdatedAt method', () => {
  let sandbox;
  let transaction;
  const agencyId = 1;
  const caseId = 1;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    transaction = sinon.stub();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should update time on case', async () => {
    sandbox.stub(db.XerceCase, 'update');

    await new XerceCaseService()
      .setUpdatedAt(agencyId, caseId, transaction)
      .catch(err => {
        expect(err.name).to.equal('Error');
      });
  });

  it('should throw error when updating time on case fails', async () => {
    sandbox.stub(db.XerceCase, 'update').throws('Error');

    await new XerceCaseService()
      .setUpdatedAt(agencyId, caseId, transaction)
      .catch(err => {
        expect(err.name).to.equal('InternalServerError');
      });
  });
});

describe('XerceCase Service: delete method', () => {
  let sandbox;
  let xerceCase;
  let transaction;
  const agencyId = 1;
  const caseId = 1;

  let caseUser: ICaseUser = null;
  let fileUrls: string[] = [];

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    transaction = sinon.stub();

    caseUser = {
      id: 4,
      firstName: 'Jhon',
      lastName: 'Doe',
    };

    fileUrls = [
      'https://cyberdyne-dev.s3.amazonaws.com/agency_1/cases/case_8/attachments/22_11_18_1_17_49.pdf',
      'https://cyberdyne-dev.s3.amazonaws.com/agency_1/cases/case_8/notices/22_11_18_1_17_49.pdf',
    ];

    xerceCase = {
      id: 101,
      agencyId,
      assigneeId: 1,
      agencyLocationId: 3,
      caseNumber: 'CE-19-1',
      issueDescription: 'This is a test issue description',
      status: 'OPEN',
      customCaseFieldValues: [],
      customForcedAbatementFieldValues: [],
      locationManualFields: [],
      locationParcelFields: [],
      isCDBGApproved: true,
      createdByUser: caseUser,
      createdAt: '2019-02-16T06:29:32.814Z',
      updatedAt: '2019-02-16T06:29:32.814Z',
      inspectionAssigneeId: 1,
      closedAt: null,
      xerceCaseAttachments: [
        {
          fileMetadataId: 1,
          fileMetadata: {
            id: 1,
            title: 'This is PNG attachment',
            description: 'this is a description',
            fileName: 'This is a file name1',
            fileSize: '20KB',
            fileURL:
              'https://cyberdyne-dev.s3.amazonaws.com/agency_1/cases/case_8/attachments/22_11_18_1_17_49.pdf',
            contentType: CaseAttachmentType.PDF,
          },
        },
      ],
      xerceCaseNotices: [
        {
          id: 11,
        },
      ],
    };
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should delete the case', async () => {
    sandbox
      .stub(db.XerceCase, 'findOne')
      .withArgs({
        where: {
          agencyId,
          id: caseId,
        },
        include: [
          {
            model: db.XerceCaseAttachment,
            as: 'xerceCaseAttachments',
            attributes: ['id', 'fileMetadataId'],
            include: [
              {
                model: db.FileMetadata,
                as: 'fileMetadata',
                attributes: ['fileURL'],
              },
            ],
          },
        ],
      })
      .resolves(xerceCase);

    sandbox.stub(db.XerceCase, 'destroy').withArgs({
      where: {
        agencyId,
        id: caseId,
      },
      transaction,
    });

    sandbox.stub(db.FileMetadata, 'destroy').withArgs({
      where: {
        agencyId,
        fileURL: fileUrls,
      },
      transaction,
    });

    sandbox.stub(DBUtil, 'createTransaction').resolves(transaction);

    sandbox.stub(DBUtil, 'rollbackTransaction').withArgs(transaction);

    sandbox.stub(DBUtil, 'commitTransaction').withArgs(transaction);

    sandbox.stub(S3Service.prototype, 'deleteObjects').withArgs(fileUrls);

    await xerceCaseService
      .delete(agencyId, caseId)
      .catch(err => expect(err.name).to.equal('Error'));
  });

  it('Should return throw error while deleting the xerce case', async () => {
    sandbox
      .stub(db.XerceCase, 'findOne')
      .withArgs({
        where: {
          agencyId,
          id: caseId,
        },
        include: [
          {
            model: db.XerceCaseAttachment,
            as: 'xerceCaseAttachments',
            attributes: ['id', 'fileMetadataId'],
            include: [
              {
                model: db.FileMetadata,
                as: 'fileMetadata',
                attributes: ['fileURL'],
              },
            ],
          },
        ],
      })
      .resolves(xerceCase);

    sandbox
      .stub(db.XerceCase, 'destroy')
      .withArgs({
        where: {
          agencyId,
          id: caseId,
        },
        transaction,
      })
      .throws('Error');

    sandbox.stub(db.FileMetadata, 'destroy').withArgs({
      where: {
        agencyId,
        fileURL: fileUrls,
      },
      transaction,
    });

    sandbox.stub(DBUtil, 'createTransaction').resolves(transaction);

    sandbox.stub(DBUtil, 'rollbackTransaction').withArgs(transaction);

    sandbox.stub(DBUtil, 'commitTransaction').withArgs(transaction);

    sandbox.stub(S3Service.prototype, 'deleteObjects').withArgs(fileUrls);

    await xerceCaseService
      .delete(agencyId, caseId)
      .catch(err => expect(err.name).to.equal('InternalServerError'));
  });

  it('Should return throw error while fetching the xerce case', async () => {
    sandbox
      .stub(db.XerceCase, 'findOne')
      .withArgs({
        where: {
          agencyId,
          id: caseId,
        },
        include: [
          {
            model: db.XerceCaseAttachment,
            as: 'xerceCaseAttachments',
            attributes: ['id', 'fileMetadataId'],
            include: [
              {
                model: db.FileMetadata,
                as: 'fileMetadata',
                attributes: ['fileURL'],
              },
            ],
          },
        ],
      })
      .throws('Error');

    sandbox.stub(db.XerceCase, 'destroy').withArgs({
      where: {
        agencyId,
        id: caseId,
      },
      transaction,
    });

    sandbox.stub(db.FileMetadata, 'destroy').withArgs({
      where: {
        agencyId,
        fileURL: fileUrls,
      },
      transaction,
    });

    sandbox.stub(DBUtil, 'createTransaction').resolves(transaction);

    sandbox.stub(DBUtil, 'rollbackTransaction').withArgs(transaction);

    sandbox.stub(DBUtil, 'commitTransaction').withArgs(transaction);

    sandbox.stub(S3Service.prototype, 'deleteObjects').withArgs(fileUrls);

    await xerceCaseService
      .delete(agencyId, caseId)
      .catch(err => expect(err.name).to.equal('InternalServerError'));
  });

  it('Should return throw error if xerce case not found', async () => {
    xerceCase = null;
    sandbox
      .stub(db.XerceCase, 'findOne')
      .withArgs({
        where: {
          agencyId,
          id: caseId,
        },
        include: [
          {
            model: db.XerceCaseAttachment,
            as: 'xerceCaseAttachments',
            attributes: ['id', 'fileMetadataId'],
            include: [
              {
                model: db.FileMetadata,
                as: 'fileMetadata',
                attributes: ['fileURL'],
              },
            ],
          },
        ],
      })
      .resolves(xerceCase);

    await xerceCaseService
      .delete(agencyId, caseId)
      .catch(err => expect(err.name).to.equal('InvalidRequestError'));
  });
});
