import type { Passagem, Personagem } from "@/types/game";

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
  return ["id", "texto", "livro", "testamento", "divisao"].every((key) => isNonEmptyString(item[key])) &&
    ["capitulo", "versiculo"].every((key) => Number.isInteger(item[key]) && Number(item[key]) > 0) &&
    (item.dica1 === undefined || isNonEmptyString(item.dica1)) && (item.dica2 === undefined || isNonEmptyString(item.dica2));
}
