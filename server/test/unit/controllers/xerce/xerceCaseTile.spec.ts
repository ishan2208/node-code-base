import { expect } from 'chai';
import 'mocha';
import * as httpMocks from 'node-mocks-http';
import * as sinon from 'sinon';

import { edit } from '../../../../api/controllers/xerce/xerceCaseTile';
import XerceCaseTileService from '../../../../api/service/xerce/xerceCaseTile';

describe('XerceCaseTile Controller: edit Method', () => {
  let sandbox;
  const agencyId = 1;
  const caseId = 11;
  let caseTileEditReq: ICaseCustomEditTile;
  let responseBody: ICaseCustomEditTile;
  const user: IAgencyUserClaim | ISuperAdminClaim = {
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

  let request;
  let response;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    caseTileEditReq = {
      customCaseFieldValues: [
        {
          'Property Lien': {
            'Start Date': '2018-08-30',
            'End Date': '2022-09-30',
            'Property Lien Type': 'Short Term',
            'Property Lien By': 'Mr. john Doe',
          },
        },
      ],
    };

    responseBody = {
      customCaseFieldValues: [
        {
          'Property Lien': {
            'Start Date': '2018-08-30',
            'End Date': '2022-09-30',
            'Property Lien Type': 'Short Term',
            'Property Lien By': 'Mr. john Doe',
          },
        },
      ],
    };

    request = httpMocks.createRequest({
      method: 'PUT',
      url: `/cases/${caseId}/case-tiles`,
      swagger: {
        params: {
          caseId: {
            value: caseId,
          },
          body: {
            value: caseTileEditReq,
          },
        },
      },
      user,
    });

    response = httpMocks.createResponse();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return status code 200 with case custom tiles', async () => {
    sandbox
      .stub(XerceCaseTileService.prototype, 'edit')
      .withArgs(agencyId, caseId, user, caseTileEditReq)
      .resolves(Object.assign({}, responseBody));

    await edit(request, response);

    expect(response.statusCode).to.equal(200);
    expect(JSON.parse(response._getData())).to.deep.equal(
      responseBody,
      'response body did not match'
    );
  });

  it('should throw error', async () => {
    sandbox
      .stub(XerceCaseTileService.prototype, 'edit')
      .withArgs(agencyId, caseId, user, caseTileEditReq)
      .throws('Error');

    await edit(request, response).catch(err =>
      expect(err.name).to.deep.equal('Error')
    );
  });
});
