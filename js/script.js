const canvas = document.getElementById("game");
const board = document.querySelector(".game-board");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = board.clientWidth;
  canvas.height = board.clientHeight;
}
resizeCanvas();
addEventListener("resize", resizeCanvas);

/* Background mapa */
const bg = new Image();
bg.src = "../map/part1.png";

/* Characters */
const CHARACTERS = {
  jason: {
    idle: "../characters/jason1.png",
    walk1: "../characters/jason2.png",
    walk2: "../characters/jason1.png",
    forwardOffset: Math.PI / 2,
  },
  lucia: {
    idle: "../characters/lucia1.png",
    walk1: "../characters/lucia2.png",
    walk2: "../characters/lucia1.png",
    forwardOffset: Math.PI / 2,
  },
};

const keys = new Set();
addEventListener("keydown", (e) => keys.add(e.key.toLowerCase()));
addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));

const player = {
  x: 0,
  y: 0,
  angle: 0,
  speed: 220,
  size: 120,
};

player.x = canvas.width / 2;
player.y = canvas.height / 2;

addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  player.angle = Math.atan2(my - player.y, mx - player.x);
});

function clampPlayer() {
  const half = player.size / 2;
  player.x = Math.max(half, Math.min(player.x, canvas.width - half));
  player.y = Math.max(half, Math.min(player.y, canvas.height - half));
}

let animT = 0;
let walkFrame = 0;
const WALK_FPS = 8;

let imgIdle, imgWalk1, imgWalk2;
let SPRITE_FORWARD_OFFSET = 0;

function loadCharacterSprites(charKey) {
  const c = CHARACTERS[charKey];
  SPRITE_FORWARD_OFFSET = c.forwardOffset;

  imgIdle = new Image();
  imgIdle.src = c.idle;

  imgWalk1 = new Image();
  imgWalk1.src = c.walk1;

  imgWalk2 = new Image();
  imgWalk2.src = c.walk2;

  return new Promise((resolve) => {
    let count = 0;
    const done = () => {
      count++;
      if (count === 3) resolve();
    };
    imgIdle.onload = done;
    imgWalk1.onload = done;
    imgWalk2.onload = done;
  });
}

let started = false;
let last = performance.now();

function loop(now) {
  const dt = (now - last) / 1000;
  last = now;

  const walking = keys.has("w");

  if (walking) {
    player.x += Math.cos(player.angle) * player.speed * dt;
    player.y += Math.sin(player.angle) * player.speed * dt;

    animT += dt;
    if (animT >= 1 / WALK_FPS) {
      animT = 0;
      walkFrame = 1 - walkFrame;
    }
  } else {
    animT = 0;
    walkFrame = 0;
  }

  clampPlayer();

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

  const img = walking ? (walkFrame === 0 ? imgWalk1 : imgWalk2) : imgIdle;

  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.rotate(player.angle + SPRITE_FORWARD_OFFSET);
  ctx.drawImage(
    img,
    -player.size / 2,
    -player.size / 2,
    player.size,
    player.size,
  );
  ctx.restore();

  requestAnimationFrame(loop);
}

const overlay = document.getElementById("charSelect");

function startGame(charKey) {
  if (started) return;
  started = true;

  loadCharacterSprites(charKey).then(() => {
    overlay.style.display = "none";
    last = performance.now();
    requestAnimationFrame(loop);
  });
}

overlay.addEventListener("click", (e) => {
  const btn = e.target.closest(".choice");
  if (!btn) return;
  startGame(btn.dataset.char);
});

bg.onload = () => {};
