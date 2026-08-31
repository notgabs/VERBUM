import type { QuemSouEu } from "../types/game.ts";
import { normalizeForSearch } from "../utils/text.ts";

export interface QuemSouEuResult {
  isCorrect: boolean;
  guessedName: string;
}

export function compareQuemSouEu(
  guessName: string,
  target: QuemSouEu
): QuemSouEuResult {
  const normGuess = normalizeForSearch(guessName.trim());
  
  const isCorrect = target.aliases.some(
    (alias) => normalizeForSearch(alias) === normGuess
  ) || normalizeForSearch(target.nome) === normGuess;

  return {
    isCorrect,
    guessedName: guessName,
  };
}
