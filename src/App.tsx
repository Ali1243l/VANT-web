/**
 * VANT Streetwear Lookbook — Interactive Digital Catalog & Router
 * Modeled strictly after Nike SNKRS exclusivity drops & ZARA full-bleed vertical swipe experience.
 * Phase 7: Restored Header Toggles (AR/EN, Dark/Light), Premium Fashion Splash Screen, Flawless Autoplay Carousel.
 * File: src/App.tsx
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Instagram,
  MessageCircle,
  Sparkles,
  SlidersHorizontal,
  Check,
  Smartphone,
  Maximize2,
  Sun,
  Moon,
  Shield,
  ChevronRight,
  ChevronLeft,
  Globe,
  Share2,
} from 'lucide-react';
import Fuse from 'fuse.js';
import { Product, CategoryFilter, AppSettings } from './types/catalog';
import { fetchCatalogProducts, fetchAppSettings, DEFAULT_APP_SETTINGS } from './lib/supabase';
import AdminPage from './pages/AdminPage';

// Multilingual Dictionary
const DICT = {
  ar: {
    dropBadge: 'الإصدار الأول',
    exclusiveDrop: 'إصدار حصري محدود',
    searchPlaceholder: 'ابحث عن القطع بالاسم، الخامة، التصنيف...',
    noDrops: 'لم يتم العثور على قطع',
    noDropsDesc: 'جرّب تعديل كلمات البحث أو تصفّح فئة أخرى.',
    resetFilters: 'إعادة ضبط الفلترة',
    price: 'السعر',
    details: 'تفاصيل',
    selectSize: 'اختر المقاس',
    sizeGuide: 'دليل المقاسات',
    colorway: 'اللون',
    description: 'الوصف',
    materialFit: 'الخامة والقصّة',
    fit: 'القصّة:',
    material: 'الخامة:',
    orderInstagram: 'اطلب عبر انستغرام DM',
    orderWhatsApp: 'اطلب عبر واتساب',
    adminLink: 'الإدارة',
    openingInstagram: 'جاري فتح محادثة انستغرام للقطعة',
    redirectingWhatsApp: 'جاري التحويل إلى واتساب مع تفاصيل الطلب',
    outOfStock: 'نفدت الكمية',
    archived: 'أرشيف',
    droppingSoon: 'إطلاق قريباً',
    followInstagramDrop: 'تابعنا على انستغرام لموعد الإطلاق',
    linkCopied: 'تم نسخ الرابط',
    share: 'مشاركة',
    categories: {
      'All': 'الكل',
      'T-Shirts': 'T-Shirts',
      'Hoodies': 'Hoodies',
      'Pants': 'Pants',
      'Outerwear': 'Outerwear',
      'Coming Soon': 'قريباً',
    } as Record<string, string>,
  },
  en: {
    dropBadge: 'DROP 01',
    exclusiveDrop: 'EXCLUSIVE DROP',
    searchPlaceholder: 'Search drops by name, category, fit...',
    noDrops: 'No drops found',
    noDropsDesc: 'Try adjusting your search terms or choosing another category.',
    resetFilters: 'Reset Filters',
    price: 'PRICE',
    details: 'Details',
    selectSize: 'Select Size',
    sizeGuide: 'Streetwear Fit Guide',
    colorway: 'Colorway',
    description: 'Description',
    materialFit: 'Material & Fit',
    fit: 'Fit:',
    material: 'Material:',
    orderInstagram: 'Order via Instagram DM',
    orderWhatsApp: 'Order via WhatsApp',
    adminLink: 'Admin',
    openingInstagram: 'Opening Instagram DM for',
    redirectingWhatsApp: 'Redirecting to WhatsApp with order details',
    outOfStock: 'Out of Stock',
    archived: 'ARCHIVED',
    droppingSoon: 'DROPPING SOON',
    followInstagramDrop: 'Follow Instagram for Drop Info',
    linkCopied: 'Link Copied',
    share: 'Share',
    categories: {
      'All': 'All',
      'T-Shirts': 'T-Shirts',
      'Hoodies': 'Hoodies',
      'Pants': 'Pants',
      'Outerwear': 'Outerwear',
      'Coming Soon': 'Coming Soon',
    } as Record<string, string>,
  },
};

const CATEGORIES: CategoryFilter[] = ['All', 'T-Shirts', 'Outerwear', 'Pants', 'Hoodies'];

function PublicLookbook() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [appSettings, setAppSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [showSplash, setShowSplash] = useState(true);

  // Phase 27, 28 & 29: Global App Settings Fetch
  useEffect(() => {
    async function loadSettings() {
      try {
        const settings = await fetchAppSettings();
        setAppSettings(settings);
        if (!settings.splash_enabled) {
          setShowSplash(false);
        }
      } catch (err) {
        console.error('Error loading settings:', err);
      }
    }
    loadSettings();
  }, []);

  // Phase 27: 3-Second Cinematic Splash Timer
  useEffect(() => {
    if (appSettings.splash_enabled && showSplash) {
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [appSettings.splash_enabled, showSplash]);

  // Phase 28: Smart Auto-Hiding Header scroll listener
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const feedContainerRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (appSettings.smart_header_enabled === false) {
      setIsHeaderVisible(true);
      return;
    }

    const handleScroll = (currentY: number) => {
      const diff = currentY - lastScrollY.current;
      if (Math.abs(diff) < 8) return;

      if (currentY > 40 && diff > 0) {
        setIsHeaderVisible(false);
      } else if (diff < 0 || currentY <= 40) {
        setIsHeaderVisible(true);
      }
      lastScrollY.current = Math.max(0, currentY);
    };

    const onContainerScroll = () => {
      if (feedContainerRef.current) {
        handleScroll(feedContainerRef.current.scrollTop);
      }
    };

    const onWindowScroll = () => {
      handleScroll(window.scrollY);
    };

    const container = feedContainerRef.current;
    if (container) {
      container.addEventListener('scroll', onContainerScroll, { passive: true });
    }
    window.addEventListener('scroll', onWindowScroll, { passive: true });

    return () => {
      if (container) {
        container.removeEventListener('scroll', onContainerScroll);
      }
      window.removeEventListener('scroll', onWindowScroll);
    };
  }, [appSettings.smart_header_enabled]);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');

  // 1. FORCED Arabic Default & RTL Direction with persistence
  const [lang, setLang] = useState<'ar' | 'en'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vant_lang');
      if (saved === 'ar' || saved === 'en') return saved;
    }
    return 'ar';
  });
  const t = DICT[lang];

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    localStorage.setItem('vant_lang', lang);
  }, [lang]);

  // Dark Mode Theme (with HTML dark class & localStorage persistence)
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vant_theme');
      if (saved) return saved === 'dark';
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('vant_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('vant_theme', 'light');
    }
  }, [isDark]);

  // Independent accordion states
  const [isDescOpen, setIsDescOpen] = useState(true);
  const [isFitOpen, setIsFitOpen] = useState(false);

  const [isMobileFrame, setIsMobileFrame] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [orderSentToast, setOrderSentToast] = useState<string | null>(null);

  // Carousel & Autoplay
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isUserInteracting, setIsUserInteracting] = useState(false);

  // Fetch products
  useEffect(() => {
    async function loadCatalog() {
      setIsLoading(true);
      const { products: fetched } = await fetchCatalogProducts();
      setProducts(fetched);
      // Cinematic 1.2s delay for the fashion splash screen to complete smoothly
      setTimeout(() => setIsLoading(false), 1200);
    }
    loadCatalog();
  }, []);

  // Autoplay Carousel (3-second interval, paused on interaction)
  useEffect(() => {
    if (!activeProduct || !activeProduct.media || activeProduct.media.length <= 1) return;
    if (isUserInteracting) return;

    const timer = setInterval(() => {
      if (!carouselRef.current) return;
      const count = activeProduct.media.length;
      const nextIndex = (activeSlideIndex + 1) % count;
      const targetScroll = nextIndex * carouselRef.current.clientWidth;
      carouselRef.current.scrollTo({ left: targetScroll, behavior: 'smooth' });
      setActiveSlideIndex(nextIndex);
    }, 3000);

    return () => clearInterval(timer);
  }, [activeProduct, activeSlideIndex, isUserInteracting]);

  // Fuse.js weighted fuzzy search
  const fuse = useMemo(() => {
    return new Fuse(products, {
      keys: [
        { name: 'title', weight: 5 },
        { name: 'title_ar', weight: 5 },
        { name: 'category', weight: 3 },
        { name: 'description', weight: 1 },
        { name: 'description_ar', weight: 1 },
      ],
      threshold: 0.35,
      ignoreLocation: true,
    });
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = products;

    if (searchQuery.trim()) {
      const searchResults = fuse.search(searchQuery.trim());
      result = searchResults.map((r) => r.item);
    }

    if (activeCategory !== 'All') {
      result = result.filter(
        (p) => p.category?.trim().toLowerCase() === activeCategory.trim().toLowerCase()
      );
    }

    return result;
  }, [products, activeCategory, searchQuery, fuse]);

  const handleOpenProduct = (product: Product) => {
    setActiveProduct(product);
    setActiveSlideIndex(0);
    setSelectedSize(product.sizes[0] || 'Standard');
    const colorsList = (lang === 'ar' && product.colors_ar) ? product.colors_ar : product.colors;
    setSelectedColor(colorsList[0] || 'Default');
    setIsDescOpen(true);
    setIsFitOpen(false);
  };

  const handleCarouselScroll = () => {
    if (!carouselRef.current) return;
    const { scrollLeft, clientWidth } = carouselRef.current;
    if (clientWidth > 0) {
      const index = Math.round(scrollLeft / clientWidth);
      setActiveSlideIndex(index);
    }
  };

  const scrollCarouselTo = (index: number) => {
    if (!carouselRef.current) return;
    const targetScroll = index * carouselRef.current.clientWidth;
    carouselRef.current.scrollTo({ left: targetScroll, behavior: 'smooth' });
    setActiveSlideIndex(index);
  };

  const getWhatsAppLink = (product: Product) => {
    const rawNumber = appSettings.whatsapp_number || '+9647700000000';
    const cleanNumber = rawNumber.replace(/[^0-9]/g, '');
    const productTitle = (lang === 'ar' && product.title_ar) ? product.title_ar : product.title;
    const text = `مرحباً VANT، أريد طلب هذه القطعة:\n- الاسم: ${productTitle}\n- السعر: ${product.price}$\nهل هي متوفرة؟`;
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
  };

  const getInstagramLink = () => {
    const rawHandle = appSettings.instagram_handle || 'vant.streetwear';
    if (rawHandle.startsWith('http://') || rawHandle.startsWith('https://')) {
      return rawHandle;
    }
    const cleanHandle = rawHandle.replace(/^@/, '').trim();
    return `https://instagram.com/${cleanHandle}`;
  };

  const triggerToast = (msg: string) => {
    setOrderSentToast(msg);
    setTimeout(() => setOrderSentToast(null), 3000);
  };

  // Phase 30: Native Share / Clipboard Fallback
  const handleShareProduct = async (productToShare?: Product) => {
    const target = productToShare || activeProduct;
    if (!target) return;
    const title = (lang === 'ar' && target.title_ar) ? target.title_ar : target.title;
    const shareUrl = window.location.href;
    const shareData = {
      title: `VANT — ${title}`,
      text: `${title} | VANT Streetwear`,
      url: shareUrl,
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
        triggerToast(t.linkCopied);
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        triggerToast(t.linkCopied);
      } catch (e) {
        triggerToast(t.linkCopied);
      }
    } else {
      triggerToast(t.linkCopied);
    }
  };

  // Loading Skeleton Component
  function ProductSkeleton() {
    return (
      <div className="w-full h-[100dvh] overflow-y-auto snap-y snap-mandatory md:h-auto md:min-h-screen md:overflow-visible md:snap-none md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-3 md:px-6 md:pt-[130px] md:pb-12 hide-scrollbar scrollbar-none">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="relative w-full h-[100dvh] snap-start md:h-[85vh] md:rounded-2xl overflow-hidden bg-[#0a0a0a] border border-white/5 flex flex-col justify-end p-6 animate-pulse"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                <span className="text-white/20 font-black text-xl tracking-tighter">VANT</span>
              </div>
            </div>
            <div className="relative z-10 space-y-3">
              <div className="w-20 h-3 bg-white/10 rounded-full" />
              <div className="w-48 h-6 bg-white/15 rounded-lg" />
              <div className="w-32 h-3 bg-white/10 rounded-full" />
              <div className="flex justify-between items-center pt-2">
                <div className="w-16 h-6 bg-[#004ad7]/30 rounded-md" />
                <div className="w-20 h-7 bg-white/10 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <main
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className={`w-full min-h-[100dvh] bg-background text-foreground relative m-0 p-0 overflow-x-hidden flex flex-col font-sans select-none transition-colors duration-300 ${
        isDark ? 'bg-[#050505] text-white' : 'bg-[#f8f9fa] text-[#111111]'
      }`}
    >
      {/* Phase 27: Dynamic Cinematic Splash Screen */}
      <AnimatePresence>
        {showSplash && appSettings.splash_enabled && (
          <motion.div
            key="cinematic-splash-overlay"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black text-white overflow-hidden pointer-events-none select-none"
          >
            {/* Background Media (Video or Image) */}
            {appSettings.splash_media_url && (
              <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
                {appSettings.splash_media_url.match(/\.(mp4|webm|mov|ogg)(\?.*)?$/i) ? (
                  <video
                    src={appSettings.splash_media_url}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover absolute inset-0 opacity-40"
                  />
                ) : (
                  <img
                    src={appSettings.splash_media_url}
                    alt="Splash Background"
                    className="w-full h-full object-cover absolute inset-0 opacity-40"
                  />
                )}
                <div className="absolute inset-0 bg-black/40" />
              </div>
            )}

            {/* Dead Center VANT Wordmark with staggered letter animation and sleek pulse */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.8 }}
              className="relative z-10 flex flex-col items-center text-center px-4"
            >
              <div dir="ltr" className="flex items-center justify-center gap-3 sm:gap-6 my-3">
                {['V', 'A', 'N', 'T'].map((char, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 22, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{
                      delay: 0.2 + index * 0.12,
                      duration: 0.8,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="text-5xl sm:text-7xl font-black uppercase font-sans tracking-[0.25em] text-white drop-shadow-2xl"
                  >
                    {char}
                  </motion.span>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="flex flex-col items-center gap-1.5 mt-2"
              >
                <span className="text-[10px] sm:text-xs font-mono tracking-[0.4em] text-[#004ad7] uppercase font-bold">
                  DIGITAL LOOKBOOK
                </span>
                <span className="text-[9px] tracking-[0.3em] uppercase text-neutral-400 font-medium">
                  RIYADH • STREETWEAR ARCHIVE
                </span>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* 1. Normal Sticky/Fixed Header across full width with Smart Auto-Hide */}
      <header
        className={`fixed top-0 inset-x-0 w-full z-50 px-4 md:px-8 py-3 backdrop-blur-xl border-b flex flex-col gap-3 transition-transform duration-300 ease-in-out ${
          appSettings.smart_header_enabled !== false && !isHeaderVisible ? '-translate-y-full' : 'translate-y-0'
        } ${
          isDark
            ? 'bg-[#050505]/85 border-white/10 text-white'
            : 'bg-white/85 border-slate-200/80 text-[#111111]'
        }`}
      >
        <div className="w-full flex items-center justify-between">
          {/* Brand Logo & Drop Badge on the Left */}
          <div className="flex items-center gap-2.5">
            <span className="text-3xl md:text-4xl font-black tracking-[-0.08em] uppercase font-sans drop-shadow-sm">
              VANT
            </span>
            <span className="text-[9px] md:text-[10px] font-bold tracking-widest uppercase bg-[#004ad7]/15 text-[#004ad7] border border-[#004ad7]/30 px-2.5 py-0.5 rounded-full">
              {t.dropBadge}
            </span>
          </div>

          {/* Prominent Header Controls ON THE TOP RIGHT */}
          <div className="flex items-center gap-2">
            {/* Language Switcher Button (AR / EN) */}
            <button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              title="Switch Language / تغيير اللغة"
              className="h-8 px-3 flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-xl text-white border border-white/25 text-[11px] font-bold shadow-lg hover:bg-black/80 active:scale-95 transition-all cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-[#004ad7]" />
              <span className="font-mono tracking-wider">{lang === 'ar' ? 'EN' : 'عربي'}</span>
            </button>

            {/* Theme Switcher Button (Sun / Moon) */}
            <button
              onClick={() => setIsDark(!isDark)}
              title={isDark ? 'Light Mode' : 'Dark Mode'}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-xl text-white border border-white/25 shadow-lg hover:bg-black/80 active:scale-95 transition-all cursor-pointer"
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5 text-slate-100" />}
            </button>

            {/* Search Toggle Button */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Toggle Search"
              className={`w-8 h-8 flex items-center justify-center rounded-full backdrop-blur-xl border border-white/25 shadow-lg active:scale-95 transition-all cursor-pointer ${
                isSearchOpen ? 'bg-[#004ad7] text-white border-[#004ad7]' : 'bg-black/60 text-white hover:bg-black/80'
              }`}
            >
              {isSearchOpen ? <X className="w-3.5 h-3.5" /> : <Search className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* 3. HEADER WRAP FIX: Category Pills Bar (Horizontal Scrollable Row) */}
        <div className="flex w-full overflow-x-auto snap-x snap-mandatory hide-scrollbar flex-nowrap items-center gap-2 pb-2">
          {CATEGORIES.map((category) => {
            const isActive = activeCategory === category;
            const label = t.categories[category] || category;
            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`flex-shrink-0 whitespace-nowrap px-4 py-1.5 rounded-full text-xs transition-all duration-200 active:scale-95 cursor-pointer font-medium ${
                  isActive
                    ? 'bg-[#004ad7] text-white shadow-md shadow-[#004ad7]/30 font-bold border border-[#004ad7]'
                    : isDark
                      ? 'bg-neutral-900/60 text-white/70 hover:text-white hover:bg-neutral-800 border border-white/10'
                      : 'bg-slate-100/90 text-neutral-600 hover:text-neutral-900 hover:bg-slate-200 border border-slate-200/80'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </header>

      {/* 2. Search Dropdown */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`fixed top-28 inset-x-4 max-w-xl mx-auto z-50 p-2.5 rounded-2xl shadow-2xl backdrop-blur-xl border ${
              isDark ? 'bg-[#141414]/95 border-white/15 text-white' : 'bg-white/95 border-slate-200 text-[#111111]'
            }`}
          >
            <div className="relative flex items-center">
              <Search className={`absolute ${lang === 'ar' ? 'right-3' : 'left-3'} w-4 h-4 text-slate-400`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className={`w-full ${lang === 'ar' ? 'pr-9 pl-8' : 'pl-9 pr-8'} py-2 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004ad7] ${
                  isDark ? 'bg-white/5 text-white placeholder:text-slate-500' : 'bg-slate-50 text-[#111111] placeholder:text-slate-400'
                }`}
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className={`absolute ${lang === 'ar' ? 'left-3' : 'right-3'} text-slate-400 hover:text-slate-700`}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. THE FEED ARCHITECTURE (Strict Mobile Snap / Desktop Grid) */}
      {isLoading ? (
        <ProductSkeleton />
      ) : (
        <div
          ref={feedContainerRef}
          className="w-full h-[100dvh] overflow-y-auto snap-y snap-mandatory hide-scrollbar pt-0 md:h-auto md:min-h-screen md:overflow-visible md:snap-none md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-3 md:px-6 md:pt-[130px] md:pb-12 scrollbar-none"
        >
          {filteredProducts.length === 0 ? (
            <div className={`w-full h-full min-h-[60vh] md:col-span-2 lg:col-span-3 flex flex-col items-center justify-center p-8 text-center ${
              isDark ? 'bg-[#050505] text-slate-400' : 'bg-[#f8f9fa] text-slate-600'
            }`}>
              <SlidersHorizontal className="w-10 h-10 mb-3 text-slate-400 stroke-1" />
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-[#111111]'}`}>{t.noDrops}</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">{t.noDropsDesc}</p>
              <button
                onClick={() => {
                  setActiveCategory('All');
                  setSearchQuery('');
                }}
                className="mt-4 px-5 py-2 rounded-full text-xs font-bold text-white bg-[#004ad7] shadow-md shadow-[#004ad7]/30 cursor-pointer"
              >
                {t.resetFilters}
              </button>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => {
                const imageUrl = product.product_media && product.product_media.length > 0 ? product.product_media[0].media_url : null;
                const productTitle = (lang === 'ar' && product.title_ar) ? product.title_ar : product.title;
                const productFit = (lang === 'ar' && product.fit_details_ar) ? product.fit_details_ar : (product.fit_details || product.description);

                return (
                  <motion.section
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className={`relative w-full h-[100dvh] snap-start bg-background flex items-center justify-center overflow-hidden select-none ${
                      isDark ? 'bg-[#050505]' : 'bg-[#f8f9fa]'
                    } md:h-[85vh] md:rounded-2xl md:snap-none md:border ${
                      isDark ? 'md:border-white/5' : 'md:border-slate-200'
                    } group`}
                  >
                  {/* Zero-Crop 100% Framed Media with Dynamic Blurred Immersive Backdrop */}
                  <div className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center">
                    {imageUrl && (
                      <img
                        src={imageUrl}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 w-full h-full object-cover opacity-30 blur-3xl scale-110 -z-10 pointer-events-none"
                      />
                    )}
                    {imageUrl ? (
                      appSettings.parallax_enabled !== false ? (
                        <motion.img
                          src={imageUrl}
                          alt={productTitle}
                          referrerPolicy="no-referrer"
                          initial={{ scale: 1 }}
                          whileInView={{ scale: 1.05 }}
                          viewport={{ once: false, amount: 0.3 }}
                          transition={{
                            duration: 7,
                            ease: 'easeInOut',
                            repeat: Infinity,
                            repeatType: 'reverse',
                          }}
                          className="w-full h-full object-contain object-center transition-transform"
                          loading="eager"
                        />
                      ) : (
                        <img
                          src={imageUrl}
                          alt={productTitle}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain object-center scale-100"
                          loading="eager"
                        />
                      )
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-neutral-500 font-mono">
                        <Sparkles className="w-8 h-8 text-[#004ad7]/40" />
                        <span className="text-xs tracking-[0.2em] font-bold uppercase text-neutral-400">VANT ARCHIVE</span>
                      </div>
                    )}
                    <div className="absolute top-0 inset-x-0 h-36 bg-gradient-to-b from-black/80 via-black/25 to-transparent pointer-events-none" />
                  </div>

                  {/* Top Drop Status & Exclusive Drop Badges */}
                  <div className={`absolute top-28 md:top-6 ${lang === 'ar' ? 'right-4 md:right-6' : 'left-4 md:left-6'} z-20 flex flex-col gap-1.5 items-start`}>
                    {product.status === 'SOLD_OUT' && (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-black/85 backdrop-blur-md rounded-full text-red-400 text-[10px] font-mono font-black tracking-wider uppercase border border-red-500/40 shadow-lg">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        <span>{t.outOfStock} // {t.archived}</span>
                      </div>
                    )}
                    {product.status === 'COMING_SOON' && (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-black/85 backdrop-blur-md rounded-full text-amber-300 text-[10px] font-mono font-black tracking-wider uppercase border border-amber-500/40 shadow-lg">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>{t.droppingSoon}</span>
                      </div>
                    )}
                    {product.is_exclusive_drop && (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-white text-[10px] font-bold tracking-wider uppercase border border-white/15 shadow-md">
                        <Sparkles className="w-3 h-3 text-[#004ad7]" />
                        <span>{t.exclusiveDrop}</span>
                      </div>
                    )}
                  </div>

                  {/* 1. Refined Softer & Shorter Bottom Fade */}
                  <div
                    className={`absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t pointer-events-none z-10 ${
                      isDark
                        ? 'from-[#050505] via-[#050505]/60 to-transparent'
                        : 'from-[#f8f9fa] via-[#f8f9fa]/60 to-transparent'
                    }`}
                  />

                  {/* 2. Clean Bottom Typography & Layout */}
                  <div
                    onClick={() => handleOpenProduct(product)}
                    className="absolute bottom-6 inset-x-4 z-20 flex justify-between items-end cursor-pointer group active:opacity-95 transition-opacity"
                  >
                    <div className="flex flex-col gap-1 max-w-[65%]">
                      <span className={`text-[10px] uppercase tracking-wider font-mono font-medium ${
                        isDark ? 'text-neutral-400' : 'text-slate-500'
                      }`}>
                        {t.categories[product.category] || product.category}
                      </span>
                      <h2 className={`text-xl font-bold leading-tight line-clamp-1 drop-shadow-sm group-hover:text-[#004ad7] transition-colors ${
                        isDark ? 'text-white' : 'text-[#111111]'
                      }`}>
                        {productTitle}
                      </h2>
                    </div>

                    {/* Price & Details CTA */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {product.status === 'COMING_SOON' ? (
                        <span className="text-[11px] font-mono font-black text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 uppercase tracking-wider">
                          {t.droppingSoon}
                        </span>
                      ) : product.status === 'SOLD_OUT' ? (
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-widest leading-none mb-1">
                            {t.outOfStock}
                          </span>
                          <span className="text-base font-bold text-neutral-400 dark:text-neutral-500 font-mono leading-none line-through">
                            ${product.price.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xl font-black text-[#004ad7] font-mono leading-none">
                          ${product.price.toFixed(2)}
                        </span>
                      )}
                      <div className={`rounded-full h-8 px-4 backdrop-blur-md flex items-center justify-center gap-1 text-xs font-semibold border transition-all ${
                        isDark
                          ? 'bg-white/10 text-white border-white/20 group-hover:bg-white/20'
                          : 'bg-black/5 text-neutral-900 border-black/10 group-hover:bg-black/10'
                      }`}>
                        <span>{t.details}</span>
                        <ChevronUp className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </div>
                </motion.section>
              );
            })}
            </AnimatePresence>
          )}
        </div>
      )}

        {/* 8. Responsive Product Details (Bottom Sheet on Mobile, Centered Modal on Desktop) */}
        <AnimatePresence>
          {activeProduct && (
            <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center pointer-events-none">
              {/* Dimmed Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setActiveProduct(null)}
                className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm pointer-events-auto cursor-pointer"
              />

              {/* Content Container (Mobile: Bottom Sheet | Desktop: Centered Modal) */}
              <motion.div
                initial={isDesktop ? { scale: 0.95, opacity: 0 } : { y: '100%' }}
                animate={isDesktop ? { scale: 1, opacity: 1 } : { y: 0 }}
                exit={isDesktop ? { scale: 0.95, opacity: 0 } : { y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                className={`fixed inset-x-0 bottom-0 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:inset-x-auto z-[60] pointer-events-auto w-full md:max-w-2xl max-h-[90vh] md:max-h-[92vh] rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden border-t md:border transition-colors ${
                  isDark ? 'bg-[#0a0a0a] text-white border-white/10' : 'bg-white text-[#111111] border-slate-200'
                }`}
              >
                {/* 1. FLAWLESS MULTI-IMAGE CAROUSEL (Top Half: h-[55vh] w-full relative) */}
                {(() => {
                  const carouselMedia = (activeProduct.product_media && activeProduct.product_media.length > 0)
                    ? activeProduct.product_media
                    : (activeProduct.media && activeProduct.media.length > 0)
                    ? activeProduct.media
                    : [{ media_url: '' }];

                  return (
                    <div
                      className="h-[55vh] w-full relative bg-neutral-950 overflow-hidden flex-shrink-0"
                      onMouseEnter={() => setIsUserInteracting(true)}
                      onMouseLeave={() => setIsUserInteracting(false)}
                      onTouchStart={() => setIsUserInteracting(true)}
                      onTouchEnd={() => setTimeout(() => setIsUserInteracting(false), 2500)}
                    >
                      {/* Floating circular glassmorphism icons OVER top corners */}
                      <button
                        onClick={() => setActiveProduct(null)}
                        className="absolute top-4 start-4 z-50 bg-black/50 backdrop-blur-md p-2.5 rounded-full text-white hover:bg-black/70 active:scale-95 transition-all cursor-pointer shadow-lg border border-white/10"
                        aria-label="Close modal"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleShareProduct(activeProduct)}
                        className="absolute top-4 end-4 z-50 bg-black/50 backdrop-blur-md p-2.5 rounded-full text-white hover:bg-black/70 active:scale-95 transition-all cursor-pointer shadow-lg border border-white/10"
                        title={t.share}
                        aria-label="Share product"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      {/* Smooth Horizontal Scroll Container */}
                      <div
                        ref={carouselRef}
                        onScroll={handleCarouselScroll}
                        className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar w-full h-full"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                      >
                        {carouselMedia.map((media: any, idx: number) => {
                          const mediaUrl = media.media_url || (typeof media === 'string' ? media : '');
                          return (
                            <div
                              key={media.id || idx}
                              className="w-full h-full relative snap-center flex-shrink-0 flex items-center justify-center bg-neutral-950"
                            >
                              {mediaUrl && (
                                <img
                                  src={mediaUrl}
                                  alt=""
                                  aria-hidden="true"
                                  className="absolute inset-0 w-full h-full object-cover opacity-25 blur-2xl scale-110 pointer-events-none"
                                />
                              )}
                              <img
                                key={idx}
                                src={mediaUrl}
                                alt={`${activeProduct.title} ${idx + 1}`}
                                className="w-full h-full object-contain snap-center flex-shrink-0 relative z-10 block"
                              />
                            </div>
                          );
                        })}
                      </div>

                      {/* Carousel Indicators / Controls */}
                      {carouselMedia.length > 1 && (
                        <>
                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-40 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 border border-white/10">
                            {carouselMedia.map((_, dotIdx) => (
                              <button
                                key={dotIdx}
                                onClick={() => scrollCarouselTo(dotIdx)}
                                className={`transition-all duration-300 rounded-full ${
                                  activeSlideIndex === dotIdx ? 'w-5 h-1.5 bg-[#004ad7]' : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
                                }`}
                              />
                            ))}
                          </div>
                          <button
                            onClick={() => scrollCarouselTo((activeSlideIndex - 1 + carouselMedia.length) % carouselMedia.length)}
                            aria-label="Previous"
                            className="absolute start-3 top-1/2 -translate-y-1/2 z-40 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity"
                          >
                            {lang === 'ar' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => scrollCarouselTo((activeSlideIndex + 1) % carouselMedia.length)}
                            aria-label="Next"
                            className="absolute end-3 top-1/2 -translate-y-1/2 z-40 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity"
                          >
                            {lang === 'ar' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                        </>
                      )}
                    </div>
                  );
                })()}

                {/* Scrollable Editorial Brutalist Body Container */}
                <div className="flex-1 overflow-y-auto hide-scrollbar px-6 py-6 space-y-6">
                  {/* Title, Category & Price Header */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold tracking-widest text-[#004ad7] uppercase">
                        {t.categories[activeProduct.category] || activeProduct.category}
                      </span>
                      {activeProduct.status === 'COMING_SOON' ? (
                        <span className="text-[11px] font-mono font-black uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                          {t.droppingSoon}
                        </span>
                      ) : activeProduct.status === 'SOLD_OUT' ? (
                        <span className="text-[10px] font-mono font-black uppercase tracking-wider text-red-500 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20">
                          {t.outOfStock}
                        </span>
                      ) : activeProduct.is_exclusive_drop ? (
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#004ad7] bg-[#004ad7]/10 px-2.5 py-1 rounded-full border border-[#004ad7]/20">
                          {t.exclusiveDrop}
                        </span>
                      ) : null}
                    </div>

                    <h3 className={`text-2xl md:text-3xl font-black tracking-tight uppercase ${isDark ? 'text-white' : 'text-[#111111]'}`}>
                      {(lang === 'ar' && activeProduct.title_ar) ? activeProduct.title_ar : activeProduct.title}
                    </h3>

                    {activeProduct.status === 'COMING_SOON' ? (
                      <p className="text-sm font-mono font-bold text-amber-500 uppercase tracking-widest">
                        {t.droppingSoon}
                      </p>
                    ) : activeProduct.status === 'SOLD_OUT' ? (
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-black font-mono line-through text-neutral-500">
                          ${activeProduct.price.toFixed(2)}
                        </span>
                        <span className="text-xs font-mono font-bold text-red-500 uppercase tracking-wider">
                          {lang === 'ar' ? 'أرشيف غير متوفر' : 'ARCHIVED'}
                        </span>
                      </div>
                    ) : (
                      <div className="text-2xl md:text-3xl font-black font-mono text-[#004ad7]">
                        ${activeProduct.price.toFixed(2)}
                      </div>
                    )}
                  </div>

                  {/* Size Selector */}
                  {activeProduct.sizes && activeProduct.sizes.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black tracking-widest text-neutral-400 dark:text-neutral-500 uppercase">
                          {t.selectSize}
                        </span>
                        <span className="text-xs font-mono font-semibold text-[#004ad7]">{t.sizeGuide}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {activeProduct.sizes.map((size) => {
                          const isSelected = selectedSize === size;
                          return (
                            <button
                              key={size}
                              onClick={() => setSelectedSize(size)}
                              className={`min-w-[50px] h-11 px-4 rounded-xl text-xs font-bold border transition-all active:scale-95 cursor-pointer ${
                                isSelected
                                  ? 'bg-[#004ad7] text-white border-[#004ad7] shadow-md shadow-[#004ad7]/30'
                                  : isDark
                                  ? 'bg-transparent text-slate-300 border-white/10 hover:border-white/25'
                                  : 'bg-transparent text-slate-800 border-slate-300 hover:border-slate-500'
                              }`}
                            >
                              {size}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Color Selector */}
                  {activeProduct.colors && activeProduct.colors.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-sm font-black tracking-widest text-neutral-400 dark:text-neutral-500 uppercase block">
                        {t.colorway}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {((lang === 'ar' && activeProduct.colors_ar) ? activeProduct.colors_ar : activeProduct.colors).map((color) => {
                          const isSelected = selectedColor === color;
                          return (
                            <button
                              key={color}
                              onClick={() => setSelectedColor(color)}
                              className={`px-4 py-2 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all active:scale-95 cursor-pointer ${
                                isSelected
                                  ? 'bg-[#004ad7]/10 text-[#004ad7] border-[#004ad7] font-bold ring-1 ring-[#004ad7]'
                                  : isDark
                                  ? 'bg-transparent text-slate-300 border-white/10 hover:border-white/25'
                                  : 'bg-transparent text-slate-700 border-slate-300 hover:border-slate-500'
                              }`}
                            >
                              <span>{color}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 2. TYPOGRAPHY-LED BRUTALIST SPECS (NO PRIMITIVE BOXES) */}
                  <div className="space-y-6 pt-3 border-t border-white/10 dark:border-white/10 border-slate-200">
                    {/* Description */}
                    <div className="space-y-1.5">
                      <h4 className="text-sm font-black tracking-widest text-neutral-400 dark:text-neutral-500 uppercase">
                        {t.description}
                      </h4>
                      <p className={`text-base md:text-lg font-medium leading-relaxed ${isDark ? 'text-neutral-200' : 'text-neutral-800'}`}>
                        {(lang === 'ar' && activeProduct.description_ar) ? activeProduct.description_ar : activeProduct.description}
                      </p>
                    </div>

                    {/* Fit Guide */}
                    {appSettings.show_fit_guide !== false && (activeProduct.fit_details || activeProduct.fit_details_ar) && (
                      <div className="space-y-1.5">
                        <h4 className="text-sm font-black tracking-widest text-neutral-400 dark:text-neutral-500 uppercase">
                          {lang === 'ar' ? 'القصّة والهندسة' : 'FIT & SILHOUETTE'}
                        </h4>
                        <p className={`text-base md:text-lg font-medium leading-relaxed ${isDark ? 'text-neutral-200' : 'text-neutral-800'}`}>
                          {(lang === 'ar' && activeProduct.fit_details_ar) ? activeProduct.fit_details_ar : activeProduct.fit_details}
                        </p>
                      </div>
                    )}

                    {/* Material */}
                    {appSettings.show_material_info !== false && (activeProduct.material || activeProduct.material_ar) && (
                      <div className="space-y-1.5">
                        <h4 className="text-sm font-black tracking-widest text-neutral-400 dark:text-neutral-500 uppercase">
                          {lang === 'ar' ? 'الخامة ومواصفات النسيج' : 'MATERIAL & FABRIC'}
                        </h4>
                        <p className={`text-base md:text-lg font-medium leading-relaxed ${isDark ? 'text-neutral-200' : 'text-neutral-800'}`}>
                          {(lang === 'ar' && activeProduct.material_ar) ? activeProduct.material_ar : activeProduct.material}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 3. PREMIUM MONOCHROMATIC BUTTON AESTHETICS (No Cheap Gradients) */}
                  <div className={`sticky bottom-0 inset-x-0 bg-gradient-to-t pt-6 pb-2 px-2 -mx-6 -mb-6 space-y-2.5 z-20 shrink-0 ${
                    isDark
                      ? 'from-[#0a0a0a] via-[#0a0a0a] to-transparent'
                      : 'from-white via-white to-transparent'
                  }`}>
                    {activeProduct.status === 'SOLD_OUT' ? (
                      <button
                        type="button"
                        disabled
                        className="w-full h-13 rounded-xl bg-neutral-800/80 text-neutral-400 border border-neutral-700/50 text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed select-none shadow-none"
                      >
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        <span>{lang === 'ar' ? 'نفدت الكمية - Archived' : 'Out of Stock - Archived'}</span>
                      </button>
                    ) : activeProduct.status === 'COMING_SOON' ? (
                      <motion.a
                        href={getInstagramLink()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full h-13 rounded-xl bg-[#111111] hover:bg-black text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all cursor-pointer border border-white/10 dark:border-black/10"
                      >
                        <Instagram className="w-4 h-4" />
                        <span>{t.followInstagramDrop}</span>
                      </motion.a>
                    ) : (
                      (appSettings.enable_whatsapp !== false || appSettings.enable_instagram !== false) && (
                        <>
                          {/* WhatsApp CTA: Solid Brand Blue */}
                          {appSettings.enable_whatsapp !== false && (
                            <motion.a
                              href={getWhatsAppLink(activeProduct)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => triggerToast(t.redirectingWhatsApp)}
                              className="w-full h-13 rounded-xl bg-[#004ad7] hover:bg-[#003cb0] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#004ad7]/30 active:scale-[0.98] transition-all cursor-pointer border border-[#004ad7]"
                            >
                              <MessageCircle className="w-4 h-4 fill-white" />
                              <span>{t.orderWhatsApp}</span>
                            </motion.a>
                          )}

                          {/* Instagram CTA: Sleek Solid Dark Gray / Monochrome */}
                          {appSettings.enable_instagram !== false && (
                            <motion.a
                              href={getInstagramLink()}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => triggerToast(`${t.openingInstagram} ${(lang === 'ar' && activeProduct.title_ar) ? activeProduct.title_ar : activeProduct.title}`)}
                              className={`w-full h-12 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border active:scale-[0.98] transition-all shadow-sm cursor-pointer ${
                                appSettings.enable_whatsapp === false
                                  ? 'bg-[#004ad7] hover:bg-[#003cb0] text-white border-[#004ad7] shadow-lg shadow-[#004ad7]/30'
                                  : isDark
                                  ? 'bg-[#111111] border-white/15 text-white hover:bg-neutral-900'
                                  : 'bg-[#111111] border-black/10 text-white hover:bg-neutral-900'
                              }`}
                            >
                              <Instagram className="w-4 h-4 text-white" />
                              <span>{t.orderInstagram}</span>
                            </motion.a>
                          )}
                        </>
                      )
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Action Toast */}
        <AnimatePresence>
          {orderSentToast && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className={`absolute bottom-6 left-6 right-6 z-50 py-3 px-4 rounded-xl text-xs font-bold shadow-2xl flex items-center gap-2 justify-center border ${
                isDark ? 'bg-neutral-900 text-white border-white/15' : 'bg-[#111111] text-white border-black/10'
              }`}
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{orderSentToast}</span>
            </motion.div>
          )}
        </AnimatePresence>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicLookbook />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}
