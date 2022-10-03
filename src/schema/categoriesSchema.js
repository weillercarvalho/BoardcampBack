import joi from 'joi';

const postCategoriesSchema = joi.object({
    name: joi.string().empty(" ").min(1).max(50).required(),
  });

export {postCategoriesSchema};