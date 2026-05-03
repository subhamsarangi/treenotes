Good picture. Here MVP feature ideas ranked by value/effort:

**High value, low effort**
- **Tags** — cross-niche labels (e.g. "important", "todo", "review"). Answers can have multiple tags. Filter by tag on home/niche pages.
- **Full-text search** — search across answer titles + summaries. SQLite FTS5 already available in libSQL.
- **Bulk import** — accept JSON array, import multiple answers at once. One form change.
- **Answer templates** — predefined content block structures for common answer types (how-to, concept, comparison).

**High value, medium effort**
- **Export** — download all answers as JSON (backup/portability). Single endpoint, no schema change.
- **Niche ordering** — drag-reorder niches on home page. Store `sort_order` int on niches table.
- **Answer count badges** — show count per niche on home. Just a JOIN query.
- **Prompt variables** — let prompts have `{{niche}}` / `{{title}}` placeholders, auto-fill from context.
- **Recently viewed** — track last N visited answers, show on home. Session or small DB table.

**Medium value, medium effort**
- **Collections / playlists** — group answers into ordered reading lists, separate from niches.
- **Answer versioning** — store previous content on edit. New `answer_history` table.
- **Niche templates** — when creating niche, pick from preset configs (color/icon/description).
- **Keyboard shortcuts** — `g h` home, `g g` graph, `/` search, `s` star. Pure JS.
- **PWA offline** — `sw.js` already exists, just needs caching strategy wired up.

**Lower priority**
- **Share links** — public read-only URL for single answer. Add `public` bool to answers.
- **AI re-import** — button on answer page to re-run prompt and update content.
- **Niche merge** — move all answers from one niche to another, delete source.
