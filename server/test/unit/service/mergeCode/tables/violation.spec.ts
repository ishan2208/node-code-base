import { expect } from 'chai';
import 'mocha';
import * as sinon from 'sinon';

import { resolveTables } from '../../../../../api/service/mergeCode/tables/violation';
import XerceCaseViolationService from '../../../../../api/service/xerce/xerceCaseViolation';

describe('ViolationTables Service: resolveTables method', () => {
  let sandbox;
  const agencyId = 1;
  const caseId = 1;
  let configNoticeForm;
  let uiMergeCodes: IGenerateNoticeUiCodes;
  let configViolations;

  const resolvedTables = {
    '{{open_violations_comma_separated}}': `Animal Control<br><br><table style='font-family:\"Arial\"; font-size:12px' role='grid' border='1' cellspacing='0'><colgroup><thead><tr role='row'><th><div>Animal Colour</div></th><th><div>Age</div></th><th><div>entityDate</div></th></tr></thead><tbody><tr role=\"row\"><td>-</td><td>-</td><td>2019-07-09</td></tr></tbody></table><br><br>`,
    '{{open_violations_list}}': `Animal Control<br><br><br><table style='font-family:\"Arial\"; font-size:12px' role='grid' border='1' cellspacing='0'><colgroup><thead><tr role='row'><th><div>Animal Colour</div></th><th><div>Age</div></th><th><div>entityDate</div></th></tr></thead><tbody><tr role=\"row\"><td>-</td><td>-</td><td>2019-07-09</td></tr></tbody></table><br><br>`,
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

    configViolations = [
      {
        id: 1,
        agencyId,
        xerceId: 1,
        configMunicipalCodeId: 1,
        configViolationTypeId: 1,
        label: 'Animal Control',
        complyByDays: 7,
        sequence: 1,
        isActive: true,
        createdAt: new Date('2018-03-30T08:36:22.338Z'),
        updatedAt: new Date('2018-03-30T08:36:22.338Z'),
        violationType: {
          id: 1,
          agencyId,
          xerceId: 1,
          systemXerceViolationTypeId: 1,
          label: 'Animal',
          iconId: 1,
          isCustom: false,
          isActive: true,
          activatedAt: new Date('2018-03-30T08:36:22.338Z'),
          createdAt: new Date('2018-03-30T08:36:22.338Z'),
          updatedAt: new Date('2018-03-30T08:36:22.338Z'),
          deletedAt: null,
          configEntitySection: {
            id: 1,
            agencyId,
            xerceId: 1,
            configXerceViolationTypeId: 11,
            label: 'Animal',
            isActive: true,
            isCustom: false,
            createdAt: new Date('2018-03-30T08:36:22.338Z'),
            updatedAt: new Date('2018-03-30T08:36:22.338Z'),
            configEntityFields: [
              {
                id: 61,
                label: 'Animal Colour',
                isActive: true,
                type: CustomFieldType.TEXT,
                options: [],
                isMergeField: true,
                isIncludedInEntityName: true,
                sequence: 1,
              },
              {
                id: 62,
                label: 'License Number',
                isActive: true,
                type: CustomFieldType.NUMBER,
                options: [],
                isMergeField: false,
                isIncludedInEntityName: true,
                sequence: 1,
              },
              {
                id: 63,
                label: 'Age',
                isActive: true,
                type: CustomFieldType.NUMBER,
                options: [],
                isMergeField: true,
                isIncludedInEntityName: false,
                sequence: 1,
              },
              {
                id: 64,
                label: 'Breed',
                isActive: true,
                type: CustomFieldType.TEXT,
                options: [],
                isMergeField: false,
                isIncludedInEntityName: false,
                sequence: 1,
              },
              {
                id: 16,
                agencyId: 1,
                xerceId: 1,
                configXerceEntitySection: 1,
                label: 'entityDate',
                isActive: true,
                type: 'DATE',
                options: [],
                isMergeField: true,
                isIncludedInEntityName: false,
                sequence: 5,
                createdAt: new Date('2019-07-12T06:33:13.901Z'),
                updatedAt: new Date('2019-07-12T06:33:55.942Z'),
                deletedAt: null,
                config_xerce_entity_sect: 1,
              },
            ],
          },
        },
      },
    ];

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
            '16': '2019-07-09T07:00:00.000Z',
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
      content: `{{open_violations_list}}
      {{open_violations_comma_separated}}`,
      noticeType: NoticeType.HTML,
      isActive: true,
      mergeFields: null,
      mergeTables: {
        Violation: {
          tables: [
            '{{open_violations_list}}',
            '{{open_violations_comma_separated}}',
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

  it('should resolve all violation merge tables', async () => {
    sandbox
      .stub(XerceCaseViolationService.prototype, 'validateRequest')
      .resolves(configViolations);

    const result = await resolveTables(
      agencyId,
      caseId,
      configNoticeForm,
      uiMergeCodes,
      userProfile
    );

    expect(resolvedTables).to.deep.equal(result);
  });
});
