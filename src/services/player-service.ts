import * as playerModel from "../models/player-model";
import { Player } from "../interfaces/player";
import { PoolConnection } from "mysql2/promise";

const getIdAndName = async (
  dbConnection: PoolConnection
): Promise<Player[]> => {
  const idAndName = await playerModel.selectPlayersIdAndName(dbConnection);
  return idAndName;
};

const getDataById = async (
  id: number,
  dbConnection: PoolConnection
): Promise<Player> => {
  const data = await playerModel.selectPlayerDataById(id, dbConnection);
  return data;
};

const createPlayer = async (
  data: Player,
  dbConnection: PoolConnection
): Promise<number> => {
  const createdId = await playerModel.insertPlayer(data, dbConnection);
  return createdId;
};

const updatePlayer = async (
  data: Player,
  dbConnection: PoolConnection
): Promise<void> => {
  await playerModel.updatePlayer(data, dbConnection);
};

const destroyPlayer = async (
  id: number,
  dbConnection: PoolConnection
): Promise<void> => {
  await playerModel.deletePlayer(id, dbConnection);
};

export { getIdAndName, getDataById, createPlayer, updatePlayer, destroyPlayer };