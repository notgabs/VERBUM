/**
 * Aplica scripts/revisao/correcoes.mjs em public/data/personagens.json
 * e gera o relatório docs/revisao-personagens.md.
 * Uso: node scripts/revisao/aplicar.mjs [--dry]
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { revisao } from "./correcoes.mjs";

const DATA = "public/data/personagens.json";
const dry = process.argv.includes("--dry");
const raw = readFileSync(DATA, "utf8");
const chars = JSON.parse(raw);
const byId = new Map(chars.map((c) => [c.id, c]));

// Cópia dos dados antes da revisão: o relatório sempre compara com ela,
// então rodar o script de novo não perde o histórico das correções.
const antes = new Map(JSON.parse(readFileSync("scripts/revisao/personagens-antes.json", "utf8")).map((c) => [c.id, c]));

const changes = [];
let applied = 0;
const unknownIds = Object.keys(revisao).filter((id) => !byId.has(id));
if (unknownIds.length) throw new Error(`ids inexistentes em correcoes.mjs: ${unknownIds.join(", ")}`);

for (const [id, entry] of Object.entries(revisao)) {
  const c = byId.get(id);
  for (const [field, value] of Object.entries(entry.mudancas ?? {})) {
    // As dicas agora são mantidas em scripts/revisao/dicas.mjs (aplicar-dicas.mjs);
    // aqui elas só entram no histórico do relatório.
    const dicaField = field === "dica1" || field === "dica2";
    if (!dicaField && JSON.stringify(c[field]) !== JSON.stringify(value)) applied++;
    const before = antes.get(id)?.[field] ?? c[field];
    if (!dicaField) c[field] = value;
    if (JSON.stringify(before) !== JSON.stringify(value)) changes.push({ id, nome: c.nome, field, before, after: value });
  }
}

if (!dry) writeFileSync(DATA, JSON.stringify(chars, null, 2) + (raw.endsWith("\n") ? "\n" : ""));

/* ---------- Relatório ---------- */
const fmt = (v) => (typeof v === "string" ? v : JSON.stringify(v));
const reviewed = chars.filter((c) => revisao[c.id]);
const pending = chars.filter((c) => !revisao[c.id]);
const lines = [];
lines.push("# Revisão dos personagens (fontes católicas)", "");
lines.push("Fontes aceitas: Bíblia NAB no arquivo do Vaticano (vatican.va/archive/ENG0839), Catecismo da Igreja Católica (vatican.va), CNBB, USCCB (NABRE) e Enciclopédia Católica de 1913 (newadvent.org, com nihil obstat e imprimatur).", "");
lines.push(`- Personagens revisados: **${reviewed.length}** de ${chars.length}`);
lines.push(`- Campos corrigidos: **${changes.length}**`);
lines.push(`- Dados mantidos sem confirmação: **${reviewed.filter((c) => revisao[c.id].naoConfirmado?.length).length}** personagens`, "");

lines.push("## Correções", "");
for (const c of reviewed) {
  const e = revisao[c.id];
  const mine = changes.filter((x) => x.id === c.id);
  if (!mine.length && !e.mudancas) continue;
  lines.push(`### ${c.nome} (\`${c.id}\`)`);
  for (const ch of mine) lines.push(`- **${ch.field}**: ~~${fmt(ch.before)}~~ → ${fmt(ch.after)}`);
  if (e.nota) lines.push(`- Motivo: ${e.nota}`);
  lines.push(`- Fontes: ${e.fontes.join("; ")}`, "");
}

lines.push("## Conferidos sem alteração", "");
for (const c of reviewed) {
  const e = revisao[c.id];
  if (e.mudancas) continue;
  lines.push(`- **${c.nome}** — ${e.fontes.join("; ")}${e.nota ? ` (${e.nota})` : ""}`);
}
lines.push("");

lines.push("## Mantidos sem confirmação em fonte católica", "", "Valores preservados como estavam, para decisão posterior.", "");
lines.push("| Personagem | Campo | Valor atual |", "|---|---|---|");
for (const c of reviewed) {
  for (const f of revisao[c.id].naoConfirmado ?? []) lines.push(`| ${c.nome} | ${f} | ${fmt(c[f])} |`);
}
lines.push("");

if (pending.length) {
  lines.push("## Ainda não revisados", "", pending.map((c) => c.nome).join(", "), "");
}

mkdirSync("docs", { recursive: true });
writeFileSync("docs/revisao-personagens.md", lines.join("\n"));
console.log(`${changes.length} campo(s) corrigido(s) na revisão (${applied} aplicado(s) agora${dry ? ", simulação" : ""}); ${reviewed.length}/${chars.length} revisados. Relatório: docs/revisao-personagens.md`);
