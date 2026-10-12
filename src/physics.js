const EPSILON = 0.0001;

export function velocityFromInput(input, speed) {
  const horizontal = Number(Boolean(input.right)) - Number(Boolean(input.left));
  const vertical = Number(Boolean(input.down)) - Number(Boolean(input.up));
  const length = Math.hypot(horizontal, vertical);
  if (length === 0) return { x: 0, y: 0 };
  return { x: horizontal / length * speed, y: vertical / length * speed };
}

export function directionFromVelocity(velocity) {
  if (velocity.x !== 0 && velocity.y !== 0) return velocity.x > 0 ? "right" : "left";
  if (Math.abs(velocity.x) > Math.abs(velocity.y)) return velocity.x > 0 ? "right" : "left";
  return velocity.y > 0 ? "down" : "up";
}

export function getCollider(player, heroConfig) {
  const box = heroConfig.collider;
  return {
    x: player.x + box.offsetX,
    y: player.y + box.offsetY,
    width: box.width,
    height: box.height,
  };
}

export function isSolidAt(map, pixelX, pixelY) {
  const column = Math.floor(pixelX / map.tileSize);
  const row = Math.floor(pixelY / map.tileSize);
  if (row < 0 || column < 0 || row >= map.rows.length || column >= map.width) return true;
  return map.solidTiles.includes(map.rows[row][column]);
}

export function collides(player, map, heroConfig) {
  const box = getCollider(player, heroConfig);
  return isSolidAt(map, box.x, box.y)
    || isSolidAt(map, box.x + box.width - EPSILON, box.y)
    || isSolidAt(map, box.x, box.y + box.height - EPSILON)
    || isSolidAt(map, box.x + box.width - EPSILON, box.y + box.height - EPSILON);
}

export function movePlayer(player, velocity, deltaSeconds, map, heroConfig) {
  const next = { ...player };
  const deltaX = velocity.x * deltaSeconds;
  const deltaY = velocity.y * deltaSeconds;
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(deltaX), Math.abs(deltaY)) / (map.tileSize / 3)));
  for (let step = 0; step < steps; step += 1) {
    const previousX = next.x;
    next.x += deltaX / steps;
    if (collides(next, map, heroConfig)) next.x = previousX;

    const previousY = next.y;
    next.y += deltaY / steps;
    if (collides(next, map, heroConfig)) next.y = previousY;
  }
  return next;
}

export function cameraFor(player, map, viewport, heroConfig) {
  const mapWidth = map.width * map.tileSize;
  const mapHeight = map.rows.length * map.tileSize;
  const box = getCollider(player, heroConfig);
  const desiredX = box.x + box.width / 2 - viewport.width / 2;
  const desiredY = box.y + box.height / 2 - viewport.height / 2;
  return {
    x: clamp(desiredX, 0, Math.max(0, mapWidth - viewport.width)),
    y: clamp(desiredY, 0, Math.max(0, mapHeight - viewport.height)),
  };
}

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}
