import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const charactersPath = join(root, "public/data/personagens.json");
const passagesPath = join(root, "public/data/passagens.json");
const canonicalBooks = new Set([
  "Gênesis", "Êxodo", "Levítico", "Números", "Deuteronômio", "Josué", "Juízes", "Rute", "1 Samuel", "2 Samuel", "1 Reis", "2 Reis", "1 Crônicas", "2 Crônicas", "Esdras", "Neemias", "Tobias", "Judite", "Ester", "1 Macabeus", "2 Macabeus", "Jó", "Salmos", "Provérbios", "Eclesiastes", "Cantares", "Sabedoria", "Eclesiástico", "Isaías", "Jeremias", "Lamentações", "Baruc", "Ezequiel", "Daniel", "Oséias", "Joel", "Amós", "Obadias", "Jonas", "Miqueias", "Naum", "Habacuque", "Sofonias", "Ageu", "Zacarias", "Malaquias", "Mateus", "Marcos", "Lucas", "João", "Atos", "Romanos", "1 Coríntios", "2 Coríntios", "Gálatas", "Efésios", "Filipenses", "Colossenses", "1 Tessalonicenses", "2 Tessalonicenses", "1 Timóteo", "2 Timóteo", "Tito", "Filemom", "Hebreus", "Tiago", "1 Pedro", "2 Pedro", "1 João", "2 João", "3 João", "Judas", "Apocalipse",
]);
const requiredCharacterFields = ["id", "nome", "sexo", "testamento", "divisao", "historiaNaBiblia", "conhecidoPor", "ocupacao", "povo", "dica1", "dica2"];
const requiredPassageFields = ["id", "texto", "livro", "capitulo", "versiculo", "testamento", "divisao"];
const errors = [];

function loadJson(path) {
  try { return JSON.parse(readFileSync(path, "utf8")); }
  catch (error) { errors.push(`${path}: JSON inválido (${error.message})`); return []; }
}
function checkUnique(records, label) {
  const ids = new Set();
  records.forEach((record, index) => {
    if (!record?.id || typeof record.id !== "string") errors.push(`${label}[${index}]: id obrigatório.`);
    else if (ids.has(record.id)) errors.push(`${label}[${index}]: id duplicado "${record.id}".`);
    else ids.add(record.id);
  });
}

const characters = loadJson(charactersPath);
const passages = loadJson(passagesPath);
if (!Array.isArray(characters)) errors.push("personagens.json deve conter uma lista.");
if (!Array.isArray(passages)) errors.push("passagens.json deve conter uma lista.");

if (Array.isArray(characters)) {
  checkUnique(characters, "personagens");
  characters.forEach((character, index) => {
    for (const field of requiredCharacterFields) if (typeof character?.[field] !== "string" || !character[field].trim()) errors.push(`personagens[${index}] (${character?.id ?? "sem id"}): campo "${field}" obrigatório.`);
    const inferredImage = [".png", ".jpeg", ".jpg", ".webp"].map((extension) => `/personagens/${character?.id}${extension}`).find((path) => existsSync(join(root, "public", path)));
    const image = character?.imagem ?? inferredImage;
    if (!image || typeof image !== "string" || !image.startsWith("/personagens/") || !existsSync(join(root, "public", image))) errors.push(`personagens[${index}] (${character?.id ?? "sem id"}): imagem inexistente ou não declarada.`);
  });
}
if (Array.isArray(passages)) {
  checkUnique(passages, "passagens");
  passages.forEach((passage, index) => {
    for (const field of requiredPassageFields) {
      const value = passage?.[field];
      if ((typeof value !== "string" || !value.trim()) && (field === "capitulo" || field === "versiculo" ? !Number.isInteger(value) || value < 1 : true)) errors.push(`passagens[${index}] (${passage?.id ?? "sem id"}): campo "${field}" obrigatório ou inválido.`);
    }
    if (!canonicalBooks.has(passage?.livro)) errors.push(`passagens[${index}] (${passage?.id ?? "sem id"}): livro inválido "${passage?.livro}".`);
    for (const field of ["capituloFim", "versiculoFim"]) if (passage?.[field] !== undefined && (!Number.isInteger(passage[field]) || passage[field] < 1)) errors.push(`passagens[${index}] (${passage?.id ?? "sem id"}): "${field}" inválido.`);
  });
}

if (errors.length) { console.error(`Validação falhou com ${errors.length} problema(s):\n- ${errors.join("\n- ")}`); process.exitCode = 1; }
else console.log(`Dados válidos: ${characters.length} personagens e ${passages.length} passagens.`);

