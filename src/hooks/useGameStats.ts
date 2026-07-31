"use client";

import { useState, useEffect } from "react";
import { GameStats } from "@/types/game";

const STORAGE_KEY = "verbum_stats_v2";

const DEFAULT_STATS: GameStats = {
  jogosRealizados: 0,
  sequenciaAtual: 0,
  maiorSequencia: 0,
  tentativasMedias: 0,
  dicasUtilizadas: 0,
  vitorias: 0,
};

export function useGameStats() {
  const [stats, setStats] = useState<GameStats>(DEFAULT_STATS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const item = localStorage.getItem(STORAGE_KEY);
        if (item) {
          setStats(JSON.parse(item));
        }
      } catch {
        // Ignore local storage error
      } finally {
        setIsLoaded(true);
      }
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  const recordGameResult = (won: boolean, attempts: number, hintsUsed: number) => {
    setStats((prev) => {
      const newJogos = prev.jogosRealizados + 1;
      const newVitorias = won ? prev.vitorias + 1 : prev.vitorias;
      const newStreak = won ? prev.sequenciaAtual + 1 : 0;
      const newMaxStreak = Math.max(prev.maiorSequencia, newStreak);
      const newHints = prev.dicasUtilizadas + hintsUsed;

      // Calculate weighted average attempts
      const totalAttemptsBefore = prev.tentativasMedias * prev.jogosRealizados;
      const newAverageAttempts =
        newJogos > 0
          ? Number(((totalAttemptsBefore + attempts) / newJogos).toFixed(1))
          : attempts;

      const updated: GameStats = {
        jogosRealizados: newJogos,
        sequenciaAtual: newStreak,
        maiorSequencia: newMaxStreak,
        tentativasMedias: newAverageAttempts,
        dicasUtilizadas: newHints,
        vitorias: newVitorias,
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Storage fail fallback
      }

      return updated;
    });
  };

  const winRate =
    stats.jogosRealizados > 0
      ? Math.round((stats.vitorias / stats.jogosRealizados) * 100)
      : 0;

  return {
    stats,
    winRate,
    isLoaded,
    recordGameResult,
  };
}
