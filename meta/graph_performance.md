**Current problems:**

- `d3.forceManyBody().strength(-320)` — O(n²) by default. At ~500 nodes it gets sluggish, at 1000+ it freezes the tab
- All nodes rendered as SVG `<g>` elements — DOM gets heavy fast
- No culling — off-screen nodes still simulate and render every tick
- Labels rendered for every node — unreadable and expensive at density
- Simulation runs on main thread — blocks UI

**What actually needs fixing for scale:**

1. **Barnes-Hut approximation** — D3's `forceManyBody` supports it via `.theta()`, default is 0.9, already somewhat optimized but worth tuning
2. **Alpha decay** — stop simulation faster, freeze nodes sooner
3. **Hide labels until zoomed in** — only show text when zoom scale > threshold
4. **Limit initial render** — cap simulation ticks, don't wait for full convergence
5. **WebGL renderer** — for 1000+ nodes, swap SVG for Canvas/WebGL (e.g. `d3` + canvas, or `sigma.js`)

**Rough node count thresholds with current setup:**
- < 200 nodes: fine
- 200–500: noticeable lag during simulation settle
- 500+: real problems

**I'd tune Barnes-Hut + decay, hide labels when zoomed out, add a node count warning, and switch tick rendering to be capped. Full WebGL rewrite only makes sense if you expect 1000+ answers.