import { RequestHandler } from "express";
import createHttpError from "http-errors";

// Überprüfung ob User eingeloggt ist
export const requiresAuth: RequestHandler = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        next(createHttpError(401, "User nicht authentifiziert"));
    }
};