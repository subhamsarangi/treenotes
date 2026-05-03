export function layout(title, body, user = null) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} — Lumina</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;0,600;1,300&family=DM+Mono:wght@400;500&family=Outfit:wght@300;400;500&display=swap" rel="stylesheet">
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#0c0c0f">
<script>if(localStorage.getItem('lumina-large-text')==='1')document.documentElement.classList.add('large-text-pending')</script>
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg: #0c0c0f;
  --surface: #13131a;
  --surface2: #1a1a24;
  --border: #252535;
  --accent: #c8b4fa;
  --logo: #fdb201;
  --accent2: #7ee8b4;
  --accent3: #f4a96a;
  --text: #e8e6f0;
  --muted: #6b6880;
  --danger: #f87171;
  --r: 10px;
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: 'Outfit', sans-serif;
  font-weight: 300;
  min-height: 100vh;
  line-height: 1.7;
}

a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }

nav {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 1rem 2rem;
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  background: rgba(12,12,15,0.92);
  backdrop-filter: blur(12px);
  z-index: 100;
}

.nav-logo {
  font-family: 'Fraunces', serif;
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--logo);
  letter-spacing: -0.02em;
  text-decoration: none;
}

.nav-links { display: flex; gap: 1.5rem; margin-left: auto; align-items: center; }
.nav-links a { color: var(--muted); font-size: 0.85rem; letter-spacing: 0.05em; text-transform: uppercase; }
.nav-links a:hover { color: var(--logo); text-decoration: none; }

.nav-toggle {
  display: none;
  flex-direction: column;
  gap: 6px;
  margin-left: auto;
  cursor: pointer;
  padding: 4px;
  background: none;
  border: none;
}
.nav-toggle span {
  display: block;
  width: 22px;
  height: 2px;
  background: var(--text);
  border-radius: 2px;
  transition: transform 0.2s, opacity 0.2s;
}

@media (max-width: 640px) {
  .nav-toggle { display: flex; }

  .nav-links {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    flex-direction: column;
    gap: 0;
    margin-left: 0;
    background: rgba(12,12,15,0.97);
    border-bottom: 1px solid var(--border);
    padding: 0.5rem 0;
  }
  .nav-links.open { display: flex; }
  .nav-links a {
    padding: 0.75rem 2rem;
    font-size: 0.9rem;
  }
  .nav-links a:hover { background: var(--surface); }
}

.container { max-width: 1000px; margin: 0 auto; padding: 3rem 2rem; position: relative; z-index: 1; }
.container-wide { max-width: 1300px; margin: 0 auto; padding: 3rem 2rem; position: relative; z-index: 1; }

h1 { font-family: 'Fraunces', serif; font-weight: 300; font-size: 2.4rem; letter-spacing: -0.03em; line-height: 1.2; }
h2 { font-family: 'Fraunces', serif; font-weight: 300; font-size: 1.6rem; letter-spacing: -0.02em; }
h3 { font-size: 1rem; font-weight: 500; letter-spacing: 0.03em; text-transform: uppercase; color: var(--muted); }

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  border-radius: var(--r);
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  font-family: 'Outfit', sans-serif;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.15s;
  text-decoration: none;
}
.btn:hover { background: var(--surface2); border-color: var(--accent); color: var(--text); text-decoration: none; }
.btn-primary { background: var(--accent); color: #0c0c0f; border-color: var(--accent); font-weight: 500; }
.btn-primary:hover { opacity: 0.88; color: #fff; }
.btn-danger { border-color: var(--danger); color: var(--danger); }
.btn-danger:hover { background: var(--danger); color: #fff; }
.btn-ghost { background: transparent; border-color: transparent; color: var(--muted); }
.btn-ghost:hover { background: var(--surface); color: var(--text); border-color: var(--border); }

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r);
  padding: 1.5rem;
  transition: border-color 0.2s;
  position: relative;
  z-index: 1;
}
.card:hover { border-color: var(--accent); }

input, textarea, select {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r);
  color: var(--text);
  font-family: 'Outfit', sans-serif;
  font-size: 0.9rem;
  padding: 0.6rem 0.9rem;
  width: 100%;
  outline: none;
  transition: border-color 0.15s;
}
input:focus, textarea:focus, select:focus { border-color: var(--accent); }
textarea { resize: vertical; min-height: 120px; }

label { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); display: block; margin-bottom: 0.4rem; }

.form-group { margin-bottom: 1.2rem; }

.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.6rem;
  border-radius: 99px;
  font-size: 0.75rem;
  background: var(--surface2);
  border: 1px solid var(--border);
  color: var(--muted);
}

.star { color: var(--accent3); }

/* Blocks */
.block-heading { font-family: 'Fraunces', serif; font-weight: 300; margin: 1.8rem 0 0.6rem; }
.block-code { background: var(--surface2); border: 1px solid var(--border); border-radius: var(--r); overflow: hidden; margin: 1rem 0; }
.code-lang { display: block; font-family: 'DM Mono', monospace; font-size: 0.7rem; color: var(--muted); padding: 0.4rem 1rem; border-bottom: 1px solid var(--border); text-transform: uppercase; letter-spacing: 0.1em; }
.block-code pre { padding: 1rem; overflow-x: auto; }
.block-code code { font-family: 'DM Mono', monospace; font-size: 0.85rem; line-height: 1.7; color: var(--accent2); }
.block-callout { display: flex; gap: 0.8rem; align-items: flex-start; padding: 1rem 1.2rem; border-radius: var(--r); margin: 1rem 0; border-left: 3px solid; }
.variant-info { background: rgba(99,102,241,0.1); border-color: #6366f1; }
.variant-warning { background: rgba(244,169,106,0.1); border-color: var(--accent3); }
.variant-tip { background: rgba(126,232,180,0.1); border-color: var(--accent2); }
.variant-danger { background: rgba(248,113,113,0.1); border-color: var(--danger); }
.callout-icon { font-size: 1rem; margin-top: 0.1rem; }
.block-list { padding-left: 1.5rem; margin: 0.8rem 0; }
.block-list li { margin-bottom: 0.3rem; }
.block-table-wrap { overflow-x: auto; margin: 1rem 0; }
.block-table { width: 100%; border-collapse: collapse; }
.block-table th, .block-table td { padding: 0.6rem 1rem; border: 1px solid var(--border); text-align: left; font-size: 0.9rem; }
.block-table th { background: var(--surface2); font-weight: 500; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted); }
.block-divider { border: none; border-top: 1px solid var(--border); margin: 2rem 0; }

.page-content p { margin-bottom: 0.9rem; }

.hero-banner {
  width: 100%;
  height: 320px;
  object-fit: cover;
  display: block;
  cursor: zoom-in;
}
@media (max-width: 640px) {
  .hero-banner { height: 200px; }
}

.img-skeleton {
  background: linear-gradient(90deg, var(--surface) 25%, var(--surface2) 50%, var(--surface) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.dialog-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); z-index: 200; align-items: center; justify-content: center; }
.dialog-overlay.open { display: flex; }
.dialog { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); padding: 2rem; max-width: 420px; width: 90%; }
.dialog h2 { font-size: 1.2rem; margin-bottom: 0.6rem; }
.dialog p { color: var(--muted); font-size: 0.9rem; margin-bottom: 1.5rem; }
.dialog-actions { display: flex; gap: 0.6rem; justify-content: flex-end; }

.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
@media (max-width: 640px) { .grid-2, .grid-3 { grid-template-columns: 1fr; } }
@media (max-width: 640px) { .niches-grid { grid-template-columns: repeat(2, 1fr) !important; } }

.niche-card-link:hover .card {
  border-color: var(--niche-color, var(--accent)) !important;
  box-shadow: 0 4px 24px rgba(0,0,0,0.3);
  transform: translateY(-2px);
}

.card[onclick]:hover {
  border-color: var(--niche-color, var(--accent)) !important;
  box-shadow: 0 4px 24px rgba(0,0,0,0.3);
  transform: translateY(-2px);
}

.mt-1 { margin-top: 0.5rem; }
.mt-2 { margin-top: 1rem; }
.mt-3 { margin-top: 1.5rem; }
.mt-4 { margin-top: 2rem; }
.mb-1 { margin-bottom: 0.5rem; }
.mb-2 { margin-bottom: 1rem; }
.flex { display: flex; }
.flex-between { display: flex; justify-content: space-between; align-items: center; }
.flex-gap { display: flex; gap: 0.6rem; align-items: center; flex-wrap: wrap; }
.muted { color: var(--muted); }
.small { font-size: 0.82rem; }

.toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.toggle input {
  width: 40px;
  height: 24px;
  appearance: none;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 12px;
  cursor: pointer;
  position: relative;
  transition: background 0.2s;
  padding: 0;
  margin: 0;
}

.toggle input:checked {
  background: var(--accent2);
  border-color: var(--accent2);
}

.toggle input::before {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--surface);
  top: 1px;
  left: 1px;
  transition: left 0.2s;
}

.toggle input:checked::before {
  left: 19px;
}

/* Page loading bar */
#nprogress {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--accent);
  z-index: 9999;
  transition: width 0.3s ease;
  box-shadow: 0 0 8px var(--accent);
}

/* Button loading state */
.btn.loading {
  opacity: 0.7;
  pointer-events: none;
  position: relative;
}
.btn.loading::after {
  content: '';
  display: inline-block;
  width: 10px;
  height: 10px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  margin-left: 0.4rem;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Large text mode */
body.large-text { font-size: 1.1rem; }
body.large-text p, body.large-text .muted, body.large-text .small { font-size: 1rem; }
body.large-text .block-code code { font-size: 0.95rem; }
body.large-text input, body.large-text textarea, body.large-text select { font-size: 1rem; }
html.large-text-pending body { font-size: 1.1rem; }
html.large-text-pending p,
html.large-text-pending .muted,
html.large-text-pending .small { font-size: 1rem; }
html.large-text-pending .block-code code { font-size: 0.95rem; }
html.large-text-pending input,
html.large-text-pending textarea,
html.large-text-pending select { font-size: 1rem; }

/* Page transition overlay */
#page-loader {
  display: none;
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--accent), var(--accent2));
  z-index: 9999;
  animation: loading-bar 1.2s ease-in-out infinite;
}
#page-loader.active { display: block; }
@keyframes loading-bar {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
</style>
</head>
<body>
<canvas id="grid-canvas" style="position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:0"></canvas>
<div style="position:fixed;inset:0;pointer-events:none;z-index:0;background-image:linear-gradient(var(--accent) 1px,transparent 1px),linear-gradient(90deg,var(--accent) 1px,transparent 1px);background-size:40px 40px;opacity:0.08;-webkit-mask-image:radial-gradient(ellipse 80% 80% at 50% 50%,black 30%,transparent 100%);mask-image:radial-gradient(ellipse 80% 80% at 50% 50%,black 30%,transparent 100%)"></div>
<div id="page-loader"></div>
<nav>
  <a href="/" class="nav-logo" style="display:flex;align-items:center;gap:0.5rem"><img src="/input_nobg.png" alt="Lumina" style="height:28px;width:auto;display:block">Lumina</a>
  <button class="nav-toggle" aria-label="Toggle menu" aria-expanded="false">
    <span></span>
    <span></span>
  </button>
  <div class="nav-links">
    ${user ? `
    <a href="/">Home</a>
    <a href="/prompts">Prompts</a>
    <a href="/import">Import</a>
    <a href="/niches">Niches</a>
    <a href="/graph">Graph</a>
    <a href="/account">Account</a>
    ` : `
    <a href="/login">Sign in</a>
    <a href="/register" class="btn btn-primary" style="padding:0.4rem 1rem;font-size:0.82rem">Get started</a>
    `}
  </div>
</nav>
${body}

<div id="lightbox" style="display:none;position:fixed;inset:0;z-index:500;background:rgba(0,0,0,0.88);backdrop-filter:blur(8px);align-items:center;justify-content:center;cursor:zoom-out" onclick="document.getElementById('lightbox').style.display='none'">
  <img id="lightbox-img" src="" alt="" style="max-width:92vw;max-height:88vh;object-fit:contain;border-radius:var(--r);box-shadow:0 8px 60px rgba(0,0,0,0.6);user-select:none">
  <button onclick="document.getElementById('lightbox').style.display='none'" style="position:absolute;top:1.2rem;right:1.4rem;background:none;border:none;color:#fff;font-size:1.8rem;cursor:pointer;line-height:1;opacity:0.7" aria-label="Close">✕</button>
</div>

<button id="pwa-install" aria-label="Install app" title="Install Lumina" style="display:none;position:fixed;bottom:1.5rem;right:1.5rem;z-index:300;height:52px;min-width:52px;padding:0 1rem;border-radius:99px;border:2.5px solid #0c0c0f30;background:var(--logo);color:#0c0c0f;font-size:1.5rem;font-weight:700;cursor:pointer;box-shadow:0 4px 20px rgba(253,178,1,0.35);transition:min-width 0.25s ease,padding 0.25s ease,box-shadow 0.15s;align-items:center;justify-content:center;gap:0.5rem;overflow:hidden;white-space:nowrap">
  <span id="pwa-install-icon" style="flex-shrink:0;line-height:1;display:flex;align-items:center">⬇</span>
  <span id="pwa-install-label" style="font-family:'Outfit',sans-serif;font-size:0.88rem;font-weight:600;letter-spacing:0.03em;max-width:0;overflow:hidden;transition:max-width 0.25s ease,opacity 0.2s;opacity:0">Install</span>
</button>

<script>
(function() {
  // Apply large text preference immediately
  if (localStorage.getItem('lumina-large-text') === '1') {
    document.body.classList.add('large-text');
  }
  document.documentElement.classList.remove('large-text-pending');

  // Service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
  }

  // PWA install button
  let deferredPrompt = null;
  const installBtn = document.getElementById('pwa-install');
  installBtn.addEventListener('mouseover', () => {
    installBtn.style.boxShadow = '0 6px 28px rgba(253,178,1,0.5)';
    document.getElementById('pwa-install-label').style.maxWidth = '80px';
    document.getElementById('pwa-install-label').style.opacity = '1';
  });
  installBtn.addEventListener('mouseout', () => {
    installBtn.style.boxShadow = '0 4px 20px rgba(253,178,1,0.35)';
    document.getElementById('pwa-install-label').style.maxWidth = '0';
    document.getElementById('pwa-install-label').style.opacity = '0';
  });

  // Already installed — never show button
  const isInstalled = window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true;

  if (!isInstalled) {
    // Show button if prompt was captured on a previous page this session
    if (sessionStorage.getItem('lumina-pwa-prompt') === '1') {
      installBtn.style.display = 'flex';
    }

    window.addEventListener('beforeinstallprompt', function(e) {
      e.preventDefault();
      deferredPrompt = e;
      window._pwaPrompt = e;
      sessionStorage.setItem('lumina-pwa-prompt', '1');
      installBtn.style.display = 'flex';
    });

    installBtn.addEventListener('click', async function() {
      // Re-use stored prompt from this session if current page didn't fire the event
      const prompt = deferredPrompt || window._pwaPrompt;
      if (!prompt) return;
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') {
        installBtn.style.display = 'none';
        sessionStorage.removeItem('lumina-pwa-prompt');
      }
      deferredPrompt = null;
      window._pwaPrompt = null;
    });

    window.addEventListener('appinstalled', function() {
      installBtn.style.display = 'none';
      sessionStorage.removeItem('lumina-pwa-prompt');
      deferredPrompt = null;
    });
  }

  // Lightbox
  document.addEventListener('click', function(e) {
    const img = e.target.closest('.hero-banner');
    if (img) {
      e.preventDefault();
      const lb = document.getElementById('lightbox');
      document.getElementById('lightbox-img').src = img.src;
      document.getElementById('lightbox-img').alt = img.alt;
      lb.style.display = 'flex';
    }
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') document.getElementById('lightbox').style.display = 'none';
  });

  // Grid + spotlight on canvas
  (function() {
    const canvas = document.getElementById('grid-canvas');
    const ctx = canvas.getContext('2d');
    const CELL = 40;
    const RADIUS = 220;
    const LERP = 0.08;
    let tx = -9999, ty = -9999;
    let cx = -9999, cy = -9999;
    let raf;

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function draw() {
      cx += (tx - cx) * LERP;
      cy += (ty - cy) * LERP;

      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const buf = RADIUS + CELL;
      const x0 = Math.max(0, Math.floor((cx - buf) / CELL) * CELL);
      const x1 = Math.min(W, Math.ceil((cx + buf) / CELL) * CELL);
      const y0 = Math.max(0, Math.floor((cy - buf) / CELL) * CELL);
      const y1 = Math.min(H, Math.ceil((cy + buf) / CELL) * CELL);

      // Vertical lines
      for (let x = x0; x <= x1; x += CELL) {
        if (Math.abs(x - cx) > buf) continue;
        const grad = ctx.createLinearGradient(x, y0, x, y1);
        grad.addColorStop(0,   'rgba(253,178,1,0)');
        grad.addColorStop(0.5, lineAlpha(x, cy, cx, cy));
        grad.addColorStop(1,   'rgba(253,178,1,0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y0);
        ctx.lineTo(x, y1);
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = y0; y <= y1; y += CELL) {
        if (Math.abs(y - cy) > buf) continue;
        const grad = ctx.createLinearGradient(x0, y, x1, y);
        grad.addColorStop(0,   'rgba(253,178,1,0)');
        grad.addColorStop(0.5, lineAlpha(cx, y, cx, cy));
        grad.addColorStop(1,   'rgba(253,178,1,0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x0, y);
        ctx.lineTo(x1, y);
        ctx.stroke();
      }

      const stillMoving = Math.abs(tx - cx) > 0.5 || Math.abs(ty - cy) > 0.5;
      raf = stillMoving ? requestAnimationFrame(draw) : null;
    }

    function lineAlpha(lx, ly, cx, cy) {
      const d = Math.sqrt((lx - cx) ** 2 + (ly - cy) ** 2);
      const t = Math.max(0, 1 - d / RADIUS);
      const a = (t * t * 0.55).toFixed(3);
      return \`rgba(253,178,1,\${a})\`;
    }

    function schedule() {
      if (!raf) raf = requestAnimationFrame(draw);
    }

    // Expose for programmatic control (e.g. landing page demo animation)
    window._gridMove = function(x, y) { tx = x; ty = y; schedule(); };
    window._gridClear = function() { tx = -9999; ty = -9999; schedule(); };

    document.addEventListener('mousemove', function(e) {
      tx = e.clientX; ty = e.clientY;
      schedule();
    });

    document.addEventListener('mouseleave', function() {
      tx = -9999; ty = -9999;
      schedule();
    });

    window.addEventListener('resize', function() { resize(); schedule(); });
    resize();
    draw();
  })();

  // Nav toggle
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (toggle && navLinks) {
    toggle.addEventListener('click', function() {
      const open = navLinks.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
    });
    // Close on link click
    navLinks.querySelectorAll('a').forEach(function(a) {
      a.addEventListener('click', function() {
        navLinks.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  const loader = document.getElementById('page-loader');

  // Show loader on navigation links (not buttons, not hash, not external)
  document.addEventListener('click', function(e) {
    const a = e.target.closest('a');
    if (a && a.href && !a.href.startsWith('#') && !a.href.startsWith('javascript') &&
        a.hostname === location.hostname && !a.classList.contains('no-loader')) {
      loader.classList.add('active');
    }

    // Show loading state on submit buttons inside forms
    const btn = e.target.closest('button[type="submit"], button:not([type])');
    if (btn && btn.closest('form') && !btn.onclick) {
      btn.classList.add('loading');
    }
  });

  // Show loader on form submit
  document.addEventListener('submit', function(e) {
    loader.classList.add('active');
    const btn = e.target.querySelector('button[type="submit"], button:not([type="button"])');
    if (btn) btn.classList.add('loading');
  });

  // Hide loader when page fully loads (back/forward)
  window.addEventListener('pageshow', function() {
    loader.classList.remove('active');
    document.querySelectorAll('.btn.loading').forEach(b => b.classList.remove('loading'));
  });
})();
</script>
</body>
</html>`;
}
