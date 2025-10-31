import React, { useMemo } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  IconButton,
  SimpleGrid,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  VStack,
  useToast,
} from '@chakra-ui/react';
import GlassContainer from '../components/GlassContainer';
import { useAppUserId } from '../hooks/useAppUserId';
import { useTranslation } from '../LanguageContext';
import { FaCopy, FaShareAlt } from 'react-icons/fa';
import CosmicBackground from '../components/CosmicBackground';

export default function Earn() {
  const { t } = useTranslation();
  const userId = useAppUserId();
  const toast = useToast();

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

  const referralLink = useMemo(() => {
    if (!userId) return '';
    const url = new URL(window.location.origin);
    url.pathname = '/';
    url.searchParams.set('ref', userId);
    return url.toString();
  }, [userId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast({ title: t('general.copy') + ' OK', status: 'success', duration: 2000, isClosable: true });
    } catch (err) {
      toast({ title: t('general.copy') + ' failed', description: String(err), status: 'error', duration: 2000, isClosable: true });
    }
  };
  const handleShare = async () => {
    if ((navigator as any).share) {
      try {
        await (navigator as any).share({ title: 'Referral link', url: referralLink });
      } catch (e) {
        toast({ title: 'Share canceled', status: 'info', duration: 1500, isClosable: true });
      }
    } else {
      handleCopy();
    }
  };

  // Sample referral summary
  const summary = useMemo(() => ({ count: 8, turnover: 42.5, bonus: 4.2 }), []);
  // Sample referral list
  const referrals = useMemo(
    () => [
      { id: 'u1', name: 'Alice', rounds: 12, turnover: 10.5, date: '2025-10-26' },
      { id: 'u2', name: 'Bob', rounds: 5, turnover: 3.0, date: '2025-10-25' },
      { id: 'u3', name: 'Charlie', rounds: 7, turnover: 4.5, date: '2025-10-24' },
    ],
    []
  );
  // Simple sparkline: compute heights for bars
  const sparkValues = referrals.map((r) => r.turnover);
  const maxValue = Math.max(...sparkValues, 1);

  return (
    <VStack spacing={6} align="stretch" pt={20} pb={24} px={4} position="relative">
      {/* Cosmic background behind referral info */}
      <CosmicBackground />
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
        {userId ? (
          <>
            <Text fontSize="sm" mb={2}>{t('general.referralLink')}:</Text>
            <Box bg="rgba(255,255,255,0.05)" border="1px solid rgba(255,255,255,0.18)" borderRadius="md" p={2} mb={2}>
              <Text fontSize="xs" wordBreak="break-all">{referralLink}</Text>
            </Box>
            <HStack spacing={2} mb={4}>
              <Button leftIcon={<FaCopy />} size="sm" colorScheme="blue" onClick={handleCopy}>
                {t('general.copy')}
              </Button>
              <Button leftIcon={<FaShareAlt />} size="sm" variant="outline" onClick={handleShare}>
                {t('general.share')}
              </Button>
            </HStack>
          </>
        ) : (
          <Text fontSize="sm">{t('general.loading')}</Text>
        )}
      </GlassContainer>
      {/* Summary */}
      <GlassContainer>
        <Heading size="md" mb={3}>{t('earn.referralsSummary')}</Heading>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <Box>
            <Text fontSize="xs" color="ton.secondaryText" mb={1}>{t('general.referrals')}</Text>
            <Heading size="lg">{summary.count}</Heading>
          </Box>
          <Box>
            <Text fontSize="xs" color="ton.secondaryText" mb={1}>{t('general.turnover')} (TON)</Text>
            <Heading size="lg">{summary.turnover}</Heading>
          </Box>
          <Box>
            <Text fontSize="xs" color="ton.secondaryText" mb={1}>{t('general.bonus')} (TON)</Text>
            <Heading size="lg">{summary.bonus}</Heading>
          </Box>
        </SimpleGrid>
        {/* Sparkline */}
        <Box mt={4} h="40px" display="flex" alignItems="flex-end">
          {sparkValues.map((val, idx) => (
            <Box key={idx} flex="1" mx="2px" bg="ton.accent" height={`${(val / maxValue) * 100}%`} />
          ))}
        </Box>
      </GlassContainer>
      {/* Referral list */}
      <GlassContainer overflowX="auto">
        <Heading size="md" mb={3}>{t('earn.referralList')}</Heading>
        <Table size="sm" variant="simple">
          <Thead>
            <Tr>
              <Th>{t('general.referrals')}</Th>
              <Th isNumeric>{t('general.turnover')}</Th>
              <Th isNumeric>Rounds</Th>
              <Th>Date</Th>
            </Tr>
          </Thead>
          <Tbody>
            {referrals.map((r) => (
              <Tr key={r.id}>
                <Td>{r.name}</Td>
                <Td isNumeric>{r.turnover}</Td>
                <Td isNumeric>{r.rounds}</Td>
                <Td>{r.date}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </GlassContainer>
    </VStack>
  );
}