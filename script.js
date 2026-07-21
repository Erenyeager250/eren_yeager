/**
 * Eren Yeager Portfolio — script.js
 * 1. Native Video Background Control (auto-unmute on first interaction)
 * 2. Canvas Floating Ember Particles & Interactive Cursor Ember Trail
 * 3. Smooth Custom Glowing Cursor & Ripple Click Shockwave
 * 4. 3D Parallax Card Tilt & Spotlight Effect
 */

// ==========================================================================
// 1. Video — show immediately, auto-unmute on first interaction
// ==========================================================================
const bgVideo = document.getElementById('bg-video');

function handleFirstInteraction() {
  if (bgVideo) {
    bgVideo.muted = false;
    bgVideo.volume = 0.2;
  }
  ['click', 'keydown', 'touchstart', 'scroll'].forEach(evt =>
    document.removeEventListener(evt, handleFirstInteraction)
  );
}

['click', 'keydown', 'touchstart', 'scroll'].forEach(evt =>
  document.addEventListener(evt, handleFirstInteraction, { once: true })
);


// ==========================================================================
// 2. Custom Glowing Cursor & Movement Physics
// ==========================================================================
const cursorDot = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let ringX = mouseX;
let ringY = mouseY;
let isMoving = false;

window.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  isMoving = true;

  if (cursorDot) {
    cursorDot.style.left = `${mouseX}px`;
    cursorDot.style.top = `${mouseY}px`;
  }

  // Smooth background video 3D parallax drift
  const px = (e.clientX / window.innerWidth - 0.5) * 20;
  const py = (e.clientY / window.innerHeight - 0.5) * 20;
  if (bgVideo) {
    bgVideo.style.transform = `translate(calc(-50% + ${-px}px), calc(-50% + ${-py}px)) scale(1.06)`;
  }

  // Spawn ember particles behind cursor movement
  if (Math.random() < 0.35) {
    spawnCursorEmber(mouseX, mouseY);
  }
});

// Smooth lerp loop for outer cursor ring
function renderCursorRing() {
  ringX += (mouseX - ringX) * 0.18;
  ringY += (mouseY - ringY) * 0.18;

  if (cursorRing) {
    cursorRing.style.left = `${ringX}px`;
    cursorRing.style.top = `${ringY}px`;
  }

  requestAnimationFrame(renderCursorRing);
}
renderCursorRing();

// Add hover effect to interactive elements
function setupCursorHoverEffects() {
  const interactiveSelectors = 'a, button, .link-card, .avatar-circle, .emblem-wrapper, .stat-badge';
  document.querySelectorAll(interactiveSelectors).forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('hovering-link'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('hovering-link'));
  });
}
setupCursorHoverEffects();

// Click Shockwave Ripple & Ember Burst
window.addEventListener('click', e => {
  const ripple = document.createElement('div');
  ripple.className = 'click-ripple';
  ripple.style.left = `${e.clientX}px`;
  ripple.style.top = `${e.clientY}px`;
  document.body.appendChild(ripple);

  // Burst of 8 embers on click
  for (let i = 0; i < 8; i++) {
    spawnCursorEmber(e.clientX, e.clientY);
  }

  setTimeout(() => ripple.remove(), 600);
});


// ==========================================================================
// 3. Canvas Ember Particles & Cursor Ember Trail
// ==========================================================================
const canvas = document.getElementById('ember-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let cursorEmbers = [];
const PARTICLE_COUNT = 45;

function resizeCanvas() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', () => { resizeCanvas(); initParticles(); });
resizeCanvas();

class EmberParticle {
  constructor() { this.reset(true); }

  reset(scatter = false) {
    this.x = Math.random() * canvas.width;
    this.y = scatter ? Math.random() * canvas.height : canvas.height + Math.random() * 50;
    this.size = Math.random() * 2.5 + 0.5;
    this.speedY = -(Math.random() * 1.2 + 0.4);
    this.speedX = (Math.random() - 0.5) * 0.8;
    this.opacity = scatter ? Math.random() * 0.4 : 0;
    this.maxOpacity = Math.random() * 0.55 + 0.2;
    this.fadeSpeed = Math.random() * 0.01 + 0.005;
    const colors = ['rgba(240,90,35,', 'rgba(255,140,0,', 'rgba(226,45,10,', 'rgba(255,69,0,'];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }

  update() {
    this.y += this.speedY;
    this.x += this.speedX;
    this.speedX += (Math.random() - 0.5) * 0.05;
    this.speedX = Math.max(-1.5, Math.min(1.5, this.speedX));

    if (this.y > canvas.height * 0.8) {
      if (this.opacity < this.maxOpacity) this.opacity += this.fadeSpeed;
    } else if (this.y < canvas.height * 0.3) {
      this.opacity -= this.fadeSpeed;
    }

    if (this.y < 0 || this.opacity <= 0) this.reset(false);
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.shadowBlur = this.size > 2 ? 8 : 0;
    ctx.shadowColor = 'rgba(240,90,35,0.8)';
    ctx.fillStyle = this.color + Math.max(0, this.opacity) + ')';
    ctx.fill();
  }
}

class CursorEmber {
  constructor(x, y) {
    this.x = x + (Math.random() - 0.5) * 8;
    this.y = y + (Math.random() - 0.5) * 8;
    this.size = Math.random() * 3 + 1;
    this.speedX = (Math.random() - 0.5) * 1.5;
    this.speedY = (Math.random() - 0.5) * 1.5 - 0.5;
    this.opacity = 0.9;
    this.decay = Math.random() * 0.025 + 0.02;
    const colors = ['rgba(255,100,20,', 'rgba(255,160,30,', 'rgba(255,50,0,'];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.opacity -= this.decay;
  }

  draw() {
    if (this.opacity <= 0) return;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(255,90,20,0.9)';
    ctx.fillStyle = this.color + Math.max(0, this.opacity) + ')';
    ctx.fill();
  }
}

// ==========================================================================
// Cherry Blossom (Sakura) Petals Animation
// ==========================================================================
class SakuraPetal {
  constructor(scatter = false) {
    this.reset(scatter);
  }

  reset(scatter = false) {
    // Spawns from top corner drifting diagonally
    this.x = scatter ? Math.random() * canvas.width : Math.random() * (canvas.width * 0.7) - 100;
    this.y = scatter ? Math.random() * canvas.height : -30 - Math.random() * 60;
    this.size = Math.random() * 6 + 5;
    this.speedY = Math.random() * 0.8 + 0.5;
    this.speedX = Math.random() * 1.1 + 0.4;
    this.angle = Math.random() * Math.PI * 2;
    this.spinSpeed = (Math.random() - 0.5) * 0.025;
    this.oscillation = Math.random() * 0.02 + 0.01;
    this.opacity = Math.random() * 0.5 + 0.35;

    const colors = [
      'rgba(255, 183, 197,',
      'rgba(255, 192, 203,',
      'rgba(255, 218, 224,',
      'rgba(255, 160, 190,'
    ];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }

  update() {
    this.y += this.speedY;
    this.x += this.speedX + Math.sin(this.angle) * 0.5;
    this.angle += this.spinSpeed;

    if (this.y > canvas.height + 40 || this.x > canvas.width + 40) {
      this.reset(false);
    }
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    ctx.beginPath();
    ctx.moveTo(0, -this.size / 2);
    ctx.bezierCurveTo(this.size / 2, -this.size, this.size, 0, 0, this.size);
    ctx.bezierCurveTo(-this.size, 0, -this.size / 2, -this.size, 0, -this.size / 2);

    ctx.fillStyle = this.color + Math.max(0, this.opacity) + ')';
    ctx.shadowBlur = 6;
    ctx.shadowColor = 'rgba(255, 182, 193, 0.4)';
    ctx.fill();
    ctx.restore();
  }
}

let sakuraPetals = [];
const SAKURA_COUNT = 30;

function spawnCursorEmber(x, y) {
  if (cursorEmbers.length < 35) {
    cursorEmbers.push(new CursorEmber(x, y));
  }
}

function initParticles() {
  particles = Array.from({ length: PARTICLE_COUNT }, () => new EmberParticle());
  sakuraPetals = Array.from({ length: SAKURA_COUNT }, () => new SakuraPetal(true));
}
initParticles();

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Floating embers
  particles.forEach(p => { p.update(); p.draw(); });

  // Floating Cherry Blossom Petals from top corner
  sakuraPetals.forEach(sp => { sp.update(); sp.draw(); });

  // Cursor trail embers
  for (let i = cursorEmbers.length - 1; i >= 0; i--) {
    const ce = cursorEmbers[i];
    ce.update();
    ce.draw();
    if (ce.opacity <= 0) cursorEmbers.splice(i, 1);
  }

  requestAnimationFrame(animate);
}
animate();


// ==========================================================================
// 4. Card 3D Tilt & Interactive Spotlight Effect
// ==========================================================================
document.querySelectorAll('.link-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    card.style.setProperty('--x', `${x}px`);
    card.style.setProperty('--y', `${y}px`);
    const rx = (0.5 - y / r.height) * 14;
    const ry = (x / r.width - 0.5) * 14;
    card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
  });
});
