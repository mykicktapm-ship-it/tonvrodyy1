import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Heading,
  SimpleGrid,
  Text,
  VStack,
  HStack,
  useToast,
} from '@chakra-ui/react';
import { TonConnectButton, useTonWallet } from '@tonconnect/ui-react';
import GlassContainer from '../components/GlassContainer';
import { useAppUserId } from '../hooks/useAppUserId';
import { useTranslation } from '../LanguageContext';
import CosmicBackground from '../components/CosmicBackground';
import TonWalletControls from '../components/wallet/TonWalletControls';

// Generate random stats or placeholder; in production these would come from API
function generateStats() {
  return {
    totalRounds: Math.floor(Math.random() * 1000),
    winRate: (Math.random() * 100).toFixed(1) + '%',
    winnings: (Math.random() * 50).toFixed(2),
    last24h: (Math.random() * 10).toFixed(2),
  };
}

export default function Home() {
  const { t } = useTranslation();
  const userId = useAppUserId();
  const wallet = useTonWallet();
  const toast = useToast();

  // Fake stats with update interval
  const [stats, setStats] = useState(generateStats());
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(generateStats());
    }, 12000); // update every 12 seconds
    return () => clearInterval(interval);
  }, []);

  // Telegram user info
  const telegramUser = useMemo(() => {
    try {
      return (window as any).Telegram?.WebApp?.initDataUnsafe?.user;
    } catch (e) {
      return undefined;
    }
  }, []);

  const displayName = telegramUser?.first_name ? `${telegramUser.first_name} ${telegramUser.last_name ?? ''}` : 'Guest';
  const avatarUrl = telegramUser?.photo_url;

  return (
    <VStack spacing={6} align="stretch" pt={20} pb={24} px={4} position="relative">
      {/* Cosmic background behind profile and stats */}
      <CosmicBackground />
      {/* Profile card */}
      <GlassContainer>
        <HStack spacing={4} align="center" mb={4}>
          <Box>
            <img
              src={avatarUrl ?? '/public/favicon.svg'}
              alt="avatar"
              style={{ width: '64px', height: '64px', borderRadius: '50%' }}
            />
          </Box>
          <Box>
            <Heading size="md">{displayName}</Heading>
            {userId && (
              <Text fontSize="xs" color="ton.secondaryText">
                {userId}
              </Text>
            )}
          </Box>
        </HStack>
        <Text fontSize="sm" mb={2}>
          {t('general.home')} {t('general.notConnected')}
        </Text>
        {/* Wallet status */}
        <Box mb={4}>
          {wallet?.account?.address ? (
            <Text fontSize="sm" color="ton.glow">
              {wallet.account.address.slice(0, 6)}…{wallet.account.address.slice(-4)}
            </Text>
          ) : (
            <TonConnectButton />
          )}
        </Box>
        {/* Action buttons */}
        <HStack spacing={4} mb={4} wrap="wrap">
          <TonWalletControls />
        </HStack>
      </GlassContainer>
      {/* Stats */}
      <GlassContainer>
        <Heading size="md" mb={4}>
          {t('home.stats')}
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <Box>
            <Text fontSize="xs" color="ton.secondaryText" mb={1}>
              {t('home.totalRounds')}
            </Text>
            <Heading size="lg">{stats.totalRounds}</Heading>
          </Box>
          <Box>
            <Text fontSize="xs" color="ton.secondaryText" mb={1}>
              {t('home.winRate')}
            </Text>
            <Heading size="lg">{stats.winRate}</Heading>
          </Box>
          <Box>
            <Text fontSize="xs" color="ton.secondaryText" mb={1}>
              {t('home.winnings')} (TON)
            </Text>
            <Heading size="lg">{stats.winnings}</Heading>
          </Box>
          <Box>
            <Text fontSize="xs" color="ton.secondaryText" mb={1}>
              {t('home.last24h')}
            </Text>
            <Heading size="lg">{stats.last24h}</Heading>
          </Box>
        </SimpleGrid>
      </GlassContainer>
    </VStack>
  );
}
