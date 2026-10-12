import test from "node:test";
import assert from "node:assert/strict";
import { getAnimationFrame, getAnimationState } from "../src/animation.js";
import {
  cameraFor,
  collides,
  directionFromVelocity,
  movePlayer,
  velocityFromInput,
} from "../src/physics.js";

const hero = { width: 48, height: 64, collider: { offsetX: 11, offsetY: 42, width: 26, height: 18 } };
const map = {
  tileSize: 48,
  width: 5,
  solidTiles: ["w", "r"],
  rows: ["wwwww", "wgggw", "wgggw", "wgggw", "wwwww"],
};
const mapWithWall = { ...map, rows: ["wwwww", "wgrgw", "wgrgw", "wgrgw", "wwwww"] };
const sprite = { framesPerSecond: 10, idleFrame: 2, animation: [0, 1, 2, 3, 4, 5] };

test("walking animation cycles through six frames while idle uses its configured frame", () => {
  assert.equal(getAnimationFrame(false, 100, sprite), 2);
  assert.equal(getAnimationFrame(true, 0, sprite), 0);
  assert.equal(getAnimationFrame(true, 0.11, sprite), 1);
  assert.equal(getAnimationFrame(true, 0.21, sprite), 2);
  assert.equal(getAnimationFrame(true, 0.51, sprite), 5);
  assert.equal(getAnimationFrame(true, 0.61, sprite), 0);
});

test("walking animation smoothly blends each frame into the next", () => {
  assert.deepEqual(getAnimationState(false, 100, sprite), {
    currentFrame: 2,
    nextFrame: 2,
    progress: 0,
    blend: 0,
  });
  const transition = getAnimationState(true, 0.05, sprite);
  assert.equal(transition.currentFrame, 0);
  assert.equal(transition.nextFrame, 1);
  assert.equal(transition.blend, 0.5);
  const loop = getAnimationState(true, 0.59, sprite);
  assert.equal(loop.currentFrame, 5);
  assert.equal(loop.nextFrame, 0);
  assert.ok(loop.blend > 0.9);
});

test("diagonal movement preserves the configured speed", () => {
  const velocity = velocityFromInput({ up: true, right: true }, 190);
  assert.ok(Math.abs(Math.hypot(velocity.x, velocity.y) - 190) < 0.001);
  assert.ok(velocity.x > 0);
  assert.ok(velocity.y < 0);
});

test("diagonal movement uses the horizontal facing instead of front or back", () => {
  assert.equal(directionFromVelocity({ x: 1, y: 1 }), "right");
  assert.equal(directionFromVelocity({ x: -1, y: 1 }), "left");
  assert.equal(directionFromVelocity({ x: 1, y: -1 }), "right");
  assert.equal(directionFromVelocity({ x: -1, y: -1 }), "left");
  assert.equal(directionFromVelocity({ x: 0, y: 1 }), "down");
  assert.equal(directionFromVelocity({ x: 0, y: -1 }), "up");
});

test("player moves through open ground", () => {
  const player = { x: 48, y: 48 };
  const moved = movePlayer(player, { x: 30, y: 0 }, 0.5, map, hero);
  assert.equal(moved.x, 63);
  assert.equal(moved.y, 48);
});

test("player cannot pass through a solid tile", () => {
  const player = { x: 48, y: 48 };
  const moved = movePlayer(player, { x: 180, y: 0 }, 1, mapWithWall, hero);
  assert.ok(moved.x + hero.collider.offsetX + hero.collider.width <= 96);
  assert.equal(moved.y, 48);
  assert.equal(collides(moved, mapWithWall, hero), false);
});

test("axis-separated collision allows sliding along an obstacle", () => {
  const player = { x: 48, y: 48 };
  const moved = movePlayer(player, { x: 80, y: 24 }, 1, mapWithWall, hero);
  assert.ok(moved.x < 80);
  assert.ok(Math.abs(moved.y - 72) < 0.001);
});

test("camera follows the player and clamps to every map edge", () => {
  const viewport = { width: 100, height: 100 };
  assert.deepEqual(cameraFor({ x: 0, y: 0 }, map, viewport, hero), { x: 0, y: 1 });
  assert.deepEqual(cameraFor({ x: 500, y: 500 }, map, viewport, hero), { x: 140, y: 140 });
  assert.deepEqual(cameraFor({ x: 96, y: 96 }, map, viewport, hero), { x: 70, y: 97 });
});
