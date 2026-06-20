import { Board, Direction, moveBoard, isGameOver } from './game-logic';

export type AIMode = 'play' | 'suggest';

export interface AIRequest {
  board: Board;
  mode: AIMode;
  timeLimit?: number;
}

export interface AIResponse {
  bestDirection: Direction | null;
  scores: Record<Direction, number>;
}

// Basic Expectimax AI for 2048
function evaluateBoard(board: Board): number {
  if (isGameOver(board)) return -1000000;
  
  let emptyCount = 0;
  let maxVal = 0;
  let smoothness = 0;
  let monotonicity = 0;
  
  const w = [
    [100, 50, 25, 10],
    [50,  25, 10,  5],
    [25,  10,  5,  2],
    [10,   5,  2,  1]
  ];
  
  let score = 0;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] === 0) emptyCount++;
      if (board[r][c] > maxVal) maxVal = board[r][c];
      score += board[r][c] * w[r][c];
    }
  }
  
  return score + emptyCount * 1000;
}

function expectimax(board: Board, depth: number, isPlayer: boolean, memo: Map<string, number>): number {
  if (depth === 0 || isGameOver(board)) {
    return evaluateBoard(board);
  }
  
  const boardKey = JSON.stringify(board) + isPlayer + depth;
  if (memo.has(boardKey)) return memo.get(boardKey)!;

  let result = 0;
  
  if (isPlayer) {
    let maxScore = -Infinity;
    for (const dir of ['up', 'down', 'left', 'right'] as Direction[]) {
      const { newBoard, changed } = moveBoard(board, dir);
      if (changed) {
        const s = expectimax(newBoard, depth - 1, false, memo);
        if (s > maxScore) maxScore = s;
      }
    }
    result = maxScore === -Infinity ? -1000000 : maxScore;
  } else {
    let expectedScore = 0;
    let emptyCells = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (board[r][c] === 0) emptyCells.push({ r, c });
      }
    }
    
    if (emptyCells.length === 0) return evaluateBoard(board);
    
    const prob2 = 0.9 * (1.0 / emptyCells.length);
    const prob4 = 0.1 * (1.0 / emptyCells.length);
    
    // Simplification for speed: only sample a few empty cells if many exist
    const sampleCells = emptyCells.slice(0, 4); 
    const adjustedProb2 = 0.9 * (1.0 / sampleCells.length);
    const adjustedProb4 = 0.1 * (1.0 / sampleCells.length);

    for (const { r, c } of sampleCells) {
      const b2 = board.map(row => [...row]);
      b2[r][c] = 2;
      expectedScore += expectimax(b2, depth - 1, true, memo) * adjustedProb2;
      
      const b4 = board.map(row => [...row]);
      b4[r][c] = 4;
      expectedScore += expectimax(b4, depth - 1, true, memo) * adjustedProb4;
    }
    result = expectedScore;
  }
  
  memo.set(boardKey, result);
  return result;
}

self.onmessage = (e: MessageEvent<AIRequest>) => {
  const { board, timeLimit = 200 } = e.data;
  const start = performance.now();
  
  const scores: Record<Direction, number> = { up: 0, down: 0, left: 0, right: 0 };
  let bestDirection: Direction | null = null;
  let bestScore = -Infinity;
  
  const memo = new Map<string, number>();
  
  // Iterative deepening depth limit based on remaining empty cells
  const depth = 2; 

  for (const dir of ['up', 'down', 'left', 'right'] as Direction[]) {
    const { newBoard, changed } = moveBoard(board, dir);
    if (changed) {
      const s = expectimax(newBoard, depth, false, memo);
      scores[dir] = s;
      if (s > bestScore) {
        bestScore = s;
        bestDirection = dir;
      }
    } else {
      scores[dir] = -1000000;
    }
  }
  
  self.postMessage({
    bestDirection,
    scores
  } as AIResponse);
};
