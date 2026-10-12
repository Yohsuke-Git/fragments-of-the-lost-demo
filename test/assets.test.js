import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { HERO_SPRITE } from "../src/config.js";

test("fixed hero PNG matches the configured 3 by 4 sprite grid", async () => {
  const imageUrl = new URL(`../${HERO_SPRITE.url}`, import.meta.url);
  const png = await readFile(imageUrl);
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  assert.equal(width, HERO_SPRITE.frameWidth * 3);
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
