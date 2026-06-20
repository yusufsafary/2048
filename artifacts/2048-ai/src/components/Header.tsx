import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Hash } from 'lucide-react';

interface HeaderProps {
  score: number;
  bestScore: number;
  moves: number;
}

export function Header({ score, bestScore, moves }: HeaderProps) {
  return (
    <div className="w-full max-w-[400px] mx-auto flex items-end justify-between mb-8">
      <div>
        <h1 className="text-5xl font-black tracking-tighter text-primary">2048</h1>
        <p className="text-muted-foreground text-sm font-medium mt-1 uppercase tracking-widest flex items-center gap-1">
          <Hash size={14}/> {moves} moves
        </p>
      </div>
      
      <div className="flex gap-2">
        <div className="bg-card border rounded-lg px-4 py-2 flex flex-col items-center justify-center min-w-[80px] shadow-sm">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-0.5">Score</span>
          <motion.span 
            key={score}
            initial={{ scale: 1.2, color: 'var(--primary)' }}
            animate={{ scale: 1, color: 'var(--foreground)' }}
            className="font-bold text-lg leading-none"
          >
            {score}
          </motion.span>
        </div>
        
        <div className="bg-primary text-primary-foreground rounded-lg px-4 py-2 flex flex-col items-center justify-center min-w-[80px] shadow-sm">
          <span className="text-[10px] uppercase font-bold text-primary-foreground/80 tracking-wider mb-0.5 flex items-center gap-1">
            <Trophy size={10} /> Best
          </span>
          <span className="font-bold text-lg leading-none">{bestScore}</span>
        </div>
      </div>
    </div>
  );
}
