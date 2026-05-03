import { Router } from 'express';
import { query } from '../db/index.js';
import { layout } from '../lib/layout.js';

const r = Router();

r.get('/graph', async (req, res) => {
  const answers = await query(
    'SELECT a.id, a.title, a.starred, a.niche_id, n.name as niche_name, n.color as niche_color FROM answers a LEFT JOIN niches n ON a.niche_id = n.id WHERE a.owner_id = ?',
    [req.user.id]
  );

  const links = await query(
    `SELECT al.from_id, al.to_id, al.relation_type
     FROM answer_links al
     JOIN answers a1 ON a1.id = al.from_id AND a1.owner_id = ?
     JOIN answers a2 ON a2.id = al.to_id AND a2.owner_id = ?`,
    [req.user.id, req.user.id]
  );

  const nodes = answers.map(a => ({
    id: a.id,
    title: a.title,
    starred: a.starred,
    niche_id: a.niche_id || '__none__',
    niche_name: a.niche_name || 'No Niche',
    color: a.niche_color || '#6b6880',
  }));

  const edges = links.map(l => ({
    source: l.from_id,
    target: l.to_id,
    type: l.relation_type,
  }));

  res.send(layout('Answer Graph', `
    <div style="display:flex;flex-direction:column;height:calc(100vh - 57px)">

      <div style="display:flex;align-items:center;justify-content:space-between;padding:0.8rem 1.5rem;border-bottom:1px solid var(--border);flex-shrink:0;flex-wrap:wrap;gap:0.6rem">
        <div class="flex-gap">
          <span style="font-family:'Fraunces',serif;font-size:1.1rem">Answer Graph</span>
          <span class="chip" id="node-count"></span>
        </div>
        <div class="flex-gap">
          <input id="graph-search" placeholder="Search answers…" style="width:200px;padding:0.4rem 0.7rem;font-size:0.82rem">
          <button class="btn btn-ghost small" onclick="resetZoom()">Reset zoom</button>
          <a href="/" class="btn btn-ghost small">← Home</a>
        </div>
      </div>

      <div id="legend" style="display:flex;gap:1.2rem;padding:0.5rem 1.5rem;border-bottom:1px solid var(--border);flex-wrap:wrap;flex-shrink:0;font-size:0.78rem;color:var(--muted)">
        <span style="display:flex;align-items:center;gap:0.4rem"><svg width="28" height="6"><line x1="0" y1="3" x2="28" y2="3" stroke="#c8b4fa" stroke-width="2"/></svg>parent</span>
        <span style="display:flex;align-items:center;gap:0.4rem"><svg width="28" height="6"><line x1="0" y1="3" x2="28" y2="3" stroke="#7ee8b4" stroke-width="1.5" stroke-dasharray="4,3"/></svg>sibling</span>
        <span style="display:flex;align-items:center;gap:0.4rem"><svg width="28" height="6"><line x1="0" y1="3" x2="28" y2="3" stroke="#f4a96a" stroke-width="1.5" stroke-dasharray="2,2"/></svg>friend</span>
        <span style="display:flex;align-items:center;gap:0.4rem"><svg width="28" height="28" style="flex-shrink:0"><circle cx="14" cy="14" r="13" fill="#c8b4fa22" stroke="#c8b4fa" stroke-width="2.5"/><text x="14" y="18" text-anchor="middle" font-size="11" fill="#f4a96a">★</text></svg>starred</span>
      </div>

      <div id="graph-container" style="flex:1;position:relative;overflow:hidden;background:var(--bg);z-index:1">
        <svg id="graph-svg" style="width:100%;height:100%"></svg>
        <div id="tooltip" style="display:none;position:absolute;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:0.6rem 0.9rem;font-size:0.85rem;pointer-events:auto;max-width:240px;z-index:10;box-shadow:0 4px 20px rgba(0,0,0,0.4);cursor:pointer;transition:border-color 0.15s" id="tooltip"></div>
      </div>
    </div>

    <script>
      const NODES = ${JSON.stringify(nodes)};
      const EDGES = ${JSON.stringify(edges)};
    </script>
    <script type="module">
      import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

      const svg = d3.select('#graph-svg');
      const container = document.getElementById('graph-container');
      const tooltip = document.getElementById('tooltip');

      let width = container.clientWidth;
      let height = container.clientHeight;

      document.getElementById('node-count').textContent = NODES.length + ' answers';

      // Edge style by type
      const edgeStyle = {
        parent:       { stroke: '#c8b4fa', width: 2,   dash: null },
        prev_sibling: { stroke: '#7ee8b4', width: 1.5, dash: '4,3' },
        next_sibling: { stroke: '#7ee8b4', width: 1.5, dash: '4,3' },
        friend:       { stroke: '#f4a96a', width: 1.5, dash: '2,2' },
      };

      // Arrow markers per type
      const defs = svg.append('defs');
      Object.entries(edgeStyle).forEach(([type, s]) => {
        defs.append('marker')
          .attr('id', 'arrow-' + type)
          .attr('viewBox', '0 -4 8 8')
          .attr('refX', 18).attr('refY', 0)
          .attr('markerWidth', 6).attr('markerHeight', 6)
          .attr('orient', 'auto')
          .append('path')
          .attr('d', 'M0,-4L8,0L0,4')
          .attr('fill', s.stroke).attr('opacity', 0.7);
      });

      const g = svg.append('g');

      // Zoom
      const zoom = d3.zoom().scaleExtent([0.1, 4]).on('zoom', e => g.attr('transform', e.transform));
      svg.call(zoom);
      window.resetZoom = () => svg.transition().duration(400).call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(0.9));

      // Simulation
      const sim = d3.forceSimulation(NODES)
        .force('link', d3.forceLink(EDGES).id(d => d.id).distance(120).strength(0.6))
        .force('charge', d3.forceManyBody().strength(-320))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide(28));

      // Edges
      const link = g.append('g').selectAll('line')
        .data(EDGES).join('line')
        .attr('stroke', d => (edgeStyle[d.type] || edgeStyle.friend).stroke)
        .attr('stroke-width', d => (edgeStyle[d.type] || edgeStyle.friend).width)
        .attr('stroke-dasharray', d => (edgeStyle[d.type] || edgeStyle.friend).dash || null)
        .attr('stroke-opacity', 0.55)
        .attr('marker-end', d => 'url(#arrow-' + d.type + ')');

      // Nodes — grab, no click navigation
      const node = g.append('g').selectAll('g')
        .data(NODES).join('g')
        .attr('class', 'graph-node')
        .style('cursor', 'grab')
        .call(d3.drag()
          .on('start', (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; d._dragged = false; })
          .on('drag',  (e, d) => { d.fx = e.x; d.fy = e.y; d._dragged = true; })
          .on('end',   (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; })
        );

      node.append('circle')
        .attr('r', d => d.starred ? 14 : 10)
        .attr('fill', d => d.color + '22')
        .attr('stroke', d => d.color)
        .attr('stroke-width', d => d.starred ? 2.5 : 1.5);

      // Star badge
      node.filter(d => d.starred).append('text')
        .attr('text-anchor', 'middle').attr('dy', '0.35em')
        .attr('font-size', '9px').attr('fill', '#f4a96a')
        .text('★');

      node.append('text')
        .attr('dy', d => (d.starred ? 14 : 10) + 10)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('fill', 'var(--text)')
        .attr('pointer-events', 'none')
        .text(d => d.title.length > 22 ? d.title.slice(0, 20) + '…' : d.title);

      // Tooltip — clickable info box, pointer-events:auto
      let activeNode = null;

      function showTooltip(e, d) {
        activeNode = d;
        tooltip.innerHTML =
          \`<div style="font-weight:500;margin-bottom:0.3rem">\${d.title}</div>\` +
          \`<div style="color:var(--muted);font-size:0.78rem;margin-bottom:0.6rem">\${d.niche_name}\${d.starred ? ' · ★' : ''}</div>\` +
          \`<div style="font-size:0.78rem;color:var(--accent);text-decoration:underline">Open answer →</div>\`;
        tooltip.style.borderColor = d.color;
        tooltip.style.display = 'block';
        positionTooltip(e);
      }

      function positionTooltip(e) {
        const rect = container.getBoundingClientRect();
        let x = e.clientX - rect.left + 16;
        let y = e.clientY - rect.top - 10;
        if (x + 260 > width) x = e.clientX - rect.left - 260;
        if (y + 100 > height) y = e.clientY - rect.top - 100;
        tooltip.style.left = x + 'px';
        tooltip.style.top  = y + 'px';
      }

      node.on('mouseenter', (e, d) => {
        if (!d._dragged) showTooltip(e, d);
      }).on('mousemove', e => {
        // only reposition if tooltip is from hover (not pinned)
      }).on('mouseleave', (e, d) => {
        // hide only if not clicked/pinned
        if (activeNode !== d) return;
        // small delay so user can move into tooltip
        setTimeout(() => {
          if (!tooltip.matches(':hover')) {
            tooltip.style.display = 'none';
            activeNode = null;
          }
        }, 120);
      }).on('click', (e, d) => {
        if (e.defaultPrevented || d._dragged) return;
        showTooltip(e, d);
      });

      tooltip.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
        activeNode = null;
      });

      tooltip.addEventListener('click', () => {
        if (activeNode) window.location.href = '/answer/' + activeNode.id;
      });

      sim.on('tick', () => {
        link
          .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
        node.attr('transform', d => \`translate(\${d.x},\${d.y})\`);
      });

      // Fit to bounding box once simulation settles
      function fitGraph() {
        if (!NODES.length) return;
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        NODES.forEach(d => {
          if (d.x < minX) minX = d.x; if (d.x > maxX) maxX = d.x;
          if (d.y < minY) minY = d.y; if (d.y > maxY) maxY = d.y;
        });
        const pad = 60;
        const bw = maxX - minX + pad * 2;
        const bh = maxY - minY + pad * 2;
        const scale = Math.min(width / bw, height / bh, 1.2);
        const tx = width  / 2 - scale * (minX + maxX) / 2;
        const ty = height / 2 - scale * (minY + maxY) / 2;
        svg.transition().duration(500)
          .call(zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));
      }

      sim.on('end', fitGraph);
      // Fallback: fit after 1.5s in case simulation runs long
      setTimeout(() => { if (sim.alpha() > 0.01) sim.stop(); fitGraph(); }, 1500);

      // Search highlight
      document.getElementById('graph-search').addEventListener('input', function() {
        const q = this.value.toLowerCase().trim();
        node.selectAll('circle')
          .attr('opacity', d => !q || d.title.toLowerCase().includes(q) ? 1 : 0.12);
        node.selectAll('text')
          .attr('opacity', d => !q || d.title.toLowerCase().includes(q) ? 1 : 0.12);
        link.attr('opacity', d => {
          if (!q) return 0.55;
          const sm = d.source.title?.toLowerCase().includes(q);
          const tm = d.target.title?.toLowerCase().includes(q);
          return sm || tm ? 0.7 : 0.06;
        });
      });

      // Resize
      new ResizeObserver(() => {
        width = container.clientWidth;
        height = container.clientHeight;
        sim.force('center', d3.forceCenter(width / 2, height / 2)).alpha(0.1).restart();
      }).observe(container);
    </script>
  `, req.user));
});

export default r;
