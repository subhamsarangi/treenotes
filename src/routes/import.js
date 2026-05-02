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
  const niches = await query('SELECT * FROM niches');
  res.send(layout('Import Answer', `
    <div class="container" style="max-width:680px">
      <h1 class="mt-4 mb-1">Import Answer</h1>
      <p class="muted mb-3">Paste a structured JSON object. The <code>id</code> field is ignored — the system generates it.</p>

      ${niches.length === 0 ? `<div class="card mb-3" style="border-color:var(--accent3)40">
        <span style="color:var(--accent3)">⚠</span> No niches exist yet. <a href="/niches/new">Create a niche</a> first, or the answer will import without one.
      </div>` : ''}

      <div id="error-box" class="card mb-2" style="display:none;border-color:var(--danger);color:var(--danger)"></div>

      <div class="form-group">
        <label>JSON</label>
        <textarea id="json-input" style="min-height:300px;font-family:'DM Mono',monospace;font-size:0.8rem" placeholder='{"title":"...","niche":"machine-learning","summary":"...","content":[]}'></textarea>
      </div>

      <div id="preview" style="display:none" class="card mb-3">
        <h3 class="mb-2">Preview</h3>
        <div id="preview-inner"></div>
      </div>

      <div class="flex-gap">
        <button class="btn" onclick="preview()">Preview</button>
        <button class="btn btn-primary" onclick="importAnswer()">Import</button>
      </div>

      <form id="hidden-form" method="POST" action="/import" style="display:none">
        <input type="hidden" name="payload" id="hidden-payload">
      </form>
    </div>

    <script>
      function getJson() {
        try { return JSON.parse(document.getElementById('json-input').value); }
        catch(e) { showError('Invalid JSON: ' + e.message); return null; }
      }
      function showError(msg) { const b = document.getElementById('error-box'); b.textContent = msg; b.style.display = 'block'; }
      function clearError() { document.getElementById('error-box').style.display = 'none'; }
      function preview() {
        clearError();
        const data = getJson();
        if (!data) return;
        document.getElementById('preview-inner').innerHTML =
          '<div><strong>Title:</strong> ' + (data.title || '—') + '</div>' +
          '<div><strong>Niche:</strong> ' + (data.niche || '—') + '</div>' +
          '<div><strong>Summary:</strong> ' + (data.summary || '—') + '</div>' +
          '<div><strong>Blocks:</strong> ' + (Array.isArray(data.content) ? data.content.length + ' blocks' : 'invalid') + '</div>';
        document.getElementById('preview').style.display = 'block';
      }
      function importAnswer() {
        clearError();
        const data = getJson();
        if (!data) return;
        if (!data.title) return showError('title is required');
        if (!Array.isArray(data.content)) return showError('content must be an array');
        document.getElementById('hidden-payload').value = JSON.stringify(data);
        document.getElementById('hidden-form').submit();
      }
    </script>
  `));
});

r.post('/import', async (req, res) => {
  let data;
  try { data = JSON.parse(req.body.payload); } catch { return res.redirect('/import'); }

  const niches = await query('SELECT * FROM niches');
  const { nicheId, matchInfo } = matchNiche(niches, data.niche);

  const id = generateId(data.title);
  const createdAt = data.created_at || new Date().toISOString().split('T')[0];

  await run('INSERT INTO answers (id, title, niche_id, summary, content, created_at, starred) VALUES (?,?,?,?,?,?,0)',
    [id, data.title, nicheId, data.summary || '', JSON.stringify(data.content), createdAt]);

  if (!nicheId && data.niche) {
    return res.redirect('/answer/' + id + '/pick-niche?unmatched=' + encodeURIComponent(data.niche));
  }

  const fuzzyParam = matchInfo ? '?fuzzy_from=' + encodeURIComponent(matchInfo.from) + '&fuzzy_to=' + encodeURIComponent(matchInfo.to) : '';
  res.redirect('/answer/' + id + fuzzyParam);
});

export default r;
