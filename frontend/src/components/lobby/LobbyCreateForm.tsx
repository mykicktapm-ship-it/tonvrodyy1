import React, { useState } from 'react';
import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, NumberInput, NumberInputField, NumberInputStepper, NumberDecrementStepper, NumberIncrementStepper, Select } from '@chakra-ui/react';
import { Tier } from '../../types/lobby';
import { useTranslation } from '../../LanguageContext';

export interface CreateLobbyPayload {
  tier: Tier;
  seats: number;
  stakeTon: number;
  password?: string;
}

export default function LobbyCreateForm({ isOpen, onClose, onCreate }: { isOpen: boolean; onClose: () => void; onCreate: (p: CreateLobbyPayload) => void }) {
  const { t } = useTranslation();
  const [tier, setTier] = useState<Tier>('Easy');
  const [seats, setSeats] = useState(10);
  const [stake, setStake] = useState(0.5);
  const [password, setPassword] = useState('');
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay backdropFilter="blur(6px)" />
      <ModalContent bg="ton.surface" border="1px solid rgba(255,255,255,0.18)">
        <ModalHeader>{t('general.createLobby')}</ModalHeader>
        <ModalBody>
          <Select mb={3} value={tier} onChange={(e) => setTier(e.target.value as Tier)}>
            <option value="Easy">{t('general.easy')}</option>
            <option value="Medium">{t('general.medium')}</option>
            <option value="Hot">{t('general.hot')}</option>
          </Select>
          <NumberInput mb={3} value={seats} min={2} max={30} onChange={(val) => setSeats(Number(val))}>
            <NumberInputField placeholder="Seats" />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <NumberInput mb={3} value={stake} min={0.1} step={0.1} onChange={(val) => setStake(Number(val))}>
            <NumberInputField placeholder="Stake (TON)" />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <Input mb={3} placeholder="Password (optional)" value={password} onChange={(e) => setPassword(e.target.value)} />
        </ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={onClose}>Cancel</Button>
          <Button colorScheme="blue" onClick={() => onCreate({ tier, seats, stakeTon: stake, password: password || undefined })}>Create</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

