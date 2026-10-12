export const VIEWPORT = Object.freeze({ width: 960, height: 540 });

export const HERO = Object.freeze({
  speed: 190,
  width: 112,
  height: 112,
  collider: Object.freeze({ offsetX: 39, offsetY: 91, width: 34, height: 17 }),
});

export const HERO_SPRITE = Object.freeze({
  url: "assets/characters/hero/hero-walk-6x4.png",
  frameWidth: 256,
  frameHeight: 256,
  framesPerRow: 6,
  idleFrame: 2,
  animation: Object.freeze([0, 1, 2, 3, 4, 5]),
  framesPerSecond: 10,
  directionRow: Object.freeze({ down: 0, left: 1, right: 2, up: 3 }),
  directionFlipX: Object.freeze({ down: false, left: false, right: false, up: false }),
  directionOffsetY: Object.freeze({ down: 0, left: 0, right: 0, up: 0 }),
  sourceInsets: Object.freeze({
    down: Object.freeze({ top: 0, right: 0, bottom: 0, left: 0 }),
    left: Object.freeze({ top: 0, right: 0, bottom: 0, left: 0 }),
    right: Object.freeze({ top: 0, right: 0, bottom: 0, left: 0 }),
    up: Object.freeze({ top: 0, right: 0, bottom: 0, left: 0 }),
  }),
});
