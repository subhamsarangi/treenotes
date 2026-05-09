-- Migration 002: Add is_public field to answers
-- Run this against your Turso DB to support private/public answers

ALTER TABLE answers ADD COLUMN is_public INTEGER DEFAULT 0;
