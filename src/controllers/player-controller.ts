import { Response, Request, NextFunction } from "express";
import { getIdAndName, getDataById, createPlayer, updatePlayer, destroyPlayer  } from "../services/player-service";
import { dbPool } from "../helpers/db-helper";
import { Player, PlayerKey, PlayerKeyString } from "../interfaces/player";
import { NotFoundError } from "../interfaces/my-error";

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

  async getPlayerDataById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const requestId = parseInt(req.params.id);
    const dbConnection = await dbPool.getConnection();
    try {
      const playerData = await getDataById(requestId,dbConnection);
      res.status(200).json(playerData);
    } catch (e) {
      if(e instanceof  NotFoundError) {
        res.status(400).json({message:`${e.name}:${e.message}`});
      }
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
      const requestId = await createPlayer(playerData, dbConnection);
      res.status(200).json({ id: requestId! });
    } catch (e) {
      next(e);
    } finally {
      dbConnection.release();
    }
  }

  async updatePlayer(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {

    //リクエストをPlayerに変換
    let requestData: Player = {};
    (Object.keys(req.body) as PlayerKey[]).forEach((key) => {
      if(!PlayerKeyString.includes(key)) return;
      requestData[key] = req.body[key];
    });
    requestData.id = parseInt(req.params.id);

    //変換したPlayerをserviceに渡す
    const dbConnection = await dbPool.getConnection();
    try {
      await updatePlayer(requestData, dbConnection);
      res.status(200).json({message:"completed"});
    } catch (e) {
      if(e instanceof  NotFoundError) {
        res.status(400).json({message:`${e.name}:${e.message}`});
      }
      next(e);
    } finally {
      dbConnection.release();
    }
  }

  async destroyPlayer(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const requestId = parseInt(req.params.id);
    const dbConnection = await dbPool.getConnection();
    try {
      await destroyPlayer(requestId, dbConnection);
      res.status(200).json({message:"completed"});
    } catch (e) {
      if(e instanceof  NotFoundError) {
        res.status(400).json({message:`${e.name}:${e.message}`});
      }
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
