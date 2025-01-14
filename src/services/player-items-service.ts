import { PoolConnection } from "mysql2/promise";
import { PlayerItems } from "../interfaces/player-items";
import { selectPlayerDataByIdWithLock, updatePlayer } from "../models/player-model";
import { selectAllItems, selectItemDataById } from "../models/item-model";
import { decrementData, getCount, insertOrIncrementData,selectPlayerItemsDataById, selectPlayerItemsByPlayerId, selectPlayerItemsWithItemDataByPlayerId } from "../models/player-items-model";
import { Player } from "../interfaces/player";
import { NotEnoughError, UndefinedError } from "../interfaces/my-error";
import { Gacha } from "../interfaces/gacha";
import { getRandomIntByRange } from "../helpers/random-helper";
import { PlayerItemsWithItemData } from "../interfaces/player-items-with-item";

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
  gachaRequest:Gacha,
  dbConnection: PoolConnection
  ):Promise<object> => {

  //リクエストのデータチェック
  if(gachaRequest.playerId == null) throw new UndefinedError("gachaRequest.playerId is undefined.")
  if(gachaRequest.count    == null) throw new UndefinedError("gachaRequest.count is undefined.")

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

    //乱数生成 MIN_RANDOM~MAX_RANDOMの値をとる
    const random = getRandomIntByRange(MIN_RANDOM, MAX_RANDOM);

    //乱数をガチャの結果に変換
    while(random > percent && resultId < itemsData.length)
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
  let retValArray: Array<{[index:string]: number | string}> = [];

  const playerItemsData = await selectPlayerItemsByPlayerId(gachaRequest.playerId,dbConnection);

  for(const index in gachaResult)
  {
    const itemName = itemsData[parseInt(index) - 1];
    if(itemName.name == null) throw new UndefinedError("itemName exist undefined data.");
    const PlayerItemData = playerItemsData[parseInt(index) - 1];
    if(PlayerItemData.count == null) throw new UndefinedError("PlayerItemData exist undefined data.");
    let tempObj : {[index:string]: number | string} = {};
    tempObj['itemId'] = parseInt(index);
    tempObj['name']   = itemName.name;
    tempObj['count']  = gachaResult[parseInt(index)];
    tempObj['total']  = PlayerItemData.count;
    retValArray.push(tempObj);
  }

  return retValArray;
}

const getPlayerItemsWithItemDataByPlayerId = async(
  RequestId:number,
  dbConnection: PoolConnection
  ): Promise<PlayerItemsWithItemData[]> => {
  const Data = selectPlayerItemsWithItemDataByPlayerId(RequestId,dbConnection);
  return Data;
}

export{ addItem, useItem, useGacha, getPlayerItemsWithItemDataByPlayerId };