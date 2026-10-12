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
  directionRow: Object.freeze({ down: 0, left: 1, right: 2, up: 3 }),
});
