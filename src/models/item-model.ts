import { PoolConnection } from "mysql2/promise";
import { RowDataPacket } from "mysql2";
import { Item } from "../interfaces/item";
import { NotFoundError } from "../interfaces/my-error";

//全アイテムデータ取得
const selectAllItems = async(
  dbConnection:PoolConnection
):Promise<Item[]> => {
  const sql = "SELECT * FROM `items`"
  const [itemRows] = await dbConnection.query<RowDataPacket[]>(
    sql
  );

  //データをItemに変換して返す
  const itemData: Item[] = itemRows.map((row) => {
    return {
      id:      row.id,
      name:    row.name,
      heal:    row.heal,
      price:   row.price,
      percent: row.percent
    };
  });
  return itemData;
}

//アイテムデータ取得
const selectItemDataById = async(
  id:number,
  dbConnection:PoolConnection
):Promise<Item> => {
  const sql = "SELECT * FROM `items` WHERE `id` = ?"
  const [itemRows] = await dbConnection.query<RowDataPacket[]>(
    sql,
    id
  );

  //データの存在チェック
  if(itemRows[0] == null) throw new NotFoundError(`Data not found. itemId:${id}`);

  //データをItemに変換して返す
  const itemData = {
    id: itemRows[0].id,
    name: itemRows[0].name,
    heal: itemRows[0].heal,
    price: itemRows[0].price,
  }
  return itemData;
}

export { selectAllItems, selectItemDataById };