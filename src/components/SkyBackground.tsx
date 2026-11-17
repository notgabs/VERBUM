"use client";

import { useEffect, useRef } from "react";

const CLOUDS = [
  { top: "9%", w: 180, h: 46, dur: 95, delay: -10 },
  { top: "24%", w: 120, h: 32, dur: 120, delay: -70 },
  { top: "47%", w: 210, h: 52, dur: 140, delay: -40 },
  { top: "68%", w: 140, h: 36, dur: 110, delay: -95 },
  { top: "83%", w: 170, h: 42, dur: 130, delay: -20 },
];

interface Soul {
  x: number;
  y: number;
  r: number;
  speed: number;
  sway: number;
  phase: number;
  glow: number;
}

/**
 * Cenário: céu com nuvens que passam devagar e pontos de luz dourados
 * subindo — as almas subindo para o céu.
 */
export function SkyBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let frame = 0;
    let running = !document.hidden;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const count = Math.round(Math.min(70, Math.max(28, (width * height) / 22000)));
    const spawn = (anywhere: boolean): Soul => ({
      x: Math.random() * width,
      y: anywhere ? Math.random() * height : height + 20,
      r: Math.random() * 1.8 + 1.2,
      speed: Math.random() * 0.35 + 0.18,
      sway: Math.random() * 0.6 + 0.2,
      phase: Math.random() * Math.PI * 2,
      glow: Math.random() * 0.3 + 0.65,
    });
    const souls: Soul[] = Array.from({ length: count }, () => spawn(true));

    const draw = (t: number) => {
      ctx.clearRect(0, 0, width, height);
      for (const s of souls) {
        if (!reduce) {
          s.y -= s.speed;
          s.x += Math.sin(t * 0.0006 + s.phase) * s.sway * 0.3;
          if (s.y < -20) Object.assign(s, spawn(false));
        }
        // Brilho constante; somem suavemente perto do topo
        const fade = Math.min(1, s.y / (height * 0.35));
        const alpha = Math.max(0, fade * s.glow);
        const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 5);
        g.addColorStop(0, `rgba(255, 236, 160, ${alpha})`);
        g.addColorStop(0.25, `rgba(255, 206, 84, ${alpha * 0.55})`);
        g.addColorStop(1, "rgba(255, 196, 60, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 5, 0, Math.PI * 2);
        ctx.fill();
      }
      if (running && !reduce) frame = requestAnimationFrame(draw);
    };

    const onVisibility = () => {
      running = !document.hidden;
      cancelAnimationFrame(frame);
      if (running) frame = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {CLOUDS.map((c, i) => (
        <span
          key={i}
          className="cloud cloud-drift"
          style={{ top: c.top, left: 0, width: c.w, height: c.h, animationDuration: `${c.dur}s`, animationDelay: `${c.delay}s` }}
        />
      ))}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
