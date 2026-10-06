import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowDown, ChevronLeft, ChevronRight, ArrowUpRight, Sparkles } from 'lucide-react';
import type { Language } from '../types';
import { useSiteControls } from '../context/SiteControlsContext';

interface Props {
  lang: Language;
  onExplore: () => void;
  onDismiss: () => void;
  onSelectCategory?: (category: string) => void;
  backgroundImageUrl?: string;
  isOpen: boolean;
  activeCategory?: string;
}

interface TrendItem {
  id: string;
  category: string;
  titleEn: string;
  titleAr: string;
  subtitleEn: string;
  subtitleAr: string;
  tagEn: string;
  tagAr: string;
  image: string;
}

export function toWesternNumerals(str: string): string {
  if (!str) return '';
  return str
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
}

const FEATURED_TRENDS: TrendItem[] = [
  {
    id: 'trend-1',
    category: 'Tailoring',
    titleEn: 'Sculptural Tailoring',
    titleAr: 'الخياطة المنحوتة',
    subtitleEn: 'Sharp shoulders & dropped closures',
    subtitleAr: 'أكتاف هندسية وتفاصيل حرة',
    tagEn: '01 / STRUCTURE',
    tagAr: '01 / الهيكل',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'trend-2',
    category: 'Outerwear',
    titleEn: 'Raw Edge Cashmere',
    titleAr: 'الكشمير الطبيعي الخام',
    subtitleEn: '650gsm unlined double-face',
    subtitleAr: 'كشمير منغولي مزدوج الوجه',
    tagEn: '02 / TEXTURE',
    tagAr: '02 / الملمس',
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'trend-3',
    category: 'Knitwear',
    titleEn: 'Heavy Rib Knitwear',
    titleAr: 'التريكو السميك المضلع',
    subtitleEn: 'Sculptural 7-gauge merino',
    subtitleAr: 'صوف ميرينو سميك عيار 7',
    tagEn: '03 / VOLUME',
    tagAr: '03 / الحجم',
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'trend-4',
    category: 'Accessories',
    titleEn: 'Monolithic Leather',
    titleAr: 'الجلود المعمارية الصلبة',
    subtitleEn: 'Full-grain box calf & palladium',
    subtitleAr: 'جلد عجل فرنسي بقطع البلاديوم',
    tagEn: '04 / ACCENT',
    tagAr: '04 / التفاصيل',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'trend-5',
    category: 'Footwear',
    titleEn: 'Bevelled Square-Toe',
    titleAr: 'الأحذية بمقدمة مربعة',
    subtitleEn: 'Stacked leather & hand-waxed finish',
    subtitleAr: 'جلد ملمع بنعل كلاسيكي مكدس',
    tagEn: '05 / GROUND',
    tagAr: '05 / الأساس',
    image: 'https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?auto=format&fit=crop&w=600&q=80',
  },
];

const DEFAULT_BANNER_BG = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80';

export default function WelcomeHeroBanner({
  lang,
  onExplore,
  onDismiss,
  onSelectCategory,
  backgroundImageUrl = DEFAULT_BANNER_BG,
  isOpen,
  activeCategory,
}: Props) {
  const isAr = lang === 'ar';
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { getControl } = useSiteControls();

  const heroVisibleControl = getControl('banner_hero_visible');
  const heroTitleControl = getControl('banner_hero_title');
  const heroSubtitleControl = getControl('banner_hero_subtitle');
  const heroTagControl = getControl('banner_hero_tag');
  const heroBtnControl = getControl('banner_hero_btn');
  const heroBgControl = getControl('banner_hero_bg');
  const trendsTitleControl = getControl('banner_trends_title');
  const { trendItems } = useSiteControls();

  const isAllCategory = !activeCategory || activeCategory === 'All' || activeCategory === 'الكل';

  const bgImage = heroBgControl.actionValue || backgroundImageUrl;
  const activeTrendsList = trendItems && trendItems.length > 0 ? trendItems : FEATURED_TRENDS;
  const trendsCount = activeTrendsList.length;

  const scrollTrends = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const distance = 240;
    const scrollAmount = direction === 'left' ? -distance : distance;
    scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const handleTrendClick = (cat: string) => {
    if (onSelectCategory) {
      onSelectCategory(cat);
    }
    onExplore();
  };

  if (!heroVisibleControl.visible) {
    return null;
  }

  const headlineText = toWesternNumerals(isAr ? heroTitleControl.label_ar : heroTitleControl.label_en);
  const subtitleText = toWesternNumerals(isAr ? heroSubtitleControl.label_ar : heroSubtitleControl.label_en);
  const tagText = toWesternNumerals(isAr ? heroTagControl.label_ar : heroTagControl.label_en);
  const btnText = isAr ? heroBtnControl.label_ar : heroBtnControl.label_en;
  const trendsHeadline = toWesternNumerals(isAr ? trendsTitleControl.label_ar : trendsTitleControl.label_en);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.section
          key="welcome-hero-banner"
          initial={{ opacity: 0, height: 0, y: -12, marginBottom: 0 }}
          animate={{ opacity: 1, height: 'auto', y: 0, marginBottom: 24 }}
          exit={{ opacity: 0, height: 0, y: -12, marginBottom: 0 }}
          transition={{
            height: { duration: 0.38, ease: [0.32, 0.72, 0, 1] },
            marginBottom: { duration: 0.38, ease: [0.32, 0.72, 0, 1] },
            opacity: { duration: 0.25, ease: 'easeInOut' },
            y: { duration: 0.28, ease: 'easeOut' },
          }}
          className="overflow-hidden w-full"
          aria-label={isAr ? 'أصل التشكيلة وتريند الموسم' : 'Collection Foundation & Featured Trends'}
        >
          {/* Card 1: Top Hero Welcome Banner with Editorial Background Image Layer */}
          <div className="relative overflow-hidden rounded-2xl sm:rounded-[28px] border border-black/8 dark:border-white/10 bg-white dark:bg-[#090b0f] p-4 sm:p-6 md:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
            
            {/* Background Image Layer: Bright & crystal-clear on the photo side, fading seamlessly into dark/black on the text side */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
              <img
                src={bgImage}
                alt=""
                className={`h-full w-full object-cover transition-all duration-700 ${
                  isAr ? 'object-left sm:object-left' : 'object-right sm:object-right'
                } opacity-95 sm:opacity-100 dark:opacity-90 dark:sm:opacity-95 contrast-[1.04] brightness-[1.02] scale-100 sm:scale-102`}
              />
              {/* Luxury Cinematic Gradient Fade: Solid dark/black behind text side, feathering smoothly to 100% clear & vivid image on photo side */}
              <div
                className={`absolute inset-0 ${
                  isAr
                    ? 'bg-gradient-to-l from-white via-white/80 via-40% to-transparent to-85% dark:from-[#090b0f] dark:via-[#090b0f]/85 dark:via-40% dark:to-transparent dark:to-85%'
                    : 'bg-gradient-to-r from-white via-white/80 via-40% to-transparent to-85% dark:from-[#090b0f] dark:via-[#090b0f]/85 dark:via-40% dark:to-transparent dark:to-85%'
                }`}
              />
            </div>

            {/* Content Container (Layered above background image) */}
            <div className="relative z-10">
              {/* Minimalist Top Editorial Bar */}
              <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-black/8 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <span className="flex h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-[#004ad7] dark:bg-[#3b82f6]" />
                  <span className={`text-[10px] sm:text-[11px] font-semibold text-[#15171c] dark:text-[#f3f4f6] ${isAr ? 'tracking-normal font-sans' : 'tracking-[0.16em] sm:tracking-[0.22em] uppercase font-sans'}`}>
                    {tagText}
                  </span>
                  <span className="hidden sm:inline text-black/20 dark:text-white/20">|</span>
                  <span className="hidden sm:inline text-[11px] text-[#6b7280] dark:text-[#9ca3af]">
                    {isAr ? 'إصدار أرشيفي محدود' : 'Archived Capsule Release'}
                  </span>
                </div>

                {/* Dismiss Button */}
                <button
                  type="button"
                  onClick={onDismiss}
                  className="flex h-6 w-6 sm:h-7 sm:w-7 md:h-9 md:w-9 items-center justify-center rounded-full text-[#6b7280] dark:text-[#9ca3af] hover:bg-black/5 dark:hover:bg-white/10 hover:text-[#15171c] dark:hover:text-white transition-all active:scale-90 cursor-pointer"
                  aria-label={isAr ? 'إخفاء المقدمة' : 'Dismiss intro'}
                  title={isAr ? 'إخفاء' : 'Dismiss'}
                >
                  <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-4.5 md:w-4.5" />
                </button>
              </div>

              {/* Editorial Statement & Brand Manifesto */}
              <div className="pt-3 sm:pt-4 flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-6">
                <div className="max-w-2xl">
                  <h2 className={`text-xl sm:text-2xl md:text-[28px] lg:text-[30px] font-semibold text-[#15171c] dark:text-white leading-snug sm:leading-[1.25] ${isAr ? 'tracking-normal' : 'tracking-tight'}`}>
                    {headlineText}
                  </h2>
                  <p className="mt-1.5 text-[11px] sm:text-xs md:text-sm lg:text-[15px] text-[#15171c]/80 dark:text-white/80 leading-relaxed max-w-xl">
                    {subtitleText}
                  </p>
                </div>

                {/* Primary Direct Explore Button - Professional Luxury Styling */}
                <div className="shrink-0 flex items-center">
                  <button
                    type="button"
                    onClick={onExplore}
                    className="group inline-flex items-center gap-2 rounded-full bg-[#15171c] hover:bg-black dark:bg-white dark:hover:bg-white/95 px-4 py-2 sm:px-5 sm:py-2.5 md:h-11 md:px-6 lg:h-12 lg:px-7 text-xs sm:text-[13px] md:text-sm font-bold text-white dark:text-[#15171c] transition-all active:scale-95 shadow-md hover:shadow-lg dark:shadow-[0_4px_16px_rgba(255,255,255,0.12)] border border-black/10 dark:border-white/20 cursor-pointer"
                  >
                    <span className={isAr ? 'tracking-normal' : 'tracking-wide'}>{btnText}</span>
                    <ArrowDown className="h-3.5 w-3.5 md:h-4 md:w-4 transition-transform duration-300 group-hover:translate-y-0.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Separated, Cleanly Formatted Featured Trends Section */}
          <div className="pt-2.5 sm:pt-3">
            <div className="rounded-2xl sm:rounded-[26px] border border-black/8 dark:border-white/10 bg-white/95 dark:bg-[#13161c]/95 p-3.5 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur-xl">
                    {/* Trends Section Header with Refined Luxury Styling (CSS Selector 2) */}
                    <div className="flex items-center justify-between mb-3 px-0.5">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#004ad7]/10 dark:bg-[#3b82f6]/15 text-[#004ad7] dark:text-[#3b82f6] ring-1 ring-[#004ad7]/20 dark:ring-[#3b82f6]/30">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <h3 className={`text-xs sm:text-sm font-bold text-[#15171c] dark:text-white ${isAr ? 'tracking-normal' : 'tracking-tight uppercase font-sans'}`}>
                  {trendsHeadline}
                </h3>
                {/* Fixed Trend Count Badge: Dynamic count, clean separation, no font-mono on Arabic text */}
                <span className="inline-flex items-center gap-1.5 text-[10.5px] sm:text-[11px] font-semibold text-[#15171c] dark:text-[#f3f4f6] px-2.5 py-0.5 rounded-full bg-black/[0.05] dark:bg-white/[0.08] border border-black/8 dark:border-white/12 shadow-2xs">
                  <span className="font-mono font-bold text-[#004ad7] dark:text-[#60a5fa] tabular-nums">
                    {trendsCount}
                  </span>
                  <span className="font-sans text-[10px] sm:text-[10.5px] text-[#15171c]/70 dark:text-white/70">
                    {isAr ? 'تريندات' : 'Trends'}
                  </span>
                </span>
              </div>

              {/* Horizontal Scroll Navigation Arrows - Refined Luxury Tactile Buttons (Visible on mobile & tablet) */}
              <div className="flex items-center gap-1.5 sm:gap-2 lg:hidden">
                <button
                  type="button"
                  onClick={() => scrollTrends('left')}
                  className="group flex h-8 w-8 sm:h-8.5 sm:w-8.5 md:h-9.5 md:w-9.5 items-center justify-center rounded-full border border-black/10 dark:border-white/15 bg-white/90 dark:bg-[#1a1d24]/90 text-[#15171c] dark:text-white shadow-2xs hover:bg-[#15171c] hover:text-white dark:hover:bg-white dark:hover:text-[#121419] hover:border-[#15171c] dark:hover:border-white active:scale-90 transition-all duration-200 cursor-pointer"
                  aria-label={isAr ? 'التمرير لليسار' : 'Scroll left'}
                  title={isAr ? 'السابق' : 'Previous'}
                >
                  <ChevronLeft className="h-4 w-4 stroke-[2.2] transition-transform group-hover:-translate-x-0.5" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollTrends('right')}
                  className="group flex h-8 w-8 sm:h-8.5 sm:w-8.5 md:h-9.5 md:w-9.5 items-center justify-center rounded-full border border-black/10 dark:border-white/15 bg-white/90 dark:bg-[#1a1d24]/90 text-[#15171c] dark:text-white shadow-2xs hover:bg-[#15171c] hover:text-white dark:hover:bg-white dark:hover:text-[#121419] hover:border-[#15171c] dark:hover:border-white active:scale-90 transition-all duration-200 cursor-pointer"
                  aria-label={isAr ? 'التمرير لليمين' : 'Scroll right'}
                  title={isAr ? 'التالي' : 'Next'}
                >
                  <ChevronRight className="h-4 w-4 stroke-[2.2] transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>

            {/* Horizontal Scrollable Strip with Proportioned Mobile & Centered Desktop Cards */}
            <div
              ref={scrollContainerRef}
              className="flex items-center justify-start md:justify-center gap-2.5 sm:gap-3.5 md:gap-4 lg:gap-5 overflow-x-auto no-scrollbar scroll-smooth pb-0.5 pt-0.5 -mx-0.5 px-0.5"
            >
              {(trendItems && trendItems.length > 0 ? trendItems : FEATURED_TRENDS).map((trend) => (
                <div
                  key={trend.id}
                  onClick={() => handleTrendClick(trend.category)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleTrendClick(trend.category);
                    }
                  }}
                  className="group relative h-40 w-32 sm:h-52 sm:w-44 md:h-56 md:w-48 lg:h-60 lg:w-52 shrink-0 cursor-pointer overflow-hidden rounded-xl sm:rounded-2xl border border-black/10 dark:border-white/12 bg-[#121419] transition-all duration-300 hover:border-[#004ad7]/40 dark:hover:border-[#3b82f6]/50 hover:shadow-xl dark:hover:shadow-2xl hover:-translate-y-1 select-none isolate [contain:paint]"
                >
                  {/* Background Trend Image with smooth scale anchored at bottom so dark area never moves or shrinks */}
                  <img
                    src={trend.image}
                    alt={isAr ? trend.titleAr : trend.titleEn}
                    className="absolute inset-0 h-full w-full object-cover object-bottom origin-bottom transition-transform duration-500 ease-out group-hover:scale-105 will-change-transform z-0 pointer-events-none"
                    loading="lazy"
                  />

                  {/* Smooth, elegant bottom dark fade with reduced height and ultra-gradual feathering */}
                  <div className="absolute inset-x-0 bottom-0 h-[58%] sm:h-[60%] bg-gradient-to-t from-black/95 from-5% via-black/50 via-45% to-transparent z-[2] pointer-events-none transition-all duration-400 group-hover:from-black group-hover:via-black/65" />

                  {/* Soft ambient top vignette for tag readability */}
                  <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-black/30 to-transparent z-[2] pointer-events-none" />

                  {/* Top Tag Pill - strictly Western numerals */}
                  <div className="absolute top-2 ltr:left-2 rtl:right-2 sm:top-2.5 sm:ltr:left-2.5 sm:rtl:right-2.5 z-10 flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2 py-0.5 text-[8.5px] sm:text-[9.5px] font-bold font-mono tracking-wider text-white/95 border border-white/15 shadow-xs tabular-nums">
                    <span>{toWesternNumerals(isAr ? trend.tagAr : trend.tagEn)}</span>
                  </div>

                  {/* Quick Explore Icon on Hover */}
                  <div className="absolute top-2 ltr:right-2 rtl:left-2 sm:top-2.5 sm:ltr:right-2.5 sm:rtl:left-2.5 z-10 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-white/25 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-xs group-hover:scale-105">
                    <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>

                  {/* Bottom Content Card with polished typography & protected high contrast */}
                  <div className="absolute bottom-0 inset-x-0 p-2.5 sm:p-3.5 z-10 text-white pointer-events-none">
                    <h4 className="text-xs sm:text-[13px] font-bold tracking-tight leading-snug drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)] font-sans">
                      {toWesternNumerals(isAr ? trend.titleAr : trend.titleEn)}
                    </h4>
                    <p className="mt-0.5 text-[9.5px] sm:text-[10.5px] text-white/90 line-clamp-1 leading-normal drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]">
                      {toWesternNumerals(isAr ? trend.subtitleAr : trend.subtitleEn)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
  );
}
