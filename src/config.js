export const VIEWPORT = Object.freeze({ width: 960, height: 540 });

export const HERO = Object.freeze({
  speed: 190,
  width: 112,
  height: 112,
  collider: Object.freeze({ offsetX: 39, offsetY: 91, width: 34, height: 17 }),
});

export const HERO_SPRITE = Object.freeze({
  url: "assets/characters/hero/主人公の歩行スプライトシート.png",
  frameWidth: 362,
  frameHeight: 362,
  framesPerRow: 3,
  animation: Object.freeze([0, 1, 2, 1]),
  framesPerSecond: 8,
  directionRow: Object.freeze({ down: 0, left: 2, right: 2, up: 3 }),
  directionFlipX: Object.freeze({ down: false, left: true, right: false, up: false }),
  directionOffsetY: Object.freeze({ down: 0, left: 7, right: 7, up: 11 }),
  sourceInsets: Object.freeze({
    down: Object.freeze({ top: 0, right: 0, bottom: 0, left: 0 }),
    left: Object.freeze({ top: 0, right: 0, bottom: 12, left: 0 }),
    right: Object.freeze({ top: 0, right: 0, bottom: 12, left: 0 }),
    up: Object.freeze({ top: 0, right: 0, bottom: 0, left: 0 }),
  }),
});
