import { Button, Flex, Heading, HStack, Spacer } from "@chakra-ui/react"
import { useLoginModal } from "../hooks/useLoginModal";
import { useSignUpModal } from "../hooks/useSignUpModal";
import LoginModal from "./LogInModal"
import SignUpModal from "./SignUpModal"
import { User } from "../models/user.model";
import { Link as ReactRouterLink } from 'react-router-dom'
import { Link as ChakraLink } from '@chakra-ui/react'

interface NavBarLoggedOutViewProps {
    onLoginSuccessful: (user : User) => void;
    onSignUpSuccessful: (user : User) => void;
}
const NavBarLoggedOutView = ({onLoginSuccessful, onSignUpSuccessful}: NavBarLoggedOutViewProps) => {
    const signUpModal = useSignUpModal();
    const loginModal = useLoginModal();

    return (

        <Flex as="nav" p="10px" mx="10px" my="10px" bg="gray.400" borderRadius="20px" alignContent="start" alignItems="center">
            <ChakraLink as={ReactRouterLink} to="/" >
                <Heading as="h1">TTTournament</Heading>
            </ChakraLink>
            <Spacer/>

            <HStack spacing="20px">
                <Button onClick={loginModal.onOpen}> Log In </Button>
                <Button onClick={signUpModal.onOpen}> Sign Up</Button>
            </HStack>

            <LoginModal isOpen={loginModal.isOpen} onClose={loginModal.onClose}  onLoginSuccessful={onLoginSuccessful}/>
            <SignUpModal isOpen={signUpModal.isOpen} onClose={signUpModal.onClose} onSignUpSuccessful={onSignUpSuccessful}/>
        </Flex>
    )
};

export default NavBarLoggedOutView;
