import React from 'react';
import { motion } from 'motion/react';

export const RPGBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
      {/* 1. Base Dark Slate/Wood vignette */}
      <div className="absolute inset-0 bg-[#0b0908] bg-radial-[circle_at_50%_40%] from-[#1a140f]/40 via-[#0a0706] to-[#040303] opacity-100" />

      {/* 2. Dark Leather Texture */}
      <div 
        className="absolute inset-0 opacity-[0.18] mix-blend-overlay"
        style={{
          backgroundImage: "url('https://www.transparenttextures.com/patterns/dark-leather.png')",
          backgroundRepeat: "repeat"
        }}
      />
      
      {/* 3. Old Parchment paper-grain vignette */}
      <div 
        className="absolute inset-0 opacity-[0.08] mix-blend-color-burn"
        style={{
          backgroundImage: "url('https://www.transparenttextures.com/patterns/parchment.png')",
          backgroundRepeat: "repeat"
        }}
      />

      {/* 4. Giant Arcane/Celestial Seal - Slow Rotation */}
      <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85vw] h-[85vw] max-w-[900px] max-h-[900px] opacity-[0.035] mix-blend-screen text-gold animate-[spin_180s_linear_infinite]">
        <svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full stroke-current stroke-[0.75]">
          {/* Concentric mystical rings */}
          <circle cx="250" cy="250" r="240" strokeDasharray="5, 5" />
          <circle cx="250" cy="250" r="225" />
          <circle cx="250" cy="250" r="190" strokeDasharray="15, 8" />
          <circle cx="250" cy="250" r="150" />
          <circle cx="250" cy="250" r="90" strokeDasharray="1, 4" />
          
          {/* Arcane Pentagram & Star geometry */}
          <path d="M250 10 L391 440 L22 174 L478 174 L109 440 Z" />
          <path d="M250 25 L415 390 L85 140 L415 140 L85 390 Z" strokeDasharray="2, 2" />
          
          {/* Compass lines */}
          <line x1="250" y1="0" x2="250" y2="500" />
          <line x1="0" y1="250" x2="500" y2="250" />
          <line x1="73.2" y1="73.2" x2="426.8" y2="426.8" strokeDasharray="3, 3" />
          <line x1="73.2" y1="426.8" x2="426.8" y2="73.2" strokeDasharray="3, 3" />

          {/* Rune notches */}
          {[...Array(12)].map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            const x1 = 250 + 210 * Math.cos(angle);
            const y1 = 250 + 210 * Math.sin(angle);
            const x2 = 250 + 225 * Math.cos(angle);
            const y2 = 250 + 225 * Math.sin(angle);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} className="stroke-[1.5]" />;
          })}
        </svg>
      </div>

      {/* 5. Animated Mist / Smoke */}
      <div className="absolute inset-0 w-full h-full opacity-35 mix-blend-screen pointer-events-none">
        <div className="absolute top-[20%] -left-[20%] w-[120%] h-[50%] bg-gradient-to-r from-transparent via-[#2a1d12]/15 to-transparent blur-[80px] animate-mist" />
        <div className="absolute bottom-[10%] -right-[20%] w-[120%] h-[40%] bg-gradient-to-r from-transparent via-[#1a1c24]/10 to-transparent blur-[70px] animate-mist" style={{ animationDelay: '-8s' }} />
      </div>

      {/* 6. Fire Embers / Arcane Floating Particles */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {[...Array(12)].map((_, i) => {
          const delay = i * 1.8;
          const left = 5 + (i * 9) % 90;
          const duration = 12 + (i % 6) * 4;
          const size = 1.5 + (i % 3) * 1.5;
          return (
            <motion.div
              key={i}
              className="absolute rounded-full bg-gradient-to-t from-gold to-[#ffa500] opacity-0 mix-blend-color-dodge shadow-[0_0_8px_rgba(197,160,89,0.5)]"
              style={{
                left: `${left}%`,
                bottom: `-5%`,
                width: `${size}px`,
                height: `${size}px`,
              }}
              animate={{
                y: [0, -700 - (i % 4) * 200],
                x: [0, (i % 2 === 0 ? 30 : -30) * Math.sin(i), 0],
                opacity: [0, 0.45, 0.65, 0.3, 0],
                scale: [0.8, 1.2, 1, 0.6],
              }}
              transition={{
                duration: duration,
                repeat: Infinity,
                delay: delay,
                ease: "easeOut"
              }}
            />
          );
        })}
      </div>

      {/* 7. Subtle Border Vignette Layer */}
      <div className="absolute inset-0 border-[16px] border-[#020202]/95 pointer-events-none md:border-[28px] mix-blend-multiply opacity-90" />
      <div className="absolute inset-0 border border-gold/10 pointer-events-none m-4 md:m-7" />
    </div>
  );
};
