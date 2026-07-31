/** Produz uma chave local estável, sem depender do horário UTC. */
export function getLocalDayKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Hash pequeno, estável e independente do ambiente para o desafio do dia. */
export function stableHash(value: string): number {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function selectDailyId(ids: readonly string[], date = new Date()): string | undefined {
  if (ids.length === 0) return undefined;
  return ids[stableHash(getLocalDayKey(date)) % ids.length];
}

