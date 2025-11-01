import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  Avatar,
  HStack,
} from '@chakra-ui/react';
import { Participant } from '../types/lobby';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  winner?: Participant | null;
  onStay?: () => void;
  onLeave?: () => void;
};

export const WinnerModal: React.FC<Props> = ({ isOpen, onClose, winner, onStay, onLeave }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay backdropFilter="blur(6px)" bg="rgba(2,6,23,0.6)" />
      <ModalContent bg="linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))" color="white">
        <ModalHeader>Результат</ModalHeader>
        <ModalBody>
          {winner ? (
            <HStack spacing={4}>
              <Avatar name={winner.nickname} src={winner.avatarUrl} />
              <div>
                <Text fontWeight="bold">{winner.nickname}</Text>
                <Text fontSize="sm" color="gray.300">Победитель</Text>
              </div>
            </HStack>
          ) : (
            <Text>Нет участников</Text>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onStay}>Остаться</Button>
          <Button colorScheme="red" onClick={onLeave}>Выйти</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default WinnerModal;
