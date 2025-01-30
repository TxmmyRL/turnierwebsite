import { useState } from "react";
import { useDisclosure } from "@chakra-ui/react";
import { LoginCredentials } from "../network/user.api";

export function useLoginModal() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [loginCredentials, setLoginCredentials] = useState<LoginCredentials>({username: "", passwort: ""});

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLoginCredentials(prev => ({...prev, [name]: value}));
    }

    const handleSubmit = () => {
        
    }

    const resetForm = () => {
        setLoginCredentials({username: "", passwort: ""});
    }

    return {
        isOpen,
        onOpen,
        onClose,
        loginCredentials,
        handleInputChange,
        handleSubmit,
        resetForm
    }
}