import { postCustomersSchema } from "../schema/customersSchema.js";
import { putCustomersSchema } from "../schema/customersPutSchema.js";

function customersValidation(req, res, next) {
  const { name, phone, cpf, birthday } = req.body;
  const cpfNumber = parseInt(cpf, 10);
  const phoneNumber = parseInt(phone, 10);
  if (isNaN(cpfNumber) === true) {
    return res.sendStatus(400);
  } else if (isNaN(phoneNumber) === true) {
    return res.sendStatus(400);
  }
  const validation = postCustomersSchema.validate(req.body, {
    abortEarly: false,
  });
  if (validation.error) {
    return res.sendStatus(400);
  }
  next();
}

function customerUpdateValidation(req, res, next) {
  const { name, phone, cpf, birthday } = req.body;
  const cpfNumber = parseInt(cpf, 10);
  const phoneNumber = parseInt(phone, 10);
  if (isNaN(cpfNumber) === true) {
    return res.sendStatus(400);
  } else if (isNaN(phoneNumber) === true) {
    return res.sendStatus(400);
  }
  const validation = putCustomersSchema.validate(req.body, {
    abortEarly: false,
  });
  if (validation.error) {
    return res.sendStatus(400);
  }
  next();
}

export { customersValidation, customerUpdateValidation };
