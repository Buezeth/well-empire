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
    
    let offset = index - activeIndex;
    
    if (offset > total / 2) offset -= total;
    if (offset < -total / 2) offset += total;

    const spacingX = 15; 
    const targetX = offset * spacingX;
    
    const targetZ = offset === 0 ? 0 : -2;
    const targetY = offset === 0 ? 0 : -1;
    
    // 1. INCREASED SCALE: Makes the hero product much larger
    const baseScale = isMobile ? 0.9 : 1.45; 
    const targetScale = offset === 0 ? baseScale : baseScale * 0.8;

    if (Math.abs(groupRef.current.position.x - targetX) > spacingX * 1.5) {
      groupRef.current.position.x = targetX;
    }

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
        depthImage={product.depthImage}
      />
    </group>
  );
}

const Carousel = ({ activeIndex }: { activeIndex: number }) => {
  const { viewport } = useThree();
  const isMobile = viewport.width < 5;
  
  // 2. ADJUSTED POSITION: Brings the product slightly closer to the center
  const posX = isMobile ? 0 : 0.8; 

  return (
    <group position={[posX, -2.5, 0]}>
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