export function getAnimationFrame(moving, elapsedSeconds, spriteConfig) {
  if (!moving) return 1;
  const sequenceIndex = Math.floor(elapsedSeconds * spriteConfig.framesPerSecond)
    % spriteConfig.animation.length;
  return spriteConfig.animation[sequenceIndex];
}
