import * as logger from 'winston';

import SystemXerceViolationTypeService from '../../service/admin/systemXerceViolationType';

const systemXerceViolationTypeService = new SystemXerceViolationTypeService();

export const createSystemXerceViolationType = async (request, response) => {
  const requestBody: ISystemXerceViolationTypeRequest =
    request.swagger.params.body.value;

  logger.info('Received request to create system xerce violation type.');
  logger.debug(`Request body - ${JSON.stringify(requestBody)}`);

  let systemXerceViolationType: ISystemXerceViolationType;
  try {
    systemXerceViolationType = await systemXerceViolationTypeService.createSystemXerceViolationType(
      requestBody
    );
  } catch (error) {
    logger.info('Something went wrong.');

    return response.status(error.statusCode).json(error.statusMessage);
  }

  logger.info('Sending response to the client.');

  return response.status(201).json(systemXerceViolationType);
};

export const getSystemXerceViolationTypes = async (request, response) => {
  logger.info('Received request to fetch system xerce violation types.');

  let systemXerceViolationTypes: ISystemXerceViolationType[];
  try {
    systemXerceViolationTypes = await systemXerceViolationTypeService.getSystemXerceViolationTypes();
  } catch (error) {
    logger.info('Something went wrong.');
    logger.info(error);

    return response.status(error.statusCode).json(error.statusMessage);
  }

  logger.info('Sending response to the client.');

  return response.status(200).json(systemXerceViolationTypes);
};

export const getSystemXerceViolationType = async (request, response) => {
  const violationTypeId: number = request.swagger.params.id.value;

  logger.info('Received request to fetch system xerce violation type.');
  logger.debug(`Violation Type Id - ${violationTypeId}`);

  let systemXerceViolationType: ISystemXerceViolationType;
  try {
    systemXerceViolationType = await systemXerceViolationTypeService.getSystemXerceViolationType(
      violationTypeId
    );
  } catch (error) {
    logger.info('Something went wrong.');
    logger.info(error);

    return response.status(error.statusCode).json(error.statusMessage);
  }

  logger.info('Sending response to the client.');

  return response.status(200).json(systemXerceViolationType);
};

export const editSystemXerceViolationType = async (request, response) => {
  const violationTypeId: number = request.swagger.params.id.value;
  const requestBody: ISystemXerceViolationTypeEditRequest =
    request.swagger.params.body.value;

  logger.info('Received request to edit system xerce violation Type.');
  logger.debug(`Violation Type Id - ${violationTypeId}`);
  logger.debug(`Request body - ${JSON.stringify(requestBody)}`);

  let systemXerceViolationType: ISystemXerceViolationType;
  try {
    systemXerceViolationType = await systemXerceViolationTypeService.editSystemXerceViolationType(
      violationTypeId,
      requestBody
    );
  } catch (error) {
    logger.info('Something went wrong.');
    logger.info(error);

    return response.status(error.statusCode).json(error.statusMessage);
  }

  logger.info('Sending response to the client.');

  return response.status(200).json(systemXerceViolationType);
};
