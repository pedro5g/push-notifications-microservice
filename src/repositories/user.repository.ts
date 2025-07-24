import type {
  AuthenticatedUser,
  CreateUser,
  GetUserContextWhere,
  IUserRepository,
  UpdateUser,
  User,
} from '@/models/user.model';
import { BaseRepository } from './base.repository';

export class UserRepository extends BaseRepository implements IUserRepository {
  async create({
    name,
    email,
    password_hash,
    status,
  }: CreateUser): Promise<void> {
    await this.knex('users').insert({
      name,
      email,
      password_hash,
      status,
    });
  }
  async update({
    name,
    email_verified_at,
    last_login_at,
    password_hash,
    deleted_at,
    status,
    email,
  }: UpdateUser): Promise<void> {
    await this.knex('users')
      .update({
        name,
        email_verified_at,
        last_login_at,
        password_hash,
        deleted_at,
        status,
      })
      .where({ email });
  }

  async softDelete(userId: string): Promise<void> {
    await this.knex.transaction(async (trx) => {
      await trx('users')
        .update({
          status: 'inactive',
          deleted_at: new Date(),
        })
        .where({ id: userId });
      await trx('user_settings').delete().where({
        user_id: userId,
      });
    });
  }

  // params overload types
  // findByEmail(email, 'id', 'name') || findByEmail(email, ['id', 'name']) without typing erros
  async findByEmail<K extends keyof User>(
    email: string,
    select: K[]
  ): Promise<Pick<User, K> | null>;
  async findByEmail<K extends keyof User>(
    email: string,
    ...select: K[]
  ): Promise<Pick<User, K> | null> {
    const user = await this.knex('users')
      .select(this.parseSelect<User>(...select))
      .where({
        email,
      })
      .first();

    return user ?? null;
  }

  async findById<K extends keyof User>(
    userId: string,
    select: K[]
  ): Promise<Pick<User, K> | null>;
  async findById<K extends keyof User>(
    userId: string,
    ...select: K[]
  ): Promise<Pick<User, K> | null> {
    const user = await this.knex('users')
      .select(this.parseSelect<User>(...select))
      .where({
        id: userId,
      })
      .first();

    return user ?? null;
  }

  async getUserContext(
    where: GetUserContextWhere
  ): Promise<AuthenticatedUser | null> {
    const _where = 'id' in where ? where.id : where.email;
    const result = await this.knex.raw(
      `
    SELECT
      users.id,
      users.name,
      users.email,
      users.password_hash,
      users.status,
      users.email_verified_at,
      users.last_login_at,
      users.created_at,
      users.updated_at,
      CASE
        WHEN user_settings.id IS NOT NULL THEN JSON_BUILD_OBJECT(
          'id', user_settings.id,
          'language', user_settings.language,
          'email_notifications', user_settings.email_notifications,
          'push_notifications', user_settings.push_notifications,
          'webhook_notifications', user_settings.webhook_notifications,
          'max_projects', user_settings.max_projects,
          'max_web_hooks_per_project', user_settings.max_web_hooks_per_project,
          'max_notifications_per_month', user_settings.max_notifications_per_month,
          'created_at', user_settings.created_at,
          'updated_at', user_settings.updated_at
        )
        ELSE NULL
      END AS settings
    FROM users
    LEFT JOIN user_settings ON user_settings.user_id = users.id
    WHERE users.${'id' in where ? 'id' : 'email'} = ?
  `,
      [_where]
    );

    console.log(result.rows);

    return result.rows[0] ?? null;
  }
}
