export type UserTokenTypes = 'email_verification' | 'password_reset';

export interface UserToken {
  id: string;
  user_id: string;
  type: UserTokenTypes;
  token: string;
  expired_at: Date;
  used_at: Date | null;
  created_at: Date;
}

export interface CreateUserToken {
  user_id: string;
  type: UserTokenTypes;
  token: string;
  expired_at: Date;
}

export interface UpdateUserToken {
  id: string;
  used_at: Date;
}

export interface FindByTokenArgs {
  token: string;
  type: UserTokenTypes;
}

export interface GetLastValidTokenArgs {
  userId: string;
  type: UserTokenTypes;
}
export interface CountTokenArgs {
  userId: string;
  type: UserTokenTypes;
}
export interface FindValidTokenArgs {
  token: string;
  type: UserTokenTypes;
}

/**
 *
 * Representation PostgresSql Interval Syntax
 * @example '6 years 5 months 4 days 3 hours 2 minutes 1 second'
 */
export type IntervalSyntax<Time extends number = number> =
  | `${Time} hour`
  | `${Time} minutes`
  | `${Time} second`
  | `${Time} days`
  | `${Time} months`
  | `${Time} years`;

export interface CountTokenWithIntervalArgs {
  userId: string;
  type: UserTokenTypes;
  interval: IntervalSyntax;
}

export interface IUserTokenRepository {
  create(args: CreateUserToken): Promise<void>;
  update(args: UpdateUserToken): Promise<void>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<UserToken | null>;
  findByToken(args: FindByTokenArgs): Promise<UserToken | null>;
  findValidToken(args: FindValidTokenArgs): Promise<UserToken | null>;
  findManyByUserId(userId: string): Promise<UserToken[]>;
  getLastValidToken(args: GetLastValidTokenArgs): Promise<UserToken | null>;
  countTokens(args: CountTokenArgs): Promise<number>;
  /**
   *
   * @param interval - Representation PostgresSql Interval Syntax
   * @example '6 years 5 months 4 days 3 hours 2 minutes 1 second'
   */
  countTokensWithInterval(args: CountTokenWithIntervalArgs): Promise<number>;
}
