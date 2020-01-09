import { expect } from 'chai';
import 'mocha';
import * as sinon from 'sinon';

import ConfigCaseCustomTileService from '../../../../api/service/agencySetup/configCaseCustomTile';
import CaseRoleService from '../../../../api/service/agencySetup/configCaseRole';
import MergeTableService from '../../../../api/service/xerce/mergeTable';

describe('mergeTable Service: getDynamicCustomTileTables Method', () => {
  let sandbox;
  let customTiles: ICaseCustomTile[];
  let customTileMergeTables: IMergeCodeList;
  const agencyId = 1;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    customTiles = [
      {
        id: 11,
        label: 'Property Lien',
        isActive: true,
        caseCustomFields: [
          {
            id: 100,
            label: 'Start',
            isActive: true,
            isMergeField: true,
            type: CustomFieldType.TEXT,
            options: null,
            sequence: 1,
          },
          {
            id: 101,
            label: 'End',
            isActive: true,
            isMergeField: true,
            type: CustomFieldType.TEXT,
            options: null,
            sequence: 2,
          },
        ],
      },
    ];

    customTileMergeTables = {
      category: MergeTableCategory.CASE_CUSTOM_TILE,
      codes: [
        {
          name: 'Case Custom Tile - Property Lien',
          code: '{{custom_tile_Property_Lien}}',
        },
      ],
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('Should return custom tile merge tables', async () => {
    sandbox
      .stub(ConfigCaseCustomTileService.prototype, 'getActiveCaseCustomTiles')
      .withArgs(agencyId)
      .resolves(customTiles);

    const result = await (new MergeTableService() as any).getDynamicCustomTileTables(
      agencyId
    );

    expect(result).to.deep.equal(customTileMergeTables);
  });
});

describe('mergeTable Service: getDynamicContactMergeTables Method', () => {
  let sandbox;
  let caseRoles: ICaseRole[];
  let contactMergeTables: IMergeCodeList;
  const agencyId = 1;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    caseRoles = [
      {
        id: 11,
        label: 'Owner',
        isDefault: true,
        isActive: true,
        sequence: 1,
      },
    ];

    contactMergeTables = {
      category: MergeTableCategory.CONTACTS,
      codes: [
        {
          name: 'Name (Owner)',
          code: '{{name_Owner}}',
        },
        {
          name: `Name, Address (Owner)`,
          code: `{{name_and_address_Owner}}`,
        },
      ],
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('Should return contact merge tables', async () => {
    sandbox
      .stub(CaseRoleService.prototype, 'getAllActive')
      .withArgs(agencyId)
      .resolves(caseRoles);

    const result = await (new MergeTableService() as any).getDynamicContactMergeTables(
      agencyId
    );

    expect(result).to.deep.equal(contactMergeTables);
  });
});

describe('mergeTable Service: getAllDynamicMergeTables Method', () => {
  let sandbox;
  let dynamicMergeTables: IMergeCodeList[];
  const agencyId = 1;

  const contactMergeTables = {
    category: MergeTableCategory.CONTACTS,
    codes: [
      {
        name: 'Name (Owner)',
        code: '{{name_Owner}}',
      },
      {
        name: `Name, Address (Owner)`,
        code: `{{name_and_address_Owner}}`,
      },
    ],
  };

  const customTileMergeTables = {
    category: MergeTableCategory.CASE_CUSTOM_TILE,
    codes: [
      {
        name: 'Case Custom Tile - Property Lien',
        code: '{{custom_tile_Property_Lien}}',
      },
    ],
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    dynamicMergeTables = [
      {
        category: MergeTableCategory.CONTACTS,
        codes: [
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
        category: MergeTableCategory.CASE_CUSTOM_TILE,
        codes: [
          {
            name: 'Case Custom Tile - Property Lien',
            code: '{{custom_tile_Property_Lien}}',
          },
        ],
      },
    ];
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('Should return all dynamic merge tables', async () => {
    sandbox
      .stub(MergeTableService.prototype, 'getDynamicContactMergeTables')
      .resolves(contactMergeTables);
    sandbox
      .stub(MergeTableService.prototype, 'getDynamicCustomTileTables')
      .resolves(customTileMergeTables);

    sandbox.stub(Promise, 'all').resolves(dynamicMergeTables);

    const result = await (new MergeTableService() as any).getAllDynamicMergeTables(
      agencyId
    );

    expect(result).to.deep.equal(dynamicMergeTables);
  });
});

describe('mergeTable Service: getAll Method', () => {
  let sandbox;
  const agencyId = 1;
  let allMergeTables: IMergeCodeList[];

  const contactMergeTables = {
    category: MergeTableCategory.CONTACTS,
    codes: [
      {
        name: 'Name (Owner)',
        code: '{{name_Owner}}',
      },
      {
        name: `Name, Address (Owner)`,
        code: `{{name_and_address_Owner}}`,
      },
    ],
  };

  const customTileMergeTables = {
    category: MergeTableCategory.CASE_CUSTOM_TILE,
    codes: [
      {
        name: 'Case Custom Tile - Property Lien',
        code: '{{custom_tile_Property_Lien}}',
      },
    ],
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    allMergeTables = [
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
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('Should return all dynamic merge tables', async () => {
    sandbox
      .stub(MergeTableService.prototype, 'getDynamicContactMergeTables')
      .resolves(contactMergeTables);
    sandbox
      .stub(MergeTableService.prototype, 'getDynamicCustomTileTables')
      .resolves(customTileMergeTables);

    const result = await new MergeTableService().getAll(agencyId);

    expect(result).to.deep.equal(allMergeTables);
  });
});

describe('mergeTable Service: getHTMLContentMergeTables Method', () => {
  let sandbox;
  let dynamicMergeTables: IMergeCodeList[];
  const agencyId = 1;
  const templateVariables = [
    '{{all_contacts}}',
    '{{municode_description}}',
    '{{name_owner}}',
    '{{custom_tile_property_lien}}',
  ];

  const responseBody = {
    'Case Custom Tile': {
      tables: ['{{custom_tile_property_lien}}'],
    },
    Contacts: {
      tables: ['{{all_contacts}}', '{{name_owner}}'],
    },
    'Municipal Code': {
      tables: ['{{municode_description}}'],
    },
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    dynamicMergeTables = [
      {
        category: MergeTableCategory.CONTACTS,
        codes: [
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
        category: MergeTableCategory.CASE_CUSTOM_TILE,
        codes: [
          {
            name: 'Case Custom Tile - Property Lien',
            code: '{{custom_tile_Property_Lien}}',
          },
        ],
      },
    ];
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('Should return all merge tables object with category', async () => {
    sandbox
      .stub(MergeTableService.prototype, 'getAllDynamicMergeTables')
      .resolves(dynamicMergeTables);

    const result = await new MergeTableService().getHTMLContentMergeTables(
      agencyId,
      templateVariables
    );

    expect(result).to.deep.equal(responseBody);
  });
});
