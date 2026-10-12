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
  if (map.walkable) {
    return ![
      [box.x, box.y],
      [box.x + box.width - EPSILON, box.y],
      [box.x, box.y + box.height - EPSILON],
      [box.x + box.width - EPSILON, box.y + box.height - EPSILON],
    ].every(([x, y]) => isWalkableAt(map, x, y));
  }
  return isSolidAt(map, box.x, box.y)
    || isSolidAt(map, box.x + box.width - EPSILON, box.y)
    || isSolidAt(map, box.x, box.y + box.height - EPSILON)
    || isSolidAt(map, box.x + box.width - EPSILON, box.y + box.height - EPSILON);
}

export function movePlayer(player, velocity, deltaSeconds, map, heroConfig) {
  const next = { ...player };
  const deltaX = velocity.x * deltaSeconds;
  const deltaY = velocity.y * deltaSeconds;
  const collisionStep = (map.tileSize ?? 48) / 3;
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(deltaX), Math.abs(deltaY)) / collisionStep));
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
  const mapWidth = map.background ? map.width : map.width * map.tileSize;
  const mapHeight = map.background ? map.height : map.rows.length * map.tileSize;
  const box = getCollider(player, heroConfig);
  const desiredX = box.x + box.width / 2 - viewport.width / 2;
  const desiredY = box.y + box.height / 2 - viewport.height / 2;
  return {
    x: clamp(desiredX, 0, Math.max(0, mapWidth - viewport.width)),
    y: clamp(desiredY, 0, Math.max(0, mapHeight - viewport.height)),
  };
}

export function isWalkableAt(map, x, y) {
  if (x < 0 || y < 0 || x >= map.width || y >= map.height) return false;
  const insideWalkable = map.walkable.rectangles.some((shape) => pointInRectangle(x, y, shape))
    || map.walkable.ellipses.some((shape) => pointInEllipse(x, y, shape));
  if (!insideWalkable) return false;
  const insideBlocker = map.blocked.rectangles.some((shape) => pointInRectangle(x, y, shape))
    || map.blocked.ellipses.some((shape) => pointInEllipse(x, y, shape));
  return !insideBlocker;
}

function pointInRectangle(x, y, shape) {
  return x >= shape.x && y >= shape.y
    && x < shape.x + shape.width && y < shape.y + shape.height;
}

function pointInEllipse(x, y, shape) {
  const normalizedX = (x - shape.centerX) / shape.radiusX;
  const normalizedY = (y - shape.centerY) / shape.radiusY;
  return normalizedX * normalizedX + normalizedY * normalizedY <= 1;
}

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}
