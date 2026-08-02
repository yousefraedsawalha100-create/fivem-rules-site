/*
  Books and constitution pages for the public book viewer and admin panel.
  Safe to run multiple times.
*/

CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  cover_image_url text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT 'BookOpen',
  is_visible boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS book_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  page_number integer NOT NULL DEFAULT 1,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_pages ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_schema = 'public'
      AND table_name = 'main_tabs'
      AND constraint_name = 'main_tabs_content_type_check'
  ) THEN
    ALTER TABLE main_tabs DROP CONSTRAINT main_tabs_content_type_check;
  END IF;
END $$;

ALTER TABLE main_tabs
  ADD CONSTRAINT main_tabs_content_type_check
  CHECK (content_type IN ('rules', 'sectors', 'gangs', 'management', 'books', 'custom'));

DROP POLICY IF EXISTS "anon_all_books" ON books;
CREATE POLICY "anon_all_books"
ON books FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "anon_all_book_pages" ON book_pages;
CREATE POLICY "anon_all_book_pages"
ON book_pages FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_books_sort_order ON books(sort_order);
CREATE INDEX IF NOT EXISTS idx_book_pages_book_id ON book_pages(book_id);
CREATE INDEX IF NOT EXISTS idx_book_pages_sort_order ON book_pages(sort_order);

INSERT INTO books (title, description, cover_image_url, icon, is_visible, sort_order)
SELECT
  'دستور مدينة ساندي',
  'دستور المدينة الرسمي الذي يوضح المبادئ العامة، الحقوق والواجبات، والهيكل الإداري والقضائي.',
  '',
  'BookOpen',
  true,
  0
WHERE NOT EXISTS (
  SELECT 1 FROM books WHERE title = 'دستور مدينة ساندي'
);

INSERT INTO main_tabs (name, content_type, icon, sort_order, is_visible, is_protected)
SELECT 'الكتب والدستور', 'books', 'BookOpen', 5, true, false
WHERE NOT EXISTS (
  SELECT 1 FROM main_tabs WHERE content_type = 'books'
);

DO $$
DECLARE
  v_book_id uuid;
BEGIN
  SELECT id INTO v_book_id FROM books WHERE title = 'دستور مدينة ساندي' LIMIT 1;

  IF v_book_id IS NOT NULL THEN
    INSERT INTO book_pages (book_id, title, content, image_url, page_number, sort_order)
    VALUES
      (v_book_id, 'الغلاف', 'دستور مدينة ساندي\n\nنسخة عربية حديثة منظمة ومبسطة للقراءة والتوثيق.', '', 1, 0),
      (v_book_id, 'المقدمة', 'هذا الدستور هو مرجع المدينة ومجموعة القواعد التي تُنظم الحياة العامة وتؤكد على الانضباط والعدالة.', '', 2, 1),
      (v_book_id, 'المبادئ العامة', 'تُبنى المدينة على النظام، الاحترام، والتعاون بين جميع أفراد المجتمع.', '', 3, 2),
      (v_book_id, 'حقوق المواطنين', 'لكل مواطن الحق في التمتع بالأمان، والحرية ضمن الحدود القانونية، والاحترام في المجتمع.', '', 4, 3),
      (v_book_id, 'واجبات المواطنين', 'على كل مواطن الالتزام بالقوانين، والاحترام المتبادل، ومساعدة المجتمع في الحفاظ على النظام.', '', 5, 4),
      (v_book_id, 'السلطة القضائية', 'تختص السلطة القضائية بحل النزاعات وتطبيق العدالة وفق القوانين واللوائح.', '', 6, 5),
      (v_book_id, 'الشرطة', 'تعمل الشرطة على حفظ النظام، حماية المواطنين، ومتابعة المخالفات وفق الدستور.', '', 7, 6),
      (v_book_id, 'الحكومة', 'تعمل الحكومة على إدارة الشؤون العامة وتنسيق الخدمات والقرارات الإدارية.', '', 8, 7),
      (v_book_id, 'العصابات', 'يمنع أي نشاط غير قانوني أو تهديدي يهدف إلى زعزعة الاستقرار العام.', '', 9, 8),
      (v_book_id, 'العقوبات', 'تُطبق العقوبات على المخالفات وفق شدة الضرر الناتج عن السلوك غير المشروع.', '', 10, 9),
      (v_book_id, 'الأحكام العامة', 'يُطبق هذا الدستور على جميع الأفراد دون استثناء، ويُعمل به في كل ما يخص النظام العام.', '', 11, 10)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
