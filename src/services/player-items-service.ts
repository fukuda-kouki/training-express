import { PoolConnection } from "mysql2/promise";
import { PlayerItems } from "../interfaces/player-items";




const addItem = async (
  addData: PlayerItems,
  dbConnection: PoolConnection
): Promise<number> => {
  return await addItem(addData,dbConnection);
}

export{ addItem };