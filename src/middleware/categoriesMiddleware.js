import { postCategoriesSchema } from "../schema/categoriesSchema.js";

function categoriesValidation(req, res, next) {
  const validation = postCategoriesSchema.validate(req.body, {
    abortEarly: false,
  });
  if (validation.error) {
    return res.status(400);
  }
  next();
}

export { categoriesValidation };
