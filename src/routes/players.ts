import * as express from "express";
import { PlayerController } from "../controllers";
export const router = express.Router();

const playerController = new PlayerController();

//    /players

router.get("/"   , playerController.getPlayersIdAndName);
router.get("/:id", playerController.getPlayerDataById);

router.post("/"  , playerController.createPlayer);

router.put("/:id", playerController.updatePlayer);
