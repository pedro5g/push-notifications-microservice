import type { Knex } from 'knex';
import { KnexInstance } from '@/config/db';
import type { IUserRepository } from '@/models/user.model';
import type { IUserSettingsRepository } from '@/models/user-setting.model';
import { BaseRepository } from './base.repository';
import { UserRepository } from './user.repository';
import { UserSettingsRepository } from './user-settings.repository';

export class ContextRepository {
  db: Knex;
  users: IUserRepository;
  userSettings: IUserSettingsRepository;

  constructor() {
    this.db = KnexInstance.getInstance();
    this.users = new UserRepository(this);
    this.userSettings = new UserSettingsRepository(this);
  }

  async transaction(fn: Function, callback?: (error: unknown) => void) {
    try {
      await this.db.transaction(async (trx) => {
        for (const key in this) {
          if (this[key] instanceof BaseRepository) {
            this[key].knex = trx;
          }
        }

        await fn();
      });
    } catch (e) {
      if (callback) {
        callback(e);
      } else {
        throw e;
      }
    } finally {
      for (const key in this) {
        if (this[key] instanceof BaseRepository) {
          this[key].knex = this.db;
        }
      }
    }
  }
}
