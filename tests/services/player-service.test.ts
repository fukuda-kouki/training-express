import { getIdAndName, getDataById, createPlayer, updatePlayer, destroyPlayer } from "../../src/services/player-service"
import { Player } from "../../src/interfaces/player";
import * as playerModel from "../../src/models/player-model";

const mock_id_and_name_player_1: Player = {
  id: 1,
  name: "user1",
};

const mock_id_and_name_player_2: Player = {
  id: 2,
  name: "user2",
};

const mock_id_and_name_all_players: Player[] = [mock_id_and_name_player_1, mock_id_and_name_player_2 ];
const mock_id_and_name_all_players_empty: Player[] = [];

test("getIdAndName関数", async () => {
  // selectPlayersIdAndNameを実行した時に、一回目はmock_data_all_playersを、
  // 二回目はmock_data_all_players_emptyを返すようにする
  jest
    .spyOn(playerModel, "selectPlayersIdAndName")
    .mockResolvedValueOnce(mock_id_and_name_all_players)
    .mockResolvedValueOnce(mock_id_and_name_all_players_empty);

  // 関数の実行結果と.toEqualの中身を比較する
  let conn: any;
  expect(await getIdAndName(conn)).toEqual(mock_id_and_name_all_players);
  expect(await getIdAndName(conn)).toEqual(mock_id_and_name_all_players_empty);
});


const mock_player: Player = {
  id: 1,
  name: "user1",
  hp: 10,
  mp: 10,
  money: 10,
};

test("getDataById関数", async () => {
  jest
    .spyOn(playerModel, "selectPlayerDataById")
    .mockResolvedValueOnce(mock_player)

  let conn: any;
  expect(await getDataById(1,conn)).toEqual(mock_player);
});


const insertId = 1;
const mock_insert_player: Player = {
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
  expect(await createPlayer(mock_insert_player,conn)).toBe(insertId);
})


const mock_update_player_1: Player = {
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
  expect(await updatePlayer(mock_update_player_1,conn));
})


const destroyId = 1;
test("destroyPlayer関数", async () => {
  jest
    .spyOn(playerModel, "deletePlayer")
    .mockResolvedValue();

  let conn: any;
  expect(await destroyPlayer(destroyId,conn));
})