import * as _ from 'lodash';
import { Transaction } from 'sequelize';
import * as logger from 'winston';

import db from '../../api/models';
import { InternalServerError, InvalidRequestError } from '../errors';
import ValidationUtil from '../utils/validationUtil';

export default class SequenceUtil {
  public static async editSequence(
    agencyId: number,
    xerceId: number,
    sequenceEditRequest: ISequenceEditRequest,
    tableNameStr: string,
    transaction: Transaction
  ): Promise<void> {
    logger.info('Service called to edit sequence.');

    const sequenceArray = sequenceEditRequest.sequence;

    if (sequenceArray.length !== new Set(sequenceArray).size) {
      const errMsg = 'Duplicate ids are present in the request.';
      logger.error(errMsg);

      throw new InvalidRequestError(errMsg);
    }

    let fields;
    try {
      fields = await db[tableNameStr].findAll({
        where: {
          agencyId,
          xerceId,
        },
      });
    } catch (error) {
      logger.error('Unknown error');
      logger.error(error);

      throw new InternalServerError();
    }

    const fieldIds = fields.map(field => field.id);

    if (fieldIds.length !== sequenceArray.length) {
      const errMsg = 'All ids are not present in request';
      logger.error(errMsg);

      throw new InvalidRequestError(errMsg);
    }

    if (!ValidationUtil.isNumericArrayEquals(sequenceArray, fieldIds)) {
      const errMsg = 'Ids provided do not belong to this agency';
      logger.error(errMsg);

      throw new InvalidRequestError(errMsg);
    }

    // check if active fields are not sequenced before inactive fields then throw error
    const activeFieldIds = fields
      .filter(field => {
        if (field.isActive) {
          return field;
        }
      })
      .map(activeField => activeField.id);

    const activeSequenceIds = sequenceArray.slice(0, activeFieldIds.length);

    if (
      !ValidationUtil.isNumericArrayEquals(activeFieldIds, activeSequenceIds)
    ) {
      const errMsg = 'active fields should be sequenced before inactive fields';
      logger.error(errMsg);

      throw new InvalidRequestError(errMsg);
    }

    const tableName = `'${db[tableNameStr].getTableName()}'`;
    const sequenceString = `'${sequenceArray.toString()}'`;

    const editSequenceSP = `SELECT edit_sequence(${tableName}, ${agencyId}, ${
      sequenceString
    });`;

    try {
      await db.sequelize.query(editSequenceSP, {
        type: db.sequelize.QueryTypes.SELECT,
        transaction,
      });
    } catch (error) {
      const errMsg = 'Error while updating the sequence';
      logger.error(errMsg);
      logger.error(error.errors[0].message);

      throw new InternalServerError(errMsg);
    }
  }

  public static async resetIsDefault(
    agencyId: number,
    xerceId: number,
    tableName: string,
    transaction: Transaction
  ) {
    const defaultField = await this.getDefaultField(
      agencyId,
      xerceId,
      tableName
    );

    if (defaultField) {
      defaultField.isDefault = false;
      await defaultField.save({ transaction });
    }

    const nextDefaultField = await db[tableName].findOne({
      where: {
        agencyId,
        xerceId,
        isActive: true,
      },
      order: ['sequence'],
      transaction,
    });

    if (nextDefaultField) {
      nextDefaultField.isDefault = true;
      await nextDefaultField.save({ transaction });
    }
  }

  public static async getDefaultField(
    agencyId: number,
    xerceId: number,
    tableName: string
  ): Promise<IConfigCaseRoleInstance> {
    logger.info('Service called to get default field');

    let defaultField = null;
    try {
      defaultField = await db[tableName].findOne({
        where: {
          agencyId,
          xerceId,
          isDefault: true,
          isActive: true,
        },
      });
    } catch (error) {
      const errMsg = 'Error while fetching the default field';
      logger.error(errMsg);
      logger.error(error.errors[0].message);

      throw new InternalServerError(errMsg);
    }

    return defaultField;
  }

  public static validateSequence(
    entityFields:
      | IConfigXerceEntityFieldRequest[]
      | IConfigXerceEntityFieldEditRequest[]
      | ICaseCustomFieldRequest[]
      | ICaseCustomFieldEditRequest[]
  ) {
    const sequenceNumbers: number[] = [];

    for (const entityField of entityFields) {
      sequenceNumbers.push(entityField.sequence);
    }

    if (
      _.min(sequenceNumbers) !== 1 ||
      _.max(sequenceNumbers) !== sequenceNumbers.length
    ) {
      const errMsg = 'Invalid sequence numbers';
      logger.error(errMsg);

      throw new InvalidRequestError(errMsg);
    }

    if (sequenceNumbers.length !== new Set(sequenceNumbers).size) {
      const errMsg = 'Duplicate sequence numbers not allowed';
      logger.error(errMsg);

      throw new InvalidRequestError(errMsg);
    }
  }
}
