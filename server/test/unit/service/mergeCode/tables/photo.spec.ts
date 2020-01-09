import { expect } from 'chai';
import 'mocha';
import * as sinon from 'sinon';

import { resolveTables } from '../../../../../api/service/mergeCode/tables/photo';

describe('PhotoTables Service: resolveTables method', () => {
  let sandbox;
  const agencyId = 1;
  const caseId = 1;
  let configNoticeForm;
  const resolvedCode = {
    '{{photos}}': `<table style='font-family:\"Arial\"; font-size:12px' role='grid' border='1' cellspacing='0'><colgroup><thead><tr role='row'><th><div>Photo</div></th><th><div>Details</div></th></tr></thead><tbody><tr role='row'><td><div><p><img height=\"250\" width=\"300\" src='https://cyberdyne-dev.s3.amazonaws.com/agency_1/cases/case_6919/attachments/Screenshot_1559038939090.png'></p></div></td><td><p><b>Title:</b>&nbsp;Screenshot_1559038939090.png</p><p><b>Date:</b>&nbsp;Sat Feb 16 2019 11:59:32 GMT+0530 (India Standard Time)</p><p><b>Uploaded by:</b>&nbsp;Janet Doe</p></td></tr></tbody></table>`,
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

    configNoticeForm = {
      label: 'Final Notice',
      content: `<p>{{photos}}</p>`,
      noticeType: NoticeType.HTML,
      isActive: true,
      mergeFields: null,
      mergeTables: { 'Photos & Attachments': { tables: ['{{photos}}'] } },
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

  it('should resolve photos merge table', async () => {
    const result = await resolveTables(
      agencyId,
      caseId,
      configNoticeForm,
      uiMergeCodes,
      userProfile
    );

    expect(resolvedCode).to.deep.equal(result);
  });
});
