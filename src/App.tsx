import { Component, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
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
  Upload,
  RefreshCw,
  Download,
  Search
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
type LibraryBookEntry = {
  key: string;
  title: string;
  description: string;
  cover: string;
  featured?: boolean;
  book: Book;
  isPersisted: boolean;
};

const LIBRARY_CATALOG = [
  { key: 'constitution', title: 'دستور مدينة ساندي', description: 'الوثيقة القانونية العليا والمرجع الأساسي لجميع القوانين والأنظمة.', cover: '/library/constitution.jpg', aliases: ['دستور مدينة ساندي', 'الدستور'], featured: true },
  { key: 'penalties', title: 'العقوبات', description: 'الجرائم ومدد السجن والغرامات والكفالة والإجراءات الإضافية.', cover: '/library/penalties.jpg', aliases: ['العقوبات', 'قانون العقوبات'] },
  { key: 'roleplay', title: 'قوانين الرول بلاي', description: 'القواعد المنظمة للواقعية والتفاعل وسلوك اللاعبين داخل المدينة.', cover: '/library/roleplay.jpg', aliases: ['قوانين الرول بلاي', 'الرول بلاي', 'رول بلاي'] },
  { key: 'police', title: 'قوانين الشرطة', description: 'التوقيف والتفتيش واستخدام القوة والإجراءات الأمنية.', cover: '/library/police.jpg', aliases: ['قوانين الشرطة', 'الشرطة'] },
  { key: 'judiciary', title: 'القضاء', description: 'المحاكم والجلسات وصلاحيات القضاة والإجراءات القضائية.', cover: '/library/judiciary.jpg', aliases: ['القضاء', 'قوانين المحكمة', 'المحكمة'] },
  { key: 'management', title: 'الإدارة', description: 'اللوائح الإدارية والصلاحيات والتعليمات المنظمة لعمل الإدارة.', cover: '/library/management.jpg', aliases: ['الإدارة', 'نظام الإدارة'] },
  { key: 'ems', title: 'دليل الإسعاف', description: 'الإجراءات الطبية وأولوية الحالات وسرية معلومات المرضى.', cover: '/library/ems.jpg', aliases: ['دليل الإسعاف', 'الإسعاف'] },
  { key: 'gangs', title: 'نظام العصابات', description: 'المنظمات وقواعد المسؤولية والنزاعات داخل المدينة.', cover: '/library/gangs.jpg', aliases: ['نظام العصابات', 'العصابات'] },
] as const;

function normalizeBookTitle(value: unknown) {
  return String(value ?? '')
    .replace(/[ـًٌٍَُِّْ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}


class BookReaderErrorBoundary extends Component<
  { children: ReactNode; onBack: () => void },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: unknown) {
    console.error('Book reader crashed:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center">
          <h3 className="text-xl font-black text-red-200">حدث خطأ أثناء فتح الكتاب</h3>
          <p className="mt-3 break-words rounded-xl bg-black/20 p-3 font-mono text-sm text-red-100">
            {this.state.error.message || 'خطأ غير معروف'}
          </p>
          <button
            onClick={() => {
              this.setState({ error: null });
              this.props.onBack();
            }}
            className="mt-4 rounded-xl bg-white/10 px-5 py-2.5 font-bold text-white hover:bg-white/15"
          >
            العودة إلى المكتبة
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function BooksPublicView({ books }: { books: Book[] }) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [librarySearch, setLibrarySearch] = useState('');
  const [pages, setPages] = useState<BookPage[]>([]);
  const [chapters, setChapters] = useState<ConstitutionChapter[]>([]);
  const [articles, setArticles] = useState<ConstitutionArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  const matchedBookIds = new Set<string>();
  const catalogEntries: LibraryBookEntry[] = LIBRARY_CATALOG.map((item, index) => {
    const aliases = item.aliases.map(normalizeBookTitle);
    const actualBook = books.find((candidate) => !matchedBookIds.has(candidate.id) && aliases.includes(normalizeBookTitle(candidate.title)));
    if (actualBook) matchedBookIds.add(actualBook.id);
    const virtualBook: Book = {
      id: `virtual-${item.key}`,
      title: item.title,
      description: item.description,
      cover_image_url: item.cover,
      icon: 'BookOpen',
      is_visible: true,
      sort_order: index,
      created_at: new Date().toISOString(),
    };
    return {
      key: item.key,
      title: item.title,
      description: actualBook?.description || item.description,
      cover: actualBook?.cover_image_url || item.cover,
      featured: 'featured' in item ? Boolean(item.featured) : false,
      book: actualBook || virtualBook,
      isPersisted: Boolean(actualBook),
    };
  });

  const customEntries: LibraryBookEntry[] = books
    .filter((book) => book.is_visible && !matchedBookIds.has(book.id))
    .filter((book) => normalizeBookTitle(book.title) !== normalizeBookTitle('عقوبات الدستور'))
    .filter((book, index, source) => source.findIndex((candidate) => normalizeBookTitle(candidate.title) === normalizeBookTitle(book.title)) === index)
    .map((book) => ({
      key: `custom-${book.id}`,
      title: book.title,
      description: book.description || 'كتاب من مكتبة مدينة ساندي',
      cover: book.cover_image_url || '/library/constitution.jpg',
      book,
      isPersisted: true,
    }));

  const normalizedEntryTitle = (value: string) =>
    value
      .replace(/مدينة ساندي|قانون|قوانين|كتاب|نظام|دليل/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();

  const dedupedEntries = [...catalogEntries, ...customEntries].filter((entry, index, all) => {
    const normalized = normalizedEntryTitle(entry.title);
    return all.findIndex((candidate) => normalizedEntryTitle(candidate.title) === normalized) === index;
  });

  const entries = dedupedEntries;
  const normalizedLibrarySearch = librarySearch.trim().toLowerCase();
  const visibleEntries = normalizedLibrarySearch
    ? entries.filter((entry) =>
        `${entry.title} ${entry.description}`.toLowerCase().includes(normalizedLibrarySearch),
      )
    : entries;

  const selectedEntry = entries.find((entry) => entry.key === selectedKey) || null;

  useEffect(() => {
    if (!selectedEntry || !selectedEntry.isPersisted) {
      setPages([]);
      setChapters([]);
      setArticles([]);
      setLoading(false);
      return;
    }

    let active = true;
    (async () => {
      setLoading(true);
      setLoadError('');
      const bookId = selectedEntry.book.id;
      const [{ data: pageData, error: pageError }, { data: chapterData, error: chapterError }, { data: articleData, error: articleError }] = await Promise.all([
        supabase.from('book_pages').select('*').eq('book_id', bookId).order('sort_order', { ascending: true }),
        supabase.from('constitution_chapters').select('*').eq('book_id', bookId).eq('is_visible', true).order('sort_order', { ascending: true }),
        supabase.from('constitution_articles').select('*').eq('book_id', bookId).eq('is_visible', true).order('sort_order', { ascending: true }),
      ]);
      if (active && !pageError) setPages((pageData || []) as BookPage[]);
      if (active && !chapterError) setChapters((chapterData || []) as ConstitutionChapter[]);
      if (active && !articleError) setArticles((articleData || []) as ConstitutionArticle[]);
      const firstError = pageError || chapterError || articleError;
      if (active && firstError) setLoadError(firstError.message || 'تعذر تحميل محتوى الكتاب.');
      if (active) setLoading(false);
    })();
    return () => { active = false; };
  }, [selectedEntry?.book.id, selectedEntry?.isPersisted]);

  if (selectedEntry) {
    return (
      <div className="space-y-5">
        <button onClick={() => setSelectedKey(null)} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-gray-300 transition-colors hover:border-amber-500/30 hover:text-white">
          <ArrowLeft className="h-4 w-4 rotate-180" />
          العودة إلى المكتبة
        </button>
        {!selectedEntry.isPersisted && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            هذا الكتاب موجود في واجهة المكتبة، لكنه لا يحتوي على محتوى محفوظ بعد. ستتم إضافة محتواه من لوحة التحكم في المرحلة التالية.
          </div>
        )}
        {loadError && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            تعذر تحميل بعض محتوى الكتاب: {loadError}
          </div>
        )}
        <BookReaderErrorBoundary onBack={() => setSelectedKey(null)}>
          <BookReader
            book={selectedEntry.book}
            pages={pages}
            chapters={chapters}
            articles={articles}
            loading={loading}
            onBack={() => setSelectedKey(null)}
          />
        </BookReaderErrorBoundary>
      </div>
    );
  }

  const featured = visibleEntries.find((entry) => entry.featured) || visibleEntries[0];
  const regular = visibleEntries.filter((entry) => entry.key !== featured?.key);

  const BookCard = ({ entry, large = false }: { entry: LibraryBookEntry; large?: boolean }) => (
    <button
      onClick={() => setSelectedKey(entry.key)}
      className={`group relative overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#111219] text-right shadow-[0_18px_45px_rgba(0,0,0,.28)] transition-all duration-300 hover:-translate-y-2 hover:scale-[1.025] hover:border-amber-400/60 hover:shadow-[0_24px_65px_rgba(245,158,11,.18)] ${large ? 'mx-auto w-full max-w-[320px]' : 'w-full max-w-[250px]'}`}
    >
      <div className={`${large ? 'aspect-[5/6.4]' : 'aspect-[5/7]'} relative overflow-hidden`}>
        <img
          src={entry.cover}
          alt={`غلاف ${entry.title}`}
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = '/library/constitution.jpg';
          }}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
          <h3 className={`${large ? 'text-2xl' : 'text-xl'} font-black text-white drop-shadow-lg`}>{entry.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-200/85">{entry.description}</p>
          <span className="mt-4 inline-flex translate-y-3 items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-xs font-bold text-black opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <BookOpen className="h-4 w-4" />
            فتح الكتاب
          </span>
        </div>
      </div>
    </button>
  );

  return (
    <div className="space-y-10">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10">
          <BookOpen className="h-7 w-7 text-amber-400" />
        </div>
        <h2 className="text-3xl font-black text-white">المكتبة القانونية</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-loose text-gray-400">جميع القوانين والأنظمة في كتب مستقلة. اختر الغلاف لفتح الكتاب بنفس قارئ الدستور.</p>
      </div>

      <div className="mx-auto max-w-xl">
        <label className="relative block">
          <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
          <input
            value={librarySearch}
            onChange={(event) => setLibrarySearch(event.target.value)}
            placeholder="ابحث عن كتاب..."
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-3 pr-12 pl-4 text-white outline-none transition-colors placeholder:text-gray-600 focus:border-amber-500/40"
          />
        </label>
      </div>

      {visibleEntries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center text-gray-500">
          لم يتم العثور على كتاب مطابق للبحث.
        </div>
      ) : (
      <>
      <section className="space-y-4">
        <div className="flex items-center justify-center gap-3">
          <span className="h-px w-16 bg-gradient-to-l from-amber-500/50 to-transparent" />
          <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">المرجع الأعلى</span>
          <span className="h-px w-16 bg-gradient-to-r from-amber-500/50 to-transparent" />
        </div>
        {featured && <BookCard entry={featured} large />}
      </section>

      <section className="space-y-5">
        <h3 className="text-center text-lg font-bold text-gray-200">القوانين والأنظمة</h3>
        <div className="grid grid-cols-1 justify-items-center gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {regular.map((entry) => <BookCard key={entry.key} entry={entry} />)}
        </div>
      </section>
      </>
      )}
    </div>
  );
}

function BookReader({
  book,
  pages,
  chapters,
  articles,
  loading,
  onBack,
}: {
  book: Book;
  pages: BookPage[];
  chapters: ConstitutionChapter[];
  articles: ConstitutionArticle[];
  loading: boolean;
  onBack: () => void;
}) {
  const [currentPage, setCurrentPage] = useState(0);
  const [search, setSearch] = useState('');
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [showContents, setShowContents] = useState(false);

  useEffect(() => {
    setCurrentPage(0);
    setSearch('');
  }, [book.id]);

  const safeBookId = String(book?.id ?? 'virtual-book');
  const safeBookTitle = String(book?.title ?? 'كتاب');
  const safeBookDescription = String(book?.description ?? '');
  const safeBookCover = String(book?.cover_image_url ?? '');

  const defaultItemLabel = (() => {
    const normalized = normalizeBookTitle(safeBookTitle);
    if (normalized.includes('عقوب')) return 'العقوبة';
    if (normalized.includes('رول بلاي') || normalized.includes('شرطة') || normalized.includes('اسعاف') || normalized.includes('عصابات')) return 'القاعدة';
    if (normalized.includes('ادارة')) return 'البند';
    return 'المادة';
  })();

  const safePages = Array.isArray(pages) ? pages : [];
  const safeChapters = Array.isArray(chapters) ? chapters : [];
  const safeArticles = Array.isArray(articles) ? articles : [];

  const constitutionPages = safeChapters.flatMap((chapter) => {
    const chapterId = String(chapter?.id ?? '');
    const chapterTitle = String(chapter?.title ?? 'قسم بدون عنوان');
    const chapterDescription = String(chapter?.description ?? '');
    const chapterOrder = Number(chapter?.sort_order) || 0;

    const chapterArticles = safeArticles
      .filter((article) => String(article?.chapter_id ?? '') === chapterId && article?.is_visible !== false)
      .sort((a, b) => (Number(a?.sort_order) || 0) - (Number(b?.sort_order) || 0));

    const generatedPages: BookPage[] = [];
    if (chapterDescription.trim()) {
      generatedPages.push({
        id: `chapter-intro-${chapterId}`,
        title: chapterTitle,
        content: chapterDescription,
        image_url: '',
        page_number: 0,
        sort_order: chapterOrder * 100,
        created_at: String(chapter?.created_at ?? new Date().toISOString()),
        book_id: String(book?.id ?? ''),
      } as BookPage);
    }

    const articlesPerPage = 3;
    for (let articleStart = 0; articleStart < chapterArticles.length; articleStart += articlesPerPage) {
      const group = chapterArticles.slice(articleStart, articleStart + articlesPerPage);
      const content = group.map((article, groupIndex) => {
        const title = String(article?.title ?? '').trim();
        const articleNumber = String(article?.article_number ?? articleStart + groupIndex + 1);
        const articleContent = String(article?.content ?? '').trim();
        const alreadyLabeled = /^(المادة|القاعدة|العقوبة|البند|الإجراء|التعليمات?)/.test(title);
        const safeTitle = title || `${defaultItemLabel} ${articleNumber}`;
        const heading = alreadyLabeled ? safeTitle : `${defaultItemLabel} ${articleNumber}: ${safeTitle}`;
        return `${heading}
${articleContent}`.trim();
      }).join('\n\n────────────\n\n');

      generatedPages.push({
        id: `chapter-${chapterId}-${articleStart}`,
        title: articleStart === 0 ? chapterTitle : `${chapterTitle} — تكملة`,
        content,
        image_url: '',
        page_number: 0,
        sort_order: chapterOrder * 100 + articleStart + 1,
        created_at: String(chapter?.created_at ?? new Date().toISOString()),
        book_id: safeBookId,
      } as BookPage);
    }
    return generatedPages;
  });

  const normalizedExplicitPages = safePages.map((page, index) => ({
    ...page,
    id: String(page?.id ?? `page-${index}`),
    title: String(page?.title ?? `صفحة ${index + 1}`),
    content: String(page?.content ?? ''),
    image_url: String(page?.image_url ?? ''),
    page_number: Number(page?.page_number) || index + 1,
    sort_order: Number(page?.sort_order) || index,
    created_at: String(page?.created_at ?? new Date().toISOString()),
    book_id: String(page?.book_id ?? safeBookId),
  })) as BookPage[];

  const coverPage: BookPage = {
    id: `cover-${safeBookId}`,
    title: safeBookTitle,
    content: safeBookDescription,
    image_url: safeBookCover,
    page_number: 0,
    sort_order: -1,
    created_at: String(book?.created_at ?? new Date().toISOString()),
    book_id: safeBookId,
  };
  const displayPages = [coverPage, ...normalizedExplicitPages, ...constitutionPages];
  const safePage = Math.min(currentPage, Math.max(0, displayPages.length - 1));
  const currentPageData = displayPages[safePage] || coverPage;
  const isCover = safePage === 0;
  const isFirstPage = safePage === 0;
  const isLastPage = safePage >= displayPages.length - 1;
  const readingProgress = displayPages.length <= 1
    ? 0
    : Math.round((safePage / (displayPages.length - 1)) * 100);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setCurrentPage((value) => Math.min(displayPages.length - 1, value + 1));
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        setCurrentPage((value) => Math.max(0, value - 1));
      }
      if (event.key === 'Escape') onBack();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [displayPages.length, onBack]);

  useEffect(() => {
    if (currentPage !== safePage) setCurrentPage(safePage);
  }, [currentPage, safePage]);


  const searchablePages = displayPages
    .map((page, index) => ({ page, index }))
    .filter(({ page }) => {
      const term = search.trim().toLowerCase();
      if (!term) return true;
      return `${String(page?.title ?? '')} ${String(page?.content ?? '')}`.toLowerCase().includes(term);
    });

  if (loading) {
    return (
      <div className="flex min-h-[520px] items-center justify-center rounded-[2rem] border border-[#7a5b3b]/30 bg-[#2f2418]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500/20 border-t-amber-400" />
      </div>
    );
  }

  const renderInnerPage = () => {
    if (isCover) {
      return (
        <div className="relative flex min-h-[520px] flex-col items-center justify-center overflow-hidden px-6 py-10 text-center">
          {book.cover_image_url && (
            <img
              src={safeBookCover}
              alt={safeBookTitle}
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.style.display = 'none';
              }}
              className="absolute inset-0 h-full w-full object-cover opacity-25"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-[#f8ecd8]/75 via-[#f4e4c8]/90 to-[#e3c18f]/95" />
          <div className="relative z-10 flex max-w-xl flex-col items-center">
            <div className="mb-6 rounded-full border border-[#8f6b3f]/30 bg-[#fff8ea]/60 px-4 py-2 text-sm font-bold text-[#694619]">النسخة الرسمية</div>
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-[#8f6b3f]/30 bg-[#3a2818]/90 shadow-[0_0_40px_rgba(120,74,20,.18)]">
              <Scale className="h-10 w-10 text-amber-300" />
            </div>
            <h3 className="text-3xl font-black text-[#3c2710] sm:text-4xl">{safeBookTitle}</h3>
            <p className="mt-4 text-base leading-loose text-[#654a35] sm:text-lg">{safeBookDescription || 'لا يوجد وصف للكتاب.'}</p>
            <button
              onClick={() => displayPages.length > 1 && setCurrentPage(1)}
              disabled={displayPages.length <= 1}
              className="mt-8 rounded-full bg-[#7a4d18] px-7 py-3 font-bold text-[#fff6e8] shadow-lg transition-all hover:-translate-y-0.5 hover:bg-[#956127] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {displayPages.length > 1 ? 'ابدأ القراءة' : 'لا يوجد محتوى بعد'}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-[520px] px-6 py-10 text-right sm:px-10">
        <div className="mb-6 flex items-center justify-between border-b border-[#9b7454]/25 pb-4 text-sm text-[#7a5b3b]">
          <span>{safeBookTitle}</span>
          <span>صفحة {safePage + 1}</span>
        </div>
        <h3 className="mb-6 text-2xl font-black text-[#3c2710]">{currentPageData.title}</h3>
        {currentPageData.image_url && (
          <img
            src={currentPageData.image_url}
            alt={currentPageData.title}
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.style.display = 'none';
            }}
            className="mb-6 max-h-[260px] w-full rounded-2xl border border-[#9b7454]/25 object-cover"
          />
        )}
        {currentPageData.content ? (
          <div className="whitespace-pre-wrap text-[16px] leading-[2.15] text-[#4d3420]">{currentPageData.content}</div>
        ) : (
          <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-[#9b7454]/30 bg-[#a06f3f]/10 text-[#7a5b3b]">هذه الصفحة لا تحتوي على محتوى بعد.</div>
        )}
      </div>
    );
  };

  return (
    <div className="rounded-[2rem] border border-[#7a5b3b]/30 bg-[radial-gradient(circle_at_top,_rgba(255,236,209,0.96),_rgba(194,143,80,0.94))] p-3 shadow-[0_30px_80px_rgba(0,0,0,0.35)] sm:p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#9b7454]/20 bg-[#2f2418]/90 px-4 py-3 text-[#f8ebd7]">
        <div className="flex items-center gap-2 font-bold"><BookOpen className="h-4 w-4 text-amber-400" />{safeBookTitle}</div>
        <div className="text-sm text-[#f2d8b0]">صفحة {safePage + 1} من {displayPages.length}</div>
      </div>

      <div
        className="relative overflow-hidden rounded-[1.5rem] border border-[#8f6b3f]/25 bg-[#f6ead7] shadow-[inset_0_0_70px_rgba(100,60,20,.10)]"
        onTouchStart={(event) => setTouchStartX(event.touches[0]?.clientX ?? null)}
        onTouchEnd={(event) => {
          if (touchStartX === null) return;
          const delta = (event.changedTouches[0]?.clientX ?? 0) - touchStartX;
          if (delta > 50 && !isFirstPage) setCurrentPage((value) => value - 1);
          if (delta < -50 && !isLastPage) setCurrentPage((value) => value + 1);
          setTouchStartX(null);
        }}
      >
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(95,57,24,.12) 1px, transparent 1px)', backgroundSize: '100% 18px' }} />
        {!isCover && <img src="/library/server-logo.png" alt="" aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 z-[1] h-52 w-52 -translate-x-1/2 -translate-y-1/2 object-contain opacity-[0.045]" />}
        <div className="relative z-10 animate-[fadeIn_.25s_ease-out]" key={`${book.id}-${safePage}`}>{renderInnerPage()}</div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button onClick={() => setCurrentPage((value) => Math.max(0, value - 1))} disabled={isFirstPage} className="rounded-full border border-[#9b7454]/25 bg-[#2f2418]/90 px-5 py-2.5 text-sm font-bold text-[#f8ebd7] transition hover:border-amber-400/40 disabled:opacity-40">السابق</button>
          <button onClick={() => setCurrentPage((value) => Math.min(displayPages.length - 1, value + 1))} disabled={isLastPage} className="rounded-full border border-[#9b7454]/25 bg-[#2f2418]/90 px-5 py-2.5 text-sm font-bold text-[#f8ebd7] transition hover:border-amber-400/40 disabled:opacity-40">التالي</button>
        </div>
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ابحث داخل الكتاب..." className="w-full rounded-full border border-[#9b7454]/25 bg-[#2f2418]/90 px-4 py-2.5 text-sm text-[#f8ebd7] placeholder:text-[#c8aa82] outline-none focus:border-amber-400/50 sm:w-72" />
      </div>

      <div className="mt-4 rounded-2xl border border-[#9b7454]/20 bg-[#2f2418]/80 p-4">
        <h4 className="mb-3 text-sm font-bold text-[#f2d8b0]">فهرس المحتويات</h4>
        <div className="flex flex-wrap gap-2">
          {searchablePages.map(({ page, index }) => (
            <button key={`${page.id}-${index}`} onClick={() => setCurrentPage(index)} className={`rounded-full border px-3 py-1.5 text-sm transition ${index === safePage ? 'border-amber-400/50 bg-amber-500/20 text-amber-200' : 'border-[#9b7454]/20 bg-[#f6ead7]/10 text-[#f6ead7] hover:border-amber-400/40'}`}>
              {index === 0 ? 'الغلاف' : page.title || `صفحة ${index + 1}`}
            </button>
          ))}
          {searchablePages.length === 0 && <p className="text-sm text-[#e3cdad]">لا توجد نتائج للبحث.</p>}
        </div>
      </div>
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
          <Field label={mediaType === 'image' ? 'رابط الصورة' : 'رابط الفيديو'} hint="ضع رابط مباشر للصورة أو الفيديو">
            <input value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} className="input" dir="ltr" placeholder="https://example.com/media.jpg" />
          </Field>
        )}
        {mediaType === 'image' && mediaUrl && (
          <div className="rounded-lg overflow-hidden border border-white/10">
            <img src={mediaUrl} alt="معاينة" className="w-full h-auto max-h-40 object-cover" />
          </div>
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
function parseImportedBookContent(rawText: string) {
  type ImportedItem = { number: number; title: string; content: string };
  type ImportedSection = { title: string; description: string; items: ImportedItem[] };

  const lines = rawText.replace(/\r/g, '').split('\n').map((line) => line.trim()).filter(Boolean);
  const sections: ImportedSection[] = [];
  let currentSection: ImportedSection | null = null;
  let currentItem: ImportedItem | null = null;

  const ensureSection = () => {
    if (!currentSection) {
      currentSection = { title: 'المحتوى العام', description: '', items: [] };
      sections.push(currentSection);
    }
    return currentSection;
  };

  for (const line of lines) {
    const sectionMatch = line.match(/^(الباب|الفصل|القسم)\s*(.*)$/i);
    const itemMatch = line.match(/^(المادة|القاعدة|العقوبة|البند|الإجراء|التعليمات?)\s*[（(]?([A-Za-zأ-ي0-9_-]+)?[）)]?\s*[:：\-]?\s*(.*)$/i);

    if (sectionMatch) {
      currentSection = { title: `${sectionMatch[1]} ${sectionMatch[2]}`.trim(), description: '', items: [] };
      sections.push(currentSection);
      currentItem = null;
      continue;
    }

    if (itemMatch) {
      const section = ensureSection();
      const rawCode = itemMatch[2] || '';
      const numericCode = /^\d+$/.test(rawCode) ? Number(rawCode) : null;
      const number = numericCode ?? section.items.length + 1;
      const rawTitle = itemMatch[3] || '';
      const title = rawCode && numericCode === null
        ? `${itemMatch[1]} (${rawCode})${rawTitle ? `: ${rawTitle}` : ''}`
        : (rawTitle || `${itemMatch[1]} ${number}`);
      currentItem = { number, title, content: '' };
      section.items.push(currentItem);
      continue;
    }

    if (currentItem) {
      currentItem.content = currentItem.content ? `${currentItem.content}\n${line}` : line;
    } else {
      const section = ensureSection();
      section.description = section.description ? `${section.description}\n${line}` : line;
    }
  }

  return sections.filter((section) => section.title || section.description || section.items.length);
}

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
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [editingPage, setEditingPage] = useState<BookPage | null>(null);
  const [editingChapter, setEditingChapter] = useState<ConstitutionChapter | null>(null);
  const [editingArticle, setEditingArticle] = useState<ConstitutionArticle | null>(null);
  const [previewBook, setPreviewBook] = useState<Book | null>(null);
  const [previewPages, setPreviewPages] = useState<BookPage[]>([]);
  const [syncingLibrary, setSyncingLibrary] = useState(false);
  const [cleaningLibrary, setCleaningLibrary] = useState(false);
  const [bookSearch, setBookSearch] = useState('');
  const [bookVisibilityFilter, setBookVisibilityFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const [restoringBackup, setRestoringBackup] = useState(false);

  const loadBooks = useCallback(async () => {
    const { data, error } = await supabase.from('books').select('*').order('sort_order', { ascending: true });
    if (error) return;
    const loadedBooks = (data || []) as Book[];
    setBooks(loadedBooks);
    setSelectedBookId((current) => current && loadedBooks.some((book) => book.id === current) ? current : loadedBooks[0]?.id || null);
  }, []);

  const loadPages = useCallback(async (bookId: string | null) => {
    if (!bookId) { setPages([]); return; }
    const { data } = await supabase.from('book_pages').select('*').eq('book_id', bookId).order('sort_order', { ascending: true });
    setPages((data || []) as BookPage[]);
  }, []);

  const loadBookContent = useCallback(async (bookId: string | null) => {
    if (!bookId) { setChapters([]); setArticles([]); return; }
    const [{ data: chapterData }, { data: articleData }] = await Promise.all([
      supabase.from('constitution_chapters').select('*').eq('book_id', bookId).order('sort_order', { ascending: true }),
      supabase.from('constitution_articles').select('*').eq('book_id', bookId).order('sort_order', { ascending: true }),
    ]);
    setChapters((chapterData || []) as ConstitutionChapter[]);
    setArticles((articleData || []) as ConstitutionArticle[]);
  }, []);

  useEffect(() => { void loadBooks(); }, [loadBooks]);
  useEffect(() => { void loadPages(selectedBookId); void loadBookContent(selectedBookId); }, [selectedBookId, loadPages, loadBookContent]);

  async function removeBook(book: Book) {
    if (!window.confirm(`هل تريد حذف الكتاب «${book.title}» وكل محتواه؟`)) return;
    await supabase.from('books').delete().eq('id', book.id);
    setPreviewBook(null);
    await loadBooks();
  }

  async function removePage(page: BookPage) {
    if (!window.confirm(`هل تريد حذف الصفحة «${page.title}»؟`)) return;
    await supabase.from('book_pages').delete().eq('id', page.id);
    await loadPages(selectedBookId);
  }

  async function removeChapter(chapter: ConstitutionChapter) {
    if (!window.confirm(`هل تريد حذف القسم «${chapter.title}»؟`)) return;
    await supabase.from('constitution_chapters').delete().eq('id', chapter.id);
    await loadBookContent(selectedBookId);
  }

  async function removeArticle(article: ConstitutionArticle) {
    if (!window.confirm(`هل تريد حذف العنصر «${article.title}»؟`)) return;
    await supabase.from('constitution_articles').delete().eq('id', article.id);
    await loadBookContent(selectedBookId);
  }

  async function toggleVisible(book: Book) {
    await supabase.from('books').update({ is_visible: !book.is_visible }).eq('id', book.id);
    await loadBooks();
  }

  async function toggleChapterVisible(chapter: ConstitutionChapter) {
    await supabase.from('constitution_chapters').update({ is_visible: !chapter.is_visible }).eq('id', chapter.id);
    await loadBookContent(selectedBookId);
  }

  async function toggleArticleVisible(article: ConstitutionArticle) {
    await supabase.from('constitution_articles').update({ is_visible: !article.is_visible }).eq('id', article.id);
    await loadBookContent(selectedBookId);
  }

  async function openPreviewBook(book: Book) {
    setPreviewBook(book);
    const { data } = await supabase.from('book_pages').select('*').eq('book_id', book.id).order('sort_order', { ascending: true });
    setPreviewPages((data || []) as BookPage[]);
  }

  async function prepareImportForAllBooks() {
    setSyncingLibrary(true);
    try {
      const { data: currentRows, error: currentError } = await supabase.from('books').select('*').order('sort_order', { ascending: true });
      if (currentError) throw currentError;
      const currentBooks = (currentRows || []) as Book[];
      const existingTitles = currentBooks.map((book) => normalizeBookTitle(book.title));
      const missing = LIBRARY_CATALOG.filter((item) => !item.aliases.some((alias) => existingTitles.includes(normalizeBookTitle(alias))));
      if (missing.length) {
        const highestSortOrder = currentBooks.reduce((max, book) => Math.max(max, Number(book.sort_order) || 0), -1);
        const { error: insertError } = await supabase.from('books').insert(missing.map((item, index) => ({
          title: item.title,
          description: item.description,
          cover_image_url: item.cover,
          icon: 'BookOpen',
          is_visible: true,
          sort_order: highestSortOrder + index + 1,
        })));
        if (insertError) throw insertError;
      }
      const { data: refreshed, error: refreshError } = await supabase.from('books').select('*').order('sort_order', { ascending: true });
      if (refreshError) throw refreshError;
      const nextBooks = (refreshed || []) as Book[];
      setBooks(nextBooks);
      setSelectedBookId((current) => current && nextBooks.some((book) => book.id === current) ? current : nextBooks[0]?.id || null);
      setShowImportModal(true);
    } catch (error) {
      alert(`تعذر تجهيز قائمة الاستيراد: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
    } finally {
      setSyncingLibrary(false);
    }
  }

  function exportSelectedBook() {
    if (!selectedBook) return;
    const selectedChapters = chapters.filter((chapter) => chapter.book_id === selectedBook.id);
    const selectedArticles = articles.filter((article) => article.book_id === selectedBook.id);
    const blocks = selectedChapters.map((chapter) => {
      const chapterItems = selectedArticles
        .filter((article) => article.chapter_id === chapter.id)
        .sort((a, b) => Number(a.sort_order) - Number(b.sort_order))
        .map((article) => `${article.title}
${article.content}`.trim())
        .join('\n\n');
      return `${chapter.title}
${chapter.description || ''}

${chapterItems}`.trim();
    });
    const pageBlocks = pages.map((page) => `${page.title}
${page.content || ''}`.trim());
    const content = [`${selectedBook.title}
${selectedBook.description || ''}`.trim(), ...pageBlocks, ...blocks].filter(Boolean).join('\n\n====================\n\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${selectedBook.title.replace(/[\/:*?"<>|]/g, '-')}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function ensureLibraryBooks() {
    setSyncingLibrary(true);
    try {
      const existingTitles = books.map((book) => normalizeBookTitle(book.title));
      const missing = LIBRARY_CATALOG.filter((item) => !item.aliases.some((alias) => existingTitles.includes(normalizeBookTitle(alias))));
      if (!missing.length) {
        alert('جميع كتب المكتبة الأساسية موجودة بالفعل.');
        return;
      }
      const highestSortOrder = books.reduce((max, book) => Math.max(max, Number(book.sort_order) || 0), -1);
      const rows = missing.map((item, index) => ({
        title: item.title,
        description: item.description,
        cover_image_url: item.cover,
        icon: 'BookOpen',
        is_visible: true,
        sort_order: highestSortOrder + index + 1,
      }));
      const { error } = await supabase.from('books').insert(rows);
      if (error) throw error;
      await loadBooks();
    } catch (error) {
      alert(`تعذر تجهيز الكتب: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
    } finally {
      setSyncingLibrary(false);
    }
  }

  async function cleanDuplicateLibraryBooks() {
    const catalogForTitle = (title: string) => {
      const normalized = normalizeBookTitle(title);
      if (normalized === normalizeBookTitle('عقوبات الدستور')) return LIBRARY_CATALOG.find((item) => item.key === 'penalties') || null;
      return LIBRARY_CATALOG.find((item) => item.aliases.some((alias) => normalizeBookTitle(alias) === normalized)) || null;
    };

    const groups = new Map<string, Book[]>();
    for (const book of books) {
      const catalog = catalogForTitle(book.title);
      const groupKey = catalog ? `catalog:${catalog.key}` : `custom:${normalizeBookTitle(book.title)}`;
      groups.set(groupKey, [...(groups.get(groupKey) || []), book]);
    }

    const duplicateGroups = [...groups.entries()].filter(([, group]) => group.length > 1 || group.some((book) => normalizeBookTitle(book.title) === normalizeBookTitle('عقوبات الدستور')));
    if (!duplicateGroups.length) {
      alert('لا توجد كتب مكررة تحتاج إلى تنظيف.');
      return;
    }

    const duplicatesCount = duplicateGroups.reduce((sum, [, group]) => sum + Math.max(0, group.length - 1), 0);
    if (!window.confirm(`سيتم دمج محتوى ${duplicatesCount || 1} كتاب مكرر وحذف النسخ الزائدة. لن يتم حذف الصفحات أو المواد. هل تريد المتابعة؟`)) return;

    setCleaningLibrary(true);
    try {
      for (const [groupKey, group] of duplicateGroups) {
        const catalogKey = groupKey.startsWith('catalog:') ? groupKey.slice('catalog:'.length) : '';
        const catalog = LIBRARY_CATALOG.find((item) => item.key === catalogKey);
        const sorted = [...group].sort((a, b) => {
          const aExact = catalog && normalizeBookTitle(a.title) === normalizeBookTitle(catalog.title) ? 1 : 0;
          const bExact = catalog && normalizeBookTitle(b.title) === normalizeBookTitle(catalog.title) ? 1 : 0;
          return bExact - aExact || Number(a.sort_order) - Number(b.sort_order);
        });
        let canonical = sorted[0];

        if (catalog && normalizeBookTitle(canonical.title) === normalizeBookTitle('عقوبات الدستور')) {
          const { data: created, error } = await supabase.from('books').insert({
            title: catalog.title,
            description: catalog.description,
            cover_image_url: catalog.cover,
            icon: 'BookOpen',
            is_visible: true,
            sort_order: canonical.sort_order,
          }).select('*').single();
          if (error || !created) throw error || new Error('تعذر إنشاء الكتاب الأساسي');
          canonical = created as Book;
        } else if (catalog && normalizeBookTitle(canonical.title) !== normalizeBookTitle(catalog.title)) {
          await supabase.from('books').update({
            title: catalog.title,
            description: canonical.description || catalog.description,
            cover_image_url: canonical.cover_image_url || catalog.cover,
          }).eq('id', canonical.id);
        }

        const duplicates = sorted.filter((book) => book.id !== canonical.id);
        for (const duplicate of duplicates) {
          const [{ data: pageRows }, { data: chapterRows }, { data: articleRows }] = await Promise.all([
            supabase.from('book_pages').select('id, sort_order').eq('book_id', duplicate.id).order('sort_order'),
            supabase.from('constitution_chapters').select('id, sort_order').eq('book_id', duplicate.id).order('sort_order'),
            supabase.from('constitution_articles').select('id, sort_order').eq('book_id', duplicate.id).order('sort_order'),
          ]);

          const [{ data: lastPage }, { data: lastChapter }, { data: lastArticle }] = await Promise.all([
            supabase.from('book_pages').select('sort_order').eq('book_id', canonical.id).order('sort_order', { ascending: false }).limit(1).maybeSingle(),
            supabase.from('constitution_chapters').select('sort_order').eq('book_id', canonical.id).order('sort_order', { ascending: false }).limit(1).maybeSingle(),
            supabase.from('constitution_articles').select('sort_order').eq('book_id', canonical.id).order('sort_order', { ascending: false }).limit(1).maybeSingle(),
          ]);

          const pageOffset = lastPage ? Number(lastPage.sort_order) + 1 : 0;
          const chapterOffset = lastChapter ? Number(lastChapter.sort_order) + 1 : 0;
          const articleOffset = lastArticle ? Number(lastArticle.sort_order) + 1 : 0;

          for (let i = 0; i < (pageRows || []).length; i += 1) await supabase.from('book_pages').update({ book_id: canonical.id, sort_order: pageOffset + i }).eq('id', pageRows![i].id);
          for (let i = 0; i < (chapterRows || []).length; i += 1) await supabase.from('constitution_chapters').update({ book_id: canonical.id, sort_order: chapterOffset + i }).eq('id', chapterRows![i].id);
          for (let i = 0; i < (articleRows || []).length; i += 1) await supabase.from('constitution_articles').update({ book_id: canonical.id, sort_order: articleOffset + i }).eq('id', articleRows![i].id);
          await supabase.from('books').delete().eq('id', duplicate.id);
        }
      }
      await loadBooks();
      alert('تم تنظيف الكتب المكررة ودمج محتواها بنجاح.');
    } catch (error) {
      alert(`تعذر تنظيف الكتب: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
    } finally {
      setCleaningLibrary(false);
    }
  }



  async function duplicateBook(book: Book) {
    if (!window.confirm(`إنشاء نسخة من الكتاب «${book.title}» مع جميع صفحاته ومحتواه؟`)) return;
    try {
      const [{ data: pageRows, error: pageError }, { data: chapterRows, error: chapterError }, { data: articleRows, error: articleError }] = await Promise.all([
        supabase.from('book_pages').select('*').eq('book_id', book.id).order('sort_order', { ascending: true }),
        supabase.from('constitution_chapters').select('*').eq('book_id', book.id).order('sort_order', { ascending: true }),
        supabase.from('constitution_articles').select('*').eq('book_id', book.id).order('sort_order', { ascending: true }),
      ]);
      const firstError = pageError || chapterError || articleError;
      if (firstError) throw firstError;

      const highestOrder = books.reduce((max, current) => Math.max(max, Number(current.sort_order) || 0), -1);
      const { data: createdBook, error: createError } = await supabase.from('books').insert({
        title: `${book.title} - نسخة`,
        description: book.description || '',
        cover_image_url: book.cover_image_url || '',
        icon: book.icon || 'BookOpen',
        is_visible: false,
        sort_order: highestOrder + 1,
      }).select('*').single();
      if (createError || !createdBook) throw createError || new Error('تعذر إنشاء نسخة الكتاب');

      if ((pageRows || []).length) {
        const { error } = await supabase.from('book_pages').insert((pageRows || []).map((page) => ({
          book_id: createdBook.id,
          title: page.title,
          content: page.content,
          image_url: page.image_url,
          page_number: page.page_number,
          sort_order: page.sort_order,
        })));
        if (error) throw error;
      }

      const chapterIdMap = new Map<string, string>();
      for (const chapter of chapterRows || []) {
        const { data: createdChapter, error } = await supabase.from('constitution_chapters').insert({
          book_id: createdBook.id,
          title: chapter.title,
          description: chapter.description,
          sort_order: chapter.sort_order,
          is_visible: chapter.is_visible,
        }).select('*').single();
        if (error || !createdChapter) throw error || new Error('تعذر نسخ قسم');
        chapterIdMap.set(chapter.id, createdChapter.id);
      }

      if ((articleRows || []).length) {
        const rows = (articleRows || [])
          .filter((article) => chapterIdMap.has(article.chapter_id))
          .map((article) => ({
            book_id: createdBook.id,
            chapter_id: chapterIdMap.get(article.chapter_id),
            article_number: article.article_number,
            title: article.title,
            content: article.content,
            sort_order: article.sort_order,
            is_visible: article.is_visible,
          }));
        if (rows.length) {
          const { error } = await supabase.from('constitution_articles').insert(rows);
          if (error) throw error;
        }
      }

      await loadBooks();
      setSelectedBookId(createdBook.id);
      alert('تم إنشاء نسخة مخفية من الكتاب بنجاح.');
    } catch (error) {
      alert(`تعذر نسخ الكتاب: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
    }
  }

  async function restoreLibraryBackup(file: File) {
    setRestoringBackup(true);
    try {
      const raw = await file.text();
      const payload = JSON.parse(raw) as {
        books?: Book[];
        book_pages?: BookPage[];
        constitution_chapters?: ConstitutionChapter[];
        constitution_articles?: ConstitutionArticle[];
      };
      if (!Array.isArray(payload.books)) throw new Error('ملف النسخة الاحتياطية غير صالح.');
      if (!window.confirm(`سيتم استبدال المكتبة الحالية واستعادة ${payload.books.length} كتاب. هل تريد المتابعة؟`)) return;

      const { error: deleteBooksError } = await supabase.from('books').delete().not('id', 'is', null);
      if (deleteBooksError) throw deleteBooksError;

      const bookIdMap = new Map<string, string>();
      const chapterIdMap = new Map<string, string>();

      for (const book of payload.books) {
        const { data: createdBook, error } = await supabase.from('books').insert({
          title: book.title,
          description: book.description || '',
          cover_image_url: book.cover_image_url || '',
          icon: book.icon || 'BookOpen',
          is_visible: book.is_visible ?? true,
          sort_order: book.sort_order ?? 0,
        }).select('*').single();
        if (error || !createdBook) throw error || new Error('تعذر استعادة كتاب');
        bookIdMap.set(book.id, createdBook.id);
      }

      const pageRows = (payload.book_pages || [])
        .filter((page) => bookIdMap.has(page.book_id))
        .map((page) => ({
          book_id: bookIdMap.get(page.book_id),
          title: page.title,
          content: page.content,
          image_url: page.image_url,
          page_number: page.page_number,
          sort_order: page.sort_order,
        }));
      if (pageRows.length) {
        const { error } = await supabase.from('book_pages').insert(pageRows);
        if (error) throw error;
      }

      for (const chapter of payload.constitution_chapters || []) {
        const mappedBookId = bookIdMap.get(chapter.book_id);
        if (!mappedBookId) continue;
        const { data: createdChapter, error } = await supabase.from('constitution_chapters').insert({
          book_id: mappedBookId,
          title: chapter.title,
          description: chapter.description || '',
          sort_order: chapter.sort_order,
          is_visible: chapter.is_visible ?? true,
        }).select('*').single();
        if (error || !createdChapter) throw error || new Error('تعذر استعادة قسم');
        chapterIdMap.set(chapter.id, createdChapter.id);
      }

      const articleRows = (payload.constitution_articles || [])
        .filter((article) => bookIdMap.has(article.book_id) && chapterIdMap.has(article.chapter_id))
        .map((article) => ({
          book_id: bookIdMap.get(article.book_id),
          chapter_id: chapterIdMap.get(article.chapter_id),
          article_number: article.article_number,
          title: article.title,
          content: article.content,
          sort_order: article.sort_order,
          is_visible: article.is_visible ?? true,
        }));
      if (articleRows.length) {
        const { error } = await supabase.from('constitution_articles').insert(articleRows);
        if (error) throw error;
      }

      await loadBooks();
      alert('تمت استعادة المكتبة بنجاح.');
    } catch (error) {
      alert(`تعذر استعادة النسخة الاحتياطية: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
    } finally {
      setRestoringBackup(false);
    }
  }

  async function moveBook(book: Book, direction: -1 | 1) {
    const ordered = [...books].sort((a, b) => Number(a.sort_order) - Number(b.sort_order));
    const index = ordered.findIndex((item) => item.id === book.id);
    const targetIndex = index + direction;
    if (index < 0 || targetIndex < 0 || targetIndex >= ordered.length) return;
    const target = ordered[targetIndex];
    const currentOrder = Number(book.sort_order) || index;
    const targetOrder = Number(target.sort_order) || targetIndex;
    await Promise.all([
      supabase.from('books').update({ sort_order: targetOrder }).eq('id', book.id),
      supabase.from('books').update({ sort_order: currentOrder }).eq('id', target.id),
    ]);
    await loadBooks();
  }

  async function exportLibraryBackup() {
    try {
      const [{ data: bookRows, error: bookError }, { data: pageRows, error: pageError }, { data: chapterRows, error: chapterError }, { data: articleRows, error: articleError }] = await Promise.all([
        supabase.from('books').select('*').order('sort_order', { ascending: true }),
        supabase.from('book_pages').select('*').order('sort_order', { ascending: true }),
        supabase.from('constitution_chapters').select('*').order('sort_order', { ascending: true }),
        supabase.from('constitution_articles').select('*').order('sort_order', { ascending: true }),
      ]);
      const firstError = bookError || pageError || chapterError || articleError;
      if (firstError) throw firstError;
      const payload = {
        exported_at: new Date().toISOString(),
        books: bookRows || [],
        book_pages: pageRows || [],
        constitution_chapters: chapterRows || [],
        constitution_articles: articleRows || [],
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `sandy-library-backup-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert(`تعذر تصدير النسخة الاحتياطية: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
    }
  }

  const normalizedBookSearch = bookSearch.trim().toLowerCase();
  const filteredBooks = books.filter((book) => {
    const matchesSearch = !normalizedBookSearch
      || `${book.title} ${book.description || ''}`.toLowerCase().includes(normalizedBookSearch);
    const matchesVisibility = bookVisibilityFilter === 'all'
      || (bookVisibilityFilter === 'visible' ? book.is_visible : !book.is_visible);
    return matchesSearch && matchesVisibility;
  });

  const selectedBook = books.find((book) => book.id === selectedBookId) || null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">إدارة المكتبة والكتب</h2>
          <p className="mt-1 text-sm text-gray-500">كل كتاب مستقل بمحتواه، ويمكنك اختيار أي كتاب للاستيراد إليه.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => void exportLibraryBackup()} disabled={books.length === 0} className="flex items-center gap-2 rounded-lg border border-sky-500/20 bg-sky-500/10 px-4 py-2.5 font-semibold text-sky-300 transition-colors hover:bg-sky-500/20 disabled:opacity-40">
            <Download className="h-4 w-4" /> نسخة احتياطية
          </button>
          <label className={`flex cursor-pointer items-center gap-2 rounded-lg border border-violet-500/20 bg-violet-500/10 px-4 py-2.5 font-semibold text-violet-300 transition-colors hover:bg-violet-500/20 ${restoringBackup ? 'pointer-events-none opacity-40' : ''}`}>
            <Upload className="h-4 w-4" /> {restoringBackup ? 'جاري الاستعادة...' : 'استعادة نسخة'}
            <input
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void restoreLibraryBackup(file);
                event.currentTarget.value = '';
              }}
            />
          </label>
          <button onClick={() => void cleanDuplicateLibraryBooks()} disabled={cleaningLibrary || books.length === 0} className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 font-semibold text-red-300 transition-colors hover:bg-red-500/20 disabled:opacity-40">
            <Trash2 className="h-4 w-4" /> {cleaningLibrary ? 'جاري التنظيف...' : 'تنظيف التكرار'}
          </button>
          <button onClick={() => void ensureLibraryBooks()} disabled={syncingLibrary} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 font-semibold text-gray-200 transition-colors hover:bg-white/10 disabled:opacity-40">
            <RefreshCw className={`h-4 w-4 ${syncingLibrary ? 'animate-spin' : ''}`} /> تجهيز كتب المكتبة
          </button>
          <button onClick={() => void prepareImportForAllBooks()} disabled={syncingLibrary} className="flex items-center gap-2 rounded-lg border border-amber-500/25 bg-amber-500/10 px-4 py-2.5 font-semibold text-amber-400 transition-colors hover:bg-amber-500/20 disabled:opacity-40">
            <Upload className="h-4 w-4" /> استيراد محتوى
          </button>
          <button onClick={() => { setEditingBook(null); setShowBookModal(true); }} className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 font-semibold text-black transition-colors hover:bg-amber-600">
            <Plus className="h-4 w-4" /> كتاب جديد
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-1">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                value={bookSearch}
                onChange={(event) => setBookSearch(event.target.value)}
                placeholder="ابحث في الكتب..."
                className="input pr-10"
              />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {([
                ['all', 'الكل'],
                ['visible', 'الظاهرة'],
                ['hidden', 'المخفية'],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setBookVisibilityFilter(value)}
                  className={`rounded-lg px-2 py-2 text-xs transition-colors ${
                    bookVisibilityFilter === value
                      ? 'bg-amber-500 text-black'
                      : 'border border-white/10 bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
              <span>{filteredBooks.length} من {books.length} كتاب</span>
              <span>{books.filter((book) => book.is_visible).length} ظاهر</span>
            </div>
          </div>
          {filteredBooks.map((book) => (
            <div key={book.id} className={`rounded-2xl border p-4 transition-all ${selectedBook?.id === book.id ? 'border-amber-500/40 bg-amber-500/10' : 'border-white/10 bg-white/[0.02]'}`}>
              <button onClick={() => setSelectedBookId(book.id)} className="flex w-full items-start gap-3 text-right">
                <div className="h-16 w-12 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black/30">
                  {book.cover_image_url ? <img src={book.cover_image_url} alt={book.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><BookOpen className="h-5 w-5 text-amber-500" /></div>}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-white">{book.title}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-gray-500">{book.description || 'كتاب من مكتبة مدينة ساندي'}</p>
                </div>
              </button>
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={() => void duplicateBook(book)} title="نسخ الكتاب" className="rounded-lg px-2 py-1.5 text-xs text-gray-400 hover:bg-white/10">نسخ</button>
                <button onClick={() => void moveBook(book, -1)} title="تحريك للأعلى" aria-label={`تحريك ${book.title} للأعلى`} className="rounded-lg px-2 py-1.5 text-xs text-gray-400 hover:bg-white/10">↑</button>
                <button onClick={() => void moveBook(book, 1)} title="تحريك للأسفل" aria-label={`تحريك ${book.title} للأسفل`} className="rounded-lg px-2 py-1.5 text-xs text-gray-400 hover:bg-white/10">↓</button>
                <button onClick={() => { setEditingBook(book); setShowBookModal(true); }} className="rounded-lg p-2 text-gray-400 hover:bg-white/10"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => toggleVisible(book)} className="rounded-lg px-3 py-1.5 text-xs text-gray-300 hover:bg-white/10">{book.is_visible ? 'إخفاء' : 'إظهار'}</button>
                <button onClick={() => openPreviewBook(book)} className="rounded-lg px-3 py-1.5 text-xs text-gray-300 hover:bg-white/10">معاينة</button>
                <button onClick={() => removeBook(book)} className="rounded-lg p-2 text-red-400 hover:bg-red-500/20"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
          {books.length === 0 && <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-gray-500">أنشئ أول كتاب للبدء</div>}
          {books.length > 0 && filteredBooks.length === 0 && <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-gray-500">لا توجد كتب مطابقة للبحث أو الفلتر.</div>}
        </div>

        <div className="space-y-6 lg:col-span-2">
          {selectedBook ? (
            <>
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-white">{selectedBook.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">صفحات خاصة، ثم أقسام وعناصر منظمة داخل الكتاب.</p>
                  </div>
                  <button onClick={exportSelectedBook} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300 hover:bg-white/10">
                    <Download className="h-4 w-4" /> تصدير نص
                  </button>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => { setEditingPage(null); setShowPageModal(true); }} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200"><Plus className="h-4 w-4" /> صفحة</button>
                    <button onClick={() => { setEditingChapter(null); setShowChapterModal(true); }} className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-400"><Plus className="h-4 w-4" /> قسم</button>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {pages.map((page) => (
                    <div key={page.id} className="flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-black/20 p-4">
                      <div><h4 className="font-semibold text-white">{page.title}</h4><p className="mt-1 line-clamp-2 text-sm text-gray-500">{page.content}</p></div>
                      <div className="flex gap-1"><button onClick={() => { setEditingPage(page); setShowPageModal(true); }} className="rounded-lg p-2 text-gray-400 hover:bg-white/10"><Pencil className="h-4 w-4" /></button><button onClick={() => removePage(page)} className="rounded-lg p-2 text-red-400 hover:bg-red-500/20"><Trash2 className="h-4 w-4" /></button></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                <h3 className="font-bold text-white">الأقسام والمحتوى</h3>
                <div className="mt-4 space-y-4">
                  {chapters.map((chapter) => (
                    <div key={chapter.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div><h4 className="font-bold text-white">{chapter.title}</h4>{chapter.description && <p className="mt-1 text-sm text-gray-500">{chapter.description}</p>}</div>
                        <div className="flex gap-1">
                          <button onClick={() => toggleChapterVisible(chapter)} className="rounded-lg px-3 py-1.5 text-xs text-gray-300 hover:bg-white/10">{chapter.is_visible ? 'إخفاء' : 'إظهار'}</button>
                          <button onClick={() => { setEditingChapter(chapter); setShowChapterModal(true); }} className="rounded-lg p-2 text-gray-400 hover:bg-white/10"><Pencil className="h-4 w-4" /></button>
                          <button onClick={() => removeChapter(chapter)} className="rounded-lg p-2 text-red-400 hover:bg-red-500/20"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        {articles.filter((article) => article.chapter_id === chapter.id).map((article) => (
                          <div key={article.id} className="flex items-start justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-3">
                            <div><div className="flex items-center gap-2"><span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-400">{article.article_number}</span><h5 className="font-semibold text-gray-200">{article.title}</h5></div><p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm text-gray-500">{article.content}</p></div>
                            <div className="flex gap-1"><button onClick={() => toggleArticleVisible(article)} className="rounded-lg px-2 py-1 text-xs text-gray-400">{article.is_visible ? 'إخفاء' : 'إظهار'}</button><button onClick={() => { setEditingArticle(article); setShowArticleModal(true); }} className="rounded-lg p-2 text-gray-400 hover:bg-white/10"><Pencil className="h-4 w-4" /></button><button onClick={() => removeArticle(article)} className="rounded-lg p-2 text-red-400 hover:bg-red-500/20"><Trash2 className="h-4 w-4" /></button></div>
                          </div>
                        ))}
                        <button onClick={() => { setEditingArticle(null); setShowArticleModal(true); }} className="flex items-center gap-2 rounded-lg border border-dashed border-white/10 px-3 py-2 text-sm text-gray-400 hover:border-amber-500/30 hover:text-amber-400"><Plus className="h-4 w-4" /> إضافة عنصر</button>
                      </div>
                    </div>
                  ))}
                  {chapters.length === 0 && <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-gray-500">لا يوجد محتوى بعد. استخدم الاستيراد أو أنشئ قسمًا.</div>}
                </div>
              </div>
            </>
          ) : <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-gray-500">اختر كتابًا</div>}

          {previewBook && <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5"><div className="mb-4 flex justify-between"><h3 className="font-bold text-white">معاينة: {previewBook.title}</h3><button onClick={() => setPreviewBook(null)} className="rounded-lg bg-white/10 px-3 py-2 text-sm text-gray-300">إغلاق</button></div><BookReader book={previewBook} pages={previewPages} chapters={chapters.filter((chapter) => chapter.book_id === previewBook.id)} articles={articles.filter((article) => article.book_id === previewBook.id)} loading={false} /></div>}
        </div>
      </div>

      {showImportModal && <BookImportModal books={books} defaultBookId={selectedBookId} onClose={() => setShowImportModal(false)} onImported={async (bookId) => { setShowImportModal(false); setSelectedBookId(bookId); await loadPages(bookId); await loadBookContent(bookId); }} />}
      {showBookModal && <BookModal book={editingBook} onClose={() => { setShowBookModal(false); setEditingBook(null); }} onSaved={async () => { setShowBookModal(false); setEditingBook(null); await loadBooks(); }} />}
      {showPageModal && selectedBook && <PageModal book={selectedBook} page={editingPage} onClose={() => { setShowPageModal(false); setEditingPage(null); }} onSaved={async () => { setShowPageModal(false); setEditingPage(null); await loadPages(selectedBookId); }} />}
      {showChapterModal && selectedBook && <ChapterModal book={selectedBook} chapter={editingChapter} onClose={() => { setShowChapterModal(false); setEditingChapter(null); }} onSaved={async () => { setShowChapterModal(false); setEditingChapter(null); await loadBookContent(selectedBookId); }} />}
      {showArticleModal && selectedBook && <ArticleModal book={selectedBook} article={editingArticle} chapterId={editingArticle?.chapter_id || null} onClose={() => { setShowArticleModal(false); setEditingArticle(null); }} onSaved={async () => { setShowArticleModal(false); setEditingArticle(null); await loadBookContent(selectedBookId); }} />}
    </div>
  );
}

function BookImportModal({ books, defaultBookId, onClose, onImported }: { books: Book[]; defaultBookId: string | null; onClose: () => void; onImported: (bookId: string) => Promise<void> }) {
  const [bookId, setBookId] = useState(defaultBookId || books[0]?.id || '');
  const [rawText, setRawText] = useState('');
  const [replaceExisting, setReplaceExisting] = useState(true);
  const [importing, setImporting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const parsed = parseImportedBookContent(rawText);
  const itemCount = parsed.reduce((sum, section) => sum + section.items.length, 0);
  const emptyItemCount = parsed.reduce((sum, section) => sum + section.items.filter((item) => !item.content.trim()).length, 0);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty || importing) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, importing]);

  function requestClose() {
    if (isDirty && !importing && !window.confirm('يوجد محتوى لم يتم استيراده. هل تريد إغلاق النافذة؟')) return;
    onClose();
  }

  async function runImport() {
    if (!bookId || !rawText.trim() || parsed.length === 0) return;
    if (!window.confirm(`سيتم استيراد ${parsed.length} قسم و${itemCount} عنصر إلى الكتاب المختار. هل تريد المتابعة؟`)) return;
    setImporting(true);
    try {
      if (replaceExisting) {
        await supabase.from('constitution_articles').delete().eq('book_id', bookId);
        await supabase.from('constitution_chapters').delete().eq('book_id', bookId);
      }

      let sectionOffset = 0;
      if (!replaceExisting) {
        const { data } = await supabase.from('constitution_chapters').select('sort_order').eq('book_id', bookId).order('sort_order', { ascending: false }).limit(1).maybeSingle();
        sectionOffset = data ? Number(data.sort_order) + 1 : 0;
      }

      for (let sectionIndex = 0; sectionIndex < parsed.length; sectionIndex += 1) {
        const section = parsed[sectionIndex];
        const { data: insertedChapter, error: chapterError } = await supabase.from('constitution_chapters').insert({
          book_id: bookId,
          title: section.title,
          description: section.description,
          sort_order: sectionOffset + sectionIndex,
          is_visible: true,
        }).select('*').single();
        if (chapterError || !insertedChapter) throw chapterError || new Error('تعذر إنشاء القسم');

        if (section.items.length) {
          const rows = section.items.map((item, itemIndex) => ({
            book_id: bookId,
            chapter_id: insertedChapter.id,
            article_number: item.number,
            title: item.title,
            content: item.content,
            sort_order: itemIndex,
            is_visible: true,
          }));
          const { error: articleError } = await supabase.from('constitution_articles').insert(rows);
          if (articleError) throw articleError;
        }
      }
      setIsDirty(false);
      await onImported(bookId);
    } catch (error) {
      alert(`تعذر الاستيراد: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
    } finally {
      setImporting(false);
    }
  }

  return (
    <Modal title="استيراد محتوى إلى كتاب" onClose={requestClose}>
      <div className="space-y-4">
        <Field label="اختر الكتاب">
          <select value={bookId} onChange={(event) => setBookId(event.target.value)} className="input">
            {books.map((book) => <option key={book.id} value={book.id}>{book.title}</option>)}
          </select>
        </Field>
        <Field label="المحتوى" hint="يدعم الباب، الفصل، القسم، المادة، القاعدة، العقوبة، البند والإجراء">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <label className="cursor-pointer rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300 hover:bg-white/10">
              رفع ملف TXT
              <input
                type="file"
                accept=".txt,text/plain"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    setRawText(String(reader.result || ''));
                    setIsDirty(true);
                  };
                  reader.readAsText(file, 'utf-8');
                  event.currentTarget.value = '';
                }}
              />
            </label>
            {rawText && (
              <button onClick={() => { setRawText(''); setIsDirty(false); }} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-400 hover:text-white">
                مسح النص
              </button>
            )}
          </div>
          <textarea value={rawText} onChange={(event) => { setRawText(event.target.value); setIsDirty(true); }} className="input min-h-[260px] resize-y" placeholder={'الباب الأول: الأحكام العامة\n\nالمادة (1): عنوان المادة\nنص المادة...'} />
        </Field>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-amber-500/15 bg-amber-500/5 p-3"><input type="checkbox" checked={replaceExisting} onChange={(event) => setReplaceExisting(event.target.checked)} className="h-4 w-4 accent-amber-500" /><span className="text-sm text-gray-300">استبدال محتوى الكتاب الحالي بالكامل قبل الاستيراد</span></label>
        <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-gray-400">
          سيتم الاستيراد إلى <strong className="text-amber-300">{books.find((book) => book.id === bookId)?.title || 'الكتاب المختار'}</strong>. تم اكتشاف <strong className="text-white">{parsed.length}</strong> قسم و<strong className="text-white">{itemCount}</strong> عنصر.
          {rawText.trim() && parsed.length === 0 && (
            <div className="mt-2 text-red-300">لم يتعرف النظام على بنية المحتوى. استخدم عناوين مثل «الباب الأول» ثم «المادة (1)».</div>
          )}
        </div>
        {emptyItemCount > 0 && (
          <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
            يوجد {emptyItemCount} عنصر بدون نص. يمكنك الاستيراد، لكن يفضل مراجعة المحتوى أولًا.
          </div>
        )}
        {parsed.length > 0 && (
          <div className="max-h-44 space-y-2 overflow-y-auto rounded-xl border border-white/10 bg-white/[0.02] p-3">
            {parsed.map((section, index) => (
              <div key={`${section.title}-${index}`} className="flex items-center justify-between gap-3 rounded-lg bg-black/20 px-3 py-2 text-sm">
                <span className="text-gray-200">{section.title}</span>
                <span className="text-xs text-gray-500">{section.items.length} عنصر</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mt-6 flex gap-3"><button onClick={runImport} disabled={importing || !bookId || !rawText.trim() || parsed.length === 0} className="flex-1 rounded-lg bg-amber-500 px-4 py-2.5 font-semibold text-black hover:bg-amber-600 disabled:opacity-40">{importing ? 'جاري الاستيراد...' : 'استيراد وترتيب'}</button><button onClick={requestClose} disabled={importing} className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-gray-300 disabled:opacity-40">إلغاء</button></div>
    </Modal>
  );
}

function BookModal({ book, onClose, onSaved }: { book: Book | null; onClose: () => void; onSaved: () => Promise<void> }) {
  const [title, setTitle] = useState(book?.title || '');
  const [description, setDescription] = useState(book?.description || '');
  const [coverImageUrl, setCoverImageUrl] = useState(book?.cover_image_url || '');
  const [icon, setIcon] = useState(book?.icon || 'BookOpen');
  const [visible, setVisible] = useState(book?.is_visible ?? true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function uploadCover(file: File) {
    if (!file.type.startsWith('image/')) {
      alert('اختر ملف صورة صالح.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      alert('حجم الغلاف يجب ألا يتجاوز 8MB.');
      return;
    }
    setUploading(true);
    try {
      const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
      const path = `book-covers/${safeName}`;
      const { error } = await supabase.storage.from('site-media').upload(path, file, { upsert: false, contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage.from('site-media').getPublicUrl(path);
      setCoverImageUrl(data.publicUrl);
    } catch (error) {
      alert(`تعذر رفع الغلاف: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    const cleanedTitle = title.trim();
    if (!cleanedTitle) return;
    setSaving(true);
    try {
      const { data: existingRows, error: lookupError } = await supabase
        .from('books')
        .select('id,title');
      if (lookupError) throw lookupError;

      const normalizedRequested = normalizeBookTitle(cleanedTitle);
      const duplicate = (existingRows || []).find((row) =>
        row.id !== book?.id && normalizeBookTitle(row.title) === normalizedRequested,
      );
      if (duplicate) {
        alert(`يوجد كتاب آخر بنفس الاسم أو باسم مشابه: ${duplicate.title}`);
        return;
      }

      if (book) {
        const { error } = await supabase.from('books').update({
          title: cleanedTitle,
          description: description.trim(),
          cover_image_url: coverImageUrl.trim(),
          icon,
          is_visible: visible,
        }).eq('id', book.id);
        if (error) throw error;
      } else {
        const { data } = await supabase
          .from('books')
          .select('sort_order')
          .order('sort_order', { ascending: false })
          .limit(1)
          .maybeSingle();
        const { error } = await supabase.from('books').insert({
          title: cleanedTitle,
          description: description.trim(),
          cover_image_url: coverImageUrl.trim(),
          icon,
          is_visible: visible,
          sort_order: data ? Number(data.sort_order) + 1 : 0,
        });
        if (error) throw error;
      }
      await onSaved();
    } catch (error) {
      alert(`تعذر حفظ الكتاب: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={book ? 'تعديل الكتاب' : 'كتاب جديد'} onClose={onClose}>
      <div className="space-y-4">
        <Field label="عنوان الكتاب"><input value={title} onChange={(e) => setTitle(e.target.value)} className="input" placeholder="مثال: دستور مدينة ساندي" autoFocus /></Field>
        <Field label="الوصف"><textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input resize-y min-h-[120px]" placeholder="وصف مختصر" /></Field>
        <Field label="غلاف الكتاب" hint="ارفع صورة من جهازك أو استخدم رابطًا مباشرًا">
          <div className="space-y-3">
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-400 hover:bg-amber-500/15">
              <Upload className="h-4 w-4" /> {uploading ? 'جاري الرفع...' : 'اختيار صورة الغلاف'}
              <input type="file" accept="image/*" disabled={uploading} className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadCover(file); event.currentTarget.value = ''; }} />
            </label>
            <input value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} className="input" dir="ltr" placeholder="https://example.com/cover.jpg" />
            {coverImageUrl && (
              <img
                src={coverImageUrl}
                alt="معاينة الغلاف"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = '/library/constitution.jpg';
                }}
                className="mx-auto h-52 w-36 rounded-xl border border-white/10 object-cover"
              />
            )}
          </div>
        </Field>
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
  const [uploadingImage, setUploadingImage] = useState(false);

  async function uploadPageImage(file: File) {
    if (!file.type.startsWith('image/')) {
      alert('اختر ملف صورة صالح.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      alert('حجم الصورة يجب ألا يتجاوز 8MB.');
      return;
    }
    setUploadingImage(true);
    try {
      const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
      const path = `book-pages/${safeName}`;
      const { error } = await supabase.storage.from('site-media').upload(path, file, {
        upsert: false,
        contentType: file.type,
      });
      if (error) throw error;
      const { data } = supabase.storage.from('site-media').getPublicUrl(path);
      setImageUrl(data.publicUrl);
    } catch (error) {
      alert(`تعذر رفع صورة الصفحة: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
    } finally {
      setUploadingImage(false);
    }
  }

  async function save() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      if (page) {
        const { error } = await supabase.from('book_pages').update({
          title: title.trim(),
          content: content.trim(),
          image_url: imageUrl.trim(),
          page_number: Math.max(1, Number(pageNumber) || 1),
        }).eq('id', page.id);
        if (error) throw error;
      } else {
        const { data, error: orderError } = await supabase
          .from('book_pages')
          .select('sort_order')
          .eq('book_id', book.id)
          .order('sort_order', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (orderError) throw orderError;
        const { error } = await supabase.from('book_pages').insert({
          book_id: safeBookId,
          title: title.trim(),
          content: content.trim(),
          image_url: imageUrl.trim(),
          page_number: Math.max(1, Number(pageNumber) || 1),
          sort_order: data ? Number(data.sort_order) + 1 : 0,
        });
        if (error) throw error;
      }
      await onSaved();
    } catch (error) {
      alert(`تعذر حفظ الصفحة: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={page ? 'تعديل الصفحة' : 'صفحة جديدة'} onClose={onClose}>
      <div className="space-y-4">
        <Field label="عنوان الصفحة"><input value={title} onChange={(e) => setTitle(e.target.value)} className="input" placeholder="مثال: المقدمة" autoFocus /></Field>
        <Field label="رقم الصفحة"><input value={pageNumber} onChange={(e) => setPageNumber(Number(e.target.value) || 1)} type="number" min="1" className="input" /></Field>
        <Field label="المحتوى"><textarea value={content} onChange={(e) => setContent(e.target.value)} className="input resize-y min-h-[180px]" placeholder="اكتب نص الصفحة هنا..." /></Field>
        <Field label="صورة الصفحة" hint="اختيارية: ارفع صورة أو أدخل رابطًا مباشرًا">
          <div className="space-y-3">
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-400 hover:bg-amber-500/15">
              <Upload className="h-4 w-4" /> {uploadingImage ? 'جاري الرفع...' : 'اختيار صورة من الجهاز'}
              <input
                type="file"
                accept="image/*"
                disabled={uploadingImage}
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void uploadPageImage(file);
                  event.currentTarget.value = '';
                }}
              />
            </label>
            <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="input" dir="ltr" placeholder="https://example.com/page.jpg" />
            {imageUrl && (
              <img
                src={imageUrl}
                alt="معاينة صورة الصفحة"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = '/library/constitution.jpg';
                }}
                className="max-h-64 w-full rounded-xl border border-white/10 object-cover"
              />
            )}
          </div>
        </Field>
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
    try {
      if (chapter) {
        const { error } = await supabase.from('constitution_chapters').update({
          title: title.trim(),
          description: description.trim(),
          is_visible: visible,
        }).eq('id', chapter.id);
        if (error) throw error;
      } else {
        const { data, error: orderError } = await supabase
          .from('constitution_chapters')
          .select('sort_order')
          .eq('book_id', book.id)
          .order('sort_order', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (orderError) throw orderError;
        const { error } = await supabase.from('constitution_chapters').insert({
          book_id: safeBookId,
          title: title.trim(),
          description: description.trim(),
          sort_order: data ? Number(data.sort_order) + 1 : 0,
          is_visible: visible,
        });
        if (error) throw error;
      }
      await onSaved();
    } catch (error) {
      alert(`تعذر حفظ الفصل: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={chapter ? 'تعديل القسم' : 'قسم جديد'} onClose={onClose}>
      <div className="space-y-4">
        <Field label="عنوان القسم"><input value={title} onChange={(e) => setTitle(e.target.value)} className="input" placeholder="مثال: الأحكام العامة" autoFocus /></Field>
        <Field label="الوصف"><textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input resize-y min-h-[110px]" placeholder="وصف مختصر للقسم" /></Field>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} className="w-4 h-4 accent-amber-500" />
          <span className="text-sm text-gray-300">إظهار القسم في الموقع</span>
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
      const { error } = await supabase.from('constitution_articles').insert({ book_id: safeBookId, chapter_id: selectedChapterId, article_number: articleNumber, title: title.trim(), content: content.trim(), sort_order: data ? data.sort_order + 1 : 0, is_visible: visible });
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
        <Field label="شعار السيرفر (رابط صورة)" hint="ضع رابط صورة ليظهر كشعار في أعلى الموقع">
          <input value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} placeholder="https://example.com/logo.png" className="input" dir="ltr" />
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
