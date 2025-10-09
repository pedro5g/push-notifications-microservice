import type {
  AuthenticatedUser,
  CreateUser,
  GetUserContextWhere,
  IUserRepository,
  UpdateUser,
  User,
} from "@/models/user.model";
import { MockBaseRepository } from "./base.repository.mck";
import { randomUUID } from "node:crypto";

export class MockUserRepository
  extends MockBaseRepository
  implements IUserRepository
{
  async create({
    name,
    email,
    password_hash,
    status,
  }: CreateUser): Promise<User> {
    const newUser: User = {
      id: randomUUID(),
      name,
      email,
      password_hash,
      status: status ?? "pending_verification",
      last_login_at: null,
      email_verified_at: null,
      deleted_at: null,
      updated_at: null,
      created_at: new Date(),
    };
    this._add("users", newUser);
    return newUser;
  }

  findByEmail<K extends keyof User>(
    email: string,
    select: K[]
  ): Promise<Pick<User, K> | null>;
  async findByEmail<K extends keyof User>(
    email: string,
    ...select: K[]
  ): Promise<Pick<User, K> | null> {
    const _select =
      select.length > 0
        ? Array.isArray(select[0])
          ? [...select[0]]
          : select
        : ["*"];

    const _user = this.table("users")
      .select(..._select)
      .findUnique("email", email);

    return _user;
  }

  findById<K extends keyof User>(
    userId: string,
    ...select: K[]
  ): Promise<Pick<User, K> | null>;
  findById<K extends keyof User>(
    userId: string,
    select: K[]
  ): Promise<Pick<User, K> | null>;
  async findById<K extends keyof User>(
    userId: string,
    ...select: K[]
  ): Promise<Pick<User, K> | null> {
    const _select =
      select.length > 0
        ? Array.isArray(select[0])
          ? [...select[0]]
          : select
        : ["*"];

    const _user = this.table("users")
      .select(...(_select ?? "*"))
      .findUnique("id", userId);

    return _user;
  }

  async update({
    id,
    deleted_at,
    email,
    email_verified_at,
    last_login_at,
    name,
    password_hash,
    status,
  }: UpdateUser): Promise<void> {
    this.table("users")
      .where({ id })
      .update({
        deleted_at: deleted_at ? new Date(deleted_at) : undefined,
        email,
        email_verified_at: email_verified_at
          ? new Date(email_verified_at)
          : undefined,
        last_login_at: last_login_at ? new Date(last_login_at) : undefined,
        name,
        password_hash,
        status,
      });
  }

  async softDelete(userId: string): Promise<void> {
    this.table("users").where({ id: userId }).update({
      status: "inactive",
      deleted_at: new Date(),
    });
  }

  async getUserContext(
    where: GetUserContextWhere
  ): Promise<AuthenticatedUser | null> {
    const user = this.table("users").where(where).findUnique();

    if (!user) return null;

    const settings = this.table("user_settings")
      .where({ user_id: user.id })
      .findUnique();

    if (!settings) return null;

    const { deleted_at, ...restUser } = user;

    return {
      ...restUser,
      settings: settings,
    };
  }
}
