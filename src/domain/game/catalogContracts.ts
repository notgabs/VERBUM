import type { Passagem, Personagem } from "../../types/game.ts";

const isNonEmptyString = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;

export function isPersonagem(value: unknown): value is Personagem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return ["id", "nome", "sexo", "testamento", "divisao", "historiaNaBiblia", "conhecidoPor", "nascimento", "ocupacao", "dica1", "dica2"].every((key) => isNonEmptyString(item[key])) &&
    (item.imagem === undefined || isNonEmptyString(item.imagem));
}

export function isPassagem(value: unknown): value is Passagem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return ["id", "texto", "livro", "testamento", "divisao", "dica2"].every((key) => isNonEmptyString(item[key])) &&
    ["capitulo", "versiculo"].every((key) => Number.isInteger(item[key]) && Number(item[key]) > 0) &&
    (item.dica1 === undefined || isNonEmptyString(item.dica1));
}

export function isRawQuemSouEu(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  
  if (!isNonEmptyString(item.id)) return false;
  
  if (!isNonEmptyString(item.personagemId)) {
    if (!isNonEmptyString(item.nome)) return false;
  }
  
  if (!["Biblico", "Santo", "Anjo", "Papa", "Clero", "Outro"].includes(item.tipo as string)) return false;
  if (!isNonEmptyString(item.resumo)) return false;
  if (!isNonEmptyString(item.conhecidoPor)) return false;
  
  if (!Array.isArray(item.dicas) || item.dicas.length !== 6) return false;
  if (!item.dicas.every(isNonEmptyString)) return false;
  
  return true;
}
