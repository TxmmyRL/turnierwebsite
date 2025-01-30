import { HStack, Text, Box, Button, FormControl, Input, useToast} from "@chakra-ui/react";
import { MatchOutput, TurnierOutput } from "../models/turnier.model";
import { useEffect, useState } from "react";
import * as TurnierApi from "../network/turnier.api";

interface EditMatchCardProps {
    turnier: TurnierOutput
    match: MatchOutput;
    turnierId: string;
    index: number;
    onUpdate: () => void;
}
const EditMatchCard = ({ turnier, match, turnierId , index, onUpdate }: EditMatchCardProps) => {
    const [change, setChange] = useState<boolean>(false);
    const [runde, setRunde] = useState<number>(0);
    const [matchId, setMatchId] = useState<number>(0);
    const [ergebnis, setErgebnis] = useState<{spieler1: number, spieler2: number}>({spieler1: 0, spieler2: 0});
    const [name1, setName1] = useState<string>("");
    const [name2, setName2] = useState<string>("");
    const [qttr1, setQttr1] = useState<number>(0);
    const [qttr2, setQttr2] = useState<number>(0);
    const toast = useToast();

    useEffect(() => {
        if (match) {
            setRunde(match.runde);
            setMatchId(match.matchId);
            if (match.ergebnis) {
                setErgebnis({spieler1: match.ergebnis.spieler1, spieler2: match.ergebnis.spieler2});
            } else {
                setErgebnis({spieler1: NaN, spieler2: NaN});
            }
        }

        if (turnier) {
            setName1("");
            setQttr1(0);
            setName2("");
            setQttr2(0);
            const teilnehmer1 = turnier.teilnehmer.find(t => t._id === match.spieler1);
            const teilnehmer2 = turnier.teilnehmer.find(t => t._id === match.spieler2);
            if (teilnehmer1) {
                setName1(teilnehmer1.vorname + " " + teilnehmer1.nachname);
                setQttr1(teilnehmer1.qttr);
            }

            if (teilnehmer2) {
                setName2(teilnehmer2.vorname + " " + teilnehmer2.nachname);
                setQttr2(teilnehmer2.qttr);
            }
        }
    }, [turnier, match]);

    const validateScores = (s1: number, s2: number): boolean => {
        if (change) {
            if (Number.isNaN(s1) || Number.isNaN(s2)) return false
            if (s1 < 0 || s2 < 0 || s1 > 3 || s2 > 3) return false
            if (s1 === 3 && s2 >= 3) return false
            if (s2 === 3 && s1 >= 3) return false
            if (s1 !== 3 && s2 !== 3) return false
            return true
        }
        return false
    }

    async function handleSubmit() {
        try {
            await TurnierApi.updateErgebnis(turnierId, runde, matchId, ergebnis);
            toast({
                title: "Ergebnis gespeichert",
                description: "Das Ergebnis wurde erfolgreich gespeichert.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            onUpdate();
            setChange(false);
        } catch (error) {
            toast({
                title: "Fehler beim Speichern",
                description: "Bitte versuchen Sie es erneut.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            console.log(error);
        }
    }

    return (
        <Box key={index} mt="10px" borderColor={"black"} borderWidth={1} borderRadius={5} p={4}>
            <Text fontWeight={"bold"}>
                Match {index + 1}
            </Text>
            <Text>
                {name1 ? name1 : match.spieler1} {qttr1 === 0 ? "" : "(" + qttr1 + ")"} vs {name2 ? name2 : match.spieler2} {qttr2 === 0 ? "" : "(" + qttr2 + ")"}
            </Text>
            {(name1 !== "Freewin " && name2 !== "Freewin ") && (name1 !== "" && name2 !== "") &&
            <HStack>
                <Text>
                    Ergebnis:
                </Text>
                <FormControl width="50px" display="flex" alignItems="center" justifyContent="center">
                    <Input value={ergebnis.spieler1} type="number" textAlign="center" onChange={(e) => {setErgebnis(prev => ({ ...prev, spieler1: Number(e.target.value) })); setChange(true);}}/>
                </FormControl>
                <Text>
                    :
                </Text>
                <FormControl width="50px" display="flex" alignItems="center" justifyContent="center">
                    <Input value={ergebnis.spieler2} type="number"  textAlign="center" onChange={(e) => {setErgebnis(prev => ({ ...prev, spieler2: Number(e.target.value) }));setChange(true);}}/>
                </FormControl>
                {validateScores(ergebnis.spieler1, ergebnis.spieler2 ) || !change ? null: <Text textColor="red">Ungültige Eingabe! Best-of-5</Text>}
                <Button isDisabled={!validateScores(ergebnis.spieler1, ergebnis.spieler2 ) || ((ergebnis.spieler1 === 0 && ergebnis.spieler2 === 0) && !change)} colorScheme="blue" ml="auto" onClick={() => handleSubmit()}>
                    Speichern
                </Button>
            </HStack>
            }
        </Box>
    )
}

export default EditMatchCard;