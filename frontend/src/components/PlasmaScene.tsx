import React, { useRef } from 'react';
import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';
import { extend, useFrame } from '@react-three/fiber';

const PlasmaMat = shaderMaterial(
  { uTime: 0, uColor1: new THREE.Color('#7c3aed'), uColor2: new THREE.Color('#06b6d4') },
  // vertex
  `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
  // fragment
  `
  uniform float uTime;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  varying vec2 vUv;

  float noise(vec2 p){
    return sin(p.x*10.0 + uTime*0.5) * sin(p.y*10.0 - uTime*0.3);
  }

  void main(){
    float n = noise(vUv * 1.6);
    vec3 col = mix(uColor1, uColor2, smoothstep(-0.5, 0.5, n));
    float alpha = 0.35 + 0.2 * sin(uTime + vUv.x * 3.14);
    gl_FragColor = vec4(col, alpha);
  }
  `
);

extend({ PlasmaMat });

export const PlasmaScene: React.FC = () => {
  const matRef = useRef<any>(null);
  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.uTime = clock.getElapsedTime();
  });

  return (
    <mesh position={[0, 0, -20]}>
      <planeGeometry args={[300, 180, 1, 1]} />
      {/* @ts-ignore */}
      <plasmaMat ref={matRef} />
    </mesh>
  );
};

export default PlasmaScene;
