import 'mocha';

import { expect } from 'chai';
import * as sinon from 'sinon';
import db from '../../../../api/models';
import XerceCaseListingService from '../../../../api/service/xerce/caseListing';
import XerceCaseService from '../../../../api/service/xerce/xerceCase';
import XerceCaseNoteService from '../../../../api/service/xerce/xerceCaseNote';
import AuthUtil from '../../../../api/utils/authUtil';

const xerceCaseNoteService = new XerceCaseNoteService();

describe('XerceCaseNote Service: create method', () => {
  let sandbox;
  let noteObj;
  let noteRequest: INoteRequest;
  let transaction;
  const agencyId = 1;
  const xerceCaseId = 3;
  let note: INote;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    noteRequest = {
      noteContent: 'This is my first note',
    };

    noteObj = {
      id: 1,
      agencyId,
      xerceCaseId,
      noteContent: 'This is a first note',
      createdByUser: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
      },
      createdBy: 1,
      createdAt: new Date('2018-04-18T06:14:50.572Z'),
      updatedByUser: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
      },
      updatedBy: 1,
      updatedAt: new Date('2018-04-18T06:14:50.572Z'),
    };

    note = {
      id: 1,
      noteContent: 'This is a first note',
      createdBy: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
      },
      createdAt: new Date('2018-04-18T06:14:50.572Z'),
      updatedBy: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
      },
      updatedAt: new Date('2018-04-18T06:14:50.572Z'),
    };

    transaction = sinon.stub();
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 with note details with get method', async () => {
    sandbox.stub(db.XerceCaseNote, 'create').resolves(noteObj);

    sandbox
      .stub(XerceCaseNoteService.prototype, 'get')
      .withArgs(agencyId, xerceCaseId, noteObj.id, transaction)
      .resolves(note);

    sandbox.stub(XerceCaseListingService.prototype, 'refreshCaseListing');

    const result = await xerceCaseNoteService.create(
      agencyId,
      xerceCaseId,
      noteRequest.noteContent,
      1,
      false,
      transaction
    );

    sandbox
      .stub(XerceCaseService.prototype, 'setUpdatedAt')
      .withArgs(agencyId, xerceCaseId, transaction);

    expect(result).to.deep.equal(note, 'response did not match');
  });

  it('Should return status code 200 with note details with getAll method', async () => {
    sandbox.stub(db.XerceCaseNote, 'create').resolves(noteObj);

    sandbox
      .stub(XerceCaseNoteService.prototype, 'getAll')
      .withArgs(agencyId, xerceCaseId, transaction)
      .resolves([note]);

    sandbox.stub(XerceCaseListingService.prototype, 'refreshCaseListing');

    const result = await xerceCaseNoteService.create(
      agencyId,
      xerceCaseId,
      noteRequest.noteContent,
      1,
      true,
      transaction
    );

    expect(result).to.deep.equal([note], 'response did not match');
  });

  it('should throw errro while creating the note', async () => {
    sandbox.stub(db.XerceCaseNote, 'create').throws('Error');

    await xerceCaseNoteService
      .create(
        agencyId,
        xerceCaseId,
        noteRequest.noteContent,
        1,
        true,
        transaction
      )
      .catch(err => expect(err.name).to.equal('InternalServerError'));
  });

  it('should throw DBConflictError while creating the note', async () => {
    sandbox
      .stub(db.XerceCaseNote, 'create')
      .throws('SequelizeUniqueConstraintError');

    await xerceCaseNoteService
      .create(
        agencyId,
        xerceCaseId,
        noteRequest.noteContent,
        1,
        true,
        transaction
      )
      .catch(err => expect(err.name).to.equal('DBConflictError'));
  });
});

describe('XerceCaseNote Service: get method', () => {
  let sandbox;
  let noteObj;
  let transaction;
  const agencyId = 1;
  const xerceCaseId = 3;
  let note: INote;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    noteObj = {
      id: 1,
      agencyId,
      xerceCaseId,
      noteContent: 'This is a first note',
      createdByUser: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
      },
      createdBy: 1,
      createdAt: new Date('2018-04-18T06:14:50.572Z'),
      updatedByUser: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
      },
      updatedBy: 1,
      updatedAt: new Date('2018-04-18T06:14:50.572Z'),
    };

    note = {
      id: 1,
      noteContent: 'This is a first note',
      createdBy: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
      },
      createdAt: new Date('2018-04-18T06:14:50.572Z'),
      updatedBy: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
      },
      updatedAt: new Date('2018-04-18T06:14:50.572Z'),
    };

    transaction = sinon.stub();
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 with note details', async () => {
    sandbox.stub(db.XerceCaseNote, 'findOne').resolves(noteObj);

    const result = await xerceCaseNoteService.get(
      agencyId,
      xerceCaseId,
      1,
      transaction
    );

    expect(result).to.deep.equal(note, 'response did not match');
  });

  it('should throw errro while fetching note', async () => {
    sandbox.stub(db.XerceCaseNote, 'findOne').throws('Error');

    await xerceCaseNoteService
      .get(agencyId, xerceCaseId, 1, transaction)
      .catch(err => expect(err.name).to.equal('InternalServerError'));
  });
});

describe('XerceCaseNote Service: getAll method', () => {
  let sandbox;
  let notes;
  let transaction;
  const agencyId = 1;
  const xerceCaseId = 3;
  let responseObj: INote[];

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    notes = [
      {
        id: 1,
        agencyId,
        xerceCaseId,
        noteContent: 'This is a first note',
        createdByUser: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
        },
        createdBy: 1,
        createdAt: new Date('2018-04-18T06:14:50.572Z'),
        updatedByUser: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
        },
        updatedBy: 1,
        updatedAt: new Date('2018-04-18T06:14:50.572Z'),
      },
    ];

    responseObj = [
      {
        id: 1,
        noteContent: 'This is a first note',
        createdBy: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
        },
        createdAt: new Date('2018-04-18T06:14:50.572Z'),
        updatedBy: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
        },
        updatedAt: new Date('2018-04-18T06:14:50.572Z'),
      },
    ];

    transaction = sinon.stub();
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 with note details', async () => {
    sandbox.stub(db.XerceCaseNote, 'findAll').resolves(notes);

    const result = await xerceCaseNoteService.getAll(
      agencyId,
      xerceCaseId,
      transaction
    );

    expect(result).to.deep.equal(responseObj, 'response did not match');
  });

  it('should throw errro while fetching note', async () => {
    sandbox.stub(db.XerceCaseNote, 'findAll').throws('Error');

    await xerceCaseNoteService
      .getAll(agencyId, xerceCaseId, transaction)
      .catch(err => expect(err.name).to.equal('InternalServerError'));
  });
});

describe('XerceCaseNote Service: edit method', () => {
  let sandbox;
  let transaction;
  let noteRequest;
  let updateNote;
  const agencyId = 1;
  const noteId = 2;
  const xerceCaseId = 3;
  const userId = 4;
  const user = {
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
  let responseObj: INote[];

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    noteRequest = updateNote = {
      noteContent: 'This is updated note',
    };

    responseObj = [
      {
        id: 1,
        noteContent: 'This is updated note',
        createdBy: {
          id: 4,
          firstName: 'John',
          lastName: 'Doe',
        },
        createdAt: new Date('2018-04-18T06:14:50.572Z'),
        updatedBy: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
        },
        updatedAt: new Date('2018-04-18T06:14:50.572Z'),
      },
    ];

    transaction = sinon.stub();
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 with note details', async () => {
    sandbox.stub(db.XerceCaseNote, 'update').withArgs(updateNote, {
      where: { id: noteId },
      transaction,
    });

    sandbox
      .stub(XerceCaseService.prototype, 'setUpdatedAt')
      .withArgs(agencyId, xerceCaseId, transaction);

    sandbox
      .stub(XerceCaseNoteService.prototype, 'get')
      .withArgs(agencyId, xerceCaseId, noteId)
      .resolves(responseObj[0]);

    sandbox
      .stub(XerceCaseNoteService.prototype, 'getAll')
      .withArgs(agencyId, xerceCaseId)
      .resolves(responseObj);

    sandbox.stub(XerceCaseListingService.prototype, 'refreshCaseListing');

    sandbox
      .stub(AuthUtil, 'hasMinPermissions')
      .withArgs([ViolationTypeACL.OVERWRITE], user, xerceCaseId)
      .resolves(true);

    const result = await xerceCaseNoteService.edit(
      agencyId,
      xerceCaseId,
      noteId,
      user,
      noteRequest,
      transaction
    );

    expect(result).to.deep.equal(responseObj, 'response did not match');
  });

  it('Should throw exception when user id does not match', async () => {
    responseObj[0].createdBy.id = 10;

    sandbox
      .stub(XerceCaseNoteService.prototype, 'get')
      .withArgs(agencyId, xerceCaseId, noteId)
      .resolves(responseObj[0]);

    sandbox
      .stub(AuthUtil, 'hasMinPermissions')
      .withArgs([ViolationTypeACL.OVERWRITE], user, xerceCaseId)
      .resolves(false);

    await xerceCaseNoteService
      .edit(agencyId, xerceCaseId, noteId, user, noteRequest, transaction)
      .catch(err => expect(err.name).to.equal('InvalidRequestError'));
  });

  it('should throw errro while fetching note', async () => {
    sandbox
      .stub(XerceCaseNoteService.prototype, 'get')
      .withArgs(agencyId, xerceCaseId, noteId)
      .resolves(responseObj[0]);

    sandbox
      .stub(AuthUtil, 'hasMinPermissions')
      .withArgs([ViolationTypeACL.OVERWRITE], user, xerceCaseId)
      .resolves(true);

    sandbox
      .stub(db.XerceCaseNote, 'update')
      .withArgs(updateNote, {
        where: { id: noteId },
        transaction,
      })
      .throws('Error');

    await xerceCaseNoteService
      .edit(agencyId, xerceCaseId, noteId, user, noteRequest, transaction)
      .catch(err => expect(err.name).to.equal('InternalServerError'));
  });
});

describe('XerceCaseNote Service: delete method', () => {
  let sandbox;
  let transaction;
  const agencyId = 1;
  const noteId = 1;
  const xerceCaseId = 3;
  const note = {
    id: 1,
    noteContent: 'This is updated note',
    createdBy: {
      id: 4,
      firstName: 'John',
      lastName: 'Doe',
    },
    createdAt: new Date('2018-04-18T06:14:50.572Z'),
    updatedBy: {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
    },
    updatedAt: new Date('2018-04-18T06:14:50.572Z'),
  };
  const user = {
    id: 4,
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
  // const userId = 4;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    transaction = sinon.stub();
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should delete note', async () => {
    sandbox
      .stub(XerceCaseNoteService.prototype, 'get')
      .withArgs(agencyId, xerceCaseId, noteId)
      .resolves(note);

    sandbox
      .stub(AuthUtil, 'hasMinPermissions')
      .withArgs([ViolationTypeACL.OVERWRITE], user, xerceCaseId)
      .resolves(true);

    sandbox.stub(db.XerceCaseNote, 'destroy').withArgs({
      where: {
        id: noteId,
        agencyId,
        xerceCaseId,
      },
      transaction,
    });

    sandbox
      .stub(XerceCaseService.prototype, 'setUpdatedAt')
      .withArgs(agencyId, xerceCaseId, transaction);

    await xerceCaseNoteService.delete(
      agencyId,
      xerceCaseId,
      noteId,
      user,
      transaction
    );
  });

  it('Should throw exception while deleting note', async () => {
    sandbox
      .stub(XerceCaseNoteService.prototype, 'get')
      .withArgs(agencyId, xerceCaseId, noteId)
      .resolves(note);

    sandbox
      .stub(AuthUtil, 'hasMinPermissions')
      .withArgs([ViolationTypeACL.OVERWRITE], user, xerceCaseId)
      .resolves(true);

    sandbox
      .stub(db.XerceCaseNote, 'destroy')
      .withArgs({
        where: {
          id: noteId,
          agencyId,
          xerceCaseId,
        },
        transaction,
      })
      .throws('Error');

    sandbox
      .stub(XerceCaseService.prototype, 'setUpdatedAt')
      .withArgs(agencyId, xerceCaseId, transaction);

    await xerceCaseNoteService
      .delete(agencyId, xerceCaseId, noteId, user, transaction)
      .catch(err => expect(err.name).to.equal('InternalServerError'));
  });

  it('Should throw exception when user id does not match', async () => {
    note.createdBy.id = 10;

    sandbox
      .stub(XerceCaseNoteService.prototype, 'get')
      .withArgs(agencyId, xerceCaseId, noteId)
      .resolves(note);

    sandbox
      .stub(AuthUtil, 'hasMinPermissions')
      .withArgs([ViolationTypeACL.OVERWRITE], user, xerceCaseId)
      .resolves(false);

    await xerceCaseNoteService
      .delete(agencyId, xerceCaseId, noteId, user, transaction)
      .catch(err => expect(err.name).to.equal('InvalidRequestError'));
  });
});
