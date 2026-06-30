// src/components/Visuals3D.tsx
import React, { useEffect, useRef, useState } from 'react';
import { products } from '../Products';
import { AnimatePresence, motion } from 'framer-motion';
import DepthMapViewer from './DepthMapViewer';
import BreezeEffect from './BreezeEffect';
import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';

// =========================================================================
// CUSTOMIZE YOUR CAMEROON BUSINESS WHATSAPP CONTACT:
// Use standard international format without '+' or leading zeros (e.g., '237XXXXXXXXX')
// =========================================================================
const WHATSAPP_NUMBER = "237677777777"; 

// Toggle this to display the big background typography
const SHOW_BACKGROUND_TEXT = true;

// Custom high-fidelity inline SVG icon for WhatsApp
const WhatsAppIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className}
    fill="currentColor"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

// Continuous, beveled pattern border framing the container clearly
const SubtleAfricanBorders = ({ isLight }: { isLight: boolean }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const strokeWidth = isMobile ? 12 : 24;
  const halfStroke = strokeWidth / 2;
  const radius = isMobile ? 0 : 24; 

  return (
    <div 
      className={`absolute inset-0 pointer-events-none z-10 transition-colors duration-500 ${
        isLight 
          ? 'text-neutral-950/25' 
          : 'text-white/20'       
      }`}
    >
      <svg className="w-full h-full overflow-hidden">
        <defs>
          <pattern 
            id="african-tribal-border" 
            width={strokeWidth} 
            height={strokeWidth} 
            patternUnits="userSpaceOnUse" 
            viewBox="0 0 40 40"
          >
            <path d="M0 0 L40 40 M40 0 L0 40" stroke="currentColor" strokeWidth="1" opacity="0.3" fill="none" />
            <polygon points="20,4 36,20 20,36 4,20" stroke="currentColor" strokeWidth="1.8" fill="none" />
            <polygon points="20,10 30,20 20,30 10,20" stroke="currentColor" strokeWidth="1" fill="none" />
            <circle cx="20" cy="20" r="3" fill="currentColor" />
            <polygon points="0,0 8,0 0,8" fill="currentColor" opacity="0.6" />
            <polygon points="40,0 32,0 40,8" fill="currentColor" opacity="0.6" />
            <polygon points="0,40 8,40 0,32" fill="currentColor" opacity="0.6" />
            <polygon points="40,40 32,40 40,32" fill="currentColor" opacity="0.6" />
            <circle cx="20" cy="1.5" r="2" fill="currentColor" />
            <circle cx="20" cy="38.5" r="2" fill="currentColor" />
            <circle cx="1.5" cy="20" r="2" fill="currentColor" />
            <circle cx="38.5" cy="20" r="2" fill="currentColor" />
          </pattern>
        </defs>
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

// Custom interactive Luxury adaptive contrast logo component
interface LuxuryLogoProps {
  activeIndex: number;
  currentProduct: any;
  isLight: boolean;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
}

const LuxuryLogo: React.FC<LuxuryLogoProps> = ({ activeIndex, currentProduct, isLight, setActiveIndex }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [spinAngle, setSpinAngle] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  const handleClick = () => {
    setSpinAngle(prev => prev + 360);
    setActiveIndex((prev: number) => (prev + 1) % products.length);
  };

  return (
    <motion.div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      initial={{ opacity: 0, y: -15, scale: 0.95, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="pointer-events-auto cursor-pointer group flex items-center justify-center relative select-none w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 active:scale-[0.96] transition-transform duration-300"
    >
      {!isLight && (
        <div 
          className="absolute inset-0 rounded-full transition-all duration-700 pointer-events-none z-0"
          style={{
            filter: `blur(15px)`,
            background: `radial-gradient(circle, ${currentProduct.color}22 0%, transparent 70%)`,
          }}
        />
      )}

      <motion.img 
        src="/logo.png" 
        alt="Well Empire Monogram" 
        animate={{
          x: mousePos.x * 2.5,
          y: mousePos.y * 2.5,
          rotate: spinAngle,
          filter: isLight 
            ? `brightness(0) opacity(0.85) drop-shadow(0 2px 4px rgba(0,0,0,0.1))` 
            : `brightness(0) invert(1) opacity(0.9) drop-shadow(0 0 10px ${currentProduct.color}22)`
        }}
        transition={{ type: "spring", stiffness: 120, damping: 14 }}
        className="w-full h-full object-contain pointer-events-none select-none z-10 opacity-85 group-hover:opacity-100 transition-opacity duration-300"
      />
    </motion.div>
  );
};

const Visuals3D = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const isScrolling = useRef(false);
  
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const currentProduct = products[activeIndex];
  const isLight = currentProduct.isLight ?? false;

  const nextProduct = () => {
    if (isScrolling.current) return;
    isScrolling.current = true;
    setActiveIndex((prev) => (prev + 1) % products.length);
    setTimeout(() => {
      isScrolling.current = false;
    }, 500);
  };

  const prevProduct = () => {
    if (isScrolling.current) return;
    isScrolling.current = true;
    setActiveIndex((prev) => (prev - 1 + products.length) % products.length);
    setTimeout(() => {
      isScrolling.current = false;
    }, 500);
  };
  
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > 50) nextProduct();
      else if (e.deltaY < -50) prevProduct();
    };
    window.addEventListener('wheel', handleWheel);
    return () => window.removeEventListener('wheel', handleWheel);
  }, [activeIndex]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;

    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    const diffY = touchStartY.current - e.changedTouches[0].clientY;

    const swipeThreshold = 50;
    
    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (Math.abs(diffX) > swipeThreshold) {
        if (diffX > 0) {
          nextProduct();
        } else {
          prevProduct();
        }
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  const whatsappInquiryMessage = `Bonjour Well Empire, je souhaite avoir plus d'informations ou commander le produit "${currentProduct.title}" au prix de ${currentProduct.price.toLocaleString('fr-FR')} FCFA. Pouvez-vous m'assister s'il vous plaît ?`;
  
  return (
    <div className="w-screen h-screen bg-black md:p-4 flex items-center justify-center overflow-hidden font-sans">
      
      <motion.main 
        initial={{ backgroundColor: products[0].bgColor }}
        animate={{ backgroundColor: currentProduct.bgColor }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
        className="relative w-full h-full md:rounded-4xl overflow-hidden shadow-2xl"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        
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

        {/* --- LAYER 1: BACK BREEZE --- */}
        <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden">
          <BreezeEffect activeIndex={activeIndex} layer="back" />
        </div>

        {/* Responsive Parallax Area */}
        <div className="absolute inset-0 flex items-center justify-center z-10 overflow-hidden pointer-events-none">
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
                    scale: isActive ? 1.55 : 0.75, 
                    opacity: isActive ? 1 : 0.0, 
                    zIndex: isActive ? 10 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 100, damping: 20 }}
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

        {/* --- LAYER 2: FRONT BREEZE --- */}
        <div className="absolute inset-0 z-[15] pointer-events-none overflow-hidden">
          <BreezeEffect activeIndex={activeIndex} layer="front" />
        </div>

        {/* UI Layer */}
        <div className="absolute inset-0 z-20 pointer-events-none p-6 md:p-12 flex flex-col justify-between">
          
          {/* Top Bar */}
          <div className="flex justify-between items-center w-full">
            <LuxuryLogo 
              activeIndex={activeIndex}
              currentProduct={currentProduct}
              isLight={isLight}
              setActiveIndex={setActiveIndex}
            />
            
            <div className={`flex items-center space-x-3 md:space-x-6 pointer-events-auto transition-colors duration-500 ${
              isLight ? 'text-neutral-900' : 'text-white'
            }`}>
              <div className="flex items-center gap-2 md:gap-3">
                <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full border flex items-center justify-center cursor-pointer transition-colors ${
                  isLight ? 'border-neutral-900/20 hover:bg-neutral-900/5' : 'border-white/20 hover:bg-white/10'
                }`}>
                  <ShoppingCart size={13} className={isLight ? 'text-neutral-900' : 'text-white'} />
                </div>
                <span className="font-mono text-xs md:text-sm font-medium">
                  {currentProduct.price.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            </div>
          </div>

          {/* Middle Right Nav */}
          <div className="hidden md:flex absolute right-12 top-1/2 -translate-y-1/2 flex-col pointer-events-auto items-center">
            <span 
              className={`font-mono text-xs tracking-[0.2em] font-bold transition-colors cursor-pointer block ${
                isLight ? 'text-neutral-900' : 'text-white'
              }`} 
              style={{ 
                writingMode: 'vertical-rl',
                textShadow: isLight
                  ? '0 1px 2px rgba(255, 255, 255, 0.8)'
                  : '0 2px 4px rgba(0, 0, 0, 0.85)'
              }}
            >
              CLEANSERS
            </span>
          </div>

          {/* Bottom Left Product Info */}
          <div className="w-auto md:w-1/2 pointer-events-auto absolute bottom-24 md:bottom-12 left-6 md:left-12 text-left">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                {/* 001/002 Index Label with Drop Shadow */}
                <div 
                  className={`font-mono text-xs tracking-[0.2em] mb-3 transition-colors duration-500 ${
                    isLight ? 'text-neutral-900/50' : 'text-white/60'
                  }`}
                  style={{
                    textShadow: isLight
                      ? '0 1px 1px rgba(255, 255, 255, 0.1)'
                      : '0 1px 1px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {(activeIndex + 1).toString().padStart(3, '0')}
                </div>

                {/* Product Title (e.g. GENTLE BLISS) with strong drop shadow to split overlay details */}
                <h2 
                  className={`font-display text-4xl md:text-[100px] leading-[0.85] tracking-tight mb-4 uppercase transition-colors duration-500 ${
                    isLight ? 'text-neutral-900' : 'text-white'
                  }`}
                  style={{
                    textShadow: isLight
                      ? '0 1px 3px rgba(255, 255, 255, 0.1)'
                      : '0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.95)'
                  }}
                >
                  {currentProduct.title.split(' ').map((word, i) => (
                    <span key={i} className="block">{word}</span>
                  ))}
                </h2>

                {/* Description Paragraph with high-contrast text shadow */}
                <p 
                  className={`font-mono text-wrap text-xs md:text-sm max-w-sm leading-relaxed mb-5 transition-colors duration-500 ${
                    isLight ? 'text-neutral-800/80' : 'text-white/85'
                  }`}
                  style={{
                    textShadow: isLight
                      ? '0 1px 2px rgba(255, 255, 255, 0.2)'
                      : '0 2px 6px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(0, 0, 0, 1)'
                  }}
                >
                  {currentProduct.desc}
                  <br/><br/>
                  LA QUALITÉ ACCESSIBLE À TOUS. WELL👑EMPIRE
                </p>

                {/* --- RESPONSIVE CAMEROON WHATSAPP ACTION BLOCK --- */}
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappInquiryMessage)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`px-4 py-2.5 rounded-full flex items-center gap-2 font-sans text-[11px] md:text-xs font-bold tracking-wider uppercase transition-all shadow-md hover:scale-102 active:scale-98 ${
                      isLight
                        ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-950/10'
                        : 'bg-[#25D366] hover:bg-[#20ba56] text-neutral-950 shadow-[#25d366]/10'
                    }`}
                  >
                    <WhatsAppIcon className="w-4 h-4" />
                    <span>COMMANDER / WHATSAPP</span>
                  </a>
                </div>
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
          isLight ? 'text-neutral-900/30' : 'text-white/25'
        }`}>+</div>
        <div className={`absolute bottom-[30%] right-[25%] text-xs font-mono pointer-events-none hidden md:block transition-colors duration-500 ${
          isLight ? 'text-neutral-900/30' : 'text-white/25'
        }`}>+</div>
        
      </motion.main>
    </div>
  );
}

export default Visuals3D;