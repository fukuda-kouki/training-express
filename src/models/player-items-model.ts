import { PoolConnection } from "mysql2/promise";
import { PlayerItems } from "../interfaces/player-items";
import { RowDataPacket } from "mysql2";
import { NotFoundError } from "../interfaces/my-error";

//主キーからレコードを選択してデータを取得
const selectPlayerItemsDataById = async (
  data: PlayerItems,
  dbConnection: PoolConnection
): Promise<PlayerItems> => {

  const sql = "SELECT * FROM `player_items` WHERE `player_id` = ? AND `item_id` = ?";
  const [rows] = await dbConnection.query<RowDataPacket[]>(
    sql,
    [data.playerId, data.itemId]
  );

  if(rows[0] == null) throw new NotFoundError(`PlayerItemdata not found. playerId:${data.playerId} itemId:${data.itemId}`); //データが存在しない場合

  const playerItemData = {
    playerId: rows[0].player_id,
    itemId: rows[0].item_id,
    count: rows[0].count
  };

  return playerItemData;
}

//player_idからレコードをすべて選択してデータを取得
const selectPlayerItemsByPlayerId = async (
  id: number,
  dbConnection: PoolConnection
): Promise<PlayerItems[]> => {

  const sql = "SELECT * FROM `player_items` WHERE `player_id` = ?";
  const [rows] = await dbConnection.query<RowDataPacket[]>(
    sql,
    id
  );

  if(rows[0] == null) throw new NotFoundError(`PlayerItemdata not found. playerId:${id} itemId:${id}`); //データが存在しない場合

  const playerItemData = rows.map((row) => {
    return {
      playerId: row.player_id,
      itemId:   row.item_id,
      count:    row.count
    }
  });

  return playerItemData;
}

//データをinsertし、主キーが重複するデータがある場合にupdateする
const insertOrIncrementData = async (
  data: PlayerItems,
  dbConnection: PoolConnection
): Promise<void> => {

  const sql = "INSERT INTO `player_items`(`player_id`, `item_id`, `count`) VALUES (?, ?, ? ) ON DUPLICATE KEY UPDATE `count` = `count` + ?";
  await dbConnection.query(
    sql,
    [data.playerId, data.itemId, data.count, data.count]
  );
}

const decrementData =async (
  data:PlayerItems,
  dbConnection: PoolConnection
  ): Promise<void> => {
  const sql = "UPDATE `player_items` SET `count` = `count` - ? WHERE player_id = ? AND item_id = ?";
  await dbConnection.query(
    sql,
    [data.count, data.playerId, data.itemId]
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

export { selectPlayerItemsDataById, selectPlayerItemsByPlayerId, insertOrIncrementData, decrementData, getCount };