import { useEffect, useState } from "react"
import { Box, Button, FormControl, FormLabel, Input, VStack, HStack, Text, SimpleGrid, useToast } from "@chakra-ui/react";
import { TeilnehmerInput, TurnierInput, NameDatumInput } from "../network/turnier.api"
import { useNavigate } from "react-router-dom";
import * as TurnierApi from "../network/turnier.api";
import { TurnierOutput } from "../models/turnier.model";
import { DeleteIcon, WarningIcon } from "@chakra-ui/icons";

const formatOptions = [
    { label: "KO", value: "ko" },
    { label: "Liga", value: "liga" },
    { label: "Swiss", value: "swiss" },
] as const;

interface EditGridProps {
    turnier: TurnierOutput;
    onUpdate: () => void;
}

const EditGrid = ({turnier, onUpdate}: EditGridProps) => {
    const [refresh, setRefresh] = useState(false);
    const [turnierId, setTurnierId] = useState("");
    const [name, setName] = useState("");
    const [datum, setDatum] = useState("");
    const [format, setFormat] = useState<"ko" | "liga" | "swiss">("ko");
    const [teilnehmer, setTeilnehmer] = useState<TeilnehmerInput[]>([]);
    const [teilnehmerAlt, setTeilnehmerAlt] = useState<TeilnehmerInput[]>([]);
    const toast = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        if (turnier) {
            setTurnierId(turnier._id);
            setName(turnier.name);
            setDatum(turnier.datum);
            setFormat(turnier.format);
            setTeilnehmer(turnier.teilnehmer.filter(t => t.vorname !== "Freewin").map(t => ({ vorname: t.vorname, nachname: t.nachname, verein: t.verein, qttr: t.qttr })) || []);
            setTeilnehmerAlt(turnier.teilnehmer.filter(t => t.vorname !== "Freewin").map(t => ({ vorname: t.vorname, nachname: t.nachname, verein: t.verein, qttr: t.qttr })) || []);
        }
        setRefresh(false);
    }, [turnier, refresh]);

    const handleAddTeilnehmer = () => {
        setTeilnehmer([
            ...teilnehmer,
            {vorname: "", nachname: "", verein: "", qttr: NaN },
        ]);
    }

    const handleUpdateTeilnehmer = (index: number, field: keyof TeilnehmerInput, value: string | number) => {
        const updatedTeilnehmer = [...teilnehmer];
        updatedTeilnehmer[index] = {...updatedTeilnehmer[index], [field]: value};
        setTeilnehmer(updatedTeilnehmer);
    }

    const handleDeleteTeilnehmer = (index: number) => {
        setTeilnehmer(teilnehmer.filter((_, i) => i !== index));
    }

    const arraysEqual = (a: TeilnehmerInput[], b: TeilnehmerInput[]) => {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (a[i].vorname !== b[i].vorname || a[i].nachname !== b[i].nachname || a[i].verein !== b[i].verein || a[i].qttr !== b[i].qttr) {
                return false;
            }
        }
        return true;
    };

    async function handleSubmit() {
        const turnier: TurnierInput = {
            name: name,
            datum: datum,
            format: format,
            teilnehmer: teilnehmer,
        };

        const nameDatum: NameDatumInput = {
            name: name, 
            datum: datum
        };

        try {
            if (format === turnier.format && arraysEqual(teilnehmer, teilnehmerAlt)) {
                await TurnierApi.updateTurnierNameDatum(turnierId, nameDatum);
            } else {
                await TurnierApi.updateTurnier(turnierId, turnier);
            }
            toast({
                title: "Turnier erfolgreich aktualisiert",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            onUpdate();
            setRefresh(true);
        } catch (error) {
            toast({
                title: "Fehler beim Erstellen des Turniers",
                description: (error as Error).message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    }

    async function handleExit() {
        navigate("/");
    }

    async function handleDelete() {
        try {
            if (turnierId) {
                await TurnierApi.deleteTurnier(turnierId);
            } else {
                throw new Error("Turnier ID is undefined");
            }
            toast({
                title: "Turnier erfolgreich gelöscht",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            navigate("/");
        } catch (error) {
            toast({
                title: "Fehler beim Löschen des Turniers",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            console.log(error);
        }
    }

    return (
        <Box>
            <VStack spacing={6} align="stretch">
                <Text fontSize="4xl" fontWeight="bold">Turnier bearbeiten</Text>
                <FormControl>
                    <FormLabel fontSize="xl" fontWeight="bold">Name</FormLabel>
                    <Input value={name} placeholder="Name eingeben" onChange={(e) => setName(e.target.value)} />
                </FormControl>
                <FormControl>
                    <FormLabel fontSize="xl" fontWeight="bold">Datum</FormLabel>
                    <Input value={datum} type="date" placeholder="Datum eingeben" onChange={(e) => setDatum(e.target.value)} />
                </FormControl>
                <HStack mt="50px">
                    <WarningIcon fontSize="xl" color="red"/>
                    <Text fontSize="xl" textColor="red" textAlign="center">Wenn Sie das Format wechseln oder einen Teilnehmer hinzufügen/löschen, wird das Bracket erneut generiert und alle Ergebnisse gehen verloren</Text>
                    <WarningIcon fontSize="xl" color="red"/>
                </HStack>
                <FormControl>
                    <FormLabel fontSize="xl" fontWeight="bold">Format</FormLabel>
                    <HStack spacing={4}>
                        {formatOptions.map(option => (
                            <Button key={option.value} colorScheme={format === option.value ? "blue" : "gray"} onClick={() => setFormat(option.value)}>{option.label}</Button>
                        ))}
                        {format === "liga" || format === "swiss" ? <Text textColor="red"> Leider noch nicht implementiert. Bitte wählen Sie ein anderes Format.</Text> : null}
                    </HStack>
                </FormControl>

                <Box>
                    <Text fontSize="xl" fontWeight="bold" mb={4}>Teilnehmer</Text>
                    <VStack spacing={4} align="stretch">
                        {teilnehmer.map((t, index) => ( t.vorname !== "Freewin" &&
                            <HStack key={index} width = "100%" align="flex-start" spacing={4}>
                                <Text mt={2} fontWeight="bold" minW="1rem"> {index + 1} </Text>
                                <SimpleGrid key={index} columns={4} spacing={4}>
                                    <Input placeholder="Vorname" value={t.vorname} onChange={(e) => handleUpdateTeilnehmer(index, "vorname", e.target.value)} />
                                    <Input placeholder="Nachname" value={t.nachname} onChange={(e) => handleUpdateTeilnehmer(index, "nachname", e.target.value)} />
                                    <Input placeholder="Verein" value={t.verein} onChange={(e) => handleUpdateTeilnehmer(index, "verein", e.target.value)} />
                                    <Input placeholder="QTTR" type="number" value={t.qttr} onChange={(e) => handleUpdateTeilnehmer(index, "qttr", parseInt(e.target.value))} />
                                </SimpleGrid>
                                <Button colorScheme="red" size="sm" alignSelf="center" onClick={() => handleDeleteTeilnehmer(index)}><DeleteIcon /></Button>
                            </HStack>
                        ))}
                        <Button onClick={handleAddTeilnehmer} alignSelf="start">Teilnehmer hinzufügen</Button>
                    </VStack>
                </Box>
                <HStack>
                    <Button colorScheme="blue" size="lg" isDisabled={!name || !datum || format === "liga" || format === "swiss"} onClick={handleSubmit}>Turnier aktualisieren</Button>
                    <Button colorScheme="gray" size="lg" onClick={handleExit}>Abbrechen</Button>
                    <Button colorScheme="red" size="lg" onClick={handleDelete}>Turnier löschen</Button>
                </HStack>
            </VStack>
        </Box>
    );
}

export default EditGrid;