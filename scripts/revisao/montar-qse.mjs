/**
 * Monta public/data/quem-sou-eu.json só com figuras do catolicismo (santos, papas, religiosos).
 * Personagens bíblicos e arcanjos ficam de fora deste modo.
 *
 * Fontes:
 *  - qse-dicas-1.mjs: dicas revisadas das figuras católicas que já existiam;
 *  - qse-antes.json: nome, apelidos e tipo dessas figuras (catálogo original);
 *  - qse-catolicos.mjs: as novas figuras.
 * Ordem das dicas: dicas[0] = Pista 1 (entrega a resposta) ... dicas[5] = Pista 6 (a mais difícil).
 * Cada figura aponta para a foto /quem-sou-eu/<slug>.webp (imagem real do Wikimedia Commons; ver scripts/revisao/fotos-qse).
 *
 * Uso: node scripts/revisao/montar-qse.mjs
 */
import fs from "node:fs";
import { qseDicas1 } from "./qse-dicas-1.mjs";
import { qseCatolicos } from "./qse-catolicos.mjs";

/** Figuras católicas que já existiam (a cena foi usada só no teste com imagens geradas). */
export const CENAS_EXISTENTES = {
  "qse-sao-francisco": "a thirteenth-century Italian friar in a patched brown habit with a rope belt preaching to birds in a sunny Umbrian meadow, a medieval hill town behind",
  "qse-santa-clara": "a thirteenth-century Italian abbess in a brown habit and black veil raising a golden monstrance on the walls of a stone monastery as soldiers retreat below",
  "qse-santo-antonio": "a medieval Franciscan friar in a brown habit with a tonsure holding the Child Jesus and a white lily, preaching on a seashore while fish raise their heads from the water",
  "qse-santa-teresinha": "a young nineteenth-century French Carmelite nun in a brown habit and white mantle holding a crucifix covered with roses, rose petals falling around her in a convent garden",
  "qse-madre-teresa": "an elderly nun in a white sari with three blue stripes caring for a sick poor man on a mat in a crowded Indian street shelter, warm humid light, seen from the side",
  "qse-joao-paulo-ii": "a pope in white cassock seen from behind, holding a tall silver pastoral staff topped with a crucifix, facing an enormous crowd of young pilgrims waving flags in a sunny open field, his face not visible",
  "qse-sao-bento": "a sixth-century monk abbot in a black Benedictine habit holding a book of rules and a cross, standing before a mountaintop monastery at sunrise",
  "qse-santo-agostinho": "a fifth-century North African bishop in red and gold vestments with a mitre writing a large book by lamplight, a burning heart symbol glowing on the desk",
  "qse-sao-tomas": "a heavyset thirteenth-century Dominican friar in a white habit and black cape writing a massive book at a desk in a medieval university library, a radiant sun emblem on his chest",
  "qse-faustina": "a young Polish nun in a black habit and white collar kneeling before a painting of Jesus with red and pale rays coming from his heart, in a simple convent chapel",
  "qse-rita-cassia": "a fifteenth-century Italian Augustinian nun in a black habit kneeling before a crucifix, a small wound on her forehead, holding a red rose, white bees flying nearby",
  "qse-padre-pio": "an elderly bearded Capuchin friar in a brown habit with fingerless mittens on his hands celebrating mass at an altar, candlelight, deep devotion, seen from the side",
  "qse-maximiliano-kolbe": "a Franciscan priest in a striped concentration camp uniform with round glasses stepping forward from a line of prisoners, grey sky, barbed wire, solemn courage",
  "qse-sao-domingos": "a thirteenth-century Spanish friar in a white Dominican habit and black cape holding a rosary and a book, a small star above his head, a dog with a torch at his feet",
  "qse-sao-vicente-paulo": "a seventeenth-century French priest in a black cassock carrying an abandoned baby in his arms through a snowy Paris street at night, lantern light",
  "qse-luis-gonzaga": "a young sixteenth-century Jesuit novice in a black cassock and white surplice carrying a sick man on his back through a plague hospital in Rome",
  "qse-lourenco": "a young Roman deacon in a red dalmatic standing before a crowd of poor, blind and sick people, presenting them with an open hand to a Roman official, ancient Rome",
  "qse-bento-xvi": "an elderly pope in white cassock seen from behind and slightly to the side, walking alone in a quiet Vatican garden toward a small monastery, holding a book, autumn trees, face not visible",
  "qse-papa-francisco": "a pope in a simple white cassock seen from behind, waving from the open window of a small ordinary car moving slowly through a cheering crowd on a sunny street, face not visible",
};

const antes = JSON.parse(fs.readFileSync("scripts/revisao/qse-antes.json", "utf-8"));
const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const slug = (id) => id.replace(/^qse-/, "");
const erros = [];

const existentes = Object.keys(CENAS_EXISTENTES).map((id) => {
  const base = antes.find((e) => e.id === id);
  const rev = qseDicas1[id];
  if (!base || !rev) { erros.push(`${id}: faltam dados`); return null; }
  return {
    id, nome: base.nome, aliases: base.aliases, tipo: base.tipo,
    dicas: rev.dicas, resumo: rev.r ?? base.resumo, conhecidoPor: rev.c ?? base.conhecidoPor,
    imagem: `/quem-sou-eu/${slug(id)}.webp`,
  };
}).filter(Boolean);

const novos = qseCatolicos.map(({ cena, ...e }) => ({ ...e, imagem: `/quem-sou-eu/${slug(e.id)}.webp` }));
const catalogo = [...existentes, ...novos];

const ids = new Set();
for (const e of catalogo) {
  if (ids.has(e.id)) erros.push(`${e.id}: id repetido`);
  ids.add(e.id);
  if (!["Santo", "Papa", "Clero", "Outro"].includes(e.tipo)) erros.push(`${e.id}: tipo ${e.tipo} não pertence a este modo`);
  if (!e.nome || !Array.isArray(e.aliases) || e.aliases.length === 0) erros.push(`${e.id}: nome e apelidos são obrigatórios`);
  if (!Array.isArray(e.dicas) || e.dicas.length !== 6 || new Set(e.dicas).size !== 6) erros.push(`${e.id}: precisa de 6 dicas diferentes`);
  const nomes = [e.nome, ...e.aliases].map((n) => n.trim()).filter((n) => n.length >= 3 && !/^(Santo|Santa|São|Papa|Francisco)$/i.test(n));
  e.dicas.forEach((d, i) => {
    for (const n of nomes) {
      const re = new RegExp(`(^|[^a-z])${norm(n).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z]|$)`);
      if (re.test(norm(d))) erros.push(`${e.id}: Pista ${i + 1} cita "${n}"`);
    }
  });
}

if (erros.length) { console.error(erros.join("\n")); process.exit(1); }
fs.writeFileSync("public/data/quem-sou-eu.json", JSON.stringify(catalogo, null, 2) + "\n");
const porTipo = catalogo.reduce((acc, e) => ({ ...acc, [e.tipo]: (acc[e.tipo] ?? 0) + 1 }), {});
console.log(`${catalogo.length} figuras:`, porTipo);
