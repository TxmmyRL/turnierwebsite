import { Button, FormControl, FormLabel, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useToast } from "@chakra-ui/react";
import { useLoginModal } from "../hooks/useLoginModal";
import { User } from "../models/user.model";
import * as UserApi from "../network/user.api";

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccessful: (user : User) => void;
}

const LoginModal = ({isOpen, onClose, onLoginSuccessful}: LoginModalProps) => {
    const { loginCredentials, handleInputChange, resetForm } = useLoginModal();
    const toast = useToast();

    async function handleSubmit() {
        try {
            const user = await UserApi.login(loginCredentials);
            toast({
                title: "Erfolgreich eingeloggt",
                status: "success",
                duration: 9000,
                isClosable: true,
            });
            onLoginSuccessful(user);
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
                    <ModalHeader> Log In </ModalHeader>
                    <ModalCloseButton onClick={handleExit}/>
                    <ModalBody pb={6}>
                        <form>
                            <FormControl isRequired>
                                <FormLabel>Username</FormLabel>
                                <Input name="username" value={loginCredentials.username} onChange={handleInputChange} placeholder="Bitte Username eingeben"/>
                            </FormControl>
                            <FormControl isRequired mt={4}>
                                <FormLabel>Passwort</FormLabel>
                                <Input name="passwort" type="password" value={loginCredentials.passwort} onChange={handleInputChange} placeholder="Bitte Passwort eingeben"/>
                            </FormControl>
                        </form>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={handleSubmit}>Log In</Button>
                        <Button onClick={handleExit}>Abbrechen</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default LoginModal;
