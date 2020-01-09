import * as moment from 'moment';
import * as logger from 'winston';
import { InvalidRequestError } from '../errors';

export default class ValidationUtil {
  public static isEmptyString(content: string): boolean {
    return content.trim() === '' ? true : false;
  }

  public static isNumericArrayEquals(arr1: number[], arr2: number[]): boolean {
    for (const obj1 of arr1) {
      let isValid = false;

      for (const obj2 of arr2) {
        if (obj1 === obj2) {
          isValid = true;
          break;
        }
      }

      if (!isValid) {
        return false;
      }
    }

    return true;
  }

  public static isValidDate(str: string): boolean {
    const dateFormat = 'YYYY-MM-DDTHH:mm:ss.SSS[Z]';

    return moment(str, dateFormat, true).isValid();
  }

  public static allowedAttachmentMimeType(mimeType: string) {
    const mimeTypes = [
      'audio/aiff',
      'audio/x-aiff',
      'image/bmp',
      'image/x-windows-bmp',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'message/rfc822',
      'application/postscript',
      'image/gif',
      'text/html',
      'image/jpeg',
      'image/pjpeg',
      'audio/mpeg3',
      'audio/x-mpeg-3',
      'audio/mpeg',
      'video/mpeg',
      'video/x-mpeg',
      'video/mp4',
      'application/vnd.ms-outlook',
      'application/pdf',
      'image/png',
      'application/mspowerpoint',
      'application/powerpoint',
      'application/vnd.ms-powerpoint',
      'application/x-mspowerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/rtf',
      'application/x-rtf',
      'text/richtext',
      'image/tiff',
      'image/x-tiff',
      'text/plain',
      'text/vcard',
      'text/x-vcard',
      'audio/wav',
      'audio/x-wav',
      'application/excel',
      'application/vnd.ms-excel',
      'application/x-excel',
      'application/x-msexcel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/x-compressed',
      'application/x-zip-compressed',
      'application/zip',
      'multipart/x-zip',
    ];

    if (mimeTypes.indexOf(mimeType) === -1) {
      return false;
    }

    return true;
  }

  public static allowedImageLibraryMimeType(mimeType: string) {
    const mimeypes = [
      'image/bmp',
      'image/x-windows-bmp',
      'image/jpeg',
      'image/pjpeg',
      'image/png',
    ];

    if (mimeypes.indexOf(mimeType) === -1) {
      return false;
    }

    return true;
  }

  public static validateCustomField(
    customFieldReq:
      | IConfigFeePaymentCustomFieldRequest
      | IConfigContactCustomFieldRequest
  ) {
    if (customFieldReq.type === CustomFieldType.PICKLIST) {
      if (!customFieldReq.options || customFieldReq.options.length === 0) {
        const errMsg = `Custom field of type PICKLIST should have options`;
        logger.error(errMsg);

        throw new InvalidRequestError(errMsg);
      } else {
        const uniqueOptions = new Set(customFieldReq.options);
        if (customFieldReq.options.length !== uniqueOptions.size) {
          const errMsg = `Picklist options should be unique.`;
          logger.error(errMsg);

          throw new InvalidRequestError(errMsg);
        }
      }
    }
  }
}
