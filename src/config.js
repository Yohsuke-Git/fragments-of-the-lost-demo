export const VIEWPORT = Object.freeze({ width: 960, height: 540 });

export const HERO = Object.freeze({
  speed: 190,
  width: 48,
  height: 64,
  collider: Object.freeze({ offsetX: 11, offsetY: 42, width: 26, height: 18 }),
});

export const HERO_SPRITE = Object.freeze({
  url: "assets/characters/hero/placeholder-spritesheet.svg",
  frameWidth: 48,
  frameHeight: 64,
  framesPerRow: 3,
  animation: Object.freeze([0, 1, 2, 1]),
  framesPerSecond: 8,
  directionRow: Object.freeze({ down: 0, left: 1, right: 2, up: 3 }),
});
