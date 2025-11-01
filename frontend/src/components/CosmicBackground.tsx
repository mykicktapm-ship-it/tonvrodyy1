import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

type Props = {
  speed?: number;
};

export const CosmicBackground: React.FC<Props> = ({ speed = 0.02 }) => {
  const starsRef = useRef<THREE.Points>(null);
  const meteorRef = useRef<THREE.Mesh>(null);

  // create star positions once
  const starPositions = React.useMemo(() => {
    const arr = new Float32Array(1000 * 3);
    for (let i = 0; i < 1000; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 200;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 200;
      arr[i * 3 + 2] = -Math.random() * 200;
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (starsRef.current) {
      starsRef.current.rotation.y = t * speed * 0.02;
    }
    if (meteorRef.current) {
      meteorRef.current.position.x = Math.sin(t * 0.6) * 80;
      meteorRef.current.position.y = -50 + Math.cos(t * 0.6) * 30;
      meteorRef.current.rotation.z += 0.06;
    }
  });

  return (
    <group>
      {/* distant stars layer */}
      <points ref={starsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={starPositions.length / 3} array={starPositions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.8} color="#b9f" sizeAttenuation />
      </points>

      {/* subtle wave layer - a semi-transparent plane with animated normals */}
      <mesh position={[0, -30, -40]} rotation={[-0.4, 0, 0]}>
        <planeGeometry args={[400, 200, 32, 32]} />
        <meshStandardMaterial color="#0f172a" transparent opacity={0.12} roughness={1} />
      </mesh>

      {/* moving meteor (rare) */}
      <mesh ref={meteorRef} position={[0, -50, -60]}>
        <sphereGeometry args={[1.6, 8, 8]} />
        <meshStandardMaterial emissive="#ff9" color="#ffd" />
      </mesh>
    </group>
  );
};

export default CosmicBackground;
