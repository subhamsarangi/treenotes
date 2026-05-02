-- Migration 002: Assign all existing assets to the first registered user
-- Run this AFTER registering your account and AFTER running migration 001
-- Replace the subquery with a literal user ID if preferred:
--   UPDATE niches SET owner_id = 'your-user-id-here' WHERE owner_id IS NULL;

UPDATE niches
SET owner_id = (SELECT id FROM users ORDER BY created_at ASC LIMIT 1)
WHERE owner_id IS NULL;

UPDATE answers
SET owner_id = (SELECT id FROM users ORDER BY created_at ASC LIMIT 1)
WHERE owner_id IS NULL;

UPDATE answer_links
SET owner_id = (SELECT id FROM users ORDER BY created_at ASC LIMIT 1)
WHERE owner_id IS NULL;
