import PoolCluster from "mysql2/typings/mysql/lib/PoolCluster";
import PoolConnection from "mysql2/typings/mysql/lib/PoolConnection";
import { PlayerItems } from "../interfaces/player-items";
import { PlayerItemsController } from "../controllers/player-items-controller";

const insertdata =async (
 data: PlayerItems,
 dbConnection: PoolConnection
): Promise<number> => {
    const count = 0;

  //リクエストされたアイテムの所持データの検索
  const selectSql = "SELECT player_item";
  await dbConnection.query(
    selectSql
  );
    return count;
}