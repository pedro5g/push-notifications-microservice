import { dateUtils } from "@/utils/date";
import {
  createMockDatabase,
  generateAPIkey,
  generateProject,
  generateToken,
  generateUser,
  generateUserSetting,
  MockBaseRepository,
} from "./base.repository.mck";
import { MockTable } from "./mock-table";
import { MockQueryBuilder } from "./mock-query-builder";

function isInFuture(
  date: Date,
  amount: number,
  unit: "minute" | "hour" | "day"
): boolean {
  const now = Date.now();
  const target = date.getTime();

  let diffMs: number;
  switch (unit) {
    case "minute":
      diffMs = amount * 60 * 1000;
      break;
    case "hour":
      diffMs = amount * 60 * 60 * 1000;
      break;
    case "day":
      diffMs = amount * 24 * 60 * 60 * 1000;
      break;
  }

  return target <= now + diffMs && target >= now;
}

describe("[MockBaseRepository] unit tests", () => {
  let sut: MockBaseRepository | undefined;
  afterEach(() => {
    sut = undefined;
  });
  it("should initialize new MockBaseRepository()", () => {
    sut = new MockBaseRepository(createMockDatabase());
    expect(sut).toBeTruthy();
    expect(sut).instanceOf(MockBaseRepository);
  });
  it("should initialize all table with their sets", () => {
    sut = new MockBaseRepository(createMockDatabase());
    expect(sut["database"]).toBeTruthy();
    expect(sut["database"].users).toBeTruthy();
    expect(sut["database"].users).toBeInstanceOf(MockTable);
    expect(sut["database"].user_settings).toBeTruthy();
    expect(sut["database"].user_settings).toBeInstanceOf(MockTable);
    expect(sut["database"].user_tokens).toBeTruthy();
    expect(sut["database"].user_tokens).toBeInstanceOf(MockTable);
    expect(sut["database"].api_keys).toBeTruthy();
    expect(sut["database"].api_keys).toBeInstanceOf(MockTable);
    expect(sut["database"].projects).toBeTruthy();
    expect(sut["database"].projects).toBeInstanceOf(MockTable);
  });

  describe("[generateUser]", () => {
    it("should generate user with all random information", () => {
      const user = generateUser();

      expect(user).not.toBeFalsy();
      expect(user).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        email: expect.any(String),
        status: "pending_verification",
        password_hash: expect.any(String),
        created_at: expect.any(Date),
        email_verified_at: null,
        updated_at: null,
        last_login_at: null,
        deleted_at: null,
      });
    });
    it("should generate user and overwrite information", () => {
      const user = generateUser({
        id: "overwrite-id",
        name: "Jon doe",
        email: "overwrite@email.com",
        status: "active",
      });

      expect(user).not.toBeFalsy();
      expect(user).toMatchObject({
        id: "overwrite-id",
        name: "Jon doe",
        email: "overwrite@email.com",
        status: "active",
        password_hash: expect.any(String),
        created_at: expect.any(Date),
        email_verified_at: null,
        updated_at: null,
        last_login_at: null,
        deleted_at: null,
      });
    });
  });

  describe("[generateToken]", () => {
    it("should generate user token [by default should generate token of type 'email_verification' and expires at 1 day]", () => {
      const token = generateToken();

      expect(token).not.toBeFalsy();
      expect(token).toMatchObject({
        id: expect.any(String),
        user_id: expect.any(String),
        type: "email_verification",
        expired_at: expect.any(Date),
        token: expect.any(String),
        created_at: expect.any(Date),
        used_at: null,
      });

      expect(isInFuture(token.expired_at, 1, "day")).toBe(true);
    });

    it("should generate user token and overwrite information", () => {
      const expired_at = new Date(dateUtils.addHours(2));
      const token = generateToken({
        id: "overwrite-id",
        user_id: "overwrite-user-id",
        token: "overwrite-token",
        expired_at: expired_at,
      });

      expect(token).not.toBeFalsy();
      expect(token).toMatchObject({
        id: "overwrite-id",
        user_id: "overwrite-user-id",
        token: "overwrite-token",
        type: "email_verification",
        expired_at: expired_at,
        created_at: expect.any(Date),
        used_at: null,
      });

      expect(isInFuture(token.expired_at, 2, "hour")).toBe(true);
    });

    it('should generate user token if overwrite type to "password_reset" automatic expires at 10 minutes', () => {
      const token = generateToken({ type: "password_reset" });

      expect(token).not.toBeFalsy();
      expect(token).toMatchObject({
        id: expect.any(String),
        user_id: expect.any(String),
        type: "password_reset",
        expired_at: expect.any(Date),
        token: expect.any(String),
        created_at: expect.any(Date),
        used_at: null,
      });

      expect(isInFuture(token.expired_at, 10, "minute")).toBe(true);
    });
  });

  describe("[generateUserSetting]", () => {
    it("should generate random user setting", () => {
      const userSetting = generateUserSetting();

      expect(userSetting).not.toBeFalsy();
      expect(userSetting).toMatchObject({
        id: expect.any(String),
        user_id: expect.any(String),
        language: "pt-BR",
        email_notifications: false,
        push_notifications: true,
        webhook_notifications: true,
        max_projects: 3,
        max_web_hooks_per_project: 10,
        max_notifications_per_month: 10000,
        created_at: expect.any(Date),
        updated_at: null,
      });
    });
    it("should generate random user setting and overwrite information", () => {
      const updated_at = new Date();
      const userSetting = generateUserSetting({
        id: "overwrite-id",
        user_id: "overwrite-user-id",
        updated_at,
      });

      expect(userSetting).not.toBeFalsy();
      expect(userSetting).toMatchObject({
        id: "overwrite-id",
        user_id: "overwrite-user-id",
        language: "pt-BR",
        email_notifications: false,
        push_notifications: true,
        webhook_notifications: true,
        max_projects: 3,
        max_web_hooks_per_project: 10,
        max_notifications_per_month: 10000,
        created_at: expect.any(Date),
        updated_at: updated_at,
      });
    });
  });
  describe("[generateProject]", () => {
    it("should generate random project", () => {
      const project = generateProject();

      expect(project).not.toBeFalsy();
      expect(project).toMatchObject({
        id: expect.any(String),
        user_id: expect.any(String),
        project_name: expect.any(String),
        description: expect.any(String),
        domain: expect.any(String),
        icon: expect.any(String),
        status: "active",
        webhook_secret: expect.any(String),
        rate_limit_per_hour: 60,
        rate_limit_per_day: 1000,
        rate_limit_per_minute: 10000,
        created_at: expect.any(Date),
        updated_at: null,
        deleted_at: null,
      });
    });
    it("should generate random project and overwrite information", () => {
      const project = generateProject({
        id: "overwrite-id",
        user_id: "overwrite-user-id",
        icon: "🚀",
      });

      expect(project).not.toBeFalsy();
      expect(project).toMatchObject({
        id: "overwrite-id",
        user_id: "overwrite-user-id",
        project_name: expect.any(String),
        description: expect.any(String),
        domain: expect.any(String),
        icon: "🚀",
        status: "active",
        webhook_secret: expect.any(String),
        rate_limit_per_hour: 60,
        rate_limit_per_day: 1000,
        rate_limit_per_minute: 10000,
        created_at: expect.any(Date),
        updated_at: null,
        deleted_at: null,
      });
    });
  });

  describe("[generateAPIkey]", () => {
    it("should generate random API key", () => {
      const apiKey = generateAPIkey();

      expect(apiKey).not.toBeFalsy();
      expect(apiKey).toMatchObject({
        id: expect.any(String),
        project_id: expect.any(String),
        name: expect.any(String),
        key_hash: expect.any(String),
        key_preview: expect.any(String),
        permissions: ["notifications:send", "webhooks:manage"],
        status: "active",
        expires_at: null,
        usage_count: 0,
        created_at: expect.any(Date),
        last_used_at: null,
        updated_at: null,
      });
    });
    it("should generate random API key and overwrite information", () => {
      const apiKey = generateAPIkey({
        id: "overwrite-id",
        project_id: "overwrite-user-id",
        permissions: ["notifications:send"],
      });

      expect(apiKey).not.toBeFalsy();
      expect(apiKey).toMatchObject({
        id: "overwrite-id",
        project_id: "overwrite-user-id",
        name: expect.any(String),
        key_hash: expect.any(String),
        key_preview: expect.any(String),
        permissions: ["notifications:send"],
        status: "active",
        expires_at: null,
        usage_count: 0,
        created_at: expect.any(Date),
        last_used_at: null,
        updated_at: null,
      });
    });
  });

  describe("Utils methods", () => {
    let sut: MockBaseRepository;
    beforeEach(() => {
      const mockDatabase = createMockDatabase();
      sut = new MockBaseRepository(mockDatabase);
    });

    it("should insert entities on table, by default should be insert one entity into specific table", () => {
      sut.insertOnTable("users");

      expect(sut["database"].users.toArray()).toHaveLength(1);
      expect(sut["database"].users.toArray()[0]).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        email: expect.any(String),
        status: "pending_verification",
        password_hash: expect.any(String),
        created_at: expect.any(Date),
        email_verified_at: null,
        updated_at: null,
        last_login_at: null,
        deleted_at: null,
      });

      sut.insertOnTable("user_tokens");
      expect(sut["database"].user_tokens.toArray()).toHaveLength(1);
      expect(sut["database"].user_tokens.toArray()[0]).toMatchObject({
        id: expect.any(String),
        user_id: expect.any(String),
        type: "email_verification",
        expired_at: expect.any(Date),
        token: expect.any(String),
        created_at: expect.any(Date),
        used_at: null,
      });

      sut.insertOnTable("user_settings");
      expect(sut["database"].user_settings.toArray()).toHaveLength(1);
      expect(sut["database"].user_settings.toArray()[0]).toMatchObject({
        id: expect.any(String),
        user_id: expect.any(String),
        language: "pt-BR",
        email_notifications: false,
        push_notifications: true,
        webhook_notifications: true,
        max_projects: 3,
        max_web_hooks_per_project: 10,
        max_notifications_per_month: 10000,
        created_at: expect.any(Date),
        updated_at: null,
      });

      sut.insertOnTable("projects");
      expect(sut["database"].projects.toArray()).toHaveLength(1);
      expect(sut["database"].projects.toArray()[0]).toMatchObject({
        id: expect.any(String),
        user_id: expect.any(String),
        project_name: expect.any(String),
        description: expect.any(String),
        domain: expect.any(String),
        icon: expect.any(String),
        status: "active",
        webhook_secret: expect.any(String),
        rate_limit_per_hour: 60,
        rate_limit_per_day: 1000,
        rate_limit_per_minute: 10000,
        created_at: expect.any(Date),
        updated_at: null,
        deleted_at: null,
      });

      sut.insertOnTable("api_keys");
      expect(sut["database"].api_keys.toArray()).toHaveLength(1);
      expect(sut["database"].api_keys.toArray()[0]).toMatchObject({
        id: expect.any(String),
        project_id: expect.any(String),
        name: expect.any(String),
        key_hash: expect.any(String),
        key_preview: expect.any(String),
        permissions: ["notifications:send", "webhooks:manage"],
        status: "active",
        expires_at: null,
        usage_count: 0,
        created_at: expect.any(Date),
        last_used_at: null,
        updated_at: null,
      });

      expect(sut["database"].users.toArray()).toHaveLength(1);
      expect(sut["database"].user_tokens.toArray()).toHaveLength(1);
      expect(sut["database"].user_settings.toArray()).toHaveLength(1);
      expect(sut["database"].projects.toArray()).toHaveLength(1);
      expect(sut["database"].api_keys.toArray()).toHaveLength(1);
    });

    it("should add an entity on specific table", () => {
      const user = generateUser();
      sut._add("users", user);

      expect(sut["database"].users.toArray()).toHaveLength(1);
      expect(sut["database"].users.toArray()[0]).toStrictEqual(user);
    });

    it("should create a query builder for the required table", () => {
      const query = sut.table("users");
      expect(query).toBeInstanceOf(MockQueryBuilder);
    });
  });
});
