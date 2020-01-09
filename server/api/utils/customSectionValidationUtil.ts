import * as logger from 'winston';

import { InvalidRequestError } from '../errors';
import ValidationUtil from '../utils/validationUtil';

export default class CustomSectionValidationUtil {
  // This validates the config of the custom fields.
  public validateConfigCustomFields(
    configCustomFields:
      | IConfigXerceEntityFieldRequest[]
      | IConfigForcedAbatementFieldRequest[]
      | ISystemXerceEntityFieldRequest[]
      | IConfigXerceEntityFieldEditRequest[]
      | ICaseCustomFieldRequest[]
      | ICaseCustomFieldEditRequest[]
      | IConfigForcedAbatementFieldEditRequest[]
  ) {
    let errMsg = `Custom section can't be created without at least one active field.`;

    if (configCustomFields.length === 0) {
      logger.error(errMsg);

      throw new InvalidRequestError(errMsg);
    } else {
      let isValid = false;
      for (const configEntityField of configCustomFields) {
        if (configEntityField.isActive) {
          isValid = true;
        }

        if (configEntityField.type === CustomFieldType.PICKLIST) {
          if (
            !configEntityField.options ||
            configEntityField.options.length === 0
          ) {
            errMsg = `Custom field of type PICKLIST should have options`;
            logger.error(errMsg);

            throw new InvalidRequestError(errMsg);
          } else {
            const uniqueOptions = new Set(configEntityField.options);
            if (configEntityField.options.length !== uniqueOptions.size) {
              errMsg = `Picklist options should be unique.`;
              logger.error(errMsg);

              throw new InvalidRequestError(errMsg);
            }
          }
        }
      }

      if (!isValid) {
        logger.error(errMsg);

        throw new InvalidRequestError(errMsg);
      }

      return true;
    }
  }

  public validateFieldValues(
    configCustomFields:
      | IConfigXerceEntityField[]
      | IConfigContactCustomField[]
      | ILocationField[],
    customFields: object
  ) {
    logger.info('Service called to validate field values');

    let isDateValid;
    let picklistOptions;
    let fieldValue;
    let errMsg;

    for (const configCustomField of configCustomFields) {
      if (Object.keys(customFields).includes(configCustomField.label)) {
        fieldValue = customFields[configCustomField.label];

        switch (configCustomField.type) {
          case CustomFieldType.TEXT:
            if (fieldValue) {
              const isValidString =
                typeof fieldValue === 'string' &&
                !ValidationUtil.isEmptyString(fieldValue);

              if (!isValidString) {
                errMsg = `${
                  configCustomField.label
                } should be in String format.`;
                logger.info(errMsg);

                throw new InvalidRequestError(errMsg);
              }
            }
            break;

          case CustomFieldType.DATE:
            if (fieldValue) {
              isDateValid = ValidationUtil.isValidDate(fieldValue);

              if (!isDateValid) {
                errMsg = `${configCustomField.label} should be in Date format.`;
                logger.info(errMsg);

                throw new InvalidRequestError(errMsg);
              }
            }
            break;

          case CustomFieldType.NUMBER:
            if (fieldValue) {
              if (isNaN(fieldValue)) {
                errMsg = `${
                  configCustomField.label
                } should be in number format`;
                logger.info(errMsg);

                throw new InvalidRequestError(errMsg);
              }
            }
            break;

          case CustomFieldType.PICKLIST:
            if (fieldValue) {
              picklistOptions = configCustomField.options;

              let isValidOption = false;
              if (picklistOptions.includes(fieldValue)) {
                isValidOption = true;
              }

              if (!isValidOption) {
                errMsg = `${
                  configCustomField.label
                } picklist value is invalid.`;
                logger.info(errMsg);

                throw new InvalidRequestError(errMsg);
              }
            }
            break;

          default:
            errMsg = 'Invalid Custom Field Type.';
            logger.info(errMsg);

            throw new InvalidRequestError(errMsg);
        }
      }
    }
  }

  public validateMandatoryFieldValues(
    configCustomFields: ILocationField[],
    customFields: object
  ) {
    logger.info('Service called to validate mandatory field values');

    let isDateValid;
    let picklistOptions;
    let fieldValue;
    let errMsg;

    for (const configCustomField of configCustomFields) {
      if (Object.keys(customFields).includes(configCustomField.id.toString())) {
        fieldValue = customFields[configCustomField.id.toString()];
        switch (configCustomField.type) {
          case CustomFieldType.TEXT:
            const isValidString =
              typeof fieldValue === 'string' &&
              !ValidationUtil.isEmptyString(fieldValue);

            if (!isValidString) {
              errMsg = `${configCustomField.label} should be in String format.`;
              logger.info(errMsg);

              throw new InvalidRequestError(errMsg);
            }
            break;

          case CustomFieldType.DATE:
            isDateValid = ValidationUtil.isValidDate(fieldValue);

            if (!isDateValid) {
              errMsg = `${configCustomField.label} should be in Date format.`;
              logger.info(errMsg);

              throw new InvalidRequestError(errMsg);
            }
            break;

          case CustomFieldType.NUMBER:
            if (isNaN(fieldValue) || typeof fieldValue === 'string') {
              errMsg = `${configCustomField.label} should be in number format`;
              logger.info(errMsg);

              throw new InvalidRequestError(errMsg);
            }
            break;

          case CustomFieldType.PICKLIST:
            picklistOptions = configCustomField.options;

            let isValidOption = false;
            if (picklistOptions.includes(fieldValue)) {
              isValidOption = true;
            }

            if (!isValidOption) {
              errMsg = `${configCustomField.label} picklist value is invalid.`;
              logger.info(errMsg);

              throw new InvalidRequestError(errMsg);
            }
            break;

          default:
            errMsg = 'Invalid Custom Field Type.';
            logger.info(errMsg);

            throw new InvalidRequestError(errMsg);
        }
      }
    }
  }
}
