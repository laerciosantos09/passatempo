
import { RankingPeriod, Score } from '../types';

// Simulando um banco de dados local para persistência enquanto não há backend real
const STORAGE_KEY = 'passatemposp_scores';

const getInitialRankings = (): Record<string, Record<RankingPeriod, Score[]>> => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);

  // Mocks iniciais
  return {
    sudoku: { daily: [], weekly: [], monthly: [], yearly: [] },
    memory: { daily: [], weekly: [], monthly: [], yearly: [] },
    snake: { daily: [], weekly: [], monthly: [], yearly: [] },
    quiz: { daily: [], weekly: [], monthly: [], yearly: [] },
    reaction: { daily: [], weekly: [], monthly: [], yearly: [] },
  };
};

export const saveScore = (gameSlug: string, username: string, score: number, level: number) => {
  const db = getInitialRankings();
  const entry: Score = {
    username,
    score,
    level,
    date: new Date().toISOString()
  };

  // Adiciona em todos os períodos (simplificado para o mock)
  const periods: RankingPeriod[] = ['daily', 'weekly', 'monthly', 'yearly'];
  periods.forEach(p => {
    db[gameSlug][p].push(entry);
    db[gameSlug][p].sort((a, b) => b.score - a.score);
    db[gameSlug][p] = db[gameSlug][p].slice(0, 10); // Top 10
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
};

export const getGameRankings = (gameSlug: string) => {
  const db = getInitialRankings();
  return db[gameSlug] || { daily: [], weekly: [], monthly: [], yearly: [] };
};
