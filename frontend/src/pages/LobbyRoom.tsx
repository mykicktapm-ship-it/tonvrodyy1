import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Box, Button, Heading, HStack, Stack, Text, useToast } from '@chakra-ui/react';
import GlassContainer from '../components/GlassContainer';
import { useLobbies } from '../store/lobbies';
import { useAppUserId } from '../hooks/useAppUserId';
import { useTranslation } from '../LanguageContext';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import LobbySlots from '../components/lobby/LobbySlots';

export default function LobbyRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useTranslation();
  const { current, fetchOne, join, leave, tick } = useLobbies();
  const [searchParams] = useSearchParams();
  const userId = useAppUserId();
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();
  const tgUser = useMemo(() => {
    try { return (window as any).Telegram?.WebApp?.initDataUnsafe?.user; } catch { return undefined; }
  }, []);

  useEffect(() => {
    if (id) fetchOne(id);
  }, [id, fetchOne]);

  // Poll lobby state periodically (5s)
  useEffect(() => {
    if (!id) return;
    const h = setInterval(() => fetchOne(id), 5000);
    return () => clearInterval(h);
  }, [id, fetchOne]);

  // Drive countdown in demo via tick every second when present
  useEffect(() => {
    if (!id) return;
    if (current?.countdownSec === undefined) return;
    const h = setInterval(() => tick(id), 1000);
    return () => clearInterval(h);
  }, [id, current?.countdownSec, tick]);

  const isMember = !!current?.participants.some((p) => p.id === userId);

  // Auto-join via ?pwd= for private lobbies
  useEffect(() => {
    const pwd = searchParams.get('pwd');
    if (id && pwd && !isMember && userId) {
      const name = tgUser?.first_name ? `${tgUser.first_name} ${tgUser.last_name ?? ''}` : 'Guest';
      join(id, { id: userId, name }, pwd).catch(() => {});
    }
  }, [searchParams, id, isMember, userId, join, tgUser]);

  const handleJoin = async () => {
    if (!id || !userId) return;
    const name = tgUser?.first_name ? `${tgUser.first_name} ${tgUser.last_name ?? ''}` : 'Guest';
    await join(id, { id: userId, name });
  };
  const handleBet = async () => {
    if (!current) return;
    if (!wallet) { toast({ title: t('general.connectWallet'), status: 'warning' }); return; }
    const treasury = import.meta.env.VITE_TREASURY_ADDRESS as string | undefined;
    if (!treasury) { toast({ title: 'No treasury address configured', status: 'error' }); return; }
    try {
      const amountNano = BigInt(Math.floor(current.stakeTon * 1e9));
      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 300,
        messages: [{ address: treasury, amount: amountNano.toString() }],
      });
      toast({ title: 'Bet submitted', status: 'success' });
    } catch (e: any) {
      toast({ title: 'Bet failed', description: String(e?.message || e), status: 'error' });
    }
  };
  const handleLeave = async () => {
    if (!id || !userId) return;
    await leave(id, userId);
    toast({ title: 'Left lobby', duration: 1000 });
    navigate('/laboratory');
  };

  const bot = import.meta.env.VITE_BOT_NAME || 'YourBot';
  const backend = import.meta.env.VITE_BACKEND_URL || '';
  const copyInvite = async () => {
    try {
      if (!id) return;
      const r = await fetch(`${backend.replace(/\/$/, '')}/api/invites/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lobbyId: id }),
      });
      if (!r.ok) throw new Error(`Invite create failed: ${r.status}`);
      const { token } = await r.json();
      const link = `https://t.me/${bot}?start=invite_${token}`;
      await navigator.clipboard.writeText(link);
      toast({ title: t('lobby.copyLink'), status: 'success' });
    } catch (e: any) {
      toast({ title: 'Invite failed', description: String(e?.message || e), status: 'error' });
    }
  };

  if (!current) return (
    <Stack pt={20} px={4}>
      <GlassContainer>
        <Text>{t('general.loading')}</Text>
      </GlassContainer>
    </Stack>
  );

  return (
    <Stack spacing={4} pt={20} pb={24} px={4}>
      <GlassContainer>
        <Heading size="md">{t('lobby.title')} {current.id}</Heading>
        <Text fontSize="sm" color="ton.secondaryText">{t('lobby.seats')}: {current.participants.length}/{current.seats}</Text>
        <Text fontSize="sm" color="ton.secondaryText">{t('lobby.stake')}: {current.stakeTon} TON</Text>
        <Text fontSize="sm" color="ton.secondaryText">{t('lobby.pool')}: {current.poolTon} TON</Text>
        <HStack mt={3}>
          {!isMember ? (
            <Button colorScheme="blue" onClick={handleJoin}>{t('lobby.join')}</Button>
          ) : (
            <>
              <Button colorScheme="blue" onClick={handleBet}>{t('lobby.bet')}</Button>
              <Button variant="outline" onClick={handleLeave}>{t('lobby.leave')}</Button>
            </>
          )}
          <Button onClick={copyInvite}>{t('lobby.invite')}</Button>
        </HStack>
      </GlassContainer>
      <GlassContainer>
        <Heading size="sm" mb={3}>Slots</Heading>
        <LobbySlots
          seats={current.seats}
          participants={current.participants}
          status={current.status}
          isMember={isMember}
          onPick={handleJoin}
        />
      </GlassContainer>
      <GlassContainer>
        <Heading size="sm" mb={2}>{t('lobby.participants')}</Heading>
        <Stack>
          {current.participants.map((p) => (
            <Box key={p.id} fontSize="sm">{p.name} <Text as="span" color="ton.secondaryText">({p.id.slice(0,8)})</Text></Box>
          ))}
        </Stack>
      </GlassContainer>
    </Stack>
  );
}
