export const VIEWPORT = Object.freeze({ width: 960, height: 540 });

export const HERO = Object.freeze({
  speed: 70,
  width: 52,
  height: 52,
  collider: Object.freeze({ offsetX: 18, offsetY: 43, width: 16, height: 8 }),
});

export const HERO_SPRITE = Object.freeze({
  url: "assets/characters/hero/hero-walk-8x4.png",
  frameWidth: 256,
  frameHeight: 256,
  framesPerRow: 8,
  idleFrame: 2,
  animation: Object.freeze([0, 1, 2, 3, 4, 5, 6, 7]),
  framesPerSecond: 5,
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
