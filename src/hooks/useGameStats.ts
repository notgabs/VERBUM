"use client";

import { useState, useEffect } from "react";
import { GameStats } from "@/types/game";
import { applyDailyResult, currentStreak } from "@/domain/game/streak";

const STORAGE_KEY = "verbum_stats_v2";

const DEFAULT_STATS: GameStats = {
  jogosRealizados: 0,
  sequenciaAtual: 0,
  maiorSequencia: 0,
  tentativasMedias: 0,
  dicasUtilizadas: 0,
  vitorias: 0,
  musicGamesPlayed: 0,
  musicWins: 0,
};

export function useGameStats() {
  const [stats, setStats] = useState<GameStats>(DEFAULT_STATS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const item = localStorage.getItem(STORAGE_KEY);
        if (item) {
          const parsed = JSON.parse(item);
          setStats({ ...DEFAULT_STATS, ...parsed });
        }
      } catch {
        // Ignore local storage error
      } finally {
        setIsLoaded(true);
      }
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  /** Grava o resultado de um desafio diário. */
  const record = (won: boolean, change: (prev: GameStats) => Partial<GameStats>) => {
    setStats((prev) => {
      const updated: GameStats = {
        ...prev,
        jogosRealizados: prev.jogosRealizados + 1,
        vitorias: prev.vitorias + (won ? 1 : 0),
        ...applyDailyResult(prev, won),
        ...change(prev),
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Sem armazenamento: segue só na memória
      }
      return updated;
    });
  };

  const recordGameResult = (won: boolean, attempts: number, hintsUsed: number) =>
    record(won, (prev) => ({
      dicasUtilizadas: prev.dicasUtilizadas + hintsUsed,
      // Média ponderada de tentativas
      tentativasMedias: Number(((prev.tentativasMedias * prev.jogosRealizados + attempts) / (prev.jogosRealizados + 1)).toFixed(1)),
    }));

  const recordMusicResult = (won: boolean) =>
    record(won, (prev) => ({
      musicGamesPlayed: (prev.musicGamesPlayed ?? 0) + 1,
      musicWins: (prev.musicWins ?? 0) + (won ? 1 : 0),
    }));

  const winRate =
    stats.jogosRealizados > 0
      ? Math.round((stats.vitorias / stats.jogosRealizados) * 100)
      : 0;

  return {
    stats,
    /** Dias seguidos com vitória num desafio diário (zera se passou um dia inteiro sem vitória). */
    streak: currentStreak(stats),
    winRate,
    isLoaded,
    recordGameResult,
    recordMusicResult,
  };
}
