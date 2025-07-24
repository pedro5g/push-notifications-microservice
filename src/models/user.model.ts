import type { UserSettingResponse } from './user-setting.model';

export type UserStatus =
  | 'active'
  | 'inactive'
  | 'suspended'
  | 'pending_verification';

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  status: UserStatus;
  email_verified_at: Date | null;
  last_login_at: Date | null;
  created_at: Date;
  updated_at: Date | null;
  deleted_at: Date | null;
}

export interface CreateUser {
  name: string;
  email: string;
  password_hash: string;
  status?: UserStatus;
}

export interface UpdateUser {
  name?: string;
  email?: string;
  password_hash?: string;
  status?: UserStatus;
  email_verified_at?: Date;
  last_login_at?: Date;
  deleted_at?: Date;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  email_verified_at: Date | null;
  last_login_at: Date | null;
  created_at: Date;
  updated_at: Date | null;
}

export interface AuthenticatedUser extends Omit<User, 'deleted_at'> {
  settings: UserSettingResponse | null;
}

export type GetUserContextWhere = { id: string } | { email: string };

export interface IUserRepository<T = User> {
  create(args: CreateUser): Promise<void>;
  update(args: UpdateUser): Promise<void>;
  softDelete(userId: string): Promise<void>;
  findByEmail<K extends keyof T>(
    email: string,
    select: K[]
  ): Promise<Pick<T, K> | null>;
  findByEmail<K extends keyof T>(
    email: string,
    ...select: K[]
  ): Promise<Pick<T, K> | null>;
  findById<K extends keyof T>(
    userId: string,
    select: K[]
  ): Promise<Pick<T, K> | null>;
  findById<K extends keyof T>(
    userId: string,
    ...select: K[]
  ): Promise<Pick<T, K> | null>;
  getUserContext(where: GetUserContextWhere): Promise<AuthenticatedUser | null>;
}
