import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Mesh } from 'three';

// Removed AnimatedSphere; PlasmaScene now only renders a rotating star field

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
        {/* Render a simple star field without a central sphere */}
        <Stars radius={40} depth={60} count={2000} factor={4} fade />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}