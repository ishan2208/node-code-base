import * as logger from 'winston';

import SystemIconService from '../../service/admin/systemIcon';

const systemIconService = new SystemIconService();

export const createSystemIcon = async (request, response) => {
  const requestBody: ISystemIconRequest = request.swagger.params.body.value;

  logger.info('Received request to create a system icon.');
  logger.debug(`Request body - ${JSON.stringify(requestBody)}`);

  let systemIcon: ISystemIcon;
  try {
    systemIcon = await systemIconService.createSystemIcon(requestBody.fileUrl);
    logger.info('Sending response to the client.');

    return response.status(201).json(systemIcon);
  } catch (error) {
    logger.info('Something went wrong.');

    return response.status(error.statusCode).json(error.statusMessage);
  }
};

export const getSystemIcons = async (request, response) => {
  logger.info('Received request to get all system icons.');

  let systemIcons: ISystemIcon[];
  try {
    systemIcons = await systemIconService.getSystemIcons();
    logger.info('Sending response to the client.');

    return response.status(200).json(systemIcons);
  } catch (error) {
    logger.info('Something went wrong.');

    return response.status(error.statusCode).json(error.statusMessage);
  }
};

export const getSystemIcon = async (request, response) => {
  const systemIconId: number = request.swagger.params.id.value;

  logger.info('Received request to get system icon.');
  logger.debug(`System Icon Id - ${JSON.stringify(systemIconId)}`);

  let systemIcon: ISystemIcon;
  try {
    systemIcon = await systemIconService.getSystemIcon(systemIconId);
    logger.info('Sending response to the client.');

    return response.status(200).json(systemIcon);
  } catch (error) {
    logger.info('Something went wrong.');

    return response.status(error.statusCode).json(error.statusMessage);
  }
};

export const getAvailableSystemIcons = async (request, response) => {
  logger.info('Received request to get all available system icons.');

  let systemIcons: ISystemIcon[];
  try {
    systemIcons = await systemIconService.getAvailableSystemIcons();
    logger.info('Sending response to the client.');

    return response.status(200).json(systemIcons);
  } catch (error) {
    logger.info('Something went wrong.');

    return response.status(error.statusCode).json(error.statusMessage);
  }
};
