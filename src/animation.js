export function getAnimationFrame(moving, elapsedSeconds, spriteConfig) {
  if (!moving) return spriteConfig.idleFrame;
  const sequenceIndex = Math.floor(elapsedSeconds * spriteConfig.framesPerSecond)
    % spriteConfig.animation.length;
  return spriteConfig.animation[sequenceIndex];
}
