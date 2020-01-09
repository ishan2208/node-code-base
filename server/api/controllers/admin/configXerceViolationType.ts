import * as logger from 'winston';

import ConfigXerceViolationTypeService from '../../service/admin/configXerceViolationType';

const configXerceviolationTypeService = new ConfigXerceViolationTypeService();

export const getConfigXerceViolationTypes = async (request, response) => {
  const user: IAgencyUserClaim | ISuperAdminClaim = request.user;
  const violationTypeStatus: ObjectStatus = request.swagger.params.status.value;

  logger.info('Received request to fetch config xerce violations types.');
  logger.debug(`Agency Id - ${user.agencyId}`);
  logger.debug(`User - ${JSON.stringify(user)}`);
  logger.debug(`Status - ${violationTypeStatus}`);

  try {
    const configXerceViolationTypes = await configXerceviolationTypeService.getViolationTypes(
      user.agencyId,
      violationTypeStatus
    );
    logger.info('Sending response to the client.');

    return response.status(200).json(configXerceViolationTypes);
  } catch (error) {
    logger.info('Something went wrong.');
    logger.info(error);

    return response.status(error.statusCode).json(error.statusMessage);
  }
};

export const getConfigXerceViolationType = async (request, response) => {
  const agencyId: number = request.swagger.params.agencyId.value;
  const configXerceViolationTypeId: number = request.swagger.params.id.value;

  logger.info('Received request to fetch config xerce violation type.');
  logger.debug(`Agency Id - ${agencyId}`);
  logger.debug(
    `Config Xerce Violation Type Id - ${configXerceViolationTypeId}`
  );

  try {
    const configXerceViolationType = await configXerceviolationTypeService.getViolationType(
      agencyId,
      configXerceViolationTypeId
    );
    logger.info('Sending response to the client.');

    return response.status(200).json(configXerceViolationType);
  } catch (error) {
    logger.info('Something went wrong.');
    logger.info(error);

    return response.status(error.statusCode).json(error.statusMessage);
  }
};

export const getUnlinkedViolationTypes = async (request, response) => {
  const agencyId: number = request.swagger.params.agencyId.value;

  logger.info('Received request to fetch config xerce violations types.');
  logger.debug(`Agency Id - ${agencyId}`);

  try {
    const configXerceViolationTypes = await configXerceviolationTypeService.getUnlinkedViolationTypes(
      agencyId
    );
    logger.info('Sending response to the client.');

    return response.status(200).json(configXerceViolationTypes);
  } catch (error) {
    logger.info('Something went wrong.');
    logger.info(error);

    return response.status(error.statusCode).json(error.statusMessage);
  }
};
