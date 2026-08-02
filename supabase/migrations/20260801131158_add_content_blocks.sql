/*
# Add content blocks for rich text + media

This migration adds a `content_blocks` table that lets the admin attach
rich content (large text, images, videos) to any sector, gang, or
management member — displayed publicly as expandable content cards.

1. New Tables
- `content_blocks`
  - id (uuid, pk)
  - parent_type (text) — 'sector' | 'gang' | 'management'
  - parent_id (uuid) — FK to sectors.id, gangs.id, or management.id (nullable, set per row)
  - title (text) — large heading displayed publicly
  - body (text) — unlimited-length rich text content
  - media_type (text) — 'none' | 'image' | 'video'
  - media_url (text) — URL of image or video
  - sort_order (int, default 0)
  - created_at (timestamptz)

2. Security
- RLS enabled.
- Single-tenant no-auth: anon + authenticated full CRUD.
*/

CREATE TABLE IF NOT EXISTS content_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_type text NOT NULL DEFAULT 'sector',
  parent_id uuid,
  title text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  media_type text NOT NULL DEFAULT 'none',
  media_url text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all_content_blocks" ON content_blocks;
CREATE POLICY "anon_all_content_blocks" ON content_blocks FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_content_blocks_parent ON content_blocks(parent_type, parent_id);
