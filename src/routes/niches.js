import { Router } from 'express';
import { query, run } from '../db/index.js';
import { layout } from '../lib/layout.js';
import { generateId } from '../lib/utils.js';

const r = Router();

const COLORS = ['#c8b4fa','#7ee8b4','#f4a96a','#f87171','#60c4f8','#f9d96a','#e884c4'];
const ICONS = ['✦','◈','◉','⬡','◆','▲','●','★','⬢','◎'];

r.get('/niches', (req, res) => {
  const niches = query('SELECT n.*, COUNT(a.id) as cnt FROM niches n LEFT JOIN answers a ON a.niche_id = n.id GROUP BY n.id');
  res.send(layout('Niches', `
    <div class="container">
      <div class="flex-between mt-4 mb-2">
        <h1>Niches</h1>
        <a href="/niches/new" class="btn btn-primary">+ New Niche</a>
      </div>
      <div class="grid-2 mt-3">
        ${niches.map(n => `
          <div class="card" style="border-color:${n.color}40">
            <div class="flex-between">
              <div style="font-size:2rem">${n.icon}</div>
              <div class="flex-gap">
                <a href="/niches/${n.id}/edit" class="btn btn-ghost small">Edit</a>
              </div>
            </div>
            <a href="/niche/${n.id}" style="text-decoration:none">
              <div style="font-family:'Fraunces',serif;font-size:1.3rem;color:${n.color};margin-top:0.5rem">${n.name}</div>
            </a>
            <div class="muted small mt-1">${n.description || ''}</div>
            <div class="muted small mt-1">${n.cnt} answers</div>
          </div>
        `).join('') || '<div class="muted">No niches yet.</div>'}
      </div>
    </div>
  `));
});

r.get('/niches/new', (req, res) => {
  res.send(nicheForm(null));
});

r.post('/niches/new', (req, res) => {
  const { name, description, color, icon } = req.body;
  const id = generateId(name);
  run('INSERT INTO niches (id, name, description, color, icon) VALUES (?,?,?,?,?)',
    [id, name, description || '', color || COLORS[0], icon || '✦']);
  res.redirect('/niches');
});

r.get('/niches/:id/edit', (req, res) => {
  const niche = query('SELECT * FROM niches WHERE id = ?', [req.params.id])[0];
  if (!niche) return res.redirect('/niches');
  res.send(nicheForm(niche));
});

r.post('/niches/:id/edit', (req, res) => {
  const { name, description, color, icon } = req.body;
  run('UPDATE niches SET name=?, description=?, color=?, icon=? WHERE id=?',
    [name, description || '', color, icon, req.params.id]);
  res.redirect('/niches');
});

function nicheForm(niche) {
  const isEdit = !!niche;
  return layout(isEdit ? 'Edit Niche' : 'New Niche', `
    <div class="container" style="max-width:520px">
      <h1 class="mt-4 mb-2">${isEdit ? 'Edit Niche' : 'New Niche'}</h1>
      <form method="POST">
        <div class="form-group">
          <label>Name</label>
          <input name="name" required value="${niche?.name || ''}">
        </div>
        <div class="form-group">
          <label>Description</label>
          <input name="description" value="${niche?.description || ''}">
        </div>
        <div class="form-group">
          <label>Color</label>
          <div class="flex-gap mt-1">
            ${COLORS.map(c => `
              <label style="cursor:pointer">
                <input type="radio" name="color" value="${c}" ${(niche?.color || COLORS[0]) === c ? 'checked' : ''} style="display:none">
                <span style="display:inline-block;width:28px;height:28px;border-radius:50%;background:${c};border:2px solid transparent;transition:border-color 0.15s" onclick="this.style.borderColor='#fff'"></span>
              </label>
            `).join('')}
          </div>
        </div>
        <div class="form-group">
          <label>Icon</label>
          <div class="flex-gap mt-1">
            ${ICONS.map(i => `
              <label style="cursor:pointer;font-size:1.4rem">
                <input type="radio" name="icon" value="${i}" ${(niche?.icon || '✦') === i ? 'checked' : ''} style="display:none">
                <span style="padding:4px 6px;border-radius:6px;border:1px solid transparent;transition:border-color 0.15s" onclick="document.querySelectorAll('.icon-opt').forEach(x=>x.style.borderColor='transparent');this.style.borderColor='var(--accent)'" class="icon-opt">${i}</span>
              </label>
            `).join('')}
          </div>
        </div>
        <div class="flex-gap mt-3">
          <button type="submit" class="btn btn-primary">${isEdit ? 'Save' : 'Create'}</button>
          <a href="/niches" class="btn btn-ghost">Cancel</a>
        </div>
      </form>
    </div>
  `);
}

export default r;
