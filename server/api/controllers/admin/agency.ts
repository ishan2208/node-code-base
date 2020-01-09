import * as logger from 'winston';

import AgencyService from '../../service/admin/agency';
import XerceService from '../../service/admin/xerce';

const agencyService: AgencyService = new AgencyService();
const xerceService: XerceService = new XerceService();

export const create = async (request, response) => {
  const requestBody: IAgencyConfigurationRequest =
    request.swagger.params.body.value;
  const admin: IComcateAdminClaim = request.user;

  logger.info('Received request to create agency.');
  logger.debug(`Request body - ${JSON.stringify(requestBody)}`);
  logger.debug(`User - ${JSON.stringify(admin)}`);

  try {
    const newAgency = await agencyService.create(admin, requestBody);
    logger.info('Sending response to the client.');

    return response.status(201).json(newAgency);
  } catch (error) {
    logger.info('Something went wrong.');

    return response.status(error.statusCode).json(error.statusMessage);
  }
};

export const getAll = async (request, response) => {
  logger.info('Received request to fetch agencies.');

  const agencyStatus: string = request.swagger.params.status.value;
  const searchTerm: string = request.swagger.params.q.value;
  const sortBy: AgencySortColumn = request.swagger.params.sortBy.value;
  const sortOrder: SortOrder = request.swagger.params.sortOrder.value;
  const limit: number = request.swagger.params.limit.value;
  const offset: number = request.swagger.params.offset.value;

  logger.debug(`Agency Status - ${agencyStatus}`);
  logger.debug(`Search Term - ${searchTerm}`);
  logger.debug(`Sort By - ${sortBy}`);
  logger.debug(`Sort Order - ${sortOrder}`);
  logger.debug(`limit - ${limit}`);
  logger.debug(`offset - ${offset}`);

  try {
    const agencies = await agencyService.getAll(
      agencyStatus,
      searchTerm,
      sortBy,
      sortOrder,
      limit,
      offset
    );
    logger.info('Sending response to the client.');

    return response.status(200).json(agencies);
  } catch (error) {
    logger.info('Something went wrong.');
    logger.info(error);

    return response.status(error.statusCode).json(error.statusMessage);
  }
};

export const getConfiguration = async (request, response) => {
  const agencyId: number = request.swagger.params.agencyId.value;

  logger.info('Received request to get an agency configuration.');
  logger.debug(`Agency Id - ${agencyId}`);

  try {
    const agency = await agencyService.getConfiguration(agencyId);
    logger.info('Sending response to the client.');

    return response.status(200).json(agency);
  } catch (error) {
    logger.info('Something went wrong.');
    logger.info(error);

    return response.status(error.statusCode).json(error.statusMessage);
  }
};

export const getInformation = async (request, response) => {
  const user: IAgencyUserClaim | ISuperAdminClaim = request.user;

  logger.info('Received request to get an agency information.');
  logger.debug(`User - ${JSON.stringify(user)}`);
  logger.debug(`Agency Id - ${user.agencyId}`);

  try {
    const agency = await agencyService.getInformation(user.agencyId);
    logger.info('Sending response to the client.');

    return response.status(200).json(agency);
  } catch (error) {
    logger.info('Something went wrong.');
    logger.info(error);

    return response.status(error.statusCode).json(error.statusMessage);
  }
};

export const getAgencyName = async (request, response) => {
  const agencyId: number = request.swagger.params.agencyId.value;

  logger.info('Received request to get agency name.');
  logger.debug(`Agency Id - ${agencyId}`);

  try {
    const agency = await agencyService.getAgencyName(agencyId);
    logger.info('Sending response to the client.');

    return response.status(200).json(agency);
  } catch (error) {
    logger.info('Something went wrong.');
    logger.info(error);

    return response.status(error.statusCode).json(error.statusMessage);
  }
};

export const editConfiguration = async (request, response) => {
  const agencyId: number = request.swagger.params.agencyId.value;
  const requestBody: IAgencyConfigurationEditRequest =
    request.swagger.params.body.value;

  logger.info('Received request to edit an agency configuration.');
  logger.debug(`Request body - ${JSON.stringify(requestBody)}`);
  logger.debug(`Agency Id - ${agencyId}`);

  try {
    const agency = await agencyService.editConfiguration(agencyId, requestBody);
    logger.info('Sending response to the client.');

    return response.status(200).json(agency);
  } catch (error) {
    logger.info('Something went wrong.');
    logger.info(error);

    return response.status(error.statusCode).json(error.statusMessage);
  }
};

export const editInformation = async (request, response) => {
  const user: IAgencyUserClaim | ISuperAdminClaim = request.user;
  const requestBody: IAgencyInformationEditRequest =
    request.swagger.params.body.value;

  logger.info('Received request to edit an agency information.');
  logger.debug(`User - ${JSON.stringify(user)}`);
  logger.debug(`Request body - ${JSON.stringify(requestBody)}`);
  logger.debug(`Agency Id - ${user.agencyId}`);

  try {
    const agency = await agencyService.editInformation(
      user.agencyId,
      requestBody
    );
    logger.info('Sending response to the client.');

    return response.status(200).json(agency);
  } catch (error) {
    logger.info('Something went wrong.');
    logger.info(error);

    return response.status(error.statusCode).json(error.statusMessage);
  }
};

export const getActiveAgencies = async (request, response) => {
  logger.info('Received request to fetch active agencies.');

  try {
    const agencies = await agencyService.getActiveAgencies();
    logger.info('Sending response to the client.');

    return response.status(200).json(agencies);
  } catch (error) {
    logger.info('Something went wrong.');
    logger.info(error);

    return response.status(error.statusCode).json(error.statusMessage);
  }
};

export const getAgencyProducts = async (request, response) => {
  const user: IAgencyUserClaim | ISuperAdminClaim = request.user;

  logger.info('Received request to fetch agency products.');
  logger.info(`Agency Id - ${user.agencyId}`);
  logger.info(`User - ${JSON.stringify(user)}`);

  try {
    const products = await agencyService.getAgencyProducts(user.agencyId);
    logger.info('Sending response to the client.');

    return response.status(200).json(products);
  } catch (error) {
    logger.info('Something went wrong.');
    logger.info(error);

    return response.status(error.statusCode).json(error.statusMessage);
  }
};

export const updateConfigurations = async (request, response) => {
  logger.info(
    'Received request to update configuration for existing agencies.'
  );

  try {
    await agencyService.updateConfigurations();
    logger.info('Sending response to the client.');

    return response.status(200).json({ response: 'ok' });
  } catch (error) {
    logger.info('Something went wrong.');
    logger.info(error);

    return response.status(error.statusCode).json(error.statusMessage);
  }
};

export const updateProductLayout = async (request, response) => {
  logger.info(
    'Received request to update configuration for existing agencies.'
  );

  try {
    await agencyService.updateProductLayout();
    logger.info('Sending response to the client.');

    return response.status(200).json({ response: 'ok' });
  } catch (error) {
    logger.info('Something went wrong.');
    logger.info(error);

    return response.status(error.statusCode).json(error.statusMessage);
  }
};

export const updateConfiguredCaseNumber = async (request, response) => {
  logger.info('Received request to update configured case numbers');

  try {
    await xerceService.updateConfiguredCaseNumber();
    logger.info('Sending response to the client.');

    return response.status(200).json({ response: 'ok' });
  } catch (error) {
    logger.info('Something went wrong.');
    logger.info(error);

    return response.status(error.statusCode).json(error.statusMessage);
  }
};
