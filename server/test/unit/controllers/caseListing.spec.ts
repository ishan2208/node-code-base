import 'mocha';

import { expect } from 'chai';
import * as httpMocks from 'node-mocks-http';
import * as sinon from 'sinon';
import * as unroll from 'unroll';

import { downloadCaseListingCSV } from '../../../api/controllers/caseListing';
import { AppError } from '../../../api/errors';
import db from '../../../api/models';
import XerceCaseListingService from '../../../api/service/xerce/caseListing';
unroll.use(it);

describe('CaseListing Controller: downloadCaseListingCSV Method', () => {
  let sandbox;
  const agencyId = 1;
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
    minHours: 1.15,
    maxHours: 2.01,
    sortBy: CaseListSortParams.CASE_STATUS,
    sortOrder: SortOrder.ASC,
  };

  let response;
  let responseBody;
  let request;
  let errorMessage;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    responseBody = `City of Alabama_06-22-2019_04:16 pm.csv
      "Case Number","Violations","Location","Assignee","Status","Created","Closed","Inspection Assignee","Next Scheduled Inspection","Last Completed Inspection","Hours Logged","Last Updated"\n"CE-19-1","Animal Control","547,Alabama, Alabama, AL, 94016","John Doe","OPEN","16/02/2019",,"John Doe",,"04/04/2019","0.00","04/04/2019"`;

    request = httpMocks.createRequest({
      method: 'GET',
      url: '/xerce/cases/downloadSummayOfCases',
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
          forcedAbatementActivityIds: {
            value: queryParams.forcedAbatementActivityIds,
          },
          violationTypeIds: {
            value: queryParams.violationTypeIds,
          },
          inspectionAssigneeIds: {
            value: queryParams.inspectionAssigneeIds,
          },
          createdCaseStartDate: {
            value: queryParams.createdCaseStartDate,
          },
          createdCaseEndDate: {
            value: queryParams.createdCaseEndDate,
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
        },
      },
      user,
    });

    response = httpMocks.createResponse();

    errorMessage = 'Error while getting case list csv.';
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 with case list csv', async () => {
    sandbox
      .stub(XerceCaseListingService.prototype, 'getCaseListingCSV')
      .withArgs(agencyId, user, queryParams)
      .returns({ csvString: responseBody });

    await downloadCaseListingCSV(request, response);
    expect(response.statusCode).to.equal(200);
  });

  it('Should return status code 400 with error message', async () => {
    sandbox.stub(db.SystemXerceViolationType, 'count').returns(4);

    sandbox
      .stub(XerceCaseListingService.prototype, 'getCaseListingCSV')
      .withArgs(agencyId, user, queryParams)
      .throws(new AppError('Error while getting case list csv.', 400));

    await downloadCaseListingCSV(request, response);

    expect(response.statusCode).to.equal(400);
    expect(JSON.parse(response._getData())).to.deep.equal(
      { message: errorMessage },
      'Something went wrong.'
    );
  });
});
