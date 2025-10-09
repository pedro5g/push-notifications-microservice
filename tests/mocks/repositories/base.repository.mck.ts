import type { ApiKey } from "@/models/api-key.model";
import type { Project } from "@/models/project.model";
import type { UserSetting } from "@/models/user-setting.model";
import type { UserToken } from "@/models/user-tokens.model";
import type { User } from "@/models/user.model";
import { dateUtils } from "@/utils/date";
import { faker } from "@faker-js/faker";
import { randomBytes, randomUUID } from "node:crypto";
import { createMockTable, MockTable } from "./mock-table";
import { createMockQueryBuilder } from "./mock-query-builder";

type MockDatabase = {
  users: MockTable<User, "id", "email">;
  user_tokens: MockTable<UserToken, "id", "token">;
  user_settings: MockTable<UserSetting, "id", "user_id">;
  projects: MockTable<Project, "id">;
  api_keys: MockTable<ApiKey, "id">;
};

export function createMockDatabase(): MockDatabase {
  return {
    users: createMockTable({
      tableName: "users",
      schema: {} as User,
      primaryKey: "id",
      uniqueFields: ["email"],
    }),
    user_tokens: createMockTable({
      tableName: "user_tokens",
      schema: {} as UserToken,
      primaryKey: "id",
      uniqueFields: ["token"],
    }),
    user_settings: createMockTable({
      tableName: "user_settings",
      schema: {} as UserSetting,
      primaryKey: "id",
      uniqueFields: ["user_id"],
    }),
    projects: createMockTable({
      tableName: "projects",
      schema: {} as Project,
      primaryKey: "id",
    }),
    api_keys: createMockTable({
      tableName: "api_keys",
      schema: {} as ApiKey,
      primaryKey: "id",
    }),
  };
}

type ExtractEntity<T> = T extends MockTable<infer P, any, any> ? P : never;

export class MockBaseRepository {
  constructor(protected database: MockDatabase) {}

  _add<K extends keyof MockDatabase>(
    table: K,
    entity: ExtractEntity<MockDatabase[K]>
  ) {
    this.database[table].insert(entity as any);
  }

  insertOnTable<K extends keyof MockDatabase>(
    table: K,
    config: {
      quantity?: number;
      interceptor?: (index: number) => Partial<ExtractEntity<MockDatabase[K]>>;
    } = {}
  ) {
    const {
      quantity = 1,
      interceptor = () => ({} as Partial<ExtractEntity<MockDatabase[K]>>),
    } = config;

    for (let index = 0; index < quantity; index++) {
      const overwrite = interceptor(index);
      switch (table) {
        case "users":
          this._add("users", generateUser(overwrite));
          continue;
        case "user_tokens":
          this._add("user_tokens", generateToken(overwrite));
          continue;
        case "user_settings":
          this._add("user_settings", generateUserSetting(overwrite));
          continue;
        case "api_keys":
          this._add("api_keys", generateAPIkey(overwrite));
          continue;
        case "projects":
          this._add("projects", generateProject(overwrite));
          continue;
        default:
          continue;
      }
    }
  }

  table<K extends keyof MockDatabase>(table: K) {
    return createMockQueryBuilder(this.database[table]);
  }
}

export function generateUser(overwrite: Partial<User> = {}): User {
  return {
    id: randomUUID(),
    name: faker.person.firstName(),
    email: faker.internet.email(),
    status: "pending_verification",
    password_hash: randomBytes(16).toString("hex"),
    created_at: new Date(),
    email_verified_at: null,
    updated_at: null,
    last_login_at: null,
    deleted_at: null,
    ...overwrite,
  };
}

export function generateToken(overwrite: Partial<UserToken> = {}): UserToken {
  const type = overwrite.type ? overwrite.type : "email_verification";
  const expired_at =
    type === "email_verification"
      ? dateUtils.addDays(1)
      : dateUtils.addMinutes(10);

  return {
    id: randomUUID(),
    user_id: randomUUID(),
    type: type,
    expired_at: new Date(expired_at),
    token: randomBytes(16).toString("hex"),
    created_at: new Date(),
    used_at: null,
    ...overwrite,
  };
}

export function generateUserSetting(
  overwrite: Partial<UserSetting> = {}
): UserSetting {
  return {
    id: randomUUID(),
    user_id: randomUUID(),
    language: "pt-BR",
    email_notifications: false,
    push_notifications: true,
    webhook_notifications: true,
    max_projects: 3,
    max_web_hooks_per_project: 10,
    max_notifications_per_month: 10000,
    created_at: new Date(),
    updated_at: null,
    ...overwrite,
  };
}

export function generateProject(overwrite: Partial<Project> = {}): Project {
  return {
    id: randomUUID(),
    user_id: randomUUID(),
    project_name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    domain: `http://${faker.internet.domainWord()}.${faker.internet.domainSuffix()}`,
    icon: faker.internet.emoji(),
    status: "active",
    webhook_secret: randomBytes(16).toString("hex"),
    rate_limit_per_hour: 60,
    rate_limit_per_day: 1000,
    rate_limit_per_minute: 10000,
    created_at: new Date(),
    updated_at: null,
    deleted_at: null,
    ...overwrite,
  };
}

export function generateAPIkey(overwrite: Partial<ApiKey> = {}): ApiKey {
  const key = randomBytes(32);

  return {
    id: randomUUID(),
    project_id: randomUUID(),
    name: faker.commerce.productName(),
    key_hash: key.toString("hex"),
    key_preview: `••••••••••••••${key.toString().slice(-4)}`,
    permissions: ["notifications:send", "webhooks:manage"],
    status: "active",
    expires_at: null,
    usage_count: 0,
    created_at: new Date(),
    last_used_at: null,
    updated_at: null,
    ...overwrite,
  };
}
