import { Router } from 'express';
import { query, run } from '../db/index.js';
import { layout } from '../lib/layout.js';

const r = Router();

const sortMap = {
  newest: 'created_at DESC',
  oldest: 'created_at ASC',
  az: 'title ASC',
  za: 'title DESC'
};

r.get('/answer/:id/link', async (req, res) => {
  const rows = await query('SELECT * FROM answers WHERE id = ? AND owner_id = ?', [req.params.id, req.user.id]);
  const a = rows[0];
  if (!a) return res.redirect('/dashboard');

  const { search = '', sort = 'newest', public: showPublic = '1', private: showPrivate = '1', starred = '0' } = req.query;

  let sql = 'SELECT ans.*, n.name as niche_name FROM answers ans LEFT JOIN niches n ON ans.niche_id = n.id WHERE ans.id != ? AND ans.owner_id = ?';
  const params = [a.id, req.user.id];

  if (search) {
    sql += ' AND (ans.title LIKE ? OR ans.summary LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  // Visibility filters
  if (showPublic === '1' && showPrivate !== '1') {
    sql += ' AND ans.is_public = 1';
  } else if (showPublic !== '1' && showPrivate === '1') {
    sql += ' AND ans.is_public = 0';
  } else if (showPublic !== '1' && showPrivate !== '1') {
    sql += ' AND 1=0'; // Show nothing
  }

  if (starred === '1') {
    sql += ' AND ans.starred = 1';
  }

  const orderBy = sortMap[sort] || 'created_at DESC';
  sql += ` ORDER BY ans.${orderBy}`;

  const hasFilters = search || starred === '1' || showPublic !== '1' || showPrivate !== '1' || sort !== 'newest';
  const answers = await query(sql, params);

  const existingLinks = await query(`
    SELECT *, CASE WHEN from_id = ? THEN to_id ELSE from_id END as other_id, id as link_id
    FROM answer_links WHERE from_id = ? OR to_id = ?
  `, [a.id, a.id, a.id]);
  const linkedMap = Object.fromEntries(existingLinks.map(l => [l.other_id, l]));

  res.send(layout('Link Pages', `
    <div class="container">
      <div class="mt-1 mb-4">
        <a href="/answer/${a.id}" class="muted small">← Back to "${a.title}"</a>
        <h1 class="mt-2">Link Pages</h1>
        <p class="muted small">Select a relation type and link another answer to this one.</p>
      </div>

      <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:1rem;margin-bottom:3rem;position:relative">
        <button type="button" class="btn btn-ghost filter-toggle-btn" style="width:100%;margin-bottom:0;display:none;justify-content:center;gap:0.5rem" onclick="const f=this.nextElementSibling; f.classList.toggle('open'); this.textContent = f.classList.contains('open') ? '✕ Close Filters' : '🔍 Filter & Sort'">
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
            <a href="/answer/${a.id}/link" class="btn btn-reset ${!hasFilters ? 'disabled' : ''}">
              <span style="font-size:0.9rem">↺</span> Reset
            </a>
          </div>
        </form>
      </div>

      <style>
        .link-actions-form { display: flex; align-items: center; gap: 0.5rem; }
        @media (max-width: 640px) {
          .link-actions-form { flex-direction: column; align-items: stretch; width: 100px; flex-shrink: 0; }
          .link-actions-form select, .link-actions-form button { width: 100% !important; margin: 0 !important; }
        }
      </style>

      <div style="display:flex;flex-direction:column;gap:0.8rem">
        ${(() => {
          const unlinked = answers.filter(ans => !linkedMap[ans.id]);
          const linked = answers.filter(ans => linkedMap[ans.id]);
          
          let html = unlinked.map(ans => `
            <div class="card" style="display:flex;justify-content:space-between;align-items:center;gap:1rem;padding:1rem">
              <div style="flex:1;overflow:hidden">
                <div style="font-family:'Fraunces',serif;font-size:1.05rem;color:var(--logo-light);word-break:break-word">${ans.starred ? '<span class="star">★ </span>' : ''}${ans.title}</div>
                <div class="flex-gap mt-1" style="align-items:center">
                  ${ans.niche_name ? `<span class="chip" style="font-size:0.6rem;background:var(--surface2);border-color:var(--border)">${ans.niche_name}</span>` : ''}
                  ${!ans.is_public ? `<span class="chip" style="font-size:0.6rem;background:var(--surface2);color:var(--muted)">🔒 Private</span>` : ''}
                </div>
              </div>
              <div style="flex-shrink:0">
                <form method="POST" action="/answer/${a.id}/link" class="link-actions-form">
                  <input type="hidden" name="to_id" value="${ans.id}">
                  <select name="relation_type" style="width:auto;font-size:0.75rem;height:36px;background:var(--surface2)">
                    <option value="friend">friend</option>
                    <option value="parent">parent</option>
                    <option value="child">child</option>
                    <option value="sibling">sibling</option>
                  </select>
                  <button type="submit" class="btn btn-primary small" style="height:32px;padding:0 1rem;font-size:0.8rem">Link</button>
                </form>
              </div>
            </div>
          `).join('');

          if (linked.length) {
            html += `
              <div class="mt-4 mb-2">
                <h3 class="small muted" style="text-transform:uppercase;letter-spacing:0.1em">Already Linked</h3>
              </div>
              ${linked.map(ans => {
                const existing = linkedMap[ans.id];
                return `
                  <div class="card" style="display:flex;justify-content:space-between;align-items:center;gap:1rem;padding:1rem;opacity:0.8">
                    <div style="flex:1;overflow:hidden">
                      <div style="font-family:'Fraunces',serif;font-size:1.05rem;color:var(--logo-light);word-break:break-word">${ans.starred ? '<span class="star">★ </span>' : ''}${ans.title}</div>
                      <div class="flex-gap mt-1" style="align-items:center">
                        ${ans.niche_name ? `<span class="chip" style="font-size:0.6rem;background:var(--surface2);border-color:var(--border)">${ans.niche_name}</span>` : ''}
                        ${!ans.is_public ? `<span class="chip" style="font-size:0.6rem;background:var(--surface2);color:var(--muted)">🔒 Private</span>` : ''}
                      </div>
                    </div>
                    <div class="flex-gap" style="flex-shrink:0">
                      ${(() => {
                        let display = existing.relation_type;
                        if (existing.relation_type === 'parent') {
                          display = existing.from_id === a.id ? 'parent' : 'child';
                        }
                        return `<span class="chip" style="color:var(--accent2);border-color:var(--accent2)40">${display.replace('_',' ')}</span>`;
                      })()}
                      <form method="POST" action="/answer/${a.id}/unlink/${existing.link_id}">
                        <button class="btn btn-ghost small" style="font-size:0.75rem">Unlink</button>
                      </form>
                    </div>
                  </div>
                `;
              }).join('')}
            `;
          }

          return html || '<div class="muted card" style="text-align:center;padding:3rem">No answers found.</div>';
        })()}
      </div>
    </div>
  `, req.user));
});

r.post('/answer/:id/link', async (req, res) => {
  const { to_id, relation_type } = req.body;
  const from_id = req.params.id;

  if (!to_id || !relation_type) return res.redirect(`/answer/${from_id}/link`);

  // Handle 'child' by reversing IDs and using 'parent' relation
  let f_id = from_id;
  let t_id = to_id;
  let r_type = relation_type;

  if (relation_type === 'child') {
    f_id = to_id;
    t_id = from_id;
    r_type = 'parent';
  }

  const owned = await query('SELECT id FROM answers WHERE id IN (?, ?) AND owner_id = ?', [f_id, t_id, req.user.id]);
  if (owned.length < 2) return res.redirect(`/answer/${from_id}/link`);

  const already = await query('SELECT id FROM answer_links WHERE (from_id=? AND to_id=?) OR (from_id=? AND to_id=?)',
    [f_id, t_id, t_id, f_id]);
  
  if (r_type === 'parent') {
    // 1. Single parent check
    const hasParent = await query("SELECT id FROM answer_links WHERE from_id = ? AND relation_type = 'parent'", [f_id]);
    if (hasParent.length) return res.send(layout('Cannot Link', `
      <div class="container"><div class="card mt-4" style="border-color:var(--danger)">
        <h2 style="color:var(--danger)">Cannot add parent</h2>
        <p class="mt-2">The page "<strong>${f_id === from_id ? 'Current Page' : 'Selected Page'}</strong>" already has a parent. Remove the existing parent link first.</p>
        <div class="flex-gap mt-3">
          <a href="/answer/${from_id}/link" class="btn">← Back to Linking</a>
          <a href="/answer/${from_id}" class="btn btn-ghost">Back to Answer</a>
        </div>
      </div></div>
    `, req.user));

    // 2. Circularity check (Direct)
    // If we are trying to make T the parent of F, check if F is already the parent of T.
    const isParentOf = await query("SELECT id FROM answer_links WHERE from_id = ? AND to_id = ? AND relation_type = 'parent'", [t_id, f_id]);
    if (isParentOf.length) return res.send(layout('Circular Relation', `
      <div class="container"><div class="card mt-4" style="border-color:var(--danger)">
        <h2 style="color:var(--danger)">Circular Relation Detected</h2>
        <p class="mt-2">The page "<strong>${t_id === from_id ? 'Current Page' : 'Selected Page'}</strong>" is already a <strong>child</strong> of "<strong>${f_id === from_id ? 'Current Page' : 'Selected Page'}</strong>". It cannot also be its parent.</p>
        <div class="flex-gap mt-3">
          <a href="/answer/${from_id}/link" class="btn">← Back to Linking</a>
          <a href="/answer/${from_id}" class="btn btn-ghost">Back to Answer</a>
        </div>
      </div></div>
    `, req.user));
  }

  if (!already.length) {
    await run('INSERT INTO answer_links (from_id, to_id, relation_type, owner_id) VALUES (?,?,?,?)', [f_id, t_id, r_type, req.user.id]);
  }

  res.redirect(`/answer/${from_id}`);
});

r.post('/answer/:id/unlink/:linkId', async (req, res) => {
  await run('DELETE FROM answer_links WHERE id = ? AND owner_id = ?', [req.params.linkId, req.user.id]);
  res.redirect('/answer/' + req.params.id);
});

export default r;
