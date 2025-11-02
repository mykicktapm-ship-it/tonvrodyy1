import React from 'react';
import { Box, Button, Flex, Heading, HStack, Text } from '@chakra-ui/react';
import GlassContainer from '../GlassContainer';
import { Lobby } from '../../types/lobby';
import { useTranslation } from '../../LanguageContext';

export default function LobbyCard({ lobby, onJoin, onView }: { lobby: Lobby; onJoin: () => void; onView: () => void }) {
  const { t } = useTranslation();
  return (
    <GlassContainer p={4}>
      <Flex justify="space-between" mb={2}>
        <Heading size="md">{lobby.id}</Heading>
        <Text fontSize="sm" color="ton.secondaryText">{lobby.tier}</Text>
      </Flex>
      <Text fontSize="xs" color="ton.secondaryText">
        {lobby.participants.length}/{lobby.seats} participants
      </Text>
      <Text fontSize="xs" color="ton.secondaryText">Stake: {lobby.stakeTon} TON</Text>
      <Text fontSize="xs" color="ton.secondaryText">Pool: {lobby.poolTon} TON</Text>
      <Text fontSize="xs" color="ton.secondaryText">Created: {new Date(lobby.createdAt).toLocaleString()}</Text>
      {typeof lobby.countdownSec === 'number' && (
        <Box w="100%" h="4px" bg="rgba(255,255,255,0.1)" mt={2} mb={2} borderRadius="sm">
          <Box w={`${Math.max(0, Math.min(100, (lobby.countdownSec / 10) * 100))}%`} h="100%" bg="ton.accent" borderRadius="sm" />
        </Box>
      )}
      <HStack justify="space-between">
        <Button size="xs" colorScheme="blue" onClick={onJoin}>{t('general.join')}</Button>
        <Button size="xs" variant="ghost" onClick={onView}>{t('general.view')}</Button>
      </HStack>
    </GlassContainer>
  );
}

