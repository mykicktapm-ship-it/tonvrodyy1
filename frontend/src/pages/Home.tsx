import React from 'react';
import { Heading, Text, VStack } from '@chakra-ui/react';
import { TonConnectButton } from '@tonconnect/ui-react';
import GlassContainer from '../components/GlassContainer';
import { useUserId } from '../hooks/useUserId';
import { useReferral } from '../hooks/useReferral';

export default function Home() {
  const userId = useUserId();
  const referrer = useReferral();

  return (
    <VStack spacing={6} align="stretch" pt={16} pb={20} px={4} position="relative">
      <GlassContainer>
        <Heading size="lg" mb={2}>
          Welcome
        </Heading>
        <Text fontSize="md" mb={4}>
          This Mini App demonstrates integration with TON Connect and Telegram.
        </Text>
        {userId && (
          <Text fontSize="sm">
            Your User&nbsp;ID:&nbsp;
            <b>{userId}</b>
          </Text>
        )}
        {referrer && (
          <Text fontSize="sm" color="gray.400">
            Referred by: {referrer}
          </Text>
        )}
        <Text mt={4}>Connect your TON wallet below:</Text>
        <TonConnectButton />
      </GlassContainer>
    </VStack>
  );
}