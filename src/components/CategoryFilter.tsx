import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, SlidersHorizontal, LayoutGrid } from 'lucide-react';
import type { Language } from '../types';
import { useSiteControls } from '../context/SiteControlsContext';

export type AvailabilityFilterType = 'all' | 'in_stock' | 'coming_soon' | 'sold_out';

interface Props {
  categories: string[];
  active: string;
  onChange: (c: string) => void;
  getLabel?: (category: string) => string;
  lang?: Language;
  availability?: AvailabilityFilterType;
  onAvailabilityChange?: (a: AvailabilityFilterType) => void;
  availabilityCounts?: Record<AvailabilityFilterType, number>;
}

export default function CategoryFilter({
  categories,
  active,
  onChange,
  getLabel,
  lang = 'ar',
  availability = 'all',
  onAvailabilityChange,
  availabilityCounts,
}: Props) {
  const { getControl } = useSiteControls();
  const filterControl = getControl('btn_filter_availability');
  const activeRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const isAr = lang === 'ar';

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }, [active]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const availabilityOptions: {
    id: AvailabilityFilterType;
    label_ar: string;
    label_en: string;
    sub_ar: string;
    sub_en: string;
    dot?: string;
  }[] = [
    {
      id: 'all',
      label_ar: 'كافة القطع',
      label_en: 'All Pieces',
      sub_ar: 'عرض جميع المجموعات',
      sub_en: 'View full collection',
    },
    {
      id: 'in_stock',
      label_ar: 'متوفر',
      label_en: 'In Stock',
      sub_ar: 'جاهز للطلب الفوري',
      sub_en: 'Ready to order',
      dot: 'bg-emerald-500',
    },
    {
      id: 'coming_soon',
      label_ar: 'قريباً',
      label_en: 'Coming Soon',
      sub_ar: 'إصدار وتصاميم قادمة',
      sub_en: 'Upcoming release',
      dot: 'bg-sky-400',
    },
    {
      id: 'sold_out',
      label_ar: 'العرض منتهي',
      label_en: 'Sold Out',
      sub_ar: 'قطع غير متوفرة حالياً',
      sub_en: 'Currently archived',
      dot: 'bg-neutral-400',
    },
  ];

  const currentOption = availabilityOptions.find((o) => o.id === availability) || availabilityOptions[0];

  return (
    <nav aria-label="Categories & Filters" className="pb-2.5 pt-0.5 sm:pb-3 sm:pt-1">
      {/* Centered, balanced luxury bar with seamless inline filter */}
      <div className="mx-auto flex max-w-7xl items-center justify-center px-3 sm:px-6">
        <div className="flex items-center gap-2 max-w-full">
          {/* 1. Category Tabs Track (Smooth Scroll, Perfectly Centered on Desktop) */}
          <div
            role="tablist"
            className="no-scrollbar flex items-center gap-1.5 sm:gap-2 overflow-x-auto [scroll-snap-type:x_proximity] select-none py-1"
          >
            {categories.map((c) => {
              const isActive = c === active;
              const displayLabel = getLabel ? getLabel(c) : c;

              return (
                <button
                  key={c}
                  ref={isActive ? activeRef : undefined}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onChange(c)}
                  className={`shrink-0 snap-center whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs sm:text-[13px] font-medium transition-all duration-200 active:scale-95 cursor-pointer ${
                    isActive
                      ? 'bg-[#15171c] dark:bg-white text-white dark:text-[#15171c] font-semibold shadow-xs ring-1 ring-black/10 dark:ring-white/20'
                      : 'bg-black/[0.035] dark:bg-white/[0.06] text-[#6b7280] dark:text-[#9ca3af] hover:text-[#15171c] dark:hover:text-[#f3f4f6] hover:bg-black/[0.06] dark:hover:bg-white/[0.1] border border-black/5 dark:border-white/5'
                  }`}
                >
                  {displayLabel}
                </button>
              );
            })}
          </div>

          {/* 2. Soft Elegant Divider */}
          {filterControl.visible && onAvailabilityChange && (
            <span className="h-4.5 w-px bg-black/12 dark:bg-white/15 shrink-0 mx-0.5" aria-hidden="true" />
          )}

          {/* 3. Availability Filter Pill (Controlled via SiteControls) */}
          {filterControl.visible && onAvailabilityChange && (
            <div className="relative shrink-0 z-20" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-haspopup="true"
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs sm:text-[13px] font-medium transition-all duration-200 active:scale-95 cursor-pointer border ${
                  availability !== 'all'
                    ? 'border-[#004ad7]/30 dark:border-[#3b82f6]/30 bg-[#004ad7]/10 dark:bg-[#3b82f6]/15 text-[#004ad7] dark:text-[#3b82f6] font-semibold'
                    : isOpen
                    ? 'bg-black/[0.06] dark:bg-white/[0.1] text-[#15171c] dark:text-[#f3f4f6] border-black/10 dark:border-white/10'
                    : 'bg-black/[0.035] dark:bg-white/[0.06] text-[#6b7280] dark:text-[#9ca3af] hover:text-[#15171c] dark:hover:text-[#f3f4f6] hover:bg-black/[0.06] dark:hover:bg-white/[0.1] border-black/5 dark:border-white/5'
                }`}
              >
                <SlidersHorizontal className="h-3.5 w-3.5 opacity-60" />
                <span>{isAr ? currentOption.label_ar : currentOption.label_en}</span>
                {currentOption.dot && (
                  <span className={`h-1.5 w-1.5 rounded-full ${currentOption.dot}`} />
                )}
                <motion.span
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="inline-flex items-center"
                >
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </motion.span>
              </button>

              {/* Floating Dropdown Menu with Spring Physics & Deep Glass Blur */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 4 }}
                    transition={{ type: 'spring', stiffness: 480, damping: 30 }}
                    role="menu"
                    className="absolute z-50 mt-2.5 min-w-[245px] sm:min-w-[260px] rounded-2xl border border-black/8 dark:border-white/12 bg-white/95 dark:bg-[#12141a]/95 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.14),0_6px_18px_rgba(0,0,0,0.06)] dark:shadow-[0_24px_55px_rgba(0,0,0,0.85),0_6px_20px_rgba(0,0,0,0.5)] backdrop-blur-2xl text-[#15171c] dark:text-white ltr:right-0 ltr:left-auto rtl:left-0 rtl:right-auto max-w-[calc(100vw-32px)]"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-black/6 dark:border-white/8 mb-1.5">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-[#6b7280] dark:text-[#9ca3af] uppercase select-none">
                        <SlidersHorizontal className="h-3 w-3 opacity-70" />
                        <span>{isAr ? 'حالة التوفر' : 'Availability'}</span>
                      </div>
                      {availability !== 'all' && (
                        <button
                          type="button"
                          onClick={() => {
                            onAvailabilityChange('all');
                            setIsOpen(false);
                          }}
                          className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-[#004ad7]/10 dark:bg-[#3b82f6]/15 text-[#004ad7] dark:text-[#60a5fa] hover:bg-[#004ad7]/20 transition-colors cursor-pointer"
                        >
                          {isAr ? 'إعادة ضبط' : 'Reset'}
                        </button>
                      )}
                    </div>

                    {/* Filter Options List */}
                    <div className="space-y-1">
                      {availabilityOptions.map((opt) => {
                        const isSelected = availability === opt.id;
                        const count = availabilityCounts ? availabilityCounts[opt.id] : undefined;

                        return (
                          <button
                            key={opt.id}
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              onAvailabilityChange(opt.id);
                              setIsOpen(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs sm:text-[13px] transition-all duration-150 cursor-pointer ${
                              isSelected
                                ? 'bg-[#004ad7]/10 dark:bg-[#3b82f6]/15 text-[#004ad7] dark:text-[#60a5fa] font-semibold ring-1 ring-[#004ad7]/20 dark:ring-[#3b82f6]/30 shadow-2xs'
                                : 'hover:bg-black/4 dark:hover:bg-white/6 text-neutral-700 dark:text-neutral-200 hover:text-black dark:hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              {/* Dedicated Icon Badge */}
                              <div
                                className={`flex h-7 w-7 items-center justify-center rounded-xl shrink-0 transition-colors ${
                                  opt.id === 'all'
                                    ? 'bg-black/5 dark:bg-white/10 text-neutral-700 dark:text-neutral-200'
                                    : opt.id === 'in_stock'
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                    : opt.id === 'coming_soon'
                                    ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
                                    : 'bg-neutral-500/10 text-neutral-500 dark:text-neutral-400'
                                }`}
                              >
                                {opt.id === 'all' ? (
                                  <LayoutGrid className="h-3.5 w-3.5" />
                                ) : (
                                  <span
                                    className={`h-2 w-2 rounded-full ${
                                      opt.id === 'in_stock'
                                        ? 'bg-emerald-500 ring-2 ring-emerald-500/30'
                                        : opt.id === 'coming_soon'
                                        ? 'bg-sky-400 ring-2 ring-sky-400/30'
                                        : 'bg-neutral-400 ring-2 ring-neutral-400/25'
                                    }`}
                                  />
                                )}
                              </div>

                              {/* Title & Micro Subtitle */}
                              <div className="flex flex-col text-start">
                                <span className="leading-snug">{isAr ? opt.label_ar : opt.label_en}</span>
                                <span className="text-[10px] text-[#6b7280] dark:text-[#9ca3af] font-normal leading-tight mt-0.5">
                                  {isAr ? opt.sub_ar : opt.sub_en}
                                </span>
                              </div>
                            </div>

                            {/* Count & Check Indicator */}
                            <div className="flex items-center gap-2">
                              {typeof count === 'number' && (
                                <span
                                  className={`text-[11px] font-mono tabular-nums px-2 py-0.5 rounded-full font-semibold ${
                                    isSelected
                                      ? 'bg-[#004ad7]/15 dark:bg-[#3b82f6]/25 text-[#004ad7] dark:text-[#93c5fd]'
                                      : 'bg-black/5 dark:bg-white/10 text-neutral-500 dark:text-neutral-400'
                                  }`}
                                >
                                  {count}
                                </span>
                              )}
                              {isSelected ? (
                                <Check className="h-3.5 w-3.5 stroke-[2.5] text-[#004ad7] dark:text-[#3b82f6] shrink-0" />
                              ) : (
                                <span className="w-3.5" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
