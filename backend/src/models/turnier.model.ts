import mongoose, { InferSchemaType, model } from "mongoose";

const matchSchema = new mongoose.Schema({
    runde: { type: Number, required: true },
    matchId: { type: Number, required: true },
    spieler1: { type: String, required: false }, 
    spieler2: { type: String, required: false }, 
    ergebnis: {
        type: { spieler1: Number, spieler2: Number },
        required: false,
    },
    winner: { type: String, required: false }
});

const rundeSchema = new mongoose.Schema({
    rundenName: String,
    matches: {
        type: [matchSchema],
        default: [],
    } 
});

const bracketSchema = new mongoose.Schema({
    runden: {
        type: [rundeSchema],
        default: [],
    } 
});

const turnierSchema = new mongoose.Schema({
    name: { type: String, required: true },
    datum: { type: String, required: true },
    format: { type: String, required: true },
    anzahlTeilnehmer: { type: Number, required: true },
    teilnehmer: {
        type: [
            {
                vorname: {type: String, required: true},
                nachname: {type: String, required: false},
                verein: {type: String, required: false},
                qttr: {type: Number, required: false},
            }
        ],
        default: [],
    },
    bracket: bracketSchema,
    userIdErsteller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
});

type TurnierModel = InferSchemaType<typeof turnierSchema>;

export default model<TurnierModel>("Turnier", turnierSchema);