import { expect } from 'chai';
import 'mocha';
import * as sinon from 'sinon';

import db from '../../../../api/models';
import XerceCaseHistoryService from '../../../../api/service/xerce/xerceCaseHistory';
import XerceCaseTimeTrackingService from '../../../../api/service/xerce/xerceCaseTimetracking';
import DBUtil from '../../../../api/utils/dbUtil';

const xerceCaseTimeTrackingService = new XerceCaseTimeTrackingService();

describe('XerceCaseTimeTracking Service: get Method', () => {
  let sandbox;
  const agencyId = 1;
  const xerceCaseId = 2;
  let response;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    response = [
      {
        user: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
        },
        id: 1,
        hours: 2.0,
        date: '2019-02-16T06:29:32.814Z',
      },
      {
        user: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
        },
        id: 2,
        hours: 3.0,
        date: '2019-02-16T06:29:32.814Z',
      },
    ];
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('should return 200 with case time tracking', async () => {
    sandbox
      .stub(db.XerceCaseTimeTracking, 'findAll')
      .withArgs({
        attributes: ['id', 'date', 'hours', 'createdAt'],
        include: [
          {
            model: db.User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName'],
          },
        ],
        where: {
          agencyId,
          xerceCaseId,
        },
        order: [['createdAt', SortOrder.DESC]],
      })
      .resolves(response);

    const result = await xerceCaseTimeTrackingService.get(
      agencyId,
      xerceCaseId
    );

    expect(result).to.deep.equal(response);
  });

  it('should throw InternalServerError while fetching case time tracking', async () => {
    sandbox
      .stub(db.XerceCaseTimeTracking, 'findAll')
      .withArgs({
        attributes: ['id', 'date', 'hours', 'createdAt'],
        include: [
          {
            model: db.User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName'],
          },
        ],
        where: {
          agencyId,
          xerceCaseId,
        },
        order: [['createdAt', SortOrder.DESC]],
      })
      .throws('Error');

    await xerceCaseTimeTrackingService
      .get(agencyId, xerceCaseId)
      .catch(err => expect(err.name).to.equal('InternalServerError'));
  });
});

describe('XerceCaseTimeTracking Service: create Method', () => {
  let sandbox;
  const agencyId = 1;
  const userId = 9;
  const xerceCaseId = 2;
  let requestBody;
  let response;
  let transaction;
  let totalHours;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    transaction = sinon.stub();
    requestBody = {
      userId: 1,
      date: '2019-02-16T06:29:32.814Z',
      hours: 2.0,
    };
    response = [
      {
        user: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
        },
        id: 1,
        hours: 2.0,
        date: '2019-02-16T06:29:32.814Z',
      },
      {
        user: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
        },
        id: 2,
        hours: 3.0,
        date: '2019-02-16T06:29:32.814Z',
      },
    ];
    totalHours = [{ hours: 10.01 }];
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('should create case time tracking', async () => {
    sandbox.stub(DBUtil, 'createTransaction').resolves(transaction);
    sandbox.stub(db.XerceCaseTimeTracking, 'create').resolves(requestBody);
    const query = sandbox.stub(db.XerceCaseTimeTracking, 'findAll');

    query.onFirstCall().resolves(totalHours);
    query.onSecondCall().resolves(response);
    sandbox
      .stub(db.XerceCase, 'update')
      .withArgs(
        { hoursLogged: totalHours[0].hours },
        {
          where: { id: xerceCaseId, agencyId },
          transaction,
        }
      )
      .resolves(null);
    sandbox
      .stub(XerceCaseHistoryService.prototype, 'createCaseSummaryHistory')
      .withArgs(
        CaseHistoryActions.CASE_HOURS_LOGGED,
        agencyId,
        userId,
        xerceCaseId,
        transaction
      )
      .resolves(null);

    sandbox.stub(DBUtil, 'commitTransaction').withArgs(transaction);

    const result = await xerceCaseTimeTrackingService.create(
      agencyId,
      userId,
      xerceCaseId,
      requestBody
    );

    expect(result).to.deep.equal(response);
  });

  it('should create through error for invalid logged hours', async () => {
    sandbox.stub(DBUtil, 'createTransaction').resolves(transaction);
    requestBody.hours = 0;
    sandbox.stub(db.XerceCaseTimeTracking, 'create').resolves(requestBody);
    const query = sandbox.stub(db.XerceCaseTimeTracking, 'findAll');

    query.onFirstCall().resolves(totalHours);
    query.onSecondCall().resolves(response);
    sandbox
      .stub(db.XerceCase, 'update')
      .withArgs(
        { hoursLogged: totalHours[0].hours },
        {
          where: { id: xerceCaseId, agencyId },
          transaction,
        }
      )
      .resolves(null);
    sandbox.stub(DBUtil, 'commitTransaction').withArgs(transaction);

    await xerceCaseTimeTrackingService
      .create(agencyId, userId, xerceCaseId, requestBody)
      .catch(err => expect(err.name).to.equal('InvalidRequestError'));
  });

  it('should throw error while creating case time tracking', async () => {
    sandbox.stub(DBUtil, 'createTransaction').resolves(transaction);
    sandbox
      .stub(db.XerceCaseTimeTracking, 'create')
      .throws('InternalServerError');
    const query = sandbox.stub(db.XerceCaseTimeTracking, 'findAll');

    query.onFirstCall().resolves(totalHours);
    query.onSecondCall().resolves(response);
    sandbox
      .stub(db.XerceCase, 'update')
      .withArgs(
        { hoursLogged: totalHours[0].hours },
        {
          where: { id: xerceCaseId, agencyId },
          transaction,
        }
      )
      .resolves(null);
    sandbox.stub(DBUtil, 'rollbackTransaction').withArgs(transaction);
    await xerceCaseTimeTrackingService
      .create(agencyId, userId, xerceCaseId, requestBody)
      .catch(err => expect(err.name).to.equal('InternalServerError'));
  });

  it('should throw error while getting case total logged hours', async () => {
    sandbox.stub(DBUtil, 'createTransaction').resolves(transaction);
    sandbox.stub(db.XerceCaseTimeTracking, 'create').resolves(requestBody);
    const query = sandbox.stub(db.XerceCaseTimeTracking, 'findAll');
    query.onSecondCall().resolves(response);
    sandbox
      .stub(db.XerceCase, 'update')
      .withArgs(
        { hoursLogged: totalHours[0].hours },
        {
          where: { id: xerceCaseId, agencyId },
          transaction,
        }
      )
      .resolves(null);
    sandbox.stub(DBUtil, 'rollbackTransaction').withArgs(transaction);

    query.onFirstCall().throws('InternalServerError');
    query.onSecondCall().resolves(response);

    await xerceCaseTimeTrackingService
      .create(agencyId, userId, xerceCaseId, requestBody)
      .catch(err => expect(err.name).to.equal('InternalServerError'));
  });

  it('should throw error while updating case total logged hours', async () => {
    sandbox.stub(DBUtil, 'createTransaction').resolves(transaction);
    sandbox.stub(db.XerceCaseTimeTracking, 'create').resolves(requestBody);
    const query = sandbox.stub(db.XerceCaseTimeTracking, 'findAll');

    query.onFirstCall().resolves(totalHours);
    query.onSecondCall().resolves(response);
    sandbox
      .stub(db.XerceCase, 'update')
      .withArgs(
        { hoursLogged: totalHours[0].hours },
        {
          where: { id: xerceCaseId, agencyId },
          transaction,
        }
      )
      .throws('InternalServerError');
    sandbox.stub(DBUtil, 'rollbackTransaction').withArgs(transaction);
    await xerceCaseTimeTrackingService
      .create(agencyId, userId, xerceCaseId, requestBody)
      .catch(err => expect(err.name).to.equal('InternalServerError'));
  });
});

describe('XerceCaseTimeTracking Service: delete Method', () => {
  let sandbox;
  const agencyId = 1;
  const userId = 9;
  const xerceCaseId = 2;
  const timeTrackingId = 123;
  let response;
  let transaction;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    transaction = sinon.stub();

    response = [
      {
        user: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
        },
        id: 1,
        hours: 2.0,
        date: '2019-02-16T06:29:32.814Z',
      },
      {
        user: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
        },
        id: 2,
        hours: 3.0,
        date: '2019-02-16T06:29:32.814Z',
      },
    ];
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('should delete case time tracking', async () => {
    sandbox.stub(DBUtil, 'createTransaction').resolves(transaction);

    sandbox.stub(db.XerceCaseTimeTracking, 'destroy').withArgs({
      where: {
        id: timeTrackingId,
        xerceCaseId,
      },
      transaction,
    });

    sandbox
      .stub(XerceCaseTimeTrackingService.prototype, 'updateTotalHoursLogged')
      .withArgs(agencyId, xerceCaseId, transaction);

    sandbox
      .stub(XerceCaseHistoryService.prototype, 'createCaseSummaryHistory')
      .withArgs(
        CaseHistoryActions.CASE_HOURS_DELETED,
        agencyId,
        userId,
        xerceCaseId,
        transaction
      );

    sandbox
      .stub(XerceCaseTimeTrackingService.prototype, 'get')
      .resolves(response);

    sandbox.stub(DBUtil, 'commitTransaction').withArgs(transaction);

    const result = await xerceCaseTimeTrackingService.delete(
      agencyId,
      userId,
      xerceCaseId,
      userId
    );

    expect(result).to.deep.equal(response);
  });

  it('should throw error while deleting case time tracking', async () => {
    sandbox.stub(DBUtil, 'createTransaction').resolves(transaction);

    sandbox
      .stub(db.XerceCaseTimeTracking, 'destroy')
      .withArgs({
        where: {
          id: timeTrackingId,
          xerceCaseId,
        },
        transaction,
      })
      .throws('Error');

    sandbox
      .stub(XerceCaseTimeTrackingService.prototype, 'updateTotalHoursLogged')
      .withArgs(agencyId, xerceCaseId, transaction);

    sandbox
      .stub(XerceCaseTimeTrackingService.prototype, 'get')
      .withArgs(agencyId, xerceCaseId)
      .resolves(response);

    sandbox
      .stub(XerceCaseHistoryService.prototype, 'createCaseSummaryHistory')
      .withArgs(
        CaseHistoryActions.CASE_HOURS_DELETED,
        agencyId,
        userId,
        xerceCaseId,
        transaction
      );

    sandbox.stub(DBUtil, 'rollbackTransaction').withArgs(transaction);
    await xerceCaseTimeTrackingService
      .delete(agencyId, xerceCaseId, timeTrackingId, userId)
      .catch(err => expect(err.name).to.equal('InternalServerError'));
  });
});
