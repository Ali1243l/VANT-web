import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { Language } from '../types';

interface Props {
  lang: Language;
  onClose: () => void;
}

export default function ProductDrawerSkeleton({ lang, onClose }: Props) {
  const isAr = lang === 'ar';

  return (
    <>
      {/* Backdrop */}
      <motion.div
        key="skeleton-backdrop"
        className="fixed inset-0 z-40 bg-black/65 dark:bg-black/80 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onClick={onClose}
      />

      {/* Responsive Sheet/Modal Container */}
      <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none md:items-center md:p-6 lg:p-10">
        <motion.div
          key="skeleton-sheet-content"
          role="dialog"
          aria-modal="true"
          aria-busy="true"
          aria-label={isAr ? 'جاري تحميل تفاصيل القطعة' : 'Loading piece details'}
          className="pointer-events-auto relative flex w-full flex-col overflow-hidden bg-[#f8f9fa] dark:bg-[#16191f] shadow-2xl transition-colors duration-250 
                     rounded-t-[28px] max-h-[92dvh]
                     md:max-h-[86vh] md:max-w-4xl lg:max-w-5xl md:rounded-[32px] md:border md:border-black/5 md:dark:border-white/10"
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.25 }}
        >
          {/* Dedicated Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 dark:bg-[#0d0f12]/80 text-[#15171c] dark:text-white backdrop-blur-md shadow-xs border border-black/5 dark:border-white/10 ltr:right-4 rtl:left-4 cursor-pointer"
            aria-label={isAr ? 'إغلاق' : 'Close'}
          >
            <X className="h-4 w-4" />
          </button>

          {/* Responsive Layout Grid */}
          <div className="grid flex-1 overflow-y-auto overscroll-contain md:grid-cols-12 md:overflow-hidden">
            {/* GALLERY SKELETON SECTION (Column 1-7 on desktop) */}
            <div className="relative flex flex-col justify-between bg-black/[0.02] dark:bg-black/20 p-4 sm:p-6 md:col-span-7 md:border-e md:border-black/5 md:dark:border-white/10">
              {/* Main Aspect Ratio Frame with Angled Shimmer Sweep */}
              <div className="relative flex items-center justify-center w-full aspect-[3/4] max-h-[500px] overflow-hidden rounded-3xl bg-neutral-200/80 dark:bg-neutral-800/60 border border-black/5 dark:border-white/10 shadow-inner mx-auto">
                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/50 dark:via-white/12 to-transparent pointer-events-none" />

                {/* Subtle hanger watermark */}
                <div className="opacity-20 dark:opacity-10 pointer-events-none">
                  <svg className="w-16 h-16 stroke-[1.2] text-neutral-400 dark:text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
              </div>

              {/* Thumbnails row skeleton */}
              <div className="mt-4 flex items-center justify-center gap-2.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="relative h-14 w-12 rounded-xl bg-neutral-200/80 dark:bg-neutral-800/70 overflow-hidden border border-black/5 dark:border-white/10"
                  >
                    <div
                      className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent pointer-events-none"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* DETAILS SKELETON SECTION (Column 8-12 on desktop) */}
            <div className="p-5 sm:p-7 md:col-span-5 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                {/* Category & Tag Skeleton Pill */}
                <div className="flex items-center gap-2">
                  <div className="h-5 w-24 rounded-full bg-neutral-200 dark:bg-white/10 animate-pulse" />
                  <div className="h-5 w-16 rounded-full bg-neutral-200/60 dark:bg-white/5 animate-pulse" />
                </div>

                {/* Main Title Skeleton Bars */}
                <div className="space-y-2">
                  <div className="h-7 w-5/6 rounded-lg bg-neutral-300 dark:bg-white/20 animate-pulse" />
                  <div className="h-4 w-3/5 rounded-lg bg-neutral-200/80 dark:bg-white/10 animate-pulse" />
                </div>

                {/* Price Skeleton Pill */}
                <div className="h-10 w-36 rounded-xl bg-neutral-300/80 dark:bg-white/15 animate-pulse" />

                {/* Size Selection Skeleton Section */}
                <div className="pt-3 space-y-2.5 border-t border-black/5 dark:border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="h-3.5 w-24 rounded bg-neutral-200 dark:bg-white/10" />
                    <div className="h-3 w-16 rounded bg-neutral-200/60 dark:bg-white/5" />
                  </div>
                  <div className="flex gap-2">
                    {['S', 'M', 'L', 'XL'].map((s) => (
                      <div
                        key={s}
                        className="h-11 w-13 rounded-xl bg-neutral-200/70 dark:bg-white/10 border border-black/5 dark:border-white/10"
                      />
                    ))}
                  </div>
                </div>

                {/* Description lines skeleton */}
                <div className="pt-2 space-y-2">
                  <div className="h-3 w-full rounded bg-neutral-200/70 dark:bg-white/5" />
                  <div className="h-3 w-4/5 rounded bg-neutral-200/70 dark:bg-white/5" />
                  <div className="h-3 w-2/3 rounded bg-neutral-200/70 dark:bg-white/5" />
                </div>
              </div>

              {/* Bottom Actions Skeleton Row */}
              <div className="space-y-3 pt-4 border-t border-black/5 dark:border-white/10">
                {/* Primary WhatsApp / Order Button Skeleton */}
                <div className="relative h-13 w-full rounded-2xl bg-neutral-300 dark:bg-white/20 overflow-hidden">
                  <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 dark:via-white/15 to-transparent pointer-events-none" />
                </div>

                {/* Secondary Button Row Skeleton */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-10 rounded-xl bg-neutral-200/80 dark:bg-white/10" />
                  <div className="h-10 rounded-xl bg-neutral-200/80 dark:bg-white/10" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
