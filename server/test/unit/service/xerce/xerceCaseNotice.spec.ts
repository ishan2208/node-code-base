import { expect } from 'chai';
import 'mocha';
import * as sinon from 'sinon';

import db from '../../../../api/models';
import * as mergeCodeModule from '../../../../api/service/mergeCode';
import { resolveFields as resolveContactRecipientFields } from '../../../../api/service/mergeCode/contactRecipientFields';
import MergeCodeService from '../../../../api/service/mergeCode/mergeCode';
import XerceCaseListingService from '../../../../api/service/xerce/caseListing';
import XerceCaseService from '../../../../api/service/xerce/xerceCase';
import XerceCaseContact from '../../../../api/service/xerce/xerceCaseContact';
import XerceCaseHistoryService from '../../../../api/service/xerce/xerceCaseHistory';
import XerceCaseNoticeService from '../../../../api/service/xerce/xerceCaseNotice';
import DBUtil from '../../../../api/utils/dbUtil';
import HTMLFormUtil from '../../../../api/utils/htmlFormUtil';

const xerceCaseNoticeService = new XerceCaseNoticeService();

describe('XerceCaseNoticeService Service: create Method', () => {
  let sandbox;
  let transaction;
  const agencyId = 1;
  const caseId = 2;
  const staffId = 3;
  const noticeId = 5;
  const noticeNumber = '05';
  const configNoticeId = 7;
  let noticeReq: IXerceCaseNoticeRequest;
  let notice;
  let responseObj: IXerceCaseNotice;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    transaction = sinon.stub();

    noticeReq = {
      certifiedMailNumber: '1234567890',
      configNoticeId: 4,
      issuedAt: new Date('2018-03-30T08:36:22.338Z'),
      noticeContent: ['<p>This is a test</p>', '<p>This is also a test</p>'],
    };

    responseObj = {
      id: noticeId,
      noticeContent: ['<p>This is a test</p>', '<p>This is also a test</p>'],
      issuedAt: new Date('2018-03-30T08:36:22.338Z'),
      mergedFields: {},
      note: null,
      noticeNumber,
      certifiedMailNumber: '1234567890',
      configNotice: {
        id: configNoticeId,
        label: 'Court Notice',
        proposeForcedAbatement: false,
      },
      createdBy: {
        id: staffId,
        firstName: 'John',
        lastName: 'Doe',
      },
      updatedBy: null,
      createdAt: new Date('2018-03-30T08:36:22.338Z'),
      updatedAt: null,
    };

    notice = {
      id: noticeId,
      agencyId,
      xerceCaseId: caseId,
      configNoticeId,
      issuedAt: noticeReq.issuedAt,
      noticeContent: ['<p>This is a test</p>', '<p>This is also a test</p>'],
      mergedFields: {},
      noticeNumber,
      noteId: 6,
      createdBy: 3,
      updatedBy: 3,
      createdAt: new Date('2018-03-30T08:36:22.338Z'),
      updatedAt: new Date('2018-03-30T08:36:22.338Z'),
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should create xerce case notice', async () => {
    sandbox
      .stub(XerceCaseNoticeService.prototype, 'getNextNoticeNumber')
      .withArgs(agencyId, noticeReq.configNoticeId, transaction)
      .resolves(noticeNumber);

    sandbox.stub(db.XerceCaseNotice, 'create').resolves(notice);

    sandbox
      .stub(XerceCaseNoticeService.prototype, 'get')
      .withArgs(agencyId, caseId, notice.id, transaction)
      .resolves(responseObj);

    const result = await xerceCaseNoticeService.create(
      agencyId,
      caseId,
      staffId,
      noticeReq,
      transaction
    );

    expect(result).to.deep.equal(responseObj);
  });

  it('Throws Exception DBConflictError', async () => {
    sandbox
      .stub(XerceCaseNoticeService.prototype, 'getNextNoticeNumber')
      .withArgs(agencyId, noticeReq.configNoticeId, transaction)
      .resolves(noticeNumber);

    sandbox
      .stub(db.XerceCaseNotice, 'create')
      .throws('SequelizeUniqueConstraintError');

    await xerceCaseNoticeService
      .create(agencyId, caseId, staffId, noticeReq, transaction)
      .catch(err => expect(err.name).to.equal('DBConflictError'));
  });

  it('Throws Exception InternalServerError', async () => {
    sandbox
      .stub(XerceCaseNoticeService.prototype, 'getNextNoticeNumber')
      .withArgs(agencyId, noticeReq.configNoticeId, transaction)
      .resolves(noticeNumber);

    sandbox.stub(db.XerceCaseNotice, 'create').throws('Error');

    await xerceCaseNoticeService
      .create(agencyId, caseId, staffId, noticeReq, transaction)
      .catch(err => expect(err.name).to.equal('InternalServerError'));
  });
});

describe('XerceCaseNoticeService Service: get Method', () => {
  let sandbox;
  let transaction;
  const agencyId = 1;
  const xerceCaseId = 2;
  const staffId = 3;
  const noticeId = 5;
  const noticeNumber = '05';
  const configNoticeId = 7;
  let notice;
  let responseObj: IXerceCaseNotice;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    transaction = sinon.stub();

    responseObj = {
      id: noticeId,
      noticeContent: ['<p>This is a test</p>', '<p>This is also a test</p>'],
      issuedAt: new Date('2018-03-30T08:36:22.338Z'),
      mergedFields: {},
      note: null,
      noticeNumber,
      certifiedMailNumber: '1234567890',
      configNotice: {
        id: configNoticeId,
        label: 'Court Notice',
        proposeForcedAbatement: false,
      },
      createdBy: {
        id: staffId,
        firstName: 'John',
        lastName: 'Doe',
      },
      updatedBy: null,
      createdAt: new Date('2018-03-30T08:36:22.338Z'),
      updatedAt: null,
    };

    notice = {
      id: noticeId,
      agencyId,
      xerceCaseId,
      configNoticeId,
      issuedAt: new Date('2018-03-30T08:36:22.338Z'),
      noticeContent: ['<p>This is a test</p>', '<p>This is also a test</p>'],
      certifiedMailNumber: '1234567890',
      noticeNumber,
      mergedFields: {},
      noteId: 6,
      configNotice: {
        id: configNoticeId,
        label: 'Court Notice',
        proposeForcedAbatement: false,
      },
      createdByUser: {
        id: staffId,
        firstName: 'John',
        lastName: 'Doe',
      },
      updatedBy: {
        id: staffId,
        firstName: 'John',
        lastName: 'Doe',
      },
      createdAt: new Date('2018-03-30T08:36:22.338Z'),
      updatedAt: new Date('2018-03-30T08:36:22.338Z'),
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return case notice details', async () => {
    sandbox
      .stub(db.XerceCaseNotice, 'findOne')
      .withArgs({
        where: {
          agencyId,
          xerceCaseId,
          id: noticeId,
        },
        include: [
          {
            model: db.User,
            as: 'createdByUser',
            attributes: ['id', 'firstName', 'lastName'],
          },
          {
            model: db.ConfigXerceNotice,
            as: 'configNotice',
            attributes: ['id', 'label', 'proposeForcedAbatement'],
          },
        ],
        transaction,
      })
      .resolves(notice);

    const result = await xerceCaseNoticeService.get(
      agencyId,
      xerceCaseId,
      noticeId,
      transaction
    );

    expect(result).to.deep.equal(responseObj);
  });

  it('Throws Exception InternalServerError', async () => {
    sandbox
      .stub(db.XerceCaseNotice, 'findOne')
      .withArgs({
        where: {
          agencyId,
          xerceCaseId,
          id: noticeId,
        },
        include: [
          {
            model: db.User,
            as: 'createdByUser',
            attributes: ['id', 'firstName', 'lastName'],
          },
          {
            model: db.ConfigXerceNotice,
            as: 'configNotice',
            attributes: ['id', 'label', 'proposeForcedAbatement'],
          },
        ],
        transaction,
      })
      .throws('Error');

    await xerceCaseNoticeService
      .get(agencyId, xerceCaseId, noticeId, transaction)
      .catch(err => expect(err.name).to.equal('InternalServerError'));
  });
});

describe('XerceCaseNoticeService Service: editNoticeCertifiedMailNumber Method', () => {
  let sandbox;
  let transaction;
  const agencyId = 1;
  const caseId = 2;
  const staffId = 3;
  const noticeId = 5;
  const inspectionId = 7;
  let requestBody: IEditCertifiedMailNumberRequest;
  let responseObj: IEditCertifiedMailNumberResponse;
  let editNoticeObj;
  let xerceCaseInspection;

  const authScope = {
    comcateAdmin: true,
    siteAdmin: true,
  };

  const userProfile: IAgencyUserClaim = {
    agencyName: 'City of Alabama',
    id: staffId,
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

    requestBody = {
      certifiedMailNumber: '1234567890',
    };

    responseObj = {
      noticeId,
      inspectionId,
      certifiedMailNumber: requestBody.certifiedMailNumber,
    };

    editNoticeObj = {
      certifiedMailNumber: requestBody.certifiedMailNumber,
      updatedBy: userProfile.id,
    };

    xerceCaseInspection = {
      id: 1,
      agencyId,
      xerceCaseId: caseId,
      plannedDate: new Date('2019-08-30T17:12:23.561Z'),
      actualDate: null,
      assigneeId: 1,
      noteId: null,
      attachmentIds: [],
      noticeId: null,
      status: InspectionStatus.SCHEDULED,
      isVerificationInspection: true,
      createdBy: 1,
      updatedBy: null,
      createdAt: new Date('2019-02-14T10:54:16.905Z'),
      updatedAt: new Date('2019-02-14T10:54:16.905Z'),
      notice: {
        id: 1,
        configNotice: {
          id: 1,
          label: 'Notice',
        },
      },
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should update xerce case notice with certified mail number and updated by', async () => {
    sandbox
      .stub(XerceCaseNoticeService.prototype, 'getEditNoticeObj')
      .withArgs(requestBody, userProfile)
      .returns(editNoticeObj);

    sandbox.stub(DBUtil, 'createTransaction').returns(transaction);

    sandbox
      .stub(db.XerceCaseInspection, 'findOne')
      .withArgs({
        where: {
          id: inspectionId,
          agencyId,
          xerceCaseId: caseId,
          noticeId,
        },
        include: [
          {
            model: db.XerceCaseNotice,
            as: 'notice',
            include: [
              {
                model: db.ConfigXerceNotice,
                as: 'configNotice',
                attributes: ['id', 'label', 'proposeForcedAbatement'],
              },
            ],
          },
        ],
      })
      .resolves(xerceCaseInspection);

    sandbox
      .stub(XerceCaseService.prototype, 'setUpdatedAt')
      .withArgs(agencyId, caseId, transaction);

    sandbox.stub(DBUtil, 'commitTransaction');

    sandbox.stub(XerceCaseListingService.prototype, 'refreshCaseListing');

    const result = await xerceCaseNoticeService.editNoticeCertifiedMailNumber(
      agencyId,
      caseId,
      inspectionId,
      noticeId,
      userProfile,
      requestBody
    );

    expect(result).to.deep.equal(responseObj);
  });

  it('Throws Exception InternalServerError when querying case inspection', async () => {
    sandbox.stub(DBUtil, 'createTransaction').returns(transaction);

    sandbox
      .stub(db.XerceCaseInspection, 'findOne')
      .withArgs({
        where: {
          id: inspectionId,
          agencyId,
          xerceCaseId: caseId,
          noticeId,
        },
        include: [
          {
            model: db.XerceCaseNotice,
            as: 'notice',
            include: [
              {
                model: db.ConfigXerceNotice,
                as: 'configNotice',
                attributes: ['id', 'label', 'proposeForcedAbatement'],
              },
            ],
          },
        ],
      })
      .throws({ name: 'error' });

    sandbox
      .stub(XerceCaseHistoryService.prototype, 'createMailNumberHistory')
      .withArgs(
        agencyId,
        caseId,
        userProfile.id,
        requestBody.certifiedMailNumber,
        xerceCaseInspection.notice.configNotice.label,
        transaction
      );

    await xerceCaseNoticeService
      .editNoticeCertifiedMailNumber(
        agencyId,
        caseId,
        inspectionId,
        noticeId,
        userProfile,
        requestBody
      )
      .catch(err => {
        expect(err.name).to.deep.equal('InternalServerError');
      });
  });

  it('Throws Exception DBMissingEntityError when querying case inspection returns null', async () => {
    const errorMessage = 'Notice not found';

    sandbox.stub(DBUtil, 'createTransaction').returns(transaction);

    sandbox
      .stub(db.XerceCaseInspection, 'findOne')
      .withArgs({
        where: {
          id: inspectionId,
          agencyId,
          xerceCaseId: caseId,
          noticeId,
        },
        include: [
          {
            model: db.XerceCaseNotice,
            as: 'notice',
            include: [
              {
                model: db.ConfigXerceNotice,
                as: 'configNotice',
                attributes: ['id', 'label', 'proposeForcedAbatement'],
              },
            ],
          },
        ],
      })
      .returns(null);

    sandbox
      .stub(XerceCaseHistoryService.prototype, 'createMailNumberHistory')
      .withArgs(
        agencyId,
        caseId,
        userProfile.id,
        requestBody.certifiedMailNumber,
        xerceCaseInspection.notice.configNotice.label,
        transaction
      );

    await xerceCaseNoticeService
      .editNoticeCertifiedMailNumber(
        agencyId,
        caseId,
        inspectionId,
        noticeId,
        userProfile,
        requestBody
      )
      .catch(err => {
        expect(err.name).to.deep.equal('DBMissingEntityError');
        expect(err.message).to.deep.equal(errorMessage);
      });
  });

  it('Throws Exception DBConflictError when saving Certified Mail Number', async () => {
    const errorMessage = 'Certified Mail Number exists already.';

    sandbox.stub(DBUtil, 'createTransaction').returns(transaction);

    sandbox
      .stub(db.XerceCaseInspection, 'findOne')
      .withArgs({
        where: {
          id: inspectionId,
          agencyId,
          xerceCaseId: caseId,
          noticeId,
        },
        include: [
          {
            model: db.XerceCaseNotice,
            as: 'notice',
            include: [
              {
                model: db.ConfigXerceNotice,
                as: 'configNotice',
                attributes: ['id', 'label', 'proposeForcedAbatement'],
              },
            ],
          },
        ],
      })
      .resolves(xerceCaseInspection);

    sandbox
      .stub(XerceCaseHistoryService.prototype, 'createMailNumberHistory')
      .withArgs(
        agencyId,
        caseId,
        userProfile.id,
        requestBody.certifiedMailNumber,
        xerceCaseInspection.notice.configNotice.label,
        transaction
      );

    sandbox
      .stub(db.XerceCaseNotice, 'update')
      .throws({ name: 'SequelizeUniqueConstraintError' });

    sandbox.stub(DBUtil, 'rollbackTransaction');

    await xerceCaseNoticeService
      .editNoticeCertifiedMailNumber(
        agencyId,
        caseId,
        inspectionId,
        noticeId,
        userProfile,
        requestBody
      )
      .catch(err => {
        expect(err.name).to.deep.equal('DBConflictError');
        expect(err.message).to.deep.equal(errorMessage);
      });
  });

  it('Throws Exception InternalServerError when saving Certified Mail Number', async () => {
    sandbox.stub(DBUtil, 'createTransaction').returns(transaction);

    sandbox
      .stub(db.XerceCaseInspection, 'findOne')
      .withArgs({
        where: {
          id: inspectionId,
          agencyId,
          xerceCaseId: caseId,
          noticeId,
        },
        include: [
          {
            model: db.XerceCaseNotice,
            as: 'notice',
            include: [
              {
                model: db.ConfigXerceNotice,
                as: 'configNotice',
                attributes: ['id', 'label', 'proposeForcedAbatement'],
              },
            ],
          },
        ],
      })
      .resolves(xerceCaseInspection);

    sandbox
      .stub(XerceCaseHistoryService.prototype, 'createMailNumberHistory')
      .withArgs(
        agencyId,
        caseId,
        userProfile.id,
        requestBody.certifiedMailNumber,
        xerceCaseInspection.notice.configNotice.label,
        transaction
      );

    sandbox
      .stub(db.XerceCaseNotice, 'update')
      .throws({ name: 'InternalServerError' });

    sandbox.stub(DBUtil, 'rollbackTransaction');

    await xerceCaseNoticeService
      .editNoticeCertifiedMailNumber(
        agencyId,
        caseId,
        inspectionId,
        noticeId,
        userProfile,
        requestBody
      )
      .catch(err => {
        expect(err.name).to.deep.equal('InternalServerError');
      });
  });
});

describe('XerceCaseNoticeService Service: generateNotice Method', () => {
  let sandbox;
  const agencyId = 1;
  const caseId = 2;
  let user: IAgencyUserClaim | ISuperAdminClaim;
  let generateNoticeFieldRequest: IGenerateNoticeRequest;
  let generateNoticeUiCodes: IGenerateNoticeUiCodes;
  let attachments: IAttachmentsUiMergeCodes[];
  let nextInspection: IInspectionRequest;
  let openViolations: IOpenViolationUiMergeCodes[];
  let resolutionActions: IResolutionAction[];
  let configNotice;
  let allConfiguredMergeFieldCategories: string[];
  const contactRecipientFields = {
    '6': [{ '{{recipient_contact_name}}': 'Janet Doe' }],
  };
  const notice =
    '<div>header content</div><p>City of Alabama</p><div>footer content</div>';

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    allConfiguredMergeFieldCategories = ['Agency Information'];

    user = {
      id: 2,
      agencyId,
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

    generateNoticeFieldRequest = {
      configNoticeId: 3,
      uiMergeCodes: generateNoticeUiCodes,
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return notice details', async () => {
    sandbox
      .stub(XerceCaseNoticeService.prototype, 'validateRequest')
      .withArgs(agencyId, caseId, generateNoticeFieldRequest);

    sandbox
      .stub(db.ConfigXerceNotice, 'findOne')
      .withArgs({
        where: {
          agencyId,
          id: generateNoticeFieldRequest.configNoticeId,
          isActive: true,
          noticeType: NoticeType.HTML,
        },
        include: [
          {
            model: db.ConfigNoticeFormSection,
            as: 'headerSection',
            attributes: ['id', 'content', 'mergeFields', 'mergeTables'],
          },
          {
            model: db.ConfigNoticeFormSection,
            as: 'footerSection',
            attributes: ['id', 'content', 'mergeFields', 'mergeTables'],
          },
        ],
        attributes: ['id', 'content', 'mergeFields', 'mergeTables'],
      })
      .returns(configNotice);

    sandbox
      .stub(mergeCodeModule, 'initMergeFieldResolution')
      .withArgs(
        agencyId,
        caseId,
        configNotice,
        generateNoticeFieldRequest.uiMergeCodes,
        user
      )
      .returns({ '{{agency_name}}': 'City of Alabama' });

    sandbox
      .stub(MergeCodeService.prototype, 'getConfiguredMergeFieldCategories')
      .withArgs(configNotice)
      .returns(allConfiguredMergeFieldCategories);

    sandbox.stub(HTMLFormUtil, 'replaceMergeCodes').returns(notice);

    const result = await xerceCaseNoticeService.generateNotice(
      agencyId,
      caseId,
      user,
      generateNoticeFieldRequest
    );

    expect(result).to.deep.equal([notice]);
  });

  it('should return notice details(with contact recipients)', async () => {
    configNotice = {
      id: 10,
      content: '<p>{{agency_name}}</p>',
      mergeFields: {
        'Contact Recipient': { fields: ['{{recipient_contact_name}}'] },
        'Agency Information': { fields: ['{{agency_name}}'] },
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

    sandbox
      .stub(XerceCaseNoticeService.prototype, 'validateRequest')
      .withArgs(agencyId, caseId, generateNoticeFieldRequest);

    sandbox
      .stub(db.ConfigXerceNotice, 'findOne')
      .withArgs({
        where: {
          agencyId,
          id: generateNoticeFieldRequest.configNoticeId,
          isActive: true,
          noticeType: NoticeType.HTML,
        },
        include: [
          {
            model: db.ConfigNoticeFormSection,
            as: 'headerSection',
            attributes: ['id', 'content', 'mergeFields', 'mergeTables'],
          },
          {
            model: db.ConfigNoticeFormSection,
            as: 'footerSection',
            attributes: ['id', 'content', 'mergeFields', 'mergeTables'],
          },
        ],
        attributes: ['id', 'content', 'mergeFields', 'mergeTables'],
      })
      .returns(configNotice);

    sandbox
      .stub(mergeCodeModule, 'initMergeFieldResolution')
      .withArgs(
        agencyId,
        caseId,
        configNotice,
        generateNoticeFieldRequest.uiMergeCodes,
        user
      )
      .returns({ '{{agency_name}}': 'City of Alabama' });

    sandbox
      .stub(MergeCodeService.prototype, 'getConfiguredMergeFieldCategories')
      .withArgs(configNotice)
      .returns(allConfiguredMergeFieldCategories);

    sandbox
      .stub(resolveContactRecipientFields, 'arguments')
      .withArgs(
        agencyId,
        caseId,
        configNotice,
        generateNoticeFieldRequest.uiMergeCodes,
        user
      )
      .returns(contactRecipientFields);

    const noticeContent =
      '<div>header content</div><p>City of Alabama</p>\n<p>Janet Doe</p><div>footer content</div>';

    sandbox.stub(HTMLFormUtil, 'replaceMergeCodes').returns(noticeContent);

    const result = await xerceCaseNoticeService.generateNotice(
      agencyId,
      caseId,
      user,
      generateNoticeFieldRequest
    );

    expect(result).to.deep.equal([noticeContent]);
  });

  it('should throw InternalServerError exception', async () => {
    sandbox
      .stub(XerceCaseNoticeService.prototype, 'validateRequest')
      .withArgs(agencyId, caseId, generateNoticeFieldRequest);

    sandbox
      .stub(db.ConfigXerceNotice, 'findOne')
      .withArgs({
        where: {
          agencyId,
          id: generateNoticeFieldRequest.configNoticeId,
          isActive: true,
          noticeType: NoticeType.HTML,
        },
        include: [
          {
            model: db.ConfigNoticeFormSection,
            as: 'headerSection',
            attributes: ['id', 'content', 'mergeFields', 'mergeTables'],
          },
          {
            model: db.ConfigNoticeFormSection,
            as: 'footerSection',
            attributes: ['id', 'content', 'mergeFields', 'mergeTables'],
          },
        ],
        attributes: ['id', 'content', 'mergeFields', 'mergeTables'],
      })
      .throws('Error');

    await xerceCaseNoticeService
      .generateNotice(agencyId, caseId, user, generateNoticeFieldRequest)
      .catch(err => expect(err.name).to.equal('InternalServerError'));
  });

  it('should throw InvalidRequestError exception', async () => {
    sandbox
      .stub(db.ConfigXerceNotice, 'findOne')
      .withArgs({
        where: {
          agencyId,
          id: generateNoticeFieldRequest.configNoticeId,
          isActive: true,
          noticeType: NoticeType.HTML,
        },
        include: [
          {
            model: db.ConfigNoticeFormSection,
            as: 'headerSection',
            attributes: ['id', 'content', 'mergeFields', 'mergeTables'],
          },
          {
            model: db.ConfigNoticeFormSection,
            as: 'footerSection',
            attributes: ['id', 'content', 'mergeFields', 'mergeTables'],
          },
        ],
        attributes: ['id', 'content', 'mergeFields', 'mergeTables'],
      })
      .returns(null);

    await xerceCaseNoticeService
      .generateNotice(agencyId, caseId, user, generateNoticeFieldRequest)
      .catch(err => expect(err.name).to.equal('InvalidRequestError'));
  });
});

describe('XerceCaseNoticeService: validateRequest Method', () => {
  let sandbox;
  const agencyId = 1;
  const caseId = 2;
  let generateNoticeFieldRequest: IGenerateNoticeRequest;
  let generateNoticeUiCodes: IGenerateNoticeUiCodes;
  let attachments: IAttachmentsUiMergeCodes[];
  let nextInspection: IInspectionRequest;
  let openViolations: IOpenViolationUiMergeCodes[];
  let resolutionActions: IResolutionAction[];

  beforeEach(() => {
    sandbox = sinon.createSandbox();

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

    generateNoticeFieldRequest = {
      configNoticeId: 3,
      uiMergeCodes: generateNoticeUiCodes,
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should throw InvalidRequestError when UI Merge Codes do not contain Violations', async () => {
    const errMsg = 'No Violations received as part of ui merge codes';
    generateNoticeFieldRequest.uiMergeCodes.openViolations = [];

    await (xerceCaseNoticeService as any)
      .validateRequest(agencyId, caseId, generateNoticeFieldRequest)
      .catch(err => {
        expect(err.name).to.deep.equal('InvalidRequestError');
        expect(err.message).to.equal(errMsg);
      });
  });

  it('should throw InvalidRequestError when no contact is present', async () => {
    const errorMsg = `Invalid Request. You need to have atleast one contact attached to case before generating notice.`;

    sandbox
      .stub(XerceCaseContact.prototype, 'getAll')
      .withArgs(agencyId, caseId)
      .returns([]);

    await (xerceCaseNoticeService as any)
      .validateRequest(agencyId, caseId, generateNoticeFieldRequest)
      .catch(err => {
        expect(err.name).to.equal('InvalidRequestError');
        expect(err.message).to.equal(errorMsg);
      });
  });
});
