import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import { validateUser } from "./validator.js";

export const routes = (app, db) => {
    const users = db.collection("users");
    const sessions = db.collection("sessions");

    app.post("/sign-up", async (req, res) => {
        const { username, email, password } = req.body;

        const userExists = await users.findOne({ email });

        if (userExists) {
            return res.status(409).send({ message: "this email is already registered" });
        }

        const { error } = validateUser(req.body);

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
        const {email, password} = req.body;
        const token = uuid();

        const activeUser = await users.findOne({ email });

        if (!activeUser) {
            return res.status(401).send({ message: `invalid username or password` });
        }

        const rightPassword = bcrypt.compareSync(password, activeUser.password);

        if (!rightPassword) {
            return res.status(401).send({ message: `invalid username or password` });
        }

        const userSession = await sessions.findOne({ userId: activeUser._id });

        if (userSession) {
            return res.status(401).send({ message: `this account is already logged in` });
        }

        await sessions.insertOne({
            token,
            userId: activeUser._id
        });

        res.status(200).send({ token });
    });
};
