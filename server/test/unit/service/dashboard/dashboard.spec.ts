import 'mocha';

import { expect } from 'chai';
import * as moment from 'moment';
import * as sinon from 'sinon';
import { AppError } from '../../../../api/errors';
import db from '../../../../api/models';
import DashboardService from '../../../../api/service/dashboard/dashboard';
const dashboardService = new DashboardService();
const momentProto = moment.fn;

describe('xerceCase Service: getDashboard Method', () => {
  let sandbox;
  let caseCountQueryResponse;
  let allStaffCountQueryResponse;
  let assigneeGroupQueryResponse;
  let inspectionCountQueryResponse;
  let allStaffemptyResponseBody;
  let responseBody: IDashboardResponse;
  let allStaffResponseBody: IDashboardResponse;
  let emptyResponseBody: IDashboardResponse;
  let inspectionGroupQueryResponse: IInspectionGroupResult[];
  let errorMessage;
  const dashboardAccess = DashboardAccess.SELF_DASHBOARD;
  const agencyId = 4;
  const currentDate = '2018-04-17';
  const tomorrowDate = '2018-04-18';

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

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    caseCountQueryResponse = [
      {
        agencyId,
        all: '10',
        mine: '3',
      },
    ];

    allStaffCountQueryResponse = [
      {
        agencyId,
        open: '42',
        all: '47',
      },
    ];

    assigneeGroupQueryResponse = [
      {
        agencyId,
        caseAssigneeId: 1,
        first_name: 'John',
        last_name: 'Doe',
        open: '20',
        all: '23',
      },
      {
        agencyId,
        caseAssigneeId: 2,
        first_name: 'John',
        last_name: 'Wick',
        open: '20',
        all: '20',
      },
    ];

    allStaffResponseBody = {
      cases: {
        all: {
          count: 47,
          assigneeStats: [
            {
              name: 'John Doe',
              percent: 49,
              cases: 23,
            },
            {
              name: 'John Wick',
              percent: 43,
              cases: 20,
            },
          ],
        },
        open: {
          count: 42,
          assigneeStats: [
            {
              name: 'John Doe',
              percent: 48,
              cases: 20,
            },
            {
              name: 'John Wick',
              percent: 48,
              cases: 20,
            },
          ],
        },
      },
      inspections: {
        dueToday: {
          count: 4,
          assigneeStats: [
            {
              name: 'John Doe',
              percent: 50,
              cases: 2,
            },
            {
              name: 'John Wick',
              percent: 50,
              cases: 2,
            },
          ],
        },
        overdue: {
          count: 4,
          assigneeStats: [
            {
              name: 'John Doe',
              percent: 50,
              cases: 2,
            },
            {
              name: 'John Wick',
              percent: 50,
              cases: 2,
            },
          ],
        },
        total: {
          count: 10,
          assigneeStats: [
            {
              name: 'John Doe',
              percent: 50,
              cases: 5,
            },
            {
              name: 'John Wick',
              percent: 50,
              cases: 5,
            },
          ],
        },
      },
    };

    inspectionCountQueryResponse = [
      {
        agencyId,
        total: '10',
        overdue: '4',
        dueToday: '4',
      },
    ];

    inspectionGroupQueryResponse = [
      {
        inspectionAssigneeId: 1,
        first_name: 'John',
        last_name: 'Doe',
        overdue: '2',
        dueToday: '2',
        total: '5',
      },
      {
        inspectionAssigneeId: 2,
        first_name: 'John',
        last_name: 'Wick',
        overdue: '2',
        dueToday: '2',
        total: '5',
      },
    ];

    responseBody = {
      cases: {
        open: {
          all: 10,
          mine: 3,
        },
      },
      inspections: {
        dueToday: {
          count: 4,
          assigneeStats: [],
        },
        overdue: {
          count: 4,
          assigneeStats: [],
        },
        total: {
          count: 10,
          assigneeStats: [],
        },
      },
    };

    emptyResponseBody = {
      cases: {
        open: {
          all: 0,
          mine: 0,
        },
      },
      inspections: {
        dueToday: {
          count: 0,
          assigneeStats: [],
        },
        overdue: {
          count: 0,
          assigneeStats: [],
        },
        total: {
          count: 0,
          assigneeStats: [],
        },
      },
    };

    allStaffemptyResponseBody = {
      cases: {
        all: {
          count: 0,
          assigneeStats: [],
        },
        open: {
          count: 0,
          assigneeStats: [],
        },
      },
      inspections: {
        dueToday: {
          count: 0,
          assigneeStats: [],
        },
        overdue: {
          count: 0,
          assigneeStats: [],
        },
        total: {
          count: 0,
          assigneeStats: [],
        },
      },
    };
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 with dashboard with value for open all/mine count', async () => {
    sandbox.stub(momentProto, 'format').returns(currentDate);

    sandbox.stub(momentProto, 'add').returns({
      format: sandbox.stub().returns(tomorrowDate),
    });

    const query = sandbox.stub(db.sequelize, 'query');

    query.onFirstCall().resolves(caseCountQueryResponse);

    query.onSecondCall().resolves(inspectionCountQueryResponse);

    const result = await dashboardService.get(agencyId, dashboardAccess, user);

    expect(result).to.deep.equal(responseBody, 'response did not match');
  });

  it('Should return status code 200 with all staff dashboard with value for all/open count and stats', async () => {
    const alldashboardAccess = DashboardAccess.ALL_STAFF_DASHBOARD;
    const query = sandbox.stub(db.sequelize, 'query');

    query.onCall(0).resolves(allStaffCountQueryResponse);

    query.onCall(1).resolves(inspectionCountQueryResponse);

    query.onCall(2).resolves(assigneeGroupQueryResponse);

    query.onCall(3).resolves(inspectionGroupQueryResponse);

    const result = await dashboardService.get(
      agencyId,
      alldashboardAccess,
      user
    );

    expect(result).to.deep.equal(
      allStaffResponseBody,
      'response did not match'
    );
  });

  it('Should return status code 200 with empty response for all self dashboard', async () => {
    sandbox.stub(momentProto, 'format').returns(currentDate);

    sandbox.stub(momentProto, 'add').returns({
      format: sandbox.stub().returns(tomorrowDate),
    });

    const query = sandbox.stub(db.sequelize, 'query');

    query.onFirstCall().resolves([]);

    query.onSecondCall().resolves([]);

    const result = await dashboardService.get(agencyId, dashboardAccess, user);

    expect(result).to.deep.equal(emptyResponseBody, 'response did not match');
  });

  it('Should return status code 200 with empty response for all staff dashboard ', async () => {
    const alldashboardAccess = DashboardAccess.ALL_STAFF_DASHBOARD;
    const query = sandbox.stub(db.sequelize, 'query');

    query.onCall(0).resolves([]);

    query.onCall(1).resolves([]);

    query.onCall(2).resolves([]);

    query.onCall(3).resolves([]);

    const result = await dashboardService.get(
      agencyId,
      alldashboardAccess,
      user
    );

    expect(result).to.deep.equal(
      allStaffemptyResponseBody,
      'response did not match'
    );
  });

  it('Should return status code 400 with error message when querying case count', async () => {
    errorMessage = 'Error while fetching open case counts';

    sandbox.stub(momentProto, 'format').returns(currentDate);

    sandbox.stub(momentProto, 'add').returns({
      format: sandbox.stub().returns(tomorrowDate),
    });

    const query = sandbox.stub(db.sequelize, 'query');

    query.onFirstCall().throws(new AppError(errorMessage, 400));

    await dashboardService.get(agencyId, dashboardAccess, user).catch(err => {
      expect(err.name).to.deep.equal('InternalServerError');
      expect(err.message).to.deep.equal(errorMessage);
    });
  });

  it('Should return status code 400 with error message when querying inspection count', async () => {
    errorMessage = 'Error while fetching inspection counts';

    sandbox.stub(momentProto, 'format').returns(currentDate);

    sandbox.stub(momentProto, 'add').returns({
      format: sandbox.stub().returns(tomorrowDate),
    });

    const query = sandbox.stub(db.sequelize, 'query');

    query.onFirstCall().resolves(caseCountQueryResponse);

    query.onSecondCall().throws(new AppError(errorMessage, 400));

    await dashboardService.get(agencyId, dashboardAccess, user).catch(err => {
      expect(err.name).to.deep.equal('InternalServerError');
      expect(err.message).to.deep.equal(errorMessage);
    });
  });

  it('Should return status code 400 with error message when querying all staff case counts', async () => {
    errorMessage = 'Error while fetching all dashboard case counts';
    const alldashboardAccess = DashboardAccess.ALL_STAFF_DASHBOARD;
    const query = sandbox.stub(db.sequelize, 'query');

    query.onFirstCall().throws(new AppError(errorMessage, 400));

    await dashboardService
      .get(agencyId, alldashboardAccess, user)
      .catch(err => {
        expect(err.name).to.deep.equal('InternalServerError');
        expect(err.message).to.deep.equal(errorMessage);
      });
  });
});
