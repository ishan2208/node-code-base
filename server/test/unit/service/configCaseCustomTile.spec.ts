import { expect } from 'chai';
import 'mocha';
import * as sinon from 'sinon';

import db from '../../../api/models';
import ConfigCaseCustomTileService from '../../../api/service/agencySetup/configCaseCustomTile';

describe('ConfigCaseCustomTile Service: getActiveCaseCustomTiles Method', () => {
  let sandbox;
  const agecyId = 1;
  let activeConfigCaseTiles: ICaseCustomTile[] = [];

  beforeEach(() => {
    sandbox = sinon.createSandbox();
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

  it('should fetch all the active config case custom tiles', async () => {
    sandbox
      .stub(db.ConfigCaseCustomTile, 'findAll')
      .resolves(activeConfigCaseTiles);

    const result = await new ConfigCaseCustomTileService().getActiveCaseCustomTiles(
      agecyId
    );

    expect(result).to.be.deep.equal(activeConfigCaseTiles);
  });
});
