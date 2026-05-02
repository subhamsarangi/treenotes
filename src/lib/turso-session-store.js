import session from 'express-session';

/**
 * A simple express-session store backed by Turso/libSQL.
 * Sessions are stored in a `sessions` table and cleaned up on access.
 */
export class TursoSessionStore extends session.Store {
  constructor(client, options = {}) {
    super();
    this.client = client;
    this.ttl = options.ttl || 7 * 24 * 60 * 60; // 7 days in seconds
  }

  async get(sid, callback) {
    try {
      const now = Math.floor(Date.now() / 1000);
      const result = await this.client.execute({
        sql: 'SELECT data FROM sessions WHERE sid = ? AND expires_at > ?',
        args: [sid, now],
      });
      if (!result.rows.length) return callback(null, null);
      const data = JSON.parse(result.rows[0].data);
      callback(null, data);
    } catch (err) {
      callback(err);
    }
  }

  async set(sid, sessionData, callback) {
    try {
      const expiresAt = Math.floor(Date.now() / 1000) + this.ttl;
      const data = JSON.stringify(sessionData);
      await this.client.execute({
        sql: `INSERT INTO sessions (sid, data, expires_at)
              VALUES (?, ?, ?)
              ON CONFLICT(sid) DO UPDATE SET data = excluded.data, expires_at = excluded.expires_at`,
        args: [sid, data, expiresAt],
      });
      callback(null);
    } catch (err) {
      callback(err);
    }
  }

  async destroy(sid, callback) {
    try {
      await this.client.execute({
        sql: 'DELETE FROM sessions WHERE sid = ?',
        args: [sid],
      });
      callback(null);
    } catch (err) {
      callback(err);
    }
  }

  async touch(sid, sessionData, callback) {
    try {
      const expiresAt = Math.floor(Date.now() / 1000) + this.ttl;
      await this.client.execute({
        sql: 'UPDATE sessions SET expires_at = ? WHERE sid = ?',
        args: [expiresAt, sid],
      });
      callback(null);
    } catch (err) {
      callback(err);
    }
  }
}
