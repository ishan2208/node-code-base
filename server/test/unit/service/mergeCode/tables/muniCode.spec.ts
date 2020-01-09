import { expect } from 'chai';
import 'mocha';
import * as sinon from 'sinon';

import db from '../../../../../api/models';
import { resolveTables } from '../../../../../api/service/mergeCode/tables/muniCode';

describe('MuniCodeTables Service: resolveTables method', () => {
  let sandbox;
  const agencyId = 1;
  const caseId = 1;
  let configNoticeForm;
  let configXerceViolationsInstance;
  let resolvedCode;
  const uniqueViolationIds = [1];

  const uiMergeCodes: IGenerateNoticeUiCodes = {
    recipientIds: [111, 112],
    responsibleContactId: 111,
    attachments: [
      {
        fileURL:
          'https://cyberdyne-dev.s3.amazonaws.com/agency_1/cases/case_6919/attachments/Screenshot_1559038939090.png',
        title: 'Screenshot_1559038939090.png',
        uploadedBy: 'Janet Doe',
        uploadedAt: new Date('2019-02-16T06:29:32.814Z'),
      },
    ],
    openViolations: [
      {
        configViolationId: 1,
        entity: {
          '1': 'Red',
          '2': null,
          '3': 2,
          '4': null,
          Note: 'abc',
        },
      },
    ],
    resolutionActions: [
      {
        articleNumber: '6.30.010',
        description: 'Restraint of dogs.',
        resolution:
          'The owner or person with the right to the control of any dog(s) shall keep such dog(s) confined to his/their own premises or shall keep such dog(s) under physical restraint by means of a leash not to exceed six feet in length except: (a) Guide dogs for the blind or deaf while performing their duties; (b) Dogs participating in field or obedience trials or exhibitions; (c) Dogs assisting their owner/handler in legal hunting or in the herding of livestock; (d) Dogs assisting a security guard or assisting a peace officer engaged in law enforcement activities; (e) Dogs being trained for any of the above purposes on private land with permission of the landowner, so long as such dogs are under direct control of such individuals to assure that they do not violate any other provision of law. (Ord. 1424 § 3, 7-14-71. Formerly § 3-51).',
        complyByDate: '2019-02-16',
      },
    ],
    nextInspection: {
      plannedDate: new Date('2019-05-13T06:29:32.814Z'),
      assigneeId: 11,
    },
    caseAssigneeId: 11,
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

    resolvedCode = {
      '{{municode_description}}': `<table style='font-family:\"Arial\"; font-size:12px'  role='grid' border='1' cellspacing='0'><colgroup><thead><tr role='row'><th><div>Municipal Code</div></th><th><div>Description</div></th></tr></thead><tbody><tr role=\"row\"><td>10.9.8</td><td>Refusal to remove</td></tr></tbody></table>`,
      '{{municode_resolution_nocomplyby}}': `<table style='font-family:\"Arial\"; font-size:12px' role='grid' border='1' cellspacing='0'><colgroup><thead><tr role='row'><th><div>Municipal Code</div></th><th><div>Description</div></th><th><div>Resolutions</div></th></tr></thead><tbody><tr role=\"row\"><td>6.30.010</td><td>Restraint of dogs.</td><td>The owner or person with the right to the control of any dog(s) shall keep such dog(s) confined to his/their own premises or shall keep such dog(s) under physical restraint by means of a leash not to exceed six feet in length except: (a) Guide dogs for the blind or deaf while performing their duties; (b) Dogs participating in field or obedience trials or exhibitions; (c) Dogs assisting their owner/handler in legal hunting or in the herding of livestock; (d) Dogs assisting a security guard or assisting a peace officer engaged in law enforcement activities; (e) Dogs being trained for any of the above purposes on private land with permission of the landowner, so long as such dogs are under direct control of such individuals to assure that they do not violate any other provision of law. (Ord. 1424 § 3, 7-14-71. Formerly § 3-51).</td></tr></tbody></table>`,
      '{{municode_resolution}}': `<table style='font-family:\"Arial\"; font-size:12px' role='grid' border='1' cellspacing='0'><colgroup><thead><tr role='row'><th><div>Municipal Code</div></th><th><div>Description</div></th><th><div>Resolutions</div></th><th><div>Comply-By</div></th></tr></thead><tbody><tr role=\"row\"><td>6.30.010</td><td>Restraint of dogs.</td><td>The owner or person with the right to the control of any dog(s) shall keep such dog(s) confined to his/their own premises or shall keep such dog(s) under physical restraint by means of a leash not to exceed six feet in length except: (a) Guide dogs for the blind or deaf while performing their duties; (b) Dogs participating in field or obedience trials or exhibitions; (c) Dogs assisting their owner/handler in legal hunting or in the herding of livestock; (d) Dogs assisting a security guard or assisting a peace officer engaged in law enforcement activities; (e) Dogs being trained for any of the above purposes on private land with permission of the landowner, so long as such dogs are under direct control of such individuals to assure that they do not violate any other provision of law. (Ord. 1424 § 3, 7-14-71. Formerly § 3-51).</td><td>2019-02-16</td></tr></tbody></table>`,
    };

    configXerceViolationsInstance = [
      {
        id: 1,
        municipalCode: {
          id: 1,
          agencyId,
          xerceId: 2,
          articleNumber: '10.9.8',
          description: 'Refusal to remove',
          resolutionAction:
            'It shall be unlawful and a misdemeanor for any person to fail or refuse to remove an abandoned, wrecked, dismantled or inoperative vehicle or parts thereof or refuse to abate such nuisance when ordered to do so in accordance with the abatement provisions of this chapter or State law where such State law is applicable. (Ord. 1281 § 2, 10-16-73. Formerly § 17-111)',
        },
      },
    ];

    configNoticeForm = {
      label: 'Final Notice',
      content: `<p>{{municode_description}}</p><br><br><p>{{municode_resolution}}</p><br><br><p>{{municode_resolution_nocomplyby}}</p>`,
      noticeType: NoticeType.HTML,
      isActive: true,
      mergeFields: null,
      mergeTables: {
        'Municipal Code': {
          tables: [
            '{{municode_description}}',
            '{{municode_resolution}}',
            '{{municode_resolution_nocomplyby}}',
          ],
        },
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
        content: `Copyright Footer`,
        sectionType: NoticeFormSectionType.HEADER,
        isActive: true,
        mergeFields: null,
      },
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should resolve location merge table', async () => {
    sandbox
      .stub(db.ConfigXerceViolation, 'findAll')
      .withArgs({
        where: { id: uniqueViolationIds, agencyId },
        attributes: ['id'],
        include: [
          {
            model: db.ConfigMunicipalCode,
            as: 'municipalCode',
          },
        ],
      })
      .resolves(configXerceViolationsInstance);

    const result = await resolveTables(
      agencyId,
      caseId,
      configNoticeForm,
      uiMergeCodes,
      userProfile
    );

    expect(resolvedCode).to.deep.equal(result);
  });

  it('should throw error when config violations does not exist', async () => {
    sandbox
      .stub(db.ConfigXerceViolation, 'findAll')
      .withArgs({
        where: { id: uniqueViolationIds, agencyId },
        attributes: ['id'],
        include: [
          {
            model: db.ConfigMunicipalCode,
            as: 'municipalCode',
          },
        ],
      })
      .resolves([]);

    await resolveTables(
      agencyId,
      caseId,
      configNoticeForm,
      uiMergeCodes,
      userProfile
    ).catch(err => expect(err.name).to.equal('InvalidRequestError'));
  });

  it('should throw InternalServerError error', async () => {
    sandbox
      .stub(db.ConfigXerceViolation, 'findAll')
      .withArgs({
        where: { id: uniqueViolationIds, agencyId },
        attributes: ['id'],
        include: [
          {
            model: db.ConfigMunicipalCode,
            as: 'municipalCode',
          },
        ],
      })
      .throws('Error');

    await resolveTables(
      agencyId,
      caseId,
      configNoticeForm,
      uiMergeCodes,
      userProfile
    ).catch(err => expect(err.name).to.equal('InternalServerError'));
  });

  it('Ui merge codes are empty', async () => {
    uiMergeCodes.resolutionActions = [];
    sandbox
      .stub(db.ConfigXerceViolation, 'findAll')
      .withArgs({
        where: { id: uniqueViolationIds, agencyId },
        attributes: ['id'],
        include: [
          {
            model: db.ConfigMunicipalCode,
            as: 'municipalCode',
          },
        ],
      })
      .resolves(configXerceViolationsInstance);

    const result = await resolveTables(
      agencyId,
      caseId,
      configNoticeForm,
      uiMergeCodes,
      userProfile
    );

    resolvedCode = {
      '{{municode_description}}': `<table style='font-family:\"Arial\"; font-size:12px'  role='grid' border='1' cellspacing='0'><colgroup><thead><tr role='row'><th><div>Municipal Code</div></th><th><div>Description</div></th></tr></thead><tbody><tr role=\"row\"><td>10.9.8</td><td>Refusal to remove</td></tr></tbody></table>`,
      '{{municode_resolution_nocomplyby}}':
        '{{municode_resolution_nocomplyby}}',
      '{{municode_resolution}}': '{{municode_resolution}}',
    };

    expect(resolvedCode).to.deep.equal(result);
  });
});
