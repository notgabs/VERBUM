import test from "node:test";
import assert from "node:assert/strict";
import { applyDailyResult, currentStreak } from "../src/domain/game/streak.ts";

const zero = { sequenciaAtual: 0, maiorSequencia: 0 };

test("vários jogos vencidos no mesmo dia contam um dia só", () => {
  let s = applyDailyResult(zero, true, "2026-11-17");
  s = applyDailyResult(s, true, "2026-11-17");
  s = applyDailyResult(s, true, "2026-11-17");
  assert.equal(s.sequenciaAtual, 1);
});

test("dias seguidos somam, inclusive na virada de mês e de ano", () => {
  let s = applyDailyResult(zero, true, "2026-12-30");
  s = applyDailyResult(s, true, "2026-12-31");
  s = applyDailyResult(s, true, "2027-01-01");
  assert.equal(s.sequenciaAtual, 3);
  assert.equal(s.maiorSequencia, 3);
});

test("perder não zera; um dia sem vitória quebra a sequência", () => {
  let s = applyDailyResult(zero, true, "2026-11-10");
  s = applyDailyResult(s, true, "2026-11-11");
  s = applyDailyResult(s, false, "2026-11-12");
  assert.equal(currentStreak(s, "2026-11-12"), 2);
  assert.equal(currentStreak(s, "2026-11-13"), 0);
  s = applyDailyResult(s, true, "2026-11-13");
  assert.equal(s.sequenciaAtual, 1);
  assert.equal(s.maiorSequencia, 2);
});
