import React from 'react';
import {
  Avatar,
  Box,
  Flex,
  IconButton,
  Text,
  useBreakpointValue,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Button,
  HStack,
  Switch,
} from '@chakra-ui/react';
import { useTranslation } from '../LanguageContext';
import { useAppUserId } from '../hooks/useAppUserId';
import { useTonWallet } from '@tonconnect/ui-react';
import { FaLanguage } from 'react-icons/fa';
import { useEnhancedFx } from '../context/EnhancedFxContext';

/**
 * Top application bar. Displays logo, language switcher, wallet status and avatar.
 */
export default function AppBar() {
  const { locale, setLocale, t } = useTranslation();
  const userId = useAppUserId();
  const wallet = useTonWallet();

  // Enhanced FX toggle
  const { isEnhanced, toggleEnhanced } = useEnhancedFx();

  // Determine user avatar from Telegram init data
  const avatarUrl = React.useMemo(() => {
    try {
      const tg = (window as any).Telegram?.WebApp?.initDataUnsafe?.user;
      return tg?.photo_url ?? undefined;
    } catch (e) {
      return undefined;
    }
  }, []);

  // Breakpoint to show/hide text
  const showText = useBreakpointValue({ base: false, md: true });

  return (
    <Flex
      as="header"
      position="fixed"
      top={0}
      left={0}
      right={0}
      py={2}
      px={4}
      align="center"
      backdropFilter="blur(12px)"
      bg="rgba(0,0,0,0.4)"
      borderBottom="1px solid rgba(255,255,255,0.12)"
      zIndex={20}
    >
      {/* Logo */}
      <Flex align="center">
        <Box w={6} h={6} bg="ton.primary" borderRadius="md" mr={2}></Box>
        {showText && (
          <Text fontWeight="bold" fontSize="lg">
            TONRODY
          </Text>
        )}
      </Flex>
      <Box flex="1" />
      {/* Language selector */}
      <Menu>
        <MenuButton as={IconButton} aria-label="Language" icon={<FaLanguage />} variant="ghost" />
        <MenuList bg="ton.surface" backdropFilter="blur(12px)" borderColor="rgba(255,255,255,0.18)">
          <MenuItem onClick={() => setLocale('en')} bg={locale === 'en' ? 'ton.primary' : 'transparent'}>
            English
          </MenuItem>
          <MenuItem onClick={() => setLocale('ru')} bg={locale === 'ru' ? 'ton.primary' : 'transparent'}>
            Русский
          </MenuItem>
        </MenuList>
      </Menu>
      {/* Wallet status */}
      <Box ml={4} mr={4} textAlign="right">
        {wallet?.account?.address ? (
          <Text fontSize="sm" color="ton.glow">
            {wallet.account.address.slice(0, 6)}…{wallet.account.address.slice(-4)}
          </Text>
        ) : (
          <Text fontSize="sm" color="ton.secondaryText">
            {t('general.notConnected')}
          </Text>
        )}
      </Box>
      {/* Avatar */}
      <Avatar size="sm" src={avatarUrl} name={userId ?? undefined} />
      {/* Enhanced FX toggle (optional heavy effects) */}
      <HStack ml={4} spacing={2} align="center">
        <Text fontSize="sm" color="ton.secondaryText" display={{ base: 'none', md: 'inline' }}>
          ✨ FX
        </Text>
        <Switch size="sm" colorScheme="blue" isChecked={isEnhanced} onChange={toggleEnhanced} />
      </HStack>
    </Flex>
  );
}