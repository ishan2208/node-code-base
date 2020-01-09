import { expect } from 'chai';
import 'mocha';
import * as httpMocks from 'node-mocks-http';
import * as sinon from 'sinon';
import {
  create,
  edit,
  get,
  getAll,
} from '../../../../api/controllers/xerce/xerceCaseNote';
import { AppError } from '../../../../api/errors';
import xerceCaseNoteService from '../../../../api/service/xerce/xerceCaseNote';

describe('xerceCaseNote controller: create method', () => {
  let responseBody;
  let request;
  let requestBody: INoteRequest;
  let response;
  let sandbox;
  const agencyId = 1;
  const caseId = 2;

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
      noteContent: 'This is a case note',
    };

    responseBody = {
      id: 1,
      noteContent: 'This is a case note',
      createdBy: {
        id: 5,
        firstName: 'John',
        lastName: 'Doe',
      },
      updatedBy: {
        id: 5,
        firstName: 'John',
        lastName: 'Doe',
      },
      createdAt: '2018-03-30T08:36:22.338Z',
      updatedAt: '2018-03-30T08:36:22.338Z',
    };

    request = httpMocks.createRequest({
      method: 'POST',
      url: '/xerce/cases/2/notes',
      swagger: {
        params: {
          caseId: {
            value: caseId,
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

  it('Should return status code 201 with note details response', async () => {
    const createNote = sandbox.stub(xerceCaseNoteService.prototype, 'create');
    createNote
      .withArgs(agencyId, caseId, requestBody.noteContent, userProfile.id, true)
      .resolves(responseBody);

    await create(request, response);

    expect(response.statusCode).to.equal(201);
    expect(JSON.parse(response._getData())).to.deep.equal(
      responseBody,
      'response body did not match'
    );
  });

  it('Should throw error constraint error message', async () => {
    const errorMessage = 'Something went wrong.';
    const createNote = sandbox.stub(xerceCaseNoteService.prototype, 'create');
    createNote
      .withArgs(agencyId, caseId, requestBody.noteContent, userProfile.id, true)
      .throws(new AppError('Something went wrong.', 400));

    await create(request, response);

    expect(response.statusCode).to.equal(400);
    expect(JSON.parse(response._getData())).to.deep.equal(
      { message: errorMessage },
      'response body did not match'
    );
  });
});

describe('xerceCaseNote controller: get method', () => {
  let responseBody;
  let request;
  let response;
  let sandbox;
  const agencyId = 1;
  const caseId = 2;
  const noteId = 3;

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
      id: 1,
      noteContent: 'This is a case note',
      createdBy: {
        id: 5,
        firstName: 'John',
        lastName: 'Doe',
      },
      updatedBy: {
        id: 5,
        firstName: 'John',
        lastName: 'Doe',
      },
      createdAt: '2018-03-30T08:36:22.338Z',
      updatedAt: '2018-03-30T08:36:22.338Z',
    };

    request = httpMocks.createRequest({
      method: 'GET',
      url: '/xerce/cases/2/notes/3',
      swagger: {
        params: {
          caseId: {
            value: caseId,
          },
          noteId: {
            value: noteId,
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

  it('Should return status code 200 with note details response', async () => {
    const getNote = sandbox.stub(xerceCaseNoteService.prototype, 'get');
    getNote.withArgs(agencyId, caseId, noteId).resolves(responseBody);

    await get(request, response);

    expect(response.statusCode).to.equal(200);
    expect(JSON.parse(response._getData())).to.deep.equal(
      responseBody,
      'response body did not match'
    );
  });

  it('Should throw error constraint error message', async () => {
    const errorMessage = 'Something went wrong.';
    const getNote = sandbox.stub(xerceCaseNoteService.prototype, 'get');
    getNote
      .withArgs(agencyId, caseId, noteId)
      .throws(new AppError('Something went wrong.', 400));

    await get(request, response);

    expect(response.statusCode).to.equal(400);
    expect(JSON.parse(response._getData())).to.deep.equal(
      { message: errorMessage },
      'response body did not match'
    );
  });
});

describe('xerceCaseNote controller: getAll method', () => {
  let responseBody;
  let request;
  let response;
  let sandbox;
  const agencyId = 1;
  const caseId = 2;

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
        id: 1,
        noteContent: 'This is a case note',
        createdBy: {
          id: 5,
          firstName: 'John',
          lastName: 'Doe',
        },
        updatedBy: {
          id: 5,
          firstName: 'John',
          lastName: 'Doe',
        },
        createdAt: '2018-03-30T08:36:22.338Z',
        updatedAt: '2018-03-30T08:36:22.338Z',
      },
    ];

    request = httpMocks.createRequest({
      method: 'GET',
      url: '/xerce/cases/2/notes/',
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

  it('Should return status code 200 with note details response', async () => {
    const getAllNote = sandbox.stub(xerceCaseNoteService.prototype, 'getAll');
    getAllNote.withArgs(agencyId, caseId).resolves(responseBody);

    await getAll(request, response);

    expect(response.statusCode).to.equal(200);
    expect(JSON.parse(response._getData())).to.deep.equal(
      responseBody,
      'response body did not match'
    );
  });

  it('Should throw error constraint error message', async () => {
    const errorMessage = 'Something went wrong.';
    const getAllNote = sandbox.stub(xerceCaseNoteService.prototype, 'getAll');
    getAllNote
      .withArgs(agencyId, caseId)
      .throws(new AppError('Something went wrong.', 400));

    await getAll(request, response);

    expect(response.statusCode).to.equal(400);
    expect(JSON.parse(response._getData())).to.deep.equal(
      { message: errorMessage },
      'response body did not match'
    );
  });
});

describe('xerceCaseNote controller: edit method', () => {
  let responseBody;
  let requestBody;
  let request;
  let response;
  let sandbox;
  const agencyId = 1;
  const caseId = 2;
  const noteId = 3;

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
      noteContent: 'This is a case note',
    };

    responseBody = {
      id: 1,
      noteContent: 'This is a updated case note',
      createdBy: {
        id: 5,
        firstName: 'John',
        lastName: 'Doe',
      },
      updatedBy: {
        id: 5,
        firstName: 'John',
        lastName: 'Doe',
      },
      createdAt: '2018-03-30T08:36:22.338Z',
      updatedAt: '2018-03-30T08:36:22.338Z',
    };

    request = httpMocks.createRequest({
      method: 'PUT',
      url: '/xerce/cases/2/notes/3',
      swagger: {
        params: {
          caseId: {
            value: caseId,
          },
          noteId: {
            value: noteId,
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

  it('Should return status code 200 with note details response', async () => {
    const editNote = sandbox.stub(xerceCaseNoteService.prototype, 'edit');
    editNote
      .withArgs(agencyId, caseId, noteId, userProfile, requestBody)
      .resolves(responseBody);

    await edit(request, response);

    expect(response.statusCode).to.equal(200);
    expect(JSON.parse(response._getData())).to.deep.equal(
      responseBody,
      'response body did not match'
    );
  });

  it('Should throw error constraint error message', async () => {
    const errorMessage = 'Something went wrong.';
    const editNote = sandbox.stub(xerceCaseNoteService.prototype, 'edit');
    editNote
      .withArgs(agencyId, caseId, noteId, userProfile, requestBody)
      .throws(new AppError('Something went wrong.', 400));

    await edit(request, response);

    expect(response.statusCode).to.equal(400);
    expect(JSON.parse(response._getData())).to.deep.equal(
      { message: errorMessage },
      'response body did not match'
    );
  });
});
