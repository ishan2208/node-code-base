import * as _ from 'lodash';
import * as logger from 'winston';

import { InvalidRequestError } from '../errors';

import XerceCaseViolationService from '../service/xerce/xerceCaseViolation';

export default class AuthUtil {
  public static async hasMinPermissions(
    requiredCaseACLs: ViolationTypeACL[],
    userProfile: IAgencyUserClaim | ISuperAdminClaim,
    caseId: number
  ): Promise<boolean> {
    logger.info('Service called to check user permission');

    if (requiredCaseACLs.length > 0) {
      if (
        !userProfile.scopes.hasOwnProperty('xerce') ||
        !userProfile.scopes.xerce
      ) {
        const errMsg = `User don't have product access`;
        logger.error(errMsg);

        throw new InvalidRequestError(errMsg);
      }

      // Get the case violations
      const xerceCaseViolationSerice = new XerceCaseViolationService();
      const xerceCaseViolations = await xerceCaseViolationSerice.getAllInstance(
        userProfile.agencyId,
        caseId
      );

      const ACLRank = ['READ_ONLY', 'BASIC', 'OVERWRITE'];
      if (xerceCaseViolations.length > 0) {
        const appliedViolationTypeIds = xerceCaseViolations.map(
          violation => violation.configViolationTypeId
        );

        const routeACLRank = ACLRank.indexOf(requiredCaseACLs[0]);

        const violationTypeRanks = appliedViolationTypeIds.map(id => {
          const violationTypeAccess =
            userProfile.scopes.xerce.violationTypeScope[id].violationTypeAccess;

          return ACLRank.indexOf(violationTypeAccess);
        });

        const minRank = _.min(violationTypeRanks);

        if (routeACLRank <= minRank) {
          logger.info('User Authorized to make this call.');

          return true;
        } else {
          return false;
        }
      } else {
        // If no violations are applied on the case then user will be unauthorized
        // if and only if user has READ_ONLY access to all the violation types.

        logger.info('No violations applied on the case.');

        if (this.isUserReadOnly(userProfile)) {
          const errMsg = 'User is not authorized to make this call';
          logger.warn(errMsg);

          return false;
        }

        return true;
      }
    }

    return true;
  }

  public static isUserReadOnly(
    userProfile: IAgencyUserClaim | ISuperAdminClaim
  ): boolean {
    logger.info(
      'Service called to check if user has read only permission to all Violation Types'
    );
    const ACLRank = ['READ_ONLY', 'BASIC', 'OVERWRITE'];
    const userViolationTypeRanks: number[] = [];
    for (const violationTypeId in userProfile.scopes.xerce.violationTypeScope) {
      if (
        userProfile.scopes.xerce.violationTypeScope.hasOwnProperty(
          violationTypeId
        )
      ) {
        const violationTypeAccess =
          userProfile.scopes.xerce.violationTypeScope[violationTypeId]
            .violationTypeAccess;

        userViolationTypeRanks.push(ACLRank.indexOf(violationTypeAccess));
      }
    }

    if (
      _.max(userViolationTypeRanks) ===
      ACLRank.indexOf(ViolationTypeACL.READ_ONLY)
    ) {
      return true;
    }

    return false;
  }
}
