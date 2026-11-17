import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  CLIP_STEPS, MAX_ATTEMPTS, clipForAttempts, formatSeconds, isCorrectGuess, musicGameStatus, timelinePosition, titleKey,
} from "../src/domain/game/musicLogic.ts";

test("trechos vão de 0,2 s a 20 s em 8 tentativas e só crescem", () => {
  assert.deepEqual([...CLIP_STEPS], [0.2, 0.5, 1, 1.5, 2, 5, 10, 20]);
  assert.equal(MAX_ATTEMPTS, 8);
  assert.equal(clipForAttempts(0), 0.2);
  assert.equal(clipForAttempts(3), 1.5);
  assert.equal(clipForAttempts(99), 20);
});

test("formata segundos com vírgula", () => {
  assert.equal(formatSeconds(0.2), "0,2 s");
  assert.equal(formatSeconds(1.5), "1,5 s");
  assert.equal(formatSeconds(20), "20 s");
});

test("palpite ignora acentos, maiúsculas e pontuação, e aceita apelidos", () => {
  const alvo = { titulo: "Noites Traiçoeiras", apelidos: ["Deus está aqui neste momento"] };
  assert.equal(titleKey("Perfeito é Quem Te Criou"), "perfeitoequemtecriou");
  assert.ok(isCorrectGuess("noites traicoeiras", alvo));
  assert.ok(isCorrectGuess("Deus esta aqui, neste momento!", alvo));
  assert.ok(!isCorrectGuess("Mística Sublime", alvo));
  assert.ok(!isCorrectGuess("", alvo));
});

test("vitória, derrota após 8 tentativas (pulos contam) e jogo em andamento", () => {
  assert.equal(musicGameStatus([]), "playing");
  assert.equal(musicGameStatus([{ kind: "skip" }, { kind: "correct", titulo: "x" }]), "won");
  assert.equal(musicGameStatus(Array.from({ length: 7 }, () => ({ kind: "skip" as const }))), "playing");
  assert.equal(musicGameStatus(Array.from({ length: 8 }, () => ({ kind: "wrong" as const, titulo: "y" }))), "lost");
});

test("barra de trechos: cada trecho ocupa 1/8", () => {
  assert.equal(timelinePosition(0), 0);
  assert.equal(timelinePosition(0.2), 1 / 8);
  assert.equal(timelinePosition(1.5), 4 / 8);
  assert.equal(timelinePosition(20), 1);
  assert.equal(timelinePosition(30), 1);
});

test("catálogo: faixas jogáveis com ID do Deezer e links, sem músicas repetidas", () => {
  const cat = JSON.parse(fs.readFileSync("public/data/musicas.json", "utf-8"));
  assert.ok(cat.musicas.length >= 3);
  for (const m of cat.musicas) {
    assert.ok(m.id && m.titulo && m.artista);
    assert.ok(Number.isInteger(m.deezerId));
    assert.match(m.deezer, /^https:\/\/www\.deezer\.com\/track\/\d+$/);
    assert.match(m.youtube, /^https:\/\/www\.youtube\.com\//);
    assert.match(m.spotify, /^https:\/\/open\.spotify\.com\//);
  }
  // O mesmo título pode existir com artistas diferentes (ex.: "Yeshua"), mas não título + artista repetidos
  const chaves = [...cat.musicas, ...cat.outrasMusicas].map((m: { titulo: string; artista: string }) => titleKey(m.titulo + m.artista));
  assert.equal(new Set(chaves).size, chaves.length);
  const ids = cat.musicas.map((m: { id: string }) => m.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(new Set(cat.musicas.map((m: { deezerId: number }) => m.deezerId)).size, cat.musicas.length);
});
