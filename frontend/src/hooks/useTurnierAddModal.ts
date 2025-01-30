import { useState } from "react";
import { useDisclosure } from "@chakra-ui/react";

export function useTurnierAddModal() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [turnierId, setTurnierId] = useState<string>("");

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target;
        setTurnierId(input.value);
    }

    const resetForm = () => {
        setTurnierId("");
    }

    return {
        isOpen,
        onOpen,
        onClose,
        turnierId,
        handleInputChange,
        resetForm
    }
}