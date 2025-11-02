import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  IconButton,
  Input,
  SimpleGrid,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
  useToast,
} from '@chakra-ui/react';
import CosmicBackground from '../components/CosmicBackground';
import { useNavigate } from 'react-router-dom';
import DigitalPlanet from '../components/DigitalPlanet';
import { motion } from 'framer-motion';
import { useEnhancedFx } from '../context/EnhancedFxContext';
import GlassContainer from '../components/GlassContainer';
import LobbyCard from '../components/lobby/LobbyCard';
import LobbyCreateForm from '../components/lobby/LobbyCreateForm';
import { useTranslation } from '../LanguageContext';
import { useLobbies } from '../store/lobbies';
import { useAppUserId } from '../hooks/useAppUserId';

// Using lobby store; local interface removed

export default function Laboratory() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isEnhanced } = useEnhancedFx();
  // Trigger for wave distortion around the planet when interacted
  const [waveTrigger, setWaveTrigger] = useState(false);
  const handlePlanetInteract = () => {
    if (!isEnhanced) return;
    setWaveTrigger(true);
    // Reset after animation completes
    setTimeout(() => setWaveTrigger(false), 800);
  };
  // Inline wave effect component
  const WaveEffect = () => (
    <motion.div
      initial={{ opacity: 0.4, scale: 0 }}
      animate={{ opacity: 0, scale: 2 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,152,234,0.5) 0%, rgba(0,152,234,0) 70%)',
      }}
    />
  );
  const toast = useToast();
  const { items, fetchAll, create, join } = useLobbies();
  const userId = useAppUserId();
  const tgUser = useMemo(() => {
    try { return (window as any).Telegram?.WebApp?.initDataUnsafe?.user; } catch { return undefined; }
  }, []);
  useEffect(() => { fetchAll(); }, [fetchAll]);
  // Tab state: 0=All,1=Easy,2=Medium,3=Hot
  const [tabIndex, setTabIndex] = useState(0);
  const [search, setSearch] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const pwModal = useDisclosure();
  const [pendingLobbyId, setPendingLobbyId] = useState<string | null>(null);
  const [joinPassword, setJoinPassword] = useState('');
  // Form state for create lobby
  const [newTier, setNewTier] = useState<'Easy' | 'Medium' | 'Hot'>('Easy');
  const [newSeats, setNewSeats] = useState(10);
  const [newStake, setNewStake] = useState(0.5);
  const [isPrivate, setIsPrivate] = useState(false);

  // Filter lobbies by tab and search
  const filtered = useMemo(() => {
    return items.filter((l) => {
      const matchTab =
        tabIndex === 0 || (tabIndex === 1 && l.tier === 'Easy') || (tabIndex === 2 && l.tier === 'Medium') || (tabIndex === 3 && l.tier === 'Hot');
      const matchSearch = l.id.toLowerCase().includes(search.toLowerCase());
      return matchTab && matchSearch;
    });
  }, [items, tabIndex, search]);

  const handleCreateLobby = async () => {
    if (!userId) { toast({ title: 'No user ID', status: 'error' }); return; }
    await create({ tier: newTier, seats: newSeats, stakeTon: newStake, creatorId: userId, isPrivate, password: isPrivate ? joinPassword : undefined });
    toast({ title: 'Lobby created', status: 'success', duration: 1500, isClosable: true });
    onClose();
  };

  const handleJoin = async (id: string) => {
    if (!userId) { toast({ title: 'No user ID', status: 'error' }); return; }
    const name = tgUser?.first_name ? `${tgUser.first_name} ${tgUser.last_name ?? ''}` : 'Guest';
    const lobby = items.find(l => l.id === id);
    try {
      if (lobby?.isPrivate) {
        setPendingLobbyId(id);
        setJoinPassword('');
        pwModal.onOpen();
        return;
      }
      await join(id, { id: userId, name });
      toast({ title: `Joined ${id}`, duration: 1000, isClosable: true });
    } catch (e: any) {
      toast({ title: 'Join failed', description: String(e?.message || e), status: 'error' });
    }
  };

  const confirmJoinWithPassword = async () => {
    if (!pendingLobbyId || !userId) return;
    const name = tgUser?.first_name ? `${tgUser.first_name} ${tgUser.last_name ?? ''}` : 'Guest';
    try {
      await join(pendingLobbyId, { id: userId, name }, joinPassword);
      toast({ title: `Joined ${pendingLobbyId}`, duration: 1000, isClosable: true });
      pwModal.onClose();
      setPendingLobbyId(null);
      setJoinPassword('');
    } catch (e: any) {
      toast({ title: 'Invalid password', status: 'error' });
    }
  };

  return (
    <VStack spacing={6} align="stretch" pt={20} pb={24} px={4} position="relative">
      {/* Cosmic background with star layers */}
      <CosmicBackground />
      {/* Digital planet container */}
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        w="100%"
        h={{ base: '260px', md: '320px' }}
        mb={4}
        position="relative"
      >
        <Box
          w={{ base: '260px', md: '320px' }}
          h={{ base: '260px', md: '320px' }}
          borderRadius="full"
          overflow="hidden"
          bg="rgba(0,0,0,0.2)"
          boxShadow="0 0 40px rgba(0,150,255,0.3)"
          position="relative"
          onClick={handlePlanetInteract}
        >
          <DigitalPlanet />
          {/* Wave distortion overlay */}
          {isEnhanced && waveTrigger && <WaveEffect />}
        </Box>
      </Box>
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
            <LobbyCard key={lobby.id} lobby={lobby} onJoin={() => handleJoin(lobby.id)} onView={() => navigate(`/lobby/${lobby.id}`)} />
          ))
        )}
      </SimpleGrid>
      {/* Create lobby button */}
      <Box position="fixed" bottom="80px" right="16px" zIndex={30}>
        <Button colorScheme="blue" borderRadius="full" size="lg" onClick={onOpen}>
          {t('general.createLobby')}
        </Button>
      </Box>
      {/* Create lobby modal */}
      <LobbyCreateForm
        isOpen={isOpen}
        onClose={onClose}
        onCreate={(p) => {
          if (!userId) { toast({ title: 'No user ID', status: 'error' }); return; }
          create({ tier: p.tier, seats: p.seats, stakeTon: p.stakeTon, creatorId: userId, isPrivate: !!p.password, password: p.password })
            .then(() => { toast({ title: 'Lobby created', status: 'success' }); onClose(); })
            .catch((e) => toast({ title: 'Create failed', description: String(e?.message || e), status: 'error' }));
        }}
      />

      {/* Join password modal */}
      <Modal isOpen={pwModal.isOpen} onClose={pwModal.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Enter password</ModalHeader>
          <ModalBody>
            <Input placeholder="Password" type="password" value={joinPassword} onChange={(e) => setJoinPassword(e.target.value)} />
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={pwModal.onClose}>Cancel</Button>
            <Button colorScheme="blue" onClick={confirmJoinWithPassword}>Join</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
}

