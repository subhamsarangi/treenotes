import { Router } from 'express';
import { query } from '../db/index.js';
import { layout } from '../lib/layout.js';

const r = Router();

function landingPage() {
  return layout('Lumina — Your Personal Knowledge Base', `
    <!-- Hero -->
    <div style="position:relative;overflow:hidden">
      <div class="container" style="padding-top:5rem;padding-bottom:5rem;text-align:center;max-width:760px">
        <div style="display:inline-flex;align-items:center;gap:0.5rem;padding:0.35rem 0.9rem;border-radius:99px;border:1px solid var(--accent)30;background:var(--accent)08;color:var(--accent);font-size:0.78rem;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:2rem">
          ✦ Personal Knowledge Base
        </div>
        <h1 style="font-size:clamp(2.4rem,6vw,4rem);line-height:1.1;margin-bottom:1.5rem;letter-spacing:-0.04em">
          Your AI answers,<br><em style="font-style:italic;color:var(--accent)">organized forever</em>
        </h1>
        <p style="font-size:1.1rem;color:var(--muted);max-width:520px;margin:0 auto 2.5rem;line-height:1.8">
          Stop losing great AI responses in chat history. Lumina lets you store, link, and explore your knowledge — structured, searchable, yours.
        </p>
        <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap">
          <a href="/register" class="btn btn-primary" style="padding:0.75rem 2rem;font-size:1rem">Get started free</a>
          <a href="/login" class="btn" style="padding:0.75rem 2rem;font-size:1rem">Sign in</a>
        </div>
      </div>
    </div>

    <!-- Feature grid -->
    <div class="container" style="padding-top:1rem;padding-bottom:4rem;max-width:1000px">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.5rem;margin-bottom:5rem">

        <div class="card" style="border-color:var(--accent)20;padding:2rem">
          <div style="font-size:2rem;margin-bottom:1rem">🗂</div>
          <h2 style="font-size:1.1rem;font-family:'Outfit',sans-serif;font-weight:500;text-transform:none;letter-spacing:0;color:var(--text);margin-bottom:0.6rem">Organize into Niches</h2>
          <p class="muted small" style="line-height:1.8">Group answers by topic — machine learning, cooking, finance, anything. Each niche gets its own color, icon, and space.</p>
        </div>

        <div class="card" style="border-color:var(--accent2)20;padding:2rem">
          <div style="font-size:2rem;margin-bottom:1rem">🔗</div>
          <h2 style="font-size:1.1rem;font-family:'Outfit',sans-serif;font-weight:500;text-transform:none;letter-spacing:0;color:var(--text);margin-bottom:0.6rem">Link Knowledge Together</h2>
          <p class="muted small" style="line-height:1.8">Connect answers as parent, sibling, or friend relationships. Build a web of understanding, not just a list of notes.</p>
        </div>

        <div class="card" style="border-color:var(--accent3)20;padding:2rem">
          <div style="font-size:2rem;margin-bottom:1rem">🌐</div>
          <h2 style="font-size:1.1rem;font-family:'Outfit',sans-serif;font-weight:500;text-transform:none;letter-spacing:0;color:var(--text);margin-bottom:0.6rem">Visualize Your Graph</h2>
          <p class="muted small" style="line-height:1.8">See all your knowledge as an interactive D3 graph. Spot clusters, gaps, and connections at a glance.</p>
        </div>

        <div class="card" style="border-color:var(--logo)20;padding:2rem">
          <div style="font-size:2rem;margin-bottom:1rem">⚡</div>
          <h2 style="font-size:1.1rem;font-family:'Outfit',sans-serif;font-weight:500;text-transform:none;letter-spacing:0;color:var(--text);margin-bottom:0.6rem">Import via Prompts</h2>
          <p class="muted small" style="line-height:1.8">Use built-in prompt templates with any AI. Paste the structured JSON response and it imports instantly — title, summary, content blocks and all.</p>
        </div>

        <div class="card" style="border-color:var(--accent)20;padding:2rem">
          <div style="font-size:2rem;margin-bottom:1rem">★</div>
          <h2 style="font-size:1.1rem;font-family:'Outfit',sans-serif;font-weight:500;text-transform:none;letter-spacing:0;color:var(--text);margin-bottom:0.6rem">Star &amp; Search</h2>
          <p class="muted small" style="line-height:1.8">Star your best answers for quick access. Search across titles and summaries to find anything fast.</p>
        </div>

        <div class="card" style="border-color:var(--accent2)20;padding:2rem">
          <div style="font-size:2rem;margin-bottom:1rem">📱</div>
          <h2 style="font-size:1.1rem;font-family:'Outfit',sans-serif;font-weight:500;text-transform:none;letter-spacing:0;color:var(--text);margin-bottom:0.6rem">Works Everywhere</h2>
          <p class="muted small" style="line-height:1.8">Installable as a PWA. Works on desktop and mobile. Your knowledge base in your pocket.</p>
        </div>

      </div>

      <!-- How it works -->
      <div style="text-align:center;margin-bottom:3rem">
        <h3 style="font-size:0.75rem;letter-spacing:0.12em;color:var(--muted);margin-bottom:0.8rem">HOW IT WORKS</h3>
        <h2 style="font-size:clamp(1.6rem,4vw,2.4rem);letter-spacing:-0.03em;margin-bottom:3rem">Three steps to a smarter knowledge base</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:2rem;text-align:left">

          <div style="display:flex;flex-direction:column;gap:0.8rem">
            <div style="width:2.4rem;height:2.4rem;border-radius:50%;background:var(--accent)15;border:1px solid var(--accent)30;display:flex;align-items:center;justify-content:center;font-family:'Fraunces',serif;font-size:1.1rem;color:var(--accent)">1</div>
            <div style="font-weight:500;font-size:1rem">Ask your AI</div>
            <p class="muted small" style="line-height:1.8">Use one of Lumina's prompt templates with ChatGPT, Claude, or any AI. The prompt tells the AI to respond in a structured JSON format.</p>
          </div>

          <div style="display:flex;flex-direction:column;gap:0.8rem">
            <div style="width:2.4rem;height:2.4rem;border-radius:50%;background:var(--accent2)15;border:1px solid var(--accent2)30;display:flex;align-items:center;justify-content:center;font-family:'Fraunces',serif;font-size:1.1rem;color:var(--accent2)">2</div>
            <div style="font-weight:500;font-size:1rem">Import the answer</div>
            <p class="muted small" style="line-height:1.8">Paste the JSON into Lumina's import page. It parses the title, summary, niche, and content blocks automatically.</p>
          </div>

          <div style="display:flex;flex-direction:column;gap:0.8rem">
            <div style="width:2.4rem;height:2.4rem;border-radius:50%;background:var(--accent3)15;border:1px solid var(--accent3)30;display:flex;align-items:center;justify-content:center;font-family:'Fraunces',serif;font-size:1.1rem;color:var(--accent3)">3</div>
            <div style="font-weight:500;font-size:1rem">Explore &amp; connect</div>
            <p class="muted small" style="line-height:1.8">Browse by niche, link related answers, star the best ones, and visualize your growing knowledge graph.</p>
          </div>

        </div>
      </div>

      <!-- CTA -->
      <div class="card" style="text-align:center;padding:3.5rem 2rem;border-color:var(--accent)20;background:linear-gradient(135deg,var(--surface) 0%,var(--surface2) 100%)">
        <div style="font-size:2.5rem;margin-bottom:1rem">✦</div>
        <h2 style="font-size:clamp(1.4rem,3vw,2rem);margin-bottom:0.8rem;letter-spacing:-0.02em">Ready to build your knowledge base?</h2>
        <p class="muted small" style="margin-bottom:2rem;max-width:400px;margin-left:auto;margin-right:auto;line-height:1.8">Free to use. No credit card. Just you and your knowledge.</p>
        <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap">
          <a href="/register" class="btn btn-primary" style="padding:0.75rem 2rem;font-size:1rem">Create free account</a>
          <a href="/login" class="btn" style="padding:0.75rem 2rem;font-size:1rem">Sign in</a>
        </div>
      </div>

      <!-- Footer -->
      <div style="text-align:center;margin-top:3rem;padding-top:2rem;border-top:1px solid var(--border)">
        <p class="muted small">Lumina — Personal Knowledge Base &nbsp;·&nbsp; Built with Node.js + Turso</p>
      </div>
    </div>
  `);
}

r.get('/', async (req, res) => {
  // Show landing page to unauthenticated visitors
  if (!req.session || !req.session.userId) {
    return res.send(landingPage());
  }

  const uid = req.session.userId;
  const user = { id: uid, email: req.session.email };

  const niches = await query('SELECT * FROM niches WHERE owner_id = ?', [uid]);
  const starred = await query('SELECT a.*, n.name as niche_name, n.color as niche_color FROM answers a LEFT JOIN niches n ON a.niche_id = n.id WHERE a.starred = 1 AND a.owner_id = ? ORDER BY a.created_at DESC LIMIT 6', [uid]);
  const counts = await query('SELECT niche_id, COUNT(*) as cnt FROM answers WHERE owner_id = ? GROUP BY niche_id', [uid]);
  const countMap = Object.fromEntries(counts.map(c => [c.niche_id, c.cnt]));
  const unnichedAnswers = await query('SELECT * FROM answers WHERE niche_id IS NULL AND owner_id = ? ORDER BY created_at DESC', [uid]);
  const recentAnswers = await query('SELECT a.*, n.name as niche_name, n.color as niche_color FROM answers a LEFT JOIN niches n ON a.niche_id = n.id WHERE a.owner_id = ? ORDER BY a.created_at DESC LIMIT 5', [uid]);

  res.send(layout('Home', `
    <div class="container-wide">
      ${starred.length ? `
        <section class="mt-4">
          <h3 class="mb-2">★ Starred</h3>
          <div class="grid-3" style="align-items:stretch">
            ${starred.map(a => `
              <a href="/answer/${a.id}" style="text-decoration:none;display:flex">
                <div class="card" style="display:flex;flex-direction:column;width:100%">
                  <div class="flex-gap mb-1">
                    <span class="chip" style="border-color:${a.niche_color}40;color:${a.niche_color}">${a.niche_name || '—'}</span>
                    <span class="star small">★</span>
                  </div>
                  <div style="font-family:'Fraunces',serif;font-size:1.05rem;margin-bottom:0.3rem">${a.title}</div>
                  <div class="muted small" style="margin-top:auto">${a.summary || ''}</div>
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
          <div class="niches-grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:1rem">
            ${niches.map(n => `
              <a href="/niche/${n.id}" style="text-decoration:none;display:flex">
                <div class="card" style="border-color:${n.color}30;display:flex;flex-direction:column;width:100%">
                  <div style="font-size:2rem;margin-bottom:0.6rem">${n.icon}</div>
                  <div style="font-family:'Fraunces',serif;font-size:1.1rem;color:${n.color}">${n.name}</div>
                  <div class="muted small mt-1">${n.description || ''}</div>
                  <div class="muted small mt-1" style="margin-top:auto;padding-top:0.5rem">${countMap[n.id] || 0} answers</div>
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
  `, user));
});

export default r;
