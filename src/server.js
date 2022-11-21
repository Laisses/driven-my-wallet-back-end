import express from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import { routes } from "./routes.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT;
const mongoClient = new MongoClient(process.env.DB_URI);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended:true }));
app.use(morgan("combined"));

const main = async () => {
    await mongoClient.connect();
    const db = mongoClient.db("myWallet");
    routes(app, db);
    app.listen(PORT, () => {
        console.log(`server running on port ${PORT}`);
    });
};

main();