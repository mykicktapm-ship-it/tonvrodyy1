import React from 'react';
import { Canvas } from '@react-three/fiber';
import DigitalPlanet from '../components/DigitalPlanet';
import PlasmaScene from '../components/PlasmaScene';
import CosmicBackground from '../components/CosmicBackground';
import { Box, Flex, Heading } from '@chakra-ui/react';

const Laboratory: React.FC = () => {
  return (
    <Flex direction="column" minH="100vh" bg="#071021" color="white" align="center" justify="center" p={4}>
      <Heading mb={6} size="lg">Laboratory</Heading>
      <Box w="full" maxW="1200px" h={['400px','520px','760px']} borderRadius="lg" overflow="hidden" bg="transparent">
        <Canvas camera={{ position: [0, 0, 30], fov: 50 }}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <CosmicBackground />
          <PlasmaScene />
          <DigitalPlanet />
        </Canvas>
      </Box>
    </Flex>
  );
};

export default Laboratory;
