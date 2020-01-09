import 'mocha';

import { expect } from 'chai';
import * as httpMocks from 'node-mocks-http';
import * as sinon from 'sinon';
import { create } from '../../../api/controllers/agencySetup/configMunicipalCode';
import { AppError } from '../../../api/errors';
import ConfigMunicipalCodeService from '../../../api/service/agencySetup/configMunicipalCode';

describe('Test create municipal code Controller', () => {
  let requestBody;
  let responseBody;
  let request;
  let response;
  let sandbox;
  let errorMessage;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    requestBody = {
      articleNumber: '1.2.1',
      description: '1.0.0 decription',
      resolutionAction: 'another chunk of text',
    };

    responseBody = {
      id: 1,
      articleNumber: '1.2.1',
      description: '1.0.0 decription',
      resolutionAction: 'another chunk of text',
    };

    request = httpMocks.createRequest({
      method: 'POST',
      url: '/agencies/1/products/1/config/municipal-codes',
      swagger: {
        params: {
          agencyId: {
            value: 1,
          },
          productId: {
            value: 1,
          },
          body: {
            value: requestBody,
          },
        },
      },
    });

    response = httpMocks.createResponse();

    errorMessage = 'Error occurred while testing';
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  it('Should return status code 201 with municipal code details', async () => {
    sandbox
      .stub(ConfigMunicipalCodeService.prototype, 'create')
      .callsFake(() => {
        return Object.assign({}, responseBody);
      });

    await create(request, response);

    expect(response.statusCode).to.equal(201);
    expect(JSON.parse(response._getData())).to.deep.equal(
      responseBody,
      'body did not match'
    );
  });

  it('Should return status 400 if an exception occurs', async () => {
    sinon.stub(ConfigMunicipalCodeService.prototype, 'create').callsFake(() => {
      throw new AppError(errorMessage, 400);
    });

    await create(request, response);

    expect(response.statusCode).to.equal(400);
    expect(JSON.parse(response._getData())).to.deep.equal(
      { message: errorMessage },
      'response body did not match'
    );
  });
});
