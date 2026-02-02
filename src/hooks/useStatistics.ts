import { useCallback, useEffect, useState } from "react";
import type { SessionStats } from "../types";

function loadStatsFromStorage(): SessionStats {
  const saved = localStorage.getItem("ipv6-stats");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.sessionStart && parsed.sessionDuration !== undefined) {
        return {
          ...parsed,
          sessionStart: new Date(parsed.sessionStart),
        };
      }
      console.log("Old stats format detected, resetting statistics");
    } catch (error) {
      console.warn("Failed to parse saved stats, resetting");
    }
  }

  return {
    total: 0,
    correct: 0,
    byCategory: {},
    sessionStart: new Date(),
    sessionDuration: 0,
  };
}

function saveStatsToStorage(stats: SessionStats): void {
  localStorage.setItem("ipv6-stats", JSON.stringify(stats));
}

export function useStatistics() {
  const [stats, setStats] = useState<SessionStats>(loadStatsFromStorage);

  useEffect(() => {
    saveStatsToStorage(stats);
  }, [stats]);

  const recordAnswer = useCallback((category: string, isCorrect: boolean) => {
    setStats(prev => ({
      ...prev,
      total: prev.total + 1,
      correct: prev.correct + (isCorrect ? 1 : 0),
      sessionDuration: Date.now() - prev.sessionStart.getTime(),
      byCategory: {
        ...prev.byCategory,
        [category]: {
          total: (prev.byCategory?.[category]?.total || 0) + 1,
          correct:
            (prev.byCategory?.[category]?.correct || 0) + (isCorrect ? 1 : 0),
        },
      },
    }));
  }, []);

  const resetStats = useCallback(() => {
    setStats({
      total: 0,
      correct: 0,
      byCategory: {},
      sessionStart: new Date(),
      sessionDuration: 0,
    });
  }, []);

  return { stats, recordAnswer, resetStats };
}
