/** Regras do "Acerte a música": cada tentativa libera um trecho maior, a partir do início da prévia. */

/** Duração do trecho (em segundos) liberado em cada tentativa: 8 tentativas, de 0,2 s a 20 s. */
export const CLIP_STEPS = [0.2, 0.5, 1, 1.5, 2, 5, 10, 20] as const;
export const MAX_ATTEMPTS = CLIP_STEPS.length;
export const MAX_CLIP_SECONDS = CLIP_STEPS[CLIP_STEPS.length - 1];

export type MusicAttempt =
  | { kind: "skip" }
  | { kind: "wrong"; titulo: string; key?: string }
  | { kind: "correct"; titulo: string; key?: string };

/** Trecho liberado depois de `attemptsUsed` tentativas (pulos contam). */
export function clipForAttempts(attemptsUsed: number): number {
  return CLIP_STEPS[Math.min(Math.max(attemptsUsed, 0), MAX_ATTEMPTS - 1)];
}

/** "0,1 s", "1 s", "20 s". */
export function formatSeconds(seconds: number): string {
  return `${String(seconds).replace(".", ",")} s`;
}

/** Compara títulos ignorando acentos, maiúsculas, pontuação e espaços. */
export function titleKey(value: string): string {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function isCorrectGuess(guess: string, target: { titulo: string; apelidos?: readonly string[] }): boolean {
  const key = titleKey(guess);
  return key.length > 0 && [target.titulo, ...(target.apelidos ?? [])].some((t) => titleKey(t) === key);
}

/** Estado do jogo a partir das tentativas feitas. */
export function musicGameStatus(attempts: readonly MusicAttempt[]): "playing" | "won" | "lost" {
  if (attempts.some((a) => a.kind === "correct")) return "won";
  return attempts.length >= MAX_ATTEMPTS ? "lost" : "playing";
}

/**
 * Posição (0 a 1) de um instante na barra de trechos, que tem 8 partes iguais:
 * a parte i vai do fim do trecho anterior até CLIP_STEPS[i]. Assim, 0,2 s não some numa barra de 20 s.
 */
export function timelinePosition(seconds: number): number {
  if (seconds <= 0) return 0;
  let start = 0;
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const end = CLIP_STEPS[i];
    if (seconds <= end) return (i + (seconds - start) / (end - start)) / MAX_ATTEMPTS;
    start = end;
  }
  return 1;
}
