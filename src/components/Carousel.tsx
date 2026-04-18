// src/components/Carousel.tsx
import { useFrame, useThree } from '@react-three/fiber';
import React, { useRef } from 'react';
import * as THREE from 'three';
import { products } from '../Products';
import Pillar from './Pillar';
import SoapBottle from './SoapBottle';

const CarouselItem = ({ product, index, activeIndex, total, isMobile }: any) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    // 1. Calculate relative distance from the active item
    let offset = index - activeIndex;
    
    // 2. Wrap-around math to keep the infinite loop working
    if (offset > total / 2) offset -= total;
    if (offset < -total / 2) offset += total;

    // 3. Keep non-active products completely OFFSCREEN
    // A gap of 15 units pushes them entirely out of the camera's view
    const spacingX = 15; 
    const targetX = offset * spacingX;
    
    // Drop them down slightly when offscreen just to ensure they are hidden
    const targetZ = offset === 0 ? 0 : -2;
    const targetY = offset === 0 ? 0 : -1;
    
    const baseScale = isMobile ? 0.6 : 1;
    const targetScale = offset === 0 ? baseScale : baseScale * 0.8;

    // 4. THE MAGIC TRICK: Prevent "Teleportation" across the screen
    // If an item wraps around from the far-left to the far-right, 
    // we instantly snap its position behind the scenes so the user never sees it moving.
    if (Math.abs(groupRef.current.position.x - targetX) > spacingX * 1.5) {
      groupRef.current.position.x = targetX;
    }

    // 5. Smoothly glide the product in/out of the frame
    const lerpSpeed = delta * 5; 
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, lerpSpeed);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, lerpSpeed);
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, lerpSpeed);
    groupRef.current.scale.setScalar(
      THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, lerpSpeed)
    );
  });

  return (
    <group ref={groupRef}>
      <Pillar />
      <SoapBottle 
        active={activeIndex === index} 
        color={product.color} 
        image={product.image} 
      />
    </group>
  );
}

const Carousel = ({ activeIndex }: { activeIndex: number }) => {
  const { viewport } = useThree();
  const isMobile = viewport.width < 5;
  
  // Keep the active product slightly off-center to make room for the typography
  const posX = isMobile ? 0 : 1.5; 

  return (
    <group position={[posX, -1.5, 0]}>
      {products.map((prod, i) => (
        <CarouselItem 
          key={prod.id}
          product={prod}
          index={i}
          activeIndex={activeIndex}
          total={products.length}
          isMobile={isMobile}
        />
      ))}
    </group>
  );
}

export default Carousel;