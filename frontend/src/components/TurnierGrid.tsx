import { Box, Button, Flex, SimpleGrid, Text, useToast} from "@chakra-ui/react";
import Turnier from "./Turnier";
import { useTurnierAddModal } from "../hooks/useTurnierAddModal";
import TurnierAddModal from "./TurnierAddModal";
import * as TurnierApi from "../network/turnier.api";
import * as UserApi from "../network/user.api";
import { AddIcon, SpinnerIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";
import { TurnierOutput } from "../models/turnier.model"
import { User } from "../models/user.model";
import { useNavigate } from "react-router-dom";

interface TurnierGridProps {
    user: User;
}

const TurnierGrid = ({user}: TurnierGridProps) => {
    const turnierAddModal = useTurnierAddModal();
    const navigate = useNavigate();
    const toast = useToast();
    

    const [turniere, setTurniere] = useState<TurnierOutput[]>([]);
    const [turniereLoading, setTurniereLoading] = useState(true);
    const [showTurniereLoadingError, setShowTurniereLoadingError] = useState(false);

    useEffect(() => {
        async function loadTurniere() {
            try {
                setShowTurniereLoadingError(false);
                setTurniereLoading(true);
                const turniere = await TurnierApi.getTurniere();
                setTurniere(turniere);
            } catch (error) {
                console.error(error);
                setShowTurniereLoadingError(true);
            } finally {
                setTurniereLoading(false);
            }
        }
        loadTurniere();
    }, []);
    
    async function saveTurnier(turnierId: string) {
        try {
            await UserApi.saveTurnier(turnierId)
            const turniere = await TurnierApi.getTurniere()
            setTurniere(turniere);
            toast ({
                title: "Turnier gespeichert",
                status: "success",
                duration: 9000,
                isClosable: true,
            });
        } catch (error) {
            toast ({
                title: "Fehler",
                description: (error as Error).message,
                status: "error",
                duration: 9000,
                isClosable: true,
            });
        }
    }

    async function unsaveTurnier(turnierId: string) {
        try {
            await UserApi.unsaveTurnier(turnierId);
            setTurniere(turniere.filter(existingTurnier => existingTurnier._id !== turnierId)) //damit man Anderung direkt sieht und Seite nicht neu geladen werden muss
            toast ({
                title: "Turnier entfernt",
                status: "success",
                duration: 9000,
                isClosable: true,
            });
        } catch (error) {
            toast ({
                title: "Fehler",
                description: (error as Error).message,
                status: "error",
                duration: 9000,
                isClosable: true,
            });
        }
    }

    const handleRedirectTurniererstellung = () => {
        navigate("/turniererstellung");
        
    }

    const handleRedirectTurnierbearbeitung = (turnierId: string) => {
        navigate("/" + turnierId + "/turnierbearbeitung");
    }

    return (
        <div>
            {turniereLoading &&
            <Box my="50px" textAlign={"center"}>
                <Text><SpinnerIcon/>Turniere werden geladen</Text>
            </Box>
            }

            {showTurniereLoadingError &&
            <Box my="50px" textAlign={"center"}>
                <Text> Etwas ist schiefgegangen. Bitte rufen Sie die Seite neu auf!</Text>
            </Box>
            }

            {!turniereLoading && !showTurniereLoadingError && 
                <>
                {turniere.length > 0
                ?<>
                    <SimpleGrid p="10px" spacing="10px" minChildWidth="300px">
                        {turniere.map(turnier => (
                            <Turnier key={turnier._id} user={user} turnier={turnier} onEditClicked={handleRedirectTurnierbearbeitung} onUnsaveClicked={unsaveTurnier}/>
                        ))}
                    </SimpleGrid>
                </>
                :
                <Box my="50px" textAlign={"center"}>
                    <Text> Sie haben noch keine Turniere erstellt oder gespeichert! </Text>
                </Box>
                }
                </>
            }

            {!showTurniereLoadingError &&
            <>
            <Flex mt="50px" justifyContent={"center"}>
                <Button leftIcon={<AddIcon />} colorScheme="teal" variant="solid" m="10px" onClick={turnierAddModal.onOpen}>
                    Fremdes Turnier hinzufügen
                </Button>
                <Button leftIcon={<AddIcon />} colorScheme="teal" variant="solid" m="10px" onClick={handleRedirectTurniererstellung}>
                    Eigenes Turnier erstellen
                </Button>
            </Flex>
            <TurnierAddModal isOpen={turnierAddModal.isOpen} onClose={turnierAddModal.onClose} onAdd={saveTurnier}/>
            </>
            }
        </div>
    )
};

export default TurnierGrid;