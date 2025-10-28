import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
  useToast,
} from '@chakra-ui/react';
import { useLobbies } from '../store/lobbies';
import { useAppUserId } from '../hooks/useAppUserId';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal dialog for creating a new lobby. Collects tier, seats and stake
 * information then invokes the lobby store to create the lobby. The
 * creator is not automatically joined; they may join after creation.
 */
export default function CreateLobbyModal({ isOpen, onClose }: Props) {
  const { create } = useLobbies();
  const userId = useAppUserId();
  const toast = useToast();
  const [tier, setTier] = useState<'Easy' | 'Medium' | 'Hot'>('Easy');
  const [seats, setSeats] = useState(10);
  const [stake, setStake] = useState(0.5);
  const [busy, setBusy] = useState(false);

  async function handleCreate() {
    if (!userId) return;
    setBusy(true);
    try {
      await create({ tier, seats, stakeTon: stake, creatorId: userId });
      toast({ title: 'Лобби создано', status: 'success', duration: 2000, isClosable: true });
      onClose();
      // reset form to defaults
      setTier('Easy');
      setSeats(10);
      setStake(0.5);
    } catch (err) {
      toast({ title: 'Ошибка создания лобби', status: 'error', duration: 3000, isClosable: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={busy ? () => {} : onClose} isCentered>
      <ModalOverlay backdropFilter="blur(6px)" />
      <ModalContent bg="ton.surface" border="1px solid rgba(255,255,255,0.18)">
        <ModalHeader>Создать лобби</ModalHeader>
        <ModalBody>
          <FormControl mb={3}>
            <FormLabel>Уровень</FormLabel>
            <Select value={tier} onChange={(e) => setTier(e.target.value as any)}>
              <option value="Easy">Easy (10 × 0.5 TON)</option>
              <option value="Medium">Medium (20 × 1 TON)</option>
              <option value="Hot">Hot (30 × 2.5 TON)</option>
            </Select>
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>Места</FormLabel>
            <NumberInput value={seats} min={2} max={50} onChange={(valueString, valueNumber) => setSeats(valueNumber)}>
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>Ставка (TON)</FormLabel>
            <NumberInput value={stake} step={0.1} min={0.1} onChange={(valueString, valueNumber) => setStake(valueNumber)}>
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={onClose} isDisabled={busy}>
            Отмена
          </Button>
          <Button colorScheme="blue" onClick={handleCreate} isLoading={busy} isDisabled={!userId}>
            Создать
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}