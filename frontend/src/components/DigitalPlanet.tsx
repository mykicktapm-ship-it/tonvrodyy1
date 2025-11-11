import * as THREE from 'three'
import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'

function BinaryRain() {
  const count = 750
  const group = useRef<THREE.Group>(null)
  const speeds = useMemo(() => Array.from({ length: count }, () => 1 + Math.random() * 2), [])
  const positions = useMemo(() => Array.from({ length: count }, () => [
    (Math.random() - 0.5) * 14,
    Math.random() * 20,
    (Math.random() - 0.5) * 6,
    Math.random() > 0.5 ? '1' : '0'
  ]), [])

  const meshRefs = useRef<THREE.Mesh[]>([])

  useFrame((_, delta) => {
    if (!meshRefs.current.length) return
    meshRefs.current.forEach((mesh, i) => {
      mesh.position.y -= speeds[i] * delta
      if (mesh.position.y < -10) mesh.position.y = 10
    })
  })

  return (
    <group ref={group}>
      {positions.map(([x, y, z, char], i) => (
        <Text
          key={i}
          position={[x as number, y as number, z as number]}
          fontSize={0.4}
          color="#00ff1aff"
          fillOpacity={0.5}
          ref={el => { if (el) meshRefs.current[i] = el }}
        >
          {char as string}
        </Text>
      ))}
    </group>
  )
}

function TonrodyRing() {
  const radius = 3.2
  const chars = 'TONRODY'.split('')
  return (
    <group>
      {chars.map((char, i) => {
        const angle = (i / chars.length) * Math.PI * 2
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius
        return (
          <Text
            key={i}
            position={[x, y, 0]}
            rotation={[0, 0, angle + Math.PI / 2]}
            fontSize={0.7}
            color="white"
            fillOpacity={0.8}
          >
            {char}
          </Text>
        )
      })}
    </group>
  )
}

// ⬇︎ Остальная структура DigitalPlanet остаётся без изменений
function EventHorizonCore() {
  const group = useRef<THREE.Group>(null)
  const ring = useRef<THREE.Mesh>(null)
  const uniforms = useMemo(() => ({ time: { value: 0 } }), [])

  useFrame((state, delta) => {
    uniforms.time.value += delta
    if (group.current) {
      group.current.rotation.y += delta * 0.1
      group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.25) * 0.2
    }
    if (ring.current) {
      ring.current.rotation.z += delta * 0.6
    }
  })

  return (
    <group ref={group}>
      {/* Центральное ядро */}
      <mesh>
        <sphereGeometry args={[21.2, 64, 64]} />
        <shaderMaterial
          uniforms={uniforms}
          transparent
          blending={THREE.AdditiveBlending}
          vertexShader={`varying vec3 vNormal; void main(){ vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`}
          fragmentShader={`varying vec3 vNormal; void main(){ float fres = pow(1.0 - abs(dot(vNormal, vec3(0,0,1))), 2.5); vec3 color = mix(vec3(0.0), vec3(0.1,0.1,0.1) + fres * vec3(0.6,0.0,0.0), 1.0); gl_FragColor = vec4(color, 0.8); }`}
        />
      </mesh>

      {/* Тор */}
      <mesh ref={ring} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[8.0, 3.12, 32, 200]} />
        <shaderMaterial
          uniforms={uniforms}
          transparent
          blending={THREE.AdditiveBlending}
          vertexShader={`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`}
          fragmentShader={`uniform float time; varying vec2 vUv; float glow = abs(sin(vUv.x * 10.0 + time * 3.0)); vec3 col = mix(vec3(0.0,1.0,1.0), vec3(1.0,0.0,0.4), vUv.x); gl_FragColor = vec4(col * gl
            ow, glow * 0.6);`}
        />
      </mesh>

      {/* Гравитационное поле */}
      <mesh>
        <sphereGeometry args={[10.5, 64, 64]} />
        <shaderMaterial
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          vertexShader={`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`}
          fragmentShader={`uniform float time; varying vec2 vUv; float d = length(vUv - 0.5); float intensity = smoothstep(0.5, 0.25, d); float pulse = 0.6 + 0.4 * sin(time * 0.8 + d * 5.0); vec3 col = mix(vec3(0.0), vec3(0.2,0.8,1.0), intensity * pulse); gl_FragColor = vec4(col, intensity * 0.2);`}
        />
      </mesh>
    </group>
  )
}

export default function DigitalPlanet() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 55 }}
      gl={{ powerPreference: 'high-performance', antialias: true }}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}
    >
      <color attach="background" args={['black']} />
      <ambientLight intensity={0.4} />
      <BinaryRain />
      <TonrodyRing />
      <EventHorizonCore />
    </Canvas>
  )
}