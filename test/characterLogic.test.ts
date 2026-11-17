import test from "node:test";
import assert from "node:assert";
import { compareOccupation, evaluateBibleHistory } from "../src/game/characterLogic.ts";

test("compareOccupation", async (t) => {
  await t.test("Exatos -> CORRECT", () => {
    assert.strictEqual(compareOccupation("Rei", "Rei"), "CORRECT");
    assert.strictEqual(compareOccupation("Profeta e Sacerdote", "Profeta e Sacerdote"), "CORRECT");
  });

  await t.test("Semânticos simples -> PARTIAL", () => {
    assert.strictEqual(compareOccupation("Profeta", "Profetisa"), "PARTIAL");
    assert.strictEqual(compareOccupation("Juiz", "Juíza"), "PARTIAL");
    assert.strictEqual(compareOccupation("Apóstolo", "Discípulo"), "PARTIAL");
    assert.strictEqual(compareOccupation("Sacerdote", "Sumo Sacerdote"), "PARTIAL");
    assert.strictEqual(compareOccupation("Anjo", "Arcanjo"), "PARTIAL");
    assert.strictEqual(compareOccupation("Missionário", "Evangelista"), "PARTIAL");
    assert.strictEqual(compareOccupation("Rei", "Rainha"), "PARTIAL");
    assert.strictEqual(compareOccupation("Diácono", "Diaconisa"), "PARTIAL");
  });

  await t.test("Compostos + semântica -> PARTIAL", () => {
    assert.strictEqual(compareOccupation("Pescador e Discípulo", "Apóstolo"), "PARTIAL");
    assert.strictEqual(compareOccupation("Comerciante e Missionário", "Evangelista"), "PARTIAL");
    assert.strictEqual(compareOccupation("Profeta e Sacerdote", "Profetisa"), "PARTIAL");
    assert.strictEqual(compareOccupation("Líder militar", "Governador"), "PARTIAL"); // Ambos lideranca
    assert.strictEqual(compareOccupation("Profeta e Sacerdote", "Profeta"), "PARTIAL"); // interseção exata
  });

  await t.test("Negativos (sem relação) -> WRONG", () => {
    assert.strictEqual(compareOccupation("Pescador", "Médico"), "WRONG");
    assert.strictEqual(compareOccupation("Agricultor", "Carpinteiro"), "WRONG");
    assert.strictEqual(compareOccupation("Rei", "Profeta"), "WRONG");
    assert.strictEqual(compareOccupation("Arcanjo", "Médico"), "WRONG");
  });

  await t.test("Normalização (acentos, espaços, case) -> CORRECT", () => {
    assert.strictEqual(compareOccupation("   Próféta   ", "profeta"), "CORRECT");
    assert.strictEqual(compareOccupation("Sacerdote e Profeta", "sacerdote   e PROfeta"), "CORRECT");
  });
});


test("evaluateBibleHistory - Historia na Biblia", async (t) => {
  await t.test("1. mesma referência -> verde", () => {
    const { match, comparison } = evaluateBibleHistory(
      { historiaNaBiblia: "Gênesis 12-25", referencias: [{ livro: "Gênesis" }] } as any,
      { historiaNaBiblia: "Gênesis 12-25", referencias: [{ livro: "Gênesis" }] } as any
    );
    assert.strictEqual(match, "CORRECT");
    assert.strictEqual(comparison, "EQUAL");
  });

  await t.test("2. mesmo livro / referência diferente -> amarelo", () => {
    const { match, comparison } = evaluateBibleHistory(
      { historiaNaBiblia: "Lucas 1-2", referencias: [{ livro: "Lucas" }] } as any,
      { historiaNaBiblia: "Lucas 22-24", referencias: [{ livro: "Lucas" }] } as any
    );
    assert.strictEqual(match, "PARTIAL");
    assert.strictEqual(comparison, "EQUAL"); // Same book
  });

  await t.test("3. livro anterior a 1 posição -> amarelo + seta", () => {
    const { match, comparison } = evaluateBibleHistory(
      { historiaNaBiblia: "Gênesis", referencias: [{ livro: "Gênesis" }] } as any,
      { historiaNaBiblia: "Êxodo", referencias: [{ livro: "Êxodo" }] } as any
    );
    assert.strictEqual(match, "PARTIAL");
    assert.strictEqual(comparison, "LOWER");
  });

  await t.test("4. livro posterior a 1 posição -> amarelo + seta", () => {
    const { match, comparison } = evaluateBibleHistory(
      { historiaNaBiblia: "Êxodo", referencias: [{ livro: "Êxodo" }] } as any,
      { historiaNaBiblia: "Gênesis", referencias: [{ livro: "Gênesis" }] } as any
    );
    assert.strictEqual(match, "PARTIAL");
    assert.strictEqual(comparison, "HIGHER");
  });

  await t.test("5. distância 2 -> amarelo", () => {
    const { match, comparison } = evaluateBibleHistory(
      { historiaNaBiblia: "Gênesis", referencias: [{ livro: "Gênesis" }] } as any,
      { historiaNaBiblia: "Levítico", referencias: [{ livro: "Levítico" }] } as any
    );
    assert.strictEqual(match, "PARTIAL");
    assert.strictEqual(comparison, "LOWER");
  });

  await t.test("6. distância 3 -> vermelho", () => {
    const { match, comparison } = evaluateBibleHistory(
      { historiaNaBiblia: "Gênesis", referencias: [{ livro: "Gênesis" }] } as any,
      { historiaNaBiblia: "Números", referencias: [{ livro: "Números" }] } as any
    );
    assert.strictEqual(match, "WRONG");
    assert.strictEqual(comparison, "LOWER");
  });

  await t.test("7. começo da Bíblia (Gênesis)", () => {
    const { match, comparison } = evaluateBibleHistory(
      { historiaNaBiblia: "Gênesis", referencias: [{ livro: "Gênesis" }] } as any,
      { historiaNaBiblia: "Apocalipse", referencias: [{ livro: "Apocalipse" }] } as any
    );
    assert.strictEqual(match, "WRONG");
    assert.strictEqual(comparison, "LOWER");
  });

  await t.test("8. fim da Bíblia (Apocalipse)", () => {
    const { match, comparison } = evaluateBibleHistory(
      { historiaNaBiblia: "Apocalipse", referencias: [{ livro: "Apocalipse" }] } as any,
      { historiaNaBiblia: "Gênesis", referencias: [{ livro: "Gênesis" }] } as any
    );
    assert.strictEqual(match, "WRONG");
    assert.strictEqual(comparison, "HIGHER");
  });

  await t.test("9. livros numerados", () => {
    let res = evaluateBibleHistory(
      { historiaNaBiblia: "1 Samuel", referencias: [{ livro: "1 Samuel" }] } as any,
      { historiaNaBiblia: "2 Samuel", referencias: [{ livro: "2 Samuel" }] } as any
    );
    assert.strictEqual(res.match, "PARTIAL");
    assert.strictEqual(res.comparison, "LOWER");

    res = evaluateBibleHistory(
      { historiaNaBiblia: "1 Reis", referencias: [{ livro: "1 Reis" }] } as any,
      { historiaNaBiblia: "1 Samuel", referencias: [{ livro: "1 Samuel" }] } as any
    );
    assert.strictEqual(res.match, "PARTIAL");
    assert.strictEqual(res.comparison, "HIGHER");

    res = evaluateBibleHistory(
      { historiaNaBiblia: "2 Reis", referencias: [{ livro: "2 Reis" }] } as any,
      { historiaNaBiblia: "1 Samuel", referencias: [{ livro: "1 Samuel" }] } as any
    );
    assert.strictEqual(res.match, "WRONG");
    assert.strictEqual(res.comparison, "HIGHER");
  });

  await t.test("10. deuterocanônicos na ordem católica", () => {
    let res = evaluateBibleHistory(
      { historiaNaBiblia: "Judite", referencias: [{ livro: "Judite" }] } as any,
      { historiaNaBiblia: "1 Macabeus", referencias: [{ livro: "1 Macabeus" }] } as any
    );
    assert.strictEqual(res.match, "PARTIAL");
    assert.strictEqual(res.comparison, "LOWER");

    res = evaluateBibleHistory(
      { historiaNaBiblia: "Tobias", referencias: [{ livro: "Tobias" }] } as any,
      { historiaNaBiblia: "1 Macabeus", referencias: [{ livro: "1 Macabeus" }] } as any
    );
    assert.strictEqual(res.match, "WRONG");
    assert.strictEqual(res.comparison, "LOWER");
  });
});

/* ---------- Regressões relatadas e regras de conjuntos ---------- */

import { readFileSync } from "node:fs";
import { comparePersonagem, compareValueSets, splitDivisions, extractHistoryBooks, parseBirthYear, comparePovo } from "../src/game/characterLogic.ts";

const catalog = JSON.parse(readFileSync(new URL("../public/data/personagens.json", import.meta.url), "utf8"));
const byId = (id: string) => {
  const c = catalog.find((x: { id: string }) => x.id === id);
  if (!c) throw new Error(`personagem ausente: ${id}`);
  return c;
};

test("História na Bíblia considera todos os livros do personagem", async (t) => {
  const target = byId("simao-o-mago"); // Atos 8

  await t.test("Augusto (Lucas) -> amarelo, seta para baixo", () => {
    const r = comparePersonagem(byId("augusto"), target);
    assert.strictEqual(r.historiaNaBibliaMatch, "PARTIAL");
    assert.strictEqual(r.historiaNaBibliaComparison, "LOWER");
  });

  await t.test("Jesus (Mateus; Marcos; Lucas; João) -> amarelo, não vermelho", () => {
    assert.strictEqual(comparePersonagem(byId("jesus-cristo"), target).historiaNaBibliaMatch, "PARTIAL");
  });

  await t.test("Endemoniado geraseno (Marcos; Lucas) -> amarelo", () => {
    assert.strictEqual(comparePersonagem(byId("endemoniado-geraseno"), target).historiaNaBibliaMatch, "PARTIAL");
  });

  await t.test("livro em comum -> amarelo sem seta", () => {
    const r = comparePersonagem(byId("paulo"), target);
    assert.strictEqual(r.historiaNaBibliaMatch, "PARTIAL");
    assert.strictEqual(r.historiaNaBibliaComparison, "EQUAL");
  });

  await t.test("livros distantes -> vermelho com seta", () => {
    const r = comparePersonagem(byId("abimeleque"), target); // Juízes
    assert.strictEqual(r.historiaNaBibliaMatch, "WRONG");
    assert.strictEqual(r.historiaNaBibliaComparison, "LOWER");
  });

  await t.test("extrai livros separados por ; , e 'e'", () => {
    assert.deepStrictEqual(extractHistoryBooks("Mateus, Marcos, Lucas, João e Atos 1"), ["Mateus", "Marcos", "Lucas", "João", "Atos"]);
    assert.deepStrictEqual(extractHistoryBooks("Lucas 2, 1"), ["Lucas"]);
    assert.deepStrictEqual(extractHistoryBooks("Atos 7-9; 13-28"), ["Atos"]);
    assert.deepStrictEqual(extractHistoryBooks("1 Samuel 16; 2 Samuel"), ["1 Samuel", "2 Samuel"]);
    assert.deepStrictEqual(extractHistoryBooks("Abdias"), ["Obadias"]);
  });
});

test("Divisão e Testamento comparam conjuntos", async (t) => {
  await t.test("Paulo (Epístolas e Históricos) x Simão (Históricos) -> amarelo", () => {
    assert.strictEqual(comparePersonagem(byId("paulo"), byId("simao-o-mago")).divisaoMatch, "PARTIAL");
  });
  await t.test("Abimeleque (Históricos) x Simão (Históricos) -> verde", () => {
    assert.strictEqual(comparePersonagem(byId("abimeleque"), byId("simao-o-mago")).divisaoMatch, "CORRECT");
  });
  await t.test("o contrário também é amarelo", () => {
    assert.strictEqual(compareValueSets(splitDivisions("Históricos"), splitDivisions("Epístolas e Históricos")), "PARTIAL");
  });
  await t.test("ordem diferente, mesmo conjunto -> verde", () => {
    assert.strictEqual(compareValueSets(splitDivisions("Históricos e Epístolas"), splitDivisions("Epístolas e Históricos")), "CORRECT");
    assert.strictEqual(compareValueSets(splitDivisions("Evangelhos, Históricos e Epístolas"), splitDivisions("Históricos, Evangelhos e Epístolas")), "CORRECT");
  });
  await t.test("nada em comum -> vermelho", () => {
    assert.strictEqual(compareValueSets(splitDivisions("Pentateuco"), splitDivisions("Evangelhos e Históricos")), "WRONG");
  });
  await t.test("Testamento 'Antigo e Novo' x 'Novo' -> amarelo", () => {
    assert.strictEqual(compareValueSets(splitDivisions("Antigo e Novo"), splitDivisions("Novo")), "PARTIAL");
  });
});

test("Conversão de data de nascimento (usada na auditoria)", async (t) => {
  await t.test("converte textos em ano", () => {
    assert.strictEqual(parseBirthYear("1170 a.C."), -1170);
    assert.strictEqual(parseBirthYear("Por volta de 6 a.C."), -6);
    assert.strictEqual(parseBirthYear("Século VIII a.C."), -750);
    assert.strictEqual(parseBirthYear("Século I d.C."), 50);
    assert.strictEqual(parseBirthYear("Primeiro século d.C."), 50);
    assert.strictEqual(parseBirthYear("Data desconhecida"), null);
    assert.strictEqual(parseBirthYear("Antes da criação"), null);
  });
});

test("Toda a base: nenhuma comparação quebra e o próprio personagem é sempre verde", () => {
  for (const c of catalog) {
    const self = comparePersonagem(c, c);
    assert.ok(self.isFullyCorrect, c.id);
    for (const key of ["sexoMatch", "testamentoMatch", "divisaoMatch", "historiaNaBibliaMatch", "povoMatch", "ocupacaoMatch"] as const) {
      assert.strictEqual(self[key], "CORRECT", `${c.id} ${key}`);
    }
  }
  for (const a of catalog.slice(0, 60)) for (const b of catalog) comparePersonagem(a, b);
});

test("Povo / Origem", async (t) => {
  await t.test("mesmo valor -> verde", () => {
    assert.strictEqual(comparePovo("Israelita (Judá)", "Israelita (Judá)"), "CORRECT");
    assert.strictEqual(comparePovo("Romano", "romano"), "CORRECT");
  });
  await t.test("mesmo povo, tribo diferente ou não informada -> amarelo", () => {
    assert.strictEqual(comparePovo("Israelita (Benjamim)", "Israelita (Judá)"), "PARTIAL");
    assert.strictEqual(comparePovo("Israelita", "Israelita (Levi)"), "PARTIAL");
    assert.strictEqual(comparePovo("Ser espiritual (Anjo)", "Ser espiritual (Demônio)"), "PARTIAL");
  });
  await t.test("Hebreu x Israelita -> amarelo", () => {
    assert.strictEqual(comparePovo("Hebreu", "Israelita (Judá)"), "PARTIAL");
  });
  await t.test("povos diferentes -> vermelho", () => {
    assert.strictEqual(comparePovo("Romano", "Israelita"), "WRONG");
    assert.strictEqual(comparePovo("Egípcio", "Arameu"), "WRONG");
  });
  await t.test("origem desconhecida não dá amarelo", () => {
    assert.strictEqual(comparePovo("Origem desconhecida", "Israelita"), "WRONG");
  });
  await t.test("casos reais da base", () => {
    assert.strictEqual(comparePersonagem(byId("paulo"), byId("saul")).povoMatch, "CORRECT"); // ambos de Benjamim
    assert.strictEqual(comparePersonagem(byId("davi"), byId("saul")).povoMatch, "PARTIAL"); // Judá x Benjamim
    assert.strictEqual(comparePersonagem(byId("poncio-pilatos"), byId("saul")).povoMatch, "WRONG");
  });
  await t.test("todo personagem tem povo", () => {
    for (const c of catalog) assert.ok(typeof c.povo === "string" && c.povo.trim(), c.id);
  });
});
