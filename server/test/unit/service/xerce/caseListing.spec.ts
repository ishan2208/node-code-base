import 'mocha';

import { expect } from 'chai';
import * as sinon from 'sinon';
import db from '../../../../api/models';

import AgencyService from '../../../../api/service/admin/agency';
import XerceCaseListingService from '../../../../api/service/xerce/caseListing';

const xerceCaseListingService = new XerceCaseListingService();

describe('XerceCaseListing Service: getCaseListingCSV method', () => {
  let sandbox;
  let xerceCases;
  let result;
  const agencyId = 1;
  const userId = 3;
  const queryParams: ICaseListQueryParams = {
    sortBy: CaseListSortParams.CASE_CREATED_AT,
    sortOrder: SortOrder.ASC,
    caseAssigneeId: 22,
    caseStatus: CaseStatusFilter.CLOSED,
    inspectionAssigneeIds: [1],
    violationIds: [1],
    violationTypeIds: [1],
    closedCaseStartDate: new Date('2019-06-01T07:18:20Z'),
    closedCaseEndDate: new Date('2019-06-25T07:18:20Z'),
    createdCaseStartDate: new Date('2019-05-01T07:18:20Z'),
    createdCaseEndDate: new Date('2019-06-25T07:18:20Z'),
  };
  let agencyObj;

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

  // TODO: fix unit tests
  const response = {
    csvString: `City of Alabama_03-02-2019_09:00 pm.csv\n"Case Number","Violation Type","Violations","Location","Assignee","Status","Created","Closed","Inspection Assignee","Next Scheduled Inspection","Last Completed Inspection","Contacts","Forced Abatement Activities","Hours Logged","Last Updated"\n"CE-19-1","Animal","Animal Control","547,Alabama, Alabama, AL, 94016","John Doe","OPEN (Verification Pending)","02/15/2019","-","John Doe","04/24/2019","04/04/2019","john doe","-","0.00","02/15/2019"`,
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sinon.useFakeTimers(new Date(2019, 1, 31, 10, 30));

    xerceCases = {
      data: [
        {
          id: 101,
          caseNumber: 'CE-19-1',
          status: 'OPEN',
          total: 10,
          abatementStage: AbatementStage.VERIFICATION_PENDING,
          hoursLogged: '0.00',
          location: '547,Alabama, Alabama, AL, 94016',
          caseAssignee: 'John Doe',
          createdAt: new Date('2019-02-16T06:29:32.814Z'),
          updatedAt: new Date('2019-02-16T06:29:32.814Z'),
          closedAt: null,
          isMigratedCase: true,
          migratedCaseURL:
            'https://comcate-jira.atlassian.net/browse/CYBERD-2365',
          inspectionAssignee: 'John Doe',
          nextScheduledInspection: new Date('2019-04-24T07:00:00.000Z'),
          lastCompletedInspection: new Date('2019-04-04T17:51:09.851Z'),
          violationTypes: [
            'https://app-stage.comcateprime.com/icons/animal.png',
          ],
          configViolationTypeLabels: ['Animal'],
          violations: ['Animal Control'],
          contacts: 'john doe',
        },
      ],
      count: 10,
    };

    agencyObj = {
      id: 1,
      name: 'City of Alabama',
      website_url: 'https://alabama.com',
      email: 'support@alabama.com',
      agency_timezone: 'PST',
      whitelist_url: '',
      fiscal_year_start_date: '12/31',
      agency_logo_url:
        'https://cyberdyne-dev.s3.amazonaws.com/agency_1/agency_config/as.jpeg',
      banner_settings: '',
      disclaimer: '',
      has_parcel_layer: 't',
      agency_boundary_kml_filename: '',
      agency_parcel_filename: 'Texas_City.gdb.zip',
      is_active: 't',
      admin_id: 1,
      created_at: '2019-05-06 12:26:35.884+05:30',
      updated_at: '2019-06-12 10:39:18.372+05:30',
      deleted_at: '',
      agency_boundary_file_url: '',
      agency_parcel_file_url: '',
    };
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 with all case details', async () => {
    sandbox
      .stub(XerceCaseListingService.prototype, 'getAllInstance')
      .withArgs(agencyId, queryParams, user, -1)
      .returns(xerceCases);

    sandbox
      .stub(AgencyService.prototype, 'getInformation')
      .withArgs(agencyId)
      .returns(agencyObj);

    sandbox.stub(db.SystemXerceViolationType, 'count').returns(4);

    result = await xerceCaseListingService.getCaseListingCSV(
      agencyId,
      user,
      queryParams
    );

    expect(result).to.deep.equal(response, 'response did not match');
  });

  it('Should return status code 400 when exception occurs', async () => {
    await xerceCaseListingService
      .getCaseListingCSV(agencyId, null, null)
      .catch(err => {
        expect(err.name).to.deep.equal('InternalServerError');
        expect(err.message).to.deep.equal('Error while getting case list csv.');
      });
  });
});
