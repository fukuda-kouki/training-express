import { PoolConnection } from "mysql2/promise";
import { PlayerItems } from "../interfaces/player-items";
import { RowDataPacket } from "mysql2";
import { NotFoundError } from "../interfaces/my-error";

const insertData = async (
  data: PlayerItems,
  dbConnection: PoolConnection
): Promise<number> => {

  //プレイヤーデータの存在チェック
  const checkPlayerTable = "SELECT `id` FROM `players` WHERE `id` = ? FOR UPDATE"
  const [playerRows] = await dbConnection.query<RowDataPacket[]>(
    checkPlayerTable,
    data.player_id
  );
  if(playerRows[0] == null) throw new NotFoundError(`Data not found. player_id:${data.player_id}`);

  //アイテムデータの存在チェック
  const checkItemTable = "SELECT `id` FROM `items` WHERE `id` = ?"
  const [itemRows] = await dbConnection.query<RowDataPacket[]>(
    checkItemTable,
    data.item_id
  );
  if(itemRows[0] == null) throw new NotFoundError(`Data not found. item_id:${data.item_id}`);


  //データをinsertし、すでに主キーが重複するデータがある場合にupdateする
  const sql = "INSERT INTO `player_items`(`player_id`, `item_id`, `count`) VALUES (?, ?, ? ) ON DUPLICATE KEY UPDATE `count` = `count` + ?";
  await dbConnection.query(
    sql,
    [data.player_id, data.item_id, data.count, data.count]
  );

  //現在のアイテムの所持数を取得
  const selectCountsql = "SELECT `count` FROM `player_items` WHERE `player_id` = ? AND `item_id` = ?";
  const [rows] = await dbConnection.query<RowDataPacket[]>(
    selectCountsql,
    [data.player_id, data.item_id]
  );

  return rows[0].count;
}

export { insertData };