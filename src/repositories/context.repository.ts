import type { Knex } from 'knex';
import { DatabaseConnection } from '@/config/db';
import type { IApiKeyRepository } from '@/models/api-key.model';
import type { IProjectRepository } from '@/models/project.model';
import type { IUserRepository } from '@/models/user.model';
import type { IUserSettingsRepository } from '@/models/user-setting.model';
import type { IUserTokenRepository } from '@/models/user-tokens.model';
import { ApiKeyRepository } from './api-key.repository';
import { BaseRepository } from './base.repository';
import { ProjectRepository } from './project.repository';
import { UserRepository } from './user.repository';
import { UserSettingsRepository } from './user-settings.repository';
import { UserTokensRepository } from './user-tokens.repository';

export class ContextRepository {
  private static instance: ContextRepository;
  db: Knex;
  users: IUserRepository;
  userSettings: IUserSettingsRepository;
  userTokens: IUserTokenRepository;
  projects: IProjectRepository;
  apiKeys: IApiKeyRepository;

  private constructor() {
    this.db = DatabaseConnection.getInstance();
    this.users = new UserRepository(this);
    this.userSettings = new UserSettingsRepository(this);
    this.userTokens = new UserTokensRepository(this);
    this.projects = new ProjectRepository(this);
    this.apiKeys = new ApiKeyRepository(this);
  }

  static getInstance(): ContextRepository {
    if (!ContextRepository.instance) {
      ContextRepository.instance = new ContextRepository();
    }
    return ContextRepository.instance;
  }

  async transaction<T>(
    fn: () => Promise<T>,
    callback?: (error: unknown) => void
  ): Promise<T> {
    try {
      const result = await this.db.transaction(async (trx) => {
        for (const key in this) {
          if (this[key] instanceof BaseRepository) {
            this[key].knex = trx;
          }
        }

        const value = await fn();
        return value;
      });

      return result;
    } catch (e) {
      if (callback) {
        callback(e);
        return await Promise.reject(e);
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
