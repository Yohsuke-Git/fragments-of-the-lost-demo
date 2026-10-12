import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { HERO, VIEWPORT } from "../src/config.js";
import { playerDepth, shouldDrawInFront } from "../src/depth.js";
import { cameraFor, collides, isWalkableAt, movePlayer } from "../src/physics.js";

const map = JSON.parse(await readFile(new URL("../assets/maps/town.json", import.meta.url), "utf8"));
const foreground = JSON.parse(await readFile(new URL(`../${map.foregroundManifest}`, import.meta.url), "utf8"));

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

test("fences, trees, house foundations, fountain, and water are blocked", () => {
  const blockedPoints = [
    [768, 480, "fountain"],
    [200, 270, "fence and flower bed"],
    [350, 225, "tree"],
    [250, 525, "house foundation"],
    [430, 790, "lower house foundation"],
    [200, 700, "garden"],
    [500, 950, "left water"],
    [1100, 960, "right water"],
  ];
  for (const [x, y, label] of blockedPoints) {
    assert.equal(isWalkableAt(map, x, y), false, `${label} at ${x},${y} should be blocked`);
    assert.equal(collides(playerAtFoot(x, y), map, HERO), true, `${label} must block the player`);
  }
});

test("the player can use the passages hidden behind extracted houses", () => {
  const behindHousePoints = [
    [250, 400],
    [500, 180],
    [1050, 180],
    [1400, 420],
    [450, 690],
    [1080, 680],
    [1460, 700],
  ];
  for (const [x, y] of behindHousePoints) {
    assert.equal(isWalkableAt(map, x, y), true, `${x},${y} should be a behind-house passage`);
    assert.equal(collides(playerAtFoot(x, y), map, HERO), false, `${x},${y} should fit the hero`);
  }
});

test("foreground house files align with the full town canvas", async () => {
  assert.equal(foreground.length, 9);
  for (const object of foreground) {
    assert.equal(object.category, "house");
    assert.ok(Number.isFinite(object.depthY));
    const png = await readFile(new URL(`../assets/maps/foreground/${object.file}`, import.meta.url));
    assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
    assert.equal(png.readUInt32BE(16), map.width);
    assert.equal(png.readUInt32BE(20), map.height);
    assert.equal(png[25], 6, `${object.file} must be RGBA`);
  }
});

test("foreground depth changes only when the player's feet cross the object", () => {
  const object = foreground[0];
  const behind = playerAtFoot(250, object.depthY - 10);
  const inFront = playerAtFoot(250, object.depthY + 10);
  assert.equal(shouldDrawInFront(object.depthY, playerDepth(behind, HERO)), true);
  assert.equal(shouldDrawInFront(object.depthY, playerDepth(inFront, HERO)), false);
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

test("movement stops before a house foundation and before the waterline", () => {
  const behindHouse = playerAtFoot(250, 480);
  const againstFoundation = movePlayer(behindHouse, { x: 0, y: 100 }, 1, map, HERO);
  assert.ok(againstFoundation.y + HERO.height < 510);
  assert.equal(collides(againstFoundation, map, HERO), false);

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
