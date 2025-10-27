import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, OrbitControls, Stars } from '@react-three/drei';
import { Mesh } from 'three';

/**
 * Animated sphere that slowly morphs and rotates to create a plasma-like feel.
 */
function AnimatedSphere() {
  const ref = useRef<Mesh>(null!);
  // Use frame loop to animate the sphere
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      ref.current.rotation.x = t * 0.2;
      ref.current.rotation.y = t * 0.3;
      const scale = 1 + Math.sin(t * 2) * 0.1;
      ref.current.scale.set(scale, scale, scale);
    }
  });
  return (
    <Sphere ref={ref} args={[1.2, 64, 64]}>
      <meshStandardMaterial
        color="#00aaff"
        emissive="#0066cc"
        roughness={0.2}
        metalness={0.1}
      />
    </Sphere>
  );
}

/**
 * PlasmaScene renders a full-screen 3D canvas with an animated sphere and some stars.
 * It is placed behind the UI elements to give a sense of depth.
 */
export default function PlasmaScene() {
  return (
    <div className="plasma-background">
      <Canvas camera={{ position: [0, 0, 4] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <AnimatedSphere />
        <Stars radius={20} depth={50} count={3000} factor={4} fade />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}