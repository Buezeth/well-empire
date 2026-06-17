// src/components/BreezeEffect.tsx
import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: string;
  type: 'leaf' | 'petal' | 'bubble' | 'streak';
  color: string;
  size: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  duration: number;
  rotateStart: number;
  rotateEnd: number;
  opacity: number;
  layer: 'front' | 'back';
}

// Lightweight vector icons for crisp performance and scalability
const LeafIcon = ({ color }: { color: string }) => (
  <svg viewBox="0 0 30 20" className="w-full h-full drop-shadow-[0_2px_6px_rgba(0,0,0,0.15)]" fill="none">
    <path
      d="M 2,10 C 10,2 22,2 28,10 C 22,18 10,18 2,10 Z"
      fill={color}
    />
    <path
      d="M 2,10 Q 15,10 28,10"
      stroke="rgba(255,255,255,0.3)"
      strokeWidth="1"
      strokeDasharray="2 1"
    />
  </svg>
);

const PetalIcon = ({ color }: { color: string }) => (
  <svg viewBox="0 0 24 30" className="w-full h-full drop-shadow-[0_2px_6px_rgba(0,0,0,0.15)]" fill="none">
    <path
      d="M 12,2 C 19,8 21,18 12,28 C 3,18 5,8 12,2 Z"
      fill={color}
    />
  </svg>
);

// Realistic soap bubble with thin translucent stroke and specular reflection highlights
const BubbleIcon = ({ color }: { color: string }) => (
  <svg viewBox="0 0 24 24" className="w-full h-full" fill="none">
    {/* Translucent bubble membrane and soft inner tint */}
    <circle 
      cx="12" 
      cy="12" 
      r="10" 
      stroke={color} 
      strokeWidth="1.2" 
      strokeOpacity="0.7" 
      fill={color} 
      fillOpacity="0.08" 
    />
    {/* Spherical top-left highlight */}
    <ellipse 
      cx="8.5" 
      cy="8.5" 
      rx="2.5" 
      ry="1.5" 
      transform="rotate(-30 8.5 8.5)" 
      fill="#ffffff" 
      fillOpacity="0.75" 
    />
    {/* Bottom-right secondary reflection */}
    <circle 
      cx="16" 
      cy="16" 
      r="1" 
      fill="#ffffff" 
      fillOpacity="0.4" 
    />
  </svg>
);

const StreakIcon = ({ color }: { color: string }) => (
  <svg viewBox="0 0 120 10" className="w-full h-full" fill="none">
    <path
      d="M 0,5 Q 30,2 60,5 T 120,5"
      stroke={color}
      strokeWidth="1.2"
      strokeLinecap="round"
      opacity="0.25"
    />
  </svg>
);

// Dynamic colors, sizes, and opacities matching each brand's palette
const getParticleSpecs = (activeIndex: number) => {
  switch (activeIndex) {
    case 0: // DIVINE CLEANSER (Bubbles and wind streaks)
      return {
        types: ['bubble', 'streak'] as const,
        colors: ['#60a5fa', '#3b82f6', '#93c5fd', '#ffffff', '#a5f3fc'],
        opacityRange: [0.35, 0.8],
        sizeRange: [14, 32], // Soft variation in bubble sizes
      };
    case 1: // GENTLE BLISS
      return {
        types: ['petal', 'streak'] as const,
        colors: ['#f43f5e', '#ec4899', '#fda4af', '#fce7f3', '#ffffff'],
        opacityRange: [0.4, 0.8],
        sizeRange: [16, 26],
      };
    case 2: // PUSBA
      return {
        types: ['leaf', 'streak'] as const,
        colors: ['#22c55e', '#4ade80', '#86efac', '#bbf7d0', '#ffffff'],
        opacityRange: [0.35, 0.75],
        sizeRange: [16, 30],
      };
    case 3: // ENJOY
      return {
        types: ['leaf', 'streak'] as const,
        colors: ['#84cc16', '#a3e635', '#bef264', '#15803d', '#3f6212'],
        opacityRange: [0.25, 0.6],
        sizeRange: [14, 28],
      };
    default:
      return {
        types: ['streak'] as const,
        colors: ['#ffffff'],
        opacityRange: [0.2, 0.5],
        sizeRange: [20, 40],
      };
  }
};

const createParticle = (activeIndex: number, layer: 'front' | 'back'): Particle => {
  const specs = getParticleSpecs(activeIndex);
  const type = specs.types[Math.floor(Math.random() * specs.types.length)];
  const color = specs.colors[Math.floor(Math.random() * specs.colors.length)];
  
  const minSize = specs.sizeRange[0];
  const maxSize = specs.sizeRange[1];
  const size = type === 'streak' 
    ? Math.floor(Math.random() * 40) + 90 
    : Math.floor(Math.random() * (maxSize - minSize)) + minSize;
  
  const minOpacity = specs.opacityRange[0];
  const maxOpacity = specs.opacityRange[1];
  const opacity = Math.random() * (maxOpacity - minOpacity) + minOpacity;
  
  const startX = -15; // Offscreen left
  const endX = 115;   // Offscreen right
  const startY = Math.random() * 80 + 10; // Keep off the extremes
  const endY = startY + (Math.random() * 30 - 15); // Gentle upward or downward drift
  
  const duration = Math.random() * 5 + 7; // Slow drifting speed (7-12 seconds)
  const rotateStart = Math.random() * 360;
  // Bubbles rotate more slowly to look light, while leaves/petals spin more dynamically
  const rotationScale = type === 'bubble' ? 40 : 180;
  const rotateEnd = rotateStart + (Math.random() * rotationScale - (rotationScale / 2));

  return {
    id: Math.random().toString(36).substring(2, 9),
    type,
    color,
    size,
    startX,
    startY,
    endX,
    endY,
    duration,
    rotateStart,
    rotateEnd,
    opacity,
    layer,
  };
};

const BreezeEffect = ({ activeIndex, layer }: { activeIndex: number; layer: 'front' | 'back' }) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const indexRef = useRef(activeIndex);

  useEffect(() => {
    indexRef.current = activeIndex;
  }, [activeIndex]);

  // Seeding initial particles so visual is flowing immediately on load
  useEffect(() => {
    const initialParticles: Particle[] = [];
    const count = layer === 'back' ? 3 : 2;
    for (let i = 0; i < count; i++) {
      const p = createParticle(activeIndex, layer);
      const progress = Math.random() * 0.7 + 0.1;
      p.startX = p.startX + (p.endX - p.startX) * progress;
      p.startY = p.startY + (p.endY - p.startY) * progress;
      p.duration = p.duration * (1 - progress); 
      initialParticles.push(p);
    }
    setParticles(initialParticles);
  }, [activeIndex, layer]);

  useEffect(() => {
    const intervalTime = layer === 'back' ? 2200 : 3200; 
    const maxParticles = layer === 'back' ? 6 : 4;

    const interval = setInterval(() => {
      setParticles(prev => {
        if (prev.length >= maxParticles) return prev;
        return [...prev, createParticle(indexRef.current, layer)];
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [layer]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none w-full h-full select-none">
      {particles.map(particle => {
        const IconComponent = 
          particle.type === 'leaf' ? LeafIcon :
          particle.type === 'petal' ? PetalIcon :
          particle.type === 'bubble' ? BubbleIcon :
          StreakIcon;

        return (
          <motion.div
            key={particle.id}
            initial={{
              x: `${particle.startX}vw`,
              y: `${particle.startY}vh`,
              rotate: particle.rotateStart,
              scale: 0.1,
              opacity: 0,
            }}
            animate={{
              x: `${particle.endX}vw`,
              y: `${particle.endY}vh`,
              rotate: particle.rotateEnd,
              scale: [0.1, 0.9, 1.5, 0.8, 0.1],
              opacity: [0, particle.opacity, particle.opacity, particle.opacity * 0.4, 0],
            }}
            transition={{
              duration: particle.duration,
              ease: "linear",
            }}
            onAnimationComplete={() => {
              setParticles(prev => prev.filter(p => p.id !== particle.id));
            }}
            className="absolute"
            style={{
              width: particle.size,
              height: particle.type === 'streak' ? particle.size / 6 : particle.size,
              filter: particle.layer === 'back' ? 'blur(1.5px)' : 'none', // Depth-of-field blur on background elements
            }}
          >
            <IconComponent color={particle.color} />
          </motion.div>
        );
      })}
    </div>
  );
};

export default BreezeEffect;