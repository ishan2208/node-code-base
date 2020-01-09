import 'mocha';

import { expect } from 'chai';
import * as sinon from 'sinon';
import db from '../../../../api/models';
import ConfigNoticeService from '../../../../api/service/agencySetup/configXerceNotice';

const configNoticeService = new ConfigNoticeService();

describe('configXerceNotice Service: verifyNoticeMergeCodes', () => {
  let sandbox;
  const agencyId = 1;
  const noticeId = 10;

  let responseObj;
  let notice;
  let result;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    notice = {
      mergeFields: {
        Fees: { fields: ['current_balance', 'total_fees'] },
        Location: {
          fields: [
            'case_location_address',
            'case_apn',
            'case_flagged_address',
            'flagged_address_reason',
          ],
        },
        'Case Information': {
          fields: ['current_time', 'case_create_date_numeric'],
        },
        'Agency Information': { fields: ['agency_name', 'map_zoom_level'] },
      },
      mergeTables: {
        'Photos & Attachments': { fields: ['photos'] },
        'Municipal Code': {
          tables: [
            '{{municode_resolution_nocomplyby}}',
            '{{municode_resolution}}',
          ],
        },
      },
    };

    responseObj = {
      containsPhotoMergeTable: true,
      containsMuniCodeMergeTable: true,
    };
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 with notice verified merge codes', async () => {
    sandbox
      .stub(db.ConfigXerceNotice, 'findOne')
      .withArgs({
        where: { agencyId, id: noticeId },
        attributes: ['mergeTables'],
      })
      .resolves(notice);

    result = await configNoticeService.verifyNoticeMergeCodes(
      agencyId,
      noticeId
    );

    expect(result).to.deep.equal(responseObj, 'response did not match');
  });

  it('Should return status code 200 with notice verified merge codes with false', async () => {
    notice.mergeTables = {};
    responseObj = {
      containsPhotoMergeTable: false,
      containsMuniCodeMergeTable: false,
    };
    sandbox
      .stub(db.ConfigXerceNotice, 'findOne')
      .withArgs({
        where: { agencyId, id: noticeId },
        attributes: ['mergeTables'],
      })
      .resolves(notice);

    result = await configNoticeService.verifyNoticeMergeCodes(
      agencyId,
      noticeId
    );

    expect(result).to.deep.equal(responseObj, 'response did not match');
  });

  it('Should return status code 400 with DBMissingEntityError exception', async () => {
    sandbox
      .stub(db.ConfigXerceNotice, 'findOne')
      .withArgs({
        where: { agencyId, id: noticeId },
        attributes: ['mergeTables'],
      })
      .resolves(null);

    await configNoticeService
      .verifyNoticeMergeCodes(agencyId, noticeId)
      .catch(err => {
        expect(err.name).to.deep.equal('DBMissingEntityError');
      });
  });

  it('Should return status code 400 with InternalServerError exception', async () => {
    sandbox
      .stub(db.ConfigXerceNotice, 'findOne')
      .withArgs({
        where: { agencyId, id: noticeId },
        attributes: ['mergeTables'],
      })
      .throws({ name: 'Error' });

    await configNoticeService
      .verifyNoticeMergeCodes(agencyId, noticeId)
      .catch(err => {
        expect(err.name).to.deep.equal('InternalServerError');
      });
  });
});
