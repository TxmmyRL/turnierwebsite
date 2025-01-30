import { HStack, Text, Box } from "@chakra-ui/react";
import { MatchOutput, TurnierOutput } from "../models/turnier.model";
import { useEffect, useState } from "react";

interface ShowMatchCardProps {
    turnier: TurnierOutput
    match: MatchOutput
    index: number
}
const ShowMatchCard = ({ turnier, match,index }: ShowMatchCardProps) => {
    const [ergebnis, setErgebnis] = useState<{spieler1: number, spieler2: number}>({spieler1: 0, spieler2: 0});
    const [name1, setName1] = useState<string>("");
    const [name2, setName2] = useState<string>("");
    const [qttr1, setQttr1] = useState<number>(0);
    const [qttr2, setQttr2] = useState<number>(0);

    useEffect(() => {
        if (match) {
            if (match.ergebnis) {
                setErgebnis({spieler1: match.ergebnis.spieler1, spieler2: match.ergebnis.spieler2});
            } else {
                setErgebnis({spieler1: NaN, spieler2: NaN});
            }
        }

        if (turnier) {
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

    return (
        <Box key={index} mt="10px" borderColor={"black"} borderWidth={1} borderRadius={5} p={4}>
            {(name1 !== "" && name2 !== "") && (ergebnis.spieler1 !== 3 && ergebnis.spieler2 !== 3)
            ?
            <Text fontWeight={"bold"}>
                Match {index + 1} (läuft...)
            </Text>
            :
            <Text fontWeight={"bold"}>
                Match {index + 1}
            </Text>
            }
            <Text>
                {name1 ? name1 : match.spieler1} {qttr1 === 0 ? "" : "(" + qttr1 + ")"} vs {name2 ? name2 : match.spieler2} {qttr2 === 0 ? "" : "(" + qttr2 + ")"}
            </Text>
            {(ergebnis.spieler1 === 3 || ergebnis.spieler2 === 3) &&
            <HStack>
                <Text>
                    Ergebnis: {ergebnis.spieler1}:{ergebnis.spieler2}
                </Text>
            </HStack>
            }
        </Box>
    )
}

export default ShowMatchCard;