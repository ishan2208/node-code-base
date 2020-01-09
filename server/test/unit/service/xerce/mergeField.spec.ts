import { expect } from 'chai';
import 'mocha';
import * as sinon from 'sinon';

import CaseRoleService from '../../../../api/service/agencySetup/configCaseRole';
import ConfigContactCustomFieldService from '../../../../api/service/agencySetup/configContactCustomField';
import MergeFieldService from '../../../../api/service/xerce/mergeField';

describe('mergeField Service: getAll Method', () => {
  let sandbox;
  //const agencyId = 1;
  const mergeFields = [
    {
      category: 'Agency Information',
      codes: [
        {
          name: 'Name of Agency (County)',
          code: '{{agency_name}}',
        },
        {
          name: 'Agency Address',
          code: '{{agency_address}}',
        },
        {
          name: 'City',
          code: '{{agency_city}}',
        },
        {
          name: 'State',
          code: '{{agency_state}}',
        },
        {
          name: 'Zip Code',
          code: '{{agency_zipcode}}',
        },
        {
          name: 'Agency timezone',
          code: '{{agency_timezone}}',
        },
        {
          name: 'Email Address',
          code: '{{agency_email_id}}',
        },
        {
          name: 'Website Address (URL)',
          code: '{{agency_web_url}}',
        },
        {
          name: 'Whitelisted URL',
          code: '{{agency_whitelisted_url}}',
        },
        {
          name: 'Center latitude',
          code: '{{center_latitude}}',
        },
        {
          name: 'Center longitude',
          code: '{{center_longitude}}',
        },
        {
          name: 'Map zoom level',
          code: '{{map_zoom_level}}',
        },
      ],
    },
    {
      category: 'Case Information',
      codes: [
        {
          name: 'Case Number',
          code: '{{case_number}}',
        },
        {
          name: 'Case issue description',
          code: '{{case_issue_description}}',
        },
        {
          name: 'Case create date (numeric)',
          code: '{{case_create_date_numeric}}',
        },
        {
          name: 'Case create date (spelled out)',
          code: '{{case_create_date_spelled}}',
        },
        {
          name: `Today's Date (numeric)`,
          code: '{{todays_date_numeric}}',
        },
        {
          name: `Today's Date (spelled)`,
          code: '{{todays_date_spelled}}',
        },
        {
          name: 'Current Time',
          code: '{{current_time}}',
        },
        {
          name: 'Case Assignee (Last, First)',
          code: '{{case_assignee_last_first}}',
        },
        {
          name: 'Case Assignee (First, Last)',
          code: '{{case_assignee_first_last}}',
        },
        {
          name: 'Logged In User (Last, First)',
          code: '{{logged_in_user_last_first}}',
        },
        {
          name: 'Logged In User Signature Block',
          code: '{{logged_in_user_signature_block}}',
        },
        {
          name: 'Logged in user Signature Image',
          code: '{{logged_in_user_signature_image}}',
        },
      ],
    },
    {
      category: 'Case Activity',
      codes: [
        {
          name: 'Next inspection date (numeric)',
          code: '{{next_inspection_date_numeric}}',
        },
        {
          name: 'Next inspection date (spelled out)',
          code: '{{next_inspection_date_spelled}}',
        },
        {
          name: 'Next Inspection Assignee',
          code: '{{next_inspection_assignee}}',
        },
      ],
    },
    {
      category: 'Fees',
      codes: [
        {
          name: 'Fees paid',
          code: '{{fees_paid}}',
        },
        {
          name: 'Current balance',
          code: '{{current_balance}}',
        },
        {
          name: 'Total fees',
          code: '{{total_fees}}',
        },
        {
          name: 'Most recent payment amount',
          code: '{{most_recent_payment}}',
        },
        {
          name: 'Payment type (most recent payment)',
          code: '{{payment_type}}',
        },
        {
          name: 'Payment date (most recent payment)',
          code: '{{payment_date}}',
        },
        {
          name: 'Receipt # (most recent payment)',
          code: '{{receipt}}',
        },
      ],
    },
  ];

  const dynamicContactRecipientMergeFields = {
    category: 'Contact Recipient',
    codes: [
      {
        code: '{{recipient_case_role}}',
        name: 'Recipient Case Role',
      },
      {
        code: '{{recipient_contact_type}}',
        name: 'Recipient Type',
      },
      {
        code: '{{recipient_contact_name}}',
        name: 'Recipient Name',
      },
      {
        code: '{{recipient_contact_email}}',
        name: 'Recipient Email',
      },
      {
        code: '{{recipient_contact_work_phone}}',
        name: 'Recipient Work Phone',
      },
      {
        code: '{{recipient_contact_cell_phone}}',
        name: 'Recipient Cell Phone',
      },
      {
        code: '{{recipient_contact_mailing_address}}',
        name: 'Recipient Address',
      },
      {
        code: '{{recipient_vendor}}',
        name: 'Recipient Vendor',
      },
    ],
  };

  const dynamicContactMergeFields = {
    category: MergeFieldCategory.CONTACT,
    codes: [
      {
        name: 'Owner - Type',
        code: '{{Owner_contact_type}}',
      },
      {
        name: 'Owner - Name',
        code: '{{Owner_contact_name}}',
      },
      {
        name: 'Owner - Email',
        code: '{{Owner_contact_email}}',
      },
      {
        name: 'Owner - Work Phone',
        code: '{{Owner_contact_work_phone}}',
      },
      {
        name: 'Owner - Cell Phone',
        code: '{{Owner_contact_cell_phone}}',
      },
      {
        name: 'Owner - Address',
        code: '{{Owner_contact_mailing_address}}',
      },
      {
        name: 'Owner - Vendor',
        code: '{{Owner_contact_vendor}}',
      },
      {
        name: 'Contact Custom Field - Owner - License no',
        code: '{{Owner_con_cf_23}}',
      },
      {
        name: 'Contact Custom Field - Owner - PAN  Number',
        code: '{{Owner_con_cf_22}}',
      },
      {
        name: 'Contact Custom Field - Owner - Passport No',
        code: '{{Owner_con_cf_36}}',
      },
      {
        name: 'Tenant - Type',
        code: '{{Tenant_contact_type}}',
      },
      {
        name: 'Tenant - Name',
        code: '{{Tenant_contact_name}}',
      },
      {
        name: 'Tenant - Email',
        code: '{{Tenant_contact_email}}',
      },
      {
        name: 'Tenant - Work Phone',
        code: '{{Tenant_contact_work_phone}}',
      },
      {
        name: 'Tenant - Cell Phone',
        code: '{{Tenant_contact_cell_phone}}',
      },
      {
        name: 'Tenant - Address',
        code: '{{Tenant_contact_mailing_address}}',
      },
      {
        name: 'Tenant - Vendor',
        code: '{{Tenant_contact_vendor}}',
      },
      {
        name: 'Contact Custom Field - Tenant - License no',
        code: '{{Tenant_con_cf_23}}',
      },
      {
        name: 'Contact Custom Field - Tenant - PAN  Number',
        code: '{{Tenant_con_cf_22}}',
      },
      {
        name: 'Contact Custom Field - Tenant - Passport No',
        code: '{{Tenant_con_cf_36}}',
      },
    ],
  };

  const dynamicLocationMergeFields = {
    category: 'Location',
    codes: [
      {
        code: '{{case_location_address}}',
        name: 'Case Location Address',
      },
      {
        code: '{{case_apn}}',
        name: 'Case Location Apn',
      },
      {
        code: '{{case_flagged_address}}',
        name: 'Case Flagged address',
      },
      {
        code: '{{flagged_address_reason}}',
        name: 'Reason for flagging address',
      },
    ],
  };

  mergeFields.push(dynamicContactMergeFields);
  mergeFields.push(dynamicContactRecipientMergeFields);
  mergeFields.push(dynamicLocationMergeFields);

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });
});

describe('mergeField Service: getDynamicContactMergeFields Method', () => {
  let sandbox;
  const agencyId = 1;
  let activeCaseRoles;
  let contactCustomFields;
  let mergeFields;

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

    contactCustomFields = [
      {
        id: 23,
        label: 'License no',
        contactType: 'LEGAL_ENTITY',
        isActive: true,
        options: [],
        type: 'NUMBER',
        sequence: 1,
      },
      {
        id: 22,
        label: 'PAN  Number',
        contactType: 'INDIVIDUAL',
        isActive: true,
        options: [],
        type: 'TEXT',
        sequence: 1,
      },
      {
        id: 36,
        label: 'Passport No',
        contactType: 'INDIVIDUAL',
        isActive: true,
        options: [],
        type: 'TEXT',
        sequence: 2,
      },
      {
        id: 49,
        label: 'Aadhar',
        contactType: 'INDIVIDUAL',
        isActive: false,
        options: [],
        type: 'TEXT',
        sequence: 3,
      },
    ];

    mergeFields = {
      category: MergeFieldCategory.CONTACT,
      codes: [
        {
          name: 'Owner - Type',
          code: '{{Owner_contact_type}}',
        },
        {
          name: 'Owner - Name',
          code: '{{Owner_contact_name}}',
        },
        {
          name: 'Owner - Email',
          code: '{{Owner_contact_email}}',
        },
        {
          name: 'Owner - Work Phone',
          code: '{{Owner_contact_work_phone}}',
        },
        {
          name: 'Owner - Cell Phone',
          code: '{{Owner_contact_cell_phone}}',
        },
        {
          name: 'Owner - Address',
          code: '{{Owner_contact_mailing_address}}',
        },
        {
          name: 'Owner - Vendor',
          code: '{{Owner_contact_vendor}}',
        },
        {
          name: 'Contact Custom Field - Owner - License no',
          code: '{{Owner_con_cf_23}}',
        },
        {
          name: 'Contact Custom Field - Owner - PAN  Number',
          code: '{{Owner_con_cf_22}}',
        },
        {
          name: 'Contact Custom Field - Owner - Passport No',
          code: '{{Owner_con_cf_36}}',
        },
        {
          name: 'Tenant - Type',
          code: '{{Tenant_contact_type}}',
        },
        {
          name: 'Tenant - Name',
          code: '{{Tenant_contact_name}}',
        },
        {
          name: 'Tenant - Email',
          code: '{{Tenant_contact_email}}',
        },
        {
          name: 'Tenant - Work Phone',
          code: '{{Tenant_contact_work_phone}}',
        },
        {
          name: 'Tenant - Cell Phone',
          code: '{{Tenant_contact_cell_phone}}',
        },
        {
          name: 'Tenant - Address',
          code: '{{Tenant_contact_mailing_address}}',
        },
        {
          name: 'Tenant - Vendor',
          code: '{{Tenant_contact_vendor}}',
        },
        {
          name: 'Contact Custom Field - Tenant - License no',
          code: '{{Tenant_con_cf_23}}',
        },
        {
          name: 'Contact Custom Field - Tenant - PAN  Number',
          code: '{{Tenant_con_cf_22}}',
        },
        {
          name: 'Contact Custom Field - Tenant - Passport No',
          code: '{{Tenant_con_cf_36}}',
        },
      ],
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should get all the active case roles', async () => {
    sandbox
      .stub(CaseRoleService.prototype, 'getAllActive')
      .withArgs(agencyId)
      .resolves(activeCaseRoles);

    sandbox
      .stub(ConfigContactCustomFieldService.prototype, 'getAll')
      .withArgs(agencyId)
      .returns(contactCustomFields);

    const result = await new MergeFieldService().getDynamicContactMergeFields(
      agencyId
    );

    expect(result).to.deep.equal(mergeFields);
  });

  it('should throw error while fetching config contact custom fields.', async () => {
    sandbox
      .stub(ConfigContactCustomFieldService.prototype, 'getAll')
      .withArgs(agencyId)
      .returns(contactCustomFields);

    await new MergeFieldService()
      .getDynamicContactMergeFields(agencyId)
      .catch(err => expect(err.name).to.equal('TypeError'));
  });
});
