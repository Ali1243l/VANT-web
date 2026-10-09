import React from 'react';
import type { Product, Language } from '../types';
import ProductCard from './ProductCard';
import SkeletonCard from './SkeletonCard';

interface Props {
  products: Product[];
  loading?: boolean;
  loadingMore?: boolean;
  lang: Language;
  onOpen?: (p: Product) => void;
  onSelect?: (p: Product) => void;
  isWishlisted?: (id: string | number) => boolean;
  onToggleWishlist?: (id: string | number) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  layout?: 'grid-4' | 'grid-2';
}

export default function MasonryGrid({
  products,
  loading,
  loadingMore,
  lang,
  onOpen,
  onSelect,
  isWishlisted,
  onToggleWishlist,
  layout = 'grid-4',
}: Props) {
  const handleOpen = onOpen || onSelect || (() => {});

  const gridClasses =
    layout === 'grid-2'
      ? 'grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 pb-4 pt-2 w-full max-w-5xl mx-auto'
      : 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-6 xl:gap-8 pb-4 pt-2 w-full max-w-screen-2xl mx-auto';

  if (loading) {
    return (
      <div className={gridClasses} aria-busy="true" aria-label="Loading archive catalog">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} aspectRatioClass="aspect-[3/4]" index={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="px-4 py-20 text-center max-w-md mx-auto">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/[0.03] dark:bg-white/[0.04] text-[#6b7280] dark:text-[#9ca3af]">
          <span className="text-sm font-semibold">Ø</span>
        </div>
        <p className="text-xs sm:text-sm text-[#6b7280] dark:text-[#9ca3af] leading-relaxed">
          {lang === 'ar'
            ? 'لا توجد قطع مطابقة لهذا الاختيار حالياً. يمكنك تغيير التصنيف أو التصفية.'
            : 'No pieces match your selection currently. Try adjusting your category or fabric filter.'}
        </p>
      </div>
    );
  }

  return (
    <div className={gridClasses}>
      {products.map((p, i) => (
        <ProductCard
          key={p.id}
          product={p}
          index={i}
          lang={lang}
          isWishlisted={isWishlisted ? isWishlisted(p.id) : false}
          onToggleWishlist={onToggleWishlist}
          onOpen={handleOpen}
        />
      ))}
      {loadingMore &&
        Array.from({ length: 4 }).map((_, idx) => (
          <SkeletonCard key={`more-skeleton-${idx}`} aspectRatioClass="aspect-[3/4]" index={products.length + idx} />
        ))}
    </div>
  );
}
