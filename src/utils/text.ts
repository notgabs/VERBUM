/** Normaliza texto para buscas sem diferenciar acentos, maiúsculas ou minúsculas. */
export function normalizeForSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");
}
