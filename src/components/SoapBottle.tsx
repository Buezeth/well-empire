// src/components/SoapBottle.tsx
import { Float, useTexture } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const SoapBottle = ({ active, image }: { active: boolean, color: string, image: string }) => {
  // We use two separate groups now: 
  // One perfectly tracks the camera, the other handles the wobble animation.
  const billboardRef = useRef<THREE.Group>(null);
  const wobbleRef = useRef<THREE.Group>(null);
  
  // Load your custom PNG
  const texture = useTexture(image);
  const { gl } = useThree();

  // 1. MAXIMIZE IMAGE QUALITY
  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = gl.capabilities.getMaxAnisotropy(); // Prevents blurriness
    texture.minFilter = THREE.LinearMipMapLinearFilter;
    texture.needsUpdate = true;
  }, [texture, gl]);

  // 2. AUTOMATICALLY CALCULATE PERFECT DIMENSIONS
  // We lock the height to 4.5 so it sits perfectly on the pedestal.
  // We automatically calculate the width based on your actual PNG file's aspect ratio!
  const planeHeight = 4.5;
  const planeWidth = planeHeight * (texture.image.width / texture.image.height);

  useFrame(({ camera, clock }) => {
    if (billboardRef.current) {
      // 3. FLAWLESS Y-AXIS BILLBOARDING
      // Find exactly where the bottle is in the 3D world
      const worldPos = new THREE.Vector3();
      billboardRef.current.getWorldPosition(worldPos);
      
      // Tell the bottle to look at the camera, but keep the target at the exact same height.
      // This forces the bottle to only spin left/right (Y-axis) and never tilt up/down.
      const target = new THREE.Vector3(camera.position.x, worldPos.y, camera.position.z);
      billboardRef.current.lookAt(target);
    }

    if (wobbleRef.current) {
      // 4. CLEAN 3D WOBBLE ANIMATION
      if (active) {
        const time = clock.elapsedTime;
        wobbleRef.current.rotation.y = Math.sin(time * 2) * 0.15;
        wobbleRef.current.rotation.x = Math.sin(time * 3) * 0.05;
      } else {
        wobbleRef.current.rotation.y = THREE.MathUtils.lerp(wobbleRef.current.rotation.y, 0, 0.1);
        wobbleRef.current.rotation.x = THREE.MathUtils.lerp(wobbleRef.current.rotation.x, 0, 0.1);
      }

      // Smoothly scale up the active item
      const targetScale = active ? 1.1 : 0.85;
      wobbleRef.current.scale.setScalar(THREE.MathUtils.lerp(wobbleRef.current.scale.x, targetScale, 0.1));
    }
  });

  return (
    <Float 
      speed={active ? 2 : 0} 
      rotationIntensity={0} 
      floatIntensity={active ? 0.3 : 0}
      floatingRange={[-0.05, 0.05]}
    >
      {/* Base group that safely rotates to face the user */}
      <group ref={billboardRef} position={[0, 2.45, 0]}>
        
        {/* Inner group that handles the shiny wobble */}
        <group ref={wobbleRef}>
          <mesh>
            {/* The plane is now automatically perfectly sized to your PNG */}
            <planeGeometry args={[planeWidth, planeHeight]} />
            
            <meshPhysicalMaterial 
              map={texture}
              transparent={true}
              alphaTest={0.01} // Removes nasty white fringes from PNG edges
              roughness={0.15}    
              metalness={0.3}     
              clearcoat={1.0}     
              clearcoatRoughness={0.1}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>

      </group>
    </Float>
  );
}

export default SoapBottle;