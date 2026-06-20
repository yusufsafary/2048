import React from 'react';
import { Button } from './ui/button';
import { RefreshCw, Undo2, Play, Pause, FastForward, Info, StepForward } from 'lucide-react';

interface ControlsProps {
  onNewGame: () => void;
  onUndo: () => void;
  canUndo: boolean;
  aiMode: 'none' | 'play' | 'suggest';
  setAiMode: (mode: 'none' | 'play' | 'suggest') => void;
  aiSpeed: number;
  setAiSpeed: (speed: number) => void;
  onStep: () => void;
}

export function Controls({
  onNewGame,
  onUndo,
  canUndo,
  aiMode,
  setAiMode,
  aiSpeed,
  setAiSpeed,
  onStep
}: ControlsProps) {
  return (
    <div className="flex flex-col gap-4 w-full max-w-[400px] mx-auto mt-6">
      <div className="flex justify-between gap-2">
        <Button 
          variant="outline" 
          onClick={onUndo} 
          disabled={!canUndo}
          className="flex-1 flex gap-2 items-center"
        >
          <Undo2 size={16} /> Undo
        </Button>
        <Button 
          variant="outline" 
          onClick={onNewGame}
          className="flex-1 flex gap-2 items-center"
        >
          <RefreshCw size={16} /> New Game
        </Button>
      </div>

      <div className="p-4 bg-card rounded-xl border shadow-sm flex flex-col gap-3">
        <div className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex justify-between items-center">
          <span>AI Assistant</span>
          {aiMode === 'play' && (
            <span className="flex items-center gap-1 text-primary animate-pulse text-xs">
              <span className="w-2 h-2 rounded-full bg-primary" /> Active
            </span>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={aiMode === 'play' ? 'default' : 'secondary'}
            onClick={() => setAiMode(aiMode === 'play' ? 'none' : 'play')}
            className="flex-1 flex gap-2 items-center"
          >
            {aiMode === 'play' ? <Pause size={16} /> : <Play size={16} />}
            Auto Play
          </Button>
          <Button
            variant={aiMode === 'suggest' ? 'default' : 'secondary'}
            onClick={() => setAiMode(aiMode === 'suggest' ? 'none' : 'suggest')}
            className="flex-1 flex gap-2 items-center"
            disabled={aiMode === 'play'}
          >
            <Info size={16} /> Suggest
          </Button>
          <Button
            variant="secondary"
            onClick={onStep}
            disabled={aiMode === 'play'}
            className="flex-none px-3"
            title="Step (Compute 1 move)"
          >
            <StepForward size={16} />
          </Button>
        </div>

        {aiMode === 'play' && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Speed:</span>
            <div className="flex bg-muted rounded-md p-1 w-full gap-1">
              {[800, 400, 150, 50].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setAiSpeed(speed)}
                  className={`flex-1 text-xs py-1 rounded-sm transition-colors ${
                    aiSpeed === speed 
                      ? 'bg-background shadow-sm text-foreground' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                  }`}
                >
                  {speed === 800 ? 'Slow' : speed === 400 ? 'Norm' : speed === 150 ? 'Fast' : 'Inst'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
