import { UndefinedError } from "../../src/interfaces/my-error";
import { PlayerItems } from "../../src/interfaces/player-items"
import { addItem } from "../../src/services/player-items-service"
import * as playerItemsModel from "../../src/models/player-items-model"
import * as playerModel from "../../src/models/player-model"
import * as itemModel from "../../src/models/item-model"
import { Player } from "../../src/interfaces/player";
import { Item } from "../../src/interfaces/item";


describe('player-items-service:addItem', () => {
  const playerItemsUndefined: PlayerItems = {};
  const playerItemsData: PlayerItems = {
    playerId: 1,
    itemId: 1,
    count: 1
  };
  const playerItemsUndefinedItemId: PlayerItems = { playerId: playerItemsData.playerId };

  const playerData: Player ={
    id: playerItemsData.playerId,
    name: "user",
    hp: 10,
    mp: 10,
    money: 10,
  };

  const itemData: Item = {
    id: playerItemsData.itemId,
    name: "hpPotion",
    heal: 100,
    price: 50,
    percent: 30
  }

  if(playerItemsData.count == null) return;

  jest
  .spyOn(playerModel, "selectPlayerDataByIdWithLock")
  .mockResolvedValue(playerData);

  jest
  .spyOn(itemModel,"selectItemDataById")
  .mockResolvedValue(itemData);

  jest
  .spyOn(playerItemsModel, "insertOrIncrementData")
  .mockResolvedValue();

  jest
  .spyOn(playerItemsModel, "getCount")
  .mockResolvedValue(playerItemsData.count);

  test("playerId is Undefined", () => {
    let connection: any;
    expect(addItem(playerItemsUndefined, connection))
    .rejects.toThrow(new UndefinedError("playerId is undefined."));
  })

  test("itemId is Undefined", () => {
    let connection: any;
    expect(addItem(playerItemsUndefinedItemId, connection))
    .rejects.toThrow(new UndefinedError("itemId is undefined."));
  })

  test("return value", () => {
    let connection: any;
    expect(addItem(playerItemsData, connection))
    .resolves.toBe(playerItemsData.count);
  })
})