import React, { useState, useMemo } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Heart, Tag, Check } from 'lucide-react';
import type { Product, Language } from '../types';
import { useSiteControls } from '../context/SiteControlsContext';
import { resolveProductColorVariants } from '../lib/productVariants';

interface Props {
  product: Product;
  index: number;
  lang: Language;
  isWishlisted?: boolean;
  onToggleWishlist?: (id: string | number) => void;
  onOpen: (p: Product) => void;
}

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.28,
      ease: 'easeOut',
    },
  },
};

/**
 * Resolves a 100% stable, deterministic aspect ratio (never changes after initial render).
 * This completely prevents layout shifts, column reflows, and jumping during fast scrolling.
 */
function getDeterministicAspectRatio(
  aspectRatio?: string,
  width?: number | null,
  height?: number | null,
  productId: string | number = 0
): { aspectRatio: string } {
  // 1. Explicit aspect_ratio from database
  if (aspectRatio && aspectRatio.trim()) {
    return { aspectRatio: aspectRatio.replace(':', '/').trim() };
  }

  // 2. Explicit dimensions from database
  if (width && height && width > 0 && height > 0) {
    return { aspectRatio: `${width} / ${height}` };
  }

  // 3. Clean editorial portrait proportion for luxury fashion lookbook (3:4)
  return { aspectRatio: '3 / 4' };
}

export default React.memo(function ProductCard({
  product,
  index,
  lang,
  isWishlisted = false,
  onToggleWishlist,
  onOpen,
}: Props) {
  const { formatPrice } = useSiteControls();
  const [loaded, setLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [naturalRatio, setNaturalRatio] = useState<string | null>(null);

  // Algorithmic color resolution & SKU derivation
  const variantInfo = useMemo(
    () => resolveProductColorVariants(product, product.currency || 'IQD'),
    [product]
  );

  const primaryVariant = variantInfo.baselineVariant || variantInfo.variants[0];
  const primaryVariantIdx = useMemo(() => {
    const pIdx = variantInfo.variants.findIndex(
      (v) => v.id === primaryVariant.id || v.colorKey === primaryVariant.colorKey
    );
    return pIdx >= 0 ? pIdx : 0;
  }, [variantInfo, primaryVariant]);

  const [activeColorIdx, setActiveColorIdx] = useState<number>(primaryVariantIdx);

  React.useEffect(() => {
    setActiveColorIdx(primaryVariantIdx);
  }, [primaryVariantIdx, product.id]);

  const activeVariant = variantInfo.variants[activeColorIdx] || primaryVariant;

  // Each color strictly displays its own shirt images
  const colorImages =
    activeVariant?.images && activeVariant.images.length > 0
      ? activeVariant.images
      : product.image_url
      ? [product.image_url]
      : [];

  const primaryImage = colorImages[0] || product.image_url;
  const secondaryImage = colorImages.length > 1 ? colorImages[1] : null;

  const { width, height } = product;
  const dynamicRatioStyle = useMemo(() => {
    if (product.aspect_ratio && product.aspect_ratio.trim()) {
      return { aspectRatio: product.aspect_ratio.replace(':', '/').trim() };
    }
    if (width && height && width > 0 && height > 0) {
      return { aspectRatio: `${width} / ${height}` };
    }
    if (naturalRatio) {
      return { aspectRatio: naturalRatio };
    }
    return getDeterministicAspectRatio(product.aspect_ratio, width, height, product.id);
  }, [product.aspect_ratio, width, height, product.id, naturalRatio]);
  const displayTitle = lang === 'ar' && product.title_ar ? product.title_ar : product.title;
  const isAr = lang === 'ar';

  const handleCardClick = () => {
    // Pass the primary active variant and its image to the drawer
    const enrichedProduct: Product = {
      ...product,
      images: Array.isArray(product.images) && product.images.length > 0 ? product.images : colorImages,
      image_url: primaryImage,
      price: activeVariant.price,
      sku: activeVariant.sku,
      variants: variantInfo.variants,
    };
    (enrichedProduct as any).activeColorKey = activeVariant.colorKey;
    (enrichedProduct as any).activeColorNameEn = activeVariant.colorNameEn;
    (enrichedProduct as any).primaryVariantId = activeVariant.id;
    onOpen(enrichedProduct);
  };

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleWishlist) {
      onToggleWishlist(product.id);
    }
  };

  const handleMouseEnter = () => {
    if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
      setIsHovered(false);
    }
  };

  const availability = activeVariant?.availability ?? product.availability ?? 'in_stock';

  // Calculate discount percentage if offer
  const discountPct =
    product.is_offer && product.original_price && product.original_price > product.price
      ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
      : null;

  // Status badges only for special non-standard availability (coming soon, limited, sold out)
  let statusBadge = null;
  if (availability === 'sold_out') {
    statusBadge = {
      text: isAr ? 'العرض منتهي' : 'Sold Out',
      classes: 'bg-black/75 dark:bg-black/85 text-white/80 border-white/10',
      dot: 'bg-neutral-400',
    };
  } else if (availability === 'coming_soon') {
    statusBadge = {
      text: isAr ? 'قريباً' : 'Coming Soon',
      classes: 'bg-[#15171c]/90 dark:bg-white/15 text-white border-white/20',
      dot: 'bg-sky-400 animate-pulse',
    };
  } else if (availability === 'limited') {
    statusBadge = {
      text: isAr ? 'قطع محدودة' : 'Limited',
      classes: 'bg-white/95 dark:bg-[#14171f]/95 text-[#15171c] dark:text-white border-black/10 dark:border-white/15',
      dot: 'bg-amber-500',
    };
  }

  return (
    <motion.article
      custom={index}
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      data-preload-product-id={product.id}
      className="group cursor-pointer relative select-none touch-manipulation transform-gpu flex flex-col h-full"
      style={{ contain: 'paint layout', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex flex-col h-full w-full text-start outline-none">
        {/* Main Image Container with Precision Fixed Aspect Ratio */}
        <div
          className="relative overflow-hidden rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] transition-all duration-300 group-hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)] dark:group-hover:shadow-[0_14px_36px_rgba(0,0,0,0.45)] group-hover:-translate-y-1 w-full"
          style={dynamicRatioStyle}
        >
          {/* Shimmer skeleton behind loading image with cross-fade fadeout */}
          {!imgError && (
            <div
              className={`absolute inset-0 bg-neutral-200/80 dark:bg-neutral-800/60 overflow-hidden transition-opacity duration-500 ease-out ${
                loaded ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent animate-shimmer" />
            </div>
          )}

          {!imgError ? (
            <div className="relative h-full w-full overflow-hidden">
              {/* Primary Image with seamless opacity cross-fade on lazy load finish & smooth hover transition */}
              <img
                src={primaryImage}
                alt={displayTitle}
                width={width ?? undefined}
                height={height ?? undefined}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                onLoad={(e) => {
                  setLoaded(true);
                  const target = e.currentTarget;
                  if (target.naturalWidth && target.naturalHeight) {
                    setNaturalRatio(`${target.naturalWidth} / ${target.naturalHeight}`);
                  }
                }}
                onError={() => setImgError(true)}
                className={`h-full w-full object-cover object-center transition-opacity duration-300 ${
                  availability === 'sold_out' ? 'saturate-[85%]' : ''
                } ${
                  loaded
                    ? isHovered && secondaryImage
                      ? 'opacity-0 scale-105'
                      : 'opacity-100 scale-100 group-hover:scale-105 transition-transform duration-300 ease-out'
                    : 'opacity-0'
                }`}
              />

              {/* Secondary Image on Hover (Luxury Crossfade Transition) */}
              {secondaryImage && (
                <img
                  src={secondaryImage}
                  alt={`${displayTitle} - 2`}
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className={`absolute inset-0 h-full w-full object-cover object-center transition-all duration-500 ease-out ${
                    isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100 pointer-events-none'
                  }`}
                />
              )}
            </div>
          ) : (
            /* Resilient luxury fallback card */
            <div className="flex flex-col items-center justify-center p-8 h-full w-full min-h-[260px] bg-gradient-to-b from-stone-100 to-stone-200/60 dark:from-[#16191f] dark:to-[#0d0f12] text-[#15171c]/40 dark:text-white/40">
              <svg className="w-12 h-12 stroke-[1.2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="mt-3 text-xs tracking-widest uppercase font-medium">VANT · ڤانت</span>
            </div>
          )}

          {/* Clean Micro-Tag: Only rendered for special status or sale discount without suffocating the image */}
          <div className="absolute top-2.5 sm:top-3 ltr:left-2.5 rtl:right-2.5 ltr:sm:left-3 rtl:sm:right-3 z-20 flex flex-col items-start gap-1 pointer-events-none select-none">
            {discountPct && (
              <span className="inline-flex items-center rounded-full bg-[#004ad7] px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9.5px] sm:text-[10.5px] font-black text-white shadow-sm shadow-[#004ad7]/30 border border-white/20 backdrop-blur-xs">
                %{discountPct}-
              </span>
            )}
            {statusBadge && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[10px] font-semibold tracking-wide backdrop-blur-md border shadow-2xs ${statusBadge.classes}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${statusBadge.dot}`} />
                <span>{statusBadge.text}</span>
              </span>
            )}
          </div>

          {/* Wishlist Heart Button - Sculpted Frosted Glass in Signature Brand Blue */}
          <button
            type="button"
            onClick={handleHeartClick}
            className={`absolute top-2.5 sm:top-3 ltr:right-2.5 rtl:left-2.5 ltr:sm:right-3 rtl:sm:left-3 z-20 flex h-8 w-8 sm:h-8.5 sm:w-8.5 md:h-10 md:w-10 lg:h-11 lg:w-11 items-center justify-center rounded-full transition-all duration-200 cursor-pointer backdrop-blur-md active:scale-90 hover:scale-105 group/heart ${
              isWishlisted
                ? 'bg-[#004ad7] dark:bg-[#3b82f6] text-white shadow-md shadow-[#004ad7]/25 border border-[#004ad7]/40 dark:border-[#3b82f6]/50'
                : 'bg-white/90 dark:bg-[#12141a]/90 text-neutral-600 dark:text-neutral-300 hover:text-[#004ad7] dark:hover:text-[#3b82f6] hover:bg-white dark:hover:bg-[#181a22] border border-black/8 dark:border-white/12 shadow-2xs'
            }`}
            aria-label={isWishlisted ? (isAr ? 'إزالة من المفضلة' : 'Remove from Wishlist') : (isAr ? 'إضافة إلى المفضلة' : 'Add to Wishlist')}
            title={isWishlisted ? (isAr ? 'في المفضلة' : 'Wishlisted') : (isAr ? 'إضافة للمفضلة' : 'Add to Wishlist')}
          >
            <Heart
              className={`h-4 w-4 sm:h-[16px] sm:w-[16px] md:h-4.5 md:w-4.5 lg:h-5 lg:w-5 transition-all duration-200 ${
                isWishlisted
                  ? 'fill-white stroke-white stroke-[2.2] scale-105'
                  : 'stroke-[2] group-hover/heart:scale-110 group-hover/heart:stroke-[#004ad7] dark:group-hover/heart:stroke-[#3b82f6]'
              }`}
            />
          </button>
        </div>

        {/* Product Meta (Title, Category, Price) - Right-aligned in RTL, distinct hierarchy, and comfortable padding */}
        <div className="mt-2.5 sm:mt-3 md:mt-3.5 px-1 sm:px-1.5 md:px-2 pb-1.5 space-y-1.5 sm:space-y-2 rtl:text-right ltr:text-left">
          {/* 1. Category name - Subtle, smaller, refined grayish color */}
          <div className="flex items-center rtl:justify-start ltr:justify-start">
            <span className="text-[11px] sm:text-xs md:text-[12.5px] font-medium text-black/45 dark:text-white/45 tracking-tight line-clamp-1">
              {lang === 'ar' && product.category_ar ? product.category_ar : product.category}
            </span>
          </div>

          {/* 2. Product Name - Prominent, strong visual weight */}
          <div className="flex items-start rtl:justify-start ltr:justify-start">
            <h3 className="text-sm sm:text-[15px] md:text-base lg:text-[17px] font-extrabold text-[#15171c] dark:text-white leading-snug line-clamp-2 group-hover:text-[#004ad7] dark:group-hover:text-[#3b82f6] transition-colors">
              {displayTitle}
            </h3>
          </div>

          {/* 3. Price - Bold, distinct signature blue */}
          <div className="flex items-baseline gap-2 pt-0.5 rtl:justify-start ltr:justify-start">
            <span className="font-mono font-black text-sm sm:text-base md:text-[17px] lg:text-lg text-[#004ad7] dark:text-[#3b82f6] tabular-nums tracking-tight">
              {formatPrice(activeVariant.price)}
            </span>
            {product.is_offer && product.original_price && product.original_price > activeVariant.price && (
              <span className="text-[11px] sm:text-xs md:text-[13px] text-black/35 dark:text-white/35 line-through tabular-nums font-mono">
                {formatPrice(product.original_price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
});
