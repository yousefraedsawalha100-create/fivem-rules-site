/*
# Recreate Original Roleplay Server Management Schema

This migration recreates the exact schema from the original site at
roleplay-server-mana-yb5v.bolt.host. It drops the old tables (which only had
sample data from a previous attempt) and creates the correct ones matching
the original app's data model.

1. Tables Dropped (old attempt, no user data to preserve)
- sectors, gangs, rules, administration (old schema with wrong columns)

2. New Tables
- `settings` (id=1 singleton) — server configuration
  - id (int, pk, default 1)
  - server_name (text)
  - server_description (text)
  - server_ip (text)
  - discord_url (text)
  - logo_url (text)
  - admin_password (text)
- `categories` — rule categories (الأقسام)
  - id (uuid, pk)
  - name (text)
  - sort_order (int, default 0)
  - created_at (timestamptz)
- `rules` — individual rules within categories
  - id (uuid, pk)
  - title (text)
  - content (text)
  - category_id (uuid, fk -> categories)
  - sort_order (int, default 0)
  - created_at (timestamptz)
- `sectors` — top-level groups (القطاعات)
  - id (uuid, pk)
  - name (text)
  - icon (text, default 'Building2')
  - sort_order (int, default 0)
  - created_at (timestamptz)
- `sector_members` — members belonging to a sector
  - id (uuid, pk)
  - name (text)
  - rank_name (text)
  - sector_id (uuid, fk -> sectors)
  - sort_order (int, default 0)
  - created_at (timestamptz)
- `gangs` — top-level groups (العصابات)
  - id (uuid, pk)
  - name (text)
  - icon (text, default 'Swords')
  - sort_order (int, default 0)
  - created_at (timestamptz)
- `gang_members` — members belonging to a gang
  - id (uuid, pk)
  - name (text)
  - rank_name (text)
  - gang_id (uuid, fk -> gangs)
  - sort_order (int, default 0)
  - created_at (timestamptz)
- `management` — admin team members (الإدارة)
  - id (uuid, pk)
  - name (text)
  - rank_name (text)
  - sort_order (int, default 0)
  - created_at (timestamptz)
- `ranks` — server ranks/roles with permissions
  - id (uuid, pk)
  - name (text)
  - color (text, default '#6b7280')
  - permissions (jsonb, default {})
  - is_default (boolean, default false)
  - sort_order (int, default 0)
  - created_at (timestamptz)

3. Security
- RLS enabled on all tables.
- Single-tenant, no auth — all policies allow anon + authenticated full CRUD.
*/

-- Drop old tables (from previous attempt, no user data)
DROP TABLE IF EXISTS gangs CASCADE;
DROP TABLE IF EXISTS administration CASCADE;
DROP TABLE IF EXISTS rules CASCADE;
DROP TABLE IF EXISTS sectors CASCADE;

-- settings (singleton, id=1)
CREATE TABLE IF NOT EXISTS settings (
  id int PRIMARY KEY DEFAULT 1,
  server_name text NOT NULL DEFAULT 'سيرفرنا',
  server_description text NOT NULL DEFAULT 'سيرفر رول بلاي عربي',
  server_ip text NOT NULL DEFAULT '',
  discord_url text NOT NULL DEFAULT '',
  logo_url text NOT NULL DEFAULT '',
  admin_password text NOT NULL DEFAULT 'admin',
  CONSTRAINT settings_single_row CHECK (id = 1)
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all_settings" ON settings;
CREATE POLICY "anon_all_settings" ON settings FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

-- categories
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all_categories" ON categories;
CREATE POLICY "anon_all_categories" ON categories FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

-- rules
CREATE TABLE IF NOT EXISTS rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text DEFAULT '',
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all_rules" ON rules;
CREATE POLICY "anon_all_rules" ON rules FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

-- sectors
CREATE TABLE IF NOT EXISTS sectors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  icon text NOT NULL DEFAULT 'Building2',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sectors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all_sectors" ON sectors;
CREATE POLICY "anon_all_sectors" ON sectors FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

-- sector_members
CREATE TABLE IF NOT EXISTS sector_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  rank_name text DEFAULT '',
  sector_id uuid REFERENCES sectors(id) ON DELETE CASCADE,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sector_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all_sector_members" ON sector_members;
CREATE POLICY "anon_all_sector_members" ON sector_members FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

-- gangs
CREATE TABLE IF NOT EXISTS gangs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  icon text NOT NULL DEFAULT 'Swords',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE gangs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all_gangs" ON gangs;
CREATE POLICY "anon_all_gangs" ON gangs FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

-- gang_members
CREATE TABLE IF NOT EXISTS gang_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  rank_name text DEFAULT '',
  gang_id uuid REFERENCES gangs(id) ON DELETE CASCADE,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE gang_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all_gang_members" ON gang_members;
CREATE POLICY "anon_all_gang_members" ON gang_members FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

-- management
CREATE TABLE IF NOT EXISTS management (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  rank_name text DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE management ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all_management" ON management;
CREATE POLICY "anon_all_management" ON management FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

-- ranks
CREATE TABLE IF NOT EXISTS ranks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text NOT NULL DEFAULT '#6b7280',
  permissions jsonb NOT NULL DEFAULT '{}',
  is_default boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ranks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all_ranks" ON ranks;
CREATE POLICY "anon_all_ranks" ON ranks FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rules_category_id ON rules(category_id);
CREATE INDEX IF NOT EXISTS idx_sector_members_sector_id ON sector_members(sector_id);
CREATE INDEX IF NOT EXISTS idx_gang_members_gang_id ON gang_members(gang_id);
