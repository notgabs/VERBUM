import { dicas } from "./dicas.mjs";
import { readFileSync } from "node:fs";
const d = JSON.parse(readFileSync("public/data/personagens.json", "utf8"));
const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const stop = new Set(["de","do","da","dos","das","filho","filha","pai","mae","esposa","esposo","irmao","irmaos","sete","idosa","apostolo","evangelista","discipula","grande","martir","rei","justo","mulher"]);
let n = 0;
for (const c of d) {
  const toks = norm(c.nome).replace(/[(),]/g, " ").split(/\s+/).filter((t) => t.length > 2 && !stop.has(t));
  dicas[c.id].slice(0, 2).forEach((h, i) => {
    const words = new Set(norm(h).split(/[^a-z0-9-]+/));
    const hit = toks.filter((t) => words.has(t));
    if (hit.length) { n++; console.log(`${c.id} dica${i + 1} [${hit}] ${h}`); }
  });
}
console.log(n, "ocorrências");
