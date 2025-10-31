import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';

// Fragment shader for the digital planet. Creates a dynamic grid-like
// pattern that scrolls over the sphere surface and blends between
// dark and bright blues.
const fragmentShader = `
uniform float time;
varying vec2 vUv;
void main() {
  vec2 uv = vUv;
  // Slowly scroll the texture vertically over time
  uv.y += time * 0.2;
  // Create a grid pattern using sine waves; step() sharpens the edges
  float grid = step(0.95, abs(sin(uv.y * 60.0))) * step(0.95, abs(sin(uv.x * 60.0)));
  vec3 color = mix(vec3(0.0, 0.2, 0.4), vec3(0.0, 0.8, 1.0), grid);
  gl_FragColor = vec4(color, 1.0);
}`;

// Simple passthrough vertex shader that forwards UV coordinates to
// the fragment shader. Using a custom shader here allows us to drive
// animations via uniforms in the fragment stage.
const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

/**
 * Planet renders a sphere with a custom shader material. It rotates
 * slowly around the Y axis and updates a time uniform each frame to
 * animate the shader.
 */
function Planet() {
  const mesh = useRef<THREE.Mesh>(null!);
  const uniforms = useRef({ time: { value: 0.0 } });
  useFrame((_, delta) => {
    uniforms.current.time.value += delta;
    if (mesh.current) mesh.current.rotation.y += delta * 0.2;
  });
  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[1, 64, 64]} />
      <shaderMaterial fragmentShader={fragmentShader} vertexShader={vertexShader} uniforms={uniforms.current} />
    </mesh>
  );
}

/**
 * DigitalPlanet composes the animated planet within a Canvas. Lights
 * illuminate the sphere to give it depth, and the camera is set
 * slightly back to frame the object nicely.
 */
export default function DigitalPlanet() {
  return (
    <Canvas camera={{ position: [0, 0, 3] }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[2, 2, 2]} intensity={1.5} color="#00baff" />
      <Planet />
    </Canvas>
  );
}