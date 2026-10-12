export function getAnimationFrame(moving, elapsedSeconds, spriteConfig) {
  return getAnimationState(moving, elapsedSeconds, spriteConfig).currentFrame;
}

export function getAnimationState(moving, elapsedSeconds, spriteConfig) {
  if (!moving) {
    return {
      currentFrame: spriteConfig.idleFrame,
      nextFrame: spriteConfig.idleFrame,
      progress: 0,
      blend: 0,
    };
  }

  const framePosition = elapsedSeconds * spriteConfig.framesPerSecond;
  const sequenceIndex = Math.floor(framePosition) % spriteConfig.animation.length;
  const nextIndex = (sequenceIndex + 1) % spriteConfig.animation.length;
  const progress = framePosition - Math.floor(framePosition);
  const smoothProgress = progress * progress * (3 - 2 * progress);

  return {
    currentFrame: spriteConfig.animation[sequenceIndex],
    nextFrame: spriteConfig.animation[nextIndex],
    progress,
    blend: smoothProgress,
  };
}
