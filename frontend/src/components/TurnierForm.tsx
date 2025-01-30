import { useState } from "react"
import { Box, Button, Container, FormControl, FormLabel, Input, VStack, HStack, Text, SimpleGrid, useToast } from "@chakra-ui/react";
import { createTurnier } from "../network/turnier.api"
import { TeilnehmerInput, TurnierInput } from "../network/turnier.api"
import { useNavigate } from "react-router-dom";
import { TurnierOutput } from "../models/turnier.model";

const formatOptions = [
    { label: "KO", value: "ko" },
    { label: "Liga", value: "liga" },
    { label: "Swiss", value: "swiss" },
] as const;

const anzahlTeilnehmerOptions = [8, 16, 32, 64, 128]


interface TurnierFormInput {
    turnier: TurnierOutput;
}

const EditGrid = ({turnier}: TurnierFormInput) => {
    const {name, datum, format, anzahlTeilnehmer, teilnehmer} = turnier;

    const [newName, setName] = useState(name);
    const [newDatum, setDatum] = useState(datum);
    const [newFormat, setFormat] = useState<"ko" | "liga" | "swiss">(format || "ko");
    const [newAnzahlTeilnehmer, setAnzahlTeilnehmer] = useState(anzahlTeilnehmer || 8);
    const [newTeilnehmer, setTeilnehmer] = useState<TeilnehmerInput[]>([
        ...teilnehmer.map(t => ({vorname: t.vorname, nachname: t.nachname, verein: t.verein, qttr: t.qttr})),
    ]);
    
    
    const toast = useToast();
    const navigate = useNavigate();

    const handleAddTeilnehmer = () => {
        if (teilnehmer.length < anzahlTeilnehmer) {
            setTeilnehmer([
                ...teilnehmer,
                {vorname: "", nachname: "", verein: "", qttr: 0 },
            ]);
        }
    }

    const handleUpdateTeilnehmer = (index: number, field: keyof TeilnehmerInput, value: string | number) => {
        const updatedTeilnehmer = [...newTeilnehmer];
        updatedTeilnehmer[index] = {...updatedTeilnehmer[index], [field]: value};
        setTeilnehmer(updatedTeilnehmer);
    }

    const handleDeleteTeilnehmer = (index: number) => {
        setTeilnehmer(newTeilnehmer.filter((_, i) => i !== index));
    }

    async function handleSubmit() {
        const turnier: TurnierInput = {
            name: newName,
            datum: newDatum,
            format: newFormat,
            teilnehmer: newTeilnehmer,
        };

        try {
            await createTurnier(turnier);
            toast({
                title: "Turnier erfolgreich erstellt",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            navigate("/");
        } catch (error) {
            toast({
                title: "Fehler beim Erstellen des Turniers",
                description: (error as Error).message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            console.log(error);
        }

    }

    return (
        <Container maxW="container.xl" py={8}>
            <VStack spacing={6} align="stretch">
                <FormControl>
                    <FormLabel>Name</FormLabel>
                    <Input value={newName} placeholder="Name eingeben" onChange={(e) => setName(e.target.value)} />
                </FormControl>
                <FormControl>
                    <FormLabel>Datum</FormLabel>
                    <Input value={newDatum} type="date" placeholder="Datum eingeben" onChange={(e) => setDatum(e.target.value)} />
                </FormControl>
                <FormControl>
                    <FormLabel>Format</FormLabel>
                    <HStack spacing={4}>
                        {formatOptions.map(option => (
                            <Button key={option.value} colorScheme={newFormat === option.value ? "blue" : "gray"} onClick={() => setFormat(option.value)}>{option.label}</Button>
                        ))}
                    </HStack>
                </FormControl>
                <FormControl>
                    <FormLabel>Anzahl Teilnehmer</FormLabel>
                    <HStack spacing={4}>
                        {anzahlTeilnehmerOptions.map(option => (
                            <Button key={option} colorScheme={newAnzahlTeilnehmer === option ? "blue" : "gray"} onClick={() => setAnzahlTeilnehmer(option)}>{option}</Button>
                        ))}
                    </HStack>
                </FormControl>

                <Box>
                    <Text fontSize="xl" fontWeight="bold" mb={4}>Teilnehmer</Text>
                    <VStack spacing={4} align="stretch">
                        {newTeilnehmer.map((t, index) => (
                            <HStack key={index} width = "100%" align="flex-start" spacing={4}>
                                <Text mt={2} fontWeight="bold" minW="1rem"> {index + 1} </Text>
                                <SimpleGrid key={index} columns={4} spacing={4}>
                                    <Input placeholder="Vorname" value={t.vorname} onChange={(e) => handleUpdateTeilnehmer(index, "vorname", e.target.value)} />
                                    <Input placeholder="Nachname" value={t.nachname} onChange={(e) => handleUpdateTeilnehmer(index, "nachname", e.target.value)} />
                                    <Input placeholder="Verein" value={t.verein} onChange={(e) => handleUpdateTeilnehmer(index, "verein", e.target.value)} />
                                    <Input placeholder="QTTR" type="number" value={t.qttr} onChange={(e) => handleUpdateTeilnehmer(index, "qttr", parseInt(e.target.value))} />
                                </SimpleGrid>
                                <Button colorScheme="red" size="sm" alignSelf="center" onClick={() => handleDeleteTeilnehmer(index)}>Löschen</Button>
                            </HStack>
                        ))}
                        {teilnehmer.length < anzahlTeilnehmer && <Button onClick={handleAddTeilnehmer} alignSelf="start">Teilnehmer hinzufügen</Button>}
                    </VStack>
                </Box>
                <Button colorScheme="blue" size="lg" isDisabled={!name || !datum} onClick={handleSubmit}>Turnier erstellen</Button>
            </VStack>
        </Container>
    );
}

export default EditGrid;