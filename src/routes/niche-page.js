import { Router } from 'express';
import { query } from '../db/index.js';
import { layout } from '../lib/layout.js';

const r = Router();

r.get('/niche/:id', async (req, res) => {
  const niches = await query('SELECT * FROM niches WHERE id = ? AND owner_id = ?', [req.params.id, req.user.id]);
  const niche = niches[0];
  if (!niche) return res.redirect('/');

  const { search = '', sort = 'created_at', order = 'desc', starred } = req.query;

  let sql = 'SELECT * FROM answers WHERE niche_id = ? AND owner_id = ?';
  const params = [req.params.id, req.user.id];

  if (search) { sql += ' AND (title LIKE ? OR summary LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  if (starred === '1') { sql += ' AND starred = 1'; }

  const safeSort = ['created_at','title'].includes(sort) ? sort : 'created_at';
  const safeOrder = order === 'asc' ? 'ASC' : 'DESC';
  sql += ` ORDER BY ${safeSort} ${safeOrder}`;

  const answers = await query(sql, params);

  res.send(layout(niche.name, `
    <div class="container">
      <div class="mt-4 mb-4">
        <a href="/" class="muted small">← Home</a>
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:2rem;margin-top:1.5rem">
          <div>
            <div style="display:flex;align-items:center;gap:1rem;margin-bottom:0.8rem">
              <span style="font-size:2.5rem">${niche.icon}</span>
              <h1 style="color:${niche.color};margin:0">${niche.name}</h1>
            </div>
            ${niche.description ? `<p class="muted" style="margin:0;max-width:500px">${niche.description}</p>` : ''}
          </div>
          <div class="flex-gap">
            <a href="/niches/${niche.id}/edit" class="btn">✎ Edit</a>
            <a href="/import" class="btn btn-primary">+ Import Answer</a>
          </div>
        </div>
      </div>

      <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:1.5rem;margin-bottom:2rem">
        <form method="GET" style="display:grid;grid-template-columns:1fr auto auto auto auto;gap:1rem;align-items:end">
          <div>
            <label>Search</label>
            <input name="search" placeholder="Search answers…" value="${search}">
          </div>
          <div>
            <label>Sort</label>
            <select name="sort" style="width:auto">
              <option value="created_at" ${sort === 'created_at' ? 'selected' : ''}>Date</option>
              <option value="title" ${sort === 'title' ? 'selected' : ''}>Title</option>
            </select>
          </div>
          <div>
            <label>Order</label>
            <select name="order" style="width:auto">
              <option value="desc" ${order === 'desc' ? 'selected' : ''}>Newest</option>
              <option value="asc" ${order === 'asc' ? 'selected' : ''}>Oldest</option>
            </select>
          </div>
          <div style="display:flex;align-items:center;gap:0.5rem">
            <label class="toggle">
              <input type="checkbox" name="starred" value="1" ${starred === '1' ? 'checked' : ''}>
              <span class="small" style="margin:0">★ Starred</span>
            </label>
          </div>
          <button type="submit" class="btn btn-primary" style="width:auto">Filter</button>
        </form>
      </div>

      ${answers.length ? `
        <div style="display:flex;flex-direction:column;gap:0.8rem">
          ${answers.map(a => `
            <a href="/answer/${a.id}" style="text-decoration:none">
              <div class="card" style="display:flex;justify-content:space-between;align-items:center;padding:1.2rem;cursor:pointer">
                <div style="flex:1">
                  <div style="font-family:'Fraunces',serif;font-size:1.1rem;font-weight:400;margin-bottom:0.4rem">${a.starred ? '<span class="star">★ </span>' : ''}${a.title}</div>
                  ${a.summary ? `<div class="muted small">${a.summary}</div>` : ''}
                </div>
                <div class="muted small" style="white-space:nowrap;margin-left:2rem;text-align:right">${a.created_at}</div>
              </div>
            </a>
          `).join('')}
        </div>
      ` : `<div class="card" style="text-align:center;padding:3rem;color:var(--muted)">No answers found in this niche.</div>`}
    </div>
  `, req.user));
});

export default r;
