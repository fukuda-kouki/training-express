import { PoolConnection } from "mysql2/promise";
import { PlayerItems } from "../interfaces/player-items";
import { selectPlayerDataByIdWithLock, updatePlayer } from "../models/player-model";
import { selectAllItems, selectItemDataById } from "../models/item-model";
import { decrementData, getCount, insertOrIncrementData,selectPlayerItemsDataById, selectPlayerItemsByPlayerId } from "../models/player-items-model";
import { Player } from "../interfaces/player";
import { NotEnoughError, UndefinedError } from "../interfaces/my-error";
import { Gahca } from "../interfaces/gacha";

//定数宣言
const MAX_STATUS = 200;
const GACHA_PRICE = 10;
const MAX_RANDOM = 100;
const MIN_RANDOM = 1;

const addItem = async (
  addData: PlayerItems,
  dbConnection: PoolConnection
): Promise<number> => {

  //プレイヤー存在チェック&ロック
  if(addData.playerId == null) throw new UndefinedError("playerId is undefined.");
  await selectPlayerDataByIdWithLock(addData.playerId,dbConnection);

  //アイテム存在チェック
  if(addData.itemId == null) throw new UndefinedError("itemId is undefined.");
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

const useGacha =async (
  gachaRequest:Gahca,
  dbConnection: PoolConnection
  ):Promise<object> => {

  //プレイヤーデータ取得&存在チェック&ロック
  const playerData = await selectPlayerDataByIdWithLock(gachaRequest.playerId,dbConnection);
  if(playerData.money == null) throw new UndefinedError("playerData.money is undefined.");

  //プレイヤーが回数分のmoneyを所持しているか
  if(playerData.money < gachaRequest.count * GACHA_PRICE) throw new NotEnoughError("playerData.money less than all gacha price.");

  //アイテムデータ取得&存在チェック
  const itemsData = await selectAllItems(dbConnection);

  //ガチャを引く
  let gachaResult: {[index: number] : number} = {};
  for(let gachaCount = 0; gachaCount < gachaRequest.count; gachaCount++)
  {
    let resultId:number = 0; //ガチャの結果をitemIdで格納
    let percent:number  = 0; //乱数をitemIdに変換する際に使用

    //乱数生成 1~100の値をとる
    const random = Math.floor(Math.random() * (MAX_RANDOM - MIN_RANDOM) + MIN_RANDOM);

    //乱数をガチャの結果に変換
    while(random > percent && resultId <= itemsData.length)
    {
      resultId++;
      const tempItemData = itemsData[resultId - 1];
      if(tempItemData.percent == null) throw new UndefinedError("itemsData[].price is undefined.");
      percent += tempItemData.percent;
    }
    if(gachaResult[resultId] === undefined) gachaResult[resultId] = 1;
    else gachaResult[resultId]++;
  }

  //代金を引く
  const updatingData: Player =  {
    id: gachaRequest.playerId,
    money: playerData.money - gachaRequest.count * GACHA_PRICE
  };
  await updatePlayer(updatingData,dbConnection);

  //ガチャ結果を反映
  await Promise.all(Object.keys(gachaResult).map(async (key) => {
    const tempplayerItemsData: PlayerItems = {
      playerId: gachaRequest.playerId,
      itemId: parseInt(key),
      count: gachaResult[parseInt(key)]
    };
    await insertOrIncrementData(tempplayerItemsData, dbConnection);
  }));

  //戻り値の成型
  let gachaResultObj: Array<{[index:string]: number}> = [];
  Object.entries(gachaResult).forEach(([key, value]) => {
    let tempObj: {[index:string]: number} = {};
    tempObj['itemId'] = parseInt(key);
    tempObj['count'] = value;
    gachaResultObj.push(tempObj);
  });

  const playerItemsData = await selectPlayerItemsByPlayerId(gachaRequest.playerId,dbConnection);
  let resultItemsObj: Array<{[index:string]: number}> = [];
  Object.entries(playerItemsData).forEach(([key, value]) => {
    if(value.itemId == null) throw new UndefinedError("value.itemId is undefined.");
    if(value.count  == null) throw new UndefinedError("value.count is undefined.");
    let tempObj: {[index:string]: number} = {};
    tempObj['itemId'] = value.itemId;
    tempObj['count'] = value.count;
    resultItemsObj.push(tempObj);
  });

  const retval = {
    'results': gachaResultObj,
    'player' : {
      'monay' : updatingData.money,
      'items' : resultItemsObj
    }
  };
  return retval;
}

export{ addItem, useItem, useGacha };