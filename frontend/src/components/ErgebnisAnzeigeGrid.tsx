import { Box, Heading, VStack } from "@chakra-ui/react";
import { BracketOutput, MatchOutput, RundeOutput, TurnierOutput } from "../models/turnier.model";
import { useEffect, useState } from "react";
import ShowMatchCard from "./ShowMatchCard";

interface ErgebnisAnzeigeGrid {
    turnier: TurnierOutput;
}

const ErgebnisAnzeigeGrid = ({turnier}: ErgebnisAnzeigeGrid) => {
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
                {bracket && bracket.runden.length > 0 ? bracket.runden.map((runde: RundeOutput, index: number) => (
                    <Box key={index}>
                        <Heading size="md"> Runde {index + 1} ({(turnier.bracket as unknown as BracketOutput).runden[index].rundenName}): </Heading>
                        <VStack spacing={4} align="stretch">
                            {runde.matches.map((match: MatchOutput, index: number) => (
                                <ShowMatchCard key={index} turnier={turnier} match={match} index={index}/>
                            ))}
                        </VStack>
                    </Box>
                ))
                : <Heading size="md"> Keine Matches vorhanden, da noch keine Teilnehmer eingetragen sind!</Heading>}
            </VStack>
        </Box>
    );
}

export default ErgebnisAnzeigeGrid;