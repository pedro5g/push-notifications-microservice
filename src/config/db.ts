import knex, { type Knex } from 'knex';
import knexfile from '../../knexfile';
import { Logger } from '../utils/logger';

const logger = new Logger('Database');

export class KnexInstance {
  private static instance: Knex;

  private constructor() {}

  public static async init(): Promise<void> {
    if (!KnexInstance.instance) {
      KnexInstance.instance = knex(knexfile);
      try {
        await KnexInstance.instance.raw(`SELECT 1`);
        logger.info('Connection with established database');
      } catch (error) {
        logger.error('Error when trying db connection');
        throw error;
      }
    }
  }

  public static getInstance(): Knex {
    if (!KnexInstance.instance) {
      throw new Error(
        'Please initialize knex instance ex: [await KnexInstance.init()]'
      );
    }
    return KnexInstance.instance;
  }

  public static async destroy(): Promise<void> {
    if (KnexInstance.instance) {
      await KnexInstance.instance.destroy();
      KnexInstance.instance = undefined as unknown as Knex;
      logger.info('Database connection close');
    }
  }
}
