import * as mime from 'mime';
import 'mocha';

import { expect } from 'chai';
import * as sinon from 'sinon';
import db from '../../../../api/models';
import S3Service from '../../../../api/service/common/s3';
import XerceCaseListingService from '../../../../api/service/xerce/caseListing';
import XerceCaseService from '../../../../api/service/xerce/xerceCase';
import XerceCaseAttachmentService from '../../../../api/service/xerce/xerceCaseAttachment';

import XerceCaseHistoryService from '../../../../api/service/xerce/xerceCaseHistory';
import DBUtil from '../../../../api/utils/dbUtil';

const xerceCaseAttachmentService = new XerceCaseAttachmentService();

describe('xerceCaseAttachments Service: Get All Attachments', () => {
  let sandbox;
  const transaction = null;
  const agencyId = 1;
  const caseId = 2;
  const userId = 3;
  const attachmentId = 4;
  const fileMetadataId = 5;
  const createdBy = 6;

  let responseObj;
  let result;
  let attachments;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    //transaction = sinon.stub();

    attachments = [
      {
        agencyId,
        xerceCaseId: caseId,
        fileMetadataId,
        createdAt: '2019-03-01T09:24:14.642Z',
        updatedAt: '2019-03-01T09:24:14.642Z',
        fileMetadata: {
          agencyId,
          title: 'This is PNG attachment ',
          description: 'this is a description',
          fileName: 'This is a file name1',
          fileSize: '20KB',
          fileURL:
            'https://cyberdyne-dev.s3.amazonaws.com/agency_1/cases/case_8/attachments/22_11_18_1_17_49.pdf',
          contentType: CaseAttachmentType.PDF,
          createdBy: {
            id: createdBy,
            firstName: 'John',
            lastName: 'Doe',
          },
          updatedBy: {
            id: createdBy,
            firstName: 'John',
            lastName: 'Doe',
          },
          createdAt: '2019-03-01T09:24:14.642Z',
          updatedAt: '2019-03-01T09:24:14.642Z',
        },
      },
    ];

    responseObj = [
      {
        id: attachmentId,
        title: 'This is PNG attachment ',
        description: 'this is a description',
        fileName: 'This is a file name1',
        fileSize: '20KB',
        fileURL:
          'https://cyberdyne-dev.s3.amazonaws.com/agency_1/cases/case_8/attachments/22_11_18_1_17_49.pdf',
        contentType: 'PDF',
        createdBy: {
          id: userId,
          firstName: 'John',
          lastName: 'Doe',
        },
        updatedBy: {
          id: userId,
          firstName: 'John',
          lastName: 'Doe',
        },
        createdAt: '2019-03-01T09:24:14.642Z',
        updatedAt: '2019-03-01T09:24:14.642Z',
      },
    ];
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 with attachments details', async () => {
    sandbox
      .stub(db.XerceCaseAttachment, 'findAll')
      .withArgs({
        where: {
          agencyId,
          xerceCaseId: caseId,
        },
        include: [
          {
            model: db.FileMetadata,
            as: 'fileMetadata',
            include: [
              {
                model: db.User,
                as: 'createdByUser',
              },
              {
                model: db.User,
                as: 'updatedByUser',
              },
            ],
          },
        ],
        order: ['id'],
        transaction,
      })
      .resolves(attachments);

    sandbox
      .stub(XerceCaseAttachmentService.prototype, 'createAttachmentRespObj')
      .withArgs(attachments[0])
      .returns(responseObj[0]);

    result = await xerceCaseAttachmentService.getAll(agencyId, caseId);

    expect(result).to.deep.equal(responseObj, 'response did not match');
  });

  it('Should return status code 400 with InternalServerError', async () => {
    sandbox
      .stub(db.XerceCaseAttachment, 'findAll')
      .withArgs({
        where: {
          agencyId,
          xerceCaseId: caseId,
        },
        include: [
          {
            model: db.FileMetadata,
            as: 'fileMetadata',
            include: [
              {
                model: db.User,
                as: 'createdByUser',
              },
              {
                model: db.User,
                as: 'updatedByUser',
              },
            ],
          },
        ],
        order: ['id'],
        transaction,
      })
      .throws('Error');

    await xerceCaseAttachmentService
      .getAll(agencyId, caseId)
      .catch(err => expect(err.name).to.equal('InternalServerError'));
  });
});

describe('xerceCaseAttachments Service: Delete Attachment', () => {
  let sandbox;
  let transaction;
  const agencyId = 1;
  const caseId = 2;
  const attachmentIds = [4];
  const fileMetadataId = 5;
  const createdBy = 6;

  let caseAttachments;
  let attachmentUrls;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    transaction = sinon.stub();

    caseAttachments = [
      {
        agencyId,
        xerceCaseId: caseId,
        fileMetadataId,
        createdAt: '2019-03-01T09:24:14.642Z',
        updatedAt: '2019-03-01T09:24:14.642Z',
        fileMetadata: {
          agencyId,
          title: 'This is PNG attachment ',
          description: 'this is a description',
          fileName: 'This is a file name1',
          fileSize: '20KB',
          fileURL:
            'https://cyberdyne-dev.s3.amazonaws.com/agency_1/cases/case_8/attachments/22_11_18_1_17_49.pdf',
          contentType: CaseAttachmentType.PDF,
          createdBy: {
            id: createdBy,
            firstName: 'John',
            lastName: 'Doe',
          },
          updatedBy: {
            id: createdBy,
            firstName: 'John',
            lastName: 'Doe',
          },
          createdAt: '2019-03-01T09:24:14.642Z',
          updatedAt: '2019-03-01T09:24:14.642Z',
        },
      },
    ];

    attachmentUrls = [caseAttachments[0].fileURL];
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200', async () => {
    sandbox
      .stub(XerceCaseAttachmentService.prototype, 'getAll')
      .withArgs(agencyId, caseId, attachmentIds)
      .resolves(caseAttachments);

    sandbox.stub(DBUtil, 'createTransaction').resolves(transaction);

    sandbox.stub(db.XerceCaseAttachment, 'destroy').withArgs({
      where: {
        fileURL: attachmentUrls,
      },
      transaction,
    });

    sandbox.stub(db.FileMetadata, 'destroy').withArgs({
      where: {
        fileURL: attachmentUrls,
      },
      transaction,
    });

    sandbox.stub(S3Service.prototype, 'deleteObjects').withArgs(attachmentUrls);

    sandbox
      .stub(XerceCaseService.prototype, 'setUpdatedAt')
      .withArgs(agencyId, caseId, transaction);

    sandbox
      .stub(XerceCaseHistoryService.prototype, 'createCaseAttachmentsHistory')
      .withArgs(
        CaseHistoryActions.ATTACHMENTS_DELETED,
        agencyId,
        createdBy,
        caseId,
        transaction,
        caseAttachments
      )
      .resolves(null);

    sandbox.stub(DBUtil, 'commitTransaction');

    sandbox.stub(XerceCaseListingService.prototype, 'refreshCaseListing');

    await xerceCaseAttachmentService.delete(
      agencyId,
      caseId,
      createdBy,
      attachmentIds
    );
  });

  it('Should return status code 400 with InternalServerError', async () => {
    sandbox
      .stub(XerceCaseAttachmentService.prototype, 'getAll')
      .withArgs(agencyId, caseId, sinon.match.any)
      .returns(caseAttachments);

    sandbox.stub(DBUtil, 'createTransaction').resolves(transaction);

    sandbox.stub(XerceCaseListingService.prototype, 'refreshCaseListing');

    sandbox.stub(db.XerceCaseAttachment, 'destroy').withArgs({
      where: {
        id: attachmentIds,
      },
      transaction,
    });

    sandbox
      .stub(S3Service.prototype, 'deleteObjects')
      .withArgs(attachmentUrls)
      .throws({ name: 'Error' });

    sandbox.stub(DBUtil, 'rollbackTransaction');

    await xerceCaseAttachmentService
      .delete(agencyId, caseId, createdBy, attachmentUrls)
      .catch(err => {
        expect(err.name).to.deep.equal('InternalServerError');
      });
  });
});

describe('xerceCaseAttachments Service: Edit Attachments', () => {
  let sandbox;
  const agencyId = 1;
  const xerceCaseId = 2;
  const createdBy = 3;
  const editAttachmentIds = [4];
  const fileMetadataId = 5;
  const userId = 6;

  let responseObj;
  let result;
  let editCaseAttachmentReq;
  let transaction;
  let existingAttachments;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    transaction = sinon.stub();

    existingAttachments = [
      {
        id: 4,
        agencyId,
        xerceCaseId,
        fileMetadataId,
        createdAt: '2019-03-01T09:24:14.642Z',
        updatedAt: '2019-03-01T09:24:14.642Z',
        fileMetadata: {
          id: fileMetadataId,
          agencyId,
          title: 'This is PDF attachment ',
          description: 'This is a description',
          fileName: 'This is a file name1',
          fileSize: '20KB',
          fileURL:
            'https://cyberdyne-dev.s3.amazonaws.com/agency_1/cases/case_8/attachments/22_11_18_1_17_49.pdf',
          mimeType: 'application/pdf',
          createdBy: userId,
          updatedBy: userId,
          createdAt: '2019-03-01T09:24:14.642Z',
          updatedAt: '2019-03-01T09:24:14.642Z',
          save: () => Promise.resolve(),
        },
        save: () => Promise.resolve(),
      },
    ];

    responseObj = [
      {
        id: editAttachmentIds[0],
        title: 'This is updated PNG attachment ',
        description: 'This is updated description',
        fileName: 'This is a file name1',
        fileSize: '20KB',
        fileURL:
          'https://cyberdyne-dev.s3.amazonaws.com/agency_1/cases/case_8/attachments/22_11_18_1_17_49.pdf',
        contentType: 'PDF',
        createdBy: {
          id: createdBy,
          firstName: 'John',
          lastName: 'Doe',
        },
        updatedBy: {
          id: createdBy,
          firstName: 'John',
          lastName: 'Doe',
        },
        createdAt: '2019-03-01T09:24:14.642Z',
        updatedAt: '2019-03-01T09:24:14.642Z',
      },
    ];

    editCaseAttachmentReq = [
      {
        attachmentId: editAttachmentIds[0],
        title: 'This is updated PNG attachment ',
        description: 'This is updated description',
      },
    ];
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 with attachments details', async () => {
    sandbox
      .stub(db.XerceCaseAttachment, 'findAll')
      .withArgs({
        where: {
          agencyId,
          xerceCaseId,
          id: editAttachmentIds,
        },
        include: [
          {
            model: db.FileMetadata,
            as: 'fileMetadata',
          },
        ],
      })
      .returns(existingAttachments);

    sandbox.stub(DBUtil, 'createTransaction').resolves(transaction);

    sandbox
      .stub(XerceCaseHistoryService.prototype, 'createCaseAttachmentsHistory')
      .withArgs(
        CaseHistoryActions.ATTACHMENTS_ADDED,
        agencyId,
        createdBy,
        xerceCaseId,
        transaction,
        editCaseAttachmentReq,
        existingAttachments
      )
      .resolves(null);

    sandbox
      .stub(XerceCaseService.prototype, 'setUpdatedAt')
      .withArgs(agencyId, xerceCaseId, transaction);

    sandbox.stub(DBUtil, 'commitTransaction').withArgs(transaction);

    sandbox.stub(XerceCaseListingService.prototype, 'refreshCaseListing');

    sandbox
      .stub(XerceCaseAttachmentService.prototype, 'getAll')
      .withArgs(agencyId, xerceCaseId)
      .resolves(responseObj);

    result = await xerceCaseAttachmentService.edit(
      agencyId,
      xerceCaseId,
      userId,
      editCaseAttachmentReq
    );

    expect(result).to.deep.equal(responseObj, 'response did not match');
  });

  it('Should return status code 400 with InternalServerError', async () => {
    sandbox
      .stub(db.XerceCaseAttachment, 'findAll')
      .withArgs({
        where: {
          agencyId,
          xerceCaseId,
          id: editAttachmentIds,
        },
        include: [
          {
            model: db.FileMetadata,
            as: 'fileMetadata',
          },
        ],
      })
      .throws({ name: 'Error' });

    await xerceCaseAttachmentService
      .edit(agencyId, xerceCaseId, userId, editCaseAttachmentReq)
      .catch(err => {
        expect(err.name).to.deep.equal('InternalServerError');
      });
  });

  it('Should return status code 400 with InvalidRequestError when zero attachments ids are in request', async () => {
    editCaseAttachmentReq = [];

    await xerceCaseAttachmentService
      .edit(agencyId, xerceCaseId, userId, editCaseAttachmentReq)
      .catch(err => {
        expect(err.name).to.deep.equal('InvalidRequestError');
      });
  });

  it('Should return status code 400 with InvalidRequestError when duplicated ids are present in request', async () => {
    editCaseAttachmentReq = [
      {
        attachmentId: editAttachmentIds[0],
        title: 'This is updated PNG attachment ',
        description: 'This is updated description',
      },
      {
        attachmentId: editAttachmentIds[0],
        title: 'This is updated PNG attachment ',
        description: 'This is updated description',
      },
    ];

    await xerceCaseAttachmentService
      .edit(agencyId, xerceCaseId, userId, editCaseAttachmentReq)
      .catch(err => {
        expect(err.name).to.deep.equal('InvalidRequestError');
      });
  });

  it('Should return status code 400 with InvalidRequestError when attachment does not exist', async () => {
    sandbox
      .stub(db.XerceCaseAttachment, 'findAll')
      .withArgs({
        where: {
          agencyId,
          xerceCaseId,
          id: editAttachmentIds,
        },
        include: [
          {
            model: db.FileMetadata,
            as: 'fileMetadata',
          },
        ],
      })
      .returns([]);

    await xerceCaseAttachmentService
      .edit(agencyId, xerceCaseId, userId, editCaseAttachmentReq)
      .catch(err => {
        expect(err.name).to.deep.equal('InvalidRequestError');
      });
  });

  it('Should return status code 400 with InternalServerError when save operation fails', async () => {
    sandbox
      .stub(db.XerceCaseAttachment, 'findAll')
      .withArgs({
        where: {
          agencyId,
          xerceCaseId,
          id: editAttachmentIds,
        },
        include: [
          {
            model: db.FileMetadata,
            as: 'fileMetadata',
          },
        ],
      })
      .returns(existingAttachments);

    sandbox.stub(DBUtil, 'createTransaction').resolves(transaction);

    sandbox.stub(Promise, 'all').throws({ name: 'InternalServerError' });

    sandbox.stub(DBUtil, 'rollbackTransaction').withArgs(transaction);

    sandbox.stub(XerceCaseListingService.prototype, 'refreshCaseListing');

    await xerceCaseAttachmentService
      .edit(agencyId, xerceCaseId, userId, editCaseAttachmentReq)
      .catch(err => {
        expect(err.name).to.deep.equal('InternalServerError');
      });
  });
});

describe('xerceCaseAttachments Service: get method', () => {
  let sandbox;
  const agencyId = 1;
  const caseId = 2;
  const attachmentId = 3;
  const fileMetadataId = 5;
  const createdBy = 10;
  const updatedBy = 10;

  let attachment;
  let responseObj;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    attachment = {
      id: attachmentId,
      agencyId,
      xerceCaseId: caseId,
      fileMetadataId,
      createdAt: new Date('2019-03-01T09:24:14.642Z'),
      updatedAt: new Date('2019-03-01T09:24:14.642Z'),
      fileMetadata: {
        id: fileMetadataId,
        agencyId,
        title: 'This is PDF attachment',
        description: 'This is a description',
        fileName: 'This is a file name1',
        fileSize: '20KB',
        fileURL:
          'https://cyberdyne-dev.s3.amazonaws.com/agency_1/cases/case_8/attachments/22_11_18_1_17_49.pdf',
        mimeType: 'application/pdf',
        createdBy,
        updatedBy,
        createdAt: new Date('2019-03-01T09:24:14.642Z'),
        updatedAt: new Date('2019-03-01T09:24:14.642Z'),
      },
    };

    responseObj = {
      id: attachmentId,
      title: 'This is PDF attachment',
      description: 'This is a description',
      fileName: 'This is a file name1',
      fileSize: '20KB',
      fileURL:
        'https://cyberdyne-dev.s3.amazonaws.com/agency_1/cases/case_8/attachments/22_11_18_1_17_49.pdf',
      contentType: 'PDF',
      createdBy: {
        id: createdBy,
        firstName: 'John',
        lastName: 'Doe',
      },
      updatedBy: {
        id: createdBy,
        firstName: 'John',
        lastName: 'Doe',
      },
      createdAt: new Date('2019-03-01T09:24:14.642Z'),
      updatedAt: new Date('2019-03-01T09:24:14.642Z'),
    };
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 with attachment details', async () => {
    sandbox
      .stub(db.XerceCaseAttachment, 'findOne')
      .withArgs({
        where: {
          id: attachmentId,
          agencyId,
          xerceCaseId: caseId,
        },
        include: [
          {
            model: db.FileMetadata,
            as: 'fileMetadata',
            include: [
              {
                model: db.User,
                as: 'createdByUser',
              },
              {
                model: db.User,
                as: 'updatedByUser',
              },
            ],
          },
        ],
      })
      .returns(attachment);

    sandbox
      .stub(XerceCaseAttachmentService.prototype, 'createAttachmentRespObj')
      .withArgs(attachment)
      .returns(responseObj);

    const result = await xerceCaseAttachmentService.get(
      agencyId,
      caseId,
      attachmentId
    );

    expect(result).to.deep.equal(responseObj, 'response did not match');
  });

  it('Should return status code 400 with InternalServerError when fetching attachment', async () => {
    sandbox
      .stub(db.XerceCaseAttachment, 'findOne')
      .withArgs({
        where: {
          id: attachmentId,
          agencyId,
          xerceCaseId: caseId,
        },
        include: [
          {
            model: db.FileMetadata,
            as: 'fileMetadata',
            include: [
              {
                model: db.User,
                as: 'createdByUser',
              },
              {
                model: db.User,
                as: 'updatedByUser',
              },
            ],
          },
        ],
      })
      .throws({ name: 'Error' });

    await xerceCaseAttachmentService
      .get(agencyId, caseId, attachmentId)
      .catch(err => {
        expect(err.name).to.deep.equal('InternalServerError');
      });
  });

  it('Should return status code 400 with DBMissingEntityError when searching on invalid id', async () => {
    sandbox
      .stub(db.XerceCaseAttachment, 'findOne')
      .withArgs({
        where: {
          id: attachmentId,
          agencyId,
          xerceCaseId: caseId,
        },
        include: [
          {
            model: db.FileMetadata,
            as: 'fileMetadata',
            include: [
              {
                model: db.User,
                as: 'createdByUser',
              },
              {
                model: db.User,
                as: 'updatedByUser',
              },
            ],
          },
        ],
      })
      .returns(null);

    await xerceCaseAttachmentService
      .get(agencyId, caseId, attachmentId)
      .catch(err => {
        expect(err.name).to.deep.equal('DBMissingEntityError');
      });
  });
});

describe('xerceCaseAttachments Service: create method', () => {
  let sandbox;
  let transaction;
  const agencyId = 1;
  const xerceCaseId = 2;
  const createdBy = 3;
  const fileMetadataId = 6;
  const attachmentId = 15;
  const mimeType = 'application/pdf';
  let caseAttachmentReq: IXerceCaseAttachmentRequest[];
  let fileMetadata;
  let newFileMetadata;
  let caseAttachment;
  let newCaseAttachments;
  let responseObj;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    transaction = sinon.stub();

    caseAttachmentReq = [
      {
        title: 'This is PDF attachment ',
        description: 'This is a description',
        fileName: 'This is a file name1',
        fileSize: '20KB',
        fileURL:
          'https://cyberdyne-dev.s3.amazonaws.com/agency_1/cases/case_8/attachments/22_11_18_1_17_49.pdf',
      },
    ];

    newFileMetadata = fileMetadata = [
      {
        agencyId,
        title: 'This is PNG attachment ',
        description: 'this is a description',
        fileName: 'This is a file name1',
        fileSize: '20KB',
        fileURL:
          'https://cyberdyne-dev.s3.amazonaws.com/agency_1/cases/case_8/attachments/22_11_18_1_17_49.pdf',
        mimeType,
        createdBy,
        updatedBy: createdBy,
      },
    ];

    caseAttachment = [
      {
        agencyId,
        xerceCaseId,
        fileMetadataId,
      },
    ];

    newCaseAttachments = [
      {
        id: 20,
        agencyId,
        xerceCaseId,
        fileMetadataId,
      },
    ];

    responseObj = [
      {
        id: attachmentId,
        title: 'This is PNG attachment ',
        description: 'this is a description',
        fileName: 'This is a file name1',
        fileSize: '20KB',
        fileURL:
          'https://cyberdyne-dev.s3.amazonaws.com/agency_1/cases/case_8/attachments/22_11_18_1_17_49.pdf',
        contentType: 'PDF',
        createdBy: {
          id: createdBy,
          firstName: 'John',
          lastName: 'Doe',
        },
        updatedBy: {
          id: createdBy,
          firstName: 'John',
          lastName: 'Doe',
        },
        createdAt: new Date('2019-03-01T09:24:14.642Z'),
        updatedAt: new Date('2019-03-01T09:24:14.642Z'),
      },
    ];
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 200 and return case attachment details', async () => {
    sandbox
      .stub(mime, 'getType')
      .withArgs(caseAttachmentReq[0].fileURL)
      .returns(mimeType);

    sandbox
      .stub(XerceCaseAttachmentService.prototype, 'createFileMetadataObj')
      .withArgs(agencyId, createdBy, caseAttachmentReq)
      .resolves(fileMetadata);

    sandbox
      .stub(XerceCaseHistoryService.prototype, 'createCaseAttachmentsHistory')
      .withArgs(
        CaseHistoryActions.ATTACHMENTS_ADDED,
        agencyId,
        createdBy,
        xerceCaseId,
        transaction,
        caseAttachmentReq
      )
      .resolves(null);

    sandbox.stub(db.FileMetadata, 'bulkCreate').returns(newFileMetadata);

    sandbox
      .stub(XerceCaseAttachmentService.prototype, 'createAttachmentObj')
      .withArgs(agencyId, xerceCaseId, newFileMetadata)
      .resolves(caseAttachment);

    sandbox
      .stub(db.XerceCaseAttachment, 'bulkCreate')
      .resolves(newCaseAttachments);

    sandbox
      .stub(XerceCaseService.prototype, 'setUpdatedAt')
      .withArgs(agencyId, xerceCaseId, transaction);

    sandbox
      .stub(XerceCaseAttachmentService.prototype, 'getAll')
      .withArgs(agencyId, xerceCaseId)
      .returns(responseObj);

    sandbox.stub(XerceCaseListingService.prototype, 'refreshCaseListing');

    const result = await xerceCaseAttachmentService.create(
      agencyId,
      xerceCaseId,
      createdBy,
      caseAttachmentReq,
      transaction,
      false
    );

    expect(result).to.deep.equal(responseObj, 'response did not match');
  });

  it('Should return status code 400 and throws InvalidRequestError for invalid attachment file type', async () => {
    const invalidMimeType = 'application/json';

    sandbox
      .stub(mime, 'getType')
      .withArgs(caseAttachmentReq[0].fileURL)
      .returns(invalidMimeType);

    await xerceCaseAttachmentService
      .create(
        agencyId,
        xerceCaseId,
        createdBy,
        caseAttachmentReq,
        transaction,
        false
      )
      .catch(err => {
        expect(err.name).to.deep.equal('InvalidRequestError');
        expect(err.message).to.deep.equal('Invalid Attachment MIME Type');
      });
  });

  it('Should return status code 400 and throws SequelizeUniqueConstraintError', async () => {
    const errorMessage = 'File URL is invalid';

    sandbox
      .stub(mime, 'getType')
      .withArgs(caseAttachmentReq[0].fileURL)
      .returns(mimeType);

    sandbox
      .stub(S3Service.prototype, 'moveCaseAttachments')
      .withArgs(agencyId, xerceCaseId, caseAttachmentReq[0]);

    sandbox
      .stub(XerceCaseAttachmentService.prototype, 'createFileMetadataObj')
      .withArgs(agencyId, createdBy, caseAttachmentReq)
      .resolves(fileMetadata);

    sandbox.stub(db.FileMetadata, 'bulkCreate').throws({
      name: 'SequelizeUniqueConstraintError',
      errors: [{ message: errorMessage }],
    });

    sandbox
      .stub(XerceCaseService.prototype, 'setUpdatedAt')
      .withArgs(agencyId, xerceCaseId, transaction);

    sandbox
      .stub(S3Service.prototype, 'deleteObjects')
      .withArgs([caseAttachmentReq[0].fileURL]);

    await xerceCaseAttachmentService
      .create(
        agencyId,
        xerceCaseId,
        createdBy,
        caseAttachmentReq,
        transaction,
        false
      )
      .catch(err => {
        expect(err.name).to.deep.equal('DBConflictError');
        expect(err.message).to.deep.equal(
          `Failed to create case attachments. ${errorMessage}`
        );
      });
  });

  it('Should return status code 400 and throws SequelizeValidationError', async () => {
    const errorMessage =
      'Invalid argument attachments. String is too short (0 chars), minimum 1';

    sandbox
      .stub(mime, 'getType')
      .withArgs(caseAttachmentReq[0].fileURL)
      .returns(mimeType);

    sandbox
      .stub(S3Service.prototype, 'moveCaseAttachments')
      .withArgs(agencyId, xerceCaseId, caseAttachmentReq[0]);

    sandbox
      .stub(XerceCaseAttachmentService.prototype, 'createFileMetadataObj')
      .withArgs(agencyId, createdBy, caseAttachmentReq)
      .resolves(fileMetadata);

    sandbox.stub(db.FileMetadata, 'bulkCreate').throws({
      name: 'SequelizeValidationError',
      errors: [{ message: errorMessage }],
    });

    sandbox
      .stub(XerceCaseService.prototype, 'setUpdatedAt')
      .withArgs(agencyId, xerceCaseId, transaction);

    sandbox
      .stub(S3Service.prototype, 'deleteObjects')
      .withArgs([caseAttachmentReq[0].fileURL]);

    await xerceCaseAttachmentService
      .create(
        agencyId,
        xerceCaseId,
        createdBy,
        caseAttachmentReq,
        transaction,
        false
      )
      .catch(err => {
        expect(err.name).to.deep.equal('InvalidRequestError');
        expect(err.message).to.deep.equal(
          `Validation failed while trying to create case attachments. ${
            errorMessage
          }`
        );
      });
  });

  it('Should return status code 400 and throws InternalServerError', async () => {
    sandbox
      .stub(mime, 'getType')
      .withArgs(caseAttachmentReq[0].fileURL)
      .returns(mimeType);

    sandbox
      .stub(S3Service.prototype, 'moveCaseAttachments')
      .withArgs(agencyId, xerceCaseId, caseAttachmentReq[0]);

    sandbox
      .stub(XerceCaseAttachmentService.prototype, 'createFileMetadataObj')
      .withArgs(agencyId, createdBy, caseAttachmentReq)
      .resolves(fileMetadata);

    sandbox.stub(db.FileMetadata, 'bulkCreate').throws({
      name: 'Error',
    });

    sandbox
      .stub(XerceCaseService.prototype, 'setUpdatedAt')
      .withArgs(agencyId, xerceCaseId, transaction);

    sandbox
      .stub(S3Service.prototype, 'deleteObjects')
      .withArgs([caseAttachmentReq[0].fileURL]);

    await xerceCaseAttachmentService
      .create(
        agencyId,
        xerceCaseId,
        createdBy,
        caseAttachmentReq,
        transaction,
        false
      )
      .catch(err => {
        expect(err.name).to.deep.equal('InternalServerError');
      });
  });
});
