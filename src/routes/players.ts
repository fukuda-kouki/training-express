import * as express from "express";
import { PlayerController } from "../controllers";
export const router = express.Router();

const playerController = new PlayerController();

//    /players

router.get("/", playerController.getPlayersIdAndName);
router.post("/", playerController.createPlayer);