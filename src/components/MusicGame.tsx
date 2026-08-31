"use client";

import { useState } from "react";
import { useMusicGame } from "@/hooks/useMusicGame";
import { MusicPlayer } from "@/components/MusicPlayer";
import { MusicBoard } from "@/components/MusicBoard";
import { useRef } from "react";
import { useGameStats } from "@/hooks/useGameStats";
import { MUSIC_CATALOG } from "@/data/music";
import { Button } from "@/components/ui/Button";

export const MusicGame: React.FC = () => {
  const {
    target,
    attempts,
    clipLength,
    addAttempt,
    reset,
    isFinished,
  } = useMusicGame();

  const { recordMusicResult } = useGameStats();
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    addAttempt(input);
    setInput("");

    if (!isFinished && normalize(input) === normalize(target?.title || "")) {
      recordMusicResult(true);
    }
  };

  const normalize = (s: string) =>
    s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s]/g, "").trim();

  return (
    <main className="max-w-xl mx-auto p-4 flex flex-col h-full mt-8">
      <h1 className="text-2xl font-serif font-bold text-center mb-4 text-[var(--color-text-main)] uppercase tracking-wider">
        🎵 Acertar a Música
      </h1>

      <div className="flex justify-between text-sm mb-2 px-2 text-[var(--color-text-muted)] font-medium uppercase tracking-wide">
        <span>Tentativa: {attempts.length + 1}</span>
        <span>Trecho: {clipLength}s</span>
      </div>

      {target && (
        <MusicPlayer
          src={target.src}
          clipLength={clipLength}
          attemptId={attempts.length}
        />
      )}

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2 w-full z-20">
        <div className="flex-1">
          <input
            type="text"
            list="music-options"
            placeholder="Nome da música / hino"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isFinished}
            className="w-full bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-xl px-4 py-3 h-[48px] text-[var(--color-text-main)] shadow-sm focus:outline-none focus:border-[var(--color-text-accent)]"
          />
          <datalist id="music-options">
            {MUSIC_CATALOG.map((m) => (
              <option key={m.title} value={m.title} />
            ))}
          </datalist>
        </div>
        <Button
          type="submit"
          disabled={isFinished || !input.trim()}
          className="shrink-0 h-[48px]"
        >
          OK
        </Button>
      </form>

      <div className="flex-1 overflow-y-auto mt-4 mb-24 z-10">
        <MusicBoard attempts={attempts} />

        {isFinished && target && (
          <div className="mt-6 p-6 bg-[var(--color-surface)] border border-[var(--color-status-correct)] rounded-xl text-center shadow-lg animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-2xl font-serif font-bold mb-2 text-[var(--color-status-correct)] uppercase tracking-wider">Parabéns! 🎉</h2>
            <p className="text-[var(--color-text-main)] mb-6 font-medium">
              Você acertou: <strong className="block text-xl mt-2 font-serif text-[var(--color-text-accent)]">{target.title}</strong>
            </p>
            <Button onClick={reset} variant="primary" className="w-full sm:w-auto">
              Jogar outra música
            </Button>
          </div>
        )}
      </div>
    </main>
  );
};
