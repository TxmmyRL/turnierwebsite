import { Box, Heading, VStack, Text } from "@chakra-ui/react";
import { MatchOutput, RundeOutput, BracketOutput, TurnierOutput } from "../models/turnier.model";
import { useEffect, useState } from "react";
import EditMatchCard from "./EditMatchCard";

interface ErgebnisVerwaltungGrid {
    turnier: TurnierOutput;
    onUpdate: () => void;
}

const ErgebnisVerwaltungGrid = ({turnier, onUpdate}: ErgebnisVerwaltungGrid) => {
    const [bracket, setBracket] = useState<BracketOutput>();

    useEffect(() => {
        if (turnier && turnier.bracket !== null) {
            setBracket({
                runden: (turnier.bracket as unknown as BracketOutput).runden.map((runde: RundeOutput) => ({
                    ...runde,
                    matches: runde.matches.map((match: MatchOutput) => ({
                        ...match,
                    }))
            }))});
        }
    }, [turnier]);

    return (
        <Box>
            <VStack spacing={8} align="stretch" p={4}>
                <Text color="red">Bitte die Ergebnisse je Match einzeln eintragen und speichern! Jedes Spiel ist Best-of-5 (Mögliche Ergebnisse: 3:0; 3:1; 3:2; 2:3; 1:3; 0:3)!</Text>
                {bracket && bracket.runden.length > 0 ? bracket.runden.map((runde: RundeOutput, index: number) => (
                    <Box key={index}>
                        <Heading size="md"> Runde {index + 1} ({(turnier.bracket as unknown as BracketOutput).runden[index].rundenName}): </Heading>
                        <VStack spacing={4} align="stretch">
                            {runde.matches.map((match: MatchOutput, index: number) => (
                                <EditMatchCard key={index} turnier={turnier} match={match} turnierId={turnier._id} index={index} onUpdate={onUpdate}/>
                            ))}
                        </VStack>
                    </Box>
                ))
                : <Heading size="md"> Keine Matches vorhanden, da noch keine Teilnehmer eingetragen sind!</Heading>}
            </VStack>
        </Box>
    );
}

export default ErgebnisVerwaltungGrid;