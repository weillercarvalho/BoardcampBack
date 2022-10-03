import express from "express";
import {
  listCategories,
  postCategories,
} from "../controller/categoriesController.js";
import { categoriesValidation } from "../middleware/categoriesMiddleware.js";

const categoriesRouter = express.Router();

categoriesRouter.post("/categories", categoriesValidation, postCategories);

categoriesRouter.get("/categories", listCategories);

export default categoriesRouter;
