import { Router } from 'express';
import { query } from '../db/index.js';
import { layout } from '../lib/layout.js';

const r = Router();

r.get('/niche/:id', async (req, res) => {
  const niches = await query('SELECT * FROM niches WHERE id = ? AND owner_id = ?', [req.params.id, req.user.id]);
  const niche = niches[0];
  if (!niche) return res.redirect('/dashboard');

  const { search = '', sort = 'newest', starred, public: showPublic = '1', private: showPrivate = '1' } = req.query;

  let sql = 'SELECT * FROM answers WHERE niche_id = ? AND owner_id = ?';
  const params = [req.params.id, req.user.id];

  if (search) { sql += ' AND (title LIKE ? OR summary LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  if (starred === '1') { sql += ' AND starred = 1'; }
  
  if (showPublic === '1' && showPrivate !== '1') { sql += ' AND is_public = 1'; }
  else if (showPrivate === '1' && showPublic !== '1') { sql += ' AND is_public = 0'; }
  else if (showPublic !== '1' && showPrivate !== '1') { sql += ' AND 1=0'; } // Show nothing if both hidden

  const sortMap = {
    newest: 'created_at DESC',
    oldest: 'created_at ASC',
    az: 'title ASC',
    za: 'title DESC'
  };
  const orderBy = sortMap[sort] || 'created_at DESC';
  sql += ` ORDER BY ${orderBy}`;

  const hasFilters = search || starred === '1' || showPublic !== '1' || showPrivate !== '1' || sort !== 'newest';

  const answers = await query(sql, params);

  res.send(layout(niche.name, `
    ${niche.image ? `<img src="${niche.image}" alt="${niche.name}" class="hero-banner">` : ''}
    <div class="container">
      <div class="${niche.image ? 'mt-4' : 'mt-1'} mb-4">
        <a href="/dashboard" class="muted small">← Dashboard</a>
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:2rem;margin-top:1.5rem;flex-wrap:wrap">
          <div style="min-width:280px;flex:1">
            <div style="display:flex;align-items:center;gap:1rem;margin-bottom:0.8rem">
              <span style="font-size:2.5rem;color:${niche.color}">${niche.icon}</span>
              <h1 style="color:${niche.color};margin:0">${niche.name}</h1>
            </div>
            ${niche.description ? `<p class="muted" style="margin:0;max-width:500px">${niche.description}</p>` : ''}
          </div>
          <div class="flex-gap" style="width:100%;justify-content:flex-start;max-width:max-content">
            <a href="/niches/${niche.id}/edit" class="btn">✎ Edit</a>
            <a href="/import" class="btn btn-primary">+ Import Answer</a>
          </div>
        </div>
      </div>

      <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:1rem;margin-bottom:3rem;position:relative">
        <button class="btn btn-ghost filter-toggle-btn" style="width:100%;margin-bottom:0;display:none;justify-content:center;gap:0.5rem" onclick="const f=this.nextElementSibling; f.classList.toggle('open'); this.textContent = f.classList.contains('open') ? '✕ Close Filters' : '🔍 Filter & Sort'">
          🔍 Filter & Sort
        </button>
        <form method="GET" class="responsive-filter-form" style="gap:1rem;align-items:end">
          <style>
            .responsive-filter-form { display: none; grid-template-columns: repeat(4, 1fr); margin-top: 1rem; }
            .responsive-filter-form.open { display: grid; margin-bottom: 1.5rem; }
            .responsive-filter-form .full-width { grid-column: span 4; }
            .responsive-filter-form label { font-size: 0.65rem; letter-spacing: 0.05em; text-transform: uppercase; color: var(--muted); margin-bottom: 0.3rem; display: block; white-space: nowrap; }
            .responsive-filter-form input, .responsive-filter-form select { font-size: 0.8rem; padding: 0.4rem 0.5rem; height: 32px; background: var(--surface2); }
            .responsive-filter-form .btn { font-size: 0.8rem; height: 32px; padding: 0 1rem; }
            .filter-toggle-btn { display: flex !important; font-size: 0.85rem; padding: 0.5rem 1rem; }

            .responsive-filter-form .toggle input { width: 42px; height: 24px; border-radius: 12px; }
            .responsive-filter-form .toggle input::before { width: 20px; height: 20px; top: 1px; left: 1px; }
            .responsive-filter-form .toggle input:checked::before { left: 19px; }
            .responsive-filter-form select, .responsive-filter-form select option { font-size: 0.7rem !important; }

            @media (min-width: 640px) { 
              .responsive-filter-form { grid-template-columns: 1.5fr 0.8fr 0.8fr 0.8fr 1.2fr; } 
              .responsive-filter-form .full-width { grid-column: span 1; }
              .responsive-filter-form label { font-size: 0.7rem; }
              .responsive-filter-form input, .responsive-filter-form select { font-size: 0.82rem; height: 36px; }
              .responsive-filter-form .toggle input { width: 34px; height: 18px; border-radius: 9px; }
              .responsive-filter-form .toggle input::before { width: 14px; height: 14px; }
              .responsive-filter-form .toggle input:checked::before { left: 17px; }
            }
            @media (min-width: 960px) { 
              .filter-toggle-btn { display: none !important; }
              .responsive-filter-form { display: grid; grid-template-columns: 1.2fr auto auto auto 1fr; margin-top: 0; } 
            }

            .floating-actions .btn { 
              height: 32px; 
              border-radius: 100px; 
              padding: 0 1.25rem; 
              font-size: 0.78rem; 
              font-weight: 500; 
              display: flex; 
              align-items: center; 
              gap: 0.5rem; 
              transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .floating-actions .btn:hover:not(.disabled) { transform: translateY(-1px) scale(1.02); }
            .floating-actions .btn-reset { color: var(--muted); background: transparent; text-decoration: none; }
            .floating-actions .btn-reset:hover:not(.disabled) { color: var(--logo-light); background: var(--surface2); }
            .floating-actions .btn.disabled { opacity: 0.3; cursor: not-allowed; pointer-events: none; filter: grayscale(1); }
          </style>
          <div class="full-width">
            <label>Search</label>
            <input name="search" placeholder="Search answers…" value="${search}">
          </div>
          <div>
            <label>Public</label>
            <div style="display:flex;align-items:center;height:32px">
              <label class="toggle">
                <input type="checkbox" name="public" value="1" ${showPublic === '1' ? 'checked' : ''}>
              </label>
            </div>
          </div>
          <div>
            <label>Private</label>
            <div style="display:flex;align-items:center;height:32px">
              <label class="toggle">
                <input type="checkbox" name="private" value="1" ${showPrivate === '1' ? 'checked' : ''}>
              </label>
            </div>
          </div>
          <div>
            <label>Starred</label>
            <div style="display:flex;align-items:center;height:32px">
              <label class="toggle">
                <input type="checkbox" name="starred" value="1" ${starred === '1' ? 'checked' : ''}>
              </label>
            </div>
          </div>
          <div>
            <label>Sort By</label>
            <select name="sort" style="width:100%">
              <option value="newest" ${sort === 'newest' ? 'selected' : ''}>Newest</option>
              <option value="oldest" ${sort === 'oldest' ? 'selected' : ''}>Oldest</option>
              <option value="az" ${sort === 'az' ? 'selected' : ''}>A-Z</option>
              <option value="za" ${sort === 'za' ? 'selected' : ''}>Z-A</option>
            </select>
          </div>
          <div class="floating-actions" style="position:absolute;bottom:-20px;left:50%;transform:translateX(-50%);display:flex;background:var(--surface);padding:4px;border-radius:100px;border:1px solid var(--border);box-shadow:0 8px 30px rgba(0,0,0,0.25);z-index:10;gap:4px">
            <button type="submit" class="btn btn-primary">
              <span style="font-size:0.9rem">🔍</span> Filter
            </button>
            <a href="/niche/${niche.id}" class="btn btn-reset ${!hasFilters ? 'disabled' : ''}">
              <span style="font-size:0.9rem">↺</span> Reset
            </a>
          </div>
        </form>
      </div>

      ${answers.length ? `
        <div style="display:flex;flex-direction:column;gap:0.8rem">
          ${answers.map(a => `
            <a href="/answer/${a.id}" style="text-decoration:none">
              <div class="card" style="padding:1.2rem;cursor:pointer">
                <div style="font-family:'Fraunces',serif;font-size:1.1rem;font-weight:400;margin-bottom:0.4rem;color:var(--logo-light)">${a.starred ? '<span class="star">★ </span>' : ''}${a.title}</div>
                <div class="flex-gap mb-1" style="align-items:center">
                  ${!a.is_public ? `<span class="chip" style="font-size:0.6rem;background:var(--surface2);color:var(--muted);padding:0.1rem 0.4rem">🔒 Private</span>` : ''}
                  <span class="muted" style="font-size:0.65rem">${a.created_at}</span>
                </div>
              </div>
            </a>
          `).join('')}
        </div>
      ` : `<div class="card" style="text-align:center;padding:3rem;color:var(--muted)">No answers found in this niche.</div>`}
    </div>
  `, req.user));
});

export default r;
