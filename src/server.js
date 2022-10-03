import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import categoriesRouter from "./route/categoriesRouter.js";
import gamesRouter from "./route/gamesRouter.js";
import customersRouter from "./route/customersRouter.js";
import rentalRouter from "./route/rentalsRouter.js";

dotenv.config();

const server = express();
server.use(cors());
server.use(express.json());

server.use(categoriesRouter);
server.use(gamesRouter);
server.use(customersRouter);
server.use(rentalRouter);

server.listen(4000, () => {
  console.log(`Listening on the 4000.`);
});
