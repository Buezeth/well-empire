import { Float } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import React, { useRef } from 'react'
import * as THREE from 'three';



const SoapBottle = ({active, color}: {active: boolean, color: string}) => {
  const bottleRef = useRef<THREE.Group>(null);
  
  // Smoothly animate rotation and scale in the render loop
  useFrame((state) => {
    if (bottleRef.current) {
      // Rotate active item slightly to show off reflections
      if (active) {
        bottleRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15;
      } else {
        bottleRef.current.rotation.y = THREE.MathUtils.lerp(bottleRef.current.rotation.y, 0, 0.1);
      }
      
      // Smoothly scale up the active item
      const targetScale = active ? 1.1 : 0.9;
      bottleRef.current.scale.setScalar(THREE.MathUtils.lerp(bottleRef.current.scale.x, targetScale, 0.1));
    }
  });

  return (
    <Float 
      speed={active ? 2 : 0} 
      rotationIntensity={active ? 0.2 : 0} 
      floatIntensity={active ? 0.5 : 0}
      floatingRange={[-0.05, 0.05]}
    >
      <group ref={bottleRef} position={[0, 1.3, 0]}>
        
        {/* Main Bottle Body (Premium Glass/Liquid look) */}
        <mesh castShadow receiveShadow position={[0, 0, 0]}>
          <capsuleGeometry args={[0.5, 0.9, 32, 64]} />
          <meshPhysicalMaterial 
            color={color}
            transmission={0.8} // Allows us to see the inner core
            transparent={true}
            opacity={1}
            metalness={0.1}
            roughness={0.05}
            ior={1.5}
            thickness={1}
            envMapIntensity={2}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </mesh>
        
        {/* Inner Liquid Core (Guarantees color visibility against dark backgrounds) */}
        <mesh position={[0, 0, 0]} scale={0.92}>
          <capsuleGeometry args={[0.5, 0.85, 16, 32]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
        </mesh>

        {/* Neck */}
        <mesh castShadow receiveShadow position={[0, 1.0, 0]}>
          <cylinderGeometry args={[0.15, 0.3, 0.3, 32]} />
          <meshPhysicalMaterial color={color} transmission={0.5} roughness={0.1} thickness={1} />
        </mesh>

        {/* Metallic Pump Cap */}
        <mesh castShadow receiveShadow position={[0, 1.25, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.3, 32]} />
          <meshStandardMaterial color="#111111" roughness={0.2} metalness={0.9} />
        </mesh>
        
        {/* Pump Spout */}
        <mesh castShadow receiveShadow position={[0.15, 1.35, 0]} rotation={[0, 0, -Math.PI / 3]}>
          <cylinderGeometry args={[0.04, 0.04, 0.4, 16]} />
          <meshStandardMaterial color="#111111" roughness={0.2} metalness={0.9} />
        </mesh>

        {/* Minimalist Label */}
        <mesh position={[0, 0, 0.51]} rotation={[0, 0, 0]}>
          <planeGeometry args={[0.4, 0.7]} />
          <meshStandardMaterial color="#ffffff" roughness={0.8} metalness={0.1} />
        </mesh>
      </group>
    </Float>
  );
}

export default SoapBottle