import type { Product, Language } from '../types';
import ProductCard from './ProductCard';
import SkeletonCard from './SkeletonCard';

interface Props {
  products: Product[];
  loading?: boolean;
  loadingMore?: boolean;
  lang: Language;
  onOpen: (p: Product) => void;
  isWishlisted?: (id: string | number) => boolean;
  onToggleWishlist?: (id: string | number) => void;
}

const SKELETON_ASPECTS = [
  'aspect-[3/4]',
  'aspect-[4/5]',
  'aspect-[3/4]',
  'aspect-[1/1]',
  'aspect-[4/5]',
  'aspect-[3/4]',
  'aspect-[4/5]',
  'aspect-[1/1]',
  'aspect-[3/4]',
  'aspect-[4/5]',
  'aspect-[3/4]',
  'aspect-[4/5]',
];

export default function MasonryGrid({
  products,
  loading,
  loadingMore,
  lang,
  onOpen,
  isWishlisted,
  onToggleWishlist,
}: Props) {
  const columns =
    'columns-2 gap-3 pb-16 pt-2 sm:columns-2 sm:gap-4 md:columns-3 md:gap-5 lg:columns-3 xl:columns-4 xl:gap-6 2xl:columns-4 2xl:gap-7 w-full max-w-7xl xl:max-w-[1440px] 2xl:max-w-[1536px] mx-auto';

  if (loading) {
    return (
      <div className={columns} aria-busy="true" aria-label="Loading archive catalog">
        {SKELETON_ASPECTS.map((aspect, i) => (
          <SkeletonCard key={i} aspectRatioClass={aspect} index={i} />
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
    <div className={columns}>
      {products.map((p, i) => (
        <ProductCard
          key={p.id}
          product={p}
          index={i}
          lang={lang}
          isWishlisted={isWishlisted ? isWishlisted(p.id) : false}
          onToggleWishlist={onToggleWishlist}
          onOpen={onOpen}
        />
      ))}
      {loadingMore &&
        ['aspect-[3/4]', 'aspect-[4/5]', 'aspect-[3/4]', 'aspect-[1/1]'].map((aspect, idx) => (
          <SkeletonCard key={`more-skeleton-${idx}`} aspectRatioClass={aspect} index={products.length + idx} />
        ))}
    </div>
  );
}
