/**
 * Aplica scripts/revisao/dicas.mjs em public/data/personagens.json
 * e gera docs/dicas-personagens.md (antes → depois, com a referência).
 * Na primeira execução guarda as dicas antigas em scripts/revisao/dicas-antes.json.
 * Uso: node scripts/revisao/aplicar-dicas.mjs
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dicas } from "./dicas.mjs";

const DATA = "public/data/personagens.json";
const BEFORE = "scripts/revisao/dicas-antes.json";
const raw = readFileSync(DATA, "utf8");
const chars = JSON.parse(raw);

const missing = chars.filter((c) => !dicas[c.id]).map((c) => c.id);
const extra = Object.keys(dicas).filter((id) => !chars.some((c) => c.id === id));
if (missing.length || extra.length) throw new Error(`dicas.mjs incompleto. Sem dica: ${missing.join(", ") || "—"}. Ids inexistentes: ${extra.join(", ") || "—"}`);

if (!existsSync(BEFORE)) {
  const snapshot = Object.fromEntries(chars.map((c) => [c.id, { dica1: c.dica1, dica2: c.dica2 }]));
  writeFileSync(BEFORE, JSON.stringify(snapshot, null, 2) + "\n");
}
const antes = JSON.parse(readFileSync(BEFORE, "utf8"));

for (const c of chars) {
  const [d1, d2] = dicas[c.id];
  c.dica1 = d1;
  c.dica2 = d2;
}
writeFileSync(DATA, JSON.stringify(chars, null, 2) + (raw.endsWith("\n") ? "\n" : ""));

const lines = ["# Dicas do modo Clássico", ""];
lines.push("Dica 1 (6º palpite): dá um rumo, mais difícil. Dica 2 (12º palpite): praticamente entrega. Personagens muito conhecidos têm dicas mais específicas; os pouco conhecidos, mais diretas. Fatos conferidos na Bíblia NAB do Vaticano e na Enciclopédia Católica de 1913.", "");
let changed = 0;
for (const c of chars) {
  const [d1, d2, ref] = dicas[c.id];
  const a = antes[c.id] ?? {};
  if (a.dica1 !== d1 || a.dica2 !== d2) changed++;
  lines.push(`### ${c.nome}`);
  lines.push(`- **Dica 1:** ${d1}${a.dica1 && a.dica1 !== d1 ? `  \n  <sub>antes: ${a.dica1}</sub>` : ""}`);
  lines.push(`- **Dica 2:** ${d2}${a.dica2 && a.dica2 !== d2 ? `  \n  <sub>antes: ${a.dica2}</sub>` : ""}`);
  lines.push(`- Referência: ${ref}`, "");
}
mkdirSync("docs", { recursive: true });
writeFileSync("docs/dicas-personagens.md", lines.join("\n"));
console.log(`dicas aplicadas em ${chars.length} personagens (${changed} com alguma dica reescrita). Relatório: docs/dicas-personagens.md`);
