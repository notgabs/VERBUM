/**
 * Contexto de áudio único do site (efeitos sonoros e trechos de música).
 *
 * No celular o áudio só toca depois de um toque do jogador, e no iPhone o Web Audio fica mudo com o botão de
 * silencioso ligado. Por isso:
 *  - o contexto é criado e "destravado" no primeiro toque (unlockAudio);
 *  - pedimos à página para tocar como "reprodução de mídia" (audioSession), que ignora o botão de silencioso;
 *  - em iPhones antigos (sem audioSession), um som mudo em loop faz o mesmo papel.
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let silentLoop: HTMLAudioElement | null = null;

const MASTER_VOLUME = 0.8;

type AudioSessionNavigator = Navigator & { audioSession?: { type: string } };

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

/** WAV mudo de 1 s, criado na hora (não precisa de arquivo). */
function silentWavUrl(): string {
  const sampleRate = 8000;
  const samples = sampleRate;
  const buffer = new ArrayBuffer(44 + samples);
  const v = new DataView(buffer);
  const text = (offset: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(offset + i, s.charCodeAt(i)); };
  text(0, "RIFF"); v.setUint32(4, 36 + samples, true); text(8, "WAVE"); text(12, "fmt ");
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, sampleRate, true); v.setUint32(28, sampleRate, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true);
  text(36, "data"); v.setUint32(40, samples, true);
  new Uint8Array(buffer, 44).fill(128); // 128 = silêncio em PCM de 8 bits
  return URL.createObjectURL(new Blob([buffer], { type: "audio/wav" }));
}

function allowPlaybackInSilentMode(): void {
  const nav = navigator as AudioSessionNavigator;
  if (nav.audioSession) {
    try { nav.audioSession.type = "playback"; } catch { /* navegador não deixa: segue */ }
    return;
  }
  if (isIOS() && !silentLoop) {
    try {
      silentLoop = new Audio(silentWavUrl());
      silentLoop.loop = true;
      silentLoop.volume = 0.01;
      void silentLoop.play().catch(() => { silentLoop = null; });
    } catch { silentLoop = null; }
  }
}

/** Contexto compartilhado (criado sob demanda). Em navegador sem Web Audio devolve null. */
export function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = MASTER_VOLUME;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

/** Ganho geral dos efeitos sonoros. */
export function getMasterGain(): GainNode | null {
  getAudioContext();
  return master;
}

/** Deve ser chamado dentro de um toque/clique: liga o áudio no celular. */
export function unlockAudio(): void {
  const audio = getAudioContext();
  if (!audio) return;
  allowPlaybackInSilentMode();
  // Um instante de silêncio completa o desbloqueio no Safari
  try {
    const source = audio.createBufferSource();
    source.buffer = audio.createBuffer(1, 1, 22050);
    source.connect(audio.destination);
    source.start(0);
  } catch { /* ignora */ }
}

/** Pronto para tocar? (false enquanto o navegador ainda bloqueia o áudio) */
export function isAudioRunning(): boolean {
  return ctx !== null && ctx.state === "running";
}
