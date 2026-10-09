import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { Heart, Loader2, Check, X, Sparkles, Gift, Percent, Tag, ArrowUpDown, LayoutGrid, Grid2X2 } from 'lucide-react';
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

  // Display preloader smoothly on site launch once per session, avoiding repeated heavy reloads
  const [hasFinishedSplash, setHasFinishedSplash] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        return sessionStorage.getItem('vant_splash_completed') === 'true';
      }
    } catch {}
    return false;
  });

  const handleSplashFinished = useCallback(() => {
    setHasFinishedSplash(true);
    try {
      sessionStorage.setItem('vant_splash_completed', 'true');
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
  const [isOffersOnly, setIsOffersOnly] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilterType>('all');
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const [catalogSort, setCatalogSort] = useState<'newest' | 'price_asc' | 'price_desc' | 'offers'>('newest');
  const [gridLayout, setGridLayout] = useState<'grid-4' | 'grid-2'>('grid-4');

  // Clear any old sessionStorage flag on mount so the banner returns fresh and re-opens on refresh
  useEffect(() => {
    try {
      sessionStorage.removeItem('vant-banner-dismissed');
    } catch {}
  }, []);

  // Guard against any browser horizontal window displacement on category or filter switch
  useEffect(() => {
    if (window.scrollX !== 0) {
      window.scrollTo({ left: 0, top: window.scrollY });
    }
  }, [category, availabilityFilter, isOffersOnly]);

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

  // Auto-Apply Coupon & Offer Direct Routing from 1-Click Email Link (?coupon=... & ?filter=offers)
  const [appliedCouponNotification, setAppliedCouponNotification] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const couponParam = params.get('coupon') || params.get('discount') || params.get('code');
      const filterParam = params.get('filter') || params.get('tab') || params.get('view');
      const offerParam = params.get('offer');

      if (filterParam === 'offers' || filterParam === 'sale' || offerParam) {
        setIsOffersOnly(true);
      }

      if (couponParam) {
        const cleanCoupon = couponParam.trim().toUpperCase();
        try {
          localStorage.setItem('vant_applied_coupon', cleanCoupon);
        } catch {}
        setAppliedCouponNotification(cleanCoupon);
        const timer = setTimeout(() => setAppliedCouponNotification(null), 8000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

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

  // Listen for device OS theme change (System Dark Mode / Light Mode auto sync)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const saved = localStorage.getItem('vant-theme');
      if (!saved) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

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

  const offersCount = useMemo(() => products.filter((p) => p.is_offer).length, [products]);

  // Compute live counts per availability filter
  const availabilityCounts = useMemo(() => {
    const base = isWishlistOnly
      ? products.filter((p) => isWishlisted(p.id))
      : isOffersOnly
      ? products.filter((p) => p.is_offer)
      : products;
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
  }, [products, isWishlisted, isWishlistOnly, isOffersOnly, category, searchQuery]);

  // Combined Filtering & Sorting Pipeline: Offers -> Wishlist -> Category -> Availability -> Search -> Sort
  const visible = useMemo(() => {
    const filtered = products.filter((p) => {
      // 0. Offers Only Filter
      if (isOffersOnly && !p.is_offer) {
        return false;
      }
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

    if (catalogSort === 'price_asc') {
      return [...filtered].sort((a, b) => (a.price || 0) - (b.price || 0));
    }
    if (catalogSort === 'price_desc') {
      return [...filtered].sort((a, b) => (b.price || 0) - (a.price || 0));
    }
    if (catalogSort === 'offers') {
      return [...filtered].sort((a, b) => (b.is_offer ? 1 : 0) - (a.is_offer ? 1 : 0));
    }
    // Default: 'newest' (products are ordered in natural chronological order, latest first)
    return filtered;
  }, [products, isOffersOnly, category, wishlist, isWishlistOnly, availabilityFilter, searchQuery, catalogSort]);

  // Smoothly scroll window back to the top of the collection whenever category, offers, or availability changes
  const isFirstMountRef = useRef(true);
  const prevCategoryFilterRef = useRef({ category, isOffersOnly, availabilityFilter });
  useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      return;
    }
    const prev = prevCategoryFilterRef.current;
    if (
      prev.category !== category ||
      prev.isOffersOnly !== isOffersOnly ||
      prev.availabilityFilter !== availabilityFilter
    ) {
      prevCategoryFilterRef.current = { category, isOffersOnly, availabilityFilter };

      // Request animation frame to smoothly scroll window to top
      requestAnimationFrame(() => {
        if (typeof window !== 'undefined' && window.scrollY > 20) {
          window.scrollTo({
            top: 0,
            behavior: 'smooth',
          });
        }
      });
    }
  }, [category, isOffersOnly, availabilityFilter]);

  const closeDrawer = useCallback(() => setSelected(null), []);

  const showSplash = !hasFinishedSplash || isPreviewSplash;
  const showMaintenance = siteSettings.maintenance_mode && !isAdminUnlocked && !isPreviewMaintenance;

  return (
    <>
      {/* Root Cinematic Splash / Preloader Screen (Shows once on launch or when tested via Admin) */}
      {showSplash && (
        <SplashLoader
          isLoading={isInitialSplashLoading || loading}
          loadingTextEn={siteSettings.loading_text_en}
          loadingTextAr={siteSettings.loading_text_ar}
          motif={siteSettings.splash_motif}
          theme={theme}
          onToggleTheme={toggleTheme}
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
          className={`relative min-h-[100dvh] w-full max-w-full overflow-x-clip flex flex-col font-sans transition-colors duration-300 ${
            theme === 'dark' ? 'bg-[#0d0f12] text-[#f3f4f6]' : 'bg-[#f8f9fa] text-[#15171c]'
          }`}
        >
      {/* Luxury Ambient Lighting Glow Orbs */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[520px] w-[850px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,74,215,0.06),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.08),transparent_70%)] blur-3xl animate-luxury-glow" />
      <div className="pointer-events-none absolute top-[40%] ltr:-right-48 rtl:-left-48 h-[400px] w-[400px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.03),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.04),transparent_70%)] blur-3xl" />

      {/* 1-Click Coupon Activation Toast from Email Link */}
      <AnimatePresence>
        {appliedCouponNotification && (
          <motion.div
            initial={{ opacity: 0, y: -25, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[10000] w-[92%] max-w-md bg-[#0e121b]/95 border border-[#3b82f6]/60 text-white px-4 py-3.5 rounded-2xl shadow-2xl backdrop-blur-2xl flex items-center justify-between gap-3 text-start"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#004ad7] to-[#3b82f6] flex items-center justify-center text-white shadow-lg shadow-[#004ad7]/30 shrink-0">
                <Gift className="h-4.5 w-4.5" />
              </div>
              <div>
                <span className="text-xs font-bold block text-white">
                  {lang === 'ar' ? 'تم تفعيل كود الخصم الحصري بنجاح!' : 'VIP Discount Code Activated!'}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[11px] font-mono font-black text-[#60a5fa] bg-[#004ad7]/20 px-2 py-0.5 rounded-md border border-[#3b82f6]/40">
                    {appliedCouponNotification}
                  </span>
                  <span className="text-[11px] text-zinc-300">
                    {lang === 'ar' ? 'سارٍ على مشترياتك' : 'applied to your session'}
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAppliedCouponNotification(null)}
              className="text-zinc-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
          isOffersOnly={isOffersOnly}
          onToggleOffersOnly={setIsOffersOnly}
          offersCount={offersCount}
        />
      </Header>

      {/* Main Content Area: Responsive Fluid Sizing for 16:9 Widescreen & 9:16 Mobile */}
      <main className="mx-auto w-full max-w-[1920px] flex-1 px-3 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 pt-2 sm:pt-3 md:pt-4 pb-2 sm:pb-3 lg:pb-4 overflow-x-clip">
        {/* Offers Active Filter Banner (Refined Minimalist Luxury Aesthetic) */}
        {isOffersOnly && (
          <div className="mb-5 flex items-center justify-between rounded-2xl border border-black/8 dark:border-white/10 bg-white/70 dark:bg-[#12151e]/80 px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm backdrop-blur-xl shadow-xs transition-all">
            <div className="flex items-center gap-2.5 text-[#15171c] dark:text-white font-medium">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#004ad7]/10 dark:bg-[#3b82f6]/15 text-[#004ad7] dark:text-[#3b82f6]">
                <Tag className="h-3.5 w-3.5 stroke-[2.2]" />
              </div>
              <span className="font-semibold tracking-wide">
                {lang === 'ar'
                  ? (siteSettings.offers_banner_title_ar || 'العروضات والخصومات')
                  : (siteSettings.offers_banner_title_en || 'Offers & Discounts')}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsOffersOnly(false)}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#004ad7] dark:text-[#60a5fa] hover:underline cursor-pointer transition-all"
            >
              <span>{lang === 'ar' ? 'عرض التشكيلة الكاملة' : 'View Full Collection'}</span>
              <X className="h-3.5 w-3.5 opacity-70" />
            </button>
          </div>
        )}

        {/* Welcome Brand Story Banner with smooth collapse/expand animations */}
        <WelcomeHeroBanner
          lang={lang}
          isOpen={!isBannerDismissed && (category === ALL || !category || category === 'all') && !isWishlistOnly && !isOffersOnly && !searchQuery.trim()}
          activeCategory={category}
          onExplore={() => {
            document.getElementById('catalog-grid')?.scrollIntoView({ behavior: 'smooth' });
          }}
          onDismiss={() => {
            setIsBannerDismissed(true);
          }}
          onSelectCategory={setCategory}
        />

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
          <div id="catalog-grid" className="w-full">
            <MasonryGrid
              products={visible}
              loading={loading}
              loadingMore={loadingMore}
              lang={lang}
              layout={gridLayout}
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
              <div className="mt-2 mb-4 flex flex-col items-center justify-center gap-2 select-none">
                <button
                  type="button"
                  onClick={() => loadMore()}
                  disabled={loadingMore}
                  className="inline-flex items-center justify-center gap-2.5 rounded-full border border-black/10 dark:border-white/15 bg-white dark:bg-[#16191f] px-8 py-3 md:h-13.5 md:px-11 lg:h-14 lg:px-12 text-xs sm:text-sm md:text-base font-bold text-[#15171c] dark:text-white shadow-sm hover:border-[#004ad7] dark:hover:border-[#3b82f6] hover:text-[#004ad7] dark:hover:text-[#3b82f6] transition-all active:scale-95 cursor-pointer disabled:opacity-60"
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
                <div ref={loadMoreSentinelRef} className="h-2 w-full opacity-0 pointer-events-none" />
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
