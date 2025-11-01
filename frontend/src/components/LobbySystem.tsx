import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  VStack,
  HStack,
  Avatar,
  Select,
  NumberInput,
  NumberInputField,
  useBreakpointValue,
  Tooltip,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useLobbiesStore } from '../store/lobbies';
import { Lobby, Participant, Tier } from '../types/lobby';
import WinnerModal from './WinnerModal';
import { nanoid } from 'nanoid';

const MotionCard = motion(Card);

const tierOptions: Tier[] = ['Easy', 'Medium', 'Hot'];

export const LobbySystem: React.FC = () => {
  const createLobby = useLobbiesStore((s) => s.createLobby);
  const joinLobby = useLobbiesStore((s) => s.joinLobby);
  const lobbies = useLobbiesStore((s) => s.lobbies);
  const startLobbyCountdown = useLobbiesStore((s) => s.startLobbyCountdown);
  const [selectedTier, setSelectedTier] = useState<Tier>('Easy');
  const [seats, setSeats] = useState<number>(8);
  const [stakeTon, setStakeTon] = useState<number>(1);
  const [openWinner, setOpenWinner] = useState<boolean>(false);
  const [activeWinner, setActiveWinner] = useState<Participant | undefined>();

  const isMobile = useBreakpointValue({ base: true, md: false });

  const handleCreate = () => {
    const creatorId = nanoid();
    const lobby = createLobby({ tier: selectedTier, stakeTon, seats, creatorId });
    // creator auto-joins
    joinLobby(lobby.id, { id: creatorId, nickname: 'You', avatarUrl: undefined, wallet: undefined });
  };

  const handleJoin = (lobby: Lobby) => {
    const id = nanoid();
    const p: Participant = { id, nickname: `P${id.slice(0, 4)}`, joinedAt: new Date().toISOString() };
    joinLobby(lobby.id, p);
  };

  // watch for finished lobbies to show modal
  React.useEffect(() => {
    const finished = lobbies.find((l) => l.status === 'FINISHED' && l.winnerId);
    if (finished) {
      const winner = finished.participants.find((p) => p.id === finished.winnerId);
      setActiveWinner(winner);
      setOpenWinner(true);
    }
  }, [lobbies]);

  return (
    <VStack spacing={6} align="stretch" w="full" maxW="1200px" mx="auto" px={4}>
      <HStack justify="space-between" align="center">
        <Heading size="md" color="white">Active Lobbies</Heading>
        <HStack spacing={3}>
          <Select value={selectedTier} onChange={(e) => setSelectedTier(e.target.value as Tier)} w="140px" bg="rgba(255,255,255,0.03)">
            {tierOptions.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
          <NumberInput value={seats} min={5} max={30} onChange={(_, v) => setSeats(v)}>
            <NumberInputField bg="rgba(255,255,255,0.03)" w="90px" />
          </NumberInput>
          <NumberInput value={stakeTon} min={0.1} step={0.1} onChange={(_, v) => setStakeTon(v)}>
            <NumberInputField bg="rgba(255,255,255,0.03)" w="90px" />
          </NumberInput>
          <Button colorScheme="teal" onClick={handleCreate}>Create</Button>
        </HStack>
      </HStack>

      <VStack spacing={4} align="stretch">
        {lobbies.length === 0 && <Text color="gray.300">Нет активных лобби — создайте первое</Text>}
        {lobbies.map((lobby) => (
          <MotionCard
            key={lobby.id}
            bg="linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))"
            borderRadius="md"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.15 }}
            _hover={{ boxShadow: '0 8px 32px rgba(124,58,237,0.12)' }}
          >
            <CardHeader display="flex" justifyContent="space-between" alignItems="center">
              <Heading size="sm">{lobby.tier} — {lobby.stakeTon} TON</Heading>
              <HStack>
                <Text color="gray.300">{lobby.participants.length}/{lobby.seats}</Text>
                <Tooltip label={lobby.status}>
                  <Box px={2} py={1} borderRadius="md" bg={lobby.status === 'OPEN' ? 'green.600' : 'orange.600'} color="white" fontSize="xs">
                    {lobby.status}
                  </Box>
                </Tooltip>
              </HStack>
            </CardHeader>

            <CardBody display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
              <HStack spacing={3}>
                {lobby.participants.map((p) => (
                  <Avatar key={p.id} name={p.nickname} size={isMobile ? 'sm' : 'md'} src={p.avatarUrl} />
                ))}
                {/* placeholder seats */}
                {Array.from({ length: lobby.seats - lobby.participants.length }).slice(0, 6).map((_, i) => (
                  <Avatar key={i} name={`empty-${i}`} size={isMobile ? 'sm' : 'md'} bg="rgba(255,255,255,0.03)" />
                ))}
              </HStack>

              <HStack>
                <Button size="sm" variant="ghost" onClick={() => handleJoin(lobby)}>Join</Button>
                <Button size="sm" colorScheme="purple" onClick={() => startLobbyCountdown(lobby.id, 10)}>Start</Button>
                <Text color="gray.400" fontSize="sm">
                  {lobby.countdownSec ? `Starts in ${lobby.countdownSec}s` : ''}
                </Text>
              </HStack>
            </CardBody>
          </MotionCard>
        ))}
      </VStack>

      <WinnerModal
        isOpen={openWinner}
        onClose={() => setOpenWinner(false)}
        winner={activeWinner}
        onStay={() => setOpenWinner(false)}
        onLeave={() => {
          setOpenWinner(false);
          // optional: remove finished lobbies
        }}
      />
    </VStack>
  );
};

export default LobbySystem;
