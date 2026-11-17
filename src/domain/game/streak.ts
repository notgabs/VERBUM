import { getLocalDayKey } from "./dailyChallenge.ts";

/**
 * Sequência de dias: conta os dias seguidos em que o jogador venceu pelo menos um desafio diário.
 * Vencer vários jogos no mesmo dia conta um dia só; perder um jogo não zera o dia (outro modo ainda pode ser vencido).
 * Um dia inteiro sem vitória quebra a sequência.
 */
export interface StreakState {
  sequenciaAtual: number;
  maiorSequencia: number;
  ultimoDiaVitoria?: string;
}

function dayBefore(dayKey: string): string {
  const [y, m, d] = dayKey.split("-").map(Number);
  return getLocalDayKey(new Date(y, m - 1, d - 1));
}

/** Atualiza a sequência depois de um desafio diário terminado. */
export function applyDailyResult(prev: StreakState, won: boolean, today = getLocalDayKey()): StreakState {
  if (!won || prev.ultimoDiaVitoria === today) return prev;
  const sequenciaAtual = prev.ultimoDiaVitoria === dayBefore(today) ? prev.sequenciaAtual + 1 : 1;
  return { sequenciaAtual, maiorSequencia: Math.max(prev.maiorSequencia, sequenciaAtual), ultimoDiaVitoria: today };
}

/** Sequência que deve aparecer hoje: some se o último dia com vitória foi antes de ontem. */
export function currentStreak(state: StreakState, today = getLocalDayKey()): number {
  if (!state.ultimoDiaVitoria) return 0;
  return state.ultimoDiaVitoria === today || state.ultimoDiaVitoria === dayBefore(today) ? state.sequenciaAtual : 0;
}
