"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchDeezerTrack } from "@/utils/deezer";

export type ClipPlayerStatus = "loading" | "ready" | "error";

/**
 * Toca trechos exatos do início da prévia do Deezer com a Web Audio API.
 * O link da prévia expira, por isso é buscado de novo a cada música.
 * O elemento <audio> comum atrasa uns 100 ms ao pausar, o que estragaria os trechos curtos (0,2 s).
 */
export function useClipPlayer(deezerId: number | null) {
  const ctxRef = useRef<AudioContext | null>(null);
  const bufferRef = useRef<AudioBuffer | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const frameRef = useRef<number | null>(null);
  /** Resultado do último carregamento; vale só para a música (e tentativa) indicada em `key`. */
  const [loaded, setLoaded] = useState<{ key: string; status: "ready" | "error"; cover: string | null } | null>(null);
  /** Segundos já tocados do trecho atual (null quando parado). */
  const [elapsed, setElapsed] = useState<number | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  /** Para o som e a animação, sem mexer no estado (pode rodar dentro de efeitos). */
  const halt = useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    const src = sourceRef.current;
    sourceRef.current = null;
    if (src) {
      src.onended = null;
      try { src.stop(); } catch { /* já parou */ }
    }
  }, []);

  const stop = useCallback(() => { halt(); setElapsed(null); }, [halt]);

  const loadKey = `${deezerId}:${reloadKey}`;

  // Busca o link da prévia (que expira) e decodifica o áudio sempre que a música muda
  useEffect(() => {
    if (deezerId === null) return;
    let cancelled = false;
    halt();
    bufferRef.current = null;
    (async () => {
      let cover: string | null = null;
      try {
        const info = await fetchDeezerTrack(deezerId);
        if (cancelled) return;
        setElapsed(null);
        cover = info.cover;
        const bytes = await fetch(info.preview).then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error("prévia"))));
        ctxRef.current ??= new AudioContext();
        const buffer = await ctxRef.current.decodeAudioData(bytes);
        if (cancelled) return;
        bufferRef.current = buffer;
        setLoaded({ key: loadKey, status: "ready", cover });
      } catch {
        if (!cancelled) setLoaded({ key: loadKey, status: "error", cover });
      }
    })();
    return () => { cancelled = true; };
  }, [deezerId, loadKey, halt]);

  const current = loaded?.key === loadKey ? loaded : null;
  const status: ClipPlayerStatus = current?.status ?? "loading";
  const cover = current?.cover ?? null;

  useEffect(() => () => { stop(); void ctxRef.current?.close(); ctxRef.current = null; }, [stop]);

  /** Toca os primeiros `seconds` segundos, com fade curtinho nas pontas para não estalar. */
  const play = useCallback(async (seconds: number) => {
    const ctx = ctxRef.current;
    const buffer = bufferRef.current;
    if (!ctx || !buffer) return;
    stop();
    if (ctx.state === "suspended") await ctx.resume();
    const duration = Math.min(seconds, buffer.duration);
    const fade = Math.min(0.012, duration / 4);
    const gain = ctx.createGain();
    const t0 = ctx.currentTime + 0.02;
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(1, t0 + fade);
    gain.gain.setValueAtTime(1, t0 + duration - fade);
    gain.gain.linearRampToValueAtTime(0, t0 + duration);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(gain).connect(ctx.destination);
    src.start(t0, 0, duration);
    sourceRef.current = src;
    src.onended = () => { if (sourceRef.current === src) stop(); };
    const tick = () => {
      setElapsed(Math.min(duration, Math.max(0, ctx.currentTime - t0)));
      frameRef.current = requestAnimationFrame(tick);
    };
    tick();
  }, [stop]);

  return { status, cover, elapsed, isPlaying: elapsed !== null, play, stop, retry: () => setReloadKey((k) => k + 1) };
}
