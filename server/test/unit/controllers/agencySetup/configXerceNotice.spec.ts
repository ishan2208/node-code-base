import 'mocha';

import { expect } from 'chai';
import * as httpMocks from 'node-mocks-http';
import * as sinon from 'sinon';
import { verifyNoticeMergeCodes } from '../../../../api/controllers/agencySetup/configXerceNotice';
import { AppError } from '../../../../api/errors';
import ConfigNoticeService from '../../../../api/service/agencySetup/configXerceNotice';

describe('ConfigNotice Controller: verifyNoticeMergeCodes method', () => {
  let responseBody: IConfigXerceNoticeMergeCode;
  let request;
  let response;
  let sandbox;
  let errorMessage;
  const noticeId = 10;
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

    responseBody = {
      containsPhotoMergeTable: true,
      containsMuniCodeMergeTable: true,
    };

    request = httpMocks.createRequest({
      method: 'GET',
      url: '/xerce/config/notices/10/merge-codes',
      swagger: {
        params: {
          noticeId: {
            value: noticeId,
          },
        },
      },
      user,
    });

    response = httpMocks.createResponse();

    errorMessage =
      'Error occurred while verifying merge codes in configured notice';
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 with response', async () => {
    sandbox
      .stub(ConfigNoticeService.prototype, 'verifyNoticeMergeCodes')
      .resolves(Object.assign({}, responseBody));

    await verifyNoticeMergeCodes(request, response);

    expect(response.statusCode).to.equal(200);
    expect(JSON.parse(response._getData())).to.deep.equal(
      responseBody,
      'response body did not match'
    );
  });

  it('Should return status code 400 with error message', async () => {
    sandbox
      .stub(ConfigNoticeService.prototype, 'verifyNoticeMergeCodes')
      .throws(new AppError(errorMessage, 400));

    await verifyNoticeMergeCodes(request, response);

    expect(response.statusCode).to.equal(400);
    expect(JSON.parse(response._getData())).to.deep.equal(
      { message: errorMessage },
      'response body did not match'
    );
  });
});
