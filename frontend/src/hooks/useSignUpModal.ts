import { useState } from "react";
import { useDisclosure } from "@chakra-ui/react";
import { SignUpCredentials } from "../network/user.api";

export function useSignUpModal() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [signUpCredentials, setSignUpCredentials] = useState<SignUpCredentials>({username: "", email: "", passwort: ""});

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSignUpCredentials(prev => ({...prev, [name]: value}));
    }

    const resetForm = () => {
        setSignUpCredentials({username: "", email: "", passwort: ""});
    }

    return {
        isOpen,
        onOpen,
        onClose,
        signUpCredentials,
        handleInputChange,
        resetForm
    }
}