import { expect } from 'chai';
import 'mocha';
import * as sinon from 'sinon';

import db from '../../../../api/models';
import ConfigXerceViolationTypeService from '../../../../api/service/admin/configXerceViolationType';
import ConfigDispositionService from '../../../../api/service/agencySetup/configDisposition';
import ConfigViolationService from '../../../../api/service/agencySetup/configViolation';
import XerceCaseListingService from '../../../../api/service/xerce/caseListing';
import XerceCaseService from '../../../../api/service/xerce/xerceCase';
import XerceCaseViolationService from '../../../../api/service/xerce/xerceCaseViolation';
import DBUtil from '../../../../api/utils/dbUtil';

const xerceCaseViolationService = new XerceCaseViolationService();

describe('XerceCaseViolation Service: create Method', () => {
  let sandbox;
  let transaction;
  const agencyId = 1;
  const caseId = 101;
  let caseViolationReq: ICreateCaseViolationRequest[];
  let newViolationsObj: IXerceCaseViolationAttributes[];
  let defaultDisposition;
  let configViolations;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    transaction = sinon.stub();

    caseViolationReq = [
      {
        configXerceViolationId: 111,
        entities: [
          {
            'Animal Colour': 'Black',
            'License Number': '1234',
            Age: 12,
            Breed: '',
            Note: '',
          },
          {
            'Animal Colour': 'White',
            'License Number': '',
            Age: 5,
            Breed: '',
            Note: 'Puppy',
          },
        ],
      },
      {
        configXerceViolationId: 112,
        entities: [],
      },
    ];

    defaultDisposition = {
      id: 1,
      agencyId,
      xerceId: 1,
      label: 'Duplicate',
      dispositionType: DispositionType.INVALID_DISPOSITION,
      compliantDispositionType: null,
      isDefault: true,
      sequence: 1,
      isActive: true,
      createdAt: new Date('2018-03-30T08:36:22.338Z'),
      updatedAt: new Date('2018-03-30T08:36:22.338Z'),
      deletedAt: new Date('2018-03-30T08:36:22.338Z'),
    };

    newViolationsObj = [
      {
        agencyId,
        xerceCaseId: 101,
        configViolationTypeId: 11,
        configViolationId: 111,
        configDispositionId: 1,
        complyByDate: new Date('2018-03-30T08:36:22.338Z'),
        entity: {
          'Animal Colour': 'Black',
          'License Number': '1234',
          Age: 12,
          Breed: '',
          Note: '',
        },
        originatedFrom: XerceViolationOrigin.CREATE_CASE,
        createdBy: 4,
        createdAt: new Date('2018-03-30T08:36:22.338Z'),
      },
      {
        agencyId,
        xerceCaseId: 101,
        configViolationTypeId: 11,
        configViolationId: 111,
        configDispositionId: 1,
        complyByDate: new Date('2018-03-30T08:36:22.338Z'),
        entity: {
          'Animal Colour': 'White',
          'License Number': '',
          Age: 5,
          Breed: '',
          Note: 'Puppy',
        },
        originatedFrom: XerceViolationOrigin.CREATE_CASE,
        createdBy: 4,
        createdAt: new Date('2018-03-30T08:36:22.338Z'),
      },
      {
        agencyId,
        xerceCaseId: 101,
        configViolationTypeId: 12,
        configViolationId: 112,
        configDispositionId: 1,
        complyByDate: new Date('2018-03-30T08:36:22.338Z'),
        entity: {},
        originatedFrom: XerceViolationOrigin.CREATE_CASE,
        createdBy: 4,
        createdAt: new Date('2018-03-30T08:36:22.338Z'),
      },
    ];

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
      },
    ];
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should create xerce case violations', async () => {
    sandbox
      .stub(XerceCaseViolationService.prototype, 'validateRequest')
      .withArgs(agencyId, caseViolationReq)
      .resolves(configViolations);

    sandbox
      .stub(ConfigDispositionService.prototype, 'getDefaultInvalidDisposition')
      .withArgs(agencyId)
      .resolves(defaultDisposition);

    sandbox
      .stub(db.XerceCaseViolation, 'bulkCreate')
      .withArgs(newViolationsObj, {
        transaction,
        returning: true,
      });

    await new XerceCaseViolationService()
      .create(
        agencyId,
        caseId,
        caseViolationReq,
        XerceViolationOrigin.CREATE_CASE,
        4,
        transaction
      )
      .catch(err => expect(err.name).to.equal('Error'));
  });

  it('should throw error because of no disposition type', async () => {
    sandbox
      .stub(XerceCaseViolationService.prototype, 'validateRequest')
      .withArgs(agencyId, caseViolationReq)
      .resolves(configViolations);

    defaultDisposition = null;
    sandbox
      .stub(ConfigDispositionService.prototype, 'getDefaultInvalidDisposition')
      .withArgs(agencyId)
      .resolves(defaultDisposition);

    await new XerceCaseViolationService()
      .create(
        agencyId,
        caseId,
        caseViolationReq,
        XerceViolationOrigin.CREATE_CASE,
        4,
        transaction
      )
      .catch(err => expect(err.name).to.equal('InvalidRequestError'));
  });

  it('should throw error while creating xerce case violations', async () => {
    sandbox
      .stub(XerceCaseViolationService.prototype, 'validateRequest')
      .withArgs(agencyId, caseViolationReq)
      .resolves(configViolations);

    sandbox
      .stub(ConfigDispositionService.prototype, 'getDefaultInvalidDisposition')
      .withArgs(agencyId)
      .resolves(defaultDisposition);

    sandbox
      .stub(db.XerceCaseViolation, 'bulkCreate')
      .withArgs(newViolationsObj, {
        transaction,
        returning: true,
      })
      .throws('Error');

    await new XerceCaseViolationService()
      .create(
        agencyId,
        caseId,
        caseViolationReq,
        XerceViolationOrigin.CREATE_CASE,
        4,
        transaction
      )
      .catch(err => expect(err.name).to.equal('InternalServerError'));
  });

  it('should throw unique constratint error while creating xerce case violations', async () => {
    sandbox
      .stub(XerceCaseViolationService.prototype, 'validateRequest')
      .withArgs(agencyId, caseViolationReq)
      .resolves(configViolations);

    sandbox
      .stub(ConfigDispositionService.prototype, 'getDefaultInvalidDisposition')
      .withArgs(agencyId)
      .resolves(defaultDisposition);

    sandbox
      .stub(db.XerceCaseViolation, 'bulkCreate')
      .withArgs(newViolationsObj, {
        transaction,
        returning: true,
      })
      .throws('SequelizeUniqueConstraintError');

    await new XerceCaseViolationService()
      .create(
        agencyId,
        caseId,
        caseViolationReq,
        XerceViolationOrigin.CREATE_CASE,
        4,
        transaction
      )
      .catch(err => expect(err.name).to.equal('DBConflictError'));
  });
});

describe('XerceCaseViolation Service: getAll Method', () => {
  let sandbox;
  const agencyId = 1;
  const caseId = 101;
  let xerceCaseViolationsObj;
  let caseUser: ICaseUser;
  let configViolationTypes: IConfigViolationType[];
  let xerceCaseViolations: ICaseViolation[];

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    caseUser = {
      id: 4,
      firstName: 'John',
      lastName: 'Doe',
    };

    xerceCaseViolationsObj = [
      {
        id: 1001,
        agencyId,
        xerceCaseId: caseId,
        configViolationTypeId: 11,
        configViolationId: 111,
        configDispositionId: 1,
        status: XerceViolationStatus.CLOSED_INVALID,
        complyByDate: new Date('2018-03-30T08:36:22.338Z'),
        entity: {
          'Animal Colour': 'Black',
          'License Number': '1234',
          Age: 12,
          Breed: '',
          Note: '',
        },
        originatedFrom: XerceViolationOrigin.CREATE_CASE,
        isDrafted: false,
        configViolation: {
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
            agencyId,
            xerceId: 1,
            articleNumber: '11.21.3',
            description: 'Test Desc for Municipal Code',
            resolutionAction: 'Resolution Action for Municipal Code',
          },
        },
        createdByUser: caseUser,
        updatedByUser: caseUser,
        closedByUser: caseUser,
        createdAt: new Date('2018-03-30T08:36:22.338Z'),
        updatedAt: new Date('2018-03-30T08:36:22.338Z'),
        closedAt: new Date('2018-03-30T08:36:22.338Z'),
      },
      {
        id: 1002,
        agencyId,
        xerceCaseId: caseId,
        configViolationTypeId: 11,
        configViolationId: 111,
        configDispositionId: 1,
        status: XerceViolationStatus.VERIFICATION_PENDING,
        complyByDate: new Date('2018-03-30T08:36:22.338Z'),
        entity: {
          'Animal Colour': 'White',
          'License Number': '',
          Age: 5,
          Breed: '',
          Note: 'Puppy',
        },
        originatedFrom: XerceViolationOrigin.CREATE_CASE,
        isDrafted: false,
        configViolation: {
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
            agencyId,
            xerceId: 1,
            articleNumber: '11.21.3',
            description: 'Test Desc for Municipal Code',
            resolutionAction: 'Resolution Action for Municipal Code',
          },
        },
        createdByUser: caseUser,
        updatedByUser: caseUser,
        createdAt: new Date('2018-03-30T08:36:22.338Z'),
        updatedAt: new Date('2018-03-30T08:36:22.338Z'),
        closedAt: null,
      },
      {
        id: 1003,
        agencyId,
        xerceCaseId: caseId,
        configViolationTypeId: 12,
        configViolationId: 112,
        configDispositionId: 1,
        status: XerceViolationStatus.VERIFICATION_PENDING,
        complyByDate: new Date('2018-03-30T08:36:22.338Z'),
        entity: null,
        configViolation: {
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
            agencyId,
            xerceId: 1,
            articleNumber: '11.21.3',
            description: 'Test Desc for Municipal Code',
            resolutionAction: 'Resolution Action for Municipal Code',
          },
        },
        originatedFrom: XerceViolationOrigin.CREATE_CASE,
        isDrafted: false,
        createdByUser: caseUser,
        updatedByUser: caseUser,
        createdAt: new Date('2018-03-30T08:36:22.338Z'),
        updatedAt: new Date('2018-03-30T08:36:22.338Z'),
        closedAt: null,
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

    xerceCaseViolations = [
      {
        id: 1001,
        configDispositionId: 1,
        status: XerceViolationStatus.CLOSED_INVALID,
        complyByDate: new Date('2018-03-30T08:36:22.338Z'),
        configViolation: {
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
        entity: {
          'Animal Colour': 'Black',
          'License Number': '1234',
          Age: 12,
          Breed: '',
          Note: '',
        },
        createdAt: new Date('2018-03-30T08:36:22.338Z'),
        updatedAt: new Date('2018-03-30T08:36:22.338Z'),
        closedAt: new Date('2018-03-30T08:36:22.338Z'),
        createdBy: caseUser,
        updatedBy: caseUser,
        closedBy: caseUser,
      },
      {
        id: 1002,
        configDispositionId: 1,
        status: XerceViolationStatus.VERIFICATION_PENDING,
        complyByDate: new Date('2018-03-30T08:36:22.338Z'),
        configViolation: {
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
        entity: {
          'Animal Colour': 'White',
          'License Number': '',
          Age: 5,
          Breed: '',
          Note: 'Puppy',
        },
        createdAt: new Date('2018-03-30T08:36:22.338Z'),
        updatedAt: new Date('2018-03-30T08:36:22.338Z'),
        closedAt: null,
        createdBy: caseUser,
        updatedBy: caseUser,
        closedBy: null,
      },
      {
        id: 1003,
        configDispositionId: 1,
        status: XerceViolationStatus.VERIFICATION_PENDING,
        complyByDate: new Date('2018-03-30T08:36:22.338Z'),
        configViolation: {
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
        entity: null,
        createdAt: new Date('2018-03-30T08:36:22.338Z'),
        updatedAt: new Date('2018-03-30T08:36:22.338Z'),
        closedAt: null,
        createdBy: caseUser,
        updatedBy: caseUser,
        closedBy: null,
      },
    ];
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should get all the xerce case violations', async () => {
    sandbox
      .stub(db.XerceCaseViolation, 'findAll')
      .resolves(xerceCaseViolationsObj);

    sandbox
      .stub(ConfigXerceViolationTypeService.prototype, 'getViolationTypeByIds')
      .resolves(configViolationTypes);

    const result = await new XerceCaseViolationService().getAll(
      agencyId,
      caseId
    );

    expect(result).to.deep.equal(xerceCaseViolations);
  });

  it('should throw error while getting the case violations', async () => {
    sandbox.stub(db.XerceCaseViolation, 'findAll').throws('Error');

    await new XerceCaseViolationService()
      .getAll(agencyId, caseId)
      .catch(err => expect(err.name).to.equal('InternalServerError'));
  });
});

describe('XerceCaseViolation Service: getAllInstance Method', () => {
  let sandbox;
  const agencyId = 1;
  const caseId = 101;
  let xerceCaseViolationsObj;
  let caseUser: ICaseUser;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    caseUser = {
      id: 4,
      firstName: 'John',
      lastName: 'Doe',
    };

    xerceCaseViolationsObj = [
      {
        id: 1001,
        agencyId,
        xerceCaseId: caseId,
        configViolationTypeId: 11,
        configViolationId: 111,
        configDispositionId: 1,
        status: XerceViolationStatus.VERIFICATION_PENDING,
        complyByDate: new Date('2018-03-30T08:36:22.338Z'),
        entity: {
          'Animal Colour': 'Black',
          'License Number': '1234',
          Age: 12,
          Breed: '',
          Note: '',
        },
        originatedFrom: XerceViolationOrigin.CREATE_CASE,
        isDrafted: false,
        configViolation: {
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
          },
          municipalCode: {
            id: 1,
            agencyId,
            xerceId: 1,
            articleNumber: '11.21.3',
            description: 'Test Desc for Municipal Code',
            resolutionAction: 'Resolution Action for Municipal Code',
          },
        },
        createdByUser: caseUser,
        updatedByUser: caseUser,
        createdAt: new Date('2018-03-30T08:36:22.338Z'),
        updatedAt: new Date('2018-03-30T08:36:22.338Z'),
        closedAt: null,
      },
      {
        id: 1002,
        agencyId,
        xerceCaseId: caseId,
        configViolationTypeId: 11,
        configViolationId: 111,
        configDispositionId: 1,
        status: XerceViolationStatus.VERIFICATION_PENDING,
        complyByDate: new Date('2018-03-30T08:36:22.338Z'),
        entity: {
          'Animal Colour': 'White',
          'License Number': '',
          Age: 5,
          Breed: '',
          Note: 'Puppy',
        },
        originatedFrom: XerceViolationOrigin.CREATE_CASE,
        isDrafted: false,
        configViolation: {
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
          },
          municipalCode: {
            id: 1,
            agencyId,
            xerceId: 1,
            articleNumber: '11.21.3',
            description: 'Test Desc for Municipal Code',
            resolutionAction: 'Resolution Action for Municipal Code',
          },
        },
        createdByUser: caseUser,
        updatedByUser: caseUser,
        createdAt: new Date('2018-03-30T08:36:22.338Z'),
        updatedAt: new Date('2018-03-30T08:36:22.338Z'),
        closedAt: null,
      },
      {
        id: 1003,
        agencyId,
        xerceCaseId: caseId,
        configViolationTypeId: 12,
        configViolationId: 112,
        configDispositionId: 1,
        status: XerceViolationStatus.VERIFICATION_PENDING,
        complyByDate: new Date('2018-03-30T08:36:22.338Z'),
        entity: null,
        configViolation: {
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
          },
          municipalCode: {
            id: 1,
            agencyId,
            xerceId: 1,
            articleNumber: '11.21.3',
            description: 'Test Desc for Municipal Code',
            resolutionAction: 'Resolution Action for Municipal Code',
          },
        },
        originatedFrom: XerceViolationOrigin.CREATE_CASE,
        isDrafted: false,
        createdByUser: caseUser,
        updatedByUser: caseUser,
        createdAt: new Date('2018-03-30T08:36:22.338Z'),
        updatedAt: new Date('2018-03-30T08:36:22.338Z'),
        closedAt: null,
      },
    ];
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should get all instance of xerce case violations', async () => {
    sandbox
      .stub(db.XerceCaseViolation, 'findAll')
      .resolves(xerceCaseViolationsObj);

    const result = await new XerceCaseViolationService().getAllInstance(
      agencyId,
      caseId
    );

    expect(result).to.deep.equal(xerceCaseViolationsObj);
  });

  it('should throw error while getting the case violations', async () => {
    sandbox.stub(db.XerceCaseViolation, 'findAll').throws('Error');

    await new XerceCaseViolationService()
      .getAllInstance(agencyId, caseId)
      .catch(err => expect(err.name).to.equal('InternalServerError'));
  });
});

describe('XerceCaseViolation Service: editEntity Method', () => {
  let sandbox;
  const agencyId = 1;
  const caseId = 101;
  let xerceCaseViolationObj;
  let caseUser: ICaseUser;
  let xerceCaseViolations: ICaseViolation[];
  let caseViolationEditReq: IEditCaseViolationEntityRequest;
  let transaction;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    transaction = sinon.stub();

    caseViolationEditReq = {
      entity: {
        'Animal Colour': 'Red',
        'License Number': '1234',
        Age: 15,
        Breed: '',
        Note: '',
      },
    };

    caseUser = {
      id: 4,
      firstName: 'John',
      lastName: 'Doe',
    };

    xerceCaseViolationObj = {
      id: 1001,
      agencyId,
      xerceCaseId: caseId,
      configViolationTypeId: 11,
      configViolationId: 111,
      configDispositionId: 1,
      status: XerceViolationStatus.VERIFICATION_PENDING,
      complyByDate: new Date('2018-03-30T08:36:22.338Z'),
      entity: {
        'Animal Colour': 'Black',
        'License Number': '1234',
        Age: 12,
        Breed: '',
        Note: '',
      },
      originatedFrom: XerceViolationOrigin.CREATE_CASE,
      isDrafted: false,
      configViolation: {
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
        },
        municipalCode: {
          id: 1,
          agencyId,
          xerceId: 1,
          articleNumber: '11.21.3',
          description: 'Test Desc for Municipal Code',
          resolutionAction: 'Resolution Action for Municipal Code',
        },
      },
      createdByUser: caseUser,
      updatedByUser: caseUser,
      createdAt: new Date('2018-03-30T08:36:22.338Z'),
      updatedAt: new Date('2018-03-30T08:36:22.338Z'),
      closedAt: null,
      // tslint:disable-next-line:no-empty
      save: () => {},
    };

    xerceCaseViolations = [
      {
        id: 1001,
        configDispositionId: 1,
        status: XerceViolationStatus.VERIFICATION_PENDING,
        complyByDate: new Date('2018-03-30T08:36:22.338Z'),
        configViolation: {
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
        entity: {
          'Animal Colour': 'Red',
          'License Number': '1234',
          Age: 15,
          Breed: '',
          Note: '',
        },
        createdAt: new Date('2018-03-30T08:36:22.338Z'),
        updatedAt: new Date('2018-03-30T08:36:22.338Z'),
        closedAt: null,
        createdBy: caseUser,
        updatedBy: caseUser,
        closedBy: null,
      },
      {
        id: 1002,
        configDispositionId: 1,
        status: XerceViolationStatus.VERIFICATION_PENDING,
        complyByDate: new Date('2018-03-30T08:36:22.338Z'),
        configViolation: {
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
        entity: {
          'Animal Colour': 'White',
          'License Number': '',
          Age: 5,
          Breed: '',
          Note: 'Puppy',
        },
        createdAt: new Date('2018-03-30T08:36:22.338Z'),
        updatedAt: new Date('2018-03-30T08:36:22.338Z'),
        closedAt: null,
        createdBy: caseUser,
        updatedBy: caseUser,
        closedBy: null,
      },
      {
        id: 1003,
        configDispositionId: 1,
        status: XerceViolationStatus.VERIFICATION_PENDING,
        complyByDate: new Date('2018-03-30T08:36:22.338Z'),
        configViolation: {
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
        entity: null,
        createdAt: new Date('2018-03-30T08:36:22.338Z'),
        updatedAt: new Date('2018-03-30T08:36:22.338Z'),
        closedAt: null,
        createdBy: caseUser,
        updatedBy: caseUser,
        closedBy: null,
      },
    ];
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should edit the case violation entity', async () => {
    sandbox.stub(DBUtil, 'createTransaction').resolves(transaction);

    sandbox
      .stub(db.XerceCaseViolation, 'findOne')
      .resolves(xerceCaseViolationObj);

    sandbox.stub(XerceCaseViolationService.prototype, 'validateRequest');

    sandbox
      .stub(XerceCaseService.prototype, 'setUpdatedAt')
      .withArgs(agencyId, caseId, transaction);

    sandbox.stub(XerceCaseListingService.prototype, 'refreshCaseListing');

    sandbox.stub(DBUtil, 'commitTransaction').withArgs(transaction);

    sandbox
      .stub(XerceCaseViolationService.prototype, 'getAll')
      .resolves(xerceCaseViolations);

    const result = await new XerceCaseViolationService().editEntity(
      agencyId,
      caseId,
      1001,
      caseViolationEditReq
    );

    expect(result).to.deep.equal(xerceCaseViolations);
  });

  it('should throw error while updating entity', async () => {
    sandbox.stub(db.XerceCaseViolation, 'findOne').throws('Error');

    await new XerceCaseViolationService()
      .editEntity(agencyId, caseId, 1001, caseViolationEditReq)
      .catch(err => expect(err.name).to.deep.equal('InternalServerError'));
  });

  it('should throw unique constratint error while updating entity', async () => {
    sandbox.stub(db.XerceCaseViolation, 'findOne').throws('DBConflictError');

    await new XerceCaseViolationService()
      .editEntity(agencyId, caseId, 1001, caseViolationEditReq)
      .catch(err => expect(err.name).to.deep.equal('InternalServerError'));
  });

  it('should throw error because of invalid case violation id', async () => {
    xerceCaseViolationObj = null;
    sandbox.stub(DBUtil, 'createTransaction').resolves(transaction);

    sandbox
      .stub(db.XerceCaseViolation, 'findOne')
      .resolves(xerceCaseViolationObj);

    sandbox.stub(XerceCaseViolationService.prototype, 'validateRequest');

    sandbox
      .stub(XerceCaseService.prototype, 'setUpdatedAt')
      .withArgs(agencyId, caseId, transaction);

    sandbox.stub(XerceCaseListingService.prototype, 'refreshCaseListing');

    sandbox.stub(DBUtil, 'commitTransaction').withArgs(transaction);

    await new XerceCaseViolationService()
      .editEntity(agencyId, caseId, 1001, caseViolationEditReq)
      .catch(err => expect(err.name).to.deep.equal('InvalidRequestError'));
  });
});

describe('XerceCaseViolation Service: getFrequentViolations Method', () => {
  let sandbox;
  const agencyId = 1;
  let user: IAgencyUserClaim | ISuperAdminClaim;
  let frequentViolationsObj;
  let configViolationTypes: IConfigViolationType[];
  let frequentViolations: IConfigViolation[];

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

    frequentViolationsObj = [
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
          agencyId,
          xerceId: 1,
          articleNumber: '11.21.3',
          description: 'Test Desc for Municipal Code',
          resolutionAction: 'Resolution Action for Municipal Code',
        },
      },
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
          agencyId,
          xerceId: 1,
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
          agencyId,
          xerceId: 1,
          articleNumber: '11.21.3',
          description: 'Test Desc for Municipal Code',
          resolutionAction: 'Resolution Action for Municipal Code',
        },
      },
    ];

    frequentViolations = [
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

  it('should get frequent violations', async () => {
    sandbox
      .stub(db.ConfigXerceViolation, 'findAll')
      .resolves(frequentViolationsObj);

    sandbox
      .stub(ConfigXerceViolationTypeService.prototype, 'getViolationTypeByIds')
      .resolves(configViolationTypes);

    const result = await new XerceCaseViolationService().getFrequentViolations(
      agencyId,
      user
    );

    expect(result).to.deep.equal(frequentViolations);
  });

  it('should throw error while fetching frequent violations', async () => {
    sandbox.stub(db.ConfigXerceViolation, 'findAll').throws('Error');

    await new XerceCaseViolationService()
      .getFrequentViolations(agencyId, user)
      .catch(err => expect(err.name).to.be.equal('InternalServerError'));
  });

  it('should return no frequent violations', async () => {
    frequentViolationsObj = [];
    frequentViolations = [];
    sandbox
      .stub(db.ConfigXerceViolation, 'findAll')
      .resolves(frequentViolationsObj);

    const result = await new XerceCaseViolationService().getFrequentViolations(
      agencyId,
      user
    );

    expect(result).to.deep.equal(frequentViolations);
  });
});

describe('XerceCaseViolation Service: validateRequest Method', () => {
  let sandbox;
  const agencyId = 1;
  let caseViolationReq: ICreateCaseViolationRequest[];
  let configViolations;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    caseViolationReq = [
      {
        configXerceViolationId: 111,
        entities: [
          {
            '61': 'Black',
            '62': '1234',
            '63': 12,
            '64': '',
            Note: '',
          },
          {
            '61': 'White',
            '62': '',
            '63': 5,
            '64': '',
            Note: 'Puppy',
          },
        ],
      },
      {
        configXerceViolationId: 112,
        entities: [],
      },
    ];

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
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should validate the create case violation request', async () => {
    sandbox
      .stub(ConfigViolationService.prototype, 'getByIds')
      .resolves(configViolations);

    const result = await (new XerceCaseViolationService() as any).__proto__.validateRequest(
      agencyId,
      caseViolationReq
    );

    expect(result).to.deep.equal(configViolations);
  });

  it('should throw error for duplicate violation ids', async () => {
    caseViolationReq = [
      {
        configXerceViolationId: 111,
        entities: [
          {
            '61': 'Black',
            '62': '1234',
            '63': 12,
            '64': '',
            Note: '',
          },
        ],
      },
      {
        configXerceViolationId: 111,
        entities: [
          {
            '61': 'White',
            '62': '',
            '63': 5,
            '64': '',
            Note: 'Puppy',
          },
        ],
      },
      {
        configXerceViolationId: 112,
        entities: [],
      },
    ];

    await (new XerceCaseViolationService() as any).__proto__
      .validateRequest(agencyId, caseViolationReq)
      .catch(err => expect(err.name).to.be.equal('InvalidRequestError'));
  });

  it('should throw error for invalid violation ids', async () => {
    caseViolationReq = [
      {
        configXerceViolationId: 111,
        entities: [
          {
            '61': 'Black',
            '62': '1234',
            '63': 12,
            '64': '',
            Note: '',
          },
        ],
      },
      {
        configXerceViolationId: 113,
        entities: [
          {
            '61': 'White',
            '62': '',
            '63': 5,
            '64': '',
            Note: 'Puppy',
          },
        ],
      },
      {
        configXerceViolationId: 112,
        entities: [],
      },
    ];
    sandbox
      .stub(ConfigViolationService.prototype, 'getByIds')
      .resolves(configViolations);

    await (new XerceCaseViolationService() as any).__proto__
      .validateRequest(agencyId, caseViolationReq)
      .catch(err => expect(err.name).to.be.equal('InvalidRequestError'));
  });

  it('should throw error for invalid entity key', async () => {
    caseViolationReq = [
      {
        configXerceViolationId: 111,
        entities: [
          {
            '67': 'Black',
            '62': '1234',
            '63': 12,
            '64': '',
            Note: '',
          },
          {
            '61': 'White',
            '62': '',
            '68': 5,
            '64': '',
            Note: 'Puppy',
          },
        ],
      },
      {
        configXerceViolationId: 112,
        entities: [],
      },
    ];
    sandbox
      .stub(ConfigViolationService.prototype, 'getByIds')
      .resolves(configViolations);

    await (new XerceCaseViolationService() as any).__proto__
      .validateRequest(agencyId, caseViolationReq)
      .catch(err => expect(err.name).to.be.equal('InvalidRequestError'));
  });

  it('should throw error for missing entity key', async () => {
    caseViolationReq = [
      {
        configXerceViolationId: 111,
        entities: [
          {
            '61': 'Black',
            '62': '1234',
            '63': '',
            Note: '',
          },
          {
            '61': '',
            '62': 5,
            '64': '',
            Note: 'Puppy',
          },
        ],
      },
      {
        configXerceViolationId: 112,
        entities: [],
      },
    ];
    sandbox
      .stub(ConfigViolationService.prototype, 'getByIds')
      .resolves(configViolations);

    await (new XerceCaseViolationService() as any).__proto__
      .validateRequest(agencyId, caseViolationReq)
      .catch(err => expect(err.name).to.be.equal('InvalidRequestError'));
  });

  it('should throw error for absent note key', async () => {
    caseViolationReq = [
      {
        configXerceViolationId: 111,
        entities: [
          {
            '61': 'Black',
            '62': '1234',
            '63': 12,
            '64': '',
          },
          {
            '61': 'White',
            '62': '',
            '63': 5,
            '64': '',
          },
        ],
      },
      {
        configXerceViolationId: 112,
        entities: [],
      },
    ];

    sandbox
      .stub(ConfigViolationService.prototype, 'getByIds')
      .resolves(configViolations);

    await (new XerceCaseViolationService() as any).__proto__
      .validateRequest(agencyId, caseViolationReq)
      .catch(err => expect(err.name).to.be.equal('InvalidRequestError'));
  });

  it('should throw error for absent entities', async () => {
    caseViolationReq = [
      {
        configXerceViolationId: 111,
        entities: [],
      },
      {
        configXerceViolationId: 112,
        entities: [],
      },
    ];

    sandbox
      .stub(ConfigViolationService.prototype, 'getByIds')
      .resolves(configViolations);

    await (new XerceCaseViolationService() as any).__proto__
      .validateRequest(agencyId, caseViolationReq)
      .catch(err => expect(err.name).to.be.equal('InvalidRequestError'));
  });

  it('should throw error for no value present', async () => {
    caseViolationReq = [
      {
        configXerceViolationId: 111,
        entities: [
          {
            '61': '',
            '62': '',
            '63': null,
            '64': '',
          },
          {
            '61': '',
            '62': '',
            '63': null,
            '64': '',
          },
        ],
      },
      {
        configXerceViolationId: 112,
        entities: [],
      },
    ];

    sandbox
      .stub(ConfigViolationService.prototype, 'getByIds')
      .resolves(configViolations);

    await (new XerceCaseViolationService() as any).__proto__
      .validateRequest(agencyId, caseViolationReq)
      .catch(err => expect(err.name).to.be.equal('InvalidRequestError'));
  });

  it('should throw error for entity present where its not required', async () => {
    caseViolationReq = [
      {
        configXerceViolationId: 111,
        entities: [
          {
            '61': '',
            '62': '',
            '63': null,
            '64': '',
          },
          {
            '61': '',
            '62': '',
            '63': null,
            '64': '',
          },
        ],
      },
      {
        configXerceViolationId: 112,
        entities: [
          {
            '61': '',
            '62': '',
            '63': null,
            '64': '',
          },
        ],
      },
    ];

    sandbox
      .stub(ConfigViolationService.prototype, 'getByIds')
      .resolves(configViolations);

    await (new XerceCaseViolationService() as any).__proto__
      .validateRequest(agencyId, caseViolationReq)
      .catch(err => expect(err.name).to.be.equal('InvalidRequestError'));
  });
});

describe('XerceCaseViolation Service: update method', () => {
  let sandbox;
  let transaction;
  let xerceCaseInspectionViolations;
  let xerceCaseViolations;
  let updatedXerceCaseViolations;
  let performInspectionReq: IPerformInspectionRequest;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    transaction = sinon.stub();

    performInspectionReq = {
      existingViolations: [
        {
          caseViolationId: 1,
          status: XerceViolationStatus.OPEN,
          configDispositionId: 1,
          complyByDate: new Date('2019-03-05T16:23:14.912Z'),
          entity: {
            'Animal Colour': 'Red',
            'License Number': '2345',
            Age: 1,
            Breed: 'breedA',
            Note: 'This animal is a pet cat',
          },
        },
      ],
      noteContent: null,
    };

    xerceCaseInspectionViolations = [
      {
        id: 2,
        agencyId: 1,
        xerceCaseId: 8,
        inspectionId: 1,
        configViolationId: 1,
        caseViolationId: 1,
        status: 'OPEN',
        configDispositionId: 7,
        complyByDate: null,
        entity: {
          'Animal Colour': 'Brown',
          'License Number': '2345',
          Age: 2,
          Breed: 'breedC',
          Note: 'This animal is a pet dog',
        },
        closeDate: null,
        createdAt: '2019-03-05T19:16:44.550Z',
        updatedAt: '2019-03-05T19:16:44.550Z',
      },
    ];

    xerceCaseViolations = [
      {
        id: 1,
        agencyId: 1,
        xerceCaseId: 8,
        configViolationTypeId: 1,
        configDispositionId: 7,
        configViolationId: 1,
        status: 'VERIFICATION_PENDING',
        entity: {
          'Animal Colour': 'Red',
          'License Number': '2345',
          Age: 1,
          Breed: 'breedA',
          Note: 'This animal is a pet cat',
        },
        originatedFrom: 'CREATE_CASE',
        complyByDate: null,
        createdBy: 1,
        updatedBy: 1,
        closedBy: null,
        closedAt: null,
        createdAt: '2019-03-05T16:23:15.143Z',
        updatedAt: '2019-03-05T17:56:07.678Z',
        deletedAt: null,
      },
    ];

    updatedXerceCaseViolations = [
      {
        id: 1,
        agencyId: 1,
        xerceCaseId: 8,
        configViolationTypeId: 1,
        configDispositionId: 7,
        configViolationId: 1,
        status: 'OPEN',
        entity: {
          'Animal Colour': 'Brown',
          'License Number': '2345',
          Age: 2,
          Breed: 'breedC',
          Note: 'This animal is a pet dog',
        },
        originatedFrom: 'CREATE_CASE',
        complyByDate: null,
        createdBy: 1,
        updatedBy: 1,
        closedBy: null,
        closedAt: null,
        createdAt: '2019-03-05T16:23:15.143Z',
        updatedAt: '2019-03-05T17:56:07.678Z',
        deletedAt: null,
        save: () => Promise.resolve(),
      },
    ];
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should copy inspectionViolations to CaseViolations with success', async () => {
    sandbox
      .stub(XerceCaseViolationService.prototype, 'updateObj')
      .withArgs(xerceCaseViolations, xerceCaseInspectionViolations)
      .returns(updatedXerceCaseViolations);

    await xerceCaseViolationService
      .update(
        xerceCaseViolations,
        xerceCaseInspectionViolations,
        performInspectionReq,
        transaction
      )
      .catch(err => expect(err.name).to.equal('Error'));
  });

  it('Should throw an Internal Server Error', async () => {
    const errorMsg = 'Error while updating the case violations';

    sandbox
      .stub(XerceCaseViolationService.prototype, 'updateObj')
      .withArgs(xerceCaseViolations, xerceCaseInspectionViolations)
      .returns(updatedXerceCaseViolations);

    sandbox.stub(Promise, 'all').throws({ name: 'InternalServerError' });

    await xerceCaseViolationService
      .update(
        xerceCaseViolations,
        xerceCaseInspectionViolations,
        performInspectionReq,
        transaction
      )
      .catch(err => {
        expect(err.name).to.deep.equal('InternalServerError');
        expect(err.message).to.deep.equal(errorMsg);
      });
  });
});

describe('XerceCaseViolation Service: updateObj method', () => {
  let sandbox;
  let transaction;
  let xerceCaseInspectionViolations;
  let xerceCaseViolations;
  let performInspectionReq: IPerformInspectionRequest;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    transaction = sinon.stub();

    performInspectionReq = {
      existingViolations: [
        {
          caseViolationId: 1,
          status: XerceViolationStatus.OPEN,
          configDispositionId: 1,
          complyByDate: new Date('2019-03-05T16:23:14.912Z'),
          entity: {
            'Animal Colour': 'Red',
            'License Number': '2345',
            Age: 1,
            Breed: 'breedA',
            Note: 'This animal is a pet cat',
          },
        },
      ],
      noteContent: null,
    };

    xerceCaseInspectionViolations = [
      {
        id: 2,
        agencyId: 1,
        xerceCaseId: 8,
        inspectionId: 1,
        configViolationId: 1,
        caseViolationId: 1,
        status: 'OPEN',
        configDispositionId: 7,
        complyByDate: null,
        entity: {
          'Animal Colour': 'Brown',
          'License Number': '2345',
          Age: 2,
          Breed: 'breedC',
          Note: 'This animal is a pet dog',
        },
        closeDate: null,
        createdAt: '2019-03-05T19:16:44.550Z',
        updatedAt: '2019-03-05T19:16:44.550Z',
      },
    ];

    xerceCaseViolations = [
      {
        id: 1,
        agencyId: 1,
        xerceCaseId: 8,
        configViolationTypeId: 1,
        configDispositionId: 7,
        configViolationId: 1,
        status: 'VERIFICATION_PENDING',
        entity: {
          'Animal Colour': 'Red',
          'License Number': '2345',
          Age: 1,
          Breed: 'breedA',
          Note: 'This animal is a pet cat',
        },
        originatedFrom: 'CREATE_CASE',
        complyByDate: null,
        createdBy: 1,
        updatedBy: 1,
        closedBy: null,
        closedAt: null,
        createdAt: '2019-03-05T16:23:15.143Z',
        updatedAt: '2019-03-05T17:56:07.678Z',
        deletedAt: null,
      },
    ];
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should create updated object', async () => {
    (xerceCaseViolationService as any).updateObj(
      xerceCaseViolations,
      xerceCaseInspectionViolations,
      performInspectionReq,
      transaction
    );
  });
});

describe('XerceCaseViolation Service: updateViolationStatus Method', () => {
  let sandbox;
  const agencyId = 1;
  const caseId = 101;
  let xerceCaseViolationsObj;
  let caseUser: ICaseUser;
  let transaction;
  let reopenCaseRequest: IReopenCaseRequest;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    transaction = sinon.stub();

    caseUser = {
      id: 4,
      firstName: 'John',
      lastName: 'Doe',
    };

    reopenCaseRequest = {
      inspection: {
        plannedDate: new Date('2019-02-16T06:29:32.814Z'),
        assigneeId: 1,
      },
      openViolationIds: [1001],
    };

    xerceCaseViolationsObj = [
      {
        id: 1001,
        agencyId,
        xerceCaseId: caseId,
        configViolationTypeId: 11,
        configViolationId: 111,
        configDispositionId: 1,
        status: XerceViolationStatus.VERIFICATION_PENDING,
        complyByDate: new Date('2018-03-30T08:36:22.338Z'),
        entity: {
          'Animal Colour': 'Black',
          'License Number': '1234',
          Age: 12,
          Breed: '',
          Note: '',
        },
        originatedFrom: XerceViolationOrigin.CREATE_CASE,
        isDrafted: false,
        configViolation: {
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
          },
          municipalCode: {
            id: 1,
            agencyId,
            xerceId: 1,
            articleNumber: '11.21.3',
            description: 'Test Desc for Municipal Code',
            resolutionAction: 'Resolution Action for Municipal Code',
          },
        },
        createdByUser: caseUser,
        updatedByUser: caseUser,
        createdAt: new Date('2018-03-30T08:36:22.338Z'),
        updatedAt: new Date('2018-03-30T08:36:22.338Z'),
        closedAt: null,
        closedBy: null,
        // tslint:disable-next-line:no-empty
        save: () => Promise.resolve(),
      },
    ];
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should update the violation status successfully', async () => {
    await new XerceCaseViolationService()
      .updateViolationStatus(
        reopenCaseRequest,
        xerceCaseViolationsObj,
        transaction
      )
      .catch(err => expect(err.name).to.equal('Error'));
  });

  it('should throw error while updating violation status', async () => {
    xerceCaseViolationsObj = [
      {
        id: 1001,
        agencyId,
        xerceCaseId: caseId,
        configViolationTypeId: 11,
        configViolationId: 111,
        configDispositionId: 1,
        status: XerceViolationStatus.VERIFICATION_PENDING,
        complyByDate: new Date('2018-03-30T08:36:22.338Z'),
        entity: {
          'Animal Colour': 'Black',
          'License Number': '1234',
          Age: 12,
          Breed: '',
          Note: '',
        },
        originatedFrom: XerceViolationOrigin.CREATE_CASE,
        isDrafted: false,
        configViolation: {
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
          },
          municipalCode: {
            id: 1,
            agencyId,
            xerceId: 1,
            articleNumber: '11.21.3',
            description: 'Test Desc for Municipal Code',
            resolutionAction: 'Resolution Action for Municipal Code',
          },
        },
        createdByUser: caseUser,
        updatedByUser: caseUser,
        createdAt: new Date('2018-03-30T08:36:22.338Z'),
        updatedAt: new Date('2018-03-30T08:36:22.338Z'),
        closedAt: null,
        closedBy: null,
        save: () => Promise.reject(),
      },
    ];

    await new XerceCaseViolationService()
      .updateViolationStatus(
        reopenCaseRequest,
        xerceCaseViolationsObj,
        transaction
      )
      .catch(err => expect(err.name).to.equal('InternalServerError'));
  });
});

describe('XerceCaseViolation Service: editEntity Method', () => {
  let sandbox;
  const agencyId = 1;
  const caseId = 101;
  const dispositionId = 11;
  const userProfile: IAgencyUserClaim = {
    agencyName: 'City of Alabama',
    id: 11,
    agencyId,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@gmail.com',
    scopes: {
      siteAdmin: true,
    },
    agencyTimezone: 'PST',
  };
  const xerceCaseViolationObj = {
    id: 1001,
    agencyId,
    xerceCaseId: caseId,
    configViolationTypeId: 11,
    configViolationId: 111,
    configDispositionId: 1,
    status: XerceViolationStatus.CLOSED_MET_COMPLIANCE,
    complyByDate: new Date('2018-03-30T08:36:22.338Z'),
    entity: {
      'Animal Colour': 'Black',
      'License Number': '1234',
      Age: 12,
      Breed: '',
      Note: '',
    },
    originatedFrom: XerceViolationOrigin.CREATE_CASE,
    isDrafted: false,
    configViolation: {
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
      },
      municipalCode: {
        id: 1,
        agencyId,
        xerceId: 1,
        articleNumber: '11.21.3',
        description: 'Test Desc for Municipal Code',
        resolutionAction: 'Resolution Action for Municipal Code',
      },
    },
    createdByUser: {
      id: 4,
      firstName: 'John',
      lastName: 'Doe',
    },
    updatedByUser: {
      id: 4,
      firstName: 'John',
      lastName: 'Doe',
    },
    createdAt: new Date('2018-03-30T08:36:22.338Z'),
    updatedAt: new Date('2018-03-30T08:36:22.338Z'),
    closedAt: null,
    // tslint:disable-next-line:no-empty
    save: () => {},
  };
  //let caseViolationEditReq: IEditCaseViolationEntityRequest;
  let transaction;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    transaction = sinon.stub();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should throw error when violation doesnot exist on case', async () => {
    sandbox
      .stub(db.XerceCaseViolation, 'findOne')
      .withArgs({
        where: {
          id: xerceCaseViolationObj.id,
          agencyId,
          xerceCaseId: caseId,
        },
      })
      .resolves(null);

    await xerceCaseViolationService
      .updateClosedViolationDisposition(
        agencyId,
        caseId,
        xerceCaseViolationObj.id,
        userProfile,
        dispositionId
      )
      .catch(err => {
        expect(err.name).to.deep.equal('InvalidRequestError');
        expect(err.message).to.deep.equal(
          'Case violation does not exist for this case'
        );
      });
  });

  it('should throw error when violation doesnot exist on case', async () => {
    sandbox
      .stub(db.XerceCaseViolation, 'findOne')
      .withArgs({
        where: {
          id: xerceCaseViolationObj.id,
          agencyId,
          xerceCaseId: caseId,
        },
      })
      .resolves({
        ...xerceCaseViolationObj,
        status: XerceViolationStatus.VERIFICATION_PENDING,
      });

    await xerceCaseViolationService
      .updateClosedViolationDisposition(
        agencyId,
        caseId,
        xerceCaseViolationObj.id,
        userProfile,
        dispositionId
      )
      .catch(err => {
        expect(err.name).to.deep.equal('InvalidRequestError');
        expect(err.message).to.deep.equal('Case Violation not closed');
      });
  });

  it('should update disposition of closed violation', async () => {
    sandbox
      .stub(db.XerceCaseViolation, 'findOne')
      .withArgs({
        where: {
          id: xerceCaseViolationObj.id,
          agencyId,
          xerceCaseId: caseId,
        },
      })
      .resolves(xerceCaseViolationObj);

    sandbox.stub(DBUtil, 'createTransaction').resolves(transaction);

    sandbox.stub(xerceCaseViolationObj, 'save');

    sandbox
      .stub(XerceCaseService.prototype, 'setUpdatedAt')
      .withArgs(agencyId, caseId, transaction);

    sandbox.stub(DBUtil, 'commitTransaction').withArgs(transaction);

    sandbox.stub(XerceCaseListingService.prototype, 'refreshCaseListing');

    sandbox.stub(XerceCaseViolationService.prototype, 'getAll').resolves([]);

    await xerceCaseViolationService.updateClosedViolationDisposition(
      agencyId,
      caseId,
      xerceCaseViolationObj.id,
      userProfile,
      dispositionId
    );
  });

  it('should throw error if db error occurs', async () => {
    sandbox
      .stub(db.XerceCaseViolation, 'findOne')
      .withArgs({
        where: {
          id: xerceCaseViolationObj.id,
          agencyId,
          xerceCaseId: caseId,
        },
      })
      .resolves(xerceCaseViolationObj);

    sandbox.stub(DBUtil, 'createTransaction').resolves(transaction);

    sandbox.stub(xerceCaseViolationObj, 'save');

    sandbox
      .stub(XerceCaseService.prototype, 'setUpdatedAt')
      .withArgs(agencyId, caseId, transaction)
      .throws('Error');

    sandbox.stub(DBUtil, 'rollbackTransaction').withArgs(transaction);

    await xerceCaseViolationService
      .updateClosedViolationDisposition(
        agencyId,
        caseId,
        xerceCaseViolationObj.id,
        userProfile,
        dispositionId
      )
      .catch(err => {
        expect(err.name).to.deep.equal('InternalServerError');
      });
  });
});
