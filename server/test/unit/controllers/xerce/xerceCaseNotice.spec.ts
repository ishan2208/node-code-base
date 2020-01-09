import { expect } from 'chai';
import 'mocha';
import * as httpMocks from 'node-mocks-http';
import * as sinon from 'sinon';
import { editNoticeCertifiedMailNumber } from '../../../../api/controllers/xerce/xerceCaseNotice';
import { AppError } from '../../../../api/errors';
import xerceCaseNoticeService from '../../../../api/service/xerce/xerceCaseNotice';

describe('xerceCaseNotice controller: editNoticeCertifiedMailNumber method', () => {
  let responseBody;
  let request;
  let requestBody;
  let response;
  let sandbox;
  const agencyId = 1;
  const caseId = 2;
  const noticeId = 3;
  const inspectionId = 4;

  const authScope = {
    comcateAdmin: true,
    siteAdmin: true,
  };

  const userProfile = {
    id: 5,
    agencyId,
    firstName: 'John',
    middleName: 'John',
    lastName: 'Doe',
    email: 'John.doe@alabama.com',
    scopes: authScope,
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    requestBody = {
      certifiedMailNumber: '1234567890',
    };

    responseBody = {
      noticeId,
      inspectionId,
      certifiedMailNumber: requestBody.certifiedMailNumber,
    };

    request = httpMocks.createRequest({
      method: 'PUT',
      url: '/xerce/cases/2/notice/3',
      swagger: {
        params: {
          caseId: {
            value: caseId,
          },
          inspectionId: {
            value: inspectionId,
          },
          noticeId: {
            value: noticeId,
          },
          body: {
            value: requestBody,
          },
        },
      },
      user: userProfile,
    });

    response = httpMocks.createResponse();
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 with edit certified mail number response', async () => {
    sandbox
      .stub(xerceCaseNoticeService.prototype, 'editNoticeCertifiedMailNumber')
      .withArgs(
        agencyId,
        caseId,
        inspectionId,
        noticeId,
        userProfile,
        requestBody
      )
      .resolves(responseBody);

    await editNoticeCertifiedMailNumber(request, response);

    expect(response.statusCode).to.equal(200);
    expect(JSON.parse(response._getData())).to.deep.equal(
      responseBody,
      'response body did not match'
    );
  });

  it('Should throw unique error constraint error message', async () => {
    const errorMessage = 'Certified Mail Number exists already.';
    sandbox
      .stub(xerceCaseNoticeService.prototype, 'editNoticeCertifiedMailNumber')
      .withArgs(
        agencyId,
        caseId,
        inspectionId,
        noticeId,
        userProfile,
        requestBody
      )
      .throws(new AppError('Certified Mail Number exists already.', 400));

    await editNoticeCertifiedMailNumber(request, response);

    expect(response.statusCode).to.equal(400);
    expect(JSON.parse(response._getData())).to.deep.equal(
      { message: errorMessage },
      'response body did not match'
    );
  });
});
