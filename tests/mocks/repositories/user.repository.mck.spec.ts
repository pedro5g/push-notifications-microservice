import { createMockDatabase } from "./base.repository.mck";
import { MockUserRepository } from "./user.repository.mck";

describe("[MockUserRepository] unit tests", () => {
  let sut: MockUserRepository;

  beforeEach(() => {
    const mockDatabase = createMockDatabase();
    sut = new MockUserRepository(mockDatabase);
  });

  it("should initialize new MockUserRepository()", () => {
    expect(sut).toBeTruthy();
    expect(sut).instanceOf(MockUserRepository);
  });

  it("should insert an user and setting id, status and created_at", async () => {
    const data = {
      name: "Jon Don",
      email: "test@gmail.com",
      password_hash: "hash",
    };
    const user = await sut.create(data);

    expect(user).toBeTruthy();
    expect(user).toMatchObject({
      id: expect.any(String),
      name: data.name,
      email: data.email,
      password_hash: data.password_hash,
      status: "pending_verification",
      created_at: expect.any(Date),
    });

    const userOnMock = sut["database"].users.toArray()[0];

    expect(userOnMock).toBeTruthy();
    expect(userOnMock).toMatchObject({
      id: expect.any(String),
      name: data.name,
      email: data.email,
      password_hash: data.password_hash,
      status: "pending_verification",
      created_at: expect.any(Date),
    });
  });

  it("should return an user when trying to find the user by id and the user exist", async () => {
    const data = {
      id: "test-id",
      name: "Jon Don",
      email: "test@gmail.com",
      password_hash: "hash",
    };
    const newUser = await sut.create(data);

    const foundUser = await sut.findById(newUser.id);
    expect(foundUser).not.toBeNull();
    expect(foundUser).toEqual(newUser);
  });

  it("should return null when trying to find the user by id and the user does not exist", async () => {
    const foundUser = await sut.findById("id--id--id");
    expect(foundUser).toBeNull();
  });

  it("should find user and they must contains the selected fields", async () => {
    const data = {
      name: "Jon Don",
      email: "test@gmail.com",
      password_hash: "hash",
    };
    const user = await sut.create(data);

    const foundUserFieldPassedAsSpread = await sut.findById(
      user.id,
      "name",
      "email"
    );

    expect(foundUserFieldPassedAsSpread).not.toBeNull();
    expect(foundUserFieldPassedAsSpread?.name).toEqual(data.name);
    expect(foundUserFieldPassedAsSpread?.email).toEqual(data.email);
    expect(foundUserFieldPassedAsSpread).not.toStrictEqual(user);
    //@ts-ignore
    expect(foundUserFieldPassedAsSpread?.created_at).toBeUndefined();

    const foundUserFieldPassedAsArray = await sut.findById(user.id, [
      "name",
      "email",
      "password_hash",
      "created_at",
    ]);
    expect(foundUserFieldPassedAsArray).not.toBeNull();
    expect(foundUserFieldPassedAsArray?.name).toEqual(data.name);
    expect(foundUserFieldPassedAsArray?.email).toEqual(data.email);
    expect(foundUserFieldPassedAsArray?.password_hash).toEqual(
      data.password_hash
    );
    expect(foundUserFieldPassedAsArray?.created_at).toBeTruthy();
    //@ts-ignore
    expect(foundUserFieldPassedAsArray?.status).toBeUndefined();
    expect(foundUserFieldPassedAsArray).not.toStrictEqual(user);
  });

  it("should return null if user doesn't exist even though pass select param", async () => {
    const foundUserFieldPassedAsSpread = await sut.findById(
      "id--id--id",
      "name",
      "email"
    );
    expect(foundUserFieldPassedAsSpread).toBeNull();
    const foundUserFieldPassedAsArray = await sut.findById("id--id--id", [
      "name",
      "email",
    ]);
    expect(foundUserFieldPassedAsArray).toBeNull();
  });
});
