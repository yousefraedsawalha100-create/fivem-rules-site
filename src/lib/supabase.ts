import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Settings = {
  id: number;
  server_name: string;
  server_description: string;
  server_ip: string;
  discord_url: string;
  logo_url: string;
  admin_password: string;
};

export type Category = {
  id: string;
  name: string;
  icon: string;
  sort_order: number;
  created_at: string;
};

export type Rule = {
  id: string;
  title: string;
  content: string;
  category_id: string;
  sort_order: number;
  created_at: string;
};

export type Sector = {
  id: string;
  name: string;
  icon: string;
  sort_order: number;
  created_at: string;
};

export type SectorMember = {
  id: string;
  name: string;
  rank_name: string;
  sector_id: string;
  sort_order: number;
  created_at: string;
};

export type Gang = {
  id: string;
  name: string;
  icon: string;
  sort_order: number;
  created_at: string;
};

export type GangMember = {
  id: string;
  name: string;
  rank_name: string;
  gang_id: string;
  sort_order: number;
  created_at: string;
};

export type ManagementMember = {
  id: string;
  name: string;
  rank_name: string;
  sort_order: number;
  created_at: string;
};

export type Rank = {
  id: string;
  name: string;
  color: string;
  permissions: Record<string, boolean>;
  is_default: boolean;
  sort_order: number;
  created_at: string;
};


export type MainTab = {
  id: string;
  name: string;
  content_type: 'rules' | 'sectors' | 'gangs' | 'management' | 'books' | 'custom';
  icon: string;
  sort_order: number;
  is_visible: boolean;
  is_protected: boolean;
  created_at: string;
};

export type Book = {
  id: string;
  title: string;
  description: string;
  cover_image_url: string;
  icon: string;
  is_visible: boolean;
  sort_order: number;
  created_at: string;
};

export type BookPage = {
  id: string;
  book_id: string;
  title: string;
  content: string;
  image_url: string;
  page_number: number;
  sort_order: number;
  created_at: string;
};

export type ConstitutionChapter = {
  id: string;
  book_id: string;
  title: string;
  description: string;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
};

export type ConstitutionArticle = {
  id: string;
  book_id: string;
  chapter_id: string;
  article_number: number;
  title: string;
  content: string;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
};

export type ContentBlock = {
  id: string;
  parent_type: 'sector' | 'gang' | 'management' | 'custom';
  parent_id: string | null;
  title: string;
  body: string;
  media_type: 'none' | 'image' | 'video';
  media_url: string;
  sort_order: number;
  created_at: string;
};
