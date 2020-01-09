import { expect } from 'chai';
import 'mocha';
import * as sinon from 'sinon';

import {
  initMergeFieldResolution,
  initMergeTableResolution,
} from '../../../../api/service/mergeCode';
import * as resolveAgencyInfo from '../../../../api/service/mergeCode/fields/agencyInformation';
import * as resolveContact from '../../../../api/service/mergeCode/tables/contact';

describe('MergeCode Index.ts: initMergeFieldResolution method', () => {
  let sandbox;
  const agencyId = 1;
  const caseId = 1;
  let user: IAgencyUserClaim | ISuperAdminClaim;
  let generateNoticeUiCodes: IGenerateNoticeUiCodes;
  let attachments: IAttachmentsUiMergeCodes[];
  let nextInspection: IInspectionRequest;
  let openViolations: IOpenViolationUiMergeCodes[];
  let resolutionActions: IResolutionAction[];
  let configNotice;
  let resolvedFields;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    user = {
      id: 2,
      agencyId,
      agencyName: 'City of Pune',
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

    configNotice = {
      id: 10,
      content: '<p>{{agency_name}}</p>',
      mergeFields: {
        'Agency Information': {
          fields: ['{{agency_name}}'],
        },
      },
      mergeTables: {},
      headerSection: {
        id: 15,
        content: '<div>header content</div>',
        mergeFields: {},
        mergeTables: null,
      },
      footerSection: {
        id: 16,
        content: '<div>footer content</div>',
        mergeFields: {},
        mergeTables: null,
      },
    };

    openViolations = [
      {
        configViolationId: 8,
        entity: {
          'Animal Colour': 'Black',
          'License Number': '1234',
          Age: 12,
          Breed: '',
          Note: '',
        },
      },
    ];

    nextInspection = {
      plannedDate: new Date('2019-08-30T17:12:23.561Z'),
      assigneeId: 2,
    };

    attachments = [
      {
        fileURL: 'www.test-url.com/notice.pdf',
        title: 'notice',
        uploadedAt: new Date('2019-08-30T17:12:23.561Z'),
        uploadedBy: 'John Doe',
      },
    ];

    resolutionActions = [
      {
        articleNumber: '1.0.1',
        description: 'This is a test article',
        resolution: 'This is a test resolution',
        complyByDate: '2019-08-30T17:12:23.561Z',
      },
    ];

    generateNoticeUiCodes = {
      recipientIds: [7, 8],
      responsibleContactId: 9,
      attachments,
      nextInspection,
      openViolations,
      resolutionActions,
      caseAssigneeId: 2,
    };

    resolvedFields = {
      '{{agency_name}}': 'Agency Of Alabama',
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should resolve all merge fields', async () => {
    sandbox
      .stub(resolveAgencyInfo, 'resolveFields')
      .withArgs(agencyId, caseId, configNotice, generateNoticeUiCodes, user)
      .returns(resolvedFields);

    const result = await initMergeFieldResolution(
      agencyId,
      caseId,
      configNotice,
      generateNoticeUiCodes,
      user
    );

    expect(resolvedFields).to.deep.equal(result);
  });

  it('should throw error while resolving merge fields', async () => {
    sandbox.stub(resolveAgencyInfo, 'resolveFields').throws('Error');

    await initMergeFieldResolution(
      agencyId,
      caseId,
      configNotice,
      generateNoticeUiCodes,
      user
    ).catch(err => expect(err.name).to.be.equal('TypeError'));
  });
});

describe('MergeCode Index.ts: initMergeTableResolution method', () => {
  let sandbox;
  const agencyId = 1;
  const caseId = 1;
  let user: IAgencyUserClaim | ISuperAdminClaim;
  let generateNoticeUiCodes: IGenerateNoticeUiCodes;
  let attachments: IAttachmentsUiMergeCodes[];
  let nextInspection: IInspectionRequest;
  let openViolations: IOpenViolationUiMergeCodes[];
  let resolutionActions: IResolutionAction[];
  let configNotice;
  let resolvedTables;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    user = {
      id: 2,
      agencyId,
      agencyName: 'City of Pune',
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

    configNotice = {
      id: 10,
      content: '<p>{{agency_name}}</p>',
      mergeFields: {},
      mergeTables: {
        Contacts: {
          tables: ['{{all_legal_entities}}'],
        },
      },
      headerSection: {
        id: 15,
        content: '<div>header content</div>',
        mergeFields: {},
        mergeTables: null,
      },
      footerSection: {
        id: 16,
        content: '<div>footer content</div>',
        mergeFields: {},
        mergeTables: null,
      },
    };

    openViolations = [
      {
        configViolationId: 8,
        entity: {
          'Animal Colour': 'Black',
          'License Number': '1234',
          Age: 12,
          Breed: '',
          Note: '',
        },
      },
    ];

    nextInspection = {
      plannedDate: new Date('2019-08-30T17:12:23.561Z'),
      assigneeId: 2,
    };

    attachments = [
      {
        fileURL: 'www.test-url.com/notice.pdf',
        title: 'notice',
        uploadedAt: new Date('2019-08-30T17:12:23.561Z'),
        uploadedBy: 'John Doe',
      },
    ];

    resolutionActions = [
      {
        articleNumber: '1.0.1',
        description: 'This is a test article',
        resolution: 'This is a test resolution',
        complyByDate: '2019-08-30T17:12:23.561Z',
      },
    ];

    generateNoticeUiCodes = {
      recipientIds: [7, 8],
      responsibleContactId: 9,
      attachments,
      nextInspection,
      openViolations,
      resolutionActions,
      caseAssigneeId: 2,
    };

    resolvedTables = {
      '{{all_legal_entities}}': '<p>List of all legal entity contacts<p>',
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should resolve all merge tables', async () => {
    sandbox
      .stub(resolveContact, 'resolveTables')
      .withArgs(agencyId, caseId, configNotice, generateNoticeUiCodes, user)
      .returns(resolvedTables);

    const result = await initMergeTableResolution(
      agencyId,
      caseId,
      configNotice,
      generateNoticeUiCodes,
      user
    );

    expect(resolvedTables).to.deep.equal(result);
  });

  it('should throw error while resolving merge tables', async () => {
    sandbox
      .stub(resolveContact, 'resolveTables')
      .withArgs(agencyId, caseId, configNotice, generateNoticeUiCodes, user)
      .throws('Error');

    await initMergeTableResolution(
      agencyId,
      caseId,
      configNotice,
      generateNoticeUiCodes,
      user
    ).catch(err => expect(err.name).to.be.equal('TypeError'));
  });
});
