import { createClient } from '@libsql/client';

let client;

export async function getDb() {
  if (client) return client;

  client = createClient({
    url: process.env.TURSO_DATABASE_URL || 'file:./data.sqlite',
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  await client.executeMultiple(`
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
      relation_type TEXT NOT NULL CHECK(relation_type IN ('parent', 'sibling', 'friend', 'child'))
    );
    CREATE INDEX IF NOT EXISTS idx_answers_niche_id ON answers(niche_id);
    CREATE INDEX IF NOT EXISTS idx_answers_starred ON answers(starred);
    CREATE INDEX IF NOT EXISTS idx_answer_links_from ON answer_links(from_id);
    CREATE INDEX IF NOT EXISTS idx_answer_links_to ON answer_links(to_id);
    CREATE TABLE IF NOT EXISTS prompts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      content TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (date('now'))
    );
    CREATE TABLE IF NOT EXISTS sessions (
      sid TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      expires_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
  `);

  // Simple migrations for existing databases
  try { await client.execute('ALTER TABLE niches ADD COLUMN owner_id TEXT'); } catch(_e) {}
  try { await client.execute('ALTER TABLE answers ADD COLUMN owner_id TEXT'); } catch(_e) {}
  try { await client.execute('ALTER TABLE answers ADD COLUMN is_public INTEGER DEFAULT 0'); } catch(_e) {}
  try { await client.execute('ALTER TABLE answer_links ADD COLUMN owner_id TEXT'); } catch(_e) {}

  // Seed prompts from files if table is empty
  const existing = await client.execute('SELECT COUNT(*) as cnt FROM prompts');
  if (existing.rows[0].cnt === 0) {
    const { readdirSync, readFileSync, existsSync } = await import('fs');
    const { join } = await import('path');
    const promptsDir = './prompts';
    if (existsSync(promptsDir)) {
      const files = readdirSync(promptsDir).filter(f => f.endsWith('.txt'));
      for (const file of files) {
        const content = readFileSync(join(promptsDir, file), 'utf-8');
        const id = file.replace('.txt', '');
        const name = id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        await client.execute({ sql: 'INSERT OR IGNORE INTO prompts (id, name, content) VALUES (?,?,?)', args: [id, name, content] });
      }
    }
  }

  return client;
}

export async function query(sql, params = []) {
  const result = await client.execute({ sql, args: params });
  return result.rows;
}

export async function run(sql, params = []) {
  await client.execute({ sql, args: params });
}
