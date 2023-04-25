import { PoolConnection } from "mysql2/promise";
import { PlayerItems } from "../interfaces/player-items";
import { selectPlayerDataByIdWithLock } from "../models/player-model";
import { selectItemDataById } from "../models/item-model";
import { decrementData, getCount, insertOrIncrementData, selectPlayerItemsDataById } from "../models/player-items-model";
import { updatePlayer } from "./player-service";
import { Player } from "../interfaces/player";
import { NotEnoughError, UndefinedError } from "../interfaces/my-error";

//定数宣言
const MAX_STATUS = 200;

const addItem = async (
  addData: PlayerItems,
  dbConnection: PoolConnection
): Promise<number> => {

  //プレイヤー存在チェック&ロック
  if(addData.playerId == null) throw new Error("playerId is undefined.");
  await selectPlayerDataByIdWithLock(addData.playerId,dbConnection);

  //アイテム存在チェック
  if(addData.itemId == null) throw new Error("itemId is undefined.");
  await selectItemDataById(addData.itemId,dbConnection);

  //UPDATE OR INSERT
  await insertOrIncrementData(addData,dbConnection); //データの更新or挿入
  return await getCount(addData,dbConnection); //現在のデータの所持数を返す
}

const useItem =async (
  useData:PlayerItems,
  dbConnection: PoolConnection
  ):Promise<object> => {

  //useData変数チェック
  if(useData.playerId == null) throw new UndefinedError("useData.playerId is undefined.");
  if(useData.itemId   == null) throw new UndefinedError("useData.itemId is undefined.");
  if(useData.count    == null) throw new UndefinedError("useData.count is undefined.");

  //プレイヤーデータ取得&存在チェック&ロック
  const playerData = await selectPlayerDataByIdWithLock(useData.playerId,dbConnection);
  if(playerData.hp == null) throw new UndefinedError("playerData.hp is undefined.");
  if(playerData.mp == null) throw new UndefinedError("playerData.mp is undefined.");

  //プレイヤーのステータスを該当する回復アイテムとの紐づけ
  const statuses: {[index: number] : number} = {
    1: playerData.hp,
    2: playerData.mp,
  };

  //アイテムデータ取得&存在チェック
  const itemData = await selectItemDataById(useData.itemId,dbConnection);
  if(itemData.heal == null) throw new UndefinedError("itemData.heal is undefined.");

  //アイテム所持データ取得&存在チェック
  const playerItemsData = await selectPlayerItemsDataById(useData,dbConnection);
  if(playerItemsData.count == null) throw new UndefinedError("playerItemsData.count is undefined.");

  //使用できるアイテムの数&使用後のステータスを計算
  if(useData.count > playerItemsData.count) throw new NotEnoughError("useData.count larger than playeritemsData.count");
  let usableCount: number;
  let status = statuses[useData.itemId];

  const healingValue = itemData.heal;
  for(usableCount = 0; usableCount < useData.count ; usableCount++) {
    if(status >= MAX_STATUS) break;
    status = Math.min(status + healingValue, MAX_STATUS);
  }

  //ステータス更新
  let updatingPlayerData: Player = {};
  updatingPlayerData.id = useData.playerId;
  switch (useData.itemId) {
    case 1:
      updatingPlayerData.hp = status;
      updatingPlayerData.mp = playerData.mp;
      break;

    case 2:
      updatingPlayerData.hp = playerData.hp;
      updatingPlayerData.mp = status;
      break;

    default:
      break;
  }
  await updatePlayer(updatingPlayerData, dbConnection);

  //アイテム数更新
  useData.count = usableCount;
  await decrementData(useData,dbConnection);

  //戻り値の成型
  const retval = {
    'itemId': itemData.id,
    'count':  playerItemsData.count - usableCount,
    'player': {
      'id': updatingPlayerData.id,
      'hp': updatingPlayerData.hp,
      'mp': updatingPlayerData.mp
    }
  }

  return retval;
}

export{ addItem, useItem };