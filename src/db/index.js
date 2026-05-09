import { createClient } from '@libsql/client';

let client;

export async function getDb() {
  if (client) return client;

  client = createClient({
    url: process.env.TURSO_DATABASE_URL || 'file:./data.sqlite',
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  const { readFileSync, readdirSync, existsSync } = await import('fs');
  const { join } = await import('path');
  const migrationsDir = join(process.cwd(), 'migrations');

  // 1. Run base schema
  const schemaPath = join(migrationsDir, 'schema.sql');
  if (existsSync(schemaPath)) {
    const schema = readFileSync(schemaPath, 'utf-8');
    await client.executeMultiple(schema);
  }

  // 2. Run numbered migrations in order
  if (existsSync(migrationsDir)) {
    const files = readdirSync(migrationsDir)
      .filter(f => f.match(/^\d+.*\.sql$/))
      .sort();
    
    for (const file of files) {
      const sql = readFileSync(join(migrationsDir, file), 'utf-8');
      try {
        await client.executeMultiple(sql);
      } catch {
        // Migrations might fail if already run (e.g. ALTER TABLE adds existing column)
        console.log(`Migration ${file} skipped or already applied.`);
      }
    }
  }

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
