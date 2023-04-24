import { PoolConnection } from "mysql2/promise";
import { PlayerItems } from "../interfaces/player-items";
import { insertPlayer } from "../models/player-model";
import { insertData } from "../models/player-items-model";

const addItem = async (
  addData: PlayerItems,
  dbConnection: PoolConnection
): Promise<number> => {
  const count = await insertData(addData,dbConnection);
  return count;
}

export{ addItem };