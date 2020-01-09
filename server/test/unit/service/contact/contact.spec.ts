import 'mocha';

import { expect } from 'chai';
import * as sinon from 'sinon';
import db from '../../../../api/models';
import ContactService from '../../../../api/service/contact/contact';
import DBUtil from '../../../../api/utils/dbUtil';
const contactService = new ContactService();

describe('Contact Service: Edit Contact', () => {
  let sandbox;
  const agencyId = 1;
  const contactId = 5;

  let responseObj;
  let existingContact;
  let result;
  let contactReq;
  let associatedContacts;
  let transaction;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    transaction = sinon.stub();

    contactReq = {
      name: 'john Doe',
      contactType: ContactType.INDIVIDUAL,
      isVendor: true,
      isGisPopulated: false,
      email: 'john@doe.com',
      workPhone: '+9198765456',
      cellPhone: '+9198765456',
      streetAddress: '545,Alabama',
      city: 'Alabama',
      state: 'AL',
      zip: '94016',
      note: 'blue',
      associatedContacts: [
        {
          id: 2,
          isPrimary: false,
        },
      ],
    };

    existingContact = {
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
      save: () => Promise.resolve(),
      setLegalEntityContacts: () =>
        Promise.resolve([
          associatedContacts,
          {
            through: { agencyId },
            transaction,
          },
        ]),
      setIndividualContacts: () =>
        Promise.resolve([
          associatedContacts,
          {
            through: { agencyId },
            transaction,
          },
        ]),
    };

    associatedContacts = [
      {
        id: 2,
        name: 'Janet Doe',
        email: 'janet@doe.com',
        contactType: 'LEGAL_ENTITY',
        isVendor: false,
        isGisPopulated: true,
        workPhone: '+9198765456',
        cellPhone: '+9198765456',
        streetAddress: '545,Alabama',
        city: 'Alabama',
        state: 'AL',
        zip: '94016',
        isPrimary: false,
      },
    ];

    responseObj = {
      id: contactId,
      name: 'john Doe',
      email: 'john@doe.com',
      contactType: 'INDIVIDUAL',
      isVendor: true,
      isGisPopulated: false,
      workPhone: '+9198765456',
      cellPhone: '+9198765456',
      streetAddress: '545,Alabama',
      city: 'Alabama',
      state: 'AL',
      zip: '94016',
      note: 'blue',
      contactCustomFieldValues: null,
      associatedContacts,
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('Should return status code 200 with contact details', async () => {
    sandbox
      .stub(db.Contact, 'findOne')
      .withArgs({
        where: {
          agencyId,
          id: contactId,
        },
      })
      .returns(existingContact);

    sandbox
      .stub(ContactService.prototype, 'fetchAssociatedContacts')
      .withArgs(agencyId, contactReq)
      .returns(associatedContacts);

    sandbox
      .stub(ContactService.prototype, 'editContactObj')
      .withArgs(existingContact, contactReq);

    sandbox.stub(DBUtil, 'createTransaction').resolves(transaction);

    sandbox.stub(DBUtil, 'commitTransaction').resolves(transaction);

    sandbox.stub(DBUtil, 'rollbackTransaction').resolves(transaction);

    sandbox
      .stub(ContactService.prototype, 'get')
      .withArgs(agencyId, contactId)
      .returns(responseObj);

    result = await contactService.edit(agencyId, contactId, contactReq);

    expect(result).to.deep.equal(responseObj, 'response did not match');
  });

  it('Should return status code 400 with InternalServerError for fetching contact', async () => {
    sandbox
      .stub(db.Contact, 'findOne')
      .withArgs({
        where: {
          agencyId,
          id: contactId,
        },
      })
      .returns(null);

    sandbox.stub(DBUtil, 'rollbackTransaction').resolves(transaction);

    await contactService.edit(agencyId, contactId, contactReq).catch(err => {
      expect(err.name).to.deep.equal('DBMissingEntityError');
    });
  });

  it('Should return status code 400 with DBMissingEntityError', async () => {
    sandbox
      .stub(db.Contact, 'findOne')
      .withArgs({
        where: {
          agencyId,
          id: contactId,
        },
      })
      .throws({ name: 'InternalServerError' });

    sandbox.stub(DBUtil, 'rollbackTransaction').resolves(transaction);

    await contactService.edit(agencyId, contactId, contactReq).catch(err => {
      expect(err.name).to.deep.equal('InternalServerError');
    });
  });

  it('Should return status code 400 with InvalidRequestError', async () => {
    existingContact.contactType = ContactType.LEGAL_ENTITY;
    sandbox
      .stub(db.Contact, 'findOne')
      .withArgs({
        where: {
          agencyId,
          id: contactId,
        },
      })
      .returns(existingContact);

    sandbox.stub(DBUtil, 'rollbackTransaction').resolves(transaction);

    await contactService.edit(agencyId, contactId, contactReq).catch(err => {
      expect(err.name).to.deep.equal('InvalidRequestError');
    });
  });

  it('Should return status code 400 with DBConflictError', async () => {
    existingContact = {
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
      save: () => Promise.reject({ name: 'SequelizeUniqueConstraintError' }),
      setLegalEntityContacts: () =>
        Promise.resolve([
          associatedContacts,
          {
            through: { agencyId },
            transaction,
          },
        ]),
      setIndividualContacts: () =>
        Promise.resolve([
          associatedContacts,
          {
            through: { agencyId },
            transaction,
          },
        ]),
    };

    sandbox
      .stub(db.Contact, 'findOne')
      .withArgs({
        where: {
          agencyId,
          id: contactId,
        },
      })
      .returns(existingContact);

    sandbox
      .stub(ContactService.prototype, 'fetchAssociatedContacts')
      .withArgs(agencyId, contactReq)
      .returns(associatedContacts);

    sandbox
      .stub(ContactService.prototype, 'editContactObj')
      .withArgs(existingContact, contactReq);

    sandbox.stub(DBUtil, 'createTransaction').resolves(transaction);

    sandbox.stub(DBUtil, 'rollbackTransaction').resolves(transaction);

    await contactService.edit(agencyId, contactId, contactReq).catch(err => {
      expect(err.name).to.deep.equal('DBConflictError');
    });
  });

  it('Should return status code 400 with InternalServerError', async () => {
    existingContact = {
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
      save: () => Promise.reject({ name: 'InternalServerError' }),
      setLegalEntityContacts: () =>
        Promise.resolve([
          associatedContacts,
          {
            through: { agencyId },
            transaction,
          },
        ]),
      setIndividualContacts: () =>
        Promise.resolve([
          associatedContacts,
          {
            through: { agencyId },
            transaction,
          },
        ]),
    };

    sandbox
      .stub(db.Contact, 'findOne')
      .withArgs({
        where: {
          agencyId,
          id: contactId,
        },
      })
      .returns(existingContact);

    sandbox
      .stub(ContactService.prototype, 'fetchAssociatedContacts')
      .withArgs(agencyId, contactReq)
      .returns(associatedContacts);

    sandbox
      .stub(ContactService.prototype, 'editContactObj')
      .withArgs(existingContact, contactReq);

    sandbox.stub(DBUtil, 'createTransaction').resolves(transaction);

    sandbox.stub(DBUtil, 'rollbackTransaction').resolves(transaction);

    await contactService.edit(agencyId, contactId, contactReq).catch(err => {
      expect(err.name).to.deep.equal('InternalServerError');
    });
  });
});

describe('Contact Service: validateContactCustomField method', () => {
  let sandbox;
  const agencyId = 1;

  let result;
  let contactReq;
  let configContactCustomFields;
  let options;
  let contactCustomFieldValues;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    configContactCustomFields = [
      {
        id: 18,
        agencyId,
        label: 'Driving Licence No',
        contactType: ContactType.INDIVIDUAL,
        isActive: true,
        type: CustomFieldType.TEXT,
        options: [],
        sequence: 1,
        createdAt: new Date('2019-02-16T06:29:32.814Z'),
        updatedAt: new Date('2019-02-16T06:29:32.814Z'),
        deletedAt: new Date('2019-02-16T06:29:32.814Z'),
      },
    ];

    contactCustomFieldValues = {
      '18': 'MH12 AX4191',
    };

    contactReq = {
      name: 'john Doe',
      contactType: ContactType.INDIVIDUAL,
      isVendor: true,
      isGisPopulated: false,
      email: 'john@doe.com',
      workPhone: '+9198765456',
      cellPhone: '+9198765456',
      streetAddress: '545,Alabama',
      city: 'Alabama',
      state: 'AL',
      zip: '94016',
      note: 'blue',
      associatedContacts: [
        {
          id: 2,
          isPrimary: false,
        },
      ],
      contactCustomFieldValues,
    };

    options = {
      agencyId,
      isActive: true,
      contactType: ContactType.INDIVIDUAL,
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('Should return status code 200 with contact details', async () => {
    sandbox
      .stub(db.ConfigContactCustomField, 'findAll')
      .withArgs({
        where: options,
        order: ['sequence'],
      })
      .returns(configContactCustomFields);

    result = await (contactService as any).__proto__.validateContactCustomFieldCreateReq(
      agencyId,
      contactReq
    );

    expect(result).to.deep.equal(
      contactCustomFieldValues,
      'response did not match'
    );
  });

  it('Should return status code 400 with InternalServerError', async () => {
    sandbox
      .stub(db.ConfigContactCustomField, 'findAll')
      .withArgs({
        where: options,
        order: ['sequence'],
      })
      .throws({ name: 'InternalServerError' });

    await (contactService as any).__proto__
      .validateContactCustomFieldCreateReq(agencyId, contactReq)
      .catch(err => {
        expect(err.name).to.deep.equal('InternalServerError');
      });
  });

  it('Should return status code 400 with InvalidRequestError', async () => {
    sandbox
      .stub(db.ConfigContactCustomField, 'findAll')
      .withArgs({
        where: options,
        order: ['sequence'],
      })
      .returns([]);

    await (contactService as any).__proto__
      .validateContactCustomFieldCreateReq(agencyId, contactReq)
      .catch(err => {
        expect(err.name).to.deep.equal('InvalidRequestError');
      });
  });

  it('Should return status code 400 with InvalidRequestError for invalid keys', async () => {
    contactReq = {
      name: 'john Doe',
      contactType: ContactType.INDIVIDUAL,
      isVendor: true,
      isGisPopulated: false,
      email: 'john@doe.com',
      workPhone: '+9198765456',
      cellPhone: '+9198765456',
      streetAddress: '545,Alabama',
      city: 'Alabama',
      state: 'AL',
      zip: '94016',
      note: 'blue',
      associatedContacts: [
        {
          id: 2,
          isPrimary: false,
        },
      ],
      contactCustomFieldValues: {
        '20': 'AQQNU678',
      },
    };

    sandbox
      .stub(db.ConfigContactCustomField, 'findAll')
      .withArgs({
        where: options,
        order: ['sequence'],
      })
      .returns(configContactCustomFields);

    await (contactService as any).__proto__
      .validateContactCustomFieldCreateReq(agencyId, contactReq)
      .catch(err => {
        expect(err.name).to.deep.equal('InvalidRequestError');
      });
  });
});

describe('Contact Service: fetchAssociatedContacts method', () => {
  let sandbox;
  const agencyId = 1;

  let result;
  let contactReq;
  let contacts;
  let contactCustomFieldValues;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    contacts = [
      {
        id: 2,
        name: 'Janet Doe',
        email: 'janet@doe.com',
        contactType: 'LEGAL_ENTITY',
        isVendor: false,
        isGisPopulated: true,
        workPhone: '+9198765456',
        cellPhone: '+9198765456',
        streetAddress: '545,Alabama',
        city: 'Alabama',
        state: 'AL',
        zip: '94016',
        isPrimary: false,
      },
    ];

    contactCustomFieldValues = {
      'Driving Licence No': 'MH12 AX4191',
    };

    contactReq = {
      name: 'john Doe',
      contactType: ContactType.INDIVIDUAL,
      isVendor: true,
      isGisPopulated: false,
      email: 'john@doe.com',
      workPhone: '+9198765456',
      cellPhone: '+9198765456',
      streetAddress: '545,Alabama',
      city: 'Alabama',
      state: 'AL',
      zip: '94016',
      note: 'blue',
      associatedContacts: [
        {
          id: 2,
          isPrimary: false,
        },
      ],
      contactCustomFieldValues,
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('Should return status code 200 with contact details', async () => {
    sandbox
      .stub(ContactService.prototype, 'getAssociatedContactByIds')
      .resolves(contacts);

    result = await (contactService as any).__proto__.fetchAssociatedContacts(
      agencyId,
      contactReq
    );

    expect(result).to.deep.equal(contacts, 'response did not match');
  });

  it('Should return status code 400 with InvalidRequestError', async () => {
    contactReq.associatedContacts = [
      {
        id: 2,
        isPrimary: false,
      },
      {
        id: 2,
        isPrimary: false,
      },
    ];
    sandbox
      .stub(ContactService.prototype, 'getAssociatedContactByIds')
      .resolves(contacts);

    await (contactService as any).__proto__
      .fetchAssociatedContacts(agencyId, contactReq)
      .catch(err => {
        expect(err.name).to.deep.equal('InvalidRequestError');
      });
  });
});

describe('Contact Service: getAssociatedContactByIds method', () => {
  let sandbox;
  const agencyId = 1;
  const contactType = ContactType.INDIVIDUAL;
  let contactIds;

  let result;
  let contacts;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    contactIds = [2];

    contacts = [
      {
        id: contactIds[0],
        name: 'Janet Doe',
        email: 'janet@doe.com',
        contactType: 'LEGAL_ENTITY',
        isVendor: false,
        isGisPopulated: true,
        workPhone: '+9198765456',
        cellPhone: '+9198765456',
        streetAddress: '545,Alabama',
        city: 'Alabama',
        state: 'AL',
        zip: '94016',
        isPrimary: false,
      },
    ];
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('Should return status code 200 with contact details', async () => {
    sandbox
      .stub(db.Contact, 'findAll')
      .withArgs({
        where: {
          agencyId,
          id: contactIds,
          contactType: {
            [db.Sequelize.Op.ne]: contactType,
          },
        },
      })
      .resolves(contacts);

    result = await (contactService as any).__proto__.getAssociatedContactByIds(
      agencyId,
      contactType,
      contactIds
    );

    expect(result).to.deep.equal(contacts, 'response did not match');
  });

  it('Should return status code 400 with InvalidRequestError', async () => {
    contactIds = [2, 3];
    sandbox
      .stub(db.Contact, 'findAll')
      .withArgs({
        where: {
          agencyId,
          id: contactIds,
          contactType: {
            [db.Sequelize.Op.ne]: contactType,
          },
        },
      })
      .resolves(contacts);

    await (contactService as any).__proto__
      .getAssociatedContactByIds(agencyId, contactType, contactIds)
      .catch(err => {
        expect(err.name).to.deep.equal('InvalidRequestError');
      });
  });

  it('Should return status code 400 with InternalServerError', async () => {
    sandbox
      .stub(db.Contact, 'findAll')
      .withArgs({
        where: {
          agencyId,
          id: contactIds,
          contactType: {
            [db.Sequelize.Op.ne]: contactType,
          },
        },
      })
      .throws({ name: 'InternalServerError' });

    await (contactService as any).__proto__
      .getAssociatedContactByIds(agencyId, contactType, contactIds)
      .catch(err => {
        expect(err.name).to.deep.equal('InternalServerError');
      });
  });
});

describe('Contact Service: get method', () => {
  let sandbox;
  const agencyId = 1;
  const contactId = 2;
  let associatedContacts;

  let result;
  let responseObj;
  let contact;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    associatedContacts = [
      {
        id: 4,
        name: 'Janet Doe',
        email: 'janet@doe.com',
        contactType: 'LEGAL_ENTITY',
        isVendor: false,
        isGisPopulated: true,
        workPhone: '+9198765456',
        cellPhone: '+9198765456',
        streetAddress: '545,Alabama',
        city: 'Alabama',
        state: 'AL',
        zip: '94016',
        isPrimary: false,
      },
    ];

    responseObj = {
      id: contactId,
      name: 'john Doe',
      email: 'john@doe.com',
      contactType: 'INDIVIDUAL',
      isVendor: true,
      isGisPopulated: false,
      workPhone: '+9198765456',
      cellPhone: '+9198765456',
      streetAddress: '545,Alabama',
      city: 'Alabama',
      state: 'AL',
      zip: '94016',
      note: 'blue',
      contactCustomFieldValues: null,
      associatedContacts,
    };

    contact = {
      id: contactId,
      name: 'john Doe',
      email: 'john@doe.com',
      contactType: 'INDIVIDUAL',
      isVendor: true,
      isGisPopulated: false,
      workPhone: '+9198765456',
      cellPhone: '+9198765456',
      streetAddress: '545,Alabama',
      city: 'Alabama',
      state: 'AL',
      zip: '94016',
      note: 'blue',
      contactCustomFieldValues: null,
      legalEntityContacts: [
        {
          id: 4,
          name: 'Janet Doe',
          email: 'janet@doe.com',
          contactType: 'LEGAL_ENTITY',
          isVendor: false,
          isGisPopulated: true,
          workPhone: '+9198765456',
          cellPhone: '+9198765456',
          streetAddress: '545,Alabama',
          city: 'Alabama',
          state: 'AL',
          zip: '94016',
          LegalEntityIndividualContact: {
            isPrimary: false,
          },
        },
      ],
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('Should return status code 200 with contact details', async () => {
    sandbox
      .stub(db.Contact, 'findOne')
      .withArgs({
        where: {
          agencyId,
          id: contactId,
        },
        include: [
          {
            model: db.Contact,
            as: 'legalEntityContacts',
          },
          {
            model: db.Contact,
            as: 'individualContacts',
          },
        ],
      })
      .returns(contact);

    result = await contactService.get(agencyId, contactId);

    expect(result).to.deep.equal(responseObj, 'response did not match');
  });

  it('Should return status code 400 with DBMissingEntityError', async () => {
    sandbox
      .stub(db.Contact, 'findOne')
      .withArgs({
        where: {
          agencyId,
          id: contactId,
        },
        include: [
          {
            model: db.Contact,
            as: 'legalEntityContacts',
          },
          {
            model: db.Contact,
            as: 'individualContacts',
          },
        ],
      })
      .returns(null);

    await contactService.get(agencyId, contactId).catch(err => {
      expect(err.name).to.deep.equal('DBMissingEntityError');
    });
  });
});

describe('Contact Service: getContactByIds method', () => {
  let sandbox;
  const agencyId = 1;
  let contactIds;

  let result;
  let contacts;
  let responseObj;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    contactIds = [2];

    contacts = [
      {
        id: contactIds[0],
        name: 'Janet Doe',
        email: 'janet@doe.com',
        contactType: 'LEGAL_ENTITY',
        isVendor: false,
        isGisPopulated: true,
        workPhone: '+9198765456',
        cellPhone: '+9198765456',
        streetAddress: '545,Alabama',
        city: 'Alabama',
        state: 'AL',
        zip: '94016',
        contactCustomFieldValues: {},
        note: 'this is a contact test note',
      },
    ];

    responseObj = [
      {
        id: contactIds[0],
        name: 'Janet Doe',
        email: 'janet@doe.com',
        contactType: 'LEGAL_ENTITY',
        isVendor: false,
        isGisPopulated: true,
        workPhone: '+9198765456',
        cellPhone: '+9198765456',
        streetAddress: '545,Alabama',
        city: 'Alabama',
        state: 'AL',
        zip: '94016',
        associatedContacts: null,
        contactCustomFieldValues: {},
        note: 'this is a contact test note',
      },
    ];
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('Should return status code 200 with contact details', async () => {
    sandbox
      .stub(db.Contact, 'findAll')
      .withArgs({
        where: {
          agencyId,
          id: contactIds,
        },
      })
      .resolves(contacts);

    result = await contactService.getContactByIds(agencyId, contactIds);

    expect(result).to.deep.equal(responseObj, 'response did not match');
  });

  it('Should return status code 400 with InternalServerError', async () => {
    sandbox
      .stub(db.Contact, 'findAll')
      .withArgs({
        where: {
          agencyId,
          id: contactIds,
        },
      })
      .throws({ name: 'Error' });

    await contactService.getContactByIds(agencyId, contactIds).catch(err => {
      expect(err.name).to.deep.equal('InternalServerError');
    });
  });

  it('Should return status code 400 with InvalidRequestError', async () => {
    sandbox
      .stub(db.Contact, 'findAll')
      .withArgs({
        where: {
          agencyId,
          id: contactIds,
        },
      })
      .resolves([]);

    await contactService.getContactByIds(agencyId, contactIds).catch(err => {
      expect(err.name).to.deep.equal('InvalidRequestError');
    });
  });

  it('Should return status code 400 with InvalidRequestError for duplicate contactIds', async () => {
    contactIds = [2, 2];
    await contactService.getContactByIds(agencyId, contactIds).catch(err => {
      expect(err.name).to.deep.equal('InvalidRequestError');
    });
  });
});

describe('Contact Service: getAll method', () => {
  let sandbox;
  const agencyId = 1;
  const contactId = 2;
  const searchString = 'john';
  const location = 'Alabama';
  const excludeContactIds = [1, 2, 3];
  const limit = 1;

  let result;
  let contacts;
  let searchClause;
  let searchFilter;
  let contactType;
  let responseObj;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    contactType = ContactType.LEGAL_ENTITY;

    searchFilter = `%${searchString}%`;

    searchClause = {
      agencyId,
      id: {
        [db.Sequelize.Op.notIn]: excludeContactIds,
      },
      [db.Sequelize.Op.or]: [
        {
          name: {
            [db.Sequelize.Op.iLike]: searchFilter,
          },
        },
        {
          email: {
            [db.Sequelize.Op.iLike]: searchFilter,
          },
        },
        {
          workPhone: {
            [db.Sequelize.Op.iLike]: searchFilter,
          },
        },
        {
          cellPhone: {
            [db.Sequelize.Op.iLike]: searchFilter,
          },
        },
        {
          streetAddress: {
            [db.Sequelize.Op.iLike]: searchFilter,
          },
        },
        {
          city: {
            [db.Sequelize.Op.iLike]: searchFilter,
          },
        },
        {
          state: {
            [db.Sequelize.Op.iLike]: searchFilter,
          },
        },
        {
          zip: {
            [db.Sequelize.Op.iLike]: searchFilter,
          },
        },
      ],
    };

    searchClause.contactType = contactType;

    contacts = [
      {
        id: contactId,
        name: 'Janet Doe',
        email: 'janet@doe.com',
        contactType,
        isVendor: false,
        isGisPopulated: true,
        workPhone: '+9198765456',
        cellPhone: '+9198765456',
        streetAddress: '545,Alabama',
        city: 'Alabama',
        state: 'AL',
        zip: '94016',
        contactCustomFieldValues: {},
        note: 'this is a contact test note',
        individualContacts: [
          {
            id: 4,
            name: 'Janet Doe',
            email: 'janet@doe.com',
            contactType: ContactType.INDIVIDUAL,
            isVendor: false,
            isGisPopulated: true,
            workPhone: '+9198765456',
            cellPhone: '+9198765456',
            streetAddress: '545,Alabama',
            city: 'Alabama',
            state: 'AL',
            zip: '94016',
            LegalEntityIndividualContact: {
              isPrimary: false,
            },
          },
        ],
      },
    ];

    responseObj = {
      individualContacts: [],
      legalEntityContacts: [
        {
          id: contactId,
          name: 'Janet Doe',
          email: 'janet@doe.com',
          contactType,
          isVendor: false,
          isGisPopulated: true,
          workPhone: '+9198765456',
          cellPhone: '+9198765456',
          streetAddress: '545,Alabama',
          city: 'Alabama',
          state: 'AL',
          zip: '94016',
          associatedContacts: [
            {
              id: 4,
              name: 'Janet Doe',
              email: 'janet@doe.com',
              contactType: ContactType.INDIVIDUAL,
              isVendor: false,
              isGisPopulated: true,
              workPhone: '+9198765456',
              cellPhone: '+9198765456',
              streetAddress: '545,Alabama',
              city: 'Alabama',
              state: 'AL',
              zip: '94016',
              isPrimary: false,
            },
          ],
          contactCustomFieldValues: {},
          note: 'this is a contact test note',
        },
      ],
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('Should return status code 200 with contact details for individual entity contact', async () => {
    contactType = searchClause.contactType = ContactType.INDIVIDUAL;

    contacts[0].legalEntityContacts = [
      {
        id: 4,
        name: 'Janet Doe',
        email: 'janet@doe.com',
        contactType: ContactType.LEGAL_ENTITY,
        isVendor: false,
        isGisPopulated: true,
        workPhone: '+9198765456',
        cellPhone: '+9198765456',
        streetAddress: '545,Alabama',
        city: 'Alabama',
        state: 'AL',
        zip: '94016',
        LegalEntityIndividualContact: {
          isPrimary: false,
        },
      },
    ];

    contacts[0].contactType = contactType;

    delete contacts[0].individualContacts;

    responseObj = {
      individualContacts: [
        {
          id: contactId,
          name: 'Janet Doe',
          email: 'janet@doe.com',
          contactType,
          isVendor: false,
          isGisPopulated: true,
          workPhone: '+9198765456',
          cellPhone: '+9198765456',
          streetAddress: '545,Alabama',
          city: 'Alabama',
          state: 'AL',
          zip: '94016',
          associatedContacts: [
            {
              id: 4,
              name: 'Janet Doe',
              email: 'janet@doe.com',
              contactType: ContactType.LEGAL_ENTITY,
              isVendor: false,
              isGisPopulated: true,
              workPhone: '+9198765456',
              cellPhone: '+9198765456',
              streetAddress: '545,Alabama',
              city: 'Alabama',
              state: 'AL',
              zip: '94016',
              isPrimary: false,
            },
          ],
          contactCustomFieldValues: {},
          note: 'this is a contact test note',
        },
      ],
      legalEntityContacts: [],
    };

    sandbox
      .stub(ContactService.prototype, 'createSearchClause')
      .withArgs(
        agencyId,
        searchString,
        location,
        contactType,
        excludeContactIds
      )
      .resolves(searchClause);

    sandbox.stub(db.Contact, 'findAll').resolves(contacts);

    result = await contactService.getAll(
      agencyId,
      contactType,
      searchString,
      location,
      excludeContactIds,
      limit
    );

    expect(result).to.deep.equal(responseObj, 'response did not match');
  });

  it('Should return status code 200 with contact details for legal entity contact', async () => {
    sandbox
      .stub(ContactService.prototype, 'createSearchClause')
      .withArgs(
        agencyId,
        searchString,
        location,
        contactType,
        excludeContactIds
      )
      .resolves(searchClause);

    sandbox.stub(db.Contact, 'findAll').resolves(contacts);

    result = await contactService.getAll(
      agencyId,
      contactType,
      searchString,
      location,
      excludeContactIds,
      limit
    );

    expect(result).to.deep.equal(responseObj, 'response did not match');
  });

  it('Should return status code 200 with contact details not found', async () => {
    responseObj = {
      individualContacts: [],
      legalEntityContacts: [],
    };

    sandbox
      .stub(ContactService.prototype, 'createSearchClause')
      .withArgs(
        agencyId,
        searchString,
        location,
        contactType,
        excludeContactIds
      )
      .resolves(searchClause);

    sandbox.stub(db.Contact, 'findAll').resolves([]);

    result = await contactService.getAll(
      agencyId,
      contactType,
      searchString,
      location,
      excludeContactIds,
      limit
    );

    expect(result).to.deep.equal(responseObj, 'response did not match');
  });

  it('Should return status code 400 with InternalServerError', async () => {
    sandbox
      .stub(ContactService.prototype, 'createSearchClause')
      .withArgs(
        agencyId,
        searchString,
        location,
        contactType,
        excludeContactIds
      )
      .resolves(searchClause);

    sandbox.stub(db.Contact, 'findAll').throws({ name: 'InternalServerError' });

    await contactService
      .getAll(
        agencyId,
        contactType,
        searchString,
        location,
        excludeContactIds,
        limit
      )
      .catch(err => {
        expect(err.name).to.deep.equal('InternalServerError');
      });
  });
});

describe('Contact Service: getList method', () => {
  let sandbox;
  const contactId = 2;
  const agencyId = 1;
  const searchString = 'john';
  const limit = 1;
  const offset = 0;
  const selectedcontactId = 2;
  const selectedContactIds = [selectedcontactId];
  let result;
  let searchClause;
  let contactType;
  let queryResponse;
  let selectedContantQueryResponse;
  let response: IContactListResponse;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    searchClause = { agencyId };
    contactType = ContactType.INDIVIDUAL;
    response = {
      count: 1,
      data: [
        {
          id: contactId,
          name: 'john Doe',
          contactType,
        },
      ],
      selectedContacts: [
        {
          id: selectedcontactId,
          name: 'john Doe 2',
          contactType,
        },
      ],
    };
    selectedContantQueryResponse = [
      {
        id: selectedcontactId,
        name: 'john Doe 2',
        contactType,
      },
    ];
    queryResponse = {
      count: 1,
      rows: [
        {
          id: contactId,
          name: 'john Doe',
          contactType,
        },
      ],
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('Should return status code 200 with contact list', async () => {
    sandbox
      .stub(ContactService.prototype, 'createSearchClause')
      .withArgs(agencyId, searchString)
      .resolves(searchClause);

    sandbox.stub(db.Contact, 'findAndCountAll').resolves(queryResponse);
    sandbox.stub(db.Contact, 'findAll').resolves(selectedContantQueryResponse);

    result = await contactService.getList(
      agencyId,
      searchString,
      limit,
      offset,
      selectedContactIds
    );

    expect(result).to.deep.equal(response, 'response did not match');
  });

  it('Should return status code 200 with empty contacts', async () => {
    response = {
      count: 0,
      data: [],
      selectedContacts: [],
    };
    queryResponse = {
      count: 0,
      rows: [],
    };
    selectedContantQueryResponse = [];
    sandbox
      .stub(ContactService.prototype, 'createSearchClause')
      .withArgs(agencyId, searchString)
      .resolves(searchClause);

    sandbox.stub(db.Contact, 'findAndCountAll').resolves(queryResponse);
    sandbox.stub(db.Contact, 'findAll').resolves(selectedContantQueryResponse);

    result = await contactService.getList(
      agencyId,
      searchString,
      limit,
      offset,
      selectedContactIds
    );

    expect(result).to.deep.equal(response, 'response did not match');
  });
});

describe('Contact Service: Create Contact', () => {
  let sandbox;
  const agencyId = 1;
  const contactId = 5;

  let responseObj;
  let result;
  let contactReq;
  let associatedContacts;
  let newContactObj;
  let contact;
  let transaction;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    transaction = sinon.stub();

    contactReq = {
      name: 'John Doe',
      contactType: ContactType.INDIVIDUAL,
      isVendor: true,
      isGisPopulated: false,
      email: 'john@doe.com',
      workPhone: '+9198765456',
      cellPhone: '+9198765456',
      streetAddress: '545,Alabama',
      city: 'Alabama',
      state: 'AL',
      zip: '94016',
      note: 'blue',
      associatedContacts: [
        {
          id: 2,
          isPrimary: false,
        },
      ],
      contactCustomFieldValues: {
        'Driving Licence No': 'MH12 AX4191',
      },
    };

    associatedContacts = [
      {
        id: 2,
        name: 'Janet Doe',
        email: 'janet@doe.com',
        contactType: 'LEGAL_ENTITY',
        isVendor: false,
        isGisPopulated: true,
        workPhone: '+9198765456',
        cellPhone: '+9198765456',
        streetAddress: '545,Alabama',
        city: 'Alabama',
        state: 'AL',
        zip: '94016',
        isPrimary: false,
      },
    ];

    newContactObj = {
      name: 'John Doe',
      email: 'john@doe.com',
      contactType: 'INDIVIDUAL',
      isVendor: true,
      isGisPopulated: false,
      workPhone: '+9198765456',
      cellPhone: '+9198765456',
      streetAddress: '545,Alabama',
      city: 'Alabama',
      state: 'AL',
      zip: '94016',
      note: 'blue',
      contactCustomFieldValues: null,
    };

    contact = {
      name: 'John Doe',
      email: 'john@doe.com',
      contactType: ContactType.INDIVIDUAL,
      isVendor: true,
      isGisPopulated: false,
      workPhone: '+9198765456',
      cellPhone: '+9198765456',
      streetAddress: '545,Alabama',
      city: 'Alabama',
      state: 'AL',
      zip: '94016',
      note: 'blue',
      contactCustomFieldValues: null,
      setLegalEntityContacts: () => Promise.resolve(),
      setIndividualContacts: () => Promise.resolve(),
    };

    responseObj = {
      id: contactId,
      name: 'John Doe',
      email: 'john@doe.com',
      contactType: 'INDIVIDUAL',
      isVendor: true,
      isGisPopulated: false,
      workPhone: '+9198765456',
      cellPhone: '+9198765456',
      streetAddress: '545,Alabama',
      city: 'Alabama',
      state: 'AL',
      zip: '94016',
      note: 'blue',
      contactCustomFieldValues: null,
      associatedContacts,
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('Should return status code 200 with contact details for INDIVIDUAL contact type', async () => {
    sandbox
      .stub(ContactService.prototype, 'validateContactCustomFieldCreateReq')
      .withArgs(agencyId, contactReq);

    sandbox
      .stub(ContactService.prototype, 'fetchAssociatedContacts')
      .withArgs(agencyId, contactReq)
      .resolves(associatedContacts);

    sandbox
      .stub(ContactService.prototype, 'createContactObj')
      .withArgs(agencyId, contactReq)
      .resolves(newContactObj);

    sandbox.stub(DBUtil, 'createTransaction').resolves(transaction);

    sandbox.stub(db.Contact, 'create').resolves(contact);

    sandbox.stub(DBUtil, 'commitTransaction').resolves(transaction);

    sandbox.stub(ContactService.prototype, 'get').resolves(responseObj);

    result = await contactService.create(agencyId, contactReq);

    expect(result).to.deep.equal(responseObj, 'response did not match');
  });

  it('Should return status code 200 with contact details for LEGAL ENTITY contact type', async () => {
    contactReq.contactType = ContactType.LEGAL_ENTITY;
    associatedContacts[0].contactType = ContactType.INDIVIDUAL;
    newContactObj.contactType = ContactType.LEGAL_ENTITY;
    contact.contactType = ContactType.LEGAL_ENTITY;
    responseObj.contactType = ContactType.LEGAL_ENTITY;

    sandbox
      .stub(ContactService.prototype, 'validateContactCustomFieldCreateReq')
      .withArgs(agencyId, contactReq);

    sandbox
      .stub(ContactService.prototype, 'fetchAssociatedContacts')
      .withArgs(agencyId, contactReq)
      .resolves(associatedContacts);

    sandbox
      .stub(ContactService.prototype, 'createContactObj')
      .withArgs(agencyId, contactReq)
      .resolves(newContactObj);

    sandbox.stub(DBUtil, 'createTransaction').resolves(transaction);

    sandbox.stub(db.Contact, 'create').resolves(contact);

    sandbox.stub(DBUtil, 'commitTransaction').resolves(transaction);

    sandbox.stub(ContactService.prototype, 'get').resolves(responseObj);

    result = await contactService.create(agencyId, contactReq);

    expect(result).to.deep.equal(responseObj, 'response did not match');
  });

  it('Should return status code 400 with DBConflictError', async () => {
    sandbox
      .stub(ContactService.prototype, 'validateContactCustomFieldCreateReq')
      .withArgs(agencyId, contactReq);

    sandbox
      .stub(ContactService.prototype, 'fetchAssociatedContacts')
      .withArgs(agencyId, contactReq)
      .resolves(associatedContacts);

    sandbox
      .stub(ContactService.prototype, 'createContactObj')
      .withArgs(agencyId, contactReq)
      .resolves(newContactObj);

    sandbox.stub(DBUtil, 'createTransaction').resolves(transaction);

    sandbox.stub(DBUtil, 'rollbackTransaction').resolves(transaction);

    sandbox
      .stub(db.Contact, 'create')
      .throws({ name: 'SequelizeUniqueConstraintError' });

    await contactService.create(agencyId, contactReq).catch(err => {
      expect(err.name).to.deep.equal('DBConflictError');
    });
  });

  it('Should return status code 400 with InvalidRequestError', async () => {
    sandbox
      .stub(ContactService.prototype, 'validateContactCustomFieldCreateReq')
      .withArgs(agencyId, contactReq);

    sandbox
      .stub(ContactService.prototype, 'fetchAssociatedContacts')
      .withArgs(agencyId, contactReq)
      .resolves(associatedContacts);

    sandbox
      .stub(ContactService.prototype, 'createContactObj')
      .withArgs(agencyId, contactReq)
      .resolves(newContactObj);

    sandbox.stub(DBUtil, 'createTransaction').resolves(transaction);

    sandbox.stub(DBUtil, 'rollbackTransaction').resolves(transaction);

    sandbox
      .stub(db.Contact, 'create')
      .throws({ name: 'SequelizeValidationError' });

    await contactService.create(agencyId, contactReq).catch(err => {
      expect(err.name).to.deep.equal('InvalidRequestError');
    });
  });

  it('Should return status code 400 with InternalServerError', async () => {
    sandbox
      .stub(ContactService.prototype, 'validateContactCustomFieldCreateReq')
      .withArgs(agencyId, contactReq);

    sandbox
      .stub(ContactService.prototype, 'fetchAssociatedContacts')
      .withArgs(agencyId, contactReq)
      .resolves(associatedContacts);

    sandbox
      .stub(ContactService.prototype, 'createContactObj')
      .withArgs(agencyId, contactReq)
      .resolves(newContactObj);

    sandbox.stub(DBUtil, 'createTransaction').resolves(transaction);

    sandbox.stub(db.Contact, 'create').throws({ name: 'Error' });

    await contactService.create(agencyId, contactReq).catch(err => {
      expect(err.name).to.deep.equal('InternalServerError');
    });
  });
});

describe('Contact Service: getDuplicateContacts method', () => {
  let sandbox;
  const agencyId = 1;
  const contactId = 2;

  let result;
  let duplicateContacts;
  let contactReq;
  let responseObj;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    contactReq = {
      name: 'John Doe',
      contactType: ContactType.INDIVIDUAL,
      isVendor: true,
      isGisPopulated: false,
      email: 'john@doe.com',
      workPhone: '+9198765456',
      cellPhone: '+9198765456',
      streetAddress: '545,Alabama',
      city: 'Alabama',
      state: 'AL',
      zip: '94016',
      note: 'This is a test note',
      associatedContacts: [
        {
          id: 2,
          isPrimary: false,
        },
      ],
      contactCustomFieldValues: {
        'Driving Licence No': 'MH12 AX4191',
      },
    };

    duplicateContacts = [
      {
        id: contactId,
        name: 'Janet Doe',
        email: 'janet@doe.com',
        contactType: ContactType.INDIVIDUAL,
        isVendor: false,
        isGisPopulated: true,
        workPhone: '+9198765456',
        cellPhone: '+9198765456',
        streetAddress: '545,Alabama',
        city: 'Alabama',
        state: 'AL',
        zip: '94016',
        contactCustomFieldValues: {},
        note: 'this is a contact test note',
      },
    ];

    responseObj = [
      {
        id: contactId,
        name: 'Janet Doe',
        email: 'janet@doe.com',
        contactType: ContactType.INDIVIDUAL,
        isVendor: false,
        isGisPopulated: true,
        workPhone: '+9198765456',
        cellPhone: '+9198765456',
        streetAddress: '545,Alabama',
        city: 'Alabama',
        state: 'AL',
        zip: '94016',
        contactCustomFieldValues: {},
        associatedContacts: null,
        note: 'this is a contact test note',
      },
    ];
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('Should return status code 200 with contact details', async () => {
    sandbox.stub(db.Contact, 'findAll').resolves(duplicateContacts);

    result = await contactService.getDuplicateContacts(agencyId, contactReq);

    expect(result).to.deep.equal(responseObj, 'response did not match');
  });

  it('Should return status code 400 with InternalServerError', async () => {
    sandbox.stub(db.Contact, 'findAll').throws({ name: 'Erro' });

    await contactService
      .getDuplicateContacts(agencyId, contactReq)
      .catch(err => {
        expect(err.name).to.deep.equal('InternalServerError');
      });
  });
});

describe('Contact Service: getContactSuggestions method', () => {
  let sandbox;
  const agencyId = 1;
  const contactId = 2;
  const location = 'Alabama';

  let result;
  let suggestedContacts;
  let responseObj;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    suggestedContacts = [
      {
        id: contactId,
        name: 'Janet Doe',
        email: 'janet@doe.com',
        contactType: ContactType.INDIVIDUAL,
        isVendor: false,
        isGisPopulated: true,
        workPhone: '+9198765456',
        cellPhone: '+9198765456',
        streetAddress: '545,Alabama',
        city: 'Alabama',
        state: 'AL',
        zip: '94016',
        contactCustomFieldValues: {},
        note: 'this is a contact test note',
      },
    ];

    responseObj = [
      {
        id: contactId,
        name: 'Janet Doe',
        email: 'janet@doe.com',
        contactType: ContactType.INDIVIDUAL,
        isVendor: false,
        isGisPopulated: true,
        workPhone: '+9198765456',
        cellPhone: '+9198765456',
        streetAddress: '545,Alabama',
        city: 'Alabama',
        state: 'AL',
        zip: '94016',
        contactCustomFieldValues: {},
        associatedContacts: null,
        note: 'this is a contact test note',
      },
    ];
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('Should return status code 200 with contact details', async () => {
    sandbox.stub(db.Contact, 'findAll').resolves(suggestedContacts);

    result = await (contactService as any).__proto__.getContactSuggestions(
      agencyId,
      location
    );

    expect(result).to.deep.equal(responseObj, 'response did not match');
  });

  it('Should return status code 400 with InternalServerError', async () => {
    sandbox.stub(db.Contact, 'findAll').throws({ name: 'Erro' });

    await (contactService as any).__proto__
      .getContactSuggestions(agencyId, location)
      .catch(err => {
        expect(err.name).to.deep.equal('InternalServerError');
      });
  });
});

describe('Contact Service: getSuggestedContacts method', () => {
  let sandbox;
  const agencyId = 1;
  const location = 'Alabama';

  let result;
  let suggestedContacts;
  let associatedContacts;
  let responseObj;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    suggestedContacts = [
      {
        id: 2,
        name: 'John Doe',
        email: 'john@doe.com',
        contactType: ContactType.INDIVIDUAL,
        isVendor: false,
        isGisPopulated: true,
        workPhone: '+9198765456',
        cellPhone: '+9198765456',
        streetAddress: '545,Alabama',
        city: 'Alabama',
        state: 'AL',
        zip: '94016',
        contactCustomFieldValues: {},
        note: 'this is a contact test note',
      },
    ];

    associatedContacts = [
      {
        id: 3,
        name: 'Janet Doe',
        email: 'janet@doe.com',
        contactType: ContactType.INDIVIDUAL,
        isVendor: false,
        isGisPopulated: true,
        workPhone: '+9198765456',
        cellPhone: '+9198765456',
        streetAddress: '545,Alabama',
        city: 'Alabama',
        state: 'AL',
        zip: '94016',
        contactCustomFieldValues: {},
        note: 'this is a contact test note',
      },
    ];

    responseObj = [
      {
        id: 2,
        name: 'John Doe',
        email: 'john@doe.com',
        contactType: ContactType.INDIVIDUAL,
        isVendor: false,
        isGisPopulated: true,
        workPhone: '+9198765456',
        cellPhone: '+9198765456',
        streetAddress: '545,Alabama',
        city: 'Alabama',
        state: 'AL',
        zip: '94016',
        contactCustomFieldValues: {},
        note: 'this is a contact test note',
      },
      {
        id: 3,
        name: 'Janet Doe',
        email: 'janet@doe.com',
        contactType: ContactType.INDIVIDUAL,
        isVendor: false,
        isGisPopulated: true,
        workPhone: '+9198765456',
        cellPhone: '+9198765456',
        streetAddress: '545,Alabama',
        city: 'Alabama',
        state: 'AL',
        zip: '94016',
        contactCustomFieldValues: {},
        note: 'this is a contact test note',
      },
    ];
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('Should return status code 200 with contact details for LEGAL ENTITY contact type', async () => {
    suggestedContacts[0].contactType = ContactType.LEGAL_ENTITY;
    associatedContacts[0].contactType = ContactType.LEGAL_ENTITY;
    responseObj[0].contactType = ContactType.LEGAL_ENTITY;
    responseObj[1].contactType = ContactType.LEGAL_ENTITY;

    sandbox
      .stub(ContactService.prototype, 'getContactSuggestions')
      .withArgs(agencyId, location)
      .resolves(suggestedContacts);

    sandbox
      .stub(
        ContactService.prototype,
        'getContactsAssociatedWithSameCaseLocation'
      )
      .withArgs(agencyId, location)
      .resolves(associatedContacts);

    result = await contactService.getSuggestedContacts(agencyId, location);

    expect(result).to.deep.equal(responseObj, 'response did not match');
  });

  it('Should return status code 200 with contact details for INDIVIDUAL contact type', async () => {
    sandbox
      .stub(ContactService.prototype, 'getContactSuggestions')
      .withArgs(agencyId, location)
      .resolves(suggestedContacts);

    sandbox
      .stub(
        ContactService.prototype,
        'getContactsAssociatedWithSameCaseLocation'
      )
      .withArgs(agencyId, location)
      .resolves(associatedContacts);

    result = await contactService.getSuggestedContacts(agencyId, location);

    expect(result).to.deep.equal(responseObj, 'response did not match');
  });
});
