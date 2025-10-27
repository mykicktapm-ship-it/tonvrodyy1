import React from 'react';
import { Heading, Text, VStack } from '@chakra-ui/react';
import PlasmaScene from '../components/PlasmaScene';
import GlassContainer from '../components/GlassContainer';

export default function Laboratory() {
  return (
    <VStack spacing={6} align="stretch" pt={16} pb={20} px={4} position="relative">
      {/* 3D plasma background */}
      <PlasmaScene />
      <GlassContainer>
        <Heading size="lg" mb={2}>
          Laboratory
        </Heading>
        <Text fontSize="sm" mb={2}>
          This section showcases a simple 3D scene built with three.js and react-three-fiber. The animated
          sphere and star field emulate a plasma effect with depth and motion.
        </Text>
        <Text fontSize="sm">
          Further experiments and interactions with smart contracts can be added here in the future.
        </Text>
      </GlassContainer>
    </VStack>
  );
}