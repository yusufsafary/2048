import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Board as BoardType, Direction, initializeBoard, moveBoard, isValidMove, isGameOver, checkWin } from '../game-logic';
import { Board } from '../components/Board';
import { Header } from '../components/Header';
import { Controls } from '../components/Controls';
import { AiOverlay } from '../components/AiOverlay';
import { GameOverlay } from '../components/GameOverlay';
import AIWorker from '../ai-worker?worker';
import { AIRequest, AIResponse } from '../ai-worker';

type Snapshot = { board: BoardType; score: number };

export default function Game() {
  const [board, setBoard] = useState<BoardType>(initializeBoard());
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => parseInt(localStorage.getItem('2048-best-score') || '0', 10));
  const [moves, setMoves] = useState(0);
  const [history, setHistory] = useState<Snapshot[]>([]);
  
  const [status, setStatus] = useState<'playing' | 'won' | 'over'>('playing');
  const [hasWon, setHasWon] = useState(false); // Tracks if we already showed the win screen
  
  const [aiMode, setAiMode] = useState<'none' | 'play' | 'suggest'>('none');
  const [aiSpeed, setAiSpeed] = useState(400);
  const [suggestedDirection, setSuggestedDirection] = useState<Direction | null>(null);
  const [aiScores, setAiScores] = useState<Record<Direction, number> | null>(null);
  
  const workerRef = useRef<Worker | null>(null);
  const isAnimatingRef = useRef(false);
  const isComputingRef = useRef(false);
  const aiTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    workerRef.current = new AIWorker();
    return () => {
      workerRef.current?.terminate();
      if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    };
  }, []);

  const saveState = useCallback((newBoard: BoardType, newScore: number) => {
    setHistory(prev => {
      const next = [...prev, { board, score }];
      if (next.length > 3) next.shift(); // keep last 3
      return next;
    });
    setBoard(newBoard);
    setScore(newScore);
    setMoves(m => m + 1);
    
    if (newScore > bestScore) {
      setBestScore(newScore);
      localStorage.setItem('2048-best-score', newScore.toString());
    }
  }, [board, score, bestScore]);

  const handleMove = useCallback((dir: Direction) => {
    if (status !== 'playing' || isAnimatingRef.current || isComputingRef.current) return;
    
    const { newBoard, score: moveScore, changed } = moveBoard(board, dir);
    if (!changed) return;
    
    isAnimatingRef.current = true;
    saveState(newBoard, score + moveScore);
    setSuggestedDirection(null);
    setAiScores(null);
    
    // Check end conditions after state update
    setTimeout(() => {
      // In real 2048, a random tile spawns AFTER animation
      // For pure logic separation, our moveBoard does slide. We do spawn here.
      import('../game-logic').then(({ spawnTile }) => {
        const spawnedBoard = spawnTile(newBoard);
        setBoard(spawnedBoard);
        
        if (checkWin(spawnedBoard) && !hasWon) {
          setStatus('won');
          setHasWon(true);
          setAiMode('none');
        } else if (isGameOver(spawnedBoard)) {
          setStatus('over');
          setAiMode('none');
        }
        
        isAnimatingRef.current = false;
        
        // Trigger next AI play if in play mode
        if (aiMode === 'play' && status === 'playing') {
          triggerAI(spawnedBoard);
        }
      });
    }, 150); // Animation duration
  }, [board, score, status, hasWon, aiMode, saveState]);

  const triggerAI = useCallback((currentBoard: BoardType) => {
    if (!workerRef.current || isComputingRef.current || isGameOver(currentBoard)) return;
    
    isComputingRef.current = true;
    
    workerRef.current.onmessage = (e: MessageEvent<AIResponse>) => {
      isComputingRef.current = false;
      const { bestDirection, scores } = e.data;
      
      setAiScores(scores);
      
      if (aiMode === 'play' && bestDirection) {
        aiTimeoutRef.current = window.setTimeout(() => {
          handleMove(bestDirection);
        }, aiSpeed);
      } else if (aiMode === 'suggest' || aiMode === 'none') { // 'none' for manual step
        setSuggestedDirection(bestDirection);
        if (aiMode === 'none') {
           // It was a step request. We can optionally auto-play the step.
           // Actually, let's just make step auto-play.
           if (bestDirection) handleMove(bestDirection);
        }
      }
    };
    
    workerRef.current.postMessage({
      board: currentBoard,
      mode: aiMode,
      timeLimit: aiSpeed === 50 ? 50 : 200
    } as AIRequest);
  }, [aiMode, aiSpeed, handleMove]);

  // Handle AI mode changes
  useEffect(() => {
    if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    if (aiMode === 'play' && status === 'playing' && !isAnimatingRef.current) {
      triggerAI(board);
    } else if (aiMode === 'suggest' && status === 'playing') {
      triggerAI(board);
    }
  }, [aiMode, triggerAI, board, status]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') handleMove('up');
      if (e.key === 'ArrowDown') handleMove('down');
      if (e.key === 'ArrowLeft') handleMove('left');
      if (e.key === 'ArrowRight') handleMove('right');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMove]);

  const handleUndo = () => {
    if (history.length === 0 || status === 'over') return;
    const last = history[history.length - 1];
    setBoard(last.board);
    setScore(last.score);
    setHistory(history.slice(0, -1));
    setMoves(m => m - 1);
    setSuggestedDirection(null);
  };

  const handleNewGame = () => {
    if (score > 0 && status === 'playing' && !window.confirm('Start a new game? Current progress will be lost.')) {
      return;
    }
    setBoard(initializeBoard());
    setScore(0);
    setMoves(0);
    setHistory([]);
    setStatus('playing');
    setHasWon(false);
    setSuggestedDirection(null);
    setAiScores(null);
    if (aiMode === 'play') setAiMode('none');
  };

  const handleStep = () => {
    if (status !== 'playing') return;
    setAiMode('none'); // ensure we don't loop
    triggerAI(board);
  };

  return (
    <div className="min-h-[100dvh] w-full bg-background flex flex-col items-center py-8 px-4 sm:py-12">
      <Header score={score} bestScore={bestScore} moves={moves} />
      
      <div className="relative w-full max-w-[400px]">
        <Board 
          board={board} 
          onSwipe={handleMove} 
          suggestedDirection={aiMode === 'suggest' ? suggestedDirection : null}
        />
        <GameOverlay 
          status={status} 
          onRestart={handleNewGame} 
          onKeepPlaying={() => setStatus('playing')} 
          score={score} 
        />
      </div>

      <AiOverlay scores={aiScores} visible={aiMode !== 'none'} />

      <Controls 
        onNewGame={handleNewGame}
        onUndo={handleUndo}
        canUndo={history.length > 0 && status === 'playing'}
        aiMode={aiMode}
        setAiMode={setAiMode}
        aiSpeed={aiSpeed}
        setAiSpeed={setAiSpeed}
        onStep={handleStep}
      />
      
      {/* ARIA Live region for screen readers */}
      <div aria-live="polite" className="sr-only">
        {status === 'won' && "You won the game!"}
        {status === 'over' && "Game over."}
        Score is {score}.
      </div>
    </div>
  );
}
