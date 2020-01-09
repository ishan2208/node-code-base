import { expect } from 'chai';
import 'mocha';
import * as sinon from 'sinon';

import db from '../../../../../api/models';
import ConfigViolationService from '../../../../../api/service/agencySetup/configViolation';
import { resolveFields } from '../../../../../api/service/mergeCode/fields/caseInformation';
import UserService from '../../../../../api/service/user/user';

describe('CaseInformationFields Service: resolveFields method', () => {
  let sandbox;
  const agencyId = 1;
  const caseId = 1;
  let xerceCase;
  let configNoticeForm;
  const resolvedFields = {
    '{{case_number}}': 'CE-19-001',
    '{{case_issue_description}}': 'This is my issue description',
    '{{case_create_date_numeric}}': '05/13/2019',
    '{{case_create_date_spelled}}': 'May 13, 2019',
    '{{case_assignee_last_first}}': 'Doe John',
    '{{case_assignee_first_last}}': 'John Doe',
    '{{logged_in_user_last_first}}': 'Doe John',
    '{{logged_in_user_first_last}}': 'John Doe',
    '{{logged_in_user_signature_block}}': 'John Doe',
    '{{logged_in_user_signature_image}}':
      'https://cyberdyne-dev.s3.amazonaws.com/agency_1/agency_config/download.jpeg',
  };

  const uiMergeCodes: IGenerateNoticeUiCodes = {
    recipientIds: [1, 2],
    responsibleContactId: 1,
    attachments: [],
    openViolations: [
      {
        configViolationId: 2,
        entity: {},
      },
    ],
    resolutionActions: [],
    nextInspection: {
      plannedDate: new Date('2019-05-13T06:29:32.814Z'),
      assigneeId: 11,
    },
    caseAssigneeId: 11,
  };

  const caseAssignee = {
    id: 11,
    firstName: 'John',
    lastName: 'Doe',
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

    xerceCase = {
      id: 100,
      caseNumber: 'CE-19-001',
      issueDescription: 'This is my issue description',
      createdAt: new Date('2019-05-13T06:29:32.814Z'),
      closedAt: new Date('2019-05-13T06:29:32.814Z'),
      caseViolations: [
        {
          id: 1,
          configViolationId: 11,
        },
      ],
    };

    configNoticeForm = {
      label: 'Final Notice',
      content: `{{case_number}}
        {{case_issue_description}}
        {{case_create_date_numeric}}
        {{case_create_date_spelled}}
        {{case_assignee_last_first}}
        {{case_assignee_first_last}}
        {{logged_in_user_last_first}}
        {{logged_in_user_first_last}}
        {{logged_in_user_signature_block}}
        {{logged_in_user_signature_image}}`,
      noticeType: NoticeType.HTML,
      isActive: true,
      mergeFields: {
        'Case Information': {
          fields: [
            '{{case_number}}',
            '{{case_issue_description}}',
            '{{case_create_date_numeric}}',
            '{{case_create_date_spelled}}',
            '{{case_assignee_last_first}}',
            '{{case_assignee_first_last}}',
            '{{logged_in_user_last_first}}',
            '{{logged_in_user_first_last}}',
            '{{logged_in_user_signature_block}}',
            '{{logged_in_user_signature_image}}',
          ],
        },
      },
      mergeTables: null,
      headerSection: {
        label: 'Welcome Header',
        content: `{{case_number}}`,
        sectionType: NoticeFormSectionType.HEADER,
        isActive: true,
        mergeFields: {
          'Case Information': {
            fields: ['{{case_number}}'],
          },
        },
      },
      footerSection: {
        label: 'Copyright Footer',
        content: `{{case_number}}`,
        sectionType: NoticeFormSectionType.HEADER,
        isActive: true,
        mergeFields: {
          'Case Information': {
            fields: ['{{case_number}}'],
          },
        },
      },
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should resolve all case info merge fields', async () => {
    sandbox
      .stub(db.XerceCase, 'findOne')
      .withArgs({
        where: { id: caseId, agencyId },
        attributes: [
          'id',
          'caseNumber',
          'issueDescription',
          'createdAt',
          'closedAt',
        ],
        include: [
          {
            model: db.XerceCaseViolation,
            as: 'caseViolations',
            attributes: ['id', 'configViolationId'],
          },
        ],
      })
      .resolves(xerceCase);

    sandbox
      .stub(ConfigViolationService.prototype, 'getViolationTypeIds')
      .withArgs(agencyId, [1, 2])
      .resolves([11, 12]);

    sandbox.stub(UserService.prototype, 'isValidAssignee').resolves(true);

    sandbox
      .stub(UserService.prototype, 'getCaseUserDetails')
      .withArgs(uiMergeCodes.caseAssigneeId)
      .resolves(caseAssignee);

    const result = await resolveFields(
      agencyId,
      caseId,
      configNoticeForm,
      uiMergeCodes,
      userProfile
    );

    expect(resolvedFields).to.deep.equal(result);
  });

  it('should throw error while resolving case info merge fields', async () => {
    sandbox
      .stub(db.XerceCase, 'findOne')
      .withArgs({
        where: { id: caseId, agencyId },
        attributes: [
          'id',
          'caseNumber',
          'issueDescription',
          'createdAt',
          'closedAt',
        ],
        include: [
          {
            model: db.XerceCaseViolation,
            as: 'caseViolations',
            attributes: ['id', 'configViolationId'],
          },
        ],
      })
      .throws('Error');

    await resolveFields(
      agencyId,
      caseId,
      configNoticeForm,
      uiMergeCodes,
      userProfile
    ).catch(err => expect(err.name).to.equal('InternalServerError'));
  });

  it('should throw error if case does not exist', async () => {
    sandbox
      .stub(db.XerceCase, 'findOne')
      .withArgs({
        where: { id: caseId, agencyId },
        attributes: [
          'id',
          'caseNumber',
          'issueDescription',
          'createdAt',
          'closedAt',
        ],
        include: [
          {
            model: db.XerceCaseViolation,
            as: 'caseViolations',
            attributes: ['id', 'configViolationId'],
          },
        ],
      })
      .resolves(null);

    await resolveFields(
      agencyId,
      caseId,
      configNoticeForm,
      uiMergeCodes,
      userProfile
    ).catch(err => expect(err.name).to.equal('InvalidRequestError'));
  });

  it('should throw error while resolving case info merge fields for invalid case assignee', async () => {
    sandbox
      .stub(db.XerceCase, 'findOne')
      .withArgs({
        where: { id: caseId, agencyId },
        attributes: [
          'id',
          'caseNumber',
          'issueDescription',
          'createdAt',
          'closedAt',
        ],
        include: [
          {
            model: db.XerceCaseViolation,
            as: 'caseViolations',
            attributes: ['id', 'configViolationId'],
          },
        ],
      })
      .resolves(xerceCase);

    sandbox
      .stub(ConfigViolationService.prototype, 'getViolationTypeIds')
      .withArgs(agencyId, [1, 2])
      .resolves([11, 12]);

    sandbox.stub(UserService.prototype, 'isValidAssignee').resolves(false);

    await resolveFields(
      agencyId,
      caseId,
      configNoticeForm,
      uiMergeCodes,
      userProfile
    ).catch(err => expect(err.name).to.equal('InvalidRequestError'));
  });
});
