import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';

const DB_PATH = './data.sqlite';
let db;

export async function getDb() {
  if (db) return db;
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    db = new SQL.Database(fs.readFileSync(DB_PATH));
  } else {
    db = new SQL.Database();
  }
  db.run(`
    CREATE TABLE IF NOT EXISTS niches (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      color TEXT DEFAULT '#6366f1',
      icon TEXT DEFAULT '✦'
    );
    CREATE TABLE IF NOT EXISTS answers (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      niche_id TEXT REFERENCES niches(id),
      summary TEXT,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL,
      starred INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS answer_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_id TEXT NOT NULL REFERENCES answers(id),
      to_id TEXT NOT NULL REFERENCES answers(id),
      relation_type TEXT NOT NULL CHECK(relation_type IN ('parent','prev_sibling','next_sibling','friend'))
    );
  `);
  save();
  return db;
}

export function save() {
  if (!db) return;
  fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
}

export function query(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

export function run(sql, params = []) {
  db.run(sql, params);
  save();
}
