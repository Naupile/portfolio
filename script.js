/* =====================================================
   PAULINE AUGEREAU — Portfolio Script
   Curseur aile de fée · Particules · Navigation
   ===================================================== */

// ===================== CURSEUR AILE DE FÉE =====================
const cursorEl = document.getElementById('cursor-wing');

// SVG aile de fée — dessiné à la main
cursorEl.innerHTML = `
<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44" fill="none">
  <!-- Aile supérieure -->
  <ellipse cx="16" cy="15" rx="14" ry="8"
    fill="rgba(221,160,221,0.78)"
    stroke="#FF69B4" stroke-width="1.4"
    transform="rotate(-28 16 15)"/>
  <!-- Aile inférieure -->
  <ellipse cx="14" cy="30" rx="9" ry="5"
    fill="rgba(255,182,193,0.65)"
    stroke="#C71585" stroke-width="1"
    transform="rotate(18 14 30)"/>
  <!-- Corps de la fée (point magique) -->
  <circle cx="17" cy="21" r="3" fill="#FFD700"/>
  <circle cx="17" cy="21" r="1.6" fill="white" opacity="0.9"/>
  <!-- Étincelle -->
  <text x="26" y="14" font-size="11" fill="#FFD700" opacity="0.9">✦</text>
</svg>`;

let mouseX = -100, mouseY = -100;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursorEl.style.left = mouseX + 'px';
  cursorEl.style.top  = mouseY + 'px';
});

// Cacher le curseur quand la souris quitte la fenêtre
document.addEventListener('mouseleave', () => { cursorEl.style.opacity = '0'; });
document.addEventListener('mouseenter', () => { cursorEl.style.opacity = '1'; });

// Petite rotation au clic
document.addEventListener('mousedown', () => {
  cursorEl.style.transform = 'translate(-10px,-8px) rotate(20deg) scale(0.85)';
});
document.addEventListener('mouseup', () => {
  cursorEl.style.transform = 'translate(-10px,-8px) rotate(0deg) scale(1)';
});

// ===================== CANVAS PARTICULES =====================
const canvas = document.getElementById('particles-canvas');
const ctx    = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const COLORS = ['#FF69B4','#DDA0DD','#FFD700','#FF1493','#E6B3FF','#FFB6C1','#C71585'];
const SYMBOLS = ['✦', '✧', '⋆', '·'];

class Particle {
  constructor(fromMouse = false, mx = 0, my = 0) {
    this.fromMouse = fromMouse;
    if (fromMouse) {
      this.x = mx + (Math.random() - 0.5) * 16;
      this.y = my + (Math.random() - 0.5) * 16;
      this.size = Math.random() * 10 + 6;
      this.life = Math.random() * 40 + 30;
    } else {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height + canvas.height * 0.1;
      this.size = Math.random() * 8 + 4;
      this.life = Math.random() * 180 + 80;
    }
    this.color  = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    this.vx     = (Math.random() - 0.5) * 0.5;
    this.vy     = -(Math.random() * 0.7 + 0.3);
    this.alpha  = Math.random() * 0.6 + 0.3;
    this.age    = 0;
    this.spin   = (Math.random() - 0.5) * 0.04;
    this.angle  = Math.random() * Math.PI * 2;
    this.dead   = false;
  }

  update() {
    this.x     += this.vx;
    this.y     += this.vy;
    this.angle += this.spin;
    this.age++;
    if (this.age > this.life) this.dead = true;
  }

  draw() {
    const fade = 1 - this.age / this.life;
    ctx.save();
    ctx.globalAlpha = this.alpha * fade;
    ctx.fillStyle   = this.color;
    ctx.font        = `${this.size}px sans-serif`;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.fillText(this.symbol, 0, 0);
    ctx.restore();
  }
}

// Particules ambiantes (fond)
const ambientParticles = [];
for (let i = 0; i < 70; i++) {
  const p = new Particle(false);
  p.age = Math.floor(Math.random() * p.life);
  ambientParticles.push(p);
}

// Particules de souris (éphémères)
const mouseParticles = [];
let frameCount = 0;

function spawnMouseParticle() {
  if (mouseX > 0 && mouseY > 0) {
    mouseParticles.push(new Particle(true, mouseX, mouseY));
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Particules ambiantes — recyclées
  ambientParticles.forEach(p => {
    p.update();
    p.draw();
    if (p.dead) {
      Object.assign(p, new Particle(false));
      p.dead = false;
    }
  });

  // Particules souris — toutes les 3 frames
  frameCount++;
  if (frameCount % 3 === 0) spawnMouseParticle();

  for (let i = mouseParticles.length - 1; i >= 0; i--) {
    mouseParticles[i].update();
    mouseParticles[i].draw();
    if (mouseParticles[i].dead) mouseParticles.splice(i, 1);
  }

  requestAnimationFrame(animateParticles);
}
animateParticles();

// ===================== SON POUSSIÈRE DE FÉE (clic menu) =====================
let fairyDustAudio = null;
let fairyDustReady = true; // cooldown pour éviter le spam

function playFairyDust() {
  if (!fairyDustReady) return;
  if (!fairyDustAudio) {
    fairyDustAudio = new Audio('assets/menu.mp3');
    fairyDustAudio.volume = 0.5;
  }
  fairyDustAudio.currentTime = 0;
  fairyDustAudio.play().catch(() => {});
  // Stopper après 0.7 s : effet court façon "tintement", pas toute la piste
  setTimeout(() => { fairyDustAudio.pause(); }, 700);
  fairyDustReady = false;
  setTimeout(() => { fairyDustReady = true; }, 700);
}

// Déclencher sur tous les boutons de navigation (winx-btn, btn-back, btn-start…)
document.addEventListener('click', (e) => {
  const btn = e.target.closest('button, .level-card, [onclick]');
  if (btn) playFairyDust();
});

// ===================== MUSIQUE DE MENU =====================
let menuBgm = null, bgmMuted = false; // ouvert par défaut

function initBgm() {
  if (!menuBgm) {
    menuBgm = new Audio('assets/retro.mp3');
    menuBgm.loop = true;
    menuBgm.volume = 0.14; // atténué pour l'ambiance fée
  }
}
function playBgm() { initBgm(); menuBgm.play().catch(() => {}); }
function stopBgm()  { if (menuBgm) { menuBgm.pause(); menuBgm.currentTime = 0; } }

const btnSound = document.getElementById('btn-sound');
if (btnSound) {
  // État initial : ouvert
  btnSound.textContent = '🔊';
  btnSound.classList.remove('muted');

  btnSound.addEventListener('click', (e) => {
    e.stopPropagation();
    bgmMuted = !bgmMuted;
    btnSound.textContent = bgmMuted ? '🔇' : '🔊';
    btnSound.classList.toggle('muted', bgmMuted);
    bgmMuted ? (menuBgm && menuBgm.pause()) : playBgm();
  });
}

// ===================== NAVIGATION ENTRE ÉCRANS =====================
const screens = {
  title:     document.getElementById('screen-title'),
  menu:      document.getElementById('screen-menu'),
  about:     document.getElementById('screen-about'),
  creations: document.getElementById('screen-creations'),
  game:      document.getElementById('screen-game'),
};

let gameTimeout = null;

function goTo(name) {
  // Annuler un lancement de jeu en cours
  if (gameTimeout) {
    clearTimeout(gameTimeout);
    gameTimeout = null;
  }

  if (name === 'game') {
    launchGame();
    return;
  }

  Object.values(screens).forEach(s => s.classList.remove('active'));

  const target = screens[name];
  if (!target) return;

  target.classList.add('active');

  // Remonter en haut sur les écrans défilants
  if (target.classList.contains('screen-scroll')) {
    target.scrollTop = 0;
  }

  // Lancer la musique à l'entrée du menu (premier clic utilisateur)
  if (name === 'menu' && !bgmMuted) playBgm();

  // Stopper la musique si on revient au titre
  if (name === 'title') {
    stopBgm();
    bgmMuted = true;
    if (btnSound) { btnSound.textContent = '🔇'; btnSound.classList.add('muted'); }
  }

  // Relancer les animations de barres à chaque ouverture de l'onglet About
  if (name === 'about') {
    resetSkillBars();
  }
}

// ===================== ANIMATION BARRES DE COMPÉTENCES =====================
function resetSkillBars() {
  document.querySelectorAll('.bar-fill').forEach(bar => {
    bar.style.animation = 'none';
    bar.style.width = '0';
    bar.offsetHeight; // reflow
    bar.style.animation = '';
  });
}

// ===================== LANCEMENT DU JEU =====================
function launchGame() {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens.game.classList.add('active');

  // Réinitialiser et lancer la barre de chargement
  const fill = document.getElementById('loading-fill');
  fill.style.transition = 'none';
  fill.style.width = '0%';

  requestAnimationFrame(() => {
    fill.style.transition = 'width 2s ease';
    fill.style.width = '100%';
  });

  // Ouvrir le jeu dans un nouvel onglet après 2s
  gameTimeout = setTimeout(() => {
    // Mets ici l'URL de ton jeu hébergé (GitHub Pages ou dossier /jeu/)
    window.open('jeu/index.html', '_blank');
    goTo('menu');
  }, 2200);
}

// Annuler le lancement du jeu
function cancelGame() {
  if (gameTimeout) {
    clearTimeout(gameTimeout);
    gameTimeout = null;
  }
  goTo('menu');
}

// ===================== BOUTON PRESS START =====================
document.getElementById('btn-start').addEventListener('click', () => goTo('menu'));

// ===================== CLAVIER =====================
document.addEventListener('keydown', (e) => {
  const active = Object.entries(screens).find(([, s]) => s.classList.contains('active'));
  if (!active) return;
  const [name] = active;

  if (e.key === 'Escape' || e.key === 'Backspace') {
    if (name === 'menu')                          goTo('title');
    if (['about','creations','game'].includes(name)) goTo('menu');
  }

  if (e.key === 'Enter' && name === 'title') goTo('menu');
});

// Accessibilité : cartes de niveau navigables au clavier
document.querySelectorAll('.level-card').forEach(card => {
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      card.click();
    }
  });
});
