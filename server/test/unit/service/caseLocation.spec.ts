import { expect } from 'chai';
import 'mocha';
import * as sinon from 'sinon';

import db from '../../../api/models';
import LocationFieldService from '../../../api/service/agencySetup/configLocationField';
import LocationService from '../../../api/service/caseLocation';
import GISQueryService from '../../../api/service/common/gisQuery';
import XerceCaseHistoryService from '../../../api/service/xerce/xerceCaseHistory';
import CustomSectionValidationUtil from '../../../api/utils/customSectionValidationUtil';
import DBUtil from '../../../api/utils/dbUtil';

const locationService = new LocationService();

describe('Location Service : create Method', () => {
  let sandbox;
  let result;
  let caseLocationReq: ICaseLocationRequest;
  let caseLocation: ICaseLocation;
  let caseUser: ICaseUser;
  let location: string;
  let existingLocation;
  let locationFlagHistory: ILocationFlagHistory[] = [];
  let transaction;
  const agencyId = 1;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    transaction = sinon.stub();

    caseUser = {
      id: 4,
      firstName: 'John',
      lastName: 'Doe',
    };

    caseLocationReq = {
      streetAddress: '547,Alabama',
      city: 'Alabama',
      state: 'AL',
      zip: '94016',
      latitude: 34.0401465212326,
      longitude: -78.0749587334245,
      parcelId: 1,
      flagAddress: {
        isFlagged: true,
        reasonForFlagging: 'Test reason for flagging',
      },
      isCDBGEligible: true,
      isCDBGApproved: true,
      parcelFields: {},
      manualFields: {
        Ward: 'Ward I',
        Lot: 23,
        Block: 1,
      },
      apn: '1234321',
      assessorAddress: 'Assessor street',
      isMapPinDropped: true,
    };

    location = `${caseLocationReq.streetAddress}${caseLocationReq.city}${
      caseLocationReq.state
    }${caseLocationReq.zip}`;

    caseLocation = {
      id: 17,
      streetAddress: '547,Alabama',
      city: 'Alabama',
      state: 'AL',
      zip: '94016',
      latitude: 34.0401465212326,
      longitude: -78.0749587334245,
      parcelId: 22,
      manualFields: {
        Ward: 'Ward I',
        Lot: 23,
        Block: 1,
      },
      parcelFields: {},
      flagHistory: [
        {
          id: 22,
          isFlagged: true,
          reasonForFlagging: 'Test reason for flagging',
          updatedBy: caseUser,
          updatedAt: new Date('2019-02-16T06:29:32.814Z'),
        },
      ],
      isCDBGApproved: true,
      apn: '1234321',
      assessorAddress: 'Assessor street',
      isMapPinDropped: true,
      parcel: {
        id: 1,
        apn: '',
        siteAddress: '547,Alabama',
        siteCity: 'Alabama',
        siteState: 'AL',
        siteZip: '94016',
        ownerName: 'Jena Doe',
        ownerAddress: '547,Alabama',
        ownerCity: 'Alabama',
        ownerState: 'AL',
        ownerZip: '94016',
        isOwnerBusiness: false,
        customFields: {},
        cdbgCensusTract: '',
        cdbgBlockGroup: '',
        cdbgLowModPercent: 10,
        isCDBGEligible: true,
        mapboxAddress: '',
        mapboxCity: '',
        mapboxState: '',
        mapboxZip: 94016,
        mapboxFullAddress: '547,Alabama, Alabama, AL, 94016',
        flagHistory: [
          {
            id: 22,
            isFlagged: true,
            reasonForFlagging: 'Test reason for flagging',
            updatedBy: caseUser,
            updatedAt: new Date('2019-02-16T06:29:32.814Z'),
          },
        ],
      },
      associatedCases: {
        openCases: 2,
        closedCases: 3,
      },
    };

    existingLocation = {
      id: 1,
      agencyId,
      streetAddress: caseLocationReq.streetAddress,
      city: caseLocationReq.city,
      state: caseLocationReq.state,
      zip: caseLocationReq.zip,
      latitude: caseLocationReq.latitude,
      longitude: caseLocationReq.longitude,
      mapZoomLevel: 12,
      parcelId: 1,
      isAgencyAddress: true,
      isCDBGEligible: true,
    };

    locationFlagHistory = [
      {
        id: 22,
        isFlagged: false,
        reasonForFlagging: 'Test reason for flagging',
        updatedBy: caseUser,
        updatedAt: new Date('2019-02-16T06:29:32.814Z'),
      },
    ];
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should create new location with flag history and return location id', async () => {
    existingLocation = null;
    sandbox
      .stub(LocationService.prototype, 'validateParcelId')
      .withArgs(agencyId, caseLocationReq.parcelId);

    sandbox
      .stub(db.AgencyLocation, 'findOne')
      .withArgs({
        where: {
          agencyId,
          [db.Sequelize.Op.or]: [
            db.Sequelize.where(
              db.Sequelize.fn(
                'concat',
                db.Sequelize.col(`AgencyLocation.street_address`),
                db.Sequelize.col(`AgencyLocation.city`),
                db.Sequelize.col(`AgencyLocation.state`),
                db.Sequelize.col(`AgencyLocation.zip`)
              ),
              {
                ilike: location,
              }
            ),
          ],
        },
      })
      .resolves(existingLocation);

    caseLocation = { ...caseLocation, parcel: null };
    sandbox
      .stub(LocationService.prototype, 'createNewLocation')
      .withArgs(agencyId, caseLocationReq, transaction)
      .resolves(caseLocation);

    sandbox
      .stub(LocationService.prototype, 'addLocationFlagHistory')
      .withArgs(
        agencyId,
        caseLocation.id,
        caseLocationReq.flagAddress.isFlagged,
        caseLocationReq.flagAddress.reasonForFlagging,
        caseUser.id,
        transaction
      );

    result = await locationService.create(
      agencyId,
      caseLocationReq,
      caseUser.id,
      transaction
    );

    expect(result).to.deep.equal(caseLocation.id, 'response did not match');
  });

  it('should create new location without flag history and return location id', async () => {
    existingLocation = null;
    caseLocationReq = { ...caseLocationReq };
    delete caseLocationReq.flagAddress;

    sandbox
      .stub(LocationService.prototype, 'validateParcelId')
      .withArgs(agencyId, caseLocationReq.parcelId);

    sandbox
      .stub(db.AgencyLocation, 'findOne')
      .withArgs({
        where: {
          agencyId,
          [db.Sequelize.Op.or]: [
            db.Sequelize.where(
              db.Sequelize.fn(
                'concat',
                db.Sequelize.col(`AgencyLocation.street_address`),
                db.Sequelize.col(`AgencyLocation.city`),
                db.Sequelize.col(`AgencyLocation.state`),
                db.Sequelize.col(`AgencyLocation.zip`)
              ),
              {
                ilike: location,
              }
            ),
          ],
        },
      })
      .resolves(existingLocation);

    caseLocation = { ...caseLocation, parcel: null };
    sandbox
      .stub(LocationService.prototype, 'createNewLocation')
      .withArgs(agencyId, caseLocationReq, transaction)
      .resolves(caseLocation);

    result = await locationService.create(
      agencyId,
      caseLocationReq,
      caseUser.id,
      transaction
    );

    expect(result).to.deep.equal(caseLocation.id, 'response did not match');
  });

  it('should create new location with flag history and return location id', async () => {
    existingLocation = null;
    caseLocationReq = { ...caseLocationReq };

    sandbox
      .stub(LocationService.prototype, 'validateParcelId')
      .withArgs(agencyId, caseLocationReq.parcelId);

    sandbox
      .stub(db.AgencyLocation, 'findOne')
      .withArgs({
        where: {
          agencyId,
          [db.Sequelize.Op.or]: [
            db.Sequelize.where(
              db.Sequelize.fn(
                'concat',
                db.Sequelize.col(`AgencyLocation.street_address`),
                db.Sequelize.col(`AgencyLocation.city`),
                db.Sequelize.col(`AgencyLocation.state`),
                db.Sequelize.col(`AgencyLocation.zip`)
              ),
              {
                ilike: location,
              }
            ),
          ],
        },
      })
      .resolves(existingLocation);

    caseLocation = { ...caseLocation, parcel: null };
    sandbox
      .stub(LocationService.prototype, 'createNewLocation')
      .withArgs(agencyId, caseLocationReq, transaction)
      .resolves(caseLocation);

    sandbox
      .stub(LocationService.prototype, 'addLocationFlagHistory')
      .withArgs(
        agencyId,
        caseLocation.id,
        caseLocationReq.flagAddress.isFlagged,
        caseLocationReq.flagAddress.reasonForFlagging,
        caseUser.id,
        transaction
      );

    result = await locationService.create(
      agencyId,
      caseLocationReq,
      caseUser.id,
      transaction
    );

    expect(result).to.deep.equal(caseLocation.id, 'response did not match');
  });

  it('should create location flag history and return existing location id', async () => {
    caseLocation.flagHistory = [];
    locationFlagHistory = [];

    sandbox
      .stub(LocationService.prototype, 'validateParcelId')
      .withArgs(agencyId, caseLocationReq.parcelId);

    sandbox
      .stub(LocationService.prototype, 'getLocationByAddress')
      .resolves(existingLocation);

    sandbox
      .stub(LocationService.prototype, 'getFlagHistory')
      .withArgs(agencyId, existingLocation.id)
      .resolves(locationFlagHistory);

    sandbox
      .stub(LocationService.prototype, 'addLocationFlagHistory')
      .withArgs(
        agencyId,
        existingLocation.id,
        caseLocationReq.flagAddress.isFlagged,
        caseLocationReq.flagAddress.reasonForFlagging,
        caseUser.id,
        transaction
      );

    result = await locationService.create(
      agencyId,
      caseLocationReq,
      caseUser.id,
      transaction
    );

    expect(result).to.deep.equal(existingLocation.id, 'response did not match');
  });

  it('should update location flag history and return existing location id', async () => {
    caseLocation.flagHistory = [];

    sandbox
      .stub(LocationService.prototype, 'validateParcelId')
      .withArgs(agencyId, caseLocationReq.parcelId);

    sandbox
      .stub(LocationService.prototype, 'getLocationByAddress')
      .resolves(existingLocation);

    sandbox
      .stub(LocationService.prototype, 'getFlagHistory')
      .withArgs(agencyId, existingLocation.id)
      .resolves(locationFlagHistory);

    sandbox
      .stub(LocationService.prototype, 'addLocationFlagHistory')
      .withArgs(
        agencyId,
        existingLocation.id,
        caseLocationReq.flagAddress.isFlagged,
        caseLocationReq.flagAddress.reasonForFlagging,
        caseUser.id,
        transaction
      );

    result = await locationService.create(
      agencyId,
      caseLocationReq,
      caseUser.id,
      transaction
    );

    expect(result).to.deep.equal(existingLocation.id, 'response did not match');
  });

  it('should not create location flag history and return existing location id', async () => {
    caseLocationReq = { ...caseLocationReq };
    delete caseLocationReq.flagAddress;
    sandbox
      .stub(LocationService.prototype, 'validateParcelId')
      .withArgs(agencyId, caseLocationReq.parcelId);

    sandbox
      .stub(LocationService.prototype, 'getLocationByAddress')
      .resolves(existingLocation);

    sandbox
      .stub(LocationService.prototype, 'getFlagHistory')
      .withArgs(agencyId, existingLocation.id)
      .resolves(locationFlagHistory);

    result = await locationService.create(
      agencyId,
      caseLocationReq,
      caseUser.id,
      transaction
    );

    expect(result).to.deep.equal(existingLocation.id, 'response did not match');
  });
});

describe('Location Service: getXerceCaseLocation Method', () => {
  let sandbox;
  let transaction;
  const agencyId = 1;
  const caseId = 1;
  let xerceCase;
  let caseUser: ICaseUser;
  let locationFlagHistory: ILocationFlagHistory[] = [];
  let parcel: IParcel;
  let caseLocation: ICaseLocation;
  let associatedCases: IXerceCaseCount;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    transaction = sinon.stub();

    caseUser = {
      id: 4,
      firstName: 'John',
      lastName: 'Doe',
    };

    xerceCase = {
      id: caseId,
      agencyId,
      assigneeId: caseUser.id,
      agencyLocationId: 17,
      caseNumber: 'CE-19-1',
      issueDescription: 'Test Issue Desc.',
      status: XerceCaseStatus.OPEN,
      customCaseFieldValues: [],
      customForcedAbatementFieldValues: [],
      locationManualFields: {
        Ward: 'Ward I',
        Lot: 23,
        Block: 1,
      },
      locationParcelFields: {},
      isCDBGApproved: true,
      createdBy: 1,
      updatedBy: 2,
      closedBy: 3,
      createdAt: new Date('2019-02-16T06:29:32.814Z'),
      updatedAt: new Date('2019-02-16T06:29:32.814Z'),
      closedAt: new Date('2019-02-16T06:29:32.814Z'),
      caseLocation: {
        id: 17,
        agencyId,
        streetAddress: '547,Alabama',
        city: 'Alabama',
        state: 'AL',
        zip: '94016',
        latitude: 34.0401465212326,
        longitude: -78.0749587334245,
        mapZoomLevel: 12,
        parcelId: 22,
        isAgencyAddress: true,
        isCDBGEligible: false,
        apn: '1234321',
        assessorAddress: 'Assessor street',
        isMapPinDropped: true,
        associatedCases,
      },
      xerceCaseLocation: {
        id: 17,
        agencyId,
        caseId,
        apn: '1234321',
        assessorAddress: 'Assessor street',
        isMapPinDropped: true,
      },
    };

    locationFlagHistory = [
      {
        id: 22,
        isFlagged: true,
        reasonForFlagging: 'Test reason for flagging',
        updatedBy: caseUser,
        updatedAt: new Date('2019-02-16T06:29:32.814Z'),
      },
    ];

    parcel = {
      id: 22,
      apn: '',
      siteAddress: '547,Alabama',
      siteCity: 'Alabama',
      siteState: 'AL',
      siteZip: '94016',
      ownerName: 'Jena Doe',
      ownerAddress: '547,Alabama',
      ownerCity: 'Alabama',
      ownerState: 'AL',
      ownerZip: '94016',
      isOwnerBusiness: false,
      customFields: {},
      cdbgCensusTract: '',
      cdbgBlockGroup: '',
      cdbgLowModPercent: 10,
      isCDBGEligible: true,
      mapboxAddress: '',
      mapboxCity: '',
      mapboxState: '',
      mapboxZip: 94016,
      mapboxFullAddress: '547,Alabama, Alabama, AL, 94016',
      flagHistory: [
        {
          id: 22,
          isFlagged: true,
          reasonForFlagging: 'Test reason for flagging',
          updatedBy: caseUser,
          updatedAt: new Date('2019-02-16T06:29:32.814Z'),
        },
      ],
    };

    associatedCases = {
      openCases: 2,
      closedCases: 3,
    };

    caseLocation = {
      id: 17,
      streetAddress: '547,Alabama',
      city: 'Alabama',
      state: 'AL',
      zip: '94016',
      latitude: 34.0401465212326,
      longitude: -78.0749587334245,
      parcelId: 22,
      manualFields: {
        Ward: 'Ward I',
        Lot: 23,
        Block: 1,
      },
      parcelFields: {},
      flagHistory: [
        {
          id: 22,
          isFlagged: true,
          reasonForFlagging: 'Test reason for flagging',
          updatedBy: caseUser,
          updatedAt: new Date('2019-02-16T06:29:32.814Z'),
        },
      ],
      apn: '1234321',
      assessorAddress: 'Assessor street',
      isMapPinDropped: true,

      isCDBGApproved: true,
      parcel: {
        id: 22,
        apn: '',
        siteAddress: '547,Alabama',
        siteCity: 'Alabama',
        siteState: 'AL',
        siteZip: '94016',
        ownerName: 'Jena Doe',
        ownerAddress: '547,Alabama',
        ownerCity: 'Alabama',
        ownerState: 'AL',
        ownerZip: '94016',
        isOwnerBusiness: false,
        customFields: {},
        cdbgCensusTract: '',
        cdbgBlockGroup: '',
        cdbgLowModPercent: 10,
        isCDBGEligible: true,
        mapboxAddress: '',
        mapboxCity: '',
        mapboxState: '',
        mapboxZip: 94016,
        mapboxFullAddress: '547,Alabama, Alabama, AL, 94016',
        flagHistory: [
          {
            id: 22,
            isFlagged: true,
            reasonForFlagging: 'Test reason for flagging',
            updatedBy: caseUser,
            updatedAt: new Date('2019-02-16T06:29:32.814Z'),
          },
        ],
      },
      associatedCases,
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return the case location response', async () => {
    sandbox
      .stub(db.XerceCase, 'findOne')
      .withArgs({
        where: { agencyId, id: caseId },
        include: [
          {
            model: db.AgencyLocation,
            as: 'caseLocation',
          },
          {
            model: db.XerceCaseLocation,
            as: 'xerceCaseLocation',
          },
        ],
        transaction,
      })
      .resolves(xerceCase);

    sandbox
      .stub(LocationService.prototype, 'getFlagHistory')
      .withArgs(agencyId, xerceCase.agencyLocationId)
      .resolves(locationFlagHistory);

    sandbox
      .stub(GISQueryService.prototype, 'getParcel')
      .withArgs(
        agencyId,
        xerceCase.caseLocation.latitude,
        xerceCase.caseLocation.longitude,
        null
      )
      .resolves(parcel);

    sandbox
      .stub(LocationService.prototype, 'getCasesCountByLocation')
      .withArgs(
        agencyId,
        xerceCase.caseLocation.streetAddress,
        xerceCase.caseLocation.city,
        xerceCase.caseLocation.state,
        xerceCase.caseLocation.zip
      )
      .resolves(associatedCases);

    const result = await new LocationService().getXerceCaseLocation(
      agencyId,
      caseId,
      transaction
    );

    expect(result).to.deep.equal(caseLocation, 'response did not match');
  });

  it('should throw error as case does not exists', async () => {
    xerceCase = null;
    sandbox
      .stub(db.XerceCase, 'findOne')
      .withArgs({
        where: { agencyId, id: caseId },
        include: [
          {
            model: db.AgencyLocation,
            as: 'caseLocation',
          },
          {
            model: db.XerceCaseLocation,
            as: 'xerceCaseLocation',
          },
        ],
        transaction,
      })
      .resolves(xerceCase);

    await new LocationService()
      .getXerceCaseLocation(agencyId, caseId, transaction)
      .catch(err => expect(err.name).to.deep.equal('DBMissingEntityError'));
  });

  it('should throw InternalServerError when querying for case', async () => {
    xerceCase = null;
    sandbox
      .stub(db.XerceCase, 'findOne')
      .withArgs({
        where: { agencyId, id: caseId },
        include: [
          {
            model: db.AgencyLocation,
            as: 'caseLocation',
          },
          {
            model: db.XerceCaseLocation,
            as: 'xerceCaseLocation',
          },
        ],
        transaction,
      })
      .throws({ name: 'Error' });

    await new LocationService()
      .getXerceCaseLocation(agencyId, caseId, transaction)
      .catch(err => expect(err.name).to.deep.equal('InternalServerError'));
  });
});

describe('Location Service: edit Method', () => {
  let sandbox;
  let transaction;
  const agencyId = 1;
  const caseId = 1;
  let xerceCase;
  let caseUser: ICaseUser;
  let locationFlagHistory: ILocationFlagHistory[] = [];
  let newLocationFlagHistory: ILocationFlagHistory[] = [];
  // let parcel: IParcel;
  let caseLocation: ICaseLocation;
  let caseLocationEditReq: ICaseLocationRequest;
  let newLocation;
  let locationReq: ICaseLocationRequest;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    transaction = sinon.stub();

    caseUser = {
      id: 4,
      firstName: 'John',
      lastName: 'Doe',
    };

    caseLocationEditReq = {
      isCDBGApproved: false,
      streetAddress: '547,Alabama',
      manualFields: {
        1: 'Ward I',
        2: 23,
        3: 1,
      },
      apn: '1234321',
      assessorAddress: 'Assessor street',
      isMapPinDropped: true,
      zip: '123456',
      city: 'Alabama',
      state: 'AL',
      latitude: 34.0401465212326,
      longitude: -78.0749587334245,
      isCDBGEligible: true,
      parcelFields: {},
      parcelId: 22,
    };

    xerceCase = {
      id: caseId,
      agencyId,
      assigneeId: caseUser.id,
      agencyLocationId: 17,
      caseNumber: 'CE-19-1',
      issueDescription: 'Test Issue Desc.',
      status: XerceCaseStatus.OPEN,
      customCaseFieldValues: [],
      customForcedAbatementFieldValues: [],
      locationManualFields: {
        1: 'Ward I',
        2: 23,
        3: 1,
      },
      locationParcelFields: {},
      isCDBGApproved: true,
      createdBy: 1,
      updatedBy: 2,
      closedBy: 3,
      createdAt: new Date('2019-02-16T06:29:32.814Z'),
      updatedAt: new Date('2019-02-16T06:29:32.814Z'),
      closedAt: new Date('2019-02-16T06:29:32.814Z'),
      caseLocation: {
        id: 17,
        agencyId,
        streetAddress: '547,Alabama',
        city: 'Alabama',
        state: 'AL',
        zip: '94016',
        latitude: 34.0401465212326,
        longitude: -78.0749587334245,
        mapZoomLevel: 12,
        parcelId: 22,
        isAgencyAddress: true,
        isCDBGEligible: false,
      },
      xerceCaseLocation: {
        apn: '1234',
        assessorAddress: '123456',
        isMapPinDropped: false,
        save: () => Promise.resolve(),
      },
      save: () => Promise.resolve(),
    };

    locationReq = {
      streetAddress: caseLocationEditReq.streetAddress,
      city: caseLocationEditReq.city,
      state: caseLocationEditReq.state,
      zip: caseLocationEditReq.zip,
      latitude: caseLocationEditReq.latitude,
      longitude: caseLocationEditReq.longitude,
      isCDBGEligible: caseLocationEditReq.isCDBGEligible,
      isCDBGApproved: caseLocationEditReq.isCDBGApproved,
      manualFields: caseLocationEditReq.manualFields,
      parcelFields: caseLocationEditReq.parcelFields,
      parcelId: caseLocationEditReq.parcelId,
      apn: caseLocationEditReq.apn,
      assessorAddress: caseLocationEditReq.assessorAddress,
      isMapPinDropped: caseLocationEditReq.isMapPinDropped,
    };

    locationFlagHistory = [
      {
        id: 22,
        isFlagged: true,
        reasonForFlagging: 'Test reason for flagging',
        updatedBy: caseUser,
        updatedAt: new Date('2019-02-16T06:29:32.814Z'),
      },
    ];

    newLocationFlagHistory = [
      {
        id: 22,
        isFlagged: true,
        reasonForFlagging: 'Test reason for flagging',
        updatedBy: caseUser,
        updatedAt: new Date('2019-02-16T06:29:32.814Z'),
      },
      {
        id: 23,
        isFlagged: false,
        reasonForFlagging: 'Test reason for flagging',
        updatedBy: caseUser,
        updatedAt: new Date('2019-02-16T06:29:32.814Z'),
      },
    ];

    caseLocation = {
      id: 17,
      streetAddress: '547,Alabama',
      city: 'Alabama',
      state: 'AL',
      zip: '94016',
      latitude: 34.0401465212326,
      longitude: -78.0749587334245,
      parcelId: 22,
      manualFields: {
        Ward: 'Ward I',
        Lot: 23,
        Block: 1,
      },
      parcelFields: {},
      flagHistory: [
        {
          id: 22,
          isFlagged: true,
          reasonForFlagging: 'Test reason for flagging',
          updatedBy: caseUser,
          updatedAt: new Date('2019-02-16T06:29:32.814Z'),
        },
      ],
      apn: '1234321',
      assessorAddress: 'Assessor street',
      isMapPinDropped: true,
      isCDBGApproved: true,
      parcel: {
        id: 22,
        apn: '',
        siteAddress: '547,Alabama',
        siteCity: 'Alabama',
        siteState: 'AL',
        siteZip: '94016',
        ownerName: 'Jena Doe',
        ownerAddress: '547,Alabama',
        ownerCity: 'Alabama',
        ownerState: 'AL',
        ownerZip: '94016',
        isOwnerBusiness: false,
        customFields: {},
        cdbgCensusTract: '',
        cdbgBlockGroup: '',
        cdbgLowModPercent: 10,
        isCDBGEligible: true,
        mapboxAddress: '',
        mapboxCity: '',
        mapboxState: '',
        mapboxZip: 94016,
        mapboxFullAddress: '547,Alabama, Alabama, AL, 94016',
        flagHistory: [
          {
            id: 22,
            isFlagged: true,
            reasonForFlagging: 'Test reason for flagging',
            updatedBy: caseUser,
            updatedAt: new Date('2019-02-16T06:29:32.814Z'),
          },
        ],
      },
      associatedCases: {
        openCases: 2,
        closedCases: 3,
      },
    };

    newLocation = {
      id: 1,
      agencyId,
      streetAddress: '548,Alabama',
      city: 'Alabama',
      state: 'AL',
      zip: '94016',
      latitude: 34.0401465212326,
      longitude: -78.0749587334245,
      mapZoomLevel: 12,
      parcelId: 22,
      isAgencyAddress: true,
      isCDBGEligible: true,
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should edit the CDBG Approval for the existing location', async () => {
    sandbox
      .stub(LocationService.prototype, 'getxerceCaseLocationInstance')
      .resolves(xerceCase);

    sandbox
      .stub(LocationService.prototype, 'validateCDBGApproval')
      .withArgs(
        xerceCase.caseLocation.isCDBGEligible,
        caseLocationEditReq.isCDBGApproved
      );

    sandbox.stub(DBUtil, 'createTransaction').resolves(transaction);

    sandbox
      .stub(XerceCaseHistoryService.prototype, 'createCaseLocationHistory')
      .withArgs(
        agencyId,
        caseUser.id,
        caseId,
        xerceCase,
        caseLocationEditReq,
        transaction
      )
      .resolves(null);

    sandbox
      .stub(LocationService.prototype, 'create')
      .withArgs(agencyId, locationReq, caseUser.id, transaction)
      .resolves(newLocation.id);

    sandbox.stub(DBUtil, 'commitTransaction').withArgs(transaction);

    caseLocation = {
      ...caseLocation,
      isCDBGApproved: caseLocationEditReq.isCDBGApproved,
    };

    sandbox
      .stub(LocationService.prototype, 'getXerceCaseLocation')
      .resolves(caseLocation);

    const result = await new LocationService().edit(
      agencyId,
      caseId,
      caseUser.id,
      caseLocationEditReq
    );

    expect(result).to.deep.equal(caseLocation, 'response did not match');
  });

  it('should update case location for existing location', async () => {
    caseLocationEditReq.streetAddress = '123,Alabama';

    sandbox
      .stub(LocationService.prototype, 'getxerceCaseLocationInstance')
      .resolves(xerceCase);

    sandbox.stub(DBUtil, 'createTransaction').resolves(transaction);

    sandbox
      .stub(XerceCaseHistoryService.prototype, 'createCaseLocationHistory')
      .withArgs(
        agencyId,
        caseUser.id,
        caseId,
        xerceCase,
        caseLocationEditReq,
        transaction
      )
      .resolves(null);

    sandbox
      .stub(LocationService.prototype, 'create')
      .withArgs(agencyId, locationReq, caseUser.id, transaction)
      .resolves(newLocation.id);

    sandbox
      .stub(LocationService.prototype, 'validateCDBGApproval')
      .withArgs(
        xerceCase.caseLocation.isCDBGEligible,
        caseLocationEditReq.isCDBGApproved
      );

    caseLocation = {
      ...caseLocation,
      isCDBGApproved: caseLocationEditReq.isCDBGApproved,
    };

    sandbox.stub(DBUtil, 'commitTransaction').withArgs(transaction);

    sandbox
      .stub(LocationService.prototype, 'getXerceCaseLocation')
      .resolves(caseLocation);

    const result = await new LocationService().edit(
      agencyId,
      caseId,
      caseUser.id,
      caseLocationEditReq
    );

    expect(result).to.deep.equal(caseLocation, 'response did not match');
  });

  it('should throws InternalServerError when querying for case', async () => {
    sandbox.stub(db.XerceCase, 'findOne').throws({ name: 'Error' });

    await new LocationService()
      .edit(agencyId, caseId, caseUser.id, caseLocationEditReq)
      .catch(err => {
        expect(err.name).to.deep.equal('InternalServerError');
        expect(err.message).to.deep.equal(
          'Error while fetching the case agency location details'
        );
      });
  });

  it('should throws InternalServerError when case is not found', async () => {
    sandbox.stub(db.XerceCase, 'findOne').resolves(null);

    await new LocationService()
      .edit(agencyId, caseId, caseUser.id, caseLocationEditReq)
      .catch(err => {
        expect(err.name).to.deep.equal('DBMissingEntityError');
        expect(err.message).to.deep.equal(`Invalid Request.Case doesn't exist`);
      });
  });

  it('should throws InternalServerError when fetching agency location', async () => {
    sandbox.stub(db.XerceCase, 'findOne').throws({ name: 'Error' });

    await new LocationService()
      .edit(agencyId, caseId, caseUser.id, caseLocationEditReq)
      .catch(err => {
        expect(err.name).to.deep.equal('InternalServerError');
        expect(err.message).to.deep.equal(
          'Error while fetching the case agency location details'
        );
      });
  });

  it('should edit the location address and create new location', async () => {
    caseLocationEditReq = {
      ...caseLocationEditReq,
      streetAddress: '548,Alabama',
    };

    sandbox
      .stub(LocationService.prototype, 'getxerceCaseLocationInstance')
      .resolves(xerceCase);

    sandbox
      .stub(LocationService.prototype, 'validateCDBGApproval')
      .withArgs(
        xerceCase.caseLocation.isCDBGEligible,
        caseLocationEditReq.isCDBGApproved
      );

    sandbox.stub(DBUtil, 'createTransaction').resolves(transaction);

    sandbox
      .stub(XerceCaseHistoryService.prototype, 'createCaseLocationHistory')
      .withArgs(
        agencyId,
        caseUser.id,
        caseId,
        xerceCase,
        caseLocationEditReq,
        transaction
      )
      .resolves(null);

    sandbox
      .stub(LocationService.prototype, 'create')
      .withArgs(agencyId, locationReq, caseUser.id, transaction)
      .resolves(newLocation.id);

    sandbox.stub(DBUtil, 'commitTransaction').withArgs(transaction);

    caseLocation = {
      ...caseLocation,
      streetAddress: caseLocationEditReq.streetAddress,
    };

    sandbox
      .stub(LocationService.prototype, 'getXerceCaseLocation')
      .resolves(caseLocation);

    const result = await new LocationService().edit(
      agencyId,
      caseId,
      caseUser.id,
      caseLocationEditReq
    );

    expect(result).to.deep.equal(caseLocation, 'response did not match');
  });

  it('should throw DBConflictError when creating new agency location', async () => {
    caseLocationEditReq = {
      ...caseLocationEditReq,
      streetAddress: '548,Alabama',
    };

    sandbox
      .stub(XerceCaseHistoryService.prototype, 'createCaseLocationHistory')
      .withArgs(
        agencyId,
        caseUser.id,
        caseId,
        xerceCase,
        caseLocationEditReq,
        transaction
      )
      .resolves(null);

    sandbox
      .stub(LocationService.prototype, 'getxerceCaseLocationInstance')
      .resolves(xerceCase);

    sandbox
      .stub(LocationService.prototype, 'validateCDBGApproval')
      .withArgs(
        xerceCase.caseLocation.isCDBGEligible,
        caseLocationEditReq.isCDBGApproved
      );

    sandbox.stub(DBUtil, 'createTransaction').resolves(transaction);

    sandbox
      .stub(LocationService.prototype, 'create')
      .throws({ name: 'SequelizeUniqueConstraintError' });

    sandbox.stub(DBUtil, 'rollbackTransaction').withArgs(transaction);

    await new LocationService()
      .edit(agencyId, caseId, caseUser.id, caseLocationEditReq)
      .catch(err => {
        expect(err.name).to.deep.equal('DBConflictError');
        expect(err.message).to.deep.equal(
          'Conflict while trying to edit case location.'
        );
      });
  });

  it('should throw InternalServerError when creating new agency location', async () => {
    caseLocationEditReq = {
      ...caseLocationEditReq,
      streetAddress: '548,Alabama',
    };

    sandbox
      .stub(LocationService.prototype, 'getxerceCaseLocationInstance')
      .resolves(xerceCase);

    sandbox
      .stub(LocationService.prototype, 'validateCDBGApproval')
      .withArgs(
        xerceCase.caseLocation.isCDBGEligible,
        caseLocationEditReq.isCDBGApproved
      );

    sandbox
      .stub(XerceCaseHistoryService.prototype, 'createCaseLocationHistory')
      .withArgs(
        agencyId,
        caseUser.id,
        caseId,
        xerceCase,
        caseLocationEditReq,
        transaction
      )
      .resolves(null);

    sandbox.stub(DBUtil, 'createTransaction').resolves(transaction);

    sandbox.stub(LocationService.prototype, 'create').throws({ name: 'Error' });

    sandbox.stub(DBUtil, 'rollbackTransaction').withArgs(transaction);

    await new LocationService()
      .edit(agencyId, caseId, caseUser.id, caseLocationEditReq)
      .catch(err => {
        expect(err.name).to.deep.equal('InternalServerError');
      });
  });

  it('should edit the flagAddress for the existing location', async () => {
    caseLocationEditReq = {
      ...caseLocationEditReq,
      flagAddress: {
        isFlagged: false,
        reasonForFlagging: 'Test reason for flagging',
      },
    };
    sandbox
      .stub(LocationService.prototype, 'getxerceCaseLocationInstance')
      .resolves(xerceCase);

    sandbox
      .stub(XerceCaseHistoryService.prototype, 'createCaseLocationHistory')
      .withArgs(
        agencyId,
        caseUser.id,
        caseId,
        xerceCase,
        caseLocationEditReq,
        transaction
      )
      .resolves(null);

    sandbox
      .stub(LocationService.prototype, 'validateCDBGApproval')
      .withArgs(
        xerceCase.caseLocation.isCDBGEligible,
        caseLocationEditReq.isCDBGApproved
      );

    sandbox.stub(DBUtil, 'createTransaction').resolves(transaction);

    sandbox
      .stub(LocationService.prototype, 'create')
      .withArgs(agencyId, locationReq, caseUser.id, transaction)
      .resolves(newLocation.id);

    sandbox.stub(DBUtil, 'commitTransaction').withArgs(transaction);

    sandbox
      .stub(LocationService.prototype, 'getFlagHistory')
      .resolves(locationFlagHistory);

    sandbox
      .stub(LocationService.prototype, 'addLocationFlagHistory')
      .withArgs(
        agencyId,
        caseLocation.id,
        caseLocationEditReq.flagAddress.isFlagged,
        caseLocationEditReq.flagAddress.reasonForFlagging,
        caseUser.id,
        transaction
      );

    caseLocation = { ...caseLocation, flagHistory: newLocationFlagHistory };

    sandbox
      .stub(LocationService.prototype, 'getXerceCaseLocation')
      .resolves(caseLocation);

    const result = await new LocationService().edit(
      agencyId,
      caseId,
      caseUser.id,
      caseLocationEditReq
    );

    expect(result).to.deep.equal(caseLocation, 'response did not match');
  });

  it('should throw InvalidRequestError when flagging an already flagged address', async () => {
    caseLocationEditReq = {
      ...caseLocationEditReq,
      flagAddress: {
        isFlagged: true,
        reasonForFlagging: 'Test reason for flagging',
      },
    };
    sandbox
      .stub(LocationService.prototype, 'getxerceCaseLocationInstance')
      .resolves(xerceCase);

    sandbox
      .stub(LocationService.prototype, 'validateCDBGApproval')
      .withArgs(
        xerceCase.caseLocation.isCDBGEligible,
        caseLocationEditReq.isCDBGApproved
      );

    sandbox.stub(DBUtil, 'createTransaction').resolves(transaction);

    sandbox
      .stub(XerceCaseHistoryService.prototype, 'createCaseLocationHistory')
      .withArgs(
        agencyId,
        caseUser.id,
        caseId,
        xerceCase,
        caseLocationEditReq,
        transaction
      )
      .resolves(null);

    sandbox
      .stub(LocationService.prototype, 'create')
      .withArgs(agencyId, locationReq, caseUser.id, transaction)
      .resolves(newLocation.id);

    sandbox
      .stub(LocationService.prototype, 'getFlagHistory')
      .resolves(locationFlagHistory);

    sandbox.stub(DBUtil, 'rollbackTransaction').resolves(transaction);

    await new LocationService()
      .edit(agencyId, caseId, caseUser.id, caseLocationEditReq)
      .catch(err => {
        expect(err.name).to.deep.equal('InternalServerError');
      });
  });

  it('should throw DBConflictError when trying to save xerceCase', async () => {
    sandbox
      .stub(LocationService.prototype, 'getxerceCaseLocationInstance')
      .resolves(xerceCase);

    sandbox
      .stub(XerceCaseHistoryService.prototype, 'createCaseLocationHistory')
      .withArgs(
        agencyId,
        caseUser.id,
        caseId,
        xerceCase,
        caseLocationEditReq,
        transaction
      )
      .resolves(null);

    sandbox
      .stub(LocationService.prototype, 'validateCDBGApproval')
      .withArgs(
        xerceCase.caseLocation.isCDBGEligible,
        caseLocationEditReq.isCDBGApproved
      );

    sandbox.stub(DBUtil, 'createTransaction').resolves(transaction);

    sandbox
      .stub(LocationService.prototype, 'create')
      .withArgs(agencyId, locationReq, caseUser.id, transaction)
      .resolves(newLocation.id);

    sandbox.stub(DBUtil, 'rollbackTransaction').withArgs(transaction);

    caseLocation = { ...caseLocation, manualFields: {} };

    sandbox
      .stub(xerceCase, 'save')
      .throws({ name: 'SequelizeUniqueConstraintError' });

    await new LocationService()
      .edit(agencyId, caseId, caseUser.id, caseLocationEditReq)
      .catch(err => {
        expect(err.name).to.deep.equal('DBConflictError');
        expect(err.message).to.deep.equal(
          'Conflict while trying to edit case location.'
        );
      });
  });

  it('should throw InternalServerError when trying to save xerceCase', async () => {
    sandbox
      .stub(LocationService.prototype, 'getxerceCaseLocationInstance')
      .resolves(xerceCase);

    sandbox
      .stub(LocationService.prototype, 'validateCDBGApproval')
      .withArgs(
        xerceCase.caseLocation.isCDBGEligible,
        caseLocationEditReq.isCDBGApproved
      );

    sandbox.stub(DBUtil, 'createTransaction').resolves(transaction);

    sandbox
      .stub(XerceCaseHistoryService.prototype, 'createCaseLocationHistory')
      .withArgs(
        agencyId,
        caseUser.id,
        caseId,
        xerceCase,
        caseLocationEditReq,
        transaction
      )
      .resolves(null);

    sandbox
      .stub(LocationService.prototype, 'create')
      .withArgs(agencyId, locationReq, caseUser.id, transaction)
      .resolves(newLocation.id);

    sandbox.stub(DBUtil, 'rollbackTransaction').withArgs(transaction);

    caseLocation = { ...caseLocation, manualFields: {} };

    sandbox.stub(xerceCase, 'save').throws({ name: 'Error' });

    await locationService
      .edit(agencyId, caseId, caseUser.id, caseLocationEditReq)
      .catch(err => {
        expect(err.name).to.deep.equal('InternalServerError');
      });
  });

  it('should fetch xerceCaseLocationInstance', async () => {
    sandbox.stub(db.XerceCase, 'findOne').resolves(xerceCase);
    const result = await (locationService as any).getxerceCaseLocationInstance(
      agencyId,
      caseId,
      transaction
    );
    expect(result).to.deep.equals(xerceCase);
  });

  it('should throws InternalServerError when querying for case', async () => {
    sandbox.stub(db.XerceCase, 'findOne').throws({ name: 'Error' });

    await (locationService as any)
      .getxerceCaseLocationInstance(agencyId, caseId, transaction)
      .catch(err => {
        expect(err.name).to.deep.equal('InternalServerError');
        expect(err.message).to.deep.equal(
          'Error while fetching the case agency location details'
        );
      });
  });
});

describe('Location Service: createNewLocation Method', () => {
  let sandbox;
  let result;
  let caseLocationReq: ICaseLocationRequest;
  let newLocationObj: IAgencyLocationAttributes;
  let newLocation;
  let transaction;
  let response: ICaseLocation;
  let caseUser: ICaseUser;
  const agencyId = 1;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    transaction = sinon.stub();

    caseUser = {
      id: 4,
      firstName: 'John',
      lastName: 'Doe',
    };

    caseLocationReq = {
      streetAddress: '547,Alabama',
      city: 'Alabama',
      state: 'AL',
      zip: '94016',
      latitude: 34.0401465212326,
      longitude: -78.0749587334245,
      parcelId: 1,
      flagAddress: {
        isFlagged: true,
        reasonForFlagging: 'Test reason for flagging',
      },
      isCDBGEligible: true,
      isCDBGApproved: true,
      parcelFields: {},
      manualFields: {
        Ward: 'Ward I',
        Lot: 23,
        Block: 1,
      },
      apn: '1234321',
      assessorAddress: 'Assessor street',
      isMapPinDropped: true,
    };

    newLocationObj = {
      agencyId,
      streetAddress: '547,Alabama',
      city: 'Alabama',
      state: 'AL',
      zip: '94016',
      latitude: 34.0401465212326,
      longitude: -78.0749587334245,
      mapZoomLevel: 12,
      parcelId: 1,
      isAgencyAddress: false,
      isCDBGEligible: true,
    };

    newLocation = {
      id: 1,
      agencyId,
      streetAddress: '547,Alabama',
      city: 'Alabama',
      state: 'AL',
      zip: '94016',
      latitude: 34.0401465212326,
      longitude: -78.0749587334245,
      mapZoomLevel: 12,
      parcelId: 1,
      isAgencyAddress: false,
      isCDBGEligible: true,
    };

    response = {
      id: 17,
      streetAddress: '547,Alabama',
      city: 'Alabama',
      state: 'AL',
      zip: '94016',
      latitude: 34.0401465212326,
      longitude: -78.0749587334245,
      parcelId: 22,
      manualFields: {
        Ward: 'Ward I',
        Lot: 23,
        Block: 1,
      },
      parcelFields: {},
      flagHistory: [
        {
          id: 22,
          isFlagged: true,
          reasonForFlagging: 'Test reason for flagging',
          updatedBy: caseUser,
          updatedAt: new Date('2019-02-16T06:29:32.814Z'),
        },
      ],
      isCDBGApproved: true,
      parcel: null,
      apn: '1234321',
      assessorAddress: 'Assessor street',
      isMapPinDropped: true,
      associatedCases: {
        openCases: 2,
        closedCases: 3,
      },
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should create new location', async () => {
    sandbox
      .stub(LocationService.prototype, 'createLocationObj')
      .withArgs(agencyId, caseLocationReq)
      .returns(newLocationObj);

    sandbox
      .stub(db.AgencyLocation, 'create')
      .withArgs(newLocationObj, {
        transaction,
      })
      .resolves(newLocation);

    sandbox
      .stub(LocationService.prototype, 'createLocationRespObj')
      .withArgs(newLocation)
      .returns(response);

    result = await (locationService as any).createNewLocation(
      agencyId,
      caseLocationReq,
      transaction
    );

    expect(result).to.deep.equal(response, 'response did not match');
  });

  it('should throw InternalServerError while creating location', async () => {
    sandbox
      .stub(LocationService.prototype, 'createLocationObj')
      .withArgs(agencyId, caseLocationReq)
      .returns(newLocationObj);

    sandbox
      .stub(db.AgencyLocation, 'create')
      .withArgs(newLocationObj, {
        transaction,
      })
      .throws('Error');

    sandbox
      .stub(LocationService.prototype, 'createLocationRespObj')
      .withArgs(newLocation)
      .returns(response);

    result = await (locationService as any)
      .createNewLocation(agencyId, caseLocationReq, transaction)
      .catch(err => expect(err.name).to.deep.equal('InternalServerError'));
  });

  it('should throw DBConflictError while creating location', async () => {
    sandbox
      .stub(LocationService.prototype, 'createLocationObj')
      .withArgs(agencyId, caseLocationReq)
      .returns(newLocationObj);

    sandbox
      .stub(db.AgencyLocation, 'create')
      .withArgs(newLocationObj, {
        transaction,
      })
      .throws({ name: 'SequelizeUniqueConstraintError' });

    sandbox
      .stub(LocationService.prototype, 'createLocationRespObj')
      .withArgs(newLocation)
      .returns(response);

    result = await (locationService as any)
      .createNewLocation(agencyId, caseLocationReq, transaction)
      .catch(err => expect(err.name).to.deep.equal('DBConflictError'));
  });
});

describe('Location Service: addLocationFlagHistory Method', () => {
  let sandbox;
  let result;
  let caseLocationReq: ICaseLocationRequest;
  let newFlagAddressObj: ILocationFlagHistoryAttributes;
  let newFlagAddress;
  let transaction;
  let caseUser: ICaseUser;
  const agencyId = 1;
  const locationId = 1;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    transaction = sinon.stub();

    caseUser = {
      id: 4,
      firstName: 'John',
      lastName: 'Doe',
    };

    caseLocationReq = {
      streetAddress: '547,Alabama',
      city: 'Alabama',
      state: 'AL',
      zip: '94016',
      latitude: 34.0401465212326,
      longitude: -78.0749587334245,
      parcelId: 1,
      flagAddress: {
        isFlagged: true,
        reasonForFlagging: 'Test reason for flagging',
      },
      isCDBGEligible: true,
      isCDBGApproved: true,
      parcelFields: {},
      manualFields: {
        Ward: 'Ward I',
        Lot: 23,
        Block: 1,
      },
      apn: '1234321',
      assessorAddress: 'Assessor street',
      isMapPinDropped: true,
    };

    newFlagAddressObj = {
      agencyId,
      agencyLocationId: locationId,
      isFlagged: caseLocationReq.flagAddress.isFlagged,
      reason: caseLocationReq.flagAddress.reasonForFlagging,
      createdBy: caseUser.id,
      updatedBy: caseUser.id,
      createdAt: new Date('2019-02-16T06:29:32.814Z'),
      updatedAt: new Date('2019-02-16T06:29:32.814Z'),
    };

    newFlagAddress = {
      id: 24,
      agencyId,
      agencyLocationId: locationId,
      isFlagged: caseLocationReq.flagAddress.isFlagged,
      reason: caseLocationReq.flagAddress.reasonForFlagging,
      createdBy: caseUser.id,
      updatedBy: caseUser.id,
      createdAt: new Date('2019-02-16T06:29:32.814Z'),
      updatedAt: new Date('2019-02-16T06:29:32.814Z'),
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should create new location', async () => {
    sandbox
      .stub(LocationService.prototype, 'createLocationFlagHistoryObj')
      .returns(newFlagAddressObj);

    sandbox.stub(db.LocationFlagHistory, 'create').resolves(newFlagAddress);

    result = await (locationService as any).addLocationFlagHistory(
      agencyId,
      caseLocationReq,
      transaction
    );

    expect(result).to.deep.equal(newFlagAddress, 'response did not match');
  });

  it('should throw DBConflictError while creating flag history', async () => {
    sandbox
      .stub(LocationService.prototype, 'createLocationFlagHistoryObj')
      .returns(newFlagAddressObj);

    sandbox
      .stub(db.LocationFlagHistory, 'create')
      .throws({ name: 'SequelizeUniqueConstraintError' });

    result = await (locationService as any)
      .addLocationFlagHistory(agencyId, caseLocationReq, transaction)
      .catch(err => {
        expect(err.name).to.deep.equal('DBConflictError');
        expect(err.message).to.deep.equal(
          'Locationflag history  exists already.'
        );
      });
  });

  it('should throw InternalServerError while creating flag history', async () => {
    sandbox
      .stub(LocationService.prototype, 'createLocationFlagHistoryObj')
      .returns(newFlagAddressObj);

    sandbox.stub(db.LocationFlagHistory, 'create').throws({ name: 'Error' });

    result = await (locationService as any)
      .addLocationFlagHistory(agencyId, caseLocationReq, transaction)
      .catch(err => {
        expect(err.name).to.deep.equal('InternalServerError');
      });
  });
});

describe('Location Service: validateCDBGApproval Method', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('Should validate the CDBG Approval', () => {
    new LocationService().validateCDBGApproval(true, true);
  });

  /*
  it('Should throw InvalidRequestError', () => {
    new LocationService().validateCDBGApproval(false, true)
      .catch(err => expect(err.name).to.deep.equal('InvalidRequestError'));
  });
  */
});

describe('Location Service: validateLocationCustomFieldsCreateReq Method', () => {
  let sandbox;
  let configLocationFields: {
    configManualFields: ILocationField[];
    configParcelFields: ILocationField[];
  };
  let configParcelFields: ILocationField[] = [];
  const agencyId = 1;
  let manualFields: object;
  let parcelFields: object;
  let manualMandatoryFields: ILocationField[] = [];

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    manualFields = {
      '101': '13B, Baker Street',
    };

    parcelFields = {
      '102': 111,
    };

    configParcelFields = [
      {
        id: 102,
        label: 'GID',
        type: null,
        locationFieldType: LocationFieldType.PARCEL_FILE,
        options: [],
        isActive: true,
        isMandatory: false,
        parcelField: 'gid',
        sequence: 1,
      },
    ];

    manualMandatoryFields = [
      {
        id: 101,
        label: 'Street No',
        type: CustomFieldType.TEXT,
        locationFieldType: LocationFieldType.MANUAL,
        options: [],
        isActive: true,
        isMandatory: true,
        parcelField: null,
        sequence: 1,
      },
    ];

    configLocationFields = {
      configManualFields: manualMandatoryFields,
      configParcelFields,
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should validate the location custom fields', async () => {
    sandbox
      .stub(
        LocationService.prototype,
        'fetchManualandParcelLocationCustomFields'
      )
      .withArgs(agencyId)
      .resolves(configLocationFields);

    sandbox
      .stub(
        CustomSectionValidationUtil.prototype,
        'validateMandatoryFieldValues'
      )
      .withArgs(manualMandatoryFields, manualFields);

    await new LocationService()
      .validateLocationCustomFieldsCreateReq(
        agencyId,
        manualFields,
        parcelFields
      )
      .catch(err => expect(err.name).to.deep.equal('InternalServerError'));
  });

  it('should throw error if there are manual fields but nothing is configured', async () => {
    manualFields = { ...manualFields };
    delete manualFields['Street No'];
    manualFields['Address Line 2'] = '12B, Bake Street';
    configLocationFields.configManualFields = [];
    sandbox
      .stub(
        LocationService.prototype,
        'fetchManualandParcelLocationCustomFields'
      )
      .withArgs(agencyId)
      .resolves(configLocationFields);

    await new LocationService()
      .validateLocationCustomFieldsCreateReq(
        agencyId,
        manualFields,
        parcelFields
      )
      .catch(err => {
        expect(err.name).to.deep.equal('InvalidRequestError');
        expect(err.message).to.deep.equal(
          'Invalid Request. Config manual fields received are incorrect'
        );
      });
  });

  it('should throw error if mandatory manual field does not exist', async () => {
    manualFields = { ...manualFields };
    delete manualFields['Street No'];
    manualFields['Address Line 2'] = '12B, Bake Street';

    sandbox
      .stub(
        LocationService.prototype,
        'fetchManualandParcelLocationCustomFields'
      )
      .withArgs(agencyId)
      .resolves(configLocationFields);

    sandbox
      .stub(
        CustomSectionValidationUtil.prototype,
        'validateMandatoryFieldValues'
      )
      .withArgs(manualMandatoryFields, manualFields);

    await new LocationService()
      .validateLocationCustomFieldsCreateReq(
        agencyId,
        manualFields,
        parcelFields
      )
      .catch(err => expect(err.name).to.deep.equal('InvalidRequestError'));
  });

  it('should throw error if parcel field exist but is not configured', async () => {
    configLocationFields.configParcelFields[0].locationFieldType =
      LocationFieldType.MANUAL;

    sandbox
      .stub(
        LocationService.prototype,
        'fetchManualandParcelLocationCustomFields'
      )
      .withArgs(agencyId)
      .resolves(configLocationFields);

    await new LocationService()
      .validateLocationCustomFieldsCreateReq(
        agencyId,
        manualFields,
        parcelFields
      )
      .catch(err => {
        expect(err.name).to.deep.equal('InvalidRequestError');
        expect(err.message).to.deep.equal(
          'Parcel Location fields are inactive or does not exist'
        );
      });
  });

  it('should throw error if manual field is invalid', async () => {
    manualFields['150'] = '12.12';

    sandbox
      .stub(
        LocationService.prototype,
        'fetchManualandParcelLocationCustomFields'
      )
      .withArgs(agencyId)
      .resolves(configLocationFields);

    await new LocationService()
      .validateLocationCustomFieldsCreateReq(
        agencyId,
        manualFields,
        parcelFields
      )
      .catch(err => {
        expect(err.name).to.deep.equal('InvalidRequestError');
        expect(err.message).to.deep.equal(
          'Invalid Request. Config manual fields received are incorrect'
        );
      });
  });

  it('should throw error if parcel field is invalid', async () => {
    parcelFields['124'] = '12';

    sandbox
      .stub(
        LocationService.prototype,
        'fetchManualandParcelLocationCustomFields'
      )
      .withArgs(agencyId)
      .resolves(configLocationFields);

    await new LocationService()
      .validateLocationCustomFieldsCreateReq(
        agencyId,
        manualFields,
        parcelFields
      )
      .catch(err => {
        expect(err.name).to.deep.equal('InvalidRequestError');
        expect(err.message).to.deep.equal(
          'Invalid Request. Config parcel fields received are incorrect'
        );
      });
  });
});

describe('Location Service: createLocationFlagHistoryObj Method', () => {
  let sandbox;
  const agencyId = 1;
  const locationId = 11;
  const createdBy = 4;
  const isFlagged = true;
  const reasonForFlagging = 'Test reason for flagging';

  const flagHistoryObj: ILocationFlagHistoryAttributes = {
    agencyId,
    agencyLocationId: locationId,
    isFlagged,
    reason: reasonForFlagging,
    createdBy,
    updatedBy: createdBy,
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should create location flag history object', () => {
    const result = (locationService as any).__proto__.createLocationFlagHistoryObj(
      agencyId,
      locationId,
      createdBy,
      isFlagged,
      reasonForFlagging
    );

    expect(result).to.deep.equal(flagHistoryObj, 'response body did not match');
  });
});

describe('Location Service: getFlagHistory Method', () => {
  let sandbox;
  let locationFlagHistoryObj;
  let locationFlagHistory: ILocationFlagHistory[] = [];
  let caseUser: ICaseUser;
  const agencyId = 1;
  const locationId = 11;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    caseUser = {
      id: 4,
      firstName: 'John',
      lastName: 'Doe',
    };

    locationFlagHistoryObj = [
      {
        id: 22,
        isFlagged: true,
        reason: 'Test reason for flagging',
        createdByUser: caseUser,
        createdAt: new Date('2019-02-16T06:29:32.814Z'),
      },
      {
        id: 23,
        isFlagged: false,
        reason: 'Test reason for flagging',
        createdByUser: caseUser,
        createdAt: new Date('2019-02-16T06:29:32.814Z'),
      },
    ];

    locationFlagHistory = [
      {
        id: 22,
        isFlagged: true,
        reasonForFlagging: 'Test reason for flagging',
        updatedBy: caseUser,
        updatedAt: new Date('2019-02-16T06:29:32.814Z'),
      },
      {
        id: 23,
        isFlagged: false,
        reasonForFlagging: 'Test reason for flagging',
        updatedBy: caseUser,
        updatedAt: new Date('2019-02-16T06:29:32.814Z'),
      },
    ];
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return the location flag history', async () => {
    sandbox
      .stub(db.LocationFlagHistory, 'findAll')
      .resolves(locationFlagHistoryObj);

    const result = await new LocationService().getFlagHistory(
      agencyId,
      locationId
    );

    expect(result).to.deep.equal(locationFlagHistory);
  });

  it('should return empty array', async () => {
    locationFlagHistoryObj = [];
    locationFlagHistory = [];
    sandbox
      .stub(db.LocationFlagHistory, 'findAll')
      .resolves(locationFlagHistoryObj);

    const result = await new LocationService().getFlagHistory(
      agencyId,
      locationId
    );

    expect(result).to.deep.equal(locationFlagHistory);
  });

  it('should throw error while fetching history', async () => {
    sandbox.stub(db.LocationFlagHistory, 'findAll').throws('Error');

    await new LocationService()
      .getFlagHistory(agencyId, locationId)
      .catch(err => expect(err.name).to.equal('InternalServerError'));
  });
});

describe('Location Service: validateParcelId Method', () => {
  let sandbox;
  let parcels;
  const agencyId = 1;
  const parcelId = 11;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    parcels = [
      {
        gid: 11,
        apn: '111A011H2',
        site_address: '620 Wyoming Springs',
        site_city: 'Austin',
        site_state: 'TX',
        site_zip: '11A23',
        owner_address: '720 East Springs',
        owner_city: 'Round Rock',
        owner_state: 'TX',
        owner_zip: '11A24',
        owner_name: 'Jordan',
        is_owner_business: true,
        shape_length: 12.1212,
        shape_area: 121.2121,
      },
    ];
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return the parcel detail', async () => {
    sandbox.stub(db.sequelize, 'query').resolves(parcels);

    const result = await (locationService as any).__proto__.validateParcelId(
      agencyId,
      parcelId
    );

    expect(result).to.deep.equal(true);
  });

  it('should return empty array', async () => {
    parcels = [];
    sandbox.stub(db.sequelize, 'query').resolves(parcels);

    await (locationService as any).__proto__
      .validateParcelId(agencyId, parcelId)
      .catch(err => expect(err.name).to.equal('InvalidRequestError'));
  });

  it('should throw error while fetching parcel', async () => {
    sandbox.stub(db.sequelize, 'query').throws('Error');

    await (locationService as any).__proto__
      .validateParcelId(agencyId, parcelId)
      .catch(err => expect(err.name).to.equal('InternalServerError'));
  });
});

describe('Location Service: get Method', () => {
  let sandbox;
  const agencyId = 1;
  const locationId = 2;
  let responseObj: ICaseLocation;
  let location;
  let caseUser;
  let xerceCases;
  let locationFlagHistory;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    caseUser = {
      id: 5,
      firstName: 'John',
      lastName: 'Doe',
    };

    locationFlagHistory = [
      {
        id: 22,
        isFlagged: true,
        reasonForFlagging: 'Test reason for flagging',
        updatedBy: caseUser,
        updatedAt: new Date('2019-02-16T06:29:32.814Z'),
      },
    ];

    xerceCases = {
      id: 5,
      agencyId,
      assigneeId: caseUser.id,
      agencyLocationId: 17,
      caseNumber: 'CE-19-1',
      issueDescription: 'Test Issue Desc.',
      status: XerceCaseStatus.OPEN,
      customCaseFieldValues: [],
      customForcedAbatementFieldValues: [],
      locationManualFields: {
        Ward: 'Ward I',
        Lot: 23,
        Block: 1,
      },
      locationParcelFields: {},
      isCDBGApproved: true,
      createdBy: 1,
      updatedBy: 2,
      closedBy: 3,
      createdAt: new Date('2019-02-16T06:29:32.814Z'),
      updatedAt: new Date('2019-02-16T06:29:32.814Z'),
      closedAt: new Date('2019-02-16T06:29:32.814Z'),
      caseLocation: {
        id: 17,
        agencyId,
        streetAddress: '547,Alabama',
        city: 'Alabama',
        state: 'AL',
        zip: '94016',
        latitude: 34.0401465212326,
        longitude: -78.0749587334245,
        mapZoomLevel: 12,
        parcelId: 22,
        isAgencyAddress: true,
        isCDBGEligible: false,
      },
    };

    responseObj = {
      id: 17,
      streetAddress: '547,Alabama',
      city: 'Alabama',
      state: 'AL',
      zip: '94016',
      latitude: 34.0401465212326,
      longitude: -78.0749587334245,
      parcelId: 22,
      manualFields: {
        Ward: 'Ward I',
        Lot: 23,
        Block: 1,
      },
      parcelFields: {},
      flagHistory: [
        {
          id: 22,
          isFlagged: true,
          reasonForFlagging: 'Test reason for flagging',
          updatedBy: caseUser,
          updatedAt: new Date('2019-02-16T06:29:32.814Z'),
        },
      ],
      isCDBGApproved: true,
      parcel: null,
      apn: '1234321',
      assessorAddress: 'Assessor street',
      isMapPinDropped: true,
      associatedCases: {
        openCases: 2,
        closedCases: 3,
      },
    };

    location = {
      id: locationId,
      agencyId,
      streetAddress: '547,Alabama',
      latitude: 34.0401465212326,
      longitude: -78.0749587334245,
      mapZoomLevel: 5,
      city: 'Alabama',
      state: 'AL',
      zip: '94016',
      parcelId: 22,
      isAgencyAddress: false,
      isCDBGEligible: false,
      xerceCases,
      locationFlagHistory,
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('Should search and return location', async () => {
    sandbox
      .stub(db.AgencyLocation, 'findOne')
      .withArgs({
        where: { agencyId, id: locationId },
      })
      .resolves(location);

    sandbox
      .stub(LocationService.prototype, 'createLocationRespObj')
      .withArgs(location)
      .returns(responseObj);

    const result = await locationService.get(agencyId, locationId);

    expect(result).to.deep.equal(responseObj);
  });

  it('Should throws InternalServerError', async () => {
    sandbox
      .stub(db.AgencyLocation, 'findOne')
      .withArgs({
        where: { agencyId, id: locationId },
      })
      .throws({ name: 'InternalServerError' });

    await locationService.get(agencyId, locationId).catch(err => {
      expect(err.name).to.deep.equal('InternalServerError');
    });
  });

  it('Should throws DBMissingEntityError', async () => {
    sandbox
      .stub(db.AgencyLocation, 'findOne')
      .withArgs({
        where: { agencyId, id: locationId },
      })
      .resolves(null);

    await locationService.get(agencyId, locationId).catch(err => {
      expect(err.name).to.deep.equal('DBMissingEntityError');
    });
  });
});

describe('Location Service: getFlagHistoryByLocation Method', () => {
  let sandbox;
  const agencyId = 1;
  const location = 'alabama';
  let agencyLocation;
  let responseObj: ILocationFlagHistory[];

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    agencyLocation = {
      id: 1,
      agencyId,
      streetAddress: '547,Alabama',
      city: 'Alabama',
      state: 'AL',
      zip: '94016',
      latitude: 34.0401465212326,
      longitude: -78.0749587334245,
      mapZoomLevel: 12,
      parcelId: 1,
      isAgencyAddress: true,
      isCDBGEligible: true,
    };

    responseObj = [
      {
        id: 22,
        isFlagged: true,
        reasonForFlagging: 'Test reason for flagging',
        updatedBy: {
          id: 6,
          firstName: 'John',
          lastName: 'Doe',
        },
        updatedAt: new Date('2019-02-16T06:29:32.814Z'),
      },
    ];
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('Should search and return flag history', async () => {
    sandbox
      .stub(db.AgencyLocation, 'findOne')
      .withArgs({
        where: {
          agencyId,
          [db.Sequelize.Op.or]: [
            db.Sequelize.where(
              db.Sequelize.fn(
                'concat',
                db.Sequelize.col(`AgencyLocation.street_address`),
                db.Sequelize.col(`AgencyLocation.city`),
                db.Sequelize.col(`AgencyLocation.state`),
                db.Sequelize.col(`AgencyLocation.zip`)
              ),
              {
                ilike: location,
              }
            ),
          ],
        },
      })
      .resolves(agencyLocation);

    sandbox
      .stub(LocationService.prototype, 'getFlagHistory')
      .withArgs(agencyId, agencyLocation.id)
      .returns(responseObj);

    const result = await locationService.getFlagHistoryByLocation(
      agencyId,
      location
    );

    expect(result).to.deep.equal(responseObj);
  });

  it('Should search and return empty array', async () => {
    sandbox
      .stub(db.AgencyLocation, 'findOne')
      .withArgs({
        where: {
          agencyId,
          [db.Sequelize.Op.or]: [
            db.Sequelize.where(
              db.Sequelize.fn(
                'concat',
                db.Sequelize.col(`AgencyLocation.street_address`),
                db.Sequelize.col(`AgencyLocation.city`),
                db.Sequelize.col(`AgencyLocation.state`),
                db.Sequelize.col(`AgencyLocation.zip`)
              ),
              {
                ilike: location,
              }
            ),
          ],
        },
      })
      .resolves(null);

    const result = await locationService.getFlagHistoryByLocation(
      agencyId,
      location
    );

    expect(result).to.deep.equal([]);
  });

  it('Should throws InternalServerError', async () => {
    sandbox
      .stub(db.AgencyLocation, 'findOne')
      .withArgs({
        where: {
          agencyId,
          [db.Sequelize.Op.or]: [
            db.Sequelize.where(
              db.Sequelize.fn(
                'concat',
                db.Sequelize.col(`AgencyLocation.street_address`),
                db.Sequelize.col(`AgencyLocation.city`),
                db.Sequelize.col(`AgencyLocation.state`),
                db.Sequelize.col(`AgencyLocation.zip`)
              ),
              {
                ilike: location,
              }
            ),
          ],
        },
      })
      .throws({ name: 'InternalServerError' });

    await locationService
      .getFlagHistoryByLocation(agencyId, location)
      .catch(err => {
        expect(err.name).to.deep.equal('InternalServerError');
      });
  });
});

describe('Location Service: getCasesCountByLocation Method', () => {
  let sandbox;
  const agencyId = 1;
  const streetAddress = '14th';
  const city = 'Oakland';
  const state = 'CA';
  const zip = '946';
  const location = `${streetAddress}${city}${state}${zip}`;
  let responseObj: IXerceCaseCount;
  let cases;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    responseObj = {
      openCases: 1,
      closedCases: 2,
    };

    cases = [
      {
        id: 1,
        status: XerceCaseStatus.OPEN,
      },
      {
        id: 2,
        status: XerceCaseStatus.CLOSED,
      },
      {
        id: 3,
        status: XerceCaseStatus.CLOSED,
      },
    ];
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('Should search and return case count by location', async () => {
    sandbox
      .stub(db.XerceCase, 'findAll')
      .withArgs({
        where: { agencyId },
        attributes: ['id', 'status'],
        include: [
          {
            model: db.AgencyLocation,
            as: 'caseLocation',
            where: {
              agencyId,
              [db.Sequelize.Op.or]: [
                db.Sequelize.where(
                  db.Sequelize.fn(
                    'concat',
                    db.Sequelize.col(`caseLocation.street_address`),
                    db.Sequelize.col(`caseLocation.city`),
                    db.Sequelize.col(`caseLocation.state`),
                    db.Sequelize.col(`caseLocation.zip`)
                  ),
                  {
                    ilike: location,
                  }
                ),
              ],
            },
            attributes: ['id'],
          },
        ],
      })
      .resolves(cases);

    const result = await locationService.getCasesCountByLocation(
      agencyId,
      streetAddress,
      city,
      state,
      zip
    );

    expect(result).to.deep.equal(responseObj);
  });

  it('Should throws InternalServerError', async () => {
    sandbox
      .stub(db.XerceCase, 'findAll')
      .withArgs({
        where: { agencyId },
        attributes: ['id', 'status'],
        include: [
          {
            model: db.AgencyLocation,
            as: 'caseLocation',
            where: {
              agencyId,
              [db.Sequelize.Op.or]: [
                db.Sequelize.where(
                  db.Sequelize.fn(
                    'concat',
                    db.Sequelize.col(`caseLocation.street_address`),
                    db.Sequelize.col(`caseLocation.city`),
                    db.Sequelize.col(`caseLocation.state`),
                    db.Sequelize.col(`caseLocation.zip`)
                  ),
                  {
                    ilike: location,
                  }
                ),
              ],
            },
            attributes: ['id'],
          },
        ],
      })
      .throws({ name: 'InternalServerError' });

    await locationService
      .getCasesCountByLocation(agencyId, streetAddress, city, state, zip)
      .catch(err => {
        expect(err.name).to.deep.equal('InternalServerError');
      });
  });

  it('Should return 0 open and close cases', async () => {
    responseObj.openCases = 0;
    responseObj.closedCases = 0;

    sandbox
      .stub(db.XerceCase, 'findAll')
      .withArgs({
        where: { agencyId },
        attributes: ['id', 'status'],
        include: [
          {
            model: db.AgencyLocation,
            as: 'caseLocations',
            where: {
              [db.Sequelize.Op.or]: [
                db.Sequelize.where(
                  db.Sequelize.fn(
                    'concat',
                    db.Sequelize.col(`AgencyLocation.street_address`),
                    db.Sequelize.col(`AgencyLocation.city`),
                    db.Sequelize.col(`AgencyLocation.state`),
                    db.Sequelize.col(`AgencyLocation.zip`)
                  ),
                  {
                    ilike: location,
                  }
                ),
              ],
            },
            attributes: [],
            required: true,
          },
        ],
      })
      .resolves(null);

    const result = await locationService.getCasesCountByLocation(
      agencyId,
      streetAddress,
      city,
      state,
      zip
    );

    expect(result).to.deep.equal(responseObj);
  });
});

describe('Location Service: createLocationObj Method', () => {
  let sandbox;
  const agencyId = 1;
  let locationReq: ICaseLocationRequest;
  let responseObj: IAgencyLocationAttributes;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    locationReq = {
      streetAddress: '547,Alabama',
      city: 'Alabama',
      state: 'AL',
      zip: '94016',
      latitude: 34.0401465212326,
      longitude: -78.0749587334245,
      parcelId: 1,
      flagAddress: {
        isFlagged: true,
        reasonForFlagging: 'Test reason for flagging',
      },
      isCDBGEligible: true,
      isCDBGApproved: true,
      parcelFields: {},
      manualFields: {
        Ward: 'Ward I',
        Lot: 23,
        Block: 1,
      },
      apn: '1234321',
      assessorAddress: 'Assessor street',
      isMapPinDropped: true,
    };

    responseObj = {
      agencyId,
      streetAddress: '547,Alabama',
      city: 'Alabama',
      state: 'AL',
      zip: '94016',
      latitude: 34.0401465212326,
      longitude: -78.0749587334245,
      parcelId: 1,
      isCDBGEligible: true,
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should create location object', () => {
    const result = (locationService as any).__proto__.createLocationObj(
      agencyId,
      locationReq
    );

    expect(result).to.deep.equal(responseObj, 'response body did not match');
  });
});

describe('Location Service: createLocationFlagHistoryRespObj Method', () => {
  let sandbox;
  const agencyId = 1;
  let locationFlagHistory;
  let responseObj: ILocationFlagHistory;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    locationFlagHistory = {
      id: 22,
      agencyId,
      agencyLocationId: 5,
      isFlagged: true,
      reason: 'Test reason for flagging',
      createdBy: 5,
      updatedBy: 5,
      createdAt: new Date('2019-02-16T06:29:32.814Z'),
      updatedAt: new Date('2019-02-16T06:29:32.814Z'),
      createdByUser: {
        id: 5,
        firstName: 'John',
        lastName: 'Doe',
      },
    };

    responseObj = {
      id: 22,
      isFlagged: true,
      reasonForFlagging: 'Test reason for flagging',
      updatedBy: {
        id: 5,
        firstName: 'John',
        lastName: 'Doe',
      },
      updatedAt: new Date('2019-02-16T06:29:32.814Z'),
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should create location object', () => {
    const result = (locationService as any).__proto__.createLocationFlagHistoryRespObj(
      locationFlagHistory
    );

    expect(result).to.deep.equal(responseObj, 'response body did not match');
  });
});

describe('Location Service: createLocationRespObj Method', () => {
  let sandbox;
  const agencyId = 1;
  let newLocation;
  let parcel;
  let locationFlagHistory: ILocationFlagHistory[] = [];
  let manualFields;
  let parcelField;
  let responseObj: ICaseLocation;
  let associatedCases: IXerceCaseCount;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    newLocation = {
      id: 1,
      agencyId,
      streetAddress: '547,Alabama',
      city: 'Alabama',
      state: 'AL',
      zip: '94016',
      latitude: 34.0401465212326,
      longitude: -78.0749587334245,
      mapZoomLevel: 12,
      parcelId: 22,
      isAgencyAddress: false,
      isCDBGEligible: true,
    };

    locationFlagHistory = [
      {
        id: 22,
        isFlagged: true,
        reasonForFlagging: 'Test reason for flagging',
        updatedBy: {
          id: 5,
          firstName: 'John',
          lastName: 'Doe',
        },
        updatedAt: new Date('2019-02-16T06:29:32.814Z'),
      },
    ];

    manualFields = {
      Ward: 'Ward I',
      Lot: 23,
      Block: 1,
    };

    parcel = null;

    parcelField = {};

    associatedCases = {
      openCases: 2,
      closedCases: 3,
    };

    responseObj = {
      id: 1,
      streetAddress: '547,Alabama',
      city: 'Alabama',
      state: 'AL',
      zip: '94016',
      latitude: 34.0401465212326,
      longitude: -78.0749587334245,
      parcelId: 22,
      manualFields: {
        Ward: 'Ward I',
        Lot: 23,
        Block: 1,
      },
      apn: null,
      assessorAddress: null,
      isMapPinDropped: null,
      parcelFields: {},
      flagHistory: [
        {
          id: 22,
          isFlagged: true,
          reasonForFlagging: 'Test reason for flagging',
          updatedBy: {
            id: 5,
            firstName: 'John',
            lastName: 'Doe',
          },
          updatedAt: new Date('2019-02-16T06:29:32.814Z'),
        },
      ],
      isCDBGApproved: true,
      parcel: null,
      associatedCases,
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should create location object', () => {
    const result = (locationService as any).__proto__.createLocationRespObj(
      newLocation,
      parcel,
      locationFlagHistory,
      true,
      manualFields,
      parcelField,
      associatedCases
    );

    expect(result).to.deep.equal(responseObj, 'response body did not match');
  });
});

describe('Location Service: fetchManualandParcelLocationCustomFields Method', () => {
  let sandbox;
  const agencyId = 1;
  const configLocationFields = [
    {
      id: 1,
      label: 'Ward',
      type: 'PICKLIST',
      locationFieldType: LocationFieldType.MANUAL,
      options: ['Ward I', 'Ward II', 'Ward III', 'Ward IV'],
      isActive: true,
      isMandatory: true,
      parcelField: null,
      sequence: 1,
    },
    {
      id: 2,
      label: 'Lot',
      type: 'NUMBER',
      locationFieldType: LocationFieldType.MANUAL,
      options: [],
      isActive: true,
      isMandatory: true,
      parcelField: null,
      sequence: 2,
    },
    {
      id: 3,
      label: 'Block',
      type: 'NUMBER',
      locationFieldType: LocationFieldType.MANUAL,
      options: [],
      isActive: true,
      isMandatory: true,
      parcelField: null,
      sequence: 3,
    },
    {
      id: 10,
      label: 'Date',
      type: 'DATE',
      locationFieldType: LocationFieldType.PARCEL_FILE,
      options: [],
      isActive: true,
      isMandatory: false,
      parcelField: null,
      sequence: 4,
    },
  ];
  const responseFields = {
    configManualFields: [
      {
        id: 1,
        label: 'Ward',
        type: 'PICKLIST',
        locationFieldType: LocationFieldType.MANUAL,
        options: ['Ward I', 'Ward II', 'Ward III', 'Ward IV'],
        isActive: true,
        isMandatory: true,
        parcelField: null,
        sequence: 1,
      },
      {
        id: 2,
        label: 'Lot',
        type: 'NUMBER',
        locationFieldType: LocationFieldType.MANUAL,
        options: [],
        isActive: true,
        isMandatory: true,
        parcelField: null,
        sequence: 2,
      },
      {
        id: 3,
        label: 'Block',
        type: 'NUMBER',
        locationFieldType: LocationFieldType.MANUAL,
        options: [],
        isActive: true,
        isMandatory: true,
        parcelField: null,
        sequence: 3,
      },
    ],
    configParcelFields: [
      {
        id: 10,
        label: 'Date',
        type: 'DATE',
        locationFieldType: LocationFieldType.PARCEL_FILE,
        options: [],
        isActive: true,
        isMandatory: false,
        parcelField: null,
        sequence: 4,
      },
    ],
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should fetch all Location Fields', async () => {
    sandbox
      .stub(LocationFieldService.prototype, 'getAll')
      .withArgs(agencyId, ObjectStatus.ACTIVE, null)
      .resolves(configLocationFields);

    const result = await LocationService.prototype.fetchManualandParcelLocationCustomFields(
      agencyId
    );

    expect(result).to.deep.equal(responseFields, 'response body did not match');
  });
});
