import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useMemo } from 'react'

/**
 * Гравитационная сфера — ядро с эффектом втягивания света.
 * Реализует свечение, искажения и мягкие энергетические кольца.
 */

function GravityCore() {
  const mesh = useRef<THREE.Mesh>(null)
  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
    }),
    []
  )

  useFrame((_, delta) => {
    uniforms.time.value += delta
    if (mesh.current) mesh.current.rotation.y += delta * 0.15
  })

  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[1.2, 128, 128]} />
      <shaderMaterial
        uniforms={uniforms}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        fragmentShader={`
          uniform float time;
          varying vec2 vUv;

          // Плавный шум
          float noise(vec2 p) {
            return sin(p.x*15.0 + time*0.8) * sin(p.y*12.0 - time*0.6);
          }

          void main() {
            vec2 uv = vUv * 2.0 - 1.0;
            float r = length(uv);

            // Эффект притяжения к центру
            float glow = smoothstep(0.9, 0.1, r);
            float swirl = sin(r*10.0 - time*2.0) * 0.5 + 0.5;
            float n = noise(uv * 2.5 + swirl);

            vec3 inner = mix(vec3(0.1, 0.0, 0.2), vec3(0.9, 0.0, 0.0), 1.0 - r);
            vec3 plasma = mix(inner, vec3(0.0, 0.6, 1.0), n * glow);

            float alpha = smoothstep(1.2, 0.0, r) * 0.9;

            gl_FragColor = vec4(plasma, alpha);
          }
        `}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
      />
    </mesh>
  )
}

export default function DigitalPlanet() {
  return (
    <Canvas
      camera={{ position: [0, 0, 4] }}
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
      }}
    >
      <ambientLight intensity={0.6} />
      <pointLight position={[0, 0, 2]} intensity={2.5} color="#ff0040" />
      <GravityCore />
    </Canvas>
  )
}
