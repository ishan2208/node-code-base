import * as _ from 'lodash';
import * as logger from 'winston';

import {
  InternalServerError,
  InvalidRequestError,
  StaffPermissionError,
} from '../errors';
import AuthUtil from '../utils/authUtil';

// This function checks if only the allowed admin scopes are given in the route.
const verifySwaggerRouteAdminScope = (routeAdminScopes: string[]): boolean => {
  const allowedAdminScopes = [
    'comcateAdmin',
    'siteAdmin',
    'productAdmin',
    'productAccess',
  ];

  for (const routeAdminScope of routeAdminScopes) {
    if (!allowedAdminScopes.includes(routeAdminScope)) {
      return false;
    }
  }

  return true;
};

const verifySwaggerRouteACL = (
  allowedACL: string[],
  acls: string[]
): boolean => {
  let isValidACL = true;
  acls.map(acl => {
    if (!allowedACL.includes(acl)) {
      isValidACL = false;
    }
  });

  if (isValidACL) {
    return true;
  } else {
    return false;
  }
};

const authentication = (request, response) => {
  logger.debug('Authenticating Admin Scopes');

  const requiredAdminScopes =
    request.swagger.operation['x-authz-admin-scope'] || [];
  logger.debug(`Route admin scopes (from swagger) - ${requiredAdminScopes}`);

  // Verify if the correct route admin privilege.
  if (
    requiredAdminScopes.length > 0 &&
    !verifySwaggerRouteAdminScope(requiredAdminScopes)
  ) {
    const errMsg = 'Incorrect admin scope for this route';
    logger.error(errMsg);

    throw new InternalServerError(errMsg);
  }

  // Verify the user's claims.
  const userProfile: IComcateAdminClaim | IAgencyUserClaim | ISuperAdminClaim =
    request.user;
  const claims: IAuthScope = userProfile.scopes;
  logger.debug(`Claims - ${JSON.stringify(claims)}`);

  const errorMessage = 'Unauthorized operation.';
  if (!claims) {
    const errMsg = 'Found no claims in the JWT token.';
    logger.info(errMsg);

    throw new InvalidRequestError(errorMessage);
  }

  // Created the data structure necessary to process the claims.
  let isAuthorized = true;
  if (requiredAdminScopes.length > 0) {
    // Authorize the call if the scope matches any route scope.
    isAuthorized = false;
    for (const adminScope of requiredAdminScopes) {
      if (adminScope === AdminScopes.COMCATE_ADMIN) {
        if (
          AdminScopes.COMCATE_ADMIN in claims &&
          claims[AdminScopes.COMCATE_ADMIN]
        ) {
          isAuthorized = true;
          break;
        }
      }

      if (adminScope === AdminScopes.SITE_ADMIN) {
        if (
          (AdminScopes.SUPER_ADMIN in claims &&
            claims[AdminScopes.SUPER_ADMIN]) ||
          (AdminScopes.SITE_ADMIN in claims && claims[AdminScopes.SITE_ADMIN])
        ) {
          isAuthorized = true;
          break;
        }
      }

      // // Super admin has xerce scope so that the middleware can block the
      // // call if the xerce is not activated or doesn't exist.
      if (adminScope === AdminScopes.PRODUCT_ADMIN) {
        if (claims.xerce && claims.xerce.productAdmin) {
          isAuthorized = true;
          break;
        }
      }

      if (adminScope === AdminScopes.PRODUCT_ACCESS) {
        if (claims.xerce) {
          isAuthorized = true;
          break;
        }
      }
    }
  }

  if (isAuthorized) {
    logger.info('User Authorized to make this call.');
  } else {
    logger.warn('User is not authorized to make this call');

    throw new StaffPermissionError(errorMessage);
  }
};

// Check if the users has minimum ACL permission to access route
const validateCaseACL = async (request, response) => {
  const allowedACL = ['READ_ONLY', 'BASIC', 'OVERWRITE'];
  const requiredCaseACLs = request.swagger.operation['x-xerce-case-acl'] || [];
  logger.debug(`Route ACL scopes (from swagger) - ${requiredCaseACLs}`);

  if (
    requiredCaseACLs.length > 0 &&
    !verifySwaggerRouteACL(allowedACL, requiredCaseACLs)
  ) {
    const errMsg = 'Incorrect ACL scope for this route';
    logger.error(errMsg);

    throw new InternalServerError(errMsg);
  }

  if (requiredCaseACLs.length > 0) {
    const userProfile: IAgencyUserClaim | ISuperAdminClaim = request.user;
    const caseId = request.swagger.params.caseId.value;

    const hasMinPermission = await AuthUtil.hasMinPermissions(
      requiredCaseACLs,
      userProfile,
      caseId
    );

    if (!hasMinPermission) {
      const errMsg = 'User is not authorized to make this call';
      logger.warn(errMsg);

      throw new StaffPermissionError(errMsg);
    }
  }
};

// Check if the users has minimum Reports ACL permission to access reports
const validateReportACL = (request, response) => {
  const allowedACL = ['NO_ACCESS', 'SELF_REPORTS', 'ALL_STAFF'];

  const requiredReportACLs =
    request.swagger.operation['x-xerce-reports-acl'] || [];
  logger.debug(
    `Route Report ACL scopes (from swagger) - ${requiredReportACLs}`
  );

  if (
    requiredReportACLs.length > 0 &&
    !verifySwaggerRouteACL(allowedACL, requiredReportACLs)
  ) {
    const errMsg = 'Incorrect Report ACL scope for this route';
    logger.error(errMsg);

    throw new InternalServerError(errMsg);
  }

  if (requiredReportACLs.length > 0) {
    const userProfile: IAgencyUserClaim | ISuperAdminClaim = request.user;

    const routeReportACLRank = allowedACL.indexOf(requiredReportACLs[0]);

    const userReportACLPermission = userProfile.scopes.xerce.reportAccess;
    const userPermissionRank = allowedACL.indexOf(userReportACLPermission);

    if (userPermissionRank < routeReportACLRank) {
      const errMsg = 'User is not alllowed to view reports';
      logger.error(errMsg);

      throw new InvalidRequestError(errMsg);
    }

    logger.info('Valid Access for reports');
  }
};

export const JWT = async (request, response, next) => {
  logger.info(`Request: ${request.method}, ${request.path}`);
  try {
    authentication(request, response);
  } catch (error) {
    logger.error(JSON.stringify(error));

    return response.status(error.statusCode).send(error.statusMessage);
  }

  try {
    await validateCaseACL(request, response);
  } catch (error) {
    logger.error(JSON.stringify(error));

    return response.status(error.statusCode).send(error.statusMessage);
  }

  try {
    await validateReportACL(request, response);
  } catch (error) {
    logger.error(JSON.stringify(error));

    return response.status(error.statusCode).send(error.statusMessage);
  }

  next();
};
