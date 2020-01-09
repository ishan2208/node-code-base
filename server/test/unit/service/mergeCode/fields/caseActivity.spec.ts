import { expect } from 'chai';
import 'mocha';
import * as sinon from 'sinon';

import { resolveFields } from '../../../../../api/service/mergeCode/fields/caseActivity';
import UserService from '../../../../../api/service/user/user';

describe('CaseActivityFields Service: resolveFields method', () => {
  let sandbox;
  const agencyId = 1;
  const caseId = 1;
  let configNoticeForm;
  const resolvedFields = {
    '{{next_inspection_date_numeric}}': '05/13/2019',
    '{{next_inspection_date_spelled}}': 'May 13, 2019',
    '{{next_inspection_assignee}}': 'Janet Doe',
  };

  let userInstance = {
    id: 1,
    firstName: 'Janet',
    lastName: 'Doe',
  };

  const uiMergeCodes: IGenerateNoticeUiCodes = {
    recipientIds: [111, 112],
    responsibleContactId: 111,
    attachments: [],
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
      content: `{{next_inspection_date_numeric}}
        {{next_inspection_date_spelled}}
        {{next_inspection_assignee}}`,
      noticeType: NoticeType.HTML,
      isActive: true,
      mergeFields: {
        'Case Activity': {
          fields: [
            '{{next_inspection_date_numeric}}',
            '{{next_inspection_date_spelled}}',
            '{{next_inspection_assignee}}',
          ],
        },
      },
      mergeTables: null,
      headerSection: {
        label: 'Welcome Header',
        content: `{{next_inspection_assignee}}`,
        sectionType: NoticeFormSectionType.HEADER,
        isActive: true,
        mergeFields: {
          'Case Activity': {
            fields: ['{{next_inspection_assignee}}'],
          },
        },
      },
      footerSection: {
        label: 'Copyright Footer',
        content: `{{next_inspection_date_spelled}}`,
        sectionType: NoticeFormSectionType.HEADER,
        isActive: true,
        mergeFields: {
          'Case Activity': {
            fields: ['{{next_inspection_date_spelled}}'],
          },
        },
      },
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should resolve all case activity merge fields', async () => {
    sandbox
      .stub(UserService.prototype, 'getCaseUserDetails')
      .withArgs(uiMergeCodes.nextInspection.assigneeId)
      .resolves(userInstance);

    const result = await resolveFields(
      agencyId,
      caseId,
      configNoticeForm,
      uiMergeCodes,
      userProfile
    );

    expect(resolvedFields).to.deep.equal(result);
  });

  it('should throw error while resolving agency info merge fields', async () => {
    sandbox
      .stub(UserService.prototype, 'getCaseUserDetails')
      .withArgs(uiMergeCodes.nextInspection.assigneeId)
      .throws('InternalServerError');

    await resolveFields(
      agencyId,
      caseId,
      configNoticeForm,
      uiMergeCodes,
      userProfile
    ).catch(err => expect(err.name).to.equal('InternalServerError'));
  });

  it('should throw error for invalid user id', async () => {
    userInstance = null;

    sandbox
      .stub(UserService.prototype, 'getCaseUserDetails')
      .withArgs(uiMergeCodes.nextInspection.assigneeId)
      .resolves(userInstance);

    await resolveFields(
      agencyId,
      caseId,
      configNoticeForm,
      uiMergeCodes,
      userProfile
    ).catch(err => expect(err.name).to.equal('InvalidRequestError'));
  });
});
