import { createMockTable, MockTable } from "./mock-table";

type EntityOfTest = {
  id: string;
  name: string;
  email: string;
};

describe("unite tests [MockTable]", () => {
  describe("baseline", () => {
    it("should initialize an instance of MockTable", () => {
      const sut = new MockTable({
        tableName: "tests",
        schema: {} as EntityOfTest,
        primaryKey: "id",
        uniqueFields: ["email"],
      });

      expect(sut).not.toBeUndefined();
      expect(sut).instanceOf(MockTable);
      expect(sut.tableName).toEqual("tests");
      expect(sut["primaryKey"]).toEqual("id");
      expect([...sut["uniqueFields"].values()]).toEqual(["email"]);

      expect(sut.insert).not.toBeUndefined();
      expect(sut.updateById).not.toBeUndefined();
      expect(sut.deleteById).not.toBeUndefined();
      expect(sut.findById).not.toBeUndefined();
      expect(sut.findUnique).not.toBeUndefined();
      expect(sut.toArray).not.toBeUndefined();
    });

    describe("[createMockTable]", () => {
      it("should create an instance of MockTable", () => {
        const table = createMockTable({
          tableName: "tests",
          schema: {} as EntityOfTest,
          primaryKey: "id",
          uniqueFields: ["email"],
        });
        expect(table).not.toBeUndefined();
        expect(table).instanceOf(MockTable);
        expect(table.tableName).toEqual("tests");
        expect(table["primaryKey"]).toEqual("id");
        expect([...table["uniqueFields"].values()]).toEqual(["email"]);
      });
    });
  });

  const createTestTable = () =>
    createMockTable({
      tableName: "tests",
      schema: {} as EntityOfTest,
      primaryKey: "id",
      uniqueFields: ["email"],
    });
  let sut: ReturnType<typeof createTestTable>;

  beforeEach(() => {
    sut = createTestTable();
  });

  it("should insert entities in table", () => {
    const data1: EntityOfTest = {
      id: "1",
      name: "John doe",
      email: "test@email.com",
    };
    const data2: EntityOfTest = {
      id: "2",
      name: "John doe",
      email: "test2@email.com",
    };
    const data3: EntityOfTest = {
      id: "3",
      name: "John doe",
      email: "test3@email.com",
    };

    const spyHasOnRecords = vitest.spyOn(sut["records"], "has");
    const spySetOnRecords = vitest.spyOn(sut["records"], "set");

    sut.insert(data1);
    sut.insert(data2);
    sut.insert(data3);

    const datas = sut.toArray();

    expect(datas).toHaveLength(3);
    expect(spyHasOnRecords).toBeCalledTimes(3);
    expect(spySetOnRecords).toBeCalledTimes(3);
    expect(datas[0]).toStrictEqual(data1);
    expect(datas[1]).toStrictEqual(data2);
    expect(datas[2]).toStrictEqual(data3);
    expect(sut["uniqueIndexes"]["email"].size).toBe(3);
  });

  it("should throw an error to try insert a entity with same primary key ['id']", () => {
    const data1: EntityOfTest = {
      id: "1",
      name: "John doe",
      email: "test@email.com",
    };
    const data2: EntityOfTest = {
      id: "1",
      name: "John doe",
      email: "test2@email.com",
    };

    sut.insert(data1);
    expect(sut.toArray()).toHaveLength(1);
    expect(sut.toArray()[0]?.id).toStrictEqual(data1.id);

    expect(() => {
      sut.insert(data2);
    }).toThrow(`Duplicate primary key 'id' in table 'tests'.`);
  });

  it("should throw an error to try insert an entity with unique fields repeated ['email']", () => {
    const data1: EntityOfTest = {
      id: "1",
      name: "John doe",
      email: "test@email.com",
    };
    const data2: EntityOfTest = {
      id: "2",
      name: "John doe",
      email: "test@email.com",
    };

    sut.insert(data1);
    expect(() => {
      sut.insert(data2);
    }).toThrow(`Duplicate unique field 'email' in table 'tests'.`);
  });

  it("should find the entity by unique index ['email']", () => {
    const data1: EntityOfTest = {
      id: "1",
      name: "John doe",
      email: "test@email.com",
    };

    sut.insert(data1);

    const spyIndexMapGet = vitest.spyOn(sut["uniqueIndexes"]["email"], "get");

    const testEntity = sut.findUnique("email", data1.email);

    expect(testEntity).not.toBeNull();
    expect(testEntity).toStrictEqual(data1);
    expect(spyIndexMapGet).toBeCalledTimes(1);
  });

  it("should find the entity by the primary key which is also considered unique index ['id']", () => {
    const data1: EntityOfTest = {
      id: "1",
      name: "John doe",
      email: "test@email.com",
    };

    sut.insert(data1);

    const spyRecordsGet = vitest.spyOn(sut["records"], "get");

    const testEntity = sut.findUnique("id", data1.id);

    expect(testEntity).not.toBeNull();
    expect(testEntity).toStrictEqual(data1);
    expect(spyRecordsGet).toHaveBeenCalledTimes(1);
  });

  it("should return 'null' if no entity is found when trying find entity by unique field ['id' | 'email']", () => {
    const spyIndexMapGet = vitest.spyOn(sut["uniqueIndexes"]["email"], "get");

    let testEntity = sut.findUnique("email", "fake-email");

    expect(testEntity).toBeNull();
    expect(spyIndexMapGet).toBeCalledTimes(1);

    const spyRecordsGet = vitest.spyOn(sut["records"], "get");

    testEntity = sut.findUnique("id", "fake-id");

    expect(testEntity).toBeNull();
    expect(spyRecordsGet).toBeCalledTimes(1);
  });

  it("should throw an error if to try find by unique index if it field is not an unique index", () => {
    const data1: EntityOfTest = {
      id: "1",
      name: "John doe",
      email: "test@email.com",
    };

    sut.insert(data1);

    expect(() => {
      //@ts-ignore
      sut.findUnique("name", "test");
    }).toThrow(`Field 'name' is not a unique field in table 'tests'.`);
  });

  it("should find an entity by primary key [id]", () => {
    const data1: EntityOfTest = {
      id: "1",
      name: "John doe",
      email: "test@email.com",
    };

    sut.insert(data1);
    const spyRecordsGet = vitest.spyOn(sut["records"], "get");

    const dataEntity = sut.findById(data1.id);

    expect(dataEntity).toBeTruthy();
    expect(dataEntity).toStrictEqual(data1);

    expect(spyRecordsGet).toHaveBeenCalledTimes(1);
  });

  it("should return 'null' when trying find an entity by primary key, but non entity is found", () => {
    const data1: EntityOfTest = {
      id: "1",
      name: "John doe",
      email: "test@email.com",
    };

    sut.insert(data1);
    const spyRecordsGet = vitest.spyOn(sut["records"], "get");

    const dataEntity = sut.findById("fake-primary-key");

    expect(dataEntity).toBeNull();
    expect(dataEntity).not.toStrictEqual(data1);

    expect(spyRecordsGet).toHaveBeenCalledTimes(1);
  });

  it("should update an entity respecting all constraints [primary key, unique] and update indexes", () => {
    const data1: EntityOfTest = {
      id: "1",
      name: "John doe",
      email: "test@email.com",
    };

    const data2: EntityOfTest = {
      id: "2",
      name: "John doe",
      email: "test2@email.com",
    };

    sut.insert(data1);
    sut.insert(data2);

    const spyRecordsSet = vitest.spyOn(sut["records"], "set");

    const updatedEntity = sut.updateById(data1.id, {
      name: "updated-name",
      email: "updated.email.com",
    });

    expect(updatedEntity).toBeTruthy();
    expect(updatedEntity).toMatchObject({
      name: "updated-name",
      email: "updated.email.com",
    });

    expect(spyRecordsSet).toHaveBeenCalledTimes(1);
    expect(spyRecordsSet).toBeCalledWith(data1.id, {
      ...data1,
      name: "updated-name",
      email: "updated.email.com",
    });

    let dataStorageInUniqueIndex = sut.findUnique("email", data1.email);
    expect(dataStorageInUniqueIndex).toBeNull();

    dataStorageInUniqueIndex = sut.findUnique("email", "updated.email.com");
    expect(dataStorageInUniqueIndex).toBeTruthy();
    expect(dataStorageInUniqueIndex).toMatchObject({
      name: "updated-name",
      email: "updated.email.com",
    });
  });

  it("should throw an error when trying update an entity with data that violate unique constraint [same email]", () => {
    const data1: EntityOfTest = {
      id: "1",
      name: "John doe",
      email: "test@email.com",
    };

    const data2: EntityOfTest = {
      id: "2",
      name: "John doe",
      email: "test2@email.com",
    };

    sut.insert(data1);
    sut.insert(data2);

    expect(() => {
      sut.updateById(data1.id, {
        name: "John doe",
        email: "test2@email.com",
      });
    }).throw(`Duplicate unique field 'email' in table 'tests'.`);
  });

  it("should throw an error when trying update a primary key of an entity ['id']", () => {
    const data1: EntityOfTest = {
      id: "1",
      name: "John doe",
      email: "test@email.com",
    };
    sut.insert(data1);
    expect(() => {
      sut.updateById(data1.id, {
        id: "new-id",
      });
    }).throw(
      `Violated primary key 'id' consistence, primary key cannot be chanced.`
    );
  });

  it("should delete an entity by its primary key and delete its indexes", () => {
    const data1: EntityOfTest = {
      id: "1",
      name: "John doe",
      email: "test@email.com",
    };
    sut.insert(data1);

    const spyRecordsMapDelete = vitest.spyOn(sut["records"], "delete");
    const spyIndexMapDelete = vitest.spyOn(
      sut["uniqueIndexes"]["email"],
      "delete"
    );

    const deleteResult = sut.deleteById(data1.id);

    expect(deleteResult).toBe(true);
    expect(sut.toArray()).toHaveLength(0);
    expect(sut["uniqueIndexes"]["email"].size).toBe(0);

    expect(spyRecordsMapDelete).toBeCalledTimes(1);
    expect(spyIndexMapDelete).toBeCalledTimes(1);
  });

  it("should return 'null' when trying delete an entity it's not exist", () => {
    const deleteResult = sut.deleteById("fake-id");
    expect(deleteResult).toBe(false);
  });
});
