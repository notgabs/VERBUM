export interface Personagem {
  id: string;
  nome: string;
  sexo: "Masculino" | "Feminino" | string;
  testamento: "Antigo Testamento" | "Novo Testamento" | string;
  divisao: string;
  livroPrincipal: string;
  historiaPrincipal: string;
  local: string;
  nacionalidade: string;
  nascimento: string;
  ocupacao: string;
  dica1: string;
  dica2: string;
}

export type TileMatch = "CORRECT" | "PARTIAL" | "WRONG";

export interface PersonagemGuessComparison {
  character: Personagem;
  sexoMatch: TileMatch;
  testamentoMatch: TileMatch;
  divisaoMatch: TileMatch;
  livroMatch: TileMatch;
  historiaMatch: TileMatch;
  localMatch: TileMatch;
  nacionalidadeMatch: TileMatch;
  nascimentoMatch: TileMatch;
  ocupacaoMatch: TileMatch;
  isFullyCorrect: boolean;
}

export interface Passagem {
  id: string;
  texto: string;
  livro: string;
  capitulo: number;
  versiculo: number;
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
