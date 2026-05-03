export function layout(title, body, user = null) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} — Lumina</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;0,600;1,300&family=DM+Mono:wght@400;500&family=Outfit:wght@300;400;500&display=swap" rel="stylesheet">
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg: #0c0c0f;
  --surface: #13131a;
  --surface2: #1a1a24;
  --border: #252535;
  --accent: #c8b4fa;
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
  color: var(--accent);
  letter-spacing: -0.02em;
  text-decoration: none;
}

.nav-links { display: flex; gap: 1.5rem; margin-left: auto; align-items: center; }
.nav-links a { color: var(--muted); font-size: 0.85rem; letter-spacing: 0.05em; text-transform: uppercase; }
.nav-links a:hover { color: var(--text); text-decoration: none; }

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

.container { max-width: 1000px; margin: 0 auto; padding: 3rem 2rem; }
.container-wide { max-width: 1300px; margin: 0 auto; padding: 3rem 2rem; }

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
<div id="page-loader"></div>
<nav>
  <a href="/" class="nav-logo">✦ Lumina</a>
  <button class="nav-toggle" aria-label="Toggle menu" aria-expanded="false">
    <span></span>
    <span></span>
  </button>
  <div class="nav-links">
    <a href="/">Home</a>
    <a href="/prompts">Prompts</a>
    <a href="/import">Import</a>
    <a href="/niches">Niches</a>
    <a href="/graph">Graph</a>
    ${user ? `
    <a href="/account" style="color:var(--muted);font-size:0.85rem;letter-spacing:0.05em;text-transform:uppercase">${user.email}</a>
    ` : ''}
  </div>
</nav>
${body}

<div id="lightbox" style="display:none;position:fixed;inset:0;z-index:500;background:rgba(0,0,0,0.88);backdrop-filter:blur(8px);align-items:center;justify-content:center;cursor:zoom-out" onclick="document.getElementById('lightbox').style.display='none'">
  <img id="lightbox-img" src="" alt="" style="max-width:92vw;max-height:88vh;object-fit:contain;border-radius:var(--r);box-shadow:0 8px 60px rgba(0,0,0,0.6);user-select:none">
  <button onclick="document.getElementById('lightbox').style.display='none'" style="position:absolute;top:1.2rem;right:1.4rem;background:none;border:none;color:#fff;font-size:1.8rem;cursor:pointer;line-height:1;opacity:0.7" aria-label="Close">✕</button>
</div>

<script>
(function() {
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
