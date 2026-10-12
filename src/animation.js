export function getAnimationFrame(moving, elapsedSeconds, spriteConfig) {
  if (!moving) return spriteConfig.idleFrame;
  const framePosition = elapsedSeconds * spriteConfig.framesPerSecond;
  const sequenceIndex = Math.floor(framePosition) % spriteConfig.animation.length;
  return spriteConfig.animation[sequenceIndex];
}
