-- Lumina Database Schema

CREATE TABLE IF NOT EXISTS niches (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  icon TEXT DEFAULT '✦',
  image TEXT
);

CREATE TABLE IF NOT EXISTS answers (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  niche_id TEXT REFERENCES niches(id),
  summary TEXT,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL,
  starred INTEGER DEFAULT 0,
  image TEXT
);

CREATE TABLE IF NOT EXISTS answer_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_id TEXT NOT NULL REFERENCES answers(id),
  to_id TEXT NOT NULL REFERENCES answers(id),
  relation_type TEXT NOT NULL CHECK(relation_type IN ('parent','prev_sibling','next_sibling','friend'))
);

CREATE TABLE IF NOT EXISTS prompts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  content TEXT NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_answers_niche_id ON answers(niche_id);
CREATE INDEX IF NOT EXISTS idx_answers_starred ON answers(starred);
CREATE INDEX IF NOT EXISTS idx_answer_links_from ON answer_links(from_id);
CREATE INDEX IF NOT EXISTS idx_answer_links_to ON answer_links(to_id);
