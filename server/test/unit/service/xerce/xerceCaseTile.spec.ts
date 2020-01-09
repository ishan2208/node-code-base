import { expect } from 'chai';
import 'mocha';
import * as sinon from 'sinon';

//import db from '../../../../api/models';
import ConfigCaseCustomTileService from '../../../../api/service/agencySetup/configCaseCustomTile';
import XerceCaseTileService from '../../../../api/service/xerce/xerceCaseTile';

/*describe('XerceCaseTile Service: edit Method', () => {
  let sandbox;
  const agencyId = 1;
  const caseId = 11;
  let editCaseTileReq: ICaseCustomEditTile;
  let updateResponse;
  let caseResponse;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    editCaseTileReq = {
      customCaseFieldValues: [
        {
          'Property Lien': {
            'Start Date': '2018-08-30',
            'End Date': '2022-09-30',
            'Property Lien Type': 'Short Term',
            'Property Lien By': 'Mr. john Doe',
          },
        },
      ],
    };

    caseResponse = {
      agencyId,
      assigneeId: 1,
      agencyLocationId: 1,
      status: XerceCaseStatus.OPEN,
      customCaseFieldValues: editCaseTileReq.customCaseFieldValues,
      closedAt: null,
      caseNumber: 'CE-19-1',
      issueDescription: null,
      locationManualFields: {},
      locationParcelFields: {},
      isCDBGApproved: true,
      createdBy: 1,
      updatedBy: 1,
    };

    updateResponse = [1, [caseResponse]];
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should validate the xerce case custom tiles', async () => {
    sandbox
      .stub(XerceCaseTileService.prototype, 'validateEditRequest')
      .resolves();

    sandbox.stub(db.XerceCase, 'update').resolves(updateResponse);

    const result = await new XerceCaseTileService().edit(
      agencyId,
      caseId,
      editCaseTileReq
    );

    expect(result).to.deep.equal(caseResponse.customCaseFieldValues);
  });

  it('should throw error while editing xerce case custom tile', async () => {
    sandbox
      .stub(XerceCaseTileService.prototype, 'validateEditRequest')
      .resolves();

    sandbox.stub(db.XerceCase, 'update').throws('Error');

    await new XerceCaseTileService()
      .edit(agencyId, caseId, editCaseTileReq)
      .catch(err => expect(err.name).to.deep.equal('InternalServerError'));
  });
});
*/

describe('XerceCaseTile Service: validateCreateCaseCustomTileReq Method', () => {
  let sandbox;
  const agencyId = 1;
  let editCaseTileReq: ICaseCustomEditTile;
  let activeConfigCaseTiles: ICaseCustomTile[] = [];

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    editCaseTileReq = {
      customCaseFieldValues: [
        {
          '11': {
            '111': '2018-08-30',
            '112': '2022-09-30',
            '113': 'Short Term',
            '114': 'Mr. john Doe',
          },
        },
      ],
    };

    activeConfigCaseTiles = [
      {
        id: 11,
        label: 'Property Lien',
        isActive: true,
        caseCustomFields: [
          {
            id: 111,
            label: 'Start Date',
            isActive: true,
            isMergeField: true,
            type: CustomFieldType.TEXT,
            options: [],
            sequence: 1,
          },
          {
            id: 112,
            label: 'End Date',
            isActive: true,
            isMergeField: true,
            type: CustomFieldType.TEXT,
            options: [],
            sequence: 1,
          },
          {
            id: 113,
            label: 'Property Lien Type',
            isActive: true,
            isMergeField: true,
            type: CustomFieldType.TEXT,
            options: [],
            sequence: 1,
          },
          {
            id: 114,
            label: 'Property Lien By',
            isActive: true,
            isMergeField: true,
            type: CustomFieldType.TEXT,
            options: [],
            sequence: 1,
          },
        ],
      },
    ];
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should validate the custom case tile values', async () => {
    sandbox
      .stub(ConfigCaseCustomTileService.prototype, 'getActiveCaseCustomTiles')
      .withArgs(agencyId)
      .resolves(activeConfigCaseTiles);

    await new XerceCaseTileService()
      .validateCreateCaseCustomTileReq(
        agencyId,
        editCaseTileReq.customCaseFieldValues
      )
      .catch(err => expect(err.name).to.be.equal('Error'));
  });

  it('should throw error for invalid custom tile label', async () => {
    activeConfigCaseTiles[0] = { ...activeConfigCaseTiles[0], label: 'ABC' };

    sandbox
      .stub(ConfigCaseCustomTileService.prototype, 'getActiveCaseCustomTiles')
      .withArgs(agencyId)
      .resolves(activeConfigCaseTiles);

    await new XerceCaseTileService()
      .validateCreateCaseCustomTileReq(
        agencyId,
        editCaseTileReq.customCaseFieldValues
      )
      .catch(err => expect(err.name).to.be.equal('InvalidRequestError'));
  });

  it('should throw error for invalid custom tile field value', async () => {
    activeConfigCaseTiles[0].caseCustomFields[0] = {
      ...activeConfigCaseTiles[0].caseCustomFields[0],
      label: 'XYZ',
    };

    sandbox
      .stub(ConfigCaseCustomTileService.prototype, 'getActiveCaseCustomTiles')
      .withArgs(agencyId)
      .resolves(activeConfigCaseTiles);

    await new XerceCaseTileService()
      .validateCreateCaseCustomTileReq(
        agencyId,
        editCaseTileReq.customCaseFieldValues
      )
      .catch(err => expect(err.name).to.be.equal('InvalidRequestError'));
  });
});

/*
describe('XerceCaseTile Service: validate Method', () => {
  let sandbox;
  const agencyId = 1;
  let editCaseTileReq: ICaseCustomEditTile;
  let activeConfigCaseTiles: ICaseCustomTile[] = [];

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    editCaseTileReq = {
      customCaseFieldValues: [
        {
          '11': {
            '111': '2018-08-30',
            '112': '2022-09-30',
            '113': 'Short Term',
            '114': 'Mr. john Doe',
          },
        },
      ],
    };

    activeConfigCaseTiles = [
      {
        id: 11,
        label: 'Property Lien',
        isActive: true,
        caseCustomFields: [
          {
            id: 111,
            label: 'Start Date',
            isActive: true,
            isMergeField: true,
            type: CustomFieldType.TEXT,
            options: [],
            sequence: 1,
          },
          {
            id: 112,
            label: 'End Date',
            isActive: true,
            isMergeField: true,
            type: CustomFieldType.TEXT,
            options: [],
            sequence: 1,
          },
          {
            id: 113,
            label: 'Property Lien Type',
            isActive: true,
            isMergeField: true,
            type: CustomFieldType.TEXT,
            options: [],
            sequence: 1,
          },
          {
            id: 114,
            label: 'Property Lien By',
            isActive: true,
            isMergeField: true,
            type: CustomFieldType.TEXT,
            options: [],
            sequence: 1,
          },
        ],
      },
    ];
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should validate the custom case tile values', async () => {
    sandbox
      .stub(ConfigCaseCustomTileService.prototype, 'getActiveCaseCustomTiles')
      .withArgs(agencyId)
      .resolves(activeConfigCaseTiles);

    await new XerceCaseTileService()
      .validate(agencyId, editCaseTileReq.customCaseFieldValues)
      .catch(err => expect(err.name).to.be.equal('Error'));
  });

  it('should throw error for invalid custom tile label', async () => {
    activeConfigCaseTiles[0] = { ...activeConfigCaseTiles[0], label: 'ABC' };

    sandbox
      .stub(ConfigCaseCustomTileService.prototype, 'getActiveCaseCustomTiles')
      .withArgs(agencyId)
      .resolves(activeConfigCaseTiles);

    await new XerceCaseTileService()
      .validate(agencyId, editCaseTileReq.customCaseFieldValues)
      .catch(err => expect(err.name).to.be.equal('InvalidRequestError'));
  });

  it('should throw error for invalid custom tile field value', async () => {
    activeConfigCaseTiles[0].caseCustomFields[0] = {
      ...activeConfigCaseTiles[0].caseCustomFields[0],
      label: 'XYZ',
    };

    sandbox
      .stub(ConfigCaseCustomTileService.prototype, 'getActiveCaseCustomTiles')
      .withArgs(agencyId)
      .resolves(activeConfigCaseTiles);

    await new XerceCaseTileService()
      .validate(agencyId, editCaseTileReq.customCaseFieldValues)
      .catch(err => expect(err.name).to.be.equal('InvalidRequestError'));
  });
});
*/
