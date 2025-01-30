import express from "express";
import { getAuthenticatedUser, login, signUp, logout, saveTurnier, unsaveTurnier } from "../controllers/user.controller";
import { requiresAuth } from "../middleware/auth";

const router = express.Router();

router.get("/", requiresAuth, getAuthenticatedUser);

router.post("/signup", signUp);

router.post("/login", login);

router.post("/logout", logout);
 
router.put("/saveturnier/:turnierId", requiresAuth, saveTurnier);

router.put("/unsaveturnier/:turnierId", requiresAuth, unsaveTurnier);

export default router;