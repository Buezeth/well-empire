import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ShoppingCart, Menu } from 'lucide-react';
import gsap from 'gsap';
import { AnimatePresence, motion } from 'framer-motion';
import * as THREE from 'three';

const products = [
  { id: 0, title: "DIVINE CLEANSER", desc: "For multi-purpose cleaning - 1L", color: "#0033aa" },
  { id: 1, title: "AURA WASH", desc: "Gentle foaming hand soap - 500ml", color: "#aa3300" },
  { id: 2, title: "LUNAR ELIXIR", desc: "Overnight restorative wash - 250ml", color: "#33aa00" },
  { id: 3, title: "SOLAR SCRUB", desc: "Exfoliating body polish - 400g", color: "#aa00aa" },
];

function Pillar() {
  return (
    <group position={[0, -2.5, 0]}>
      {/* Main column */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 5, 32]} />
        <meshStandardMaterial color="#888888" roughness={0.9} metalness={0.1} />
      </mesh>
      {/* Fluting (ridges) */}
      {Array.from({ length: 16 }).map((_, i) => (
        <mesh key={i} castShadow receiveShadow position={[Math.sin(i * Math.PI / 8) * 0.8, 0, Math.cos(i * Math.PI / 8) * 0.8]}>
          <cylinderGeometry args={[0.05, 0.05, 5, 8]} />
          <meshStandardMaterial color="#888888" roughness={0.9} metalness={0.1} />
        </mesh>
      ))}
      {/* Top cap */}
      <mesh castShadow receiveShadow position={[0, 2.6, 0]}>
        <cylinderGeometry args={[1, 1, 0.2, 32]} />
        <meshStandardMaterial color="#888888" roughness={0.9} metalness={0.1} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 2.8, 0]}>
        <cylinderGeometry args={[0.9, 0.9, 0.2, 32]} />
        <meshStandardMaterial color="#888888" roughness={0.9} metalness={0.1} />
      </mesh>
      {/* Base */}
      <mesh castShadow receiveShadow position={[0, -2.6, 0]}>
        <cylinderGeometry args={[1, 1, 0.2, 32]} />
        <meshStandardMaterial color="#888888" roughness={0.9} metalness={0.1} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, -2.8, 0]}>
        <cylinderGeometry args={[1.1, 1.1, 0.2, 32]} />
        <meshStandardMaterial color="#888888" roughness={0.9} metalness={0.1} />
      </mesh>
    </group>
  );
}

function SoapBottle({ active, color }) {
  const bottleRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (active && bottleRef.current) {
      bottleRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    } else if (bottleRef.current) {
      bottleRef.current.rotation.y = 0;
    }
  });

  return (
    <group ref={bottleRef} position={[0, 1.3, 0]}>
      {/* Bottle Body */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <capsuleGeometry args={[0.5, 0.8, 16, 32]} />
        <meshPhysicalMaterial 
          color={color}
          transmission={1}
          ior={1.33}
          roughness={0.1}
          thickness={1.5}
          envMapIntensity={1}
          clearcoat={1}
        />
      </mesh>
      {/* Neck */}
      <mesh castShadow receiveShadow position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.15, 0.4, 0.3, 32]} />
        <meshPhysicalMaterial 
          color={color}
          transmission={1}
          ior={1.33}
          roughness={0.1}
          thickness={1.5}
        />
      </mesh>
      {/* Cap */}
      <mesh castShadow receiveShadow position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.4, 16]} />
        <meshStandardMaterial color="#050814" roughness={0.4} />
      </mesh>
      {/* Pump spout */}
      <mesh castShadow receiveShadow position={[0.1, 1.3, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <cylinderGeometry args={[0.05, 0.05, 0.3, 8]} />
        <meshStandardMaterial color="#050814" roughness={0.4} />
      </mesh>
      {/* Label */}
      <mesh position={[0, 0, 0.51]} rotation={[0, 0, 0]}>
        <planeGeometry args={[0.5, 0.8]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </mesh>
    </group>
  );
}

function Carousel({ activeIndex, rotationTarget }: { activeIndex: number, rotationTarget: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  const isMobile = viewport.width < 5;

  useEffect(() => {
    if (groupRef.current) {
      gsap.to(groupRef.current.rotation, {
        y: rotationTarget,
        duration: 1.5,
        ease: "power3.out"
      });
    }
  }, [rotationTarget]);

  const radius = isMobile ? 3 : 4;
  const scale = isMobile ? 0.6 : 1;
  const posX = isMobile ? 0 : 2;

  return (
    <group ref={groupRef} position={[posX, -1, 0]} scale={scale}>
      {products.map((prod, i) => {
        const angle = i * (Math.PI / 2);
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;
        
        return (
          <group key={prod.id} position={[x, 0, z]} rotation={[0, angle, 0]}>
            <Pillar />
            <SoapBottle active={activeIndex === i} color={prod.color} />
          </group>
        );
      })}
    </group>
  );
}

export default function App() {
  const [activeIndex, setActiveIndex] = useState(0);
  const rotationTarget = useRef(0);
  const isScrolling = useRef(false);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isScrolling.current) return;
      
      if (e.deltaY > 50) {
        isScrolling.current = true;
        rotationTarget.current -= Math.PI / 2;
        setActiveIndex((prev) => (prev + 1) % products.length);
        setTimeout(() => isScrolling.current = false, 1500);
      } else if (e.deltaY < -50) {
        isScrolling.current = true;
        rotationTarget.current += Math.PI / 2;
        setActiveIndex((prev) => (prev - 1 + products.length) % products.length);
        setTimeout(() => isScrolling.current = false, 1500);
      }
    };

    window.addEventListener('wheel', handleWheel);
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <div className="w-screen h-screen bg-[#020205] md:p-4 flex items-center justify-center overflow-hidden">
      <main className="relative w-full h-full bg-[#050814] md:rounded-[32px] overflow-hidden shadow-2xl">
        
        {/* Vignette Overlay */}
        <div className="absolute inset-0 vignette z-10"></div>

        {/* Atmospheric Background Text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.h1 
              key={activeIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 0.05, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 1.5 }}
              className="text-[25vw] font-display text-white blur-[8px] whitespace-nowrap select-none"
            >
              {products[activeIndex].title}
            </motion.h1>
          </AnimatePresence>
        </div>

        {/* 3D Canvas */}
        <div className="absolute inset-0 z-0">
          <Canvas shadows camera={{ position: [0, 1, 10], fov: 45 }}>
            <ambientLight intensity={0.2} color="#0A1128" />
            <directionalLight 
              position={[10, 20, 10]} 
              intensity={2.5} 
              color="#E6F0FF" 
              castShadow 
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              shadow-camera-far={50}
              shadow-camera-left={-10}
              shadow-camera-right={10}
              shadow-camera-top={10}
              shadow-camera-bottom={-10}
            />
            <Carousel activeIndex={activeIndex} rotationTarget={rotationTarget.current} />
          </Canvas>
        </div>

        {/* UI Layer */}
        <div className="absolute inset-0 z-20 pointer-events-none p-6 md:p-12 flex flex-col justify-between">
          
          {/* Top Bar */}
          <div className="flex justify-between items-start w-full">
            <div className="font-serif text-[#D4AF37] text-xl md:text-2xl font-bold tracking-widest pointer-events-auto cursor-pointer">
              WELL EMPIRE
            </div>
            
            <div className="hidden md:flex items-center space-x-4 pointer-events-auto">
              <span className="font-mono text-sm tracking-[0.15em] hover:opacity-70 transition-opacity cursor-pointer">CART</span>
              <ShoppingCart size={18} className="cursor-pointer hover:opacity-70 transition-opacity" />
              <span className="font-mono text-base font-medium ml-2">$45.00</span>
            </div>
            
            <div className="md:hidden pointer-events-auto cursor-pointer">
              <Menu size={24} className="text-white" />
            </div>
          </div>

          {/* Middle Right Nav */}
          <div className="hidden md:flex absolute right-12 top-1/2 -translate-y-1/2 flex-col space-y-8 pointer-events-auto">
            {['STORE', 'CLEANSERS', 'ABOUT'].map((item) => (
              <span key={item} className="font-mono text-xs tracking-[0.15em] text-white/70 hover:text-white transition-colors cursor-pointer" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                {item}
              </span>
            ))}
          </div>

          {/* Bottom Left Product Info (Desktop) / Top Center (Mobile) */}
          <div className="w-full md:w-1/2 pointer-events-auto absolute md:relative top-24 md:top-auto left-0 md:left-auto px-6 md:px-0 text-center md:text-left">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center md:items-start"
              >
                <h2 className="font-display text-5xl md:text-[80px] leading-[0.9] tracking-tight text-white mb-2 md:mb-4">
                  {products[activeIndex].title.split(' ').map((word, i) => (
                    <span key={i} className="block">{word}</span>
                  ))}
                </h2>
                <p className="font-mono text-xs md:text-base text-white/80 max-w-sm">
                  {products[activeIndex].desc}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>

        {/* Crosshairs */}
        <div className="absolute top-1/4 left-1/4 text-white/20 text-xs font-mono pointer-events-none hidden md:block">+</div>
        <div className="absolute bottom-1/4 right-1/3 text-white/20 text-xs font-mono pointer-events-none hidden md:block">+</div>
        <div className="absolute top-2/3 left-1/3 text-white/20 text-xs font-mono pointer-events-none hidden md:block">+</div>
        <div className="absolute top-1/3 right-1/4 text-white/20 text-xs font-mono pointer-events-none hidden md:block">+</div>
        
      </main>
    </div>
  );
}
