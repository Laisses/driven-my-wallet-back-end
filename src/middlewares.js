import { validator, transactionSchema } from "./validator.js";


export const collections = db => (req, _res, next) => {
    const users = db.collection("users");
    const sessions = db.collection("sessions");
    const transactions = db.collection("transactions");

    req.collections = {
        users,
        sessions,
        transactions,
    };

    next();
};

export const validateTransactionSchema = (req, res, next) => {
    const transaction = req.body;
    const { error } = validator(transactionSchema, transaction);

    if (error) {
        const errors = error.details.map((detail) => detail.message);
        return res.status(422).send(errors);
    }

    next();
};

export const authenticate = async (req, res, next) => {
    const { authorization } = req.headers;
    const token = authorization?.replace("Bearer ", "");

    if (!token) {
        return res.sendStatus(401);
    }

    const activeSession = await req.collections.sessions.findOne({ token });
    const activeUser = await req.collections.users.findOne({ _id: activeSession?.userId });

    if (!activeUser) {
        return res.sendStatus(401);
    }

    delete activeUser.password;

    req.user = activeUser;

    return next();
};

export const asyncError = handlerFn => async (req, res, next) => {
    try {
        await handlerFn(req, res, next);
    } catch (err) {
        console.warn(err);
        res.status(500).send({
            message: "Internal Server Error"
        });
    }
};