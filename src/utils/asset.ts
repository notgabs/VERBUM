/**
 * Prefixo do site quando ele não fica na raiz do domínio (ex.: GitHub Pages em /VERBUM).
 * Vem de NEXT_PUBLIC_BASE_PATH no build; no desenvolvimento local fica vazio.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Caminho de um arquivo de `public/` (ex.: "/sounds/click.mp3") com o prefixo do site. */
export function asset(path: string): string {
  return path.startsWith("/") && !path.startsWith("//") && !path.startsWith(BASE_PATH + "/") ? BASE_PATH + path : path;
}
