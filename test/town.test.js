import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { HERO, VIEWPORT } from "../src/config.js";
import { cameraFor, collides, isWalkableAt, movePlayer } from "../src/physics.js";

const map = JSON.parse(await readFile(new URL("../assets/maps/town.json", import.meta.url), "utf8"));

function playerAtFoot(x, y) {
  return { x: x - HERO.width / 2, y: y - HERO.height };
}

test("town background dimensions match the uploaded image", async () => {
  const image = await readFile(new URL(`../${map.background}`, import.meta.url));
  assert.deepEqual([...image.subarray(0, 3)], [255, 216, 255]);
  assert.equal(map.width, 1536);
  assert.equal(map.height, 1024);
});

test("town entrance, plaza routes, and building doors are walkable", () => {
  const walkablePoints = [
    [map.spawn.x, map.spawn.y],
    [768, 700],
    [620, 610],
    [620, 480],
    [768, 350],
    [450, 300],
    [1050, 330],
    [495, 790],
    [1080, 790],
    [1450, 850],
  ];
  for (const [x, y] of walkablePoints) {
    assert.equal(collides(playerAtFoot(x, y), map, HERO), false, `${x},${y} should be walkable`);
  }
});

test("fences, trees, roofs, houses, fountain, and water are blocked", () => {
  const blockedPoints = [
    [768, 480, "fountain"],
    [200, 270, "fence and flower bed"],
    [350, 225, "tree"],
    [250, 360, "roof"],
    [285, 500, "house"],
    [495, 730, "lower house"],
    [200, 700, "garden"],
    [500, 950, "left water"],
    [1100, 960, "right water"],
  ];
  for (const [x, y, label] of blockedPoints) {
    assert.equal(isWalkableAt(map, x, y), false, `${label} at ${x},${y} should be blocked`);
    assert.equal(collides(playerAtFoot(x, y), map, HERO), true, `${label} must block the player`);
  }
});

test("player can walk from the entrance and around the fountain", () => {
  let player = playerAtFoot(map.spawn.x, map.spawn.y);
  player = movePlayer(player, { x: 0, y: -150 }, 2, map, HERO);
  assert.ok(Math.abs(player.y + HERO.height - 668) < 1);
  player = movePlayer(player, { x: 0, y: -150 }, 0.4, map, HERO);
  assert.ok(Math.abs(player.y + HERO.height - 608) < 1);
  player = movePlayer(player, { x: -150, y: 0 }, 1, map, HERO);
  assert.ok(Math.abs(player.x + HERO.width / 2 - 618) < 1);
  player = movePlayer(player, { x: 0, y: -150 }, 0.85, map, HERO);
  assert.ok(Math.abs(player.y + HERO.height - 480.5) < 1);
  player = movePlayer(player, { x: 0, y: -150 }, 0.67, map, HERO);
  player = movePlayer(player, { x: 150, y: 0 }, 2, map, HERO);
  player = movePlayer(player, { x: 0, y: 150 }, 0.67, map, HERO);
  assert.ok(player.x + HERO.width / 2 > 910);
  assert.equal(collides(player, map, HERO), false);
});

test("movement stops before a roof and before the waterline", () => {
  const besideRoof = playerAtFoot(410, 360);
  const againstRoof = movePlayer(besideRoof, { x: -180, y: 0 }, 1, map, HERO);
  assert.ok(againstRoof.x + HERO.width / 2 >= 388);
  assert.equal(collides(againstRoof, map, HERO), false);

  const aboveWater = playerAtFoot(500, 850);
  const againstWater = movePlayer(aboveWater, { x: 0, y: 180 }, 1, map, HERO);
  assert.ok(againstWater.y + HERO.height <= 894);
  assert.equal(collides(againstWater, map, HERO), false);
});

test("town camera clamps to all four image edges", () => {
  assert.deepEqual(cameraFor(playerAtFoot(0, 0), map, VIEWPORT, HERO), { x: 0, y: 0 });
  assert.deepEqual(cameraFor(playerAtFoot(map.width, map.height), map, VIEWPORT, HERO), {
    x: map.width - VIEWPORT.width,
    y: map.height - VIEWPORT.height,
  });
});
