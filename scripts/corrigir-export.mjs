/**
 * Depois do `next build` (exportação estática): o Next 16 grava os arquivos de pré-carregamento
 * das páginas em subpastas (`musica/__next.musica/__PAGE__.txt`), mas o navegador os pede com ponto
 * (`musica/__next.musica.__PAGE__.txt`). Sem isto, cada link gera um 404 e perde o pré-carregamento.
 * Este script cria as cópias com o nome que o navegador procura.
 */
import fs from "node:fs";
import path from "node:path";

const OUT = "out";
let copiados = 0;

function percorrer(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const caminho = path.join(dir, item.name);
    if (!item.isDirectory()) continue;
    if (item.name.startsWith("__next.")) achatar(caminho, item.name, dir);
    else percorrer(caminho);
  }
}

/** Copia `<pai>/__next.x/a/b.txt` para `<pai>/__next.x.a.b.txt`. */
function achatar(dir, prefixo, pai) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const caminho = path.join(dir, item.name);
    const nome = `${prefixo}.${item.name}`;
    if (item.isDirectory()) achatar(caminho, nome, pai);
    else if (!fs.existsSync(path.join(pai, nome))) {
      fs.copyFileSync(caminho, path.join(pai, nome));
      copiados++;
    }
  }
}

if (!fs.existsSync(OUT)) {
  console.error("Pasta out/ não encontrada: rode next build antes.");
  process.exit(1);
}
percorrer(OUT);
console.log(`Exportação corrigida: ${copiados} arquivos de pré-carregamento.`);
