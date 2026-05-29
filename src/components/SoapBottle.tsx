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
  }, [texture, depthTexture, gl]);

  const planeHeight = 4.5;
  const txtImg: any = texture.image;
  const aspectRatio = txtImg ? txtImg.width / txtImg.height : 1;
  const planeWidth = planeHeight * aspectRatio;
  
  // 1. CREATE SOLID 3D VOLUME CURVE (Tapers to 0 at edges to seal the bottle)
  const geometry = useMemo(() => {
    // 32x32 vertices is optimal for a smooth curve; bump mapping handles the high-detail shading
    const geo = new THREE.PlaneGeometry(planeWidth, planeHeight, 32, 32);
    const pos = geo.attributes.position;
    
    // Increased depth to give a physically rounded, solid-looking bottle
    const baseDepth = 1; 
    
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const normX = x / (planeWidth / 2); 
      // Cosine wave curves the bottle outwards in the center, tapering to 0 at the edges
      const z = Math.cos(normX * (Math.PI / 2)) * baseDepth; 
      pos.setZ(i, z);
    }
    
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
      speed={active ? 1.5 : 0} 
      rotationIntensity={0} 
      floatIntensity={active ? 0.15 : 0} 
      floatingRange={[-0.05, 0.05]}
    >
      <group ref={billboardRef} position={[0, 2.45, 0]}>
        <group ref={wobbleRef}>
          
          {/* 2. FRONT FACE */}
          <mesh geometry={geometry}>
            <meshPhysicalMaterial 
              map={texture}
              // We use a bump map for clean, high-resolution 3D reflections and surface details
              bumpMap={depthTexture}
              bumpScale={0.18}
              // We use a very subtle displacement just to give the labels a tiny physical depth pop
              displacementMap={depthTexture}
              displacementScale={0.06}
              transparent={true}
              alphaTest={0.05} 
              roughness={0.12}
              metalness={0.05}
              clearcoat={1.0}
              clearcoatRoughness={0.08}
              envMapIntensity={3.0} // Emphasizes the city environment reflection map
            />
          </mesh>

          {/* 3. BACK FACE (Flipped) */}
          <mesh geometry={geometry} rotation={[0, Math.PI, 0]}>
            <meshPhysicalMaterial 
              map={texture}
              bumpMap={depthTexture}
              bumpScale={0.18}
              displacementMap={depthTexture}
              displacementScale={0.06}
              transparent={true}
              alphaTest={0.05}
              roughness={0.12}
              metalness={0.05}
              clearcoat={1.0}
              clearcoatRoughness={0.08}
              envMapIntensity={3.0}
            />
          </mesh>

        </group>
      </group>
    </Float>
  );
}

products.forEach((product) => {
  useTexture.preload([product.image, product.depthImage]);
});

export default SoapBottle;