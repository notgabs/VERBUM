import { Personagem, PersonagemGuessComparison, TileMatch } from "@/types/game";

export function comparePersonagem(
  guess: Personagem,
  target: Personagem
): PersonagemGuessComparison {
  const sexoMatch: TileMatch = guess.sexo === target.sexo ? "CORRECT" : "WRONG";

  const testamentoMatch: TileMatch =
    guess.testamento === target.testamento ? "CORRECT" : "WRONG";

  let divisaoMatch: TileMatch = "WRONG";
  if (guess.divisao === target.divisao) {
    divisaoMatch = "CORRECT";
  } else if (guess.testamento === target.testamento) {
    divisaoMatch = "PARTIAL";
  }

  const livroMatch: TileMatch =
    guess.livroPrincipal.toLowerCase() === target.livroPrincipal.toLowerCase()
      ? "CORRECT"
      : "WRONG";

  const historiaMatch: TileMatch =
    guess.historiaPrincipal.toLowerCase() ===
    target.historiaPrincipal.toLowerCase()
      ? "CORRECT"
      : "WRONG";

  let localMatch: TileMatch = "WRONG";
  if (guess.local.toLowerCase() === target.local.toLowerCase()) {
    localMatch = "CORRECT";
  } else if (
    guess.local.toLowerCase().includes("galileia") &&
    target.local.toLowerCase().includes("galileia")
  ) {
    localMatch = "PARTIAL";
  } else if (
    guess.local.toLowerCase().includes("nazaré") ||
    target.local.toLowerCase().includes("nazaré") ||
    guess.local.toLowerCase().includes("belém") ||
    target.local.toLowerCase().includes("belém")
  ) {
    localMatch = "PARTIAL";
  }

  let nacionalidadeMatch: TileMatch = "WRONG";
  if (
    guess.nacionalidade.toLowerCase() === target.nacionalidade.toLowerCase()
  ) {
    nacionalidadeMatch = "CORRECT";
  } else if (
    (guess.nacionalidade.toLowerCase().includes("israel") ||
      guess.nacionalidade.toLowerCase().includes("judeu") ||
      guess.nacionalidade.toLowerCase().includes("hebreu")) &&
    (target.nacionalidade.toLowerCase().includes("israel") ||
      target.nacionalidade.toLowerCase().includes("judeu") ||
      target.nacionalidade.toLowerCase().includes("hebreu"))
  ) {
    nacionalidadeMatch = "PARTIAL";
  }

  let nascimentoMatch: TileMatch = "WRONG";
  if (guess.nascimento === target.nascimento) {
    nascimentoMatch = "CORRECT";
  } else if (
    (guess.nascimento.includes("a.C.") && target.nascimento.includes("a.C.")) ||
    guess.testamento === target.testamento
  ) {
    nascimentoMatch = "PARTIAL";
  }

  let ocupacaoMatch: TileMatch = "WRONG";
  if (guess.ocupacao === target.ocupacao) {
    ocupacaoMatch = "CORRECT";
  } else if (
    (guess.ocupacao.toLowerCase().includes("apóstolo") &&
      target.ocupacao.toLowerCase().includes("apóstolo")) ||
    (guess.ocupacao.toLowerCase().includes("líder") &&
      target.ocupacao.toLowerCase().includes("líder"))
  ) {
    ocupacaoMatch = "PARTIAL";
  }

  const isFullyCorrect = guess.id === target.id;

  return {
    character: guess,
    sexoMatch,
    testamentoMatch,
    divisaoMatch,
    livroMatch,
    historiaMatch,
    localMatch,
    nacionalidadeMatch,
    nascimentoMatch,
    ocupacaoMatch,
    isFullyCorrect,
  };
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
        matchToEmoji(g.livroMatch),
        matchToEmoji(g.historiaMatch),
        matchToEmoji(g.localMatch),
        matchToEmoji(g.nacionalidadeMatch),
        matchToEmoji(g.nascimentoMatch),
        matchToEmoji(g.ocupacaoMatch),
      ].join("");
    })
    .join("\n");

  return `Verbum 📖 Personagem Bíblico\nTentativas: ${guesses.length}\n\n${grid}\n\nJogue em: verbum.game`;
}
