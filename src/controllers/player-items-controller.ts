import { Response, Request, NextFunction } from "express";
import { PlayerItems } from "../interfaces/player-items";
import { dbPool, transactionHelper } from "../helpers/db-helper";
import { addItem, useItem } from "../services/player-items-service";
import { MyError } from "../interfaces/my-error";

export class PlayerItemsController {
  async addItem(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {

    const requestData: PlayerItems = {
      playerId: parseInt(req.params.id),
      itemId: req.body.itemId,
      count: req.body.count
    }

    const dbConnection = await dbPool.getConnection();
    try {
      let itemCount: number = 0;
      await transactionHelper(dbConnection, async () => {
        itemCount = await addItem(requestData, dbConnection);
      });
      res.status(200).json({id: requestData.itemId, count: itemCount});
    } catch (e) {
      if(e instanceof MyError) {
        res.status(400).json({message:`${e.name}:${e.message}`});
      }
      next(e);
    }
  }

  async useItem(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {

    let requestData: PlayerItems = {
      playerId: parseInt(req.params.id),
      itemId: req.body.itemId
    }

    //リクエストに使用数が含まれていなかったら1つ使用する
    if(req.body.count != null) requestData.count = req.body.count;
    else requestData.count = 1;

    const dbConnection = await dbPool.getConnection();
    try {
      let playerDataWithUsingItems: {} = {};
      await transactionHelper(dbConnection, async () => {
        playerDataWithUsingItems = await useItem(requestData, dbConnection);
      });
      res.status(200).json({playerDataWithUsingItems});
    } catch (e) {
      if(e instanceof MyError) {
        res.status(400).json({message:`${e.name}:${e.message}`});
      }
      next(e);
    }
  }
}