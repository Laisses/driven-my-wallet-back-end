import bcrypt from "bcrypt";
import { ObjectId } from "mongodb";
import { v4 as uuid } from "uuid";
import { validator, userSchema, transactionSchema } from "./validator.js";


export const signUp = async (req, res) => {
    const { username, email, password } = req.body;

    const userExists = await req.collections.users.findOne({ email });

    if (userExists) {
        return res.status(409).send({ message: "this email is already registered" });
    }

    const { error } = validator(userSchema, req.body);

    if (error) {
        const errors = error.details.map(detail => detail.message);
        return res.status(400).send(errors);
    }

    const hashPassword = bcrypt.hashSync(password, 10);

    await req.collections.users.insertOne({
        username,
        email,
        password: hashPassword
    });

    res.sendStatus(201);
};

export const signIn = async (req, res) => {
    const { email, password } = req.body;
    const token = uuid();

    const activeUser = await req.collections.users.findOne({ email });
    const rightPassword = bcrypt.compareSync(password, activeUser?.password || "");

    if (!activeUser || !rightPassword) {
        return res.status(401).send({ message: `invalid username or password` });
    }

    const username = activeUser.username;
    const userSession = await req.collections.sessions.findOne({ userId: activeUser._id });

    if (userSession) {
        return res.status(401).send({ message: `this account is already logged in` });
    }

    await req.collections.sessions.insertOne({
        token,
        userId: activeUser._id
    });

    res.status(200).send({ token, username });
};

export const listTransactions = async (req, res) => {
    const user = req.user;
    const { limit } = req.query;

    const userTransactions = await req.collections.transactions
        .find({ userId: user._id })
        .limit(Number(limit) || 0)
        .toArray();

    res.status(200).send(userTransactions);
};

export const singleTransaction = async (req, res) => {
    const { id } = req.params;

    const transaction = await req.collections.transactions.findOne({
        _id: ObjectId(id)
    });

    if (!transaction) {
        res.sendStatus(404);
    }

    res.status(200).send(transaction);
};

export const newTransaction = async (req, res) => {
    const userId = req.user._id;
    const transaction = req.body;

    await req.collections.transactions.insertOne({
        userId,
        ...transaction
    });

    res.sendStatus(201);
};

export const removeTransaction = async (req, res) => {
    const { id } = req.params;

    const transaction = await req.collections.transactions.findOne({
        _id: ObjectId(id)
    });

    if (!transaction) {
        res.sendStatus(404);
    }

    await req.collections.transactions.deleteOne({ _id: ObjectId(id) });

    res.status(200).send({ message: "Transação apagada com sucesso" });
};

export const updateTransaction = async (req, res) => {
    const { id } = req.params;
    const editedTransaction = req.body;

    const transaction = await req.collections.transactions.findOne({
        _id: ObjectId(id)
    });

    if (!transaction) {
        res.sendStatus(404);
    }

    await req.collections.transactions.updateOne(
        { _id: transaction._id },
        { $set: editedTransaction }
    );

    res.status(200).send({ message: "Transação editada com sucesso" });
};