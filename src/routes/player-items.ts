import * as express from "express";
import { PlayerItemsController } from "../controllers/player-items-controller";
export const router = express.Router();

const playerItemsController = new PlayerItemsController();

// /players/:id
router.post("/:id/addItem", playerItemsController.addItem);
router.post("/:id/useItem", playerItemsController.useItem);
