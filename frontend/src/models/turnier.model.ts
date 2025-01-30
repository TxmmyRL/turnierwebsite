export interface MatchOutput {
    _id: string;
    runde: number;
    matchId: number;
    spieler1: string| null;
    spieler2: string | null;
    ergebnis: {spieler1: number, spieler2: number} | null;
    winner: string | null;
};

export interface RundeOutput {
    rundenName: string;
    matches: MatchOutput[];
};

export interface BracketOutput {
    runden: RundeOutput[];
};

export interface TeilnehmerOutput {
    _id: string;
    vorname: string;
    nachname: string;
    verein: string;
    qttr: number;
};

export interface TurnierOutput {
    _id: string;
    name: string;
    datum: string;
    format: "ko" | "liga" | "swiss";
    anzahlTeilnehmer: number;
    teilnehmer: TeilnehmerOutput[];
    bracket: RundeOutput[];
    userIdErsteller: string;
};