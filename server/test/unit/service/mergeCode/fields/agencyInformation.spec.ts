import { expect } from 'chai';
import 'mocha';
import * as sinon from 'sinon';

import AgencyService from '../../../../../api/service/admin/agency';
import { resolveFields } from '../../../../../api/service/mergeCode/fields/agencyInformation';

describe('AgencyInformationFields Service: resolveFields method', () => {
  let sandbox;
  const agencyId = 1;
  const caseId = 1;
  let agencyInstance;
  let configNoticeForm;
  const resolvedFields = {
    '{{agency_name}}': 'City of California',
    '{{agency_address}}': 'California High St',
    '{{agency_city}}': 'California City',
    '{{agency_state}}': 'California',
    '{{agency_zipcode}}': '12345',
    '{{agency_timezone}}': AgencyTimezone.PST,
    '{{agency_email_id}}': 'cityofcalifornia@gmail.com',
    '{{agency_web_url}}': 'https://cityofcalifornia.com',
    '{{agency_whitelisted_url}}': 'https://wl-cityofcalifornia.com',
    '{{center_latitude}}': 12.23457686,
    '{{center_longitude}}': 78.87664357,
    '{{map_zoom_level}}': 12,
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    agencyInstance = {
      id: agencyId,
      name: 'City of California',
      websiteURL: 'https://cityofcalifornia.com',
      email: 'cityofcalifornia@gmail.com',
      agencyTimezone: AgencyTimezone.PST,
      whitelistURL: 'https://wl-cityofcalifornia.com',
      agencyLogoURL: 'https://cityofcalifornia.com/agency-logo',
      locations: [
        {
          streetAddress: 'California High St',
          city: 'California City',
          state: 'California',
          zip: '12345',
          latitude: 12.23457686,
          longitude: 78.87664357,
          mapZoomLevel: 12,
        },
      ],
      isActive: true,
    };

    configNoticeForm = {
      label: 'Final Notice',
      content: `{{agency_name}}
          {{agency_address}}
          {{agency_city}}
          {{agency_state}}
          {{agency_zipcode}}
          {{agency_timezone}}
          {{agency_email_id}}
          {{agency_web_url}}
          {{agency_whitelisted_url}}
          {{center_latitude}}
          {{center_longitude}}
          {{map_zoom_level}}`,
      noticeType: NoticeType.HTML,
      isActive: true,
      mergeFields: {
        'Agency Information': {
          fields: [
            '{{agency_name}}',
            '{{agency_address}}',
            '{{agency_city}}',
            '{{agency_state}}',
            '{{agency_zipcode}}',
            '{{agency_timezone}}',
            '{{agency_email_id}}',
            '{{agency_web_url}}',
            '{{agency_whitelisted_url}}',
            '{{center_latitude}}',
            '{{center_longitude}}',
            '{{map_zoom_level}}',
          ],
        },
      },
      mergeTables: null,
      headerSection: {
        label: 'Welcome Header',
        content: `{{agency_name}}`,
        sectionType: NoticeFormSectionType.HEADER,
        isActive: true,
        mergeFields: {
          'Agency Information': {
            fields: ['{{agency_name}}'],
          },
        },
      },
      footerSection: {
        label: 'Copyright Footer',
        content: `{{agency_email_id}}`,
        sectionType: NoticeFormSectionType.HEADER,
        isActive: true,
        mergeFields: {
          'Agency Information': {
            fields: ['{{agency_email_id}}'],
          },
        },
      },
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should resolve all agency info merge fields', async () => {
    sandbox
      .stub(AgencyService.prototype, 'getRecord')
      .withArgs(agencyId)
      .resolves(agencyInstance);

    const result = await resolveFields(
      agencyId,
      caseId,
      configNoticeForm,
      null,
      null
    );

    expect(resolvedFields).to.deep.equal(result);
  });

  it('should throw error for invalid agency', async () => {
    agencyInstance = null;

    sandbox
      .stub(AgencyService.prototype, 'getRecord')
      .withArgs(agencyId)
      .resolves(agencyInstance);

    await resolveFields(agencyId, caseId, configNoticeForm, null, null).catch(
      err => expect(err.name).to.be.equal('InvalidRequestError')
    );
  });

  it('should throw error while resolving agency info merge fields', async () => {
    sandbox
      .stub(AgencyService.prototype, 'getRecord')
      .withArgs(agencyId)
      .throws('InternalServerError');

    await resolveFields(agencyId, caseId, configNoticeForm, null, null).catch(
      err => expect(err.name).to.equal('InternalServerError')
    );
  });
});
