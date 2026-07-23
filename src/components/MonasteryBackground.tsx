"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { isAudioMuted, setAudioMuted, playClickSound } from "@/utils/sound";

interface MonasteryBackgroundProps {
  children: React.ReactNode;
  showBackButton?: boolean;
  fitViewport?: boolean;
}

export const MonasteryBackground: React.FC<MonasteryBackgroundProps> = ({
  children,
  showBackButton = false,
  fitViewport = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setMuted(isAudioMuted());
  }, []);

  const handleToggleSound = () => {
    const next = !muted;
    setMuted(next);
    setAudioMuted(next);
    if (!next) {
      playClickSound();
    }
  };

  // Subtle floating golden dust motes in monastery sunlight
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
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

    for (let i = 0; i < 35; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.floor(Math.random() * 3) + 2,
        speedY: -(Math.random() * 0.4 + 0.15),
        speedX: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.5 + 0.25,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;

        if (p.y < -10) p.y = height + 10;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.fillStyle = `rgba(255, 215, 120, ${p.opacity})`;
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      className={`relative ${fitViewport ? "h-dvh overflow-hidden" : "min-h-screen overflow-x-hidden"} w-full bg-[#180e07] text-[#f4ecd8] flex flex-col items-center justify-between font-mono select-none`}
    >
      {/* Background Pixel Library Texture Overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-25 z-0"
        style={{
          backgroundImage: `url('/images/monastery-library-pixel.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "sepia(40%) contrast(120%) brightness(50%)",
        }}
      />

      {/* Ambient Vignette & Warm Candlelight Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,185,70,0.12)_0%,_rgba(10,5,2,0.85)_80%)]" />

      {/* Floating Dust Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-10"
      />

      {/* Top Monastery Bar (Pixel Navigation & Ambient Audio Toggle) */}
      <header className={`relative z-30 w-full max-w-5xl px-4 ${fitViewport ? "absolute top-0 right-0 py-3 flex justify-end" : "py-3 flex items-center justify-between border-b-4 border-[#3e2413] bg-[#22130b]/90 shadow-md"}`}>
        {!fitViewport && <div className="flex items-center gap-3">
          {showBackButton ? (
            <Link
              href="/"
              onClick={() => playClickSound()}
              className="pixel-btn-wood px-3 py-1.5 text-xs sm:text-sm font-bold flex items-center gap-1.5 uppercase tracking-wider cursor-pointer"
            >
              <span>🏰</span>
              <span>Início</span>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xl">✝️</span>
              <span className="text-sm font-black tracking-widest text-[#f5c458] drop-shadow-[0_2px_0_#000]">
                VERBUM
              </span>
            </div>
          )}
        </div>}

        {/* Ambient Monastery Candles Indicator */}
        <div className="flex items-center gap-4">

          {/* Sound Toggle Button */}
          <button
            onClick={handleToggleSound}
            title={muted ? "Ativar som" : "Silenciar som"}
            className="pixel-btn-wood px-2.5 py-1 text-xs sm:text-sm flex items-center gap-1 cursor-pointer"
          >
            <span>{muted ? "🔇" : "🔊"}</span>
            <span className="hidden sm:inline">{muted ? "Mudo" : "Som"}</span>
          </button>
        </div>
      </header>

      {/* Main Pixel Content Center Stage */}
      <main className={`relative z-20 w-full max-w-4xl flex-1 flex flex-col items-center justify-center ${fitViewport ? "overflow-hidden p-2 sm:p-3" : "p-3 sm:p-6"} my-auto`}>
        {children}
      </main>

    </div>
  );
};
