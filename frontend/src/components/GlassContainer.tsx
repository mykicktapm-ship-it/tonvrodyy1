import { Box, BoxProps } from '@chakra-ui/react';
import React from 'react';

/**
 * A reusable glassmorphic container leveraging Chakra's Box component.
 * The container has a translucent background, blurred backdrop and subtle border.
 */
export default function GlassContainer(props: BoxProps) {
  return (
    <Box
      bg="rgba(255,255,255,0.05)"
      borderWidth="1px"
      borderColor="rgba(255,255,255,0.18)"
      borderRadius="xl"
      boxShadow="lg"
      p={6}
      backdropFilter="blur(12px)"
      {...props}
    />
  );
}