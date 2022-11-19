import Joi from "joi";

export const validator = (schema, payload) =>
    schema.validate(payload, { abortEarly: false });

export const userSchema = Joi.object({
    username: Joi.string().min(1).required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    repeat_password: Joi.ref("password")
});

export const transactionSchema = Joi.object({
    title: Joi.string().min(3).required(),
    amount: Joi.string().required(),
    date: Joi.string().required(),
    description: Joi.any(),
    type: Joi.valid("inflow", "outflow").required()
});
