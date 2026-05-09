import { Router } from 'express';
import { query, run } from '../db/index.js';
import { layout } from '../lib/layout.js';
import { generateId } from '../lib/utils.js';

const r = Router();

function normalize(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function matchNiche(niches, value) {
  if (!value) return { nicheId: null, matchInfo: null };

  const exact = niches.find(n => n.id === value || n.name.toLowerCase() === value.toLowerCase());
  if (exact) return { nicheId: exact.id, matchInfo: null };

  const norm = normalize(value);
  const fuzzy = niches.find(n => {
    const normName = normalize(n.name);
    const normId = normalize(n.id);
    return normName.includes(norm) || norm.includes(normName) || normId.includes(norm) || norm.includes(normId);
  });
  if (fuzzy) return { nicheId: fuzzy.id, matchInfo: { from: value, to: fuzzy.name } };

  return { nicheId: null, matchInfo: null };
}

r.get('/import', async (req, res) => {
  const niches = await query('SELECT * FROM niches WHERE owner_id = ?', [req.user.id]);
  res.send(layout('Import Answer', `
    <div class="container" style="max-width:960px">
      <h1 class="mt-4 mb-1">Import Answer</h1>
      <p class="muted mb-3">Paste a structured JSON object. The <code>id</code> field is ignored — the system generates it.</p>

      ${niches.length === 0 ? `<div class="card mb-3" style="border-color:var(--accent3)40">
        <span style="color:var(--accent3)">⚠</span> No niches exist yet. <a href="/niches/new">Create a niche</a> first, or the answer will import without one.
      </div>` : ''}

      <div id="error-box" class="card mb-2" style="display:none;border-color:var(--danger);color:var(--danger)"></div>

      <div class="form-group">
        <label>JSON</label>
        <div id="cm-spinner" style="border:1px solid var(--border);border-radius:var(--r);min-height:60vh;display:flex;align-items:center;justify-content:center;background:var(--surface)">
          <div style="display:flex;flex-direction:column;align-items:center;gap:1rem;color:var(--muted)">
            <div style="width:32px;height:32px;border:3px solid var(--border);border-top-color:var(--logo);border-radius:50%;animation:spin 0.7s linear infinite"></div>
            <span class="small">Loading editor…</span>
          </div>
        </div>
        <div id="cm-editor" style="border:1px solid var(--border);border-radius:var(--r);overflow:hidden;font-size:0.8rem;display:none"></div>
        <textarea id="json-input" name="json-input" style="display:none" placeholder='{"title":"...","niche":"machine-learning","summary":"...","content":[]}'></textarea>
      </div>

      <div id="preview" style="display:none" class="card mb-3">
        <h3 class="mb-2">Preview</h3>
        <div id="preview-inner"></div>
      </div>

      <div class="form-group">
        <label class="toggle">
          <input type="checkbox" id="public-toggle">
          <span>Make this answer public</span>
        </label>
        <p class="muted small" style="margin-left:3.2rem;margin-top:0.3rem">Public answers are visible to everyone via their direct link.</p>
      </div>

      <div class="flex-gap mt-3">
        <button class="btn" onclick="preview()">Preview</button>
        <button class="btn btn-primary" onclick="importAnswer()">Import</button>
      </div>

      <form id="hidden-form" method="POST" action="/import" style="display:none">
        <input type="hidden" name="payload" id="hidden-payload">
      </form>
    </div>

    <script type="module">
      import { EditorView, keymap, lineNumbers, highlightActiveLine } from 'https://esm.sh/@codemirror/view@6';
      import { EditorState } from 'https://esm.sh/@codemirror/state@6';
      import { json } from 'https://esm.sh/@codemirror/lang-json@6';
      import { oneDark } from 'https://esm.sh/@codemirror/theme-one-dark@6';
      import { defaultKeymap, history, historyKeymap } from 'https://esm.sh/@codemirror/commands@6';
      import { bracketMatching, syntaxHighlighting, defaultHighlightStyle } from 'https://esm.sh/@codemirror/language@6';
      import { closeBrackets, closeBracketsKeymap } from 'https://esm.sh/@codemirror/autocomplete@6';

      const view = new EditorView({
        state: EditorState.create({
          doc: '',
          extensions: [
            lineNumbers(),
            highlightActiveLine(),
            history(),
            bracketMatching(),
            closeBrackets(),
            json(),
            oneDark,
            keymap.of([...defaultKeymap, ...historyKeymap, ...closeBracketsKeymap]),
            EditorView.theme({
              '&': { background: 'var(--surface)', height: '60vh' },
              '.cm-scroller': { fontFamily: "'DM Mono', monospace", fontSize: '0.8rem', overflow: 'auto' },
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

      function getJson() {
        const val = view.state.doc.toString();
        try { return JSON.parse(val); }
        catch(e) { showError('Invalid JSON: ' + e.message); return null; }
      }
      function showError(msg) { const b = document.getElementById('error-box'); b.textContent = msg; b.style.display = 'block'; }
      function clearError() { document.getElementById('error-box').style.display = 'none'; }

      window.preview = function() {
        clearError();
        const data = getJson();
        if (!data) return;
        document.getElementById('preview-inner').innerHTML =
          '<div><strong>Title:</strong> ' + (data.title || '—') + '</div>' +
          '<div><strong>Niche:</strong> ' + (data.niche || '—') + '</div>' +
          '<div><strong>Summary:</strong> ' + (data.summary || '—') + '</div>' +
          '<div><strong>Public:</strong> ' + (document.getElementById('public-toggle').checked ? 'Yes' : 'No') + '</div>' +
          '<div><strong>Blocks:</strong> ' + (Array.isArray(data.content) ? data.content.length + ' blocks' : 'invalid') + '</div>';
        document.getElementById('preview').style.display = 'block';
      };

      window.importAnswer = function() {
        clearError();
        const data = getJson();
        if (!data) return;
        if (!data.title) return showError('title is required');
        if (!Array.isArray(data.content)) return showError('content must be an array');
        
        data.is_public = document.getElementById('public-toggle').checked;
        
        document.getElementById('hidden-payload').value = JSON.stringify(data);
        // Show loading state on the Import button
        var importBtn = document.querySelector('button[onclick="importAnswer()"]');
        if (window._btnLoading) window._btnLoading(importBtn);
        document.getElementById('hidden-form').submit();
      };
    </script>
  `, req.user));
});

r.post('/import', async (req, res) => {
  let data;
  try { data = JSON.parse(req.body.payload); } catch { return res.redirect('/import'); }

  const niches = await query('SELECT * FROM niches WHERE owner_id = ?', [req.user.id]);
  const { nicheId, matchInfo } = matchNiche(niches, data.niche);

  const id = generateId(data.title);
  const createdAt = data.created_at || new Date().toISOString().split('T')[0];
  const isPublic = data.is_public ? 1 : 0;

  await run('INSERT INTO answers (id, title, niche_id, summary, content, created_at, starred, owner_id, is_public) VALUES (?,?,?,?,?,?,0,?,?)',
    [id, data.title, nicheId, data.summary || '', JSON.stringify(data.content), createdAt, req.user.id, isPublic]);

  if (!nicheId && data.niche) {
    return res.redirect('/answer/' + id + '/pick-niche?unmatched=' + encodeURIComponent(data.niche));
  }

  const fuzzyParam = matchInfo ? '?fuzzy_from=' + encodeURIComponent(matchInfo.from) + '&fuzzy_to=' + encodeURIComponent(matchInfo.to) : '';
  res.redirect('/answer/' + id + fuzzyParam);
});

export default r;
