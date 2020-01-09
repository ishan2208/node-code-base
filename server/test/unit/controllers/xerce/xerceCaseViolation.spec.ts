import { expect } from 'chai';
import 'mocha';
import * as httpMocks from 'node-mocks-http';
import * as sinon from 'sinon';

import { updateClosedViolationDisposition } from '../../../../api/controllers/xerce/xerceCaseViolation';
import XerceCaseViolationService from '../../../../api/service/xerce/xerceCaseViolation';

describe('XerceCaseViolation Controller: updateClosedViolationDisposition Method', () => {
  let sandbox;
  const agencyId = 1;
  const caseId = 101;
  const caseViolationId = 1001;
  const caseUser: ICaseUser = {
    id: 4,
    firstName: 'John',
    lastName: 'Doe',
  };
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
    },
  };
  const dispositionRequest = {
    dispositionId: 1,
  };
  const xerceCaseViolations: ICaseViolation[] = [
    {
      id: 1001,
      configDispositionId: 1,
      status: XerceViolationStatus.VERIFICATION_PENDING,
      complyByDate: new Date('2018-03-30T08:36:22.338Z'),
      configViolation: {
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
      entity: {
        'Animal Colour': 'Red',
        'License Number': '1234',
        Age: 15,
        Breed: '',
        Note: '',
      },
      createdAt: new Date('2018-03-30T08:36:22.338Z'),
      updatedAt: new Date('2018-03-30T08:36:22.338Z'),
      closedAt: null,
      createdBy: caseUser,
      updatedBy: caseUser,
      closedBy: null,
    },
    {
      id: 1002,
      configDispositionId: 1,
      status: XerceViolationStatus.VERIFICATION_PENDING,
      complyByDate: new Date('2018-03-30T08:36:22.338Z'),
      configViolation: {
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
      entity: {
        'Animal Colour': 'White',
        'License Number': '',
        Age: 5,
        Breed: '',
        Note: 'Puppy',
      },
      createdAt: new Date('2018-03-30T08:36:22.338Z'),
      updatedAt: new Date('2018-03-30T08:36:22.338Z'),
      closedAt: null,
      createdBy: caseUser,
      updatedBy: caseUser,
      closedBy: null,
    },
  ];

  let request;
  let response;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    request = httpMocks.createRequest({
      method: 'PUT',
      url: `/cases/${caseId}/violations/${caseViolationId}/disposition`,
      swagger: {
        params: {
          caseId: {
            value: caseId,
          },
          caseViolationId: {
            value: caseViolationId,
          },
          body: {
            value: dispositionRequest,
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
      .stub(
        XerceCaseViolationService.prototype,
        'updateClosedViolationDisposition'
      )
      .withArgs(agencyId, caseId, dispositionRequest)
      .resolves(xerceCaseViolations);

    await updateClosedViolationDisposition(request, response);

    expect(response.statusCode).to.equal(200);
  });

  it('should throw error', async () => {
    sandbox
      .stub(
        XerceCaseViolationService.prototype,
        'updateClosedViolationDisposition'
      )
      .throws('Error');

    await updateClosedViolationDisposition(request, response).catch(err =>
      expect(err.name).to.deep.equal('Error')
    );
  });
});
