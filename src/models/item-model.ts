import { PoolConnection } from "mysql2/promise";
import { RowDataPacket } from "mysql2";

//アイテムデータの存在チェック
const checkItemExist = async(
  id:number,
  dbConnection:PoolConnection
):Promise<boolean> => {
  const sql = "SELECT `id` FROM `items` WHERE `id` = ?"
  const [itemRows] = await dbConnection.query<RowDataPacket[]>(
    sql,
    id
  );

  if(itemRows[0] != null) return true;
  else return false;
}

export { checkItemExist };