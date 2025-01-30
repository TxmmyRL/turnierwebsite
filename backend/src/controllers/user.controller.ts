import { RequestHandler } from "express";
import createHttpError from "http-errors";
import UserModel from "../models/user.model";
import TurnierModel from   "../models/turnier.model";
import mongoose, { isValidObjectId } from "mongoose";
import bcrypt from "bcrypt";

export const getAuthenticatedUser: RequestHandler = async (req, res, next) => {
    const authenticatedUserId = req.session.userId;

    try {
        const user = await UserModel.findById(authenticatedUserId).select("+email").exec();
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};


interface SignUpBody {
    username?: string;
    email?: string;
    passwort?: string;
};
export const signUp: RequestHandler<unknown, unknown, SignUpBody, unknown> = async (req, res, next) => {
    const username = req.body.username;
    const email = req.body.email;
    const passwortRaw = req.body.passwort;

    try {
        if (!username || !email || !passwortRaw) {
            throw createHttpError(400, "Bitte alle Felder ausfüllen");
        }

        const existingUsername = await UserModel.findOne({username: username}).exec();
        if (existingUsername) {
            throw createHttpError(409, "Username bereits vergeben");
        }

        const existingEmail = await UserModel.findOne({email: email}).exec();
        if (existingEmail) {
            throw createHttpError(409, "Email bereits vergeben");
        }

        const passwortHashed = await bcrypt.hash(passwortRaw, 10)

        const newUser = await UserModel.create({
            username: username,
            email: email,
            passwort: passwortHashed
        });

        req.session.userId = newUser._id;

        res.status(201).json(newUser);
    } catch (error) {
        next(error);
    }
};


interface LoginBody {
    username?: string;
    passwort?: string;
};
export const login: RequestHandler<unknown, unknown, LoginBody, unknown> = async (req, res, next) => {
    const username = req.body.username;
    const passwort = req.body.passwort;

    try {
        if (!username || !passwort) {
            throw createHttpError(400, "Bitte alle Felder ausfüllen");
        }

        const user = await UserModel.findOne({username: username}).select("+passwort").exec();
        if (!user) {
            throw createHttpError(401, "Username oder Passwort falsch");
        }

        const passwortMatch = await bcrypt.compare(passwort, user.passwort);

        if (!passwortMatch) {
            throw createHttpError(401, "Username oder Passwort falsch");
        }

        req.session.userId = user._id;

        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};


export const logout: RequestHandler = (req, res, next) => {
    req.session.destroy((error) => {
        if (error) {
            next(error);
        } else {
            res.status(200).json({success: true, message: "Logout erfolgreich"});
        }
    })
};

interface SaveTurnierParams {
    turnierId?: string;
};
export const saveTurnier: RequestHandler<SaveTurnierParams, unknown, unknown, unknown> = async (req, res, next) => {
    const authenticatedUserId = req.session.userId;
    const turnierId = req.params.turnierId;

    try {
        if (!turnierId) {
            throw createHttpError(400, "Bitte Turnier-ID angeben");
        }

        if (!isValidObjectId(turnierId)) {
            throw createHttpError(400, "Ungültige Turnier-ID");
        }

        const turnier = await TurnierModel.findById(turnierId).exec();
        if (!turnier) {
            throw createHttpError(404, "Turnier existiert nicht");
        }

        const user = await UserModel.findById(authenticatedUserId).exec();
        if (!user) {
            throw createHttpError(404, "User existiert nicht");
        }

        if (user.savedT.some(t => t._id.equals(turnierId))) {
            throw createHttpError(409, "Turnier bereits gespeichert");
        }

        if (turnier.userIdErsteller.equals(authenticatedUserId)) {
            throw createHttpError(409, "Turnierersteller kann eigenes Turnier nicht nochmal speichern");
        }

        user.savedT.push({_id: turnierId});
        const updatedUser = await user.save();
        res.status(200).json(updatedUser);
    } catch (error) {
        next(error);
    }
};


interface UnsaveTurnierParams {
    turnierId?: string;
};
export const unsaveTurnier: RequestHandler<UnsaveTurnierParams, unknown, unknown, unknown> = async (req, res, next) => {
    const authenticatedUserId = req.session.userId;
    const turnierId = req.params.turnierId;

    try {
        if (!turnierId) {
            throw createHttpError(400, "Bitte Turnier-ID angeben");
        }
        
        const turnier = await TurnierModel.findById(turnierId).exec();
        if (!turnier) {
            throw createHttpError(404, "Turnier existiert nicht oder ungültige Turnier-ID");
        }

        const user = await UserModel.findById(authenticatedUserId).exec();
        if (!user) {
            throw createHttpError(404, "User existiert nicht");
        }

        // Überprüfung, ob turnierId im savedT Array vorhanden ist
        const turnierIdObject = new mongoose.Types.ObjectId(turnierId);
        const index = user.savedT.findIndex(t => t._id.equals(turnierIdObject));
        if (index > -1) {
            user.savedT.splice(index, 1); //Entfernen der turnierId aus dem savedT Array
            await user.save();
        }

        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};