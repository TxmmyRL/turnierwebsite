//import { ConflictError, UnauthorizedError } from "../errors/http_errors";
import { TurnierOutput } from "../models/turnier.model";

async function fetchData(input: RequestInfo, init?: RequestInit) {
    const response = await fetch(input, init);

    if (response.ok) {
        return response
    } else {
        const errorBody = await response.json();
        const errorMessage = errorBody.message;
        throw Error(errorMessage);
    }
};


export async function getTurniere(): Promise<TurnierOutput[]> {
    const response = await fetchData("/api/turniere", { method: "GET" });
    return response.json();
};


export async function getTurnier(turnierId: string): Promise<TurnierOutput> {
    const response = await fetchData("/api/turniere/" + turnierId, { method: "GET" });
    return response.json();
}

export interface TeilnehmerInput {
    vorname: string;
    nachname: string;
    verein: string;
    qttr: number;
};

export interface TurnierInput {
    name: string;
    datum: string;
    format: "ko" | "liga" | "swiss";
    teilnehmer: TeilnehmerInput[];
};
export async function createTurnier(turnier: TurnierInput): Promise<TurnierOutput> {
    const response = await fetchData("/api/turniere", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(turnier)
    });

    return response.json();
};


export async function updateTurnier(turnierId: string, turnier: TurnierInput): Promise<TurnierOutput> {
    console.log(turnier);
    const response = await fetchData("/api/turniere/" + turnierId, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(turnier)
    });

    return response.json();
};

export interface NameDatumInput {
    name: string;
    datum: string;
};
export async function updateTurnierNameDatum(turnierId: string, nameDatum: NameDatumInput): Promise<TurnierOutput> {
    const response = await fetchData("/api/turniere/" + turnierId + "/name-datum", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(nameDatum)
    });

    return response.json();
}


export interface ErgebnisInput {
    runde: number;
    matchId: number;
    ergebnis: {spieler1: number, spieler2: number};
};

export async function updateErgebnis(turnierId: string, runde: number, matchId: number, ergebnis: {spieler1: number, spieler2: number}): Promise<TurnierOutput> {
    console.log(runde, matchId, ergebnis);
    const response = await fetchData("/api/turniere/" + turnierId + "/ergebnis", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({runde, matchId, ergebnis})
    });

    return response.json();
};


export async function getTurnierbaum (turnierId: string) {
    const response = await fetchData("/api/turniere/" + turnierId + "/turnierbaum", { method: "GET" });
    return response.json();
};


export async function deleteTurnier(turnierId: string) {
    await fetchData("/api/turniere/" + turnierId, { method: "DELETE" });
};
