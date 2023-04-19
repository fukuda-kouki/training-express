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
      await dbConnection.beginTransaction();
      const playerIdAndName = await getIdAndName(dbConnection);

      await dbConnection.commit();
      res.status(200);
      res.json(playerIdAndName);
    } catch (e) {
      await dbConnection.rollback();
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
      let playerId: number;
      await transactionHelper(dbConnection, async () => {
        playerId = await createPlayer(playerData, dbConnection);
      });
      res.status(200).json({ id: playerId! });
    } catch (e) {
      next(e);
    }
  }

  //エラーハンドリング
  errorResponse(req: Request, res: Response, next: NextFunction) {
    next(new Error("エラー発生"));
  }
}
