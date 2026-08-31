import type {
  Passagem,
  PassagemGuessComparison,
  NumberComparison,
  TileMatch,
} from "../types/game.ts";
import { normalizeBibleBookName, getBibleBookOrder } from "../domain/bible/catalog.ts";

export function comparePassagem(
  guessBook: string,
  guessChapter: number,
  guessVerse: number,
  target: Passagem
): PassagemGuessComparison {
  const cleanGuess = normalizeBibleBookName(guessBook);
  const cleanTarget = normalizeBibleBookName(target.livro);

  const livroMatch: TileMatch =
    cleanGuess && cleanGuess === cleanTarget ? "CORRECT" : "WRONG";

  let livroComparison: NumberComparison = "EQUAL";
  if (livroMatch === "WRONG" && cleanGuess && cleanTarget) {
    const guessIndex = getBibleBookOrder(cleanGuess);
    const targetIndex = getBibleBookOrder(cleanTarget);
    if (guessIndex !== -1 && targetIndex !== -1) {
      livroComparison = guessIndex < targetIndex ? "LOWER" : "HIGHER";
    }
  }

  let capituloComparison: NumberComparison = "EQUAL";
  let capituloMatch: TileMatch = "CORRECT";
  if (guessChapter < target.capitulo) {
    capituloComparison = "HIGHER"; // correct is higher
    capituloMatch = (target.capitulo - guessChapter) <= 2 ? "PARTIAL" : "WRONG";
  } else if (guessChapter > target.capitulo) {
    capituloComparison = "LOWER"; // correct is lower
    capituloMatch = (guessChapter - target.capitulo) <= 2 ? "PARTIAL" : "WRONG";
  }

  let versiculoComparison: NumberComparison = "EQUAL";
  let versiculoMatch: TileMatch = "CORRECT";
  if (guessVerse < target.versiculo) {
    versiculoComparison = "HIGHER"; // correct is higher
    versiculoMatch = (target.versiculo - guessVerse) <= 2 ? "PARTIAL" : "WRONG";
  } else if (guessVerse > target.versiculo) {
    versiculoComparison = "LOWER"; // correct is lower
    versiculoMatch = (guessVerse - target.versiculo) <= 2 ? "PARTIAL" : "WRONG";
  }

  const isFullyCorrect =
    livroMatch === "CORRECT" &&
    capituloComparison === "EQUAL" &&
    versiculoComparison === "EQUAL";

  return {
    livro: guessBook,
    capitulo: guessChapter,
    versiculo: guessVerse,
    livroMatch,
    capituloMatch,
    versiculoMatch,
    livroComparison,
    capituloComparison,
    versiculoComparison,
    isFullyCorrect,
    testamentoHint: target.testamento,
  };
}


