import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const map = JSON.parse(await readFile(new URL("../assets/maps/meadow.json", import.meta.url), "utf8"));

test("field map is rectangular and uses only documented tile types", () => {
  assert.ok(map.rows.length > 0);
  assert.ok(map.rows.every((row) => row.length === map.width));
  const knownTiles = new Set(["g", "p", "w", "t", "r", "f", "h"]);
  assert.ok(map.rows.every((row) => [...row].every((tile) => knownTiles.has(tile))));
});

test("spawn is walkable and the map boundary is solid", () => {
  assert.equal(map.solidTiles.includes(map.rows[map.spawn.row][map.spawn.column]), false);
  const boundary = [
    ...map.rows[0],
    ...map.rows.at(-1),
    ...map.rows.map((row) => row[0]),
    ...map.rows.map((row) => row.at(-1)),
  ];
  assert.ok(boundary.every((tile) => map.solidTiles.includes(tile)));
});
