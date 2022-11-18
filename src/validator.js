import Joi from "joi";

const validator = schema => payload =>
    schema.validate(payload, { abortEarly: false });

const userSchema = Joi.object({
    username: Joi.string().min(1).required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    repeat_password: Joi.ref("password")
});

const transactionSchema = Joi.object({
    title: Joi.string().min(3).required(),
    amount: Joi.number().required(),
    date: Joi.string().required(),
    description: Joi.string().valid(""),
    type: Joi.valid("inflow", "outflow").required()
});

export const validateUser = validator(userSchema);
export const validateTransaction = validator(transactionSchema);
