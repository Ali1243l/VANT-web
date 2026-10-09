import { useEffect, useState, useRef, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Sun, Moon, Globe, Heart, History, Trash2, Sparkles } from 'lucide-react';
import type { Language, Theme } from '../types';
import { useSiteControls } from '../context/SiteControlsContext';

const SEARCH_HISTORY_KEY = 'vant_recent_searches';

interface Props {
  children?: ReactNode; // category bar lives inside so the glass covers both
  lang: Language;
  onToggleLang: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isSearchOpen: boolean;
  onToggleSearch: (open: boolean) => void;
  wishlistCount?: number;
  isWishlistOnly?: boolean;
  onToggleWishlistOnly?: () => void;
}

export default function Header({
  children,
  lang,
  onToggleLang,
  theme,
  onToggleTheme,
  searchQuery,
  onSearchChange,
  isSearchOpen,
  onToggleSearch,
  wishlistCount = 0,
  isWishlistOnly = false,
  onToggleWishlistOnly,
}: Props) {
  const { getControl } = useSiteControls();
  const searchControl = getControl('btn_header_search');
  const wishlistControl = getControl('btn_header_wishlist');
  const langControl = getControl('btn_header_lang');
  const themeControl = getControl('btn_header_theme');
  const logoControl = getControl('brand_kinetic_logo');

  const [scrolled, setScrolled] = useState(false);
  const [kineticLang, setKineticLang] = useState<'en' | 'ar'>(lang);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Local storage recent searches state
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(SEARCH_HISTORY_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveSearchTerm = useCallback((term: string) => {
    const cleaned = term.trim();
    if (!cleaned || cleaned.length < 2) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== cleaned.toLowerCase());
      const updated = [cleaned, ...filtered].slice(0, 8);
      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const removeSearchTerm = (termToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const updated = prev.filter((item) => item !== termToRemove);
      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const clearAllSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch {}
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Sync kinetic state with manual lang toggle immediately
  useEffect(() => {
    setKineticLang(lang);
  }, [lang]);

  // Periodic kinetic brand animation during regular browsing (every 3.6s)
  useEffect(() => {
    const timer = setInterval(() => {
      setKineticLang((prev) => (prev === 'en' ? 'ar' : 'en'));
    }, 3600);
    return () => clearInterval(timer);
  }, []);

  // Auto focus input when opened & refresh recent searches
  useEffect(() => {
    if (isSearchOpen) {
      try {
        const saved = localStorage.getItem(SEARCH_HISTORY_KEY);
        if (saved) setRecentSearches(JSON.parse(saved));
      } catch {}
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isSearchOpen]);

  // Handle Escape key to close/clear search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) {
        if (searchQuery) {
          onSearchChange('');
        } else {
          onToggleSearch(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, searchQuery, onSearchChange, onToggleSearch]);

  const handleClear = () => {
    onSearchChange('');
    inputRef.current?.focus();
  };

  const handleClose = () => {
    if (searchQuery.trim()) {
      saveSearchTerm(searchQuery);
    }
    onSearchChange('');
    onToggleSearch(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      saveSearchTerm(searchQuery);
      inputRef.current?.blur();
    }
  };

  const handleSelectRecent = (term: string) => {
    onSearchChange(term);
    saveSearchTerm(term);
    inputRef.current?.focus();
  };

  const suggestedKeywords = lang === 'ar'
    ? ['صوف', 'كشمير', 'معطف', 'أزياء رسمية', 'أحذية', 'سترة']
    : ['Wool', 'Cashmere', 'Coat', 'Tailoring', 'Shoes', 'Blazer'];

  return (
    <header
      className={`sticky top-0 z-30 border-b pt-[env(safe-area-inset-top)] transition-[background-color,backdrop-filter,border-color] duration-300 ${
        scrolled
          ? 'border-black/5 bg-white/85 dark:border-white/10 dark:bg-[#0d0f12]/85 backdrop-blur-xl backdrop-saturate-150 shadow-[0_1px_3px_rgba(0,0,0,0.03)]'
          : 'border-transparent bg-[#f8f9fa] dark:bg-[#0d0f12]'
      }`}
    >
      {/* Strict LTR Container ensures buttons NEVER jump or swap sides on language toggle */}
      <div
        dir="ltr"
        style={{ direction: 'ltr' }}
        className="relative mx-auto flex h-14 sm:h-15 md:h-16 max-w-7xl xl:max-w-[1440px] 2xl:max-w-[1536px] w-full items-center justify-between px-3.5 sm:px-6 md:px-8 [direction:ltr]"
      >
        <AnimatePresence mode="wait" initial={false}>
          {isSearchOpen ? (
            /* Expandable Inline Search Bar */
            <motion.div
              key="header-search-bar"
              initial={{ opacity: 0, y: -4, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.99 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex w-full items-center gap-2 sm:gap-3"
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
            >
              <div className="relative flex flex-1 items-center">
                <Search
                  className={`absolute pointer-events-none h-4 w-4 text-[#6b7280] dark:text-[#9ca3af] ${
                    lang === 'ar' ? 'right-3 md:right-3.5' : 'left-3 md:left-3.5'
                  }`}
                  aria-hidden="true"
                />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    lang === 'ar'
                      ? 'ابحث بالاسم، الخامة (صوف، كشمير)، أو القطعة...'
                      : 'Search by name, fabric (wool, cashmere), or style...'
                  }
                  className={`h-9.5 sm:h-10 md:h-11 w-full rounded-full border border-black/10 dark:border-white/15 bg-white/95 dark:bg-[#16191f] text-[12.5px] md:text-[13.5px] text-[#15171c] dark:text-[#f3f4f6] placeholder:text-[#6b7280]/70 dark:placeholder:text-[#9ca3af]/60 transition-all duration-200 outline-none focus:border-[#004ad7] dark:focus:border-[#3b82f6] focus:ring-2 focus:ring-[#004ad7]/20 ${
                    lang === 'ar' ? 'pr-9 pl-9 md:pr-10 md:pl-10' : 'pl-9 pr-9 md:pl-10 md:pr-10'
                  }`}
                  aria-label={lang === 'ar' ? 'البحث في المجموعة' : 'Search collection'}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className={`absolute flex h-6 w-6 items-center justify-center rounded-full text-[#6b7280] dark:text-[#9ca3af] hover:bg-black/5 dark:hover:bg-white/10 hover:text-[#15171c] dark:hover:text-white transition-colors cursor-pointer ${
                      lang === 'ar' ? 'left-2 md:left-2.5' : 'right-2 md:right-2.5'
                    }`}
                    aria-label={lang === 'ar' ? 'مسح البحث' : 'Clear search'}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="shrink-0 px-3 py-1.5 md:px-4 md:py-2 md:h-10 flex items-center justify-center rounded-full text-xs md:text-[13px] font-semibold text-[#6b7280] dark:text-[#9ca3af] hover:text-[#15171c] dark:hover:text-white transition-colors cursor-pointer"
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
            </motion.div>
          ) : (
            /* Balanced, Fixed Spatial Header Layout with Brand in Exact Dead Center */
            <motion.div
              key="header-default-bar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              className="flex w-full items-center justify-between"
            >
              {/* Left Actions Group: Search + Wishlist (Locked on Left side in both Arabic & English) */}
              <div className="flex items-center justify-start gap-1 sm:gap-2 md:gap-2.5 min-w-[76px] sm:min-w-[96px] md:min-w-[120px] z-10 [direction:ltr]">
                {/* Search Toggle */}
                {searchControl.visible && (
                  <button
                    type="button"
                    onClick={() => onToggleSearch(true)}
                    className="flex h-9 w-9 sm:h-9.5 sm:w-9.5 md:h-10 md:w-10 items-center justify-center rounded-full text-[#15171c]/80 dark:text-white/80 transition-all hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 cursor-pointer"
                    aria-label={lang === 'ar' ? 'فتح شريط البحث' : 'Open search'}
                    title={lang === 'ar' ? searchControl.label_ar : searchControl.label_en}
                  >
                    <Search className="h-4 w-4 md:h-4.5 md:w-4.5 stroke-[1.8]" />
                  </button>
                )}

                {/* Wishlist Toggle Button */}
                {wishlistControl.visible && onToggleWishlistOnly && (
                  <button
                    type="button"
                    onClick={onToggleWishlistOnly}
                    className={`relative flex h-9 w-9 sm:h-9.5 sm:w-9.5 md:h-10 md:w-10 items-center justify-center rounded-full transition-all active:scale-90 cursor-pointer ${
                      isWishlistOnly
                        ? 'bg-[#004ad7]/15 dark:bg-[#3b82f6]/20 text-[#004ad7] dark:text-[#3b82f6]'
                        : 'text-[#15171c]/80 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/10'
                    }`}
                    aria-label={lang === 'ar' ? wishlistControl.label_ar : wishlistControl.label_en}
                    title={
                      isWishlistOnly
                        ? lang === 'ar' ? 'عرض الكل' : 'Show all'
                        : lang === 'ar' ? wishlistControl.label_ar : wishlistControl.label_en
                    }
                  >
                    <Heart className={`h-4 w-4 md:h-4.5 md:w-4.5 stroke-[1.8] ${isWishlistOnly ? 'fill-current' : ''}`} />
                    {wishlistCount > 0 && (
                      <span className="absolute top-0.5 right-0.5 flex h-3.5 min-w-3.5 md:h-4 md:min-w-4 items-center justify-center rounded-full bg-[#004ad7] dark:bg-[#3b82f6] px-0.5 text-[8.5px] md:text-[9.5px] font-bold text-white shadow-xs">
                        {wishlistCount}
                      </span>
                    )}
                  </button>
                )}
              </div>

              {/* Brand lockup in EXACT mathematical optical center on Mobile, Tablet & Desktop */}
              {logoControl.visible && (
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-9 sm:h-10 md:h-11 items-center justify-center overflow-hidden pointer-events-auto z-10">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.h1
                      key={kineticLang}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.22, ease: 'easeInOut' }}
                      onClick={() => {
                        setKineticLang((prev) => (prev === 'en' ? 'ar' : 'en'));
                      }}
                      className={`select-none text-[18px] sm:text-[20px] md:text-[22px] lg:text-[23px] font-bold text-[#15171c] dark:text-white cursor-pointer text-center active:opacity-75 transition-opacity ${
                        kineticLang === 'ar'
                          ? 'tracking-[0.06em]'
                          : 'tracking-[0.28em] uppercase font-extrabold'
                      }`}
                      aria-label={kineticLang === 'ar' ? 'فانت' : 'VANT'}
                      title={kineticLang === 'ar' ? 'انقر للتبديل إلى الإنجليزية' : 'Click to switch to Arabic'}
                    >
                      {kineticLang === 'ar' ? (logoControl.label_ar || 'فانت') : (logoControl.label_en || 'VANT')}
                    </motion.h1>
                  </AnimatePresence>
                </div>
              )}

              {/* Right Actions Group: Theme Mode + Language (Locked on Right side in both Arabic & English) */}
              <div className="flex items-center justify-end gap-1.5 sm:gap-2 md:gap-2.5 min-w-[76px] sm:min-w-[96px] md:min-w-[120px] z-10 [direction:ltr]">
                {/* Enhanced Dark Mode Toggle */}
                {themeControl.visible && (
                  <button
                    type="button"
                    onClick={onToggleTheme}
                    className="relative flex h-9 w-9 sm:h-9.5 sm:w-9.5 md:h-10 md:w-10 items-center justify-center rounded-full text-[#15171c]/80 dark:text-white/80 transition-all hover:bg-black/5 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                    aria-label={
                      theme === 'dark'
                        ? lang === 'ar'
                          ? 'تفعيل الوضع الفاتح'
                          : 'Switch to light mode'
                        : lang === 'ar'
                        ? 'تفعيل الوضع الداكن'
                        : 'Switch to dark mode'
                    }
                    title={theme === 'dark' ? (lang === 'ar' ? 'الوضع الفاتح' : 'Light Mode') : (lang === 'ar' ? 'الوضع الداكن' : 'Dark Mode')}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {theme === 'dark' ? (
                        <motion.div
                          key="sun"
                          initial={{ rotate: -120, scale: 0.3, opacity: 0 }}
                          animate={{ rotate: 0, scale: 1, opacity: 1 }}
                          exit={{ rotate: 120, scale: 0.3, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 420, damping: 20 }}
                          className="flex items-center justify-center text-[#3b82f6] drop-shadow-[0_0_8px_rgba(59,130,246,0.35)]"
                        >
                          <Sun className="h-4 w-4 md:h-4.5 md:w-4.5 stroke-[1.8]" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="moon"
                          initial={{ rotate: 120, scale: 0.3, opacity: 0 }}
                          animate={{ rotate: 0, scale: 1, opacity: 1 }}
                          exit={{ rotate: -120, scale: 0.3, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 420, damping: 20 }}
                          className="flex items-center justify-center text-[#15171c] drop-shadow-[0_0_6px_rgba(0,0,0,0.15)]"
                        >
                          <Moon className="h-4 w-4 md:h-4.5 md:w-4.5 stroke-[1.8]" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                )}

                {/* Language Switch (Fixed on right side, clean minimal luxury pill) */}
                {langControl.visible && (
                  <button
                    type="button"
                    onClick={onToggleLang}
                    className="group flex items-center gap-1.5 rounded-full border border-black/8 dark:border-white/15 bg-white/70 dark:bg-white/10 px-2.5 py-1 sm:px-3 sm:py-1.5 md:h-9.5 lg:h-10 md:px-3.5 text-[11px] md:text-xs font-bold tracking-wide text-[#15171c] dark:text-white transition-all hover:bg-black/5 dark:hover:bg-white/15 active:scale-95 cursor-pointer shadow-2xs"
                    aria-label={lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
                    title={lang === 'ar' ? 'التبديل إلى اللغة الإنجليزية' : 'Switch to Arabic'}
                  >
                    <motion.span
                      key={lang}
                      initial={{ scale: 0.72, rotate: -30 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 420, damping: 22 }}
                      className="inline-flex items-center justify-center text-black/60 dark:text-white/70 group-hover:text-black dark:group-hover:text-white"
                    >
                      <Globe className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    </motion.span>
                    <motion.span
                      key={`lbl-${lang}`}
                      initial={{ opacity: 0, y: 1 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18 }}
                    >
                      {lang === 'ar' ? 'EN' : 'عربي'}
                    </motion.span>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Recent Searches Dropdown Popover */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="w-full border-t border-black/5 dark:border-white/10 bg-white/95 dark:bg-[#0d0f12]/95 backdrop-blur-2xl shadow-xl py-3 px-3.5 sm:px-6 md:px-8"
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
          >
            <div className="mx-auto max-w-7xl xl:max-w-[1440px] 2xl:max-w-[1536px]">
              {recentSearches.length > 0 ? (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-[#6b7280] dark:text-[#9ca3af]">
                    <div className="flex items-center gap-1.5 font-semibold text-[#15171c] dark:text-[#f3f4f6]">
                      <History className="h-3.5 w-3.5 text-[#004ad7] dark:text-[#3b82f6]" />
                      <span>{lang === 'ar' ? 'عمليات البحث الأخيرة' : 'Recent Searches'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={clearAllSearches}
                      className="flex items-center gap-1 hover:text-red-500 dark:hover:text-red-400 text-[11px] font-medium transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3 opacity-70" />
                      <span>{lang === 'ar' ? 'مسح السجل' : 'Clear all'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap pt-0.5">
                    {recentSearches.map((term) => (
                      <div
                        key={term}
                        className="group inline-flex items-center gap-1.5 rounded-full border border-black/8 dark:border-white/12 bg-black/[0.03] dark:bg-white/[0.05] hover:bg-black/[0.07] dark:hover:bg-white/[0.1] px-3 py-1 text-xs text-[#15171c] dark:text-white transition-all cursor-pointer shadow-2xs"
                        onClick={() => handleSelectRecent(term)}
                      >
                        <History className="h-3 w-3 text-[#6b7280] dark:text-[#9ca3af]" />
                        <span className="font-medium">{term}</span>
                        <button
                          type="button"
                          onClick={(e) => removeSearchTerm(term, e)}
                          className="text-[#6b7280] hover:text-red-500 dark:text-[#9ca3af] dark:hover:text-red-400 p-0.5 rounded-full transition-colors cursor-pointer"
                          aria-label={`Remove ${term}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#6b7280] dark:text-[#9ca3af]">
                    <Sparkles className="h-3.5 w-3.5 text-[#004ad7] dark:text-[#3b82f6]" />
                    <span>{lang === 'ar' ? 'كلمات مقترحة للبحث' : 'Suggested Searches'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap pt-0.5">
                    {suggestedKeywords.map((kw) => (
                      <button
                        key={kw}
                        type="button"
                        onClick={() => handleSelectRecent(kw)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-black/8 dark:border-white/12 bg-black/[0.03] dark:bg-white/[0.05] hover:bg-[#004ad7]/10 dark:hover:bg-[#3b82f6]/15 hover:border-[#004ad7]/30 dark:hover:border-[#3b82f6]/30 hover:text-[#004ad7] dark:hover:text-[#3b82f6] px-3 py-1 text-xs text-[#15171c] dark:text-white transition-all cursor-pointer shadow-2xs font-medium"
                      >
                        <Search className="h-3 w-3 opacity-60" />
                        <span>{kw}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {children}
    </header>
  );
}
