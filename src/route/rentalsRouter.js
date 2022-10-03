import express from "express";
import {
  postRentals,
  listRentals,
  closeRentals,
  deleteRentals,
} from "../controller/rentalsController.js";
import { rentalsValidation } from "../middleware/rentalsMiddleware.js";

const rentalRouter = express.Router();

rentalRouter.post("/rentals", rentalsValidation, postRentals);

rentalRouter.get("/rentals", listRentals);

rentalRouter.post("/rentals/:id/return", closeRentals);

rentalRouter.delete("/rentals/:id", deleteRentals);

export default rentalRouter;
