export function shouldDrawInFront(objectDepthY, playerDepthY) {
  return playerDepthY < objectDepthY;
}

export function playerDepth(player, heroConfig) {
  const collider = heroConfig.collider;
  return player.y + collider.offsetY + collider.height;
}
