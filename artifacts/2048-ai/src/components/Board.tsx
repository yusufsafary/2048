import React, { useRef, useEffect } from 'react';
import { Board as BoardType, Direction } from '../game-logic';
import { Tile, GridBackground } from './Tile';

interface BoardProps {
  board: BoardType;
  onSwipe: (dir: Direction) => void;
  suggestedDirection?: Direction | null;
}

export function Board({ board, onSwipe, suggestedDirection }: BoardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Flatten board for tiles rendering, keeping track of ids for layout animation
  // In a perfect React setup we'd track entity IDs for true stable rendering,
  // but for 2048 index based matching with values works decently well with framer-motion if handled carefully.
  // Actually, to make framer-motion layout animations work perfectly for 2048, we need stable IDs per tile.
  // Since our pure logic just returns numbers, we will pseudo-generate keys based on value + index.
  // A better approach is rendering based on cell position, and let framer-motion interpolate value changes.
  
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) return;
      e.preventDefault(); // Prevent scroll
    };
    
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    return () => document.removeEventListener('touchstart', handleTouchStart);
  }, []);

  let startX = 0;
  let startY = 0;

  const onTouchStart = (e: React.TouchEvent) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    
    const dx = endX - startX;
    const dy = endY - startY;
    
    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > 30) {
        onSwipe(dx > 0 ? 'right' : 'left');
      }
    } else {
      if (Math.abs(dy) > 30) {
        onSwipe(dy > 0 ? 'down' : 'up');
      }
    }
  };

  return (
    <div className="relative w-full max-w-[400px] aspect-square mx-auto touch-none" ref={containerRef}>
      <div 
        className="absolute inset-0 bg-card border rounded-xl sm:rounded-2xl shadow-sm overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <GridBackground />
        
        {/* Tiles overlay */}
        <div className="absolute inset-0 p-1 sm:p-1.5 z-10">
          <div className="relative w-full h-full">
            {board.map((row, r) => 
              row.map((val, c) => (
                val > 0 && <Tile key={`${r}-${c}-${val}`} value={val} r={r} c={c} />
              ))
            )}
          </div>
        </div>

        {/* Suggestion Indicator */}
        {suggestedDirection && (
          <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
            <div className={`
              text-primary drop-shadow-md opacity-50 transition-all duration-300
              ${suggestedDirection === 'up' ? 'animate-bounce pb-20' : ''}
              ${suggestedDirection === 'down' ? 'animate-bounce pt-20' : ''}
              ${suggestedDirection === 'left' ? 'pr-20' : ''}
              ${suggestedDirection === 'right' ? 'pl-20' : ''}
            `}>
              <svg 
                width="64" height="64" viewBox="0 0 24 24" fill="none" 
                stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                style={{
                  transform: 
                    suggestedDirection === 'up' ? 'rotate(180deg)' :
                    suggestedDirection === 'right' ? 'rotate(-90deg)' :
                    suggestedDirection === 'down' ? 'rotate(0deg)' :
                    'rotate(90deg)'
                }}
              >
                <path d="M12 5v14M19 12l-7 7-7-7" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
