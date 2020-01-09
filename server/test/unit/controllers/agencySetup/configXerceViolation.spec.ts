import 'mocha';

import { expect } from 'chai';
import * as httpMocks from 'node-mocks-http';
import * as sinon from 'sinon';
import { searchViolations } from '../../../../api/controllers/agencySetup/configViolation';
import { AppError } from '../../../../api/errors';
import ConfigViolationService from '../../../../api/service/agencySetup/configViolation';

describe('Configviolation Controller: searchViolations method', () => {
  let responseBody: IConfigViolation[];
  let request;
  let response;
  let sandbox;
  let errorMessage;
  const agencyId = 1;
  const search = '';
  const exclude = [];
  let user: IAgencyUserClaim | ISuperAdminClaim;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    user = {
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

    responseBody = [
      {
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
      {
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
    ];

    request = httpMocks.createRequest({
      method: 'GET',
      url: '/xerce/violations',
      swagger: {
        params: {
          search: {
            value: search,
          },
          exclude: {
            value: exclude,
          },
        },
      },
      user,
    });

    response = httpMocks.createResponse();

    errorMessage = 'Error occurred while searching violations';
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 with list of violations', async () => {
    sandbox
      .stub(ConfigViolationService.prototype, 'searchViolations')
      .withArgs(agencyId, user, '', [])
      .resolves(responseBody);

    await searchViolations(request, response);

    expect(response.statusCode).to.equal(200);
    expect(JSON.parse(response._getData())).to.deep.equal(
      responseBody,
      'response body did not match'
    );
  });

  it('should throw error while searching violations', async () => {
    sandbox
      .stub(ConfigViolationService.prototype, 'searchViolations')
      .withArgs(agencyId, user, '', [])
      .throws(new AppError('Error occurred while searching violations', 400));

    await searchViolations(request, response);

    expect(response.statusCode).to.equal(400);
    expect(JSON.parse(response._getData())).to.deep.equal(
      { message: errorMessage },
      'response body did not match'
    );
  });
});
