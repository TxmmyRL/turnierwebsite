import { Button, Card, CardBody, CardFooter, Divider, Flex, Text } from "@chakra-ui/react"
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { TurnierOutput } from "../models/turnier.model";
import { User } from "../models/user.model";


import { Link as ReactRouterLink } from 'react-router-dom'
import { Link as ChakraLink } from '@chakra-ui/react'

interface TurnierProps {
    user: User,
    turnier: TurnierOutput,
    onEditClicked: (turnierId: string) => void,
    onUnsaveClicked: (turnierId: string) => void,
}
const Turnier = ({user, turnier, onEditClicked, onUnsaveClicked}: TurnierProps) => {
    const { name, datum } = turnier

    return (
        
        <Card borderWidth="1px" borderRadius="lg" boxShadow="md" alignItems="center" >
            <ChakraLink as={ReactRouterLink} to={"/" + turnier._id} >
            <CardBody textAlign="center">
                <Text fontSize="xl" fontWeight="bold" mb={2}>{name}</Text>
                <Text fontSize="md" color="gray.600">{datum}</Text>
            </CardBody>
            </ChakraLink>
            <Divider borderColor="gray.300"/>
            <CardFooter>
                <Flex justifyContent="flex-end" w="100%">
                    {user._id === turnier.userIdErsteller && 
                        <Button aria-label="Bearbeiten" leftIcon={<EditIcon />} colorScheme="blue" marginRight={2} onClick={(e) => {onEditClicked(turnier._id); e.stopPropagation()}}> Turnier bearbeiten </Button>}
                    {user._id !== turnier.userIdErsteller && <Button aria-label="Löschen" leftIcon={<DeleteIcon />} colorScheme="red" onClick={(e) => {onUnsaveClicked(turnier._id); e.stopPropagation()}}> Turnier (für mich) löschen </Button>}
                
                </Flex>
            </CardFooter>
        </Card>
        
    );
}

export default Turnier;