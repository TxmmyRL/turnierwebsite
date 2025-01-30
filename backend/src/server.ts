import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { connectDB } from "./db/connectDB";
import turnierRoutes from "./routes/turnier.routes";
import userRoutes from "./routes/user.routes";
import morgan from "morgan";
import createHttpError, { isHttpError }from "http-errors";
import session from "express-session";
import MongoStore from "connect-mongo";
import { requiresAuth } from "./middleware/auth";

dotenv.config();
const app = express();

app.use(morgan("dev"));

app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI
    })
}));

app.use("/api/users", userRoutes);
app.use("/api/turniere", requiresAuth, turnierRoutes);

//Errorhandler
app.use((req, res, next) => {
    next(createHttpError(404, "Diese Seite existiert nicht"));
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
    console.error(error);
    let message = "Serverfehler";
    let statusCode = 500;
    if (isHttpError(error)) {
        message = error.message;
        statusCode = error.statusCode;
    }
    res.status(statusCode).json({success: false, message: message});
});

app.listen(process.env.PORT, async () => {
    connectDB();
    console.log("Server läuft auf https://localhost:" + process.env.PORT);
});