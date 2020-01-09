import { Transaction } from 'sequelize';
import * as logger from 'winston';

import { InternalServerError } from '../errors';
import db from '../models';

export default class DBUtil {
  public static async createTransaction(): Promise<Transaction> {
    let transaction = null;
    try {
      transaction = await db.sequelize.transaction();
      logger.info('Created transaction object.');

      return transaction;
    } catch (error) {
      logger.error('Failed to create transaction');
      logger.error(error);

      throw new InternalServerError();
    }
  }

  public static async createDeferredTransaction(): Promise<Transaction> {
    let transaction = null;
    try {
      transaction = await db.sequelize.transaction({
        type: db.Sequelize.Transaction.TYPES.DEFERRED,
      });
      logger.info('Created deferred transaction object.');

      return transaction;
    } catch (error) {
      logger.error('Failed to create deferred transaction');
      logger.error(error);

      throw new InternalServerError();
    }
  }

  public static async commitTransaction(
    transaction: Transaction
  ): Promise<void> {
    try {
      await transaction.commit();
      logger.info('Transaction committed');
    } catch (error) {
      logger.error('Failed to commit transaction');
      logger.error(error);

      throw new InternalServerError();
    }
  }

  public static async rollbackTransaction(
    transaction: Transaction
  ): Promise<void> {
    try {
      await transaction.rollback();
      logger.info('Transaction roll back successful.');
    } catch (error) {
      logger.error('Failed to rollback transaction');
      logger.error(error);

      throw new InternalServerError();
    }
  }
}
