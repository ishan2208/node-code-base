import * as moment from 'moment';
import * as logger from 'winston';

import { InvalidRequestError } from '../errors/index';

export default class DateUtil {
  public static getStartOfDate(date: Date): moment.Moment {
    const startOfDate = moment(date).startOf('day');

    if (!startOfDate.isValid()) {
      const errMsg = 'Invalid date';
      logger.error(errMsg);

      throw new InvalidRequestError(errMsg);
    }

    return startOfDate;
  }

  public static isFutureDate(date: Date): boolean {
    return moment(date).isSameOrAfter(moment(), 'day');
  }

  public static isValidStartEndDate(startDate: Date, endDate: Date) {
    if (startDate && endDate) {
      const startOfDate = moment
        .utc(startDate)
        .startOf('date')
        .toISOString();

      const endOfDate = moment
        .utc(endDate)
        .endOf('date')
        .toISOString();

      if (startOfDate <= endOfDate) {
        return true;
      }

      return false;
    }

    return true;
  }

  public static getFormattedDate(dateString: string, format: string) {
    const momentDate = moment(dateString).format(format);

    return momentDate;
  }
}
