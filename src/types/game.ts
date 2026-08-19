export type TileMatch = "CORRECT" | "PARTIAL" | "WRONG";

export interface Personagem {
  id: string;
  nome: string;
  imagem?: string; // Preparado para quando você for colocar as fotos
  sexo: "Masculino" | "Feminino" | string;
  testamento: "Antigo" | "Novo" | string;
  divisao: string;
  historiaNaBiblia: string;
  conhecidoPor: string;
  nascimento: string;
  ocupacao: string;
  dica1: string;
  dica2: string;
}

export interface PersonagemGuessComparison {
  character: Personagem;
  sexoMatch: TileMatch;
  testamentoMatch: TileMatch;
  divisaoMatch: TileMatch;
  historiaNaBibliaMatch: TileMatch;
  historiaNaBibliaComparison: NumberComparison;
  conhecidoPorMatch: TileMatch;
  nascimentoMatch: TileMatch;
  nascimentoComparison: NumberComparison;
  ocupacaoMatch: TileMatch;
  isFullyCorrect: boolean;
}

export interface Passagem {
  id: string;
  texto: string;
  livro: string;
  capitulo: number;
  versiculo: number;
  capituloFim?: number;
  versiculoFim?: number;
  testamento: string;
  divisao: string;
  contexto?: string;
  dica1: string;
  dica2: string;
}

export type NumberComparison = "EQUAL" | "HIGHER" | "LOWER";

export interface PassagemGuessComparison {
  livro: string;
  capitulo: number;
  versiculo: number;
  livroMatch: TileMatch;
  livroComparison: NumberComparison;
  capituloComparison: NumberComparison;
  versiculoComparison: NumberComparison;
  isFullyCorrect: boolean;
  testamentoHint?: string;
}

export interface GameStats {
  jogosRealizados: number;
  sequenciaAtual: number;
  maiorSequencia: number;
  tentativasMedias: number;
  dicasUtilizadas: number;
  vitorias: number;
}
