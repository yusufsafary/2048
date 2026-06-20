import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TileProps {
  value: number;
  r: number;
  c: number;
  isNew?: boolean;
  isMerged?: boolean;
}

const TILE_COLORS: Record<number, { bg: string, text: string, fontSize?: string }> = {
  0: { bg: 'hsl(var(--muted))', text: 'transparent' },
  2: { bg: 'hsl(220 20% 90%)', text: 'hsl(224 71% 20%)' },
  4: { bg: 'hsl(220 30% 80%)', text: 'hsl(224 71% 20%)' },
  8: { bg: 'hsl(30 80% 70%)', text: 'hsl(0 0% 100%)' },
  16: { bg: 'hsl(20 80% 60%)', text: 'hsl(0 0% 100%)' },
  32: { bg: 'hsl(10 80% 60%)', text: 'hsl(0 0% 100%)' },
  64: { bg: 'hsl(0 80% 60%)', text: 'hsl(0 0% 100%)' },
  128: { bg: 'hsl(45 90% 60%)', text: 'hsl(0 0% 100%)', fontSize: 'text-4xl sm:text-5xl' },
  256: { bg: 'hsl(45 90% 55%)', text: 'hsl(0 0% 100%)', fontSize: 'text-3xl sm:text-4xl' },
  512: { bg: 'hsl(45 90% 50%)', text: 'hsl(0 0% 100%)', fontSize: 'text-3xl sm:text-4xl' },
  1024: { bg: 'hsl(45 90% 45%)', text: 'hsl(0 0% 100%)', fontSize: 'text-2xl sm:text-3xl' },
  2048: { bg: 'hsl(45 100% 50%)', text: 'hsl(0 0% 100%)', fontSize: 'text-2xl sm:text-3xl' },
};

const getStyle = (val: number) => {
  return TILE_COLORS[val] || { bg: 'hsl(262 80% 30%)', text: 'white', fontSize: 'text-2xl sm:text-3xl' };
};

export function Tile({ value, r, c, isNew, isMerged }: TileProps) {
  if (value === 0) return null;

  const style = getStyle(value);
  
  // Calculate position: percentages for responsive scaling
  const top = `${r * 25}%`;
  const left = `${c * 25}%`;

  return (
    <motion.div
      layout
      initial={isNew ? { scale: 0, opacity: 0 } : false}
      animate={{ scale: isMerged ? [1.2, 1] : 1, opacity: 1 }}
      transition={{ 
        type: 'spring', 
        stiffness: 400, 
        damping: 30,
        layout: { duration: 0.15 }
      }}
      className="absolute w-[25%] h-[25%] p-1 sm:p-1.5 z-10"
      style={{ top, left }}
    >
      <div 
        className={`w-full h-full rounded-lg sm:rounded-xl flex items-center justify-center font-bold shadow-sm ${style.fontSize || 'text-4xl sm:text-5xl'}`}
        style={{ 
          backgroundColor: style.bg, 
          color: style.text,
          boxShadow: value >= 128 ? `0 0 15px ${style.bg}80` : 'none'
        }}
      >
        {value}
      </div>
    </motion.div>
  );
}

export function GridBackground() {
  return (
    <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-2 sm:gap-3 p-2 sm:p-3 z-0">
      {Array.from({ length: 16 }).map((_, i) => (
        <div key={i} className="bg-muted/60 rounded-lg sm:rounded-xl w-full h-full" />
      ))}
    </div>
  );
}
