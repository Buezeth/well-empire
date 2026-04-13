import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import React, { useEffect, useRef, useState } from 'react';
import { products } from '../Products';
import { ContactShadows, Environment, Float } from '@react-three/drei';
import { AnimatePresence, motion } from 'framer-motion';
import Carousel from './Carousel';
import { ChevronLeft, ChevronRight, Menu, ShoppingCart } from 'lucide-react';

const Visuals3D = () => {
  const [activeIndex, setActiveIndex] = useState(0);
    const rotationTarget = useRef(0);
    const isScrolling = useRef(false);
  
    const nextProduct = () => {
      if (isScrolling.current) return;
      isScrolling.current = true;
      rotationTarget.current -= Math.PI / 2;
      setActiveIndex((prev) => (prev + 1) % products.length);
      setTimeout(() => isScrolling.current = false, 1200);
    };
  
    const prevProduct = () => {
      if (isScrolling.current) return;
      isScrolling.current = true;
      rotationTarget.current += Math.PI / 2;
      setActiveIndex((prev) => (prev - 1 + products.length) % products.length);
      setTimeout(() => isScrolling.current = false, 1200);
    };
  
    useEffect(() => {
      const handleWheel = (e: WheelEvent) => {
        if (e.deltaY > 50) nextProduct();
        else if (e.deltaY < -50) prevProduct();
      };
      window.addEventListener('wheel', handleWheel);
      return () => window.removeEventListener('wheel', handleWheel);
    }, []);
  
    return (
      <div className="w-screen h-screen bg-black md:p-4 flex items-center justify-center overflow-hidden font-sans">
        
        {/* Dynamic Background Container */}
        <motion.main 
          initial={{ backgroundColor: products[0].bgColor }}
          animate={{ backgroundColor: products[activeIndex].bgColor }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="relative w-full h-full md:rounded-4xl overflow-hidden shadow-2xl"
        >
          
          {/* Soft Center Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] pointer-events-none z-10"></div>
  
          {/* Giant Background Typography */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden mix-blend-overlay opacity-30">
            <AnimatePresence mode="wait">
              <motion.h1 
                key={activeIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="text-[30vw] font-display text-white whitespace-nowrap select-none leading-none tracking-tighter"
              >
                {products[activeIndex].title.split(' ')[0]}
              </motion.h1>
            </AnimatePresence>
          </div>
  
          {/* 3D Canvas */}
          <div className="absolute inset-0 z-10 pointer-events-none">
            <Canvas shadows camera={{ position: [0, 1, 12], fov: 40 }} style={{ pointerEvents: 'auto' }}>
              
              {/* Brightened Lighting Setup */}
              <ambientLight intensity={1.5} color="#ffffff" />
              <directionalLight 
                position={[10, 20, 10]} 
                intensity={3} 
                color="#ffffff" 
                castShadow 
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
              />
              <spotLight 
                position={[-10, 5, -10]} 
                angle={0.5} 
                penumbra={1} 
                intensity={5} 
                color={products[activeIndex].color}
              />
              
              {/* Environment map for beautiful glass reflections */}
              <Environment preset="city" />
              
              <Carousel activeIndex={activeIndex} rotationTarget={rotationTarget.current} />
              
              {/* Ground Shadows aligned to bottom of the pillars */}
              <ContactShadows position={[0, -4.0, 0]} opacity={0.6} scale={25} blur={2.5} far={10} />
            </Canvas>
          </div>
  
          {/* UI Layer */}
          <div className="absolute inset-0 z-20 pointer-events-none p-6 md:p-12 flex flex-col justify-between">
            
            {/* Top Bar */}
            <div className="flex justify-between items-start w-full">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-bold text-xl pointer-events-auto cursor-pointer">
                  W
                </div>
                <div className="font-sans text-white text-lg font-bold tracking-widest pointer-events-auto cursor-pointer hidden md:block">
                  WELL EMPIRE
                </div>
              </div>
              
              <div className="hidden md:flex items-center space-x-6 pointer-events-auto">
                <span className="font-mono text-xs tracking-[0.2em] text-white/60 hover:text-white transition-colors cursor-pointer">STORE</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs tracking-[0.2em]">CART</span>
                  <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors">
                    <ShoppingCart size={14} />
                  </div>
                  <span className="font-mono text-sm font-medium">$45.00</span>
                </div>
              </div>
              
              <div className="md:hidden pointer-events-auto cursor-pointer">
                <Menu size={24} className="text-white" />
              </div>
            </div>
  
            {/* Middle Right Nav (Vertical) */}
            <div className="hidden md:flex absolute right-12 top-1/2 -translate-y-1/2 flex-col space-y-12 pointer-events-auto">
              {['STORE', 'CLEANSERS', 'NFTS'].map((item, idx) => (
                <span 
                  key={item} 
                  className={`font-mono text-xs tracking-[0.2em] transition-colors cursor-pointer ${idx === 1 ? 'text-white' : 'text-white/40 hover:text-white/80'}`} 
                  style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                >
                  {item}
                </span>
              ))}
            </div>
  
            {/* Bottom Left Product Info */}
            <div className="w-full md:w-1/2 pointer-events-auto absolute bottom-24 md:bottom-12 left-6 md:left-12 text-left">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <div className="font-mono text-xs text-white/50 tracking-[0.2em] mb-4">
                    {(activeIndex + 1).toString().padStart(3, '0')}
                  </div>
                  <h2 className="font-display text-6xl md:text-[100px] leading-[0.85] tracking-tight text-white mb-6 uppercase">
                    {products[activeIndex].title.split(' ').map((word, i) => (
                      <span key={i} className="block">{word}</span>
                    ))}
                  </h2>
                  <p className="font-mono text-xs md:text-sm text-white/60 max-w-sm leading-relaxed">
                    {products[activeIndex].desc}
                    <br/><br/>
                    Formulated with rare botanical extracts for the ultimate cleansing experience.
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
  
            {/* Bottom Center Navigation Controls */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-auto flex items-center gap-6">
              <button 
                onClick={prevProduct}
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="flex gap-2">
                {products.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all duration-500 ${activeIndex === i ? 'w-8 bg-white' : 'w-2 bg-white/20'}`}
                  />
                ))}
              </div>
              <button 
                onClick={nextProduct}
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <ChevronRight size={18} />
              </button>
            </div>
  
          </div>
  
          {/* Subtle Decorative Crosshairs */}
          <div className="absolute top-[20%] left-[30%] text-white/10 text-xs font-mono pointer-events-none hidden md:block">+</div>
          <div className="absolute bottom-[30%] right-[25%] text-white/10 text-xs font-mono pointer-events-none hidden md:block">+</div>
          
        </motion.main>
      </div>
    );
}



export default Visuals3D