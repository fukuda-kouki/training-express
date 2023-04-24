import { PoolConnection } from "mysql2/promise";
import { PlayerItems } from "../interfaces/player-items";
import { RowDataPacket } from "mysql2";

//データをinsertし、主キーが重複するデータがある場合にupdateする
const insertOrUpdateData = async (
  data: PlayerItems,
  dbConnection: PoolConnection
): Promise<void> => {

  const sql = "INSERT INTO `player_items`(`player_id`, `item_id`, `count`) VALUES (?, ?, ? ) ON DUPLICATE KEY UPDATE `count` = `count` + ?";
  await dbConnection.query(
    sql,
    [data.playerId, data.itemId, data.count, data.count]
  );
}

//現在のアイテムの所持数を取得
const getCount =async (
  data:PlayerItems,
  dbConnection: PoolConnection
  ): Promise<number> => {
    const selectCountsql = "SELECT `count` FROM `player_items` WHERE `player_id` = ? AND `item_id` = ?";
    const [rows] = await dbConnection.query<RowDataPacket[]>(
      selectCountsql,
      [data.playerId, data.itemId]
    );

    return rows[0].count;
}

export { insertOrUpdateData, getCount };