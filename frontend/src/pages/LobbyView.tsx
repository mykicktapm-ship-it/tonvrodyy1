import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Avatar,
  Badge,
  Button,
  SimpleGrid,
  Progress,
  useToast,
} from '@chakra-ui/react';
import { useLobbies } from '../store/lobbies';
import { useAppUserId } from '../hooks/useAppUserId';

/**
 * Detailed view for a single lobby. Displays participants, lobby
 * metadata, join/leave controls and status messages. Countdown and
 * winner logic are driven by the lobby store.
 */
export default function LobbyView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const userId = useAppUserId();
  const { current, fetchOne, join, leave, tick } = useLobbies();

  // Fetch lobby details when the component mounts or id changes
  useEffect(() => {
    if (id) {
      fetchOne(id);
    }
  }, [id, fetchOne]);

  // Navigate back if lobby is closed
  useEffect(() => {
    if (current && current.status === 'CLOSED') {
      navigate('/laboratory');
    }
  }, [current?.status, navigate]);

  // Poll countdown when applicable
  useEffect(() => {
    if (!current || !current.countdownSec || !id) return;
    const interval = setInterval(() => {
      tick(id);
    }, 1000);
    return () => clearInterval(interval);
  }, [current?.countdownSec, id, tick]);

  // Early return when lobby not loaded
  if (!current || !id) {
    return (
      <Box p={6} pt={24} textAlign="center">
        <Text>Загрузка лобби...</Text>
      </Box>
    );
  }

  // Determine if the current user is already in the lobby
  const isMember = !!current.participants.find((p) => p.id === userId);

  // Handlers for join and leave actions
  const handleJoin = async () => {
    if (!userId) {
      toast({ title: 'Неизвестный пользователь', status: 'error', duration: 2000, isClosable: true });
      return;
    }
    try {
      await join(current.id, {
        id: userId,
        nickname: current.participants.length === 0 ? 'Host' : 'Guest',
        joinedAt: new Date().toISOString(),
      });
      toast({ title: 'Вы присоединились к лобби', status: 'success', duration: 2000, isClosable: true });
    } catch (err) {
      toast({ title: 'Не удалось присоединиться', status: 'error', duration: 3000, isClosable: true });
    }
  };

  const handleLeave = async () => {
    if (!userId) return;
    try {
      await leave(current.id, userId);
      toast({ title: 'Вы покинули лобби', status: 'info', duration: 2000, isClosable: true });
    } catch (err) {
      toast({ title: 'Не удалось выйти', status: 'error', duration: 3000, isClosable: true });
    }
  };

  // Compute progress percentage
  const occupied = current.participants.length;
  const progress = Math.min(100, (occupied / current.seats) * 100);

  return (
    <VStack spacing={6} align="stretch" pt={20} pb={24} px={4} position="relative">
      {/* Lobby header */}
      <Box className="glass" p={4} borderRadius="lg">
        <HStack justify="space-between" align="flex-start">
          <HStack spacing={3} align="center">
            <Badge colorScheme="blue" textTransform="capitalize">
              {current.tier}
            </Badge>
            <Heading size="lg">Лобби {current.id}</Heading>
          </HStack>
          <VStack align="flex-end" spacing={1}>
            <Badge variant="solid" colorScheme={current.status === 'OPEN' ? 'gray' : current.status === 'FULL' ? 'yellow' : current.status === 'RUNNING' ? 'purple' : current.status === 'FINISHED' ? 'green' : 'red'}>
              {current.status}
            </Badge>
            {current.status === 'FULL' && current.countdownSec !== undefined && (
              <Badge colorScheme="pink">Старт через {current.countdownSec}s</Badge>
            )}
            {current.status === 'FINISHED' && current.winnerId && (
              <Badge colorScheme="green">Победитель: {current.winnerId.slice(0, 6)}…</Badge>
            )}
          </VStack>
        </HStack>
        <Text mt={2} opacity={0.8}>
          Ставка: {current.stakeTon} TON • Мест: {current.seats} • Пул: {current.seats * current.stakeTon} TON
        </Text>
        {/* Progress bar */}
        <Progress mt={3} value={progress} height="6px" borderRadius="full" bg="rgba(255,255,255,0.1)" colorScheme="blue" />
        {/* Join/Leave controls */}
        <HStack justify="flex-end" mt={3} spacing={3}>
          {!isMember && current.status === 'OPEN' && (
            <Button size="sm" colorScheme="blue" onClick={handleJoin}>
              Присоединиться
            </Button>
          )}
          {isMember && current.status !== 'FINISHED' && (
            <Button size="sm" variant="outline" onClick={handleLeave}>
              Выйти
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => navigate('/laboratory')}>Назад</Button>
        </HStack>
      </Box>

      {/* Participants grid */}
      <Box className="glass" p={4} borderRadius="lg">
        <SimpleGrid columns={{ base: 2, sm: 3, md: 6, lg: 10 }} spacing={3}>
          {Array.from({ length: current.seats }).map((_, idx) => {
            const p = current.participants[idx];
            return (
              <VStack key={idx} spacing={1} py={2} borderRadius="md" bg="rgba(255,255,255,0.04)">
                {p ? (
                  <>
                    <Avatar size="sm" name={p.nickname} src={p.avatarUrl} />
                    <Text fontSize="xs" noOfLines={1}>{p.nickname || p.id.slice(0, 6)}</Text>
                    <Badge colorScheme="blue">занято</Badge>
                  </>
                ) : (
                  <>
                    <Avatar size="sm" />
                    <Text fontSize="xs" opacity={0.6}>свободно</Text>
                    <Badge variant="subtle">ждёт</Badge>
                  </>
                )}
              </VStack>
            );
          })}
        </SimpleGrid>
      </Box>

      {/* Status section */}
      <Box className="glass" p={4} borderRadius="lg">
        {current.status === 'OPEN' && <Text>Ожидание участников…</Text>}
        {current.status === 'FULL' && <Text>Все места заняты. Идёт отсчёт…</Text>}
        {current.status === 'RUNNING' && <Text>Определяем победителя…</Text>}
        {current.status === 'FINISHED' && current.winnerId && <Text>Победитель — {current.winnerId.slice(0, 6)}…</Text>}
        {current.status === 'CLOSED' && <Text>Лобби закрыто.</Text>}
      </Box>
    </VStack>
  );
}