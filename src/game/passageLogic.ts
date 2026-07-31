import {
  Passagem,
  PassagemGuessComparison,
  NumberComparison,
  TileMatch,
} from "@/types/game";
import { normalizeBibleBookName } from "@/domain/bible/catalog";

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

  let capituloComparison: NumberComparison = "EQUAL";
  if (guessChapter < target.capitulo) {
    capituloComparison = "HIGHER"; // correct is higher
  } else if (guessChapter > target.capitulo) {
    capituloComparison = "LOWER"; // correct is lower
  }

  let versiculoComparison: NumberComparison = "EQUAL";
  if (guessVerse < target.versiculo) {
    versiculoComparison = "HIGHER"; // correct is higher
  } else if (guessVerse > target.versiculo) {
    versiculoComparison = "LOWER"; // correct is lower
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
    capituloComparison,
    versiculoComparison,
    isFullyCorrect,
    testamentoHint: target.testamento,
  };
}

export function generatePassagemShareText(
  guesses: PassagemGuessComparison[],
  targetRef: string
): string {
  const rows = guesses
    .map((g) => {
      const bookEmoji = g.livroMatch === "CORRECT" ? "🟩" : "🟥";
      const capEmoji =
        g.capituloComparison === "EQUAL"
          ? "🟩"
          : g.capituloComparison === "HIGHER"
          ? "⬆️"
          : "⬇️";
      const verEmoji =
        g.versiculoComparison === "EQUAL"
          ? "🟩"
          : g.versiculoComparison === "HIGHER"
          ? "⬆️"
          : "⬇️";
      return `${bookEmoji} ${capEmoji} ${verEmoji}`;
    })
    .join("\n");

  return `Verbum 📜 Passagem Bíblica\nTentativas: ${guesses.length}\n\n${rows}\n\nJogue em: verbum.game`;
}
