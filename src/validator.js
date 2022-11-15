import Joi from "joi";

const validator = schema => payload =>
    schema.validate(payload, { abortEarly: false });

const userSchema = Joi.object({
    username: Joi.string().min(1).required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    repeat_password: Joi.ref("password")
});

export const validateUser = validator(userSchema);

//Joi.valid("message", "private_message")