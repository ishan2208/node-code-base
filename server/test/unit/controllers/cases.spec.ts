import 'mocha';

import { expect } from 'chai';
import * as httpMocks from 'node-mocks-http';
import * as sinon from 'sinon';
import * as unroll from 'unroll';
import {
  create,
  deleteCase,
  get,
  getAll,
  reopen,
} from '../../../api/controllers/cases';
import {
  editCaseAssignee,
  getCaseAssignee,
} from '../../../api/controllers/xerceCaseAssignee';
import { AppError } from '../../../api/errors';
import XerceCaseService from '../../../api/service/xerce/xerceCase';
import XerceCaseAssigneeService from '../../../api/service/xerce/xerceCaseAssignee';
unroll.use(it);

describe('Cases Controller: Create Case', () => {
  let sandbox;
  const agencyId = 1;
  const caseId = 2;
  const userId = 3;
  let caseRequest: ICaseRequest;

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

  let response;
  let responseBody;
  let request;
  let errorMessage;
  let caseUser: ICaseUser;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    caseUser = {
      id: userId,
      firstName: 'John',
      lastName: 'Doe',
    };

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
              updatedBy: {
                id: userId,
                firstName: 'John',
                lastName: 'Doe',
              },
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

    request = httpMocks.createRequest({
      method: 'POST',
      url: '/xerce/cases',
      swagger: {
        params: {
          id: {
            value: caseId,
          },
          body: {
            value: caseRequest,
          },
        },
      },
      user,
    });

    response = httpMocks.createResponse();

    errorMessage = 'Error occurred while creating case';
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 201 with case details', async () => {
    sandbox
      .stub(XerceCaseService.prototype, 'create')
      .withArgs(agencyId, user, caseRequest)
      .resolves(Object.assign({}, responseBody));

    await create(request, response);

    expect(response.statusCode).to.equal(201);
    expect(JSON.parse(response._getData())).to.deep.equal(
      responseBody,
      'response body did not match'
    );
  });

  it('Should return status code 400 with error message', async () => {
    sandbox
      .stub(XerceCaseService.prototype, 'create')
      .withArgs(agencyId, user, caseRequest)
      .throws(new AppError('Error occurred while creating case', 400));

    await create(request, response);

    expect(response.statusCode).to.equal(400);
    expect(JSON.parse(response._getData())).to.deep.equal(
      { message: errorMessage },
      'response body did not match'
    );
  });
});

describe('Cases Controller: Get Case', () => {
  let sandbox;
  const agencyId = 1;
  const caseId = 2;
  const userId = 3;

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

  let response;
  let responseBody;
  let request;
  let errorMessage;
  let caseUser: ICaseUser;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    caseUser = {
      id: userId,
      firstName: 'John',
      lastName: 'Doe',
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
              updatedBy: {
                id: userId,
                firstName: 'John',
                lastName: 'Doe',
              },
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

    request = httpMocks.createRequest({
      method: 'GET',
      url: '/xerce/cases',
      swagger: {
        params: {
          caseId: {
            value: caseId,
          },
        },
      },
      user,
    });

    response = httpMocks.createResponse();

    errorMessage = 'Error occurred while fetching case details';
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 with case details', async () => {
    sandbox
      .stub(XerceCaseService.prototype, 'get')
      .withArgs(agencyId, caseId, user.agencyTimezone)
      .returns(Object.assign({}, responseBody));

    await get(request, response);

    expect(response.statusCode).to.equal(200);
    expect(JSON.parse(response._getData())).to.deep.equal(
      responseBody,
      'response body did not match'
    );
  });

  it('Should return status code 400 with error message', async () => {
    sandbox
      .stub(XerceCaseService.prototype, 'get')
      .withArgs(agencyId, caseId, user.agencyTimezone)
      .throws(new AppError('Error occurred while fetching case details', 400));

    await get(request, response);

    expect(response.statusCode).to.equal(400);
    expect(JSON.parse(response._getData())).to.deep.equal(
      { message: errorMessage },
      'response body did not match'
    );
  });
});

describe('Cases Controller: Get All Cases', () => {
  let sandbox;
  let xerceCases;
  //const agencyId = 1;
  const userId = 3;

  const queryParams: ICaseListQueryParams = {
    caseAssigneeId: 22,
    caseStatus: CaseStatusFilter.CLOSED,
    openAbatementStages: [AbatementStage.VERIFICATION_PENDING],
    closedAbatementStages: [AbatementStage.INVALID],
    searchQuery: 'CE-19',
    violationIds: [1],
    contactIds: [1],
    violationTypeIds: [11],
    forcedAbatementActivityIds: [1],
    createdCaseStartDate: new Date('2018-07-14T06:10:30.171Z'),
    createdCaseEndDate: new Date('2018-07-14T06:10:30.171Z'),
    nextScheduledInspectionStartDate: new Date('2018-07-14T06:10:30.171Z'),
    nextScheduledInspectionEndDate: new Date('2018-07-14T06:10:30.171Z'),
    closedCaseStartDate: new Date('2018-07-14T06:10:30.171Z'),
    closedCaseEndDate: new Date('2018-07-14T06:10:30.171Z'),
    lastCompletedInspectionStartDate: new Date('2018-07-14T06:10:30.171Z'),
    lastCompletedInspectionEndDate: new Date('2018-07-14T06:10:30.171Z'),
    inspectionAssigneeIds: [100],
    limit: 50,
    offset: 0,
    minHours: 1.15,
    maxHours: 2.01,
    sortBy: CaseListSortParams.CASE_STATUS,
    sortOrder: SortOrder.ASC,
  };

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

  let response;
  let responseBody;
  let request;
  let errorMessage;
  let caseUser: ICaseUser;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    caseUser = {
      id: userId,
      firstName: 'John',
      lastName: 'Doe',
    };

    xerceCases = [
      {
        id: 101,
        caseNumber: 'CE-19-1',
        status: 'OPEN',
        location: '547,Alabama, Alabama, AL, 94016',
        hoursLogged: 1.55,
        caseAssignee: caseUser,
        createdAt: '2019-02-16T06:29:32.814Z',
        closedAt: null,
        inspectionAssignee: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
        },
        nextScheduledInspection: null,
        lastCompletedInspection: '2019-04-04T17:51:09.851Z',
        violationTypes: [
          {
            id: 11,
            label: 'Animal',
            iconURL: 'https://app-stage.comcateprime.com/icons/animal.png',
          },
        ],
        violations: [
          {
            id: 1,
            label: 'Animal Control',
          },
        ],
      },
      {
        id: 102,
        caseNumber: 'CE-19-2',
        status: 'OPEN',
        location: '547,Alabama, Alabama, AL, 94016',
        hoursLogged: 1.75,
        caseAssignee: caseUser,
        createdAt: '2019-02-16T06:29:32.814Z',
        closedAt: null,
        inspectionAssignee: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
        },
        nextScheduledInspection: null,
        lastCompletedInspection: '2019-04-04T17:51:09.851Z',
        violationTypes: [
          {
            id: 11,
            label: 'Animal',
            iconURL: 'https://app-stage.comcateprime.com/icons/animal.png',
          },
        ],
        violations: [
          {
            id: 1,
            label: 'Animal Control',
          },
        ],
      },
      {
        id: 103,
        caseNumber: 'CE-19-3',
        status: 'OPEN',
        location: '547,Alabama, Alabama, AL, 94016',
        hoursLogged: 1.94,
        caseAssignee: caseUser,
        createdAt: '2019-02-16T06:29:32.814Z',
        closedAt: null,
        inspectionAssignee: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
        },
        nextScheduledInspection: null,
        lastCompletedInspection: '2019-04-04T17:51:09.851Z',
        violationTypes: [
          {
            id: 12,
            label: 'Vehicle',
            iconURL: 'https://app-stage.comcateprime.com/icons/vehicle.png',
          },
        ],
        violations: [
          {
            id: 2,
            label: 'Vehicle Control',
          },
        ],
      },
    ];

    responseBody = {
      count: 3,
      data: xerceCases,
    };

    request = httpMocks.createRequest({
      method: 'GET',
      url: '/xerce/cases',
      swagger: {
        params: {
          caseAssigneeId: {
            value: queryParams.caseAssigneeId,
          },
          caseStatus: {
            value: queryParams.caseStatus,
          },
          openAbatementStages: {
            value: queryParams.openAbatementStages,
          },
          closedAbatementStages: {
            value: queryParams.closedAbatementStages,
          },
          violationIds: {
            value: queryParams.violationIds,
          },
          contactIds: {
            value: queryParams.contactIds,
          },
          violationTypeIds: {
            value: queryParams.violationTypeIds,
          },
          inspectionAssigneeIds: {
            value: queryParams.inspectionAssigneeIds,
          },
          forcedAbatementActivityIds: {
            value: queryParams.forcedAbatementActivityIds,
          },
          createdCaseStartDate: {
            value: queryParams.createdCaseStartDate,
          },
          createdCaseEndDate: {
            value: queryParams.closedCaseEndDate,
          },
          closedCaseStartDate: {
            value: queryParams.closedCaseStartDate,
          },
          closedCaseEndDate: {
            value: queryParams.closedCaseEndDate,
          },
          nextScheduledInspectionStartDate: {
            value: queryParams.nextScheduledInspectionStartDate,
          },
          nextScheduledInspectionEndDate: {
            value: queryParams.nextScheduledInspectionEndDate,
          },
          lastCompletedInspectionStartDate: {
            value: queryParams.lastCompletedInspectionStartDate,
          },
          lastCompletedInspectionEndDate: {
            value: queryParams.lastCompletedInspectionEndDate,
          },
          minHours: {
            value: queryParams.minHours,
          },
          maxHours: {
            value: queryParams.maxHours,
          },
          q: {
            value: queryParams.searchQuery,
          },
          sortBy: {
            value: queryParams.sortBy,
          },
          sortOrder: {
            value: queryParams.sortOrder,
          },
          limit: {
            value: queryParams.limit,
          },
          offset: {
            value: queryParams.offset,
          },
        },
      },
      user,
    });

    response = httpMocks.createResponse();

    errorMessage = 'Error occurred while fetching all case details';
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 with case details', async () => {
    const getAllCases = sandbox.stub(XerceCaseService.prototype, 'getAll');
    getAllCases.returns(Object.assign({}, responseBody));

    await getAll(request, response);

    expect(response.statusCode).to.equal(200);
    expect(JSON.parse(response._getData())).to.deep.equal(
      responseBody,
      'response body did not match'
    );
  });

  it('Should return status code 400 with error message', async () => {
    const getAllCases = sandbox.stub(XerceCaseService.prototype, 'getAll');
    getAllCases.throws(
      new AppError('Error occurred while fetching all case details', 400)
    );

    await getAll(request, response);

    expect(response.statusCode).to.equal(400);
    expect(JSON.parse(response._getData())).to.deep.equal(
      { message: errorMessage },
      'response body did not match'
    );
  });
});

describe('Cases Controller: editCaseAssignee Method', () => {
  let sandbox;
  const agencyId = 1;
  const userId = 3;
  const xerceId = 5;
  const caseId = 10;
  let response;
  let responseBody: ICaseUser;
  let request;
  let requestBody: ICaseAssigneeEditRequest;

  const user: IAgencyUserClaim | ISuperAdminClaim = {
    id: userId,
    agencyId,
    agencyName: 'City of Alabama',
    email: 'john.doe@comcate.com',
    firstName: 'John',
    lastName: 'Doe',
    agencyTimezone: 'America/Los_Angeles',
    scopes: {
      superAdmin: true,
      xerce: {
        id: xerceId,
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

    requestBody = {
      assigneeId: userId,
    };

    responseBody = {
      id: userId,
      firstName: 'John',
      lastName: 'Doe',
    };

    request = httpMocks.createRequest({
      method: 'PUT',
      url: '/xerce/cases/10/assignees',
      swagger: {
        params: {
          caseId: {
            value: 10,
          },
          body: {
            value: requestBody,
          },
        },
      },
      user,
    });

    response = httpMocks.createResponse();
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 and return case user', async () => {
    sandbox
      .stub(XerceCaseAssigneeService.prototype, 'editCaseAssignee')
      .withArgs(agencyId, user.id, caseId, requestBody)
      .returns(responseBody);

    await editCaseAssignee(request, response);

    expect(response.statusCode).to.equal(200);
    expect(JSON.parse(response._getData())).to.deep.equal(
      responseBody,
      'response body did not match'
    );
  });

  it('Should throw error code 400 with error message', async () => {
    const errorMessage = 'Could not find the Xerce case.';
    sandbox
      .stub(XerceCaseAssigneeService.prototype, 'editCaseAssignee')
      .withArgs(agencyId, user.id, caseId, requestBody)
      .throws(new AppError(errorMessage, 400));

    await editCaseAssignee(request, response);

    expect(response.statusCode).to.equal(400);
    expect(JSON.parse(response._getData())).to.deep.equal(
      { message: errorMessage },
      'response body did not match'
    );
  });
});

describe('Cases Controller: getCaseAssignee Method', () => {
  let sandbox;
  const agencyId = 1;
  const userId = 3;
  const xerceId = 5;
  const caseId = 10;
  let response;
  let responseBody: ICaseUser;
  let request;

  const user: IAgencyUserClaim | ISuperAdminClaim = {
    id: userId,
    agencyId,
    agencyName: 'City of Alabama',
    email: 'john.doe@comcate.com',
    firstName: 'John',
    lastName: 'Doe',
    agencyTimezone: 'America/Los_Angeles',
    scopes: {
      superAdmin: true,
      xerce: {
        id: xerceId,
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

    responseBody = {
      id: userId,
      firstName: 'John',
      lastName: 'Doe',
    };

    request = httpMocks.createRequest({
      method: 'GET',
      url: '/xerce/cases/10/assignees',
      swagger: {
        params: {
          caseId: {
            value: 10,
          },
        },
      },
      user,
    });

    response = httpMocks.createResponse();
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 and return case user', async () => {
    sandbox
      .stub(XerceCaseAssigneeService.prototype, 'getCaseAssignee')
      .withArgs(agencyId, caseId)
      .returns(responseBody);

    await getCaseAssignee(request, response);

    expect(response.statusCode).to.equal(200);
    expect(JSON.parse(response._getData())).to.deep.equal(
      responseBody,
      'response body did not match'
    );
  });

  it('Should throw error code 400 with error message', async () => {
    const errorMessage = 'Could not find the Xerce case.';
    sandbox
      .stub(XerceCaseAssigneeService.prototype, 'getCaseAssignee')
      .withArgs(agencyId, caseId)
      .throws(new AppError(errorMessage, 400));

    await getCaseAssignee(request, response);

    expect(response.statusCode).to.equal(400);
    expect(JSON.parse(response._getData())).to.deep.equal(
      { message: errorMessage },
      'response body did not match'
    );
  });
});

describe('Cases Controller: reopen method', () => {
  let sandbox;
  const agencyId = 1;
  const caseId = 2;
  const userId = 3;

  const reopenCaseRequest = {
    inspection: {
      plannedDate: new Date('2019-02-16T06:29:32.814Z'),
      assigneeId: 1,
    },
    openViolationIds: [1],
  };

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

  let response;
  let responseBody;
  let request;
  let caseUser: ICaseUser;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    caseUser = {
      id: userId,
      firstName: 'John',
      lastName: 'Doe',
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
              updatedBy: {
                id: userId,
                firstName: 'John',
                lastName: 'Doe',
              },
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
                'https://cyberdyne-poc.s3.amazonaws.com/dev/agency_0/system_icon/animal.png',
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
            'https://cyberdyne-poc.s3.ap-south-1.amazonaws.com/dev/agency_1/cases/case_3/attachments/Screenshot_from_2018_04_24_11_58_46_1530600092122__1_.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAIQB2HFNFBN2PUWPQ%2F20180711%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20180711T061030Z&X-Amz-Expires=18000&X-Amz-Signature=9d97e1ca0ea07ef6b14c85f8390dd17fb7e8754a166443e9be3f1c38e9e262b2&X-Amz-SignedHeaders=host',
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

    request = httpMocks.createRequest({
      method: 'POST',
      url: '/xerce/cases/{caseId}/reopen',
      swagger: {
        params: {
          body: {
            value: reopenCaseRequest,
          },
          caseId: {
            value: caseId,
          },
        },
      },
      user,
    });

    response = httpMocks.createResponse();
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 with case details', async () => {
    sandbox
      .stub(XerceCaseService.prototype, 'reopen')
      .withArgs(agencyId, caseId, user, reopenCaseRequest)
      .resolves(Object.assign({}, responseBody));

    await reopen(request, response);

    expect(response.statusCode).to.equal(200);
    expect(JSON.parse(response._getData())).to.deep.equal(
      responseBody,
      'response body did not match'
    );
  });

  it('Should return status code 400 with error message', async () => {
    sandbox
      .stub(XerceCaseService.prototype, 'reopen')
      .withArgs(agencyId, caseId, user, reopenCaseRequest)
      .throws(new AppError('Error occurred while reopening case', 400));

    await reopen(request, response);

    expect(response.statusCode).to.equal(400);
    expect(JSON.parse(response._getData())).to.deep.equal(
      { message: 'Error occurred while reopening case' },
      'response body did not match'
    );
  });
});

describe('Cases Controller: deleteCase method', () => {
  let sandbox;
  const agencyId = 1;
  const caseId = 2;
  const userId = 3;

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

  let response;
  let responseBody;
  let request;
  let errorMessage;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    responseBody = {
      response: 'ok',
    };

    request = httpMocks.createRequest({
      method: 'DELETE',
      url: '/xerce/cases',
      swagger: {
        params: {
          caseId: {
            value: caseId,
          },
        },
      },
      user,
    });

    response = httpMocks.createResponse();

    errorMessage = 'Error occurred while deleting case';
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 with case details', async () => {
    sandbox
      .stub(XerceCaseService.prototype, 'delete')
      .withArgs(agencyId, caseId);

    await deleteCase(request, response);

    expect(response.statusCode).to.equal(200);
    expect(JSON.parse(response._getData())).to.deep.equal(
      responseBody,
      'response body did not match'
    );
  });

  it('Should return status code 400 with error message', async () => {
    sandbox
      .stub(XerceCaseService.prototype, 'delete')
      .withArgs(agencyId, caseId)
      .throws(new AppError('Error occurred while deleting case', 400));

    await deleteCase(request, response);

    expect(response.statusCode).to.equal(400);
    expect(JSON.parse(response._getData())).to.deep.equal(
      { message: errorMessage },
      'response body did not match'
    );
  });
});
