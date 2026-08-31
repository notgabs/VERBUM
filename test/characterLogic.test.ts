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
    const { match, comparison } = evaluateBibleHistory("Gênesis 12-25", "Gênesis 12-25");
    assert.strictEqual(match, "CORRECT");
    assert.strictEqual(comparison, "EQUAL");
  });

  await t.test("2. mesmo livro / referência diferente -> amarelo", () => {
    const { match, comparison } = evaluateBibleHistory("Lucas 1-2", "Lucas 22-24");
    assert.strictEqual(match, "PARTIAL");
    assert.strictEqual(comparison, "EQUAL"); // Same book
  });

  await t.test("3. livro anterior a 1 posição -> amarelo + seta", () => {
    const { match, comparison } = evaluateBibleHistory("Gênesis", "Êxodo");
    assert.strictEqual(match, "PARTIAL");
    assert.strictEqual(comparison, "LOWER");
  });

  await t.test("4. livro posterior a 1 posição -> amarelo + seta", () => {
    const { match, comparison } = evaluateBibleHistory("Êxodo", "Gênesis");
    assert.strictEqual(match, "PARTIAL");
    assert.strictEqual(comparison, "HIGHER");
  });

  await t.test("5. distância 2 -> amarelo", () => {
    const { match, comparison } = evaluateBibleHistory("Gênesis", "Levítico");
    assert.strictEqual(match, "PARTIAL");
    assert.strictEqual(comparison, "LOWER");
  });

  await t.test("6. distância 3 -> vermelho", () => {
    const { match, comparison } = evaluateBibleHistory("Gênesis", "Números");
    assert.strictEqual(match, "WRONG");
    assert.strictEqual(comparison, "LOWER");
  });

  await t.test("7. começo da Bíblia (Gênesis)", () => {
    const { match, comparison } = evaluateBibleHistory("Gênesis", "Apocalipse");
    assert.strictEqual(match, "WRONG");
    assert.strictEqual(comparison, "LOWER");
  });

  await t.test("8. fim da Bíblia (Apocalipse)", () => {
    const { match, comparison } = evaluateBibleHistory("Apocalipse", "Gênesis");
    assert.strictEqual(match, "WRONG");
    assert.strictEqual(comparison, "HIGHER");
  });

  await t.test("9. livros numerados", () => {
    let res = evaluateBibleHistory("1 Samuel", "2 Samuel");
    assert.strictEqual(res.match, "PARTIAL");
    assert.strictEqual(res.comparison, "LOWER");

    res = evaluateBibleHistory("1 Reis", "1 Samuel");
    assert.strictEqual(res.match, "PARTIAL");
    assert.strictEqual(res.comparison, "HIGHER");

    res = evaluateBibleHistory("2 Reis", "1 Samuel");
    assert.strictEqual(res.match, "WRONG");
    assert.strictEqual(res.comparison, "HIGHER");
  });

  await t.test("10. deuterocanônicos na ordem católica", () => {
    let res = evaluateBibleHistory("Judite", "1 Macabeus");
    assert.strictEqual(res.match, "PARTIAL");
    assert.strictEqual(res.comparison, "LOWER");

    res = evaluateBibleHistory("Tobias", "1 Macabeus");
    assert.strictEqual(res.match, "WRONG");
    assert.strictEqual(res.comparison, "LOWER");
  });
});
