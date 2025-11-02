import React from 'react';
import { Box, SimpleGrid, Text } from '@chakra-ui/react';
import { Participant, LobbyStatus } from '../../types/lobby';
import { useTranslation } from '../../LanguageContext';

export default function LobbySlots({ seats, participants, status, isMember, onPick }: { seats: number; participants: Participant[]; status: LobbyStatus; isMember: boolean; onPick: () => void }) {
  const { t } = useTranslation();
  return (
    <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} spacing={3}>
      {Array.from({ length: seats }).map((_, idx) => {
        const occupant = participants[idx];
        const mine = occupant && participants[idx]?.id && occupant.id === (participants.find(p => p.id === occupant?.id)?.id);
        const canJoin = !occupant && !isMember && status === 'OPEN';
        return (
          <Box
            key={idx}
            p={3}
            borderRadius="md"
            border="1px solid rgba(255,255,255,0.2)"
            bg={mine ? 'rgba(0,152,234,0.25)' : occupant ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.2)'}
            cursor={canJoin ? 'pointer' : 'default'}
            _hover={canJoin ? { transform: 'scale(1.02)' } : undefined}
            transition="all 0.15s ease"
            onClick={() => { if (canJoin) onPick(); }}
          >
            <Text fontSize="xs" color="ton.secondaryText">#{idx + 1}</Text>
            <Text fontSize="sm" mt={1}>
              {occupant ? occupant.name : t('general.join')}
            </Text>
          </Box>
        );
      })}
    </SimpleGrid>
  );
}

