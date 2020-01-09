import { expect } from 'chai';
import 'mocha';
import * as sinon from 'sinon';

import db from '../../../../api/models';
import XerceCaseStatusActivityService from '../../../../api/service/xerce/xerceCaseStatusActivity';
//import DBUtil from '../../../../api/utils/dbUtil';

describe('XerceCaseStatusActivity Service: create Method', () => {
  let sandbox;
  const agencyId = 1;
  const caseId = 11;
  let transaction;
  const caseStatus = XerceCaseStatus.OPEN;

  const caseUser: ICaseUser = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
  };

  const caseStatusActivityObj: IXerceCaseStatusActivityAttributes = {
    agencyId,
    xerceCaseId: caseId,
    status: caseStatus,
    createdBy: caseUser.id,
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    transaction = sinon.stub();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should create the case status activity', async () => {
    sandbox
      .stub(db.XerceCaseStatusActivity, 'create')
      .withArgs(caseStatusActivityObj, {
        transaction,
      });

    await new XerceCaseStatusActivityService()
      .create(agencyId, caseId, caseStatus, caseUser.id, transaction)
      .catch(err => expect(err.name).to.equal('Error'));
  });

  it('should throw error while creating case status activity', async () => {
    sandbox
      .stub(db.XerceCaseStatusActivity, 'create')
      .withArgs(caseStatusActivityObj, {
        transaction,
      })
      .throws('Error');

    await new XerceCaseStatusActivityService()
      .create(agencyId, caseId, caseStatus, caseUser.id, transaction)
      .catch(err => expect(err.name).to.equal('InternalServerError'));
  });
});

describe('XerceCaseStatusActivity Service: getAll Method', () => {
  let sandbox;
  const agencyId = 1;
  const caseId = 11;
  let xerceCaseStatusActivityRecords;
  let xerceCaseStatusActivity: IXerceCaseStatusActivity[];

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    xerceCaseStatusActivityRecords = [
      {
        id: 1,
        status: XerceCaseStatus.OPEN,
        createdByUser: {
          id: 11,
          firstName: 'John',
          lastName: 'Doe',
        },
        createdAt: new Date('2018-03-30T08:36:22.338Z'),
      },
      {
        id: 2,
        status: XerceCaseStatus.CLOSED,
        createdByUser: {
          id: 11,
          firstName: 'Janet',
          lastName: 'Doe',
        },
        createdAt: new Date('2018-03-31T08:36:22.338Z'),
      },
    ];

    xerceCaseStatusActivity = [
      {
        id: 1,
        status: XerceCaseStatus.OPEN,
        createdBy: {
          id: 11,
          firstName: 'John',
          lastName: 'Doe',
        },
        createdAt: new Date('2018-03-30T08:36:22.338Z'),
      },
      {
        id: 2,
        status: XerceCaseStatus.CLOSED,
        createdBy: {
          id: 11,
          firstName: 'Janet',
          lastName: 'Doe',
        },
        createdAt: new Date('2018-03-31T08:36:22.338Z'),
      },
    ];
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should get all the case status activity', async () => {
    sandbox
      .stub(db.XerceCaseStatusActivity, 'findAll')
      .withArgs({
        where: {
          agencyId,
          xerceCaseId: caseId,
        },
        include: [
          {
            model: db.User,
            as: 'createdByUser',
            attributes: ['id', 'firstName', 'lastName'],
          },
        ],
        order: [['id', 'asc']],
      })
      .resolves(xerceCaseStatusActivityRecords);

    const result = await new XerceCaseStatusActivityService().getAll(
      agencyId,
      caseId
    );

    expect(result).to.deep.equal(xerceCaseStatusActivity);
  });

  it('should throw error while fetching case status activity', async () => {
    sandbox
      .stub(db.XerceCaseStatusActivity, 'findAll')
      .withArgs({
        where: {
          agencyId,
          xerceCaseId: caseId,
        },
        include: [
          {
            model: db.User,
            as: 'createdByUser',
            attributes: ['id', 'firstName', 'lastName'],
          },
        ],
        order: [['id', 'asc']],
      })
      .throws('Error');

    await new XerceCaseStatusActivityService()
      .getAll(agencyId, caseId)
      .catch(err => expect(err.name).to.equal('InternalServerError'));
  });
});

describe('XerceCaseStatusActivity Service: getInstance method', () => {
  let sandbox;
  const agencyId = 1;
  const caseId = 11;
  let xerceCaseStatusActivityRecord;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    xerceCaseStatusActivityRecord = {
      id: 1,
      status: XerceCaseStatus.OPEN,
      createdByUser: {
        id: 11,
        firstName: 'John',
        lastName: 'Doe',
      },
      createdAt: new Date('2018-03-30T08:36:22.338Z'),
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should get the case status activity', async () => {
    sandbox
      .stub(db.XerceCaseStatusActivity, 'findOne')
      .withArgs({
        where: {
          agencyId,
          xerceCaseId: caseId,
          id: xerceCaseStatusActivityRecord.id,
        },
      })
      .resolves(xerceCaseStatusActivityRecord);

    await new XerceCaseStatusActivityService().getInstance(
      agencyId,
      caseId,
      xerceCaseStatusActivityRecord.id
    );
  });

  it('should throw error when status activity doesnot belong to the case', async () => {
    sandbox
      .stub(db.XerceCaseStatusActivity, 'findOne')
      .withArgs({
        where: {
          agencyId,
          xerceCaseId: caseId,
          id: xerceCaseStatusActivityRecord.id,
        },
      })
      .resolves(null);

    await new XerceCaseStatusActivityService()
      .getInstance(agencyId, caseId, xerceCaseStatusActivityRecord.id)
      .catch(err => expect(err.name).to.equal('InvalidRequestError'));
  });

  it('should throw error while fetching case status activity', async () => {
    sandbox
      .stub(db.XerceCaseStatusActivity, 'findOne')
      .withArgs({
        where: {
          agencyId,
          xerceCaseId: caseId,
          id: xerceCaseStatusActivityRecord.id,
        },
      })
      .throws('Error');

    await new XerceCaseStatusActivityService()
      .getInstance(agencyId, caseId, xerceCaseStatusActivityRecord.id)
      .catch(err => expect(err.name).to.equal('InternalServerError'));
  });
});

describe('XerceCaseStatusActivity Service: getCaseCreatedInstance method', () => {
  let sandbox;
  const agencyId = 1;
  const caseId = 11;
  let xerceCaseStatusActivityRecord;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    xerceCaseStatusActivityRecord = {
      id: 1,
      status: XerceCaseStatus.OPEN,
      createdByUser: {
        id: 11,
        firstName: 'John',
        lastName: 'Doe',
      },
      createdAt: new Date('2018-03-30T08:36:22.338Z'),
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should get the first logged case status activity', async () => {
    sandbox
      .stub(db.XerceCaseStatusActivity, 'findOne')
      .withArgs({
        where: {
          agencyId,
          xerceCaseId: caseId,
        },
        order: [['createdAt', 'asc']],
        limit: 1,
      })
      .resolves(xerceCaseStatusActivityRecord);

    await new XerceCaseStatusActivityService().getCaseCreatedInstance(
      agencyId,
      caseId
    );
  });

  it('should throw error while fetching case status activity', async () => {
    sandbox
      .stub(db.XerceCaseStatusActivity, 'findOne')
      .withArgs({
        where: {
          agencyId,
          xerceCaseId: caseId,
        },
        order: [['createdAt', 'asc']],
        limit: 1,
      })
      .throws('Error');

    await new XerceCaseStatusActivityService()
      .getCaseCreatedInstance(agencyId, caseId)
      .catch(err => expect(err.name).to.equal('InternalServerError'));
  });
});
