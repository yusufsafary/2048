import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Trophy, Star } from 'lucide-react';
import { useLeaderboard } from '@/hooks/use-leaderboard';

interface GameOverlayProps {
  status: 'playing' | 'won' | 'over';
  onRestart: () => void;
  onKeepPlaying: () => void;
  score: number;
}

export function GameOverlay({ status, onRestart, onKeepPlaying, score }: GameOverlayProps) {
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);
  const { submitScore, isHighScore } = useLeaderboard();
  const showSave = (status === 'won' || status === 'over') && isHighScore(score) && !saved;

  if (status === 'playing') return null;

  const handleSave = () => {
    if (!name.trim()) return;
    submitScore(name, score);
    setSaved(true);
  };

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
          className="text-center p-6 bg-card border shadow-xl rounded-xl max-w-[85%] w-full"
        >
          <h2 className={`text-4xl font-black mb-1 tracking-tighter ${status === 'won' ? 'text-primary' : 'text-foreground'}`}>
            {status === 'won' ? '🎉 You Win!' : 'Game Over'}
          </h2>
          <p className="text-muted-foreground font-medium mb-4">
            Score: <span className="text-foreground font-bold text-lg">{score.toLocaleString()}</span>
          </p>

          {showSave && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-4 bg-primary/10 border border-primary/20 rounded-lg p-3"
            >
              <p className="text-xs font-bold text-primary flex items-center justify-center gap-1 mb-2">
                <Star size={12} /> High Score! Save to leaderboard
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Your name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSave()}
                  maxLength={20}
                  className="text-sm h-8"
                />
                <Button size="sm" onClick={handleSave} disabled={!name.trim()} className="h-8 px-3">
                  <Trophy size={13} />
                </Button>
              </div>
            </motion.div>
          )}

          {saved && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 text-xs text-primary font-semibold flex items-center justify-center gap-1"
            >
              <Trophy size={12} /> Score saved to leaderboard!
            </motion.p>
          )}

          <div className="flex flex-col gap-2">
            {status === 'won' && (
              <Button variant="default" onClick={onKeepPlaying} className="w-full">
                Keep Playing
              </Button>
            )}
            <Button variant={status === 'won' ? 'outline' : 'default'} onClick={() => { setSaved(false); setName(''); onRestart(); }} className="w-full">
              Try Again
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
