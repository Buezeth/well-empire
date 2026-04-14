// src/components/SoapBottle.tsx
import { Float, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import React, { useRef } from 'react';
import * as THREE from 'three';

// Add width and height to the incoming properties
const SoapBottle = ({ active, image, width, height }: { active: boolean, color: string, image: string, width: number, height: number }) => {
  const bottleRef = useRef<THREE.Group>(null);
  
  const texture = useTexture(image);
  texture.colorSpace = THREE.SRGBColorSpace;

  useFrame(({ camera, clock }) => {
    if (bottleRef.current) {
      bottleRef.current.lookAt(camera.position);
      bottleRef.current.rotation.x = 0;
      bottleRef.current.rotation.z = 0;

      if (active) {
        const time = clock.elapsedTime;
        bottleRef.current.rotation.y += Math.sin(time * 2) * 0.15;
        bottleRef.current.rotation.x += Math.sin(time * 3) * 0.05;
      }

      const targetScale = active ? 1.2 : 0.9;
      bottleRef.current.scale.setScalar(THREE.MathUtils.lerp(bottleRef.current.scale.x, targetScale, 0.1));
    }
  });

  return (
    <Float 
      speed={active ? 2 : 0} 
      rotationIntensity={0} 
      floatIntensity={active ? 0.4 : 0}
      floatingRange={[-0.05, 0.05]}
    >
      {/* Note: If your image floats too high or clips into the pillar after changing heights, 
          you can adjust the '1.8' in position={[0, 1.8, 0]} up or down! */}
      <group ref={bottleRef} position={[0, 1.8, 0]}>
        <mesh>
          {/* Apply the custom width and height to the plane */}
          <planeGeometry args={[width, height]} />
          
          <meshPhysicalMaterial 
            map={texture}
            transparent={true}
            roughness={0.15}    
            metalness={0.4}     
            clearcoat={1.0}     
            clearcoatRoughness={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </Float>
  );
}

export default SoapBottle;