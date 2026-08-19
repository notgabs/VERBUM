import { BIBLE_STRUCTURE as PROTESTANT_BIBLE_STRUCTURE, type BibleBook } from "../../data/bibleStructure.ts";
import { normalizeForSearch } from "../../utils/text.ts";

export type CatholicBibleBook = BibleBook & {
  testament: "Antigo" | "Novo";
  division: string;
  aliases: readonly string[];
};

const OLD_TESTAMENT_ORDER = [
  "Gênesis", "Êxodo", "Levítico", "Números", "Deuteronômio", "Josué", "Juízes", "Rute", "1 Samuel", "2 Samuel", "1 Reis", "2 Reis", "1 Crônicas", "2 Crônicas", "Esdras", "Neemias", "Tobias", "Judite", "Ester", "1 Macabeus", "2 Macabeus", "Jó", "Salmos", "Provérbios", "Eclesiastes", "Cantares", "Sabedoria", "Eclesiástico", "Isaías", "Jeremias", "Lamentações", "Baruc", "Ezequiel", "Daniel", "Oséias", "Joel", "Amós", "Obadias", "Jonas", "Miqueias", "Naum", "Habacuque", "Sofonias", "Ageu", "Zacarias", "Malaquias",
] as const;

const NEW_TESTAMENT_ORDER = [
  "Mateus", "Marcos", "Lucas", "João", "Atos", "Romanos", "1 Coríntios", "2 Coríntios", "Gálatas", "Efésios", "Filipenses", "Colossenses", "1 Tessalonicenses", "2 Tessalonicenses", "1 Timóteo", "2 Timóteo", "Tito", "Filemom", "Hebreus", "Tiago", "1 Pedro", "2 Pedro", "1 João", "2 João", "3 João", "Judas", "Apocalipse",
] as const;

// O catálogo usa limites de capítulo para o autocomplete. Os deuterocanônicos
// ainda não possuem passagens cadastradas; 200 evita bloquear referências válidas
// até que limites versiculares completos sejam incluídos na base de dados.
const DEUTEROCANONICAL_BOOKS: Record<string, BibleBook> = {
  Tobias: { name: "Tobias", versesPerChapter: Array(14).fill(200) },
  Judite: { name: "Judite", versesPerChapter: Array(16).fill(200) },
  "1 Macabeus": { name: "1 Macabeus", versesPerChapter: Array(16).fill(200) },
  "2 Macabeus": { name: "2 Macabeus", versesPerChapter: Array(15).fill(200) },
  Sabedoria: { name: "Sabedoria", versesPerChapter: Array(19).fill(200) },
  Eclesiástico: { name: "Eclesiástico", versesPerChapter: Array(51).fill(200) },
  Baruc: { name: "Baruc", versesPerChapter: Array(6).fill(200) },
};

const baseBooks = new Map(PROTESTANT_BIBLE_STRUCTURE.map((book) => [book.name, book]));
const allBooks = new Map([...baseBooks, ...Object.entries(DEUTEROCANONICAL_BOOKS)]);

function getDivision(name: string, testament: "Antigo" | "Novo"): string {
  if (testament === "Novo") {
    if (["Mateus", "Marcos", "Lucas", "João"].includes(name)) return "Evangelhos";
    if (name === "Atos") return "Históricos";
    if (name === "Apocalipse") return "Profecia";
    return "Cartas";
  }
  if (["Salmos", "Provérbios", "Eclesiastes", "Cantares", "Jó", "Sabedoria", "Eclesiástico"].includes(name)) return "Sapienciais";
  if (["Isaías", "Jeremias", "Lamentações", "Baruc", "Ezequiel", "Daniel"].includes(name)) return "Profetas Maiores";
  if (["Oséias", "Joel", "Amós", "Obadias", "Jonas", "Miqueias", "Naum", "Habacuque", "Sofonias", "Ageu", "Zacarias", "Malaquias"].includes(name)) return "Profetas Menores";
  return "Históricos";
}

function buildAliases(name: string): string[] {
  const aliases = [name];
  const numbered = name.match(/^(\d) (.+)$/);
  if (numbered) {
    const [number, title] = numbered.slice(1);
    const roman = number === "1" ? "I" : number === "2" ? "II" : "III";
    aliases.push(`${roman} ${title}`, `${number}${title}`, `${roman}${title}`);
  }
  if (name === "João") aliases.push("Joao", "Jo.");
  if (name === "Eclesiástico") aliases.push("Sirácida", "Siracida", "Eclo");
  if (name === "Apocalipse") aliases.push("Ap");
  return aliases;
}

export const CATHOLIC_BIBLE_CATALOG: readonly CatholicBibleBook[] = [...OLD_TESTAMENT_ORDER, ...NEW_TESTAMENT_ORDER].map((name) => {
  const book = allBooks.get(name);
  if (!book) throw new Error(`Livro não encontrado no catálogo: ${name}`);
  const testament = OLD_TESTAMENT_ORDER.includes(name as never) ? "Antigo" : "Novo";
  return { ...book, testament, division: getDivision(name, testament), aliases: buildAliases(name) };
});

export const CATHOLIC_BIBLE_BOOK_NAMES = CATHOLIC_BIBLE_CATALOG.map((book) => book.name);

export function findCatholicBibleBook(value: string): CatholicBibleBook | undefined {
  const normalizedValue = normalizeForSearch(value.trim());
  return CATHOLIC_BIBLE_CATALOG.find((book) => book.aliases.some((alias) => normalizeForSearch(alias) === normalizedValue));
}

export function normalizeBibleBookName(value: string): string | undefined {
  return findCatholicBibleBook(value)?.name;
}

export function getBibleBookOrder(value: string): number {
  const canonicalName = normalizeBibleBookName(value);
  return canonicalName ? CATHOLIC_BIBLE_BOOK_NAMES.indexOf(canonicalName) : -1;
}

