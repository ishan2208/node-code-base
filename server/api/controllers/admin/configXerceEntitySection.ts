import * as logger from 'winston';

import ConfigXerceEntitySectionService from '../../service/admin/configXerceEntitySection';

const configEntitySectionService = new ConfigXerceEntitySectionService();

export const create = async (request, response) => {
  const admin: IComcateAdminClaim = request.user;
  const agencyId: number = request.swagger.params.agencyId.value;
  const requestBody: IConfigXerceEntitySectionRequest =
    request.swagger.params.body.value;

  logger.info('Received request to create a entity section.');
  logger.debug(`Admin - ${JSON.stringify(admin)}`);
  logger.debug(`Agency Id - ${agencyId}`);
  logger.debug(`Request body - ${JSON.stringify(requestBody)}`);

  let entitySection: IConfigXerceEntitySection;
  try {
    entitySection = await configEntitySectionService.create(
      agencyId,
      requestBody
    );
    logger.info('Sending response to the client.');

    return response.status(201).json(entitySection);
  } catch (error) {
    logger.info('Something went wrong.');

    return response.status(error.statusCode).json(error.statusMessage);
  }
};

export const getAll = async (request, response) => {
  const agencyId: number = request.swagger.params.agencyId.value;

  logger.info('Received request to fetch all config xerce entity sections.');
  logger.debug(`Agency Id - ${agencyId}`);

  let sections: IConfigXerceEntitySection[];
  try {
    sections = await configEntitySectionService.getAll(agencyId);
    logger.info('Sending response to the client.');

    return response.status(200).json(sections);
  } catch (error) {
    logger.info('Something went wrong.');
    logger.info(error);

    return response.status(error.statusCode).json(error.statusMessage);
  }
};

export const get = async (request, response) => {
  const agencyId: number = request.swagger.params.agencyId.value;
  const entitySectionId: number = request.swagger.params.id.value;

  logger.info('Received request to fetch entity section section.');
  logger.debug(`Agency Id - ${agencyId}`);
  logger.debug(`Entity Section Id - ${entitySectionId}`);

  try {
    let section: IConfigXerceEntitySection;
    section = await configEntitySectionService.get(agencyId, entitySectionId);
    logger.info('Sending response to the client.');

    return response.status(200).json(section);
  } catch (error) {
    logger.info('Something went wrong.');
    logger.info(error);

    return response.status(error.statusCode).json(error.statusMessage);
  }
};

export const edit = async (request, response) => {
  const admin: IComcateAdminClaim = request.user;
  const agencyId: number = request.swagger.params.agencyId.value;
  const entitySectionId: number = request.swagger.params.id.value;
  const requestBody: IConfigXerceEntitySectionEditRequest =
    request.swagger.params.body.value;

  logger.info('Received request to edit config xerce entity section.');
  logger.debug(`Admin - ${JSON.stringify(admin)}`);
  logger.debug(`Agency Id - ${agencyId}`);
  logger.debug(`Entity Section Id - ${entitySectionId}`);
  logger.debug(`Request body - ${JSON.stringify(requestBody)}`);

  try {
    let section: IConfigXerceEntitySection;
    section = await configEntitySectionService.edit(
      agencyId,
      entitySectionId,
      requestBody
    );
    logger.info('Sending response to the client.');

    return response.status(200).json(section);
  } catch (error) {
    logger.info('Something went wrong.');
    logger.info(error);

    return response.status(error.statusCode).json(error.statusMessage);
  }
};
