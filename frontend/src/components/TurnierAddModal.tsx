
import { Button, FormControl, FormLabel, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from '@chakra-ui/react';
import { useTurnierAddModal } from '../hooks/useTurnierAddModal';

interface TurnierAddModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (turnierId: string) => void;
}

const TurnierAddModal = ({isOpen, onClose, onAdd}: TurnierAddModalProps) => {
    const { turnierId, handleInputChange, resetForm } = useTurnierAddModal();

    const handleSubmit = () => {
        onAdd(turnierId);
        resetForm();
        onClose();
    }

    const handleExit = () => {
        resetForm();
        onClose();
    }

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader> Turnier hinzufügen </ModalHeader>
                    <ModalCloseButton onClick={handleExit}/>
                    <ModalBody pb={6}>
                        <form>
                            <FormControl isRequired>
                                <FormLabel>Turnier-ID:</FormLabel>
                                <Input name="turnierId" value={turnierId} onChange={handleInputChange} placeholder="Bitte Turnier-ID eingeben"/>
                            </FormControl>
                        </form>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={handleSubmit}>Hinzufügen</Button>
                        <Button onClick={handleExit}>Abbrechen</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default TurnierAddModal;