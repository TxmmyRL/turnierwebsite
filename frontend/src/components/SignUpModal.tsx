import { Button, FormControl, FormLabel, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useToast } from "@chakra-ui/react";
import { useSignUpModal } from "../hooks/useSignUpModal";
import * as UserApi from "../network/user.api";
import { User } from "../models/user.model";

interface SignUpModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSignUpSuccessful: (user : User) => void;
}

const SignUpModal = ({isOpen, onClose, onSignUpSuccessful}: SignUpModalProps) => {
    const { signUpCredentials, handleInputChange, resetForm } = useSignUpModal();
    const toast = useToast();

    async function handleSubmit() {
        try {
            const user = await UserApi.signUp(signUpCredentials);
            toast({
                title: "Erfolgreich registriert",
                status: "success",
                duration: 9000,
                isClosable: true,
            });
            onSignUpSuccessful(user);
            handleExit();
        } catch (error) {
            toast({
                title: "Fehler",
                description: (error as Error).message,
                status: "error",
                duration: 9000,
                isClosable: true,
            });
        }
        
    }

    function handleExit() {
        resetForm();
        onClose();
    }

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader> Sign Up </ModalHeader>
                    <ModalCloseButton onClick={handleExit}/>
                    <ModalBody pb={6}>
                        <form>
                            <FormControl isRequired>
                                <FormLabel>Username</FormLabel>
                                <Input name="username" value={signUpCredentials.username} onChange={handleInputChange} placeholder="Bitte Username eingeben"/>
                            </FormControl>
                            <FormControl isRequired mt={4}>
                                <FormLabel>E-Mail-Adresse</FormLabel>
                                <Input name="email" type="email" value={signUpCredentials.email} onChange={handleInputChange} placeholder="Bitte E-Mail-Adresse eingeben"/>
                            </FormControl>
                            <FormControl isRequired mt={4}>
                                <FormLabel>Passwort</FormLabel>
                                <Input name="passwort" type="password" value={signUpCredentials.passwort} onChange={handleInputChange} placeholder="Bitte Passwort eingeben"/>
                            </FormControl>
                        </form>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={handleSubmit}>Sign Up</Button>
                        <Button onClick={handleExit}>Abbrechen</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default SignUpModal;
