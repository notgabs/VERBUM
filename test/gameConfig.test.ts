import test from "node:test";
import assert from "node:assert/strict";
import { GAME_CONFIG } from "../src/config/game.ts";

test("o modo de desenvolvimento deixa os alvos livres para sorteio", () => {
  assert.equal(GAME_CONFIG.developmentMode, true);
  assert.equal(GAME_CONFIG.fixedCharacterId, undefined);
  assert.equal(GAME_CONFIG.fixedPassageId, undefined);
  assert.equal(GAME_CONFIG.allowReplay, true);
});
