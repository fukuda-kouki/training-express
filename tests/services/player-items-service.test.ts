import { NotEnoughError, UndefinedError } from "../../src/interfaces/my-error";
import { PlayerItems } from "../../src/interfaces/player-items"
import { addItem, useItem } from "../../src/services/player-items-service"
import * as playerItemsModel from "../../src/models/player-items-model"
import * as playerModel from "../../src/models/player-model"
import * as itemModel from "../../src/models/item-model"
import { Player } from "../../src/interfaces/player";
import { Item } from "../../src/interfaces/item";

const playerItemsUndefined: PlayerItems = {};
const playerItemsData: PlayerItems = {
  playerId: 1,
  itemId: 1,
  count: 1
};

const playerItemsUndefinedItemId: PlayerItems = { playerId: playerItemsData.playerId };
const playerItemsUndefinedCount : PlayerItems = {
  playerId: playerItemsData.playerId,
  itemId: playerItemsData.itemId
};

const playerData: Player = {
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

jest
.spyOn(playerModel, "selectPlayerDataByIdWithLock")
.mockResolvedValue(playerData);

jest
.spyOn(itemModel,"selectItemDataById")
.mockResolvedValue(itemData);

describe('player-items-service:addItem', () => {

  jest
  .spyOn(playerItemsModel, "insertOrIncrementData")
  .mockResolvedValue();

  jest
  .spyOn(playerItemsModel, "getCount")
  .mockResolvedValue(playerItemsData.count!);

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

describe('player-items-service:useItem', () => {

  const useItemData: PlayerItems = {
    playerId: 1,
    itemId: 1,
    count: 1
  };

  const playerItemsCountZero: PlayerItems = {
    playerId: 1,
    itemId: 1,
    count: 0
  };

  const updatingData: Player = {
    id: useItemData.playerId,
    hp: playerData.hp! + itemData.heal! * playerItemsData.count!,
    mp: playerData.mp
  };

  if(itemData.id == null) return;
  const retval = {
    'itemId': itemData.id,
    'count':  playerItemsData.count! - useItemData.count!,
    'player': {
      'id': useItemData.playerId,
      'hp': playerData.hp! + itemData.heal! * playerItemsData.count!,
      'mp': playerData.mp
    }
  }

  jest
  .spyOn(playerItemsModel, "selectPlayerItemsDataById")
  .mockResolvedValue(playerItemsData)
  .mockResolvedValueOnce(playerItemsCountZero);

  jest
  .spyOn(playerModel, "updatePlayer")
  .mockResolvedValue();

  jest
  .spyOn(playerItemsModel, "decrementData")
  .mockResolvedValue();

  let connection: any;
  test("playerId is Undefined", () => {
    expect(useItem(playerItemsUndefined, connection))
    .rejects.toThrow(new UndefinedError("useData.playerId is undefined."));
  })

  test("itemId is Undefined", () => {
    expect(useItem(playerItemsUndefinedItemId, connection))
    .rejects.toThrow(new UndefinedError("useData.itemId is undefined."));
  })

  test("count is Undefined", () => {
    expect(useItem(playerItemsUndefinedCount, connection))
    .rejects.toThrow(new UndefinedError("useData.count is undefined."));
  })

  test ("useData.count larger than playeritemsData.count", () => {
    expect(useItem(useItemData, connection))
    .rejects.toThrow(new NotEnoughError("useData.count larger than playeritemsData.count"));
  })

  test ("updatePlayer args", async () => {
    useItem(useItemData, connection)
    .then(() => {
      expect(playerModel.updatePlayer)
      .toBeCalledWith(updatingData, connection);
    })
  })

  test ("decrementData args", async () => {
    useItem(useItemData, connection)
    .then(() => {
      expect(playerItemsModel.decrementData)
      .toBeCalledWith(useItemData, connection);
    })
  })

  test ("return value", () => {
    expect(useItem(useItemData, connection))
    .resolves.toEqual(retval);
  })
})