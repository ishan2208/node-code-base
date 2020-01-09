import { expect } from 'chai';
import 'mocha';
import * as sinon from 'sinon';

import db from '../../../../api/models';
import ConfigXerceViolationTypeService from '../../../../api/service/admin/configXerceViolationType';
import ConfigViolationService from '../../../../api/service/agencySetup/configViolation';

describe('ConfigViolationType Service: getByIds Method', () => {
  let sandbox;
  const agencyId = 1;
  let configViolations;
  let configViolationTypes;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    configViolations = [
      {
        id: 111,
        agencyId,
        xerceId: 1,
        configMunicipalCodeId: 1,
        configViolationTypeId: 11,
        label: 'Animal Control',
        complyByDays: 7,
        sequence: 1,
        isActive: true,
        createdAt: new Date('2018-03-30T08:36:22.338Z'),
        updatedAt: new Date('2018-03-30T08:36:22.338Z'),
        violationType: {
          id: 11,
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
                type: CustomFieldType.TEXT,
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
            ],
          },
        },
      },
      {
        id: 112,
        agencyId,
        xerceId: 1,
        configMunicipalCodeId: 1,
        configViolationTypeId: 12,
        label: 'General',
        complyByDays: 9,
        sequence: 2,
        isActive: true,
        createdAt: new Date('2018-03-30T08:36:22.338Z'),
        updatedAt: new Date('2018-03-30T08:36:22.338Z'),
        violationType: {
          id: 12,
          agencyId,
          xerceId: 1,
          systemXerceViolationTypeId: 2,
          label: 'General',
          iconId: 1,
          isCustom: false,
          isActive: true,
          activatedAt: new Date('2018-03-30T08:36:22.338Z'),
          createdAt: new Date('2018-03-30T08:36:22.338Z'),
          updatedAt: new Date('2018-03-30T08:36:22.338Z'),
          deletedAt: null,
          configEntitySection: null,
        },
      },
    ];

    configViolationTypes = [
      {
        id: 11,
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
              type: CustomFieldType.TEXT,
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
          ],
        },
      },
      {
        id: 12,
        agencyId,
        xerceId: 1,
        systemXerceViolationTypeId: 2,
        label: 'General',
        iconId: 1,
        isCustom: false,
        isActive: true,
        activatedAt: new Date('2018-03-30T08:36:22.338Z'),
        createdAt: new Date('2018-03-30T08:36:22.338Z'),
        updatedAt: new Date('2018-03-30T08:36:22.338Z'),
        deletedAt: null,
        configEntitySection: null,
      },
    ];
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return the violation based on ids', async () => {
    sandbox.stub(db.ConfigXerceViolation, 'findAll').resolves(configViolations);

    sandbox
      .stub(db.ConfigXerceViolationType, 'findAll')
      .resolves(configViolationTypes);

    const result = await new ConfigViolationService().getByIds(agencyId, [
      111,
      112,
    ]);

    expect(result).to.deep.equal(configViolations);
  });

  it('should throw error while fetching violation based on ids', async () => {
    sandbox.stub(db.ConfigXerceViolation, 'findAll').throws('Error');

    await new ConfigViolationService()
      .getByIds(agencyId, [111, 112])
      .catch(err => expect(err.name).to.equal('InternalServerError'));
  });

  it('should throw error while fetching violation type based on ids', async () => {
    sandbox.stub(db.ConfigXerceViolation, 'findAll').resolves(configViolations);

    sandbox.stub(db.ConfigXerceViolationType, 'findAll').throws('Error');

    await new ConfigViolationService()
      .getByIds(agencyId, [111, 112])
      .catch(err => expect(err.name).to.equal('InternalServerError'));
  });
});

describe('ConfigViolationType Service: searchViolations method', () => {
  let sandbox;
  const agencyId = 1;
  let configViolationsObj;
  let user: IAgencyUserClaim | ISuperAdminClaim;
  let configViolationTypes: IConfigViolationType[];
  let violations: IConfigViolation[];

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    user = {
      id: 0,
      agencyId: 1,
      agencyName: 'City of Alabama',
      email: 'cyberdynesupport@comcate.com',
      firstName: 'Comcate',
      lastName: 'Support',
      agencyTimezone: 'America/Los_Angeles',
      scopes: {
        superAdmin: true,
        xerce: {
          id: 1,
          productAdmin: true,
          reportAccess: ReportAccess.ALL_STAFF,
          dashboardAccess: DashboardAccess.ALL_STAFF_DASHBOARD,
          feesAccess: FeesAccess.CAN_VOID,
          violationTypeScope: {
            11: {
              violationTypeAccess: ViolationTypeACL.OVERWRITE,
              isActive: true,
            },
            12: {
              violationTypeAccess: ViolationTypeACL.OVERWRITE,
              isActive: true,
            },
            13: {
              violationTypeAccess: ViolationTypeACL.OVERWRITE,
              isActive: true,
            },
            14: {
              violationTypeAccess: ViolationTypeACL.OVERWRITE,
              isActive: true,
            },
          },
        },
      },
    };

    violations = [
      {
        id: 111,
        label: 'Animal Control',
        complyByDays: 7,
        configMunicipalCode: {
          id: 1,
          articleNumber: '11.21.3',
          description: 'Test Desc for Municipal Code',
          resolutionAction: 'Resolution Action for Municipal Code',
        },
        configViolationType: {
          id: 11,
          label: 'Animal',
          iconURL:
            'https://cyberdyne-dev.s3.amazonaws.com/agency_0/system_icon/animal.png',
        },
      },
      {
        id: 112,
        label: 'General',
        complyByDays: 9,
        configMunicipalCode: {
          id: 1,
          articleNumber: '11.21.3',
          description: 'Test Desc for Municipal Code',
          resolutionAction: 'Resolution Action for Municipal Code',
        },
        configViolationType: {
          id: 12,
          label: 'General',
          iconURL:
            'https://cyberdyne-dev.s3.amazonaws.com/agency_0/system_icon/general.png',
        },
      },
    ];

    configViolationsObj = [
      {
        id: 111,
        agencyId,
        xerceId: 1,
        configMunicipalCodeId: 1,
        configViolationTypeId: 11,
        label: 'Animal Control',
        complyByDays: 7,
        sequence: 1,
        isActive: true,
        createdAt: new Date('2018-03-30T08:36:22.338Z'),
        updatedAt: new Date('2018-03-30T08:36:22.338Z'),
        violationType: {
          id: 11,
          label: 'Animal',
          violationTypeIcon: {
            fileUrl:
              'https://cyberdyne-dev.s3.amazonaws.com/agency_0/system_icon/animal.png',
          },
        },
        municipalCode: {
          id: 1,
          articleNumber: '11.21.3',
          description: 'Test Desc for Municipal Code',
          resolutionAction: 'Resolution Action for Municipal Code',
        },
      },
      {
        id: 112,
        agencyId,
        xerceId: 1,
        configMunicipalCodeId: 1,
        configViolationTypeId: 12,
        label: 'General',
        complyByDays: 9,
        sequence: 2,
        isActive: true,
        createdAt: new Date('2018-03-30T08:36:22.338Z'),
        updatedAt: new Date('2018-03-30T08:36:22.338Z'),
        violationType: {
          id: 12,
          label: 'General',
          violationTypeIcon: {
            fileUrl:
              'https://cyberdyne-dev.s3.amazonaws.com/agency_0/system_icon/general.png',
          },
        },
        municipalCode: {
          id: 1,
          articleNumber: '11.21.3',
          description: 'Test Desc for Municipal Code',
          resolutionAction: 'Resolution Action for Municipal Code',
        },
      },
    ];

    configViolationTypes = [
      {
        id: 11,
        label: 'Animal',
        iconURL:
          'https://cyberdyne-dev.s3.amazonaws.com/agency_0/system_icon/animal.png',
      },
      {
        id: 12,
        label: 'General',
        iconURL:
          'https://cyberdyne-dev.s3.amazonaws.com/agency_0/system_icon/general.png',
      },
    ];
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return the searched violations', async () => {
    sandbox
      .stub(db.ConfigXerceViolation, 'findAll')
      .resolves(configViolationsObj);

    sandbox
      .stub(ConfigXerceViolationTypeService.prototype, 'getViolationTypeByIds')
      .resolves(configViolationTypes);

    const result = await new ConfigViolationService().searchViolations(
      agencyId,
      user,
      '',
      [1, 2]
    );

    expect(result).to.deep.equal(violations);
  });

  it('should throw error while searching violation', async () => {
    sandbox.stub(db.ConfigXerceViolation, 'findAll').throws('Error');

    await new ConfigViolationService()
      .searchViolations(agencyId, user, '', [111, 112])
      .catch(err => expect(err.name).to.equal('InternalServerError'));
  });
});

describe('ConfigViolationType Service: getViolationList Method', () => {
  let sandbox;
  const agencyId = 1;
  const xerceId = 1;
  let configViolationList: IConfigXerceViolationList[];

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    configViolationList = [
      {
        id: 1,
        label: 'Animal Control',
      },
      {
        id: 3,
        label: 'Osbstructing Vehicles',
      },
      {
        id: 2,
        label: 'Vehicle Control',
      },
    ];
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('Should return the list of violations sorted by label', async () => {
    sandbox
      .stub(db.ConfigXerceViolation, 'findAll')
      .resolves(configViolationList);

    const result = await new ConfigViolationService().getViolationList(
      agencyId,
      xerceId
    );

    expect(result).to.deep.equal(configViolationList);
  });

  it('Should throw internal server error', async () => {
    sandbox
      .stub(db.ConfigXerceViolation, 'findAll')
      .throws({ name: 'InternalServerError' });

    await new ConfigViolationService()
      .getViolationList(agencyId, xerceId)
      .catch(err => expect(err.name).to.equal('InternalServerError'));
  });
});
