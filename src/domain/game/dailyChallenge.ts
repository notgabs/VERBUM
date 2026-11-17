/** Produz uma chave local estavel, sem depender do horario UTC. */
export function getLocalDayKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Calcula os dias passados desde uma data de referencia (epoch local) */
function getDaysSinceEpoch(date = new Date()): number {
  // Fix the time to local midnight
  const localMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  // Epoch: Jan 1, 2024 local time
  const epoch = new Date(2024, 0, 1);
  const diffTime = localMidnight.getTime() - epoch.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/** 
 * Permutacao deterministica baseada num seed (pseudo-random generator: LCG).
 * Garantimos uma ordem "embaralhada" que nao muda e nao repete antes de percorrer todo o array.
 */
function shuffleArray<T>(array: readonly T[], seed: number): T[] {
  const shuffled = [...array];
  let m = shuffled.length;
  let t: T;
  let i: number;
  let currentSeed = seed;

  // LCG pseudo-random function
  const random = () => {
    currentSeed = (currentSeed * 1664525 + 1013904223) % 4294967296;
    return currentSeed / 4294967296;
  };

  // Fisher-Yates shuffle
  while (m) {
    i = Math.floor(random() * m--);
    t = shuffled[m];
    shuffled[m] = shuffled[i];
    shuffled[i] = t;
  }
  return shuffled;
}

export function selectDailyId(ids: readonly string[], date = new Date()): string | undefined {
  if (ids.length === 0) return undefined;
  
  // O seed base para a "Temporada 1" (qualquer numero fixo serve)
  const SEASON_SEED = 12345;
  const shuffled = shuffleArray(ids, SEASON_SEED);
  
  const days = getDaysSinceEpoch(date);
  // Percorre o array embaralhado um item por dia, dando a volta quando acabar
  // Protecao contra dias negativos (antes do epoch)
  const index = ((days % ids.length) + ids.length) % ids.length;
  
  return shuffled[index];
}

/** Seleciona um alvo novo a cada carregamento da pagina. */
export function selectRandomId(
  ids: readonly string[],
  random: () => number = Math.random
): string | undefined {
  if (ids.length === 0) return undefined;
  return ids[Math.floor(random() * ids.length)];
}
