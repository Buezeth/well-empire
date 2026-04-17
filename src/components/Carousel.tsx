// src/components/Carousel.tsx
import { useThree } from '@react-three/fiber';
import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { products } from '../Products';
import Pillar from './Pillar';
import SoapBottle from './SoapBottle';
import gsap from 'gsap';

const Carousel = ({ activeIndex, rotationTarget }: { activeIndex: number, rotationTarget: number }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  const isMobile = viewport.width < 5;

  useEffect(() => {
    if (groupRef.current) {
      gsap.to(groupRef.current.rotation, {
        y: rotationTarget,
        duration: 1.2,
        ease: "power3.inOut"
      });
    }
  }, [rotationTarget]);

  const radius = isMobile ? 3 : 4.5; 
  const scale = isMobile ? 0.6 : 1;
  const posX = isMobile ? 0 : 1;

  return (
    <group ref={groupRef} position={[posX, -1.5, 0]} scale={scale}>
      {products.map((prod, i) => {
        const angle = i * (Math.PI / 2);
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;
        
        return (
          <group key={prod.id} position={[x, 0, z]} rotation={[0, angle, 0]}>
            <Pillar />
            <SoapBottle 
              active={activeIndex === i} 
              color={prod.color} 
              image={prod.image} 
              // Notice we removed the width and height props here!
            />
          </group>
        );
      })}
    </group>
  );
}

export default Carousel;