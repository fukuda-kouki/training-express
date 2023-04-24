import { PoolConnection } from "mysql2/promise";
import { PlayerItems } from "../interfaces/player-items";
import { checkPlayerExist } from "../models/player-model";
import { checkItemExist } from "../models/item-model";
import { NotFoundError } from "../interfaces/my-error";
import { getCount, insertOrUpdateData } from "../models/player-items-model";

const addItem = async (
  addData: PlayerItems,
  dbConnection: PoolConnection
): Promise<number> => {

  //プレイヤー存在チェック
  if(addData.playerId == null) throw new Error("playerId is undefined.");
  const isPlayerExist = await checkPlayerExist(addData.playerId,dbConnection);
  if(!isPlayerExist) throw new NotFoundError(`Data not found. playerId:${addData.playerId}`);

  //アイテム存在チェック
  if(addData.itemId == null) throw new Error("itemId is undefined.");
  const isItemExist = await checkItemExist(addData.itemId,dbConnection);
  if(!isItemExist) throw new NotFoundError(`Data not found. itemId:${addData.itemId}`);

  //UPDATE OR INSERT
  await insertOrUpdateData(addData,dbConnection); //データの更新or挿入
  return await getCount(addData,dbConnection); //現在のデータの所持数を返す
}

export{ addItem };