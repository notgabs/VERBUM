import type {
  NumberComparison,
  Personagem,
  PersonagemGuessComparison,
  TileMatch,
} from "../types/game.ts";
import { CATHOLIC_BIBLE_BOOK_NAMES, getBibleBookOrder } from "../domain/bible/catalog.ts";


export function comparePersonagem(
  guess: Personagem,
  target: Personagem
): PersonagemGuessComparison {
  const sexoMatch: TileMatch = guess.sexo === target.sexo ? "CORRECT" : "WRONG";

  const testamentoMatch: TileMatch =
    guess.testamento === target.testamento ? "CORRECT" : "WRONG";

  const divisaoMatch: TileMatch =
    guess.divisao === target.divisao ? "CORRECT" : "WRONG";

  const { match: historiaNaBibliaMatch, comparison: historiaNaBibliaComparison } = evaluateBibleHistory(
    guess.historiaNaBiblia,
    target.historiaNaBiblia
  );

  const conhecidoPorMatch: TileMatch =
    guess.conhecidoPor.toLowerCase() === target.conhecidoPor.toLowerCase()
      ? "CORRECT"
      : "WRONG";

  const nascimentoMatch: TileMatch =
    guess.nascimento === target.nascimento ? "CORRECT" : "WRONG";
  const nascimentoComparison = compareBirthDates(guess.nascimento, target.nascimento);

  const ocupacaoMatch = compareOccupation(guess.ocupacao, target.ocupacao);

  const isFullyCorrect = guess.id === target.id;

  return {
    character: guess,
    sexoMatch,
    testamentoMatch,
    divisaoMatch,
    historiaNaBibliaMatch,
    historiaNaBibliaComparison,
    conhecidoPorMatch,
    nascimentoMatch,
    nascimentoComparison,
    ocupacaoMatch,
    isFullyCorrect,
  };
}

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

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

export function compareOccupation(guessOccupation: string, targetOccupation: string): TileMatch {
  if (normalize(guessOccupation) === normalize(targetOccupation)) return "CORRECT";

  const splitOccupations = (occupation: string) =>
    normalize(occupation)
      .split(/\s+e\s+/)
      .map((item) => item.trim());

  const getCategories = (component: string) => {
    return Object.entries(OCCUPATION_CATEGORIES)
      .filter(([, terms]) => terms.includes(component))
      .map(([category]) => category);
  };

  const guessOccupations = splitOccupations(guessOccupation);
  const targetOccupations = splitOccupations(targetOccupation);

  const hasExactComponentIntersection = guessOccupations.some((g) => targetOccupations.includes(g));
  if (hasExactComponentIntersection) return "PARTIAL";

  const guessCategories = new Set(guessOccupations.flatMap(getCategories));
  const targetCategories = new Set(targetOccupations.flatMap(getCategories));

  const hasCategoryIntersection = Array.from(guessCategories).some(c => targetCategories.has(c));
  if (hasCategoryIntersection) return "PARTIAL";

  return "WRONG";
}

export function evaluateBibleHistory(guessHistory: string, targetHistory: string): { match: TileMatch, comparison: NumberComparison } {
  if (normalize(guessHistory) === normalize(targetHistory)) {
    return { match: "CORRECT", comparison: "EQUAL" };
  }

  const getPosition = (history: string) => {
    const normalizedHistory = normalize(history);
    const bookName = CATHOLIC_BIBLE_BOOK_NAMES.find((book) => normalizedHistory.startsWith(normalize(book)));
    const bookIndex = bookName ? getBibleBookOrder(bookName) : -1;
    if (bookIndex === -1) return null;
    return { bookIndex };
  };

  const guessPosition = getPosition(guessHistory);
  const targetPosition = getPosition(targetHistory);

  if (!guessPosition || !targetPosition) {
    return { match: "WRONG", comparison: "EQUAL" };
  }

  if (guessPosition.bookIndex === targetPosition.bookIndex) {
    return { match: "PARTIAL", comparison: "EQUAL" };
  }

  const distance = Math.abs(guessPosition.bookIndex - targetPosition.bookIndex);
  const comparison = guessPosition.bookIndex > targetPosition.bookIndex ? "HIGHER" : "LOWER";

  if (distance <= 2) {
    return { match: "PARTIAL", comparison };
  } else {
    return { match: "WRONG", comparison };
  }
}

function compareBirthDates(guessBirth: string, targetBirth: string): "EQUAL" | "HIGHER" | "LOWER" {
  const toTimelineYear = (birth: unknown) => {
    // Character data is loaded from JSON at runtime, so do not trust the
    // TypeScript type alone. An absent birth date should simply have no arrow.
    if (typeof birth !== "string") return null;

    const yearMatch = birth.match(/(\d[\d.]*)/);
    if (!yearMatch) return null;

    const year = Number(yearMatch[1].replaceAll(".", ""));
    if (!Number.isFinite(year)) return null;

    return /a\.c\./i.test(birth) ? -year : year;
  };

  const guessYear = toTimelineYear(guessBirth);
  const targetYear = toTimelineYear(targetBirth);

  if (guessYear === null || targetYear === null || guessYear === targetYear) {
    return "EQUAL";
  }

  return guessYear < targetYear ? "HIGHER" : "LOWER";
}


