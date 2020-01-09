import { expect } from 'chai';
import 'mocha';
import * as httpMocks from 'node-mocks-http';
import * as sinon from 'sinon';

import {
  addActivity,
  deleteActivity,
  disableFARecommendation,
  edit,
  editActivity,
  initiate,
} from '../../../../api/controllers/xerce/xerceCaseForcedAbatement';
import { AppError } from '../../../../api/errors';
import XerceCaseForcedAbatementService from '../../../../api/service/xerce/xerceCaseForcedAbatement';

describe('xerceCaseForcedAbatement controller: initiate method', () => {
  let responseBody;
  let request;
  let requestBody: INoteRequest;
  let response;
  let sandbox;
  const agencyId = 1;
  const caseId = 2;

  const authScope = {
    comcateAdmin: true,
    siteAdmin: true,
  };

  const userProfile = {
    id: 5,
    agencyId,
    firstName: 'John',
    middleName: 'John',
    lastName: 'Doe',
    email: 'John.doe@alabama.com',
    scopes: authScope,
  };

  const caseUser = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    requestBody = {
      noteContent: '1234567890',
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
      forcedAbatement: {
        initiatedAt: '2019-02-16T06:29:32.814Z',
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
          createdAt: '2018-04-18T06:14:50.572Z',
          updatedBy: {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
          },
          updatedAt: '2018-04-18T06:14:50.572Z',
        },
        activities: [],
      },
      caseActivities: [],
      caseNotices: [],
      closedAt: null,
      updatedBy: caseUser,
    };

    request = httpMocks.createRequest({
      method: 'POST',
      url: '/xerce/cases/{caseId}/forced-abatement',
      swagger: {
        params: {
          caseId: {
            value: caseId,
          },
          body: {
            value: requestBody,
          },
        },
      },
      user: userProfile,
    });

    response = httpMocks.createResponse();
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return the case after initiating forced abatement', async () => {
    sandbox
      .stub(XerceCaseForcedAbatementService.prototype, 'initiate')
      .withArgs(agencyId, caseId, userProfile, requestBody)
      .resolves(responseBody);

    await initiate(request, response);

    expect(response.statusCode).to.equal(200);
    expect(JSON.parse(response._getData())).to.deep.equal(
      responseBody,
      'response body did not match'
    );
  });

  it('Should throw error for re initiating FA', async () => {
    const errorMessage = 'Invalid Request. Forced abatement already initiated';
    sandbox
      .stub(XerceCaseForcedAbatementService.prototype, 'initiate')
      .withArgs(agencyId, caseId, userProfile, requestBody)
      .throws(
        new AppError('Invalid Request. Forced abatement already initiated', 400)
      );

    await initiate(request, response);

    expect(response.statusCode).to.equal(400);
    expect(JSON.parse(response._getData())).to.deep.equal(
      { message: errorMessage },
      'response body did not match'
    );
  });
});

describe('xerceCaseForcedAbatement controller: edit method', () => {
  let responseBody;
  let request;
  let requestBody: INoteRequest;
  let response;
  let sandbox;
  const agencyId = 1;
  const caseId = 2;
  const noteId = 22;

  const authScope = {
    comcateAdmin: true,
    siteAdmin: true,
  };

  const userProfile = {
    id: 5,
    agencyId,
    firstName: 'John',
    middleName: 'John',
    lastName: 'Doe',
    email: 'John.doe@alabama.com',
    scopes: authScope,
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    requestBody = {
      noteContent: 'FAA note edited',
    };

    responseBody = {
      initiatedAt: '2019-02-16T06:29:32.814Z',
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
        createdAt: '2018-04-18T06:14:50.572Z',
        updatedBy: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
        },
        updatedAt: '2018-04-18T06:14:50.572Z',
      },
      activities: [],
    };

    request = httpMocks.createRequest({
      method: 'PUT',
      url: '/xerce/cases/{caseId}/forced-abatement/notes/{noteId}',
      swagger: {
        params: {
          caseId: {
            value: caseId,
          },
          noteId: {
            value: noteId,
          },
          body: {
            value: requestBody,
          },
        },
      },
      user: userProfile,
    });

    response = httpMocks.createResponse();
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return the forced abatement after editing note', async () => {
    sandbox
      .stub(XerceCaseForcedAbatementService.prototype, 'edit')
      .withArgs(agencyId, caseId, noteId, userProfile, requestBody)
      .resolves(responseBody);

    await edit(request, response);

    expect(response.statusCode).to.equal(200);
    expect(JSON.parse(response._getData())).to.deep.equal(
      responseBody,
      'response body did not match'
    );
  });

  it('Should throw error while editing FA note', async () => {
    const errorMessage = 'Invalid Request. Forced abatement not initiated';

    sandbox
      .stub(XerceCaseForcedAbatementService.prototype, 'edit')
      .withArgs(agencyId, caseId, noteId, userProfile, requestBody)
      .throws(
        new AppError('Invalid Request. Forced abatement not initiated', 400)
      );

    await edit(request, response);

    expect(response.statusCode).to.equal(400);
    expect(JSON.parse(response._getData())).to.deep.equal(
      { message: errorMessage },
      'response body did not match'
    );
  });
});

describe('xerceCaseForcedAbatement controller: Create Activity', () => {
  let responseBody;
  let requestBody;
  let request;
  let response;
  let sandbox;
  const agencyId = 1;
  const caseId = 2;
  const activityId = 1;
  const authScope = {
    comcateAdmin: true,
    siteAdmin: true,
  };

  const userProfile = {
    id: 5,
    agencyId,
    firstName: 'John',
    middleName: 'John',
    lastName: 'Doe',
    email: 'John.doe@alabama.com',
    scopes: authScope,
  };
  beforeEach(async () => {
    sandbox = sinon.createSandbox();

    requestBody = {
      1: '1123',
      2: new Date('2019-02-16T06:29:32.814Z'),
    };

    responseBody = {
      initiatedAt: '2019-02-16T06:29:32.814Z',
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
        createdAt: '2018-04-18T06:14:50.572Z',
        updatedBy: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
        },
        updatedAt: '2018-04-18T06:14:50.572Z',
      },
      activities: [],
    };

    request = httpMocks.createRequest({
      method: 'POST',
      url: '/xerce/cases/{caseId}/forced-abatement/activities/{activityId}',
      swagger: {
        params: {
          caseId: {
            value: caseId,
          },
          activityId: {
            value: activityId,
          },
          body: {
            value: requestBody,
          },
        },
      },
      user: userProfile,
    });

    response = httpMocks.createResponse();
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return with status 201 after creating activity', async () => {
    sandbox
      .stub(XerceCaseForcedAbatementService.prototype, 'addActivity')
      .withArgs(agencyId, caseId, activityId, userProfile)
      .resolves(responseBody);

    await addActivity(request, response);

    expect(response.statusCode).to.equal(201);
  });
});

describe('xerceCaseForcedAbatement controller: editActivity method', () => {
  let responseBody;
  let request;
  let requestBody: object;
  let response;
  let sandbox;
  const agencyId = 1;
  const caseId = 2;
  const caseActivityId = 3;

  const authScope = {
    comcateAdmin: true,
    siteAdmin: true,
  };

  const userProfile = {
    id: 5,
    agencyId,
    firstName: 'John',
    middleName: 'John',
    lastName: 'Doe',
    email: 'John.doe@alabama.com',
    scopes: authScope,
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    requestBody = {
      '1': 'AbatementInitiated',
      '2': 'Forced',
    };

    responseBody = {
      initiatedAt: '2019-02-16T06:29:32.814Z',
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
        createdAt: '2018-04-18T06:14:50.572Z',
        updatedBy: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
        },
        updatedAt: '2018-04-18T06:14:50.572Z',
      },
      activities: [],
    };

    request = httpMocks.createRequest({
      method: 'PUT',
      url: '/xerce/cases/{caseId}/forced-abatement/activities/{activityId}',
      swagger: {
        params: {
          caseId: {
            value: caseId,
          },
          activityId: {
            value: caseActivityId,
          },
          body: {
            value: requestBody,
          },
        },
      },
      user: userProfile,
    });

    response = httpMocks.createResponse();
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return the forced abatement after editing FAA', async () => {
    sandbox
      .stub(XerceCaseForcedAbatementService.prototype, 'editActivity')
      .withArgs(agencyId, caseId, caseActivityId, userProfile.id, requestBody)
      .resolves(responseBody);

    await editActivity(request, response);

    expect(response.statusCode).to.equal(200);
    expect(JSON.parse(response._getData())).to.deep.equal(
      responseBody,
      'response body did not match'
    );
  });

  it('Should throw error while editing FAA', async () => {
    const errorMessage =
      'Invalid Request. Forced abatement activity does not exist';

    sandbox
      .stub(XerceCaseForcedAbatementService.prototype, 'editActivity')
      .withArgs(agencyId, caseId, caseActivityId, userProfile.id, requestBody)
      .throws(
        new AppError(
          'Invalid Request. Forced abatement activity does not exist',
          400
        )
      );

    await editActivity(request, response);

    expect(response.statusCode).to.equal(400);
    expect(JSON.parse(response._getData())).to.deep.equal(
      { message: errorMessage },
      'response body did not match'
    );
  });
});

describe('xerceCaseForcedAbatement controller: Delete Activity', () => {
  let responseBody;
  let request;
  let response;
  let sandbox;
  const agencyId = 1;
  const caseId = 2;
  const activityId = 1;
  const authScope = {
    comcateAdmin: true,
    siteAdmin: true,
  };

  const userProfile = {
    id: 5,
    agencyId,
    firstName: 'John',
    middleName: 'John',
    lastName: 'Doe',
    email: 'John.doe@alabama.com',
    scopes: authScope,
  };
  beforeEach(async () => {
    sandbox = sinon.createSandbox();

    responseBody = {
      initiatedAt: '2019-02-16T06:29:32.814Z',
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
        createdAt: '2018-04-18T06:14:50.572Z',
        updatedBy: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
        },
        updatedAt: '2018-04-18T06:14:50.572Z',
      },
      activities: [],
    };

    request = httpMocks.createRequest({
      method: 'DELETE',
      url: '/xerce/cases/{caseId}/forced-abatement/activities/{activityId}',
      swagger: {
        params: {
          caseId: {
            value: caseId,
          },
          activityId: {
            value: activityId,
          },
        },
      },
      user: userProfile,
    });

    response = httpMocks.createResponse();
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return with status 200 after deleting activity', async () => {
    sandbox
      .stub(XerceCaseForcedAbatementService.prototype, 'deleteActivity')
      .withArgs(agencyId, caseId, activityId, userProfile)
      .resolves(responseBody);

    await deleteActivity(request, response);

    expect(response.statusCode).to.equal(201);
  });
});

describe('xerceCaseForcedAbatement controller: disableFARecommendation method', () => {
  let responseBody;
  let request;
  let response;
  let sandbox;
  const agencyId = 1;
  const caseId = 2;
  const authScope = {
    comcateAdmin: true,
    siteAdmin: true,
  };

  const userProfile = {
    id: 5,
    agencyId,
    firstName: 'John',
    middleName: 'John',
    lastName: 'Doe',
    email: 'John.doe@alabama.com',
    scopes: authScope,
  };

  beforeEach(async () => {
    sandbox = sinon.createSandbox();

    responseBody = {
      isEligible: true,
      notice: 'Final Notice',
    };

    request = httpMocks.createRequest({
      method: 'PUT',
      url: '/xerce/cases/{caseId}/forced-abatement/disable-fa-recommendation',
      swagger: {
        params: {
          caseId: {
            value: caseId,
          },
        },
      },
      user: userProfile,
    });

    response = httpMocks.createResponse();
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return with status 200 after disabling fa recommendation', async () => {
    sandbox
      .stub(
        XerceCaseForcedAbatementService.prototype,
        'disableFARecommendation'
      )
      .withArgs(agencyId, caseId)
      .resolves(responseBody);

    await disableFARecommendation(request, response);

    expect(response.statusCode).to.equal(200);
  });

  it('Should throw error while disabling FA recommendation', async () => {
    const errorMessage = 'Error while disabling fa recommendation';

    sandbox
      .stub(
        XerceCaseForcedAbatementService.prototype,
        'disableFARecommendation'
      )
      .withArgs(agencyId, caseId)
      .throws(new AppError('Error while disabling fa recommendation', 400));

    await disableFARecommendation(request, response);

    expect(response.statusCode).to.equal(400);
    expect(JSON.parse(response._getData())).to.deep.equal(
      { message: errorMessage },
      'response body did not match'
    );
  });
});
