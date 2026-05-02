import { Router } from 'express';
import { query } from '../db/index.js';
import { layout } from '../lib/layout.js';

const r = Router();

r.get('/niche/:id', (req, res) => {
  const niche = query('SELECT * FROM niches WHERE id = ?', [req.params.id])[0];
  if (!niche) return res.redirect('/');

  const { search = '', sort = 'created_at', order = 'desc', starred } = req.query;

  let sql = 'SELECT * FROM answers WHERE niche_id = ?';
  const params = [req.params.id];

  if (search) { sql += ' AND (title LIKE ? OR summary LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  if (starred === '1') { sql += ' AND starred = 1'; }

  const safeSort = ['created_at','title'].includes(sort) ? sort : 'created_at';
  const safeOrder = order === 'asc' ? 'ASC' : 'DESC';
  sql += ` ORDER BY ${safeSort} ${safeOrder}`;

  const answers = query(sql, params);

  res.send(layout(niche.name, `
    <div class="container">
      <div class="mt-4 mb-3">
        <a href="/" class="muted small">← Home</a>
        <div class="flex-between mt-2">
          <div>
            <span style="font-size:2rem">${niche.icon}</span>
            <h1 style="color:${niche.color};display:inline;margin-left:0.5rem">${niche.name}</h1>
          </div>
          <a href="/import" class="btn btn-primary">+ Import Answer</a>
        </div>
        ${niche.description ? `<p class="muted mt-1">${niche.description}</p>` : ''}
      </div>

      <form method="GET" class="flex-gap mb-3">
        <input name="search" placeholder="Search…" value="${search}" style="max-width:280px">
        <select name="sort" style="width:auto">
          <option value="created_at" ${sort === 'created_at' ? 'selected' : ''}>Date</option>
          <option value="title" ${sort === 'title' ? 'selected' : ''}>Title</option>
        </select>
        <select name="order" style="width:auto">
          <option value="desc" ${order === 'desc' ? 'selected' : ''}>↓</option>
          <option value="asc" ${order === 'asc' ? 'selected' : ''}>↑</option>
        </select>
        <label class="flex-gap" style="cursor:pointer;font-size:0.85rem;color:var(--muted)">
          <input type="checkbox" name="starred" value="1" ${starred === '1' ? 'checked' : ''}> Starred only
        </label>
        <button type="submit" class="btn">Filter</button>
      </form>

      ${answers.length ? `
        <div style="display:flex;flex-direction:column;gap:0.7rem">
          ${answers.map(a => `
            <a href="/answer/${a.id}" style="text-decoration:none">
              <div class="card" style="display:flex;justify-content:space-between;align-items:center">
                <div>
                  <div style="font-family:'Fraunces',serif;font-size:1.05rem">${a.starred ? '<span class="star">★ </span>' : ''}${a.title}</div>
                  ${a.summary ? `<div class="muted small mt-1">${a.summary}</div>` : ''}
                </div>
                <div class="muted small" style="white-space:nowrap;margin-left:1rem">${a.created_at}</div>
              </div>
            </a>
          `).join('')}
        </div>
      ` : `<div class="card muted" style="text-align:center;padding:3rem">No answers found.</div>`}
    </div>
  `));
});

export default r;
