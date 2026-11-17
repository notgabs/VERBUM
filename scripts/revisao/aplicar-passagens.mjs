/**
 * Grava scripts/revisao/passagens.mjs em public/data/passagens.json.
 * Os livros presentes em passagens.mjs têm suas passagens SUBSTITUÍDAS pelas curadas;
 * os demais livros ficam como estão. Tudo é ordenado pela ordem católica dos livros,
 * depois por capítulo e versículo.
 * Uso: node scripts/revisao/aplicar-passagens.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { passagens } from "./passagens.mjs";

const ORDER = [
  "Gênesis", "Êxodo", "Levítico", "Números", "Deuteronômio", "Josué", "Juízes", "Rute", "1 Samuel", "2 Samuel",
  "1 Reis", "2 Reis", "1 Crônicas", "2 Crônicas", "Esdras", "Neemias", "Tobias", "Judite", "Ester", "1 Macabeus",
  "2 Macabeus", "Jó", "Salmos", "Provérbios", "Eclesiastes", "Cantares", "Sabedoria", "Eclesiástico", "Isaías",
  "Jeremias", "Lamentações", "Baruc", "Ezequiel", "Daniel", "Oséias", "Joel", "Amós", "Obadias", "Jonas", "Miqueias",
  "Naum", "Habacuque", "Sofonias", "Ageu", "Zacarias", "Malaquias", "Mateus", "Marcos", "Lucas", "João", "Atos",
  "Romanos", "1 Coríntios", "2 Coríntios", "Gálatas", "Efésios", "Filipenses", "Colossenses", "1 Tessalonicenses",
  "2 Tessalonicenses", "1 Timóteo", "2 Timóteo", "Tito", "Filemom", "Hebreus", "Tiago", "1 Pedro", "2 Pedro",
  "1 João", "2 João", "3 João", "Judas", "Apocalipse",
];
const DIVISAO = (book) => {
  const i = ORDER.indexOf(book);
  if (i <= 4) return "Pentateuco";
  if (i <= 20) return "Históricos";
  if (i <= 27) return "Sapienciais";
  if (i <= 45) return "Proféticos";
  if (i <= 49) return "Evangelhos";
  if (book === "Atos") return "Históricos";
  if (book === "Apocalipse") return "Proféticos";
  return "Epístolas";
};
const slug = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, "-");

const DATA = "public/data/passagens.json";
const raw = readFileSync(DATA, "utf8");
const current = JSON.parse(raw);

for (const book of Object.keys(passagens)) if (!ORDER.includes(book)) throw new Error(`livro desconhecido: ${book}`);
const curatedBooks = new Set(Object.keys(passagens));

const curated = Object.entries(passagens).flatMap(([livro, list]) =>
  list.map(([capitulo, versiculo, versiculoFim, texto, dica2, contexto]) => {
    const p = {
      id: `${slug(livro)}-${capitulo}-${versiculo}`,
      texto,
      livro,
      capitulo,
      versiculo,
      ...(versiculoFim ? { versiculoFim } : {}),
      testamento: ORDER.indexOf(livro) <= 45 ? "Antigo Testamento" : "Novo Testamento",
      divisao: DIVISAO(livro),
      contexto,
      dica2,
    };
    return p;
  })
);

const ids = new Set();
for (const p of curated) {
  if (ids.has(p.id)) throw new Error(`id repetido: ${p.id}`);
  ids.add(p.id);
}

const kept = current.filter((p) => !curatedBooks.has(p.livro));
const all = [...kept, ...curated].sort(
  (a, b) => ORDER.indexOf(a.livro) - ORDER.indexOf(b.livro) || a.capitulo - b.capitulo || a.versiculo - b.versiculo
);
writeFileSync(DATA, JSON.stringify(all, null, 2) + (raw.endsWith("\n") ? "\n" : ""));

const perBook = {};
for (const p of all) perBook[p.livro] = (perBook[p.livro] ?? 0) + 1;
console.log(`${curated.length} passagens curadas em ${curatedBooks.size} livros; total no jogo: ${all.length}.`);
console.log(Object.entries(perBook).filter(([b]) => curatedBooks.has(b)).map(([b, n]) => `${ORDER.indexOf(b) + 1}. ${b}: ${n}`).join(" | "));
