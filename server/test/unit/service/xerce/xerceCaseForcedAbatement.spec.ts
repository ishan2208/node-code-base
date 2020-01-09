import 'mocha';

import { expect } from 'chai';
import * as sinon from 'sinon';

import db from '../../../../api/models';
import ConfigDispositionService from '../../../../api/service/agencySetup/configDisposition';
import ConfigForcedAbatementActivityService from '../../../../api/service/agencySetup/configForcedAbatementActivity';
import XerceCaseListingService from '../../../../api/service/xerce/caseListing';
import XerceCaseService from '../../../../api/service/xerce/xerceCase';
import XerceCaseForcedAbatementService from '../../../../api/service/xerce/xerceCaseForcedAbatement';
import XerceCaseHistoryService from '../../../../api/service/xerce/xerceCaseHistory';
import XerceCaseNoteService from '../../../../api/service/xerce/xerceCaseNote';
import DBUtil from '../../../../api/utils/dbUtil';

describe('xerceCaseForcedAbatement Service: initiate Method', () => {
  let sandbox;
  let xerceCase;
  let createdBy: ICaseUser;
  let caseAssignee: ICaseUser;
  let result;
  let transaction;
  const caseId = 1;
  const agencyId = 4;
  let userProfile: IAgencyUserClaim | ISuperAdminClaim;
  let requestBody: INoteRequest;
  let responseBody;
  let note: INote;
  const forcedDisposition = {
    label: 'Forced',
  };

  const caseUser: ICaseUser = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    transaction = sinon.stub();

    const authScope = {
      comcateAdmin: true,
      siteAdmin: true,
    };

    responseBody = {
      id: caseId,
      caseSummary: {
        caseNumber: 'CE-12',
        status: 'OPEN',
        caseAge: 1,
        createdBy: caseUser,
        caseAssignee: caseUser,
        createdAt: '2019-02-16T06:29:32.814Z',
        updatedAt: '2019-02-16T06:29:32.814Z',
      },
      issueDescription: '',
      inspections: [
        {
          id: 13,
          name: 'verification Pending',
          dueDate: '2019-02-16T06:29:32.814Z',
          assignee: caseUser,
        },
      ],
      location: {
        id: 11,
        parcelId: 20,
        streetAddress: '1666 14th Street',
        city: 'Oakland',
        state: 'CA',
        zip: '94607',
        latitude: 37.812496,
        longitude: -122.29551,
        parcelFields: {},
        manualFields: {
          Ward: 'Ward I',
          Lot: 1,
          Block: 1,
        },
        flagHistory: [
          {
            id: 35,
            isFlagged: false,
            reasonForFlagging: '',
            updatedBy: caseUser,
            updatedAt: '2019-02-16T06:29:32.814Z',
          },
        ],
        isCDBGApproved: true,
        parcel: {
          id: 20,
          apn: '',
          siteAddress: '1666 14th Street',
          siteCity: 'Oakland',
          siteState: 'CA',
          siteZip: '94607',
          ownerName: '',
          ownerAddress: '1666 14th Street',
          ownerCity: 'Oakland',
          ownerState: 'CA',
          ownerZip: '94607',
          isOwnerBusiness: true,
          customFields: {},
          cdbgCensusTract: '',
          cdbgBlockGroup: '',
          cdbgLowModPercent: 33,
          isCDBGEligible: true,
          mapboxAddress: '1666 14th Street',
          mapboxCity: 'Oakland',
          mapboxState: 'CA',
          mapboxZip: '94607',
          mapboxFullAddress: '1666 14th Street, Oakland, CA, 94607',
          flagHistory: [
            {
              id: 35,
              isFlagged: false,
              reasonForFlagging: '',
              updatedBy: caseUser,
              updatedAt: '2019-02-16T06:29:32.814Z',
            },
          ],
        },
      },
      caseViolations: [
        {
          id: 23,
          configDispositionId: 12,
          status: XerceViolationStatus.OPEN,
          complyByDate: '2019-02-16T06:29:32.814Z',
          configViolation: {
            id: 22,
            label: 'Animal Control',
            complyByDays: 4,
            configViolationType: {
              id: 5,
              label: 'Animal Control',
              iconURL:
                'https://cyberdyne-dev.s3.amazonaws.com/agency_0/system_icon/animal.png',
              configEntitySection: {
                id: 7,
                label: 'Animal Entity',
                isActive: true,
                entityFields: [],
              },
            },
            configMunicipalCode: {
              id: 7,
              articleNumber: '1.2.3;',
              description: 'This is a description',
              resolutionAction: 'This is a resolution action',
            },
          },
          entity: {},
          createdBy: caseUser,
          updatedBy: caseUser,
          closedBy: caseUser,
          createdAt: '2019-02-16T06:29:32.814Z',
          updatedAt: '2019-02-16T06:29:32.814Z',
          closedAt: null,
        },
      ],
      attachments: [
        {
          id: 1,
          ownerId: 1,
          title: 'This is PNG attachment ',
          description: 'this is a description',
          fileName: 'This is a file name1',
          fileSize: '20KB',
          fileURL:
            'https://cyberdyne-dev.s3.ap-south-1.amazonaws.com/agency_1/cases/case_3/attachments/Screenshot_from_2018_04_24_11_58_46_1530600092122__1_.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAIQB2HFNFBN2PUWPQ%2F20180711%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20180711T061030Z&X-Amz-Expires=18000&X-Amz-Signature=9d97e1ca0ea07ef6b14c85f8390dd17fb7e8754a166443e9be3f1c38e9e262b2&X-Amz-SignedHeaders=host',
          contentType: 'image/png',
        },
      ],
      caseContacts: [
        {
          id: 45,
          caseContactId: 2,
          name: 'Janet Doe',
          contactType: ContactType.INDIVIDUAL,
          isVendor: false,
          isGisPopulated: false,
          email: 'janet.doe@alabame.com',
          cellPhone: '123456789',
          workPhone: '123456789',
          streetAddress: '1666 14th Street',
          city: 'Oakland',
          state: 'CA',
          zip: '94607',
          note: '',
          contactCustomFieldValues: {},
          isBillable: true,
        },
      ],
      customCaseFieldValues: [
        {
          'Property Lien': {
            'Start Date': '2019-02-27T08:00:00.000Z',
            'End Date': '2019-04-26T07:00:00.000Z',
            'Property Lien Type': 'Short Term',
            'Property Lien By': 'owner',
          },
        },
        {
          'Court Hearing': {
            'Court Hearing Start Date': '2019-02-01T08:00:00.000Z',
            'Court Hearing End Date': '2019-02-22T08:00:00.000Z',
            'Proof Submitted': 'Yes',
            'Court Name and Address': 'Test',
          },
        },
      ],
      caseForcedAbatements: [],
      caseActivities: [],
      caseNotices: [],
      closedAt: null,
      updatedBy: caseUser,
    };

    userProfile = {
      agencyName: 'City of Alabama',
      id: 11,
      agencyId,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@gmail.com',
      scopes: authScope,
      agencyTimezone: 'PST',
    };

    requestBody = {
      noteContent: 'Forced Abatement Initiated',
    };

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

    note = {
      id: 1,
      noteContent: 'This is a first note',
      createdBy: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
      },
      createdAt: new Date('2018-04-18T06:14:50.572Z'),
      updatedBy: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
      },
      updatedAt: new Date('2018-04-18T06:14:50.572Z'),
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
      forcedAbatementInitiatedAt: null,
      forcedAbatementInitiatedBy: null,
      forcedAbatementNoteId: null,
      createdByUser: createdBy,
      caseAssignee,
      closedByUser: null,
      closedAt: null,
      createdAt: new Date('2019-02-16T06:29:32.814Z'),
      updatedAt: new Date('2019-02-16T06:29:32.814Z'),
      save: () => Promise.resolve(),
    };
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 with case details', async () => {
    sandbox
      .stub(XerceCaseService.prototype, 'getRecord')
      .withArgs(agencyId, caseId)
      .resolves(xerceCase);

    sandbox
      .stub(XerceCaseHistoryService.prototype, 'createForcedAbatementHistory')
      .withArgs(
        CaseHistoryActions.FORCED_ABATEMENT_NOTE_EDITED,
        agencyId,
        userProfile.id,
        caseId,
        transaction
      )
      .resolves(null);

    sandbox
      .stub(XerceCaseNoteService.prototype, 'create')
      .withArgs(
        agencyId,
        caseId,
        requestBody.noteContent,
        userProfile.id,
        false,
        transaction
      )
      .returns(note);

    sandbox
      .stub(ConfigDispositionService.prototype, 'getForcedDisposition')
      .withArgs(agencyId)
      .resolves(forcedDisposition);

    sandbox.stub(DBUtil, 'createTransaction').resolves(transaction);

    sandbox.stub(DBUtil, 'rollbackTransaction').withArgs(transaction);

    sandbox.stub(DBUtil, 'commitTransaction').withArgs(transaction);

    sandbox.stub(XerceCaseListingService.prototype, 'refreshCaseListing');

    sandbox
      .stub(XerceCaseService.prototype, 'get')
      .withArgs(agencyId, caseId, userProfile.agencyTimezone)
      .resolves(responseBody);

    result = await new XerceCaseForcedAbatementService().initiate(
      agencyId,
      caseId,
      userProfile,
      requestBody
    );

    expect(result).to.deep.equal(responseBody, 'response did not match');
  });

  it('Should throw error when trying to re-initiating forced abatement', async () => {
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
      forcedAbatementInitiatedAt: new Date('2019-02-16T06:29:32.814Z'),
      forcedAbatementInitiatedBy: caseUser,
      forcedAbatementNoteId: 100,
      createdByUser: createdBy,
      caseAssignee,
      closedByUser: null,
      closedAt: null,
      createdAt: new Date('2019-02-16T06:29:32.814Z'),
      updatedAt: new Date('2019-02-16T06:29:32.814Z'),
      save: () => Promise.resolve(),
    };

    sandbox
      .stub(XerceCaseService.prototype, 'getRecord')
      .withArgs(agencyId, caseId)
      .resolves(xerceCase);

    await new XerceCaseForcedAbatementService()
      .initiate(agencyId, caseId, userProfile, requestBody)
      .catch(err => expect(err.name).to.equal('InvalidRequestError'));
  });

  it('Should throw error while saving the FAA details', async () => {
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
      forcedAbatementInitiatedAt: null,
      forcedAbatementInitiatedBy: null,
      forcedAbatementNoteId: null,
      createdByUser: createdBy,
      caseAssignee,
      closedByUser: null,
      closedAt: null,
      createdAt: new Date('2019-02-16T06:29:32.814Z'),
      updatedAt: new Date('2019-02-16T06:29:32.814Z'),
      save: () => Promise.reject(),
    };

    sandbox
      .stub(XerceCaseService.prototype, 'getRecord')
      .withArgs(agencyId, caseId)
      .resolves(xerceCase);

    sandbox
      .stub(XerceCaseHistoryService.prototype, 'createForcedAbatementHistory')
      .withArgs(
        CaseHistoryActions.FORCED_ABATEMENT_NOTE_EDITED,
        agencyId,
        userProfile.id,
        caseId,
        transaction
      )
      .resolves(null);

    sandbox
      .stub(XerceCaseNoteService.prototype, 'create')
      .withArgs(
        agencyId,
        caseId,
        requestBody.noteContent,
        userProfile.id,
        false,
        transaction
      )
      .returns(note);

    sandbox
      .stub(ConfigDispositionService.prototype, 'getForcedDisposition')
      .withArgs(agencyId)
      .resolves(forcedDisposition);

    sandbox.stub(DBUtil, 'createTransaction').resolves(transaction);

    sandbox.stub(DBUtil, 'rollbackTransaction').withArgs(transaction);

    sandbox.stub(DBUtil, 'commitTransaction').withArgs(transaction);

    sandbox.stub(XerceCaseListingService.prototype, 'refreshCaseListing');

    sandbox
      .stub(XerceCaseService.prototype, 'get')
      .withArgs(agencyId, caseId, userProfile.agencyTimezone)
      .resolves(responseBody);

    await new XerceCaseForcedAbatementService()
      .initiate(agencyId, caseId, userProfile, requestBody)
      .catch(err => expect(err.name).to.equal('InternalServerError'));
  });
});

describe('xerceCaseForcedAbatement Service: get method', () => {
  let sandbox;
  const agencyId = 1;
  const xerceCaseId = 1;
  let xerceCase;
  let forcedAbatement: IXerceCaseForcedAbatement;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    forcedAbatement = {
      initiatedAt: new Date('2019-02-16T06:29:32.814Z'),
      initiatedBy: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
      },
      note: {
        id: 1,
        noteContent: 'Forced abatement initiated.',
        createdBy: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
        },
        createdAt: new Date('2018-04-18T06:14:50.572Z'),
        updatedBy: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
        },
        updatedAt: new Date('2018-04-18T06:14:50.572Z'),
      },
      activities: [],
    };

    xerceCase = {
      id: xerceCaseId,
      forcedAbatementInitiatedAt: new Date('2019-02-16T06:29:32.814Z'),
      forcedAbatementInitiatedBy: 1,
      forcedAbatementNoteId: 1,
      forcedAbatementInitiatedByUser: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
      },
      forcedAbatementNote: {
        id: 1,
        agencyId,
        xerceCaseId,
        noteContent: 'Forced abatement initiated.',
        createdByUser: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
        },
        createdBy: 1,
        createdAt: new Date('2018-04-18T06:14:50.572Z'),
        updatedByUser: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
        },
        updatedBy: 1,
        updatedAt: new Date('2018-04-18T06:14:50.572Z'),
      },
      xerceCaseForcedAbatementActivities: [],
      closedAt: null,
      createdAt: new Date('2019-02-16T06:29:32.814Z'),
      updatedAt: new Date('2019-02-16T06:29:32.814Z'),
      save: () => Promise.resolve(),
    };
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return the forced abtement on case', async () => {
    sandbox
      .stub(db.XerceCase, 'findOne')
      .withArgs({
        where: {
          agencyId,
          id: xerceCaseId,
        },
        attributes: [
          'id',
          'forcedAbatementNoteId',
          'forcedAbatementInitiatedBy',
          'forcedAbatementInitiatedAt',
        ],
        include: [
          {
            model: db.XerceCaseNote,
            as: 'forcedAbatementNote',
            include: [
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
          },
          {
            model: db.User,
            as: 'forcedAbatementInitiatedByUser',
            attributes: ['id', 'firstName', 'lastName'],
          },
          {
            model: db.XerceCaseForcedAbatementActivity,
            as: 'xerceCaseForcedAbatementActivities',
            attributes: ['id', 'configFAAId', 'activityFieldsValues'],
          },
        ],
        order: [
          [
            {
              model: db.XerceCaseForcedAbatementActivity,
              as: 'xerceCaseForcedAbatementActivities',
            },
            'id',
            'asc',
          ],
        ],
      })
      .resolves(xerceCase);

    const result = await new XerceCaseForcedAbatementService().get(
      agencyId,
      xerceCaseId
    );

    expect(result).to.deep.equal(forcedAbatement, 'response did not match');
  });

  it('Should return null when no FA applied on case', async () => {
    xerceCase = {
      id: xerceCaseId,
      forcedAbatementInitiatedAt: null,
      forcedAbatementInitiatedBy: null,
      forcedAbatementNoteId: null,
      forcedAbatementInitiatedByUser: null,
      forcedAbatementNote: null,
    };

    sandbox
      .stub(db.XerceCase, 'findOne')
      .withArgs({
        where: {
          agencyId,
          id: xerceCaseId,
        },
        attributes: [
          'id',
          'forcedAbatementNoteId',
          'forcedAbatementInitiatedBy',
          'forcedAbatementInitiatedAt',
        ],
        include: [
          {
            model: db.XerceCaseNote,
            as: 'forcedAbatementNote',
            include: [
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
          },
          {
            model: db.User,
            as: 'forcedAbatementInitiatedByUser',
            attributes: ['id', 'firstName', 'lastName'],
          },
          {
            model: db.XerceCaseForcedAbatementActivity,
            as: 'xerceCaseForcedAbatementActivities',
            attributes: ['id', 'configFAAId', 'activityFieldsValues'],
          },
        ],
        order: [
          [
            {
              model: db.XerceCaseForcedAbatementActivity,
              as: 'xerceCaseForcedAbatementActivities',
            },
            'id',
            'asc',
          ],
        ],
      })
      .resolves(xerceCase);

    const result = await new XerceCaseForcedAbatementService().get(
      agencyId,
      xerceCaseId
    );

    expect(result).to.deep.equal(null, 'response did not match');
  });

  it('Should throw error while trying to get FA', async () => {
    sandbox
      .stub(db.XerceCase, 'findOne')
      .withArgs({
        where: {
          agencyId,
          id: xerceCaseId,
        },
        attributes: [
          'id',
          'forcedAbatementNoteId',
          'forcedAbatementInitiatedBy',
          'forcedAbatementInitiatedAt',
        ],
        include: [
          {
            model: db.XerceCaseNote,
            as: 'forcedAbatementNote',
            include: [
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
          },
          {
            model: db.User,
            as: 'forcedAbatementInitiatedByUser',
            attributes: ['id', 'firstName', 'lastName'],
          },
          {
            model: db.XerceCaseForcedAbatementActivity,
            as: 'xerceCaseForcedAbatementActivities',
            attributes: ['id', 'configFAAId', 'activityFieldsValues'],
          },
        ],
        order: [
          [
            {
              model: db.XerceCaseForcedAbatementActivity,
              as: 'xerceCaseForcedAbatementActivities',
            },
            'id',
            'asc',
          ],
        ],
      })
      .throws('Error');

    await new XerceCaseForcedAbatementService()
      .get(agencyId, xerceCaseId)
      .catch(err => expect(err.name).to.be.equal('InternalServerError'));
  });
});

describe('xerceCaseForcedAbatement Service: edit method', () => {
  let sandbox;
  const agencyId = 1;
  const xerceCaseId = 1;
  let noteId = 11;
  let xerceCase;
  let forcedAbatement: IXerceCaseForcedAbatement;
  let transaction;

  const requestBody = {
    noteContent: 'Forced Abatement Note Updated',
  };

  const authScope = {
    comcateAdmin: true,
    siteAdmin: true,
  };

  const userProfile: IAgencyUserClaim | ISuperAdminClaim = {
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
    forcedAbatement = {
      initiatedAt: new Date('2019-02-16T06:29:32.814Z'),
      initiatedBy: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
      },
      note: {
        id: 1,
        noteContent: 'Forced abatement initiated.',
        createdBy: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
        },
        createdAt: new Date('2018-04-18T06:14:50.572Z'),
        updatedBy: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
        },
        updatedAt: new Date('2018-04-18T06:14:50.572Z'),
      },
      activities: [],
    };
    xerceCase = {
      id: xerceCaseId,
      forcedAbatementInitiatedAt: new Date('2019-02-16T06:29:32.814Z'),
      forcedAbatementInitiatedBy: 1,
      forcedAbatementNoteId: 11,
      forcedAbatementInitiatedByUser: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
      },
      forcedAbatementNote: {
        id: 1,
        agencyId,
        xerceCaseId,
        noteContent: 'Forced abatement initiated.',
        createdByUser: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
        },
        createdBy: 1,
        createdAt: new Date('2018-04-18T06:14:50.572Z'),
        updatedByUser: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
        },
        updatedBy: 1,
        updatedAt: new Date('2018-04-18T06:14:50.572Z'),
      },
      closedAt: null,
      createdAt: new Date('2019-02-16T06:29:32.814Z'),
      updatedAt: new Date('2019-02-16T06:29:32.814Z'),
      save: () => Promise.resolve(),
    };
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return the forced abtement on case after editing note', async () => {
    sandbox
      .stub(XerceCaseService.prototype, 'getRecord')
      .withArgs(agencyId, xerceCaseId)
      .resolves(xerceCase);

    sandbox
      .stub(XerceCaseHistoryService.prototype, 'createForcedAbatementHistory')
      .withArgs(
        CaseHistoryActions.FORCED_ABATEMENT_NOTE_EDITED,
        agencyId,
        userProfile.id,
        xerceCaseId,
        transaction,
        requestBody.noteContent
      )
      .resolves(null);

    sandbox.stub(DBUtil, 'createTransaction').resolves(transaction);

    sandbox.stub(DBUtil, 'rollbackTransaction').withArgs(transaction);

    sandbox.stub(DBUtil, 'commitTransaction').withArgs(transaction);

    sandbox.stub(XerceCaseListingService.prototype, 'refreshCaseListing');

    sandbox.stub(db.XerceCaseNote, 'update').withArgs(
      {
        noteContent: requestBody.noteContent,
        updatedBy: userProfile.id,
      },
      {
        where: {
          agencyId,
          xerceCaseId,
          id: noteId,
        },
        transaction,
      }
    );

    sandbox
      .stub(XerceCaseService.prototype, 'setUpdatedAt')
      .withArgs(agencyId, xerceCaseId);

    sandbox
      .stub(XerceCaseForcedAbatementService.prototype, 'get')
      .withArgs(agencyId, xerceCaseId)
      .resolves(forcedAbatement);

    const result = await new XerceCaseForcedAbatementService().edit(
      agencyId,
      xerceCaseId,
      noteId,
      userProfile,
      requestBody
    );

    expect(result).to.deep.equal(forcedAbatement, 'response did not match');
  });

  it('Should throw error when no FA applied on case', async () => {
    xerceCase = {
      id: xerceCaseId,
      forcedAbatementInitiatedAt: null,
      forcedAbatementInitiatedBy: null,
      forcedAbatementNoteId: null,
      forcedAbatementInitiatedByUser: null,
      forcedAbatementNote: null,
    };

    sandbox
      .stub(XerceCaseService.prototype, 'getRecord')
      .withArgs(agencyId, xerceCaseId)
      .resolves(xerceCase);

    sandbox
      .stub(XerceCaseHistoryService.prototype, 'createForcedAbatementHistory')
      .withArgs(
        CaseHistoryActions.FORCED_ABATEMENT_NOTE_EDITED,
        agencyId,
        userProfile.id,
        xerceCaseId,
        transaction,
        requestBody.noteContent
      )
      .resolves(null);

    await new XerceCaseForcedAbatementService()
      .edit(agencyId, xerceCaseId, noteId, userProfile, requestBody)
      .catch(err => expect(err.name).to.equal('InvalidRequestError'));
  });

  it('Should throw error when invalid note id provided', async () => {
    noteId = 100;

    sandbox
      .stub(XerceCaseService.prototype, 'getRecord')
      .withArgs(agencyId, xerceCaseId)
      .resolves(xerceCase);

    sandbox
      .stub(XerceCaseHistoryService.prototype, 'createForcedAbatementHistory')
      .withArgs(
        CaseHistoryActions.FORCED_ABATEMENT_NOTE_EDITED,
        agencyId,
        userProfile.id,
        xerceCaseId,
        transaction,
        requestBody.noteContent
      )
      .resolves(null);

    await new XerceCaseForcedAbatementService()
      .edit(agencyId, xerceCaseId, noteId, userProfile, requestBody)
      .catch(err => expect(err.name).to.equal('InvalidRequestError'));
  });

  it('Should throw error while editing note', async () => {
    sandbox
      .stub(XerceCaseService.prototype, 'getRecord')
      .withArgs(agencyId, xerceCaseId)
      .resolves(xerceCase);

    sandbox.stub(DBUtil, 'createTransaction').resolves(transaction);

    sandbox.stub(DBUtil, 'rollbackTransaction').withArgs(transaction);

    sandbox.stub(DBUtil, 'commitTransaction').withArgs(transaction);

    sandbox.stub(XerceCaseListingService.prototype, 'refreshCaseListing');

    sandbox
      .stub(XerceCaseHistoryService.prototype, 'createForcedAbatementHistory')
      .withArgs(
        CaseHistoryActions.FORCED_ABATEMENT_NOTE_EDITED,
        agencyId,
        userProfile.id,
        xerceCaseId,
        transaction,
        requestBody.noteContent
      )
      .resolves(null);

    sandbox
      .stub(db.XerceCaseNote, 'update')
      .withArgs(
        {
          noteContent: requestBody.noteContent,
          updatedBy: userProfile.id,
        },
        {
          where: {
            agencyId,
            xerceCaseId,
            id: noteId,
          },
          transaction,
        }
      )
      .throws('Error');

    sandbox
      .stub(XerceCaseService.prototype, 'setUpdatedAt')
      .withArgs(agencyId, xerceCaseId);

    sandbox
      .stub(XerceCaseService.prototype, 'get')
      .withArgs(agencyId, xerceCaseId, userProfile.agencyTimezone)
      .resolves(forcedAbatement);

    await new XerceCaseForcedAbatementService()
      .edit(agencyId, xerceCaseId, noteId, userProfile, requestBody)
      .catch(err => expect(err.name).to.equal('InvalidRequestError'));
  });
});

describe('xerceCaseForcedAbatement Service: Add Forced Abatement Activity', () => {
  let sandbox;
  const agencyId = 1;
  const userId = 1;
  const xerceCaseId = 1;
  const forcedAbatementActivityId = 1;
  let forcedAbatement: IXerceCaseForcedAbatement;
  let forcedAbatementActivityReq;
  let xerceCase;
  let configForcedAbatementActivities;
  let transaction;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    transaction = sinon.stub();
    forcedAbatementActivityReq = {
      1: '1123',
      2: new Date('2019-02-16T06:29:32.814Z'),
    };
    configForcedAbatementActivities = [
      {
        id: 1,
        agencyId: 1,
        xerceId: 1,
        label: 'Property Lien',
        description: 'Forced Abatement Activities related to properties.',
        sequence: 1,
        forcedAbatementFields: [
          {
            id: 1,
            isActive: true,
            isMandatory: false,
            label: 'Lien Instrument Number',
            options: [],
            sequence: 1,
            type: 'TEXT',
          },
          {
            id: 2,
            isActive: true,
            isMandatory: false,
            label: 'Date Lien Recorded',
            options: [],
            sequence: 2,
            type: 'DATE',
          },
        ],
        isActive: true,
        createdAt: '2019-02-16T06:29:32.814Z',
      },
    ];
    forcedAbatement = {
      initiatedAt: new Date('2019-02-16T06:29:32.814Z'),
      initiatedBy: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
      },
      note: {
        id: 1,
        noteContent: 'Forced abatement initiated.',
        createdBy: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
        },
        createdAt: new Date('2018-04-18T06:14:50.572Z'),
        updatedBy: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
        },
        updatedAt: new Date('2018-04-18T06:14:50.572Z'),
      },
      activities: [],
    };
    xerceCase = {
      id: xerceCaseId,
      forcedAbatementInitiatedAt: new Date('2019-02-16T06:29:32.814Z'),
      forcedAbatementInitiatedBy: 1,
      forcedAbatementNoteId: 11,
      forcedAbatementInitiatedByUser: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
      },
      forcedAbatementNote: {
        id: 1,
        agencyId,
        xerceCaseId,
        noteContent: 'Forced abatement initiated.',
        createdByUser: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
        },
        createdBy: 1,
        createdAt: new Date('2018-04-18T06:14:50.572Z'),
        updatedByUser: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
        },
        updatedBy: 1,
        updatedAt: new Date('2018-04-18T06:14:50.572Z'),
      },
      closedAt: null,
      createdAt: new Date('2019-02-16T06:29:32.814Z'),
      updatedAt: new Date('2019-02-16T06:29:32.814Z'),
      save: () => Promise.resolve(),
    };
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return the forced abtement on case after add activity', async () => {
    const activity: IXerceCaseForcedAbatementActivityAttributes = {
      xerceCaseId,
      agencyId,
      configFAAId: forcedAbatementActivityId,
      activityFieldsValues: forcedAbatementActivityReq,
    };

    sandbox
      .stub(XerceCaseService.prototype, 'getRecord')
      .withArgs(agencyId, xerceCaseId)
      .resolves(xerceCase);

    sandbox.stub(DBUtil, 'createTransaction').resolves(transaction);

    sandbox.stub(DBUtil, 'rollbackTransaction').withArgs(transaction);

    sandbox.stub(DBUtil, 'commitTransaction').withArgs(transaction);

    sandbox.stub(XerceCaseListingService.prototype, 'refreshCaseListing');

    sandbox
      .stub(XerceCaseHistoryService.prototype, 'createForcedAbatementHistory')
      .withArgs(
        CaseHistoryActions.FORCED_ABATEMENT_ACTIVITY_ADDED,
        agencyId,
        userId,
        xerceCaseId,
        transaction,
        configForcedAbatementActivities.label
      )
      .resolves(null);

    sandbox
      .stub(ConfigForcedAbatementActivityService.prototype, 'getAll')
      .withArgs(agencyId)
      .resolves(configForcedAbatementActivities);

    sandbox
      .stub(db.XerceCaseForcedAbatementActivity, 'create')
      .withArgs(activity);

    sandbox
      .stub(XerceCaseService.prototype, 'setUpdatedAt')
      .withArgs(agencyId, xerceCaseId);

    sandbox
      .stub(XerceCaseForcedAbatementService.prototype, 'get')
      .withArgs(agencyId, xerceCaseId)
      .resolves(forcedAbatement);

    const result = await new XerceCaseForcedAbatementService().addActivity(
      agencyId,
      userId,
      xerceCaseId,
      forcedAbatementActivityId,
      forcedAbatementActivityReq
    );

    expect(result).to.deep.equal(forcedAbatement, 'response did not match');
  });
});

describe('xerceCaseForcedAbatement Service: editActivity method', () => {
  let sandbox;
  const agencyId = 1;
  const xerceCaseId = 1;
  const activityId = 11;
  let forcedAbatement: IXerceCaseForcedAbatement;
  let xerceCaseFAA;
  let requestBody: object;
  let transaction;
  const updatedBy = 100;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    transaction = sinon.stub();

    forcedAbatement = {
      initiatedAt: new Date('2019-02-16T06:29:32.814Z'),
      initiatedBy: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
      },
      note: {
        id: 1,
        noteContent: 'Forced abatement initiated.',
        createdBy: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
        },
        createdAt: new Date('2018-04-18T06:14:50.572Z'),
        updatedBy: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
        },
        updatedAt: new Date('2018-04-18T06:14:50.572Z'),
      },
      activities: [],
    };

    requestBody = {
      '1': '2018-04-10T06:14:50.572Z',
      '2': 'Forced Abated',
    };

    xerceCaseFAA = {
      id: activityId,
      activityFieldsValues: {
        '1': '2018-04-18T06:14:50.572Z',
        '2': 'Forced Abated',
      },
      save: () => Promise.resolve(),
    };
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return the forced abtement on case after updating', async () => {
    sandbox
      .stub(db.XerceCaseForcedAbatementActivity, 'findOne')
      .withArgs({
        where: {
          agencyId,
          xerceCaseId,
          id: activityId,
        },
        attributes: ['id', 'configFAAId', 'activityFieldsValues'],
      })
      .resolves(xerceCaseFAA);

    sandbox
      .stub(XerceCaseHistoryService.prototype, 'createForcedAbatementHistory')
      .withArgs(
        CaseHistoryActions.FORCED_ABATEMENT_ACTIVITY_EDITED,
        agencyId,
        updatedBy,
        xerceCaseId,
        transaction,
        requestBody,
        xerceCaseFAA
      )
      .resolves(null);

    sandbox.stub(DBUtil, 'createTransaction').resolves(transaction);

    sandbox.stub(DBUtil, 'rollbackTransaction').withArgs(transaction);

    sandbox.stub(DBUtil, 'commitTransaction').withArgs(transaction);

    sandbox.stub(XerceCaseListingService.prototype, 'refreshCaseListing');

    sandbox
      .stub(XerceCaseService.prototype, 'setUpdatedAt')
      .withArgs(agencyId, xerceCaseId, transaction);

    sandbox
      .stub(XerceCaseForcedAbatementService.prototype, 'get')
      .withArgs(agencyId, xerceCaseId)
      .resolves(forcedAbatement);

    const result = await new XerceCaseForcedAbatementService().editActivity(
      agencyId,
      xerceCaseId,
      activityId,
      updatedBy,
      requestBody
    );

    expect(result).to.deep.equal(forcedAbatement, 'response did not match');
  });

  it('Should throw error for invalid activity id', async () => {
    sandbox
      .stub(db.XerceCaseForcedAbatementActivity, 'findOne')
      .withArgs({
        where: {
          agencyId,
          xerceCaseId,
          id: activityId,
        },
        attributes: ['id', 'configFAAId', 'activityFieldsValues'],
      })
      .resolves(null);

    sandbox
      .stub(XerceCaseHistoryService.prototype, 'createForcedAbatementHistory')
      .withArgs(
        CaseHistoryActions.FORCED_ABATEMENT_ACTIVITY_EDITED,
        agencyId,
        updatedBy,
        xerceCaseId,
        transaction,
        requestBody,
        xerceCaseFAA
      )
      .resolves(null);

    sandbox
      .stub(XerceCaseService.prototype, 'setUpdatedAt')
      .withArgs(agencyId, xerceCaseId, transaction);

    sandbox
      .stub(XerceCaseForcedAbatementService.prototype, 'get')
      .withArgs(agencyId, xerceCaseId)
      .resolves(forcedAbatement);

    await new XerceCaseForcedAbatementService()
      .editActivity(agencyId, xerceCaseId, activityId, updatedBy, requestBody)
      .catch(err => expect(err.name).to.equal('InvalidRequestError'));
  });

  it('Should throw error while fetching FAA', async () => {
    sandbox
      .stub(db.XerceCaseForcedAbatementActivity, 'findOne')
      .withArgs({
        where: {
          agencyId,
          xerceCaseId,
          id: activityId,
        },
        attributes: ['id', 'configFAAId', 'activityFieldsValues'],
      })
      .throws('Error');

    sandbox
      .stub(XerceCaseHistoryService.prototype, 'createForcedAbatementHistory')
      .withArgs(
        CaseHistoryActions.FORCED_ABATEMENT_ACTIVITY_EDITED,
        agencyId,
        updatedBy,
        xerceCaseId,
        transaction,
        requestBody,
        xerceCaseFAA
      )
      .resolves(null);

    sandbox
      .stub(XerceCaseService.prototype, 'setUpdatedAt')
      .withArgs(agencyId, xerceCaseId, transaction);

    sandbox
      .stub(XerceCaseForcedAbatementService.prototype, 'get')
      .withArgs(agencyId, xerceCaseId)
      .resolves(forcedAbatement);

    await new XerceCaseForcedAbatementService()
      .editActivity(agencyId, xerceCaseId, activityId, updatedBy, requestBody)
      .catch(err => expect(err.name).to.equal('InternalServerError'));
  });

  it('Should throw error while saving FAA', async () => {
    xerceCaseFAA = {
      id: activityId,
      activityFieldsValues: {
        '1': '2018-04-18T06:14:50.572Z',
        '2': 'Forced Abated',
      },
      save: () => Promise.reject(),
    };

    sandbox
      .stub(XerceCaseHistoryService.prototype, 'createForcedAbatementHistory')
      .withArgs(
        CaseHistoryActions.FORCED_ABATEMENT_ACTIVITY_EDITED,
        agencyId,
        updatedBy,
        xerceCaseId,
        transaction,
        requestBody,
        xerceCaseFAA
      )
      .resolves(null);

    sandbox
      .stub(db.XerceCaseForcedAbatementActivity, 'findOne')
      .withArgs({
        where: {
          agencyId,
          xerceCaseId,
          id: activityId,
        },
        attributes: ['id', 'configFAAId', 'activityFieldsValues'],
      })
      .resolves(xerceCaseFAA);

    sandbox
      .stub(XerceCaseService.prototype, 'setUpdatedAt')
      .withArgs(agencyId, xerceCaseId, transaction);

    sandbox
      .stub(XerceCaseForcedAbatementService.prototype, 'get')
      .withArgs(agencyId, xerceCaseId)
      .resolves(forcedAbatement);

    await new XerceCaseForcedAbatementService()
      .editActivity(agencyId, xerceCaseId, activityId, updatedBy, requestBody)
      .catch(err => expect(err.name).to.equal('InternalServerError'));
  });
});

describe('xerceCaseForcedAbatement Service: Delete Forced Abatement Activity', () => {
  let sandbox;
  const agencyId = 1;
  const userId = 1;
  const xerceCaseId = 1;
  let activityResponse;
  let forcedAbatementActivityId = 1;
  let forcedAbatement: IXerceCaseForcedAbatement;
  let transaction;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    transaction = sinon.stub();
    activityResponse = {
      id: 1,
      xerceCaseId: 1,
      status: 'OPEN',
      customForcedAbatementFieldValues: {
        1: '1234',
        2: '2019-09-11T07:00:00.000Z',
      },
    };
    forcedAbatement = {
      initiatedAt: new Date('2019-02-16T06:29:32.814Z'),
      initiatedBy: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
      },
      note: {
        id: 1,
        noteContent: 'Forced abatement initiated.',
        createdBy: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
        },
        createdAt: new Date('2018-04-18T06:14:50.572Z'),
        updatedBy: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
        },
        updatedAt: new Date('2018-04-18T06:14:50.572Z'),
      },
      activities: [],
    };
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return the forced abtement on case after deleting activity', async () => {
    sandbox
      .stub(db.XerceCaseForcedAbatementActivity, 'findOne')
      .withArgs({
        where: {
          xerceCaseId,
          id: forcedAbatementActivityId,
        },
      })
      .resolves(activityResponse);

    sandbox
      .stub(XerceCaseHistoryService.prototype, 'createForcedAbatementHistory')
      .withArgs(
        CaseHistoryActions.FORCED_ABATEMENT_ACTIVITY_DELETED,
        agencyId,
        userId,
        xerceCaseId,
        transaction,
        activityResponse.configFAAId
      )
      .resolves(null);

    sandbox.stub(DBUtil, 'createTransaction').resolves(transaction);

    sandbox.stub(DBUtil, 'rollbackTransaction').withArgs(transaction);

    sandbox.stub(DBUtil, 'commitTransaction').withArgs(transaction);

    sandbox.stub(XerceCaseListingService.prototype, 'refreshCaseListing');

    sandbox.stub(db.XerceCaseForcedAbatementActivity, 'destroy').withArgs({
      where: {
        id: forcedAbatementActivityId,
      },
      transaction,
    });

    sandbox
      .stub(XerceCaseService.prototype, 'setUpdatedAt')
      .withArgs(agencyId, xerceCaseId);

    sandbox
      .stub(XerceCaseForcedAbatementService.prototype, 'get')
      .withArgs(agencyId, xerceCaseId)
      .resolves(forcedAbatement);

    const result = await new XerceCaseForcedAbatementService().deleteActivity(
      agencyId,
      userId,
      xerceCaseId,
      forcedAbatementActivityId
    );

    expect(result).to.deep.equal(forcedAbatement, 'response did not match');
  });

  it('Should throw error when invalid forceAbatementActivityId provided', async () => {
    forcedAbatementActivityId = 100;

    sandbox
      .stub(XerceCaseHistoryService.prototype, 'createForcedAbatementHistory')
      .withArgs(
        CaseHistoryActions.FORCED_ABATEMENT_ACTIVITY_DELETED,
        agencyId,
        userId,
        xerceCaseId,
        transaction,
        activityResponse.configFAAId
      )
      .resolves(null);

    sandbox
      .stub(db.XerceCaseForcedAbatementActivity, 'findOne')
      .withArgs({
        where: {
          xerceCaseId,
          id: forcedAbatementActivityId,
        },
      })
      .resolves(activityResponse);

    sandbox.stub(DBUtil, 'createTransaction').resolves(transaction);

    sandbox.stub(DBUtil, 'rollbackTransaction').withArgs(transaction);

    sandbox.stub(DBUtil, 'commitTransaction').withArgs(transaction);

    sandbox.stub(XerceCaseListingService.prototype, 'refreshCaseListing');

    sandbox.stub(db.XerceCaseForcedAbatementActivity, 'destroy').withArgs({
      where: {
        id: forcedAbatementActivityId,
      },
      transaction,
    });

    sandbox
      .stub(XerceCaseForcedAbatementService.prototype, 'get')
      .withArgs(agencyId, xerceCaseId)
      .resolves(forcedAbatement);

    await new XerceCaseForcedAbatementService()
      .deleteActivity(agencyId, userId, xerceCaseId, forcedAbatementActivityId)
      .catch(err => expect(err.name).to.equal('InvalidRequestError'));
  });
});

describe('xerceCaseForcedAbatement Service: disableFARecommendation method', () => {
  let sandbox;
  const agencyId = 1;
  const xerceCaseId = 1;
  let xerceCase;
  const responseBody: IRecommendFAMetadata = {
    isEligible: false,
    notice: null,
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    xerceCase = {
      id: xerceCaseId,
      agencyId,
      assigneeId: 11,
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
      forcedAbatementInitiatedAt: null,
      forcedAbatementInitiatedBy: null,
      forcedAbatementNoteId: null,
      createdByUser: 11,
      closedByUser: null,
      closedAt: null,
      createdAt: new Date('2019-02-16T06:29:32.814Z'),
      updatedAt: new Date('2019-02-16T06:29:32.814Z'),
      save: () => Promise.resolve(),
    };
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return the fa metadata after disabling fa recommendation', async () => {
    sandbox
      .stub(XerceCaseService.prototype, 'getRecord')
      .withArgs(agencyId, xerceCaseId)
      .resolves(xerceCase);

    const result = await new XerceCaseForcedAbatementService().disableFARecommendation(
      agencyId,
      xerceCaseId
    );

    expect(result).to.deep.equal(responseBody, 'response did not match');
  });

  it('Should throw error when disabling fa recommendation', async () => {
    xerceCase = {
      id: xerceCaseId,
      agencyId,
      assigneeId: 11,
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
      forcedAbatementInitiatedAt: null,
      forcedAbatementInitiatedBy: null,
      forcedAbatementNoteId: null,
      createdByUser: 11,
      closedByUser: null,
      closedAt: null,
      createdAt: new Date('2019-02-16T06:29:32.814Z'),
      updatedAt: new Date('2019-02-16T06:29:32.814Z'),
      save: () => Promise.reject(),
    };

    sandbox
      .stub(XerceCaseService.prototype, 'getRecord')
      .withArgs(agencyId, xerceCaseId)
      .resolves(xerceCase);

    await new XerceCaseForcedAbatementService()
      .disableFARecommendation(agencyId, xerceCaseId)
      .catch(err => expect(err.name).to.equal('InternalServerError'));
  });
});
