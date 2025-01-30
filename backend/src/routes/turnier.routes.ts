import express from "express";
import { getTurnier, createTurnier, updateTurnier, deleteTurnier, updateErgebnis, getSpielplan, getAllTurniere, updateTurnierNameDatum } from "../controllers/turnier.controller";

const router = express.Router();

router.get("/", getAllTurniere);

router.get("/:turnierId", getTurnier);

router.post("/", createTurnier);

router.put("/:turnierId", updateTurnier);

router.put("/:turnierId/name-datum", updateTurnierNameDatum);

router.put("/:turnierId/ergebnis", updateErgebnis);

router.get("/:turnierId/turnierbaum", getSpielplan);

router.delete("/:turnierId", deleteTurnier);

export default router;