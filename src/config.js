export const VIEWPORT = Object.freeze({ width: 960, height: 540 });

export const HERO = Object.freeze({
  speed: 150,
  width: 52,
  height: 52,
  collider: Object.freeze({ offsetX: 18, offsetY: 43, width: 16, height: 8 }),
});

export const HERO_SPRITE = Object.freeze({
  url: "assets/characters/hero/hero-walk-6x4.png",
  frameWidth: 256,
  frameHeight: 256,
  framesPerRow: 6,
  idleFrame: 2,
  animation: Object.freeze([0, 1, 2, 3, 4, 5]),
  framesPerSecond: 10,
  // The authored left row does not alternate its limbs. Mirror the correct
  // right-facing cycle so both horizontal directions have a true walk loop.
  directionRow: Object.freeze({ down: 0, left: 2, right: 2, up: 3 }),
  directionFlipX: Object.freeze({ down: false, left: true, right: false, up: false }),
  directionOffsetY: Object.freeze({ down: 0, left: 0, right: 0, up: 0 }),
  blendStart: Object.freeze({ down: 0, left: 0.35, right: 0.35, up: 0.7 }),
  sourceInsets: Object.freeze({
    down: Object.freeze({ top: 0, right: 0, bottom: 0, left: 0 }),
    left: Object.freeze({ top: 1, right: 0, bottom: 0, left: 0 }),
    right: Object.freeze({ top: 1, right: 0, bottom: 0, left: 0 }),
    up: Object.freeze({ top: 0, right: 0, bottom: 0, left: 0 }),
  }),
});
