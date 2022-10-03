import { postRentalsSchema } from "../schema/rentalsSchema.js";

function rentalsValidation(req, res, next) {
  const validation = postRentalsSchema.validate(req.body, {
    abortEarly: false,
  });
  if (validation.error) {
    return res.sendStatus(400);
  }
  next();
}

export { rentalsValidation };
