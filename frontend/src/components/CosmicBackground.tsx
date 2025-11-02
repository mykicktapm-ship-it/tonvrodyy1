import * as THREE from 'three'
import React, { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'

/**
 * CosmicBackground — многослойный полноэкранный фон (fixed, z-index -1)
 * Слои: NebulaFlow (дымка), DistortionField (линзовое искажение), две StarShell
 * Никаких квадратных краёв: overdraw по крупному полотну + мягкое альфа-затухание
 */

// --------------------------- GLSL helpers ---------------------------
const fbmCommon = /* glsl */`
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.0-2.0*f);
  return mix(mix(hash(i+vec2(0.0,0.0)), hash(i+vec2(1.0,0.0)), u.x),
             mix(hash(i+vec2(0.0,1.0)), hash(i+vec2(1.0,1.0)), u.x), u.y);
}
float fbm(vec2 p){ float a=0.5, t=0.0; for(int i=0;i<5;i++){ t+=a*noise(p); p*=2.0; a*=0.5; } return t; }
`;

// --------------------------- NebulaFlow ---------------------------
function NebulaFlow(){
  const mesh = useRef<THREE.Mesh>(null)
  const uniforms = useMemo(() => ({
    time: { value: 0 },
    colorA: { value: new THREE.Color('#8b00ff') }, // energy
    colorB: { value: new THREE.Color('#00ffff') }, // plasma
    colorC: { value: new THREE.Color('#ff3366') }, // entropy tint
  }), [])

  useFrame((_, d) => { uniforms.time.value += d * 0.45 })

  return (
    <mesh ref={mesh}>
      {/* Большое полотно: перекрывает весь экран с запасом */}
      <planeGeometry args={[400, 400, 256, 256]} />
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={/* glsl */`
          varying vec2 vUv;
          void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
        `}
        fragmentShader={/* glsl */`
          uniform float time; uniform vec3 colorA, colorB, colorC; varying vec2 vUv; ${fbmCommon}
          vec3 nebula(vec2 uv, float t){
            float n1 = fbm(uv*1.25 + vec2(.12*t, .0));
            float n2 = fbm(uv*.85  - vec2(.0, .17*t));
            float k  = smoothstep(-.8, .8, n1-n2);
            vec3 col = mix(mix(colorA, colorB, k), colorC, .22 + .22*sin(t + n1*3.14159));
            return col;
          }
          void main(){
            // центрируем, слегка увеличиваем для "overdraw" и мягко гасим к краям
            vec2 uv = (vUv - 0.5) * 3.0; // масштаб поля
            float t = time*0.3;
            vec3 col = nebula(uv, t);
            float radial = smoothstep(1.2, 0.2, length(uv)); // мягкое затухание
            gl_FragColor = vec4(col, 0.22 * radial);
          }
        `}
      />
    </mesh>
  )
}

// --------------------------- DistortionField ---------------------------
function DistortionField(){
  const mesh = useRef<THREE.Mesh>(null)
  const uniforms = useMemo(() => ({ time: { value: 0 }, amp: { value: 0.35 } }), [])
  useFrame((_, d) => { uniforms.time.value += d })
  return (
    <mesh ref={mesh}>
      <planeGeometry args={[400, 400, 1, 1]} />
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={/* glsl */`
          varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} 
        `}
        fragmentShader={/* glsl */`
          uniform float time; uniform float amp; varying vec2 vUv;
          void main(){
            vec2 g = vUv - 0.5; float r = length(g);
            // лёгкий синеватый halo + swirl в центре, плавно исчезающий
            float swirl = amp * 0.15 * exp(-r*5.0);
            float glow = smoothstep(0.45, 0.0, r) * 0.35;
            vec3 col = mix(vec3(0.0), vec3(0.0,0.6,1.0), glow);
            gl_FragColor = vec4(col, glow*0.45);
          }
        `}
      />
    </mesh>
  )
}

// --------------------------- StarShell ---------------------------
function StarShell({ index = 0 }: { index?: 0 | 1 }){
  const ref = useRef<THREE.Points>(null)
  const COUNT = index === 0 ? 6500 : 9000
  const positions = useMemo(() => {
    const arr = new Float32Array(COUNT * 3)
    for (let i = 0; i < COUNT; i++){
      arr[i*3+0] = (Math.random()-0.5) * 800
      arr[i*3+1] = (Math.random()-0.5) * 800
      arr[i*3+2] = (Math.random()-0.5) * 800
    }
    return arr
  }, [COUNT])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if(ref.current){
      // разные скорости вращения и лёгкий покачивающийся параллакс
      ref.current.rotation.y = (index? -1:1) * t * 0.01
      ref.current.rotation.x = Math.sin(t*0.2) * 0.03 * (index? 1.0:0.6)
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={COUNT} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={index? 0.55:0.8} color={index? '#aaccff':'#ffffff'} transparent opacity={index? 0.7:0.9}
        blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  )
}

// --------------------------- Root canvas ---------------------------
export default function CosmicBackground(){
  return (
    <Canvas
      camera={{ position: [0,0,120], fov: 70 }}
      gl={{ powerPreference: 'high-performance', antialias: true }}
      style={{ position:'fixed', inset:0, width:'100%', height:'100%', zIndex:-1 }}
    >
      <color attach="background" args={[ '#050014' ]} />
      <ambientLight intensity={0.35} />
      <pointLight position={[10,10,10]} intensity={1.2} color={'#66ccff'} />

      {/* Порядок важен: сначала туман, затем искажение, затем звёзды (передний план) */}
      <NebulaFlow />
      <DistortionField />
      <StarShell index={0} />
      <StarShell index={1} />
    </Canvas>
  )
}
