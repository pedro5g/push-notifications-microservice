import type {
  CountTokenArgs,
  CountTokenWithIntervalArgs,
  CreateUserToken,
  DeleteManyArgs,
  FindByTokenArgs,
  FindValidTokenArgs,
  GetLastValidTokenArgs,
  IUserTokenRepository,
  UpdateUserToken,
  UserToken,
} from "@/models/user-tokens.model";
import { BaseRepository } from "./base.repository";

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
    await this.knex("user_tokens").insert({
      user_id,
      token,
      type,
      expired_at,
    });
  }

  async update({ id, used_at }: UpdateUserToken): Promise<void> {
    await this.knex("user_tokens")
      .where({
        id,
      })
      .update({ used_at });
  }

  async delete(id: string): Promise<void> {
    await this.knex("user_tokens").delete().where({
      id,
    });
  }

  async deleteMany({ userId, type }: DeleteManyArgs): Promise<void> {
    await this.knex("user_tokens")
      .delete()
      .where({
        user_id: userId,
        type,
      })
      .whereNull("used_at");
  }

  async findById(id: string): Promise<UserToken | null> {
    const token = await this.knex("user_tokens").where({ id }).first();
    return token ?? null;
  }

  async findByToken({
    token,
    type,
  }: FindByTokenArgs): Promise<UserToken | null> {
    const userToken = await this.knex("user_tokens")
      .where({
        token,
        type,
      })
      .first();
    return userToken ?? null;
  }

  async findManyByUserId(userId: string): Promise<UserToken[]> {
    const tokes = await this.knex("user_tokens").where({
      user_id: userId,
    });

    return tokes;
  }

  async findValidToken({
    token,
    type,
  }: FindValidTokenArgs): Promise<UserToken | null> {
    const userToken = await this.knex("user_tokens")
      .where({ token, type })
      .where("expired_at", ">", this.knex.fn.now())
      .whereNull("used_at")
      .first();

    return userToken ?? null;
  }

  async getLastValidToken({
    userId,
    type,
  }: GetLastValidTokenArgs): Promise<UserToken | null> {
    const token = await this.knex("user_tokens")
      .where({
        user_id: userId,
        type,
      })
      .andWhere("expired_at", ">", this.knex.fn.now())
      .andWhere({ used_at: null })
      .first();

    return token ?? null;
  }

  async countTokens({ userId, type }: CountTokenArgs): Promise<number> {
    const count = await this.knex("user_tokens")
      .where({
        user_id: userId,
        type,
      })
      .count()
      .first();

    return Number(count?.count ?? 0);
  }

  async countTokensWithInterval({
    userId,
    type,
    interval = "1 hour",
  }: CountTokenWithIntervalArgs): Promise<number> {
    const count = await this.knex("user_tokens")
      .where({
        user_id: userId,
        type,
      })
      .andWhere(
        "created_at",
        ">",
        this.knex.raw(`now() - interval '${interval}'`)
      )
      .count()
      .first();

    return Number(count?.count ?? 0);
  }
}
