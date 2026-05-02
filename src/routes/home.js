import { Router } from 'express';
import { query } from '../db/index.js';
import { layout } from '../lib/layout.js';

const r = Router();

r.get('/', async (req, res) => {
  const niches = await query('SELECT * FROM niches');
  const starred = await query('SELECT a.*, n.name as niche_name, n.color as niche_color FROM answers a LEFT JOIN niches n ON a.niche_id = n.id WHERE a.starred = 1 ORDER BY a.created_at DESC LIMIT 6');
  const counts = await query('SELECT niche_id, COUNT(*) as cnt FROM answers GROUP BY niche_id');
  const countMap = Object.fromEntries(counts.map(c => [c.niche_id, c.cnt]));
  const unnichedAnswers = await query('SELECT * FROM answers WHERE niche_id IS NULL ORDER BY created_at DESC');
  const recentAnswers = await query('SELECT a.*, n.name as niche_name, n.color as niche_color FROM answers a LEFT JOIN niches n ON a.niche_id = n.id ORDER BY a.created_at DESC LIMIT 5');

  res.send(layout('Home', `
    <div class="container-wide">
      ${starred.length ? `
        <section class="mt-4">
          <h3 class="mb-2">★ Starred</h3>
          <div class="grid-3">
            ${starred.map(a => `
              <a href="/answer/${a.id}" style="text-decoration:none">
                <div class="card">
                  <div class="flex-gap mb-1">
                    <span class="chip" style="border-color:${a.niche_color}40;color:${a.niche_color}">${a.niche_name || '—'}</span>
                    <span class="star small">★</span>
                  </div>
                  <div style="font-family:'Fraunces',serif;font-size:1.05rem;margin-bottom:0.3rem">${a.title}</div>
                  <div class="muted small">${a.summary || ''}</div>
                </div>
              </a>
            `).join('')}
          </div>
        </section>
      ` : ''}

      ${unnichedAnswers.length ? `
        <section class="mt-4">
          <h3 class="mb-2">Unorganized</h3>
          <div class="flex-col" style="gap:0.5rem">
            ${unnichedAnswers.map(a => `
              <a href="/answer/${a.id}" style="text-decoration:none">
                <div class="card" style="padding:1rem;display:flex;justify-content:space-between;align-items:center">
                  <div>
                    <div style="font-family:'Fraunces',serif;font-size:1rem">${a.title}</div>
                    <div class="muted small">${a.summary || ''}</div>
                  </div>
                  <div class="muted small">${a.created_at}</div>
                </div>
              </a>
            `).join('')}
          </div>
        </section>
      ` : ''}

      <section class="mt-4">
        <div class="flex-between mb-2">
          <h3>Niches</h3>
          <a href="/niches/new" class="btn">+ New Niche</a>
        </div>
        ${niches.length ? `
          <div class="grid-3">
            ${niches.map(n => `
              <a href="/niche/${n.id}" style="text-decoration:none">
                <div class="card" style="border-color:${n.color}30">
                  <div style="font-size:2rem;margin-bottom:0.6rem">${n.icon}</div>
                  <div style="font-family:'Fraunces',serif;font-size:1.1rem;color:${n.color}">${n.name}</div>
                  <div class="muted small mt-1">${n.description || ''}</div>
                  <div class="muted small mt-1">${countMap[n.id] || 0} answers</div>
                </div>
              </a>
            `).join('')}
          </div>
        ` : `<div class="card muted" style="text-align:center;padding:3rem">No niches yet. <a href="/niches/new">Create one</a> or <a href="/import">import an answer</a>.</div>`}
      </section>

      <section class="mt-4">
        <h3 class="mb-2">Recent Answers</h3>
        <div style="display:flex;flex-direction:column;gap:0.5rem">
          ${recentAnswers.map(a => `
            <a href="/answer/${a.id}" style="text-decoration:none">
              <div class="card" style="padding:1rem;display:flex;justify-content:space-between;align-items:center">
                <div>
                  ${a.niche_name ? `<span class="chip" style="border-color:${a.niche_color}40;color:${a.niche_color};margin-bottom:0.3rem;display:inline-flex">${a.niche_name}</span>` : ''}
                  <div style="font-family:'Fraunces',serif;font-size:1rem">${a.starred ? '<span class="star">★ </span>' : ''}${a.title}</div>
                  ${a.summary ? `<div class="muted small">${a.summary}</div>` : ''}
                </div>
                <div class="muted small" style="white-space:nowrap;margin-left:1.5rem">${a.created_at}</div>
              </div>
            </a>
          `).join('')}
        </div>
      </section>
    </div>
  `, req.user));
});

export default r;
