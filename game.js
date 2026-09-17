// --- إدارة الشخصيات الست وصورها ---
const characters = [
  {
    id: "me",
    name: "شخصيتي",
    price: 0,
    unlocked: true,
    avatarSrc: "my_avatar.png",
    runSrc: "player_run.png",
  },
  {
    id: "hatlawi",
    name: "الحطلاوي",
    price: 20,
    unlocked: false,
    avatarSrc: "hatlawi_avatar.png",
    runSrc: "hatlawi_run.png",
  },
  {
    id: "shaker",
    name: "عمشاكر",
    price: 40,
    unlocked: false,
    avatarSrc: "shaker_avatar.png",
    runSrc: "shaker_run.png",
  },
  {
    id: "aboujej",
    name: "أبوالجيج",
    price: 60,
    unlocked: false,
    avatarSrc: "aboujej_avatar.png",
    runSrc: "aboujej_run.png",
  },
  {
    id: "divon",
    name: "ديفون",
    price: 90,
    unlocked: false,
    avatarSrc: "divon_avatar.png",
    runSrc: "divon_run.png",
  },
  {
    id: "fais",
    name: "فيص",
    price: 120,
    unlocked: false,
    avatarSrc: "fais_avatar.png",
    runSrc: "fais_run.png",
  },
];

let savedUnlocks = JSON.parse(localStorage.getItem("my_game_unlocked")) || [
  "me",
];
characters.forEach((c) => {
  if (savedUnlocks.includes(c.id)) c.unlocked = true;
});

let savedActiveId = localStorage.getItem("my_game_active_char") || "me";
let activeCharacter =
  characters.find((c) => c.id === savedActiveId && c.unlocked) || characters[0];

const imgCurrentRun = new Image();
imgCurrentRun.src = activeCharacter.runSrc;

const imgCrash = new Image();
imgCrash.src = "player_crash.png";

let playerState = "run";

let totalUC = parseInt(localStorage.getItem("my_game_uc")) || 0;
let highScore = parseInt(localStorage.getItem("my_game_high_score")) || 0;

// عناصر الواجهة
const menuScreen = document.getElementById("main-menu");
const gameScreen = document.getElementById("game-screen");
const shopScreen = document.getElementById("shop-screen");
const gameOverScreen = document.getElementById("game-over-screen");
const pauseModal = document.getElementById("pause-modal");
const countdownOverlay = document.getElementById("countdown-overlay");
const countdownNumber = document.getElementById("countdown-number");
const toast = document.getElementById("toast");

const menuUCText = document.getElementById("menu-uc-count");
const gameUCText = document.getElementById("game-uc-count");
const shopUCText = document.getElementById("shop-uc-count");
const overUCText = document.getElementById("over-uc-count");
const bestScoreText = document.getElementById("best-score");
const currentScoreText = document.getElementById("current-score");
const finalScoreText = document.getElementById("final-score");

function updateUI() {
  menuUCText.textContent = totalUC;
  shopUCText.textContent = totalUC;
  overUCText.textContent = totalUC;
  bestScoreText.textContent = highScore;
  localStorage.setItem("my_game_uc", totalUC);
}
updateUI();

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 2500);
}

function showScreen(screen) {
  [menuScreen, gameScreen, shopScreen, gameOverScreen].forEach((s) =>
    s.classList.add("hidden"),
  );
  screen.classList.remove("hidden");
}

// أزرار التنقل
document.getElementById("btn-open-shop").onclick = () => {
  renderShop();
  showScreen(shopScreen);
};
document.getElementById("btn-close-shop").onclick = () =>
  showScreen(menuScreen);
document.getElementById("btn-start").onclick = () => startGame();
document.getElementById("btn-restart").onclick = () => startGame();
document.getElementById("btn-home").onclick = () => showScreen(menuScreen);
document.getElementById("btn-shop-from-over").onclick = () => {
  renderShop();
  showScreen(shopScreen);
};

// إيقاف واستئناف
document.getElementById("btn-pause").onclick = pauseGame;
document.getElementById("btn-resume").onclick = startResumeCountdown;
document.getElementById("btn-pause-home").onclick = () => {
  isPaused = false;
  isPlaying = false;
  pauseModal.classList.add("hidden");
  showScreen(menuScreen);
};

// بناء المتجر
function renderShop() {
  const grid = document.getElementById("characters-grid");
  grid.innerHTML = "";
  characters.forEach((char) => {
    const card = document.createElement("div");
    card.className = `char-card ${char.unlocked ? "" : "locked"}`;

    let statusHtml = "";
    let btnHtml = "";

    if (char.unlocked) {
      statusHtml = '<span class="badge badge-owned">مملوكة</span>';
      if (activeCharacter.id === char.id) {
        btnHtml =
          '<button class="game-btn btn-sm btn-gray" disabled>مُحدد</button>';
      } else {
        btnHtml = `<button class="game-btn btn-sm btn-blue" onclick="selectChar('${char.id}')">اختيار</button>`;
      }
    } else {
      statusHtml = `<span class="badge badge-price">${char.price} UC</span>`;
      btnHtml = `<button class="game-btn btn-sm btn-green" onclick="buyChar('${char.id}')">شراء</button>`;
    }

    card.innerHTML = `
      <div class="avatar-frame">
        <img src="${char.avatarSrc}" alt="${char.name}" class="avatar-img" onerror="this.src='player_run.png'">
      </div>
      <div class="card-title">${char.unlocked ? char.name : "؟؟؟"}</div>
      ${statusHtml}
      ${btnHtml}
    `;
    grid.appendChild(card);
  });
}

window.selectChar = function (id) {
  const found = characters.find((c) => c.id === id);
  if (found && found.unlocked) {
    activeCharacter = found;
    imgCurrentRun.src = activeCharacter.runSrc;
    localStorage.setItem("my_game_active_char", activeCharacter.id);
    renderShop();
    showToast(`تم اختيار: ${activeCharacter.name}`);
  }
};

window.buyChar = function (id) {
  const char = characters.find((c) => c.id === id);
  if (!char) return;

  if (totalUC >= char.price) {
    totalUC -= char.price;
    char.unlocked = true;
    savedUnlocks.push(char.id);
    localStorage.setItem("my_game_unlocked", JSON.stringify(savedUnlocks));

    activeCharacter = char;
    imgCurrentRun.src = activeCharacter.runSrc;
    localStorage.setItem("my_game_active_char", activeCharacter.id);

    updateUI();
    renderShop();
    showToast(`مبروك! أصبحت شخصية ${char.name} مملوكة.`);
  } else {
    showToast(`تحتاج ${char.price - totalUC} UC إضافية للشراء!`);
  }
};

// --- محرك الكانفاس (Canvas Engine) ---
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let isPlaying = false;
let isPaused = false;
let isCountingDown = false;
let score = 0;
let collectedUC = 0;
let frameCount = 0;

const BASE_SPEED = 5.0;
const MAX_SPEED = 9.5;
let gameSpeed = BASE_SPEED;

let obstacleTimer = 0;
let nextObstacleInterval = 110;

let logicalWidth = 360;
let logicalHeight = 640;

const player = {
  x: 50,
  y: 0,
  width: 58,
  height: 75,
  vy: 0,
  gravity: 0.65,
  jumpPower: -13,
  groundY: 0,
  isGrounded: false,
};

let obstacles = [];
let coins = [];

// دالة القياس المحمية (لا تفشل حتى لو كانت الشاشة مخفية)
function resizeCanvas() {
  const container = document.getElementById("game-container");
  const w =
    gameScreen.clientWidth || container.clientWidth || window.innerWidth || 360;
  const h =
    gameScreen.clientHeight ||
    container.clientHeight ||
    window.innerHeight ||
    640;

  logicalWidth = Math.min(w, 480);
  logicalHeight = h;

  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(logicalWidth * dpr);
  canvas.height = Math.floor(logicalHeight * dpr);

  ctx.resetTransform();
  ctx.scale(dpr, dpr);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  player.groundY = logicalHeight - 45 - player.height;
  if (player.isGrounded || !isPlaying) {
    player.y = player.groundY;
  }
}
window.addEventListener("resize", resizeCanvas);
window.addEventListener("orientationchange", () =>
  setTimeout(resizeCanvas, 150),
);

function jump() {
  if (player.isGrounded && isPlaying && !isPaused && !isCountingDown) {
    player.vy = player.jumpPower;
    player.isGrounded = false;
    playerState = "jump";
  }
}

window.addEventListener("keydown", (e) => {
  if (e.code === "Space") jump();
});
canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  jump();
});
canvas.addEventListener("mousedown", jump);

function startGame() {
  // إظهار شاشة اللعبة أولاً حتى تأخذ أبعاداً صحيحة
  showScreen(gameScreen);
  resizeCanvas();

  isPlaying = true;
  isPaused = false;
  isCountingDown = false;
  score = 0;
  collectedUC = 0;
  obstacles = [];
  coins = [];
  gameSpeed = BASE_SPEED;
  frameCount = 0;
  obstacleTimer = 0;
  nextObstacleInterval = 110;
  playerState = "run";
  player.y = player.groundY;
  player.vy = 0;
  player.isGrounded = true;

  imgCurrentRun.src = activeCharacter.runSrc;

  pauseModal.classList.add("hidden");
  countdownOverlay.classList.add("hidden");
  requestAnimationFrame(gameLoop);
}

function pauseGame() {
  if (!isPlaying || isPaused || isCountingDown) return;
  isPaused = true;
  pauseModal.classList.remove("hidden");
}

function startResumeCountdown() {
  pauseModal.classList.add("hidden");
  isCountingDown = true;
  countdownOverlay.classList.remove("hidden");

  let counter = 3;
  countdownNumber.textContent = counter;

  const timer = setInterval(() => {
    counter--;
    if (counter > 0) {
      countdownNumber.textContent = counter;
    } else {
      clearInterval(timer);
      countdownOverlay.classList.add("hidden");
      isCountingDown = false;
      isPaused = false;
      requestAnimationFrame(gameLoop);
    }
  }, 1000);
}

function gameOver() {
  isPlaying = false;
  playerState = "crash";
  totalUC += collectedUC;
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("my_game_high_score", highScore);
  }
  updateUI();
  finalScoreText.textContent = score;
  showScreen(gameOverScreen);
}

// رسم الصناديق والبراميل
function drawCrate(ctx, x, y, size) {
  ctx.fillStyle = "#8B5A2B";
  ctx.fillRect(x, y, size, size);
  ctx.strokeStyle = "#5C3A1E";
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, size, size);

  ctx.fillStyle = "#A06834";
  ctx.fillRect(x + 5, y + 5, size - 10, size - 10);

  ctx.strokeStyle = "#5C3A1E";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + 5, y + 5);
  ctx.lineTo(x + size - 5, y + size - 5);
  ctx.moveTo(x + size - 5, y + 5);
  ctx.lineTo(x + 5, y + size - 5);
  ctx.stroke();
}

function drawBarrel(ctx, x, y, width, height) {
  ctx.fillStyle = "#2d5a27";
  ctx.fillRect(x, y, width, height);

  ctx.strokeStyle = "#1b3817";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, height);

  ctx.fillStyle = "#1e3d1a";
  ctx.fillRect(x, y, width, 5);
  ctx.fillRect(x, y + height - 5, width, 5);
  ctx.fillRect(x, y + Math.floor(height * 0.35), width, 4);
  ctx.fillRect(x, y + Math.floor(height * 0.65), width, 4);
}

// رسم الـ UC الدوارة
function drawRotatingCoin(ctx, x, y, radius, angle) {
  const scaleX = Math.cos(angle);
  if (Math.abs(scaleX) < 0.05) return;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scaleX, 1);

  const grad = ctx.createLinearGradient(-radius, -radius, radius, radius);
  grad.addColorStop(0, "#fff3a8");
  grad.addColorStop(0.45, "#f1c40f");
  grad.addColorStop(1, "#d35400");

  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.lineWidth = 2.2;
  ctx.strokeStyle = "#b78a00";
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, radius - 3.5, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.fillStyle = "#8e5b00";
  ctx.font = `900 ${Math.floor(radius * 0.85)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("UC", 0, 1);

  ctx.restore();
}

// حلقة اللعبة الأساسية
function gameLoop() {
  if (!isPlaying || isPaused || isCountingDown) return;

  frameCount++;
  obstacleTimer++;

  if (frameCount % 5 === 0) score++;
  currentScoreText.textContent = score;
  gameUCText.textContent = collectedUC;

  gameSpeed = Math.min(MAX_SPEED, BASE_SPEED + score * 0.004);

  // فيزياء الحركة
  player.vy += player.gravity;
  player.y += player.vy;

  if (player.y >= player.groundY) {
    player.y = player.groundY;
    player.vy = 0;
    player.isGrounded = true;
    playerState = "run";
  } else {
    playerState = "jump";
  }

  const groundTop = logicalHeight - 45;

  // توليد العوائق
  if (obstacleTimer >= nextObstacleInterval) {
    obstacleTimer = 0;
    const isBox = Math.random() > 0.5;
    const w = isBox ? 42 : 32;
    const h = isBox ? 42 : 50;

    obstacles.push({
      x: logicalWidth + 20,
      y: groundTop - h,
      width: w,
      height: h,
      type: isBox ? "crate" : "barrel",
    });

    const speedRatio = (gameSpeed - BASE_SPEED) / (MAX_SPEED - BASE_SPEED);
    const minFrames = 55;
    const maxFrames = Math.max(
      minFrames + 15,
      Math.floor(115 - speedRatio * 45),
    );
    nextObstacleInterval =
      Math.floor(Math.random() * (maxFrames - minFrames + 1)) + minFrames;
  }

  // توليد العملات
  if (frameCount % 85 === 0) {
    coins.push({
      x: logicalWidth + 20,
      y: groundTop - 65 - Math.random() * 35,
      radius: 14,
      angle: Math.random() * Math.PI,
    });
  }

  // حركة العوائق وفحص الاصطدام
  for (let i = obstacles.length - 1; i >= 0; i--) {
    let obs = obstacles[i];
    obs.x -= gameSpeed;

    const pad = 6;
    if (
      player.x + pad < obs.x + obs.width &&
      player.x + player.width - pad > obs.x &&
      player.y + pad < obs.y + obs.height &&
      player.y + player.height > obs.y
    ) {
      gameOver();
      return;
    }

    if (obs.x + obs.width < -20) obstacles.splice(i, 1);
  }

  // جمع العملات
  for (let i = coins.length - 1; i >= 0; i--) {
    let c = coins[i];
    c.x -= gameSpeed;

    if (
      player.x < c.x + c.radius &&
      player.x + player.width > c.x - c.radius &&
      player.y < c.y + c.radius &&
      player.y + player.height > c.y - c.radius
    ) {
      collectedUC++;
      coins.splice(i, 1);
      continue;
    }

    if (c.x + c.radius < -20) coins.splice(i, 1);
  }

  // مسح الشاشة
  ctx.clearRect(0, 0, logicalWidth, logicalHeight);

  // رسم الأرضية
  ctx.fillStyle = "#c89558";
  ctx.fillRect(0, groundTop, logicalWidth, 45);
  ctx.fillStyle = "#a67238";
  ctx.fillRect(0, groundTop, logicalWidth, 6);

  // رسم العوائق
  obstacles.forEach((obs) => {
    if (obs.type === "crate") {
      drawCrate(ctx, obs.x, obs.y, obs.width);
    } else {
      drawBarrel(ctx, obs.x, obs.y, obs.width, obs.height);
    }
  });

  // رسم العملات
  coins.forEach((c) => {
    c.angle += 0.08;
    drawRotatingCoin(ctx, c.x, c.y, c.radius, c.angle);
  });

  // خطوات الركض
  let runOffsetY = 0;
  let runRotation = 0;

  if (player.isGrounded && playerState === "run") {
    const runFreq = 0.35 + (gameSpeed - BASE_SPEED) * 0.03;
    runOffsetY = Math.sin(frameCount * runFreq) * 3.5;
    runRotation = Math.cos(frameCount * runFreq) * 0.035;
  }

  // رسم الشخصية
  const isImageReady =
    imgCurrentRun.complete && imgCurrentRun.naturalWidth !== 0;

  if (isImageReady) {
    ctx.save();
    ctx.translate(
      Math.round(player.x + player.width / 2),
      Math.round(player.y + player.height / 2 + runOffsetY),
    );

    if (playerState === "jump") {
      ctx.rotate((-15 * Math.PI) / 180);
      ctx.drawImage(
        imgCurrentRun,
        -player.width / 2,
        -player.height / 2,
        player.width,
        player.height,
      );
    } else if (playerState === "crash") {
      ctx.drawImage(
        imgCrash,
        -player.width / 2,
        -player.height / 2,
        player.width,
        player.height,
      );
    } else {
      ctx.rotate(runRotation);
      ctx.drawImage(
        imgCurrentRun,
        -player.width / 2,
        -player.height / 2,
        player.width,
        player.height,
      );
    }
    ctx.restore();
  } else {
    ctx.fillStyle = "#e74c3c";
    ctx.fillRect(player.x, player.y + runOffsetY, player.width, player.height);
  }

  requestAnimationFrame(gameLoop);
}
