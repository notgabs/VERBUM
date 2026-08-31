import { useState, useEffect, useCallback } from "react";
import { MUSIC_CATALOG, Music } from "@/data/music";

export interface Attempt {
  /** Nome digitado pelo usuário (exato, como no input). */
  guess: string;
  /** Se o chute está correto. */
  correct: boolean;
  /** Duração do trecho usado nessa tentativa (segundos). */
  clipLength: number;
  /** Direção alfabética quando incorreto:  ↑ = título vem depois,
   *   ↓ = título vem antes. */
  direction?: "up" | "down";
}

/** Hook central que administra o estado de “Acertar a Música”. */
export function useMusicGame() {
  const maxClip = 16; // segundos
  const [target, setTarget] = useState<Music | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [clipLength, setClipLength] = useState<number>(0.5);

  /** Seleciona aleatoriamente a música‑alvo. */
  const pickRandom = useCallback(() => {
    const idx = Math.floor(Math.random() * MUSIC_CATALOG.length);
    setTarget(MUSIC_CATALOG[idx]);
    setAttempts([]);
    setClipLength(0.5);
  }, []);

  // inicia ao montar o componente
  useEffect(() => {
    pickRandom();
  }, [pickRandom]);

  /** Normaliza strings (case‑insensitive, sem acentos, sem pontuação). */
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s]/g, "")
      .trim();

  /** Processa um palpite do usuário. */
  const addAttempt = (guessRaw: string) => {
    if (!target) return;
    const guess = normalize(guessRaw);
    const targetNorm = normalize(target.title);
    const correct = guess === targetNorm;

    let direction: Attempt["direction"] | undefined;
    if (!correct) {
      direction = guess < targetNorm ? "down" : "up";
    }

    const newAttempt: Attempt = {
      guess: guessRaw,
      correct,
      clipLength,
      direction,
    };

    setAttempts((prev) => [...prev, newAttempt]);
    // dobra o tempo do próximo trecho, sem ultrapassar maxClip
    setClipLength((prev) => Math.min(prev * 2, maxClip));
  };

  /** Reinicia o jogo com nova música aleatória. */
  const reset = () => {
    pickRandom();
  };

  const isFinished = attempts.some((a) => a.correct);

  return {
    target,
    attempts,
    clipLength,
    addAttempt,
    reset,
    isFinished,
  };
}
