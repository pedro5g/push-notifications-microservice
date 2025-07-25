import knex, { type Knex } from 'knex';
import knexfile from '../../knexfile';
import { Logger } from '../utils/logger';

export class DatabaseConnection {
  private static instance: Knex;
  private static logger = new Logger('Database');

  private constructor() {}

  public static async init(): Promise<void> {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = knex(knexfile);
      try {
        await DatabaseConnection.instance.raw(`SELECT 1`);
        DatabaseConnection.logger.info('Database connection initialized');
      } catch (error) {
        DatabaseConnection.logger.error('Error when trying db connection');
        throw error;
      }
    }
  }

  public static getInstance(): Knex {
    if (!DatabaseConnection.instance) {
      throw new Error(
        'Please initialize knex instance ex: [await DatabaseConnection.init()]'
      );
    }
    return DatabaseConnection.instance;
  }

  public static async destroy(): Promise<void> {
    if (DatabaseConnection.instance) {
      await DatabaseConnection.instance.destroy();
      DatabaseConnection.instance = undefined as unknown as Knex;
      DatabaseConnection.logger.info('Database connection close');
    }
  }
}
