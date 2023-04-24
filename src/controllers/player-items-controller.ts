import { Response, Request, NextFunction } from "express";
import { PlayerItems } from "../interfaces/player-items";
import { dbPool, transactionHelper } from "../helpers/db-helper";
import { addItem } from "../services/player-items-service";
import { NotFoundError } from "../interfaces/my-error";

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
      // トランザクション例2
      await transactionHelper(dbConnection, async () => {
        itemCount = await addItem(requestData, dbConnection);
      });
      res.status(200).json({id: requestData.itemId, count: itemCount});
    } catch (e) {
      if(e instanceof  NotFoundError) {
        res.status(400).json({message:`${e.name}:${e.message}`});
      }
      next(e);
    }
  }
}