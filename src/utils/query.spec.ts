import type { Knex } from "knex";
import {
  isNotNullish,
  isObject,
  KnexQueryBuilder,
  normalizeFieldPath,
  parseFilter,
  parseSelect,
} from "./query";
import type { Mock } from "vitest";

type MockQueryBuilder = {
  select: Mock;
  where: Mock;
  whereNot: Mock;
  orWhere: Mock;
  whereIn: Mock;
  whereNotIn: Mock;
  whereNull: Mock;
  whereNotNull: Mock;
  whereBetween: Mock;
  whereRaw: Mock;
  orderBy: Mock;
  limit: Mock;
  offset: Mock;
  leftJoin: Mock;
  count: Mock;
  then: (onFulfilled: any) => Promise<any>;
  mockData: any[];
};

const mockQueryBuilder: MockQueryBuilder = {
  select: vi.fn(),
  where: vi.fn(),
  whereNot: vi.fn(),
  orWhere: vi.fn(),
  whereIn: vi.fn(),
  whereNotIn: vi.fn(),
  whereNull: vi.fn(),
  whereNotNull: vi.fn(),
  whereBetween: vi.fn(),
  whereRaw: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  offset: vi.fn(),
  leftJoin: vi.fn(),
  count: vi.fn().mockResolvedValue([{ count: "50" }]),
  then: function (onFulfilled: any) {
    return Promise.resolve(this.mockData || []).then(onFulfilled);
  },
  mockData: [] as any[],
};

const mockKnex = vi.fn(() => mockQueryBuilder) as unknown as Knex;

describe("KnexQueryBuilder", () => {
  let sut: KnexQueryBuilder<"users">;
  const tableName = "users";

  beforeEach(() => {
    vi.clearAllMocks();
    mockQueryBuilder.mockData = [];
    const methodsWithCallbacks = ["where", "orWhere", "whereNot"];
    for (const method of methodsWithCallbacks) {
      mockQueryBuilder[method as keyof MockQueryBuilder] = vi.fn(function (
        this: MockQueryBuilder,
        arg: any
      ) {
        // ensures MockQueryBuilder will be passed as callback
        if (typeof arg === "function") {
          arg.call(this, this);
        }
        return this;
      }) as any;
    }

    Object.keys(mockQueryBuilder).forEach((key) => {
      const fn = mockQueryBuilder[key as keyof MockQueryBuilder];
      if (typeof fn === "function" && "mockReturnThis" in fn) {
        if (!methodsWithCallbacks.includes(key)) {
          (fn as Mock).mockReturnThis();
        }
      }
    });

    mockQueryBuilder.count.mockResolvedValue([{ count: "50" }]);

    sut = new KnexQueryBuilder(mockKnex, tableName);
  });

  describe("Utils", () => {
    it("[isNotNullish] should check value is not nullish (undefined | null)", () => {
      const tests = [undefined, null, "", false, 0];

      const results = tests.map((ts) => isNotNullish(ts));

      expect(results[0]).toBe(false);
      expect(results[1]).toBe(false);
      expect(results[2]).toBe(true);
      expect(results[3]).toBe(true);
      expect(results[4]).toBe(true);
    });

    it("[isObject] should if value is an object", () => {
      const tests = [undefined, null, "", {}, new Date()];
      const results = tests.map((ts) => isObject(ts));
      expect(results[0]).toBe(false);
      expect(results[1]).toBe(false);
      expect(results[2]).toBe(false);
      expect(results[3]).toBe(true);
      expect(results[4]).toBe(true);
    });

    it("[normalizeFieldPath] should normalize filed name to database path (example.name)", () => {
      const tableName = "test";
      const fieldWithoutTableName = "name";
      let result = normalizeFieldPath(fieldWithoutTableName, tableName);
      expect(result).toBe(tableName + "." + fieldWithoutTableName);
      const fieldNameWithTableName = "test.name";
      result = normalizeFieldPath(fieldNameWithTableName, tableName);
      expect(result).toBe(fieldNameWithTableName);
    });

    it("[parseSelect] should covert filed name array to unique and normalizeFieldPath", () => {
      const tableName = "test";
      let fieldNames = ["name", "age", "city"];

      let result = parseSelect(fieldNames, tableName);

      result.forEach((rs, i) => {
        expect(rs).toBe(tableName + "." + fieldNames[i]);
      });

      fieldNames = ["name", "age", "city", "name", "age"];

      result = parseSelect(fieldNames, tableName);

      expect(result).toHaveLength(3);
      result.forEach((rs, i) => {
        expect(rs).toBe(tableName + "." + fieldNames[i]);
      });
    });

    it("[parseFilter] should convert string to object if possible otherwise null", () => {
      expect(parseFilter(null as any)).toBeNull();
      expect(parseFilter(undefined as any)).toBeNull();

      expect(parseFilter('{ "age": { "$gt": 25 } }')).toEqual({
        age: { $gt: 25 },
      });

      // invalid json
      expect(parseFilter('{ "age": { $gt: 25 ')).toBeNull();

      const obj = { id: 1 };
      expect(parseFilter(obj)).toBe(obj);
    });
  });

  it("should be instantiated correctly", () => {
    expect(sut).toBeInstanceOf(KnexQueryBuilder);
    expect(sut["tableName"]).toBe(tableName);
    expect(sut["knex"]).toEqual(mockKnex);
  });

  describe("Filters", () => {
    it("should apply a simple equal filter", async () => {
      await sut.find({ filter: { name: "John Doe" } });
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        "users.name",
        "John Doe"
      );
    });

    it("should apply multiples equalities filters (implicit AND)", async () => {
      await sut.find({ filter: { name: "John Doe", age: 30 } });
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        "users.name",
        "John Doe"
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith("users.age", 30);
    });

    it("should apply $gt operator (grater than)", async () => {
      await sut.find({ filter: { age: { $gt: 25 } } });
      expect(mockQueryBuilder.where).toHaveBeenCalledWith("users.age", ">", 25);
    });

    it("should apply $in operator", async () => {
      await sut.find({ filter: { status: { $in: ["active", "pending"] } } });
      expect(mockQueryBuilder.whereIn).toHaveBeenCalledWith("users.status", [
        "active",
        "pending",
      ]);
    });

    it("should apply $nin operator (not in)", async () => {
      await sut.find({ filter: { status: { $nin: ["archived", "deleted"] } } });
      expect(mockQueryBuilder.whereNotIn).toHaveBeenCalledWith("users.status", [
        "archived",
        "deleted",
      ]);
    });

    it("should apply $null operator", async () => {
      await sut.find({ filter: { deletedAt: { $null: true } } });
      expect(mockQueryBuilder.whereNull).toHaveBeenCalledWith(
        "users.deletedAt"
      );

      await sut.find({ filter: { deletedAt: { $null: false } } });
      expect(mockQueryBuilder.whereNotNull).toHaveBeenCalledWith(
        "users.deletedAt"
      );
    });

    it("should apply $like operator", async () => {
      await sut.find({ filter: { name: { $like: "%John%" } } });
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        "users.name",
        "like",
        "%John%"
      );
    });

    it("should apply $between operator", async () => {
      await sut.find({ filter: { age: { $between: [20, 30] } } });
      expect(mockQueryBuilder.whereBetween).toHaveBeenCalledWith(
        "users.age",
        [20, 30]
      );
    });

    it("should apply a filter in an relationship field", async () => {
      await sut.find({ filter: { "posts.title": { $like: "Hello%" } } });
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        "posts.title",
        "like",
        "Hello%"
      );
    });

    describe("Logical filters", () => {
      it("should apply $or operator", async () => {
        await sut.find({
          filter: { $or: [{ status: "active" }, { age: { $gt: 60 } }] },
        });
        expect(mockQueryBuilder.where).toHaveBeenCalledWith(
          "users.status",
          "active"
        );
        expect(mockQueryBuilder.orWhere).toHaveBeenCalled();

        expect(mockQueryBuilder.where).toHaveBeenCalledWith(
          "users.age",
          ">",
          60
        );
      });

      it("should apply $and operator", async () => {
        await sut.find({
          filter: { $and: [{ status: "active" }, { role: "admin" }] },
        });

        expect(mockQueryBuilder.where).toHaveBeenCalledWith(
          "users.status",
          "active"
        );
        expect(mockQueryBuilder.where).toHaveBeenCalledWith(
          "users.role",
          "admin"
        );
      });

      it("should apply $not operator", async () => {
        await sut.find({ filter: { $not: { status: "inactive" } } });
        expect(mockQueryBuilder.whereNot).toHaveBeenCalled();
        expect(mockQueryBuilder.where).toHaveBeenCalledWith(
          "users.status",
          "inactive"
        );
      });
    });
  });

  describe("Pagination", () => {
    describe("Offset strategy", () => {
      it("should apply limit and offset for the page 2", async () => {
        await sut.find({ pagination: { page: 2, pageSize: 15 } });
        expect(mockQueryBuilder.limit).toHaveBeenCalledWith(15);
        expect(mockQueryBuilder.offset).toHaveBeenCalledWith(15);
        expect(mockQueryBuilder.count).toHaveBeenCalledWith("* as count");
      });

      it("should returns correctly pagination data", async () => {
        mockQueryBuilder.count.mockResolvedValueOnce([{ count: "95" }]);
        const result = await sut.find({
          pagination: { page: 3, pageSize: 20 },
        });

        expect(result.pagination.totalCount).toBe(95);
        expect(result.pagination.totalPages).toBe(5);
        expect(result.pagination.currentPage).toBe(3);
        expect(result.pagination.hasNext).toBe(true);
        expect(result.pagination.hasPrev).toBe(true);
      });
    });

    describe("Cursor strategy", () => {
      beforeEach(() => {
        mockQueryBuilder.mockData = Array.from({ length: 11 }, (_, i) => ({
          id: 100 - i,
          name: `User ${100 - i}`,
        }));
      });

      it("should apply correctly order and limit on first page", async () => {
        const result = await sut.find({
          pagination: { strategy: "cursor", limit: 10 },
        });

        expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
          "users.id",
          "desc"
        );
        expect(mockQueryBuilder.limit).toHaveBeenCalledWith(11); // limit + 1
        expect(result.data.length).toBe(10);
        expect(result.pagination.hasNext).toBe(true);
        expect(result.pagination.hasPrev).toBe(false);
        expect(result.pagination.nextCursor).toBe("91"); // O id for 10º item
      });

      it("should apply filter of cursor for next page", async () => {
        const result = await sut.find({
          pagination: { strategy: "cursor", limit: 10, cursor: "91" },
        });

        expect(mockQueryBuilder.where).toHaveBeenCalledWith(
          "users.id",
          "<",
          "91"
        );
        expect(result.pagination.hasPrev).toBe(true);
      });
    });

    describe("Hybrid strategy", () => {
      it("should use 'offset' when there's not cursor and the offset limit has not been reached", async () => {
        await sut.find({
          pagination: { strategy: "hybrid", page: 2, pageSize: 20 },
        });
        expect(mockQueryBuilder.offset).toHaveBeenCalledWith(20);
        expect(mockQueryBuilder.limit).toHaveBeenCalledWith(20);
      });

      it("should use 'cursor' when a cursor is provided", async () => {
        await sut.find({ pagination: { strategy: "hybrid", cursor: "123" } });
        expect(mockQueryBuilder.where).toHaveBeenCalledWith(
          "users.id",
          "<",
          "123"
        );
        expect(mockQueryBuilder.offset).not.toHaveBeenCalled();
      });

      it("should change to 'cursor' when the offset limit is exceeded", async () => {
        // page * limit (51 * 20 = 1020) > maxOffsetLimit (1000)
        await sut.find({
          pagination: { strategy: "hybrid", page: 51, pageSize: 20 },
        });
        // should use cursor then is not has offset
        expect(mockQueryBuilder.offset).not.toHaveBeenCalled();
        expect(mockQueryBuilder.limit).toHaveBeenCalledWith(21); // limit + 1 para cursor
      });
    });
  });

  describe("OrderBy, select and relations", () => {
    it("should apply correctly orderby", async () => {
      await sut.find({ sort: { name: "asc", createdAt: "desc" } });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        "users.name",
        "asc"
      );
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        "users.createdAt",
        "desc"
      );
    });

    it("should apply orderby in an relation field", async () => {
      await sut.find({ sort: { "posts.createdAt": "desc" } });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        "posts.createdAt",
        "desc"
      );
    });

    it("should select specify fields", async () => {
      await sut.find({ select: ["id", "name"] });
      expect(mockQueryBuilder.select).toHaveBeenCalledWith([
        "users.id",
        "users.name",
      ]);
    });

    it("should apply joins for specify relations", async () => {
      await sut.find({ relations: ["posts", "profile"] });
      expect(mockQueryBuilder.leftJoin).toHaveBeenCalledWith(
        "posts",
        "users.posts_id",
        "posts.id"
      );
      expect(mockQueryBuilder.leftJoin).toHaveBeenCalledWith(
        "profile",
        "users.profile_id",
        "profile.id"
      );
    });
  });

  describe("Error handles", () => {
    it("should throw a error if $in not recibes an array", async () => {
      const query = sut.find({ filter: { id: { $in: "not-an-array" } } });
      await expect(query).rejects.toThrow(
        "Operator $in expects an array but received: string"
      );
    });
    it("should throw an error if $nin not recibes an array", async () => {
      const query = sut.find({ filter: { id: { $nin: "not-an-array" } } });
      await expect(query).rejects.toThrow(
        "Operator $nin expects an array but received: string"
      );
    });

    it("should throw an error if $between don't recibes an array with 2 elements", async () => {
      const query = sut.find({ filter: { age: { $between: [1] } } });
      await expect(query).rejects.toThrow(
        "Operator $between expects an array of two elements"
      );
    });

    it("should throw an error if $between don't recibes an array with 2 elements", async () => {
      const query = sut.find({ filter: { age: { $between: [1] } } });
      await expect(query).rejects.toThrow(
        "Operator $between expects an array of two elements"
      );
    });
  });
});
