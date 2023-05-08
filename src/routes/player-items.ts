import * as express from "express";
import { PlayerItemsController } from "../controllers/player-items-controller";
export const router = express.Router();

const playerItemsController = new PlayerItemsController();

// /players
router.get ("/:id/getWithItemData",  playerItemsController.getPlayerItemDataWithItemDataByPlayerId);
router.post("/:id/addItem",  playerItemsController.addItem);
router.post("/:id/useItem",  playerItemsController.useItem);
router.post("/:id/useGacha", playerItemsController.useGacha);
