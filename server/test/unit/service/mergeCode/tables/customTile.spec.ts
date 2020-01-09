import { expect } from 'chai';
import 'mocha';
import * as sinon from 'sinon';

import ConfigCaseCustomTileService from '../../../../../api/service/agencySetup/configCaseCustomTile';
import { resolveTables } from '../../../../../api/service/mergeCode/tables/customTile';
import XerceCaseService from '../../../../../api/service/xerce/xerceCase';

describe('CustomTileTable Service: resolveTables method', () => {
  let sandbox;
  const agencyId = 1;
  const caseId = 1;
  let configNoticeForm;
  let uiMergeCodes: IGenerateNoticeUiCodes;
  let xerceCase;
  let activeCustomTiles: ICaseCustomTile[];

  let resolvedTables: any;

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

    resolvedTables = {
      '{{custom_tile_property_lien}}': `<table style='font-family:\"Arial\"; font-size:12px' role='grid' border='1' cellspacing='0'><colgroup><thead><tr role='row'><th><div>Start Date</div></th><th><div>End Date</div></th><th><div>Property Lien Type</div></th><th><div>Property Lien By</div></th></tr></thead><tbody><tr role=\"row\"><td>2020-08-20</td><td>2020-08-22</td><td>-</td><td>Owner</td></tr></tbody></table><br><br>`,
    };

    activeCustomTiles = [
      {
        id: 1,
        isActive: true,
        label: 'Property Lien',
        caseCustomFields: [
          {
            id: 1,
            isActive: true,
            isMergeField: true,
            label: 'Start Date',
            options: [],
            type: CustomFieldType.DATE,
            sequence: 1,
          },
          {
            id: 2,
            isActive: true,
            isMergeField: true,
            label: 'End Date',
            options: [],
            type: CustomFieldType.DATE,
            sequence: 2,
          },
          {
            id: 3,
            isActive: true,
            isMergeField: true,
            label: 'Property Lien Type',
            options: ['Short Term', 'Long Term'],
            type: CustomFieldType.PICKLIST,
            sequence: 3,
          },
          {
            id: 4,
            isActive: true,
            isMergeField: true,
            label: 'Property Lien By',
            options: [],
            type: CustomFieldType.TEXT,
            sequence: 4,
          },
        ],
      },
    ];

    xerceCase = {
      id: 100,
      customCaseFieldValues: [
        {
          '1': {
            '1': '2020-08-20',
            '2': '2020-08-22',
            '3': null,
            '4': 'Owner',
          },
        },
      ],
    };

    uiMergeCodes = {
      recipientIds: [111, 112],
      responsibleContactId: 111,
      attachments: [],
      openViolations: [
        {
          configViolationId: 1,
          entity: {
            'Animal Colour': 'Black',
            'License Number': 1234,
            Age: 12,
            Breed: '',
            Note: '',
          },
        },
      ],
      resolutionActions: [],
      nextInspection: {
        plannedDate: new Date('2019-05-13T06:29:32.814Z'),
        assigneeId: 11,
      },
      caseAssigneeId: 11,
    };

    configNoticeForm = {
      label: 'Final Notice',
      content: `{{custom_tile_property_lien}}`,
      noticeType: NoticeType.HTML,
      isActive: true,
      mergeFields: null,
      mergeTables: {
        'Case Custom Tile': { tables: ['{{custom_tile_property_lien}}'] },
      },
      headerSection: {
        label: 'Welcome Header',
        content: `Welcome`,
        sectionType: NoticeFormSectionType.HEADER,
        isActive: true,
        mergeFields: null,
      },
      footerSection: {
        label: 'Copyright Footer',
        content: `Address`,
        sectionType: NoticeFormSectionType.HEADER,
        isActive: true,
        mergeFields: null,
      },
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should resolve custom tile merge tables', async () => {
    sandbox
      .stub(ConfigCaseCustomTileService.prototype, 'getActiveCaseCustomTiles')
      .resolves(activeCustomTiles);

    sandbox
      .stub(XerceCaseService.prototype, 'getRecord')
      .withArgs(agencyId, caseId)
      .resolves(xerceCase);

    const result = await resolveTables(
      agencyId,
      caseId,
      configNoticeForm,
      uiMergeCodes,
      userProfile
    );

    expect(resolvedTables).to.deep.equal(result);
  });

  it('should stay unresolved because of no merge fields in custom tile', async () => {
    activeCustomTiles = [
      {
        id: 1,
        isActive: true,
        label: 'Property Lien',
        caseCustomFields: [
          {
            id: 1,
            isActive: true,
            isMergeField: false,
            label: 'Start Date',
            options: [],
            type: CustomFieldType.DATE,
            sequence: 1,
          },
          {
            id: 2,
            isActive: true,
            isMergeField: false,
            label: 'End Date',
            options: [],
            type: CustomFieldType.DATE,
            sequence: 2,
          },
          {
            id: 3,
            isActive: true,
            isMergeField: false,
            label: 'Property Lien Type',
            options: ['Short Term', 'Long Term'],
            type: CustomFieldType.PICKLIST,
            sequence: 3,
          },
          {
            id: 4,
            isActive: true,
            isMergeField: false,
            label: 'Property Lien By',
            options: [],
            type: CustomFieldType.TEXT,
            sequence: 4,
          },
        ],
      },
    ];

    resolvedTables = {};

    sandbox
      .stub(ConfigCaseCustomTileService.prototype, 'getActiveCaseCustomTiles')
      .resolves(activeCustomTiles);

    sandbox
      .stub(XerceCaseService.prototype, 'getRecord')
      .withArgs(agencyId, caseId)
      .resolves(xerceCase);

    const result = await resolveTables(
      agencyId,
      caseId,
      configNoticeForm,
      uiMergeCodes,
      userProfile
    );

    expect(resolvedTables).to.deep.equal(result);
  });

  it('should not resolve custom tile merge tables because of no active tiles', async () => {
    activeCustomTiles = [];

    resolvedTables = {};

    sandbox
      .stub(ConfigCaseCustomTileService.prototype, 'getActiveCaseCustomTiles')
      .resolves(activeCustomTiles);

    sandbox
      .stub(XerceCaseService.prototype, 'getRecord')
      .withArgs(agencyId, caseId)
      .resolves(xerceCase);

    const result = await resolveTables(
      agencyId,
      caseId,
      configNoticeForm,
      uiMergeCodes,
      userProfile
    );

    expect(resolvedTables).to.deep.equal(result);
  });

  it('should throw error while resolving custom tile merge tables', async () => {
    sandbox
      .stub(ConfigCaseCustomTileService.prototype, 'getActiveCaseCustomTiles')
      .resolves(activeCustomTiles);

    sandbox
      .stub(XerceCaseService.prototype, 'getRecord')
      .withArgs(agencyId, caseId)
      .throws('InternalServerError');

    await resolveTables(
      agencyId,
      caseId,
      configNoticeForm,
      uiMergeCodes,
      userProfile
    ).catch(err => expect(err.name).to.be.equal('InternalServerError'));
  });

  it('should stay unresolved because of no custom tile in case', async () => {
    xerceCase = {
      id: 100,
      customCaseFieldValues: [],
    };

    sandbox
      .stub(ConfigCaseCustomTileService.prototype, 'getActiveCaseCustomTiles')
      .resolves(activeCustomTiles);

    sandbox
      .stub(XerceCaseService.prototype, 'getRecord')
      .withArgs(agencyId, caseId)
      .resolves(xerceCase);

    const result = await resolveTables(
      agencyId,
      caseId,
      configNoticeForm,
      uiMergeCodes,
      userProfile
    );

    expect({}).to.deep.equal(result);
  });
});
