import express from "express";
import {
  postCustomers,
  listCustomers,
  updateCustomers,
} from "../controller/customersController.js";
import {
  customersValidation,
  customerUpdateValidation,
} from "../middleware/customersMiddleware.js";

const customersRouter = express.Router();

customersRouter.post("/customers", customersValidation, postCustomers);

customersRouter.get("/customers", listCustomers);

customersRouter.put(
  "/customers/:id",
  customerUpdateValidation,
  updateCustomers
);

export default customersRouter;
