import React, { useRef } from 'react';
import { Mesh } from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { MeshWobbleMaterial, Html } from '@react-three/drei';

type Props = {
  scale?: number;
  autoRotate?: boolean;
};

export const DigitalPlanet: React.FC<Props> = ({ scale = 8, autoRotate = true }) => {
  const meshRef = useRef<Mesh | null>(null);
  const { viewport } = useThree();

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    if (autoRotate) meshRef.current.rotation.y += 0.0025;
    meshRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.1) * 0.08;
  });

  // responsive scaling: smaller on narrow screens
  const adjustedScale = viewport.width < 6 ? scale * 0.6 : viewport.width > 20 ? scale * 1.1 : scale;

  return (
    <group>
      <mesh ref={meshRef} scale={adjustedScale}>
        <icosahedronGeometry args={[1, 5]} />
        <MeshWobbleMaterial factor={0.6} speed={0.6} color="#6ee7b7" emissive="#0e7490" />
      </mesh>

      {/* subtle label */}
      <Html position={[0, -1.8, 0]}>
        <div style={{ pointerEvents: 'none', color: 'rgba(255,255,255,0.8)', fontSize: 12, textAlign: 'center' }}>TONRODY</div>
      </Html>
    </group>
  );
};

export default DigitalPlanet;
