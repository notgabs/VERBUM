import test from "node:test";
import assert from "node:assert/strict";
import { comparePassagem } from "../src/game/passageLogic.ts";
import type { Passagem } from "../src/types/game.ts";

const target: Passagem = {
  id: "test",
  texto: "test",
  livro: "Romanos",
  capitulo: 8,
  versiculo: 28,
  testamento: "Novo",
  divisao: "Cartas",
  dica1: "",
  dica2: ""
};

test("palpite Êxodo, alvo Gênesis -> HIGHER (seta para cima)", () => {
  const t = { ...target, livro: "Gênesis" };
  const res = comparePassagem("Êxodo", 1, 1, t);
  assert.equal(res.livroComparison, "HIGHER");
});

test("palpite Gênesis, alvo Êxodo -> LOWER (seta para baixo)", () => {
  const t = { ...target, livro: "Êxodo" };
  const res = comparePassagem("Gênesis", 1, 1, t);
  assert.equal(res.livroComparison, "LOWER");
});

test("palpite Isaías, alvo Romanos -> LOWER (seta para baixo)", () => {
  const t = { ...target, livro: "Romanos" };
  const res = comparePassagem("Isaías", 1, 1, t);
  assert.equal(res.livroComparison, "LOWER");
});

test("palpite 1 Coríntios, alvo Romanos -> HIGHER (seta para cima)", () => {
  const t = { ...target, livro: "Romanos" };
  const res = comparePassagem("1 Coríntios", 1, 1, t);
  assert.equal(res.livroComparison, "HIGHER");
});

test("palpite Judas, alvo Apocalipse -> LOWER (seta para baixo)", () => {
  const t = { ...target, livro: "Apocalipse" };
  const res = comparePassagem("Judas", 1, 1, t);
  assert.equal(res.livroComparison, "LOWER");
});

test("palpite Apocalipse, alvo Judas -> HIGHER (seta para cima)", () => {
  const t = { ...target, livro: "Judas" };
  const res = comparePassagem("Apocalipse", 1, 1, t);
  assert.equal(res.livroComparison, "HIGHER");
});

test("Gênesis vs Gênesis -> EQUAL e CORRECT", () => {
  const t = { ...target, livro: "Gênesis" };
  const res = comparePassagem("Gênesis", 1, 1, t);
  assert.equal(res.livroComparison, "EQUAL");
  assert.equal(res.livroMatch, "CORRECT");
});

test("Apocalipse vs Apocalipse -> EQUAL e CORRECT", () => {
  const t = { ...target, livro: "Apocalipse" };
  const res = comparePassagem("Apocalipse", 1, 1, t);
  assert.equal(res.livroComparison, "EQUAL");
  assert.equal(res.livroMatch, "CORRECT");
});

test("Livro deuterocanônico: Sabedoria vs alvo Marcos -> LOWER (seta para baixo)", () => {
  const t = { ...target, livro: "Marcos" };
  const res = comparePassagem("Sabedoria", 1, 1, t);
  assert.equal(res.livroComparison, "LOWER");
});
