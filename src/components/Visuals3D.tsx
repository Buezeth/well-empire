// src/components/Visuals3D.tsx
import React, { useEffect, useRef, useState } from 'react';
import { products } from '../Products';
import { AnimatePresence, motion } from 'framer-motion';
import DepthMapViewer from './DepthMapViewer';
import BreezeEffect from './BreezeEffect'; // <-- 1. Import the Breeze effect
import { ChevronLeft, ChevronRight, Menu, ShoppingCart } from 'lucide-react';

// ==========================================
// TOGGLE THIS TO COMPARE BOTH STYLES LIVE:
// true = Bold Editorial (Giant background text behind the product)
// false = Ultra-Minimalist (No background text)
// ==========================================
const SHOW_BACKGROUND_TEXT = true;

// Continuous, beveled pattern border framing the container perfectly
const SubtleAfricanBorders = ({ isLight }: { isLight: boolean }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const strokeWidth = 16;
  const halfStroke = strokeWidth / 2;
  // Outer radius of 32px matches the container's md:rounded-4xl (32px) perfectly
  const radius = isMobile ? 0 : 24; 

  return (
    <div 
      className={`absolute inset-0 pointer-events-none z-10 transition-colors duration-500 ${
        isLight 
          ? 'text-neutral-950/[0.04]' 
          : 'text-white/[0.05]'
      }`}
    >
      <svg className="w-full h-full overflow-hidden">
        <defs>
          {/* Symmetrical repeating geometric tribal pattern tile */}
          <pattern id="african-tribal-border" width="40" height="40" patternUnits="userSpaceOnUse" viewBox="0 0 40 40">
            {/* Soft geometric diagonal guidelines */}
            <path d="M0 0 L40 40 M40 0 L0 40" stroke="currentColor" strokeWidth="0.5" opacity="0.15" fill="none" />
            
            {/* Dual nested diamond rings */}
            <polygon points="20,4 36,20 20,36 4,20" stroke="currentColor" strokeWidth="1.2" fill="none" />
            <polygon points="20,10 30,20 20,30 10,20" stroke="currentColor" strokeWidth="0.8" fill="none" />
            
            {/* Center core dot */}
            <circle cx="20" cy="20" r="2" fill="currentColor" />

            {/* Corner geometric triangles */}
            <polygon points="0,0 8,0 0,8" fill="currentColor" opacity="0.4" />
            <polygon points="40,0 32,0 40,8" fill="currentColor" opacity="0.4" />
            <polygon points="0,40 8,40 0,32" fill="currentColor" opacity="0.4" />
            <polygon points="40,40 32,40 40,32" fill="currentColor" opacity="0.4" />

            {/* Framing dots */}
            <circle cx="20" cy="1" r="1.5" fill="currentColor" />
            <circle cx="20" cy="39" r="1.5" fill="currentColor" />
            <circle cx="1" cy="20" r="1.5" fill="currentColor" />
            <circle cx="39" cy="20" r="1.5" fill="currentColor" />
          </pattern>
        </defs>
        
        {/* Rounded rectangle frame following the bevel exactly with zero sharp cuts */}
        <rect 
          style={{
            x: `${halfStroke}px`,
            y: `${halfStroke}px`,
            width: `calc(100% - ${strokeWidth}px)`,
            height: `calc(100% - ${strokeWidth}px)`
          }}
          rx={radius} 
          ry={radius} 
          fill="none" 
          stroke="url(#african-tribal-border)" 
          strokeWidth={strokeWidth} 
          className="transition-all duration-500"
        />
      </svg>
    </div>
  );
};

const Visuals3D = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const isScrolling = useRef(false);
  
  const currentProduct = products[activeIndex];
  const isLight = currentProduct.isLight ?? false;

  const nextProduct = () => {
    if (isScrolling.current) return;
    isScrolling.current = true;
    setActiveIndex((prev) => (prev + 1) % products.length);
    setTimeout(() => isScrolling.current = false, 500);
  };

  const prevProduct = () => {
    if (isScrolling.current) return;
    isScrolling.current = true;
    setActiveIndex((prev) => (prev - 1 + products.length) % products.length);
    setTimeout(() => isScrolling.current = false, 500);
  };
  
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > 50) nextProduct();
      else if (e.deltaY < -50) prevProduct();
    };
    window.addEventListener('wheel', handleWheel);
    return () => window.removeEventListener('wheel', handleWheel);
  }, [activeIndex]);
  
  return (
    <div className="w-screen h-screen bg-black md:p-4 flex items-center justify-center overflow-hidden font-sans">
      
      {/* Dynamic Background Container */}
      <motion.main 
        initial={{ backgroundColor: products[0].bgColor }}
        animate={{ backgroundColor: currentProduct.bgColor }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
        className="relative w-full h-full md:rounded-4xl overflow-hidden shadow-2xl"
      >
        
        {/* Subtle African Beveled Border Frame */}
        <SubtleAfricanBorders isLight={isLight} />

        {/* Soft Center Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.65)_100%)] pointer-events-none z-10"></div>

        {/* Giant Background Typography */}
        {SHOW_BACKGROUND_TEXT && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.h1 
                key={activeIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                className={`text-[30vw] font-display whitespace-nowrap select-none leading-none tracking-tighter transition-colors duration-500 ${
                  isLight 
                    ? 'text-neutral-950/[0.05]' 
                    : 'text-white/15 mix-blend-overlay'
                }`}
              >
                {currentProduct.title.split(' ')[0]}
              </motion.h1>
            </AnimatePresence>
          </div>
        )}

        {/* --- LAYER 1: BACK BREEZE (Rendered behind the physical bottle with depth blur) --- */}
        <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden">
          <BreezeEffect activeIndex={activeIndex} layer="back" />
        </div>

        {/* Responsive Parallax Area */}
        <div className="absolute inset-0 flex items-center justify-center z-10 overflow-hidden pointer-events-none">
          {/* 1. Increased parent height from h-[75vh] to h-[85vh] */}
          <div className="relative w-full h-[85vh] max-w-5xl flex items-center justify-center">
            {products.map((product, i) => {
              const isActive = i === activeIndex;

              return (
                <motion.div
                  key={product.id}
                  style={{
                    position: 'absolute',
                  }}
                  animate={{
                    y: isActive ? -10 : 40,
                    // 2. Increased active scale from 1.35 to 1.55
                    scale: isActive ? 1.55 : 0.75, 
                    opacity: isActive ? 1 : 0.0, 
                    zIndex: isActive ? 10 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  // 3. Expanded layout bounds:
                  //    - Width: w-[85vw] -> w-[90vw] | md:w-[45vw] -> md:w-[50vw]
                  //    - Height: h-[60vh] -> h-[70vh] | md:h-[80vh] -> md:h-[90vh]
                  //    - Max bounds: max-w-[450px] -> max-w-[550px] | max-h-[750px] -> max-h-[850px]
                  className="w-[90vw] md:w-[50vw] h-[70vh] md:h-[90vh] max-w-[550px] max-h-[850px] flex items-center justify-center pointer-events-auto"
                >
                  <DepthMapViewer
                    image={product.image}
                    depthImage={product.depthImage}
                    active={isActive}
                    color={product.color}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* --- LAYER 2: FRONT BREEZE (Rendered crisp on top of the bottle) --- */}
        <div className="absolute inset-0 z-[15] pointer-events-none overflow-hidden">
          <BreezeEffect activeIndex={activeIndex} layer="front" />
        </div>

        {/* UI Layer */}
        <div className="absolute inset-0 z-20 pointer-events-none p-6 md:p-12 flex flex-col justify-between">
          
          {/* Top Bar */}
          <div className="flex justify-between items-start w-full">
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xl pointer-events-auto cursor-pointer transition-colors duration-500 ${
                isLight ? 'bg-neutral-900 text-white' : 'bg-white text-black'
              }`}>
                W
              </div>
              <div className={`font-sans text-lg font-bold tracking-widest pointer-events-auto cursor-pointer hidden md:block transition-colors duration-500 ${
                isLight ? 'text-neutral-900' : 'text-white'
              }`}>
                WELL EMPIRE
              </div>
            </div>
            
            <div className={`hidden md:flex items-center space-x-6 pointer-events-auto transition-colors duration-500 ${
              isLight ? 'text-neutral-900' : 'text-white'
            }`}>
              <span className={`font-mono text-xs tracking-[0.2em] transition-colors cursor-pointer ${
                isLight ? 'text-neutral-900/60 hover:text-neutral-900' : 'text-white/60 hover:text-white'
              }`}>STORE</span>
              <div className="flex items-center gap-3">
                <span className={`font-mono text-xs tracking-[0.2em] ${isLight ? 'text-neutral-900/60' : 'text-white/60'}`}>CART</span>
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center cursor-pointer transition-colors ${
                  isLight ? 'border-neutral-900/20 hover:bg-neutral-900/5' : 'border-white/20 hover:bg-white/10'
                }`}>
                  <ShoppingCart size={14} className={isLight ? 'text-neutral-900' : 'text-white'} />
                </div>
                <span className="font-mono text-sm font-medium">$45.00</span>
              </div>
            </div>
            
            <div className="md:hidden pointer-events-auto cursor-pointer">
              <Menu size={24} className={isLight ? 'text-neutral-900' : 'text-white'} />
            </div>
          </div>

          {/* Middle Right Nav (Vertical Layout Fixed) */}
          <div className="hidden md:flex absolute right-12 top-1/2 -translate-y-1/2 flex-col space-y-10 pointer-events-auto items-center">
            {['STORE', 'CLEANSERS', 'NFTS'].map((item, idx) => (
              <span 
                key={item} 
                className={`font-mono text-xs tracking-[0.2em] transition-colors cursor-pointer block ${
                  idx === 1 
                    ? (isLight ? 'text-neutral-900 font-bold' : 'text-white font-bold') 
                    : (isLight ? 'text-neutral-900/40 hover:text-neutral-900/80' : 'text-white/40 hover:text-white/80')
                }`} 
                style={{ writingMode: 'vertical-rl' }}
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
                <div className={`font-mono text-xs tracking-[0.2em] mb-4 transition-colors duration-500 ${
                  isLight ? 'text-neutral-900/40' : 'text-white/50'
                }`}>
                  {(activeIndex + 1).toString().padStart(3, '0')}
                </div>
                <h2 className={`font-display text-6xl md:text-[100px] leading-[0.85] tracking-tight mb-6 uppercase transition-colors duration-500 ${
                  isLight ? 'text-neutral-900' : 'text-white'
                }`}>
                  {currentProduct.title.split(' ').map((word, i) => (
                    <span key={i} className="block">{word}</span>
                  ))}
                </h2>
                <p className={`font-mono text-xs md:text-sm max-w-sm leading-relaxed transition-colors duration-500 ${
                  isLight ? 'text-neutral-800/75' : 'text-white/60'
                }`}>
                  {currentProduct.desc}
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
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                isLight 
                  ? 'border-neutral-900/20 text-neutral-900/60 hover:text-neutral-900 hover:bg-neutral-900/5' 
                  : 'border-white/20 text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-2">
              {products.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    activeIndex === i 
                      ? (isLight ? 'w-8 bg-neutral-900' : 'w-8 bg-white') 
                      : (isLight ? 'w-2 bg-neutral-900/10' : 'w-2 bg-white/20')
                  }`}
                />
              ))}
            </div>
            <button 
              onClick={nextProduct}
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                isLight 
                  ? 'border-neutral-900/20 text-neutral-900/60 hover:text-neutral-900 hover:bg-neutral-900/5' 
                  : 'border-white/20 text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <ChevronRight size={18} />
            </button>
          </div>

        </div>

        {/* Subtle Decorative Crosshairs */}
        <div className={`absolute top-[20%] left-[30%] text-xs font-mono pointer-events-none hidden md:block transition-colors duration-500 ${
          isLight ? 'text-neutral-900/10' : 'text-white/10'
        }`}>+</div>
        <div className={`absolute bottom-[30%] right-[25%] text-xs font-mono pointer-events-none hidden md:block transition-colors duration-500 ${
          isLight ? 'text-neutral-900/10' : 'text-white/10'
        }`}>+</div>
        
      </motion.main>
    </div>
  );
}

export default Visuals3D;