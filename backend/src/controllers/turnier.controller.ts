import mongoose from "mongoose";
import TurnierModel from "../models/turnier.model";
import { RequestHandler } from "express";
import createHttpError from "http-errors";
import UserModel from "../models/user.model";
import { MatchOutput, RundeOutput, BracketOutput } from "../../../frontend/src/models/turnier.model";

interface Match {
    runde: number;
    matchId: number;
    spieler1: string | null;
    spieler2: string | null;
    ergebnis: {spieler1: number, spieler2: number} | null;
    winner: string | null;
};
interface Runde {
    rundenName: string;
    matches: Match[];
};
interface Bracket {
    runden: Runde[];
};
interface Teilnehmer {
    _id: mongoose.Types.ObjectId;
    vorname: string| null | undefined;
    nachname: string | null | undefined;
    verein: string;
    qttr: number;
};

function koTeilnehmerBerechnung(teilnehmer: Teilnehmer[]) {
    const anzahlTeilnehmerÜbergeben = teilnehmer.length;

    const anzahlTeilnehmer = Math.pow(2, Math.ceil(Math.log2(anzahlTeilnehmerÜbergeben))); // Aufrundung auf nächste 2er Potenz

    return anzahlTeilnehmer
}

async function generateKoBracket(turnierId: string): Promise<void> {
    const turnier = await TurnierModel.findById(turnierId).exec();
    
    if (!turnier) {
        throw createHttpError(404, "Turnier nicht gefunden.");
    }

    if (turnier.teilnehmer.length === 0) {
        return;
    }

    const seeds = turnier.teilnehmer.map((teilnehmer, index) => ({
        _id: teilnehmer._id,
        seed: index + 1,
    }));
 
    const bracket: Bracket = { runden: [] }; // Array für die Runden

    // Erste Runde generieren
    const firstRound: Runde = { matches: [], rundenName: ""}; // Array für die Matches der ersten Runde

    for (let i = 0; i < Math.ceil(seeds.length / 2); i++) {
        firstRound.matches.push({
            runde: 1,
            matchId: i + 1,
            spieler1: seeds[i]?._id.toString() || null,
            spieler2: seeds[seeds.length - 1 - i]?._id.toString() || null,
            ergebnis: null,
            winner: "Runde1" + "-Match" + (i + 1) + "-Winner",
        });
    }
    if (firstRound.matches.length === 1) {
        firstRound.rundenName = "Finale";
    } else {
        firstRound.rundenName = "1/" + firstRound.matches.length + "-Finale"
    }
    bracket.runden.push(firstRound);

    // Weitere Runden erstellen
    let previousRound: Runde = firstRound;
    let roundNumber = 2;
    let previousRoundNumber = 1;
    let previousMatchId1;
    let previousMatchId2;

    while (previousRound.matches.length > 1) {
        previousMatchId1 = 1;
        const currentRound: Runde = { matches: [], rundenName: ""};
        for (let i = 0; i < Math.ceil(previousRound.matches.length / 2); i++) {
            previousMatchId2 = previousRound.matches.length - i;
            currentRound.matches.push({
                runde: roundNumber,
                matchId: i + 1,
                spieler1: "Runde" + previousRoundNumber + "-Match" + previousMatchId1 + "-Winner",
                spieler2:  "Runde" + previousRoundNumber + "-Match" + previousMatchId2 + "-Winner",
                ergebnis: null,
                winner: "Runde" + roundNumber + "-Match" + (i + 1) + "-Winner",
            });
            previousMatchId1++;
        }
        
        bracket.runden.push(currentRound);
        previousRound = currentRound;
        roundNumber++;
        previousRoundNumber++;
        if (currentRound.matches.length === 1) {
            currentRound.rundenName = "Finale";
        } else {
            currentRound.rundenName = "1/" + currentRound.matches.length + "-Finale"
        }
    }
    
    if (bracket.runden.length > 0) {
        bracket.runden.forEach((runde) => {
            if (turnier.bracket && turnier.bracket.runden) {
                turnier.bracket.runden.push(runde);
            }
        });
    }
    await turnier.save();
    return;
};


async function setFreeWins(turnierId: string): Promise<void> {
    const turnier = await TurnierModel.findById(turnierId).exec();

    if (!turnier) {
        throw createHttpError(404, "Turnier nicht gefunden.");
    }

    (turnier.bracket as unknown as BracketOutput).runden.forEach((r: RundeOutput) => {
        r.matches.forEach(async (match: MatchOutput) => {
            const spieler1 = turnier.teilnehmer.find(t => t._id.toString() === match.spieler1);
            const spieler2 = turnier.teilnehmer.find(t => t._id.toString() === match.spieler2);
            const runde = match.runde;
            const matchId = match.matchId;

            if (spieler2?.vorname === "Freewin") {
                await setMatchResult(turnier._id.toString(), runde, matchId, { spieler1: 3, spieler2: 0 });
            } else if (spieler1?.vorname === "Freewin") {
                await setMatchResult(turnier._id.toString(), runde, matchId, { spieler1: 0, spieler2: 3 });
            }
        });
    });
};


async function setMatchResult(turnierId: string, runde: number, matchId: number, ergebnis: { spieler1: number; spieler2: number }): Promise<boolean> {
    const turnier = await TurnierModel.findById(turnierId);

    if (!turnier) {
        throw createHttpError(404, "Turnier nicht gefunden.");
    }
    
    const round = turnier.bracket?.runden[runde - 1] as Runde;
    const match = round.matches[matchId - 1] as Match;

    if (!match) {
        throw createHttpError(404, "Match mit ID: " + matchId + " in Runde: " + runde + " nicht gefunden.");
    }

    let matchString = match.winner;

    // Ergebnis setzen und Gewinner bestimmen
    match.ergebnis = ergebnis;
    match.winner = ergebnis.spieler1 > ergebnis.spieler2 ? match.spieler1 : match.spieler2;

    let platzhalterString = "Runde" + runde + "-Match" + matchId + "-Winner";

    if (turnier.bracket && turnier.bracket.runden && runde < turnier.bracket.runden.length) {

        // Wenn in einer vorherigen Runde ein Ergebnis geändert wird und somit ein anderer Spieler gewonnen hat, müssen die danach gespielten Matches wieder zurückgesetzt werden
        if (matchString !== "Runde" + runde + "-Match" + matchId + "-Winner") {
            for (let i = runde; i < turnier.bracket.runden.length; i++) {
                turnier.bracket.runden[i].matches.forEach((m) => {
                    if (m.spieler1 === matchString || m.spieler2 === matchString) {
                        if (m.spieler1 === matchString) {
                            m.spieler1 = platzhalterString;
                        } else {
                            m.spieler2 = platzhalterString;
                        }
                        matchString = m.winner ?? null;
                        m.ergebnis = null;
                        m.winner = "Runde" + m.runde + "-Match" + m.matchId + "-Winner";
                        platzhalterString = "Runde" + m.runde + "-Match" + m.matchId + "-Winner";
                    }
                });
            }
        }

        // Weitersetzung des Gewinners
        matchString = "Runde" + runde + "-Match" + matchId + "-Winner"
        const nextRound = turnier.bracket.runden[runde] as Runde;
        const nextMatch = nextRound.matches.find((m: Match) => m.spieler1 === matchString || m.spieler2 === matchString);

        if (!nextMatch) {
            throw createHttpError(404, "Nächstes Match nicht gefunden.");
        }

        if (nextMatch.spieler1 === matchString) {
            nextMatch.spieler1 = match.winner;
        } else {
            nextMatch.spieler2 = match.winner;
        }
    }
    await turnier.save();
    return true;
};


export const getAllTurniere: RequestHandler = async (req, res, next) => {
    const authenticatedUserId = req.session.userId;

    try {
        const user = await UserModel.findById(authenticatedUserId).populate("savedT").exec();
        const createdTurniere = await TurnierModel.find({ userIdErsteller: authenticatedUserId }).exec();

        if (!user) {
            throw createHttpError(404, "User existiert nicht");
        }
        
        const savedTurniere = await TurnierModel.find({ _id: { $in: user.savedT } }).exec();

        const allTurniere = [...createdTurniere, ...savedTurniere];

        res.status(200).json(allTurniere);
    } catch (error) {
        next(error);
    }
};


export const getTurnier: RequestHandler = async (req, res, next) => {
    const turnierId = req.params.turnierId;
    
    try {
        if (!mongoose.isValidObjectId(turnierId)) {
            throw createHttpError(400, "Ungültige Turnier-ID");
        }

        const turnier = await TurnierModel.findById(turnierId).exec();

        if (!turnier) {
            throw createHttpError(404, "Turnier existiert nicht");
        }
        
        res.status(200).json(turnier);
    } catch (error) {
        next(error);
    }
    
};


interface CreateTurnierBody {
    name: string;
    datum: string;
    format: string;
    anzahlTeilnehmer: number;
    teilnehmer?: Teilnehmer[];
};
export const createTurnier: RequestHandler<unknown, unknown, CreateTurnierBody, unknown> = async (req, res, next) => {
    const name = req.body.name;
    const datum = req.body.datum;
    const format = req.body.format;
    let anzahlTeilnehmer = 0;
    const teilnehmer = req.body.teilnehmer || [];
    const authenticatedUserId = req.session.userId;

    try {
        if (!name || !datum || !format || !authenticatedUserId) {
            throw createHttpError(400, "Bitte alle Felder ausfüllen");
        }

        if (teilnehmer.length > 0) {
            teilnehmer.forEach((t: Teilnehmer) => {
                if (!t.vorname || !t.nachname || !t.verein || !t.qttr) {
                    throw createHttpError(400, "Bitte alle Felder der Teilnehmer ausfüllen");
                }
            });
        };

        if (format === "ko" && teilnehmer.length > 2) {
            anzahlTeilnehmer = koTeilnehmerBerechnung(teilnehmer);
        } else if (format === "ko" && teilnehmer.length > 0) {
            anzahlTeilnehmer = 2;
        };

        const newTurnier = await TurnierModel.create({
            name: name,
            datum: datum,
            format: format,
            anzahlTeilnehmer: anzahlTeilnehmer,
            teilnehmer: [],
            bracket: { runden: new mongoose.Types.DocumentArray([]) },
            userIdErsteller: authenticatedUserId
            
        });

        //Sortierung der teilnehmer, dass die seeds nach qttr wert sortiert werden
        if (teilnehmer.length > 0) {
            teilnehmer.sort((a, b) => b.qttr - a.qttr);

            //Teilnehmer mit Freewin Teilnehmern auffüllen
            while (teilnehmer.length < anzahlTeilnehmer) {
                teilnehmer.push({
                    _id: new mongoose.Types.ObjectId(),
                    vorname: "Freewin",
                    nachname: "",
                    verein: "",
                    qttr: 0,
                });
            }
            newTurnier.teilnehmer = new mongoose.Types.DocumentArray(teilnehmer);
            await newTurnier.save();
            const turnierId = newTurnier._id.toString();

            await generateKoBracket(turnierId);
            await setFreeWins(turnierId);
            await newTurnier.save();
        }

        res.status(201).json(newTurnier);
    } catch (error) {
        next(error);
    }
};

interface UpdateTurnierParams {
    turnierId: string;
};

interface UpdateTurnierBody {
    name?: string;
    datum?: string;
    format?: string;
    anzahlTeilnehmer?: number;
    teilnehmer?: Teilnehmer[];
};
export const updateTurnier: RequestHandler<UpdateTurnierParams, unknown, UpdateTurnierBody, unknown> = async (req, res, next) => { //bislang geht noch nicht das er erkennt wenn teilnehmer und ergebnisse nicht vollständig eingetragen werden
    const turnierId = req.params.turnierId;
    const newName = req.body.name;
    const newDatum = req.body.datum;
    const newFormat = req.body.format;
    let newAnzahlTeilnehmer = 0;
    const newTeilnehmer = req.body.teilnehmer as Teilnehmer[];
    const authenticatedUserId = req.session.userId;

    try {
        if (!mongoose.isValidObjectId(turnierId)) {
            throw createHttpError(400, "Ungültige Turnier-ID");
        }

        if (!newName || !newDatum || !newFormat || !authenticatedUserId) {
            throw createHttpError(400, "Bitte alle Felder ausfüllen");
        }

        if (newTeilnehmer.length > 0) {
            newTeilnehmer.forEach((t: Teilnehmer) => {
                if (!t.vorname || !t.nachname || !t.verein || !t.qttr) {
                    throw createHttpError(400, "Bitte alle Felder der Teilnehmer ausfüllen");
                }
            });
        };

        if (newFormat === "ko" && newTeilnehmer.length > 2) {
            newAnzahlTeilnehmer = koTeilnehmerBerechnung(newTeilnehmer);
        } else if (newFormat === "ko" && newTeilnehmer.length > 0) {
            newAnzahlTeilnehmer = 2;
        }

        if (newTeilnehmer.length > 0) {
            newTeilnehmer.sort((a, b) => b.qttr - a.qttr);
        }

        while (newTeilnehmer.length < newAnzahlTeilnehmer) {
            newTeilnehmer.push({
                _id: new mongoose.Types.ObjectId(),
                vorname: "Freewin",
                nachname: "",
                verein: "",
                qttr: 0,
            });
        }

        const turnier = await TurnierModel.findById(turnierId).exec();

        if (!turnier) {
            throw createHttpError(404, "Turnier existiert nicht");
        }

        if (!turnier.userIdErsteller.equals(authenticatedUserId)) {
            throw createHttpError(403, "Nicht berechtigt dieses Turnier zu bearbeiten");
        }
        
        turnier.name = newName;
        turnier.datum = newDatum;
        turnier.format = newFormat;
        turnier.anzahlTeilnehmer = newAnzahlTeilnehmer;
        turnier.teilnehmer = new mongoose.Types.DocumentArray(newTeilnehmer);// Überschreibt alle Teilnehmer, heißt man muss immer alle mit übergeben beim abspeichern sonst weg -> abgesichert durch Speicherung der daten in ein Array vor Modifizierung
        turnier.bracket = { runden: new mongoose.Types.DocumentArray([]) };
        turnier.userIdErsteller = authenticatedUserId;
        
        await turnier.save()

        await generateKoBracket(turnierId);
        await setFreeWins(turnierId);
        
        const updatedTurnier = await TurnierModel.findById(turnierId).exec();
        
        res.status(200).json(updatedTurnier);
    } catch (error) {
        next(error);
    }
};

interface UpdateTurnierNameDatum {
    name: string;
    datum: string;
};
export const updateTurnierNameDatum: RequestHandler<UpdateTurnierParams, unknown, UpdateTurnierNameDatum, unknown> = async (req, res, next) => {
    const turnierId = req.params.turnierId;
    const newName = req.body.name;
    const newDatum = req.body.datum;
    const authenticatedUserId = req.session.userId;

    try {
        if (!mongoose.isValidObjectId(turnierId)) {
            throw createHttpError(400, "Ungültige Turnier-ID");
        }

        if (!newName || !newDatum) {
            throw createHttpError(400, "Bitte alle Felder ausfüllen");
        }
        
        const turnier = await TurnierModel.findById(turnierId).exec();
        
        if (!turnier) {
            throw createHttpError(404, "Turnier existiert nicht");
        }

        if (!turnier.userIdErsteller.equals(authenticatedUserId)) {
            throw createHttpError(403, "Nicht berechtigt dieses Turnier zu bearbeiten");
        }

        turnier.name = newName;
        turnier.datum = newDatum;

        await turnier.save();

        res.status(200).json(turnier);
    } catch (error) {
        next(error);
    }
}


interface UpdateErgebnisParams {
    turnierId: string;
};
interface UpdateErgebnisBody {
    runde: number;
    matchId: number;
    ergebnis: { spieler1: number; spieler2: number };
};
export const updateErgebnis: RequestHandler<UpdateErgebnisParams, unknown, UpdateErgebnisBody, unknown> = async (req, res, next) => {
    const turnierId = req.params.turnierId;
    const runde = req.body.runde;
    const matchId = req.body.matchId;
    const ergebnis = req.body.ergebnis;

    try {
        if (!turnierId || !runde || !matchId || !ergebnis) {
            throw createHttpError(400, "Bitte alle Felder ausfüllen");
        }

        if (!mongoose.isValidObjectId(turnierId)) {
            throw createHttpError(400, "Ungültige Turnier-ID");
        }

        const turnier = await TurnierModel.findById(turnierId).exec();

        if (!turnier) {
            throw createHttpError(404, "Turnier existiert nicht");
        }

        const success = await setMatchResult(turnierId, runde, matchId, ergebnis);

        res.status(200).json(success);
    } catch (error) {
        next(error);
    }
};


export const getSpielplan: RequestHandler = async (req, res, next) => {
    const turnierId = req.params.turnierId;

    try {
        if (!mongoose.isValidObjectId(turnierId)) {
            throw createHttpError(400, "Ungültige Turnier-ID");
        }

        const turnier = await TurnierModel.findById(turnierId).exec();

        if (!turnier) {
            throw createHttpError(404, "Turnier existiert nicht");
        }

        res.status(200).json(turnier.bracket);
    } catch (error) {
        next(error);
    }
};


export const deleteTurnier: RequestHandler = async (req, res, next) => {
    const turnierId = req.params.turnierId;
    const authenticatedUserId = req.session.userId;

    try {
        if (!turnierId) {
            throw createHttpError(400, "Bitte Turnier-ID angeben");
        }

        if (!mongoose.isValidObjectId(turnierId)) {
            throw createHttpError(400, "Ungültige Turnier-ID");
        }

        const turnier = await TurnierModel.findById(turnierId).exec();

        if (!turnier) {
            throw createHttpError(404, "Turnier existiert nicht");
        }

        if (!turnier.userIdErsteller.equals(authenticatedUserId)) {
            throw createHttpError(403, "Nicht berechtigt dieses Turnier zu löschen");
        }

        // Löschen des Turniers aus dem savedT Array aller User
        const turnierIdObject = new mongoose.Types.ObjectId(turnierId);
        await UserModel.updateMany(
            { "savedT._id": turnierIdObject },
            { $pull: { savedT: { _id: turnierIdObject } } }
        ).exec();

        //Löschen des Turniers
        await TurnierModel.findByIdAndDelete(turnierId);

        res.status(204).json("Turnier wurde erfolgreich gelöscht");
    } catch (error) {
        next(error);
    }
};