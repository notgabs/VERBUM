import type {
  NumberComparison,
  Personagem,
  PersonagemGuessComparison,
  TileMatch,
} from "../types/game.ts";
import { findCatholicBibleBook, getBibleBookOrder } from "../domain/bible/catalog.ts";

export function comparePersonagem(
  guess: Personagem,
  target: Personagem
): PersonagemGuessComparison {
  const sexoMatch: TileMatch = normalize(guess.sexo) === normalize(target.sexo) ? "CORRECT" : "WRONG";

  // Testamento e divisão podem ter vários valores ("Antigo e Novo", "Epístolas e Históricos"):
  // verde só com o conjunto exato; amarelo se compartilham ao menos um.
  const testamentoMatch = compareValueSets(splitList(guess.testamento), splitList(target.testamento));
  const divisaoMatch = compareValueSets(splitDivisions(guess.divisao), splitDivisions(target.divisao));

  const { match: historiaNaBibliaMatch, comparison: historiaNaBibliaComparison } = evaluateBibleHistory(guess, target);

  const povoMatch = comparePovo(guess.povo, target.povo);

  const ocupacaoMatch = compareOccupation(guess.ocupacao, target.ocupacao);

  const isFullyCorrect = guess.id === target.id;

  return {
    character: guess,
    sexoMatch,
    testamentoMatch,
    divisaoMatch,
    historiaNaBibliaMatch,
    historiaNaBibliaComparison,
    povoMatch,
    ocupacaoMatch,
    isFullyCorrect,
  };
}

function normalize(value: string | undefined | null) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

/* ---------- Listas de valores (testamento, divisão) ---------- */

/** Divide "A, B e C" em ["a", "b", "c"] (normalizado). */
export function splitList(value: string): string[] {
  return normalize(value)
    .split(/\s*,\s*|\s+e\s+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function splitDivisions(value: string): string[] {
  return splitList(value);
}

/** Verde: mesmo conjunto. Amarelo: ao menos um em comum. Vermelho: nenhum em comum. */
export function compareValueSets(guess: string[], target: string[]): TileMatch {
  const g = new Set(guess);
  const t = new Set(target);
  if (g.size === 0 || t.size === 0) return "WRONG";
  const shared = [...g].filter((item) => t.has(item)).length;
  if (shared === g.size && shared === t.size) return "CORRECT";
  return shared > 0 ? "PARTIAL" : "WRONG";
}

/* ---------- Povo / Origem ---------- */

/** "Israelita (Judá)" → { povo: "israelita", grupo: "juda" }. */
export function splitPovo(value: string): { povo: string; grupo: string | null } {
  const m = normalize(value).match(/^(.*?)\s*(?:\((.*)\))?$/);
  return { povo: (m?.[1] ?? "").trim(), grupo: m?.[2]?.trim() || null };
}

/** Povos aparentados que contam como "parcial" entre si. */
const POVO_FAMILIAS = [["hebreu", "israelita"]];

/**
 * Verde: mesmo valor. Amarelo: mesmo povo com tribo/tipo diferente (ou não informado),
 * ou povos aparentados (Hebreu × Israelita). Vermelho: povos diferentes.
 * "Origem desconhecida" nunca dá amarelo com outro valor.
 */
export function comparePovo(guess: string, target: string): TileMatch {
  if (!guess || !target) return "WRONG";
  if (normalize(guess) === normalize(target)) return "CORRECT";
  const g = splitPovo(guess);
  const t = splitPovo(target);
  if (g.povo === "origem desconhecida" || t.povo === "origem desconhecida") return "WRONG";
  if (g.povo === t.povo) return "PARTIAL";
  if (POVO_FAMILIAS.some((f) => f.includes(g.povo) && f.includes(t.povo))) return "PARTIAL";
  return "WRONG";
}

/* ---------- Ocupação ---------- */

const OCCUPATION_CATEGORIES: Record<string, string[]> = {
  realeza: ["rei", "rainha", "imperador", "imperador romano", "farao"],
  militar: ["guerreiro", "soldado", "general", "comandante", "lider militar"],
  lideranca: ["lider", "governador", "lider militar", "administrador", "conselheiro", "patriarca", "anciao"],
  profetico: ["profeta", "profetisa"],
  sacerdotal: ["sacerdote", "sumo sacerdote", "levita", "diacono", "diaconisa", "chefe religioso"],
  seguidores_de_jesus: ["apostolo", "discipulo", "discipula"],
  judicial: ["juiz", "juiza"],
  missao: ["missionario", "missionaria", "evangelista", "pregador"],
  servico: ["servo", "serva", "diacono", "diaconisa"],
  familiar: ["pai", "mae", "esposa", "esposo", "filho", "filha", "viuva", "patriarca", "matriarca"],
  intelectual_religioso: ["escriba", "mestre da lei", "sabio", "conselheiro"],
  sobrenatural: ["anjo", "arcanjo", "demonio"],
  pastoril: ["pastor", "criador de ovelhas", "criador"],
};

export function compareOccupation(guessOccupation: string, targetOccupation: string): TileMatch {
  if (normalize(guessOccupation) === normalize(targetOccupation)) return "CORRECT";

  const getCategories = (component: string) =>
    Object.entries(OCCUPATION_CATEGORIES)
      .filter(([, terms]) => terms.includes(component))
      .map(([category]) => category);

  const guessOccupations = splitList(guessOccupation);
  const targetOccupations = splitList(targetOccupation);

  if (guessOccupations.some((g) => targetOccupations.includes(g))) return "PARTIAL";

  const guessCategories = new Set(guessOccupations.flatMap(getCategories));
  const targetCategories = new Set(targetOccupations.flatMap(getCategories));
  if ([...guessCategories].some((c) => targetCategories.has(c))) return "PARTIAL";

  return "WRONG";
}

/* ---------- Passagem na Bíblia (campo historiaNaBiblia) ---------- */

/**
 * Extrai os livros citados no texto livre ("Marcos 5; Lucas 8", "1 Samuel 16-31").
 * Trechos sem nome de livro (ex.: "13-28") são ignorados.
 */
export function extractHistoryBooks(text: string): string[] {
  const books: string[] = [];
  // "1 e 2 Samuel" → "1 Samuel; 2 Samuel"
  text = text.replace(/\b([1-3])\s+e\s+([1-3])\s+([A-ZÀ-Ý][\p{L}]+)/gu, "$1 $3; $2 $3");
  // Separa por ";", "," e " e " (vírgula de versículo, como em "Lucas 2, 1", vira um trecho sem livro e é ignorada)
  for (const segment of text.split(/[;,]|\s+e\s+(?=[0-9A-ZÀ-Ý])/)) {
    const words = segment.trim().replace(/[.,]$/, "").split(/\s+/);
    for (let size = Math.min(4, words.length); size >= 1; size--) {
      const book = findCatholicBibleBook(words.slice(0, size).join(" ").replace(/,$/, ""));
      if (book) {
        if (!books.includes(book.name)) books.push(book.name);
        break;
      }
    }
  }
  return books;
}

/** Posições (ordem católica) de todos os livros onde o personagem aparece. */
function getBookPositions(p: Personagem): number[] {
  const names = new Set<string>(extractHistoryBooks(p.historiaNaBiblia ?? ""));
  for (const ref of p.referencias ?? []) {
    const name = findCatholicBibleBook(ref.livro)?.name;
    if (name) names.add(name);
  }
  return [...names].map((name) => getBibleBookOrder(name)).filter((i) => i !== -1);
}

/**
 * Compara onde os personagens aparecem, considerando TODOS os livros de cada um:
 * - verde: mesma referência;
 * - amarelo: algum livro em comum, ou livros a até 2 posições de distância;
 * - vermelho: mais distantes.
 * A seta aponta para o livro do personagem secreto mais próximo de algum livro do palpite.
 */
export function evaluateBibleHistory(guess: Personagem, target: Personagem): { match: TileMatch, comparison: NumberComparison } {
  if (normalize(guess.historiaNaBiblia) === normalize(target.historiaNaBiblia)) {
    return { match: "CORRECT", comparison: "EQUAL" };
  }

  const guessPositions = getBookPositions(guess);
  const targetPositions = getBookPositions(target);
  if (guessPositions.length === 0 || targetPositions.length === 0) {
    return { match: "WRONG", comparison: "EQUAL" };
  }

  if (guessPositions.some((pos) => targetPositions.includes(pos))) {
    return { match: "PARTIAL", comparison: "EQUAL" };
  }

  let best = Infinity;
  let up = false;
  let down = false;
  for (const g of guessPositions) {
    for (const t of targetPositions) {
      const distance = Math.abs(g - t);
      if (distance < best) {
        best = distance;
        up = g > t;
        down = g < t;
      } else if (distance === best) {
        up = up || g > t;
        down = down || g < t;
      }
    }
  }

  // Se o mais próximo está dos dois lados ao mesmo tempo, não há direção única
  const comparison: NumberComparison = up && down ? "EQUAL" : up ? "HIGHER" : "LOWER";
  return { match: best <= 2 ? "PARTIAL" : "WRONG", comparison };
}

/* ---------- Nascimento ---------- */

const ROMAN: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100 };
const ORDINALS: Record<string, number> = {
  primeiro: 1, segundo: 2, terceiro: 3, quarto: 4, quinto: 5,
  sexto: 6, setimo: 7, oitavo: 8, nono: 9, decimo: 10,
};

function romanToNumber(roman: string): number {
  let total = 0;
  for (let i = 0; i < roman.length; i++) {
    const value = ROMAN[roman[i]] ?? 0;
    const next = ROMAN[roman[i + 1]] ?? 0;
    total += value < next ? -value : value;
  }
  return total;
}

/**
 * Converte o texto de nascimento em um ano aproximado (negativo = a.C.).
 * "1170 a.C." → -1170; "Século VIII a.C." → -750; "Primeiro século d.C." → 50.
 * Retorna null quando a data é desconhecida.
 */
export function parseBirthYear(text: string): number | null {
  const plain = text.normalize("NFD").replace(/[̀-ͯ]/g, "");
  const isBC = /a\.?\s*c\b/i.test(plain);
  const isAD = /d\.?\s*c\b/i.test(plain);
  if (!isBC && !isAD) return null;
  const sign = isBC ? -1 : 1;

  const century = plain.match(/seculo\s+([IVXLC]+)\b/i);
  if (century) return sign * (romanToNumber(century[1].toUpperCase()) * 100 - 50);

  const ordinal = plain.toLowerCase().match(/(primeiro|segundo|terceiro|quarto|quinto|sexto|setimo|oitavo|nono|decimo)\s+seculo/);
  if (ordinal) return sign * (ORDINALS[ordinal[1]] * 100 - 50);

  const year = plain.match(/(\d{1,4})/);
  if (year) return sign * Number(year[1]);
  return null;
}
