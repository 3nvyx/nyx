"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox, Float, PerspectiveCamera, Environment, Html } from "@react-three/drei";
import * as THREE from "three";

function RobotBody({ isWorking }: { isWorking?: boolean }) {
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const antennaRef = useRef<THREE.Mesh>(null);
  const eyeRef = useRef<THREE.Mesh>(null);
  const eyeRef2 = useRef<THREE.Mesh>(null);
  const blinkTimer = useRef(0);
  const isBlinking = useRef(false);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    
    if (bodyRef.current) {
      // Gentle floating
      bodyRef.current.position.y = Math.sin(time * 0.5) * 0.1;
      bodyRef.current.rotation.y = Math.sin(time * 0.3) * 0.1;
    }

    if (headRef.current && isWorking) {
      // Lean forward slightly when working
      headRef.current.rotation.x = Math.sin(time * 2) * 0.05 + 0.1;
    }

    if (antennaRef.current) {
      // Antenna pulse
      const pulse = (Math.sin(time * (isWorking ? 10 : 3)) + 1) / 2;
      (antennaRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse * 2;
    }

    // Blink Logic
    if (eyeRef.current && eyeRef2.current) {
      if (!isBlinking.current && Math.random() > 0.995) {
        isBlinking.current = true;
        blinkTimer.current = 0;
      }
      if (isBlinking.current) {
        blinkTimer.current += delta;
        const s = blinkTimer.current < 0.1 ? 0.1 : 1;
        eyeRef.current.scale.y = s;
        eyeRef2.current.scale.y = s;
        if (blinkTimer.current > 0.2) isBlinking.current = false;
      }
    }
  });

  return (
    <group ref={bodyRef}>
      {/* Main Body */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.6, 0.4, 1, 32]} />
        <meshStandardMaterial color="#bbbbbb" roughness={0.05} metalness={1.0} />
      </mesh>

      {/* Chest Plate / Decal */}
      <Html
        position={[0, 0, 0.51]}
        center
        transform
        distanceFactor={2} // Made smaller (closer) to appear larger in screen space
      >
        <div style={{
          background: 'rgba(0, 255, 65, 0.05)',
          border: '2px solid var(--green)',
          padding: '4px 12px',
          borderRadius: '6px',
          color: 'var(--green)',
          fontSize: '12px', // Larger font
          fontFamily: 'var(--font-mono)',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          whiteSpace: 'nowrap',
          boxShadow: '0 0 15px var(--green-glow)',
          opacity: 0.9,
          userSelect: 'none',
        }}>
          NyX Bot
        </div>
      </Html>

      {/* Head */}
      <group ref={headRef} position={[0, 0.8, 0]}>
        <RoundedBox args={[1, 0.7, 0.8]} radius={0.15} smoothness={4}>
          <meshStandardMaterial color="#bbbbbb" roughness={0.05} metalness={1.0} />
        </RoundedBox>

        {/* Visor Area */}
        <mesh position={[0, 0, 0.401]}>
          <boxGeometry args={[0.8, 0.3, 0.02]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0} metalness={1} />
        </mesh>

        {/* Blinking Eyes */}
        <mesh ref={eyeRef} position={[-0.2, 0, 0.415]}>
          <boxGeometry args={[0.18, 0.08, 0.01]} />
          <meshStandardMaterial 
            color="#00ff41" 
            emissive="#00ff41" 
            emissiveIntensity={isWorking ? 8 : 4} 
          />
        </mesh>
        <mesh ref={eyeRef2} position={[0.2, 0, 0.415]}>
          <boxGeometry args={[0.18, 0.08, 0.01]} />
          <meshStandardMaterial 
            color="#00ff41" 
            emissive="#00ff41" 
            emissiveIntensity={isWorking ? 8 : 4} 
          />
        </mesh>

        {/* Antenna */}
        <group position={[0.3, 0.4, -0.1]}>
          <mesh>
            <cylinderGeometry args={[0.02, 0.02, 0.4]} />
            <meshStandardMaterial color="#333" />
          </mesh>
          <mesh ref={antennaRef} position={[0, 0.25, 0]}>
            <sphereGeometry args={[0.05]} />
            <meshStandardMaterial color="#00ff41" emissive="#00ff41" emissiveIntensity={2} />
          </mesh>
        </group>
      </group>



      {/* Shoulder Joints */}
      {[-0.7, 0.7].map((x, i) => (
        <group key={i} position={[x, 0.2, 0]}>
          <mesh>
            <sphereGeometry args={[0.15]} />
            <meshStandardMaterial color="#999999" metalness={1.0} roughness={0.1} />
          </mesh>
          {/* Arms */}
          <mesh position={[0, -0.3, 0]} rotation={[0, 0, x > 0 ? -0.2 : 0.2]}>
            <cylinderGeometry args={[0.08, 0.08, 0.6]} />
            <meshStandardMaterial color="#bbbbbb" roughness={0.05} metalness={1.0} />
          </mesh>
        </group>
      ))}

      {/* Bottom Thruster/Base */}
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[0.3, 0, 0.3, 16]} />
        <meshStandardMaterial color="#444444" metalness={1.0} emissive="#00ff41" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

export default function NyxRobot3D({ 
  working = false, 
  isExiting = false,
  className = "" 
}: { 
  working?: boolean;
  isExiting?: boolean;
  className?: string;
}) {
  return (
    <div className={`w-full h-full min-h-[300px] ${className} ${isExiting ? "fly-off-right" : ""}`}>
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={40} />
        <ambientLight intensity={1.5} />
        <pointLight position={[10, 10, 10]} intensity={2} />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={2} />
        
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <RobotBody isWorking={working} />
        </Float>

        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
