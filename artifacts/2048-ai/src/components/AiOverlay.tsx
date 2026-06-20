import React from 'react';
import { Direction } from '../game-logic';
import { motion, AnimatePresence } from 'framer-motion';

interface AiOverlayProps {
  scores: Record<Direction, number> | null;
  visible: boolean;
}

export function AiOverlay({ scores, visible }: AiOverlayProps) {
  return (
    <AnimatePresence>
      {visible && scores && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="w-full max-w-[400px] mx-auto mt-4 p-3 bg-card border rounded-xl shadow-sm text-xs font-mono grid grid-cols-2 gap-2"
        >
          <div className="col-span-2 text-center text-muted-foreground font-sans font-medium uppercase tracking-widest text-[10px] mb-1">
            AI Evaluation
          </div>
          {(['up', 'down', 'left', 'right'] as Direction[]).map(dir => (
            <div key={dir} className="flex justify-between px-2 py-1 rounded bg-muted/50">
              <span className="uppercase text-muted-foreground">{dir}</span>
              <span className={scores[dir] < -10000 ? 'text-destructive' : 'text-foreground font-bold'}>
                {scores[dir] < -10000 ? 'INV' : Math.round(scores[dir])}
              </span>
            </div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
