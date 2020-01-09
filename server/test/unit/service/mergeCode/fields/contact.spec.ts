import { expect } from 'chai';
import 'mocha';
import * as sinon from 'sinon';

import CaseRoleService from '../../../../../api/service/agencySetup/configCaseRole';
import ConfigContactCustomFieldService from '../../../../../api/service/agencySetup/configContactCustomField';
import { resolveFields } from '../../../../../api/service/mergeCode/fields/contact';
import XerceCaseContactService from '../../../../../api/service/xerce/xerceCaseContact';

describe('ContactFields Service: resolveFields method', () => {
  let sandbox;
  const agencyId = 1;
  const caseId = 1;
  let xerceCaseContacts;
  let configNoticeForm;
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
      id: 8,
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

  let resolvedFields = {
    '{{owner_contact_name}}': 'King Kong',
    '{{owner_contact_cell_phone}}': '9876787658',
    '{{owner_contact_email}}': 'kingkong@gmail.com',
    '{{owner_contact_type}}': 'INDIVIDUAL',
    '{{tenant_contact_cell_phone}}': '9876787658',
    '{{tenant_contact_mailing_address}}':
      '12B High St, Huang Thai, Kin Toe, 12345',
    '{{tenant_contact_vendor}}': 'Yes',
    '{{tenant_contact_work_phone}}': '8899887865',
    '{{tenant_con_cf_7}}': '2019-07-16',
    '{{tenant_con_cf_8}}': 'King Kong',
    '{{tenant_con_cf_71}}': '{{tenant_con_cf_71}}',
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
        isBillable: true,
        caseContactRoleId: 11,
        contact: {
          name: 'King Kong',
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
      },
      {
        id: 2,
        isBillable: false,
        caseContactRoleId: 12,
        contact: {
          name: 'Ping Pong',
          streetAddress: '12B High St',
          city: 'Huang Thai',
          state: 'Kin Toe',
          zip: '12345',
          isVendor: true,
          contactType: ContactType.INDIVIDUAL,
          cellPhone: '9876787658',
          workPhone: '8899887865',
          email: 'pingpong@gmail.com',
          contactCustomFieldValues: {
            '7': '2019-07-16T06:29:32.814Z',
            '8': 'King Kong',
          },
        },
        caseContactRole: {
          label: 'Tenant',
        },
      },
    ];

    configNoticeForm = {
      label: 'Final Notice',
      content: `{{owner_contact_type}}
        {{owner_contact_email}}
        {{owner_contact_cell_phone}}
        {{tenant_contact_cell_phone}}
        {{tenant_contact_vendor}}
        {{tenant_contact_mailing_address}}
        {{tenant_con_cf_7}}
        {{tenant_con_cf_8}}
        {{tenant_con_cf_71}}`,
      noticeType: NoticeType.HTML,
      isActive: true,
      mergeFields: {
        Contact: {
          fields: [
            '{{owner_contact_name}}',
            '{{owner_contact_type}}',
            '{{owner_contact_email}}',
            '{{owner_contact_cell_phone}}',
            '{{tenant_contact_cell_phone}}',
            '{{tenant_contact_mailing_address}}',
            '{{tenant_contact_vendor}}',
            '{{tenant_contact_work_phone}}',
            '{{tenant_con_cf_7}}',
            '{{tenant_con_cf_8}}',
            '{{tenant_con_cf_71}}',
          ],
        },
      },
      mergeTables: null,
      headerSection: {
        label: 'Welcome Header',
        content: `{{tenant_contact_vendor}}`,
        sectionType: NoticeFormSectionType.HEADER,
        isActive: true,
        mergeFields: {
          Contact: {
            fields: ['{{tenant_contact_vendor}}'],
          },
        },
      },
      footerSection: {
        label: 'Copyright Footer',
        content: `{{tenant_contact_mailing_address}}`,
        sectionType: NoticeFormSectionType.HEADER,
        isActive: true,
        mergeFields: {
          Contact: {
            fields: ['{{tenant_contact_mailing_address}}'],
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
      .stub(XerceCaseContactService.prototype, 'getAllRecords')
      .withArgs(agencyId, caseId)
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
      null,
      userProfile
    );

    expect(resolvedFields).to.deep.equal(result);
  });

  it('should resolve all dynamic contact merge fields without cellphone, workphone, email', async () => {
    xerceCaseContacts = [
      {
        id: 1,
        isBillable: true,
        caseContactRoleId: 11,
        contact: {
          name: 'King Kong',
          streetAddress: '12B High St',
          city: 'Huang Thai',
          state: 'Kin Toe',
          zip: '12345',
          isVendor: true,
          contactType: ContactType.INDIVIDUAL,
          cellPhone: null,
          workPhone: null,
          email: null,
          contactCustomFieldValues: null,
        },
        caseContactRole: {
          label: 'Owner',
        },
      },
      {
        id: 2,
        isBillable: false,
        caseContactRoleId: 12,
        contact: {
          name: 'Ping Pong',
          streetAddress: '12B High St',
          city: 'Huang Thai',
          state: 'Kin Toe',
          zip: '12345',
          isVendor: true,
          contactType: ContactType.INDIVIDUAL,
          cellPhone: null,
          workPhone: null,
          email: null,
          contactCustomFieldValues: {
            '7': '2019-07-16T06:29:32.814Z',
            '8': 'King Kong',
          },
        },
        caseContactRole: {
          label: 'Tenant',
        },
      },
    ];

    resolvedFields = {
      '{{owner_contact_name}}': 'King Kong',
      '{{owner_contact_cell_phone}}': '{{owner_contact_cell_phone}}',
      '{{owner_contact_email}}': '{{owner_contact_email}}',
      '{{owner_contact_type}}': 'INDIVIDUAL',
      '{{tenant_contact_cell_phone}}': '{{tenant_contact_cell_phone}}',
      '{{tenant_contact_mailing_address}}':
        '12B High St, Huang Thai, Kin Toe, 12345',
      '{{tenant_contact_vendor}}': 'Yes',
      '{{tenant_contact_work_phone}}': '{{tenant_contact_work_phone}}',
      '{{tenant_con_cf_7}}': '2019-07-16',
      '{{tenant_con_cf_8}}': 'King Kong',
      '{{tenant_con_cf_71}}': '{{tenant_con_cf_71}}',
    };
    sandbox
      .stub(XerceCaseContactService.prototype, 'getAllRecords')
      .withArgs(agencyId, caseId)
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
      null,
      userProfile
    );

    expect(resolvedFields).to.deep.equal(result);
  });

  it('should throw error for no contact', async () => {
    xerceCaseContacts = [];

    sandbox
      .stub(XerceCaseContactService.prototype, 'getAllRecords')
      .withArgs(agencyId, caseId)
      .resolves(xerceCaseContacts);

    sandbox
      .stub(CaseRoleService.prototype, 'getAllActive')
      .withArgs(agencyId)
      .resolves(activeCaseRoles);

    await resolveFields(
      agencyId,
      caseId,
      configNoticeForm,
      null,
      userProfile
    ).catch(err => expect(err.name).to.equal('InvalidRequestError'));
  });

  it('should throw error while resolving dynamic contact merge fields', async () => {
    sandbox
      .stub(XerceCaseContactService.prototype, 'getAllRecords')
      .withArgs(agencyId, caseId)
      .throws('InternalServerError');

    await resolveFields(
      agencyId,
      caseId,
      configNoticeForm,
      null,
      userProfile
    ).catch(err => expect(err.name).to.equal('InternalServerError'));
  });
});
