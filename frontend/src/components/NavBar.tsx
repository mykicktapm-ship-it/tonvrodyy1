import { Flex, IconButton, useColorModeValue, Text, useBreakpointValue, Box } from '@chakra-ui/react';
import { NavLink, useLocation } from 'react-router-dom';
import { FaHome, FaFlask, FaCoins } from 'react-icons/fa';
import { useTranslation } from '../LanguageContext';

/**
 * Bottom navigation bar with three main routes. Uses react-router-dom NavLink
 * to determine the active route and Chakra's IconButton for consistent styling.
 */
export default function NavBar() {
  const location = useLocation();
  const { t } = useTranslation();
  const showLabels = useBreakpointValue({ base: false, md: true });
  const bg = useColorModeValue('rgba(255,255,255,0.1)', 'rgba(0,0,0,0.4)');
  const items = [
    { to: '/', icon: <FaHome />, label: t('general.home') },
    { to: '/laboratory', icon: <FaFlask />, label: t('general.laboratory') },
    { to: '/earn', icon: <FaCoins />, label: t('general.earn') },
  ];
  return (
    <Flex
      position="fixed"
      bottom={0}
      left={0}
      width="100%"
      justify="space-around"
      py={2}
      backdropFilter="blur(12px)"
      bg={bg}
      borderTop="1px solid rgba(255,255,255,0.12)"
      zIndex={20}
    >
      {items.map((item) => {
        const isActive = location.pathname === item.to;
        return (
          <NavLink key={item.to} to={item.to} end>
            <Flex
              direction="column"
              align="center"
              justify="center"
              px={3}
              py={1}
              borderRadius="md"
              bg={isActive ? 'ton.surface' : 'transparent'}
              boxShadow={isActive ? '0 0 10px var(--chakra-colors-ton-glow)' : undefined}
              transition="all 0.2s ease"
            >
              <IconButton
                aria-label={item.label}
                icon={item.icon}
                size="sm"
                colorScheme={isActive ? 'blue' : 'gray'}
                variant={isActive ? 'solid' : 'ghost'}
                mb={showLabels ? 1 : 0}
              />
              {showLabels && (
                <Text fontSize="xs" color={isActive ? 'ton.primary' : 'ton.secondaryText'}>
                  {item.label}
                </Text>
              )}
            </Flex>
          </NavLink>
        );
      })}
    </Flex>
  );
}