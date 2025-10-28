import React, { useMemo, useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Input,
  SimpleGrid,
  Tab,
  TabList,
  Tabs,
  Text,
  VStack,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import PlasmaScene from '../components/PlasmaScene';
import GlassContainer from '../components/GlassContainer';
import { useTranslation } from '../LanguageContext';
import { useAppUserId } from '../hooks/useAppUserId';
import { useLobbies } from '../store/lobbies';
import { useNavigate } from 'react-router-dom';
import CreateLobbyModal from '../components/CreateLobbyModal';


export default function Laboratory() {
  const { t } = useTranslation();
  const toast = useToast();
  const navigate = useNavigate();
  const userId = useAppUserId();
  const { items: lobbies, fetchAll, join, create: createLobby } = useLobbies();
  // Tab state: 0=All,1=Easy,2=Medium,3=Hot
  const [tabIndex, setTabIndex] = useState(0);
  const [search, setSearch] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Fetch lobbies on mount
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Filter lobbies by tab and search
  const filtered = useMemo(() => {
    return lobbies.filter((l) => {
      const matchTab =
        tabIndex === 0 || (tabIndex === 1 && l.tier === 'Easy') || (tabIndex === 2 && l.tier === 'Medium') || (tabIndex === 3 && l.tier === 'Hot');
      const matchSearch = l.id.toLowerCase().includes(search.toLowerCase());
      return matchTab && matchSearch;
    });
  }, [lobbies, tabIndex, search]);

  // Join lobby handler
  const handleJoinLobby = async (id: string) => {
    if (!userId) {
      toast({ title: 'Неизвестный пользователь', status: 'error', duration: 2000, isClosable: true });
      return;
    }
    await join(id, { id: userId, nickname: 'Guest', joinedAt: new Date().toISOString() });
    toast({ title: 'Вы присоединились', status: 'success', duration: 1500, isClosable: true });
  };

  // View lobby handler
  const handleViewLobby = (id: string) => {
    navigate(`/lobby/${id}`);
  };

  return (
    <VStack spacing={6} align="stretch" pt={20} pb={24} px={4} position="relative">
      <PlasmaScene />
      {/* Metrics */}
      <GlassContainer>
        <HStack spacing={8} flexWrap="wrap">
          <Box>
            <Text fontSize="xs" color="ton.secondaryText" mb={1}>
              {t('laboratory.metricsRounds')}
            </Text>
            <Heading size="lg">103</Heading>
          </Box>
          <Box>
            <Text fontSize="xs" color="ton.secondaryText" mb={1}>
              {t('laboratory.metricsOpen')}
            </Text>
            <Heading size="lg">7</Heading>
          </Box>
        </HStack>
      </GlassContainer>
      {/* Filters and search */}
      <GlassContainer>
        <Tabs index={tabIndex} onChange={setTabIndex} variant="unstyled">
          <TabList mb={4} justifyContent="space-around">
            <Tab _selected={{ color: 'ton.primary', fontWeight: 'bold' }}>{t('general.all')}</Tab>
            <Tab _selected={{ color: 'ton.primary', fontWeight: 'bold' }}>{t('general.easy')}</Tab>
            <Tab _selected={{ color: 'ton.primary', fontWeight: 'bold' }}>{t('general.medium')}</Tab>
            <Tab _selected={{ color: 'ton.primary', fontWeight: 'bold' }}>{t('general.hot')}</Tab>
          </TabList>
        </Tabs>
        <Input
          placeholder={t('laboratory.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          mb={4}
          bg="rgba(255,255,255,0.05)"
          border="1px solid rgba(255,255,255,0.18)"
          _placeholder={{ color: 'ton.secondaryText' }}
        />
      </GlassContainer>
      {/* Lobby grid */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
        {filtered.length === 0 ? (
          <GlassContainer>
            <Text fontSize="sm">{t('laboratory.noLobbies')}</Text>
          </GlassContainer>
        ) : (
          filtered.map((lobby) => (
            <GlassContainer key={lobby.id} p={4}>
              <Flex justify="space-between" mb={2}>
                <Heading size="md">{lobby.id}</Heading>
                <Text fontSize="sm" color="ton.secondaryText">
                  {lobby.tier}
                </Text>
              </Flex>
              <Text fontSize="xs" color="ton.secondaryText">
                {lobby.participants.length}/{lobby.seats} participants
              </Text>
              <Text fontSize="xs" color="ton.secondaryText">
                Stake: {lobby.stakeTon} TON
              </Text>
              <Text fontSize="xs" color="ton.secondaryText">
                Pool: {(lobby.seats * lobby.stakeTon).toFixed(2)} TON
              </Text>
              <Text fontSize="xs" color="ton.secondaryText">
                Created: {new Date(lobby.createdAt).toLocaleString()}
              </Text>
              {/* progress bar */}
              <Box w="100%" h="4px" bg="rgba(255,255,255,0.1)" mt={2} mb={2} borderRadius="sm">
                <Box w={`${(lobby.participants.length / lobby.seats) * 100}%`} h="100%" bg="ton.accent" borderRadius="sm" />
              </Box>
              <HStack justify="space-between">
                <Button
                  size="xs"
                  colorScheme="blue"
                  onClick={() => handleJoinLobby(lobby.id)}
                  isDisabled={lobby.status !== 'OPEN' || lobby.participants.length >= lobby.seats}
                >
                  {t('general.join')}
                </Button>
                <Button size="xs" variant="ghost" onClick={() => handleViewLobby(lobby.id)}>
                  {t('general.view')}
                </Button>
              </HStack>
            </GlassContainer>
          ))
        )}
      </SimpleGrid>
      {/* Create lobby button */}
      <Box position="fixed" bottom="80px" right="16px" zIndex={30}>
        <Button colorScheme="blue" borderRadius="full" size="lg" onClick={onOpen}>
          {t('general.createLobby')}
        </Button>
      </Box>
      {/* Create lobby modal component */}
      <CreateLobbyModal isOpen={isOpen} onClose={onClose} />
    </VStack>
  );
}