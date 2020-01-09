import { expect } from 'chai';
import 'mocha';
import * as sinon from 'sinon';

import db from '../../../../../api/models';
import LocationService from '../../../../../api/service/caseLocation';
import { resolveFields } from '../../../../../api/service/mergeCode/fields/location';

describe('LocationFields Service: resolveFields method', () => {
  let sandbox;
  const agencyId = 1;
  const caseId = 1;
  let xerceCase;
  let configNoticeForm;
  let parcels;

  const resolvedFields = {
    '{{case_location_address}}': '12B Baker St, Manchester, London, 12345',
    '{{case_apn}}': '111A011H2',
    '{{case_flagged_address}}': '12B Baker St, Manchester, London, 12345',
    '{{flagged_address_reason}}': 'Gun',
    '{{loc_cf_2}}': '2019-07-16',
    '{{loc_cf_21}}': '2019-07-16',
    '{{loc_cf_31}}': '{{loc_cf_31}}',
  };

  const authScope = {
    comcateAdmin: true,
    siteAdmin: true,
  };

  const locationCustomFields = {
    configManualFields: [
      {
        id: 1,
        label: 'Ward',
        type: 'PICKLIST',
        locationFieldType: 'MANUAL',
        options: ['Ward I', 'Ward II', 'Ward III', 'Ward IV'],
        isActive: true,
        isMandatory: true,
        parcelField: null,
        sequence: 1,
      },
      {
        id: 10,
        label: 'Lot',
        type: 'NUMBER',
        locationFieldType: 'MANUAL',
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
        locationFieldType: 'MANUAL',
        options: [],
        isActive: true,
        isMandatory: true,
        parcelField: null,
        sequence: 3,
      },
      {
        id: 2,
        label: 'Date',
        type: 'DATE',
        locationFieldType: 'MANUAL',
        options: [],
        isActive: true,
        isMandatory: false,
        parcelField: null,
        sequence: 4,
      },
    ],
    configParcelFields: [
      {
        id: 21,
        label: 'Date',
        type: 'DATE',
        locationFieldType: 'PARCEL',
        options: [],
        isActive: true,
        isMandatory: false,
        parcelField: null,
        sequence: 4,
      },
    ],
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

    xerceCase = {
      id: caseId,
      locationManualFields: {
        '2': '2019-07-16T06:29:32.814Z',
      },
      locationParcelFields: {
        '21': '2019-07-16T06:29:32.814Z',
      },
      caseLocation: {
        streetAddress: '12B Baker St',
        city: 'Manchester',
        state: 'London',
        zip: '12345',
        longitude: 12.32435456,
        latitude: 78.98678756,
        locationFlagHistory: [
          {
            isFlagged: true,
            reason: 'Gun',
          },
        ],
      },
    };

    configNoticeForm = {
      label: 'Final Notice',
      content: `{{case_location_address}}
        {{case_apn}}
        {{case_flagged_address}}
        {{flagged_address_reason}}
        {{loc_cf_2}}
        {{loc_cf_21}}
        {{loc_cf_31}}`,
      noticeType: NoticeType.HTML,
      isActive: true,
      mergeFields: {
        Location: {
          fields: [
            '{{case_location_address}}',
            '{{case_apn}}',
            '{{case_flagged_address}}',
            '{{flagged_address_reason}}',
            '{{loc_cf_2}}',
            '{{loc_cf_21}}',
            '{{loc_cf_31}}',
          ],
        },
      },
      mergeTables: null,
      headerSection: {
        label: 'Welcome Header',
        content: `{{case_apn}}`,
        sectionType: NoticeFormSectionType.HEADER,
        isActive: true,
        mergeFields: {
          Location: {
            fields: ['{{case_apn}}'],
          },
        },
      },
      footerSection: {
        label: 'Copyright Footer',
        content: `{{case_location_address}}`,
        sectionType: NoticeFormSectionType.HEADER,
        isActive: true,
        mergeFields: {
          Location: {
            fields: ['{{case_location_address}}'],
          },
        },
      },
    };

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

  it('should resolve all location merge fields', async () => {
    sandbox
      .stub(db.XerceCase, 'findOne')
      .withArgs({
        where: { id: caseId, agencyId },
        attributes: ['id', 'locationManualFields', 'locationParcelFields'],
        include: [
          {
            model: db.AgencyLocation,
            as: 'caseLocation',
            attributes: [
              'streetAddress',
              'city',
              'state',
              'zip',
              'longitude',
              'latitude',
            ],
            include: [
              {
                model: db.LocationFlagHistory,
                as: 'locationFlagHistory',
                attributes: ['isFlagged', 'reason'],
              },
            ],
          },
        ],
        order: [
          [
            {
              model: db.AgencyLocation,
              as: 'caseLocation',
            },
            { model: db.LocationFlagHistory, as: 'locationFlagHistory' },
            'createdAt',
            'desc',
          ],
        ],
      })
      .resolves(xerceCase);

    sandbox.stub(db.sequelize, 'query').resolves(parcels);

    sandbox
      .stub(
        LocationService.prototype,
        'fetchManualandParcelLocationCustomFields'
      )
      .withArgs(agencyId)
      .resolves(locationCustomFields);

    const result = await resolveFields(
      agencyId,
      caseId,
      configNoticeForm,
      null,
      userProfile
    );

    expect(resolvedFields).to.deep.equal(result);
  });

  it('should throw error for invalid case', async () => {
    xerceCase = null;
    sandbox
      .stub(db.XerceCase, 'findOne')
      .withArgs({
        where: { id: caseId, agencyId },
        attributes: ['id', 'locationManualFields', 'locationParcelFields'],
        include: [
          {
            model: db.AgencyLocation,
            as: 'caseLocation',
            attributes: [
              'streetAddress',
              'city',
              'state',
              'zip',
              'longitude',
              'latitude',
            ],
            include: [
              {
                model: db.LocationFlagHistory,
                as: 'locationFlagHistory',
                attributes: ['isFlagged', 'reason'],
              },
            ],
          },
        ],
        order: [
          [
            {
              model: db.AgencyLocation,
              as: 'caseLocation',
            },
            { model: db.LocationFlagHistory, as: 'locationFlagHistory' },
            'createdAt',
            'desc',
          ],
        ],
      })
      .resolves(xerceCase);

    sandbox.stub(db.sequelize, 'query').resolves(parcels);

    await resolveFields(
      agencyId,
      caseId,
      configNoticeForm,
      null,
      userProfile
    ).catch(err => expect(err.name).to.be.equal('InvalidRequestError'));
  });

  it('should throw error while resolving location merge fields', async () => {
    sandbox
      .stub(db.XerceCase, 'findOne')
      .withArgs({
        where: { id: caseId, agencyId },
        attributes: ['id', 'locationManualFields', 'locationParcelFields'],
        include: [
          {
            model: db.AgencyLocation,
            as: 'caseLocation',
            attributes: [
              'streetAddress',
              'city',
              'state',
              'zip',
              'longitude',
              'latitude',
            ],
            include: [
              {
                model: db.LocationFlagHistory,
                as: 'locationFlagHistory',
                attributes: ['isFlagged', 'reason'],
              },
            ],
          },
        ],
        order: [
          [
            {
              model: db.AgencyLocation,
              as: 'caseLocation',
            },
            { model: db.LocationFlagHistory, as: 'locationFlagHistory' },
            'createdAt',
            'desc',
          ],
        ],
      })
      .throws('Error');

    sandbox.stub(db.sequelize, 'query').resolves(parcels);

    await resolveFields(
      agencyId,
      caseId,
      configNoticeForm,
      null,
      userProfile
    ).catch(err => expect(err.name).to.equal('InternalServerError'));
  });

  it('should throw error while fetching apn merge field', async () => {
    sandbox
      .stub(db.XerceCase, 'findOne')
      .withArgs({
        where: { id: caseId, agencyId },
        attributes: ['id', 'locationManualFields', 'locationParcelFields'],
        include: [
          {
            model: db.AgencyLocation,
            as: 'caseLocation',
            attributes: [
              'streetAddress',
              'city',
              'state',
              'zip',
              'longitude',
              'latitude',
            ],
            include: [
              {
                model: db.LocationFlagHistory,
                as: 'locationFlagHistory',
                attributes: ['isFlagged', 'reason'],
              },
            ],
          },
        ],
        order: [
          [
            {
              model: db.AgencyLocation,
              as: 'caseLocation',
            },
            { model: db.LocationFlagHistory, as: 'locationFlagHistory' },
            'createdAt',
            'desc',
          ],
        ],
      })
      .resolves(xerceCase);

    sandbox.stub(db.sequelize, 'query').throws('Error');

    await resolveFields(
      agencyId,
      caseId,
      configNoticeForm,
      null,
      userProfile
    ).catch(err => expect(err.name).to.equal('InternalServerError'));
  });
});
