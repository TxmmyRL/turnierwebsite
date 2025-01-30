import { useState } from 'react';
import { Box, Button, Container, FormControl, FormLabel, Input, VStack, HStack, Text, SimpleGrid, useToast } from '@chakra-ui/react'
import * as TurnierApi from '../network/turnier.api'
import { TeilnehmerInput, TurnierInput } from '../network/turnier.api'
import { useNavigate } from 'react-router-dom'
import { DeleteIcon } from '@chakra-ui/icons';

const formatOptions = [
    { label: "KO", value: "ko" },
    { label: "Liga", value: "liga" },
    { label: "Swiss", value: "swiss" },
] as const;


const CreateGrid = () => {
    const [name, setName] = useState('');
    const [datum, setDatum] = useState('');
    const [format, setFormat] = useState<"ko" | "liga" | "swiss">("ko");
    const [teilnehmer, setTeilnehmer] = useState<TeilnehmerInput[]>([]);

    const toast = useToast();
    const navigate = useNavigate();

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
        const newTeilnehmer = teilnehmer.filter((_, i) => i !== index);
        setTeilnehmer(newTeilnehmer);
    }

    async function handleSubmit() {
        const turnier: TurnierInput = {
            name: name,
            datum: datum,
            format: format,
            teilnehmer: teilnehmer,
        };

        console.log(turnier);
        console.log(teilnehmer);

        try {
            await TurnierApi.createTurnier(turnier);
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

    async function handleExit() {
        navigate("/");
    }

    return (
        <Container maxW="container.xl" py={8}>
            <VStack spacing={6} align="stretch">
                <FormControl>
                    <FormLabel fontSize="xl" fontWeight="bold">Name</FormLabel>
                    <Input value={name} placeholder="Name eingeben" onChange={(e) => setName(e.target.value)} />
                </FormControl>
                <FormControl>
                    <FormLabel fontSize="xl" fontWeight="bold">Datum</FormLabel>
                    <Input value={datum} type="date" placeholder="Datum eingeben" onChange={(e) => setDatum(e.target.value)} />
                </FormControl>
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
                        {teilnehmer.length > 0 ? teilnehmer.map((t, index) => (
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
                        ))
                        : null}
                        <Button onClick={handleAddTeilnehmer} alignSelf="start">Teilnehmer hinzufügen</Button>
                    </VStack>
                </Box>
                <HStack>
                    <Button colorScheme="blue" size="lg" isDisabled={!name || !datum || format === "liga" || format === "swiss"} onClick={handleSubmit}>Turnier erstellen</Button>
                    <Button colorScheme="gray" size="lg" onClick={handleExit}>Abbrechen</Button>
                </HStack>
            </VStack>
        </Container>
    );
}

export default CreateGrid;