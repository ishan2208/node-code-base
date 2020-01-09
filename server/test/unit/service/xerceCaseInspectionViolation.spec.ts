import 'mocha';

import { expect } from 'chai';
import * as sinon from 'sinon';
import db from '../../../api/models';
import XerceCaseInspectionViolationService from '../../../api/service/xerce/xerceCaseInspectionViolation';
import XerceCaseViolationService from '../../../api/service/xerce/xerceCaseViolation';

const xerceCaseInspectionViolationService = new XerceCaseInspectionViolationService();

describe('XerceCaseInspectionViolation Service: upsertAndDelete method', () => {
  let sandbox;
  let inspectionViolations;
  let performInspectionReq: IPerformInspectionRequest;
  let xerceCaseViolations;
  let transaction;
  let caseUser;
  const agencyId = 1;
  const caseId = 1;
  const staffId = 1;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    transaction = sinon.stub();

    caseUser = {
      id: 4,
      firstName: 'John',
      lastName: 'Doe',
    };

    xerceCaseViolations = [
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

    performInspectionReq = {
      existingViolations: [
        {
          caseViolationId: 1,
          status: XerceViolationStatus.CLOSED_INVALID,
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
      newViolations: [
        {
          configViolationId: 1,
          status: XerceViolationStatus.CLOSED_INVALID,
          configDispositionId: 1,
          entity: {
            'Animal Colour': 'Black',
            'License Number': '2345',
            Age: 4,
            Breed: '',
            Note: '',
          },
        },
      ],
      noteContent: null,
    };

    inspectionViolations = {
      id: 1,
      agencyId: 1,
      caseId: 8,
      plannedDate: '2019-03-13T07:00:00.000Z',
      actualDate: null,
      assigneeId: 1,
      noteId: null,
      attachmentIds: [],
      noticeId: null,
      status: 'SCHEDULED',
      isVerificationInspection: true,
      createdBy: 1,
      updatedBy: null,
      createdAt: '2019-03-05T16:23:15.191Z',
      updatedAt: '2019-03-05T17:56:07.671Z',
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('Should upsert the violations with success', async () => {
    sandbox
      .stub(
        XerceCaseInspectionViolationService.prototype,
        'manageExistingViolations'
      )
      .withArgs(
        agencyId,
        caseId,
        inspectionViolations,
        performInspectionReq.existingViolations,
        staffId,
        transaction
      );

    sandbox
      .stub(
        XerceCaseInspectionViolationService.prototype,
        'manageNewViolations'
      )
      .withArgs(
        agencyId,
        caseId,
        staffId,
        inspectionViolations.id,
        performInspectionReq.newViolations,
        transaction
      );

    sandbox
      .stub(XerceCaseInspectionViolationService.prototype, 'get')
      .withArgs(agencyId, caseId, inspectionViolations.id, transaction)
      .resolves(inspectionViolations);

    sandbox
      .stub(XerceCaseViolationService.prototype, 'getAllInstance')
      .withArgs(agencyId, caseId, transaction)
      .resolves(xerceCaseViolations);

    sandbox
      .stub(XerceCaseViolationService.prototype, 'update')
      .withArgs(
        xerceCaseViolations,
        inspectionViolations,
        performInspectionReq,
        transaction
      )
      .resolves(inspectionViolations);

    const result = await xerceCaseInspectionViolationService.upsertAndDelete(
      agencyId,
      caseId,
      staffId,
      inspectionViolations,
      performInspectionReq,
      transaction
    );

    expect(result).to.deep.equal(
      inspectionViolations,
      'response did not match'
    );
  });

  it('Should throw error for adding violation after verificaation inspection', async () => {
    inspectionViolations = {
      id: 1,
      agencyId: 1,
      caseId: 8,
      plannedDate: '2019-03-13T07:00:00.000Z',
      actualDate: null,
      assigneeId: 1,
      noteId: null,
      attachmentIds: [],
      noticeId: null,
      status: 'SCHEDULED',
      isVerificationInspection: false,
      createdBy: 1,
      updatedBy: null,
      createdAt: '2019-03-05T16:23:15.191Z',
      updatedAt: '2019-03-05T17:56:07.671Z',
    };

    sandbox
      .stub(
        XerceCaseInspectionViolationService.prototype,
        'manageExistingViolations'
      )
      .withArgs(
        agencyId,
        caseId,
        inspectionViolations,
        performInspectionReq.existingViolations,
        staffId,
        transaction
      );

    sandbox
      .stub(
        XerceCaseInspectionViolationService.prototype,
        'manageNewViolations'
      )
      .withArgs(
        agencyId,
        caseId,
        staffId,
        inspectionViolations.id,
        performInspectionReq.newViolations,
        transaction
      );

    sandbox
      .stub(XerceCaseViolationService.prototype, 'getAllInstance')
      .withArgs(agencyId, caseId, transaction)
      .resolves(xerceCaseViolations);

    sandbox
      .stub(XerceCaseViolationService.prototype, 'update')
      .withArgs(
        xerceCaseViolations,
        inspectionViolations,
        performInspectionReq,
        transaction
      )
      .resolves(inspectionViolations);

    await xerceCaseInspectionViolationService
      .upsertAndDelete(
        agencyId,
        caseId,
        staffId,
        inspectionViolations,
        performInspectionReq,
        transaction
      )
      .catch(err => expect(err.name).to.equal('InvalidRequestError'));
  });

  it('Should throw error while fetching the inspection violations', async () => {
    sandbox
      .stub(
        XerceCaseInspectionViolationService.prototype,
        'manageExistingViolations'
      )
      .withArgs(
        agencyId,
        caseId,
        inspectionViolations,
        performInspectionReq.existingViolations,
        staffId,
        transaction
      );

    sandbox
      .stub(
        XerceCaseInspectionViolationService.prototype,
        'manageNewViolations'
      )
      .withArgs(
        agencyId,
        caseId,
        staffId,
        inspectionViolations.id,
        performInspectionReq.newViolations,
        transaction
      );

    sandbox
      .stub(XerceCaseInspectionViolationService.prototype, 'get')
      .withArgs(agencyId, caseId, inspectionViolations.id, transaction)
      .throws('InternalServerError');

    await xerceCaseInspectionViolationService
      .upsertAndDelete(
        agencyId,
        caseId,
        staffId,
        inspectionViolations,
        performInspectionReq,
        transaction
      )
      .catch(err => expect(err.name).to.equal('InternalServerError'));
  });
});

describe('XerceCaseInspectionViolation Service: manageExistingViolations method', () => {
  let sandbox;
  let transaction;
  let performInspectionReq: IPerformInspectionRequest;
  let caseViolations: ICaseViolation[];
  let currentInspection;
  const agencyId = 1;
  const caseId = 1;
  const staffId = 1;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    transaction = sinon.stub();

    performInspectionReq = {
      existingViolations: [
        {
          caseViolationId: 1,
          status: XerceViolationStatus.CLOSED_INVALID,
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
      newViolations: [
        {
          configViolationId: 1,
          status: XerceViolationStatus.CLOSED_INVALID,
          configDispositionId: 1,
          entity: {
            'Animal Colour': 'Black',
            'License Number': '2345',
            Age: 4,
            Breed: '',
            Note: '',
          },
        },
      ],
      noteContent: null,
    };

    caseViolations = [
      {
        id: 1,
        configDispositionId: 7,
        status: XerceViolationStatus.OPEN,
        complyByDate: null,
        configViolation: {
          id: 1,
          label: 'Animal Control',
          complyByDays: 5,
          configMunicipalCode: {
            id: 1,
            articleNumber: '6.30.010',
            description: 'Restraint of dogs.',
            resolutionAction: 'Test resolution',
          },
          configViolationType: {
            id: 1,
            label: 'Animal',
            iconURL:
              'https://cyberdyne-dev.s3.amazonaws.com/agency_0/system_icon/animal.png',
          },
        },
        entity: {
          'Animal Colour': 'Red',
          'License Number': '2345',
          Age: 1,
          Breed: 'breedA',
          Note: 'This animal is a pet cat',
        },
        createdAt: new Date('2019-03-05T16:23:15.143Z'),
        updatedAt: new Date('2019-03-05T17:56:07.678Z'),
        closedAt: null,
        createdBy: {
          id: 1,
          firstName: 'john',
          lastName: 'Doe',
        },
        updatedBy: {
          id: 1,
          firstName: 'john',
          lastName: 'Doe',
        },
        closedBy: null,
      },
    ];

    currentInspection = {
      id: 1,
      agencyId: 1,
      caseId: 8,
      plannedDate: '2019-03-13T07:00:00.000Z',
      actualDate: null,
      assigneeId: 1,
      noteId: null,
      attachmentIds: [],
      noticeId: null,
      status: 'SCHEDULED',
      isVerificationInspection: true,
      createdBy: 1,
      updatedBy: null,
      createdAt: '2019-03-05T16:23:15.191Z',
      updatedAt: '2019-03-05T17:56:07.671Z',
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should pass with success', async () => {
    sandbox
      .stub(db.XerceCaseViolation, 'findAll')
      .withArgs({
        where: {
          agencyId,
          xerceCaseId: caseId,
        },
      })
      .resolves(caseViolations);

    sandbox
      .stub(XerceCaseViolationService.prototype, 'validateRequest')
      .withArgs(agencyId, []);

    sandbox
      .stub(XerceCaseInspectionViolationService.prototype, 'create')
      .withArgs([], transaction);

    await (xerceCaseInspectionViolationService as any)
      .manageExistingViolations(
        agencyId,
        caseId,
        currentInspection,
        performInspectionReq.existingViolations,
        staffId,
        transaction
      )
      .catch(err => expect(err.name).to.equal('Error'));
  });

  it('should throw error while fetching case violations', async () => {
    sandbox
      .stub(db.XerceCaseViolation, 'findAll')
      .withArgs({
        where: {
          agencyId,
          xerceCaseId: caseId,
        },
      })
      .throws('Error');

    await (xerceCaseInspectionViolationService as any)
      .manageExistingViolations(
        agencyId,
        caseId,
        currentInspection,
        performInspectionReq.existingViolations,
        staffId,
        transaction
      )
      .catch(err => expect(err.name).to.equal('InternalServerError'));
  });

  it('should throw error for invalid case violation id', async () => {
    caseViolations = [];
    sandbox
      .stub(db.XerceCaseViolation, 'findAll')
      .withArgs({
        where: {
          agencyId,
          xerceCaseId: caseId,
        },
      })
      .resolves(caseViolations);

    await (xerceCaseInspectionViolationService as any)
      .manageExistingViolations(
        agencyId,
        caseId,
        currentInspection,
        performInspectionReq.existingViolations,
        staffId,
        transaction
      )
      .catch(err => expect(err.name).to.equal('InvalidRequestError'));
  });
});

describe('XerceCaseInspectionViolation Service: manageNewViolations method', () => {
  let sandbox;
  let transaction;
  let performInspectionReq: IPerformInspectionRequest;
  let caseViolations: ICaseViolation[];
  const agencyId = 1;
  const caseId = 1;
  const staffId = 1;
  let configViolations;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    transaction = sinon.stub();

    configViolations = [
      {
        id: 1,
        agencyId: 1,
        configMunicipalCodeId: 1,
        configViolationTypeId: 3,
        label: 'Weeds/Dead Landscaping',
        isActive: true,
        complyByDays: 3,
        createdAt: '2018-07-16T10:42:25.577Z',
        updatedAt: '2018-07-16T10:42:25.577Z',
        violationType: {
          id: 3,
          agencyId: 1,
          name: 'Abandoned Vehicle Abatement',
          description: 'Abandoned Vehicle Abatement',
          isActive: true,
          options: {},
          createdAt: '2018-07-16T10:42:22.634Z',
          updatedAt: '2018-07-16T10:42:22.634Z',
          entitySection: null,
        },
      },
    ];

    performInspectionReq = {
      existingViolations: [
        {
          caseViolationId: 1,
          status: XerceViolationStatus.CLOSED_INVALID,
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
      newViolations: [
        {
          configViolationId: 1,
          status: XerceViolationStatus.CLOSED_INVALID,
          configDispositionId: 1,
          entity: {
            'Animal Colour': 'Black',
            'License Number': '2345',
            Age: 4,
            Breed: '',
            Note: '',
          },
        },
      ],
      noteContent: null,
    };

    caseViolations = [
      {
        id: 1,
        configDispositionId: 7,
        status: XerceViolationStatus.OPEN,
        complyByDate: null,
        configViolation: {
          id: 1,
          label: 'Animal Control',
          complyByDays: 5,
          configMunicipalCode: {
            id: 1,
            articleNumber: '6.30.010',
            description: 'Restraint of dogs.',
            resolutionAction: 'Test resolution',
          },
          configViolationType: {
            id: 1,
            label: 'Animal',
            iconURL:
              'https://cyberdyne-dev.s3.amazonaws.com/agency_0/system_icon/animal.png',
          },
        },
        entity: {
          'Animal Colour': 'Red',
          'License Number': '2345',
          Age: 1,
          Breed: 'breedA',
          Note: 'This animal is a pet cat',
        },
        createdAt: new Date('2019-03-05T16:23:15.143Z'),
        updatedAt: new Date('2019-03-05T17:56:07.678Z'),
        closedAt: null,
        createdBy: {
          id: 1,
          firstName: 'john',
          lastName: 'Doe',
        },
        updatedBy: {
          id: 1,
          firstName: 'john',
          lastName: 'Doe',
        },
        closedBy: null,
      },
    ];
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should pass with success', async () => {
    sandbox
      .stub(XerceCaseViolationService.prototype, 'validateRequest')
      .resolves(configViolations);

    sandbox.stub(db.XerceCaseViolation, 'bulkCreate').resolves(caseViolations);

    sandbox
      .stub(XerceCaseInspectionViolationService.prototype, 'create')
      .withArgs([], transaction);

    await (xerceCaseInspectionViolationService as any)
      .manageNewViolations(
        agencyId,
        caseId,
        staffId,
        1,
        performInspectionReq.newViolations,
        transaction
      )
      .catch(err => expect(err.name).to.equal('Error'));
  });

  it('should throw error while creating case violations', async () => {
    sandbox
      .stub(XerceCaseViolationService.prototype, 'validateRequest')
      .resolves(configViolations);

    sandbox.stub(db.XerceCaseViolation, 'bulkCreate').throws('Error');

    await (xerceCaseInspectionViolationService as any)
      .manageNewViolations(
        agencyId,
        caseId,
        staffId,
        1,
        performInspectionReq.newViolations,
        transaction
      )
      .catch(err => expect(err.name).to.equal('InternalServerError'));
  });

  it('should throw error while creating case inspection violations', async () => {
    sandbox
      .stub(XerceCaseViolationService.prototype, 'validateRequest')
      .resolves(configViolations);

    sandbox.stub(db.XerceCaseViolation, 'bulkCreate').resolves(caseViolations);

    sandbox
      .stub(XerceCaseInspectionViolationService.prototype, 'create')
      .throws('InternalServerError');

    await (xerceCaseInspectionViolationService as any)
      .manageNewViolations(
        agencyId,
        caseId,
        staffId,
        1,
        performInspectionReq.newViolations,
        transaction
      )
      .catch(err => expect(err.name).to.equal('InternalServerError'));
  });
});
