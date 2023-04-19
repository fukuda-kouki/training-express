import * as playerModel from "../models/player-model";
import { Player } from "../interfaces/player";
import { PoolConnection } from "mysql2/promise";

const getIdAndName = async (dbConnection: PoolConnection): Promise<Player[]> => {
  const rows = await playerModel.selectPlayersIdAndName(dbConnection);

  //DBから取得したデータをPlayerに変換
  const idAndName: Player[] = rows.map((row) => {
    return {
      id: row.id,
      name: row.name
    };
  });

  return idAndName;
};

const createPlayer = async (
  data: Player,
  dbConnection: PoolConnection
): Promise<number> => {
  const rows = await playerModel.insertPlayer(data, dbConnection);

  return rows.insertId; //DBから帰ってきたレスポンスからIdを返す
};

export { getIdAndName,createPlayer };