import { useEffect, useState, useRef, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Sun, Moon, Globe, Heart } from 'lucide-react';
import type { Language, Theme } from '../types';
import { useSiteControls } from '../context/SiteControlsContext';

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

  // Auto focus input when opened
  useEffect(() => {
    if (isSearchOpen) {
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
    onSearchChange('');
    onToggleSearch(false);
  };

  return (
    <header
      className={`sticky top-0 z-30 border-b pt-[env(safe-area-inset-top)] transition-[background-color,backdrop-filter,border-color] duration-300 ${
        scrolled
          ? 'border-black/5 bg-white/85 dark:border-white/10 dark:bg-[#0d0f12]/85 backdrop-blur-xl backdrop-saturate-150 shadow-[0_1px_3px_rgba(0,0,0,0.03)]'
          : 'border-transparent bg-[#f8f9fa] dark:bg-[#0d0f12]'
      }`}
    >
      <div className="relative mx-auto flex h-14 max-w-7xl items-center justify-between px-3 sm:px-6">
        {isSearchOpen ? (
          /* Expandable Inline Search Bar */
          <div className="flex w-full items-center gap-2 animate-fade-up">
            <div className="relative flex flex-1 items-center">
              <Search
                className={`absolute pointer-events-none h-4 w-4 text-[#6b7280] dark:text-[#9ca3af] ${
                  lang === 'ar' ? 'right-3' : 'left-3'
                }`}
                aria-hidden="true"
              />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={
                  lang === 'ar'
                    ? 'ابحث بالاسم، الخامة (صوف، كشمير)، أو القطعة...'
                    : 'Search by name, fabric (wool, cashmere), or style...'
                }
                className={`h-9 w-full rounded-full border border-black/10 dark:border-white/15 bg-white/95 dark:bg-[#16191f] text-[13px] text-[#15171c] dark:text-[#f3f4f6] placeholder:text-[#6b7280]/70 dark:placeholder:text-[#9ca3af]/60 transition-all duration-200 outline-none focus:border-[#004ad7] dark:focus:border-[#3b82f6] focus:ring-2 focus:ring-[#004ad7]/20 ${
                  lang === 'ar' ? 'pr-9 pl-9' : 'pl-9 pr-9'
                }`}
                aria-label={lang === 'ar' ? 'البحث في المجموعة' : 'Search collection'}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClear}
                  className={`absolute flex h-6 w-6 items-center justify-center rounded-full text-[#6b7280] dark:text-[#9ca3af] hover:bg-black/5 dark:hover:bg-white/10 hover:text-[#15171c] dark:hover:text-white transition-colors ${
                    lang === 'ar' ? 'left-2' : 'right-2'
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
              className="shrink-0 px-2.5 py-1 text-[13px] font-medium text-[#6b7280] dark:text-[#9ca3af] hover:text-[#15171c] dark:hover:text-white transition-colors"
            >
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        ) : (
          /* Default Minimalist Header Layout with Absolute Optical Centering */
          <>
            {/* Left structural balance spacer */}
            <div className="w-12 sm:w-28 pointer-events-none" aria-hidden="true" />

            {/* Brand lockup in EXACT pixel-perfect mathematical center */}
            {logoControl.visible && (
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-10 flex-col items-center justify-center overflow-hidden pointer-events-auto">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.h1
                    key={kineticLang}
                    initial={{ opacity: 0, y: kineticLang === 'ar' ? 7 : -7, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: kineticLang === 'ar' ? -7 : 7, scale: 0.96 }}
                    transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => setKineticLang((prev) => (prev === 'en' ? 'ar' : 'en'))}
                    className={`select-none text-[20px] sm:text-[22px] font-bold text-[#15171c] dark:text-white transition-colors cursor-pointer text-center ${
                      kineticLang === 'ar' ? 'tracking-[0.08em]' : 'tracking-[0.28em] uppercase'
                    }`}
                    aria-label={kineticLang === 'ar' ? logoControl.label_ar : logoControl.label_en}
                    title={kineticLang === 'ar' ? 'انقر للتبديل إلى الإنجليزية' : 'Click to switch to Arabic'}
                  >
                    {kineticLang === 'ar' ? logoControl.label_ar : logoControl.label_en}
                  </motion.h1>
                </AnimatePresence>
              </div>
            )}

            {/* Right actions: Search + Wishlist + Enhanced Dark Mode + Language */}
            <div className="flex items-center justify-end gap-1 sm:gap-1.5 z-10">
              {/* Search Toggle */}
              {searchControl.visible && (
                <button
                  type="button"
                  onClick={() => onToggleSearch(true)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[#15171c]/80 dark:text-white/80 transition-all hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 cursor-pointer"
                  aria-label={lang === 'ar' ? 'فتح شريط البحث' : 'Open search'}
                  title={lang === 'ar' ? searchControl.label_ar : searchControl.label_en}
                >
                  <Search className="h-4 w-4" />
                </button>
              )}

              {/* Wishlist Toggle Button */}
              {wishlistControl.visible && onToggleWishlistOnly && (
                <button
                  type="button"
                  onClick={onToggleWishlistOnly}
                  className={`relative flex h-8 w-8 items-center justify-center rounded-full transition-all active:scale-90 cursor-pointer ${
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
                  <Heart className={`h-4 w-4 ${isWishlistOnly ? 'fill-current' : ''}`} />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[#004ad7] dark:bg-[#3b82f6] px-0.5 text-[8.5px] font-bold text-white shadow-2xs">
                      {wishlistCount}
                    </span>
                  )}
                </button>
              )}

              {/* Enhanced Dark Mode Toggle */}
              {themeControl.visible && (
                <button
                  type="button"
                  onClick={onToggleTheme}
                  className="relative flex h-8 w-8 items-center justify-center rounded-full text-[#15171c]/80 dark:text-white/80 transition-all hover:bg-black/5 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
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
                        <Sun className="h-4 w-4" />
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
                        <Moon className="h-4 w-4" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              )}

              {/* Language Switch */}
              {langControl.visible && (
                <button
                  type="button"
                  onClick={onToggleLang}
                  className="group flex items-center gap-1.5 rounded-full border border-black/8 dark:border-white/15 bg-white/60 dark:bg-white/10 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-[#15171c] dark:text-white transition-all hover:bg-black/5 dark:hover:bg-white/15 active:scale-95 cursor-pointer"
                  aria-label={lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
                >
                  <motion.span
                    key={lang}
                    initial={{ scale: 0.72, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 22 }}
                    className="inline-flex items-center justify-center text-black/60 dark:text-white/70 group-hover:text-black dark:group-hover:text-white"
                  >
                    <Globe className="h-3.5 w-3.5" />
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
          </>
        )}
      </div>

      {children}
    </header>
  );
}
