import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';

interface GameOverlayProps {
  status: 'playing' | 'won' | 'over';
  onRestart: () => void;
  onKeepPlaying: () => void;
  score: number;
}

export function GameOverlay({ status, onRestart, onKeepPlaying, score }: GameOverlayProps) {
  if (status === 'playing') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl sm:rounded-2xl"
      >
        <motion.div 
          initial={{ scale: 0.8, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="text-center p-6 bg-card border shadow-xl rounded-xl max-w-[80%]"
        >
          <h2 className={`text-4xl font-black mb-2 ${status === 'won' ? 'text-primary' : 'text-foreground'}`}>
            {status === 'won' ? 'You Win!' : 'Game Over'}
          </h2>
          <p className="text-muted-foreground font-medium mb-6">
            Final Score: <span className="text-foreground font-bold">{score}</span>
          </p>
          
          <div className="flex flex-col gap-2">
            {status === 'won' && (
              <Button variant="default" onClick={onKeepPlaying} className="w-full">
                Keep Playing
              </Button>
            )}
            <Button variant={status === 'won' ? 'outline' : 'default'} onClick={onRestart} className="w-full">
              Try Again
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
