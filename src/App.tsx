import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import CategoryFilter, { type AvailabilityFilterType } from './components/CategoryFilter';
import WelcomeHeroBanner from './components/WelcomeHeroBanner';
import NewsletterSection from './components/NewsletterSection';
import Footer from './components/Footer';
import MasonryGrid from './components/MasonryGrid';
import ProductDrawer from './components/ProductDrawer';
import ImagePreloader from './components/ImagePreloader';
import BackToTop from './components/BackToTop';
import AdminDrawer from './components/AdminDrawer';
import SplashLoader from './components/SplashLoader';
import MaintenanceScreen from './components/MaintenanceScreen';
import { SiteControlsProvider, useSiteControls } from './context/SiteControlsContext';
import { trackEvent } from './lib/analytics';
import { useProducts } from './hooks/useProducts';
import { useWishlist } from './hooks/useWishlist';
import { productMatchesQuery } from './lib/search';
import { Heart, Loader2 } from 'lucide-react';
import type { Product, Language, Theme } from './types';

const ALL = 'All';

const CATEGORY_TRANSLATIONS: Record<string, { en: string; ar: string }> = {
  All: { en: 'All', ar: 'الكل' },
  Tailoring: { en: 'Tailoring', ar: 'الأزياء الرسمية' },
  Outerwear: { en: 'Outerwear', ar: 'المعاطف والسترات' },
  Knitwear: { en: 'Knitwear', ar: 'التريكو والصوف' },
  Footwear: { en: 'Footwear', ar: 'الأحذية' },
  Accessories: { en: 'Accessories', ar: 'الإكسسوارات' },
};

function MainApp() {
  const {
    setIsAdminOpen,
    siteSettings,
    isInitialSplashLoading,
    isPreviewSplash,
    setIsPreviewSplash,
    isPreviewMaintenance,
    setIsPreviewMaintenance,
    isAdminUnlocked,
    unlockAdmin,
  } = useSiteControls();
  const {
    products,
    loading,
    loadingMore,
    hasMore,
    totalProductsCount,
    error,
    isLiveDatabase,
    refresh,
    loadMore,
  } = useProducts();
  const { wishlist, wishlistCount, isWishlisted, toggleWishlist } = useWishlist();

  const loadMoreSentinelRef = useRef<HTMLDivElement>(null);

  // Once-only splash screen lock for session to prevent double-render flashes
  const [hasFinishedSplash, setHasFinishedSplash] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        return sessionStorage.getItem('vant_splash_shown_v1') === 'true';
      }
    } catch {}
    return false;
  });

  const handleSplashFinished = useCallback(() => {
    setHasFinishedSplash(true);
    try {
      sessionStorage.setItem('vant_splash_shown_v1', 'true');
    } catch {}
  }, []);

  const [lang, setLang] = useState<Language>('ar');
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('vant-theme') as Theme | null;
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [category, setCategory] = useState(ALL);
  const [isWishlistOnly, setIsWishlistOnly] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilterType>('all');
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(() => {
    try {
      return sessionStorage.getItem('vant-banner-dismissed') !== 'true';
    } catch {
      return true;
    }
  });

  // Intersection Observer for Infinite Scrolling to fetch the next batch when reaching bottom
  useEffect(() => {
    const target = loadMoreSentinelRef.current;
    if (!target || !hasMore || loading || loadingMore || isWishlistOnly || searchQuery.trim()) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          loadMore();
        }
      },
      { rootMargin: '350px 0px' }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, loadMore, isWishlistOnly, searchQuery]);

  // Track initial page view telemetry
  useEffect(() => {
    trackEvent('page_view', { path: window.location.pathname });
  }, []);

  // Active User Engagement Duration Telemetry Tracker (logs every 30s of active user attention)
  useEffect(() => {
    let activeSeconds = 0;
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        activeSeconds += 30;
        trackEvent('engagement_heartbeat', {
          duration_seconds: activeSeconds,
          path: window.location.pathname,
        });
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Track search queries telemetry
  useEffect(() => {
    if (searchQuery.trim().length >= 3) {
      const timer = setTimeout(() => {
        trackEvent('search_query', { query: searchQuery.trim() });
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  // Secret query parameter listener (?admin)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.has('admin')) {
        setIsAdminOpen(true);
      }
    }
  }, [setIsAdminOpen]);

  // Sync HTML lang and dir attributes
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  // Sync Theme (Dark Mode)
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('vant-theme', theme);
  }, [theme]);

  // Seamless First Paint: Trigger smooth opacity fade-in once React app is mounted and state is ready
  useEffect(() => {
    const rootEl = document.getElementById('root');
    if (rootEl) {
      rootEl.classList.add('app-mounted');
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const toggleLang = useCallback(() => {
    setLang((prev) => (prev === 'ar' ? 'en' : 'ar'));
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return [ALL, ...Array.from(set)];
  }, [products]);

  const getCategoryLabel = useCallback(
    (c: string) => {
      const trans = CATEGORY_TRANSLATIONS[c];
      if (!trans) return c;
      return lang === 'ar' ? trans.ar : trans.en;
    },
    [lang]
  );

  // Compute live counts per availability filter
  const availabilityCounts = useMemo(() => {
    const base = isWishlistOnly ? products.filter((p) => isWishlisted(p.id)) : products;
    const categoryFiltered = category === ALL ? base : base.filter((p) => p.category === category);
    const searchFiltered = searchQuery.trim()
      ? categoryFiltered.filter((p) => productMatchesQuery(p, searchQuery))
      : categoryFiltered;

    const counts: Record<AvailabilityFilterType, number> = {
      all: searchFiltered.length,
      in_stock: 0,
      coming_soon: 0,
      sold_out: 0,
    };

    searchFiltered.forEach((p) => {
      const a = p.availability || 'in_stock';
      if (a in counts) {
        counts[a as AvailabilityFilterType]++;
      }
    });

    return counts;
  }, [products, isWishlisted, isWishlistOnly, category, searchQuery]);

  // Combined Filtering Pipeline: Category -> Wishlist -> Availability -> Search
  const visible = useMemo(() => {
    return products.filter((p) => {
      // 1. Wishlist Only Filter
      if (isWishlistOnly && !isWishlisted(p.id)) {
        return false;
      }
      // 2. Category Filter
      if (category !== ALL && p.category !== category) {
        return false;
      }
      // 3. Availability Filter
      if (availabilityFilter !== 'all') {
        const itemAvailability = p.availability || 'in_stock';
        if (itemAvailability !== availabilityFilter) {
          return false;
        }
      }
      // 4. Search Query Filter
      if (!productMatchesQuery(p, searchQuery)) {
        return false;
      }
      return true;
    });
  }, [products, category, wishlist, isWishlistOnly, availabilityFilter, searchQuery]);

  const closeDrawer = useCallback(() => setSelected(null), []);

  const showSplash = !hasFinishedSplash || isPreviewSplash;
  const showMaintenance = siteSettings.maintenance_mode && !isAdminUnlocked && !isPreviewMaintenance;

  return (
    <>
      {/* Root Cinematic Splash / Preloader Screen (Shows once on launch or when tested via Admin) */}
      {showSplash && (
        <SplashLoader
          isLoading={isInitialSplashLoading}
          loadingTextEn={siteSettings.loading_text_en}
          loadingTextAr={siteSettings.loading_text_ar}
          motif={siteSettings.splash_motif}
          isPreview={isPreviewSplash}
          onClosePreview={() => setIsPreviewSplash(false)}
          onFinished={handleSplashFinished}
        />
      )}

      {/* Interactive Maintenance Screen Preview Overlay (Triggered from Admin Test Button) */}
      {isPreviewMaintenance && (
        <MaintenanceScreen
          maintenanceMessage={siteSettings.maintenance_message}
          maintenanceMessageAr={siteSettings.maintenance_message_ar}
          isPreview={true}
          onClosePreview={() => setIsPreviewMaintenance(false)}
          onAdminUnlock={unlockAdmin}
          onBypass={() => {
            setIsPreviewMaintenance(false);
            setIsAdminOpen(true);
          }}
        />
      )}

      {/* Real High-Fashion Maintenance Mode (Bypassed if Admin is authenticated) */}
      {showMaintenance ? (
        <>
          <MaintenanceScreen
            maintenanceMessage={siteSettings.maintenance_message}
            maintenanceMessageAr={siteSettings.maintenance_message_ar}
            onAdminUnlock={unlockAdmin}
            onBypass={() => setIsAdminOpen(true)}
          />
          <AdminDrawer lang={lang} />
        </>
      ) : (
        <div
          className={`relative min-h-screen flex flex-col font-sans transition-colors duration-300 overflow-x-hidden ${
            theme === 'dark' ? 'bg-[#0d0f12] text-[#f3f4f6]' : 'bg-[#f8f9fa] text-[#15171c]'
          }`}
        >
      {/* Luxury Ambient Lighting Glow Orbs */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[520px] w-[850px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,74,215,0.06),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.08),transparent_70%)] blur-3xl animate-luxury-glow" />
      <div className="pointer-events-none absolute top-[40%] ltr:-right-48 rtl:-left-48 h-[400px] w-[400px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.03),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.04),transparent_70%)] blur-3xl" />

      {/* Background image preloader for butter-smooth carousel & lookbook exploration */}
      <ImagePreloader products={products} />

      {/* Haute-Couture Sticky Header with glassmorphism */}
      <Header
        lang={lang}
        onToggleLang={toggleLang}
        theme={theme}
        onToggleTheme={toggleTheme}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isSearchOpen={isSearchOpen}
        onToggleSearch={setIsSearchOpen}
        wishlistCount={wishlistCount}
        isWishlistOnly={isWishlistOnly}
        onToggleWishlistOnly={() => setIsWishlistOnly((prev) => !prev)}
      >
        {/* Seamless Category and Availability Filters */}
        <CategoryFilter
          categories={categories}
          active={category}
          onChange={setCategory}
          getLabel={getCategoryLabel}
          lang={lang}
          availability={availabilityFilter}
          onAvailabilityChange={setAvailabilityFilter}
          availabilityCounts={availabilityCounts}
        />
      </Header>

      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-3 sm:px-6 py-4 sm:py-6">
        {/* Welcome Brand Story Banner with dismiss button */}
        {showWelcomeBanner && !isWishlistOnly && (
          <WelcomeHeroBanner
            lang={lang}
            isOpen={showWelcomeBanner && !isWishlistOnly}
            onExplore={() => {
              document.getElementById('catalog-grid')?.scrollIntoView({ behavior: 'smooth' });
            }}
            onDismiss={() => {
              setShowWelcomeBanner(false);
              sessionStorage.setItem('vant-banner-dismissed', 'true');
            }}
            onSelectCategory={setCategory}
          />
        )}

        {/* Wishlist Active Filter Banner */}
        {isWishlistOnly && (
          <div className="mb-5 flex items-center justify-between rounded-2xl border border-[#004ad7]/20 dark:border-[#3b82f6]/30 bg-[#004ad7]/8 dark:bg-[#3b82f6]/10 px-4 py-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-[#004ad7] dark:text-[#3b82f6] font-medium">
              <Heart className="h-4 w-4 fill-current" />
              <span>
                {lang === 'ar'
                  ? `خزانتك الخاصة المنسقة (${visible.length} قطعة محفوظة)`
                  : `Curated Archive (${visible.length} saved pieces)`}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsWishlistOnly(false)}
              className="text-xs font-semibold text-[#004ad7] dark:text-[#3b82f6] hover:underline cursor-pointer"
            >
              {lang === 'ar' ? 'عرض التشكيلة الكاملة' : 'View All Pieces'}
            </button>
          </div>
        )}

        {/* Empty Search/Filter State */}
        {visible.length === 0 && !loading && !isWishlistOnly ? (
          <div className="py-20 text-center">
            <h3 className="text-base sm:text-lg font-semibold text-[#15171c] dark:text-white">
              {lang === 'ar' ? 'لم يتم العثور على قطع تطابق بحثك' : 'No matching pieces found'}
            </h3>
            <p className="mt-1.5 text-xs sm:text-[13px] text-[#6b7280] dark:text-[#9ca3af]">
              {lang === 'ar'
                ? 'جرب البحث بكلمات أخرى أو اختر تصنيفاً أو حالة توفر مختلفة.'
                : 'Try searching with different terms or reset your filters.'}
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="rounded-full bg-[#004ad7] dark:bg-[#3b82f6] px-4 py-1.5 text-xs font-semibold text-white shadow-2xs hover:opacity-90 active:scale-95 cursor-pointer"
                >
                  {lang === 'ar' ? 'مسح البحث' : 'Clear Search'}
                </button>
              )}
              {availabilityFilter !== 'all' && (
                <button
                  type="button"
                  onClick={() => setAvailabilityFilter('all')}
                  className="rounded-full border border-black/10 dark:border-white/15 bg-white dark:bg-[#16191f] px-4 py-1.5 text-xs font-semibold text-[#15171c] dark:text-white hover:border-[#004ad7] active:scale-95 cursor-pointer"
                >
                  {lang === 'ar' ? 'إعادة ضبط التوفر' : 'Reset Availability'}
                </button>
              )}
            </div>
          </div>
        ) : visible.length === 0 && !loading && isWishlistOnly ? (
          <div className="py-20 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#004ad7]/10 dark:bg-[#3b82f6]/15 text-[#004ad7] dark:text-[#3b82f6] mb-3">
              <Heart className="h-6 w-6" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-[#15171c] dark:text-white">
              {lang === 'ar' ? 'خزانتك الخاصة فارغة حالياً' : 'Your Personal Archive is Empty'}
            </h3>
            <p className="mt-1.5 text-xs sm:text-[13px] text-[#6b7280] dark:text-[#9ca3af] leading-relaxed">
              {lang === 'ar'
                ? 'اضغط على رمز القلب الموجود على أي قطعة في التشكيلة لحفظها هنا ومراجعتها بكل سهولة.'
                : 'Click the heart icon on any piece across the lookbook to save it for quick access here.'}
            </p>
            <button
              type="button"
              onClick={() => setIsWishlistOnly(false)}
              className="mt-5 inline-flex items-center justify-center rounded-full bg-[#15171c] dark:bg-white px-5 py-2.5 text-xs font-semibold text-white dark:text-[#15171c] transition-all hover:bg-black/85 dark:hover:bg-white/90 active:scale-95 shadow-sm cursor-pointer"
            >
              {lang === 'ar' ? 'استكشف التشكيلة الكاملة' : 'Explore Full Collection'}
            </button>
          </div>
        ) : (
          <div id="catalog-grid">
            <MasonryGrid
              products={visible}
              loading={loading}
              lang={lang}
              isWishlisted={isWishlisted}
              onToggleWishlist={(id) => {
                const nextState = !isWishlisted(id);
                toggleWishlist(id);
                const found = products.find((x) => String(x.id) === String(id));
                trackEvent('wishlist_toggle', {
                  productId: id,
                  productTitle: found?.title_ar || found?.title || `Piece #${id}`,
                  isAdded: nextState,
                });
              }}
              onOpen={(p) => {
                setSelected(p);
                trackEvent('product_view', {
                  productId: p.id,
                  productTitle: p.title_ar || p.title,
                  category: p.category,
                  price: p.price,
                });
              }}
            />

            {/* Pagination / Infinite Scroll Load More Action */}
            {!isWishlistOnly && !searchQuery.trim() && (hasMore || loadingMore) && (
              <div className="mt-2 mb-12 flex flex-col items-center justify-center gap-3 select-none">
                <button
                  type="button"
                  onClick={() => loadMore()}
                  disabled={loadingMore}
                  className="inline-flex items-center justify-center gap-2.5 rounded-full border border-black/10 dark:border-white/15 bg-white dark:bg-[#16191f] px-8 py-3 text-xs sm:text-sm font-semibold text-[#15171c] dark:text-white shadow-sm hover:border-[#004ad7] dark:hover:border-[#3b82f6] hover:text-[#004ad7] dark:hover:text-[#3b82f6] transition-all active:scale-95 cursor-pointer disabled:opacity-60"
                  aria-label={lang === 'ar' ? 'تحميل المزيد من التشكيلة' : 'Load more pieces'}
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-[#004ad7] dark:text-[#3b82f6]" />
                      <span>{lang === 'ar' ? 'جاري استعراض المزيد من القطع...' : 'Loading more pieces...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{lang === 'ar' ? 'استعراض المزيد من القطع' : 'Load More Pieces'}</span>
                      {totalProductsCount > 0 && (
                        <span className="text-[10.5px] text-black/45 dark:text-white/40 font-mono font-medium">
                          ({products.length} / {totalProductsCount})
                        </span>
                      )}
                    </>
                  )}
                </button>
                {/* Invisible Intersection Observer Trigger */}
                <div ref={loadMoreSentinelRef} className="h-4 w-full opacity-0 pointer-events-none" />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Elegant Newsletter Subscription Section (Only shown in full collection mode) */}
      {!isWishlistOnly && <NewsletterSection lang={lang} />}

      {/* Editorial footer with Instagram, Pinterest, and TikTok social links + secret triple-tap trigger */}
      <Footer
        lang={lang}
        isLiveDatabase={isLiveDatabase}
        onAdminTrigger={() => setIsAdminOpen(true)}
      />

      {/* Floating Back to Top Button */}
      <BackToTop lang={lang} />

      {/* Responsive Luxury Detail Modal / Sheet */}
      <ProductDrawer product={selected} lang={lang} onClose={closeDrawer} />

      {/* Secret Admin Control Drawer (Triggered via Shift+A, typing 'admin', or footer 3-tap) */}
      <AdminDrawer lang={lang} />
    </div>
    )}
    </>
  );
}

export default function App() {
  return (
    <SiteControlsProvider>
      <MainApp />
    </SiteControlsProvider>
  );
}
