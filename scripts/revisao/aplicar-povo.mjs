/**
 * Grava o campo `povo` de scripts/revisao/povo.mjs em public/data/personagens.json
 * e gera o relatório docs/povo-personagens.md.
 * Uso: node scripts/revisao/aplicar-povo.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { povos } from "./povo.mjs";

const DATA = "public/data/personagens.json";
const raw = readFileSync(DATA, "utf8");
const chars = JSON.parse(raw);
const ids = new Set(chars.map((c) => c.id));

const missing = chars.filter((c) => !povos[c.id]).map((c) => c.id);
const extra = Object.keys(povos).filter((id) => !ids.has(id));
if (missing.length || extra.length) {
  throw new Error(`povo.mjs incompleto. Sem povo: ${missing.join(", ") || "—"}. Ids inexistentes: ${extra.join(", ") || "—"}`);
}

// Insere `povo` logo depois de `ocupacao`, mantendo a ordem dos demais campos
const out = chars.map((c) => {
  const [povo] = povos[c.id];
  const entries = Object.entries(c).filter(([k]) => k !== "povo");
  const at = entries.findIndex(([k]) => k === "ocupacao");
  entries.splice(at + 1, 0, ["povo", povo]);
  return Object.fromEntries(entries);
});
writeFileSync(DATA, JSON.stringify(out, null, 2) + (raw.endsWith("\n") ? "\n" : ""));

/* ---------- Relatório ---------- */
const counts = {};
for (const c of out) counts[c.povo] = (counts[c.povo] ?? 0) + 1;
const lines = ["# Povo / Origem dos personagens", ""];
lines.push("Coluna que substitui o Nascimento no modo Personagem. Fontes aceitas: Bíblia NAB do Vaticano, USCCB, CNBB e Enciclopédia Católica de 1913.", "");
lines.push("Regra: igual = verde; mesmo povo com tribo/tipo diferente (ou não informado) = amarelo; Hebreu × Israelita = amarelo; povos diferentes = vermelho.", "");
lines.push("## Distribuição", "", "| Povo | Personagens |", "|---|---|");
for (const [p, n] of Object.entries(counts).sort((a, b) => b[1] - a[1])) lines.push(`| ${p} | ${n} |`);
lines.push("", "## Por personagem", "", "| Personagem | Povo | Fonte | Observação |", "|---|---|---|---|");
for (const c of out) {
  const [, fonte, nota = "", naoConf = false] = povos[c.id];
  lines.push(`| ${c.nome} | ${c.povo}${naoConf ? " ⚠️" : ""} | ${fonte} | ${nota} |`);
}
const unconfirmed = out.filter((c) => povos[c.id][3]);
lines.push("", "## Não confirmados (⚠️)", "", "Valor mais provável pelo contexto, sem afirmação explícita na fonte:", "");
for (const c of unconfirmed) lines.push(`- **${c.nome}**: ${c.povo} — ${povos[c.id][2]}`);
mkdirSync("docs", { recursive: true });
writeFileSync("docs/povo-personagens.md", lines.join("\n") + "\n");
console.log(`povo gravado em ${out.length} personagens; ${Object.keys(counts).length} valores distintos; ${unconfirmed.length} não confirmados. Relatório: docs/povo-personagens.md`);
