import { Response, Request, NextFunction } from "express";
import { PlayerItems } from "../interfaces/player-items";
import { dbPool } from "../helpers/db-helper";
import { addItem } from "../services/player-items-service";

export class PlayerItemsController {
  async addItem(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {

    const requestData: PlayerItems = {
      player_id: parseInt(req.params.id),
      item_id: req.body.itenmId,
      count: req.body.count
    }

    const dbConnection = await dbPool.getConnection();
    try {
      const itemCount = await addItem(requestData, dbConnection);
      res.status(200).json({id: requestData.item_id, count: itemCount});
    } catch (e) {
      next(e);
    } finally {
      dbConnection.release();
    }
  }
}