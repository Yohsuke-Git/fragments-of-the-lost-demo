import { HERO, HERO_SPRITE, VIEWPORT } from "./config.js";
import { getAnimationFrame } from "./animation.js";
import { cameraFor, movePlayer, velocityFromInput } from "./physics.js";

const canvas = document.querySelector("#game");
const context = canvas.getContext("2d");
const loading = document.querySelector("#loading");
const status = document.querySelector("#status");
const input = { up: false, down: false, left: false, right: false };
const keyDirections = new Map([
  ["ArrowUp", "up"], ["KeyW", "up"],
  ["ArrowDown", "down"], ["KeyS", "down"],
  ["ArrowLeft", "left"], ["KeyA", "left"],
  ["ArrowRight", "right"], ["KeyD", "right"],
]);

canvas.width = VIEWPORT.width;
canvas.height = VIEWPORT.height;
context.imageSmoothingEnabled = false;

let map;
let heroImage;
let player;
let camera = { x: 0, y: 0 };
let elapsed = 0;
let lastFrameTime = 0;

window.addEventListener("keydown", (event) => setDirection(event, true));
window.addEventListener("keyup", (event) => setDirection(event, false));
window.addEventListener("blur", clearInput);
canvas.addEventListener("pointerdown", () => canvas.focus());

function setDirection(event, pressed) {
  const direction = keyDirections.get(event.code);
  if (!direction) return;
  event.preventDefault();
  input[direction] = pressed;
}

function clearInput() {
  for (const direction of Object.keys(input)) input[direction] = false;
}

async function load() {
  const [mapResponse, image] = await Promise.all([
    fetch("assets/maps/meadow.json"),
    loadImage(HERO_SPRITE.url),
  ]);
  if (!mapResponse.ok) throw new Error(`マップを読み込めませんでした (${mapResponse.status})`);
  map = await mapResponse.json();
  validateMap(map);
  heroImage = image;
  player = {
    x: map.spawn.column * map.tileSize + (map.tileSize - HERO.width) / 2,
    y: (map.spawn.row + 1) * map.tileSize - HERO.height,
    direction: "down",
    moving: false,
  };
  camera = cameraFor(player, map, VIEWPORT, HERO);

  window.__fieldDemo = {
    snapshot: () => ({
      ready: true,
      player: { ...player },
      camera: { ...camera },
      animationFrame: getAnimationFrame(player.moving, elapsed, HERO_SPRITE),
      map: { name: map.name, width: map.width, height: map.rows.length, tileSize: map.tileSize },
    }),
  };
  loading.classList.add("hidden");
  status.textContent = `${map.name} — 移動できます`;
  canvas.focus();
  requestAnimationFrame(frame);
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image), { once: true });
    image.addEventListener("error", () => reject(new Error(`画像を読み込めませんでした: ${url}`)), { once: true });
    image.src = url;
  });
}

function validateMap(value) {
  if (!Array.isArray(value.rows) || value.rows.length === 0) throw new Error("マップ行がありません");
  if (value.rows.some((row) => row.length !== value.width)) throw new Error("マップの行幅が一致しません");
  const spawnTile = value.rows[value.spawn.row]?.[value.spawn.column];
  if (!spawnTile || value.solidTiles.includes(spawnTile)) throw new Error("開始位置が不正です");
}

function frame(timestamp) {
  const delta = Math.min((timestamp - lastFrameTime) / 1000 || 0, 0.05);
  lastFrameTime = timestamp;
  elapsed += delta;
  update(delta);
  render();
  requestAnimationFrame(frame);
}

function update(delta) {
  const velocity = velocityFromInput(input, HERO.speed);
  player.moving = velocity.x !== 0 || velocity.y !== 0;
  if (player.moving) {
    if (Math.abs(velocity.x) > Math.abs(velocity.y)) player.direction = velocity.x > 0 ? "right" : "left";
    else player.direction = velocity.y > 0 ? "down" : "up";
    Object.assign(player, movePlayer(player, velocity, delta, map, HERO));
  }
  camera = cameraFor(player, map, VIEWPORT, HERO);
}

function render() {
  context.clearRect(0, 0, VIEWPORT.width, VIEWPORT.height);
  const tileSize = map.tileSize;
  const firstColumn = Math.max(0, Math.floor(camera.x / tileSize) - 1);
  const lastColumn = Math.min(map.width, Math.ceil((camera.x + VIEWPORT.width) / tileSize) + 1);
  const firstRow = Math.max(0, Math.floor(camera.y / tileSize) - 2);
  const lastRow = Math.min(map.rows.length, Math.ceil((camera.y + VIEWPORT.height) / tileSize) + 2);
  const drawables = [];

  for (let row = firstRow; row < lastRow; row += 1) {
    for (let column = firstColumn; column < lastColumn; column += 1) {
      const tile = map.rows[row][column];
      drawGround(tile, column, row, tileSize);
      if ("trfh".includes(tile)) {
        drawables.push({ type: tile, column, row, depth: (row + 1) * tileSize });
      }
    }
  }

  drawables.push({ type: "hero", depth: player.y + HERO.height - 4 });
  drawables.sort((a, b) => a.depth - b.depth);
  for (const drawable of drawables) {
    if (drawable.type === "hero") drawHero();
    else drawObject(drawable.type, drawable.column, drawable.row, tileSize);
  }

  const shade = context.createRadialGradient(
    VIEWPORT.width / 2, VIEWPORT.height / 2, VIEWPORT.height * 0.25,
    VIEWPORT.width / 2, VIEWPORT.height / 2, VIEWPORT.width * 0.72,
  );
  shade.addColorStop(0, "rgba(3, 10, 6, 0)");
  shade.addColorStop(1, "rgba(3, 10, 6, .28)");
  context.fillStyle = shade;
  context.fillRect(0, 0, VIEWPORT.width, VIEWPORT.height);
}

function screenPosition(column, row, tileSize) {
  return { x: Math.round(column * tileSize - camera.x), y: Math.round(row * tileSize - camera.y) };
}

function drawGround(tile, column, row, size) {
  const { x, y } = screenPosition(column, row, size);
  const variation = (column * 17 + row * 31) % 5;
  if (tile === "w") {
    context.fillStyle = variation % 2 ? "#315e66" : "#356a70";
    context.fillRect(x, y, size + 1, size + 1);
    context.strokeStyle = "rgba(165, 211, 197, .25)";
    context.lineWidth = 2;
    const wave = Math.sin(elapsed * 1.8 + column + row) * 3;
    context.beginPath();
    context.moveTo(x + 7, y + 16 + wave);
    context.quadraticCurveTo(x + 18, y + 12 - wave, x + 30, y + 16 + wave);
    context.stroke();
    return;
  }

  context.fillStyle = variation < 2 ? "#648457" : "#6a8a5c";
  context.fillRect(x, y, size + 1, size + 1);
  context.fillStyle = "rgba(199, 210, 137, .16)";
  context.fillRect(x + 8 + variation * 6, y + 10 + variation * 5, 2, 7);

  if (tile === "p") {
    context.fillStyle = variation % 2 ? "#a58b65" : "#a99069";
    context.fillRect(x, y, size + 1, size + 1);
    context.fillStyle = "rgba(80, 62, 43, .13)";
    context.fillRect(x + 8 + variation * 5, y + 12, 4, 3);
    context.fillRect(x + 28, y + 33 - variation * 2, 3, 2);
  }
}

function drawObject(type, column, row, size) {
  const { x, y } = screenPosition(column, row, size);
  if (type === "t") {
    context.fillStyle = "#503b2a";
    context.fillRect(x + 20, y + 27, 9, 24);
    context.fillStyle = "rgba(13, 33, 21, .28)";
    context.beginPath(); context.ellipse(x + 25, y + 47, 21, 7, 0, 0, Math.PI * 2); context.fill();
    context.fillStyle = "#254f38";
    context.beginPath(); context.arc(x + 25, y + 21, 22, 0, Math.PI * 2); context.fill();
    context.fillStyle = "#3f6946";
    context.beginPath(); context.arc(x + 18, y + 14, 14, 0, Math.PI * 2); context.fill();
    return;
  }
  if (type === "r") {
    context.fillStyle = "rgba(20, 31, 24, .25)";
    context.beginPath(); context.ellipse(x + 25, y + 41, 19, 7, 0, 0, Math.PI * 2); context.fill();
    context.fillStyle = "#73766b";
    context.beginPath(); context.moveTo(x + 8, y + 39); context.lineTo(x + 13, y + 20); context.lineTo(x + 30, y + 13); context.lineTo(x + 42, y + 29); context.lineTo(x + 36, y + 42); context.closePath(); context.fill();
    context.strokeStyle = "#9a9a85"; context.lineWidth = 2; context.stroke();
    return;
  }
  if (type === "f") {
    context.fillStyle = "#6a4e32";
    context.fillRect(x, y + 20, size + 1, 7);
    context.fillRect(x, y + 35, size + 1, 6);
    context.fillStyle = "#84623e";
    context.fillRect(x + 6, y + 9, 7, 39);
    context.fillRect(x + 36, y + 9, 7, 39);
    return;
  }
  if (type === "h") {
    context.fillStyle = "#59483b";
    context.fillRect(x, y, size + 1, size + 1);
    context.fillStyle = "#76604c";
    context.fillRect(x + 3, y + 3, size - 6, 19);
    context.fillStyle = "#302d28";
    context.fillRect(x + 6, y + 28, size - 12, 20);
    context.strokeStyle = "rgba(212, 188, 142, .28)";
    context.strokeRect(x + .5, y + .5, size - 1, size - 1);
  }
}

function drawHero() {
  const row = HERO_SPRITE.directionRow[player.direction];
  const frame = getAnimationFrame(player.moving, elapsed, HERO_SPRITE);
  const x = Math.round(player.x - camera.x);
  const y = Math.round(player.y - camera.y);
  const inset = HERO_SPRITE.sourceInsets[player.direction];
  const scaleX = HERO.width / HERO_SPRITE.frameWidth;
  const scaleY = HERO.height / HERO_SPRITE.frameHeight;
  const destinationX = x + inset.left * scaleX;
  const destinationY = y + HERO_SPRITE.directionOffsetY[player.direction] + inset.top * scaleY;
  const destinationWidth = HERO.width - (inset.left + inset.right) * scaleX;
  const destinationHeight = HERO.height - (inset.top + inset.bottom) * scaleY;
  context.fillStyle = "rgba(16, 27, 20, .32)";
  context.beginPath();
  context.ellipse(x + HERO.width / 2, y + HERO.height - 4, 17, 6, 0, 0, Math.PI * 2);
  context.fill();
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  if (HERO_SPRITE.directionFlipX[player.direction]) {
    context.save();
    context.translate(destinationX + destinationWidth, 0);
    context.scale(-1, 1);
    context.drawImage(
      heroImage,
      frame * HERO_SPRITE.frameWidth + inset.left,
      row * HERO_SPRITE.frameHeight + inset.top,
      HERO_SPRITE.frameWidth - inset.left - inset.right,
      HERO_SPRITE.frameHeight - inset.top - inset.bottom,
      0,
      destinationY,
      destinationWidth,
      destinationHeight,
    );
    context.restore();
  } else {
    context.drawImage(
      heroImage,
      frame * HERO_SPRITE.frameWidth + inset.left,
      row * HERO_SPRITE.frameHeight + inset.top,
      HERO_SPRITE.frameWidth - inset.left - inset.right,
      HERO_SPRITE.frameHeight - inset.top - inset.bottom,
      destinationX,
      destinationY,
      destinationWidth,
      destinationHeight,
    );
  }
  context.imageSmoothingEnabled = false;
}

load().catch((error) => {
  console.error(error);
  loading.textContent = `読み込みエラー: ${error.message}`;
  status.textContent = "起動できませんでした";
});
