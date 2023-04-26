import { getAllUsers, createUser } from "../src/services/user-service";
import { User } from "../src/interfaces/user";
import * as userModel from "../src/models/user-model";

const mock_data_user_1: User = {
  id: 1,
  name: "user1",
  password: "password",
  money: 10,
  hp: 10,
};
const mock_data_user_2: User = {
  id: 2,
  name: "user2",
  password: "password",
  money: 10,
  hp: 10,
};
const mock_data_all_users: User[] = [mock_data_user_1, mock_data_user_2];
const mock_data_all_users_empty: User[] = [];

test("get all users", async () => {
  jest
    .spyOn(userModel, "getAllUsers")
    .mockResolvedValueOnce(mock_data_all_users)
    .mockResolvedValueOnce(mock_data_all_users_empty);

  let conn: any;
  expect(await getAllUsers(conn)).toEqual(mock_data_all_users);
  expect(await getAllUsers(conn)).toEqual(mock_data_all_users_empty);
});

test("create user", async () => {
  jest.spyOn(userModel, "createUser").mockImplementation(async (data: User) => {
    mock_data_all_users.push({
      id: mock_data_all_users.length + 1,
      name: data.name,
      password: data.password,
      money: data.money,
      hp: data.hp,
    });
    return mock_data_all_users.length;
  });

  let conn: any;
  expect(
    await createUser(
      { name: "test", password: "test", money: 10, hp: 10 },
      conn
    )
  ).toEqual(mock_data_all_users.length);
});
