import bcrypt from "bcrypt";
import { ObjectId } from "mongodb";
import { v4 as uuid } from "uuid";
import { validator, userSchema, transactionSchema } from "./validator.js";

export const routes = (app, db) => {
    const users = db.collection("users");
    const sessions = db.collection("sessions");
    const transactions = db.collection("transactions");

    const validateTransactionSchemaMiddleware = (req, res, next) => {
        const transaction = req.body;
        const { error } = validator(transactionSchema, transaction);

        if (error) {
            const errors = error.details.map((detail) => detail.message);
            return res.status(422).send(errors);
        }

        next();
    };

    app.post("/sign-up", async (req, res) => {
        const { username, email, password } = req.body;

        const userExists = await users.findOne({ email });

        if (userExists) {
            return res.status(409).send({ message: "this email is already registered" });
        }

        const { error } = validator(userSchema, req.body);

        if (error) {
            const errors = error.details.map(detail => detail.message);
            return res.status(400).send(errors);
        }

        const hashPassword = bcrypt.hashSync(password, 10);

        await users.insertOne({
            username,
            email,
            password: hashPassword
        });

        res.sendStatus(201);
    });

    app.post("/sign-in", async (req, res) => {
        const { email, password } = req.body;
        const token = uuid();

        const activeUser = await users.findOne({ email });
        const rightPassword = bcrypt.compareSync(password, activeUser?.password || "");

        if (!activeUser || !rightPassword) {
            return res.status(401).send({ message: `invalid username or password` });
        }

        const username = activeUser.username;
        const userSession = await sessions.findOne({ userId: activeUser._id });

        if (userSession) {
            return res.status(401).send({ message: `this account is already logged in` });
        }

        await sessions.insertOne({
            token,
            userId: activeUser._id
        });

        res.status(200).send({ token, username });
    });

    const authMiddleware = async (req, res, next) => {
        const { authorization } = req.headers;
        const token = authorization?.replace("Bearer ", "");

        if (!token) {
            return res.sendStatus(401);
        }

        const activeSession = await sessions.findOne({ token });
        const activeUser = await users.findOne({ _id: activeSession?.userId });

        if (!activeUser) {
            return res.sendStatus(401);
        }

        delete activeUser.password;

        req.user = activeUser;

        return next();
    };

    app.use(authMiddleware);

    app.get("/transactions", async (req, res) => {
        const user = req.user;
        const { limit } = req.query;

        const userTransactions = await transactions
            .find({ userId: user._id })
            .limit(Number(limit) || 0)
            .toArray();

        res.status(200).send(userTransactions);
    });

    app.get("/transactions/:id", async (req, res) => {
        const { id } = req.params;

        const transaction = await transactions.findOne({
            _id: ObjectId(id)
        });

        if (!transaction) {
            res.sendStatus(404);
        }

        res.status(200).send(transaction);
    });

    app.post("/transactions", validateTransactionSchemaMiddleware, async (req, res) => {
        const userId = req.user._id;
        const transaction = req.body;

        await transactions.insertOne({
            userId,
            ...transaction
        });

        res.sendStatus(201);
    });

    app.delete("/transactions/:id", async (req, res) => {
        const { id } = req.params;

        const transaction = await transactions.findOne({
            _id: ObjectId(id)
        });

        if (!transaction) {
            res.sendStatus(404);
        }

        await transactions.deleteOne({ _id: ObjectId(id) });

        res.status(200).send({ message: "Transação apagada com sucesso" });
    });

    app.put("/transactions/:id", validateTransactionSchemaMiddleware, async (req, res) => {
        const { id } = req.params;
        const editedTransaction = req.body;

        const transaction = await transactions.findOne({
            _id: ObjectId(id)
        });

        if (!transaction) {
            res.sendStatus(404);
        }

        await transactions.updateOne(
            { _id: transaction._id },
            { $set: editedTransaction }
        );

        res.status(200).send({ message: "Transação editada com sucesso" });
    });

    const errorMiddleware = (err, _req, res, _next) => {
        console.log(err);
        res.sendStatus(500);
    };

    app.use(errorMiddleware);

};
