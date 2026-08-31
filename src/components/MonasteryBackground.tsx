"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { isAudioMuted, setAudioMuted, playClickSound } from "@/utils/sound";
import { ModalBase } from "@/components/ModalBase";

interface MonasteryBackgroundProps {
  children: React.ReactNode;
  showBackButton?: boolean;
  fitViewport?: boolean;
  infoContent?: React.ReactNode;
  logoMessage?: React.ReactNode;
}

export const MonasteryBackground: React.FC<MonasteryBackgroundProps> = ({
  children,
  showBackButton = false,
  fitViewport = false,
  infoContent,
  logoMessage,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [muted, setMuted] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isLogoMessageOpen, setIsLogoMessageOpen] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMuted(isAudioMuted()));
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleToggleSound = () => {
    const next = !muted;
    setMuted(next);
    setAudioMuted(next);
    if (!next) {
      playClickSound();
    }
  };

  const handleCloseInfo = () => {
    playClickSound();
    setIsInfoOpen(false);
  };

  const handleCloseLogoMessage = () => {
    playClickSound();
    setIsLogoMessageOpen(false);
  };

  // Subtle floating golden dust motes in monastery sunlight
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number | undefined;
    let paused = document.hidden;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      opacity: number;
    }> = [];

    for (let i = 0; i < 68; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.floor(Math.random() * 4) + 3,
        speedY: -(Math.random() * 0.55 + 0.2),
        speedX: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.42 + 0.42,
      });
    }

    const render = () => {
      if (paused) return;
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;

        if (p.y < -10) p.y = height + 10;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.fillStyle = `rgba(255, 208, 82, ${p.opacity})`;
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
      });

      animId = requestAnimationFrame(render);
    };

    const handleVisibility = () => {
      paused = document.hidden;
      if (!paused) render();
      else if (animId) cancelAnimationFrame(animId);
    };
    document.addEventListener("visibilitychange", handleVisibility);
    render();

    return () => {
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <div
      className={`relative ${fitViewport ? "h-dvh overflow-hidden" : "min-h-screen overflow-x-hidden"} w-full sky-background text-[#fff7e7] flex flex-col items-center justify-between font-sf-text select-none`}
    >
      {/* Pixel clouds move horizontally while the canvas particles rise vertically. */}
      <div className="pixel-cloud pixel-cloud-one" aria-hidden="true" />
      <div className="pixel-cloud pixel-cloud-two" aria-hidden="true" />
      <div className="pixel-cloud pixel-cloud-three" aria-hidden="true" />
      <div className="pixel-cloud pixel-cloud-four" aria-hidden="true" />
      <div className="pixel-cloud pixel-cloud-five" aria-hidden="true" />

      {/* Floating Dust Canvas */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="fixed inset-0 z-20 h-screen w-screen pointer-events-none"
      />

      {/* Top Monastery Bar (Pixel Navigation & Ambient Audio Toggle) */}
      <header className={`relative z-30 grid w-[calc(100%-1.5rem)] max-w-5xl grid-cols-3 items-center px-5 ${fitViewport ? "absolute top-3 right-3 py-3" : "mt-3 py-3 text-[#183c5b]"}`}>
        <div className="relative justify-self-start">
          {!fitViewport && showBackButton && (
            <Link
              href="/"
              onClick={() => playClickSound()}
              className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] text-[var(--color-text-main)] px-3 py-1.5 text-xs sm:text-sm font-bold flex items-center gap-1.5 uppercase tracking-wider rounded-lg shadow-sm hover:bg-[var(--color-surface-elevated)] transition-colors cursor-pointer"
            >
              <span>🏰</span>
              <span>Início</span>
            </Link>
          )}
        </div>

        {!fitViewport && (
          <div className="relative justify-self-center">{logoMessage ? (
            <button
              onClick={() => {
                playClickSound();
                setIsLogoMessageOpen(true);
              }}
              className="justify-self-center cursor-pointer"
              aria-label="Mensagem sobre este modo de jogo"
              aria-haspopup="dialog"
              aria-expanded={isLogoMessageOpen}
            >
              <img
                src="/logo-verbum.png"
                alt="Verbum"
                className="h-8 sm:h-10 w-auto object-contain drop-shadow-sm scale-[3.5] sm:scale-[4] transition-transform hover:scale-[3.7] sm:hover:scale-[4.2]"
              />
            </button>
          ) : (
            <Link
              href="/"
              onClick={() => playClickSound()}
              className="justify-self-center"
              aria-label="Verbum — início"
            >
              <img
                src="/logo-verbum.png"
                alt="Verbum"
                className="h-8 sm:h-10 w-auto object-contain drop-shadow-sm scale-[3.5] sm:scale-[4] transition-transform hover:scale-[3.7] sm:hover:scale-[4.2]"
              />
            </Link>
          )}</div>
        )}

        {/* Game controls */}
        <div className="relative justify-self-end flex items-center gap-2 sm:gap-3">
          {infoContent && (
            <button
              onClick={() => {
                playClickSound();
                setIsInfoOpen(true);
              }}
              className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] text-[var(--color-text-main)] px-3 py-1.5 text-xs sm:text-sm font-bold flex items-center uppercase tracking-wider rounded-lg shadow-sm hover:bg-[var(--color-surface-elevated)] transition-colors cursor-pointer"
              aria-haspopup="dialog"
              aria-expanded={isInfoOpen}
            >
              Info
            </button>
          )}
          {/* Sound Toggle Button */}
          {showBackButton && (
            <button
              onClick={handleToggleSound}
              title={muted ? "Ativar som" : "Silenciar som"}
              aria-label={muted ? "Ativar som" : "Silenciar som"}
              aria-pressed={!muted}
              className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] text-[var(--color-text-main)] px-3 py-1.5 text-xs sm:text-sm font-bold flex items-center gap-1.5 uppercase tracking-wider rounded-lg shadow-sm hover:bg-[var(--color-surface-elevated)] transition-colors cursor-pointer"
            >
              <span>{muted ? "🔇" : "🔊"}</span>
              <span className="hidden sm:inline">{muted ? "Mudo" : "Som"}</span>
            </button>
          )}
        </div>
      </header>

      {isInfoOpen && infoContent && (
        <ModalBase
          labelledBy="game-info-title"
          onClose={handleCloseInfo}
          className="bg-[var(--color-bg-app)] w-full max-w-lg border border-[var(--color-border-subtle)] rounded-xl p-6 sm:p-8 shadow-2xl custom-scrollbar"
        >
          <div className="mb-6 flex items-start justify-between gap-4">
            <h2 id="game-info-title" className="font-serif text-2xl font-black uppercase tracking-wider text-[var(--color-text-accent)]">
              Como jogar
            </h2>
            <button
              onClick={handleCloseInfo}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-app)] text-[var(--color-text-main)] transition-colors hover:bg-[var(--color-border-subtle)]"
              aria-label="Fechar informações"
            >
              ✕
            </button>
          </div>
          {infoContent}
        </ModalBase>
      )}

      {isLogoMessageOpen && logoMessage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={handleCloseLogoMessage}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Mensagem especial sobre este modo de jogo"
            className="pixel-parchment-dark w-full max-w-lg border-4 border-[#f5c458] p-2 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            {logoMessage}
          </section>
        </div>
      )}

      {/* Main Pixel Content Center Stage */}
      <main className={`relative z-20 w-full max-w-4xl flex-1 flex flex-col items-center ${fitViewport ? "justify-center overflow-hidden p-2 sm:p-3 my-auto" : "justify-start px-3 pb-6 pt-24 sm:px-6 sm:pb-6 sm:pt-28"}`}>
        {children}
      </main>

    </div>
  );
};
