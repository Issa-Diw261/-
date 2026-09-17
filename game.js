// ====================================================
// لعبة تجاكيل عفوية - النسخة v.1.0
// ====================================================

// --- مستويات الصوت ومحرك Web Audio API ---
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
let isMuted = localStorage.getItem("my_game_muted") === "true";

// مستويات الصوت المخزنة محلياً (0 إلى 1)
let sfxVolume = parseFloat(localStorage.getItem("my_game_sfx_vol")) || 0.7;
let voiceVolume = parseFloat(localStorage.getItem("my_game_voice_vol")) || 1.0;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

window.addEventListener("touchstart", initAudio, { once: true });
window.addEventListener("click", initAudio, { once: true });

// تشغيل صوت الشخصية مع التحكم بمستوى الصوت
let currentCharacterAudio = null;
function playCharacterVoice(voicePath) {
  if (isMuted || !voicePath) return;
  try {
    initAudio();
    if (currentCharacterAudio) {
      currentCharacterAudio.pause();
      currentCharacterAudio.currentTime = 0;
    }
    currentCharacterAudio = new Audio(voicePath);
    currentCharacterAudio.volume = voiceVolume;
    currentCharacterAudio
      .play()
      .catch((e) => console.log("Audio playback prevented:", e));
  } catch (e) {}
}

const iconSoundOn = document.getElementById("icon-sound-on");
const iconSoundOff = document.getElementById("icon-sound-off");

function updateSoundButtonUI() {
  if (isMuted) {
    iconSoundOn.classList.add("hidden");
    iconSoundOff.classList.remove("hidden");
  } else {
    iconSoundOn.classList.remove("hidden");
    iconSoundOff.classList.add("hidden");
  }
}

// موسيقى الخلفية الهادئة
let bgmInterval = null;
let currentBgmNoteIndex = 0;

const bgmNotes = [
  261.63, 329.63, 392.0, 523.25, 392.0, 329.63, 293.66, 349.23, 440.0, 349.23,
  329.63, 261.63,
];

function playBgmTone(freq) {
  try {
    if (isMuted || !audioCtx || audioCtx.state !== "running" || sfxVolume <= 0)
      return;

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.type = "sine";
    const now = audioCtx.currentTime;

    osc.frequency.setValueAtTime(freq, now);
    const targetGain = 0.05 * sfxVolume;
    gainNode.gain.setValueAtTime(targetGain, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0005, now + 0.22);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.24);
  } catch (e) {}
}

function startBGM() {
  stopBGM();
  if (isMuted) return;
  initAudio();
  currentBgmNoteIndex = 0;
  bgmInterval = setInterval(() => {
    if (isPlaying && !isPaused && !isCountingDown && !isMuted) {
      playBgmTone(bgmNotes[currentBgmNoteIndex]);
      currentBgmNoteIndex = (currentBgmNoteIndex + 1) % bgmNotes.length;
    }
  }, 230);
}

function stopBGM() {
  if (bgmInterval) {
    clearInterval(bgmInterval);
    bgmInterval = null;
  }
}

function playClickSound() {
  try {
    if (isMuted || sfxVolume <= 0) return;
    initAudio();
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.type = "triangle";
    const now = audioCtx.currentTime;

    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.05);

    gainNode.gain.setValueAtTime(0.25 * sfxVolume, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  } catch (e) {}
}

function playCoinSound() {
  try {
    if (isMuted || sfxVolume <= 0) return;
    initAudio();
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.type = "sine";
    const now = audioCtx.currentTime;

    osc.frequency.setValueAtTime(987.77, now);
    osc.frequency.setValueAtTime(1318.51, now + 0.07);

    gainNode.gain.setValueAtTime(0.25 * sfxVolume, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  } catch (e) {}
}

function playGameOverSound() {
  try {
    if (isMuted || sfxVolume <= 0) return;
    initAudio();
    if (!audioCtx) return;

    const notes = [392.0, 329.63, 261.63, 196.0];
    const now = audioCtx.currentTime;

    notes.forEach((freq, index) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.type = "sawtooth";
      const noteTime = now + index * 0.12;

      osc.frequency.setValueAtTime(freq, noteTime);
      gainNode.gain.setValueAtTime(0.2 * sfxVolume, noteTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.2);

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.22);
    });
  } catch (e) {}
}

// زر كتم الصوت في شاشة اللعب
document.getElementById("btn-toggle-sound").onclick = () => {
  isMuted = !isMuted;
  localStorage.setItem("my_game_muted", isMuted);
  updateSoundButtonUI();

  if (isMuted) {
    stopBGM();
    if (currentCharacterAudio) currentCharacterAudio.pause();
  } else {
    playClickSound();
    if (isPlaying && !isPaused && !isCountingDown) {
      startBGM();
    }
  }
};
updateSoundButtonUI();
// --- إدارة الشخصيات ---
const characters = [
  {
    id: "me",
    name: "شخصيتي",
    price: 0,
    unlocked: true,
    avatarSrc: "my_avatar.png",
    runSrc: "player_run.png",
    voiceSrc: "",
    desc: "مؤسس اللعبة وقائد التجاكيل!",
  },
  {
    id: "hatlawi",
    name: "الحطلاوي",
    price: 20,
    unlocked: false,
    avatarSrc: "hatlawi_avatar.png",
    runSrc: "hatlawi_run.png",
    voiceSrc: "hatlawi_voice.mp3",
    desc: "الحطلاوي أو كما يعرف العبد الأسود، احذر منه عند دخول السيرفر! يوصف بكونه خبير الكلوز التكتيكي وصاحب أقوى ميمز تجكيلي.",
  },
  {
    id: "shaker",
    name: "عمشاكر",
    price: 40,
    unlocked: false,
    avatarSrc: "shaker_avatar.png",
    runSrc: "shaker_run.png",
    voiceSrc: "",
    desc: "عمشاكر شخصياً، من لايعرف العمشاكر! حامل البيكيسي الخطير ويقال أنه يملك تجكيل لا نهائي!",
  },
  {
    id: "aboujej",
    name: "أبوالجيج",
    price: 60,
    unlocked: false,
    avatarSrc: "aboujej_avatar.png",
    runSrc: "aboujej_run.png",
    voiceSrc: "",
    desc: "أبوالجيج!! هنا سنصمت كثيراً حتى يكمل وضع قوانين جديدة للعادة السرية! فهو مؤسسها وصاحب أعلى رقم قياسي فيها",
  },
  {
    id: "divon",
    name: "ديفون",
    price: 90,
    unlocked: false,
    avatarSrc: "divon_avatar.png",
    runSrc: "divon_run.png",
    voiceSrc: "",
    desc: "ديفون! مبتكر مفهوم الحجج ، وأسطورة في العادة بعد المؤسس الجيجي ، ومن انجازاته أنه لم يدخل فايت إلا وخسره -بسبب النت بالطبع-",
  },
  {
    id: "fais",
    name: "فيص",
    price: 120,
    unlocked: false,
    avatarSrc: "fais_avatar.png",
    runSrc: "fais_run.png",
    voiceSrc: "",
    desc: "فييص! لا أعرف من أين نبدأ ! أنس الصالج أو بوصفه زوج عمران أو بلقبه الحركي سفل داوود! إذا ذهبت إلى صالة كاونتر ستجده رسبن قبلك",
  },
  {
    id: "anasamaka",
    name: "أنا سمكة",
    price: 150,
    unlocked: false,
    avatarSrc: "anasamaka_avatar.png",
    runSrc: "anasamaka_run.png",
    voiceSrc: "",
    desc: "عاهر علاوي ! حفيد العنخ آمون شخصياً ويحكى أنه مازال ينتظر عزيمة من الهندريس بفارغ البطن",
  },
  {
    id: "laahadkanaker",
    name: "لاأحد كمشة كناكر",
    price: 200,
    unlocked: false,
    avatarSrc: "laahadkanaker_avatar.png",
    runSrc: "laahadkanaker_run.png",
    voiceSrc: "",
    desc: "هذه الشخصية المعلونة! البيدوفيلي عاشق القُصَّر ومن أكبر الfeetlovers ، يملك العزيمة والإصرار لكن ميوله المازوخي يردعه ",
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
const achievementsScreen = document.getElementById("achievements-screen");
const gameOverScreen = document.getElementById("game-over-screen");
const pauseModal = document.getElementById("pause-modal");
const countdownOverlay = document.getElementById("countdown-overlay");
const countdownNumber = document.getElementById("countdown-number");

const settingsModal = document.getElementById("settings-modal");
const buyUcModal = document.getElementById("buy-uc-modal");
const unlockModal = document.getElementById("unlock-modal");
const unlockModalImg = document.getElementById("unlock-modal-img");
const unlockModalName = document.getElementById("unlock-modal-name");
const unlockModalDesc = document.getElementById("unlock-modal-desc");
const unlockSparkle = document.querySelector(".unlock-sparkle");
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
  [
    menuScreen,
    gameScreen,
    shopScreen,
    achievementsScreen,
    gameOverScreen,
  ].forEach((s) => s.classList.add("hidden"));
  screen.classList.remove("hidden");
}

// عرض 3 شخصيات ركض عشوائية عائمة تهز رؤوسها بحرية في الشاشة الرئيسية
function renderLobbyDancers() {
  const stage = document.getElementById("lobby-characters");
  if (!stage) return;
  stage.innerHTML = "";

  const shuffled = [...characters].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 3);

  selected.forEach((char, index) => {
    const dancer = document.createElement("div");
    dancer.className = `lobby-dancer dancer-${index + 1}`;
    dancer.title = char.name;
    dancer.innerHTML = `<img src="${char.runSrc}" alt="${char.name}" onerror="this.src='player_run.png'">`;
    stage.appendChild(dancer);
  });
}
renderLobbyDancers();

// تهيئة رابط واتساب للتواصل المباشر مع الرسالة المجهزة
const myWhatsAppNumber = "963953544613";
const defaultMessage = "عزيزي المطور أريد سؤالك عن لعبة تجكيلة بخصوص القسم ال";
const whatsappUrl = `https://wa.me/${myWhatsAppNumber}?text=${encodeURIComponent(defaultMessage)}`;
const btnWhatsApp = document.getElementById("btn-whatsapp");
if (btnWhatsApp) {
  btnWhatsApp.href = whatsappUrl;
}

// عناصر التحكم بنافذة الإعدادات وسلايدر الصوت
const sliderSfx = document.getElementById("slider-sfx-volume");
const sliderVoice = document.getElementById("slider-voice-volume");
const valSfx = document.getElementById("val-sfx-volume");
const valVoice = document.getElementById("val-voice-volume");

sliderSfx.value = Math.round(sfxVolume * 100);
valSfx.textContent = `${sliderSfx.value}%`;
sliderVoice.value = Math.round(voiceVolume * 100);
valVoice.textContent = `${sliderVoice.value}%`;

sliderSfx.oninput = (e) => {
  const val = e.target.value;
  valSfx.textContent = `${val}%`;
  sfxVolume = val / 100;
  localStorage.setItem("my_game_sfx_vol", sfxVolume);
};

sliderVoice.oninput = (e) => {
  const val = e.target.value;
  valVoice.textContent = `${val}%`;
  voiceVolume = val / 100;
  localStorage.setItem("my_game_voice_vol", voiceVolume);
  if (currentCharacterAudio) currentCharacterAudio.volume = voiceVolume;
};

// فتح وإغلاق الإعدادات
document.getElementById("btn-open-settings").onclick = () => {
  playClickSound();
  settingsModal.classList.remove("hidden");
};
document.getElementById("btn-close-settings").onclick = () => {
  playClickSound();
  settingsModal.classList.add("hidden");
};

// فتح وإغلاق نافذة شحن العملات (+)
document.getElementById("btn-open-buy-uc").onclick = () => {
  playClickSound();
  buyUcModal.classList.remove("hidden");
};
document.getElementById("btn-close-buy-uc").onclick = () => {
  playClickSound();
  buyUcModal.classList.add("hidden");
};

// أزرار شراء الباقات
document.querySelectorAll(".btn-bundle").forEach((btn) => {
  btn.onclick = () => {
    playClickSound();
    showToast("سيتم تفعيل بوابات الدفع قريباً!");
  };
});

// فتح وإغلاق شاشة الإنجازات
document.getElementById("btn-open-achievements").onclick = () => {
  playClickSound();
  showScreen(achievementsScreen);
};
document.getElementById("btn-close-achievements").onclick = () => {
  playClickSound();
  showScreen(menuScreen);
};

// فتح وإغلاق المتجر
document.getElementById("btn-open-shop").onclick = () => {
  stopBGM();
  playClickSound();
  renderShop();
  showScreen(shopScreen);
};
document.getElementById("btn-close-shop").onclick = () => {
  playClickSound();
  showScreen(menuScreen);
};

// أزرار بدء اللعب وإعادة المحاولة
document.getElementById("btn-start").onclick = () => {
  playClickSound();
  startGame();
};
document.getElementById("btn-restart").onclick = () => {
  playClickSound();
  startGame();
};
document.getElementById("btn-home").onclick = () => {
  stopBGM();
  playClickSound();
  renderLobbyDancers();
  showScreen(menuScreen);
};
document.getElementById("btn-shop-from-over").onclick = () => {
  stopBGM();
  playClickSound();
  renderShop();
  showScreen(shopScreen);
};

document.getElementById("btn-close-unlock").onclick = () => {
  playClickSound();
  unlockModal.classList.add("hidden");
};

// إيقاف واستئناف
document.getElementById("btn-pause").onclick = () => {
  playClickSound();
  pauseGame();
};
document.getElementById("btn-resume").onclick = () => {
  playClickSound();
  startResumeCountdown();
};
document.getElementById("btn-pause-home").onclick = () => {
  stopBGM();
  playClickSound();
  isPaused = false;
  isPlaying = false;
  pauseModal.classList.add("hidden");
  renderLobbyDancers();
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

    const avatarCursorStyle = char.unlocked
      ? 'style="cursor: pointer;" onclick="viewCharInfo(\'' + char.id + "')\""
      : "";

    card.innerHTML = `
      <div class="avatar-frame" ${avatarCursorStyle} title="${char.unlocked ? "عرض المعلومات والصوت" : ""}">
        <img src="${char.avatarSrc}" alt="${char.name}" class="avatar-img" onerror="this.src='player_run.png'">
      </div>
      <div class="card-title">${char.unlocked ? char.name : "؟؟؟"}</div>
      ${statusHtml}
      ${btnHtml}
    `;
    grid.appendChild(card);
  });
}

function showCharacterInfoModal(char, isNewUnlock = false) {
  unlockModalImg.src = char.avatarSrc;
  unlockModalName.textContent = char.name;
  unlockModalDesc.textContent = char.desc || "شخصية مميزة في تجاكيل عفوية!";

  if (isNewUnlock) {
    if (unlockSparkle) unlockSparkle.textContent = "✨ مبروك شخصية جديدة! ✨";
  } else {
    if (unlockSparkle) unlockSparkle.textContent = "🪪 بطاقة تعريف الشخصية";
  }

  unlockModal.classList.remove("hidden");

  if (char.voiceSrc) {
    playCharacterVoice(char.voiceSrc);
  }
}

window.viewCharInfo = function (id) {
  playClickSound();
  const char = characters.find((c) => c.id === id);
  if (char && char.unlocked) {
    showCharacterInfoModal(char, false);
  }
};

window.selectChar = function (id) {
  playClickSound();
  const found = characters.find((c) => c.id === id);
  if (found && found.unlocked) {
    activeCharacter = found;
    imgCurrentRun.src = activeCharacter.runSrc;
    localStorage.setItem("my_game_active_char", activeCharacter.id);
    renderShop();
    showToast(`تم اختيار: ${activeCharacter.name}`);

    if (activeCharacter.voiceSrc) {
      playCharacterVoice(activeCharacter.voiceSrc);
    }
  }
};

window.buyChar = function (id) {
  playClickSound();
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

    showCharacterInfoModal(char, true);
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

const BASE_SPEED = 5.2;
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
  initAudio();
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
  unlockModal.classList.add("hidden");

  startBGM();
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
  stopBGM();
  playGameOverSound();
  totalUC += collectedUC;
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("my_game_high_score", highScore);
  }
  updateUI();
  finalScoreText.textContent = score;
  showScreen(gameOverScreen);
}

// رسم الصناديق والبراميل والعملات
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

// حلقة اللعبة
function gameLoop() {
  if (!isPlaying || isPaused || isCountingDown) return;

  frameCount++;
  obstacleTimer++;

  if (frameCount % 5 === 0) score++;
  currentScoreText.textContent = score;
  gameUCText.textContent = collectedUC;

  gameSpeed = BASE_SPEED + Math.sqrt(score) * 0.16;

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

    const minSafeFrames = Math.max(38, Math.floor(280 / gameSpeed));
    const variance = Math.max(12, Math.floor(200 / gameSpeed));
    nextObstacleInterval = minSafeFrames + Math.floor(Math.random() * variance);
  }

  const coinInterval = Math.max(45, Math.floor(450 / gameSpeed));
  if (frameCount % coinInterval === 0) {
    coins.push({
      x: logicalWidth + 20,
      y: groundTop - 65 - Math.random() * 35,
      radius: 14,
      angle: Math.random() * Math.PI,
    });
  }

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
      playCoinSound();
      coins.splice(i, 1);
      continue;
    }

    if (c.x + c.radius < -20) coins.splice(i, 1);
  }

  ctx.clearRect(0, 0, logicalWidth, logicalHeight);

  ctx.fillStyle = "#c89558";
  ctx.fillRect(0, groundTop, logicalWidth, 45);
  ctx.fillStyle = "#a67238";
  ctx.fillRect(0, groundTop, logicalWidth, 6);

  obstacles.forEach((obs) => {
    if (obs.type === "crate") {
      drawCrate(ctx, obs.x, obs.y, obs.width);
    } else {
      drawBarrel(ctx, obs.x, obs.y, obs.width, obs.height);
    }
  });

  coins.forEach((c) => {
    c.angle += 0.08;
    drawRotatingCoin(ctx, c.x, c.y, c.radius, c.angle);
  });

  let runOffsetY = 0;
  let runRotation = 0;

  if (player.isGrounded && playerState === "run") {
    const runFreq = 0.32 + gameSpeed * 0.025;
    runOffsetY = Math.sin(frameCount * runFreq) * 3.5;
    runRotation = Math.cos(frameCount * runFreq) * 0.035;
  }

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
