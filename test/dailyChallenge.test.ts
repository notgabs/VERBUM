import test from "node:test";
import assert from "node:assert/strict";
import { getLocalDayKey, selectDailyId, selectRandomId, stableHash } from "../src/domain/game/dailyChallenge.ts";

test("a chave do dia usa a data local normalizada", () => {
  assert.equal(getLocalDayKey(new Date(2026, 6, 31, 23, 59)), "2026-07-31");
});

test("a seleção diária é determinística e respeita os IDs disponíveis", () => {
  const ids = ["abel", "moises", "maria"];
  const date = new Date(2026, 6, 31);
  assert.equal(selectDailyId(ids, date), selectDailyId(ids, date));
  assert.ok(ids.includes(selectDailyId(ids, date) ?? ""));
  assert.equal(selectDailyId([], date), undefined);
  assert.equal(stableHash("2026-07-31"), stableHash("2026-07-31"));
});

test("a seleção aleatória alcança qualquer item do catálogo", () => {
  const ids = ["abel", "moises", "maria"];
  assert.equal(selectRandomId(ids, () => 0), "abel");
  assert.equal(selectRandomId(ids, () => 0.5), "moises");
  assert.equal(selectRandomId(ids, () => 0.999), "maria");
  assert.equal(selectRandomId([], () => 0.5), undefined);
});
