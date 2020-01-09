import { expect } from 'chai';
import 'mocha';
import * as sinon from 'sinon';

import db from '../../../../../api/models';
import CaseRoleService from '../../../../../api/service/agencySetup/configCaseRole';
import { resolveTables } from '../../../../../api/service/mergeCode/tables/contact';

describe('ContactTables Service: resolveTables method', () => {
  let sandbox;
  const agencyId = 1;
  const caseId = 1;
  let configNoticeForm;
  let uiMergeCodes: IGenerateNoticeUiCodes;
  let xerceCaseContacts;
  let activeCaseRoles: ICaseRole[];

  let resolvedTables: any = {
    '{{all_contacts}}': `<table style='font-family:\"Arial\"; font-size:12px' role='grid' border='1' cellspacing='0'><colgroup><thead><tr role='row'><th><div>Role</div></th><th><div>Name</div></th><th><div>Type</div></th><th><div>Address</div></th></tr></thead><tbody><tr role='row'><td>Owner</td><td>King Kong</td><td>INDIVIDUAL</td><td>12B High St, Huang Thai, Kin Toe, 12345</td></tr><tr role='row'><td>Tenant</td><td>Ping Pong</td><td>LEGAL_ENTITY</td><td>12B High St, Huang Thai, Kin Toe, 12345</td></tr></tbody></table>`,
    '{{all_legal_entities}}': `<table style='font-family:\"Arial\"; font-size:12px' role='grid' border='1' cellspacing='0'><colgroup><thead><tr role='row'><th><div>Role</div></th><th><div>Name</div></th><th><div>Type</div></th><th><div>Address</div></th></tr></thead><tbody><tr role='row'><td>Tenant</td><td>Ping Pong</td><td>LEGAL_ENTITY</td><td>12B High St, Huang Thai, Kin Toe, 12345</td></tr></tbody></table>`,
    '{{name_and_address_bill_to_contact}}':
      'King Kong<br>12B High St, Huang Thai, Kin Toe, 12345',
    '{{name_and_address_tenant}}':
      'Ping Pong<br>12B High St<br>Huang Thai<br>Kin Toe<br>12345<br>',
    '{{name_bill_to_contact}}': 'King Kong',
    '{{name_owner}}': 'King Kong',
    '{{name_tenant}}': 'Ping Pong',
  };

  const authScope = {
    comcateAdmin: true,
    siteAdmin: true,
  };

  const userProfile: IAgencyUserClaim = {
    agencyName: 'City of Alabama',
    id: 11,
    agencyId,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@gmail.com',
    scopes: authScope,
    agencyTimezone: 'PST',
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    xerceCaseContacts = [
      {
        id: 1,
        isBillable: true,
        caseContactRoleId: 11,
        contact: {
          name: 'King Kong',
          address: '12B High St, Huang Thai, Kin Toe, 12345',
          streetAddress: '12B High St',
          city: 'Huang Thai',
          state: 'Kin Toe',
          zip: '12345',
          isVendor: true,
          contactType: ContactType.INDIVIDUAL,
          cellPhone: '9876787658',
          workPhone: '8899887865',
          email: 'kingkong@gmail.com',
          contactCustomFieldValues: null,
        },
        caseContactRole: {
          label: 'Owner',
        },
        get: () => ({
          id: 1,
          isBillable: true,
          caseContactRoleId: 11,
          contact: {
            name: 'King Kong',
            address: '12B High St, Huang Thai, Kin Toe, 12345',
            streetAddress: '12B High St',
            city: 'Huang Thai',
            state: 'Kin Toe',
            zip: '12345',
            isVendor: true,
            contactType: ContactType.INDIVIDUAL,
            cellPhone: '9876787658',
            workPhone: '8899887865',
            email: 'kingkong@gmail.com',
            contactCustomFieldValues: null,
          },
          caseContactRole: {
            label: 'Owner',
          },
        }),
      },
      {
        id: 2,
        isBillable: false,
        caseContactRoleId: 12,
        contact: {
          name: 'Ping Pong',
          address: '12B High St, Huang Thai, Kin Toe, 12345',
          streetAddress: '12B High St',
          city: 'Huang Thai',
          state: 'Kin Toe',
          zip: '12345',
          isVendor: true,
          contactType: ContactType.LEGAL_ENTITY,
          cellPhone: '9876787658',
          workPhone: '8899887865',
          email: 'pingpong@gmail.com',
          contactCustomFieldValues: null,
        },
        caseContactRole: {
          label: 'Tenant',
        },
        get: () => ({
          id: 2,
          isBillable: false,
          caseContactRoleId: 12,
          contact: {
            name: 'Ping Pong',
            address: '12B High St, Huang Thai, Kin Toe, 12345',
            streetAddress: '12B High St',
            city: 'Huang Thai',
            state: 'Kin Toe',
            zip: '12345',
            isVendor: true,
            contactType: ContactType.LEGAL_ENTITY,
            cellPhone: '9876787658',
            workPhone: '8899887865',
            email: 'pingpong@gmail.com',
            contactCustomFieldValues: null,
          },
          caseContactRole: {
            label: 'Tenant',
          },
        }),
      },
    ];

    activeCaseRoles = [
      {
        id: 1,
        label: 'Owner',
        isDefault: true,
        isActive: true,
        sequence: 1,
      },
      {
        id: 2,
        label: 'Tenant',
        isDefault: false,
        isActive: true,
        sequence: 2,
      },
    ];

    uiMergeCodes = {
      recipientIds: [1, 2],
      responsibleContactId: 1,
      attachments: [],
      openViolations: [],
      resolutionActions: [],
      nextInspection: {
        plannedDate: new Date('2019-05-13T06:29:32.814Z'),
        assigneeId: 11,
      },
      caseAssigneeId: 11,
    };

    configNoticeForm = {
      label: 'Final Notice',
      content: `{{name_bill_to_contact}}
        {{name_and_address_bill_to_contact}}
        {{all_contacts}}
        {{all_legal_entities}}
        {{name_Owner}}
        {{name_Tenant}}
        {{name_and_address_Tenant}}`,
      noticeType: NoticeType.HTML,
      isActive: true,
      mergeFields: null,
      mergeTables: {
        Contacts: {
          tables: [
            '{{name_bill_to_contact}}',
            '{{name_and_address_bill_to_contact}}',
            '{{all_contacts}}',
            '{{all_legal_entities}}',
            '{{name_owner}}',
            '{{name_tenant}}',
            '{{name_and_address_tenant}}',
          ],
        },
      },
      headerSection: {
        label: 'Welcome Header',
        content: `{{open_violations_list}}`,
        sectionType: NoticeFormSectionType.HEADER,
        isActive: true,
        mergeFields: null,
      },
      footerSection: {
        label: 'Copyright Footer',
        content: `{{open_violations_comma_separated}}`,
        sectionType: NoticeFormSectionType.HEADER,
        isActive: true,
        mergeFields: null,
      },
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should resolve all contact merge tables', async () => {
    sandbox
      .stub(db.XerceCaseContact, 'findAll')
      .withArgs({
        where: {
          agencyId,
          xerceCaseId: caseId,
        },
        attributes: ['id', 'isBillable', 'caseContactRoleId'],
        include: [
          {
            model: db.Contact,
            as: 'contact',
            attributes: [
              'name',
              'contactType',
              [
                db.Sequelize.fn(
                  'concat',
                  db.Sequelize.col(`contact.street_address`),
                  ', ',
                  db.Sequelize.col(`contact.city`),
                  ', ',
                  db.Sequelize.col(`contact.state`),
                  ', ',
                  db.Sequelize.col(`contact.zip`)
                ),
                'address',
              ],
              'streetAddress',
              'city',
              'state',
              'zip',
            ],
          },
          {
            model: db.ConfigCaseRole,
            as: 'caseContactRole',
            attributes: ['label'],
          },
        ],
      })
      .resolves(xerceCaseContacts);

    sandbox
      .stub(CaseRoleService.prototype, 'getAllActive')
      .withArgs(agencyId)
      .resolves(activeCaseRoles);

    const result = await resolveTables(
      agencyId,
      caseId,
      configNoticeForm,
      uiMergeCodes,
      userProfile
    );

    expect(resolvedTables).to.deep.equal(result);
  });

  it('should resolve all contact merge tables with one contact', async () => {
    resolvedTables = {
      '{{all_contacts}}': `<table style='font-family:\"Arial\"; font-size:12px' role='grid' border='1' cellspacing='0'><colgroup><thead><tr role='row'><th><div>Role</div></th><th><div>Name</div></th><th><div>Type</div></th><th><div>Address</div></th></tr></thead><tbody><tr role='row'><td>Owner</td><td>King Kong</td><td>INDIVIDUAL</td><td>12B High St, Huang Thai, Kin Toe, 12345</td></tr></tbody></table>`,
      '{{all_legal_entities}}': `{{all_legal_entities}}`,
      '{{name_and_address_bill_to_contact}}':
        'King Kong<br>12B High St, Huang Thai, Kin Toe, 12345',
      '{{name_bill_to_contact}}': 'King Kong',
      '{{name_owner}}': 'King Kong',
    };

    xerceCaseContacts = [
      {
        id: 1,
        isBillable: true,
        caseContactRoleId: 11,
        contact: {
          name: 'King Kong',
          address: '12B High St, Huang Thai, Kin Toe, 12345',
          streetAddress: '12B High St',
          city: 'Huang Thai',
          state: 'Kin Toe',
          zip: '12345',
          isVendor: true,
          contactType: ContactType.INDIVIDUAL,
          cellPhone: '9876787658',
          workPhone: '8899887865',
          email: 'kingkong@gmail.com',
          contactCustomFieldValues: null,
        },
        caseContactRole: {
          label: 'Owner',
        },
        get: () => ({
          id: 1,
          isBillable: true,
          caseContactRoleId: 11,
          contact: {
            name: 'King Kong',
            address: '12B High St, Huang Thai, Kin Toe, 12345',
            streetAddress: '12B High St',
            city: 'Huang Thai',
            state: 'Kin Toe',
            zip: '12345',
            isVendor: true,
            contactType: ContactType.INDIVIDUAL,
            cellPhone: '9876787658',
            workPhone: '8899887865',
            email: 'kingkong@gmail.com',
            contactCustomFieldValues: null,
          },
          caseContactRole: {
            label: 'Owner',
          },
        }),
      },
    ];

    sandbox
      .stub(db.XerceCaseContact, 'findAll')
      .withArgs({
        where: {
          agencyId,
          xerceCaseId: caseId,
        },
        attributes: ['id', 'isBillable', 'caseContactRoleId'],
        include: [
          {
            model: db.Contact,
            as: 'contact',
            attributes: [
              'name',
              'contactType',
              [
                db.Sequelize.fn(
                  'concat',
                  db.Sequelize.col(`contact.street_address`),
                  ', ',
                  db.Sequelize.col(`contact.city`),
                  ', ',
                  db.Sequelize.col(`contact.state`),
                  ', ',
                  db.Sequelize.col(`contact.zip`)
                ),
                'address',
              ],
              'streetAddress',
              'city',
              'state',
              'zip',
            ],
          },
          {
            model: db.ConfigCaseRole,
            as: 'caseContactRole',
            attributes: ['label'],
          },
        ],
      })
      .resolves(xerceCaseContacts);

    sandbox
      .stub(CaseRoleService.prototype, 'getAllActive')
      .withArgs(agencyId)
      .resolves(activeCaseRoles);

    const result = await resolveTables(
      agencyId,
      caseId,
      configNoticeForm,
      uiMergeCodes,
      userProfile
    );

    expect(resolvedTables).to.deep.equal(result);
  });

  it('should throw error while resolving contact merge tables', async () => {
    sandbox
      .stub(db.XerceCaseContact, 'findAll')
      .withArgs({
        where: {
          agencyId,
          xerceCaseId: caseId,
        },
        attributes: ['id', 'isBillable', 'caseContactRoleId'],
        include: [
          {
            model: db.Contact,
            as: 'contact',
            attributes: [
              'name',
              'contactType',
              [
                db.Sequelize.fn(
                  'concat',
                  db.Sequelize.col(`contact.street_address`),
                  ', ',
                  db.Sequelize.col(`contact.city`),
                  ', ',
                  db.Sequelize.col(`contact.state`),
                  ', ',
                  db.Sequelize.col(`contact.zip`)
                ),
                'address',
              ],
              'streetAddress',
              'city',
              'state',
              'zip',
            ],
          },
          {
            model: db.ConfigCaseRole,
            as: 'caseContactRole',
            attributes: ['label'],
          },
        ],
      })
      .throws('Error');

    sandbox
      .stub(CaseRoleService.prototype, 'getAllActive')
      .withArgs(agencyId)
      .resolves(activeCaseRoles);

    await resolveTables(
      agencyId,
      caseId,
      configNoticeForm,
      uiMergeCodes,
      userProfile
    ).catch(err => expect(err.name).to.equal('InternalServerError'));
  });

  it('should throw error if no contacts found while resolving contact merge tables', async () => {
    xerceCaseContacts = [];

    sandbox
      .stub(db.XerceCaseContact, 'findAll')
      .withArgs({
        where: {
          agencyId,
          xerceCaseId: caseId,
        },
        attributes: ['id', 'isBillable', 'caseContactRoleId'],
        include: [
          {
            model: db.Contact,
            as: 'contact',
            attributes: [
              'name',
              'contactType',
              [
                db.Sequelize.fn(
                  'concat',
                  db.Sequelize.col(`contact.street_address`),
                  ', ',
                  db.Sequelize.col(`contact.city`),
                  ', ',
                  db.Sequelize.col(`contact.state`),
                  ', ',
                  db.Sequelize.col(`contact.zip`)
                ),
                'address',
              ],
              'streetAddress',
              'city',
              'state',
              'zip',
            ],
          },
          {
            model: db.ConfigCaseRole,
            as: 'caseContactRole',
            attributes: ['label'],
          },
        ],
      })
      .resolves(xerceCaseContacts);

    await resolveTables(
      agencyId,
      caseId,
      configNoticeForm,
      uiMergeCodes,
      userProfile
    ).catch(err => expect(err.name).to.equal('InvalidRequestError'));
  });

  it('should throw error when invalid responsible contact id received while resolving contact merge tables', async () => {
    uiMergeCodes = {
      recipientIds: [1, 2],
      responsibleContactId: 4,
      attachments: [],
      openViolations: [],
      resolutionActions: [],
      nextInspection: {
        plannedDate: new Date('2019-05-13T06:29:32.814Z'),
        assigneeId: 11,
      },
      caseAssigneeId: 11,
    };

    sandbox
      .stub(db.XerceCaseContact, 'findAll')
      .withArgs({
        where: {
          agencyId,
          xerceCaseId: caseId,
        },
        attributes: ['id', 'isBillable', 'caseContactRoleId'],
        include: [
          {
            model: db.Contact,
            as: 'contact',
            attributes: [
              'name',
              'contactType',
              [
                db.Sequelize.fn(
                  'concat',
                  db.Sequelize.col(`contact.street_address`),
                  ', ',
                  db.Sequelize.col(`contact.city`),
                  ', ',
                  db.Sequelize.col(`contact.state`),
                  ', ',
                  db.Sequelize.col(`contact.zip`)
                ),
                'address',
              ],
              'streetAddress',
              'city',
              'state',
              'zip',
            ],
          },
          {
            model: db.ConfigCaseRole,
            as: 'caseContactRole',
            attributes: ['label'],
          },
        ],
      })
      .resolves(xerceCaseContacts);

    sandbox
      .stub(CaseRoleService.prototype, 'getAllActive')
      .withArgs(agencyId)
      .resolves(activeCaseRoles);

    await resolveTables(
      agencyId,
      caseId,
      configNoticeForm,
      uiMergeCodes,
      userProfile
    ).catch(err => expect(err.name).to.be.equal('InvalidRequestError'));
  });
});
