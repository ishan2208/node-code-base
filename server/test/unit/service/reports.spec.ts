import 'mocha';

import { expect } from 'chai';
import * as sinon from 'sinon';

import db from '../../../api/models';
import ReportService from '../../../api/service/reports';

describe('reports Service: getCaseReports Method', () => {
  let sandbox;
  let openCaseReportResults: IOpenCaseReportResult[];
  let violationReportResults: IViolationReportResult[];
  let workloadReportResults: IReportResult[];
  let workloadPercentageResult;
  let responseBody: ICaseReport;
  let result;
  const agencyId = 4;
  const userId = 1;
  let queryParams: ICaseReportQueryParams;

  let user: IAgencyUserClaim | ISuperAdminClaim = {
    id: 1,
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
      violationTypeId: null,
      caseAssigneeId: userId,
      reportType: ReportType.OPEN,
      startDate: new Date('2019-03-05T16:23:14.912Z'),
      endDate: new Date('2019-03-05T16:23:14.912Z'),
      filterType: ReportsFilterType.DAY,
      isLastMonthSelected: false,
    };

    openCaseReportResults = [
      {
        agencyId: 1,
        day: new Date('08/29/2019'),
        caseCount: 1,
        previousCaseCount: 1,
      },
      {
        agencyId: 1,
        day: new Date('08/30/2019'),
        caseCount: 0,
        previousCaseCount: 1,
      },
      {
        agencyId: 1,
        day: new Date('08/31/2019'),
        caseCount: 1,
        previousCaseCount: 1,
      },
    ];

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
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 with reports data filtered by day', async () => {
    sandbox.stub(db.sequelize, 'query').resolves(openCaseReportResults);
    result = await new ReportService().getReports(agencyId, queryParams, user);

    expect(result).to.deep.equal(responseBody, 'response did not match');
  });

  it('Should return status code 200 with open case reports data filtered by day', async () => {
    queryParams = {
      violationTypeId: null,
      caseAssigneeId: userId,
      reportType: ReportType.OPEN,
      startDate: new Date('2019-03-05T16:23:14.912Z'),
      endDate: new Date('2019-03-05T16:23:14.912Z'),
      filterType: ReportsFilterType.DAY,
      isLastMonthSelected: true,
    };

    sandbox.stub(db.sequelize, 'query').resolves(openCaseReportResults);
    result = await new ReportService().getReports(agencyId, queryParams, user);

    expect(result).to.deep.equal(responseBody, 'response did not match');
  });

  it('Should return status code 200 with closed case reports data filtered by day', async () => {
    queryParams = {
      violationTypeId: null,
      caseAssigneeId: userId,
      reportType: ReportType.CLOSED,
      startDate: new Date('2019-03-05T16:23:14.912Z'),
      endDate: new Date('2019-03-05T16:23:14.912Z'),
      filterType: ReportsFilterType.DAY,
      isLastMonthSelected: true,
    };

    sandbox.stub(db.sequelize, 'query').resolves(openCaseReportResults);
    result = await new ReportService().getReports(agencyId, queryParams, user);

    expect(result).to.deep.equal(responseBody, 'response did not match');
  });

  it('Should return status code 200 with reports data filtered by month', async () => {
    queryParams = {
      violationTypeId: null,
      caseAssigneeId: userId,
      reportType: ReportType.OPEN,
      startDate: new Date('2019-03-05T16:23:14.912Z'),
      endDate: new Date('2019-03-05T16:23:14.912Z'),
      filterType: ReportsFilterType.MONTH,
      isLastMonthSelected: false,
    };

    openCaseReportResults = [
      {
        agencyId: 1,
        day: new Date('07/29/2019'),
        caseCount: 1,
        previousCaseCount: 1,
      },
      {
        agencyId: 1,
        day: new Date('08/30/2019'),
        caseCount: 0,
        previousCaseCount: 1,
      },
      {
        agencyId: 1,
        day: new Date('09/30/2019'),
        caseCount: 1,
        previousCaseCount: 1,
      },
    ];

    responseBody = {
      count: 2,
      percentDifference: 100,
      data: [
        {
          xAxis: 'Jul 2019',
          yAxis: 1,
        },
        {
          xAxis: 'Aug 2019',
          yAxis: 0,
        },
        {
          xAxis: 'Sep 2019',
          yAxis: 1,
        },
      ],
    };

    sandbox.stub(db.sequelize, 'query').resolves(openCaseReportResults);
    result = await new ReportService().getReports(agencyId, queryParams, user);

    expect(result).to.deep.equal(responseBody, 'response did not match');
  });

  it('Should return status code 200 with no reports data for super admin', async () => {
    queryParams = {
      violationTypeId: null,
      caseAssigneeId: 0,
      reportType: ReportType.OPEN,
      startDate: new Date('2019-03-05T16:23:14.912Z'),
      endDate: new Date('2019-03-05T16:23:14.912Z'),
      filterType: ReportsFilterType.MONTH,
      isLastMonthSelected: false,
    };

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

    responseBody = {
      count: 0,
      percentDifference: null,
      data: [],
    };

    result = await new ReportService().getReports(agencyId, queryParams, user);

    expect(result).to.deep.equal(responseBody, 'response did not match');
  });

  it('Should return status code 400 when exception occurs', async () => {
    sandbox.stub(db.sequelize, 'query').throws('Error');

    await new ReportService()
      .getReports(agencyId, queryParams, user)
      .catch(err => {
        expect(err.name).to.deep.equal('InternalServerError');
        expect(err.message).to.deep.equal(
          'Something went wrong. Please try again later.'
        );
      });
  });

  it('should return the daily workload report with status 200', async () => {
    queryParams = {
      violationTypeId: null,
      caseAssigneeId: 12,
      reportType: ReportType.WORKLOAD,
      startDate: new Date('2019-03-05T16:23:14.912Z'),
      endDate: new Date('2019-03-05T16:23:14.912Z'),
      filterType: ReportsFilterType.DAY,
      isLastMonthSelected: false,
    };

    workloadReportResults = [
      {
        agencyId: 1,
        day: new Date('08/29/2019'),
        workload: 12,
      },
      {
        agencyId: 1,
        day: new Date('08/30/2019'),
        workload: 11,
      },
      {
        agencyId: 1,
        day: new Date('08/31/2019'),
        workload: 13,
      },
    ];

    workloadPercentageResult = [
      {
        percentage: '100',
      },
    ];

    responseBody = {
      count: 0,
      percentDifference: 100,
      data: [
        {
          xAxis: '08/29/2019',
          yAxis: 12,
        },
        {
          xAxis: '08/30/2019',
          yAxis: 11,
        },
        {
          xAxis: '08/31/2019',
          yAxis: 13,
        },
      ],
    };

    const query = sandbox.stub(db.sequelize, 'query');

    query.onFirstCall().returns(workloadReportResults);
    query.onSecondCall().returns(workloadPercentageResult);

    result = await new ReportService().getReports(agencyId, queryParams, user);

    expect(result).to.deep.equal(responseBody, 'response did not match');
  });

  it('should return the daily workload report of Last Month with status 200', async () => {
    queryParams = {
      violationTypeId: null,
      caseAssigneeId: 12,
      reportType: ReportType.WORKLOAD,
      startDate: new Date('2019-03-05T16:23:14.912Z'),
      endDate: new Date('2019-03-05T16:23:14.912Z'),
      filterType: ReportsFilterType.DAY,
      isLastMonthSelected: true,
    };

    workloadReportResults = [
      {
        agencyId: 1,
        day: new Date('08/29/2019'),
        workload: 12,
      },
      {
        agencyId: 1,
        day: new Date('08/30/2019'),
        workload: 11,
      },
      {
        agencyId: 1,
        day: new Date('08/31/2019'),
        workload: 13,
      },
    ];

    workloadPercentageResult = [
      {
        percentage: '100',
      },
    ];

    responseBody = {
      count: 0,
      percentDifference: 100,
      data: [
        {
          xAxis: '08/29/2019',
          yAxis: 12,
        },
        {
          xAxis: '08/30/2019',
          yAxis: 11,
        },
        {
          xAxis: '08/31/2019',
          yAxis: 13,
        },
      ],
    };

    const query = sandbox.stub(db.sequelize, 'query');

    query.onFirstCall().returns(workloadReportResults);
    query.onSecondCall().returns(workloadPercentageResult);

    result = await new ReportService().getReports(agencyId, queryParams, user);

    expect(result).to.deep.equal(responseBody, 'response did not match');
  });

  it('should return the monthly workload report with status 200', async () => {
    queryParams = {
      violationTypeId: null,
      caseAssigneeId: 12,
      reportType: ReportType.WORKLOAD,
      startDate: new Date('2019-03-05T16:23:14.912Z'),
      endDate: new Date('2019-03-05T16:23:14.912Z'),
      filterType: ReportsFilterType.MONTH,
      isLastMonthSelected: false,
    };

    workloadReportResults = [
      {
        agencyId: 1,
        day: new Date('08/01/2019'),
        workload: 12,
      },
      {
        agencyId: 1,
        day: new Date('09/01/2019'),
        workload: 11,
      },
      {
        agencyId: 1,
        day: new Date('10/01/2019'),
        workload: 13,
      },
    ];

    workloadPercentageResult = [
      {
        percentage: '100',
      },
    ];

    responseBody = {
      count: 0,
      percentDifference: 100,
      data: [
        {
          xAxis: 'Aug 2019',
          yAxis: 12,
        },
        {
          xAxis: 'Sep 2019',
          yAxis: 11,
        },
        {
          xAxis: 'Oct 2019',
          yAxis: 13,
        },
      ],
    };

    const query = sandbox.stub(db.sequelize, 'query');

    query.onFirstCall().returns(workloadReportResults);
    query.onSecondCall().returns(workloadPercentageResult);

    result = await new ReportService().getReports(agencyId, queryParams, user);

    expect(result).to.deep.equal(responseBody, 'response did not match');
  });

  it('should throw error while generating workload report', async () => {
    queryParams = {
      violationTypeId: null,
      caseAssigneeId: 12,
      reportType: ReportType.WORKLOAD,
      startDate: new Date('2019-03-05T16:23:14.912Z'),
      endDate: new Date('2019-03-05T16:23:14.912Z'),
      filterType: ReportsFilterType.MONTH,
      isLastMonthSelected: false,
    };

    workloadReportResults = [
      {
        agencyId: 1,
        day: new Date('08/01/2019'),
        workload: 12,
      },
      {
        agencyId: 1,
        day: new Date('09/01/2019'),
        workload: 11,
      },
      {
        agencyId: 1,
        day: new Date('10/01/2019'),
        workload: 13,
      },
    ];

    const query = sandbox.stub(db.sequelize, 'query');

    query.onFirstCall().returns(workloadReportResults);
    query.onSecondCall().throws('Error');

    await new ReportService()
      .getReports(agencyId, queryParams, user)
      .catch(err => expect(err.name).to.equal('InternalServerError'));
  });

  it('should return the monthly violation report with all violations and status 200', async () => {
    queryParams = {
      violationTypeId: null,
      caseAssigneeId: 12,
      reportType: ReportType.VIOLATIONS,
      startDate: new Date('2019-03-05T16:23:14.912Z'),
      endDate: new Date('2019-03-05T16:23:14.912Z'),
      filterType: ReportsFilterType.MONTH,
      isLastMonthSelected: false,
    };

    violationReportResults = [
      {
        agencyId: 1,
        label: 'Animal Bug',
        file_url:
          'https://cyberdyne-poc.s3.amazonaws.com/dev/agency_0/system_icon/vehicle.png',
        count: 12,
      },
      {
        agencyId: 1,
        label: 'Vehicle Obstructing',
        file_url:
          'https://cyberdyne-poc.s3.amazonaws.com/dev/agency_0/system_icon/vehicle.png',
        count: 11,
      },
    ];

    responseBody = {
      count: null,
      percentDifference: null,
      data: [
        {
          xAxis: 'Animal Bug',
          yAxis: 12,
          url:
            'https://cyberdyne-poc.s3.amazonaws.com/dev/agency_0/system_icon/vehicle.png',
        },
        {
          xAxis: 'Vehicle Obstructing',
          yAxis: 11,
          url:
            'https://cyberdyne-poc.s3.amazonaws.com/dev/agency_0/system_icon/vehicle.png',
        },
      ],
    };

    const query = sandbox.stub(db.sequelize, 'query');

    query.returns(violationReportResults);

    result = await new ReportService().getReports(agencyId, queryParams, user);

    expect(result).to.deep.equal(responseBody, 'response did not match');
  });

  it('should return the monthly violation report with a violation and status 200', async () => {
    queryParams = {
      violationTypeId: 2,
      caseAssigneeId: 12,
      reportType: ReportType.VIOLATIONS,
      startDate: new Date('2019-03-05T16:23:14.912Z'),
      endDate: new Date('2019-03-05T16:23:14.912Z'),
      filterType: ReportsFilterType.MONTH,
      isLastMonthSelected: false,
    };

    violationReportResults = [
      {
        agencyId: 1,
        label: 'Animal Bug',
        file_url:
          'https://cyberdyne-poc.s3.amazonaws.com/dev/agency_0/system_icon/vehicle.png',
        count: 12,
      },
      {
        agencyId: 1,
        label: 'Vehicle Obstructing',
        file_url:
          'https://cyberdyne-poc.s3.amazonaws.com/dev/agency_0/system_icon/vehicle.png',
        count: 11,
      },
    ];

    responseBody = {
      count: null,
      percentDifference: null,
      data: [
        {
          xAxis: 'Animal Bug',
          yAxis: 12,
          url:
            'https://cyberdyne-poc.s3.amazonaws.com/dev/agency_0/system_icon/vehicle.png',
        },
        {
          xAxis: 'Vehicle Obstructing',
          yAxis: 11,
          url:
            'https://cyberdyne-poc.s3.amazonaws.com/dev/agency_0/system_icon/vehicle.png',
        },
      ],
    };

    const query = sandbox.stub(db.sequelize, 'query');

    query.returns(violationReportResults);

    result = await new ReportService().getReports(agencyId, queryParams, user);

    expect(result).to.deep.equal(responseBody, 'response did not match');
  });

  it('should throw error while generating violation report', async () => {
    queryParams = {
      violationTypeId: null,
      caseAssigneeId: 12,
      reportType: ReportType.VIOLATIONS,
      startDate: new Date('2019-03-05T16:23:14.912Z'),
      endDate: new Date('2019-03-05T16:23:14.912Z'),
      filterType: ReportsFilterType.MONTH,
      isLastMonthSelected: false,
    };

    sandbox.stub(db.sequelize, 'query').throws('Error');

    await new ReportService()
      .getReports(agencyId, queryParams, user)
      .catch(err => expect(err.name).to.equal('InternalServerError'));
  });
});
