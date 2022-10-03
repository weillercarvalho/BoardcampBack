import { postGamesSchema } from "../schema/gamesSchema.js";

function gamesValidation(req, res, next) {
  const validation = postGamesSchema.validate(req.body, { abortEarly: false });
  if (validation.error) {
    return res.sendStatus(400);
  }
  next();
}

export { gamesValidation };
