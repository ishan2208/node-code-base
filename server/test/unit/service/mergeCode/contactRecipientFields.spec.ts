import { expect } from 'chai';
import 'mocha';
import * as sinon from 'sinon';

import db from '../../../../api/models';
import CaseRoleService from '../../../../api/service/agencySetup/configCaseRole';
import ConfigContactCustomFieldService from '../../../../api/service/agencySetup/configContactCustomField';
import { resolveFields } from '../../../../api/service/mergeCode/contactRecipientFields';

describe('ContactRecipientFields Service: resolveFields method', () => {
  let sandbox;
  const agencyId = 1;
  const caseId = 1;
  let xerceCaseContacts;
  let configNoticeForm;
  let resolvedFields: any = {
    '1': [
      {
        '{{recipient_case_role}}': 'Owner',
        '{{recipient_contact_email}}': 'kingkong@gmail.com',
        '{{recipient_contact_mailing_address}}':
          '12B High St, Huang Thai, Kin Toe, 12345',
        '{{recipient_contact_type}}': 'INDIVIDUAL',
        '{{recipient_contact_work_phone}}': '8899887865',
        '{{recipient_con_cf_7}}': '2019-07-16',
        '{{recipient_con_cf_2}}': 12,
        '{{recipient_con_cf_8}}': '{{recipient_con_cf_8}}',
        '{{recipient_vendor}}': 'Yes',
      },
    ],
    '2': [
      {
        '{{recipient_case_role}}': 'Tenant',
        '{{recipient_contact_email}}': 'pingpong@gmail.com',
        '{{recipient_contact_mailing_address}}':
          '12B High St, Huang Thai, Kin Toe, 12345',
        '{{recipient_contact_type}}': 'INDIVIDUAL',
        '{{recipient_contact_work_phone}}': '8899887865',
        '{{recipient_con_cf_7}}': '2019-07-16',
        '{{recipient_con_cf_2}}': 12,
        '{{recipient_con_cf_8}}': '{{recipient_con_cf_8}}',
        '{{recipient_vendor}}': 'Yes',
      },
    ],
  };
  const contactCustomFields = [
    {
      id: 1,
      label: 'Driving Licence No',
      contactType: 'INDIVIDUAL',
      isActive: true,
      options: [],
      type: 'NUMBER',
      sequence: 1,
    },
    {
      id: 2,
      label: 'SSN Number',
      contactType: 'LEGAL_ENTITY',
      isActive: true,
      options: [],
      type: 'NUMBER',
      sequence: 1,
    },
    {
      id: 7,
      label: 'contacty',
      contactType: 'INDIVIDUAL',
      isActive: true,
      options: [],
      type: 'DATE',
      sequence: 2,
    },
  ];

  const uiMergeCodes: IGenerateNoticeUiCodes = {
    recipientIds: [1, 2],
    responsibleContactId: 1,
    attachments: [],
    openViolations: [],
    resolutionActions: [],
    nextInspection: {
      plannedDate: new Date('2019-05-13T06:29:32.814Z'),
      assigneeId: 11,
    },
    caseAssigneeId: 1,
  };

  let activeCaseRoles: ICaseRole[] = [];

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

    xerceCaseContacts = [
      {
        id: 1,
        contact: {
          name: 'King Kong',
          mailingAddress: '12B High St, Huang Thai, Kin Toe, 12345',
          isVendor: true,
          contactType: ContactType.INDIVIDUAL,
          cellPhone: '9876787658',
          workPhone: '8899887865',
          email: 'kingkong@gmail.com',
          contactCustomFieldValues: {
            '7': '2019-07-16T06:29:32.814Z',
            '2': 12,
          },
        },
        caseContactRole: {
          label: 'Owner',
        },
        get: () => ({
          id: 1,
          contact: {
            name: 'King Kong',
            mailingAddress: '12B High St, Huang Thai, Kin Toe, 12345',
            isVendor: true,
            contactType: ContactType.INDIVIDUAL,
            cellPhone: '9876787658',
            workPhone: '8899887865',
            email: 'kingkong@gmail.com',
            contactCustomFieldValues: {
              '7': '2019-07-16T06:29:32.814Z',
              '2': 12,
            },
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
          mailingAddress: '12B High St, Huang Thai, Kin Toe, 12345',
          isVendor: true,
          contactType: ContactType.INDIVIDUAL,
          cellPhone: '9876787658',
          workPhone: '8899887865',
          email: 'pingpong@gmail.com',
          contactCustomFieldValues: {
            '7': '2019-07-16T06:29:32.814Z',
            '2': 12,
          },
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
            mailingAddress: '12B High St, Huang Thai, Kin Toe, 12345',
            isVendor: true,
            contactType: ContactType.INDIVIDUAL,
            cellPhone: '9876787658',
            workPhone: '8899887865',
            email: 'pingpong@gmail.com',
            contactCustomFieldValues: {
              '7': '2019-07-16T06:29:32.814Z',
              '2': 12,
            },
          },
          caseContactRole: {
            label: 'Tenant',
          },
        }),
      },
    ];

    configNoticeForm = {
      label: 'Final Notice',
      content: `{{recipient_case_role}}
        {{recipient_contact_type}}
        {{recipient_contact_email}}
        {{recipient_contact_mailing_address}}
        {{recipient_contact_work_phone}}
        {{recipient_con_cf_7}}
        {{recipient_con_cf_2}}
        {{recipient_con_cf_8}}
        {{recipient_vendor}}`,
      noticeType: NoticeType.HTML,
      isActive: true,
      mergeFields: {
        'Contact Recipient': {
          fields: [
            '{{recipient_case_role}}',
            '{{recipient_contact_type}}',
            '{{recipient_contact_email}}',
            '{{recipient_contact_mailing_address}}',
            '{{recipient_contact_work_phone}}',
            '{{recipient_con_cf_7}}',
            '{{recipient_con_cf_2}}',
            '{{recipient_con_cf_8}}',
            '{{recipient_vendor}}',
          ],
        },
      },
      mergeTables: null,
      headerSection: {
        label: 'Welcome Header',
        content: `{{recipient_case_role}}`,
        sectionType: NoticeFormSectionType.HEADER,
        isActive: true,
        mergeFields: {
          'Contact Recipient': {
            fields: ['{{recipient_case_role}}'],
          },
        },
      },
      footerSection: {
        label: 'Copyright Footer',
        content: `{{recipient_contact_work_phone}}`,
        sectionType: NoticeFormSectionType.HEADER,
        isActive: true,
        mergeFields: {
          'Contact Recipient': {
            fields: ['{{recipient_contact_work_phone}}'],
          },
        },
      },
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should resolve all dynamic contact merge fields', async () => {
    sandbox
      .stub(db.XerceCaseContact, 'findAll')
      .withArgs({
        where: {
          agencyId,
          xerceCaseId: caseId,
        },
        attributes: ['id'],
        include: [
          {
            model: db.Contact,
            as: 'contact',
            attributes: [
              'contactType',
              'name',
              'email',
              'workPhone',
              'cellPhone',
              'isVendor',
              'contactCustomFieldValues',
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
                'mailingAddress',
              ],
            ],
          },
          {
            model: db.ConfigCaseRole,
            as: 'caseContactRole',
            attributes: ['label'],
          },
        ],
        order: ['id'],
      })
      .resolves(xerceCaseContacts);

    sandbox
      .stub(CaseRoleService.prototype, 'getAllActive')
      .withArgs(agencyId)
      .resolves(activeCaseRoles);

    sandbox
      .stub(ConfigContactCustomFieldService.prototype, 'getAll')
      .withArgs(agencyId)
      .resolves(contactCustomFields);

    const result = await resolveFields(
      agencyId,
      caseId,
      configNoticeForm,
      uiMergeCodes,
      userProfile
    );

    expect(resolvedFields).to.deep.equal(result);
  });

  it('should resolve all dynamic contact merge fields when one contact is present', async () => {
    xerceCaseContacts = [
      {
        id: 1,
        contact: {
          name: 'King Kong',
          mailingAddress: '12B High St, Huang Thai, Kin Toe, 12345',
          isVendor: true,
          contactType: ContactType.INDIVIDUAL,
          cellPhone: '9876787658',
          workPhone: '8899887865',
          email: 'kingkong@gmail.com',
          contactCustomFieldValues: {
            '7': '2019-07-16T06:29:32.814Z',
            '2': 12,
          },
        },
        caseContactRole: {
          label: 'Owner',
        },
        get: () => ({
          id: 1,
          contact: {
            name: 'King Kong',
            mailingAddress: '12B High St, Huang Thai, Kin Toe, 12345',
            isVendor: true,
            contactType: ContactType.INDIVIDUAL,
            cellPhone: '9876787658',
            workPhone: '8899887865',
            email: 'kingkong@gmail.com',
            contactCustomFieldValues: {
              '7': '2019-07-16T06:29:32.814Z',
              '2': 12,
            },
          },
          caseContactRole: {
            label: 'Owner',
          },
        }),
      },
    ];

    resolvedFields = {
      '1': [
        {
          '{{recipient_case_role}}': 'Owner',
          '{{recipient_contact_email}}': 'kingkong@gmail.com',
          '{{recipient_contact_mailing_address}}':
            '12B High St, Huang Thai, Kin Toe, 12345',
          '{{recipient_contact_type}}': 'INDIVIDUAL',
          '{{recipient_contact_work_phone}}': '8899887865',
          '{{recipient_con_cf_7}}': '2019-07-16',
          '{{recipient_con_cf_2}}': 12,
          '{{recipient_con_cf_8}}': '{{recipient_con_cf_8}}',
          '{{recipient_vendor}}': 'Yes',
        },
      ],
    };

    sandbox
      .stub(db.XerceCaseContact, 'findAll')
      .withArgs({
        where: {
          agencyId,
          xerceCaseId: caseId,
        },
        attributes: ['id'],
        include: [
          {
            model: db.Contact,
            as: 'contact',
            attributes: [
              'contactType',
              'name',
              'email',
              'workPhone',
              'cellPhone',
              'isVendor',
              'contactCustomFieldValues',
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
                'mailingAddress',
              ],
            ],
          },
          {
            model: db.ConfigCaseRole,
            as: 'caseContactRole',
            attributes: ['label'],
          },
        ],
        order: ['id'],
      })
      .resolves(xerceCaseContacts);

    sandbox
      .stub(CaseRoleService.prototype, 'getAllActive')
      .withArgs(agencyId)
      .resolves(activeCaseRoles);

    sandbox
      .stub(ConfigContactCustomFieldService.prototype, 'getAll')
      .withArgs(agencyId)
      .resolves(contactCustomFields);

    const result = await resolveFields(
      agencyId,
      caseId,
      configNoticeForm,
      uiMergeCodes,
      userProfile
    );

    expect(resolvedFields).to.deep.equal(result);
  });

  it('should throw error while resolving dynamic contact merge fields', async () => {
    sandbox
      .stub(db.XerceCaseContact, 'findAll')
      .withArgs({
        where: {
          agencyId,
          xerceCaseId: caseId,
        },
        attributes: ['id'],
        include: [
          {
            model: db.Contact,
            as: 'contact',
            attributes: [
              'contactType',
              'name',
              'email',
              'workPhone',
              'cellPhone',
              'isVendor',
              'contactCustomFieldValues',
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
                'mailingAddress',
              ],
            ],
          },
          {
            model: db.ConfigCaseRole,
            as: 'caseContactRole',
            attributes: ['label'],
          },
        ],
        order: ['id'],
      })
      .throws('Error');

    await resolveFields(
      agencyId,
      caseId,
      configNoticeForm,
      uiMergeCodes,
      userProfile
    ).catch(err => expect(err.name).to.equal('InternalServerError'));
  });

  it('should throw error for no contacts', async () => {
    xerceCaseContacts = [];
    sandbox
      .stub(db.XerceCaseContact, 'findAll')
      .withArgs({
        where: {
          agencyId,
          xerceCaseId: caseId,
        },
        attributes: ['id'],
        include: [
          {
            model: db.Contact,
            as: 'contact',
            attributes: [
              'contactType',
              'name',
              'email',
              'workPhone',
              'cellPhone',
              'isVendor',
              'contactCustomFieldValues',
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
                'mailingAddress',
              ],
            ],
          },
          {
            model: db.ConfigCaseRole,
            as: 'caseContactRole',
            attributes: ['label'],
          },
        ],
        order: ['id'],
      })
      .resolves(xerceCaseContacts);

    await resolveFields(
      agencyId,
      caseId,
      configNoticeForm,
      uiMergeCodes,
      userProfile
    ).catch(err => expect(err.name).to.equal('InvalidRequestError'));
  });
});
