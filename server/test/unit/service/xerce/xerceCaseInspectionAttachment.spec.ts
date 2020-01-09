import { expect } from 'chai';
import 'mocha';
import * as sinon from 'sinon';

import db from '../../../../api/models';
import XerceCaseInspectionAttachmentService from '../../../../api/service/xerce/xerceCaseInspectionAttachment';

describe('XerceCaseInspectionAttachment Service: create method', () => {
  let sandbox;
  const agencyId = 1;
  const xerceCaseId = 1;
  const inspectionId = 1;
  let transaction;
  let caseAttachments: IXerceCaseAttachment[];

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    transaction = sandbox.stub();

    caseAttachments = [
      {
        id: 1,
        title: 'This is PNG attachment ',
        description: 'this is a description',
        fileName: 'This is a file name1',
        fileSize: '20KB',
        fileURL:
          'https://cyberdyne-dev.s3.amazonaws.com/agency_1/cases/case_8/attachments/22_11_18_1_17_49.pdf',
        mimeType: 'image/png',
        createdBy: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
        },
        updatedBy: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
        },
        createdAt: new Date('2019-03-01T09:24:14.642Z'),
        updatedAt: new Date('2019-03-01T09:24:14.642Z'),
      },
    ];
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('Should create inspection attachment', async () => {
    sandbox.stub(db.XerceCaseInspectionAttachment, 'bulkCreate');

    await new XerceCaseInspectionAttachmentService().create(
      agencyId,
      xerceCaseId,
      inspectionId,
      caseAttachments,
      transaction
    );
  });

  it('Should throw conflict error while creating inspection attachment', async () => {
    sandbox
      .stub(db.XerceCaseInspectionAttachment, 'bulkCreate')
      .throws('SequelizeUniqueConstraintError');

    await new XerceCaseInspectionAttachmentService()
      .create(agencyId, xerceCaseId, inspectionId, caseAttachments, transaction)
      .catch(err => expect(err.name).to.be.equal('DBConflictError'));
  });

  it('Should throw error while creating inspection attachment', async () => {
    sandbox
      .stub(db.XerceCaseInspectionAttachment, 'bulkCreate')
      .throws('Error');

    await new XerceCaseInspectionAttachmentService()
      .create(agencyId, xerceCaseId, inspectionId, caseAttachments, transaction)
      .catch(err => expect(err.name).to.be.equal('InternalServerError'));
  });
});
