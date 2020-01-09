import 'mocha';

import { expect } from 'chai';
import * as httpMocks from 'node-mocks-http';
import * as sinon from 'sinon';
import {
  edit,
  getCasesCountByLocation,
  getFlagHistory,
} from '../../../api/controllers/caseLocation';
import { AppError } from '../../../api/errors';
import LocationService from '../../../api/service/caseLocation';

describe('CaseLocation Controller: edit Method', () => {
  let sandbox;
  const agencyId = 1;
  const caseId = 1;
  let response;
  let responseBody;
  let request;
  let requestBody;

  let user: IAgencyUserClaim | ISuperAdminClaim;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

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

    responseBody = {
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
          updatedBy: {
            id: 6,
            firstName: 'John',
            lastName: 'Doe',
          },
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
              id: 6,
              firstName: 'John',
              lastName: 'Doe',
            },
            updatedAt: '2019-02-16T06:29:32.814Z',
          },
        ],
      },
    };

    requestBody = {
      streetAddress: '1666 14th Street',
      manualFields: {
        Ward: 'Ward I',
        Lot: 1,
        Block: 1,
      },
      isCDBGApproved: true,
      flagAddress: {
        isFlagged: false,
        reasonForFlagging: '',
      },
    };

    request = httpMocks.createRequest({
      method: 'PUT',
      url: '/xerce/cases/1/locations',
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
      user,
    });

    response = httpMocks.createResponse();
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 with case location details', async () => {
    sandbox
      .stub(LocationService.prototype, 'edit')
      .withArgs(agencyId, caseId, user.id, requestBody)
      .returns(Object.assign({}, responseBody));

    await edit(request, response);

    expect(response.statusCode).to.equal(200);
    expect(JSON.parse(response._getData())).to.deep.equal(
      responseBody,
      'response body did not match'
    );
  });

  it('Should return status code 400 with error message', async () => {
    const errorMessage = 'Error occured while editing case location';
    sandbox
      .stub(LocationService.prototype, 'edit')
      .withArgs(agencyId, caseId, user.id, requestBody)
      .throws(new AppError(errorMessage, 400));

    await edit(request, response);

    expect(response.statusCode).to.equal(400);
    expect(JSON.parse(response._getData())).to.deep.equal(
      { message: errorMessage },
      'response body did not match'
    );
  });
});

describe('CaseLocation Controller: getCasesCountByLocation Method', () => {
  let sandbox;
  const agencyId = 1;
  const streetAddress = '14th';
  const city = 'Oakland';
  const state = 'CA';
  const zip = '946';
  let response;
  let responseBody;
  let request;

  let user: IAgencyUserClaim | ISuperAdminClaim;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

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

    responseBody = {
      openCases: 2,
      closedCases: 3,
    };

    request = httpMocks.createRequest({
      method: 'GET',
      url:
        '/xerce/locations/associated-cases?streetAddress=14th&city=Oakland&state=CA&zip=946',
      swagger: {
        params: {
          streetAddress: {
            value: streetAddress,
          },
          city: {
            value: city,
          },
          state: {
            value: state,
          },
          zip: {
            value: zip,
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

  it('Should return status code 200 with case open/close counts', async () => {
    sandbox
      .stub(LocationService.prototype, 'getCasesCountByLocation')
      .withArgs(agencyId, streetAddress, city, state, zip)
      .returns(Object.assign({}, responseBody));

    await getCasesCountByLocation(request, response);

    expect(response.statusCode).to.equal(200);
    expect(JSON.parse(response._getData())).to.deep.equal(
      responseBody,
      'response body did not match'
    );
  });

  it('Should return status code 400 with error message', async () => {
    const errorMessage = 'Error occured while fetching case count by location.';
    sandbox
      .stub(LocationService.prototype, 'getCasesCountByLocation')
      .withArgs(agencyId, streetAddress, city, state, zip)
      .throws(new AppError(errorMessage, 400));

    await getCasesCountByLocation(request, response);

    expect(response.statusCode).to.equal(400);
    expect(JSON.parse(response._getData())).to.deep.equal(
      { message: errorMessage },
      'response body did not match'
    );
  });
});

describe('CaseLocation Controller: getFlagHistory Method', () => {
  let sandbox;
  const agencyId = 1;
  const location = '15th';
  let response;
  let responseBody;
  let request;

  let user: IAgencyUserClaim | ISuperAdminClaim;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

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

    responseBody = {
      id: 10,
      isFlagged: true,
      reasonForFlagging: 'dangerous dog',
      updatedBy: {
        id: 6,
        firstName: 'John',
        lastName: 'Doe',
      },
      updatedAt: '2019-02-16T06:29:32.814Z',
    };

    request = httpMocks.createRequest({
      method: 'GET',
      url: '/xerce/cases/locations/flag-history?location=14th',
      swagger: {
        params: {
          location: {
            value: location,
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

  it('Should return status code 200 with flag history details', async () => {
    sandbox
      .stub(LocationService.prototype, 'getFlagHistoryByLocation')
      .withArgs(agencyId, location)
      .returns(Object.assign({}, responseBody));

    await getFlagHistory(request, response);

    expect(response.statusCode).to.equal(200);
    expect(JSON.parse(response._getData())).to.deep.equal(
      responseBody,
      'response body did not match'
    );
  });

  it('Should return status code 400 with error message', async () => {
    const errorMessage =
      'Error occured while fetching flagged history by location.';

    sandbox
      .stub(LocationService.prototype, 'getFlagHistoryByLocation')
      .withArgs(agencyId, location)
      .throws(new AppError(errorMessage, 400));

    await getFlagHistory(request, response);

    expect(response.statusCode).to.equal(400);
    expect(JSON.parse(response._getData())).to.deep.equal(
      { message: errorMessage },
      'response body did not match'
    );
  });
});
