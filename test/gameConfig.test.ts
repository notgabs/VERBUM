import test from "node:test";
import assert from "node:assert/strict";
import { GAME_CONFIG } from "../src/config/game.ts";

test("o modo de desenvolvimento mantém o personagem de teste repetível", () => {
  assert.equal(GAME_CONFIG.developmentMode, true);
  assert.equal(GAME_CONFIG.fixedCharacterId, "abel");
  assert.equal(GAME_CONFIG.allowReplay, true);
});

