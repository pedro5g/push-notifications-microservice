import { createMockQueryBuilder, MockQueryBuilder } from "./mock-query-builder";
import { createMockTable, MockTable } from "./mock-table";

// Test types
type EntityOfTest = {
  id: string;
  name: string;
  email: string;
  isActive?: boolean;
  age?: number;
  status?: "active" | "disable";
  create_at?: Date;
};

type Database = {
  tests: MockTable<EntityOfTest, "id", "email">;
};

describe("unite tests [MockQueryBuilder]", () => {
  let table: MockTable<EntityOfTest, "id", "email">;

  beforeEach(() => {
    table = createMockTable({
      tableName: "tests",
      primaryKey: "id",
      uniqueFields: ["email"],
      schema: {} as EntityOfTest,
    });

    Array.from({ length: 3 }).forEach((_, i) => {
      table.insert({
        id: "" + i,
        email: `test${i}@email.com`,
        name: `john doe ${i}`,
      });
    });
  });

  describe("baseline", () => {
    it("should initialize an new instance of MockQueryBuilder", () => {
      const sut = new MockQueryBuilder<Database>(table);

      expect(sut).toBeTruthy();
      expect(sut).toBeInstanceOf(MockQueryBuilder);
      expect(sut["_table"]).toStrictEqual(table);
      expect(sut["_select"]).toStrictEqual(["*"]);
      expect(sut["_where"]).toStrictEqual([]);
      expect(sut["_orderBy"]).toBeNull();
      expect(sut["_offset"]).toBeNull();
      expect(sut["_limit"]).toBeNull();

      expect(sut.update).toBeTruthy();
      expect(sut.delete).toBeTruthy();
      expect(sut.where).toBeTruthy();
      expect(sut.select).toBeTruthy();
      expect(sut.orderBy).toBeTruthy();
      expect(sut.offset).toBeTruthy();
      expect(sut.limit).toBeTruthy();
      expect(sut.findFirst).toBeTruthy();
      expect(sut.findMany).toBeTruthy();
      expect(sut.findUnique).toBeTruthy();
    });

    it("should create an new instance of MockQueryBuilder went using the [where, select, orderBy] methods, and the next instance must contain the data for the previous function execution", () => {
      const sut = new MockQueryBuilder<Database>(table);
      expect(sut).toBeTruthy();
      expect(sut).toBeInstanceOf(MockQueryBuilder);
      const _where = sut.where({ id: "id" });
      expect(_where).toBeInstanceOf(MockQueryBuilder);
      //@ts-ignore
      expect(_where["_where"]).toStrictEqual([{ id: "id" }]);
      const _select = sut.select("id", "name");
      expect(_select).toBeInstanceOf(MockQueryBuilder);
      //@ts-ignore
      expect(_select["_select"]).toStrictEqual(["id", "name"]);
      const _orderBy = sut.orderBy("id", "asc");
      expect(_orderBy).toBeInstanceOf(MockQueryBuilder);
      //@ts-ignore
      expect(_orderBy["_orderBy"]).toStrictEqual({
        field: "id",
        direction: "asc",
      });

      const _offset = sut.offset(10);
      expect(_offset).toBeInstanceOf(MockQueryBuilder);
      //@ts-ignore
      expect(_offset["_offset"]).toStrictEqual(10);

      const _limit = sut.limit(5);
      expect(_limit).toBeInstanceOf(MockQueryBuilder);
      //@ts-ignore
      expect(_limit["_limit"]).toStrictEqual(5);

      const completeQuery = sut
        .where({ id: "query-id" })
        .select("name")
        .orderBy("id", "asc")
        .offset(5)
        .limit(10);

      expect(completeQuery).toBeInstanceOf(MockQueryBuilder);
      //@ts-ignore
      expect(completeQuery["_where"]).toStrictEqual([{ id: "query-id" }]);
      //@ts-ignore
      expect(completeQuery["_select"]).toStrictEqual(["name"]);
      //@ts-ignore
      expect(completeQuery["_orderBy"]).toStrictEqual({
        field: "id",
        direction: "asc",
      });
      //@ts-ignore
      expect(completeQuery["_limit"]).toStrictEqual(10);
      //@ts-ignore
      expect(completeQuery["_offset"]).toStrictEqual(5);
    });

    describe("[createMockQueryBuilder]", () => {
      it("should create an instance of MockQueryBuilder", () => {
        const sut = createMockQueryBuilder<Database>(table);
        expect(sut).toBeTruthy();
        expect(sut).toBeInstanceOf(MockQueryBuilder);
        expect(sut["_table"]).toStrictEqual(table);
        expect(sut["_select"]).toStrictEqual(["*"]);
        expect(sut["_where"]).toStrictEqual([]);
        expect(sut["_orderBy"]).toBeNull();
        expect(sut["_offset"]).toBeNull();
        expect(sut["_limit"]).toBeNull();
      });
    });
  });

  let sut: MockQueryBuilder<Database>;

  beforeEach(() => {
    sut = new MockQueryBuilder<Database>(table);
  });

  describe("query tests", () => {
    it("should return an list contains all entities in the table when calling the method findMany without [select, where, orderBy]", () => {
      const spyToArrayInTable = vitest.spyOn(table, "toArray");

      const results = sut.findMany();

      expect(results).toHaveLength(3);
      expect(results).toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: "0",
            email: `test0@email.com`,
            name: `john doe 0`,
          }),
          expect.objectContaining({
            id: "1",
            email: `test1@email.com`,
            name: `john doe 1`,
          }),
          expect.objectContaining({
            id: "2",
            email: `test2@email.com`,
            name: `john doe 2`,
          }),
        ])
      );
      expect(spyToArrayInTable).toBeCalledTimes(1);
    });

    it("should return the first entity in the table when called the method findFirst without [select, where, orderBy]", () => {
      const spyFindMany = vitest.spyOn(sut, "findMany");

      const result = sut.findFirst();

      expect(result).not.toBeNull();
      expect(result).toMatchObject({
        id: "0",
        email: `test0@email.com`,
        name: `john doe 0`,
      });

      expect(spyFindMany).toBeCalledTimes(1);
    });

    it("should return 'null' when called the method findFirst and it does not find any entity", () => {
      const spyFindMany = vitest.spyOn(sut, "findMany");

      table["records"].clear();
      const result = sut.findFirst();

      expect(result).toBeNull();
      expect(spyFindMany).toBeCalledTimes(1);
    });

    describe("select", () => {
      it("should return a list with all entities contains the selected fields", () => {
        const results = sut.select("id").findMany();
        expect(results).toHaveLength(3);
        //@ts-ignore
        expect(results[0]?.name).toBeUndefined();
        //@ts-ignore
        expect(results[0]?.email).toBeUndefined();
        expect(results).toStrictEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: "0",
            }),
            expect.objectContaining({
              id: "1",
            }),
            expect.objectContaining({
              id: "2",
            }),
          ])
        );
      });
      it('should return a list with all entities contain all fields when select is called passing "*"', () => {
        const results = sut.select("*").findMany();
        expect(results).toHaveLength(3);
        expect(results).toStrictEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: "0",
              email: `test0@email.com`,
              name: `john doe 0`,
            }),
            expect.objectContaining({
              id: "1",
              email: `test1@email.com`,
              name: `john doe 1`,
            }),
            expect.objectContaining({
              id: "2",
              email: `test2@email.com`,
              name: `john doe 2`,
            }),
          ])
        );
      });
      it("should return an entity contains the selected fields", () => {
        const result = sut.select("id").findFirst();
        expect(result).not.toBeNull();
        expect(result?.id).toStrictEqual("0");
        //@ts-ignore
        expect(result?.name).toBeUndefined();
        //@ts-ignore
        expect(result?.email).toBeUndefined();
      });
      it("should return an entity contains all field went select is called passing '*'", () => {
        const result = sut.select("*").findFirst();
        expect(result).not.toBeNull();
        expect(result).toStrictEqual({
          id: "0",
          email: `test0@email.com`,
          name: `john doe 0`,
        });
      });
    });

    describe("where", () => {
      describe("behavior of operator to each data type", () => {
        it("should available '=', '!=', 'like', 'ilike', 'in', 'nin' operators to string type", () => {
          let results = sut.where({ email: "test1@email.com" }).findMany();
          expect(results).toHaveLength(1);
          expect(results[0]).toStrictEqual({
            id: "1",
            email: `test1@email.com`,
            name: `john doe 1`,
          });

          results = sut.where({ id: "0", email: "test1@email.com" }).findMany();
          expect(results).toHaveLength(0);

          results = sut.where({ id: "1", email: "test1@email.com" }).findMany();
          expect(results).toHaveLength(1);
          expect(results[0]).toStrictEqual({
            id: "1",
            email: `test1@email.com`,
            name: `john doe 1`,
          });

          results = sut
            .where({
              id: ["0", "1"],
              email: ["test0@email.com", "test1@email.com"],
            })
            .findMany();
          expect(results).toHaveLength(2);
          expect(results[0]).toStrictEqual({
            id: "0",
            email: `test0@email.com`,
            name: `john doe 0`,
          });
          expect(results[1]).toStrictEqual({
            id: "1",
            email: `test1@email.com`,
            name: `john doe 1`,
          });

          results = sut
            .where({
              id: ["0"],
              email: ["test0@email.com", "test1@email.com"],
            })
            .findMany();
          expect(results).toHaveLength(1);
          expect(results[0]).toStrictEqual({
            id: "0",
            email: `test0@email.com`,
            name: `john doe 0`,
          });
          results = sut.where("email", "=", "test1@email.com").findMany();
          expect(results).toHaveLength(1);
          expect(results[0]).toStrictEqual({
            id: "1",
            email: `test1@email.com`,
            name: `john doe 1`,
          });
          results = sut.where("email", "!=", "test1@email.com").findMany();
          expect(results).toHaveLength(2);
          expect(results).toStrictEqual(
            expect.arrayContaining([
              expect.objectContaining({
                id: "0",
                email: `test0@email.com`,
                name: `john doe 0`,
              }),
              expect.objectContaining({
                id: "2",
                email: `test2@email.com`,
                name: `john doe 2`,
              }),
            ])
          );
          results = sut.where("email", "like", "email.com").findMany();
          expect(results).toHaveLength(3);
          results = sut.where("email", "like", "fake").findMany();
          expect(results).toHaveLength(0);
          results = sut.where("email", "ilike", "@EMAIL.COM").findMany();
          expect(results).toHaveLength(3);
          results = sut.where("email", "like", "FAKE").findMany();
          expect(results).toHaveLength(0);
          results = sut
            .where("email", "in", ["test0@email.com", "test2@email.com"])
            .findMany();
          expect(results).toHaveLength(2);
          expect(results).toStrictEqual(
            expect.arrayContaining([
              expect.objectContaining({
                id: "0",
                email: `test0@email.com`,
                name: `john doe 0`,
              }),
              expect.objectContaining({
                id: "2",
                email: `test2@email.com`,
                name: `john doe 2`,
              }),
            ])
          );
          results = sut
            .where("email", "nin", ["test0@email.com", "test2@email.com"])
            .findMany();
          expect(results).toHaveLength(1);
          expect(results).toStrictEqual(
            expect.arrayContaining([
              expect.objectContaining({
                id: "1",
                email: `test1@email.com`,
                name: `john doe 1`,
              }),
            ])
          );
        });
        it("should available '=', '!=', '<', '>', '<=', '>=', 'in', 'nin' operators to number type", () => {
          const dataWithAge: EntityOfTest[] = [
            {
              id: "4",
              email: "test4@email.com",
              name: "john due",
              age: 20,
            },
            {
              id: "5",
              email: "test5@email.com",
              name: "john due",
              age: 20,
            },
            {
              id: "6",
              email: "test6@email.com",
              name: "john due",
              age: 12,
            },
          ];

          table["records"].clear(); // before mocked datas
          dataWithAge.forEach((data) => table.insert(data));

          let results = sut.where({ age: 20 }).findMany();

          expect(results).toHaveLength(2);
          expect(results).toStrictEqual(
            expect.arrayContaining([
              expect.objectContaining({
                id: "4",
                email: "test4@email.com",
                name: "john due",
                age: 20,
              }),
              expect.objectContaining({
                id: "5",
                email: "test5@email.com",
                name: "john due",
                age: 20,
              }),
            ])
          );

          results = sut.where("age", "=", 20).findMany();

          expect(results).toHaveLength(2);
          expect(results).toStrictEqual(
            expect.arrayContaining([
              expect.objectContaining({
                id: "4",
                email: "test4@email.com",
                name: "john due",
                age: 20,
              }),
              expect.objectContaining({
                id: "5",
                email: "test5@email.com",
                name: "john due",
                age: 20,
              }),
            ])
          );

          results = sut.where("age", "!=", 20).findMany();

          expect(results).toHaveLength(1);
          expect(results).toStrictEqual(
            expect.arrayContaining([
              expect.objectContaining({
                id: "6",
                email: "test6@email.com",
                name: "john due",
                age: 12,
              }),
            ])
          );
          results = sut.where("age", "<", 20).findMany();

          expect(results).toHaveLength(1);
          expect(results).toStrictEqual(
            expect.arrayContaining([
              expect.objectContaining({
                id: "6",
                email: "test6@email.com",
                name: "john due",
                age: 12,
              }),
            ])
          );
          results = sut.where("age", "<=", 20).findMany();

          expect(results).toHaveLength(3);
          expect(results).toStrictEqual(
            expect.arrayContaining([
              expect.objectContaining({
                id: "4",
                email: "test4@email.com",
                name: "john due",
                age: 20,
              }),
              expect.objectContaining({
                id: "5",
                email: "test5@email.com",
                name: "john due",
                age: 20,
              }),
              expect.objectContaining({
                id: "6",
                email: "test6@email.com",
                name: "john due",
                age: 12,
              }),
            ])
          );
          results = sut.where("age", ">", 12).findMany();

          expect(results).toHaveLength(2);
          expect(results).toStrictEqual(
            expect.arrayContaining([
              expect.objectContaining({
                id: "4",
                email: "test4@email.com",
                name: "john due",
                age: 20,
              }),
              expect.objectContaining({
                id: "5",
                email: "test5@email.com",
                name: "john due",
                age: 20,
              }),
            ])
          );
          results = sut.where("age", ">=", 12).findMany();

          expect(results).toHaveLength(3);
          expect(results).toStrictEqual(
            expect.arrayContaining([
              expect.objectContaining({
                id: "4",
                email: "test4@email.com",
                name: "john due",
                age: 20,
              }),
              expect.objectContaining({
                id: "5",
                email: "test5@email.com",
                name: "john due",
                age: 20,
              }),
              expect.objectContaining({
                id: "6",
                email: "test6@email.com",
                name: "john due",
                age: 12,
              }),
            ])
          );

          results = sut.where("age", "in", [12, 20]).findMany();

          expect(results).toHaveLength(3);
          expect(results).toStrictEqual(
            expect.arrayContaining([
              expect.objectContaining({
                id: "4",
                email: "test4@email.com",
                name: "john due",
                age: 20,
              }),
              expect.objectContaining({
                id: "5",
                email: "test5@email.com",
                name: "john due",
                age: 20,
              }),
              expect.objectContaining({
                id: "6",
                email: "test6@email.com",
                name: "john due",
                age: 12,
              }),
            ])
          );
          results = sut.where("age", "nin", [12, 20]).findMany();

          expect(results).toHaveLength(0);
        });

        it("should available '=', '!=' operators to boolean type", () => {
          const dataWithIsActive: EntityOfTest[] = [
            {
              id: "4",
              email: "test4@email.com",
              name: "john due",
              isActive: true,
            },
            {
              id: "5",
              email: "test5@email.com",
              name: "john due",
              isActive: false,
            },
            {
              id: "6",
              email: "test6@email.com",
              name: "john due",
              isActive: true,
            },
          ];

          table["records"].clear(); // before mocked datas
          dataWithIsActive.forEach((data) => table.insert(data));

          let results = sut.where({ isActive: false }).findMany();
          expect(results).toHaveLength(1);
          results = sut.where({ isActive: true }).findMany();
          expect(results).toStrictEqual(
            expect.arrayContaining([
              expect.objectContaining({
                id: "4",
                email: "test4@email.com",
                name: "john due",
                isActive: true,
              }),
              expect.objectContaining({
                id: "6",
                email: "test6@email.com",
                name: "john due",
                isActive: true,
              }),
            ])
          );

          results = sut.where("isActive", "=", false).findMany();
          expect(results).toHaveLength(1);
          results = sut.where("isActive", "!=", false).findMany();
          expect(results).toStrictEqual(
            expect.arrayContaining([
              expect.objectContaining({
                id: "4",
                email: "test4@email.com",
                name: "john due",
                isActive: true,
              }),
              expect.objectContaining({
                id: "6",
                email: "test6@email.com",
                name: "john due",
                isActive: true,
              }),
            ])
          );
        });

        it("should available '=', '!=', '<', '>', '<=', '>=', 'in', 'nin' operators to Date type", () => {
          const today = new Date("2025-10-08");
          const yesterday = new Date("2025-10-07");
          const tomorrow = new Date("2025-10-09");

          const dataWithCreatedAt: EntityOfTest[] = [
            {
              id: "4",
              email: "test4@email.com",
              name: "john due",
              create_at: today,
            },

            {
              id: "5",
              email: "test5@email.com",
              name: "john due",
              create_at: tomorrow,
            },
            {
              id: "6",
              email: "test6@email.com",
              name: "john due",
              create_at: yesterday,
            },
            {
              id: "7",
              email: "test7@email.com",
              name: "john due",
              create_at: today,
            },
          ];

          table["records"].clear(); // before mocked datas
          dataWithCreatedAt.forEach((data) => table.insert(data));

          let results = sut.where({ create_at: today }).findMany();
          expect(results).toHaveLength(2);
          expect(results).toStrictEqual(
            expect.arrayContaining([
              expect.objectContaining({
                id: "4",
                email: "test4@email.com",
                name: "john due",
                create_at: today,
              }),
              expect.objectContaining({
                id: "7",
                email: "test7@email.com",
                name: "john due",
                create_at: today,
              }),
            ])
          );
          results = sut.where("create_at", "=", today).findMany();

          expect(results).toHaveLength(2);
          expect(results).toStrictEqual(
            expect.arrayContaining([
              expect.objectContaining({
                id: "4",
                email: "test4@email.com",
                name: "john due",
                create_at: today,
              }),
              expect.objectContaining({
                id: "7",
                email: "test7@email.com",
                name: "john due",
                create_at: today,
              }),
            ])
          );

          results = sut.where("create_at", "!=", today).findMany();
          expect(results).toHaveLength(2);
          expect(results).toStrictEqual(
            expect.arrayContaining([
              expect.objectContaining({
                id: "5",
                email: "test5@email.com",
                name: "john due",
                create_at: tomorrow,
              }),
              expect.objectContaining({
                id: "6",
                email: "test6@email.com",
                name: "john due",
                create_at: yesterday,
              }),
            ])
          );

          results = sut.where("create_at", ">", today).findMany();
          expect(results).toHaveLength(1);
          expect(results).toStrictEqual(
            expect.arrayContaining([
              expect.objectContaining({
                id: "5",
                email: "test5@email.com",
                name: "john due",
                create_at: tomorrow,
              }),
            ])
          );
          results = sut.where("create_at", ">=", today).findMany();
          expect(results).toHaveLength(3);
          expect(results).toStrictEqual(
            expect.arrayContaining([
              expect.objectContaining({
                id: "4",
                email: "test4@email.com",
                name: "john due",
                create_at: today,
              }),
              expect.objectContaining({
                id: "7",
                email: "test7@email.com",
                name: "john due",
                create_at: today,
              }),
              expect.objectContaining({
                id: "5",
                email: "test5@email.com",
                name: "john due",
                create_at: tomorrow,
              }),
            ])
          );

          results = sut.where("create_at", "<", today).findMany();
          expect(results).toHaveLength(1);
          expect(results).toStrictEqual(
            expect.arrayContaining([
              expect.objectContaining({
                id: "6",
                email: "test6@email.com",
                name: "john due",
                create_at: yesterday,
              }),
            ])
          );

          results = sut.where("create_at", "<=", today).findMany();
          expect(results).toHaveLength(3);
          expect(results).toStrictEqual(
            expect.arrayContaining([
              expect.objectContaining({
                id: "4",
                email: "test4@email.com",
                name: "john due",
                create_at: today,
              }),
              expect.objectContaining({
                id: "7",
                email: "test7@email.com",
                name: "john due",
                create_at: today,
              }),
              expect.objectContaining({
                id: "6",
                email: "test6@email.com",
                name: "john due",
                create_at: yesterday,
              }),
            ])
          );
          results = sut.where("create_at", "in", [today, yesterday]).findMany();
          expect(results).toHaveLength(3);
          expect(results).toStrictEqual(
            expect.arrayContaining([
              expect.objectContaining({
                id: "4",
                email: "test4@email.com",
                name: "john due",
                create_at: today,
              }),
              expect.objectContaining({
                id: "7",
                email: "test7@email.com",
                name: "john due",
                create_at: today,
              }),
              expect.objectContaining({
                id: "6",
                email: "test6@email.com",
                name: "john due",
                create_at: yesterday,
              }),
            ])
          );
          results = sut
            .where("create_at", "nin", [today, yesterday])
            .findMany();
          expect(results).toHaveLength(1);
          expect(results).toStrictEqual(
            expect.arrayContaining([
              expect.objectContaining({
                id: "5",
                email: "test5@email.com",
                name: "john due",
                create_at: tomorrow,
              }),
            ])
          );
        });
      });
    });
    describe("orderBy", () => {
      it("should be able to order by field 'asc' | 'desc'", () => {
        let result = sut.orderBy("id", "desc").findFirst();
        expect(result).not.toBeNull();
        expect(result?.id).toStrictEqual("2");

        result = sut.orderBy("id", "asc").findFirst();
        expect(result).not.toBeNull();
        expect(result?.id).toStrictEqual("0");

        result = sut.orderBy("email", "desc").findFirst();
        expect(result).not.toBeNull();
        expect(result?.id).toStrictEqual("2");

        result = sut.orderBy("email", "asc").findFirst();
        expect(result).not.toBeNull();
        expect(result?.id).toStrictEqual("0");
      });

      it("should be able to order by field of type date 'asc' | 'desc'", () => {
        const today = new Date("2025-10-08");
        const yesterday = new Date("2025-10-07");
        const tomorrow = new Date("2025-10-09");

        const dataWithCreatedAt: EntityOfTest[] = [
          {
            id: "4",
            email: "test4@email.com",
            name: "john due",
            create_at: today,
          },
          {
            id: "5",
            email: "test5@email.com",
            name: "john due",
            create_at: tomorrow,
          },
          {
            id: "6",
            email: "test6@email.com",
            name: "john due",
            create_at: yesterday,
          },
          {
            id: "7",
            email: "test7@email.com",
            name: "john due",
            create_at: today,
          },
        ];

        table["records"].clear(); // before mocked datas
        dataWithCreatedAt.forEach((data) => table.insert(data));

        let result = sut.orderBy("create_at", "asc").findFirst();
        expect(result).not.toBeNull();
        expect(result?.create_at).toStrictEqual(
          dataWithCreatedAt[2]?.create_at
        );
        result = sut.orderBy("create_at", "desc").findFirst();
        expect(result).not.toBeNull();
        expect(result?.create_at).toStrictEqual(
          dataWithCreatedAt[1]?.create_at
        );
      });
    });

    describe("offset/limit", () => {
      it("should skip the first items in a query", () => {
        let result = sut.offset(1).findMany();
        expect(result).toHaveLength(2);
        expect(result).toStrictEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: "1",
              email: `test1@email.com`,
              name: `john doe 1`,
            }),
            expect.objectContaining({
              id: "2",
              email: `test2@email.com`,
              name: `john doe 2`,
            }),
          ])
        );

        result = sut.offset(2).findMany();
        expect(result).toHaveLength(1);
        expect(result).toStrictEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: "2",
              email: `test2@email.com`,
              name: `john doe 2`,
            }),
          ])
        );

        result = sut.offset(3).findMany();
        expect(result).toHaveLength(0);
        expect(result).toStrictEqual([]);
      });
      it("should limit quantity of items the query returns", () => {
        let results = sut.limit(1).findMany();
        expect(results).toHaveLength(1);
        expect(results).toStrictEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: "0",
              email: `test0@email.com`,
              name: `john doe 0`,
            }),
          ])
        );

        results = sut.limit(2).findMany();
        expect(results).toHaveLength(2);
        expect(results).toStrictEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: "0",
              email: `test0@email.com`,
              name: `john doe 0`,
            }),
            expect.objectContaining({
              id: "1",
              email: `test1@email.com`,
              name: `john doe 1`,
            }),
          ])
        );

        results = sut.limit(4).findMany();
        expect(results).toHaveLength(3);
        expect(results).toStrictEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: "0",
              email: `test0@email.com`,
              name: `john doe 0`,
            }),
            expect.objectContaining({
              id: "1",
              email: `test1@email.com`,
              name: `john doe 1`,
            }),
            expect.objectContaining({
              id: "2",
              email: `test2@email.com`,
              name: `john doe 2`,
            }),
          ])
        );
      });
    });

    describe("findUnique", () => {
      it("should find an entity by its unique field", () => {
        let result = sut.findUnique("id", "0");
        expect(result).not.toBeNull();
        expect(result?.id).toStrictEqual("0");
        result = sut.where({ id: "0" }).findUnique();
        expect(result).not.toBeNull();
        expect(result?.id).toStrictEqual("0");

        result = sut.where({ email: "test0@email.com" }).findUnique();
        expect(result).not.toBeNull();
        expect(result?.email).toStrictEqual("test0@email.com");
      });
      it("should throw an error if it does not pass any unique field in the filter", () => {
        expect(() => {
          sut.findUnique();
        }).throw(
          `Field '@@NON_UNIQUE_FIELD__' is not a unique field in table 'tests'.`
        );
      });
    });

    describe("update", () => {
      it("should update all entities in a table when no filter is passed", () => {
        const affected = sut.update({ name: "pedro lindão" });
        expect(affected).toBe(3);

        expect(table.toArray()).toHaveLength(3);
        expect(table.toArray()).toStrictEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: "0",
              email: `test0@email.com`,
              name: "pedro lindão",
            }),
            expect.objectContaining({
              id: "1",
              email: `test1@email.com`,
              name: "pedro lindão",
            }),
            expect.objectContaining({
              id: "2",
              email: `test2@email.com`,
              name: "pedro lindão",
            }),
          ])
        );
      });
      it("should only update entities that match the filter", () => {
        const affected = sut
          .where({ id: "0" })
          .update({ name: "pedro lindão" });

        expect(affected).toEqual(1);
        expect(table.toArray()).toStrictEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: "0",
              email: `test0@email.com`,
              name: "pedro lindão",
            }),
            expect.objectContaining({
              id: "1",
              email: `test1@email.com`,
              name: `john doe 1`,
            }),
            expect.objectContaining({
              id: "2",
              email: `test2@email.com`,
              name: `john doe 2`,
            }),
          ])
        );
      });
      it("should called the appendPrimaryKey method when to trying update an entity but primary key is not passed to the filter", () => {
        const query = sut.where({ name: "john doe 0" });

        //@ts-ignore
        const spyAppendPrimaryKey = vitest.spyOn(query, "appendPrimaryKey");

        const affected = query.update({ name: "pedro lindão" });

        expect(affected).toEqual(1);
        expect(table.toArray()).toStrictEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: "0",
              email: `test0@email.com`,
              name: "pedro lindão",
            }),
            expect.objectContaining({
              id: "1",
              email: `test1@email.com`,
              name: `john doe 1`,
            }),
            expect.objectContaining({
              id: "2",
              email: `test2@email.com`,
              name: `john doe 2`,
            }),
          ])
        );
        expect(spyAppendPrimaryKey).toHaveBeenCalledTimes(1);
      });
    });
    describe("delete", () => {
      it("should delete every entities in the table when no filter is passed", () => {
        const affected = sut.delete();
        expect(affected).toEqual(3);
        expect(table.toArray()).toStrictEqual([]);
      });
      it("should only delete entities that match filter", () => {
        const affected = sut.where({ id: "0" }).delete();
        expect(affected).toEqual(1);
        expect(table.toArray).not.toStrictEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: "0",
              email: `test0@email.com`,
              name: "john doe 0",
            }),
          ])
        );
      });
      it("should called the appendPrimaryKey method when to trying delete an entity but primary key is not passed to the filter", () => {
        const query = sut.where({ name: "john doe 0" });

        //@ts-ignore
        const spyAppendPrimaryKey = vitest.spyOn(query, "appendPrimaryKey");

        const affected = query.delete();

        expect(affected).toEqual(1);
        expect(table.toArray).not.toStrictEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: "0",
              email: `test0@email.com`,
              name: "john doe 0",
            }),
          ])
        );

        expect(spyAppendPrimaryKey).toHaveBeenCalledTimes(1);
      });
    });

    describe("workflow", () => {
      it("should make a complete query using where, selete and orderBy", () => {
        const result = sut
          .where("name", "like", "john")
          .select("name")
          .orderBy("id", "desc")
          .findMany();

        expect(result).toHaveLength(3);
        expect(result[0]).toStrictEqual({
          name: `john doe 2`,
        });
      });
    });
  });
});
