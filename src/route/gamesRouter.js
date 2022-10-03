import express from "express";
import { listGames, postGames } from "../controller/gamesController.js";
import { gamesValidation } from "../middleware/gamesMiddleware.js";

const gamesRouter = express.Router();

gamesRouter.post("/games", gamesValidation, postGames);

gamesRouter.get("/games", listGames);

export default gamesRouter;
