/**
 * Sistema de som do VERBUM.
 *
 * Toca arquivos reais (pacotes CC0 do Kenney, ver public/sounds/CREDITS.txt)
 * pela Web Audio API: os arquivos são baixados e decodificados uma vez,
 * e cada toque sai sem atraso, com volume e leve variação de tom.
 */

import type { TileMatch } from "@/types/game";
import { asset } from "@/utils/asset";

const SOUND_FILES = {
  click: asset("/sounds/click.mp3"),
  correct: asset("/sounds/correct.mp3"),
  partial: asset("/sounds/partial.mp3"),
  wrong: asset("/sounds/wrong.mp3"),
  wrongTile: asset("/sounds/wrong-tile.mp3"),
  stepper: asset("/sounds/stepper.mp3"),
  hint: asset("/sounds/hint.mp3"),
  shiny: asset("/sounds/shiny.mp3"),
  victory: asset("/sounds/victory.mp3"),
} as const;

type SoundName = keyof typeof SOUND_FILES;

interface PlayOptions {
  volume?: number;
  /** Atraso em segundos. */
  delay?: number;
  /** Velocidade/tom (1 = original). */
  rate?: number;
  /** Variação aleatória de tom (ex.: 0.04 = ±4%). */
  jitter?: number;
}

const MASTER_VOLUME = 0.8;

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
const buffers = new Map<SoundName, AudioBuffer>();
let loading: Promise<void> | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = MASTER_VOLUME;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

/** Baixa e decodifica todos os sons (≈90 KB). Seguro chamar várias vezes. */
export function preloadSounds(): Promise<void> {
  if (loading) return loading;
  const audio = getContext();
  if (!audio) return Promise.resolve();
  loading = Promise.all(
    (Object.entries(SOUND_FILES) as [SoundName, string][]).map(async ([name, url]) => {
      try {
        const res = await fetch(url);
        const data = await res.arrayBuffer();
        buffers.set(name, await audio.decodeAudioData(data));
      } catch {
        /* som ausente: o jogo segue em silêncio para esse efeito */
      }
    })
  ).then(() => undefined);
  return loading;
}

function play(name: SoundName, { volume = 1, delay = 0, rate = 1, jitter = 0 }: PlayOptions = {}): void {
  if (isAudioMuted()) return;
  const audio = getContext();
  if (!audio || !master) return;

  const start = (offset: number) => {
    const buffer = buffers.get(name);
    if (!buffer || !master) return;
    const source = audio.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = rate * (1 + (Math.random() * 2 - 1) * jitter);
    const gain = audio.createGain();
    gain.gain.value = volume;
    source.connect(gain).connect(master);
    source.start(audio.currentTime + Math.max(0, offset));
  };

  if (buffers.has(name)) {
    start(delay);
  } else {
    const requestedAt = audio.currentTime;
    void preloadSounds().then(() => {
      const late = audio.currentTime - requestedAt;
      // Se demorou demais para carregar, não toca fora de hora
      if (late < 0.4) start(delay - late);
    });
  }
}

const fileBuffers = new Map<string, Promise<AudioBuffer | null>>();

/** Toca um arquivo avulso (usado na página de teste de sons). */
export function playFile(url: string, { volume = 1, delay = 0, rate = 1 }: PlayOptions = {}): void {
  const audio = getContext();
  if (!audio || !master) return;
  if (!fileBuffers.has(url)) {
    fileBuffers.set(url, fetch(url).then((r) => r.arrayBuffer()).then((d) => audio.decodeAudioData(d)).catch(() => null));
  }
  void fileBuffers.get(url)!.then((buffer) => {
    if (!buffer || !master) return;
    const source = audio.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = rate;
    const gain = audio.createGain();
    gain.gain.value = volume;
    source.connect(gain).connect(master);
    source.start(audio.currentTime + delay);
  });
}

const MUTE_KEY = "verbum_audio_muted";
let soundMuted = false;

export function isAudioMuted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const stored = localStorage.getItem(MUTE_KEY);
    if (stored !== null) soundMuted = stored === "true";
  } catch { /* armazenamento indisponível */ }
  return soundMuted;
}

export function setAudioMuted(muted: boolean): void {
  soundMuted = muted;
  try { localStorage.setItem(MUTE_KEY, String(muted)); } catch { /* ignora */ }
}

/* ---------- Efeitos de interface ---------- */

export function playClickSound(): void {
  play("click", { volume: 0.7, jitter: 0.05 });
}

export function playStepperSound(): void {
  play("stepper", { volume: 0.6, jitter: 0.06 });
}

export function playHintSound(): void {
  play("hint", { volume: 0.8 });
  play("shiny", { volume: 0.5, delay: 0.12 });
}

export function playShinySound(): void {
  play("shiny", { volume: 0.7 });
}

/** Primeira peça de um palpite (retrato aparecendo): sem som de carta, só um toque leve. */
export function playRevealSound(): void {
  play("click", { volume: 0.5 });
}

/* ---------- Peças virando ---------- */

/**
 * Som de uma peça revelada (sem som de carta virando):
 * brilho (correto), toque (parcial) ou um "toc" macio (errado).
 */
export function playTileSound(match: TileMatch): void {
  if (match === "CORRECT") play("correct", { volume: 0.6 });
  else if (match === "PARTIAL") play("partial", { volume: 0.55 });
  else play("wrongTile", { volume: 0.55, jitter: 0.03 });
}

/** Mantidos por compatibilidade: correspondem a uma peça virando. */
export function playCorrectSound(): void { playTileSound("CORRECT"); }
export function playPartialSound(): void { playTileSound("PARTIAL"); }

/** Palpite errado (fim da revelação ou chute recusado). */
export function playWrongSound(): void {
  play("wrong", { volume: 0.5 });
}

/* ---------- Vitória ---------- */

/** Fanfarra de vitória (metais e pratos, CC0 — ver public/sounds/CREDITS.txt). */
export function playVictorySound(): void {
  play("victory", { volume: 0.85 });
}
