create extension if not exists pgcrypto;

create table if not exists constitution_chapters (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references books(id) on delete cascade,
  title text not null,
  description text default '',
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists constitution_articles (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references books(id) on delete cascade,
  chapter_id uuid not null references constitution_chapters(id) on delete cascade,
  article_number integer not null default 1,
  title text not null,
  content text not null default '',
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists constitution_chapters_book_id_sort_order_idx on constitution_chapters(book_id, sort_order);
create index if not exists constitution_articles_book_id_chapter_id_sort_order_idx on constitution_articles(book_id, chapter_id, sort_order);

alter table constitution_chapters enable row level security;
alter table constitution_articles enable row level security;

drop policy if exists constitution_chapters_select_all on constitution_chapters;
drop policy if exists constitution_chapters_modify_all on constitution_chapters;
drop policy if exists constitution_articles_select_all on constitution_articles;
drop policy if exists constitution_articles_modify_all on constitution_articles;

create policy constitution_chapters_select_all on constitution_chapters for select using (true);
create policy constitution_chapters_modify_all on constitution_chapters for all using (true) with check (true);
create policy constitution_articles_select_all on constitution_articles for select using (true);
create policy constitution_articles_modify_all on constitution_articles for all using (true) with check (true);

insert into constitution_chapters (book_id, title, description, sort_order, is_visible)
select b.id, 'الديباجة', 'مقدمة دستورية عامة عن المدينة', 1, true
from books b
where b.title ilike '%دستور%'
  and not exists (
    select 1 from constitution_chapters cc where cc.book_id = b.id and cc.title = 'الديباجة'
  );

insert into constitution_chapters (book_id, title, description, sort_order, is_visible)
select b.id, 'الأحكام العامة', 'الأحكام الأساسية للمدينة', 2, true
from books b
where b.title ilike '%دستور%'
  and not exists (
    select 1 from constitution_chapters cc where cc.book_id = b.id and cc.title = 'الأحكام العامة'
  );

insert into constitution_articles (book_id, chapter_id, article_number, title, content, sort_order, is_visible)
select b.id, cc.id, 1, 'المبادئ الأساسية', 'تُسنّ القوانين بما يضمن النظام والاستقرار في المدينة.', 1, true
from books b
join constitution_chapters cc on cc.book_id = b.id and cc.title = 'الديباجة'
where b.title ilike '%دستور%'
  and not exists (
    select 1 from constitution_articles ca where ca.chapter_id = cc.id and ca.article_number = 1
  );

insert into constitution_articles (book_id, chapter_id, article_number, title, content, sort_order, is_visible)
select b.id, cc.id, 2, 'السلطة التنفيذية', 'تُدار المدينة وفق قواعد واضحة ومعلنة.', 2, true
from books b
join constitution_chapters cc on cc.book_id = b.id and cc.title = 'الأحكام العامة'
where b.title ilike '%دستور%'
  and not exists (
    select 1 from constitution_articles ca where ca.chapter_id = cc.id and ca.article_number = 2
  );
