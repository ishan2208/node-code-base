import 'mocha';

import { expect } from 'chai';
import * as httpMocks from 'node-mocks-http';
import * as sinon from 'sinon';

import { getReports } from '../../../api/controllers/reports';
import { AppError } from '../../../api/errors';
import ReportService from '../../../api/service/reports';

describe('Cases Controller: getCaseReports method', () => {
  let sandbox;
  const userId = 3;

  const queryParams: ICaseReportQueryParams = {
    caseAssigneeId: 1,
    violationTypeId: null,
    startDate: new Date('2018-07-14T06:10:30.171Z'),
    endDate: new Date('2018-07-14T06:10:30.171Z'),
    filterType: ReportsFilterType.DAY,
    reportType: ReportType.OPEN,
    isLastMonthSelected: false,
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
  let responseBody: ICaseReport;
  let request;
  let errorMessage;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    responseBody = {
      count: 2,
      percentDifference: 100,
      data: [
        {
          xAxis: '08/29/2019',
          yAxis: 1,
        },
        {
          xAxis: '08/30/2019',
          yAxis: 0,
        },
        {
          xAxis: '08/31/2019',
          yAxis: 1,
        },
      ],
    };

    request = httpMocks.createRequest({
      method: 'GET',
      url: '/xerce/cases/reports',
      swagger: {
        params: {
          caseAssigneeId: {
            value: queryParams.caseAssigneeId,
          },
          violationTypeId: {
            value: queryParams.violationTypeId,
          },
          reportType: {
            value: queryParams.reportType,
          },
          startDate: {
            value: queryParams.startDate,
          },
          endDate: {
            value: queryParams.endDate,
          },
          filterType: {
            value: queryParams.filterType,
          },
          isLastMonthSelected: {
            value: queryParams.isLastMonthSelected,
          },
        },
      },
      user,
    });

    response = httpMocks.createResponse();

    errorMessage = 'Error occurred while generating reports';
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 with reports', async () => {
    const reports = sandbox.stub(ReportService.prototype, 'getReports');
    reports.returns(Object.assign({}, responseBody));

    await getReports(request, response);

    expect(response.statusCode).to.equal(200);
    expect(JSON.parse(response._getData())).to.deep.equal(
      responseBody,
      'response body did not match'
    );
  });

  it('Should return status code 400 with error message', async () => {
    const reports = sandbox.stub(ReportService.prototype, 'getReports');
    reports.throws(
      new AppError('Error occurred while generating reports', 400)
    );

    await getReports(request, response);

    expect(response.statusCode).to.equal(400);
    expect(JSON.parse(response._getData())).to.deep.equal(
      { message: errorMessage },
      'response body did not match'
    );
  });
});
