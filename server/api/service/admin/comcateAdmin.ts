import * as logger from 'winston';

import {
  DBMissingEntityError,
  ExpiredAccountError,
  InternalServerError,
  InvalidRequestError,
} from '../../errors';
import db from '../../models';
import LoginService from '../common/loginService';
import AgencyService from './agency';
import ConfigXerceViolationTypeService from './configXerceViolationType';

export default class ComcateAdminService {
  public async loginAdmin(adminCreds: ILoginRequest): Promise<ILoginResponse> {
    const loginService: LoginService = new LoginService();
    logger.info('Received request for admin login');

    let admin: IComcateAdminInstance = null;
    try {
      admin = await db.ComcateAdmin.findOne({
        where: {
          email: {
            [db.Sequelize.Op.iLike]: adminCreds.email.trim(),
          },
        },
        attributes: [
          'firstName',
          'lastName',
          'email',
          'id',
          'password',
          'isActive',
        ],
      });

      logger.debug(`Admin instance - ${JSON.stringify(admin)}`);
    } catch (error) {
      logger.error('Something went wrong while fetching admin details.');
      logger.error(error);

      throw new InternalServerError();
    }

    if (!admin) {
      logger.info('Admin account not found.');

      const errMsg = 'Could not find the account';
      throw new DBMissingEntityError(errMsg);
    }

    if (!admin.isActive) {
      throw new ExpiredAccountError();
    }

    const claim = this.createComcateAdminClaim(admin);
    logger.debug(`Admin claims - ${JSON.stringify(claim)}`);

    const token = loginService.authenticate(
      adminCreds.password,
      admin.password,
      claim
    );
    logger.info('Successfully created JWT token.');
    logger.debug(`JWT Token - ${token}`);

    return { token };
  }

  public async superAdminLogin(
    agencyId: number,
    userClaims: IComcateAdminClaim
  ): Promise<ILoginResponse> {
    logger.info('Service called to get super admin claims for an agency');

    const existingAgency = await new AgencyService().getConfiguration(agencyId);

    if (!existingAgency.isActive) {
      const errMsg = 'Agency is inactive';
      logger.error(errMsg);

      throw new InvalidRequestError(errMsg);
    }

    let user: IUserInstance = null;
    try {
      user = await db.User.findOne({
        where: {
          agencyId: 0,
        },
        attributes: ['id', 'firstName', 'lastName', 'email'],
      });
    } catch (error) {
      const errMsg = 'Error while fetching the super user';
      logger.error(errMsg);
      logger.error(error);

      throw new InternalServerError(error.errors[0].message);
    }

    if (!user) {
      const errMsg = 'Super User not found';
      logger.error(errMsg);

      throw new DBMissingEntityError(errMsg);
    }

    const timezone = new LoginService().agencyTimezoneAmplification(
      existingAgency.agencyTimezone
    );

    const superAdminClaims: ISuperAdminClaim = {
      id: user.id,
      agencyId,
      agencyName: existingAgency.name,
      email: user.email,
      firstName: user.firstName,
      middleName: userClaims.middleName,
      lastName: user.lastName,
      agencyTimezone: timezone,
      scopes: {
        superAdmin: true,
      },
    };

    if (existingAgency.xerce) {
      const violationTypes = await new ConfigXerceViolationTypeService().getViolationTypes(
        agencyId
      );

      const violationTypeScope: IViolationTypeScope = {};
      violationTypes.map(violationType => {
        violationTypeScope[violationType.id] = {
          violationTypeAccess: ViolationTypeACL.OVERWRITE,
          isActive: violationType.isActive,
        };
      });

      superAdminClaims.scopes.xerce = {
        id: existingAgency.xerce.id,
        productAdmin: true,
        reportAccess: ReportAccess.ALL_STAFF,
        dashboardAccess: DashboardAccess.ALL_STAFF_DASHBOARD,
        feesAccess: FeesAccess.CAN_VOID,
        violationTypeScope,
      };
    }

    const loginService = new LoginService();
    const token = loginService.signComcateAdminJWT(superAdminClaims);

    return { token };
  }

  public async refreshComcateAdminJWTClaim(
    comcateAdminClaim: IComcateAdminClaim
  ): Promise<string> {
    const admin = await this.getComcateAdmin(comcateAdminClaim.id);

    if (!admin.isActive) {
      const errMsg = `Admin's account has been deactivated`;
      logger.info(errMsg);

      throw new ExpiredAccountError(errMsg);
    }

    const claim = this.createComcateAdminClaim(admin);
    logger.debug(`Admin claims - ${JSON.stringify(claim)}`);

    const loginService = new LoginService();
    const token = loginService.signComcateAdminJWT(claim);

    return token;
  }

  public async refreshSuperAdminJWTClaim(
    superAdminClaim: ISuperAdminClaim
  ): Promise<string> {
    const agency = await new AgencyService().getConfiguration(
      superAdminClaim.agencyId
    );

    if (!agency.isActive) {
      const errMsg = 'Agency is inactive';
      logger.error(errMsg);

      throw new InvalidRequestError(errMsg);
    }

    const admin = await this.getComcateAdmin(superAdminClaim.id);

    if (!admin.isActive) {
      const errMsg = `Admin's account has been deactivated`;
      logger.info(errMsg);

      throw new ExpiredAccountError(errMsg);
    }

    const refreshedSuperAdminClaim = await this.createSuperAdminClaim(
      agency,
      admin
    );

    const token = new LoginService().signComcateAdminJWT(
      refreshedSuperAdminClaim
    );

    return token;
  }

  private async getComcateAdmin(
    comcateAdminId: number
  ): Promise<IComcateAdminInstance> {
    let admin: IComcateAdminInstance = null;
    try {
      admin = await db.ComcateAdmin.findOne({
        where: { id: comcateAdminId },
        attributes: ['firstName', 'lastName', 'email', 'id', 'isActive'],
      });

      logger.debug(`Admin instance - ${JSON.stringify(admin)}`);
    } catch (error) {
      logger.error('Something went wrong while fetching admin details.');
      logger.error(error);

      throw new InternalServerError();
    }

    if (!admin) {
      const errMsg = 'Could not find the account';
      logger.info(errMsg);

      throw new DBMissingEntityError(errMsg);
    }

    return admin;
  }

  private createComcateAdminClaim(
    admin: IComcateAdminInstance
  ): IComcateAdminClaim {
    const claim: IComcateAdminClaim = {
      id: admin.id,
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      scopes: { comcateAdmin: true },
    };

    return claim;
  }

  private async createSuperAdminClaim(
    agency: IAgencyConfiguration,
    admin: IComcateAdminInstance
  ): Promise<ISuperAdminClaim> {
    let user: IUserInstance = null;
    try {
      user = await db.User.findOne({
        where: {
          agencyId: 0,
        },
        attributes: ['id', 'firstName', 'lastName', 'email'],
      });
    } catch (error) {
      const errMsg = 'Error while fetching the super user';
      logger.error(errMsg);
      logger.error(error);

      throw new InternalServerError(error.errors[0].message);
    }

    if (!user) {
      const errMsg = 'Super User not found';
      logger.error(errMsg);

      throw new DBMissingEntityError(errMsg);
    }

    const timezone = new LoginService().agencyTimezoneAmplification(
      agency.agencyTimezone
    );

    const superAdminClaim: ISuperAdminClaim = {
      id: user.id,
      agencyId: agency.id,
      agencyName: agency.name,
      email: user.email,
      firstName: admin.firstName,
      lastName: user.lastName,
      agencyTimezone: timezone,
      scopes: {
        superAdmin: true,
      },
    };

    if (agency.xerce) {
      const violationTypes = await new ConfigXerceViolationTypeService().getViolationTypes(
        agency.id
      );

      const violationTypeScope: IViolationTypeScope = {};
      violationTypes.map(violationType => {
        violationTypeScope[violationType.id] = {
          violationTypeAccess: ViolationTypeACL.OVERWRITE,
          isActive: violationType.isActive,
        };
      });

      superAdminClaim.scopes.xerce = {
        id: agency.xerce.id,
        productAdmin: true,
        reportAccess: ReportAccess.ALL_STAFF,
        dashboardAccess: DashboardAccess.ALL_STAFF_DASHBOARD,
        feesAccess: FeesAccess.CAN_VOID,
        violationTypeScope,
      };
    }

    return superAdminClaim;
  }
}
