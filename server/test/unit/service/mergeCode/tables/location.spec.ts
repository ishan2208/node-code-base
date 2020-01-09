import { expect } from 'chai';
import 'mocha';
import * as sinon from 'sinon';

import db from '../../../../../api/models';
import { resolveTables } from '../../../../../api/service/mergeCode/tables/location';

describe('LocationTables Service: resolveTables method', () => {
  let sandbox;
  const agencyId = 1;
  const caseId = 1;
  let configNoticeForm;
  let xerceCaseInstance;
  const resolvedCode = {
    '{{case_location_stacked}}': '547,Alabama<br>Alabama<br>AL<br>94016<br>',
    '{{case_location_comma_separated}}': '547,Alabama, Alabama, AL, 94016',
  };

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
    openViolations: [],
    resolutionActions: [],
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

    xerceCaseInstance = {
      id: caseId,
      agencyId,
      assigneeId: 11,
      agencyLocationId: 3,
      caseNumber: '#CE-19-2',
      initiationType: 'PROACTIVE',
      issueDescription: 'This is a test issue description',
      status: 'OPEN',
      customCaseFieldValues: [],
      customForcedAbatementFieldValues: [],
      locationManualFields: [],
      locationParcelFields: [],
      isCDBGApproved: true,
      caseLocation: {
        id: 1,
        agencyId,
        streetAddress: '547,Alabama',
        latitude: 34.0401465212326,
        longitude: -78.0749587334245,
        parcelId: 22,
        city: 'Alabama',
        state: 'AL',
        zip: '94016',
        isAgencyAddress: false,
        isCDBGEligible: false,
      },
      createdByUser: {
        id: 1,
        firstName: 'johne',
        lastName: 'Doe',
      },
      caseAssignee: {
        id: 2,
        firstName: 'Jane',
        lastName: 'Doe',
      },
      closedByUser: null,
      closedAt: null,
      createdAt: new Date('2019-02-16T06:29:32.814Z'),
      updatedAt: new Date('2019-02-16T06:29:32.814Z'),
    };

    configNoticeForm = {
      label: 'Final Notice',
      content: `<p>{{case_location_stacked}}</p><br><br><p>{{case_location_comma_separated}}</p>`,
      noticeType: NoticeType.HTML,
      isActive: true,
      mergeFields: null,
      mergeTables: {
        'Case Location': {
          tables: [
            '{{case_location_stacked}}',
            '{{case_location_comma_separated}}',
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
      .stub(db.XerceCase, 'findOne')
      .withArgs({
        where: { id: caseId, agencyId },
        attributes: ['id'],
        include: [
          {
            model: db.AgencyLocation,
            as: 'caseLocation',
            attributes: ['streetAddress', 'city', 'state', 'zip'],
          },
        ],
      })
      .resolves(xerceCaseInstance);

    const result = await resolveTables(
      agencyId,
      caseId,
      configNoticeForm,
      uiMergeCodes,
      userProfile
    );

    expect(resolvedCode).to.deep.equal(result);
  });

  it('should throw error when case does not exist', async () => {
    sandbox
      .stub(db.XerceCase, 'findOne')
      .withArgs({
        where: { id: caseId, agencyId },
        attributes: ['id'],
        include: [
          {
            model: db.AgencyLocation,
            as: 'caseLocation',
            attributes: ['streetAddress', 'city', 'state', 'zip'],
          },
        ],
      })
      .resolves(null);

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
      .stub(db.XerceCase, 'findOne')
      .withArgs({
        where: { id: caseId, agencyId },
        attributes: ['id'],
        include: [
          {
            model: db.AgencyLocation,
            as: 'caseLocation',
            attributes: ['streetAddress', 'city', 'state', 'zip'],
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
});
