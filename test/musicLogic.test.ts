import test from "node:test";
import assert from "node:assert";

// Mock para simular o React
const React = {
  useState: (initial: any) => {
    let state = initial;
    const setState = (newState: any) => {
      if (typeof newState === 'function') {
        state = newState(state);
      } else {
        state = newState;
      }
    };
    return [state, setState];
  },
  useCallback: (fn: any) => fn,
  useEffect: (fn: any) => {},
};

import { MUSIC_CATALOG } from "../src/data/music.ts";

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, "")
    .trim();
}

function computeDirection(guessRaw: string, targetTitle: string): "up" | "down" | undefined {
  const guess = normalize(guessRaw);
  const targetNorm = normalize(targetTitle);
  if (guess === targetNorm) return undefined;
  return guess < targetNorm ? "down" : "up";
}

function computeNextClipLength(current: number, maxClip: number) {
  return Math.min(current * 2, maxClip);
}

test("musicLogic - clip length cresce exponencialmente até o máximo de 16s", () => {
  let clip = 0.5;
  const max = 16;
  
  // 5 tentativas erradas (0.5 -> 1 -> 2 -> 4 -> 8 -> 16)
  clip = computeNextClipLength(clip, max);
  assert.strictEqual(clip, 1);
  clip = computeNextClipLength(clip, max);
  assert.strictEqual(clip, 2);
  clip = computeNextClipLength(clip, max);
  assert.strictEqual(clip, 4);
  clip = computeNextClipLength(clip, max);
  assert.strictEqual(clip, 8);
  clip = computeNextClipLength(clip, max);
  assert.strictEqual(clip, 16);

  // Não passa de 16
  clip = computeNextClipLength(clip, max);
  assert.strictEqual(clip, 16);
});

test("musicLogic - normalização ignora acentos e case", () => {
  const targetTitle = "Glória ao Pai";
  
  const correct1 = normalize("glória ao pai") === normalize(targetTitle);
  assert.strictEqual(correct1, true);

  const correct2 = normalize("Gloria Ao Pai") === normalize(targetTitle);
  assert.strictEqual(correct2, true);
  
  const wrong1 = normalize("Ave Maria") === normalize(targetTitle);
  assert.strictEqual(wrong1, false);
});

test("musicLogic - seta alfabética correta", () => {
  const targetTitle = "Glória ao Pai";
  
  // Ave Maria (a) < Gloria (g) => down
  const dir1 = computeDirection("Ave Maria", targetTitle);
  assert.strictEqual(dir1, "down");

  // Salmo 23 (s) > Gloria (g) => up
  const dir2 = computeDirection("Salmo 23", targetTitle);
  assert.strictEqual(dir2, "up");
});
