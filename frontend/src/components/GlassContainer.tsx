import { Box, BoxProps } from '@chakra-ui/react';
import React from 'react';

/**
 * A reusable glassmorphic container leveraging Chakra's Box component.
 * The container has a translucent background, blurred backdrop and subtle border.
 */
export default function GlassContainer(props: BoxProps) {
  return (
    <Box
      bg="ton.surface"
      borderWidth="1px"
      borderColor="rgba(255,255,255,0.18)"
      borderRadius="xl"
      boxShadow="lg"
      p={6}
      backdropFilter="blur(24px)"
      position="relative"
      _hover={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.3)' }}
      transition="all 0.2s ease"
      {...props}
    />
  );
}