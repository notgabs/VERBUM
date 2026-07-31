import {
  NumberComparison,
  Personagem,
  PersonagemGuessComparison,
  TileMatch,
} from "@/types/game";
import { CATHOLIC_BIBLE_BOOK_NAMES, getBibleBookOrder } from "@/domain/bible/catalog";

const OCCUPATION_CATEGORIES: Record<string, string[]> = {
  pastor: ["pastor", "criador de ovelhas", "criador"],
  militar: ["guerreiro", "soldado", "general", "comandante", "lider militar"],
  realeza: ["rei", "rainha", "imperador", "farao"],
  lideranca: ["lider", "governador", "lider militar"],
  profetico: ["profeta", "profetisa"],
  sacerdotal: ["sacerdote", "levita"],
  apostolico: ["apostolo"],
  judicial: ["juiz", "juiza"],
  discipulado: ["discipulo", "discipula"],
  missao: ["missionario", "missionaria", "evangelista", "pregador"],
  servico: ["servo", "serva"],
  pais: ["pai", "mae"],
  conjuges: ["esposa", "esposo"],
  filhos: ["filho", "filha"],
  moradores: ["morador", "moradora"],
};

export function comparePersonagem(
  guess: Personagem,
  target: Personagem
): PersonagemGuessComparison {
  const sexoMatch: TileMatch = guess.sexo === target.sexo ? "CORRECT" : "WRONG";

  const testamentoMatch: TileMatch =
    guess.testamento === target.testamento ? "CORRECT" : "WRONG";

  const divisaoMatch: TileMatch =
    guess.divisao === target.divisao ? "CORRECT" : "WRONG";

  const historiaNaBibliaMatch: TileMatch =
    guess.historiaNaBiblia.toLowerCase() === target.historiaNaBiblia.toLowerCase()
      ? "CORRECT"
      : "WRONG";
  const historiaNaBibliaComparison = compareBibleHistory(
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

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function compareOccupation(guessOccupation: string, targetOccupation: string): TileMatch {
  if (normalize(guessOccupation) === normalize(targetOccupation)) return "CORRECT";

  const splitOccupations = (occupation: string) =>
    normalize(occupation)
      .split(/\s+e\s+/)
      .map((item) => item.trim());

  const getCategories = (occupation: string) => {
    const normalizedOccupation = ` ${normalize(occupation)} `;
    return Object.entries(OCCUPATION_CATEGORIES).filter(([, terms]) =>
      terms.some((term) => normalizedOccupation.includes(` ${normalize(term)} `))
    ).map(([category]) => category);
  };

  const guessOccupations = splitOccupations(guessOccupation);
  const targetOccupations = splitOccupations(targetOccupation);
  const sharesOccupation = guessOccupations.some((occupation) =>
    targetOccupations.includes(occupation)
  );
  if (sharesOccupation) return "PARTIAL";

  const guessCategories = getCategories(guessOccupation);
  const targetCategories = getCategories(targetOccupation);
  return guessCategories.some((category) => targetCategories.includes(category))
    ? "PARTIAL"
    : "WRONG";
}

function compareBibleHistory(guessHistory: string, targetHistory: string): NumberComparison {
  const getPosition = (history: string) => {
    const normalizedHistory = normalize(history);
    const bookName = CATHOLIC_BIBLE_BOOK_NAMES.find((book) => normalizedHistory.startsWith(normalize(book)));
    const bookIndex = bookName ? getBibleBookOrder(bookName) : -1;
    if (bookIndex === -1) return null;

    const chapter = normalizedHistory
      .slice(normalize(bookName ?? "").length)
      .match(/\d+/)?.[0];
    return { bookIndex, chapter: chapter ? Number(chapter) : null };
  };

  const guessPosition = getPosition(guessHistory);
  const targetPosition = getPosition(targetHistory);
  if (!guessPosition || !targetPosition) return "EQUAL";

  if (guessPosition.bookIndex !== targetPosition.bookIndex) {
    return guessPosition.bookIndex > targetPosition.bookIndex ? "HIGHER" : "LOWER";
  }

  if (
    guessPosition.chapter !== null &&
    targetPosition.chapter !== null &&
    guessPosition.chapter !== targetPosition.chapter
  ) {
    return guessPosition.chapter > targetPosition.chapter ? "HIGHER" : "LOWER";
  }

  return "EQUAL";
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

export function generatePersonagemShareText(
  guesses: PersonagemGuessComparison[],
  targetName: string
): string {
  const matchToEmoji = (match: TileMatch) => {
    switch (match) {
      case "CORRECT":
        return "🟩";
      case "PARTIAL":
        return "🟨";
      case "WRONG":
        return "🟥";
    }
  };

  const grid = guesses
    .map((g) => {
      return [
        matchToEmoji(g.sexoMatch),
        matchToEmoji(g.testamentoMatch),
        matchToEmoji(g.divisaoMatch),
        matchToEmoji(g.historiaNaBibliaMatch),
        matchToEmoji(g.conhecidoPorMatch),
        matchToEmoji(g.nascimentoMatch),
        matchToEmoji(g.ocupacaoMatch),
      ].join("");
    })
    .join("\n");

  return `Verbum 📖 Personagem Bíblico\nTentativas: ${guesses.length}\n\n${grid}\n\nJogue em: verbum.game`;
}
