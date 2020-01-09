import * as logger from 'winston';

import SystemXerceEntitySectionService from '../../service/admin/systemXerceEntitySection';

const systemXerceEntitySectionService = new SystemXerceEntitySectionService();

export const createSystemXerceEntitySection = async (request, response) => {
  const requestBody: ISystemXerceEntitySectionRequest =
    request.swagger.params.body.value;

  logger.info('Received request to create system xerce entity section.');
  logger.debug(`Request body - ${JSON.stringify(requestBody)}`);

  let systemXerceEntitySection: ISystemXerceEntitySection;
  try {
    systemXerceEntitySection = await systemXerceEntitySectionService.createSystemXerceEntitySection(
      requestBody
    );
  } catch (error) {
    logger.info('Something went wrong.');

    return response.status(error.statusCode).json(error.statusMessage);
  }

  logger.info('Sending response to the client.');

  return response.status(201).json(systemXerceEntitySection);
};

export const getSystemXerceEntitySections = async (request, response) => {
  logger.info('Received request to fetch system xerce entity sections.');

  let systemXerceEntitySections: ISystemXerceEntitySection[];
  try {
    systemXerceEntitySections = await systemXerceEntitySectionService.getSystemXerceEntitySections();
  } catch (error) {
    logger.info('Something went wrong.');
    logger.info(error);

    return response.status(error.statusCode).json(error.statusMessage);
  }

  logger.info('Sending response to the client.');

  return response.status(200).json(systemXerceEntitySections);
};

export const getSystemXerceEntitySection = async (request, response) => {
  const entitySectionId: number = request.swagger.params.id.value;

  logger.info('Received request to fetch system xerce entity section.');
  logger.debug(`entity section Id - ${entitySectionId}`);

  let systemXerceEntitySection: ISystemXerceEntitySection;
  try {
    systemXerceEntitySection = await systemXerceEntitySectionService.getSystemXerceEntitySection(
      entitySectionId
    );
  } catch (error) {
    logger.info('Something went wrong.');
    logger.info(error);

    return response.status(error.statusCode).json(error.statusMessage);
  }

  logger.info('Sending response to the client.');

  return response.status(200).json(systemXerceEntitySection);
};
