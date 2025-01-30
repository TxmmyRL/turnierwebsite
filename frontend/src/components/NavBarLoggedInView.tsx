import { Button, Flex, Heading, HStack, Spacer, Text, useToast } from "@chakra-ui/react";
import { User } from "../models/user.model";
import * as TurnierApi from "../network/user.api";
import { Link as ReactRouterLink } from 'react-router-dom'
import { Link as ChakraLink } from '@chakra-ui/react'

interface NavBarLoggedInViewProps {
    user: User;
    onLogoutSuccessful: () => void;
};

const NavBarLoggedInView = ({ user, onLogoutSuccessful }: NavBarLoggedInViewProps) => {
    const toast = useToast();

    async function logout() {
        try {
            await TurnierApi.logout();
            toast({
                title: "Logout erfolgreich",
                status: "success",
                duration: 9000,
                isClosable: true,
            });
            onLogoutSuccessful();
        } catch (error) {
            toast({
                title: "Logout fehlgeschlagen",
                description: (error as Error).message,
                status: "error",
                duration: 9000,
                isClosable: true,
            });
        }
    }

    return (
        <Flex as="nav" p="10px" mx="10px" my="10px" bg="gray.400" borderRadius="20px" alignContent="start" alignItems="center">
            <ChakraLink as={ReactRouterLink} to="/" >
                <Heading as="h1">TTTournament</Heading>
            </ChakraLink>
            <Spacer />

            <HStack spacing="20px">
                <Text> Eingeloggt als: {user.username} </Text>
                <Button onClick={logout}> Logout </Button>
            </HStack>
        </Flex>
    )
};

export default NavBarLoggedInView;