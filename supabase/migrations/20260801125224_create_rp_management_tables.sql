/*
# Roleplay Server Management Tables

This migration creates the four core tables for the roleplay server management dashboard:
sectors, gangs, rules, and administration members.

1. New Tables
- `sectors` — القطاعات (districts/sectors of the city)
  - id (uuid, primary key)
  - name (text, not null) — اسم القطاع
  - description (text) — وصف القطاع
  - color (text) — لون مميز للقطاع
  - leader (text) — اسم قائد القطاع
  - member_count (integer, default 0) — عدد الأعضاء
  - created_at (timestamptz)
- `gangs` — العصابات
  - id (uuid, primary key)
  - name (text, not null) — اسم العصابة
  - leader (text) — اسم قائد العصابة
  - member_count (integer, default 0) — عدد الأعضاء
  - sector_id (uuid, references sectors) — القطاع التابع له
  - status (text, default 'active') — الحالة (active/inactive/war)
  - description (text) — وصف العصابة
  - created_at (timestamptz)
- `rules` — القوانين
  - id (uuid, primary key)
  - title (text, not null) — عنوان القانون
  - category (text) — فئة القانون (general/combat/gangs/property)
  - content (text, not null) — نص القانون
  - penalty (text) — العقوبة
  - severity (text, default 'medium') — مستوى الخطورة (low/medium/high/severe)
  - created_at (timestamptz)
- `administration` — الإدارة
  - id (uuid, primary key)
  - name (text, not null) — اسم المسؤول
  - role (text, not null) — المنصب (owner/admin/moderator/helper)
  - discord_id (text) — معرف الديسكورد
  - status (text, default 'active') — الحالة (active/inactive/away)
  - permissions (text[]) — الصلاحيات
  - created_at (timestamptz)

2. Security
- Enable RLS on all four tables.
- This is a single-tenant management dashboard with no sign-in screen, so all policies
  allow anon + authenticated full CRUD (the data is intentionally shared/managed openly).
*/

-- Sectors table
CREATE TABLE IF NOT EXISTS sectors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  color text DEFAULT '#3b82f6',
  leader text DEFAULT '',
  member_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sectors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_sectors" ON sectors;
CREATE POLICY "anon_select_sectors" ON sectors FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_sectors" ON sectors;
CREATE POLICY "anon_insert_sectors" ON sectors FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_sectors" ON sectors;
CREATE POLICY "anon_update_sectors" ON sectors FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_sectors" ON sectors;
CREATE POLICY "anon_delete_sectors" ON sectors FOR DELETE
  TO anon, authenticated USING (true);

-- Gangs table
CREATE TABLE IF NOT EXISTS gangs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  leader text DEFAULT '',
  member_count integer NOT NULL DEFAULT 0,
  sector_id uuid REFERENCES sectors(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'active',
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE gangs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_gangs" ON gangs;
CREATE POLICY "anon_select_gangs" ON gangs FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_gangs" ON gangs;
CREATE POLICY "anon_insert_gangs" ON gangs FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_gangs" ON gangs;
CREATE POLICY "anon_update_gangs" ON gangs FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_gangs" ON gangs;
CREATE POLICY "anon_delete_gangs" ON gangs FOR DELETE
  TO anon, authenticated USING (true);

-- Rules table
CREATE TABLE IF NOT EXISTS rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text DEFAULT 'general',
  content text NOT NULL,
  penalty text DEFAULT '',
  severity text NOT NULL DEFAULT 'medium',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_rules" ON rules;
CREATE POLICY "anon_select_rules" ON rules FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_rules" ON rules;
CREATE POLICY "anon_insert_rules" ON rules FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_rules" ON rules;
CREATE POLICY "anon_update_rules" ON rules FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_rules" ON rules;
CREATE POLICY "anon_delete_rules" ON rules FOR DELETE
  TO anon, authenticated USING (true);

-- Administration table
CREATE TABLE IF NOT EXISTS administration (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL DEFAULT 'helper',
  discord_id text DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  permissions text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE administration ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_administration" ON administration;
CREATE POLICY "anon_select_administration" ON administration FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_administration" ON administration;
CREATE POLICY "anon_insert_administration" ON administration FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_administration" ON administration;
CREATE POLICY "anon_update_administration" ON administration FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_administration" ON administration;
CREATE POLICY "anon_delete_administration" ON administration FOR DELETE
  TO anon, authenticated USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_gangs_sector_id ON gangs(sector_id);
CREATE INDEX IF NOT EXISTS idx_rules_category ON rules(category);
CREATE INDEX IF NOT EXISTS idx_administration_role ON administration(role);
