import Joi from "joi";

export const validator = (schema, payload) =>
    schema.validate(payload, { abortEarly: false });

export const newUser = Joi.object({
    username: Joi.string().min(1).required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    repeat_password: Joi.ref("password"),
});

export const user = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

export const transaction = Joi.object({
    title: Joi.string().min(3).required(),
    amount: Joi.string().required(),
    date: Joi.string().required(),
    description: Joi.any(),
    type: Joi.valid("inflow", "outflow").required()
});
