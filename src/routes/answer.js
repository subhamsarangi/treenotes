import { Router } from 'express';
import { query, run } from '../db/index.js';
import { layout } from '../lib/layout.js';
import { renderBlocks } from '../lib/utils.js';

const r = Router();

r.get('/answer/:id', async (req, res) => {
  const rows = await query('SELECT a.*, n.name as niche_name, n.color as niche_color, n.id as niche_id FROM answers a LEFT JOIN niches n ON a.niche_id = n.id WHERE a.id = ? AND a.owner_id = ?', [req.params.id, req.user.id]);
  const a = rows[0];
  if (!a) return res.redirect('/dashboard');

  const links = await query(`
    SELECT al.relation_type, al.id as link_id,
      CASE WHEN al.from_id = ? THEN al.to_id ELSE al.from_id END as other_id,
      CASE WHEN al.from_id = ? THEN al.relation_type ELSE
        CASE
          WHEN al.relation_type = 'parent' THEN 'child'
          WHEN al.relation_type = 'child' THEN 'parent'
          WHEN al.relation_type = 'prev_sibling' THEN 'next_sibling'
          WHEN al.relation_type = 'next_sibling' THEN 'prev_sibling'
          ELSE al.relation_type
        END
      END as display_type,
      ans.title as other_title
    FROM answer_links al
    JOIN answers ans ON ans.id = (CASE WHEN al.from_id = ? THEN al.to_id ELSE al.from_id END)
    WHERE al.from_id = ? OR al.to_id = ?
  `, [a.id, a.id, a.id, a.id, a.id]);

  let blocks = [];
  try { blocks = JSON.parse(a.content); } catch {}

  const { fuzzy_from, fuzzy_to } = req.query;
  const fuzzyNotice = fuzzy_from && fuzzy_to
    ? `<div class="card mb-3" style="border-color:var(--accent2)40;color:var(--accent2)">
        ✦ Niche "<strong>${fuzzy_from}</strong>" wasn't an exact match — assigned to "<strong>${fuzzy_to}</strong>" via fuzzy match.
       </div>`
    : '';

  res.send(layout(a.title, `
    ${a.image ? `<img src="${a.image}" alt="${a.title}" class="hero-banner">` : ''}
    <div class="container">
      ${fuzzyNotice}
      <div class="mt-4 mb-1">
        ${a.niche_id ? `<a href="/niche/${a.niche_id}" class="chip" style="border-color:${a.niche_color}40;color:${a.niche_color}">${a.niche_name}</a>` : ''}
      </div>
      <h1 style="margin-top:0.6rem;color:var(--logo-light)">${a.starred ? '<span class="star">★ </span>' : ''}${a.title}</h1>
      ${a.summary ? `<p class="muted mt-1">${a.summary}</p>` : ''}
      <div class="muted small mt-1">${a.created_at}</div>

      <div class="page-content mt-4">
        ${renderBlocks(blocks)}
      </div>

      ${links.length ? `
        <div class="mt-4">
          <h3 class="mb-2">Linked Pages</h3>
          <div class="flex-gap">
            ${links.map(l => `
              <div style="display:flex;align-items:center;gap:0.4rem">
                <span class="chip">${l.display_type.replace('_',' ')}</span>
                <a href="/answer/${l.other_id}">${l.other_title}</a>
                <form method="POST" action="/answer/${a.id}/unlink/${l.link_id}" style="display:inline">
                  <button type="submit" class="btn btn-ghost small" style="padding:0.2rem 0.4rem;font-size:0.7rem">✕</button>
                </form>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <div class="mt-4" style="border-top:1px solid var(--border);padding-top:2rem">
        <h3 class="mb-2">Options</h3>
        <div class="flex-gap">
          <a href="/answer/${a.id}/edit-meta" class="btn">✎ Edit Metadata</a>
          <a href="/answer/${a.id}/edit-content" class="btn">✎ Edit Content</a>
          <form method="POST" action="/answer/${a.id}/star">
            <button type="submit" class="btn ${a.starred ? 'btn-ghost' : ''}">${a.starred ? '★ Unstar' : '☆ Star'}</button>
          </form>
          <a href="/answer/${a.id}/link" class="btn">⇔ Link</a>
          <button class="btn btn-danger" onclick="document.getElementById('del-dialog').classList.add('open')">✕ Delete</button>
        </div>
      </div>
    </div>

    <div class="dialog-overlay" id="del-dialog">
      <div class="dialog">
        <h2>Delete this answer?</h2>
        <p>This cannot be undone.</p>
        <div class="dialog-actions">
          <button class="btn btn-ghost" onclick="document.getElementById('del-dialog').classList.remove('open')">Cancel</button>
          <form method="POST" action="/answer/${a.id}/delete">
            <button type="submit" class="btn btn-danger">Delete</button>
          </form>
        </div>
      </div>
    </div>
  `, req.user));
});

r.get('/answer/:id/pick-niche', async (req, res) => {
  const rows = await query('SELECT * FROM answers WHERE id = ? AND owner_id = ?', [req.params.id, req.user.id]);
  const a = rows[0];
  if (!a) return res.redirect('/dashboard');
  const niches = await query('SELECT * FROM niches WHERE owner_id = ?', [req.user.id]);
  const unmatched = req.query.unmatched || '';

  res.send(layout('Pick a Niche', `
    <div class="container" style="max-width:640px">
      <div class="card mt-4 mb-4" style="border-color:var(--accent3)40">
        <span style="color:var(--accent3)">⚠</span> The niche "<strong>${unmatched}</strong>" didn't match anything — answer was imported without a niche. Pick one below or skip.
      </div>
      <h1 class="mb-3">Pick a Niche</h1>
      <div class="grid-2">
        ${niches.map(n => `
          <form method="POST" action="/answer/${a.id}/pick-niche">
            <input type="hidden" name="niche_id" value="${n.id}">
            <button type="submit" class="card" style="width:100%;text-align:left;cursor:pointer;border-color:${n.color}30;background:var(--surface)">
              <div style="font-size:1.5rem;color:${n.color}">${n.icon}</div>
              <div style="font-family:'Fraunces',serif;color:${n.color};margin-top:0.4rem">${n.name}</div>
              ${n.description ? `<div class="muted small mt-1">${n.description}</div>` : ''}
            </button>
          </form>
        `).join('')}
      </div>
      <a href="/answer/${a.id}" class="btn btn-ghost mt-3">Skip</a>
    </div>
  `, req.user));
});

r.post('/answer/:id/pick-niche', async (req, res) => {
  await run('UPDATE answers SET niche_id = ? WHERE id = ? AND owner_id = ?', [req.body.niche_id, req.params.id, req.user.id]);
  res.redirect('/answer/' + req.params.id);
});

r.post('/answer/:id/star', async (req, res) => {
  const rows = await query('SELECT starred FROM answers WHERE id = ? AND owner_id = ?', [req.params.id, req.user.id]);
  const a = rows[0];
  if (!a) return res.redirect('/dashboard');
  await run('UPDATE answers SET starred = ? WHERE id = ? AND owner_id = ?', [a.starred ? 0 : 1, req.params.id, req.user.id]);
  res.redirect('/answer/' + req.params.id);
});

r.post('/answer/:id/delete', async (req, res) => {
  const id = req.params.id;
  // Verify ownership first
  const owned = await query('SELECT id FROM answers WHERE id = ? AND owner_id = ?', [id, req.user.id]);
  if (!owned.length) return res.redirect('/dashboard');

  const children = await query('SELECT from_id FROM answer_links WHERE to_id = ? AND relation_type = ?', [id, 'parent']);
  if (children.length) {
    return res.send(layout('Cannot Delete', `
      <div class="container"><div class="card mt-4" style="border-color:var(--danger)">
        <h2 style="color:var(--danger)">Cannot delete</h2>
        <p class="mt-2">Other pages are linked to this as their parent. Remove those links first.</p>
        <a href="/answer/${id}" class="btn mt-3">← Back</a>
      </div></div>
    `, req.user));
  }
  await run('DELETE FROM answer_links WHERE from_id = ? OR to_id = ?', [id, id]);
  await run('DELETE FROM answers WHERE id = ?', [id]);
  res.redirect('/dashboard');
});

r.post('/answer/:id/unlink/:linkId', async (req, res) => {
  await run('DELETE FROM answer_links WHERE id = ? AND owner_id = ?', [req.params.linkId, req.user.id]);
  res.redirect('/answer/' + req.params.id);
});

r.get('/answer/:id/edit-meta', async (req, res) => {
  const rows = await query('SELECT * FROM answers WHERE id = ? AND owner_id = ?', [req.params.id, req.user.id]);
  const a = rows[0];
  if (!a) return res.redirect('/dashboard');
  const niches = await query('SELECT * FROM niches WHERE owner_id = ?', [req.user.id]);
  res.send(layout('Edit Metadata', `
    <div class="container" style="max-width:560px">
      <a href="/answer/${a.id}" class="muted small mt-4" style="display:block">← Back</a>
      <h1 class="mt-2 mb-3">Edit Metadata</h1>
      <form method="POST">
        <div class="form-group">
          <label>Title</label>
          <input name="title" required value="${a.title}">
        </div>
        <div class="form-group">
          <label>Niche</label>
          <select name="niche_id">
            <option value="">— none —</option>
            ${niches.map(n => `<option value="${n.id}" ${a.niche_id === n.id ? 'selected' : ''}>${n.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Summary</label>
          <input name="summary" value="${a.summary || ''}">
        </div>
        <div class="form-group">
          <label>Image URL</label>
          <input name="image" type="url" placeholder="https://..." value="${a.image || ''}" id="answer-image-input">
          ${a.image ? `
          <div class="mt-2" id="answer-image-preview">
            <img src="${a.image}" style="max-width:200px;border-radius:6px;display:block;margin-bottom:0.5rem">
            <label style="display:inline-flex;align-items:center;gap:0.5rem;cursor:pointer;text-transform:none;letter-spacing:0;font-size:0.85rem;color:var(--danger)">
              <input type="checkbox" name="remove_image" value="1" style="width:auto;margin:0" onchange="if(this.checked){document.getElementById('answer-image-input').value='';document.getElementById('answer-image-input').disabled=true;}else{document.getElementById('answer-image-input').disabled=false;}">
              Remove image
            </label>
          </div>` : ''}
        </div>
        <div class="form-group">
          <label>Created At</label>
          <input name="created_at" type="date" value="${a.created_at}">
        </div>
        <div class="flex-gap mt-3">
          <button type="submit" class="btn btn-primary">Save</button>
          <a href="/answer/${a.id}" class="btn btn-ghost">Cancel</a>
        </div>
      </form>
    </div>
  `, req.user));
});

r.post('/answer/:id/edit-meta', async (req, res) => {
  const { title, niche_id, summary, created_at, image, remove_image } = req.body;
  const finalImage = remove_image === '1' ? null : (image || null);
  await run('UPDATE answers SET title=?, niche_id=?, summary=?, created_at=?, image=? WHERE id=? AND owner_id=?',
    [title, niche_id || null, summary || '', created_at, finalImage, req.params.id, req.user.id]);
  res.redirect('/answer/' + req.params.id);
});

r.get('/answer/:id/edit-content', async (req, res) => {
  const rows = await query('SELECT * FROM answers WHERE id = ? AND owner_id = ?', [req.params.id, req.user.id]);
  const a = rows[0];
  if (!a) return res.redirect('/dashboard');
  const prettifiedContent = JSON.stringify(JSON.parse(a.content), null, 2);
  res.send(layout('Edit Content', `
    <div class="container" style="max-width:960px">
      <a href="/answer/${a.id}" class="muted small mt-4" style="display:block">← Back</a>
      <h1 class="mt-2 mb-3">Edit Content</h1>
      <p class="muted small mb-2">Edit the JSON block array directly.</p>
      <div id="error-box" class="card mb-2" style="display:none;border-color:var(--danger);color:var(--danger)"></div>
      <form id="content-form" method="POST">
        <div class="form-group">
          <div id="cm-spinner" style="border:1px solid var(--border);border-radius:var(--r);min-height:72vh;display:flex;align-items:center;justify-content:center;background:var(--surface)">
            <div style="display:flex;flex-direction:column;align-items:center;gap:1rem;color:var(--muted)">
              <div style="width:32px;height:32px;border:3px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin 0.7s linear infinite"></div>
              <span class="small">Loading editor…</span>
            </div>
          </div>
          <div id="cm-editor" style="border:1px solid var(--border);border-radius:var(--r);overflow:hidden;font-size:0.85rem;display:none"></div>
          <textarea name="content" id="content-input" style="display:none">${escAttr(prettifiedContent)}</textarea>
        </div>
        <div class="flex-gap">
          <button type="button" class="btn" onclick="validate()">Validate</button>
          <button type="submit" class="btn btn-primary">Save</button>
          <a href="/answer/${a.id}" class="btn btn-ghost">Cancel</a>
        </div>
      </form>
    </div>
    <script type="module">
      import { EditorView, keymap, lineNumbers, highlightActiveLine } from 'https://esm.sh/@codemirror/view@6';
      import { EditorState } from 'https://esm.sh/@codemirror/state@6';
      import { json } from 'https://esm.sh/@codemirror/lang-json@6';
      import { oneDark } from 'https://esm.sh/@codemirror/theme-one-dark@6';
      import { defaultKeymap, history, historyKeymap } from 'https://esm.sh/@codemirror/commands@6';
      import { bracketMatching } from 'https://esm.sh/@codemirror/language@6';
      import { closeBrackets, closeBracketsKeymap } from 'https://esm.sh/@codemirror/autocomplete@6';

      const initialContent = document.getElementById('content-input').value;

      const editorHeight = window.innerWidth < 640 ? '60vh' : '72vh';

      const view = new EditorView({
        state: EditorState.create({
          doc: initialContent,
          extensions: [
            lineNumbers(),
            highlightActiveLine(),
            history(),
            bracketMatching(),
            closeBrackets(),
            json(),
            oneDark,
            keymap.of([...defaultKeymap, ...historyKeymap, ...closeBracketsKeymap]),
            EditorView.lineWrapping,
            EditorView.theme({
              '&': { background: 'var(--surface)', height: editorHeight },
              '.cm-scroller': { fontFamily: "'DM Mono', monospace", fontSize: '0.85rem', overflow: 'auto' },
              '.cm-content': { padding: '0.8rem 0' },
              '.cm-gutters': { background: 'var(--surface2)', border: 'none', borderRight: '1px solid var(--border)' },
              '.cm-activeLineGutter': { background: 'var(--surface)' },
            }),
          ],
        }),
        parent: document.getElementById('cm-editor'),
      });

      // Hide spinner, show editor
      document.getElementById('cm-spinner').style.display = 'none';
      document.getElementById('cm-editor').style.display = 'block';

      window.validate = function() {
        try {
          JSON.parse(view.state.doc.toString());
          document.getElementById('error-box').style.display = 'none';
          alert('Valid JSON ✓');
        } catch(e) {
          const b = document.getElementById('error-box');
          b.textContent = e.message; b.style.display = 'block';
        }
      };

      document.getElementById('content-form').addEventListener('submit', function(e) {
        const val = view.state.doc.toString();
        try {
          JSON.parse(val);
          document.getElementById('content-input').value = val;
        } catch(err) {
          e.preventDefault();
          const b = document.getElementById('error-box');
          b.textContent = err.message; b.style.display = 'block';
        }
      });
    </script>
  `, req.user));
});

r.post('/answer/:id/edit-content', async (req, res) => {
  try {
    JSON.parse(req.body.content);
    await run('UPDATE answers SET content=? WHERE id=? AND owner_id=?', [req.body.content, req.params.id, req.user.id]);
  } catch {}
  res.redirect('/answer/' + req.params.id);
});

function escAttr(str) {
  return String(str).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

export default r;
