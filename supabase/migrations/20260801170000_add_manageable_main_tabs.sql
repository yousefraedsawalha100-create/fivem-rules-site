/*
  Manageable public navigation tabs.
  Existing content remains unchanged.
*/

CREATE TABLE IF NOT EXISTS main_tabs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  content_type text NOT NULL DEFAULT 'custom'
    CHECK (content_type IN ('rules', 'sectors', 'gangs', 'management', 'custom')),
  icon text NOT NULL DEFAULT 'FileText',
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  is_protected boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS main_tabs_builtin_unique
ON main_tabs(content_type)
WHERE content_type <> 'custom';

CREATE INDEX IF NOT EXISTS main_tabs_sort_order_idx
ON main_tabs(sort_order);

ALTER TABLE main_tabs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all_main_tabs" ON main_tabs;
CREATE POLICY "anon_all_main_tabs"
ON main_tabs FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

INSERT INTO main_tabs (name, content_type, icon, sort_order, is_visible, is_protected)
VALUES
  ('القوانين', 'rules', 'FileText', 1, true, true),
  ('القطاعات', 'sectors', 'Building2', 2, true, false),
  ('العصابات', 'gangs', 'Swords', 3, true, false),
  ('الإدارة', 'management', 'Crown', 4, true, false)
ON CONFLICT DO NOTHING;
