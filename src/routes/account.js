import { Router } from 'express';
import { query } from '../db/index.js';
import { layout } from '../lib/layout.js';

const r = Router();

r.get('/account', async (req, res) => {
  const counts = await query(`
    SELECT
      (SELECT COUNT(*) FROM answers WHERE owner_id = ?) as answers,
      (SELECT COUNT(*) FROM niches WHERE owner_id = ?) as niches,
      (SELECT COUNT(*) FROM answer_links WHERE owner_id = ?) as links
  `, [req.user.id, req.user.id, req.user.id]);

  const stats = counts[0] || { answers: 0, niches: 0, links: 0 };

  const user = await query('SELECT * FROM users WHERE id = ?', [req.user.id]);
  const createdAt = user[0]?.created_at || '—';

  res.send(layout('Account', `
    <div class="container" style="max-width:560px">
      <h1 class="mt-4 mb-4">Account</h1>

      <div class="card mb-3" style="padding:1.5rem">
        <div class="muted small mb-3" style="text-transform:uppercase;letter-spacing:0.06em">Profile</div>
        <div style="display:flex;flex-direction:column;gap:0.8rem">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span class="muted small">Email</span>
            <span>${req.user.email}</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span class="muted small">Member since</span>
            <span>${createdAt}</span>
          </div>
        </div>
      </div>

      <div class="card mb-4" style="padding:1.5rem">
        <div class="muted small mb-3" style="text-transform:uppercase;letter-spacing:0.06em">Display</div>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-size:0.9rem">Large text</div>
            <div class="muted small">Increase font size across the app</div>
          </div>
          <label class="toggle" style="margin:0">
            <input type="checkbox" id="large-text-toggle">
          </label>
        </div>
      </div>

      <div class="card mb-4" style="padding:1.5rem">
        <div class="muted small mb-3" style="text-transform:uppercase;letter-spacing:0.06em">Your Content</div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;text-align:center">
          <div>
            <div style="font-family:'Fraunces',serif;font-size:2rem;color:var(--accent)">${stats.answers}</div>
            <div class="muted small">Answers</div>
          </div>
          <div>
            <div style="font-family:'Fraunces',serif;font-size:2rem;color:var(--accent2)">${stats.niches}</div>
            <div class="muted small">Niches</div>
          </div>
          <div>
            <div style="font-family:'Fraunces',serif;font-size:2rem;color:var(--accent3)">${stats.links}</div>
            <div class="muted small">Links</div>
          </div>
        </div>
      </div>

      <form method="POST" action="/logout">
        <button type="submit" class="btn btn-danger" style="width:100%;justify-content:center">Sign Out</button>
      </form>
    </div>

    <script>
      const toggle = document.getElementById('large-text-toggle');
      toggle.checked = localStorage.getItem('lumina-large-text') === '1';
      toggle.addEventListener('change', function() {
        if (this.checked) {
          localStorage.setItem('lumina-large-text', '1');
          document.body.classList.add('large-text');
        } else {
          localStorage.removeItem('lumina-large-text');
          document.body.classList.remove('large-text');
        }
      });
    </script>
  `, req.user));
});

export default r;
