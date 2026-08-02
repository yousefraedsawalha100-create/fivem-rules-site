import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Gamepad2,
  Shield,
  Users,
  Building2,
  Swords,
  Crown,
  Car,
  Truck,
  FileText,
  AlertTriangle,
  BookOpen,
  Scale,
  Crosshair,
  Plus,
  Save,
  Check,
  X,
  ChevronUp,
  ChevronDown,
  Pencil,
  Trash2,
  Settings as SettingsIcon,
  Monitor,
  MessageCircle,
  ArrowLeft,
  ImageIcon,
  Video,
  LayoutPanelTop,
} from 'lucide-react';
import {
  supabase,
  type Settings,
  type Category,
  type Rule,
  type Sector,
  type SectorMember,
  type Gang,
  type GangMember,
  type ManagementMember,
  type Rank,
  type ContentBlock,
  type MainTab,
  type Book,
  type BookPage,
  type ConstitutionArticle,
  type ConstitutionChapter,
} from '@/lib/supabase';

const ICON_MAP: Record<string, typeof Shield> = {
  Scale,
  Car,
  Crosshair,
  Truck,
  FileText,
  Shield,
  Users,
  AlertTriangle,
  BookOpen,
  Gamepad2,
  Building2,
  Swords,
  Crown,
};

const PERMISSION_LABELS: Record<string, string> = {
  manage_ranks: 'إدارة الرتب',
  manage_rules: 'إدارة القوائم والقوانين',
  manage_settings: 'إدارة الإعدادات',
};

const RANK_COLORS = ['#6b7280', '#f59e0b', '#f97316', '#ef4444', '#3b82f6', '#8b5cf6', '#10b981', '#ec4899'];

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name] || FileText;
  return <Icon className={className} />;
}

// ============ MODAL ============
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#13131a] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ============ FORM FIELD ============
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>
      {hint && <p className="text-xs text-gray-500 mb-2">{hint}</p>}
      {children}
    </div>
  );
}


type MediaKind = 'image' | 'video';

function extractStoragePath(publicUrl: string) {
  const marker = '/storage/v1/object/public/site-media/';
  const index = publicUrl.indexOf(marker);
  return index >= 0 ? decodeURIComponent(publicUrl.slice(index + marker.length)) : null;
}

function MediaUploader({
  value,
  onChange,
  kind,
  label,
}: {
  value: string;
  onChange: (url: string) => void;
  kind: MediaKind;
  label?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const accept = kind === 'image' ? 'image/jpeg,image/png,image/webp,image/gif' : 'video/mp4,video/webm';
  const maxSize = kind === 'image' ? 10 * 1024 * 1024 : 100 * 1024 * 1024;

  async function upload(file: File) {
    setError('');
    if (!file.type.startsWith(`${kind}/`)) {
      setError(kind === 'image' ? 'اختر ملف صورة صالحًا.' : 'اختر ملف فيديو صالحًا.');
      return;
    }
    if (file.size > maxSize) {
      setError(kind === 'image' ? 'حجم الصورة يجب ألا يتجاوز 10MB.' : 'حجم الفيديو يجب ألا يتجاوز 100MB.');
      return;
    }

    setUploading(true);
    const extension = file.name.split('.').pop()?.toLowerCase() || (kind === 'image' ? 'jpg' : 'mp4');
    const safeName = `${crypto.randomUUID()}.${extension}`;
    const path = `${kind === 'image' ? 'images' : 'videos'}/${new Date().getFullYear()}/${safeName}`;
    const { error: uploadError } = await supabase.storage.from('site-media').upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

    if (uploadError) {
      setError(`تعذر رفع الملف: ${uploadError.message}`);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from('site-media').getPublicUrl(path);
    onChange(data.publicUrl);
    setUploading(false);
  }

  async function remove() {
    const path = extractStoragePath(value);
    if (path) await supabase.storage.from('site-media').remove([path]);
    onChange('');
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) upload(file);
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-full rounded-xl border border-dashed border-amber-500/35 bg-amber-500/5 px-4 py-4 text-sm text-amber-300 transition-all hover:bg-amber-500/10 disabled:cursor-wait disabled:opacity-60"
      >
        {uploading ? 'جاري رفع الملف...' : label || (kind === 'image' ? 'اختيار صورة من الجهاز' : 'اختيار فيديو من الجهاز')}
      </button>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {value && (
        <div className="overflow-hidden rounded-xl border border-white/10 bg-black/20 p-2">
          {kind === 'image' ? (
            <img src={value} alt="معاينة الملف" className="max-h-52 w-full rounded-lg object-contain" />
          ) : (
            <video src={value} controls className="max-h-64 w-full rounded-lg" />
          )}
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={() => inputRef.current?.click()} className="flex-1 rounded-lg bg-white/5 px-3 py-2 text-xs text-gray-300 hover:bg-white/10">استبدال الملف</button>
            <button type="button" onClick={remove} className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400 hover:bg-red-500/20">حذف الملف</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ MAIN APP ============
export default function App() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('settings').select('*').eq('id', 1).maybeSingle();
      if (data) setSettings(data as Settings);
      setLoading(false);
    })();
  }, []);

  function handleLogin() {
    if (settings && password === settings.admin_password) {
      setAuthed(true);
      setShowLogin(false);
      setLoginError('');
      setPassword('');
    } else {
      setLoginError('كلمة المرور غير صحيحة');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100" dir="rtl">
      <div className="fixed top-4 left-4 z-50">
        {showDashboard && authed ? (
          <button
            onClick={() => { setShowDashboard(false); setAuthed(false); }}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white transition-all backdrop-blur-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>العودة للموقع</span>
          </button>
        ) : (
          <button
            onClick={() => setShowLogin(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white transition-all backdrop-blur-md"
          >
            <SettingsIcon className="w-4 h-4" />
            <span>لوحة التحكم</span>
          </button>
        )}
      </div>

      {showDashboard && authed ? (
        <Dashboard settings={settings!} onUpdateSettings={setSettings} />
      ) : (
        <PublicPage settings={settings!} />
      )}

      {showLogin && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setShowLogin(false)}
        >
          <div
            className="bg-[#13131a] border border-white/10 rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <SettingsIcon className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">دخول لوحة التحكم</h2>
                <p className="text-sm text-gray-400">أدخل كلمة المرور للوصول</p>
              </div>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="كلمة المرور"
              className="w-full px-4 py-3 bg-[#0a0a0f] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 transition-colors mb-3"
              autoFocus
            />
            {loginError && <p className="text-red-400 text-sm mb-3">{loginError}</p>}
            <div className="flex gap-3">
              <button
                onClick={handleLogin}
                className="flex-1 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors"
              >
                دخول
              </button>
              <button
                onClick={() => setShowLogin(false)}
                className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {authed && !showDashboard && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setShowDashboard(true)}
        >
          <div className="bg-[#13131a] border border-white/10 rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-2">تم تسجيل الدخول</h2>
            <p className="text-gray-400 mb-6">هل تريد الدخول إلى لوحة التحكم؟</p>
            <button
              onClick={() => setShowDashboard(true)}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors"
            >
              دخول لوحة التحكم
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ PUBLIC PAGE ============
function PublicPage({ settings }: { settings: Settings }) {
  const [activeTab, setActiveTab] = useState<string>('rules');
  const [mainTabs, setMainTabs] = useState<MainTab[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [sectorMembers, setSectorMembers] = useState<SectorMember[]>([]);
  const [gangs, setGangs] = useState<Gang[]>([]);
  const [gangMembers, setGangMembers] = useState<GangMember[]>([]);
  const [management, setManagement] = useState<ManagementMember[]>([]);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [hoveredRule, setHoveredRule] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const [tabsResult, cats, rls, secs, secMems, gngs, gngMems, mgmt, blocks, bookResult] = await Promise.all([
      supabase.from('main_tabs').select('*').eq('is_visible', true).order('sort_order', { ascending: true }),
      supabase.from('categories').select('*').order('sort_order', { ascending: true }),
      supabase.from('rules').select('*').order('sort_order', { ascending: true }),
      supabase.from('sectors').select('*').order('sort_order', { ascending: true }),
      supabase.from('sector_members').select('*').order('sort_order', { ascending: true }),
      supabase.from('gangs').select('*').order('sort_order', { ascending: true }),
      supabase.from('gang_members').select('*').order('sort_order', { ascending: true }),
      supabase.from('management').select('*').order('sort_order', { ascending: true }),
      supabase.from('content_blocks').select('*').order('sort_order', { ascending: true }),
      supabase.from('books').select('*').eq('is_visible', true).order('sort_order', { ascending: true }),
    ]);
    const loadedTabs = (tabsResult.data || []) as MainTab[];
    setMainTabs(loadedTabs);
    setCategories(cats.data || []);
    setRules(rls.data || []);
    setSectors(secs.data || []);
    setSectorMembers(secMems.data || []);
    setGangs(gngs.data || []);
    setGangMembers(gngMems.data || []);
    setManagement(mgmt.data || []);
    setContentBlocks(blocks.data || []);
    setBooks((bookResult.data || []) as Book[]);
    if (loadedTabs.length > 0) {
      setActiveTab((current) => loadedTabs.some((tab) => tab.id === current || tab.content_type === current)
        ? current
        : (loadedTabs[0].content_type === 'custom' ? loadedTabs[0].id : loadedTabs[0].content_type));
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const tabs = mainTabs;

  return (
    <>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }} />
      </div>

      <header className="relative pt-24 pb-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full group-hover:bg-amber-500/30 transition-all duration-500" />
              {settings.logo_url ? (
                <img src={settings.logo_url} alt="Logo" className="relative w-32 h-32 rounded-2xl object-cover border border-white/10 shadow-2xl" />
              ) : (
                <div className="relative w-32 h-32 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-700/10 border border-amber-500/20 flex items-center justify-center">
                  <Gamepad2 className="w-16 h-16 text-amber-500" />
                </div>
              )}
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">{settings.server_name}</h1>
          <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">{settings.server_description}</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-2xl mx-auto mb-6">
            <div className="group relative w-full sm:w-auto flex-1 bg-white/[0.03] border border-white/10 rounded-xl p-5 hover:border-amber-500/30 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <Monitor className="w-6 h-6 text-amber-500" />
                </div>
                <div className="text-right flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-1">آيبي السيرفر</p>
                  <p className="text-white font-mono text-sm truncate" dir="ltr">{settings.server_ip}</p>
                </div>
              </div>
            </div>
            <a
              href={settings.discord_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative w-full sm:w-auto flex-1 bg-white/[0.03] border border-white/10 rounded-xl p-5 hover:border-blue-500/30 transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-6 h-6 text-blue-500" />
                </div>
                <div className="text-right flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-1">انضم لنا</p>
                  <p className="text-white text-sm">سيرفر الديسكورد</p>
                </div>
              </div>
            </a>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full">
              <Building2 className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-300">{sectors.length} قطاع شغال</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full">
              <Swords className="w-4 h-4 text-red-400" />
              <span className="text-sm text-red-300">{gangs.length} عصابة شغالة</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full">
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-amber-300">{management.length} عضو إدارة</span>
            </div>
          </div>
        </div>
      </header>

      <div className="relative px-6 mb-8">
        <div className="max-w-6xl mx-auto flex flex-wrap gap-2 p-1.5 bg-white/[0.03] border border-white/10 rounded-xl w-fit mx-auto">
          {tabs.map((tab) => {
            const tabId = tab.content_type === 'custom' ? tab.id : tab.content_type;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tabId)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tabId ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <DynamicIcon name={tab.icon} className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <section className="relative px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'rules' && (
            <RulesDisplay
              categories={categories}
              rules={rules}
              hoveredRule={hoveredRule}
              setHoveredRule={setHoveredRule}
            />
          )}
          {activeTab === 'sectors' && (
            <>
              <GroupsDisplay groups={sectors} members={sectorMembers} getMemberParent={(m) => m.sector_id} emptyIcon={Building2} emptyText="لا توجد قطاعات بعد" color="blue" />
              <ContentBlocksDisplay blocks={contentBlocks.filter((b) => b.parent_type === 'sector')} />
            </>
          )}
          {activeTab === 'gangs' && (
            <>
              <GroupsDisplay groups={gangs} members={gangMembers} getMemberParent={(m) => m.gang_id} emptyIcon={Swords} emptyText="لا توجد عصابات بعد" color="red" />
              <ContentBlocksDisplay blocks={contentBlocks.filter((b) => b.parent_type === 'gang')} />
            </>
          )}
          {activeTab === 'management' && (
            <>
              <ManagementDisplay management={management} />
              <ContentBlocksDisplay blocks={contentBlocks.filter((b) => b.parent_type === 'management')} />
            </>
          )}
          {activeTab === 'books' && <BooksPublicView books={books} />}
          {mainTabs.some((tab) => tab.content_type === 'custom' && tab.id === activeTab) && (
            <ContentBlocksDisplay blocks={contentBlocks.filter((b) => b.parent_type === 'custom' && b.parent_id === activeTab)} />
          )}
        </div>
      </section>

      <footer className="relative border-t border-white/5 py-8 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-500 text-sm">
            {settings.server_name} © {new Date().getFullYear()} — جميع الحقوق محفوظة
          </p>
        </div>
      </footer>
    </>
  );
}

// ============ BOOKS PUBLIC VIEW ==========
function BooksPublicView({ books }: { books: Book[] }) {
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [pages, setPages] = useState<BookPage[]>([]);
  const [chapters, setChapters] = useState<ConstitutionChapter[]>([]);
  const [articles, setArticles] = useState<ConstitutionArticle[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!books.length) {
      setSelectedBookId(null);
      setPages([]);
      return;
    }
    if (!selectedBookId || !books.some((book) => book.id === selectedBookId)) {
      setSelectedBookId(books[0].id);
    }
  }, [books, selectedBookId]);

  useEffect(() => {
    if (!selectedBookId) return;
    let active = true;
    (async () => {
      setLoading(true);
      const [{ data: pageData, error: pageError }, { data: chapterData, error: chapterError }, { data: articleData, error: articleError }] = await Promise.all([
        supabase.from('book_pages').select('*').eq('book_id', selectedBookId).order('sort_order', { ascending: true }),
        supabase.from('constitution_chapters').select('*').eq('book_id', selectedBookId).eq('is_visible', true).order('sort_order', { ascending: true }),
        supabase.from('constitution_articles').select('*').eq('book_id', selectedBookId).eq('is_visible', true).order('sort_order', { ascending: true }),
      ]);
      if (active && !pageError) setPages((pageData || []) as BookPage[]);
      if (active && !chapterError) setChapters((chapterData || []) as ConstitutionChapter[]);
      if (active && !articleError) setArticles((articleData || []) as ConstitutionArticle[]);
      if (active) setLoading(false);
    })();
    return () => { active = false; };
  }, [selectedBookId]);

  const selectedBook = books.find((book) => book.id === selectedBookId) || null;

  if (!books.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-white/[0.02] border border-white/10 rounded-2xl">
        <BookOpen className="w-12 h-12 mb-3 opacity-30" />
        <p>لا توجد كتب متاحة بعد</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-3">
          {books.map((book) => (
            <button
              key={book.id}
              onClick={() => setSelectedBookId(book.id)}
              className={`w-full text-right rounded-2xl border p-4 transition-all ${selectedBookId === book.id ? 'bg-amber-500/10 border-amber-500/30 text-white' : 'bg-white/[0.02] border-white/10 text-gray-400 hover:border-white/20 hover:text-white'}`}
            >
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <DynamicIcon name={book.icon || 'BookOpen'} className="w-5 h-5 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-sm">{book.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{book.description || 'كتاب دستوري متكامل'}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-2">
          {selectedBook ? <BookReader book={selectedBook} pages={pages} chapters={chapters} articles={articles} loading={loading} /> : null}
        </div>
      </div>
    </div>
  );
}

function BookReader({ book, pages, chapters, articles, loading }: { book: Book; pages: BookPage[]; chapters: ConstitutionChapter[]; articles: ConstitutionArticle[]; loading: boolean }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev' | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [turnTargetIndex, setTurnTargetIndex] = useState<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setCurrentPage(0);
    setIsAnimating(false);
    setFlipDirection(null);
    setTurnTargetIndex(null);
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [book.id]);

  useEffect(() => () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
  }, []);

  const constitutionPages = chapters.flatMap((chapter) => {
    const chapterArticles = articles
      .filter((article) => article.chapter_id === chapter.id)
      .sort((a, b) => a.sort_order - b.sort_order);
    if (!chapterArticles.length) return [];

    const chunks: ConstitutionArticle[][] = [];
    let currentChunk: ConstitutionArticle[] = [];
    let currentLength = 0;

    chapterArticles.forEach((article) => {
      const articleLength = `${article.title} ${article.content}`.length;
      const shouldStartNewPage = currentChunk.length >= 4 || (currentChunk.length >= 2 && currentLength + articleLength > 1250);
      if (shouldStartNewPage) {
        chunks.push(currentChunk);
        currentChunk = [];
        currentLength = 0;
      }
      currentChunk.push(article);
      currentLength += articleLength;
    });
    if (currentChunk.length) chunks.push(currentChunk);

    return chunks.map((chunk, chunkIndex) => ({
      id: `chapter-${chapter.id}-${chunkIndex}`,
      title: chunkIndex === 0 ? chapter.title : `${chapter.title} — تابع`,
      content: `${chunkIndex === 0 && chapter.description ? `${chapter.description}\n\n` : ''}${chunk
        .map((article) => `المادة (${article.article_number}): ${article.title}\n${article.content}`)
        .join('\n\n')}`,
      image_url: '',
      page_number: 0,
      sort_order: chapter.sort_order * 100 + chunkIndex,
      created_at: chapter.created_at,
      book_id: book.id,
    } as BookPage));
  });

  const displayPages = [{ id: 'cover', title: book.title, content: book.description, image_url: book.cover_image_url, page_number: 0, sort_order: -1, created_at: book.created_at, book_id: book.id } as BookPage, ...pages, ...constitutionPages];

  const goToPage = (targetIndex: number, direction: 'next' | 'prev') => {
    if (targetIndex < 0 || targetIndex >= displayPages.length || isAnimating || targetIndex === currentPage) return;
    setFlipDirection(direction);
    setTurnTargetIndex(targetIndex);
    setIsAnimating(true);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      setCurrentPage(targetIndex);
      setIsAnimating(false);
      setFlipDirection(null);
      setTurnTargetIndex(null);
      timeoutRef.current = null;
    }, 780);
  };

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        goToPage(currentPage + 1, 'next');
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goToPage(currentPage - 1, 'prev');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentPage, isAnimating, displayPages.length]);

  const currentPageData = displayPages[currentPage] || displayPages[0];
  const isCover = currentPage === 0;
  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage >= displayPages.length - 1;
  const totalPages = displayPages.length;
  const leftPageData = currentPage === 0 ? displayPages[0] : displayPages[currentPage - 1];
  const rightPageData = currentPage === 0 ? null : displayPages[currentPage];
  const animatedFrontPage = isAnimating && flipDirection === 'next'
    ? displayPages[currentPage]
    : isAnimating && flipDirection === 'prev'
      ? displayPages[currentPage - 1]
      : null;
  const animatedBackPage = isAnimating && turnTargetIndex !== null
    ? (flipDirection === 'next'
        ? displayPages[Math.min(displayPages.length - 1, turnTargetIndex)]
        : displayPages[Math.max(0, turnTargetIndex - 1)])
    : null;

  const getFlipClass = (side: 'left' | 'right') => {
    if (!isAnimating) return '';
    if (side === 'left') {
      return flipDirection === 'prev' ? 'page-turn-left' : '';
    }
    return flipDirection === 'next' ? 'page-turn-right' : '';
  };

  const renderPageContent = (page: BookPage | null, side: 'left' | 'right') => {
    const isRight = side === 'right';
    if (!page) {
      return (
        <div className="flex h-full min-h-[480px] items-center justify-center px-5 py-8 text-center text-[#8a6a43]">
          <div className="rounded-2xl border border-dashed border-[#9b7454]/25 bg-[#a06f3f]/10 px-6 py-10">
            صفحة فارغة
          </div>
        </div>
      );
    }
    if (page.id === 'cover') {
      return (
        <div className="flex h-full min-h-[480px] flex-col items-center justify-center text-center px-5 py-8">
          <div className="mb-6 flex items-center justify-center gap-3 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-amber-400">
            <Scale className="h-4 w-4" />
            <span className="text-sm font-semibold">النسخة الرسمية</span>
            <Crown className="h-4 w-4" />
          </div>
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-amber-500/20 bg-[#2f2418]/70 shadow-[0_0_40px_rgba(245,158,11,0.15)]">
            <BookOpen className="h-10 w-10 text-amber-400" />
          </div>
          <h4 className="mb-3 text-3xl font-bold text-[#3c2710]">دستور مدينة ساندي</h4>
          <p className="mb-6 max-w-lg text-lg leading-loose text-[#5c4331]">نسخة قانونية مهيبة تجمع بين التوثيق والوضوح في طابع من الورق العتيق.</p>
          <div className="grid w-full max-w-md gap-3 text-sm text-[#5c4331] sm:grid-cols-2">
            <div className="rounded-2xl border border-[#9b7454]/25 bg-[#7f5b3b]/10 p-3">التاريخ:<br />2 أغسطس 2026</div>
            <div className="rounded-2xl border border-[#9b7454]/25 bg-[#7f5b3b]/10 p-3">الوقت:<br />12:35 ليلاً</div>
          </div>
          <button
            onClick={() => goToPage(1, 'next')}
            className="mt-6 rounded-full bg-[#7a4d18] px-6 py-3 font-semibold text-[#fff6e8] shadow-lg shadow-[#7a4d18]/20 transition-all hover:-translate-y-0.5 hover:bg-[#956127]"
          >
            ابدأ القراءة
          </button>
        </div>
      );
    }

    return (
      <div className="flex h-full min-h-[480px] flex-col px-5 py-8 text-right">
        <div className="mb-4 flex items-center justify-between border-b border-[#9b7454]/25 pb-3 text-[11px] uppercase tracking-[0.25em] text-[#7a5b3b]">
          <span>{isRight ? 'الصفحة اليمنى' : 'الصفحة اليسرى'}</span>
          <span>{page.title || 'صفحة'}</span>
        </div>
        {page.image_url ? (
          <img src={page.image_url} alt={page.title} className="mb-5 h-auto max-h-[220px] w-full rounded-2xl border border-[#9b7454]/25 object-cover" />
        ) : null}
        {page.content ? (
          <div className="whitespace-pre-wrap text-[15px] leading-loose text-[#4d3420]">{page.content}</div>
        ) : (
          <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-[#9b7454]/25 bg-[#a06f3f]/10 text-[#7a5b3b]">
            هذه الصفحة لا تحتوي على محتوى بعد.
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="rounded-[2rem] border border-[#7a5b3b]/30 bg-[radial-gradient(circle_at_top,_rgba(255,236,209,0.95),_rgba(216,173,113,0.92))] p-3 shadow-[0_30px_80px_rgba(0,0,0,0.35)] md:p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-full border border-[#9b7454]/20 bg-[#2f2418]/80 px-4 py-2 text-sm text-[#f8ebd7] backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Scale className="h-4 w-4 text-amber-400" />
          <span className="font-semibold">{book.title}</span>
        </div>
        <div className="text-sm text-[#f2d8b0]">
          صفحة {isCover ? 1 : currentPage} من {totalPages}
        </div>
      </div>

      <div
        className="relative overflow-hidden rounded-[1.75rem] border border-[#8f6b3f]/25 bg-[linear-gradient(135deg,_rgba(240,221,181,0.95),_rgba(202,157,99,0.95))] p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06),_inset_0_0_80px_rgba(0,0,0,0.08)]"
        onTouchStart={(event) => setTouchStartX(event.touches[0]?.clientX ?? null)}
        onTouchEnd={(event) => {
          if (touchStartX === null) return;
          const delta = (event.changedTouches[0]?.clientX ?? 0) - touchStartX;
          if (delta > 50) {
            goToPage(currentPage - 1, 'prev');
          } else if (delta < -50) {
            goToPage(currentPage + 1, 'next');
          }
          setTouchStartX(null);
        }}
      >
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(90deg, rgba(95,57,24,0.16) 0, rgba(95,57,24,0.16) 1px, transparent 1px, transparent 100%), linear-gradient(rgba(255,255,255,0.2) 0, rgba(255,255,255,0.2) 1px, transparent 1px, transparent 100%)', backgroundSize: '100% 100%, 18px 18px' }} />
        <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.35), transparent 35%), radial-gradient(circle at 80% 30%, rgba(121,69,28,0.2), transparent 30%), radial-gradient(circle at 50% 100%, rgba(95,57,24,0.16), transparent 40%)' }} />

        <div className="relative z-10 hidden items-stretch justify-center gap-3 py-2 md:flex md:gap-4">
          <div className={`book-page book-page-left relative flex-1 overflow-hidden rounded-[1.2rem] border border-[#9b7454]/30 bg-[#f6ead7] shadow-[0_20px_45px_rgba(0,0,0,0.18)] md:min-h-[520px] ${getFlipClass('left')}`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.35),_transparent_40%),linear-gradient(120deg,_rgba(95,57,24,0.08),_transparent_35%)]" />
            <div className="absolute inset-0 opacity-[0.16]" style={{ backgroundImage: 'linear-gradient(90deg, rgba(95,57,24,0.25) 0, rgba(95,57,24,0.25) 1px, transparent 1px, transparent 100%), linear-gradient(rgba(255,255,255,0.4) 0, rgba(255,255,255,0.4) 1px, transparent 1px, transparent 100%)', backgroundSize: '100% 100%, 12px 12px' }} />
            <div className="relative z-10 h-full">{renderPageContent(leftPageData, 'left')}</div>
          </div>

          <div className={`book-page book-page-right relative flex-1 overflow-hidden rounded-[1.2rem] border border-[#9b7454]/30 bg-[#f6ead7] shadow-[0_20px_45px_rgba(0,0,0,0.18)] md:min-h-[520px] ${getFlipClass('right')}`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.35),_transparent_40%),linear-gradient(120deg,_rgba(95,57,24,0.08),_transparent_35%)]" />
            <div className="absolute inset-0 opacity-[0.16]" style={{ backgroundImage: 'linear-gradient(90deg, rgba(95,57,24,0.25) 0, rgba(95,57,24,0.25) 1px, transparent 1px, transparent 100%), linear-gradient(rgba(255,255,255,0.4) 0, rgba(255,255,255,0.4) 1px, transparent 1px, transparent 100%)', backgroundSize: '100% 100%, 12px 12px' }} />
            <div className="relative z-10 h-full">
              {isAnimating && flipDirection === 'next' ? (
                <>
                  <div className="page-face page-face-front absolute inset-0">{renderPageContent(animatedFrontPage, 'right')}</div>
                  <div className="page-face page-face-back absolute inset-0">{renderPageContent(animatedBackPage, 'right')}</div>
                </>
              ) : (
                renderPageContent(rightPageData, 'right')
              )}
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-stretch justify-center py-2 md:hidden">
          <div className={`book-page book-page-single relative w-full overflow-hidden rounded-[1.2rem] border border-[#9b7454]/30 bg-[#f6ead7] shadow-[0_20px_45px_rgba(0,0,0,0.18)] min-h-[520px] ${getFlipClass(currentPage === 0 ? 'left' : 'right')}`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.35),_transparent_40%),linear-gradient(120deg,_rgba(95,57,24,0.08),_transparent_35%)]" />
            <div className="absolute inset-0 opacity-[0.16]" style={{ backgroundImage: 'linear-gradient(90deg, rgba(95,57,24,0.25) 0, rgba(95,57,24,0.25) 1px, transparent 1px, transparent 100%), linear-gradient(rgba(255,255,255,0.4) 0, rgba(255,255,255,0.4) 1px, transparent 1px, transparent 100%)', backgroundSize: '100% 100%, 12px 12px' }} />
            <div className="relative z-10 h-full">
              {isAnimating && flipDirection === 'prev' ? (
                <>
                  <div className="page-face page-face-front absolute inset-0">{renderPageContent(animatedFrontPage, 'left')}</div>
                  <div className="page-face page-face-back absolute inset-0">{renderPageContent(animatedBackPage, 'left')}</div>
                </>
              ) : (
                renderPageContent(currentPage === 0 ? displayPages[0] : currentPageData, currentPage === 0 ? 'left' : 'right')
              )}
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-1/2 z-20 h-16 -translate-y-1/2 border-x border-[#8f6b3f]/20" />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-24 bg-gradient-to-b from-[#4f341f]/10 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-24 bg-gradient-to-t from-[#4f341f]/10 to-transparent" />
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button onClick={() => goToPage(currentPage - 1, 'prev')} disabled={isFirstPage || isAnimating} className="rounded-full border border-[#9b7454]/25 bg-[#2f2418]/80 px-4 py-2 text-sm text-[#f8ebd7] transition-all hover:border-amber-500/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-40">
            السابق
          </button>
          <button onClick={() => goToPage(currentPage + 1, 'next')} disabled={isLastPage || isAnimating} className="rounded-full border border-[#9b7454]/25 bg-[#2f2418]/80 px-4 py-2 text-sm text-[#f8ebd7] transition-all hover:border-amber-500/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-40">
            التالي
          </button>
        </div>
        <div className="text-sm text-[#f2d8b0]">صفحة {isCover ? 1 : currentPage} من {totalPages}</div>
      </div>

      <div className="mt-5 rounded-[1.25rem] border border-[#9b7454]/20 bg-[#2f2418]/60 p-4 text-[#f8ebd7]">
        <h5 className="mb-3 text-sm font-semibold text-[#f2d8b0]">فهرس المحتويات</h5>
        <div className="flex flex-wrap gap-2">
          {pages.map((page, index) => (
            <button
              key={page.id}
              onClick={() => goToPage(index + 1, index + 1 > currentPage ? 'next' : 'prev')}
              className="rounded-full border border-[#9b7454]/20 bg-[#f6ead7]/10 px-3 py-1.5 text-sm text-[#f6ead7] transition-all hover:border-amber-400/40 hover:bg-[#f6ead7]/20"
            >
              {page.title || `صفحة ${index + 1}`}
            </button>
          ))}
          {chapters.map((chapter, index) => (
            <button
              key={`chapter-${chapter.id}`}
              onClick={() => goToPage(pages.length + index + 1, pages.length + index + 1 > currentPage ? 'next' : 'prev')}
              className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-sm text-[#f6ead7] transition-all hover:border-amber-400/40 hover:bg-amber-500/20"
            >
              {chapter.title}
            </button>
          ))}
          {pages.length === 0 && chapters.length === 0 && (
            <p className="text-sm text-[#e3cdad]">لا توجد صفحات مضافة بعد</p>
          )}
        </div>
      </div>

      <style>{`
        .page-face {
          position: absolute;
          inset: 0;
          backface-visibility: hidden;
          overflow: hidden;
        }
        .page-face-front { transform: rotateY(0deg); }
        .page-face-back { transform: rotateY(180deg); }
        .book-page-single { transform-origin: center center; }
        .book-page::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(0,0,0,0.05) 0, transparent 12%, transparent 88%, rgba(0,0,0,0.05) 100%);
          pointer-events: none;
          z-index: 2;
        }
        .book-page::after {
          content: '';
          position: absolute;
          inset: 0;
          border-left: 2px solid rgba(95,57,24,.14);
          pointer-events: none;
          z-index: 3;
        }
        .book-page-left { transform-origin: right center; box-shadow: 18px 0 30px rgba(0,0,0,.16); }
        .book-page-right { transform-origin: left center; box-shadow: -18px 0 30px rgba(0,0,0,.16); }
        .page-turn-right { animation: pageTurnRight .78s cubic-bezier(.22,1,.36,1) both; }
        .page-turn-left { animation: pageTurnLeft .78s cubic-bezier(.22,1,.36,1) both; }
        @keyframes pageTurnLeft {
          0% { transform: rotateY(0deg); box-shadow: -18px 0 30px rgba(0,0,0,.16); }
          40% { transform: rotateY(-26deg); box-shadow: -8px 0 22px rgba(0,0,0,.14); }
          100% { transform: rotateY(-96deg); box-shadow: -2px 0 12px rgba(0,0,0,.1); }
        }
        @keyframes pageTurnRight {
          0% { transform: rotateY(0deg); box-shadow: 18px 0 30px rgba(0,0,0,.16); }
          40% { transform: rotateY(26deg); box-shadow: 8px 0 22px rgba(0,0,0,.14); }
          100% { transform: rotateY(96deg); box-shadow: 2px 0 12px rgba(0,0,0,.1); }
        }
      `}</style>
    </div>
  );
}

// ============ RULES DISPLAY (public) ============
function RulesDisplay({
  categories,
  rules,
  hoveredRule,
  setHoveredRule,
}: {
  categories: Category[];
  rules: Rule[];
  hoveredRule: string | null;
  setHoveredRule: (id: string | null) => void;
}) {
  const [activeCat, setActiveCat] = useState<string | null>(null);

  useEffect(() => {
    if (categories.length > 0 && !activeCat) setActiveCat(categories[0].id);
  }, [categories, activeCat]);

  const filteredRules = rules.filter((r) => r.category_id === activeCat);

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-white/[0.02] border border-white/10 rounded-2xl">
        <FileText className="w-12 h-12 mb-3 opacity-30" />
        <p>لا توجد قوانين بعد</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">الأقسام</h2>
        <div className="space-y-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCat(cat.id)}
              className={`w-full flex items-center gap-3 text-right px-4 py-3 rounded-xl border transition-all ${
                activeCat === cat.id
                  ? 'bg-amber-500/10 border-amber-500/30 text-white'
                  : 'bg-white/[0.02] border-white/10 text-gray-400 hover:text-white hover:border-white/20'
              }`}
            >
              <DynamicIcon name={cat.icon} className="w-4 h-4 shrink-0" />
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="lg:col-span-2">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          القوانين {filteredRules.length > 0 && `(${filteredRules.length})`}
        </h2>
        <div className="space-y-3">
          {filteredRules.map((rule, i) => (
            <div
              key={rule.id}
              onMouseEnter={() => setHoveredRule(rule.id)}
              onMouseLeave={() => setHoveredRule(null)}
              className="group relative w-full text-right flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 overflow-hidden"
              style={{
                animationDelay: `${i * 80}ms`,
                ...(hoveredRule === rule.id
                  ? { background: 'rgba(245, 158, 11, 0.08)', borderColor: 'rgba(245, 158, 11, 0.3)' }
                  : { background: 'rgba(255, 255, 255, 0.02)', borderColor: 'rgba(255, 255, 255, 0.06)' }),
              }}
            >
              <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 ${
                hoveredRule === rule.id ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-white/5 border border-white/10 group-hover:border-white/20'
              }`}>
                <FileText className={`w-5 h-5 transition-colors ${hoveredRule === rule.id ? 'text-amber-500' : 'text-gray-400 group-hover:text-white'}`} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white mb-1">{rule.title}</h4>
                {rule.content && <p className="text-gray-400 text-sm leading-relaxed">{rule.content}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ GROUPS DISPLAY (sectors/gangs public) ============
function GroupsDisplay<T extends { id: string; name: string; icon: string; sort_order: number }>({
  groups,
  members,
  getMemberParent,
  emptyIcon: EmptyIcon,
  emptyText,
  color,
}: {
  groups: T[];
  members: { id: string; name: string; rank_name: string; sort_order: number; sector_id?: string; gang_id?: string }[];
  getMemberParent: (m: { sector_id?: string; gang_id?: string }) => string | undefined;
  emptyIcon: typeof Shield;
  emptyText: string;
  color: 'blue' | 'red';
}) {
  const colorMap = {
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400' },
    red: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400' },
  };
  const c = colorMap[color];

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-white/[0.02] border border-white/10 rounded-2xl">
        <EmptyIcon className="w-12 h-12 mb-3 opacity-30" />
        <p>{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {groups.map((group, i) => {
        const groupMembers = members.filter((m) => getMemberParent(m) === group.id);
        return (
          <div
            key={group.id}
            className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all animate-[fadeIn_0.4s_ease-out]"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-center gap-3 mb-5 pb-5 border-b border-white/10">
              <div className={`w-12 h-12 rounded-xl ${c.bg} ${c.border} border flex items-center justify-center shrink-0`}>
                <DynamicIcon name={group.icon} className={`w-6 h-6 ${c.text}`} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">{group.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{groupMembers.length} عضو</p>
              </div>
            </div>
            {groupMembers.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-6">لا يوجد أعضاء</p>
            ) : (
              <div className="space-y-2">
                {groupMembers.map((member, j) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all animate-[slideIn_0.3s_ease-out]"
                    style={{ animationDelay: `${j * 40}ms` }}
                  >
                    <div className={`w-8 h-8 rounded-lg ${c.bg} ${c.border} border flex items-center justify-center shrink-0 text-xs font-bold ${c.text}`}>
                      {j + 1}
                    </div>
                    <div className="flex-1">
                      <span className="font-medium text-white text-sm">{member.name}</span>
                      {member.rank_name && <span className="text-xs text-gray-500 mr-2">— {member.rank_name}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============ MANAGEMENT DISPLAY (public) ============
function ManagementDisplay({ management }: { management: ManagementMember[] }) {
  if (management.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-white/[0.02] border border-white/10 rounded-2xl">
        <Crown className="w-12 h-12 mb-3 opacity-30" />
        <p>لا يوجد أعضاء إدارة بعد</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {management.map((member, i) => (
        <div
          key={member.id}
          className="group flex items-center gap-4 p-5 rounded-xl bg-white/[0.02] border border-white/10 hover:border-amber-500/20 transition-all animate-[slideIn_0.3s_ease-out]"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Crown className="w-6 h-6 text-amber-500" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-white">{member.name}</h4>
            {member.rank_name && <p className="text-sm text-amber-400 mt-0.5">{member.rank_name}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============ DASHBOARD ============
function Dashboard({ settings, onUpdateSettings }: { settings: Settings; onUpdateSettings: (s: Settings) => void }) {
  const [tab, setTab] = useState('settings');

  const tabs = [
    { id: 'settings', label: 'الإعدادات', icon: SettingsIcon },
    { id: 'rules', label: 'القوانين', icon: FileText },
    { id: 'sectors', label: 'القطاعات', icon: Building2 },
    { id: 'gangs', label: 'العصابات', icon: Swords },
    { id: 'management', label: 'الإدارة', icon: Crown },
    { id: 'ranks', label: 'الرتب', icon: Shield },
    { id: 'main-tabs', label: 'القائمة الرئيسية', icon: LayoutPanelTop },
    { id: 'blocks', label: 'المحتوى', icon: BookOpen },
    { id: 'books', label: 'الكتب والدستور', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <SettingsIcon className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">لوحة التحكم</h1>
            <p className="text-sm text-gray-400">إدارة السيرفر والقوانين والرتب والقطاعات والعصابات</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8 p-1.5 bg-white/[0.03] border border-white/10 rounded-xl w-fit">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  tab === t.id ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {tab === 'settings' && <SettingsPanel settings={settings} onUpdate={onUpdateSettings} />}
        {tab === 'rules' && <RulesPanel />}
        {tab === 'sectors' && <GroupsPanel table="sectors" memberTable="sector_members" parentKey="sector_id" label="قطاع" memberLabel="عضو" color="blue" />}
        {tab === 'gangs' && <GroupsPanel table="gangs" memberTable="gang_members" parentKey="gang_id" label="عصابة" memberLabel="عضو" color="red" />}
        {tab === 'management' && <ManagementPanel />}
        {tab === 'ranks' && <RanksPanel />}
        {tab === 'main-tabs' && <MainTabsPanel />}
        {tab === 'blocks' && <ContentBlocksPanel />}
        {tab === 'books' && <BooksPanel />}
      </div>
    </div>
  );
}

// ============ MAIN TABS PANEL ============
function MainTabsPanel() {
  const [tabs, setTabs] = useState<MainTab[]>([]);
  const [editing, setEditing] = useState<MainTab | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchTabs = useCallback(async () => {
    const { data, error } = await supabase
      .from('main_tabs')
      .select('*')
      .order('sort_order', { ascending: true });
    if (!error) setTabs((data || []) as MainTab[]);
  }, []);

  useEffect(() => { fetchTabs(); }, [fetchTabs]);

  async function removeTab(tab: MainTab) {
    if (tab.is_protected) {
      alert('هذا التبويب أساسي ولا يمكن حذفه، لكن يمكنك تعديل اسمه وشعاره أو إخفاؤه.');
      return;
    }
    if (!window.confirm(`هل تريد حذف تبويب "${tab.name}"؟`)) return;
    const { error } = await supabase.from('main_tabs').delete().eq('id', tab.id);
    if (error) alert(`تعذر الحذف: ${error.message}`);
    else fetchTabs();
  }

  async function moveTab(id: string, direction: -1 | 1) {
    const ordered = [...tabs].sort((a, b) => a.sort_order - b.sort_order);
    const index = ordered.findIndex((item) => item.id === id);
    const targetIndex = index + direction;
    if (index < 0 || targetIndex < 0 || targetIndex >= ordered.length) return;
    const current = ordered[index];
    const target = ordered[targetIndex];
    await Promise.all([
      supabase.from('main_tabs').update({ sort_order: target.sort_order }).eq('id', current.id),
      supabase.from('main_tabs').update({ sort_order: current.sort_order }).eq('id', target.id),
    ]);
    fetchTabs();
  }

  async function toggleVisible(tab: MainTab) {
    await supabase.from('main_tabs').update({ is_visible: !tab.is_visible }).eq('id', tab.id);
    fetchTabs();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">إدارة القائمة الرئيسية</h2>
          <p className="text-sm text-gray-500 mt-1">عدّل الاسم والشعار والترتيب، أو أضف تبويبًا جديدًا بمحتوى خاص.</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-black font-semibold rounded-lg hover:bg-amber-600 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" /> تبويب جديد
        </button>
      </div>

      <div className="space-y-3">
        {tabs.map((tab) => (
          <div key={tab.id} className="bg-white/[0.02] border border-white/10 rounded-xl p-4 flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <DynamicIcon name={tab.icon} className="w-5 h-5 text-amber-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-white">{tab.name}</h3>
                {tab.is_protected && <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">أساسي</span>}
                {!tab.is_visible && <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-500/10 text-gray-400 border border-gray-500/20">مخفي</span>}
              </div>
              <p className="text-xs text-gray-500 mt-1">الشعار: {tab.icon}</p>
            </div>
            <div className="flex items-center gap-1 flex-wrap justify-end">
              <button onClick={() => moveTab(tab.id, -1)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400" title="تحريك للأعلى"><ChevronUp className="w-4 h-4" /></button>
              <button onClick={() => moveTab(tab.id, 1)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400" title="تحريك للأسفل"><ChevronDown className="w-4 h-4" /></button>
              <button onClick={() => toggleVisible(tab)} className="px-3 py-2 hover:bg-white/10 rounded-lg text-xs text-gray-300">{tab.is_visible ? 'إخفاء' : 'إظهار'}</button>
              <button onClick={() => { setEditing(tab); setShowModal(true); }} className="p-2 hover:bg-white/10 rounded-lg text-gray-400" title="تعديل"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => removeTab(tab)} className="p-2 hover:bg-red-500/20 rounded-lg text-red-400" title="حذف"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <MainTabModal
          tab={editing}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSaved={() => { setShowModal(false); setEditing(null); fetchTabs(); }}
        />
      )}
    </div>
  );
}

const MAIN_TAB_ICON_OPTIONS = ['FileText', 'Shield', 'Building2', 'Swords', 'Crown', 'Scale', 'Users', 'Gamepad2', 'BookOpen', 'AlertTriangle', 'Crosshair', 'Car', 'Truck'];

function MainTabModal({ tab, onClose, onSaved }: { tab: MainTab | null; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(tab?.name || '');
  const [icon, setIcon] = useState(tab?.icon || 'FileText');
  const [visible, setVisible] = useState(tab?.is_visible ?? true);
  const [saving, setSaving] = useState(false);

  async function save() {
    const cleanName = name.trim();
    if (!cleanName) return;
    setSaving(true);
    if (tab) {
      const { error } = await supabase.from('main_tabs').update({ name: cleanName, icon, is_visible: visible }).eq('id', tab.id);
      if (error) alert(`تعذر الحفظ: ${error.message}`); else onSaved();
    } else {
      const { data } = await supabase.from('main_tabs').select('sort_order').order('sort_order', { ascending: false }).limit(1).maybeSingle();
      const { error } = await supabase.from('main_tabs').insert({
        name: cleanName,
        icon,
        content_type: 'custom',
        sort_order: data ? data.sort_order + 1 : 0,
        is_visible: visible,
        is_protected: false,
      });
      if (error) alert(`تعذر إنشاء التبويب: ${error.message}`); else onSaved();
    }
    setSaving(false);
  }

  return (
    <Modal title={tab ? 'تعديل التبويب' : 'تبويب جديد'} onClose={onClose}>
      <div className="space-y-5">
        <Field label="اسم التبويب">
          <input value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="مثال: القضاء" autoFocus />
        </Field>
        <Field label="اختيار الشعار" hint="اختر شعارًا من القائمة المحدودة">
          <div className="grid grid-cols-5 gap-2">
            {MAIN_TAB_ICON_OPTIONS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setIcon(item)}
                className={`aspect-square rounded-lg border flex items-center justify-center transition-all ${icon === item ? 'bg-amber-500/15 border-amber-500/50 text-amber-400' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'}`}
                title={item}
              >
                <DynamicIcon name={item} className="w-5 h-5" />
              </button>
            ))}
          </div>
        </Field>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} className="w-4 h-4 accent-amber-500" />
          <span className="text-sm text-gray-300">إظهار التبويب في الموقع</span>
        </label>
        {tab?.content_type === 'custom' && <p className="text-xs text-gray-500">أضف محتوى هذا التبويب من صفحة «المحتوى» في لوحة التحكم.</p>}
      </div>
      <div className="flex gap-3 mt-6">
        <button onClick={save} disabled={saving || !name.trim()} className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-semibold rounded-lg transition-colors">{saving ? 'جاري الحفظ...' : 'حفظ'}</button>
        <button onClick={onClose} className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300">إلغاء</button>
      </div>
      <style>{`.input{width:100%;padding:.75rem 1rem;background:#0a0a0f;border:1px solid rgba(255,255,255,.1);border-radius:.5rem;color:#fff;font-size:.875rem}.input:focus{outline:none;border-color:rgba(245,158,11,.5)}`}</style>
    </Modal>
  );
}

// ============ CONTENT BLOCKS DISPLAY (public) ============
function ContentBlocksDisplay({ blocks }: { blocks: ContentBlock[] }) {
  if (blocks.length === 0) return null;
  return (
    <div className="mt-8 space-y-6">
      {blocks.map((block, i) => (
        <div
          key={block.id}
          className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 md:p-8 animate-[fadeIn_0.4s_ease-out]"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          {block.title && (
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">{block.title}</h2>
          )}
          {block.body && (
            <div className="text-gray-300 text-base leading-loose whitespace-pre-wrap break-words">{block.body}</div>
          )}
          {block.media_type === 'image' && block.media_url && (
            <div className="mt-4 rounded-xl overflow-hidden border border-white/10">
              <img src={block.media_url} alt={block.title || 'صورة'} className="w-full h-auto" />
            </div>
          )}
          {block.media_type === 'video' && block.media_url && (
            <div className="mt-4 rounded-xl overflow-hidden border border-white/10">
              <video src={block.media_url} controls className="w-full h-auto" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ============ CONTENT BLOCKS PANEL (dashboard) ============
function ContentBlocksPanel() {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [editing, setEditing] = useState<ContentBlock | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetch = useCallback(async () => {
    const { data } = await supabase.from('content_blocks').select('*').order('sort_order', { ascending: true });
    setBlocks(data || []);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  async function del(id: string) {
    await supabase.from('content_blocks').delete().eq('id', id);
    fetch();
  }
  async function move(id: string, dir: number) {
    const sorted = [...blocks].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex((b) => b.id === id);
    if (idx < 0) return;
    const swap = idx + dir;
    if (swap < 0 || swap >= sorted.length) return;
    const a = sorted[idx], b = sorted[swap];
    await Promise.all([
      supabase.from('content_blocks').update({ sort_order: b.sort_order }).eq('id', a.id),
      supabase.from('content_blocks').update({ sort_order: a.sort_order }).eq('id', b.id),
    ]);
    fetch();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">المحتوى</h2>
          <p className="text-xs text-gray-600 mt-1">أضف محتوى نصي طويل مع صور وفيديوهات يظهر في تبويبات القطاعات والعصابات والإدارة</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowModal(true); }}
          className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-500 text-sm hover:bg-amber-500/20 transition-colors"
        >
          <Plus className="w-4 h-4" /> محتوى جديد
        </button>
      </div>
      <div className="space-y-3">
        {blocks.map((block, i) => (
          <div key={block.id} className="group bg-white/[0.02] border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  {block.media_type === 'image' ? <ImageIcon className="w-5 h-5 text-amber-500" /> :
                   block.media_type === 'video' ? <Video className="w-5 h-5 text-amber-500" /> :
                   <LayoutPanelTop className="w-5 h-5 text-amber-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-white text-base">{block.title || 'بدون عنوان'}</h4>
                  <span className="text-xs text-gray-500">{block.parent_type === 'sector' ? 'القطاعات' : block.parent_type === 'gang' ? 'العصابات' : block.parent_type === 'management' ? 'الإدارة' : 'تبويب مخصص'}</span>
                  {block.body && <p className="text-gray-400 text-sm mt-1 line-clamp-2 whitespace-pre-wrap">{block.body}</p>}
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button onClick={() => move(block.id, -1)} className="p-1 hover:bg-white/10 rounded text-gray-400"><ChevronUp className="w-4 h-4" /></button>
                <button onClick={() => move(block.id, 1)} className="p-1 hover:bg-white/10 rounded text-gray-400"><ChevronDown className="w-4 h-4" /></button>
                <button onClick={() => { setEditing(block); setShowModal(true); }} className="p-1 hover:bg-white/10 rounded text-gray-400"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => del(block.id)} className="p-1 hover:bg-red-500/20 rounded text-red-400"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
        {blocks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500 bg-white/[0.02] border border-white/10 rounded-xl">
            <LayoutPanelTop className="w-12 h-12 mb-3 opacity-30" />
            <p>لا يوجد محتوى بعد</p>
          </div>
        )}
      </div>
      {showModal && (
        <ContentBlockModal block={editing} onClose={() => { setShowModal(false); setEditing(null); }} onSaved={() => { setShowModal(false); setEditing(null); fetch(); }} />
      )}
    </div>
  );
}

function ContentBlockModal({ block, onClose, onSaved }: { block: ContentBlock | null; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState(block?.title || '');
  const [body, setBody] = useState(block?.body || '');
  const [parentType, setParentType] = useState<'sector' | 'gang' | 'management' | 'custom'>(block?.parent_type || 'sector');
  const [parentId, setParentId] = useState<string | null>(block?.parent_id || null);
  const [customTabs, setCustomTabs] = useState<MainTab[]>([]);
  const [mediaType, setMediaType] = useState<'none' | 'image' | 'video'>(block?.media_type || 'none');
  const [mediaUrl, setMediaUrl] = useState(block?.media_url || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('main_tabs').select('*').eq('content_type', 'custom').order('sort_order', { ascending: true });
      const loaded = (data || []) as MainTab[];
      setCustomTabs(loaded);
      if (parentType === 'custom' && !parentId && loaded.length > 0) setParentId(loaded[0].id);
    })();
  }, [parentType, parentId]);

  async function save() {
    if (parentType === 'custom' && !parentId) {
      alert('اختر التبويب المخصص أولًا');
      return;
    }
    setSaving(true);
    const payload = {
      title,
      body,
      parent_type: parentType,
      parent_id: parentType === 'custom' ? parentId : null,
      media_type: mediaType,
      media_url: mediaType === 'none' ? '' : mediaUrl,
    };
    if (block) {
      await supabase.from('content_blocks').update(payload).eq('id', block.id);
    } else {
      const { data } = await supabase.from('content_blocks').select('sort_order').order('sort_order', { ascending: false }).limit(1).maybeSingle();
      const sortOrder = data ? data.sort_order + 1 : 0;
      await supabase.from('content_blocks').insert({ ...payload, sort_order: sortOrder });
    }
    setSaving(false);
    onSaved();
  }

  return (
    <Modal title={block ? 'تعديل محتوى' : 'محتوى جديد'} onClose={onClose}>
      <div className="space-y-4">
        <Field label="يظهر في تبويب">
          <div className="grid grid-cols-2 gap-2">
            {([['sector', 'القطاعات'], ['gang', 'العصابات'], ['management', 'الإدارة'], ['custom', 'تبويب مخصص']] as const).map(([val, label]) => (
              <button
                key={val}
                onClick={() => { setParentType(val); if (val !== 'custom') setParentId(null); }}
                className={`px-3 py-2 rounded-lg border text-sm transition-all ${parentType === val ? 'bg-amber-500/15 border-amber-500/40 text-amber-400' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </Field>
        {parentType === 'custom' && (
          <Field label="اختر التبويب المخصص">
            <select value={parentId || ''} onChange={(e) => setParentId(e.target.value || null)} className="input">
              <option value="">اختر تبويبًا</option>
              {customTabs.map((tab) => <option key={tab.id} value={tab.id}>{tab.name}</option>)}
            </select>
          </Field>
        )}
        <Field label="العنوان">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="input" placeholder="عنوان كبير يظهر في الأعلى" autoFocus />
        </Field>
        <Field label="النص" hint="اكتب أي عدد من الأسطر بدون حد">
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={8} className="input resize-y min-h-[200px]" placeholder="اكتب المحتوى هنا..." />
        </Field>
        <Field label="إضافة وسائط">
          <div className="flex gap-2">
            {([['none', 'بدون', LayoutPanelTop], ['image', 'صورة', ImageIcon], ['video', 'فيديو', Video]] as const).map(([val, label, Icon]) => (
              <button
                key={val}
                onClick={() => setMediaType(val)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${mediaType === val ? 'bg-amber-500/15 border-amber-500/40 text-amber-400' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'}`}
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>
        </Field>
        {mediaType !== 'none' && (
          <Field label={mediaType === 'image' ? 'رفع صورة' : 'رفع فيديو'} hint="اختر الملف مباشرة من جهازك، وسيتم حفظه في Supabase Storage.">
            <MediaUploader value={mediaUrl} onChange={setMediaUrl} kind={mediaType} />
          </Field>
        )}
      </div>
      <div className="flex gap-3 mt-6">
        <button onClick={save} disabled={saving || !title} className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-semibold rounded-lg transition-colors">
          {saving ? 'جاري الحفظ...' : 'حفظ'}
        </button>
        <button onClick={onClose} className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 transition-colors">إلغاء</button>
      </div>
      <style>{`.input{width:100%;padding:.75rem 1rem;background:#0a0a0f;border:1px solid rgba(255,255,255,.1);border-radius:.5rem;color:#fff;font-size:.875rem;transition:border-color .2s}.input:focus{outline:none;border-color:rgba(245,158,11,.5)}`}</style>
    </Modal>
  );
}

// ============ BOOKS PANEL ============
function BooksPanel() {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [pages, setPages] = useState<BookPage[]>([]);
  const [chapters, setChapters] = useState<ConstitutionChapter[]>([]);
  const [articles, setArticles] = useState<ConstitutionArticle[]>([]);
  const [showBookModal, setShowBookModal] = useState(false);
  const [showPageModal, setShowPageModal] = useState(false);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [editingPage, setEditingPage] = useState<BookPage | null>(null);
  const [editingChapter, setEditingChapter] = useState<ConstitutionChapter | null>(null);
  const [editingArticle, setEditingArticle] = useState<ConstitutionArticle | null>(null);
  const [previewBook, setPreviewBook] = useState<Book | null>(null);
  const [previewPages, setPreviewPages] = useState<BookPage[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [importing, setImporting] = useState(false);

  const loadBooks = useCallback(async () => {
    const { data } = await supabase.from('books').select('*').order('sort_order', { ascending: true });
    const loadedBooks = (data || []) as Book[];
    setBooks(loadedBooks);
    if (!selectedBookId && loadedBooks.length > 0) {
      setSelectedBookId(loadedBooks[0].id);
    } else if (selectedBookId && !loadedBooks.some((book) => book.id === selectedBookId)) {
      setSelectedBookId(loadedBooks[0]?.id || null);
    }
  }, [selectedBookId]);

  const loadPages = useCallback(async (bookId: string | null) => {
    if (!bookId) {
      setPages([]);
      return;
    }
    const { data } = await supabase.from('book_pages').select('*').eq('book_id', bookId).order('sort_order', { ascending: true });
    setPages((data || []) as BookPage[]);
  }, []);

  const loadConstitutionContent = useCallback(async (bookId: string | null) => {
    if (!bookId) {
      setChapters([]);
      setArticles([]);
      return;
    }
    const [{ data: chapterData }, { data: articleData }] = await Promise.all([
      supabase.from('constitution_chapters').select('*').eq('book_id', bookId).order('sort_order', { ascending: true }),
      supabase.from('constitution_articles').select('*').eq('book_id', bookId).order('sort_order', { ascending: true }),
    ]);
    setChapters((chapterData || []) as ConstitutionChapter[]);
    setArticles((articleData || []) as ConstitutionArticle[]);
  }, []);

  useEffect(() => { loadBooks(); }, [loadBooks]);
  useEffect(() => { void loadPages(selectedBookId); }, [selectedBookId, loadPages]);
  useEffect(() => { void loadConstitutionContent(selectedBookId); }, [selectedBookId, loadConstitutionContent]);

  async function removeBook(book: Book) {
    if (!window.confirm(`هل تريد حذف الكتاب "${book.title}"؟`)) return;
    await supabase.from('books').delete().eq('id', book.id);
    setPreviewBook(null);
    setPreviewPages([]);
    await loadBooks();
  }

  async function removePage(page: BookPage) {
    if (!window.confirm(`هل تريد حذف الصفحة "${page.title}"؟`)) return;
    await supabase.from('book_pages').delete().eq('id', page.id);
    if (selectedBookId) await loadPages(selectedBookId);
  }

  async function removeChapter(chapter: ConstitutionChapter) {
    if (!window.confirm(`هل تريد حذف الفصل "${chapter.title}"؟`)) return;
    await supabase.from('constitution_chapters').delete().eq('id', chapter.id);
    if (selectedBookId) await loadConstitutionContent(selectedBookId);
  }

  async function removeArticle(article: ConstitutionArticle) {
    if (!window.confirm(`هل تريد حذف المادة "${article.title}"؟`)) return;
    await supabase.from('constitution_articles').delete().eq('id', article.id);
    if (selectedBookId) await loadConstitutionContent(selectedBookId);
  }

  async function moveBook(bookId: string, direction: -1 | 1) {
    const sorted = [...books].sort((a, b) => a.sort_order - b.sort_order);
    const index = sorted.findIndex((item) => item.id === bookId);
    const swapIndex = index + direction;
    if (index < 0 || swapIndex < 0 || swapIndex >= sorted.length) return;
    const current = sorted[index];
    const target = sorted[swapIndex];
    await Promise.all([
      supabase.from('books').update({ sort_order: target.sort_order }).eq('id', current.id),
      supabase.from('books').update({ sort_order: current.sort_order }).eq('id', target.id),
    ]);
    await loadBooks();
  }

  async function movePage(pageId: string, direction: -1 | 1) {
    const sorted = [...pages].sort((a, b) => a.sort_order - b.sort_order);
    const index = sorted.findIndex((item) => item.id === pageId);
    const swapIndex = index + direction;
    if (index < 0 || swapIndex < 0 || swapIndex >= sorted.length) return;
    const current = sorted[index];
    const target = sorted[swapIndex];
    await Promise.all([
      supabase.from('book_pages').update({ sort_order: target.sort_order }).eq('id', current.id),
      supabase.from('book_pages').update({ sort_order: current.sort_order }).eq('id', target.id),
    ]);
    if (selectedBookId) await loadPages(selectedBookId);
  }

  async function moveChapter(chapterId: string, direction: -1 | 1) {
    const sorted = [...chapters].sort((a, b) => a.sort_order - b.sort_order);
    const index = sorted.findIndex((item) => item.id === chapterId);
    const swapIndex = index + direction;
    if (index < 0 || swapIndex < 0 || swapIndex >= sorted.length) return;
    const current = sorted[index];
    const target = sorted[swapIndex];
    await Promise.all([
      supabase.from('constitution_chapters').update({ sort_order: target.sort_order }).eq('id', current.id),
      supabase.from('constitution_chapters').update({ sort_order: current.sort_order }).eq('id', target.id),
    ]);
    if (selectedBookId) await loadConstitutionContent(selectedBookId);
  }

  async function moveArticle(articleId: string, direction: -1 | 1) {
    const sorted = [...articles].sort((a, b) => a.sort_order - b.sort_order);
    const index = sorted.findIndex((item) => item.id === articleId);
    const swapIndex = index + direction;
    if (index < 0 || swapIndex < 0 || swapIndex >= sorted.length) return;
    const current = sorted[index];
    const target = sorted[swapIndex];
    await Promise.all([
      supabase.from('constitution_articles').update({ sort_order: target.sort_order }).eq('id', current.id),
      supabase.from('constitution_articles').update({ sort_order: current.sort_order }).eq('id', target.id),
    ]);
    if (selectedBookId) await loadConstitutionContent(selectedBookId);
  }

  async function toggleVisible(book: Book) {
    await supabase.from('books').update({ is_visible: !book.is_visible }).eq('id', book.id);
    await loadBooks();
  }

  async function toggleChapterVisible(chapter: ConstitutionChapter) {
    await supabase.from('constitution_chapters').update({ is_visible: !chapter.is_visible }).eq('id', chapter.id);
    if (selectedBookId) await loadConstitutionContent(selectedBookId);
  }

  async function toggleArticleVisible(article: ConstitutionArticle) {
    await supabase.from('constitution_articles').update({ is_visible: !article.is_visible }).eq('id', article.id);
    if (selectedBookId) await loadConstitutionContent(selectedBookId);
  }

  async function openPreviewBook(book: Book) {
    setPreviewBook(book);
    const { data } = await supabase.from('book_pages').select('*').eq('book_id', book.id).order('sort_order', { ascending: true });
    setPreviewPages((data || []) as BookPage[]);
  }

  function parseConstitutionText(rawText: string) {
    const lines = rawText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const parsed: Array<{ title: string; description: string; articles: Array<{ number: number; title: string; content: string }> }> = [];
    let currentChapter: { title: string; description: string; articles: Array<{ number: number; title: string; content: string }> } | null = null;
    let currentArticle: { number: number; title: string; content: string } | null = null;
    let introLines: string[] = [];

    const flushArticle = () => {
      if (currentChapter && currentArticle) currentChapter.articles.push({ ...currentArticle, content: currentArticle.content.trim() });
      currentArticle = null;
    };
    const flushChapter = () => {
      flushArticle();
      if (currentChapter) parsed.push(currentChapter);
      currentChapter = null;
    };

    for (const line of lines) {
      const chapterMatch = line.match(/^(الباب|الفصل)\s+.+$/);
      const articleMatch = line.match(/^المادة\s*[（(]?(\d+)[）)]?\s*[:：-]?\s*(.*)$/);

      if (chapterMatch) {
        flushChapter();
        currentChapter = { title: line, description: '', articles: [] };
        continue;
      }
      if (articleMatch) {
        if (!currentChapter) {
          currentChapter = { title: introLines.length ? 'المقدمة والأحكام التمهيدية' : 'أحكام عامة', description: introLines.join('\n'), articles: [] };
          introLines = [];
        }
        flushArticle();
        currentArticle = { number: Number(articleMatch[1]), title: articleMatch[2] || `المادة ${articleMatch[1]}`, content: '' };
        continue;
      }
      if (currentArticle) {
        currentArticle.content += `${currentArticle.content ? '\n' : ''}${line}`;
      } else if (currentChapter) {
        currentChapter.description += `${currentChapter.description ? '\n' : ''}${line}`;
      } else {
        introLines.push(line);
      }
    }
    flushChapter();
    if (!parsed.length && introLines.length) parsed.push({ title: 'المقدمة', description: introLines.join('\n'), articles: [] });
    return parsed;
  }

  async function importConstitution() {
    if (!selectedBookId || !importText.trim()) return;
    const parsed = parseConstitutionText(importText);
    const articleCount = parsed.reduce((total, chapter) => total + chapter.articles.length, 0);
    if (!parsed.length || articleCount === 0) {
      alert('لم أتمكن من اكتشاف الأبواب والمواد. تأكد أن العناوين تبدأ بـ «الباب» وأن المواد تبدأ بـ «المادة (1)».');
      return;
    }
    if (!window.confirm(`سيتم استبدال الأبواب والمواد الحالية بـ ${parsed.length} باب و${articleCount} مادة. هل تريد المتابعة؟`)) return;

    setImporting(true);
    try {
      const { error: deleteArticlesError } = await supabase.from('constitution_articles').delete().eq('book_id', selectedBookId);
      if (deleteArticlesError) throw deleteArticlesError;
      const { error: deleteChaptersError } = await supabase.from('constitution_chapters').delete().eq('book_id', selectedBookId);
      if (deleteChaptersError) throw deleteChaptersError;

      for (let chapterIndex = 0; chapterIndex < parsed.length; chapterIndex += 1) {
        const chapter = parsed[chapterIndex];
        const { data: createdChapter, error: chapterError } = await supabase
          .from('constitution_chapters')
          .insert({ book_id: selectedBookId, title: chapter.title, description: chapter.description, sort_order: chapterIndex + 1, is_visible: true })
          .select('*')
          .single();
        if (chapterError || !createdChapter) throw chapterError || new Error('تعذر إنشاء الباب');

        if (chapter.articles.length) {
          const rows = chapter.articles.map((article, articleIndex) => ({
            book_id: selectedBookId,
            chapter_id: createdChapter.id,
            article_number: article.number,
            title: article.title,
            content: article.content,
            sort_order: articleIndex + 1,
            is_visible: true,
          }));
          const { error: articlesError } = await supabase.from('constitution_articles').insert(rows);
          if (articlesError) throw articlesError;
        }
      }

      await loadConstitutionContent(selectedBookId);
      setShowImportModal(false);
      setImportText('');
      alert(`تم استيراد ${parsed.length} باب و${articleCount} مادة بنجاح.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'حدث خطأ غير معروف';
      alert(`تعذر استيراد الدستور: ${message}`);
    } finally {
      setImporting(false);
    }
  }

  const selectedBook = books.find((book) => book.id === selectedBookId) || null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">الكتب والدستور</h2>
          <p className="text-sm text-gray-500 mt-1">أنشئ كتبًا دستورية، أضف صفحات، وابدأ معاينة القراءة مباشرة من اللوحة.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowImportModal(true)} disabled={!selectedBookId} className="flex items-center gap-2 px-4 py-2.5 border border-amber-500/30 bg-amber-500/10 text-amber-400 font-semibold rounded-lg hover:bg-amber-500/20 disabled:opacity-40">
            <FileText className="w-4 h-4" /> استيراد دستور
          </button>
          <button onClick={() => { setEditingBook(null); setShowBookModal(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-black font-semibold rounded-lg hover:bg-amber-600 transition-colors">
            <Plus className="w-4 h-4" /> كتاب جديد
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-3">
          {books.map((book) => (
            <div key={book.id} className={`rounded-2xl border p-4 transition-all ${selectedBook?.id === book.id ? 'border-amber-500/30 bg-amber-500/10' : 'border-white/10 bg-white/[0.02]'}`}>
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <DynamicIcon name={book.icon || 'BookOpen'} className="w-5 h-5 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-sm">{book.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{book.description || 'دستور متكامل'}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => setSelectedBookId(book.id)} className="px-3 py-1.5 rounded-lg text-xs bg-white/5 text-gray-300">اختيار</button>
                <button onClick={() => { setEditingBook(book); setShowBookModal(true); }} className="p-2 rounded-lg text-gray-400 hover:bg-white/10"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => toggleVisible(book)} className="px-3 py-1.5 rounded-lg text-xs text-gray-300 hover:bg-white/10">{book.is_visible ? 'إخفاء' : 'إظهار'}</button>
                <button onClick={() => openPreviewBook(book)} className="px-3 py-1.5 rounded-lg text-xs text-gray-300 hover:bg-white/10">معاينة</button>
                <button onClick={() => removeBook(book)} className="p-2 rounded-lg text-red-400 hover:bg-red-500/20"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          {books.length === 0 && <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center text-gray-500">لا توجد كتب بعد</div>}
        </div>

        <div className="lg:col-span-2 space-y-6">
          {selectedBook && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white">الصفحات: {selectedBook.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">أضف أو عدّل الصفحات وترتيبها من هنا.</p>
                </div>
                <button onClick={() => { setEditingPage(null); setShowPageModal(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-500 hover:bg-amber-500/20 transition-colors">
                  <Plus className="w-4 h-4" /> صفحة جديدة
                </button>
              </div>
              <div className="mt-5 space-y-4">
                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-white">الصفحات الخاصة</h4>
                      <p className="text-sm text-gray-500 mt-1">الصفحات الثابتة مثل الغلاف والمقدمة والجدول.</p>
                    </div>
                    <button onClick={() => { setEditingPage(null); setShowPageModal(true); }} className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-500 hover:bg-amber-500/20 transition-colors">
                      <Plus className="w-4 h-4" /> صفحة جديدة
                    </button>
                  </div>
                  <div className="mt-4 space-y-3">
                    {pages.map((page) => (
                      <div key={page.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-white">{page.title || 'بدون عنوان'}</h4>
                              <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-gray-400">الرقم {page.page_number || 1}</span>
                            </div>
                            {page.content && <p className="mt-2 text-sm text-gray-400 whitespace-pre-wrap line-clamp-3">{page.content}</p>}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button onClick={() => movePage(page.id, -1)} className="p-2 rounded-lg hover:bg-white/10 text-gray-400"><ChevronUp className="w-4 h-4" /></button>
                            <button onClick={() => movePage(page.id, 1)} className="p-2 rounded-lg hover:bg-white/10 text-gray-400"><ChevronDown className="w-4 h-4" /></button>
                            <button onClick={() => { setEditingPage(page); setShowPageModal(true); }} className="p-2 rounded-lg hover:bg-white/10 text-gray-400"><Pencil className="w-4 h-4" /></button>
                            <button onClick={() => removePage(page)} className="p-2 rounded-lg text-red-400 hover:bg-red-500/20"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {pages.length === 0 && <div className="rounded-xl border border-dashed border-white/10 bg-black/10 p-8 text-center text-gray-500">لا توجد صفحات بعد</div>}
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-white">الفصول والمادة</h4>
                      <p className="text-sm text-gray-500 mt-1">أنشئ فصولًا وأضف المواد ضمن كل فصل، ثم حرّك الترتيب أو إخفاء العناصر.</p>
                    </div>
                    <button onClick={() => { setEditingChapter(null); setShowChapterModal(true); }} className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-500 hover:bg-amber-500/20 transition-colors">
                      <Plus className="w-4 h-4" /> فصل جديد
                    </button>
                  </div>

                  <div className="mt-4 space-y-4">
                    {chapters.map((chapter) => (
                      <div key={chapter.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className="font-bold text-white">{chapter.title}</h5>
                              <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-gray-400">الفصل {chapter.sort_order}</span>
                            </div>
                            {chapter.description && <p className="mt-2 text-sm text-gray-400">{chapter.description}</p>}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button onClick={() => moveChapter(chapter.id, -1)} className="p-2 rounded-lg hover:bg-white/10 text-gray-400"><ChevronUp className="w-4 h-4" /></button>
                            <button onClick={() => moveChapter(chapter.id, 1)} className="p-2 rounded-lg hover:bg-white/10 text-gray-400"><ChevronDown className="w-4 h-4" /></button>
                            <button onClick={() => toggleChapterVisible(chapter)} className="px-3 py-1.5 rounded-lg text-xs text-gray-300 hover:bg-white/10">{chapter.is_visible ? 'إخفاء' : 'إظهار'}</button>
                            <button onClick={() => { setEditingChapter(chapter); setShowChapterModal(true); }} className="p-2 rounded-lg hover:bg-white/10 text-gray-400"><Pencil className="w-4 h-4" /></button>
                            <button onClick={() => removeChapter(chapter)} className="p-2 rounded-lg text-red-400 hover:bg-red-500/20"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>

                        <div className="mt-4 space-y-3">
                          {articles.filter((article) => article.chapter_id === chapter.id).map((article) => (
                            <div key={article.id} className="rounded-lg border border-white/10 bg-black/20 p-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h6 className="font-semibold text-gray-200">{article.title}</h6>
                                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">المادة {article.article_number}</span>
                                  </div>
                                  {article.content && <p className="mt-2 text-sm text-gray-400 whitespace-pre-wrap line-clamp-3">{article.content}</p>}
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button onClick={() => moveArticle(article.id, -1)} className="p-2 rounded-lg hover:bg-white/10 text-gray-400"><ChevronUp className="w-4 h-4" /></button>
                                  <button onClick={() => moveArticle(article.id, 1)} className="p-2 rounded-lg hover:bg-white/10 text-gray-400"><ChevronDown className="w-4 h-4" /></button>
                                  <button onClick={() => toggleArticleVisible(article)} className="px-3 py-1.5 rounded-lg text-xs text-gray-300 hover:bg-white/10">{article.is_visible ? 'إخفاء' : 'إظهار'}</button>
                                  <button onClick={() => { setEditingArticle(article); setShowArticleModal(true); }} className="p-2 rounded-lg hover:bg-white/10 text-gray-400"><Pencil className="w-4 h-4" /></button>
                                  <button onClick={() => removeArticle(article)} className="p-2 rounded-lg text-red-400 hover:bg-red-500/20"><Trash2 className="w-4 h-4" /></button>
                                </div>
                              </div>
                            </div>
                          ))}
                          <button onClick={() => { setEditingArticle(null); setShowArticleModal(true); }} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-white/10 bg-white/[0.03] text-sm text-gray-400 hover:border-amber-500/20 hover:text-amber-400">
                            <Plus className="w-4 h-4" /> إضافة مادة إلى هذا الفصل
                          </button>
                        </div>
                      </div>
                    ))}
                    {chapters.length === 0 && <div className="rounded-xl border border-dashed border-white/10 bg-black/10 p-8 text-center text-gray-500">لا توجد فصول بعد</div>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {previewBook && (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">معاينة: {previewBook.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">استعرض الشكل النهائي قبل نشره.</p>
                </div>
                <button onClick={() => setPreviewBook(null)} className="px-3 py-2 rounded-lg bg-white/10 text-gray-300">إغلاق</button>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#0a0a0f] p-4">
                <BookReader book={previewBook} pages={previewPages} chapters={chapters} articles={articles} loading={false} />
              </div>
            </div>
          )}
        </div>
      </div>

      {showImportModal && selectedBook && (
        <Modal title={`استيراد دستور إلى ${selectedBook.title}`} onClose={() => !importing && setShowImportModal(false)}>
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-gray-400">الصق الدستور كاملًا. سيكتشف النظام الأبواب والمواد ويرتبها تلقائيًا. استخدم صيغة «الباب الأول» و«المادة (1): عنوان المادة».</p>
            <textarea value={importText} onChange={(event) => setImportText(event.target.value)} rows={16} dir="rtl" placeholder="الصق نص الدستور هنا..." className="w-full resize-y rounded-xl border border-white/10 bg-[#0a0a0f] p-4 text-sm leading-loose text-white outline-none focus:border-amber-500/50" />
            <div className="flex gap-3">
              <button onClick={importConstitution} disabled={importing || !importText.trim()} className="flex-1 rounded-lg bg-amber-500 px-4 py-2.5 font-semibold text-black hover:bg-amber-600 disabled:opacity-50">{importing ? 'جاري الاستيراد...' : 'استيراد وترتيب الدستور'}</button>
              <button onClick={() => setShowImportModal(false)} disabled={importing} className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-gray-300 hover:bg-white/10 disabled:opacity-50">إلغاء</button>
            </div>
          </div>
        </Modal>
      )}

      {showBookModal && (
        <BookModal
          book={editingBook}
          onClose={() => { setShowBookModal(false); setEditingBook(null); }}
          onSaved={async () => { setShowBookModal(false); setEditingBook(null); await loadBooks(); }}
        />
      )}
      {showPageModal && selectedBook && (
        <PageModal
          book={selectedBook}
          page={editingPage}
          onClose={() => { setShowPageModal(false); setEditingPage(null); }}
          onSaved={async () => { setShowPageModal(false); setEditingPage(null); if (selectedBookId) await loadPages(selectedBookId); }}
        />
      )}
      {showChapterModal && selectedBook && (
        <ChapterModal
          book={selectedBook}
          chapter={editingChapter}
          onClose={() => { setShowChapterModal(false); setEditingChapter(null); }}
          onSaved={async () => { setShowChapterModal(false); setEditingChapter(null); if (selectedBookId) await loadConstitutionContent(selectedBookId); }}
        />
      )}
      {showArticleModal && selectedBook && (
        <ArticleModal
          book={selectedBook}
          article={editingArticle}
          chapterId={editingArticle?.chapter_id || null}
          onClose={() => { setShowArticleModal(false); setEditingArticle(null); }}
          onSaved={async () => { setShowArticleModal(false); setEditingArticle(null); if (selectedBookId) await loadConstitutionContent(selectedBookId); }}
        />
      )}
    </div>
  );
}

function BookModal({ book, onClose, onSaved }: { book: Book | null; onClose: () => void; onSaved: () => Promise<void> }) {
  const [title, setTitle] = useState(book?.title || '');
  const [description, setDescription] = useState(book?.description || '');
  const [coverImageUrl, setCoverImageUrl] = useState(book?.cover_image_url || '');
  const [icon, setIcon] = useState(book?.icon || 'BookOpen');
  const [visible, setVisible] = useState(book?.is_visible ?? true);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!title.trim()) return;
    setSaving(true);
    if (book) {
      const { error } = await supabase.from('books').update({ title: title.trim(), description: description.trim(), cover_image_url: coverImageUrl.trim(), icon, is_visible: visible }).eq('id', book.id);
      if (error) alert(`تعذر الحفظ: ${error.message}`); else await onSaved();
    } else {
      const { data } = await supabase.from('books').select('sort_order').order('sort_order', { ascending: false }).limit(1).maybeSingle();
      const { error } = await supabase.from('books').insert({ title: title.trim(), description: description.trim(), cover_image_url: coverImageUrl.trim(), icon, is_visible: visible, sort_order: data ? data.sort_order + 1 : 0 });
      if (error) alert(`تعذر إنشاء الكتاب: ${error.message}`); else await onSaved();
    }
    setSaving(false);
  }

  return (
    <Modal title={book ? 'تعديل الكتاب' : 'كتاب جديد'} onClose={onClose}>
      <div className="space-y-4">
        <Field label="عنوان الكتاب"><input value={title} onChange={(e) => setTitle(e.target.value)} className="input" placeholder="مثال: دستور مدينة ساندي" autoFocus /></Field>
        <Field label="الوصف"><textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input resize-y min-h-[120px]" placeholder="وصف مختصر" /></Field>
        <Field label="غلاف الكتاب" hint="اختياري، اختر صورة مباشرة من جهازك"><MediaUploader value={coverImageUrl} onChange={setCoverImageUrl} kind="image" label="اختيار صورة غلاف" /></Field>
        <Field label="الأيقونة"><select value={icon} onChange={(e) => setIcon(e.target.value)} className="input"><option value="BookOpen">BookOpen</option><option value="FileText">FileText</option><option value="Scale">Scale</option><option value="Shield">Shield</option><option value="Users">Users</option></select></Field>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} className="w-4 h-4 accent-amber-500" />
          <span className="text-sm text-gray-300">إظهار الكتاب في الموقع</span>
        </label>
      </div>
      <div className="flex gap-3 mt-6">
        <button onClick={save} disabled={saving || !title.trim()} className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-semibold rounded-lg transition-colors">{saving ? 'جاري الحفظ...' : 'حفظ'}</button>
        <button onClick={onClose} className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300">إلغاء</button>
      </div>
    </Modal>
  );
}

function PageModal({ book, page, onClose, onSaved }: { book: Book; page: BookPage | null; onClose: () => void; onSaved: () => Promise<void> }) {
  const [title, setTitle] = useState(page?.title || '');
  const [content, setContent] = useState(page?.content || '');
  const [imageUrl, setImageUrl] = useState(page?.image_url || '');
  const [pageNumber, setPageNumber] = useState(page?.page_number || 1);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!title.trim()) return;
    setSaving(true);
    if (page) {
      const { error } = await supabase.from('book_pages').update({ title: title.trim(), content: content.trim(), image_url: imageUrl.trim(), page_number: pageNumber }).eq('id', page.id);
      if (error) alert(`تعذر الحفظ: ${error.message}`); else await onSaved();
    } else {
      const { data } = await supabase.from('book_pages').select('sort_order').eq('book_id', book.id).order('sort_order', { ascending: false }).limit(1).maybeSingle();
      const { error } = await supabase.from('book_pages').insert({ book_id: book.id, title: title.trim(), content: content.trim(), image_url: imageUrl.trim(), page_number: pageNumber, sort_order: data ? data.sort_order + 1 : 0 });
      if (error) alert(`تعذر إنشاء الصفحة: ${error.message}`); else await onSaved();
    }
    setSaving(false);
  }

  return (
    <Modal title={page ? 'تعديل الصفحة' : 'صفحة جديدة'} onClose={onClose}>
      <div className="space-y-4">
        <Field label="عنوان الصفحة"><input value={title} onChange={(e) => setTitle(e.target.value)} className="input" placeholder="مثال: المقدمة" autoFocus /></Field>
        <Field label="رقم الصفحة"><input value={pageNumber} onChange={(e) => setPageNumber(Number(e.target.value) || 1)} type="number" min="1" className="input" /></Field>
        <Field label="المحتوى"><textarea value={content} onChange={(e) => setContent(e.target.value)} className="input resize-y min-h-[180px]" placeholder="اكتب نص الصفحة هنا..." /></Field>
        <Field label="صورة الصفحة" hint="اختياري، اختر صورة مباشرة من جهازك"><MediaUploader value={imageUrl} onChange={setImageUrl} kind="image" label="اختيار صورة للصفحة" /></Field>
      </div>
      <div className="flex gap-3 mt-6">
        <button onClick={save} disabled={saving || !title.trim()} className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-semibold rounded-lg transition-colors">{saving ? 'جاري الحفظ...' : 'حفظ'}</button>
        <button onClick={onClose} className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300">إلغاء</button>
      </div>
    </Modal>
  );
}

function ChapterModal({ book, chapter, onClose, onSaved }: { book: Book; chapter: ConstitutionChapter | null; onClose: () => void; onSaved: () => Promise<void> }) {
  const [title, setTitle] = useState(chapter?.title || '');
  const [description, setDescription] = useState(chapter?.description || '');
  const [visible, setVisible] = useState(chapter?.is_visible ?? true);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!title.trim()) return;
    setSaving(true);
    if (chapter) {
      const { error } = await supabase.from('constitution_chapters').update({ title: title.trim(), description: description.trim(), is_visible: visible }).eq('id', chapter.id);
      if (error) alert(`تعذر الحفظ: ${error.message}`); else await onSaved();
    } else {
      const { data } = await supabase.from('constitution_chapters').select('sort_order').eq('book_id', book.id).order('sort_order', { ascending: false }).limit(1).maybeSingle();
      const { error } = await supabase.from('constitution_chapters').insert({ book_id: book.id, title: title.trim(), description: description.trim(), sort_order: data ? data.sort_order + 1 : 0, is_visible: visible });
      if (error) alert(`تعذر إنشاء الفصل: ${error.message}`); else await onSaved();
    }
    setSaving(false);
  }

  return (
    <Modal title={chapter ? 'تعديل الفصل' : 'فصل جديد'} onClose={onClose}>
      <div className="space-y-4">
        <Field label="عنوان الفصل"><input value={title} onChange={(e) => setTitle(e.target.value)} className="input" placeholder="مثال: الأحكام العامة" autoFocus /></Field>
        <Field label="الوصف"><textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input resize-y min-h-[110px]" placeholder="وصف مختصر للفصل" /></Field>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} className="w-4 h-4 accent-amber-500" />
          <span className="text-sm text-gray-300">إظهار الفصل في الموقع</span>
        </label>
      </div>
      <div className="flex gap-3 mt-6">
        <button onClick={save} disabled={saving || !title.trim()} className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-semibold rounded-lg transition-colors">{saving ? 'جاري الحفظ...' : 'حفظ'}</button>
        <button onClick={onClose} className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300">إلغاء</button>
      </div>
    </Modal>
  );
}

function ArticleModal({ book, article, chapterId, onClose, onSaved }: { book: Book; article: ConstitutionArticle | null; chapterId: string | null; onClose: () => void; onSaved: () => Promise<void> }) {
  const [title, setTitle] = useState(article?.title || '');
  const [content, setContent] = useState(article?.content || '');
  const [articleNumber, setArticleNumber] = useState(article?.article_number || 1);
  const [selectedChapterId, setSelectedChapterId] = useState(article?.chapter_id || chapterId || '');
  const [visible, setVisible] = useState(article?.is_visible ?? true);
  const [chapters, setChapters] = useState<ConstitutionChapter[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('constitution_chapters').select('*').eq('book_id', book.id).order('sort_order', { ascending: true });
      setChapters((data || []) as ConstitutionChapter[]);
      if (!selectedChapterId && (data || []).length) setSelectedChapterId((data as ConstitutionChapter[])[0].id);
    })();
  }, [book.id, selectedChapterId]);

  async function save() {
    if (!title.trim() || !selectedChapterId) return;
    setSaving(true);
    if (article) {
      const { error } = await supabase.from('constitution_articles').update({ chapter_id: selectedChapterId, article_number: articleNumber, title: title.trim(), content: content.trim(), is_visible: visible }).eq('id', article.id);
      if (error) alert(`تعذر الحفظ: ${error.message}`); else await onSaved();
    } else {
      const { data } = await supabase.from('constitution_articles').select('sort_order').eq('book_id', book.id).order('sort_order', { ascending: false }).limit(1).maybeSingle();
      const { error } = await supabase.from('constitution_articles').insert({ book_id: book.id, chapter_id: selectedChapterId, article_number: articleNumber, title: title.trim(), content: content.trim(), sort_order: data ? data.sort_order + 1 : 0, is_visible: visible });
      if (error) alert(`تعذر إنشاء المادة: ${error.message}`); else await onSaved();
    }
    setSaving(false);
  }

  return (
    <Modal title={article ? 'تعديل المادة' : 'مادة جديدة'} onClose={onClose}>
      <div className="space-y-4">
        <Field label="الفصل"><select value={selectedChapterId} onChange={(e) => setSelectedChapterId(e.target.value)} className="input"><option value="">اختر فصلًا</option>{chapters.map((chapter) => <option key={chapter.id} value={chapter.id}>{chapter.title}</option>)}</select></Field>
        <Field label="رقم المادة"><input value={articleNumber} onChange={(e) => setArticleNumber(Number(e.target.value) || 1)} type="number" min="1" className="input" /></Field>
        <Field label="عنوان المادة"><input value={title} onChange={(e) => setTitle(e.target.value)} className="input" placeholder="مثال: المبادئ الأساسية" autoFocus /></Field>
        <Field label="المحتوى"><textarea value={content} onChange={(e) => setContent(e.target.value)} className="input resize-y min-h-[160px]" placeholder="اكتب نص المادة هنا..." /></Field>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} className="w-4 h-4 accent-amber-500" />
          <span className="text-sm text-gray-300">إظهار المادة في الموقع</span>
        </label>
      </div>
      <div className="flex gap-3 mt-6">
        <button onClick={save} disabled={saving || !title.trim() || !selectedChapterId} className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-semibold rounded-lg transition-colors">{saving ? 'جاري الحفظ...' : 'حفظ'}</button>
        <button onClick={onClose} className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300">إلغاء</button>
      </div>
    </Modal>
  );
}

// ============ SETTINGS PANEL ============
function SettingsPanel({ settings, onUpdate }: { settings: Settings; onUpdate: (s: Settings) => void }) {
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    const { data, error } = await supabase
      .from('settings')
      .update({
        server_ip: form.server_ip,
        discord_url: form.discord_url,
        logo_url: form.logo_url,
        admin_password: form.admin_password,
        server_name: form.server_name,
        server_description: form.server_description,
      })
      .eq('id', 1)
      .select('*')
      .maybeSingle();
    if (!error && data) {
      onUpdate(data as Settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  }

  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 md:p-8 max-w-2xl">
      <h2 className="text-lg font-bold text-white mb-6">إعدادات السيرفر</h2>
      <div className="space-y-5">
        <Field label="اسم السيرفر">
          <input value={form.server_name} onChange={(e) => setForm({ ...form, server_name: e.target.value })} className="input" />
        </Field>
        <Field label="وصف السيرفر">
          <textarea value={form.server_description} onChange={(e) => setForm({ ...form, server_description: e.target.value })} rows={2} className="input resize-none" />
        </Field>
        <Field label="شعار السيرفر" hint="اختر صورة من جهازك لتظهر كشعار في أعلى الموقع">
          <MediaUploader value={form.logo_url} onChange={(url) => setForm({ ...form, logo_url: url })} kind="image" label="اختيار شعار السيرفر" />
        </Field>
        <Field label="آيبي السيرفر">
          <input value={form.server_ip} onChange={(e) => setForm({ ...form, server_ip: e.target.value })} className="input" dir="ltr" />
        </Field>
        <Field label="رابط ديسكورد السيرفر">
          <input value={form.discord_url} onChange={(e) => setForm({ ...form, discord_url: e.target.value })} className="input" dir="ltr" />
        </Field>
        <Field label="كلمة مرور لوحة التحكم" hint="كلمة المرور للدخول إلى لوحة التحكم">
          <input value={form.admin_password} onChange={(e) => setForm({ ...form, admin_password: e.target.value })} className="input" dir="ltr" />
        </Field>
      </div>
      <button
        onClick={save}
        disabled={saving}
        className="mt-6 flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-semibold rounded-lg transition-colors"
      >
        {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
        {saved ? 'تم الحفظ' : saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
      </button>
      <style>{`.input{width:100%;padding:.75rem 1rem;background:#0a0a0f;border:1px solid rgba(255,255,255,.1);border-radius:.5rem;color:#fff;font-size:.875rem;transition:border-color .2s}.input:focus{outline:none;border-color:rgba(245,158,11,.5)}.input::placeholder{color:#6b7280}`}</style>
    </div>
  );
}

// ============ RULES PANEL (dashboard) ============
function RulesPanel() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [showRuleModal, setShowRuleModal] = useState(false);

  const fetch = useCallback(async () => {
    const [{ data: cats }, { data: rls }] = await Promise.all([
      supabase.from('categories').select('*').order('sort_order', { ascending: true }),
      supabase.from('rules').select('*').order('sort_order', { ascending: true }),
    ]);
    setCategories(cats || []);
    setRules(rls || []);
    if (cats && cats.length > 0 && !activeCat) setActiveCat(cats[0].id);
  }, [activeCat]);

  useEffect(() => { fetch(); }, [fetch]);

  async function deleteCat(id: string) {
    await supabase.from('categories').delete().eq('id', id);
    if (activeCat === id) setActiveCat(null);
    fetch();
  }
  async function deleteRule(id: string) {
    await supabase.from('rules').delete().eq('id', id);
    fetch();
  }
  async function moveCat(id: string, dir: number) {
    const sorted = [...categories].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex((c) => c.id === id);
    if (idx < 0) return;
    const swap = idx + dir;
    if (swap < 0 || swap >= sorted.length) return;
    const a = sorted[idx], b = sorted[swap];
    await Promise.all([
      supabase.from('categories').update({ sort_order: b.sort_order }).eq('id', a.id),
      supabase.from('categories').update({ sort_order: a.sort_order }).eq('id', b.id),
    ]);
    fetch();
  }
  async function moveRule(id: string, dir: number) {
    const filtered = rules.filter((r) => r.category_id === activeCat).sort((a, b) => a.sort_order - b.sort_order);
    const idx = filtered.findIndex((r) => r.id === id);
    if (idx < 0) return;
    const swap = idx + dir;
    if (swap < 0 || swap >= filtered.length) return;
    const a = filtered[idx], b = filtered[swap];
    await Promise.all([
      supabase.from('rules').update({ sort_order: b.sort_order }).eq('id', a.id),
      supabase.from('rules').update({ sort_order: a.sort_order }).eq('id', b.id),
    ]);
    fetch();
  }

  const filteredRules = rules.filter((r) => r.category_id === activeCat);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">الأقسام</h2>
          <button
            onClick={() => { setEditingCat(null); setShowCatModal(true); }}
            className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-500 text-sm hover:bg-amber-500/20 transition-colors"
          >
            <Plus className="w-4 h-4" /> قسم جديد
          </button>
        </div>
        <div className="space-y-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={`group flex items-center gap-2 p-3 rounded-xl border transition-all ${
                activeCat === cat.id ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/[0.02] border-white/10 hover:border-white/20'
              }`}
            >
              <button onClick={() => setActiveCat(cat.id)} className="flex-1 flex items-center gap-2 text-right text-sm font-medium text-gray-200">
                <DynamicIcon name={cat.icon} className="w-4 h-4 shrink-0 text-gray-400" />
                <span>{cat.name}</span>
              </button>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => moveCat(cat.id, -1)} className="p-1 hover:bg-white/10 rounded text-gray-400"><ChevronUp className="w-4 h-4" /></button>
                <button onClick={() => moveCat(cat.id, 1)} className="p-1 hover:bg-white/10 rounded text-gray-400"><ChevronDown className="w-4 h-4" /></button>
                <button onClick={() => { setEditingCat(cat); setShowCatModal(true); }} className="p-1 hover:bg-white/10 rounded text-gray-400"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => deleteCat(cat.id)} className="p-1 hover:bg-red-500/20 rounded text-red-400"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          {categories.length === 0 && <p className="text-gray-500 text-sm text-center py-8">لا توجد أقسام</p>}
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            القوانين {filteredRules.length > 0 && `(${filteredRules.length})`}
          </h2>
          {activeCat && (
            <button
              onClick={() => { setEditingRule(null); setShowRuleModal(true); }}
              className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-500 text-sm hover:bg-amber-500/20 transition-colors"
            >
              <Plus className="w-4 h-4" /> قانون جديد
            </button>
          )}
        </div>
        {activeCat ? (
          <div className="space-y-3">
            {filteredRules.map((rule, i) => (
              <div key={rule.id} className="group flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 text-xs font-bold shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-white text-sm">{rule.title}</h4>
                  {rule.content && <p className="text-gray-400 text-sm mt-1">{rule.content}</p>}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => moveRule(rule.id, -1)} className="p-1 hover:bg-white/10 rounded text-gray-400"><ChevronUp className="w-4 h-4" /></button>
                  <button onClick={() => moveRule(rule.id, 1)} className="p-1 hover:bg-white/10 rounded text-gray-400"><ChevronDown className="w-4 h-4" /></button>
                  <button onClick={() => { setEditingRule(rule); setShowRuleModal(true); }} className="p-1 hover:bg-white/10 rounded text-gray-400"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => deleteRule(rule.id)} className="p-1 hover:bg-red-500/20 rounded text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
            {filteredRules.length === 0 && <p className="text-gray-500 text-sm text-center py-8">لا توجد قوانين في هذا القسم</p>}
          </div>
        ) : (
          <p className="text-gray-500 text-sm text-center py-8">اختر قسماً لعرض قوانينه</p>
        )}
      </div>

      {showCatModal && (
        <CategoryModal category={editingCat} onClose={() => { setShowCatModal(false); setEditingCat(null); }} onSaved={() => { setShowCatModal(false); setEditingCat(null); fetch(); }} />
      )}
      {showRuleModal && activeCat && (
        <RuleModal rule={editingRule} categoryId={activeCat} onClose={() => { setShowRuleModal(false); setEditingRule(null); }} onSaved={() => { setShowRuleModal(false); setEditingRule(null); fetch(); }} />
      )}
    </div>
  );
}

function CategoryModal({ category, onClose, onSaved }: { category: Category | null; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(category?.name || '');
  const [icon, setIcon] = useState(category?.icon || 'Scale');
  const [saving, setSaving] = useState(false);
  const icons = ['Scale', 'Shield', 'Users', 'Building2', 'Swords', 'Crown', 'Car', 'Truck', 'FileText', 'AlertTriangle', 'Gamepad2', 'Crosshair', 'BookOpen'];

  async function save() {
    setSaving(true);
    if (category) {
      await supabase.from('categories').update({ name, icon }).eq('id', category.id);
    } else {
      const { data } = await supabase.from('categories').select('sort_order').order('sort_order', { ascending: false }).limit(1).maybeSingle();
      const sortOrder = data ? data.sort_order + 1 : 0;
      await supabase.from('categories').insert({ name, icon, sort_order: sortOrder });
    }
    setSaving(false);
    onSaved();
  }

  return (
    <Modal title={category ? 'تعديل قسم' : 'قسم جديد'} onClose={onClose}>
      <div className="space-y-4">
        <Field label="اسم القسم">
          <input value={name} onChange={(e) => setName(e.target.value)} className="input" autoFocus />
        </Field>
        <Field label="الأيقونة">
          <div className="grid grid-cols-5 gap-2">
            {icons.map((ic) => (
              <button
                key={ic}
                onClick={() => setIcon(ic)}
                className={`p-3 rounded-lg border transition-all flex items-center justify-center ${icon === ic ? 'bg-amber-500/15 border-amber-500/40' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
              >
                <DynamicIcon name={ic} className={`w-5 h-5 ${icon === ic ? 'text-amber-500' : 'text-gray-400'}`} />
              </button>
            ))}
          </div>
        </Field>
      </div>
      <div className="flex gap-3 mt-6">
        <button onClick={save} disabled={saving || !name} className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-semibold rounded-lg transition-colors">
          {saving ? 'جاري الحفظ...' : 'حفظ'}
        </button>
        <button onClick={onClose} className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 transition-colors">إلغاء</button>
      </div>
      <style>{`.input{width:100%;padding:.75rem 1rem;background:#0a0a0f;border:1px solid rgba(255,255,255,.1);border-radius:.5rem;color:#fff;font-size:.875rem;transition:border-color .2s}.input:focus{outline:none;border-color:rgba(245,158,11,.5)}`}</style>
    </Modal>
  );
}

function RuleModal({ rule, categoryId, onClose, onSaved }: { rule: Rule | null; categoryId: string; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState(rule?.title || '');
  const [content, setContent] = useState(rule?.content || '');
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    if (rule) {
      await supabase.from('rules').update({ title, content }).eq('id', rule.id);
    } else {
      const { data } = await supabase.from('rules').select('sort_order').eq('category_id', categoryId).order('sort_order', { ascending: false }).limit(1).maybeSingle();
      const sortOrder = data ? data.sort_order + 1 : 0;
      await supabase.from('rules').insert({ title, content, category_id: categoryId, sort_order: sortOrder });
    }
    setSaving(false);
    onSaved();
  }

  return (
    <Modal title={rule ? 'تعديل قانون' : 'قانون جديد'} onClose={onClose}>
      <div className="space-y-4">
        <Field label="عنوان القانون">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="input" autoFocus />
        </Field>
        <Field label="تفاصيل القانون">
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} className="input resize-none" />
        </Field>
      </div>
      <div className="flex gap-3 mt-6">
        <button onClick={save} disabled={saving || !title} className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-semibold rounded-lg transition-colors">
          {saving ? 'جاري الحفظ...' : 'حفظ'}
        </button>
        <button onClick={onClose} className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 transition-colors">إلغاء</button>
      </div>
      <style>{`.input{width:100%;padding:.75rem 1rem;background:#0a0a0f;border:1px solid rgba(255,255,255,.1);border-radius:.5rem;color:#fff;font-size:.875rem;transition:border-color .2s}.input:focus{outline:none;border-color:rgba(245,158,11,.5)}`}</style>
    </Modal>
  );
}

// ============ GROUPS PANEL (sectors/gangs dashboard) ============
function GroupsPanel({
  table,
  memberTable,
  parentKey,
  label,
  memberLabel,
  color,
}: {
  table: string;
  memberTable: string;
  parentKey: string;
  label: string;
  memberLabel: string;
  color: 'blue' | 'red';
}) {
  const [groups, setGroups] = useState<(Sector | Gang)[]>([]);
  const [members, setMembers] = useState<(SectorMember | GangMember)[]>([]);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [editingGroup, setEditingGroup] = useState<Sector | Gang | null>(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingMember, setEditingMember] = useState<SectorMember | GangMember | null>(null);
  const [showMemberModal, setShowMemberModal] = useState(false);

  const fetch = useCallback(async () => {
    const [{ data: grps }, { data: mems }] = await Promise.all([
      supabase.from(table).select('*').order('sort_order', { ascending: true }),
      supabase.from(memberTable).select('*').order('sort_order', { ascending: true }),
    ]);
    setGroups(grps || []);
    setMembers(mems || []);
    if (grps && grps.length > 0 && !activeGroup) {
      setActiveGroup(grps[0].id);
    }
  }, [table, memberTable, activeGroup]);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  async function deleteGroup(id: string) {
    await supabase.from(table).delete().eq('id', id);
    if (activeGroup === id) {
      setActiveGroup(null);
    }
    void fetch();
  }

  async function deleteMember(id: string) {
    await supabase.from(memberTable).delete().eq('id', id);
    void fetch();
  }

  async function moveGroup(id: string, dir: number) {
    const sorted = [...groups].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex((g) => g.id === id);
    if (idx < 0) return;
    const swap = idx + dir;
    if (swap < 0 || swap >= sorted.length) return;
    const a = sorted[idx];
    const b = sorted[swap];
    await Promise.all([
      supabase.from(table).update({ sort_order: b.sort_order }).eq('id', a.id),
      supabase.from(table).update({ sort_order: a.sort_order }).eq('id', b.id),
    ]);
    void fetch();
  }

  async function moveMember(id: string, dir: number) {
    const filtered = [...members]
      .filter((m) => (m as Record<string, unknown>)[parentKey] === activeGroup)
      .sort((a, b) => a.sort_order - b.sort_order);
    const idx = filtered.findIndex((m) => m.id === id);
    if (idx < 0) return;
    const swap = idx + dir;
    if (swap < 0 || swap >= filtered.length) return;
    const a = filtered[idx];
    const b = filtered[swap];
    await Promise.all([
      supabase.from(memberTable).update({ sort_order: b.sort_order }).eq('id', a.id),
      supabase.from(memberTable).update({ sort_order: a.sort_order }).eq('id', b.id),
    ]);
    void fetch();
  }

  const colorMap = {
    blue: { bg: 'bg-blue-500/[0.08]', border: 'border-blue-500/20', text: 'text-blue-400', btn: 'bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20' },
    red: { bg: 'bg-red-500/[0.08]', border: 'border-red-500/20', text: 'text-red-400', btn: 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20' },
  };
  const c = colorMap[color];
  const groupMembers = members.filter((m) => (m as Record<string, unknown>)[parentKey] === activeGroup);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{label}ات</h2>
          <button
            onClick={() => { setEditingGroup(null); setShowGroupModal(true); }}
            className={`flex items-center gap-1 px-3 py-1.5 border rounded-lg text-sm transition-colors ${c.btn}`}
          >
            <Plus className="w-4 h-4" /> {label} جديد
          </button>
        </div>
        <div className="space-y-2">
          {groups.map((grp) => (
            <div
              key={grp.id}
              className={`group flex items-center gap-2 p-3 rounded-xl border transition-all ${
                activeGroup === grp.id ? `${c.bg} ${c.border}` : 'bg-white/[0.02] border-white/10 hover:border-white/20'
              }`}
            >
              <button onClick={() => setActiveGroup(grp.id)} className="flex-1 text-right text-sm font-medium text-gray-200">
                {grp.name}
              </button>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => void moveGroup(grp.id, -1)} className="p-1 hover:bg-white/10 rounded text-gray-400"><ChevronUp className="w-4 h-4" /></button>
                <button onClick={() => void moveGroup(grp.id, 1)} className="p-1 hover:bg-white/10 rounded text-gray-400"><ChevronDown className="w-4 h-4" /></button>
                <button onClick={() => { setEditingGroup(grp); setShowGroupModal(true); }} className="p-1 hover:bg-white/10 rounded text-gray-400"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => void deleteGroup(grp.id)} className="p-1 hover:bg-red-500/20 rounded text-red-400"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          {groups.length === 0 && <p className="text-gray-500 text-sm text-center py-8">لا يوجد {label}ات</p>}
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            الأعضاء {groupMembers.length > 0 && `(${groupMembers.length})`}
          </h2>
          {activeGroup && (
            <button
              onClick={() => { setEditingMember(null); setShowMemberModal(true); }}
              className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-500 text-sm hover:bg-amber-500/20 transition-colors"
            >
              <Plus className="w-4 h-4" /> {memberLabel} جديد
            </button>
          )}
        </div>
        {activeGroup ? (
          <div className="space-y-3">
            {groupMembers.map((member, i) => (
              <div key={member.id} className="group flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all">
                <div className={`w-8 h-8 rounded-lg ${c.bg} ${c.border} border flex items-center justify-center text-xs font-bold shrink-0 ${c.text}`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-white text-sm">{member.name}</h4>
                  {member.rank_name && <p className={`text-xs ${c.text} mt-0.5`}>{member.rank_name}</p>}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => void moveMember(member.id, -1)} className="p-1 hover:bg-white/10 rounded text-gray-400"><ChevronUp className="w-4 h-4" /></button>
                  <button onClick={() => void moveMember(member.id, 1)} className="p-1 hover:bg-white/10 rounded text-gray-400"><ChevronDown className="w-4 h-4" /></button>
                  <button onClick={() => { setEditingMember(member); setShowMemberModal(true); }} className="p-1 hover:bg-white/10 rounded text-gray-400"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => void deleteMember(member.id)} className="p-1 hover:bg-red-500/20 rounded text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
            {groupMembers.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500 bg-white/[0.02] border border-white/10 rounded-xl">
                <Users className="w-12 h-12 mb-3 opacity-30" />
                <p>لا يوجد أعضاء في هذا {label}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-white/[0.02] border border-white/10 rounded-xl">
            <Users className="w-12 h-12 mb-3 opacity-30" />
            <p>اختر {label} لعرض أعضائه</p>
          </div>
        )}
      </div>

      {showGroupModal && (
        <GroupModal group={editingGroup} table={table} label={label} onClose={() => { setShowGroupModal(false); setEditingGroup(null); }} onSaved={() => { setShowGroupModal(false); setEditingGroup(null); void fetch(); }} />
      )}
      {showMemberModal && activeGroup && (
        <MemberModal member={editingMember} parentKey={parentKey} parentId={activeGroup} memberTable={memberTable} memberLabel={memberLabel} onClose={() => { setShowMemberModal(false); setEditingMember(null); }} onSaved={() => { setShowMemberModal(false); setEditingMember(null); void fetch(); }} />
      )}
    </div>
  );
}

function GroupModal({ group, table, label, onClose, onSaved }: { group: Sector | Gang | null; table: string; label: string; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(group?.name || '');
  const [icon, setIcon] = useState(group?.icon || 'Shield');
  const [saving, setSaving] = useState(false);
  const icons = ['Shield', 'Users', 'Building2', 'Swords', 'Crown', 'Car', 'Truck', 'FileText', 'AlertTriangle', 'Gamepad2', 'Scale', 'Crosshair', 'BookOpen'];

  async function save() {
    setSaving(true);
    if (group) {
      await supabase.from(table).update({ name, icon }).eq('id', group.id);
    } else {
      const { data } = await supabase.from(table).select('sort_order').order('sort_order', { ascending: false }).limit(1).maybeSingle();
      const sortOrder = data ? data.sort_order + 1 : 0;
      await supabase.from(table).insert({ name, icon, sort_order: sortOrder });
    }
    setSaving(false);
    onSaved();
  }

  return (
    <Modal title={group ? `تعديل ${label}` : `${label} جديد`} onClose={onClose}>
      <div className="space-y-4">
        <Field label={`اسم ${label}`}>
          <input value={name} onChange={(e) => setName(e.target.value)} className="input" autoFocus />
        </Field>
        <Field label="الأيقونة">
          <div className="grid grid-cols-5 gap-2">
            {icons.map((ic) => (
              <button
                key={ic}
                onClick={() => setIcon(ic)}
                className={`p-3 rounded-lg border transition-all flex items-center justify-center ${icon === ic ? 'bg-amber-500/15 border-amber-500/40' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
              >
                <DynamicIcon name={ic} className={`w-5 h-5 ${icon === ic ? 'text-amber-500' : 'text-gray-400'}`} />
              </button>
            ))}
          </div>
        </Field>
      </div>
      <div className="flex gap-3 mt-6">
        <button onClick={save} disabled={saving || !name} className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-semibold rounded-lg transition-colors">
          {saving ? 'جاري الحفظ...' : 'حفظ'}
        </button>
        <button onClick={onClose} className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 transition-colors">إلغاء</button>
      </div>
      <style>{`.input{width:100%;padding:.75rem 1rem;background:#0a0a0f;border:1px solid rgba(255,255,255,.1);border-radius:.5rem;color:#fff;font-size:.875rem;transition:border-color .2s}.input:focus{outline:none;border-color:rgba(245,158,11,.5)}`}</style>
    </Modal>
  );
}

function MemberModal({
  member,
  parentKey,
  parentId,
  memberTable,
  memberLabel,
  onClose,
  onSaved,
}: {
  member: SectorMember | GangMember | null;
  parentKey: string;
  parentId: string;
  memberTable: string;
  memberLabel: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(member?.name || '');
  const [rankName, setRankName] = useState(member?.rank_name || '');
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    if (member) {
      await supabase.from(memberTable).update({ name, rank_name: rankName }).eq('id', member.id);
    } else {
      const { data } = await supabase.from(memberTable).select('sort_order').eq(parentKey, parentId).order('sort_order', { ascending: false }).limit(1).maybeSingle();
      const sortOrder = data ? data.sort_order + 1 : 0;
      await supabase.from(memberTable).insert({ name, rank_name: rankName, [parentKey]: parentId, sort_order: sortOrder });
    }
    setSaving(false);
    onSaved();
  }

  return (
    <Modal title={member ? `تعديل ${memberLabel}` : `${memberLabel} جديد`} onClose={onClose}>
      <div className="space-y-4">
        <Field label={`اسم ${memberLabel}`}>
          <input value={name} onChange={(e) => setName(e.target.value)} className="input" autoFocus />
        </Field>
        <Field label="الرتبة">
          <input value={rankName} onChange={(e) => setRankName(e.target.value)} className="input" placeholder="مثال: قائد، نائب، عضو" />
        </Field>
      </div>
      <div className="flex gap-3 mt-6">
        <button onClick={save} disabled={saving || !name} className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-semibold rounded-lg transition-colors">
          {saving ? 'جاري الحفظ...' : 'حفظ'}
        </button>
        <button onClick={onClose} className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 transition-colors">إلغاء</button>
      </div>
      <style>{`.input{width:100%;padding:.75rem 1rem;background:#0a0a0f;border:1px solid rgba(255,255,255,.1);border-radius:.5rem;color:#fff;font-size:.875rem;transition:border-color .2s}.input:focus{outline:none;border-color:rgba(245,158,11,.5)}`}</style>
    </Modal>
  );
}

// ============ MANAGEMENT PANEL (dashboard) ============
function ManagementPanel() {
  const [items, setItems] = useState<ManagementMember[]>([]);
  const [editing, setEditing] = useState<ManagementMember | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetch = useCallback(async () => {
    const { data } = await supabase.from('management').select('*').order('sort_order', { ascending: true });
    setItems(data || []);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  async function del(id: string) {
    await supabase.from('management').delete().eq('id', id);
    fetch();
  }
  async function move(id: string, dir: number) {
    const sorted = [...items].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex((m) => m.id === id);
    if (idx < 0) return;
    const swap = idx + dir;
    if (swap < 0 || swap >= sorted.length) return;
    const a = sorted[idx], b = sorted[swap];
    await Promise.all([
      supabase.from('management').update({ sort_order: b.sort_order }).eq('id', a.id),
      supabase.from('management').update({ sort_order: a.sort_order }).eq('id', b.id),
    ]);
    fetch();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">أعضاء الإدارة</h2>
        <button
          onClick={() => { setEditing(null); setShowModal(true); }}
          className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-500 text-sm hover:bg-amber-500/20 transition-colors"
        >
          <Plus className="w-4 h-4" /> عضو جديد
        </button>
      </div>
      <div className="space-y-3">
        {items.map((member, i) => (
          <div key={member.id} className="group flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Crown className="w-5 h-5 text-amber-500" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-white text-sm">{member.name}</h4>
              {member.rank_name && <p className="text-xs text-amber-400 mt-0.5">{member.rank_name}</p>}
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => move(member.id, -1)} className="p-1 hover:bg-white/10 rounded text-gray-400"><ChevronUp className="w-4 h-4" /></button>
              <button onClick={() => move(member.id, 1)} className="p-1 hover:bg-white/10 rounded text-gray-400"><ChevronDown className="w-4 h-4" /></button>
              <button onClick={() => { setEditing(member); setShowModal(true); }} className="p-1 hover:bg-white/10 rounded text-gray-400"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => del(member.id)} className="p-1 hover:bg-red-500/20 rounded text-red-400"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500 bg-white/[0.02] border border-white/10 rounded-xl">
            <Crown className="w-12 h-12 mb-3 opacity-30" />
            <p>لا يوجد أعضاء إدارة</p>
          </div>
        )}
      </div>
      {showModal && (
        <ManagementModal member={editing} onClose={() => { setShowModal(false); setEditing(null); }} onSaved={() => { setShowModal(false); setEditing(null); fetch(); }} />
      )}
    </div>
  );
}

function ManagementModal({ member, onClose, onSaved }: { member: ManagementMember | null; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(member?.name || '');
  const [rankName, setRankName] = useState(member?.rank_name || '');
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    if (member) {
      await supabase.from('management').update({ name, rank_name: rankName }).eq('id', member.id);
    } else {
      const { data } = await supabase.from('management').select('sort_order').order('sort_order', { ascending: false }).limit(1).maybeSingle();
      const sortOrder = data ? data.sort_order + 1 : 0;
      await supabase.from('management').insert({ name, rank_name: rankName, sort_order: sortOrder });
    }
    setSaving(false);
    onSaved();
  }

  return (
    <Modal title={member ? 'تعديل عضو' : 'عضو جديد'} onClose={onClose}>
      <div className="space-y-4">
        <Field label="الاسم">
          <input value={name} onChange={(e) => setName(e.target.value)} className="input" autoFocus />
        </Field>
        <Field label="الرتبة">
          <input value={rankName} onChange={(e) => setRankName(e.target.value)} className="input" placeholder="مثال: مالك، مشرف، مراقب" />
        </Field>
      </div>
      <div className="flex gap-3 mt-6">
        <button onClick={save} disabled={saving || !name} className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-semibold rounded-lg transition-colors">
          {saving ? 'جاري الحفظ...' : 'حفظ'}
        </button>
        <button onClick={onClose} className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 transition-colors">إلغاء</button>
      </div>
      <style>{`.input{width:100%;padding:.75rem 1rem;background:#0a0a0f;border:1px solid rgba(255,255,255,.1);border-radius:.5rem;color:#fff;font-size:.875rem;transition:border-color .2s}.input:focus{outline:none;border-color:rgba(245,158,11,.5)}`}</style>
    </Modal>
  );
}

// ============ RANKS PANEL (dashboard) ============
function RanksPanel() {
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [editing, setEditing] = useState<Rank | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetch = useCallback(async () => {
    const { data } = await supabase.from('ranks').select('*').order('sort_order', { ascending: true });
    setRanks(data || []);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  async function del(id: string) {
    await supabase.from('ranks').delete().eq('id', id);
    fetch();
  }
  async function move(id: string, dir: number) {
    const sorted = [...ranks].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex((r) => r.id === id);
    if (idx < 0) return;
    const swap = idx + dir;
    if (swap < 0 || swap >= sorted.length) return;
    const a = sorted[idx], b = sorted[swap];
    await Promise.all([
      supabase.from('ranks').update({ sort_order: b.sort_order }).eq('id', a.id),
      supabase.from('ranks').update({ sort_order: a.sort_order }).eq('id', b.id),
    ]);
    fetch();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">رتب السيرفر</h2>
        <button
          onClick={() => { setEditing(null); setShowModal(true); }}
          className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-500 text-sm hover:bg-amber-500/20 transition-colors"
        >
          <Plus className="w-4 h-4" /> رتبة جديدة
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ranks.map((rank) => (
          <div key={rank.id} className="group bg-white/[0.02] border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center border" style={{ background: `${rank.color}15`, borderColor: `${rank.color}40` }}>
                  <Shield className="w-6 h-6" style={{ color: rank.color }} />
                </div>
                <div>
                  <h3 className="font-bold text-white">{rank.name}</h3>
                  {rank.is_default && <span className="text-xs text-green-400">افتراضية</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => move(rank.id, -1)} className="p-1 hover:bg-white/10 rounded text-gray-400"><ChevronUp className="w-4 h-4" /></button>
                <button onClick={() => move(rank.id, 1)} className="p-1 hover:bg-white/10 rounded text-gray-400"><ChevronDown className="w-4 h-4" /></button>
                <button onClick={() => { setEditing(rank); setShowModal(true); }} className="p-1 hover:bg-white/10 rounded text-gray-400"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => del(rank.id)} className="p-1 hover:bg-red-500/20 rounded text-red-400"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                <span
                  key={key}
                  className={`text-xs px-2.5 py-1 rounded-full border ${
                    rank.permissions[key]
                      ? 'bg-green-500/10 border-green-500/20 text-green-400'
                      : 'bg-white/5 border-white/10 text-gray-500'
                  }`}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        ))}
        {ranks.length === 0 && <p className="text-gray-500 text-sm text-center py-8 col-span-2">لا توجد رتب</p>}
      </div>
      {showModal && (
        <RankModal rank={editing} onClose={() => { setShowModal(false); setEditing(null); }} onSaved={() => { setShowModal(false); setEditing(null); fetch(); }} />
      )}
    </div>
  );
}

function RankModal({ rank, onClose, onSaved }: { rank: Rank | null; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(rank?.name || '');
  const [color, setColor] = useState(rank?.color || '#6b7280');
  const [permissions, setPermissions] = useState<Record<string, boolean>>(rank?.permissions || {});
  const [isDefault, setIsDefault] = useState(rank?.is_default || false);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const perms: Record<string, boolean> = {};
    Object.keys(PERMISSION_LABELS).forEach((key) => { perms[key] = permissions[key] || false; });
    if (rank) {
      if (isDefault) await supabase.from('ranks').update({ is_default: false }).neq('id', rank.id);
      await supabase.from('ranks').update({ name, color, permissions: perms, is_default: isDefault }).eq('id', rank.id);
    } else {
      const { data } = await supabase.from('ranks').select('sort_order').order('sort_order', { ascending: false }).limit(1).maybeSingle();
      const sortOrder = data ? data.sort_order + 1 : 0;
      if (isDefault) await supabase.from('ranks').update({ is_default: false }).neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('ranks').insert({ name, color, permissions: perms, is_default: isDefault, sort_order: sortOrder });
    }
    setSaving(false);
    onSaved();
  }

  return (
    <Modal title={rank ? 'تعديل رتبة' : 'رتبة جديدة'} onClose={onClose}>
      <div className="space-y-4">
        <Field label="اسم الرتبة">
          <input value={name} onChange={(e) => setName(e.target.value)} className="input" autoFocus />
        </Field>
        <Field label="لون الرتبة">
          <div className="flex flex-wrap gap-2">
            {RANK_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-9 h-9 rounded-lg border-2 transition-all ${color === c ? 'border-white scale-110' : 'border-transparent'}`}
                style={{ background: c }}
              />
            ))}
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-9 h-9 rounded-lg border border-white/10 bg-transparent cursor-pointer" />
          </div>
        </Field>
        <Field label="الصلاحيات">
          <div className="space-y-2">
            {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
              <label key={key} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={permissions[key] || false}
                  onChange={(e) => setPermissions({ ...permissions, [key]: e.target.checked })}
                  className="w-4 h-4 accent-amber-500"
                />
                <span className="text-sm text-gray-200">{label}</span>
              </label>
            ))}
          </div>
        </Field>
        <label className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:border-white/20 transition-all">
          <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} className="w-4 h-4 accent-amber-500" />
          <span className="text-sm text-gray-200">رتبة افتراضية (يعطىها كل من يدخل الموقع)</span>
        </label>
      </div>
      <div className="flex gap-3 mt-6">
        <button onClick={save} disabled={saving || !name} className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-semibold rounded-lg transition-colors">
          {saving ? 'جاري الحفظ...' : 'حفظ'}
        </button>
        <button onClick={onClose} className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 transition-colors">إلغاء</button>
      </div>
      <style>{`.input{width:100%;padding:.75rem 1rem;background:#0a0a0f;border:1px solid rgba(255,255,255,.1);border-radius:.5rem;color:#fff;font-size:.875rem;transition:border-color .2s}.input:focus{outline:none;border-color:rgba(245,158,11,.5)}`}</style>
    </Modal>
  );
}
