import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { HERO, HERO_SPRITE } from "../src/config.js";

test("fixed hero PNG matches the configured 6 by 4 sprite grid", async () => {
  const imageUrl = new URL(`../${HERO_SPRITE.url}`, import.meta.url);
  const png = await readFile(imageUrl);
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  assert.equal(width, HERO_SPRITE.frameWidth * HERO_SPRITE.framesPerRow);
  assert.equal(height, HERO_SPRITE.frameHeight * 4);
});

test("direction corrections stay inside each source frame", () => {
  for (const direction of Object.keys(HERO_SPRITE.directionRow)) {
    const inset = HERO_SPRITE.sourceInsets[direction];
    assert.ok(inset.left + inset.right < HERO_SPRITE.frameWidth);
    assert.ok(inset.top + inset.bottom < HERO_SPRITE.frameHeight);
    assert.ok(HERO_SPRITE.directionOffsetY[direction] >= 0);
  }
});

test("left walk mirrors the correct six-frame right-facing cycle", () => {
  assert.deepEqual(HERO_SPRITE.animation, [0, 1, 2, 3, 4, 5]);
  assert.equal(HERO_SPRITE.directionRow.left, HERO_SPRITE.directionRow.right);
  assert.equal(HERO_SPRITE.directionFlipX.left, true);
  assert.equal(HERO_SPRITE.directionFlipX.right, false);
  assert.equal(HERO_SPRITE.sourceInsets.left.top, 1);
  assert.equal(HERO_SPRITE.sourceInsets.right.top, 1);
});

test("town walking pace keeps each limb pose visible", () => {
  assert.equal(HERO.speed, 70);
  assert.equal(HERO_SPRITE.framesPerSecond, 7);
});
