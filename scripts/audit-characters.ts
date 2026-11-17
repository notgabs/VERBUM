/**
 * Auditoria dos dados de personagens: confere livros, divisões e anos de nascimento.
 * Uso: node --experimental-strip-types scripts/audit-characters.ts
 */
import { readFileSync } from "node:fs";
import { findCatholicBibleBook } from "../src/domain/bible/catalog.ts";
import { parseBirthYear, extractHistoryBooks, splitDivisions } from "../src/game/characterLogic.ts";

const chars = JSON.parse(readFileSync("public/data/personagens.json", "utf8"));
const DIVISIONS = new Set(["pentateuco", "historicos", "sapienciais", "profeticos", "evangelhos", "epistolas", "apocalipse"]);
let problems = 0;
const warn = (msg: string) => { problems++; console.log(msg); };

for (const c of chars) {
  for (const r of c.referencias ?? []) {
    if (!findCatholicBibleBook(r.livro)) warn(`[livro desconhecido] ${c.id}: referencias "${r.livro}"`);
  }
  const fromText = extractHistoryBooks(c.historiaNaBiblia);
  const fromRefs = new Set((c.referencias ?? []).map((r: { livro: string }) => findCatholicBibleBook(r.livro)?.name).filter(Boolean));
  const missing = fromText.filter((b) => !fromRefs.has(b));
  if (missing.length) warn(`[referencias incompletas] ${c.id}: texto "${c.historiaNaBiblia}" cita ${missing.join(", ")} que não está em referencias`);
  if (fromText.length === 0 && fromRefs.size === 0) warn(`[sem livro] ${c.id}: "${c.historiaNaBiblia}"`);
  for (const d of splitDivisions(c.divisao)) if (!DIVISIONS.has(d)) warn(`[divisão desconhecida] ${c.id}: "${d}"`);
  const parsed = parseBirthYear(c.nascimento);
  if (c.nascimentoAno != null && parsed != null && Math.abs(parsed - c.nascimentoAno) > 100) {
    warn(`[ano inconsistente] ${c.id}: texto "${c.nascimento}" (~${parsed}) mas nascimentoAno=${c.nascimentoAno}`);
  }
}
console.log(problems ? `\n${problems} problema(s).` : "Nenhum problema encontrado.");
