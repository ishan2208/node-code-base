import { expect } from 'chai';
import 'mocha';
import * as sinon from 'sinon';

import db from '../../../../api/models';
import ConfigDispositionService from '../../../../api/service/agencySetup/configDisposition';
import ConfigNoticeService from '../../../../api/service/agencySetup/configXerceNotice';
import XerceCaseListingService from '../../../../api/service/xerce/caseListing';
import XerceCaseService from '../../../../api/service/xerce/xerceCase';
import XerceCaseAbatementService from '../../../../api/service/xerce/xerceCaseAbatement';
import XerceCaseAssigneeService from '../../../../api/service/xerce/xerceCaseAssignee';
import XerceCaseAttachmentService from '../../../../api/service/xerce/xerceCaseAttachment';
import XerceCaseContact from '../../../../api/service/xerce/xerceCaseContact';
import XerceCaseInspectionService from '../../../../api/service/xerce/xerceCaseInspection';
import XerceCaseInspectionAttachmentService from '../../../../api/service/xerce/xerceCaseInspectionAttachment';
import XerceCaseInspectionViolationService from '../../../../api/service/xerce/xerceCaseInspectionViolation';
import XerceCaseNoteService from '../../../../api/service/xerce/xerceCaseNote';
import XerceCaseNoticeService from '../../../../api/service/xerce/xerceCaseNotice';
import DBUtil from '../../../../api/utils/dbUtil';
import XerceCaseHistoryService from './../../../../api/service/xerce/xerceCaseHistory';

const xerceCaseAbatementService = new XerceCaseAbatementService();

describe('XerceCaseAbatement Service: performInspection method', () => {
  let sandbox;
  let requestBody: IPerformInspectionRequest;
  let responseBody: ICaseResponse;
  let note: INote;
  let notice: IXerceCaseNotice;
  let currentInspection;
  let xerceCaseViolations;
  let caseAttachments: IXerceCaseAttachment[];
  let transaction;
  const abatementStage = 'Verbal Warning';
  let inspections;

  const agencyId = 1;
  const xerceCaseId = 8;
  const inspectionId = 1;

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

  const xerceCaseContact = [
    {
      id: 4,
      caseContactId: 4,
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
      isBillable: true,
      caseContactRole: 6,
    },
  ];

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    inspections = [
      {
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
      },
    ];

    note = {
      id: 1,
      noteContent: 'My new note',
      createdBy: {
        id: 1,
        firstName: 'Jhon',
        lastName: 'Doe',
      },
      createdAt: new Date('2019-03-05T16:23:14.912Z'),
      updatedBy: {
        id: 1,
        firstName: 'Jhon',
        lastName: 'Doe',
      },
      updatedAt: new Date('2019-03-05T16:23:14.912Z'),
    };

    notice = {
      id: 1,
      noticeContent: null,
      issuedAt: new Date('2020-03-05T16:23:14.912Z'),
      mergedFields: null,
      note: null,
      noticeNumber: '01',
      configNotice: {
        id: 1,
        label: 'Court Notice',
        proposeForcedAbatement: false,
      },
      createdBy: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
      },
      certifiedMailNumber: '1234567890',
      updatedBy: null,
      createdAt: new Date('2018-03-30T08:36:22.338Z'),
      updatedAt: null,
    };

    caseAttachments = [
      {
        id: 1,
        title: 'This is PNG attachment ',
        description: 'this is a description',
        fileName: 'This is a file name1',
        fileSize: '20KB',
        fileURL:
          'https://cyberdyne-dev.s3.amazonaws.com/agency_1/cases/case_8/attachments/22_11_18_1_17_49.pdf',
        mimeType: 'image/png',
        createdBy: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
        },
        updatedBy: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
        },
        createdAt: new Date('2019-03-01T09:24:14.642Z'),
        updatedAt: new Date('2019-03-01T09:24:14.642Z'),
      },
    ];

    requestBody = {
      existingViolations: [
        {
          caseViolationId: 1,
          status: XerceViolationStatus.OPEN,
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
          configViolationId: 1,
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

    responseBody = {
      id: 8,
      caseSummary: {
        caseNumber: 'CE-19-1',
        status: 'OPEN',
        abatementStage: AbatementStage.VERIFICATION_PENDING,
        caseAge: 0,
        createdBy: {
          id: 1,
          firstName: 'john',
          lastName: 'Doe',
        },
        caseAssignee: {
          id: 1,
          firstName: 'john',
          lastName: 'Doe',
        },
        hoursLogged: 2.0,
        closedBy: null,
        createdAt: new Date('2019-03-05T16:23:14.912Z'),
        updatedAt: new Date('2019-03-05T16:23:14.912Z'),
        closedAt: null,
      },
      location: {
        id: 38,
        streetAddress: '1709 Webster Street',
        city: 'Oakland',
        state: 'CA',
        zip: '94612',
        parcelId: null,
        manualFields: {
          Lot: 0,
          Ward: 'Ward II',
          Block: 0,
        },
        parcelFields: {},
        latitude: 37.805986463750315,
        longitude: -122.26753234863283,
        flagHistory: [],
        isCDBGApproved: false,
        apn: '1234321',
        assessorAddress: 'Assessor street',
        isMapPinDropped: true,
        parcel: {
          id: null,
          apn: null,
          siteAddress: null,
          siteCity: null,
          siteState: null,
          siteZip: null,
          ownerName: null,
          ownerAddress: null,
          ownerCity: null,
          ownerState: null,
          ownerZip: null,
          isOwnerBusiness: null,
          customFields: null,
          cdbgCensusTract: null,
          cdbgBlockGroup: null,
          cdbgLowModPercent: null,
          isCDBGEligible: false,
          mapboxAddress: '1709 Webster Street',
          mapboxCity: 'Oakland',
          mapboxState: 'CA',
          mapboxZip: 94612,
          mapboxFullAddress: '1709 Webster Street, Oakland, CA 94612',
          flagHistory: [],
        },
        associatedCases: {
          openCases: 2,
          closedCases: 3,
        },
      },
      caseViolations: [
        {
          id: 1,
          configDispositionId: 7,
          status: XerceViolationStatus.OPEN,
          complyByDate: null,
          configViolation: {
            id: 1,
            label: 'Animal Control',
            complyByDays: 5,
            configMunicipalCode: {
              id: 1,
              articleNumber: '6.30.010',
              description: 'Restraint of dogs.',
              resolutionAction: 'Test resolution',
            },
            configViolationType: {
              id: 1,
              label: 'Animal',
              iconURL:
                'https://cyberdyne-dev.s3.amazonaws.com/agency_0/system_icon/animal.png',
            },
          },
          entity: {
            'Animal Colour': 'Red',
            'License Number': '2345',
            Age: 1,
            Breed: 'breedA',
            Note: 'This animal is a pet cat',
          },
          createdAt: new Date('2019-03-05T16:23:15.143Z'),
          updatedAt: new Date('2019-03-05T17:56:07.678Z'),
          closedAt: null,
          createdBy: {
            id: 1,
            firstName: 'john',
            lastName: 'Doe',
          },
          updatedBy: {
            id: 1,
            firstName: 'john',
            lastName: 'Doe',
          },
          closedBy: null,
        },
      ],
      customCaseFieldValues: null,
      issueDescription: null,
      attachments: null,
      caseContacts: [
        {
          id: 1,
          caseContactId: 1,
          name: 'john Doe',
          contactType: ContactType.INDIVIDUAL,
          isVendor: true,
          isGisPopulated: false,
          email: 'john@doe.com',
          cellPhone: '+9198765456',
          workPhone: '+9198765456',
          streetAddress: '545,Alabama',
          city: 'Alabama',
          state: 'AL',
          zip: '94016',
          note: null,
          contactCustomFieldValues: null,
          isBillable: false,
          caseContactRole: {
            id: 1,
            label: 'Owner',
          },
        },
      ],
      inspections: [
        {
          id: 1,
          name: 'Verification Inspection',
          dueDate: new Date('2019-03-13T07:00:00.000Z'),
          assignee: {
            id: 1,
            firstName: 'john',
            lastName: 'Doe',
          },
          closedBy: null,
          closedAt: null,
          note: null,
          notice,
          isNoNoticeChosen: false,
          updatedBy: {
            id: 4,
            firstName: 'John',
            lastName: 'Doe',
          },
          updatedAt: new Date('2019-02-16T06:28:32.814Z'),
          createdAt: new Date('2019-02-16T06:28:32.814Z'),
          createdBy: {
            id: 4,
            firstName: 'John',
            lastName: 'Doe',
          },
        },
      ],
      caseNotices: null,
      caseNotes: [],
      caseStatusActivity: [],
      forcedAbatement: null,
      recommendFAMetadata: {
        isEligible: false,
        notice: null,
      },
    };

    currentInspection = {
      id: 1,
      agencyId: 1,
      caseId: 8,
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
      closedBy: null,
      createdAt: '2019-03-05T16:23:15.191Z',
      updatedAt: '2019-03-05T17:56:07.671Z',
      closedAt: null,
    };

    xerceCaseViolations = [
      {
        id: 1,
        agencyId: 1,
        xerceCaseId: 8,
        configViolationTypeId: 1,
        configDispositionId: 7,
        configViolationId: 1,
        status: 'OPEN',
        entity: {
          'Animal Colour': 'Red',
          'License Number': '2345',
          Age: 1,
          Breed: 'breedA',
          Note: 'This animal is a pet cat',
        },
        originatedFrom: 'CREATE_CASE',
        complyByDate: null,
        createdBy: 1,
        updatedBy: 1,
        closedBy: null,
        closedAt: null,
        createdAt: '2019-03-05T16:23:15.143Z',
        updatedAt: '2019-03-05T17:56:07.678Z',
        deletedAt: null,
      },
    ];

    transaction = sinon.stub();
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 with case details', async () => {
    sandbox
      .stub(XerceCaseInspectionService.prototype, 'getInstance')
      .withArgs(agencyId, xerceCaseId, inspectionId)
      .resolves(currentInspection);

    sandbox
      .stub(XerceCaseAbatementService.prototype, 'validateRequest')
      .withArgs(agencyId, requestBody, currentInspection);

    sandbox.stub(DBUtil, 'createTransaction').returns(transaction);

    sandbox
      .stub(XerceCaseInspectionViolationService.prototype, 'upsertAndDelete')
      .resolves(xerceCaseViolations);

    sandbox
      .stub(XerceCaseAttachmentService.prototype, 'create')
      .withArgs(
        agencyId,
        xerceCaseId,
        userProfile.id,
        requestBody.attachments,
        transaction
      )
      .resolves(caseAttachments);

    sandbox
      .stub(XerceCaseInspectionAttachmentService.prototype, 'create')
      .withArgs(agencyId, xerceCaseId, 11, caseAttachments, transaction);

    sandbox
      .stub(XerceCaseNoteService.prototype, 'create')
      .withArgs(
        agencyId,
        xerceCaseId,
        requestBody.noteContent,
        userProfile.id,
        false,
        transaction
      )
      .resolves(note);

    sandbox
      .stub(XerceCaseAbatementService.prototype, 'getClosedAbatementStage')
      .withArgs(agencyId, xerceCaseViolations)
      .resolves(abatementStage);

    sandbox
      .stub(XerceCaseAbatementService.prototype, 'getOpenAbatementStage')
      .withArgs(agencyId, xerceCaseId)
      .resolves(abatementStage);

    sandbox
      .stub(XerceCaseAbatementService.prototype, 'setAbatementStage')
      .withArgs(agencyId, xerceCaseId, abatementStage, transaction);

    sandbox
      .stub(XerceCaseContact.prototype, 'getAll')
      .withArgs(agencyId, xerceCaseId)
      .returns(xerceCaseContact);

    sandbox
      .stub(XerceCaseInspectionService.prototype, 'create')
      .withArgs(
        agencyId,
        xerceCaseId,
        userProfile.id,
        requestBody.scheduledInspection,
        false,
        transaction
      );

    sandbox
      .stub(XerceCaseNoticeService.prototype, 'create')
      .withArgs(
        agencyId,
        xerceCaseId,
        userProfile.id,
        requestBody.notice,
        transaction
      )
      .resolves(notice);

    sandbox.stub(XerceCaseListingService.prototype, 'refreshCaseListing');

    sandbox
      .stub(XerceCaseInspectionService.prototype, 'closeCurrentInspection')
      .withArgs(currentInspection, userProfile.id, transaction);

    sandbox
      .stub(XerceCaseService.prototype, 'closeCase')
      .withArgs(
        agencyId,
        xerceCaseId,
        userProfile,
        abatementStage,
        transaction
      );

    sandbox
      .stub(XerceCaseInspectionService.prototype, 'getAll')
      .withArgs(agencyId, xerceCaseId, transaction)
      .resolves(inspections);

    sandbox
      .stub(XerceCaseHistoryService.prototype, 'createPerformInspectionHistory')
      .withArgs(
        agencyId,
        xerceCaseId,
        userProfile.id,
        xerceCaseViolations,
        inspections,
        notice,
        requestBody,
        transaction
      );

    sandbox.stub(DBUtil, 'commitTransaction').withArgs(transaction);

    sandbox
      .stub(XerceCaseService.prototype, 'get')
      .withArgs(agencyId, xerceCaseId, userProfile.agencyTimezone)
      .resolves(responseBody);

    const result = await xerceCaseAbatementService.performInspection(
      agencyId,
      xerceCaseId,
      inspectionId,
      userProfile,
      requestBody
    );

    expect(result).to.deep.equal(responseBody, 'response did not match');
  });

  it('Should return status code 200 with case details when no notice issued', async () => {
    requestBody = {
      existingViolations: [
        {
          caseViolationId: 1,
          status: XerceViolationStatus.OPEN,
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
          configViolationId: 1,
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
      caseAssigneeId: null,
    };

    sandbox
      .stub(XerceCaseInspectionService.prototype, 'getInstance')
      .withArgs(agencyId, xerceCaseId, inspectionId)
      .resolves(currentInspection);

    sandbox
      .stub(XerceCaseAbatementService.prototype, 'validateRequest')
      .withArgs(agencyId, requestBody, currentInspection);

    sandbox.stub(DBUtil, 'createTransaction').returns(transaction);

    sandbox
      .stub(XerceCaseInspectionViolationService.prototype, 'upsertAndDelete')
      .resolves(xerceCaseViolations);

    sandbox
      .stub(XerceCaseAttachmentService.prototype, 'create')
      .withArgs(
        agencyId,
        xerceCaseId,
        userProfile.id,
        requestBody.attachments,
        transaction
      )
      .resolves(caseAttachments);

    sandbox
      .stub(XerceCaseInspectionAttachmentService.prototype, 'create')
      .withArgs(agencyId, xerceCaseId, 11, caseAttachments, transaction);

    sandbox
      .stub(XerceCaseNoteService.prototype, 'create')
      .withArgs(
        agencyId,
        xerceCaseId,
        requestBody.noteContent,
        userProfile.id,
        false,
        transaction
      )
      .resolves(note);

    sandbox
      .stub(XerceCaseAbatementService.prototype, 'getClosedAbatementStage')
      .withArgs(agencyId, xerceCaseViolations)
      .resolves(abatementStage);

    sandbox
      .stub(XerceCaseAbatementService.prototype, 'getOpenAbatementStage')
      .withArgs(agencyId, xerceCaseId)
      .resolves(abatementStage);

    sandbox
      .stub(XerceCaseAbatementService.prototype, 'setAbatementStage')
      .withArgs(agencyId, xerceCaseId, abatementStage, transaction);

    sandbox
      .stub(XerceCaseContact.prototype, 'getAll')
      .withArgs(agencyId, xerceCaseId)
      .returns(xerceCaseContact);

    sandbox
      .stub(XerceCaseInspectionService.prototype, 'create')
      .withArgs(
        agencyId,
        xerceCaseId,
        userProfile.id,
        requestBody.scheduledInspection,
        false,
        transaction
      );

    sandbox
      .stub(XerceCaseNoticeService.prototype, 'create')
      .withArgs(
        agencyId,
        xerceCaseId,
        userProfile.id,
        requestBody.notice,
        transaction
      )
      .resolves(notice);

    sandbox.stub(XerceCaseListingService.prototype, 'refreshCaseListing');

    sandbox
      .stub(XerceCaseInspectionService.prototype, 'closeCurrentInspection')
      .withArgs(currentInspection, userProfile.id, transaction);

    sandbox
      .stub(XerceCaseService.prototype, 'closeCase')
      .withArgs(
        agencyId,
        xerceCaseId,
        userProfile,
        abatementStage,
        transaction
      );

    sandbox
      .stub(XerceCaseInspectionService.prototype, 'getAll')
      .withArgs(agencyId, xerceCaseId, transaction)
      .resolves(inspections);

    sandbox
      .stub(XerceCaseHistoryService.prototype, 'createPerformInspectionHistory')
      .withArgs(
        agencyId,
        xerceCaseId,
        userProfile.id,
        xerceCaseViolations,
        inspections,
        notice,
        requestBody,
        transaction
      );

    sandbox.stub(DBUtil, 'commitTransaction').withArgs(transaction);

    sandbox
      .stub(XerceCaseService.prototype, 'get')
      .withArgs(agencyId, xerceCaseId, userProfile.agencyTimezone)
      .resolves(responseBody);

    const result = await xerceCaseAbatementService.performInspection(
      agencyId,
      xerceCaseId,
      inspectionId,
      userProfile,
      requestBody
    );

    expect(result).to.deep.equal(responseBody, 'response did not match');
  });

  it('Should return status code 200 with case details and close case', async () => {
    xerceCaseViolations = [
      {
        id: 1,
        agencyId: 1,
        xerceCaseId: 8,
        configViolationTypeId: 1,
        configDispositionId: 7,
        configViolationId: 1,
        status: 'CLOSED_INVALID',
        entity: {
          'Animal Colour': 'Red',
          'License Number': '2345',
          Age: 1,
          Breed: 'breedA',
          Note: 'This animal is a pet cat',
        },
        originatedFrom: 'CREATE_CASE',
        complyByDate: null,
        createdBy: 1,
        updatedBy: 1,
        closedBy: null,
        closedAt: null,
        createdAt: '2019-03-05T16:23:15.143Z',
        updatedAt: '2019-03-05T17:56:07.678Z',
        deletedAt: null,
      },
    ];

    const existingViolations: IExistingCaseViolationRequest[] = [
      {
        caseViolationId: 1,
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
    ];

    requestBody = { ...requestBody, existingViolations };

    delete requestBody.notice;
    delete requestBody.scheduledInspection;

    sandbox
      .stub(XerceCaseInspectionService.prototype, 'getInstance')
      .withArgs(agencyId, xerceCaseId, inspectionId)
      .resolves(currentInspection);

    sandbox
      .stub(XerceCaseAbatementService.prototype, 'validateRequest')
      .withArgs(agencyId, requestBody, currentInspection);

    sandbox.stub(DBUtil, 'createTransaction').returns(transaction);

    sandbox
      .stub(XerceCaseInspectionViolationService.prototype, 'upsertAndDelete')
      .resolves(xerceCaseViolations);

    sandbox
      .stub(XerceCaseAttachmentService.prototype, 'create')
      .withArgs(
        agencyId,
        xerceCaseId,
        userProfile.id,
        requestBody.attachments,
        transaction
      )
      .resolves(caseAttachments);

    sandbox
      .stub(XerceCaseInspectionAttachmentService.prototype, 'create')
      .withArgs(agencyId, xerceCaseId, 11, caseAttachments, transaction);

    sandbox
      .stub(XerceCaseNoteService.prototype, 'create')
      .withArgs(
        agencyId,
        xerceCaseId,
        requestBody.noteContent,
        userProfile.id,
        false,
        transaction
      )
      .resolves(note);

    sandbox
      .stub(XerceCaseAbatementService.prototype, 'getClosedAbatementStage')
      .withArgs(agencyId, xerceCaseViolations)
      .resolves(abatementStage);

    sandbox
      .stub(XerceCaseAbatementService.prototype, 'getOpenAbatementStage')
      .withArgs(agencyId, xerceCaseId)
      .resolves(abatementStage);

    sandbox
      .stub(XerceCaseAbatementService.prototype, 'setAbatementStage')
      .withArgs(agencyId, xerceCaseId, abatementStage, transaction);

    sandbox
      .stub(XerceCaseInspectionService.prototype, 'closeCurrentInspection')
      .withArgs(currentInspection, userProfile.id, transaction);

    sandbox
      .stub(XerceCaseService.prototype, 'closeCase')
      .withArgs(
        agencyId,
        xerceCaseId,
        userProfile,
        abatementStage,
        transaction
      );

    sandbox
      .stub(XerceCaseHistoryService.prototype, 'createCaseSummaryHistory')
      .withArgs(
        CaseHistoryActions.CASE_CLOSED,
        agencyId,
        userProfile.id,
        xerceCaseId,
        transaction
      );

    sandbox
      .stub(XerceCaseInspectionService.prototype, 'getAll')
      .withArgs(agencyId, xerceCaseId, transaction)
      .resolves(inspections);

    sandbox
      .stub(XerceCaseHistoryService.prototype, 'createPerformInspectionHistory')
      .withArgs(
        agencyId,
        xerceCaseId,
        userProfile.id,
        xerceCaseViolations,
        inspections,
        notice,
        requestBody,
        transaction
      );

    sandbox.stub(DBUtil, 'commitTransaction').withArgs(transaction);

    sandbox.stub(XerceCaseListingService.prototype, 'refreshCaseListing');

    sandbox
      .stub(XerceCaseService.prototype, 'get')
      .withArgs(agencyId, xerceCaseId, userProfile.agencyTimezone)
      .resolves(responseBody);

    const result = await xerceCaseAbatementService.performInspection(
      agencyId,
      xerceCaseId,
      inspectionId,
      userProfile,
      requestBody
    );

    expect(result).to.deep.equal(responseBody, 'response did not match');
  });

  it('Should return status code 200 with case details and reassign case', async () => {
    requestBody.caseAssigneeId = 3;
    responseBody.caseSummary.caseAssignee = {
      id: 3,
      firstName: 'Jane',
      lastName: 'Doe',
    };

    const editCaseAssigneeReq: ICaseAssigneeEditRequest = {
      assigneeId: requestBody.caseAssigneeId,
    };

    sandbox
      .stub(XerceCaseInspectionService.prototype, 'getInstance')
      .withArgs(agencyId, xerceCaseId, inspectionId)
      .resolves(currentInspection);

    sandbox
      .stub(XerceCaseAbatementService.prototype, 'validateRequest')
      .withArgs(agencyId, requestBody, currentInspection);

    sandbox.stub(DBUtil, 'createTransaction').returns(transaction);

    sandbox.stub(XerceCaseListingService.prototype, 'refreshCaseListing');

    sandbox
      .stub(XerceCaseInspectionViolationService.prototype, 'upsertAndDelete')
      .resolves(xerceCaseViolations);

    sandbox
      .stub(XerceCaseAttachmentService.prototype, 'create')
      .withArgs(
        agencyId,
        xerceCaseId,
        userProfile.id,
        requestBody.attachments,
        transaction
      )
      .resolves(caseAttachments);

    sandbox
      .stub(XerceCaseAbatementService.prototype, 'getClosedAbatementStage')
      .withArgs(agencyId, xerceCaseViolations)
      .resolves(abatementStage);

    sandbox
      .stub(XerceCaseAbatementService.prototype, 'getOpenAbatementStage')
      .withArgs(agencyId, xerceCaseId)
      .resolves(abatementStage);

    sandbox
      .stub(XerceCaseAbatementService.prototype, 'setAbatementStage')
      .withArgs(agencyId, xerceCaseId, abatementStage, transaction);

    sandbox
      .stub(XerceCaseContact.prototype, 'getAll')
      .withArgs(agencyId, xerceCaseId)
      .returns(xerceCaseContact);

    sandbox
      .stub(XerceCaseInspectionAttachmentService.prototype, 'create')
      .withArgs(agencyId, xerceCaseId, 11, caseAttachments, transaction);

    sandbox
      .stub(XerceCaseNoteService.prototype, 'create')
      .withArgs(
        agencyId,
        xerceCaseId,
        requestBody.noteContent,
        userProfile.id,
        false,
        transaction
      )
      .resolves(note);

    sandbox
      .stub(XerceCaseInspectionService.prototype, 'create')
      .withArgs(
        agencyId,
        xerceCaseId,
        userProfile.id,
        requestBody.scheduledInspection,
        false,
        transaction
      );

    sandbox
      .stub(XerceCaseNoticeService.prototype, 'create')
      .withArgs(
        agencyId,
        xerceCaseId,
        userProfile.id,
        requestBody.notice,
        transaction
      )
      .resolves(notice);

    sandbox
      .stub(XerceCaseInspectionService.prototype, 'closeCurrentInspection')
      .withArgs(currentInspection, userProfile.id, transaction);

    sandbox
      .stub(XerceCaseAssigneeService.prototype, 'editCaseAssignee')
      .withArgs(agencyId, xerceCaseId, editCaseAssigneeReq, transaction);

    sandbox
      .stub(XerceCaseService.prototype, 'closeCase')
      .withArgs(agencyId, xerceCaseId, userProfile, transaction);

    sandbox.stub(DBUtil, 'commitTransaction').withArgs(transaction);

    sandbox
      .stub(XerceCaseInspectionService.prototype, 'getAll')
      .withArgs(agencyId, xerceCaseId, transaction)
      .resolves(inspections);

    sandbox
      .stub(XerceCaseHistoryService.prototype, 'createPerformInspectionHistory')
      .withArgs(
        agencyId,
        xerceCaseId,
        userProfile.id,
        xerceCaseViolations,
        inspections,
        notice,
        requestBody,
        transaction
      );

    sandbox
      .stub(XerceCaseService.prototype, 'get')
      .withArgs(agencyId, xerceCaseId, userProfile.agencyTimezone)
      .resolves(responseBody);

    const result = await xerceCaseAbatementService.performInspection(
      agencyId,
      xerceCaseId,
      inspectionId,
      userProfile,
      requestBody
    );

    expect(result).to.deep.equal(responseBody, 'response did not match');
  });

  it('Should throw error when reassigning new case assignee', async () => {
    requestBody.caseAssigneeId = 3;
    responseBody.caseSummary.caseAssignee = {
      id: 3,
      firstName: 'Jane',
      lastName: 'Doe',
    };

    const editCaseAssigneeReq: ICaseAssigneeEditRequest = {
      assigneeId: requestBody.caseAssigneeId,
    };

    sandbox
      .stub(XerceCaseInspectionService.prototype, 'getInstance')
      .withArgs(agencyId, xerceCaseId, inspectionId)
      .resolves(currentInspection);

    sandbox
      .stub(XerceCaseAbatementService.prototype, 'validateRequest')
      .withArgs(agencyId, requestBody, currentInspection);

    sandbox.stub(DBUtil, 'createTransaction').returns(transaction);

    sandbox.stub(XerceCaseListingService.prototype, 'refreshCaseListing');

    sandbox
      .stub(XerceCaseInspectionViolationService.prototype, 'upsertAndDelete')
      .resolves(xerceCaseViolations);

    sandbox
      .stub(XerceCaseAttachmentService.prototype, 'create')
      .withArgs(
        agencyId,
        xerceCaseId,
        userProfile.id,
        requestBody.attachments,
        transaction
      )
      .resolves(caseAttachments);

    sandbox
      .stub(XerceCaseInspectionAttachmentService.prototype, 'create')
      .withArgs(agencyId, xerceCaseId, 11, caseAttachments, transaction);

    sandbox
      .stub(XerceCaseNoteService.prototype, 'create')
      .withArgs(
        agencyId,
        xerceCaseId,
        requestBody.noteContent,
        userProfile.id,
        false,
        transaction
      )
      .resolves(note);

    sandbox
      .stub(XerceCaseAbatementService.prototype, 'getClosedAbatementStage')
      .withArgs(agencyId, xerceCaseViolations)
      .resolves(abatementStage);

    sandbox
      .stub(XerceCaseAbatementService.prototype, 'getOpenAbatementStage')
      .withArgs(agencyId, xerceCaseId)
      .resolves(abatementStage);

    sandbox
      .stub(XerceCaseAbatementService.prototype, 'setAbatementStage')
      .withArgs(agencyId, xerceCaseId, abatementStage, transaction);

    sandbox
      .stub(XerceCaseInspectionService.prototype, 'create')
      .withArgs(
        agencyId,
        xerceCaseId,
        userProfile.id,
        requestBody.scheduledInspection,
        false,
        transaction
      );

    sandbox
      .stub(XerceCaseNoticeService.prototype, 'create')
      .withArgs(
        agencyId,
        xerceCaseId,
        userProfile.id,
        requestBody.notice,
        transaction
      )
      .resolves(notice);

    sandbox
      .stub(XerceCaseInspectionService.prototype, 'closeCurrentInspection')
      .withArgs(currentInspection, userProfile.id, transaction);

    sandbox
      .stub(XerceCaseAssigneeService.prototype, 'editCaseAssignee')
      .withArgs(agencyId, xerceCaseId, editCaseAssigneeReq, transaction)
      .throws({ name: 'InvalidRequestError' });

    sandbox
      .stub(XerceCaseService.prototype, 'closeCase')
      .withArgs(
        agencyId,
        xerceCaseId,
        userProfile,
        abatementStage,
        transaction
      );

    sandbox.stub(DBUtil, 'rollbackTransaction').withArgs(transaction);

    sandbox
      .stub(XerceCaseInspectionService.prototype, 'getAll')
      .withArgs(agencyId, xerceCaseId, transaction)
      .resolves(inspections);

    sandbox
      .stub(XerceCaseHistoryService.prototype, 'createPerformInspectionHistory')
      .withArgs(
        agencyId,
        xerceCaseId,
        userProfile.id,
        xerceCaseViolations,
        inspections,
        notice,
        requestBody,
        transaction
      );

    sandbox
      .stub(XerceCaseService.prototype, 'get')
      .withArgs(agencyId, xerceCaseId, userProfile.agencyTimezone)
      .resolves(responseBody);

    await xerceCaseAbatementService
      .performInspection(
        agencyId,
        xerceCaseId,
        inspectionId,
        userProfile,
        requestBody
      )
      .catch(err => {
        expect(err.name).to.equal('InvalidRequestError');
      });
  });

  it('should throw error for not scheduling inspection when violations are open', async () => {
    delete requestBody.scheduledInspection;

    sandbox
      .stub(XerceCaseInspectionService.prototype, 'getInstance')
      .withArgs(agencyId, xerceCaseId, inspectionId)
      .resolves(currentInspection);

    sandbox
      .stub(XerceCaseAbatementService.prototype, 'validateRequest')
      .withArgs(agencyId, requestBody, currentInspection);

    sandbox.stub(DBUtil, 'createTransaction').returns(transaction);

    sandbox.stub(XerceCaseListingService.prototype, 'refreshCaseListing');

    sandbox
      .stub(XerceCaseInspectionViolationService.prototype, 'upsertAndDelete')
      .resolves(xerceCaseViolations);

    sandbox
      .stub(XerceCaseAttachmentService.prototype, 'create')
      .withArgs(
        agencyId,
        xerceCaseId,
        userProfile.id,
        requestBody.attachments,
        transaction
      )
      .resolves(caseAttachments);

    sandbox
      .stub(XerceCaseInspectionAttachmentService.prototype, 'create')
      .withArgs(agencyId, xerceCaseId, 11, caseAttachments, transaction);

    sandbox
      .stub(XerceCaseNoteService.prototype, 'create')
      .withArgs(
        agencyId,
        xerceCaseId,
        requestBody.noteContent,
        userProfile.id,
        false,
        transaction
      )
      .resolves(note);

    sandbox
      .stub(XerceCaseAbatementService.prototype, 'getClosedAbatementStage')
      .withArgs(agencyId, xerceCaseViolations)
      .resolves(abatementStage);

    sandbox
      .stub(XerceCaseAbatementService.prototype, 'getOpenAbatementStage')
      .withArgs(agencyId, xerceCaseId)
      .resolves(abatementStage);

    sandbox
      .stub(XerceCaseAbatementService.prototype, 'setAbatementStage')
      .withArgs(agencyId, xerceCaseId, abatementStage, transaction);

    sandbox.stub(DBUtil, 'commitTransaction').withArgs(transaction);

    sandbox.stub(DBUtil, 'rollbackTransaction').withArgs(transaction);

    sandbox
      .stub(XerceCaseInspectionService.prototype, 'getAll')
      .withArgs(agencyId, xerceCaseId, transaction)
      .resolves(inspections);

    sandbox
      .stub(XerceCaseHistoryService.prototype, 'createPerformInspectionHistory')
      .withArgs(
        agencyId,
        xerceCaseId,
        userProfile.id,
        xerceCaseViolations,
        inspections,
        notice,
        requestBody,
        transaction
      );

    const errorMsg = `Invalid Request. Some Violations are open. You need to schedule next inspection`;

    await xerceCaseAbatementService
      .performInspection(
        agencyId,
        xerceCaseId,
        inspectionId,
        userProfile,
        requestBody
      )
      .catch(err => {
        expect(err.name).to.equal('InvalidRequestError');
        expect(err.message).to.equal(errorMsg);
      });
  });

  it('should throw error for scheduling inspection when violations are closed', async () => {
    const existingViolations: IExistingCaseViolationRequest[] = [
      {
        caseViolationId: 1,
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
    ];

    xerceCaseViolations = [
      {
        id: 1,
        agencyId: 1,
        xerceCaseId: 8,
        configViolationTypeId: 1,
        configDispositionId: 7,
        configViolationId: 1,
        status: 'CLOSED_INVALID',
        entity: {
          'Animal Colour': 'Red',
          'License Number': '2345',
          Age: 1,
          Breed: 'breedA',
          Note: 'This animal is a pet cat',
        },
        originatedFrom: 'CREATE_CASE',
        complyByDate: null,
        createdBy: 1,
        updatedBy: 1,
        closedBy: null,
        closedAt: null,
        createdAt: '2019-03-05T16:23:15.143Z',
        updatedAt: '2019-03-05T17:56:07.678Z',
        deletedAt: null,
      },
    ];

    requestBody = { ...requestBody, existingViolations };

    sandbox
      .stub(XerceCaseInspectionService.prototype, 'getInstance')
      .withArgs(agencyId, xerceCaseId, inspectionId)
      .resolves(currentInspection);

    sandbox
      .stub(XerceCaseAbatementService.prototype, 'validateRequest')
      .withArgs(agencyId, requestBody, currentInspection);

    sandbox.stub(DBUtil, 'createTransaction').returns(transaction);

    sandbox.stub(XerceCaseListingService.prototype, 'refreshCaseListing');

    sandbox
      .stub(XerceCaseInspectionViolationService.prototype, 'upsertAndDelete')
      .resolves(xerceCaseViolations);

    sandbox
      .stub(XerceCaseAttachmentService.prototype, 'create')
      .withArgs(
        agencyId,
        xerceCaseId,
        userProfile.id,
        requestBody.attachments,
        transaction
      )
      .resolves(caseAttachments);

    sandbox
      .stub(XerceCaseInspectionAttachmentService.prototype, 'create')
      .withArgs(agencyId, xerceCaseId, 11, caseAttachments, transaction);

    sandbox
      .stub(XerceCaseNoteService.prototype, 'create')
      .withArgs(
        agencyId,
        xerceCaseId,
        requestBody.noteContent,
        userProfile.id,
        false,
        transaction
      )
      .resolves(note);

    sandbox
      .stub(XerceCaseInspectionService.prototype, 'closeCurrentInspection')
      .withArgs(currentInspection, userProfile.id, transaction);

    sandbox
      .stub(XerceCaseAbatementService.prototype, 'getClosedAbatementStage')
      .withArgs(agencyId, xerceCaseViolations)
      .resolves(abatementStage);

    sandbox
      .stub(XerceCaseAbatementService.prototype, 'getOpenAbatementStage')
      .withArgs(agencyId, xerceCaseId)
      .resolves(abatementStage);

    sandbox
      .stub(XerceCaseAbatementService.prototype, 'setAbatementStage')
      .withArgs(agencyId, xerceCaseId, abatementStage, transaction);

    sandbox.stub(DBUtil, 'commitTransaction').withArgs(transaction);

    sandbox.stub(DBUtil, 'rollbackTransaction').withArgs(transaction);

    sandbox
      .stub(XerceCaseInspectionService.prototype, 'getAll')
      .withArgs(agencyId, xerceCaseId, transaction)
      .resolves(inspections);

    sandbox
      .stub(XerceCaseHistoryService.prototype, 'createPerformInspectionHistory')
      .withArgs(
        agencyId,
        xerceCaseId,
        userProfile.id,
        xerceCaseViolations,
        inspections,
        notice,
        requestBody,
        transaction
      );

    const errorMsg = `Invalid Request. All Violations are closed. Can not schedule next inspection or issue notice`;

    await xerceCaseAbatementService
      .performInspection(
        agencyId,
        xerceCaseId,
        inspectionId,
        userProfile,
        requestBody
      )
      .catch(err => {
        expect(err.name).to.equal('InvalidRequestError');
        expect(err.message).to.equal(errorMsg);
      });
  });

  it('should throw error when no contacts are added to case', async () => {
    sandbox
      .stub(XerceCaseInspectionService.prototype, 'getInstance')
      .withArgs(agencyId, xerceCaseId, inspectionId)
      .resolves(currentInspection);

    sandbox
      .stub(XerceCaseAbatementService.prototype, 'validateRequest')
      .withArgs(agencyId, requestBody, currentInspection);

    sandbox.stub(DBUtil, 'createTransaction').returns(transaction);

    sandbox
      .stub(XerceCaseInspectionViolationService.prototype, 'upsertAndDelete')
      .resolves(xerceCaseViolations);

    sandbox
      .stub(XerceCaseAttachmentService.prototype, 'create')
      .withArgs(
        agencyId,
        xerceCaseId,
        userProfile.id,
        requestBody.attachments,
        transaction
      )
      .resolves(caseAttachments);

    sandbox
      .stub(XerceCaseInspectionAttachmentService.prototype, 'create')
      .withArgs(agencyId, xerceCaseId, 11, caseAttachments, transaction);

    sandbox
      .stub(XerceCaseNoteService.prototype, 'create')
      .withArgs(
        agencyId,
        xerceCaseId,
        requestBody.noteContent,
        userProfile.id,
        false,
        transaction
      )
      .resolves(note);

    sandbox
      .stub(XerceCaseInspectionService.prototype, 'closeCurrentInspection')
      .withArgs(currentInspection, userProfile.id, transaction);

    sandbox
      .stub(XerceCaseAbatementService.prototype, 'getClosedAbatementStage')
      .withArgs(agencyId, xerceCaseViolations)
      .resolves(abatementStage);

    sandbox
      .stub(XerceCaseAbatementService.prototype, 'getOpenAbatementStage')
      .withArgs(agencyId, xerceCaseId)
      .resolves(abatementStage);

    sandbox
      .stub(XerceCaseAbatementService.prototype, 'setAbatementStage')
      .withArgs(agencyId, xerceCaseId, abatementStage, transaction);

    sandbox
      .stub(XerceCaseContact.prototype, 'getAll')
      .withArgs(agencyId, xerceCaseId)
      .returns([]);

    sandbox.stub(DBUtil, 'commitTransaction').withArgs(transaction);

    sandbox.stub(XerceCaseListingService.prototype, 'refreshCaseListing');

    sandbox.stub(DBUtil, 'rollbackTransaction').withArgs(transaction);

    sandbox
      .stub(XerceCaseInspectionService.prototype, 'getAll')
      .withArgs(agencyId, xerceCaseId, transaction)
      .resolves(inspections);

    sandbox
      .stub(XerceCaseHistoryService.prototype, 'createPerformInspectionHistory')
      .withArgs(
        agencyId,
        xerceCaseId,
        userProfile.id,
        xerceCaseViolations,
        inspections,
        notice,
        requestBody,
        transaction
      );

    const errorMsg = `Invalid Request. You need to have atleast one contact attached to case to perform inspection.`;

    await xerceCaseAbatementService
      .performInspection(
        agencyId,
        xerceCaseId,
        inspectionId,
        userProfile,
        requestBody
      )
      .catch(err => {
        expect(err.name).to.equal('InvalidRequestError');
        expect(err.message).to.equal(errorMsg);
      });
  });
});

describe('XerceCaseAbatement Service: validateRequest method', () => {
  let sandbox;
  const agencyId = 1;
  let currentInspection;
  let performInspectionReq: IPerformInspectionRequest;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    performInspectionReq = {
      existingViolations: [
        {
          caseViolationId: 1,
          status: XerceViolationStatus.CLOSED_INVALID,
          configDispositionId: 1,
          complyByDate: null,
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
          configViolationId: 1,
          status: XerceViolationStatus.OPEN,
          configDispositionId: 1,
          complyByDate: new Date('2020-03-05T16:23:14.912Z'),
          entity: {
            'Animal Colour': 'Black',
            'License Number': '2345',
            Age: 4,
            Breed: '',
            Note: '',
          },
        },
      ],
      noteContent: null,
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
    };

    currentInspection = {
      id: 1,
      agencyId: 1,
      caseId: 8,
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
    };
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should validate with success', async () => {
    sandbox
      .stub(XerceCaseAbatementService.prototype, 'validateDispositions')
      .withArgs(agencyId, performInspectionReq, currentInspection);

    sandbox
      .stub(XerceCaseAbatementService.prototype, 'validateNotice')
      .withArgs(agencyId, performInspectionReq.notice);

    await (xerceCaseAbatementService as any)
      .validateRequest(agencyId, performInspectionReq, currentInspection)
      .catch(err => expect(err.name).to.equal('Error'));
  });

  it('Should validate with success with no new violations', async () => {
    performInspectionReq = {
      existingViolations: [
        {
          caseViolationId: 1,
          status: XerceViolationStatus.CLOSED_INVALID,
          configDispositionId: 1,
          complyByDate: null,
          entity: {
            'Animal Colour': 'Red',
            'License Number': '2345',
            Age: 1,
            Breed: 'breedA',
            Note: 'This animal is a pet cat',
          },
        },
      ],
      newViolations: [],
      noteContent: null,
    };

    sandbox
      .stub(XerceCaseAbatementService.prototype, 'validateDispositions')
      .withArgs(agencyId, performInspectionReq, currentInspection);

    sandbox
      .stub(XerceCaseAbatementService.prototype, 'validateNotice')
      .withArgs(agencyId, performInspectionReq.notice);

    await (xerceCaseAbatementService as any)
      .validateRequest(agencyId, performInspectionReq, currentInspection)
      .catch(err => expect(err.name).to.equal('Error'));
  });

  it('Should validate with success with new violations', async () => {
    performInspectionReq = {
      existingViolations: [],
      newViolations: [
        {
          configViolationId: 1,
          status: XerceViolationStatus.CLOSED_INVALID,
          configDispositionId: 1,
          complyByDate: null,
          entity: {
            'Animal Colour': 'Black',
            'License Number': '2345',
            Age: 4,
            Breed: '',
            Note: '',
          },
        },
      ],
      noteContent: null,
    };

    sandbox
      .stub(XerceCaseAbatementService.prototype, 'validateDispositions')
      .withArgs(agencyId, performInspectionReq, currentInspection);

    sandbox
      .stub(XerceCaseAbatementService.prototype, 'validateNotice')
      .withArgs(agencyId, performInspectionReq.notice);

    await (xerceCaseAbatementService as any)
      .validateRequest(agencyId, performInspectionReq, currentInspection)
      .catch(err => expect(err.name).to.equal('Error'));
  });

  it('Should throw error for 0 violation count', async () => {
    performInspectionReq = {
      existingViolations: [],
      newViolations: [],
      noteContent: null,
    };

    await (xerceCaseAbatementService as any)
      .validateRequest(agencyId, performInspectionReq, currentInspection)
      .catch(err => expect(err.name).to.equal('InvalidRequestError'));
  });

  it('Should fail with invalid violation status', async () => {
    performInspectionReq = {
      existingViolations: [
        {
          caseViolationId: 1,
          status: XerceViolationStatus.OPEN,
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
          configViolationId: 1,
          status: XerceViolationStatus.CLOSED_MET_COMPLIANCE,
          configDispositionId: 1,
          entity: {
            'Animal Colour': 'Black',
            'License Number': '2345',
            Age: 4,
            Breed: '',
            Note: '',
          },
        },
      ],
      noteContent: null,
    };

    const errorMsg = `Invalid Case Violation Status received for one or more violation`;

    await (xerceCaseAbatementService as any)
      .validateRequest(agencyId, performInspectionReq, currentInspection)
      .catch(err => {
        expect(err.name).to.deep.equal('InvalidRequestError');
        expect(err.message).to.deep.equal(errorMsg);
      });
  });

  it('Should throw error for duplicate violations', async () => {
    performInspectionReq = {
      existingViolations: [
        {
          caseViolationId: 1,
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
        {
          caseViolationId: 1,
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
      noteContent: null,
    };

    await (xerceCaseAbatementService as any)
      .validateRequest(agencyId, performInspectionReq, currentInspection)
      .catch(err => expect(err.name).to.equal('InvalidRequestError'));
  });

  it('Should throw error for performing already completed inspection', async () => {
    currentInspection = {
      id: 1,
      agencyId: 1,
      caseId: 8,
      plannedDate: '2019-03-13T07:00:00.000Z',
      actualDate: null,
      assigneeId: 1,
      noteId: null,
      attachmentIds: [],
      noticeId: null,
      status: 'COMPLETED',
      isVerificationInspection: true,
      createdBy: 1,
      updatedBy: null,
      createdAt: '2019-03-05T16:23:15.191Z',
      updatedAt: '2019-03-05T17:56:07.671Z',
    };

    await (xerceCaseAbatementService as any)
      .validateRequest(agencyId, performInspectionReq, currentInspection)
      .catch(err => expect(err.name).to.equal('InvalidRequestError'));
  });

  it('Should throw error for adding new violation after verification inspection', async () => {
    currentInspection = {
      id: 1,
      agencyId: 1,
      caseId: 8,
      plannedDate: '2019-03-13T07:00:00.000Z',
      actualDate: null,
      assigneeId: 1,
      noteId: null,
      attachmentIds: [],
      noticeId: null,
      status: 'SCHEDULED',
      isVerificationInspection: false,
      createdBy: 1,
      updatedBy: null,
      createdAt: '2019-03-05T16:23:15.191Z',
      updatedAt: '2019-03-05T17:56:07.671Z',
    };

    await (xerceCaseAbatementService as any)
      .validateRequest(agencyId, performInspectionReq, currentInspection)
      .catch(err => expect(err.name).to.equal('InvalidRequestError'));
  });

  it('Should throw error for invalid comply by date', async () => {
    performInspectionReq = {
      existingViolations: [
        {
          caseViolationId: 1,
          status: XerceViolationStatus.CLOSED_INVALID,
          configDispositionId: 1,
          complyByDate: new Date('2020-03-05T16:23:14.912Z'),
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
          configViolationId: 1,
          status: XerceViolationStatus.OPEN,
          configDispositionId: 1,
          complyByDate: null,
          entity: {
            'Animal Colour': 'Black',
            'License Number': '2345',
            Age: 4,
            Breed: '',
            Note: '',
          },
        },
      ],
      noteContent: null,
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
    };

    await (xerceCaseAbatementService as any)
      .validateRequest(agencyId, performInspectionReq, currentInspection)
      .catch(err => expect(err.name).to.equal('InvalidRequestError'));
  });

  it('Should throw error for invalid violation status for follow up inspection', async () => {
    currentInspection = {
      id: 1,
      agencyId: 1,
      caseId: 8,
      plannedDate: '2019-03-13T07:00:00.000Z',
      actualDate: null,
      assigneeId: 1,
      noteId: null,
      attachmentIds: [],
      noticeId: null,
      status: 'SCHEDULED',
      isVerificationInspection: false,
      createdBy: 1,
      updatedBy: null,
      createdAt: '2019-03-05T16:23:15.191Z',
      updatedAt: '2019-03-05T17:56:07.671Z',
    };

    performInspectionReq = {
      existingViolations: [
        {
          caseViolationId: 1,
          status: XerceViolationStatus.CLOSED_INVALID,
          configDispositionId: 1,
          complyByDate: null,
          entity: {
            'Animal Colour': 'Red',
            'License Number': '2345',
            Age: 1,
            Breed: 'breedA',
            Note: 'This animal is a pet cat',
          },
        },
      ],
      newViolations: [],
      noteContent: null,
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
    };

    await (xerceCaseAbatementService as any)
      .validateRequest(agencyId, performInspectionReq, currentInspection)
      .catch(err => expect(err.name).to.equal('InvalidRequestError'));
  });
});

describe('XerceCaseAbatement Service: validateDispositions method', () => {
  let sandbox;
  const agencyId = 1;
  const configDispositionsIds = [1];
  let configDispositions: IConfigDisposition[];
  let performInspectionReq: IPerformInspectionRequest;
  let currentInspection;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    currentInspection = {
      id: 1,
      agencyId: 1,
      caseId: 8,
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
    };

    configDispositions = [
      {
        id: 1,
        label: 'Duplicate',
        dispositionType: DispositionType.INVALID_DISPOSITION,
        compliantDispositionType: null,
        isDefault: true,
        isActive: true,
        sequence: 1,
      },
    ];

    performInspectionReq = {
      existingViolations: [
        {
          caseViolationId: 1,
          status: XerceViolationStatus.CLOSED_INVALID,
          configDispositionId: 1,
          complyByDate: null,
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
          configViolationId: 1,
          status: XerceViolationStatus.OPEN,
          complyByDate: new Date('2020-03-05T16:23:14.912Z'),
          entity: {
            'Animal Colour': 'Black',
            'License Number': '2345',
            Age: 4,
            Breed: '',
            Note: '',
          },
        },
      ],
      noteContent: null,
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('Should pass with success', async () => {
    sandbox
      .stub(ConfigDispositionService.prototype, 'getByIds')
      .withArgs(agencyId, configDispositionsIds)
      .resolves(configDispositions);

    await (xerceCaseAbatementService as any)
      .validateDispositions(agencyId, performInspectionReq, currentInspection)
      .catch(err => {
        expect(err.name).to.deep.equal('InvalidRequestError');
      });
  });

  it('Should fail when no disposition exists', async () => {
    const errorMsg = 'Some or all dispositions are either inactive or invalid';

    configDispositions = [];

    sandbox
      .stub(ConfigDispositionService.prototype, 'getByIds')
      .withArgs(agencyId, configDispositionsIds)
      .resolves(configDispositions);

    await (xerceCaseAbatementService as any)
      .validateDispositions(agencyId, performInspectionReq, currentInspection)
      .catch(err => {
        expect(err.name).to.deep.equal('InvalidRequestError');
        expect(err.message).to.deep.equal(errorMsg);
      });
  });

  it('Should fail with invalid disposition ids', async () => {
    performInspectionReq = {
      existingViolations: [
        {
          caseViolationId: 1,
          status: XerceViolationStatus.OPEN,
          configDispositionId: 1,
          complyByDate: null,
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
          configViolationId: 1,
          status: XerceViolationStatus.CLOSED_INVALID,
          complyByDate: new Date('2020-03-05T16:23:14.912Z'),
          entity: {
            'Animal Colour': 'Black',
            'License Number': '2345',
            Age: 4,
            Breed: '',
            Note: '',
          },
        },
      ],
      noteContent: null,
    };

    const errorMsg = `Invalid Request. Config Disposition Id might present in open violations or not present in closed violations`;

    sandbox
      .stub(ConfigDispositionService.prototype, 'getByIds')
      .withArgs(agencyId, configDispositionsIds)
      .resolves(configDispositions);

    await (xerceCaseAbatementService as any)
      .validateDispositions(agencyId, performInspectionReq, currentInspection)
      .catch(err => {
        expect(err.name).to.deep.equal('InvalidRequestError');
        expect(err.message).to.deep.equal(errorMsg);
      });
  });

  it('Should fail with invalid disposition type - verfication inspection', async () => {
    configDispositions = [
      {
        id: 1,
        label: 'Duplicate',
        dispositionType: DispositionType.COMPLIANT_DISPOSITION,
        compliantDispositionType: null,
        isDefault: true,
        isActive: true,
        sequence: 1,
      },
    ];

    performInspectionReq = {
      existingViolations: [
        {
          caseViolationId: 1,
          status: XerceViolationStatus.CLOSED_INVALID,
          configDispositionId: 1,
          complyByDate: null,
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
          configViolationId: 1,
          status: XerceViolationStatus.OPEN,
          complyByDate: null,
          entity: {
            'Animal Colour': 'Black',
            'License Number': '2345',
            Age: 4,
            Breed: '',
            Note: '',
          },
        },
      ],
      noteContent: null,
    };

    const errorMsg = `Invalid Request. Violation Status and Disposition Type doesn't match`;

    sandbox
      .stub(ConfigDispositionService.prototype, 'getByIds')
      .withArgs(agencyId, configDispositionsIds)
      .resolves(configDispositions);

    await (xerceCaseAbatementService as any)
      .validateDispositions(agencyId, performInspectionReq, currentInspection)
      .catch(err => {
        expect(err.name).to.deep.equal('InvalidRequestError');
        expect(err.message).to.deep.equal(errorMsg);
      });
  });

  it('Should fail with invalid disposition type - follow-up inspection', async () => {
    currentInspection = {
      id: 1,
      agencyId: 1,
      caseId: 8,
      plannedDate: '2019-03-13T07:00:00.000Z',
      actualDate: null,
      assigneeId: 1,
      noteId: null,
      attachmentIds: [],
      noticeId: null,
      status: 'SCHEDULED',
      isVerificationInspection: false,
      createdBy: 1,
      updatedBy: null,
      createdAt: '2019-03-05T16:23:15.191Z',
      updatedAt: '2019-03-05T17:56:07.671Z',
    };

    configDispositions = [
      {
        id: 1,
        label: 'Duplicate',
        dispositionType: DispositionType.INVALID_DISPOSITION,
        compliantDispositionType: null,
        isDefault: true,
        isActive: true,
        sequence: 1,
      },
    ];

    performInspectionReq = {
      existingViolations: [
        {
          caseViolationId: 1,
          status: XerceViolationStatus.CLOSED_INVALID,
          configDispositionId: 1,
          complyByDate: null,
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
          configViolationId: 1,
          status: XerceViolationStatus.OPEN,
          complyByDate: null,
          entity: {
            'Animal Colour': 'Black',
            'License Number': '2345',
            Age: 4,
            Breed: '',
            Note: '',
          },
        },
      ],
      noteContent: null,
    };

    const errorMsg = `Invalid Request. Violation Status and Disposition Type doesn't match`;

    sandbox
      .stub(ConfigDispositionService.prototype, 'getByIds')
      .withArgs(agencyId, configDispositionsIds)
      .resolves(configDispositions);

    await (xerceCaseAbatementService as any)
      .validateDispositions(agencyId, performInspectionReq, currentInspection)
      .catch(err => {
        expect(err.name).to.deep.equal('InvalidRequestError');
        expect(err.message).to.deep.equal(errorMsg);
      });
  });
});

describe('XerceCaseAbatement Service: validateNotice method', () => {
  let sandbox;
  let performInspectionReq: IPerformInspectionRequest;
  const agencyId = 1;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    performInspectionReq = {
      existingViolations: [
        {
          caseViolationId: 1,
          status: XerceViolationStatus.CLOSED_INVALID,
          configDispositionId: 1,
          complyByDate: null,
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
          configViolationId: 1,
          status: XerceViolationStatus.OPEN,
          complyByDate: new Date('2020-03-05T16:23:14.912Z'),
          entity: {
            'Animal Colour': 'Black',
            'License Number': '2345',
            Age: 4,
            Breed: '',
            Note: '',
          },
        },
      ],
      noteContent: null,
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
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should validate notice with success', async () => {
    sandbox.stub(ConfigNoticeService.prototype, 'getNoticesById');

    await (xerceCaseAbatementService as any)
      .validateNotice(agencyId, performInspectionReq.notice)
      .catch(err => expect(err.name).to.deep.equal('Error'));
  });

  it('should throw error because of past date', async () => {
    performInspectionReq = {
      existingViolations: [
        {
          caseViolationId: 1,
          status: XerceViolationStatus.CLOSED_INVALID,
          configDispositionId: 1,
          complyByDate: null,
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
          configViolationId: 1,
          status: XerceViolationStatus.OPEN,
          complyByDate: new Date('2020-03-05T16:23:14.912Z'),
          entity: {
            'Animal Colour': 'Black',
            'License Number': '2345',
            Age: 4,
            Breed: '',
            Note: '',
          },
        },
      ],
      noteContent: null,
      scheduledInspection: {
        plannedDate: new Date('2020-03-05T16:23:14.912Z'),
        assigneeId: 1,
      },
      notice: {
        certifiedMailNumber: '1234567890',
        issuedAt: new Date('2010-03-05T16:23:14.912Z'),
        configNoticeId: 1,
        noticeContent: ['<p>This is a test</p>', '<p>This is also a test</p>'],
      },
    };

    await (xerceCaseAbatementService as any)
      .validateNotice(agencyId, performInspectionReq.notice)
      .catch(err => expect(err.name).to.deep.equal('InvalidRequestError'));
  });
});

describe('XerceCaseAbatement Service: getClosedAbatementStage method', () => {
  let sandbox;
  let xerceCaseViolations;
  let configDispositions: IConfigDisposition[];
  let responseBody;
  const agencyId = 1;
  const configDispositionIds = [1, 2, 3];

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    responseBody = 'Forced';

    configDispositions = [
      {
        id: 1,
        label: 'Duplicate',
        dispositionType: DispositionType.INVALID_DISPOSITION,
        compliantDispositionType: null,
        isDefault: true,
        isActive: true,
        sequence: 1,
      },
      {
        id: 2,
        label: 'Voluntary',
        dispositionType: DispositionType.COMPLIANT_DISPOSITION,
        compliantDispositionType: CompliantDispositionType.VOLUNTARY,
        isDefault: false,
        isActive: true,
        sequence: 2,
      },
      {
        id: 3,
        label: 'Forced',
        dispositionType: DispositionType.COMPLIANT_DISPOSITION,
        compliantDispositionType: CompliantDispositionType.FORCED,
        isDefault: false,
        isActive: true,
        sequence: 3,
      },
    ];

    xerceCaseViolations = [
      {
        id: 1,
        agencyId: 1,
        xerceCaseId: 8,
        configViolationTypeId: 1,
        configDispositionId: 1,
        configViolationId: 1,
        status: 'CLOSED_INVALID',
        entity: {
          'Animal Colour': 'Red',
          'License Number': '2345',
          Age: 1,
          Breed: 'breedA',
          Note: 'This animal is a pet cat',
        },
        originatedFrom: 'CREATE_CASE',
        complyByDate: null,
        createdBy: 1,
        updatedBy: 1,
        closedBy: null,
        closedAt: null,
        createdAt: '2019-03-05T16:23:15.143Z',
        updatedAt: '2019-03-05T17:56:07.678Z',
        deletedAt: null,
      },
      {
        id: 2,
        agencyId: 1,
        xerceCaseId: 8,
        configViolationTypeId: 1,
        configDispositionId: 2,
        configViolationId: 1,
        status: 'CLOSED_MET_COMPLIANCE',
        entity: {
          'Animal Colour': 'Red',
          'License Number': '2345',
          Age: 1,
          Breed: 'breedA',
          Note: 'This animal is a pet cat',
        },
        originatedFrom: 'CREATE_CASE',
        complyByDate: null,
        createdBy: 1,
        updatedBy: 1,
        closedBy: null,
        closedAt: null,
        createdAt: '2019-03-05T16:23:15.143Z',
        updatedAt: '2019-03-05T17:56:07.678Z',
        deletedAt: null,
      },
      {
        id: 3,
        agencyId: 1,
        xerceCaseId: 8,
        configViolationTypeId: 1,
        configDispositionId: 3,
        configViolationId: 1,
        status: 'CLOSED_MET_COMPLIANCE',
        entity: {
          'Animal Colour': 'Red',
          'License Number': '2345',
          Age: 1,
          Breed: 'breedA',
          Note: 'This animal is a pet cat',
        },
        originatedFrom: 'CREATE_CASE',
        complyByDate: null,
        createdBy: 1,
        updatedBy: 1,
        closedBy: null,
        closedAt: null,
        createdAt: '2019-03-05T16:23:15.143Z',
        updatedAt: '2019-03-05T17:56:07.678Z',
        deletedAt: null,
      },
    ];
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return Forced abatement status', async () => {
    sandbox
      .stub(ConfigDispositionService.prototype, 'getByIds')
      .withArgs(agencyId, configDispositionIds)
      .resolves(configDispositions);

    const result = await xerceCaseAbatementService.getClosedAbatementStage(
      agencyId,
      xerceCaseViolations
    );

    expect(result).to.equal(responseBody);
  });

  it('Should return Voluntary abatement status', async () => {
    xerceCaseViolations = [
      {
        id: 1,
        agencyId: 1,
        xerceCaseId: 8,
        configViolationTypeId: 1,
        configDispositionId: 1,
        configViolationId: 1,
        status: 'CLOSED_INVALID',
        entity: {
          'Animal Colour': 'Red',
          'License Number': '2345',
          Age: 1,
          Breed: 'breedA',
          Note: 'This animal is a pet cat',
        },
        originatedFrom: 'CREATE_CASE',
        complyByDate: null,
        createdBy: 1,
        updatedBy: 1,
        closedBy: null,
        closedAt: null,
        createdAt: '2019-03-05T16:23:15.143Z',
        updatedAt: '2019-03-05T17:56:07.678Z',
        deletedAt: null,
      },
      {
        id: 2,
        agencyId: 1,
        xerceCaseId: 8,
        configViolationTypeId: 1,
        configDispositionId: 2,
        configViolationId: 1,
        status: 'CLOSED_MET_COMPLIANCE',
        entity: {
          'Animal Colour': 'Red',
          'License Number': '2345',
          Age: 1,
          Breed: 'breedA',
          Note: 'This animal is a pet cat',
        },
        originatedFrom: 'CREATE_CASE',
        complyByDate: null,
        createdBy: 1,
        updatedBy: 1,
        closedBy: null,
        closedAt: null,
        createdAt: '2019-03-05T16:23:15.143Z',
        updatedAt: '2019-03-05T17:56:07.678Z',
        deletedAt: null,
      },
      {
        id: 3,
        agencyId: 1,
        xerceCaseId: 8,
        configViolationTypeId: 1,
        configDispositionId: 3,
        configViolationId: 1,
        status: 'CLOSED_INVALID',
        entity: {
          'Animal Colour': 'Red',
          'License Number': '2345',
          Age: 1,
          Breed: 'breedA',
          Note: 'This animal is a pet cat',
        },
        originatedFrom: 'CREATE_CASE',
        complyByDate: null,
        createdBy: 1,
        updatedBy: 1,
        closedBy: null,
        closedAt: null,
        createdAt: '2019-03-05T16:23:15.143Z',
        updatedAt: '2019-03-05T17:56:07.678Z',
        deletedAt: null,
      },
    ];

    responseBody = 'Voluntary';

    sandbox
      .stub(ConfigDispositionService.prototype, 'getByIds')
      .withArgs(agencyId, configDispositionIds)
      .resolves(configDispositions);

    const result = await xerceCaseAbatementService.getClosedAbatementStage(
      agencyId,
      xerceCaseViolations
    );

    expect(result).to.equal(responseBody);
  });

  it('Should return Invalid abatement status', async () => {
    xerceCaseViolations = [
      {
        id: 1,
        agencyId: 1,
        xerceCaseId: 8,
        configViolationTypeId: 1,
        configDispositionId: 1,
        configViolationId: 1,
        status: 'CLOSED_INVALID',
        entity: {
          'Animal Colour': 'Red',
          'License Number': '2345',
          Age: 1,
          Breed: 'breedA',
          Note: 'This animal is a pet cat',
        },
        originatedFrom: 'CREATE_CASE',
        complyByDate: null,
        createdBy: 1,
        updatedBy: 1,
        closedBy: null,
        closedAt: null,
        createdAt: '2019-03-05T16:23:15.143Z',
        updatedAt: '2019-03-05T17:56:07.678Z',
        deletedAt: null,
      },
      {
        id: 2,
        agencyId: 1,
        xerceCaseId: 8,
        configViolationTypeId: 1,
        configDispositionId: 1,
        configViolationId: 1,
        status: 'CLOSED_INVALID',
        entity: {
          'Animal Colour': 'Red',
          'License Number': '2345',
          Age: 1,
          Breed: 'breedA',
          Note: 'This animal is a pet cat',
        },
        originatedFrom: 'CREATE_CASE',
        complyByDate: null,
        createdBy: 1,
        updatedBy: 1,
        closedBy: null,
        closedAt: null,
        createdAt: '2019-03-05T16:23:15.143Z',
        updatedAt: '2019-03-05T17:56:07.678Z',
        deletedAt: null,
      },
      {
        id: 3,
        agencyId: 1,
        xerceCaseId: 8,
        configViolationTypeId: 1,
        configDispositionId: 3,
        configViolationId: 1,
        status: 'CLOSED_INVALID',
        entity: {
          'Animal Colour': 'Red',
          'License Number': '2345',
          Age: 1,
          Breed: 'breedA',
          Note: 'This animal is a pet cat',
        },
        originatedFrom: 'CREATE_CASE',
        complyByDate: null,
        createdBy: 1,
        updatedBy: 1,
        closedBy: null,
        closedAt: null,
        createdAt: '2019-03-05T16:23:15.143Z',
        updatedAt: '2019-03-05T17:56:07.678Z',
        deletedAt: null,
      },
    ];

    responseBody = 'Invalid';

    sandbox
      .stub(ConfigDispositionService.prototype, 'getByIds')
      .withArgs(agencyId, configDispositionIds)
      .resolves(configDispositions);

    const result = await xerceCaseAbatementService.getClosedAbatementStage(
      agencyId,
      xerceCaseViolations
    );

    expect(result).to.equal(responseBody);
  });
});

describe('XerceCaseAbatement Service: getOpenAbatementStage method', () => {
  let sandbox;
  let xerceCase;
  const agencyId = 1;
  const caseId = 1;
  let abatementStage = 'Reopened';
  const forcedDisposition = {
    id: 1,
    label: 'Forced',
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    xerceCase = {
      id: caseId,
      abatementStage: 'Verification Pending',
      reopenedAt: new Date('2019-02-16T06:29:32.814Z'),
      caseInspections: [
        {
          id: 111,
          notice: {
            id: 101,
            configNotice: {
              id: 201,
              label: 'Verbal Warning',
            },
          },
        },
        {
          id: 112,
          notice: {
            id: 102,
            configNotice: {
              id: 202,
              label: 'Final Warning',
            },
          },
        },
      ],
    };
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('should return the notice name as abatement stage', async () => {
    sandbox
      .stub(ConfigDispositionService.prototype, 'getForcedDisposition')
      .withArgs(agencyId)
      .resolves(forcedDisposition);

    sandbox.stub(db.XerceCase, 'findOne').resolves(xerceCase);

    const result = await new XerceCaseAbatementService().getOpenAbatementStage(
      agencyId,
      caseId
    );

    expect(result).to.be.equal(abatementStage);
  });

  it('should return the Forced abatement stage', async () => {
    xerceCase = {
      id: caseId,
      abatementStage: 'Forced',
      reopenedAt: new Date('2019-02-16T06:29:32.814Z'),
      caseInspections: [
        {
          id: 111,
          createdAt: new Date('2019-02-17T06:29:32.814Z'),
          notice: {
            id: 101,
            configNotice: {
              id: 201,
              label: 'Verbal Warning',
            },
          },
        },
        {
          id: 112,
          createdAt: new Date('2019-02-16T06:29:32.814Z'),
          notice: {
            id: 102,
            configNotice: {
              id: 202,
              label: 'Final Warning',
            },
          },
        },
      ],
    };

    abatementStage = 'Forced';

    sandbox
      .stub(ConfigDispositionService.prototype, 'getForcedDisposition')
      .withArgs(agencyId)
      .resolves(forcedDisposition);

    sandbox.stub(db.XerceCase, 'findOne').resolves(xerceCase);

    const result = await new XerceCaseAbatementService().getOpenAbatementStage(
      agencyId,
      caseId
    );

    expect(result).to.be.equal(abatementStage);
  });

  it('should return the notice abatement stage', async () => {
    xerceCase = {
      id: caseId,
      abatementStage: 'Verbal Warning',
      reopenedAt: new Date('2019-02-16T06:29:32.814Z'),
      caseInspections: [
        {
          id: 111,
          createdAt: new Date('2019-02-17T06:29:32.814Z'),
          notice: {
            id: 101,
            configNotice: {
              id: 201,
              label: 'Verbal Warning',
            },
          },
        },
        {
          id: 112,
          createdAt: new Date('2019-02-16T06:29:32.814Z'),
          notice: {
            id: 102,
            configNotice: {
              id: 202,
              label: 'Final Warning',
            },
          },
        },
      ],
    };

    abatementStage = 'Verbal Warning';

    sandbox
      .stub(ConfigDispositionService.prototype, 'getForcedDisposition')
      .withArgs(agencyId)
      .resolves(forcedDisposition);

    sandbox.stub(db.XerceCase, 'findOne').resolves(xerceCase);

    const result = await new XerceCaseAbatementService().getOpenAbatementStage(
      agencyId,
      caseId
    );

    expect(result).to.be.equal(abatementStage);
  });

  it('should return the notice abatement stage when case is never closed and notice issued', async () => {
    xerceCase = {
      id: caseId,
      abatementStage: 'Verbal Warning',
      reopenedAt: null,
      caseInspections: [
        {
          id: 111,
          createdAt: new Date('2019-02-17T06:29:32.814Z'),
          notice: {
            id: 101,
            configNotice: {
              id: 201,
              label: 'Verbal Warning',
            },
          },
        },
        {
          id: 112,
          createdAt: new Date('2019-02-16T06:29:32.814Z'),
          notice: {
            id: 102,
            configNotice: {
              id: 202,
              label: 'Final Warning',
            },
          },
        },
      ],
    };

    abatementStage = 'Final Warning';

    sandbox
      .stub(ConfigDispositionService.prototype, 'getForcedDisposition')
      .withArgs(agencyId)
      .resolves(forcedDisposition);

    sandbox.stub(db.XerceCase, 'findOne').resolves(xerceCase);

    const result = await new XerceCaseAbatementService().getOpenAbatementStage(
      agencyId,
      caseId
    );

    expect(result).to.be.equal(abatementStage);
  });

  it('should return the reopened abatement stage', async () => {
    xerceCase = {
      id: caseId,
      abatementStage: 'Verbal Warning',
      reopenedAt: null,
      caseInspections: [
        {
          id: 111,
          createdAt: new Date('2019-02-15T06:29:32.814Z'),
          notice: null,
        },
        {
          id: 112,
          createdAt: new Date('2019-02-15T06:29:32.814Z'),
          notice: null,
        },
      ],
    };

    abatementStage = 'No Notice';

    sandbox
      .stub(ConfigDispositionService.prototype, 'getForcedDisposition')
      .withArgs(agencyId)
      .resolves(forcedDisposition);

    sandbox.stub(db.XerceCase, 'findOne').resolves(xerceCase);

    const result = await new XerceCaseAbatementService().getOpenAbatementStage(
      agencyId,
      caseId
    );

    expect(result).to.be.equal(abatementStage);
  });

  it('should return the no notice abatement stage when case is never closed and no notice issued', async () => {
    xerceCase = {
      id: caseId,
      abatementStage: 'Verbal Warning',
      reopenedAt: null,
      caseInspections: [
        {
          id: 111,
          createdAt: new Date('2019-02-15T06:29:32.814Z'),
          notice: null,
        },
        {
          id: 112,
          createdAt: new Date('2019-02-15T06:29:32.814Z'),
          notice: null,
        },
      ],
    };

    abatementStage = 'No Notice';

    sandbox
      .stub(ConfigDispositionService.prototype, 'getForcedDisposition')
      .withArgs(agencyId)
      .resolves(forcedDisposition);

    sandbox.stub(db.XerceCase, 'findOne').resolves(xerceCase);

    const result = await new XerceCaseAbatementService().getOpenAbatementStage(
      agencyId,
      caseId
    );

    expect(result).to.be.equal(abatementStage);
  });

  it('should return the reopened abatement stage when no notice issued after reopening case', async () => {
    xerceCase = {
      id: caseId,
      abatementStage: 'Verbal Warning',
      reopenedAt: new Date('2019-02-16T06:29:32.814Z'),
      caseInspections: [
        {
          id: 111,
          createdAt: new Date('2019-02-15T06:29:32.814Z'),
          notice: null,
        },
        {
          id: 112,
          createdAt: new Date('2019-02-15T06:29:32.814Z'),
          notice: null,
        },
      ],
    };

    abatementStage = 'Reopened';

    sandbox
      .stub(ConfigDispositionService.prototype, 'getForcedDisposition')
      .withArgs(agencyId)
      .resolves(forcedDisposition);

    sandbox.stub(db.XerceCase, 'findOne').resolves(xerceCase);

    const result = await new XerceCaseAbatementService().getOpenAbatementStage(
      agencyId,
      caseId
    );

    expect(result).to.be.equal(abatementStage);
  });

  it('should return reopened as abatement stage', async () => {
    xerceCase = {
      id: caseId,
      abatementStage: 'Verification Pending',
      reopenedAt: new Date('2019-02-16T06:29:32.814Z'),
      caseInspections: [],
    };

    abatementStage = AbatementStage.REOPENED;

    sandbox.stub(db.XerceCase, 'findOne').resolves(xerceCase);

    sandbox
      .stub(ConfigDispositionService.prototype, 'getForcedDisposition')
      .withArgs(agencyId)
      .resolves(forcedDisposition);

    const result = await new XerceCaseAbatementService().getOpenAbatementStage(
      agencyId,
      caseId
    );

    expect(result).to.be.equal(abatementStage);
  });

  it('should return reopened as abatement stage', async () => {
    xerceCase = {
      id: caseId,
      abatementStage: 'Verification Pending',
      reopenedAt: null,
      caseInspections: [],
    };

    abatementStage = AbatementStage.NO_NOTICE;

    sandbox.stub(db.XerceCase, 'findOne').resolves(xerceCase);

    sandbox
      .stub(ConfigDispositionService.prototype, 'getForcedDisposition')
      .withArgs(agencyId)
      .resolves(forcedDisposition);

    const result = await new XerceCaseAbatementService().getOpenAbatementStage(
      agencyId,
      caseId
    );

    expect(result).to.be.equal(abatementStage);
  });

  it('should throw error while getting open abatement stage', async () => {
    xerceCase = {
      id: caseId,
      abatementStage: 'Verification Pending',
      reopenedAt: null,
      caseInspections: [],
    };

    abatementStage = AbatementStage.NO_NOTICE;

    sandbox.stub(db.XerceCase, 'findOne').throws('Error');

    sandbox
      .stub(ConfigDispositionService.prototype, 'getForcedDisposition')
      .withArgs(agencyId)
      .resolves(forcedDisposition);

    await new XerceCaseAbatementService()
      .getOpenAbatementStage(agencyId, caseId)
      .catch(err => expect(err.name).to.be.equal('InternalServerError'));
  });
});

describe('XerceCaseAbatement Service: setAbatementStage method', () => {
  let sandbox;
  let notice: IXerceCaseNotice;
  let transaction;
  const agencyId = 1;
  const caseId = 1;
  const forcedDisposition = {
    id: 1,
    label: 'Forced',
  };
  let xerceCase;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    xerceCase = {
      id: caseId,
      abatementStage: 'Verification Pending',
      reopenedAt: new Date('2019-02-16T06:29:32.814Z'),
      caseInspections: [
        {
          id: 111,
          notice: {
            id: 101,
            configNotice: {
              id: 201,
              label: 'Verbal Warning',
            },
          },
        },
        {
          id: 112,
          notice: {
            id: 102,
            configNotice: {
              id: 202,
              label: 'Final Warning',
            },
          },
        },
      ],
      save: () => Promise.resolve(),
    };

    notice = {
      id: 1,
      noticeContent: null,
      issuedAt: new Date('2020-03-05T16:23:14.912Z'),
      mergedFields: null,
      note: null,
      noticeNumber: '01',
      configNotice: {
        id: 1,
        label: 'Court Notice',
        proposeForcedAbatement: false,
      },
      createdBy: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
      },
      certifiedMailNumber: '1234567890',
      updatedBy: null,
      createdAt: new Date('2018-03-30T08:36:22.338Z'),
      updatedAt: null,
    };

    transaction = sinon.stub();
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return set notice abatement status', async () => {
    const issuedNoticeName = notice.configNotice.label;

    sandbox
      .stub(db.XerceCase, 'findOne')
      .withArgs({
        where: {
          id: caseId,
          agencyId,
        },
        attributes: ['id', 'abatementStage'],
      })
      .resolves(xerceCase);

    sandbox
      .stub(ConfigDispositionService.prototype, 'getForcedDisposition')
      .withArgs(agencyId)
      .resolves(forcedDisposition);

    await xerceCaseAbatementService
      .setAbatementStage(agencyId, caseId, issuedNoticeName, transaction)
      .catch(err => expect(err.name).to.equal('Error'));
  });

  it('Should return Forced abatement stage', async () => {
    const issuedNoticeName = notice.configNotice.label;

    xerceCase = {
      id: caseId,
      abatementStage: 'Forced',
      reopenedAt: new Date('2019-02-16T06:29:32.814Z'),
      caseInspections: [
        {
          id: 111,
          notice: {
            id: 101,
            configNotice: {
              id: 201,
              label: 'Verbal Warning',
            },
          },
        },
        {
          id: 112,
          notice: {
            id: 102,
            configNotice: {
              id: 202,
              label: 'Final Warning',
            },
          },
        },
      ],
      save: () => Promise.resolve(),
    };

    sandbox
      .stub(db.XerceCase, 'findOne')
      .withArgs({
        where: {
          id: caseId,
          agencyId,
        },
        attributes: ['id', 'abatementStage'],
      })
      .resolves(xerceCase);

    sandbox
      .stub(ConfigDispositionService.prototype, 'getForcedDisposition')
      .withArgs(agencyId)
      .resolves(forcedDisposition);

    await xerceCaseAbatementService
      .setAbatementStage(agencyId, caseId, issuedNoticeName, transaction)
      .catch(err => expect(err.name).to.equal('Error'));
  });

  it('Should throw error while saving abatement stage', async () => {
    const issuedNoticeName = notice.configNotice.label;

    xerceCase = {
      id: caseId,
      abatementStage: 'Verbal Warning',
      reopenedAt: new Date('2019-02-16T06:29:32.814Z'),
      caseInspections: [
        {
          id: 111,
          notice: {
            id: 101,
            configNotice: {
              id: 201,
              label: 'Verbal Warning',
            },
          },
        },
        {
          id: 112,
          notice: {
            id: 102,
            configNotice: {
              id: 202,
              label: 'Final Warning',
            },
          },
        },
      ],
      save: () => Promise.reject(),
    };

    sandbox
      .stub(db.XerceCase, 'findOne')
      .withArgs({
        where: {
          id: caseId,
          agencyId,
        },
        attributes: ['id', 'abatementStage'],
      })
      .resolves(xerceCase);

    sandbox
      .stub(ConfigDispositionService.prototype, 'getForcedDisposition')
      .withArgs(agencyId)
      .resolves(forcedDisposition);

    await xerceCaseAbatementService
      .setAbatementStage(agencyId, caseId, issuedNoticeName, transaction)
      .catch(err => expect(err.name).to.equal('InternalServerError'));
  });

  it('Should throw error while fetching notice abatement stage', async () => {
    sandbox
      .stub(db.XerceCase, 'findOne')
      .withArgs({
        where: {
          id: caseId,
          agencyId,
        },
        attributes: ['id', 'abatementStage'],
      })
      .throws('Error');

    sandbox
      .stub(ConfigDispositionService.prototype, 'getForcedDisposition')
      .withArgs(agencyId)
      .resolves(forcedDisposition);

    await xerceCaseAbatementService
      .setAbatementStage(
        agencyId,
        caseId,
        notice.configNotice.label,
        transaction
      )
      .catch(err => expect(err.name).to.equal('InternalServerError'));
  });
});

describe('XerceCaseAbatement Service: modifyDates method', () => {
  let sandbox;
  let transaction;
  const agencyId = 1;
  const caseId = 1;
  const abatementActivitiesModifiedDates: IModifyAbatementActivitiesDatesReq = {
    caseStatusActivity: [
      { id: 8, modifiedDate: new Date('2019-09-01T09:13:12.177Z') },
      { id: 9, modifiedDate: new Date('2019-09-10T09:14:38.993Z') },
      { id: 10, modifiedDate: new Date('2019-09-04T09:14:49.091Z') },
    ],
    inspections: [
      { id: 31, modifiedDate: new Date('2019-09-01T09:14:15.291Z') },
      { id: 32, modifiedDate: new Date('2019-09-03T09:14:38.995Z') },
      { id: 33, modifiedDate: new Date('2019-09-06T09:15:15.484Z') },
      { id: 30, modifiedDate: new Date('2019-09-18T09:13:29.798Z') },
    ],
    notices: [
      { id: 25, modifiedDate: new Date('2019-09-05T09:14:58.661Z') },
      { id: 24, modifiedDate: new Date('2019-09-07T09:13:59.588Z') },
    ],
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

  const xerceCase = {
    id: 15,
    agencyId: 1,
    caseNumber: 'CE-19-7',
    createdBy: 4,
    updatedBy: 4,
    closedBy: null,
    reopenedBy: 4,
    createdAt: '2019-09-01T09:13:12.177Z',
    updatedAt: '2019-09-17T10:54:08.401Z',
    closedAt: '2019-09-10T09:14:38.993Z',
    reopenedAt: '2019-09-04T09:14:49.091Z',
    deletedAt: null,
    xerceCaseStatusActivities: [
      { id: 8, createdAt: '2019-09-01T09:13:12.177Z', status: 'OPEN' },
      { id: 9, createdAt: '2019-09-10T09:14:38.993Z', status: 'CLOSED' },
      { id: 10, createdAt: '2019-09-04T09:14:49.091Z', status: 'OPEN' },
    ],
    caseInspections: [
      {
        id: 31,
        closedAt: '2019-09-01T09:14:15.291Z',
        save: () => Promise.reject(),
      },
      {
        id: 32,
        closedAt: '2019-09-03T09:14:38.995Z',
        save: () => Promise.reject(),
      },
      {
        id: 33,
        closedAt: '2019-09-06T09:15:15.484Z',
        save: () => Promise.reject(),
      },
      {
        id: 30,
        closedAt: '2019-09-18T09:13:29.798Z',
        save: () => Promise.reject(),
      },
    ],
    xerceCaseNotices: [
      {
        id: 25,
        issuedAt: '2019-09-05T09:14:58.661Z',
        save: () => Promise.reject(),
      },
      {
        id: 24,
        issuedAt: '2019-09-07T09:13:59.588Z',
        save: () => Promise.reject(),
      },
    ],
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    transaction = sinon.stub();
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('should throw error if the request has duplicates', async () => {
    await xerceCaseAbatementService
      .modifyDates(
        agencyId,
        caseId,
        {
          ...abatementActivitiesModifiedDates,
          caseStatusActivity: abatementActivitiesModifiedDates.caseStatusActivity.concat(
            abatementActivitiesModifiedDates.caseStatusActivity[0]
          ),
        },
        user
      )
      .catch(err => expect(err.name).to.equal('InvalidRequestError'));
  });

  it('should throw error if case is not found', async () => {
    sandbox
      .stub(db.XerceCase, 'findOne')
      .withArgs({
        where: {
          agencyId,
          id: caseId,
        },
        include: [
          {
            model: db.XerceCaseStatusActivity,
            as: 'xerceCaseStatusActivities',
            attributes: ['id', 'createdAt', 'status'],
          },
          {
            model: db.XerceCaseInspection,
            as: 'caseInspections',
            attributes: ['id', 'closedAt'],
            where: {
              status: InspectionStatus.COMPLETED,
            },
            required: false,
          },
          {
            model: db.XerceCaseNotice,
            as: 'xerceCaseNotices',
            attributes: ['id', 'issuedAt', 'configNoticeId'],
          },
        ],
        order: [
          'id',
          [
            {
              model: db.XerceCaseStatusActivity,
              as: 'xerceCaseStatusActivities',
            },
            'id',
            'asc',
          ],
        ],
      })
      .throws('Error');

    sandbox
      .stub(XerceCaseHistoryService.prototype, 'createModifiedDatesHistory')
      .withArgs(
        agencyId,
        user,
        abatementActivitiesModifiedDates,
        xerceCase,
        transaction
      )
      .resolves(null);

    await xerceCaseAbatementService
      .modifyDates(agencyId, caseId, abatementActivitiesModifiedDates, user)
      .catch(err => expect(err.name).to.equal('InternalServerError'));
  });

  it('should throw error if case activities doesnot match the request', async () => {
    sandbox
      .stub(db.XerceCase, 'findOne')
      .withArgs({
        where: {
          agencyId,
          id: caseId,
        },
        include: [
          {
            model: db.XerceCaseStatusActivity,
            as: 'xerceCaseStatusActivities',
            attributes: ['id', 'createdAt', 'status'],
          },
          {
            model: db.XerceCaseInspection,
            as: 'caseInspections',
            attributes: ['id', 'closedAt'],
            where: {
              status: InspectionStatus.COMPLETED,
            },
            required: false,
          },
          {
            model: db.XerceCaseNotice,
            as: 'xerceCaseNotices',
            attributes: ['id', 'issuedAt', 'configNoticeId'],
          },
        ],
        order: [
          'id',
          [
            {
              model: db.XerceCaseStatusActivity,
              as: 'xerceCaseStatusActivities',
            },
            'id',
            'asc',
          ],
        ],
      })
      .resolves(xerceCase);

    sandbox
      .stub(XerceCaseHistoryService.prototype, 'createModifiedDatesHistory')
      .withArgs(
        agencyId,
        user,
        abatementActivitiesModifiedDates,
        xerceCase,
        transaction
      )
      .resolves(null);

    await xerceCaseAbatementService
      .modifyDates(
        agencyId,
        caseId,
        {
          ...abatementActivitiesModifiedDates,
          caseStatusActivity: abatementActivitiesModifiedDates.caseStatusActivity.concat(
            abatementActivitiesModifiedDates.inspections[0]
          ),
        },
        user
      )
      .catch(err => expect(err.name).to.equal('InvalidRequestError'));
  });

  it('should update the abatement activity dates', async () => {
    sandbox
      .stub(db.XerceCase, 'findOne')
      .withArgs({
        where: {
          agencyId,
          id: caseId,
        },
        include: [
          {
            model: db.XerceCaseStatusActivity,
            as: 'xerceCaseStatusActivities',
            attributes: ['id', 'createdAt', 'status'],
          },
          {
            model: db.XerceCaseInspection,
            as: 'caseInspections',
            attributes: ['id', 'closedAt'],
            where: {
              status: InspectionStatus.COMPLETED,
            },
            required: false,
          },
          {
            model: db.XerceCaseNotice,
            as: 'xerceCaseNotices',
            attributes: ['id', 'issuedAt', 'configNoticeId'],
          },
        ],
        order: [
          'id',
          [
            {
              model: db.XerceCaseStatusActivity,
              as: 'xerceCaseStatusActivities',
            },
            'id',
            'asc',
          ],
        ],
      })
      .resolves(xerceCase);

    sandbox
      .stub(XerceCaseHistoryService.prototype, 'createModifiedDatesHistory')
      .withArgs(
        agencyId,
        user,
        abatementActivitiesModifiedDates,
        xerceCase,
        transaction
      )
      .resolves(null);

    sandbox.stub(DBUtil, 'createTransaction').returns(transaction);

    sandbox.stub(Promise, 'all').resolves();

    sandbox.stub(DBUtil, 'commitTransaction').withArgs(transaction);

    await xerceCaseAbatementService.modifyDates(
      agencyId,
      caseId,
      abatementActivitiesModifiedDates,
      user
    );
  });

  it('should throw error if update to the abatement activity dates fails', async () => {
    sandbox
      .stub(db.XerceCase, 'findOne')
      .withArgs({
        where: {
          agencyId,
          id: caseId,
        },
        include: [
          {
            model: db.XerceCaseStatusActivity,
            as: 'xerceCaseStatusActivities',
            attributes: ['id', 'createdAt', 'status'],
          },
          {
            model: db.XerceCaseInspection,
            as: 'caseInspections',
            attributes: ['id', 'closedAt'],
            where: {
              status: InspectionStatus.COMPLETED,
            },
            required: false,
          },
          {
            model: db.XerceCaseNotice,
            as: 'xerceCaseNotices',
            attributes: ['id', 'issuedAt', 'configNoticeId'],
          },
        ],
        order: [
          'id',
          [
            {
              model: db.XerceCaseStatusActivity,
              as: 'xerceCaseStatusActivities',
            },
            'id',
            'asc',
          ],
        ],
      })
      .resolves(xerceCase);

    sandbox
      .stub(XerceCaseHistoryService.prototype, 'createModifiedDatesHistory')
      .withArgs(
        agencyId,
        user,
        abatementActivitiesModifiedDates,
        xerceCase,
        transaction
      )
      .resolves(null);

    sandbox.stub(DBUtil, 'createTransaction').returns(transaction);

    sandbox.stub(Promise, 'all').throws('Error');

    sandbox.stub(DBUtil, 'rollbackTransaction').withArgs(transaction);

    await xerceCaseAbatementService
      .modifyDates(agencyId, caseId, abatementActivitiesModifiedDates, user)
      .catch(err => expect(err.name).to.equal('InternalServerError'));
  });
});
