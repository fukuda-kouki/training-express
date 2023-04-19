import { Response, Request, NextFunction } from "express";
import { getIdAndName,createPlayer } from "../services/player-service";
import { dbPool, transactionHelper } from "../helpers/db-helper";
import { Player } from "../interfaces/player";

export class PlayerController {
  async getPlayersIdAndName(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const dbConnection = await dbPool.getConnection();
    try {
      const playerIdAndName = await getIdAndName(dbConnection);
      res.status(200).json(playerIdAndName);
    } catch (e) {
      next(e);
    } finally {
      dbConnection.release();
    }
  }

  async createPlayer(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {

    //リクエストのデータが不足していたらエラー
    if (!req.body.name ||
        !req.body.hp ||
        !req.body.mp ||
        !req.body.money
    ) {
      res.status(400).json({ message: "Invalid parameters or body." });
      return;
    }

    //リクエストをPlayerに変換
    const playerData: Player = {
      name: req.body.name,
      hp: req.body.hp,
      mp: req.body.mp,
      money: req.body.money,
    };

    //変換したPlayerをserviceに渡す
    const dbConnection = await dbPool.getConnection();
    try {
      const playerId = await getIdAndName(dbConnection);
      res.status(200).json({ id: playerId! });
    } catch (e) {
      next(e);
    } finally {
      dbConnection.release();
    }
  }

  //エラーハンドリング
  errorResponse(req: Request, res: Response, next: NextFunction) {
    next(new Error("エラー発生"));
  }
}