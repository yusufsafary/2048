export type Board = number[][];
export type Direction = "up" | "down" | "left" | "right";

export function createEmptyBoard(): Board {
  return Array.from({ length: 4 }, () => Array(4).fill(0));
}

export function spawnTile(board: Board): Board {
  const emptyCells: { r: number; c: number }[] = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] === 0) {
        emptyCells.push({ r, c });
      }
    }
  }

  if (emptyCells.length === 0) return board;

  const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const newBoard = board.map(row => [...row]);
  newBoard[r][c] = Math.random() < 0.9 ? 2 : 4;
  return newBoard;
}

export function initializeBoard(): Board {
  let b = createEmptyBoard();
  b = spawnTile(b);
  b = spawnTile(b);
  return b;
}

function slideRow(row: number[]): { newRow: number[]; score: number } {
  const filtered = row.filter(val => val !== 0);
  const newRow: number[] = [];
  let score = 0;
  
  for (let i = 0; i < filtered.length; i++) {
    if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
      newRow.push(filtered[i] * 2);
      score += filtered[i] * 2;
      i++; // Skip the next tile as it has been merged
    } else {
      newRow.push(filtered[i]);
    }
  }
  
  while (newRow.length < 4) {
    newRow.push(0);
  }
  
  return { newRow, score };
}

function rotateBoard(board: Board, times: number): Board {
  let rotated = board;
  for (let t = 0; t < times; t++) {
    const newBoard = createEmptyBoard();
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        newBoard[c][3 - r] = rotated[r][c];
      }
    }
    rotated = newBoard;
  }
  return rotated;
}

export function moveBoard(board: Board, dir: Direction): { newBoard: Board; score: number; changed: boolean } {
  let rotated: Board;
  let rotations = 0;
  
  switch (dir) {
    case "left": rotations = 0; break;
    case "down": rotations = 1; break;
    case "right": rotations = 2; break;
    case "up": rotations = 3; break;
  }
  
  rotated = rotateBoard(board, rotations);
  
  let totalScore = 0;
  let changed = false;
  const nextRotated: Board = [];
  
  for (let r = 0; r < 4; r++) {
    const { newRow, score } = slideRow(rotated[r]);
    nextRotated.push(newRow);
    totalScore += score;
    for (let c = 0; c < 4; c++) {
      if (newRow[c] !== rotated[r][c]) {
        changed = true;
      }
    }
  }
  
  const newBoard = rotateBoard(nextRotated, (4 - rotations) % 4);
  
  return { newBoard, score: totalScore, changed };
}

export function isValidMove(board: Board, dir: Direction): boolean {
  return moveBoard(board, dir).changed;
}

export function isGameOver(board: Board): boolean {
  for (const dir of ["up", "down", "left", "right"] as Direction[]) {
    if (isValidMove(board, dir)) {
      return false;
    }
  }
  return true;
}

export function checkWin(board: Board): boolean {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] >= 2048) {
        return true;
      }
    }
  }
  return false;
}
