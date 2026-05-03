import { Router } from 'express';
import { query, run } from '../db/index.js';
import { layout } from '../lib/layout.js';

const r = Router();

r.get('/answer/:id/link', async (req, res) => {
  const rows = await query('SELECT * FROM answers WHERE id = ? AND owner_id = ?', [req.params.id, req.user.id]);
  const a = rows[0];
  if (!a) return res.redirect('/dashboard');

  const { search = '', sort = 'created_at', order = 'desc', niche = '' } = req.query;
  const niches = await query('SELECT * FROM niches WHERE owner_id = ?', [req.user.id]);

  let sql = 'SELECT ans.*, n.name as niche_name FROM answers ans LEFT JOIN niches n ON ans.niche_id = n.id WHERE ans.id != ? AND ans.owner_id = ?';
  const params = [a.id, req.user.id];

  if (search) { sql += ' AND (ans.title LIKE ? OR ans.summary LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  if (niche) { sql += ' AND ans.niche_id = ?'; params.push(niche); }

  const safeSort = ['created_at','title'].includes(sort) ? sort : 'created_at';
  const safeOrder = order === 'asc' ? 'ASC' : 'DESC';
  sql += ` ORDER BY ans.${safeSort} ${safeOrder}`;

  const answers = await query(sql, params);

  const existingLinks = await query(`
    SELECT CASE WHEN from_id = ? THEN to_id ELSE from_id END as other_id, relation_type, id as link_id
    FROM answer_links WHERE from_id = ? OR to_id = ?
  `, [a.id, a.id, a.id]);
  const linkedMap = Object.fromEntries(existingLinks.map(l => [l.other_id, l]));

  res.send(layout('Link Pages', `
    <div class="container">
      <a href="/answer/${a.id}" class="muted small mt-4" style="display:block">← Back to "${a.title}"</a>
      <h1 class="mt-2 mb-1">Link Pages</h1>
      <p class="muted small mb-3">Select a relation type and link another answer to this one.</p>

      <form method="GET" class="flex-gap mb-3">
        <input name="search" placeholder="Search…" value="${search}" style="max-width:240px">
        <select name="niche" style="width:auto">
          <option value="">All niches</option>
          ${niches.map(n => `<option value="${n.id}" ${niche === n.id ? 'selected' : ''}>${n.name}</option>`).join('')}
        </select>
        <select name="sort" style="width:auto">
          <option value="created_at" ${sort === 'created_at' ? 'selected' : ''}>Date</option>
          <option value="title" ${sort === 'title' ? 'selected' : ''}>Title</option>
        </select>
        <select name="order" style="width:auto">
          <option value="desc" ${order === 'desc' ? 'selected' : ''}>↓</option>
          <option value="asc" ${order === 'asc' ? 'selected' : ''}>↑</option>
        </select>
        <button type="submit" class="btn">Filter</button>
      </form>

      <div style="display:flex;flex-direction:column;gap:0.6rem">
        ${answers.map(ans => {
          const existing = linkedMap[ans.id];
          return `
            <div class="card" style="display:flex;justify-content:space-between;align-items:center;gap:1rem">
              <div>
                <div style="font-family:'Fraunces',serif">${ans.title}</div>
                ${ans.niche_name ? `<span class="chip small mt-1">${ans.niche_name}</span>` : ''}
              </div>
              <div class="flex-gap" style="flex-shrink:0">
                ${existing ? `
                  <span class="chip" style="color:var(--accent2);border-color:var(--accent2)40">${existing.relation_type.replace('_',' ')}</span>
                  <form method="POST" action="/answer/${a.id}/unlink/${existing.link_id}">
                    <button class="btn btn-ghost small">Unlink</button>
                  </form>
                ` : `
                  <form method="POST" action="/answer/${a.id}/link">
                    <input type="hidden" name="to_id" value="${ans.id}">
                    <select name="relation_type" style="width:auto;font-size:0.8rem">
                      <option value="friend">friend</option>
                      <option value="parent">parent</option>
                      <option value="prev_sibling">prev sibling</option>
                      <option value="next_sibling">next sibling</option>
                    </select>
                    <button type="submit" class="btn btn-primary small" style="margin-left:0.4rem">Link</button>
                  </form>
                `}
              </div>
            </div>
          `;
        }).join('') || '<div class="muted card" style="text-align:center;padding:2rem">No answers found.</div>'}
      </div>
    </div>
  `, req.user));
});

r.post('/answer/:id/link', async (req, res) => {
  const { to_id, relation_type } = req.body;
  const from_id = req.params.id;

  if (!to_id || !relation_type) return res.redirect(`/answer/${from_id}/link`);

  // Verify both answers belong to this user
  const owned = await query('SELECT id FROM answers WHERE id IN (?, ?) AND owner_id = ?', [from_id, to_id, req.user.id]);
  if (owned.length < 2) return res.redirect(`/answer/${from_id}/link`);

  const already = await query('SELECT id FROM answer_links WHERE (from_id=? AND to_id=?) OR (from_id=? AND to_id=?)',
    [from_id, to_id, to_id, from_id]);
  if (!already.length) {
    await run('INSERT INTO answer_links (from_id, to_id, relation_type, owner_id) VALUES (?,?,?,?)', [from_id, to_id, relation_type, req.user.id]);
  }

  res.redirect(`/answer/${from_id}`);
});

r.post('/answer/:id/unlink/:linkId', async (req, res) => {
  await run('DELETE FROM answer_links WHERE id = ? AND owner_id = ?', [req.params.linkId, req.user.id]);
  res.redirect('/answer/' + req.params.id);
});

export default r;
