import type {
  CountTokenArgs,
  CountTokenWithIntervalArgs,
  CreateUserToken,
  GetLastTokenArgs,
  IUserTokenRepository,
  UpdateUserToken,
  UserToken,
} from '@/models/user-tokens.model';
import { BaseRepository } from './base.repository';

export class UserTokensRepository
  extends BaseRepository
  implements IUserTokenRepository
{
  async create({
    user_id,
    token,
    type,
    expired_at,
  }: CreateUserToken): Promise<void> {
    await this.knex('user_tokens').insert({
      user_id,
      token,
      type,
      expired_at,
    });
  }

  async update({ id, used_at }: UpdateUserToken): Promise<void> {
    await this.knex('user_tokens')
      .where({
        id,
      })
      .update({ used_at });
  }

  async delete(id: string): Promise<void> {
    await this.knex('user_tokens').delete().where({
      id,
    });
  }

  async findById(id: string): Promise<UserToken | null> {
    const token = await this.knex('user_tokens').where({ id }).first();
    return token ?? null;
  }

  async findManyByUserId(userId: string): Promise<UserToken[]> {
    const tokes = await this.knex('user_tokens').where({
      user_id: userId,
    });

    return tokes;
  }

  async getLastToken({
    userId,
    type,
  }: GetLastTokenArgs): Promise<UserToken | null> {
    const token = await this.knex('user_tokens')
      .where({
        user_id: userId,
        type,
      })
      .orderBy('created_at', 'desc')
      .first();

    return token ?? null;
  }

  async countTokens({ userId, type }: CountTokenArgs): Promise<number> {
    const count = await this.knex('user_tokens')
      .where({
        user_id: userId,
        type,
      })
      .count()
      .first();

    return Number(count);
  }

  async countTokensWithInterval({
    userId,
    type,
    interval = '1 hour',
  }: CountTokenWithIntervalArgs): Promise<number> {
    const count = await this.knex('user_tokens')
      .where({
        user_id: userId,
        type,
      })
      .andWhere('created_at', '>', this.knex(`now() - interval '${interval}'`))
      .count()
      .first();

    return Number(count);
  }
}
