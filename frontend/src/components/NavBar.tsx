import { Flex, IconButton, useColorModeValue } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaFlask, FaCoins } from 'react-icons/fa';

/**
 * Bottom navigation bar with three main routes. Uses react-router-dom NavLink
 * to determine the active route and Chakra's IconButton for consistent styling.
 */
export default function NavBar() {
  const bg = useColorModeValue('rgba(255,255,255,0.1)', 'rgba(0,0,0,0.4)');
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
      zIndex={10}
    >
      <NavLink to="/" end>
        {({ isActive }) => (
          <IconButton
            aria-label="Home"
            icon={<FaHome />}
            colorScheme={isActive ? 'blue' : 'gray'}
            variant={isActive ? 'solid' : 'ghost'}
          />
        )}
      </NavLink>
      <NavLink to="/laboratory">
        {({ isActive }) => (
          <IconButton
            aria-label="Laboratory"
            icon={<FaFlask />}
            colorScheme={isActive ? 'blue' : 'gray'}
            variant={isActive ? 'solid' : 'ghost'}
          />
        )}
      </NavLink>
      <NavLink to="/earn">
        {({ isActive }) => (
          <IconButton
            aria-label="Earn"
            icon={<FaCoins />}
            colorScheme={isActive ? 'blue' : 'gray'}
            variant={isActive ? 'solid' : 'ghost'}
          />
        )}
      </NavLink>
    </Flex>
  );
}