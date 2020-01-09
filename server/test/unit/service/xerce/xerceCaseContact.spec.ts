import { expect } from 'chai';
import 'mocha';
import * as sinon from 'sinon';

import db from '../../../../api/models';
import CaseRoleService from '../../../../api/service/agencySetup/configCaseRole';
import ContactService from '../../../../api/service/contact/contact';
import XerceCaseListingService from '../../../../api/service/xerce/caseListing';
import XerceCaseService from '../../../../api/service/xerce/xerceCase';
import XerceCaseContactService from '../../../../api/service/xerce/xerceCaseContact';
import XerceCaseHistoryService from '../../../../api/service/xerce/xerceCaseHistory';
import DBUtil from '../../../../api/utils/dbUtil';

const xerceCaseContactService = new XerceCaseContactService();

describe('xerceCaseContact Service: Edit Case Contact', () => {
  let sandbox;
  const agencyId = 1;
  const xerceCaseId = 2;
  const xerceCaseContactId = 4;
  const contactId = 5;
  const caseRoleId = 6;
  const userId = 12;

  let responseObj;
  let xerceCaseContact;
  let caseContactRequest;
  let result;
  let transaction;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    transaction = sinon.stub();

    xerceCaseContact = {
      id: xerceCaseContactId,
      agencyId,
      xerceCaseId,
      contactId,
      caseContactRoleId: 8,
      isBillable: false,
      contact: {
        id: contactId,
        agencyId,
        contactType: ContactType.INDIVIDUAL,
        name: 'Janet Doe',
        isVendor: true,
        isGisPopulated: true,
        email: 'janet@doe.com',
        workPhone: '+9198765456',
        cellPhone: '+9198765456',
        streetAddress: '545,Alabama',
        city: 'Alabama',
        state: 'AL',
        zip: '94016',
        note: null,
        contactCustomFieldValues: {},
      },
      save: () => Promise.resolve(),
    };

    caseContactRequest = {
      billableContact: true,
      caseRoleId,
    };

    responseObj = [
      {
        id: 4,
        caseContactId: xerceCaseContactId,
        name: 'Janet Doe',
        contactType: 'LEGAL_ENTITY',
        isVendor: false,
        isGisPopulated: true,
        email: 'janet@doe.com',
        cellPhone: '+9198765456',
        workPhone: '+9198765456',
        streetAddress: '545,Alabama',
        city: 'Alabama',
        state: 'AL',
        zip: '94016',
        note: null,
        contactCustomFieldValues: null,
        isBillable: true,
        caseContactRole: caseRoleId,
      },
    ];
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 with contact details', async () => {
    sandbox
      .stub(XerceCaseContactService.prototype, 'get')
      .withArgs(agencyId, xerceCaseId, xerceCaseContactId)
      .resolves(xerceCaseContact);

    sandbox
      .stub(XerceCaseContactService.prototype, 'validateCaseContactRoleIds')
      .withArgs(agencyId, [caseRoleId]);

    sandbox.stub(DBUtil, 'createTransaction').resolves(transaction);

    sandbox
      .stub(XerceCaseService.prototype, 'setUpdatedAt')
      .withArgs(agencyId, xerceCaseId, transaction);

    sandbox.stub(DBUtil, 'commitTransaction').withArgs(transaction);

    sandbox.stub(XerceCaseListingService.prototype, 'refreshCaseListing');

    sandbox
      .stub(XerceCaseContactService.prototype, 'getAll')
      .withArgs(agencyId, xerceCaseId)
      .resolves(responseObj);

    result = await xerceCaseContactService.edit(
      agencyId,
      xerceCaseId,
      userId,
      xerceCaseContactId,
      caseContactRequest
    );

    expect(result).to.deep.equal(responseObj, 'response did not match');
  });

  it('Should return status code 400 with InternalServerError', async () => {
    xerceCaseContact = {
      id: xerceCaseContactId,
      agencyId,
      xerceCaseId,
      contactId,
      caseContactRoleId: 8,
      isBillable: false,
      contact: {
        id: contactId,
        agencyId,
        contactType: ContactType.INDIVIDUAL,
        name: 'Janet Doe',
        isVendor: true,
        isGisPopulated: true,
        email: 'janet@doe.com',
        workPhone: '+9198765456',
        cellPhone: '+9198765456',
        streetAddress: '545,Alabama',
        city: 'Alabama',
        state: 'AL',
        zip: '94016',
        note: null,
        contactCustomFieldValues: {},
      },
      save: () =>
        Promise.reject(new Error('Error while updating bill to contact')),
    };
    sandbox
      .stub(XerceCaseContactService.prototype, 'get')
      .withArgs(agencyId, xerceCaseId, xerceCaseContactId)
      .resolves(xerceCaseContact);

    sandbox
      .stub(XerceCaseContactService.prototype, 'validateCaseContactRoleIds')
      .withArgs(agencyId, [caseRoleId]);

    await xerceCaseContactService
      .edit(
        agencyId,
        xerceCaseId,
        userId,
        xerceCaseContactId,
        caseContactRequest
      )
      .catch(err => {
        expect(err.name).to.deep.equal('InternalServerError');
      });
  });
});

describe('xerceCaseContact Service: Get Case Contact', () => {
  let sandbox;
  const agencyId = 1;
  const xerceCaseId = 2;
  const xerceCaseContactId = 4;
  const contactId = 5;

  let xerceCaseContact;
  let result;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    xerceCaseContact = {
      id: xerceCaseContactId,
      agencyId,
      xerceCaseId,
      contactId,
      caseContactRoleId: 8,
      isBillable: false,
      contact: {
        id: contactId,
        agencyId,
        contactType: ContactType.INDIVIDUAL,
        name: 'Janet Doe',
        isVendor: true,
        isGisPopulated: true,
        email: 'janet@doe.com',
        workPhone: '+9198765456',
        cellPhone: '+9198765456',
        streetAddress: '545,Alabama',
        city: 'Alabama',
        state: 'AL',
        zip: '94016',
        note: null,
        contactCustomFieldValues: {},
      },
    };
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 with contact details', async () => {
    sandbox
      .stub(db.XerceCaseContact, 'findOne')
      .withArgs({
        where: {
          agencyId,
          xerceCaseId,
          id: xerceCaseContactId,
        },
        include: [
          {
            model: db.Contact,
            as: 'contact',
          },
          {
            model: db.ConfigCaseRole,
            as: 'caseContactRole',
          },
        ],
      })
      .returns(xerceCaseContact);

    result = await xerceCaseContactService.get(
      agencyId,
      xerceCaseId,
      xerceCaseContactId
    );

    expect(result).to.deep.equal(xerceCaseContact, 'response did not match');
  });

  it('Should return status code 400 with InvalidRequestError', async () => {
    sandbox
      .stub(db.XerceCaseContact, 'findOne')
      .withArgs({
        where: {
          agencyId,
          xerceCaseId,
          id: xerceCaseContactId,
        },
        include: [
          {
            model: db.Contact,
            as: 'contact',
          },
          {
            model: db.ConfigCaseRole,
            as: 'caseContactRole',
          },
        ],
      })
      .returns(null);

    await xerceCaseContactService
      .get(agencyId, xerceCaseId, xerceCaseContactId)
      .catch(err => {
        expect(err.name).to.deep.equal('InvalidRequestError');
      });
  });

  it('Should return status code 400 with InternalServerError', async () => {
    sandbox
      .stub(db.XerceCaseContact, 'findOne')
      .withArgs({
        where: {
          agencyId,
          xerceCaseId,
          id: xerceCaseContactId,
        },
        include: [
          {
            model: db.Contact,
            as: 'contact',
          },
          {
            model: db.ConfigCaseRole,
            as: 'caseContactRole',
          },
        ],
      })
      .throws({ name: 'InternalServerError' });

    await xerceCaseContactService
      .get(agencyId, xerceCaseId, xerceCaseContactId)
      .catch(err => {
        expect(err.name).to.deep.equal('InternalServerError');
      });
  });
});

describe('xerceCaseContact Service: create method', () => {
  let sandbox;
  const agencyId = 1;
  const xerceCaseId = 2;
  const xerceCaseContactId = 4;
  const contactId = 5;
  const userId = 12;

  let contactsRequest;
  let contacts;
  let result;
  let transaction;
  let xerceCaseContacts;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    transaction = sinon.stub();

    contacts = [
      {
        id: contactId,
        name: 'Janet Doe',
        contactType: ContactType.INDIVIDUAL,
        isVendor: true,
        isGisPopulated: true,
        email: 'janet@doe.com',
        workPhone: '+9198765456',
        cellPhone: '+9198765456',
        streetAddress: '545,Alabama',
        city: 'Alabama',
        state: 'AL',
        zip: '94016',
        note: null,
        contactCustomFieldValues: {},
        associatedContacts: [],
      },
    ];

    contactsRequest = [
      {
        id: contactId,
        isBillable: true,
      },
    ];

    xerceCaseContacts = [
      {
        id: xerceCaseContactId,
        caseContactId: contactId,
        name: 'Janet Doe',
        contactType: ContactType.INDIVIDUAL,
        isVendor: true,
        isGisPopulated: true,
        email: 'janet@doe.com',
        cellPhone: '+9198765456',
        workPhone: '+9198765456',
        streetAddress: '545,Alabama',
        city: 'Alabama',
        state: 'AL',
        zip: '94016',
        note: '',
        contactCustomFieldValues: null,
        isBillable: false,
        caseContactRole: null,
      },
    ];
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 with contact details', async () => {
    sandbox
      .stub(ContactService.prototype, 'getContactByIds')
      .withArgs(agencyId, [contactId])
      .resolves(contacts);

    sandbox
      .stub(XerceCaseContactService.prototype, 'createXerceCaseContacts')
      .withArgs(agencyId, xerceCaseId, contactsRequest, contacts, transaction)
      .returns(xerceCaseContacts);

    sandbox
      .stub(XerceCaseService.prototype, 'setUpdatedAt')
      .withArgs(agencyId, xerceCaseId, transaction);

    sandbox
      .stub(XerceCaseContactService.prototype, 'getAll')
      .withArgs(agencyId, xerceCaseId)
      .returns(xerceCaseContacts);

    sandbox
      .stub(XerceCaseHistoryService.prototype, 'createContactHistory')
      .withArgs(
        agencyId,
        xerceCaseId,
        userId,
        null,
        xerceCaseContacts[0],
        null,
        `${xerceCaseContacts[0]}.name`,
        CaseHistoryActions.CONTACT_ADDED,
        transaction
      );

    sandbox.stub(XerceCaseListingService.prototype, 'refreshCaseListing');

    result = await xerceCaseContactService.create(
      agencyId,
      xerceCaseId,
      userId,
      contactsRequest,
      transaction
    );

    expect(result).to.deep.equal(xerceCaseContacts, 'response did not match');
  });

  it('Should return status code 400 with InternalServerError', async () => {
    sandbox
      .stub(ContactService.prototype, 'getContactByIds')
      .withArgs(agencyId, [contactId])
      .resolves(contacts);

    sandbox
      .stub(XerceCaseHistoryService.prototype, 'createContactHistory')
      .withArgs(
        agencyId,
        xerceCaseId,
        userId,
        null,
        xerceCaseContacts[0],
        null,
        `${xerceCaseContacts[0]}.name`,
        CaseHistoryActions.CONTACT_ADDED,
        transaction
      );

    sandbox
      .stub(XerceCaseContactService.prototype, 'createXerceCaseContacts')
      .withArgs(agencyId, xerceCaseId, contactsRequest, contacts, transaction)
      .throws({ name: 'Error' });

    sandbox.stub(XerceCaseListingService.prototype, 'refreshCaseListing');

    await xerceCaseContactService
      .create(agencyId, xerceCaseId, userId, contactsRequest, transaction)
      .catch(err => {
        expect(err.name).to.deep.equal('InternalServerError');
      });
  });
});

describe('xerceCaseContact Service: createXerceCaseContacts method', () => {
  let sandbox;
  const agencyId = 1;
  const xerceCaseId = 2;
  const xerceCaseContactId = 4;
  const contactId = 5;

  let xerceCaseContactRequest;
  let contacts;
  let result;
  let transaction;
  let xerceCaseContacts;
  let responseObj;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    transaction = sinon.stub();

    contacts = [
      {
        id: contactId,
        name: 'Janet Doe',
        contactType: ContactType.INDIVIDUAL,
        isVendor: true,
        isGisPopulated: true,
        email: 'janet@doe.com',
        workPhone: '+9198765456',
        cellPhone: '+9198765456',
        streetAddress: '545,Alabama',
        city: 'Alabama',
        state: 'AL',
        zip: '94016',
        note: 'test',
        contactCustomFieldValues: {},
        associatedContacts: [],
      },
    ];

    xerceCaseContactRequest = [
      {
        id: contactId,
        isBillable: true,
        caseContactRoleId: 7,
      },
    ];

    xerceCaseContacts = [
      {
        id: xerceCaseContactId,
        contactId,
        name: 'Janet Doe',
        contactType: ContactType.INDIVIDUAL,
        isVendor: true,
        isGisPopulated: true,
        email: 'janet@doe.com',
        cellPhone: '+9198765456',
        workPhone: '+9198765456',
        streetAddress: '545,Alabama',
        city: 'Alabama',
        state: 'AL',
        zip: '94016',
        note: 'test',
        contactCustomFieldValues: {},
        isBillable: false,
        caseContactRole: null,
      },
    ];

    responseObj = [
      {
        id: contactId,
        caseContactId: xerceCaseContactId,
        name: 'Janet Doe',
        contactType: ContactType.INDIVIDUAL,
        isVendor: true,
        isGisPopulated: true,
        email: 'janet@doe.com',
        cellPhone: '+9198765456',
        workPhone: '+9198765456',
        streetAddress: '545,Alabama',
        city: 'Alabama',
        state: 'AL',
        zip: '94016',
        note: 'test',
        contactCustomFieldValues: {},
        isBillable: false,
        caseContactRole: null,
      },
    ];
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 with contact details', async () => {
    sandbox
      .stub(XerceCaseContactService.prototype, 'validateCaseContactRoleIds')
      .withArgs(agencyId, [7]);

    sandbox.stub(db.XerceCaseContact, 'bulkCreate').resolves(xerceCaseContacts);

    result = await xerceCaseContactService.createXerceCaseContacts(
      agencyId,
      xerceCaseId,
      xerceCaseContactRequest,
      contacts,
      transaction
    );

    expect(result).to.deep.equal(responseObj, 'response did not match');
  });

  it('Should return status code 400 with InternalServerError', async () => {
    sandbox
      .stub(XerceCaseContactService.prototype, 'validateCaseContactRoleIds')
      .withArgs(agencyId, [7]);

    sandbox
      .stub(db.XerceCaseContact, 'bulkCreate')
      .resolves(xerceCaseContacts)
      .throws({ name: 'Error' });

    await xerceCaseContactService
      .createXerceCaseContacts(
        agencyId,
        xerceCaseId,
        xerceCaseContactRequest,
        contacts,
        transaction
      )
      .catch(err => {
        expect(err.name).to.deep.equal('InternalServerError');
      });
  });

  it('Should return status code 400 with InternalServerError', async () => {
    sandbox
      .stub(XerceCaseContactService.prototype, 'validateCaseContactRoleIds')
      .withArgs(agencyId, [7]);

    sandbox
      .stub(db.XerceCaseContact, 'bulkCreate')
      .resolves(xerceCaseContacts)
      .throws({ name: 'SequelizeUniqueConstraintError' });

    await xerceCaseContactService
      .createXerceCaseContacts(
        agencyId,
        xerceCaseId,
        xerceCaseContactRequest,
        contacts,
        transaction
      )
      .catch(err => {
        expect(err.name).to.deep.equal('DBConflictError');
      });
  });
});

describe('xerceCaseContact Service: Get All Cases Contact', () => {
  let sandbox;
  const agencyId = 1;
  const xerceCaseId = 2;
  const xerceCaseContactId = 4;
  const contactId = 5;

  let xerceCaseContacts;
  let contact;
  let responseObj;
  let result;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    contact = {
      id: contactId,
      name: 'Janet Doe',
      contactType: ContactType.INDIVIDUAL,
      isVendor: true,
      isGisPopulated: true,
      email: 'janet@doe.com',
      workPhone: '+9198765456',
      cellPhone: '+9198765456',
      streetAddress: '545,Alabama',
      city: 'Alabama',
      state: 'AL',
      zip: '94016',
      note: null,
      contactCustomFieldValues: {},
      associatedContacts: [],
    };

    xerceCaseContacts = [
      {
        id: xerceCaseContactId,
        contactId: xerceCaseContactId,
        xerceCaseId: 6,
        caseContactRoleId: 7,
        isBillable: true,
        contact,
      },
    ];

    responseObj = [
      {
        id: contactId,
        caseContactId: xerceCaseContactId,
        name: 'Janet Doe',
        contactType: ContactType.INDIVIDUAL,
        isVendor: true,
        isGisPopulated: true,
        email: 'janet@doe.com',
        workPhone: '+9198765456',
        cellPhone: '+9198765456',
        streetAddress: '545,Alabama',
        city: 'Alabama',
        state: 'AL',
        zip: '94016',
        note: null,
        contactCustomFieldValues: {},
      },
    ];
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 with contact details', async () => {
    sandbox
      .stub(db.XerceCaseContact, 'findAll')
      .withArgs({
        where: {
          agencyId,
          xerceCaseId,
        },
        include: [
          {
            model: db.Contact,
            as: 'contact',
          },
          {
            model: db.ConfigCaseRole,
            as: 'caseContactRole',
          },
        ],
        order: ['id'],
      })
      .returns(xerceCaseContacts);

    sandbox
      .stub(ContactService.prototype, 'createContactRespObj')
      .withArgs(xerceCaseContacts[0].contact)
      .returns(contact);

    sandbox
      .stub(XerceCaseContactService.prototype, 'createXerceCaseContactRespObj')
      .withArgs([contact], xerceCaseContacts)
      .returns(responseObj);

    result = await xerceCaseContactService.getAll(agencyId, xerceCaseId);

    expect(result).to.deep.equal(responseObj, 'response did not match');
  });

  it('Should return status code 400 with InvalidRequestError', async () => {
    sandbox
      .stub(db.XerceCaseContact, 'findAll')
      .withArgs({
        where: {
          agencyId,
          xerceCaseId,
        },
        include: [
          {
            model: db.Contact,
            as: 'contact',
          },
          {
            model: db.ConfigCaseRole,
            as: 'caseContactRole',
          },
        ],
        order: ['id'],
      })
      .returns(null);

    await xerceCaseContactService.getAll(agencyId, xerceCaseId).catch(err => {
      expect(err.name).to.deep.equal('InvalidRequestError');
    });
  });

  it('Should return status code 400 with InvalidRequestError', async () => {
    sandbox
      .stub(db.XerceCaseContact, 'findAll')
      .withArgs({
        where: {
          agencyId,
          xerceCaseId,
        },
        include: [
          {
            model: db.Contact,
            as: 'contact',
          },
          {
            model: db.ConfigCaseRole,
            as: 'caseContactRole',
          },
        ],
        order: ['id'],
      })
      .throws({ name: 'InternalServerError' });

    await xerceCaseContactService.getAll(agencyId, xerceCaseId).catch(err => {
      expect(err.name).to.deep.equal('InternalServerError');
    });
  });
});

describe('xerceCaseContact Service: Delete Case Contact', () => {
  let sandbox;
  const agencyId = 1;
  const xerceCaseId = 2;
  const xerceCaseContactId = 4;
  const contactId = 5;
  const userId = 12;

  let caseContact;
  let transaction;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    transaction = sinon.stub();

    caseContact = {
      id: xerceCaseContactId,
      agencyId,
      xerceCaseId,
      contactId,
      caseContactRoleId: 8,
      isBillable: false,
      contact: {
        id: contactId,
        agencyId,
        contactType: ContactType.INDIVIDUAL,
        name: 'Janet Doe',
        isVendor: true,
        isGisPopulated: true,
        email: 'janet@doe.com',
        workPhone: '+9198765456',
        cellPhone: '+9198765456',
        streetAddress: '545,Alabama',
        city: 'Alabama',
        state: 'AL',
        zip: '94016',
        note: null,
        contactCustomFieldValues: {},
      },
    };
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200', async () => {
    sandbox
      .stub(XerceCaseContactService.prototype, 'get')
      .resolves(caseContact);

    sandbox.stub(DBUtil, 'createTransaction').resolves(transaction);

    sandbox.stub(db.XerceCaseContact, 'destroy').withArgs({
      where: {
        id: xerceCaseContactId,
      },
      transaction,
    });

    sandbox
      .stub(XerceCaseService.prototype, 'setUpdatedAt')
      .withArgs(agencyId, xerceCaseId, transaction);

    sandbox.stub(DBUtil, 'commitTransaction').withArgs(transaction);

    sandbox.stub(XerceCaseListingService.prototype, 'refreshCaseListing');

    await xerceCaseContactService.delete(
      agencyId,
      xerceCaseId,
      userId,
      xerceCaseContactId
    );
  });

  it('Should return status code 400 with InternalServerError', async () => {
    sandbox
      .stub(XerceCaseContactService.prototype, 'get')
      .resolves(caseContact);

    sandbox
      .stub(db.XerceCaseContact, 'destroy')
      .withArgs({
        where: {
          id: xerceCaseContactId,
        },
      })
      .throws({ name: 'InternalServerError' });

    await xerceCaseContactService
      .delete(agencyId, xerceCaseId, userId, xerceCaseContactId)
      .catch(err => {
        expect(err.name).to.deep.equal('InternalServerError');
      });
  });

  it('Should return status code 400 with DBMissingEntityError', async () => {
    sandbox.stub(XerceCaseContactService.prototype, 'get').resolves(null);

    await xerceCaseContactService
      .delete(agencyId, xerceCaseId, userId, xerceCaseContactId)
      .catch(err => {
        expect(err.name).to.deep.equal('DBMissingEntityError');
      });
  });
});

describe('xerceCaseContact Service: validateCaseContactRoleIds method', () => {
  let sandbox;
  const agencyId = 1;
  const caseRoleIds = [2, 3];

  let caseRoles;
  let result;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    caseRoles = [
      {
        id: 2,
        label: 'Owner',
        isDefault: true,
        isGisPopulated: true,
        isActive: true,
        sequence: 2,
      },
      {
        id: 3,
        label: 'Agent',
        isDefault: false,
        isGisPopulated: true,
        isActive: true,
        sequence: 3,
      },
    ];
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200', async () => {
    sandbox
      .stub(CaseRoleService.prototype, 'getAllActiveByIds')
      .withArgs(agencyId, caseRoleIds)
      .returns(caseRoles);

    result = await (xerceCaseContactService as any).__proto__.validateCaseContactRoleIds(
      agencyId,
      caseRoleIds
    );

    expect(result).to.deep.equal(true, 'response did not match');
  });

  it('Should return InvalidRequestError Exception', async () => {
    sandbox
      .stub(CaseRoleService.prototype, 'getAllActiveByIds')
      .withArgs(agencyId, caseRoleIds)
      .returns([]);

    await (xerceCaseContactService as any).__proto__
      .validateCaseContactRoleIds(agencyId, caseRoleIds)
      .catch(err => {
        expect(err.name).to.deep.equal('InvalidRequestError');
      });
  });
});
