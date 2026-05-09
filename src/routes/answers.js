import { Router } from 'express';
import { query } from '../db/index.js';
import { layout } from '../lib/layout.js';

const r = Router();

r.get('/answers', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 20;
  const offset = (page - 1) * limit;

  const { search = '', sort = 'newest', starred, public: showPublic = '1', private: showPrivate = '1' } = req.query;

  let sql = `
    SELECT a.*, n.name as niche_name, n.color as niche_color, n.icon as niche_icon 
    FROM answers a 
    LEFT JOIN niches n ON a.niche_id = n.id 
    WHERE a.owner_id = ?
  `;
  const params = [req.user.id];

  if (search) { 
    sql += ' AND (a.title LIKE ? OR a.summary LIKE ?)'; 
    params.push(`%${search}%`, `%${search}%`); 
  }
  if (starred === '1') { 
    sql += ' AND a.starred = 1'; 
  }
  
  if (showPublic === '1' && showPrivate !== '1') { sql += ' AND a.is_public = 1'; }
  else if (showPrivate === '1' && showPublic !== '1') { sql += ' AND a.is_public = 0'; }
  else if (showPublic !== '1' && showPrivate !== '1') { sql += ' AND 1=0'; }

  const sortMap = {
    newest: 'a.created_at DESC',
    oldest: 'a.created_at ASC',
    az: 'a.title ASC',
    za: 'a.title DESC'
  };
  const orderBy = sortMap[sort] || 'a.created_at DESC';
  
  // Get total count for pagination
  const countSql = `SELECT COUNT(*) as total FROM (${sql}) as t`;
  const countResult = await query(countSql, params);
  const total = countResult[0].total;
  const totalPages = Math.ceil(total / limit);

  // Get paginated results
  sql += ` ORDER BY ${orderBy} LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const answers = await query(sql, params);

  const hasFilters = search || starred === '1' || showPublic !== '1' || showPrivate !== '1' || sort !== 'newest';

  // Helper for pagination links
  const getPageUrl = (p) => {
    const q = new URLSearchParams(req.query);
    q.set('page', p);
    return `/answers?${q.toString()}`;
  };

  res.send(layout('All Answers', `
    <div class="container">
      <div class="mt-4 mb-4">
        <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem">
          <div>
            <h1 style="margin:0">All Answers</h1>
            <p class="muted" style="margin:0">${total} answers total</p>
          </div>
          <a href="/import" class="btn btn-primary">+ Import Answer</a>
        </div>
      </div>

      <div class="filter-area" style="border-radius:var(--r);padding:1rem;margin-bottom:3rem;position:relative">
        <button class="btn btn-ghost filter-toggle-btn" style="width:100%;margin-bottom:0;display:none;justify-content:center;gap:0.5rem" onclick="const f=this.nextElementSibling; f.classList.toggle('open'); this.textContent = f.classList.contains('open') ? '✕ Close Filters' : '🔍 Filter & Sort'">
          🔍 Filter & Sort
        </button>
        <form method="GET" class="responsive-filter-form" style="gap:1rem;align-items:end">
          <style>
            .filter-area { background: var(--surface-grey); border: 1px solid var(--border-grey); }
            .responsive-filter-form { display: none; grid-template-columns: repeat(4, 1fr); margin-top: 1rem; }
            .responsive-filter-form.open { display: grid; margin-bottom: 1.5rem; }
            .responsive-filter-form .full-width { grid-column: span 4; }
            .responsive-filter-form label { font-size: 0.65rem; letter-spacing: 0.05em; text-transform: uppercase; color: var(--text-grey); margin-bottom: 0.3rem; display: block; white-space: nowrap; }
            .responsive-filter-form input, .responsive-filter-form select { font-size: 0.8rem; padding: 0.4rem 0.5rem; height: 32px; background: var(--surface-grey2); color: var(--text); border: 1px solid var(--border-grey); }
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
              .responsive-filter-form { display: grid; grid-template-columns: 1.2fr auto auto auto 1fr; margin-top: 0; padding-bottom: 0.75rem; } 
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
            
            .pagination { display: flex; gap: 0.5rem; justify-content: center; margin-top: 3rem; margin-bottom: 1rem; }
            .pagination a { min-width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border); border-radius: 8px; background: var(--surface); color: var(--text); font-size: 0.85rem; }
            .pagination a:hover { border-color: var(--logo); background: var(--surface2); text-decoration: none; }
            .pagination a.active { background: var(--logo); color: #000; border-color: var(--logo); font-weight: 600; }
            .pagination a.disabled { opacity: 0.3; pointer-events: none; }
          </style>
          <div class="full-width">
            <label>Search</label>
            <input name="search" placeholder="Search all answers…" value="${search}">
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
            <a href="/answers" class="btn btn-reset ${!hasFilters ? 'disabled' : ''}">
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
                <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:1rem">
                  <div style="font-family:'Fraunces',serif;font-size:1.1rem;font-weight:400;margin-bottom:0.4rem;color:var(--logo-light)">
                    ${a.starred ? '<span class="star">★ </span>' : ''}${a.title}
                  </div>
                  ${a.niche_name ? `
                    <div class="chip" style="border-color:${a.niche_color}44; color:${a.niche_color}; font-size:0.65rem; background:${a.niche_color}11">
                      ${a.niche_icon} ${a.niche_name}
                    </div>
                  ` : ''}
                </div>
                <div class="flex-gap mb-1" style="align-items:center">
                  ${!a.is_public ? `<span class="chip" style="font-size:0.6rem;background:var(--surface2);color:var(--muted);padding:0.1rem 0.4rem">🔒 Private</span>` : ''}
                  <span class="muted" style="font-size:0.65rem">${a.created_at}</span>
                </div>
              </div>
            </a>
          `).join('')}
        </div>

        ${totalPages > 1 ? `
          <div class="pagination">
            <a href="${getPageUrl(page - 1)}" class="${page === 1 ? 'disabled' : ''}">←</a>
            ${Array.from({ length: totalPages }, (_, i) => i + 1).map(p => {
              if (totalPages > 7) {
                if (p > 2 && p < totalPages - 1 && Math.abs(p - page) > 1) {
                  if (p === 3 || p === totalPages - 2) return '<span class="muted">...</span>';
                  return '';
                }
              }
              return `<a href="${getPageUrl(p)}" class="${p === page ? 'active' : ''}">${p}</a>`;
            }).join('')}
            <a href="${getPageUrl(page + 1)}" class="${page === totalPages ? 'disabled' : ''}">→</a>
          </div>
        ` : ''}
      ` : `<div class="card" style="text-align:center;padding:3rem;color:var(--muted)">No answers found.</div>`}
    </div>
  `, req.user));
});

export default r;
