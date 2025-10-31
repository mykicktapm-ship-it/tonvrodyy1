import React, { useRef } from 'react';
import { Box, useBreakpointValue } from '@chakra-ui/react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
// Import the full THREE namespace instead of only Group. This allows
// referencing Three.js classes via THREE.Group and avoids issues with
// named exports that may not exist in some builds of three.
import * as THREE from 'three';
import { useEnhancedFx } from '../context/EnhancedFxContext';

/**
 * StarLayers renders multiple rotating star fields at different radii to
 * simulate depth and parallax. The multiplier adjusts the number of stars
 * based on screen size and whether enhanced FX are enabled.
 */
function StarLayers({ multiplier = 1 }: { multiplier?: number }) {
  // Each star layer is represented by a Three.js Group. Using the
  // explicit THREE.Group type here ensures TypeScript resolves the
  // generic correctly when using the THREE namespace import.
  const layer1 = useRef<THREE.Group>(null!);
  const layer2 = useRef<THREE.Group>(null!);
  const layer3 = useRef<THREE.Group>(null!);
  // Slowly rotate layers in opposite directions to create drift.
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (layer1.current) layer1.current.rotation.z = t * 0.02;
    if (layer2.current) layer2.current.rotation.z = -t * 0.015;
    if (layer3.current) layer3.current.rotation.z = t * 0.01;
  });
  const count1 = Math.floor(500 * multiplier);
  const count2 = Math.floor(1000 * multiplier);
  const count3 = Math.floor(1500 * multiplier);
  return (
    <>
      <group ref={layer1}>
        <Stars radius={50} depth={20} count={count1} factor={4} fade />
      </group>
      <group ref={layer2}>
        <Stars radius={100} depth={40} count={count2} factor={2} fade />
      </group>
      <group ref={layer3}>
        <Stars radius={200} depth={80} count={count3} factor={1} fade />
      </group>
    </>
  );
}

/**
 * CosmicBackground draws animated starfields across the entire page. It reads
 * the enhanced FX flag from context to adjust density and heavy effects.
 */
export default function CosmicBackground() {
  const { isEnhanced } = useEnhancedFx();
  // Adjust star density based on viewport size to improve performance on smaller devices.
  const density = useBreakpointValue({ base: 0.4, md: 0.7, lg: 1 });
  const multiplier = (density ?? 1) * (isEnhanced ? 1 : 0.5);
  return (
    <Box position="absolute" top="0" left="0" w="100%" h="100%" zIndex={0} overflow="hidden" pointerEvents="none">
      <Canvas camera={{ position: [0, 0, 1] }}>
        <ambientLight intensity={0.3} />
        <StarLayers multiplier={multiplier} />
        {/* Meteor streaks and other heavy effects could be added here when isEnhanced is true. */}
      </Canvas>
    </Box>
  );
}