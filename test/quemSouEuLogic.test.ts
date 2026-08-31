import test from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import { hydrateQuemSouEu } from "../src/domain/game/catalogQuemSouEu.ts";
import { compareQuemSouEu } from "../src/game/quemSouEuLogic.ts";
import { isRawQuemSouEu } from "../src/domain/game/catalogContracts.ts";

test("▶ Quem Sou Eu Logic", async (t) => {
  const quemSouEuRaw = JSON.parse(fs.readFileSync("./public/data/quem-sou-eu.json", "utf-8"));
  const personagens = JSON.parse(fs.readFileSync("./public/data/personagens.json", "utf-8"));

  await t.test("Catálogo inicial tem os de teste/oficiais", () => {
    assert.ok(quemSouEuRaw.length >= 6);
  });

  await t.test("isRawQuemSouEu valida tipos, exatamente 6 dicas, etc", () => {
    const valid = {
      id: "teste1",
      nome: "Nome",
      aliases: ["Nome"],
      tipo: "Outro",
      dicas: ["1", "2", "3", "4", "5", "6"],
      resumo: "r",
      conhecidoPor: "c"
    };
    assert.ok(isRawQuemSouEu(valid));

    const invalidDicasLength = { ...valid, dicas: ["1", "2", "3", "4", "5"] };
    assert.ok(!isRawQuemSouEu(invalidDicasLength));

    const invalidDicasType = { ...valid, dicas: ["1", "2", "3", "4", "5", 6] };
    assert.ok(!isRawQuemSouEu(invalidDicasType));
    
    const invalidTipo = { ...valid, tipo: "Alien" };
    assert.ok(!isRawQuemSouEu(invalidTipo));
  });

  const hydrated = hydrateQuemSouEu(quemSouEuRaw, personagens);

  await t.test("hidratação bíblica funciona sem duplicar no JSON", () => {
    const davi = hydrated.find(h => h.id === "qse-davi");
    assert.ok(davi);
    assert.strictEqual(davi.nome, "Davi");
    assert.ok(davi.dicas.length === 6);
  });

  await t.test("entrada externa funciona e aliases são mantidos", () => {
    const jp2 = hydrated.find(h => h.id === "qse-joao-paulo-ii");
    assert.ok(jp2);
    assert.strictEqual(jp2.nome, "São João Paulo II");
    assert.ok(jp2.aliases.includes("Karol Wojtyla"));
  });

  await t.test("catálogo do Quem Sou Eu não contamina o Clássico", () => {
    const classicoJP2 = personagens.find((p: any) => p.id === "qse-joao-paulo-ii" || p.nome === "São João Paulo II");
    assert.ok(!classicoJP2); // Não deve existir no clássico
  });

  await t.test("compareQuemSouEu com normalização e aliases", () => {
    const jp2 = hydrated.find(h => h.id === "qse-joao-paulo-ii")!;
    
    // Exact name
    assert.ok(compareQuemSouEu("São João Paulo II", jp2).isCorrect);
    // Alias lowercase
    assert.ok(compareQuemSouEu("karol wojtyla", jp2).isCorrect);
    // Alias different casing & spacing
    assert.ok(compareQuemSouEu("  Joao PAULO 2 ", jp2).isCorrect);
    
    // Wrong
    assert.ok(!compareQuemSouEu("Papa Francisco", jp2).isCorrect);
  });

  await t.test("Mecânica das 6 dicas (lógica state)", () => {
    // Simulação do state React
    let guesses = [];
    const maxDicas = 6;
    
    // Inicio - 1 dica
    let visibleHints = Math.min(maxDicas, guesses.length + 1);
    assert.strictEqual(visibleHints, 1);
    
    // Palpite 1 errado
    guesses.push("Errado 1");
    visibleHints = Math.min(maxDicas, guesses.length + 1);
    assert.strictEqual(visibleHints, 2);

    // Vários erros
    guesses.push("Errado 2", "Errado 3", "Errado 4", "Errado 5");
    visibleHints = Math.min(maxDicas, guesses.length + 1);
    assert.strictEqual(visibleHints, 6);

    // Mais erros não criam dica 7
    guesses.push("Errado 6", "Errado 7");
    visibleHints = Math.min(maxDicas, guesses.length + 1);
    assert.strictEqual(visibleHints, 6);
  });
});
