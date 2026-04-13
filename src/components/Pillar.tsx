import React from 'react'

const Pillar = () => {
  return (
      <group position={[0, -2.5, 0]}>
        {/* Sleek, modern dark pillar - brightened slightly to ensure visibility */}
        <mesh castShadow receiveShadow position={[0, 0, 0]}>
          <cylinderGeometry args={[0.9, 1.1, 5, 64]} />
          <meshStandardMaterial color="#1a1a1f" roughness={0.6} metalness={0.3} />
        </mesh>
        
        {/* Metallic top trim */}
        <mesh castShadow receiveShadow position={[0, 2.55, 0]}>
          <cylinderGeometry args={[0.92, 0.92, 0.1, 64]} />
          <meshStandardMaterial color="#444444" roughness={0.2} metalness={0.8} />
        </mesh>
        
        {/* Floating pedestal disc */}
        <mesh castShadow receiveShadow position={[0, 2.7, 0]}>
          <cylinderGeometry args={[0.8, 0.8, 0.05, 64]} />
          <meshStandardMaterial color="#222222" roughness={0.4} metalness={0.5} />
        </mesh>
      </group>
    );
}

export default Pillar