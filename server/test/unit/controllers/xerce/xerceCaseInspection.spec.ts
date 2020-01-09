import { expect } from 'chai';
import 'mocha';
import * as httpMocks from 'node-mocks-http';
import * as sinon from 'sinon';
import {
  editInspectionNote,
  get,
  getAll,
} from '../../../../api/controllers/xerce/xerceCaseInspection';
import { AppError } from '../../../../api/errors';
import xerceCaseInspectionService from '../../../../api/service/xerce/xerceCaseInspection';

describe('xerceCaseInspection controller: get method', () => {
  let errorMessage;
  let responseBody;
  let request;
  let response;
  let sandbox;
  const agencyId = 1;
  const caseId = 3;
  const inspectionId = 10;

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

    responseBody = {
      id: inspectionId,
      name: 'Verification Inspection',
      dueDate: '2019-08-30T17:12:23.561Z',
      assignee: {
        id: 3,
        firstName: 'Peter',
        lastName: 'Pan',
      },
      updatedByUser: {
        id: 3,
        firstName: 'Peter',
        lastName: 'Pan',
      },
    };

    request = httpMocks.createRequest({
      method: 'GET',
      url: '/xerce/cases/3/inspections/10',
      swagger: {
        params: {
          caseId: {
            value: caseId,
          },
          inspectionId: {
            value: inspectionId,
          },
        },
      },
      user: userProfile,
    });

    response = httpMocks.createResponse();

    errorMessage = 'Could not find the Inspection.';
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 with case inspection details', async () => {
    sandbox
      .stub(xerceCaseInspectionService.prototype, 'get')
      .withArgs(agencyId, caseId, inspectionId)
      .resolves(responseBody);

    await get(request, response);

    expect(response.statusCode).to.equal(200);
    expect(JSON.parse(response._getData())).to.deep.equal(
      responseBody,
      'response body did not match'
    );
  });

  it('Should return status code 200 with error message', async () => {
    sandbox
      .stub(xerceCaseInspectionService.prototype, 'get')
      .withArgs(agencyId, caseId, inspectionId)
      .throws(new AppError('Could not find the Inspection.', 200));

    await get(request, response);

    expect(response.statusCode).to.equal(200);
    expect(JSON.parse(response._getData())).to.deep.equal(
      { message: errorMessage },
      'response body did not match'
    );
  });
});

describe('xerceCaseInspection controller: getAll method', () => {
  let responseBody;
  let request;
  let response;
  let sandbox;
  const agencyId = 1;
  const caseId = 3;
  const inspectionId = 10;

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

    responseBody = [
      {
        id: inspectionId,
        name: 'Verification Inspection',
        dueDate: '2019-08-30T17:12:23.561Z',
        assignee: {
          id: 3,
          firstName: 'Peter',
          lastName: 'Pan',
        },
      },
    ];

    request = httpMocks.createRequest({
      method: 'GET',
      url: '/xerce/cases/3/inspections',
      swagger: {
        params: {
          caseId: {
            value: caseId,
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

  it('Should return status code 200 with case inspection details', async () => {
    sandbox
      .stub(xerceCaseInspectionService.prototype, 'getAll')
      .withArgs(agencyId, caseId)
      .resolves(responseBody);

    await getAll(request, response);

    expect(response.statusCode).to.equal(200);
    expect(JSON.parse(response._getData())).to.deep.equal(
      responseBody,
      'response body did not match'
    );
  });

  it('Should return status code 200 with an empty array when using invalid case number', async () => {
    sandbox
      .stub(xerceCaseInspectionService.prototype, 'getAll')
      .withArgs(agencyId)
      .resolves([]);

    await getAll(request, response);

    expect(response.statusCode).to.equal(200);
    expect(JSON.parse(response._getData())).to.deep.equal(
      [],
      'response body did not match'
    );
  });
});

describe('xerceCaseNote controller: edit method', () => {
  let errorMessage;
  let responseBody;
  const requestBody = {
    noteContent: 'This is a case note',
  };
  let request;
  let response;
  let sandbox;
  const agencyId = 1;
  const caseId = 3;
  const inspectionId = 10;

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

    responseBody = {
      id: inspectionId,
      name: 'Verification Inspection',
      dueDate: '2019-08-30T17:12:23.561Z',
      assignee: {
        id: 3,
        firstName: 'Peter',
        lastName: 'Pan',
      },
      updatedByUser: {
        id: 3,
        firstName: 'Peter',
        lastName: 'Pan',
      },
    };

    request = httpMocks.createRequest({
      method: 'PUT',
      url: '/xerce/cases/3/inspections/10/notes',
      swagger: {
        params: {
          caseId: {
            value: caseId,
          },
          inspectionId: {
            value: inspectionId,
          },
          body: {
            value: requestBody,
          },
        },
      },
      user: userProfile,
    });

    response = httpMocks.createResponse();

    errorMessage = 'Something went wrong.';
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 with case inspection details', async () => {
    sandbox
      .stub(xerceCaseInspectionService.prototype, 'editInspectionNote')
      .withArgs(agencyId, caseId, inspectionId, userProfile, requestBody)
      .resolves(responseBody);

    await editInspectionNote(request, response);

    expect(response.statusCode).to.equal(200);
    expect(JSON.parse(response._getData())).to.deep.equal(
      responseBody,
      'response body did not match'
    );
  });

  it('Should throw error constraint error message', async () => {
    const editNote = sandbox
      .stub(xerceCaseInspectionService.prototype, 'editInspectionNote')
      .withArgs(agencyId, caseId, inspectionId, userProfile, requestBody);

    editNote.throws(new AppError('Something went wrong.', 400));

    await editInspectionNote(request, response);

    expect(response.statusCode).to.equal(400);
    expect(JSON.parse(response._getData())).to.deep.equal(
      { message: errorMessage },
      'response body did not match'
    );
  });
});
