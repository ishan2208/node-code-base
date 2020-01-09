import { Transaction } from 'sequelize';
import * as logger from 'winston';

import config from '../../../config';
import {
  DBConflictError,
  DBMissingEntityError,
  InternalServerError,
  InvalidRequestError,
} from '../../errors';
import db from '../../models';
import DBUtil from '../../utils/dbUtil';
import CaseRoleService from '../agencySetup/configCaseRole';
import ConfigDispositionService from '../agencySetup/configDisposition';
import S3Service from '../common/s3';
import ProductLayoutService from '../productLayout';
import UserPermissionService from '../user/userPermission';
import XerceCaseListingService from '../xerce/caseListing';
import ConfigXerceEntitySectionService from './configXerceEntitySection';
import ConfigXerceViolationTypeService from './configXerceViolationType';
import XerceService from './xerce';

const s3Service = new S3Service();

interface IAgencyResult {
  rows: IAgencyInstance[];
  count: number;
}

export default class AgencyService {
  public ComcateAgencyId = 0;
  //TODO: check if it can be done in single DB call
  public async create(
    admin: IComcateAdminClaim,
    agencyReq: IAgencyConfigurationRequest
  ): Promise<IAgencyConfiguration> {
    logger.info('Service called to create an agency');

    const newAgency = await this.createAgencyConfigurationObj(
      agencyReq,
      admin.id
    );

    const transaction = await DBUtil.createTransaction();

    let agency: IAgencyInstance = null;
    try {
      agency = await db.Agency.create(newAgency, {
        include: [
          {
            model: db.AgencyLocation,
            as: 'locations',
          },
          {
            model: db.Xerce,
            as: 'xerce',
          },
        ],
        transaction,
      });

      let configXerceViolationTypes: IConfigXerceViolationTypeInstance[] = [];
      if (agencyReq.xerce && agencyReq.xerce.violationTypes.length > 0) {
        configXerceViolationTypes = await new ConfigXerceViolationTypeService().createViolationType(
          agency.id,
          agency.xerce.id,
          agencyReq.xerce.violationTypes,
          transaction
        );

        agency.xerce.configXerceViolationTypes = configXerceViolationTypes;
      } else if (
        agencyReq.xerce &&
        agencyReq.xerce.violationTypes.length === 0
      ) {
        const errMsg = 'No Violation Type exist while creating xerce';
        logger.error(errMsg);

        throw new InvalidRequestError(errMsg);
      }

      // Add default dispositions, case role and update product layout
      if (agency.xerce) {
        await this.createDefaultConfiguration(
          agency.id,
          agency.xerce.id,
          transaction
        );
      }

      logger.info('Created a new agency');
    } catch (error) {
      await DBUtil.rollbackTransaction(transaction);
      if (error.name === 'SequelizeUniqueConstraintError') {
        const errorMsg = 'Agency exists already.';
        logger.info('Conflict while trying to create the agency');

        throw new DBConflictError(errorMsg);
      } else if (error.name === 'SequelizeValidationError') {
        const errorMsg = 'Validation failed while trying to create the agency';
        logger.info('Validation failed while trying to create the agency');

        throw new InvalidRequestError(errorMsg);
      } else {
        const errMsg = 'Error while creating the Agency';
        logger.error(errMsg);
        logger.error(error);

        throw new InternalServerError(errMsg);
      }
    }
    await DBUtil.commitTransaction(transaction);

    const responseObj = this.createAgencyConfigurationRespObj(agency);

    logger.info('Created response object');
    logger.debug(`Response object - ${JSON.stringify(responseObj)}`);

    return responseObj;
  }

  // TODO: modify API to get number entities
  public async getAll(
    agencyStatus: string,
    searchTerm: string,
    sortBy: AgencySortColumn,
    columnSortOrder: SortOrder,
    limit: number,
    offset: number
  ): Promise<IAgencyList> {
    logger.info('Service called to fetch the agencies');

    const options = this.createSearchQueryForAgencies(agencyStatus, searchTerm);

    let order: any = null;
    let sortOrder: SortOrder = SortOrder.DESC;
    if (sortBy) {
      sortOrder = columnSortOrder ? columnSortOrder : sortOrder;
      order = db.sequelize.literal(`"${sortBy}" ${sortOrder}`);
    }

    let agencies: IAgencyResult = null;
    try {
      agencies = await db.Agency.findAndCountAll({
        where: options,
        order,
        offset,
        limit,
        attributes: ['id', 'name', 'isActive', 'createdAt'],
        include: [
          {
            model: db.ConfigXerceEntitySection,
            as: 'entitySections',
            attributes: ['id'],
            where: { isActive: true },
            required: false,
          },
          {
            model: db.XerceCase,
            as: 'xerceCases',
            attributes: ['id'],
          },
          {
            model: db.AgencyLocation,
            as: 'locations',
            where: { isAgencyAddress: true },
          },
        ],
        distinct: true,
      });

      logger.info('Fetched agencies from the DB');
    } catch (error) {
      logger.error('Unknown error');
      logger.error(error);

      throw new InternalServerError();
    }

    const responseObj = this.createAgencyListRespObj(agencies);
    logger.debug(`Response Object - ${JSON.stringify(responseObj)}`);

    return responseObj;
  }

  public async getAgencyIds(): Promise<IAgencyInstance[]> {
    logger.info('Service called to fetch all agencies ids');

    let agencies: IAgencyInstance[] = [];
    try {
      agencies = await db.Agency.findAll({
        attributes: ['id'],
      });

      logger.info('Fetched agencies from the DB');
    } catch (error) {
      logger.error('Unknown error');
      logger.error(error);

      throw new InternalServerError();
    }

    return agencies;
  }

  public async getConfiguration(
    agencyId: number,
    transaction: Transaction = null
  ): Promise<IAgencyConfiguration> {
    logger.info('Service called to fetch an agency configuration.');

    let agency: IAgencyInstance = null;
    try {
      agency = await db.Agency.findOne({
        where: { id: agencyId },
        include: [
          {
            model: db.AgencyLocation,
            as: 'locations',
            where: { isAgencyAddress: true },
          },
          {
            model: db.Xerce,
            as: 'xerce',
            include: [
              {
                model: db.ConfigXerceViolationType,
                as: 'configXerceViolationTypes',
              },
            ],
          },
        ],
        transaction,
      });

      logger.info('Fetched agency configuration from the DB');
    } catch (error) {
      const errMsg = 'Error while getting the agency configuration details';
      logger.error(errMsg);
      logger.error(error);

      throw new InternalServerError(errMsg);
    }

    if (!agency) {
      logger.info('Agency not found.');
      const errMsg = 'Could not find the agency';

      throw new DBMissingEntityError(errMsg);
    }

    const responseObj = this.createAgencyConfigurationRespObj(agency);

    logger.info('Created response object');
    logger.debug(`Response Object - ${JSON.stringify(responseObj)}`);

    return responseObj;
  }

  public async getInformation(agencyId: number): Promise<IAgencyInformation> {
    logger.info('Service called to fetch an agency information.');

    const agency = await this.getRecord(agencyId);

    const responseObj = this.createAgencyInformationRespObj(agency);

    logger.info('Created response object');
    logger.debug(`Response Object - ${JSON.stringify(responseObj)}`);

    return responseObj;
  }

  public async getAgencyName(agencyId: number): Promise<IAgencyName> {
    logger.info('Service called to fetch an agency name.');

    let agency: IAgencyInstance = null;
    try {
      agency = await db.Agency.findOne({
        attributes: ['id', 'name'],
        where: {
          id: agencyId,
          isActive: true,
        },
      });

      logger.info('Fetched agency information from the DB');
    } catch (error) {
      const errMsg = 'Error while getting the agency information.';
      logger.error(errMsg);
      logger.error(error);

      throw new InternalServerError(errMsg);
    }

    let responseObj: IAgencyName = null;

    if (agency) {
      responseObj = {
        id: agency.id,
        name: agency.name,
      };
    }

    return responseObj;
  }

  public async editConfiguration(
    agencyId: number,
    agencyReq: IAgencyConfigurationEditRequest
  ): Promise<IAgencyConfiguration> {
    logger.info('Service called to edit an agency configuration');

    let existingAgency: IAgencyInstance;
    try {
      existingAgency = await db.Agency.findOne({
        where: {
          id: agencyId,
        },
        include: [
          {
            model: db.AgencyLocation,
            as: 'locations',
            where: { isAgencyAddress: true },
          },
          {
            model: db.Xerce,
            as: 'xerce',
            include: [
              {
                model: db.ConfigXerceViolationType,
                as: 'configXerceViolationTypes',
                include: [
                  {
                    model: db.ConfigXerceEntitySection,
                    as: 'configEntitySection',
                  },
                ],
              },
            ],
          },
        ],
      });
    } catch (error) {
      const errMsg = 'Error while fetching the agency';
      logger.error(errMsg);
      logger.error(error);

      throw new InternalServerError(errMsg);
    }

    if (!existingAgency) {
      const errMsg = 'Agency Id not found';
      logger.error(errMsg);

      throw new DBMissingEntityError(errMsg);
    }

    const updatedAgency = this.editAgencyConfigurationObj(
      existingAgency,
      agencyReq
    );

    const agencyLocation = this.editAgencyLocationObj(
      existingAgency.locations[0],
      agencyReq
    );

    const transaction = await DBUtil.createTransaction();
    try {
      if (!existingAgency.xerce && agencyReq.hasOwnProperty('xerce')) {
        // if product is not created at the time of agency creation and if we
        // receive request in edit mode then create product
        const xerce = await new XerceService().createXerceProduct(
          agencyId,
          agencyReq.xerce,
          transaction
        );

        // create config xerce violation types of product
        await new ConfigXerceViolationTypeService().createViolationType(
          agencyId,
          xerce.id,
          agencyReq.xerce.violationTypes,
          transaction
        );

        // Add default dispositions and case role
        await this.createDefaultConfiguration(agencyId, xerce.id, transaction);

        // Update product layout
        await new XerceService().updateConfigurations(agencyId, transaction);

        // mark agency status as active/inactive if product is active/inactive
        updatedAgency.isActive = agencyReq.xerce.isActive;
      }

      // TODO: check if it can be done in one operation
      await agencyLocation.save({ transaction });
      if (updatedAgency.xerce) {
        // If product is already there then update the config violation type status
        const systemXerceViolationTypes = await new ConfigXerceViolationTypeService().validateAndFetchSystemXerceViolationTypes(
          agencyReq.xerce.violationTypes
        );

        await updatedAgency.xerce.save({ transaction });

        // Add the entity section if not already added for the violation type
        // Also update the entity section status based on VT status
        const configXerceEntitySectionService = new ConfigXerceEntitySectionService();
        await configXerceEntitySectionService.updateConfigXerceViolationTypesAndEntities(
          agencyId,
          updatedAgency,
          systemXerceViolationTypes,
          transaction
        );

        // if violation type is activated and not present in
        // userXerceViolationTypePermission then add it
        await new UserPermissionService().validateAndAddUserViolationTypePermission(
          agencyId,
          updatedAgency.xerce.configXerceViolationTypes,
          transaction
        );

        // update config violations based on violation type status
        for (const updatedVT of updatedAgency.xerce.configXerceViolationTypes) {
          await db.ConfigXerceViolation.update(
            {
              isActive: updatedVT.isActive,
            },
            {
              where: {
                agencyId,
                configViolationTypeId: updatedVT.id,
              },
              transaction,
            }
          );
        }

        // Update product layout
        await new XerceService().updateConfigurations(agencyId, transaction);
      }
      await updatedAgency.save({ transaction });

      logger.info('Agency Configuration updated successfully.');
    } catch (error) {
      await DBUtil.rollbackTransaction(transaction);

      if (error.name === 'SequelizeUniqueConstraintError') {
        logger.info('Conflict while trying to update the agency');

        const errorMsg = `Failed to update agency. ${error.errors[0].message}`;
        throw new DBConflictError(errorMsg);
      } else if (error.name === 'SequelizeValidationError') {
        logger.info('Validation failed while trying to update the agency');

        const errorMsg = 'Validation failed while trying to update the agency';
        throw new InvalidRequestError(errorMsg);
      } else {
        logger.error('Failed to update the agency.');
        logger.error(error);
        throw new InternalServerError();
      }
    }

    await DBUtil.commitTransaction(transaction);

    return this.getConfiguration(agencyId);
  }

  public async editInformation(
    agencyId: number,
    agencyReq: IAgencyInformationEditRequest
  ): Promise<IAgencyInformation> {
    logger.info('Service called to edit an agency information');

    const existingAgency = await this.getRecord(agencyId);

    if (
      agencyReq.hasOwnProperty('agencyLogoURL') &&
      agencyReq.agencyLogoURL.length > 0 &&
      existingAgency.agencyLogoURL !== agencyReq.agencyLogoURL
    ) {
      agencyReq.agencyLogoURL = await s3Service.moveImageFile(
        agencyId,
        agencyReq.agencyLogoURL,
        S3Operation.AGENCY_CONFIG
      );
    }

    const updatedAgency = this.editAgencyInformationObj(
      existingAgency,
      agencyReq
    );

    const agencyLocation = this.editAgencyLocationObj(
      existingAgency.locations[0],
      agencyReq
    );

    const transaction = await DBUtil.createTransaction();
    try {
      await agencyLocation.save({ transaction });
      await updatedAgency.save({ transaction });

      logger.info('Agency Information updated successfully.');
    } catch (error) {
      await DBUtil.rollbackTransaction(transaction);

      if (error.name === 'SequelizeUniqueConstraintError') {
        logger.info('Conflict while trying to update the agency information');
        const errorMsg = `Failed to update agency. ${error.errors[0].message}`;

        throw new DBConflictError(errorMsg);
      } else if (error.name === 'SequelizeValidationError') {
        const errMsg =
          'Validation failed while trying to update the agency info';
        logger.error(errMsg);
        logger.error(`${error.errors[0].message}`);

        throw new InvalidRequestError(errMsg);
      } else {
        logger.error('Failed to update the agency info.');
        logger.error(error);

        throw new InternalServerError();
      }
    }

    if (updatedAgency.agencyLogoURL) {
      await new XerceService().updateConfigurations(agencyId, transaction);
    }

    await DBUtil.commitTransaction(transaction);

    return this.getInformation(agencyId);
  }

  public async getRecord(agencyId: number): Promise<IAgencyInstance> {
    logger.info('Service called to get an agency record');

    let agency: IAgencyInstance = null;
    try {
      agency = await db.Agency.findOne({
        where: { id: agencyId },
        include: [
          {
            model: db.AgencyLocation,
            as: 'locations',
            where: { isAgencyAddress: true },
          },
        ],
      });

      logger.info('Fetched agency information from the DB');
    } catch (error) {
      const errMsg = 'Error while getting the agency information.';
      logger.error(errMsg);
      logger.error(error);

      throw new InternalServerError(errMsg);
    }

    if (!agency) {
      logger.info('Agency not found.');
      const errMsg = 'Could not find the agency';

      throw new DBMissingEntityError(errMsg);
    }

    return agency;
  }

  public async getActiveAgencies(): Promise<IActiveAgencyList> {
    logger.info('Service called to fetch active agencies');

    let activeAgencies: IAgencyInstance[] = null;
    try {
      activeAgencies = await db.Agency.findAll({
        where: {
          isActive: true,
        },
        attributes: ['id', 'name'],
        order: ['name'],
      });

      logger.info('Fetched active agencies from the DB');
    } catch (error) {
      const errMsg = 'Error while fetching the active agencies';
      logger.error(errMsg);
      logger.error(error);

      throw new InternalServerError(errMsg);
    }

    const responseObj = this.createActiveAgencyListRespObj(activeAgencies);
    logger.debug(`Response Object - ${JSON.stringify(responseObj)}`);

    return responseObj;
  }

  public async getAgencyProducts(
    agencyId: number
  ): Promise<IAgencyProductList> {
    logger.info('Service called to fetch agency products.');

    let agency: IAgencyInstance = null;
    try {
      agency = await db.Agency.findOne({
        where: { id: agencyId },
        include: [
          {
            model: db.Xerce,
            as: 'xerce',
            attributes: ['id', 'name', 'isActive'],
          },
        ],
      });

      logger.info('Fetched agency products from the DB');
    } catch (error) {
      const errMsg = 'Error while getting the agency products.';
      logger.error(errMsg);
      logger.error(error);

      throw new InternalServerError(errMsg);
    }

    if (!agency) {
      logger.info('Agency not found.');
      const errMsg = 'Could not find the agency';

      throw new DBMissingEntityError(errMsg);
    }

    const responseObj = this.createAgencyProductListRespObj(agency);

    logger.info('Created response object');
    logger.debug(`Response Object - ${JSON.stringify(responseObj)}`);

    return responseObj;
  }

  public async updateConfigurations() {
    logger.info('Service called to update existing agencies configuration');

    let activeAgencies: IAgencyInstance[] = [];
    try {
      activeAgencies = await db.Agency.findAll({
        where: {
          isActive: true,
        },
        attributes: ['id'],
      });
    } catch (error) {
      const errMsg = 'Error while fetching the existing agencies';
      logger.error(errMsg);
      logger.error(error);

      throw new InternalServerError(errMsg);
    }

    const xerceService = new XerceService();
    for (const agency of activeAgencies) {
      await xerceService.updateConfigurations(agency.id);
      logger.info(`Configurations updated for agency id - ${agency.id}`);
    }
  }

  public async updateProductLayout() {
    logger.info('Service called to update existing agences product layout');

    const productLayout = await new ProductLayoutService().getfixedPageEntities();

    let xerceInstances: IXerceInstance[];
    try {
      xerceInstances = await db.Xerce.findAll({
        attributes: ['id', 'productLayout'],
      });
    } catch (error) {
      const errMsg = 'Error while fetching the productLayout';
      logger.error(errMsg);
      logger.error(error);

      throw new InternalServerError(errMsg);
    }

    for (const xerce of xerceInstances) {
      xerce.productLayout.sectionSequence = productLayout;

      await db.Xerce.update(
        { productLayout: xerce.productLayout },
        {
          where: {
            id: xerce.id,
          },
        }
      );
    }
  }

  public async getExistingFileURL(
    agencyId: number,
    column: string
  ): Promise<string> {
    let agency: IAgencyInstance = null;

    if (
      column !== 'agencyParcelFileURL' &&
      column !== 'agencyBoundaryFileURL'
    ) {
      logger.error('Invalid column');

      throw new InternalServerError();
    }

    try {
      agency = await db.Agency.findOne({
        where: {
          id: agencyId,
        },
        attributes: [column],
      });
    } catch (error) {
      logger.error('Unknown error');
      logger.error(error);

      throw new InternalServerError();
    }

    if (!agency) {
      const errMsg = 'Agency not found';
      logger.error(errMsg);

      throw new DBMissingEntityError(errMsg);
    }

    const fileURL =
      column === 'agencyParcelFileURL'
        ? agency.agencyParcelFileURL
        : agency.agencyBoundaryFileURL;

    return fileURL;
  }

  private async createDefaultConfiguration(
    agencyId: number,
    xerceId: number,
    transaction: Transaction
  ) {
    const caseRoleRequest: ICaseRoleRequest = {
      label: DefaultCaseRole.OWNER,
      isActive: true,
    };
    const isDefault = true;

    await new CaseRoleService().create(
      agencyId,
      xerceId,
      caseRoleRequest,
      isDefault,
      transaction
    );

    const updateConfigurations = false;
    const dispositionsReq = new ConfigDispositionService().getDefaultCompliantDispositionsObj();

    await new ConfigDispositionService().create(
      agencyId,
      xerceId,
      dispositionsReq[0],
      updateConfigurations,
      transaction
    );

    await new ConfigDispositionService().create(
      agencyId,
      xerceId,
      dispositionsReq[1],
      updateConfigurations,
      transaction
    );

    await new XerceService().updateConfigurations(agencyId, transaction);

    await new XerceCaseListingService().create(agencyId, transaction);
  }

  private async createAgencyConfigurationObj(
    agency: IAgencyConfigurationRequest,
    adminId: number
  ): Promise<IAgencyAttributes> {
    let email = null;
    if (agency.hasOwnProperty('email') && agency.email.length !== 0) {
      email = agency.email;
    }

    let whitelistURL = null;
    if (
      agency.hasOwnProperty('whitelistURL') &&
      agency.whitelistURL.length !== 0
    ) {
      whitelistURL = agency.whitelistURL;
    }

    let isActive = false;
    if (agency.hasOwnProperty('xerce') && agency.xerce.isActive) {
      isActive = true;
    }

    let xerce: IXerceAttributes = null;
    if (agency.hasOwnProperty('xerce')) {
      xerce = await new XerceService().createXerceObj(agency.xerce);
    }

    const locations: IAgencyLocationAttributes[] = [
      {
        streetAddress: agency.streetAddress,
        city: agency.city,
        state: agency.state,
        zip: agency.zip,
        isAgencyAddress: true,
      },
    ];

    const newAgency: IAgencyAttributes = {
      name: agency.name,
      websiteURL: agency.websiteURL,
      email,
      isActive,
      whitelistURL,
      agencyTimezone: agency.agencyTimezone,
      hasParcelLayer: false,
      locations,
      xerce,
      adminId,
    };

    return newAgency;
  }

  private editAgencyConfigurationObj(
    existingAgency: IAgencyInstance,
    agencyReq: IAgencyConfigurationEditRequest
  ): IAgencyInstance {
    if (agencyReq.hasOwnProperty('name')) {
      existingAgency.name = agencyReq.name;
    }

    if (agencyReq.hasOwnProperty('websiteURL')) {
      existingAgency.websiteURL = agencyReq.websiteURL;
    }

    if (agencyReq.hasOwnProperty('email')) {
      existingAgency.email = agencyReq.email;
    }

    if (
      agencyReq.hasOwnProperty('whitelistURL') &&
      agencyReq.whitelistURL.length === 0
    ) {
      existingAgency.whitelistURL = null;
    } else if (
      agencyReq.hasOwnProperty('whitelistURL') &&
      agencyReq.whitelistURL.length > 0
    ) {
      existingAgency.whitelistURL = agencyReq.whitelistURL;
    }

    // mark agency status as active/inactive if product is active/inactive
    if (existingAgency.xerce && agencyReq.hasOwnProperty('xerce')) {
      existingAgency.isActive = agencyReq.xerce.isActive;
    }

    if (agencyReq.hasOwnProperty('agencyTimezone')) {
      existingAgency.agencyTimezone = agencyReq.agencyTimezone;
    }

    if (existingAgency.xerce && agencyReq.hasOwnProperty('xerce')) {
      const updatedXerce = new XerceService().editXerceObj(
        existingAgency.xerce,
        agencyReq.xerce
      );

      existingAgency.xerce = updatedXerce;
    }

    return existingAgency;
  }

  private editAgencyInformationObj(
    existingAgency: IAgencyInstance,
    agencyReq: IAgencyInformationEditRequest
  ): IAgencyInstance {
    if (agencyReq.hasOwnProperty('email')) {
      existingAgency.email = agencyReq.email;
    }

    if (
      agencyReq.hasOwnProperty('agencyLogoURL') &&
      agencyReq.agencyLogoURL.length === 0
    ) {
      existingAgency.agencyLogoURL = null;
    } else if (
      agencyReq.hasOwnProperty('agencyLogoURL') &&
      agencyReq.agencyLogoURL.length > 0
    ) {
      existingAgency.agencyLogoURL = agencyReq.agencyLogoURL;
    }

    if (
      agencyReq.hasOwnProperty('whitelistURL') &&
      agencyReq.whitelistURL.length === 0
    ) {
      existingAgency.whitelistURL = null;
    } else if (
      agencyReq.hasOwnProperty('whitelistURL') &&
      agencyReq.whitelistURL.length > 0
    ) {
      existingAgency.whitelistURL = agencyReq.whitelistURL;
    }

    if (agencyReq.hasOwnProperty('agencyTimezone')) {
      existingAgency.agencyTimezone = agencyReq.agencyTimezone;
    }

    return existingAgency;
  }

  private editAgencyLocationObj(
    agencyLocation: IAgencyLocationInstance,
    agencyReq: IAgencyConfigurationEditRequest | IAgencyInformationEditRequest
  ): IAgencyLocationInstance {
    if (agencyReq.hasOwnProperty('streetAddress')) {
      agencyLocation.streetAddress = agencyReq.streetAddress;
    }

    if (agencyReq.hasOwnProperty('city')) {
      agencyLocation.city = agencyReq.city;
    }

    if (agencyReq.hasOwnProperty('state')) {
      agencyLocation.state = agencyReq.state;
    }

    if (agencyReq.hasOwnProperty('zip')) {
      agencyLocation.zip = agencyReq.zip;
    }

    return agencyLocation;
  }

  private createAgencyConfigurationRespObj(
    agencyObj: IAgencyInstance
  ): IAgencyConfiguration {
    let xerce: IXerce = null;
    if (agencyObj.xerce) {
      xerce = new XerceService().createXerceRespObj(agencyObj.xerce);
    }

    const agency: IAgencyConfiguration = {
      id: agencyObj.id,
      name: agencyObj.name,
      websiteURL: agencyObj.websiteURL,
      email: agencyObj.email,
      streetAddress: agencyObj.locations[0].streetAddress,
      city: agencyObj.locations[0].city,
      state: agencyObj.locations[0].state,
      zip: agencyObj.locations[0].zip,
      agencyTimezone: agencyObj.agencyTimezone,
      isActive: agencyObj.isActive,
      hasParcelLayer: agencyObj.hasParcelLayer,
      whitelistURL: agencyObj.whitelistURL,
      xerce,
    };

    return agency;
  }

  private createAgencyInformationRespObj(
    agencyObj: IAgencyInstance
  ): IAgencyInformation {
    const agency: IAgencyInformation = {
      id: agencyObj.id,
      name: agencyObj.name,
      email: agencyObj.email,
      agencyTimezone: agencyObj.agencyTimezone,
      whitelistURL: agencyObj.whitelistURL,
      websiteURL: agencyObj.websiteURL,
      agencyLogoURL: agencyObj.agencyLogoURL,
      streetAddress: agencyObj.locations[0].streetAddress,
      city: agencyObj.locations[0].city,
      state: agencyObj.locations[0].state,
      zip: agencyObj.locations[0].zip,
    };

    return agency;
  }

  private createAgencyListRespObj(agencies: IAgencyResult): IAgencyList {
    const data: IAgencySummary[] = [];
    agencies.rows.map(agency => {
      // TODO: get admin name after user's implementation
      const createdBy = 'Comcate Support';

      const status = agency.isActive
        ? ObjectStatus.ACTIVE
        : ObjectStatus.INACTIVE;

      // TODO: to be implemented in ticket 'login to agency as comcate admin'
      const loginUrl = `${config.host.url}/agencies/${agency.id}`;

      data.push({
        id: agency.id,
        name: agency.name,
        createdBy,
        totalCases: agency.xerceCases.length || 0,
        totalEntities: agency.entitySections.length || 0,
        status,
        loginUrl,
        createdAt: agency.createdAt,
      });
    });

    const response: IAgencyList = {
      count: agencies.count,
      data,
    };

    return response;
  }

  private createActiveAgencyListRespObj(
    agencies: IAgencyInstance[]
  ): IActiveAgencyList {
    const activeAgencies: IActiveAgency[] = [];

    for (const agency of agencies) {
      activeAgencies.push({
        id: agency.id,
        name: agency.name,
      });
    }

    const response: IActiveAgencyList = {
      agencies: activeAgencies,
    };

    return response;
  }

  private createAgencyProductListRespObj(
    agency: IAgencyInstance
  ): IAgencyProductList {
    const products: IAgencyProduct[] = [];
    if (agency.xerce) {
      products.push({
        id: agency.xerce.id,
        name: agency.xerce.name,
        productType: ProductType.XERCE,
        isActive: agency.xerce.isActive,
      });
    }

    const productList: IAgencyProductList = {
      products,
    };

    return productList;
  }

  private createSearchQueryForAgencies(
    agencyStatus: string,
    searchTerm: string
  ): any {
    let options: any = {};

    if (searchTerm) {
      const searchFilter = `%${searchTerm}%`;

      options = {
        [db.Sequelize.Op.or]: [
          db.sequelize.where(
            db.sequelize.cast(db.sequelize.col('Agency.id'), 'text'),
            { [db.Sequelize.Op.iLike]: searchFilter }
          ),
          db.sequelize.where(
            db.sequelize.fn(
              'to_char',
              db.sequelize.fn(
                'to_date',
                db.sequelize.cast(
                  db.sequelize.col('Agency.created_at'),
                  'varchar'
                ),
                'YYYY-MM-DD'
              ),
              'MM/DD/YYYY'
            ),
            { [db.Sequelize.Op.iLike]: searchFilter }
          ),
          {
            name: {
              [db.Sequelize.Op.iLike]: searchFilter,
            },
          },
        ],
      };
    }

    let isActive: boolean = null;
    if (agencyStatus) {
      isActive = agencyStatus === ObjectStatus.ACTIVE ? true : false;
    }

    if (isActive !== null) {
      options.isActive = isActive;
    }

    options.id = {
      [db.Sequelize.Op.gt]: 0,
    };

    return options;
  }
}
