import test from "node:test";
import assert from "node:assert/strict";
import { getLocalDayKey, selectDailyId, stableHash } from "../src/domain/game/dailyChallenge.ts";

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

