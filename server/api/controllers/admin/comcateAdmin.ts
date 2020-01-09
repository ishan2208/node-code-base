import * as logger from 'winston';

import ComcateAdminService from '../../service/admin/comcateAdmin';

const comcateAdminService: ComcateAdminService = new ComcateAdminService();

export const adminLogin = async (request, response) => {
  const requestBody: ILoginRequest = request.swagger.params.body.value;

  logger.info('Received request for admin login');
  logger.debug(`Request body - ${JSON.stringify(requestBody)}`);

  try {
    const token = await comcateAdminService.loginAdmin(requestBody);
    logger.info('Sending the token to the user.');
    logger.debug(`Token - ${JSON.stringify(token)}`);

    return response.status(200).json(token);
  } catch (error) {
    logger.info('Login failed.');
    logger.debug(error);

    return response.status(error.statusCode).json(error.statusMessage);
  }
};

export const superAdminLogin = async (request, response) => {
  const agencyId: number = request.swagger.params.agencyId.value;
  const userClaims: IComcateAdminClaim = request.user;

  logger.info('Received request to login comcate admin as super admin');
  logger.debug(`Agency Id - ${agencyId}`);

  try {
    const token = await comcateAdminService.superAdminLogin(
      agencyId,
      userClaims
    );
    logger.info('Sending the token to the user.');
    logger.debug(`Token - ${JSON.stringify(token)}`);

    return response.status(200).json(token);
  } catch (error) {
    logger.info('Login failed.');
    logger.debug(error);

    return response.status(error.statusCode).json(error.statusMessage);
  }
};
