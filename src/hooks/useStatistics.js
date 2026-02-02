import { useState, useEffect, useCallback } from 'react';

function loadStatsFromStorage() {
  const saved = localStorage.getItem('ipv6-stats');
  return saved ? JSON.parse(saved) : { total: 0, correct: 0, byCategory: {} };
}

function saveStatsToStorage(stats) {
  localStorage.setItem('ipv6-stats', JSON.stringify(stats));
}

export function useStatistics() {
  const [stats, setStats] = useState(loadStatsFromStorage);

  useEffect(() => {
    saveStatsToStorage(stats);
  }, [stats]);

  const recordAnswer = useCallback((category, isCorrect) => {
    setStats(prev => ({
      total: prev.total + 1,
      correct: prev.correct + (isCorrect ? 1 : 0),
      byCategory: {
        ...prev.byCategory,
        [category]: {
          total: (prev.byCategory[category]?.total || 0) + 1,
          correct: (prev.byCategory[category]?.correct || 0) + (isCorrect ? 1 : 0)
        }
      }
    }));
  }, []);

  const resetStats = useCallback(() => {
    setStats({ total: 0, correct: 0, byCategory: {} });
  }, []);

  return { stats, recordAnswer, resetStats };
}