// Minimal FPS core: player movement, mouse aim, shooting, reloading, bots, map, buy menu, rounds
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Utility to detect mobile
function isMobile() {
  return /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent) || window.innerWidth < 700;
}

// Define normal and mobile maps
const MAPS_DESKTOP = [
  // Scaled down and more open Main Map
  [
    // Central area
    { x: 600 * 0.6, y: 350 * 0.6, w: 80 * 0.6, h: 200 * 0.6 },
    { x: 700 * 0.6, y: 200 * 0.6, w: 200 * 0.6, h: 40 * 0.6 },
    { x: 900 * 0.6, y: 400 * 0.6, w: 40 * 0.6, h: 200 * 0.6 },
    // Left side
    { x: 200 * 0.6, y: 200 * 0.6, w: 250 * 0.6, h: 30 * 0.6 },
    { x: 300 * 0.6, y: 500 * 0.6, w: 30 * 0.6, h: 200 * 0.6 },
    { x: 150 * 0.6, y: 600 * 0.6, w: 200 * 0.6, h: 30 * 0.6 },
    // Right side
    { x: 1100 * 0.6, y: 250 * 0.6, w: 30 * 0.6, h: 250 * 0.6 },
    { x: 1000 * 0.6, y: 500 * 0.6, w: 200 * 0.6, h: 30 * 0.6 },
    { x: 1200 * 0.6, y: 600 * 0.6, w: 30 * 0.6, h: 200 * 0.6 },
    // New right-side walls for more cover (desktop)
    { x: 1280 * 0.6, y: 320 * 0.6, w: 40 * 0.6, h: 120 * 0.6 }, // vertical wall (moved further right)
    { x: 1150 * 0.6, y: 600 * 0.6, w: 80 * 0.6, h: 30 * 0.6 }, // horizontal wall (moved lower)
    { x: 1200 * 0.6, y: 180 * 0.6, w: 30 * 0.6, h: 80 * 0.6 }, // short vertical wall (moved up)
    // Top and bottom
    { x: 500 * 0.6, y: 100 * 0.6, w: 400 * 0.6, h: 30 * 0.6 },
    { x: 500 * 0.6, y: 700 * 0.6, w: 400 * 0.6, h: 30 * 0.6 },
    // Diagonal cover
    { x: 400 * 0.6, y: 400 * 0.6, w: 120 * 0.6, h: 20 * 0.6 },
    { x: 900 * 0.6, y: 600 * 0.6, w: 120 * 0.6, h: 20 * 0.6 }
  ]
];
const MAPS_MOBILE = [
  [
    // Central area
    { x: 180 * 0.6, y: 120 * 0.6, w: 40 * 0.6, h: 80 * 0.6 },
    { x: 260 * 0.6, y: 80 * 0.6, w: 80 * 0.6, h: 20 * 0.6 },
    { x: 340 * 0.6, y: 180 * 0.6, w: 20 * 0.6, h: 80 * 0.6 },
    { x: 60 * 0.6, y: 80 * 0.6, w: 80 * 0.6, h: 14 * 0.6 },
    { x: 100 * 0.6, y: 180 * 0.6, w: 14 * 0.6, h: 80 * 0.6 },
    { x: 40 * 0.6, y: 220 * 0.6, w: 80 * 0.6, h: 14 * 0.6 },
    { x: 380 * 0.6, y: 100 * 0.6, w: 14 * 0.6, h: 80 * 0.6 },
    { x: 340 * 0.6, y: 220 * 0.6, w: 80 * 0.6, h: 14 * 0.6 },
    { x: 420 * 0.6, y: 240 * 0.6, w: 14 * 0.6, h: 80 * 0.6 },
    { x: 120 * 0.6, y: 40 * 0.6, w: 120 * 0.6, h: 10 * 0.6 },
    { x: 120 * 0.6, y: 260 * 0.6, w: 120 * 0.6, h: 10 * 0.6 },
    { x: 180 * 0.6, y: 160 * 0.6, w: 40 * 0.6, h: 8 * 0.6 },
    { x: 340 * 0.6, y: 240 * 0.6, w: 40 * 0.6, h: 8 * 0.6 },
    // New right-side walls for more cover (mobile)
    { x: 470 * 0.6, y: 100 * 0.6, w: 20 * 0.6, h: 40 * 0.6 }, // vertical wall (moved further right)
    { x: 400 * 0.6, y: 210 * 0.6, w: 40 * 0.6, h: 10 * 0.6 }, // horizontal wall (moved lower)
    { x: 430 * 0.6, y: 40 * 0.6, w: 10 * 0.6, h: 30 * 0.6 }, // short vertical wall (moved up)
  ]
];
const MAPS = isMobile() ? MAPS_MOBILE : MAPS_DESKTOP;
let mapIndex = 0;
let walls = MAPS[0].map(w => ({...w}));

// Weapons (with prices)
const WEAPONS = {
  // Player weapons
  glock:   { name: 'Glock', ammo: 20, reserve: 300, damage: 20, price: 200 },
  ak47:    { name: 'AK-47', ammo: 30, reserve: 240, damage: 40, price: 1000 },
  awm:     { name: 'AWM', ammo: 5, reserve: 50, damage: 500, price: 3000 },
  rpg:     { name: 'RPG', ammo: 1, reserve: 20, damage: 10000, price: 10000, aoe: 100 },
  // Bot weapons
  pistol:  { name: 'Pistol', ammo: 10, reserve: 30, damage: 34, price: 200 },
  m4:      { name: 'M4', ammo: 30, reserve: 90, damage: 20, price: 1000 },
  magnum:  { name: 'Magnum', ammo: 5, reserve: 15, damage: 100, price: 3000 }
};

// Game state
let round = 1;
let score = { player: 0, bots: 0 };
let roundActive = false;
let roundMsgTimeout = null;
let selectedWeapon = 'glock';

// Money system
let playerMoney = 800;

// Player state
const player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  angle: 0,
  speed: 3,
  radius: 14,
  health: 1000,
  ammo: 20,
  reserve: 300,
  isShooting: false,
  recoil: 0,
  isReloading: false,
  reloadTime: 60, // frames
  reloadTimer: 0,
  alive: true,
  weapon: 'glock',
};

// Bullets array for visible bullets
let bullets = [];
let botBullets = [];

// Bot state
class Bot {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.angle = 0;
    this.speed = 2;
    this.radius = 14;
    this.health = 100;
    this.ammo = 10;
    this.reloadTime = 60;
    this.reloadTimer = 0;
    this.isReloading = false;
    this.shootCooldown = 0;
    this.target = player;
    this.alive = true;
    this.moveDir = Math.random() * Math.PI * 2;
    this.moveTimer = Math.floor(Math.random() * 60 + 30);
    this.weapon = 'pistol';
    this.strafeDir = Math.random() < 0.5 ? 1 : -1;
    this.reactionTimer = 0;
    this.aimError = 0;
  }
  update() {
    if (!this.alive) return;
    // Enhanced AI: move toward player if far, strafe if close
    const distToPlayer = Math.hypot(player.x - this.x, player.y - this.y);
    if (distToPlayer > 250) {
      // Move toward player
      const angleToPlayer = Math.atan2(player.y - this.y, player.x - this.x);
      const nx = this.x + Math.cos(angleToPlayer) * this.speed;
      const ny = this.y + Math.sin(angleToPlayer) * this.speed;
      if (!collidesWithWalls(nx, ny, this.radius)) {
        this.x = nx;
        this.y = ny;
      }
    } else if (distToPlayer > 60) {
      // Strafe around player
      const angleToPlayer = Math.atan2(player.y - this.y, player.x - this.x);
      const strafeAngle = angleToPlayer + this.strafeDir * Math.PI / 2;
      const nx = this.x + Math.cos(strafeAngle) * this.speed * 0.7;
      const ny = this.y + Math.sin(strafeAngle) * this.speed * 0.7;
      if (!collidesWithWalls(nx, ny, this.radius)) {
        this.x = nx;
        this.y = ny;
      }
      // Occasionally switch strafe direction
      if (Math.random() < 0.01) this.strafeDir *= -1;
    }
    // Clamp
    this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
    this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));
    // Aim at player with inaccuracy
    const baseAngle = Math.atan2(player.y - this.y, player.x - this.x);
    // Inaccuracy increases with distance
    this.aimError = (Math.random() - 0.5) * (distToPlayer / 200) * 0.5;
    this.angle = baseAngle + this.aimError;
    // Reaction delay
    if (this.reactionTimer > 0) this.reactionTimer--;
    // Shoot at player if in range and line of sight
    if (this.shootCooldown <= 0 && this.ammo > 0 && !this.isReloading && this.alive && player.alive) {
      if (distToPlayer < 400 && Math.abs(baseAngle - this.angle) < 0.3 && !lineHitsWall(this.x, this.y, player.x, player.y)) {
        if (this.reactionTimer <= 0) {
          this.shoot();
          this.shootCooldown = 32 + Math.random() * 24; // slower fire rate
          this.reactionTimer = 18 + Math.random() * 18; // delay before next shot
        }
      } else {
        this.reactionTimer = 10; // reset reaction if lost sight
      }
    }
    if (this.shootCooldown > 0) this.shootCooldown--;
    // Reload if out of ammo
    if (this.ammo <= 0 && this.reloadTimer === 0 && !this.isReloading && this.alive) {
      this.isReloading = true;
      this.reloadTimer = this.reloadTime;
    }
    if (this.isReloading) {
      this.reloadTimer--;
      if (this.reloadTimer <= 0) {
        this.ammo = WEAPONS[this.weapon].ammo;
        this.isReloading = false;
      }
    }
  }
  shoot() {
    this.ammo--;
    // Visual bot bullet
    let hit = false;
    let endX = this.x, endY = this.y;
    for (let t = 0; t < 1; t += 0.02) {
      const px = this.x + Math.cos(this.angle) * t * 1000;
      const py = this.y + Math.sin(this.angle) * t * 1000;
      if (collidesWithWalls(px, py, 2)) break;
      // Check player
      if (!hit && player.alive && Math.hypot(player.x - px, player.y - py) < player.radius + 10) {
        player.health -= Math.floor(WEAPONS[this.weapon].damage * 0.45); // bots do less damage
        if (player.health <= 0) player.alive = false;
        hit = true;
      }
      endX = px; endY = py;
      if (hit) break;
    }
    botBullets.push({
      x1: this.x,
      y1: this.y,
      x2: endX,
      y2: endY,
      time: 8
    });
  }
}

let bots = [];

// Input state
const keys = {};
let mouse = { x: canvas.width / 2, y: canvas.height / 2 };

// Buy menu logic
const buyMenu = document.getElementById('buyMenu');
const roundMsg = document.getElementById('roundMsg');
const scoreEl = document.getElementById('score');

// Only show player weapons in buy menu
const PLAYER_WEAPONS = ['glock', 'ak47', 'awm', 'rpg'];
document.querySelectorAll('.buy-btn').forEach(btn => {
  const weapon = btn.dataset.weapon;
  if (!PLAYER_WEAPONS.includes(weapon)) {
    btn.style.display = 'none';
  } else {
    btn.style.display = '';
  }
  btn.onclick = () => {
    if (!PLAYER_WEAPONS.includes(weapon)) return;
    if (selectedWeapon === weapon) {
      document.querySelectorAll('.buy-btn').forEach(b => b.style.background = '#333');
      btn.style.background = '#0a0';
      return;
    }
    selectedWeapon = weapon;
    document.querySelectorAll('.buy-btn').forEach(b => b.style.background = '#333');
    btn.style.background = '#0a0';
  };
});

document.getElementById('startRoundBtn').onclick = () => {
  const weapon = selectedWeapon;
  const price = WEAPONS[weapon]?.price || 0;
  if (playerMoney < price) {
    // Not enough money, show error and do not start round
    const btn = document.querySelector('.buy-btn[data-weapon="' + weapon + '"]');
    if (btn) {
      btn.style.background = '#a00';
      setTimeout(() => btn.style.background = '#333', 400);
    }
    showRoundMsg('Not enough money!');
    setTimeout(hideRoundMsg, 1200);
    return;
  }
  if (price > 0) {
    playerMoney -= price;
    showMoneyPopup(-price);
  }
  startRound();
};

// Kill counter and high score
let playerKills = 0;
let highScore = parseInt(localStorage.getItem('cs2d_highscore') || '0', 10);

function updateHighScoreDisplay() {
  const highScoreDisplay = document.getElementById('highScoreDisplay');
  if (highScoreDisplay) {
    highScoreDisplay.textContent = `High Score: ${highScore} kills`;
  }
}

function updateKillCounterDisplay() {
  const killsEl = document.getElementById('cs-kills');
  if (killsEl) killsEl.textContent = `Kills: ${playerKills}`;
}

function incrementKillCounter() {
  playerKills++;
  if (playerKills > highScore) {
    highScore = playerKills;
    localStorage.setItem('cs2d_highscore', highScore);
    updateHighScoreDisplay();
  }
  updateKillCounterDisplay();
}

function showBuyMenu() {
  buyMenu.classList.remove('hidden');
  updateHighScoreDisplay();
  document.querySelectorAll('.buy-btn').forEach(btn => {
    const weapon = btn.dataset.weapon;
    if (!PLAYER_WEAPONS.includes(weapon)) {
      btn.style.display = 'none';
    } else {
      btn.style.display = '';
      const price = WEAPONS[weapon]?.price || 0;
      btn.innerHTML = `${WEAPONS[weapon]?.name || weapon} ($${price})`;
      btn.style.background = '#333';
    }
  });
  const selectedBtn = document.querySelector('.buy-btn[data-weapon="' + selectedWeapon + '"]');
  if (selectedBtn) selectedBtn.style.background = '#0a0';
}
function hideBuyMenu() {
  buyMenu.classList.add('hidden');
}
function showRoundMsg(msg) {
  roundMsg.textContent = msg;
  roundMsg.classList.remove('hidden');
}
function hideRoundMsg() {
  roundMsg.classList.add('hidden');
}

// Teams
const TEAMS = ['T', 'CT'];
let playerTeam = 'CT';
let botsTeam = 'T';
let roundTime = Infinity; // No time limit
let roundTimer = roundTime;
let roundTimerInterval = null;

function resetPlayer() {
  const spawn = getSafeSpawn(player.radius);
  player.x = spawn.x;
  player.y = spawn.y;
  player.health = 1000;
  player.alive = true;
  player.weapon = selectedWeapon;
  player.ammo = WEAPONS[selectedWeapon].ammo;
  player.reserve = WEAPONS[selectedWeapon].reserve;
  player.isReloading = false;
  player.reloadTimer = 0;
  player.team = playerTeam;
}

// Find a safe spawn point not colliding with walls
function getSafeSpawn(radius = 20) {
  let tries = 0;
  while (tries < 300) { // Increased tries for reliability
    const x = Math.random() * (canvas.width - 2 * radius) + radius;
    const y = Math.random() * (canvas.height - 2 * radius) + radius;
    if (!collidesWithWalls(x, y, radius)) return { x, y };
    tries++;
  }
  // Fallback: center
  return { x: canvas.width / 2, y: canvas.height / 2 };
}

function resetBots() {
  bots = [];
  for (let i = 0; i < 15; i++) {
    const spawn = getSafeSpawn();
    const bot = new Bot(spawn.x, spawn.y);
    // Assign bot weapons: 0-4 pistol, 5-9 m4, 10-14 magnum
    if (i < 5) {
      bot.weapon = 'pistol';
      bot.ammo = WEAPONS.pistol.ammo;
      bot.reserve = WEAPONS.pistol.reserve;
    } else if (i < 10) {
      bot.weapon = 'm4';
      bot.ammo = WEAPONS.m4.ammo;
      bot.reserve = WEAPONS.m4.reserve;
    } else {
      bot.weapon = 'magnum';
      bot.ammo = WEAPONS.magnum.ammo;
      bot.reserve = WEAPONS.magnum.reserve;
    }
    bot.team = botsTeam;
    if (i % 2 === 1) bot.team = playerTeam;
    bots.push(bot);
  }
}

function startRound(autoContinue = false) {
  // Always use the single map
  mapIndex = 0;
  walls = MAPS[0].map(w => ({...w}));
  hideBuyMenu();
  hideRoundMsg();
  // Only reset player if not auto-continue (i.e., if buy menu was shown)
  if (!autoContinue) {
    resetPlayer();
    updateHighScoreDisplay();
    updateKillCounterDisplay();
  }
  resetBots();
  roundActive = true;
  if (roundTimerInterval) clearInterval(roundTimerInterval);
}

// Show money popup
function showMoneyPopup(amount, isRound = false) {
  const popups = document.getElementById('cs-money-popups');
  if (!popups) return;
  const div = document.createElement('div');
  div.className = 'cs-money-popup' + (isRound ? ' round' : '') + (amount < 0 ? ' minus' : '');
  div.textContent = (amount > 0 ? '+' : '') + '$' + amount;
  popups.appendChild(div);
  setTimeout(() => { div.remove(); }, 1200);
}

// Restore player's health and ammo to full for their current weapon
function restorePlayerHealthAndAmmo() {
  player.health = 1000;
  player.ammo = WEAPONS[player.weapon].ammo;
  player.reserve = WEAPONS[player.weapon].reserve;
  player.isReloading = false;
  player.reloadTimer = 0;
}

const postWinMenu = document.getElementById('postWinMenu');
const keepWeaponBtn = document.getElementById('keepWeaponBtn');
const buyNewWeaponBtn = document.getElementById('buyNewWeaponBtn');

function showPostWinMenu() {
  postWinMenu.classList.remove('hidden');
}
function hidePostWinMenu() {
  postWinMenu.classList.add('hidden');
}
if (keepWeaponBtn && buyNewWeaponBtn) {
  keepWeaponBtn.onclick = () => {
    restorePlayerHealthAndAmmo();
    hidePostWinMenu();
    setTimeout(() => {
      startRound(true);
    }, 200);
  };
  buyNewWeaponBtn.onclick = () => {
    hidePostWinMenu();
    showBuyMenu();
  };
}

const restartGameBtn = document.getElementById('restartGameBtn');

function showRestartButton(show) {
  if (restartGameBtn) restartGameBtn.style.display = show ? '' : 'none';
}
if (restartGameBtn) {
  restartGameBtn.onclick = () => {
    // Reset all game state
    score.player = 0;
    score.bots = 0;
    playerMoney = 800;
    selectedWeapon = 'glock';
    resetPlayer();
    resetBots();
    updateHUD();
    hideRoundMsg();
    showRestartButton(false);
    showBuyMenu();
    playerKills = 0;
    updateHighScoreDisplay();
    updateKillCounterDisplay();
  };
}

function endRound(winner) {
  if (!roundActive) return; // Prevent double endRound calls
  roundActive = false;
  if (roundTimerInterval) clearInterval(roundTimerInterval);
  if (winner === 'player') {
    score.player++;
    playerMoney += 500;
    showMoneyPopup(500, true);
  } else if (winner === 'bots') {
    score.bots++;
    playerKills = 0;
    updateKillCounterDisplay();
  }
  updateHUD();
  showRoundMsg(winner === 'player' ? 'Counter-Terrorists Win!' : winner === 'bots' ? 'Terrorists Win!' : 'Draw!');
  roundMsgTimeout = setTimeout(() => {
    // Only show buy menu if player lost or died
    if (winner === 'bots' || !player.alive) {
    showBuyMenu();
    }
    hideRoundMsg();
    // If player won and is alive, show post-win menu
    if (winner === 'player' && player.alive) {
      showPostWinMenu();
    }
  }, 2000);
}

// Handle resize
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// WASD movement
window.addEventListener('keydown', e => {
  keys[e.key.toLowerCase()] = true;
  // Reload
  if (e.key.toLowerCase() === 'r' && !player.isReloading && player.ammo < WEAPONS[player.weapon].ammo && player.reserve > 0 && player.alive) {
    player.isReloading = true;
    player.reloadTimer = player.reloadTime;
  }
});
window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });

// Mouse aiming
canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
});

// Shooting
canvas.addEventListener('mousedown', () => { player.isShooting = true; });
canvas.addEventListener('mouseup', () => { player.isShooting = false; });

function collidesWithWalls(x, y, radius) {
  return walls.some(w =>
    x + radius > w.x && x - radius < w.x + w.w &&
    y + radius > w.y && y - radius < w.y + w.h
  );
}

function lineHitsWall(x1, y1, x2, y2) {
  // Simple line-rect intersection for all walls
  for (const w of walls) {
    if (lineRectIntersect(x1, y1, x2, y2, w.x, w.y, w.w, w.h)) return true;
  }
  return false;
}

function lineRectIntersect(x1, y1, x2, y2, rx, ry, rw, rh) {
  // Check if line (x1,y1)-(x2,y2) intersects rect (rx,ry,rw,rh)
  // Check each edge
  return (
    lineLine(x1, y1, x2, y2, rx, ry, rx+rw, ry) ||
    lineLine(x1, y1, x2, y2, rx+rw, ry, rx+rw, ry+rh) ||
    lineLine(x1, y1, x2, y2, rx+rw, ry+rh, rx, ry+rh) ||
    lineLine(x1, y1, x2, y2, rx, ry+rh, rx, ry)
  );
}
function lineLine(x1, y1, x2, y2, x3, y3, x4, y4) {
  // Line-line intersection
  const denom = (y4-y3)*(x2-x1)-(x4-x3)*(y2-y1);
  if (denom === 0) return false;
  const ua = ((x4-x3)*(y1-y3)-(y4-y3)*(x1-x3))/denom;
  const ub = ((x2-x1)*(y1-y3)-(y2-y1)*(x1-x3))/denom;
  return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
}

// RPG shooting logic
let explosions = [];
function shoot() {
  if (player.weapon === 'rpg') {
    player.ammo--;
    player.recoil = 10;
    // Find hit point
    let hit = false;
    let shotX = player.x, shotY = player.y;
    let endX = player.x, endY = player.y;
    for (let t = 0; t < 1; t += 0.01) {
      const px = player.x + Math.cos(player.angle) * t * 1000;
      const py = player.y + Math.sin(player.angle) * t * 1000;
      if (collidesWithWalls(px, py, 8)) break;
      shotX = px; shotY = py;
      endX = px; endY = py;
    }
    // Create explosion
    explosions.push({ x: endX, y: endY, r: 0, maxR: WEAPONS.rpg.aoe, alpha: 1, time: 0 });
    // Damage bots in radius
    bots.forEach(bot => {
      if (!bot.alive) return;
      const dist = Math.hypot(bot.x - endX, bot.y - endY);
      if (dist < WEAPONS.rpg.aoe) {
        bot.health = 0;
        bot.alive = false;
        playerMoney += 300;
        showMoneyPopup(300);
        incrementKillCounter();
      }
    });
    return;
  }
  player.ammo--;
  player.recoil = 10;
  // Visual bullet
  let hit = false;
  let shotX = player.x, shotY = player.y;
  let endX = player.x, endY = player.y;
  for (let t = 0; t < 1; t += 0.02) {
    const px = player.x + Math.cos(player.angle) * t * 1000;
    const py = player.y + Math.sin(player.angle) * t * 1000;
    if (collidesWithWalls(px, py, 2)) break;
    shotX = px; shotY = py;
    // Check bots
    bots.forEach(bot => {
      if (!bot.alive || hit) return;
      const dist = Math.hypot(bot.x - px, bot.y - py);
      if (dist < bot.radius + 10) {
        bot.health -= WEAPONS[player.weapon].damage;
        if (bot.health <= 0) {
          bot.alive = false;
          playerMoney += 300;
          showMoneyPopup(300);
          incrementKillCounter();
        }
        hit = true;
      }
    });
    if (hit) break;
    endX = px; endY = py;
  }
  bullets.push({
    x1: player.x,
    y1: player.y,
    x2: endX,
    y2: endY,
    time: 8
  });
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // --- Fake 3D: Draw ground gradient ---
  const grd = ctx.createLinearGradient(0, canvas.height * 0.3, 0, canvas.height);
  grd.addColorStop(0, '#232526');
  grd.addColorStop(1, '#181a1b');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // --- Fake 3D: Draw walls with 3D shading ---
  walls.forEach(w => {
    // Main wall face
    ctx.save();
    ctx.fillStyle = '#888';
    ctx.fillRect(w.x, w.y, w.w, w.h);
    // Top edge (lighter)
    ctx.fillStyle = '#bbb';
    ctx.fillRect(w.x, w.y, w.w, 6);
    // Right edge (darker)
    ctx.fillStyle = '#555';
    ctx.fillRect(w.x + w.w - 6, w.y, 6, w.h);
    ctx.restore();
  });

  // Draw bot bullets
  botBullets.forEach(bullet => {
    ctx.save();
    ctx.strokeStyle = '#f44';
    ctx.lineWidth = 3;
    ctx.globalAlpha = bullet.time / 8;
    ctx.beginPath();
    ctx.moveTo(bullet.x1, bullet.y1);
    ctx.lineTo(bullet.x2, bullet.y2);
    ctx.stroke();
    ctx.restore();
  });
  botBullets = botBullets.filter(b => b.time-- > 0);

  // Draw player bullets
  bullets.forEach(bullet => {
    ctx.save();
    ctx.strokeStyle = '#ff0';
    ctx.lineWidth = 3;
    ctx.globalAlpha = bullet.time / 8;
    ctx.beginPath();
    ctx.moveTo(bullet.x1, bullet.y1);
    ctx.lineTo(bullet.x2, bullet.y2);
    ctx.stroke();
    ctx.restore();
  });
  bullets = bullets.filter(b => b.time-- > 0);

  // Draw explosions
  explosions.forEach(expl => {
    ctx.save();
    ctx.globalAlpha = expl.alpha;
    const grad = ctx.createRadialGradient(expl.x, expl.y, 0, expl.x, expl.y, expl.r);
    grad.addColorStop(0, 'rgba(255,255,100,0.8)');
    grad.addColorStop(0.4, 'rgba(255,120,0,0.5)');
    grad.addColorStop(1, 'rgba(255,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(expl.x, expl.y, expl.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // --- Fake 3D: Perspective scale function ---
  function perspectiveScale(y) {
    const base = 1.0;
    const minScale = 0.82;
    const maxY = canvas.height;
    return base - (1 - minScale) * (y / maxY);
  }

  // Draw bots with perspective scaling
  bots.forEach(bot => {
    ctx.save();
    ctx.translate(bot.x, bot.y);
    ctx.rotate(bot.angle);
    // Perspective scale
    const scale = perspectiveScale(bot.y);
    ctx.scale(scale, scale);
    ctx.globalAlpha = bot.alive ? 1 : 0.3;
    // 3D shadow
    ctx.save();
    ctx.rotate(-bot.angle);
    ctx.globalAlpha = 0.18;
    let shadowGrd = ctx.createRadialGradient(0, 18, 2, 0, 18, 18);
    shadowGrd.addColorStop(0, '#0006');
    shadowGrd.addColorStop(1, 'transparent');
    ctx.fillStyle = shadowGrd;
    ctx.beginPath();
    ctx.ellipse(0, 18, 18, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    // Glow/highlight rim
    ctx.save();
    ctx.shadowColor = '#f55a';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(0, -28, 13, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,85,85,0.08)';
    ctx.fill();
    ctx.restore();
    // Body (3D gradient)
    let bodyGrd = ctx.createLinearGradient(-7, 0, 7, 0);
    bodyGrd.addColorStop(0, '#b33');
    bodyGrd.addColorStop(0.5, '#e66');
    bodyGrd.addColorStop(1, '#a11');
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#fff2';
    ctx.fillStyle = bot.alive ? bodyGrd : '#555';
    ctx.fillRect(-7, -20, 14, 40);
    ctx.strokeRect(-7, -20, 14, 40);
    // Vest (darker gradient)
    let vestGrd = ctx.createLinearGradient(-7, 0, 7, 0);
    vestGrd.addColorStop(0, '#444');
    vestGrd.addColorStop(1, '#222');
    ctx.fillStyle = vestGrd;
    ctx.fillRect(-7, -10, 14, 18);
    ctx.strokeRect(-7, -10, 14, 18);
    // Belt
    ctx.fillStyle = '#222';
    ctx.fillRect(-7, 2, 14, 5);
    ctx.strokeRect(-7, 2, 14, 5);
    // Team armband
    ctx.fillStyle = '#00e6d0';
    ctx.fillRect(7, -8, 5, 12);
    ctx.strokeRect(7, -8, 5, 12);
    // Head (radial gradient for 3D)
    let headGrd = ctx.createRadialGradient(0, -32, 3, 0, -28, 10);
    headGrd.addColorStop(0, '#fff');
    headGrd.addColorStop(0.5, '#fcd7b6');
    headGrd.addColorStop(1, '#c99a6b');
    ctx.beginPath();
    ctx.arc(0, -28, 10, 0, Math.PI * 2);
    ctx.fillStyle = headGrd;
    ctx.fill();
    ctx.stroke();
    // Helmet (3D)
    let helmetGrd = ctx.createLinearGradient(-10, -31, 10, -31);
    helmetGrd.addColorStop(0, '#444');
    helmetGrd.addColorStop(1, '#222');
    ctx.beginPath();
    ctx.arc(0, -31, 10, Math.PI, 0);
    ctx.fillStyle = helmetGrd;
    ctx.fill();
    ctx.stroke();
    // Visor
    ctx.beginPath();
    ctx.ellipse(0, -31, 7, 3, 0, 0, Math.PI);
    ctx.fillStyle = '#0cf';
    ctx.globalAlpha = 0.7;
    ctx.fill();
    ctx.globalAlpha = bot.alive ? 1 : 0.3;
    ctx.strokeStyle = '#0cf';
    ctx.stroke();
    // Face: mask and angry eyes
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#333';
    ctx.beginPath(); ctx.ellipse(0, -25, 6, 3, 0, 0, Math.PI, false); ctx.fill();
    ctx.strokeStyle = '#111';
    ctx.beginPath(); ctx.moveTo(-4, -30); ctx.lineTo(-2, -28); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(4, -30); ctx.lineTo(2, -28); ctx.stroke();
    // Arms (3D)
    let armGrd = ctx.createLinearGradient(-20, 10, -7, -15);
    armGrd.addColorStop(0, '#fcd7b6');
    armGrd.addColorStop(1, '#c99a6b');
    ctx.strokeStyle = armGrd;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-7, -15); ctx.lineTo(-20, 10); // left arm
    ctx.moveTo(7, -15); ctx.lineTo(20, 10); // right arm
    ctx.stroke();
    // Gloves (3D)
    let gloveGrd = ctx.createRadialGradient(-20, 10, 1, -20, 10, 4);
    gloveGrd.addColorStop(0, '#0ff');
    gloveGrd.addColorStop(1, '#0cf');
    ctx.beginPath();
    ctx.arc(-20, 10, 4, 0, Math.PI * 2);
    ctx.arc(20, 10, 4, 0, Math.PI * 2);
    ctx.fillStyle = gloveGrd;
    ctx.fill();
    ctx.strokeStyle = '#0cf';
    ctx.stroke();
    // Legs (3D)
    let legGrd = ctx.createLinearGradient(-10, 38, -5, 20);
    legGrd.addColorStop(0, '#444');
    legGrd.addColorStop(1, '#222');
    ctx.strokeStyle = legGrd;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-5, 20); ctx.lineTo(-10, 38); // left leg
    ctx.moveTo(5, 20); ctx.lineTo(10, 38); // right leg
    ctx.stroke();
    // Boots (3D)
    let bootGrd = ctx.createRadialGradient(-10, 38, 1, -10, 38, 4);
    bootGrd.addColorStop(0, '#0ff');
    bootGrd.addColorStop(1, '#0cf');
    ctx.beginPath();
    ctx.arc(-10, 38, 4, 0, Math.PI * 2);
    ctx.arc(10, 38, 4, 0, Math.PI * 2);
    ctx.fillStyle = bootGrd;
    ctx.fill();
    ctx.strokeStyle = '#0cf';
    ctx.stroke();
    // Gun
    ctx.save();
    ctx.translate(14, -5);
    ctx.rotate(0.1);
    ctx.fillStyle = '#333';
    ctx.fillRect(0, -3, 22, 6);
    // Muzzle flash (if shooting)
    if (bot.shootCooldown > 28 && bot.alive) {
      ctx.save();
      ctx.translate(22, 0);
      ctx.rotate(Math.random() * 0.3 - 0.15);
      ctx.fillStyle = 'rgba(255,220,80,0.8)';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(10, -4);
      ctx.lineTo(10, 4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
    // Health bar
    ctx.save();
    ctx.rotate(-bot.angle);
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = '#222';
    ctx.fillRect(-15, -42, 30, 6);
    ctx.fillStyle = '#0f0';
    ctx.fillRect(-15, -42, 30 * Math.max(0, bot.health) / 100, 6);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(-15, -42, 30, 6);
    ctx.restore();
    ctx.restore();
  });

  // Draw player with perspective scaling
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.rotate(player.angle);
  const scale = perspectiveScale(player.y);
  ctx.scale(scale, scale);
  ctx.globalAlpha = player.alive ? 1 : 0.3;
  // 3D shadow
  ctx.save();
  ctx.rotate(-player.angle);
  ctx.globalAlpha = 0.18;
  let shadowGrd = ctx.createRadialGradient(0, 18, 2, 0, 18, 18);
  shadowGrd.addColorStop(0, '#0006');
  shadowGrd.addColorStop(1, 'transparent');
  ctx.fillStyle = shadowGrd;
  ctx.beginPath();
  ctx.ellipse(0, 18, 18, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // Glow/highlight rim
  ctx.save();
  ctx.shadowColor = '#00e6d0aa';
  ctx.shadowBlur = 16;
  ctx.beginPath();
  ctx.arc(0, -28, 13, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,230,208,0.08)';
  ctx.fill();
  ctx.restore();
  // Body (3D gradient)
  let bodyGrd = ctx.createLinearGradient(-7, 0, 7, 0);
  bodyGrd.addColorStop(0, '#0f8');
  bodyGrd.addColorStop(0.5, '#6fffd7');
  bodyGrd.addColorStop(1, '#0a6');
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#fff2';
  ctx.fillStyle = bodyGrd;
  ctx.fillRect(-7, -20, 14, 40);
  ctx.strokeRect(-7, -20, 14, 40);
  // Shirt detail (darker gradient)
  let shirtGrd = ctx.createLinearGradient(-7, 0, 7, 0);
  shirtGrd.addColorStop(0, '#0a6');
  shirtGrd.addColorStop(1, '#044');
  ctx.fillStyle = shirtGrd;
  ctx.fillRect(-7, -10, 14, 18);
  ctx.strokeRect(-7, -10, 14, 18);
  // Belt
  ctx.fillStyle = '#222';
  ctx.fillRect(-7, 2, 14, 5);
  ctx.strokeRect(-7, 2, 14, 5);
  // Backpack (3D)
  ctx.beginPath();
  ctx.ellipse(0, -5, 7, 10, 0, Math.PI, 2 * Math.PI);
  ctx.fillStyle = '#333';
  ctx.globalAlpha = 0.5;
  ctx.fill();
  ctx.globalAlpha = player.alive ? 1 : 0.3;
  ctx.strokeStyle = '#0e8';
  ctx.stroke();
  // Team badge
  ctx.beginPath();
  ctx.arc(10, -10, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#00e6d0';
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.stroke();
  // Head (radial gradient for 3D)
  let headGrd = ctx.createRadialGradient(0, -32, 3, 0, -28, 10);
  headGrd.addColorStop(0, '#fff');
  headGrd.addColorStop(0.5, '#ffe0b2');
  headGrd.addColorStop(1, '#c99a6b');
  ctx.beginPath();
  ctx.arc(0, -28, 10, 0, Math.PI * 2);
  ctx.fillStyle = headGrd;
  ctx.fill();
  ctx.stroke();
  // Helmet (3D)
  let helmetGrd = ctx.createLinearGradient(-10, -31, 10, -31);
  helmetGrd.addColorStop(0, '#444');
  helmetGrd.addColorStop(1, '#222');
  ctx.beginPath();
  ctx.arc(0, -31, 10, Math.PI, 0);
  ctx.fillStyle = helmetGrd;
  ctx.fill();
  ctx.stroke();
  // Face (eyes, mouth, eyebrows, cheeks)
  ctx.fillStyle = '#222';
  ctx.beginPath(); ctx.arc(-4, -30, 1.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(4, -30, 1.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(0, -26, 2.5, 0, Math.PI, false); ctx.lineWidth = 1; ctx.strokeStyle = '#a52a2a'; ctx.stroke();
  // Eyebrows
  ctx.strokeStyle = '#222'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(-6, -33); ctx.lineTo(-2, -32); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(2, -32); ctx.lineTo(6, -33); ctx.stroke();
  // Cheeks
  ctx.fillStyle = '#fbb';
  ctx.beginPath(); ctx.arc(-6, -27, 1, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(6, -27, 1, 0, Math.PI * 2); ctx.fill();
  // Arms (3D)
  let armGrd = ctx.createLinearGradient(-20, 10, -7, -15);
  armGrd.addColorStop(0, '#ffe0b2');
  armGrd.addColorStop(1, '#c99a6b');
  ctx.strokeStyle = armGrd;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-7, -15); ctx.lineTo(-20, 10); // left arm
  ctx.moveTo(7, -15); ctx.lineTo(20, 10); // right arm
  ctx.stroke();
  // Gloves (3D)
  let gloveGrd = ctx.createRadialGradient(-20, 10, 1, -20, 10, 4);
  gloveGrd.addColorStop(0, '#0ff');
  gloveGrd.addColorStop(1, '#00e6d0');
  ctx.beginPath();
  ctx.arc(-20, 10, 4, 0, Math.PI * 2);
  ctx.arc(20, 10, 4, 0, Math.PI * 2);
  ctx.fillStyle = gloveGrd;
  ctx.fill();
  ctx.strokeStyle = '#00e6d0';
  ctx.stroke();
  // Legs (3D)
  let legGrd = ctx.createLinearGradient(-10, 38, -5, 20);
  legGrd.addColorStop(0, '#444');
  legGrd.addColorStop(1, '#222');
  ctx.strokeStyle = legGrd;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(-5, 20); ctx.lineTo(-10, 38); // left leg
  ctx.moveTo(5, 20); ctx.lineTo(10, 38); // right leg
  ctx.stroke();
  // Boots (3D)
  let bootGrd = ctx.createRadialGradient(-10, 38, 1, -10, 38, 4);
  bootGrd.addColorStop(0, '#0ff');
  bootGrd.addColorStop(1, '#00e6d0');
  ctx.beginPath();
  ctx.arc(-10, 38, 4, 0, Math.PI * 2);
  ctx.arc(10, 38, 4, 0, Math.PI * 2);
  ctx.fillStyle = bootGrd;
  ctx.fill();
  ctx.strokeStyle = '#00e6d0';
  ctx.stroke();
  // Gun
  ctx.save();
  ctx.translate(14, -5);
  ctx.rotate(0.1);
  ctx.fillStyle = '#333';
  ctx.fillRect(0, -3, 24 + player.recoil, 6);
  // Muzzle flash (if shooting)
  if (player.isShooting && !player.isReloading && player.ammo > 0 && player.shootCooldown > 6) {
    ctx.save();
    ctx.translate(24 + player.recoil, 0);
    ctx.rotate(Math.random() * 0.3 - 0.15);
    ctx.fillStyle = 'rgba(255,220,80,0.8)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(12, -5);
    ctx.lineTo(12, 5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
  // Health bar
  ctx.save();
  ctx.rotate(-player.angle);
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = '#222';
  ctx.fillRect(-15, -42, 30, 6);
  ctx.fillStyle = '#0f0';
  ctx.fillRect(-15, -42, 30 * Math.max(0, player.health) / 1000, 6);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(-15, -42, 30, 6);
  ctx.restore();
  ctx.restore();

  // Draw crosshair
  ctx.save();
  ctx.strokeStyle = '#0f0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(mouse.x - 10, mouse.y); ctx.lineTo(mouse.x + 10, mouse.y);
  ctx.moveTo(mouse.x, mouse.y - 10); ctx.lineTo(mouse.x, mouse.y + 10);
  ctx.stroke();
  ctx.restore();
}

function updateHUD() {
  // Health
  const healthEl = document.getElementById('cs-health');
  if (healthEl) healthEl.textContent = player.health;
  // Kills
  updateKillCounterDisplay();
  // Ammo
  const ammoEl = document.getElementById('cs-ammo');
  if (ammoEl) ammoEl.textContent = player.isReloading ? 'RELOADING' : `${player.ammo}/${player.reserve}`;
  // Weapon
  const weaponEl = document.getElementById('cs-weapon');
  if (weaponEl) weaponEl.textContent = WEAPONS[player.weapon]?.name || player.weapon;
  // Money
  const moneyEl = document.getElementById('cs-money');
  if (moneyEl) moneyEl.textContent = `$${playerMoney}`;
  // Top bar: round, team scores (no timer)
  const roundEl = document.getElementById('cs-round');
  if (roundEl) roundEl.textContent = `Round ${score.player + score.bots + 1}`;
  const ctScoreEl = document.getElementById('cs-ct-score');
  if (ctScoreEl) ctScoreEl.textContent = score.player;
  const tScoreEl = document.getElementById('cs-t-score');
  if (tScoreEl) tScoreEl.textContent = score.bots;
}

function gameLoop() {
  update();
  render();
  updateHUD();
  requestAnimationFrame(gameLoop);
}

// Start with buy menu
showBuyMenu();
gameLoop(); 

// Mobile controls logic
const btnLeft = document.getElementById('btn-left');
const btnRight = document.getElementById('btn-right');
const btnUp = document.getElementById('btn-up');
const btnDown = document.getElementById('btn-down');
const btnShoot = document.getElementById('btn-shoot');
const btnReload = document.getElementById('btn-reload');

function setKey(key, pressed) {
  keys[key] = pressed;
}
function setShooting(pressed) {
  player.isShooting = pressed;
}
if (btnLeft) {
  btnLeft.addEventListener('touchstart', e => { e.preventDefault(); setKey('a', true); });
  btnLeft.addEventListener('touchend', e => { e.preventDefault(); setKey('a', false); });
  btnLeft.addEventListener('mousedown', e => { setKey('a', true); });
  btnLeft.addEventListener('mouseup', e => { setKey('a', false); });
  btnLeft.addEventListener('mouseleave', e => { setKey('a', false); });
}
if (btnRight) {
  btnRight.addEventListener('touchstart', e => { e.preventDefault(); setKey('d', true); });
  btnRight.addEventListener('touchend', e => { e.preventDefault(); setKey('d', false); });
  btnRight.addEventListener('mousedown', e => { setKey('d', true); });
  btnRight.addEventListener('mouseup', e => { setKey('d', false); });
  btnRight.addEventListener('mouseleave', e => { setKey('d', false); });
}
if (btnUp) {
  btnUp.addEventListener('touchstart', e => { e.preventDefault(); setKey('w', true); });
  btnUp.addEventListener('touchend', e => { e.preventDefault(); setKey('w', false); });
  btnUp.addEventListener('mousedown', e => { setKey('w', true); });
  btnUp.addEventListener('mouseup', e => { setKey('w', false); });
  btnUp.addEventListener('mouseleave', e => { setKey('w', false); });
}
if (btnDown) {
  btnDown.addEventListener('touchstart', e => { e.preventDefault(); setKey('s', true); });
  btnDown.addEventListener('touchend', e => { e.preventDefault(); setKey('s', false); });
  btnDown.addEventListener('mousedown', e => { setKey('s', true); });
  btnDown.addEventListener('mouseup', e => { setKey('s', false); });
  btnDown.addEventListener('mouseleave', e => { setKey('s', false); });
}
if (btnShoot) {
  btnShoot.addEventListener('touchstart', e => { e.preventDefault(); setShooting(true); });
  btnShoot.addEventListener('touchend', e => { e.preventDefault(); setShooting(false); });
  btnShoot.addEventListener('mousedown', e => { setShooting(true); });
  btnShoot.addEventListener('mouseup', e => { setShooting(false); });
  btnShoot.addEventListener('mouseleave', e => { setShooting(false); });
}
if (btnReload) {
  btnReload.addEventListener('touchstart', e => { e.preventDefault(); setKey('r', true); setTimeout(() => setKey('r', false), 100); });
  btnReload.addEventListener('mousedown', e => { setKey('r', true); setTimeout(() => setKey('r', false), 100); });
}

// Set fixed values
let WALL_SCALE = 0.6;
player.radius = 14;
if (typeof bots !== 'undefined') bots.forEach(bot => bot.radius = 14);

// Remove adjustEntitySizes and resize logic
// ... existing code ... 

// Update explosions
function update() {
  if (!roundActive) return;
  if (!player.alive) {
    endRound('bots');
    return;
  }
  if (bots.every(bot => !bot.alive)) {
    endRound('player');
    return;
  }
  // Movement
  let dx = 0, dy = 0;
  if (keys['w']) dy -= 1;
  if (keys['s']) dy += 1;
  if (keys['a']) dx -= 1;
  if (keys['d']) dx += 1;
  if (dx !== 0 || dy !== 0) {
    const len = Math.hypot(dx, dy);
    dx /= len; dy /= len;
    const nx = player.x + dx * player.speed;
    const ny = player.y + dy * player.speed;
    if (!collidesWithWalls(nx, ny, player.radius)) {
      player.x = nx;
      player.y = ny;
    }
  }
  // Clamp to canvas
  player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
  player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));

  // Aim
  player.angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);

  // Shooting
  if (player.isShooting && player.ammo > 0 && !player.shootCooldown && !player.isReloading) {
    shoot();
    player.shootCooldown = 10; // frames
  }
  if (player.shootCooldown) player.shootCooldown--;

  // Auto-reload if magazine is empty
  if (player.ammo === 0 && player.reserve > 0 && !player.isReloading && player.alive) {
    player.isReloading = true;
    player.reloadTimer = player.reloadTime;
  }

  // Reloading
  if (player.isReloading) {
    player.reloadTimer--;
    if (player.reloadTimer <= 0) {
      const needed = WEAPONS[player.weapon].ammo - player.ammo;
      const toLoad = Math.min(needed, player.reserve);
      player.ammo += toLoad;
      player.reserve -= toLoad;
      player.isReloading = false;
    }
  }

  // Recoil decay
  player.recoil *= 0.8;

  // Bots update
  bots.forEach(bot => bot.update());

  // Update explosions
  explosions.forEach(expl => {
    expl.r += 8;
    expl.alpha -= 0.07;
    expl.time++;
  });
  explosions = explosions.filter(e => e.alpha > 0 && e.r < e.maxR * 1.5);
} 