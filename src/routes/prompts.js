import { Router } from 'express';
import { query } from '../db/index.js';
import { layout } from '../lib/layout.js';

const r = Router();

r.get('/prompts', async (req, res) => {
  const prompts = await query('SELECT * FROM prompts ORDER BY id');

  res.send(layout('Prompts', `
    <div class="container">
      <h1 class="mt-4 mb-1">Prompts</h1>
      <p class="muted small mb-4">Copy prompts to use with AI for structured answers.</p>

      <div style="display:grid;grid-template-columns:1fr;gap:1.5rem">
        ${prompts.map((p, i) => `
          <div class="card" style="padding:1.5rem">
            <div class="flex-between mb-2">
              <h3 style="margin:0">${p.name}</h3>
              <button class="btn btn-primary small" onclick="copyPrompt(${i})" id="copy-btn-${i}">📋 Copy</button>
            </div>
            <pre id="prompt-${i}" style="background:var(--surface2);border:1px solid var(--border);border-radius:var(--r);padding:1rem;overflow-x:auto;font-family:'DM Mono',monospace;font-size:0.8rem;line-height:1.6;color:var(--accent2);margin:0;white-space:pre-wrap;word-wrap:break-word">${p.content}</pre>
          </div>
        `).join('')}
      </div>
    </div>

    <script>
      function copyPrompt(index) {
        const text = document.getElementById('prompt-' + index).textContent;
        navigator.clipboard.writeText(text).then(() => {
          const btn = document.getElementById('copy-btn-' + index);
          const orig = btn.textContent;
          btn.textContent = '✓ Copied!';
          setTimeout(() => { btn.textContent = orig; }, 2000);
        });
      }
    </script>
  `));
});

export default r;
