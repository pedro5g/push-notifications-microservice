import type {
  CreateUserSetting,
  IUserSettingsRepository,
  UpdateUserSetting,
  UserSetting,
} from '@/models/user-setting.model';
import { BaseRepository } from './base.repository';

export class UserSettingsRepository
  extends BaseRepository
  implements IUserSettingsRepository
{
  async create({
    user_id,
    email_notifications,
    language,
    max_notifications_per_month,
    max_projects,
    max_web_hooks_per_project,
    push_notifications,
    webhook_notifications,
  }: CreateUserSetting): Promise<void> {
    await this.knex('user_settings').insert({
      user_id,
      email_notifications,
      language,
      max_notifications_per_month,
      max_projects,
      max_web_hooks_per_project,
      push_notifications,
      webhook_notifications,
    });
  }

  async update({
    user_id,
    email_notifications,
    language,
    max_notifications_per_month,
    max_projects,
    max_web_hooks_per_project,
    push_notifications,
    webhook_notifications,
  }: UpdateUserSetting): Promise<void> {
    await this.knex('user_settings')
      .update({
        email_notifications,
        language,
        max_notifications_per_month,
        max_projects,
        max_web_hooks_per_project,
        push_notifications,
        webhook_notifications,
      })
      .where({ user_id });
  }

  async delete(userId: string): Promise<void> {
    await this.knex('user_settings').delete().where({
      user_id: userId,
    });
  }

  async findById<K extends keyof UserSetting>(
    userId: string,
    select: K[]
  ): Promise<Pick<UserSetting, K> | null>;
  async findById<K extends keyof UserSetting>(
    userId: string,
    ...select: K[]
  ): Promise<Pick<UserSetting, K> | null> {
    const userSettings = await this.knex('user_settings')
      .select(this.parseSelect<UserSetting>(...select))
      .where({ id: userId })
      .first();

    return userSettings ?? null;
  }
}
