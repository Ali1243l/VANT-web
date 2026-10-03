import { AnimatePresence } from 'framer-motion';
import type { Product, Language } from '../types';
import ProductCard from './ProductCard';
import SkeletonCard from './SkeletonCard';

interface Props {
  products: Product[];
  loading?: boolean;
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
  lang,
  onOpen,
  isWishlisted,
  onToggleWishlist,
}: Props) {
  const columns =
    'columns-2 gap-3 px-3 pb-16 pt-2 sm:columns-3 sm:gap-4 lg:columns-4 lg:px-6 max-w-7xl mx-auto';

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

  // Key whenever product IDs change to smoothly popLayout
  const gridKey = products.map((p) => p.id).join(',');

  return (
    <div className={columns} key={gridKey}>
      <AnimatePresence mode="popLayout">
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
      </AnimatePresence>
    </div>
  );
}
