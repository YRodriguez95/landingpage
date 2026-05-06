// ═══════════════════════════════════════════
// SISTEMA DE ESPORAS — THE LAST OF US LOADER
// ═══════════════════════════════════════════

const canvas = document.getElementById('sporeCanvas');
const ctx = canvas.getContext('2d');

let W, H, spores = [], filaments = [], dustParticles = [];

function revealLoaderType() {
  document.body.classList.add('loader-type-ready');
}

if (document.fonts && document.fonts.load) {
  document.fonts.load('1em "Special Elite"').then(revealLoaderType, revealLoaderType);
} else {
  revealLoaderType();
}

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', () => { resize(); init(); });

// Paleta de esporas
const SPORE_COLORS = [
  '#4a7c59', '#6dbf7e', '#3d6b4a', '#c9a84c',
  '#b5602a', '#2d5a3a', '#8fc49a', '#7aad6b',
];

// ── Espora individual ──
class Spore {
  constructor() { this.reset(true); }

  reset(init = false) {
    this.x = Math.random() * W;
    this.y = init ? Math.random() * H : H + 20;
    this.r = 1.2 + Math.random() * 3.5;
    this.color = SPORE_COLORS[Math.floor(Math.random() * SPORE_COLORS.length)];
    this.alpha = 0.2 + Math.random() * 0.7;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = -(0.08 + Math.random() * 0.35);
    this.wobble = Math.random() * Math.PI * 2;
    this.wobbleSpeed = 0.008 + Math.random() * 0.015;
    this.wobbleAmp = 0.3 + Math.random() * 0.6;
    this.pulse = Math.random() * Math.PI * 2;
    this.pulseSpeed = 0.02 + Math.random() * 0.03;
    this.tailLen = 4 + Math.random() * 18;
    this.tailAlpha = 0.08 + Math.random() * 0.2;
    this.glow = Math.random() < 0.3;
  }

  update() {
    this.wobble += this.wobbleSpeed;
    this.pulse  += this.pulseSpeed;
    this.x += this.vx + Math.sin(this.wobble) * this.wobbleAmp;
    this.y += this.vy;
    if (this.y < -20 || this.x < -30 || this.x > W + 30) this.reset();
  }

  draw(ctx) {
    const pr = this.r + Math.sin(this.pulse) * 0.4;
    // Tail
    ctx.save();
    ctx.strokeStyle = this.color;
    ctx.globalAlpha = this.tailAlpha * this.alpha;
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y + pr);
    ctx.lineTo(this.x + (Math.random()-0.5)*2, this.y + pr + this.tailLen);
    ctx.stroke();
    ctx.restore();

    // Glow halo
    if (this.glow) {
      const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, pr * 4);
      g.addColorStop(0, this.color + '44');
      g.addColorStop(1, 'transparent');
      ctx.save();
      ctx.globalAlpha = this.alpha * 0.5;
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(this.x, this.y, pr * 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Cuerpo
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = this.glow ? 10 : 4;
    ctx.beginPath();
    ctx.arc(this.x, this.y, pr, 0, Math.PI * 2);
    ctx.fill();
    // Brillo interior
    ctx.fillStyle = '#ffffff22';
    ctx.beginPath();
    ctx.arc(this.x - pr*0.25, this.y - pr*0.25, pr * 0.35, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }
}

// ── Polvo ambiental fino ──
class Dust {
  constructor() { this.reset(true); }
  reset(init=false) {
    this.x = Math.random() * W;
    this.y = init ? Math.random() * H : H + 5;
    this.r = 0.3 + Math.random() * 1.2;
    this.alpha = 0.05 + Math.random() * 0.2;
    this.vy = -(0.04 + Math.random() * 0.12);
    this.vx = (Math.random()-0.5)*0.15;
    this.color = Math.random() < 0.5 ? '#6dbf7e' : '#c9a84c';
  }
  update() {
    this.x += this.vx; this.y += this.vy;
    if (this.y < -5) this.reset();
  }
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }
}

// ── Filamentos de moho en el suelo ──
function generateVeins() {
  const svg = document.getElementById('veinsSvg');
  svg.innerHTML = '';
  const count = 18;
  for (let i = 0; i < count; i++) {
    const startX = Math.random() * W;
    const startY = H * (0.6 + Math.random() * 0.4);
    let d = `M ${startX} ${startY}`;
    let x = startX, y = startY;
    const steps = 5 + Math.floor(Math.random() * 8);
    for (let s = 0; s < steps; s++) {
      const cx1 = x + (Math.random()-0.5)*120;
      const cy1 = y - Math.random()*80;
      x += (Math.random()-0.5)*140;
      y -= Math.random()*60;
      d += ` Q ${cx1} ${cy1} ${x} ${y}`;
    }
    const path = document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('d', d);
    const colors = ['#2d5a3a','#4a7c59','#3d6b2a','#1a3d26'];
    path.setAttribute('stroke', colors[Math.floor(Math.random()*colors.length)]);
    path.setAttribute('stroke-width', (0.4 + Math.random()*1.5).toString());
    path.setAttribute('fill', 'none');
    path.setAttribute('opacity', (0.2 + Math.random()*0.5).toString());
    svg.appendChild(path);
  }
  // Venas superiores
  for (let i = 0; i < 8; i++) {
    const sx = Math.random() * W, sy = Math.random() * H * 0.4;
    let d = `M ${sx} ${sy}`, x=sx, y=sy;
    for (let s=0;s<4;s++){
      const cx=x+(Math.random()-.5)*100, cy=y+(Math.random()-.5)*60;
      x+=(Math.random()-.5)*80; y+=(Math.random()-.5)*40;
      d+=` Q ${cx} ${cy} ${x} ${y}`;
    }
    const p=document.createElementNS('http://www.w3.org/2000/svg','path');
    p.setAttribute('d',d);
    p.setAttribute('stroke','#4a7c5955');
    p.setAttribute('stroke-width',(0.3+Math.random()).toString());
    p.setAttribute('fill','none');
    svg.appendChild(p);
  }
}

function init() {
  spores = Array.from({length: 180}, ()=> new Spore());
  dustParticles = Array.from({length: 220}, ()=> new Dust());
  generateVeins();
}

// ── Niebla orgánica ──
function drawAtmosphere() {
  const g1 = ctx.createRadialGradient(W*0.2, H*0.8, 0, W*0.2, H*0.8, H*0.6);
  g1.addColorStop(0, '#1a3d2222');
  g1.addColorStop(1, 'transparent');
  ctx.fillStyle = g1; ctx.fillRect(0,0,W,H);

  const g2 = ctx.createRadialGradient(W*0.8, H*0.15, 0, W*0.8, H*0.15, H*0.5);
  g2.addColorStop(0, '#2d3a1622');
  g2.addColorStop(1, 'transparent');
  ctx.fillStyle = g2; ctx.fillRect(0,0,W,H);
}

// ── Loop de animación ──
function animate() {
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle = '#0a0d08';
  ctx.fillRect(0,0,W,H);

  drawAtmosphere();
  dustParticles.forEach(d => { d.update(); d.draw(ctx); });
  spores.forEach(s => { s.update(); s.draw(ctx); });

  // Vignette
  const vg = ctx.createRadialGradient(W/2,H/2,H*0.25,W/2,H/2,H*0.85);
  vg.addColorStop(0,'transparent');
  vg.addColorStop(1,'#00000088');
  ctx.fillStyle = vg;
  ctx.fillRect(0,0,W,H);

  requestAnimationFrame(animate);
}

// ═══════════════════════════════
// PROGRESO SIMULADO
// ═══════════════════════════════
const messages = [
  'ESCANEANDO ESPORAS ACTIVAS...',
  'CONECTANDO A RED FÚNGICA...',
  'MAPEANDO ZONAS DE INFECCIÓN...',
  'SINCRONIZANDO DATOS CORDYCEPS...',
  'LOCALIZANDO SUPERVIVIENTES...',
  'CALIBRANDO SEÑAL DE RADIO...',
  'CARGANDO MAPA DE CUARENTENA...',
  'SISTEMA LISTO.',
];

let progress = 0;
const fillEl = document.getElementById('progressFill');
const pctEl  = document.getElementById('progressPercent');
const statEl = document.getElementById('statusLine');

let msgIdx = 0;
const msgInterval = setInterval(()=>{
  if (msgIdx < messages.length) statEl.textContent = messages[msgIdx++];
}, 480);

const progInterval = setInterval(()=>{
  const speed = progress < 30 ? 1.4 : progress < 75 ? 0.6 : 1.1;
  progress = Math.min(100, progress + speed * (0.6 + Math.random()*0.8));
  fillEl.style.width = progress + '%';
  pctEl.textContent  = Math.round(progress) + '%';

  if (progress >= 100) {
    clearInterval(progInterval);
    clearInterval(msgInterval);
    statEl.textContent = 'ACCESO CONCEDIDO.';
    setTimeout(showMain, 900);
  }
}, 60);

function showMain() {
  document.getElementById('loader').classList.add('hidden');
  document.getElementById('mainPage').classList.add('visible');
  if (scrollTopButton) {
    scrollTopButton.classList.add('is-ready');
  }
}

// ═══════════════════════════════
// EFECTO ZOMBIE EN TARJETAS
// Función reutilizable para todas las tarjetas
// ═══════════════════════════════
function setupZombieMask(wrapperId, maskId) {
  const wrapper = document.querySelector(`[data-wrapper="${wrapperId}"]`);
  const mask    = document.querySelector(`[data-mask="${maskId}"]`);
  if (!wrapper || !mask) return;

  wrapper.addEventListener('mouseenter', () => {
    mask.style.opacity = '1';
  });

  wrapper.addEventListener('mouseleave', () => {
    mask.style.opacity = '0';
    mask.style.setProperty('--mx', '-200px');
    mask.style.setProperty('--my', '-200px');
  });

  wrapper.addEventListener('mousemove', (e) => {
    const rect = wrapper.getBoundingClientRect();
    mask.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
    mask.style.setProperty('--my', (e.clientY - rect.top)  + 'px');
  });
}

// Inicializar efecto para cada personaje
setupZombieMask('joel',  'joel');
setupZombieMask('ellie', 'ellie');
setupZombieMask('abby',  'abby');

const zombieSwitcher = document.getElementById('zombieSwitcher');
if (zombieSwitcher) {
  const switcherLabels = ['Tipos de zombies', 'Caracteristicas', 'Etapas'];
  let switcherIndex = 0;

  zombieSwitcher.addEventListener('mouseenter', () => {
    switcherIndex = (switcherIndex + 1) % switcherLabels.length;
    zombieSwitcher.classList.add('is-changing');

    setTimeout(() => {
      zombieSwitcher.textContent = switcherLabels[switcherIndex];
      zombieSwitcher.classList.remove('is-changing');
    }, 170);
  });
}

const cityScene = document.getElementById('cityScene');
if (cityScene) {
  const sceneLayers = cityScene.querySelectorAll('.scene-layer');

  cityScene.addEventListener('mousemove', (event) => {
    const rect = cityScene.getBoundingClientRect();
    const offsetX = (event.clientX - rect.left) / rect.width - 0.5;
    const offsetY = (event.clientY - rect.top) / rect.height - 0.5;

    sceneLayers.forEach((layer) => {
      const depth = Number(layer.dataset.depth || 0);
      const moveX = offsetX * depth;
      const moveY = offsetY * depth * 0.65;
      layer.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
    });
  });

  cityScene.addEventListener('mouseleave', () => {
    sceneLayers.forEach((layer) => {
      layer.style.transform = 'translate3d(0, 0, 0)';
    });
  });
}

const safeLockForm = document.getElementById('safeLockForm');
const safeLockPanel = document.getElementById('safeLockPanel');
const safeLockStatus = document.getElementById('safeLockStatus');
const safeLockFeedback = document.getElementById('safeLockFeedback');
const safeAlert = document.getElementById('safeAlert');
const safeAlertBox = document.getElementById('safeAlertBox');
const quarantineLockout = document.getElementById('quarantineLockout');
const lockedContent = document.getElementById('lockedContent');
const scrollTopButton = document.getElementById('scrollTopButton');
const purchaseForm = document.getElementById('purchaseForm');
const purchaseFeedback = document.getElementById('purchaseFeedback');

if (safeLockForm && safeLockPanel && safeLockStatus && safeLockFeedback && safeAlert && safeAlertBox && quarantineLockout && lockedContent) {
  const safeInputs = [
    document.getElementById('safeFirst'),
    document.getElementById('safeSecond'),
    document.getElementById('safeThird'),
  ];
  const safeCode = ['11', '10', '95'];
  let failedAttempts = 0;
  let safeAlertTimeout;
  let isLockedOut = false;

  function showSafeAlert(message) {
    safeAlertBox.textContent = message;
    safeAlert.classList.add('is-visible');
    clearTimeout(safeAlertTimeout);
    safeAlertTimeout = setTimeout(() => {
      safeAlert.classList.remove('is-visible');
    }, 2200);
  }

  function activateLockout() {
    isLockedOut = true;
    clearTimeout(safeAlertTimeout);
    safeAlert.classList.remove('is-visible');
    safeLockPanel.classList.remove('safe-success');
    safeLockPanel.classList.add('safe-error');
    safeLockStatus.textContent = 'ESTADO: ACCESO DENEGADO';
    safeLockFeedback.textContent = 'La zona de cuarentena te ha expulsado.';
    safeInputs.forEach((input) => {
      if (!input) return;
      input.disabled = true;
    });
    const submitButton = safeLockForm.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
    }
    document.body.classList.add('locked-screen');
    quarantineLockout.scrollTop = 0;
    quarantineLockout.classList.add('is-active');
  }

  safeInputs.forEach((input) => {
    if (!input) return;

    input.addEventListener('input', () => {
      if (isLockedOut) return;
      const numericValue = input.value.replace(/\D/g, '').slice(0, 2);
      input.value = numericValue;
      safeLockPanel.classList.remove('safe-error', 'safe-success');
      safeLockStatus.textContent = 'ESTADO: BLOQUEADO';
      safeLockFeedback.textContent = 'Introduce tres bloques numericos en formato XX-XX-XX.';
    });

    input.addEventListener('blur', () => {
      if (input.value === '') return;
      input.value = input.value.padStart(2, '0');
    });
  });

  safeLockForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (isLockedOut) return;

    const enteredCode = safeInputs.map((input) => (input?.value || '').padStart(2, '0'));
    const isCorrect = enteredCode.every((value, index) => value === safeCode[index]);

    safeLockPanel.classList.remove('safe-error', 'safe-success');
    void safeLockPanel.offsetWidth;

    if (isCorrect) {
      failedAttempts = 0;
      safeLockPanel.classList.add('safe-success');
      safeLockStatus.textContent = 'ESTADO: DESBLOQUEADO';
      safeLockFeedback.textContent = 'Combinacion correcta. Acceso concedido al sector abandonado.';
      lockedContent.setAttribute('aria-hidden', 'false');
      safeAlert.classList.remove('is-visible');
      clearTimeout(safeAlertTimeout);
      lockedContent.hidden = false;
      requestAnimationFrame(() => {
        lockedContent.classList.add('is-revealed');
      });
      setTimeout(() => {
        lockedContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 220);
      return;
    }

    failedAttempts += 1;
    safeLockPanel.classList.add('safe-error');
    safeLockStatus.textContent = 'ESTADO: INTENTO FALLIDO';
    safeLockFeedback.textContent = 'Combinacion incorrecta. Ajusta los diales y vuelve a intentarlo.';

    if (failedAttempts === 1) {
      showSafeAlert('No es la correcta, prueba otra vez!');
      return;
    }

    if (failedAttempts === 2) {
      showSafeAlert('¡Cuidado, ultima oportunidad!');
      return;
    }

    activateLockout();
  });
}

if (purchaseForm && purchaseFeedback) {
  purchaseForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!purchaseForm.checkValidity()) {
      purchaseFeedback.textContent = 'Rellena los campos obligatorios antes de confirmar la compra.';
      return;
    }

    const buyerName = document.getElementById('buyerName');
    const buyerEdition = document.getElementById('buyerEdition');
    const buyerPlatform = document.getElementById('buyerPlatform');

    const name = buyerName?.value.trim() || 'superviviente';
    const edition = buyerEdition?.value || 'tu edicion';
    const platform = buyerPlatform?.value || 'tu plataforma';

    purchaseForm.classList.add('is-submitted');
    purchaseFeedback.textContent = `${name}, tu pedido de la edicion ${edition} para ${platform} ha sido registrado.`;
    purchaseForm.reset();
  });
}

if (scrollTopButton) {
  scrollTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  });
}

document.querySelectorAll('.nav-links a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const targetId = link.getAttribute('href');
    const target = targetId ? document.querySelector(targetId) : null;
    if (!target) return;

    event.preventDefault();

    const nav = document.querySelector('nav');
    const navHeight = nav ? nav.getBoundingClientRect().height : 0;
    const extraGap = window.matchMedia('(max-width: 700px)').matches ? 14 : 24;
    const targetTop = target.getBoundingClientRect().top + window.pageYOffset - navHeight - extraGap;

    window.scrollTo({
      top: Math.max(0, targetTop),
      left: 0,
      behavior: 'smooth',
    });

    history.pushState(null, '', targetId);
  });
});

function setupFrameSequence(hostSelector, frameTotal, framePathFactory) {
  const sequenceHost = document.querySelector(hostSelector);
  if (!sequenceHost) return;

  const frameStack = document.createElement('div');
  const frames = [];
  const fragment = document.createDocumentFragment();
  let loadedFrames = 0;
  let isSequenceLoaded = false;
  let hasStartedPreload = false;
  let isPointerInside = false;

  frameStack.className = 'clicker-frame-stack';

  const preloadRemainingFrames = () => {
    if (hasStartedPreload) return;
    hasStartedPreload = true;

    frames.slice(1).forEach((frame, index) => {
      window.setTimeout(() => {
        frame.src = frame.dataset.src;
      }, index * 18);
    });
  };

  const markFrameLoaded = (eventOrFrame) => {
    const frame = eventOrFrame?.currentTarget || eventOrFrame;

    if (frame?.dataset.sequenceLoaded === 'true') return;
    if (frame) frame.dataset.sequenceLoaded = 'true';

    loadedFrames += 1;

    if (loadedFrames === 1) {
      window.requestAnimationFrame(() => {
        sequenceHost.classList.add('is-sequence-ready');
      });
      preloadRemainingFrames();
    }

    if (loadedFrames >= frameTotal) {
      isSequenceLoaded = true;
      sequenceHost.classList.add('is-sequence-loaded');
      if (isPointerInside) startSequence();
    }
  };

  for (let index = 0; index < frameTotal; index++) {
    const currentFrame = String(index).padStart(4, '0');
    const nextFrame = String(index + 1).padStart(4, '0');
    const frame = document.createElement('img');
    const frameSrc = framePathFactory(currentFrame, nextFrame);

    frame.className = 'clicker-frame';
    frame.alt = '';
    frame.loading = index === 0 ? 'eager' : 'lazy';
    frame.decoding = 'async';
    frame.addEventListener('load', markFrameLoaded, { once: true });
    frame.addEventListener('error', markFrameLoaded, { once: true });

    if (index === 0) {
      frame.src = frameSrc;
      frame.classList.add('is-visible');
    } else {
      frame.dataset.src = frameSrc;
    }

    frames.push(frame);
    fragment.appendChild(frame);
  }

  frameStack.appendChild(fragment);
  sequenceHost.appendChild(frameStack);

  let activeFrame = 0;
  let sequenceInterval = null;

  const showFrame = (frameIndex) => {
    frames[activeFrame].classList.remove('is-visible');
    activeFrame = frameIndex;
    frames[activeFrame].classList.add('is-visible');
  };

  const startSequence = () => {
    if (sequenceInterval !== null || !isSequenceLoaded) return;

    sequenceInterval = window.setInterval(() => {
      const nextFrame = (activeFrame + 1) % frames.length;
      showFrame(nextFrame);
    }, 90);
  };

  const stopSequence = () => {
    if (sequenceInterval !== null) {
      window.clearInterval(sequenceInterval);
      sequenceInterval = null;
    }

    showFrame(0);
  };

  if (frames[0].complete) markFrameLoaded(frames[0]);

  sequenceHost.addEventListener('mouseenter', () => {
    isPointerInside = true;
    startSequence();
  });
  sequenceHost.addEventListener('mouseleave', () => {
    isPointerInside = false;
    stopSequence();
  });
}

// Arrancar
document.querySelectorAll('[data-hover-video]').forEach((video) => {
  const videoHost = video.closest('.race-photo') || video;

  videoHost.addEventListener('mouseenter', () => {
    video.play().catch(() => {});
  });

  videoHost.addEventListener('mouseleave', () => {
    video.pause();
    video.currentTime = 0;
  });
});

init();
animate();
