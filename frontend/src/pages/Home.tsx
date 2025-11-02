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
import { TonConnectButton, useTonWallet, useTonConnectUI } from '@tonconnect/ui-react';
import GlassContainer from '../components/GlassContainer';
import { useAppUserId } from '../hooks/useAppUserId';
import { useTranslation } from '../LanguageContext';
import CosmicBackground from '../components/CosmicBackground';
import TonWalletControls from '../components/wallet/TonWalletControls';

type Stats = { totalRounds: number; winRate: number; winnings: number; last24h: number };

export default function Home() {
  const { t } = useTranslation();
  const userId = useAppUserId();
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();
  const toast = useToast();

  // Real stats from backend
  const [stats, setStats] = useState<Stats | null>(null);
  useEffect(() => {
    const backend = (import.meta as any).env.VITE_BACKEND_URL || '';
    if (!userId) return;
    (async () => {
      try {
        const r = await fetch(`${String(backend).replace(/\/$/, '')}/api/users/${userId}/stats`);
        if (!r.ok) throw new Error(`stats ${r.status}`);
        const data = await r.json();
        setStats(data);
      } catch (e) {
        console.error('Stats fetch failed', e);
        setStats({ totalRounds: 0, winRate: 0, winnings: 0, last24h: 0 });
      }
    })();
  }, [userId]);

  // Upsert user and wallet lifecycle
  useEffect(() => {
    const backend = (import.meta as any).env.VITE_BACKEND_URL || '';
    if (!userId) return;
    const appId = userId;
    const addr = wallet?.account?.address;
    (async () => {
      try {
        const body: any = { appId, action: addr ? 'connect' : 'disconnect' };
        if (addr) body.walletAddress = addr;
        await fetch(`${String(backend).replace(/\/$/, '')}/api/users/upsert`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
        });
      } catch (e) {
        // ignore
      }
    })();
  }, [userId, wallet?.account?.address]);

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
          {t('general.home')} {wallet?.account?.address ? '' : t('general.notConnected')}
        </Text>
        {/* Wallet status */}
        <Box mb={4}>
          {wallet?.account?.address ? (
            <HStack>
              <Text fontSize="sm" color="ton.glow">
                {wallet.account.address.slice(0, 6)}...{wallet.account.address.slice(-4)}
              </Text>
              <Button size="xs" variant="outline" onClick={() => tonConnectUI.disconnect()}>
                {t('general.disconnect') || 'Отключить'}
              </Button>
            </HStack>
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
            <Heading size="lg">{stats?.totalRounds ?? 0}</Heading>
          </Box>
          <Box>
            <Text fontSize="xs" color="ton.secondaryText" mb={1}>
              {t('home.winRate')}
            </Text>
            <Heading size="lg">{(stats?.winRate ?? 0).toFixed(1)}%</Heading>
          </Box>
          <Box>
            <Text fontSize="xs" color="ton.secondaryText" mb={1}>
              {t('home.winnings')} (TON)
            </Text>
            <Heading size="lg">{(stats?.winnings ?? 0).toFixed(2)}</Heading>
          </Box>
          <Box>
            <Text fontSize="xs" color="ton.secondaryText" mb={1}>
              {t('home.last24h')}
            </Text>
            <Heading size="lg">{(stats?.last24h ?? 0).toFixed(2)}</Heading>
          </Box>
        </SimpleGrid>
      </GlassContainer>
    </VStack>
  );
}

