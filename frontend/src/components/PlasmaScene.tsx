import * as THREE from 'three'
import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'

/**
 * PlasmaScene — динамическая визуализация потоков энергии.
 * Потоки реагируют на движение камеры и курсора, создавая ощущение взаимодействия.
 */

function PlasmaField() {
  const group = useRef<THREE.Group>(null)
  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
      intensity: { value: 0.6 },
      cursor: { value: new THREE.Vector2(0.5, 0.5) },
    }),
    []
  )

  useFrame((state, delta) => {
    uniforms.time.value += delta
    if (group.current) group.current.rotation.y += delta * 0.03
  })

  const fragmentShader = `
    uniform float time;
    uniform float intensity;
    uniform vec2 cursor;
    varying vec2 vUv;

    float noise(vec2 p) {
      return sin(p.x) * sin(p.y);
    }

    float fbm(vec2 p) {
      float value = 0.0;
      float scale = 0.5;
      for (int i = 0; i < 5; i++) {
        value += scale * noise(p);
        p *= 2.0;
        scale *= 0.5;
      }
      return value;
    }

    void main() {
      vec2 uv = vUv * 4.0 - vec2(2.0);
      float n = fbm(uv + time * 0.2);
      float energy = abs(sin(time + uv.x * 2.0 + uv.y * 2.0)) * intensity;

      // Центр сцены тянет свет, имитируя гравитационное преломление
      float dist = length(uv - (cursor - 0.5) * 4.0);
      float grav = 1.0 / (1.0 + dist * dist * 3.0);

      vec3 color = mix(
        vec3(0.05, 0.0, 0.1),
        vec3(0.0, 0.8, 1.0),
        grav + n * energy
      );

      color += 0.4 * vec3(pow(grav, 2.0), pow(n, 3.0), pow(energy, 2.0));
      gl_FragColor = vec4(color, 0.6);
    }
  `

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `

  return (
    <group ref={group}>
      <mesh>
        <planeGeometry args={[40, 40, 128, 128]} />
        <shaderMaterial
          uniforms={uniforms}
          fragmentShader={fragmentShader}
          vertexShader={vertexShader}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}

export default function PlasmaScene() {
  return (
    <Canvas camera={{ position: [0, 0, 15], fov: 60 }} style={{ position: 'absolute', inset: 0 }}>
      <color attach="background" args={[ 'transparent' ]} />
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 0, 10]} intensity={1.5} color={'#ff66cc'} />
      <PlasmaField />
    </Canvas>
  )
}
