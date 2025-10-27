import React, { useMemo, useState } from 'react';
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
import PlasmaScene from '../components/PlasmaScene';
import GlassContainer from '../components/GlassContainer';
import { useTranslation } from '../LanguageContext';

interface Lobby {
  id: string;
  tier: 'Easy' | 'Medium' | 'Hot';
  participants: number;
  seats: number;
  stake: number;
  pool: number;
  created: string;
  progress: number;
}

export default function Laboratory() {
  const { t } = useTranslation();
  const toast = useToast();
  // Sample lobbies
  const lobbyData: Lobby[] = useMemo(
    () => [
      {
        id: 'E1',
        tier: 'Easy',
        participants: 3,
        seats: 10,
        stake: 0.5,
        pool: 5,
        created: '2m ago',
        progress: 0.3,
      },
      {
        id: 'M1',
        tier: 'Medium',
        participants: 10,
        seats: 20,
        stake: 1,
        pool: 20,
        created: '5m ago',
        progress: 0.5,
      },
      {
        id: 'H1',
        tier: 'Hot',
        participants: 25,
        seats: 30,
        stake: 2.5,
        pool: 75,
        created: '10m ago',
        progress: 0.8,
      },
      {
        id: 'E2',
        tier: 'Easy',
        participants: 7,
        seats: 10,
        stake: 0.5,
        pool: 5,
        created: '8m ago',
        progress: 0.6,
      },
    ],
    []
  );
  // Tab state: 0=All,1=Easy,2=Medium,3=Hot
  const [tabIndex, setTabIndex] = useState(0);
  const [search, setSearch] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  // Form state for create lobby
  const [newTier, setNewTier] = useState<'Easy' | 'Medium' | 'Hot'>('Easy');
  const [newSeats, setNewSeats] = useState(10);
  const [newStake, setNewStake] = useState(0.5);
  const [isPrivate, setIsPrivate] = useState(false);

  // Filter lobbies by tab and search
  const filtered = useMemo(() => {
    return lobbyData.filter((l) => {
      const matchTab =
        tabIndex === 0 || (tabIndex === 1 && l.tier === 'Easy') || (tabIndex === 2 && l.tier === 'Medium') || (tabIndex === 3 && l.tier === 'Hot');
      const matchSearch = l.id.toLowerCase().includes(search.toLowerCase());
      return matchTab && matchSearch;
    });
  }, [lobbyData, tabIndex, search]);

  const handleCreateLobby = () => {
    toast({ title: 'Lobby created (stub)', description: `Tier ${newTier}`, duration: 1500, isClosable: true });
    onClose();
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
                {lobby.participants}/{lobby.seats} participants
              </Text>
              <Text fontSize="xs" color="ton.secondaryText">
                Stake: {lobby.stake} TON
              </Text>
              <Text fontSize="xs" color="ton.secondaryText">
                Pool: {lobby.pool} TON
              </Text>
              <Text fontSize="xs" color="ton.secondaryText">
                Created: {lobby.created}
              </Text>
              {/* progress bar */}
              <Box w="100%" h="4px" bg="rgba(255,255,255,0.1)" mt={2} mb={2} borderRadius="sm">
                <Box w={`${lobby.progress * 100}%`} h="100%" bg="ton.accent" borderRadius="sm" />
              </Box>
              <HStack justify="space-between">
                <Button size="xs" colorScheme="blue" onClick={() => toast({ title: `Join ${lobby.id}`, duration: 1000, isClosable: true })}>
                  {t('general.join')}
                </Button>
                <Button size="xs" variant="ghost" onClick={() => toast({ title: `View ${lobby.id}`, duration: 1000, isClosable: true })}>
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
      {/* Create lobby modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay backdropFilter="blur(6px)" />
        <ModalContent bg="ton.surface" border="1px solid rgba(255,255,255,0.18)">
          <ModalHeader>{t('general.createLobby')}</ModalHeader>
          <ModalBody>
            <Select mb={3} value={newTier} onChange={(e) => setNewTier(e.target.value as any)}>
              <option value="Easy">{t('general.easy')}</option>
              <option value="Medium">{t('general.medium')}</option>
              <option value="Hot">{t('general.hot')}</option>
            </Select>
            <NumberInput mb={3} value={newSeats} min={2} max={30} onChange={(val) => setNewSeats(Number(val))}>
              <NumberInputField placeholder="Seats" />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <NumberInput mb={3} value={newStake} min={0.1} step={0.1} onChange={(val) => setNewStake(Number(val))}>
              <NumberInputField placeholder="Stake (TON)" />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            {/* Private toggle removed for brevity */}
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleCreateLobby}>
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
}