import { Float, useTexture } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { products } from '../Products';

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
  
  // 1. CREATE BASE CURVE: Solves the "low quality 2D lighting" because we compute actual 3D normals!
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(planeWidth, planeHeight, 128, 128);
    const pos = geo.attributes.position;
    
    // We physically curve the plane so it already mimics a cylinder shape
    const baseDepth = 0.4; 
    
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const normX = x / (planeWidth / 2); 
      // Cosine wave creates a smooth, rounded lens shape bridging edge-to-edge
      const z = Math.cos(normX * (Math.PI / 2)) * baseDepth; 
      pos.setZ(i, z);
    }
    
    // CRITICAL: Compute normals so reflections wrap around the 3D curve naturally
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
        // SLOWED DOWN: Changed time multipliers from (2 & 3) to (0.6 & 0.4) 
        // This creates a slow, luxurious anti-gravity drift
        wobbleRef.current.rotation.y = Math.sin(time * 0.6) * 0.08;
        wobbleRef.current.rotation.x = Math.cos(time * 0.4) * 0.04;
      } else {
        wobbleRef.current.rotation.y = THREE.MathUtils.lerp(wobbleRef.current.rotation.y, 0, 0.02);
        wobbleRef.current.rotation.x = THREE.MathUtils.lerp(wobbleRef.current.rotation.x, 0, 0.02);
      }
      const targetScale = active ? 1.1 : 0.85;
      wobbleRef.current.scale.setScalar(THREE.MathUtils.lerp(wobbleRef.current.scale.x, targetScale, 0.1));
    }
  });

  return (
    <Float 
      speed={active ? 1.5 : 0} // Reduced from 2 to 1.5
      rotationIntensity={0} 
      floatIntensity={active ? 0.15 : 0} // Reduced float distance
      floatingRange={[-0.05, 0.05]}
    >
      <group ref={billboardRef} position={[0, 2.45, 0]}>
        <group ref={wobbleRef}>
          
          {/* 2. FRONT FACE */}
          <mesh geometry={geometry}>
            <meshPhysicalMaterial 
              map={texture}
              displacementMap={depthTexture}
              displacementScale={0.8} // HIGH displacement for massive 3D pop!
              transparent={true}
              alphaTest={0.05} // Trims out tiny ghosting artifacts on the edge
              roughness={0.1}
              metalness={0.1}
              clearcoat={1.0}
              clearcoatRoughness={0.05}
              envMapIntensity={2.5} // Cranks up the city reflections so it looks like shiny glass/plastic
            />
          </mesh>

          {/* 3. BACK FACE (Flipped) - Creates a fully enclosed 3D object and perfectly centers the wobble! */}
          <mesh geometry={geometry} rotation={[0, Math.PI, 0]}>
            <meshPhysicalMaterial 
              map={texture}
              displacementMap={depthTexture}
              displacementScale={0.8}
              transparent={true}
              alphaTest={0.05}
              roughness={0.1}
              metalness={0.1}
              clearcoat={1.0}
              clearcoatRoughness={0.05}
              envMapIntensity={2.5}
            />
          </mesh>

        </group>
      </group>
    </Float>
  );
}

// 4. PRELOAD TEXTURES: Stops the components from taking a long time to load and pop-in!
products.forEach((product) => {
  useTexture.preload([product.image, product.depthImage]);
});

export default SoapBottle;