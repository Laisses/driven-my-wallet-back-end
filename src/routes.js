import bcrypt from "bcrypt";
import { validateUser } from "./validator.js";

export const routes = (app, db) => {
    const users = db.collection("users");

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

};