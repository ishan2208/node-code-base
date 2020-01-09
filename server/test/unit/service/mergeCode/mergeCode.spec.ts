import { expect } from 'chai';
import 'mocha';
import * as sinon from 'sinon';

import MergeCodeService from '../../../../api/service/mergeCode/mergeCode';
import MergeFieldService from '../../../../api/service/xerce/mergeField';
import MergeTableService from '../../../../api/service/xerce/mergeTable';

describe('MergeCode Service: getAll method', () => {
  let sandbox;
  const agencyId = 1;

  const mergeFields: IMergeCodeList[] = [
    {
      category: MergeFieldCategory.AGENCY_INFORMATION,
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
      category: MergeFieldCategory.CASE_INFORMATION,
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
          name: 'Logged In User (First, Last)',
          code: '{{logged_in_user_first_last}}',
        },
      ],
    },
    {
      category: MergeFieldCategory.CASE_ACTIVITY,
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
  ];

  const dynamicContactRecipientMergeFields = {
    category: MergeFieldCategory.CONTACT_RECIPIENT,
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
    category: MergeFieldCategory.LOCATION,
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

  const mergeTables = [
    {
      category: MergeTableCategory.CASE_LOCATION,
      codes: [
        {
          name: MergeTableNames.CASE_LOCATION_STACKED,
          code: MergeTables.CASE_LOCATION_STACKED,
        },
        {
          name: MergeTableNames.CASE_LOCATION_COMMA_SEPARATED,
          code: MergeTables.CASE_LOCATION_COMMA_SEPARATED,
        },
      ],
    },
    {
      category: MergeTableCategory.CONTACTS,
      codes: [
        {
          name: MergeTableNames.NAME_BILL_TO_CONTACT,
          code: MergeTables.NAME_BILL_TO_CONTACT,
        },
        {
          name: MergeTableNames.NAME_AND_ADDRESS_BILL_TO_CONTACT,
          code: MergeTables.NAME_AND_ADDRESS_BILL_TO_CONTACT,
        },
        {
          name: MergeTableNames.ALL_CONTACTS,
          code: MergeTables.ALL_CONTACTS,
        },
        {
          name: MergeTableNames.ALL_LEGAL_ENTITIES,
          code: MergeTables.ALL_LEGAL_ENTITIES,
        },
        {
          name: 'Name (Owner)',
          code: '{{name_Owner}}',
        },
        {
          name: `Name, Address (Owner)`,
          code: `{{name_and_address_Owner}}`,
        },
      ],
    },
    {
      category: MergeTableCategory.MUNICIPAL_CODE,
      codes: [
        {
          name: MergeTableNames.MUNICODE_DESCRIPTION,
          code: MergeTables.MUNICODE_DESCRIPTION,
        },
        {
          name: MergeTableNames.MUNICODE_RESOLUION,
          code: MergeTables.MUNICODE_RESOLUION,
        },
        {
          name: MergeTableNames.MUNICODE_RESOLUION_NONCOMPLYBY,
          code: MergeTables.MUNICODE_RESOLUION_NONCOMPLYBY,
        },
      ],
    },
    {
      category: MergeTableCategory.VIOLATION,
      codes: [
        {
          name: MergeTableNames.OPEN_VIOLATIONS_LIST,
          code: MergeTables.OPEN_VIOLATIONS_LIST,
        },
        {
          name: MergeTableNames.OPEN_VIOLATIONS_COMMA_SEPARATED,
          code: MergeTables.OPEN_VIOLATIONS_COMMA_SEPARATED,
        },
      ],
    },
    {
      category: MergeTableCategory.PHOTOS_AND_ATTACHMENTS,
      codes: [
        {
          name: MergeTableNames.PHOTOS,
          code: MergeTables.PHOTOS,
        },
      ],
    },
    {
      category: MergeTableCategory.CASE_CUSTOM_TILE,
      codes: [
        {
          name: 'Case Custom Tile - Property Lien',
          code: '{{custom_tile_Property_Lien}}',
        },
      ],
    },
  ];

  const allMergeCodes: IConfigMergeCodes = {
    fields: mergeFields,
    tables: mergeTables,
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should resolve all agency info merge fields', async () => {
    sandbox
      .stub(MergeFieldService.prototype, 'getAll')
      .withArgs(agencyId)
      .resolves(mergeFields);

    sandbox
      .stub(MergeTableService.prototype, 'getAll')
      .withArgs(agencyId)
      .resolves(mergeTables);

    const result = await new MergeCodeService().getAll(agencyId);

    expect(allMergeCodes).to.deep.equal(result);
  });
});
