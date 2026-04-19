import { Float, useTexture } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

const SoapBottle = ({ active, color, image, depthImage }: { active: boolean, color: string, image: string, depthImage: string }) => {
  const billboardRef = useRef<THREE.Group>(null);
  const wobbleRef = useRef<THREE.Group>(null);
  
  const [texture, depthTexture] = useTexture([image, depthImage]);
  const { gl } = useThree();

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = gl.capabilities.getMaxAnisotropy(); 
    texture.minFilter = THREE.LinearMipMapLinearFilter;
    texture.needsUpdate = true;

    depthTexture.anisotropy = gl.capabilities.getMaxAnisotropy();
    depthTexture.minFilter = THREE.LinearMipMapLinearFilter;
    depthTexture.needsUpdate = true;
  },[texture, depthTexture, gl]);

  const planeHeight = 4.5;
  const txtImg: any = texture.image;
  const planeWidth = planeHeight * (txtImg.width / txtImg.height);
  
  // 1. THE CURVE TRICK: Physically bend the flat plane into a 3D cylinder shape!
  const geometry = useMemo(() => {
    // We need lots of segments (128x128) so the curve and displacement map are smooth
    const geo = new THREE.PlaneGeometry(planeWidth, planeHeight, 128, 128);
    const pos = geo.attributes.position;
    
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      // Normalize X distance from center (-1 to 1)
      const normX = x / (planeWidth / 2); 
      // Push the center vertices forward using a cosine wave, creating a perfect bottle curve
      const z = Math.cos(normX * (Math.PI / 2)) * 0.4; 
      pos.setZ(i, z);
    }
    
    // CRITICAL: Recalculate how light bounces off the new curved shape
    geo.computeVertexNormals(); 
    return geo;
  }, [planeWidth, planeHeight]);

  useFrame(({ camera, clock }) => {
    if (billboardRef.current) {
      const worldPos = new THREE.Vector3();
      billboardRef.current.getWorldPosition(worldPos);
      const target = new THREE.Vector3(camera.position.x, worldPos.y, camera.position.z);
      billboardRef.current.lookAt(target);
    }

    if (wobbleRef.current) {
      if (active) {
        const time = clock.elapsedTime;
        wobbleRef.current.rotation.y = Math.sin(time * 2) * 0.15;
        wobbleRef.current.rotation.x = Math.sin(time * 3) * 0.05;
      } else {
        wobbleRef.current.rotation.y = THREE.MathUtils.lerp(wobbleRef.current.rotation.y, 0, 0.01);
        wobbleRef.current.rotation.x = THREE.MathUtils.lerp(wobbleRef.current.rotation.x, 0, 0.01);
      }
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
      <group ref={billboardRef} position={[0, 2.45, 0]}>
        <group ref={wobbleRef}>
          {/* 2. Apply our custom curved geometry */}
          <mesh geometry={geometry}>
            
            {/* 3. SHADER UPGRADES: Make it look like real liquid & plastic */}
            <meshPhysicalMaterial 
              map={texture}
              displacementMap={depthTexture}
              displacementScale={1}   // Reduced so the AI depth map doesn't distort the image
              transparent={true}
              alphaTest={0.1}           // Increased slightly to trim jagged/ghosted edges
              roughness={0.1}           // Super glossy
              metalness={0.1}
              clearcoat={1.0}           // Adds a secondary "wet" highlight layer
              clearcoatRoughness={0.05}
              transmission={0.15}       // Allows a tiny bit of light through like real plastic/liquid
              thickness={0.5}           // Gives the material internal volume
              envMapIntensity={1.5}     // Forces it to reflect the city environment map brightly
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      </group>
    </Float>
  );
}

export default SoapBottle;