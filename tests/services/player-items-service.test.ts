import { NotEnoughError, UndefinedError } from "../../src/interfaces/my-error";
import { addItem, useGacha, useItem } from "../../src/services/player-items-service"
import * as playerItemsModel from "../../src/models/player-items-model"
import * as playerModel from "../../src/models/player-model"
import * as itemModel from "../../src/models/item-model"
import * as randomHelper from "../../src/helpers/random-helper"
import { Player } from "../../src/interfaces/player";
import { Item } from "../../src/interfaces/item";
import { PlayerItems } from "../../src/interfaces/player-items"
import { Gacha } from "../../src/interfaces/gacha";

const playerItemsUndefined: PlayerItems = {};
const playerItemsData1: PlayerItems = {
  playerId: 1,
  itemId: 1,
  count: 1
};

const playerItemsData2: PlayerItems = {
  playerId: 1,
  itemId: 2,
  count: 9
};

const playerItemsUndefinedItemId: PlayerItems = { playerId: playerItemsData1.playerId };
const playerItemsUndefinedCount : PlayerItems = {
  playerId: playerItemsData1.playerId,
  itemId: playerItemsData1.itemId
};

const playerData: Player = {
  id: playerItemsData1.playerId,
  name: "user",
  hp: 10,
  mp: 10,
  money: 200,
};

const itemData1: Item = {
  id: playerItemsData1.itemId,
  name: "hpPotion",
  heal: 100,
  price: 50,
  percent: 30
}

const itemData2: Item = {
  id: playerItemsData1.itemId,
  name: "mpPotion",
  heal: 20,
  price: 100,
  percent: 70
}

jest
.spyOn(playerModel, "selectPlayerDataByIdWithLock")
.mockResolvedValue(playerData);

jest
.spyOn(itemModel,"selectItemDataById")
.mockResolvedValue(itemData1);

const spyUpsertFunc = jest
.spyOn(playerItemsModel, "insertOrIncrementData")
.mockResolvedValue();

describe('player-items-service:addItem', () => {

  jest
  .spyOn(playerItemsModel, "getCount")
  .mockResolvedValue(playerItemsData1.count!);

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
    expect(addItem(playerItemsData1, connection))
    .resolves.toBe(playerItemsData1.count);
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
    hp: playerData.hp! + itemData1.heal! * playerItemsData1.count!,
    mp: playerData.mp
  };

  const retval = {
    'itemId': itemData1.id,
    'count':  playerItemsData1.count! - useItemData.count!,
    'player': {
      'id': useItemData.playerId,
      'hp': playerData.hp! + itemData1.heal! * playerItemsData1.count!,
      'mp': playerData.mp
    }
  }

  jest
  .spyOn(playerItemsModel, "selectPlayerItemsDataById")
  .mockResolvedValue(playerItemsData1)
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

  test ("updatePlayer args", () => {
    useItem(useItemData, connection)
    .then(() => {
      expect(playerModel.updatePlayer)
      .toBeCalledWith(updatingData, connection);
    })
  })

  test ("decrementData args", () => {
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

describe("player-items-service:useGacha", () => {
  const gachaRequestUndefined: Gacha = {};
  const gachaRequestUndefinedCount: Gacha = { playerId: 1 };
  const gachaRequest:Gacha = {
    playerId: 1,
    count: 10
  }

  const gahcaRequestCountOver:Gacha = {
    playerId: 1,
    count: 100
  }

  const updatingData:Player = {
    id: gachaRequest.playerId,
    money: playerData.money! - gachaRequest.count! * 10,
  }

  const upsertPlayerItemsData1: PlayerItems = {
    playerId:1,
    itemId:1,
    count:1
  }
  const upsertPlayerItemsData2: PlayerItems = {
    playerId: 1,
    itemId: 2,
    count: 9
  }

  const retval = {
    'results': [
      {
        'itemId': playerItemsData1.itemId,
        'count': playerItemsData1.count
      },
      {
        'itemId': playerItemsData2.itemId,
        'count':  playerItemsData2.count
      }
    ],
    'player' : {
      'monay' : updatingData.money,
      'items' : [
        {
          'itemId': playerItemsData1.itemId,
          'count': playerItemsData1.count
        },
        {
          'itemId': playerItemsData2.itemId,
          'count': playerItemsData2.count
        }
      ]
    }
  }

  jest
  .spyOn(itemModel, "selectAllItems")
  .mockResolvedValue([ itemData1, itemData2 ]);

  jest
  .spyOn(playerItemsModel, "selectPlayerItemsByPlayerId")
  .mockResolvedValue([ playerItemsData1, playerItemsData2 ]);

  const spyRandFunc = jest
    .spyOn(randomHelper, "getRandomIntByRange");

  beforeEach(() => {
    spyUpsertFunc.mockClear();
    spyRandFunc.mockClear();
    spyRandFunc
    .mockReturnValueOnce(30)
    .mockReturnValue(31);
  })

  let connection: any;
  test("playerId is Undefined", () => {
    expect(useGacha(gachaRequestUndefined, connection))
    .rejects.toThrow(new UndefinedError("gachaRequest.playerId is undefined."));
  })

  test("count is Undefined", () => {
    expect(useGacha(gachaRequestUndefinedCount, connection))
    .rejects.toThrow(new UndefinedError("gachaRequest.count is undefined."));
  })

  test("playerData.money less than all gacha price.", () => {
    expect(useGacha(gahcaRequestCountOver, connection))
    .rejects.toThrow(new NotEnoughError("playerData.money less than all gacha price."));
  })

  test ("updatePlayer args", () => {
    useGacha(gachaRequest, connection)
    .then(() => {
      expect(playerModel.updatePlayer)
      .toBeCalledWith(updatingData, connection);
    })
  })

  test ("getRandomIntByRange called times", () => {
    useGacha(gachaRequest, connection)
    .then(() => {
      expect(randomHelper.getRandomIntByRange)
      .toBeCalledTimes(gachaRequest.count!);
    })
  })

  describe("insertOrIncrementData args", () => {
    test ("1st time", () => {
      useGacha(gachaRequest, connection)
      .then(() => {
        expect(playerItemsModel.insertOrIncrementData)
        .toHaveBeenNthCalledWith(1,upsertPlayerItemsData1, connection);
      })
    })

    test ("2nd time", () => {
      useGacha(gachaRequest, connection)
      .then(() => {
        expect(playerItemsModel.insertOrIncrementData)
        .toHaveBeenNthCalledWith(2,upsertPlayerItemsData2, connection);
      })
    })
  })

  test ("return value", () => {
    expect(useGacha(gachaRequest, connection))
    .resolves.toEqual(retval);
  })
})