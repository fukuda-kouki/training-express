import { getIdAndName, getDataById, createPlayer, updatePlayer, destroyPlayer } from "../../src/services/player-service"
import { Player } from "../../src/interfaces/player";
import * as playerModel from "../../src/models/player-model";

const mockPlayerIdAndName1: Player = {
  id: 1,
  name: "user1",
};

const mockPlayerIdAndName2: Player = {
  id: 2,
  name: "user2",
};

const mockAllPlayersIdAndName: Player[] = [mockPlayerIdAndName1, mockPlayerIdAndName2 ];
const mockAllPlayersIdAndNameEmpty: Player[] = [];

test("getIdAndName関数", async () => {
  // selectPlayersIdAndNameを実行した時に、一回目はmockAllPlayersIdAndNameを、
  // 二回目はmockAllPlayersIdAndNameEmptyを返すようにする
  jest
    .spyOn(playerModel, "selectPlayersIdAndName")
    .mockResolvedValueOnce(mockAllPlayersIdAndName)
    .mockResolvedValueOnce(mockAllPlayersIdAndNameEmpty);

  // 関数の実行結果と.toEqualの中身を比較する
  let conn: any;
  expect(await getIdAndName(conn)).toEqual(mockAllPlayersIdAndName);
  expect(await getIdAndName(conn)).toEqual(mockAllPlayersIdAndNameEmpty);
});

const playerId = 1;
const mockPlayer: Player = {
  id: 1,
  name: "user1",
  hp: 10,
  mp: 10,
  money: 10,
};

test("getDataById関数", async () => {
  jest
    .spyOn(playerModel, "selectPlayerDataById")
    .mockResolvedValueOnce(mockPlayer)

  let conn: any;
  expect(await getDataById(playerId,conn)).toEqual(mockPlayer);
});


const insertId = 1;
const mockInsertPlayer: Player = {
  name: "user1",
  hp: 10,
  mp: 10,
  money: 10,
};

test("createPlayer関数",async () => {
  jest
    .spyOn(playerModel, "insertPlayer")
    .mockResolvedValueOnce(insertId)

  let conn: any;
  expect(await createPlayer(mockInsertPlayer,conn)).toBe(insertId);
})


const mockUpdatePlayer: Player = {
  id: 1,
  name: "user1",
  hp: 10,
  mp: 10,
  money: 10,
};

test("updatePlayer関数",async () => {
  jest
    .spyOn(playerModel, "updatePlayer")
    .mockResolvedValue();

  let conn: any;
  expect(await updatePlayer(mockUpdatePlayer,conn));
})


const destroyId = 1;
test("destroyPlayer関数", async () => {
  jest
    .spyOn(playerModel, "deletePlayer")
    .mockResolvedValue();

  let conn: any;
  expect(await destroyPlayer(destroyId,conn));
})