import { useState, useCallback } from 'react';

export interface LeaderboardEntry {
  name: string;
  score: number;
  date: string;
  isLocal?: boolean;
}

const HALL_OF_FAME: LeaderboardEntry[] = [
  { name: 'AlphaMove', score: 87340, date: '2026-06-19' },
  { name: 'TileWizard', score: 74816, date: '2026-06-18' },
  { name: 'AI_Player_9', score: 62400, date: '2026-06-18' },
  { name: 'GridMaster', score: 55128, date: '2026-06-17' },
  { name: 'ExpectiMax', score: 49200, date: '2026-06-17' },
  { name: 'SlideKing', score: 43776, date: '2026-06-16' },
  { name: 'Zephyr404', score: 38912, date: '2026-06-16' },
  { name: 'NightOwl', score: 34560, date: '2026-06-15' },
  { name: 'PixelPusher', score: 28416, date: '2026-06-15' },
  { name: 'MergeQueen', score: 22104, date: '2026-06-14' },
];

const LS_KEY = '2048-leaderboard';

function getLocalEntries(): LeaderboardEntry[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveLocalEntries(entries: LeaderboardEntry[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(entries));
}

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>(() => {
    const local = getLocalEntries();
    return [...HALL_OF_FAME, ...local]
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);
  });

  const submitScore = useCallback((name: string, score: number) => {
    const newEntry: LeaderboardEntry = {
      name: name.trim().slice(0, 20) || 'Anonymous',
      score,
      date: new Date().toISOString().split('T')[0],
      isLocal: true,
    };
    const local = getLocalEntries();
    const updated = [...local, newEntry].sort((a, b) => b.score - a.score).slice(0, 10);
    saveLocalEntries(updated);

    setEntries(
      [...HALL_OF_FAME, ...updated]
        .sort((a, b) => b.score - a.score)
        .slice(0, 20)
    );
    return newEntry;
  }, []);

  const isHighScore = useCallback((score: number) => {
    return score > 0 && (entries.length < 20 || score > entries[entries.length - 1].score);
  }, [entries]);

  return { entries, submitScore, isHighScore };
}
