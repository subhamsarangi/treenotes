-- Migration 001: Add users table and owner fields
-- Run this against your Turso DB before deploying auth

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (date('now'))
);

-- Add owner_id to niches (nullable for backward compat)
ALTER TABLE niches ADD COLUMN owner_id TEXT REFERENCES users(id);

-- Add owner_id to answers
ALTER TABLE answers ADD COLUMN owner_id TEXT REFERENCES users(id);

-- Add owner_id to answer_links
ALTER TABLE answer_links ADD COLUMN owner_id TEXT REFERENCES users(id);
