import joi from 'joi';

const postGamesSchema = joi.object({
    name: joi.string().empty(" ").min(1).max(50).required(),
    image: joi.string().uri().required(),
    stockTotal: joi.number().greater(0).required(),
    categoryId: joi.number().required(),
    pricePerDay: joi.number().greater(0).required(),
  });

export {postGamesSchema}