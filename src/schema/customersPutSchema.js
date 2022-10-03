import joi from 'joi';

const putCustomersSchema = joi.object({
    name: joi.string().empty(" ").min(1).max(50).required(),
    phone: joi.string().min(10).max(11).required(),
    cpf: joi.string().length(11).pattern(/^[0-9]+$/).required(),
    birthday: joi.date().iso()
  })

export {putCustomersSchema}