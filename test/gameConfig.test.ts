import test from "node:test";
import assert from "node:assert/strict";
import { GAME_CONFIG } from "../src/config/game.ts";

test("configuração de produção: sem modo de desenvolvimento nem alvos fixos", () => {
  assert.equal(GAME_CONFIG.developmentMode, false);
  assert.equal(GAME_CONFIG.fixedCharacterId, undefined);
  assert.equal(GAME_CONFIG.fixedPassageId, undefined);
});
