-- Migration 003: Consolidate prev_sibling and next_sibling into sibling
-- This requires updating the CHECK constraint on answer_links

-- 1. Create temporary table with updated constraint
CREATE TABLE answer_links_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_id TEXT NOT NULL REFERENCES answers(id),
  to_id TEXT NOT NULL REFERENCES answers(id),
  relation_type TEXT NOT NULL CHECK(relation_type IN ('parent', 'sibling', 'friend', 'child')),
  owner_id TEXT REFERENCES users(id)
);

-- 2. Copy data, mapping prev/next_sibling to sibling
-- Note: We also handle 'child' if it was ever manually inserted, 
-- though the app usually inserts 'parent' with IDs swapped.
INSERT INTO answer_links_new (id, from_id, to_id, relation_type, owner_id)
SELECT id, from_id, to_id, 
  CASE 
    WHEN relation_type IN ('prev_sibling', 'next_sibling') THEN 'sibling'
    ELSE relation_type 
  END, 
  owner_id
FROM answer_links;

-- 3. Drop old table and rename new one
DROP TABLE answer_links;
ALTER TABLE answer_links_new RENAME TO answer_links;

-- 4. Recreate indexes
CREATE INDEX IF NOT EXISTS idx_answer_links_from ON answer_links(from_id);
CREATE INDEX IF NOT EXISTS idx_answer_links_to ON answer_links(to_id);

-- 5. Enforce single parent constraint (an answer can only have one parent)
CREATE UNIQUE INDEX IF NOT EXISTS idx_answer_one_parent ON answer_links(from_id) WHERE relation_type = 'parent';
