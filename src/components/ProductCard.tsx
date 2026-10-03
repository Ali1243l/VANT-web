import React, { useState, useMemo } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Heart, Tag } from 'lucide-react';
import type { Product, Language } from '../types';
import { useSiteControls } from '../context/SiteControlsContext';
import { trackEvent } from '../lib/analytics';

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
    y: 16,
    scale: 0.98,
  },
  visible: (customIndex: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 26,
      delay: Math.min(customIndex, 8) * 0.04,
    },
  }),
};

/**
 * Resolves the dynamic aspect ratio for any dimension (9:16, 4:3, 16:9, 1:1, 3:4, etc.)
 */
function getDynamicAspectRatioStyle(
  aspectRatio?: string,
  width?: number | null,
  height?: number | null,
  naturalRatio?: string | null,
  fallbackIndex = 0
): { aspectRatio: string } {
  // 1. Explicit aspect_ratio column from Supabase (e.g. '9:16', '4:3', '16:9', '3:4', '1:1', '4:5')
  if (aspectRatio && aspectRatio.trim()) {
    const clean = aspectRatio.replace(':', '/').trim();
    return { aspectRatio: clean };
  }

  // 2. Explicit width & height from database
  if (width && height && width > 0 && height > 0) {
    return { aspectRatio: `${width} / ${height}` };
  }

  // 3. Dynamically detected natural image aspect ratio (displays 100% of the image in full)
  if (naturalRatio) {
    return { aspectRatio: naturalRatio };
  }

  // 4. Alternating editorial fashion lookbook proportions while loading
  const defaultRatios = ['3 / 4', '4 / 5', '9 / 16', '4 / 3'];
  return { aspectRatio: defaultRatios[fallbackIndex % defaultRatios.length] };
}

export default function ProductCard({
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

  const imagesList = product.images && product.images.length > 0
    ? product.images
    : product.image_url
    ? [product.image_url]
    : [];

  const primaryImage = imagesList[0] || product.image_url;
  const secondaryImage = imagesList.length > 1 ? imagesList[1] : null;

  const { width, height } = product;
  const dynamicRatioStyle = useMemo(
    () => getDynamicAspectRatioStyle(product.aspect_ratio, width, height, naturalRatio, index),
    [product.aspect_ratio, width, height, naturalRatio, index]
  );
  const displayTitle = lang === 'ar' && product.title_ar ? product.title_ar : product.title;
  const isAr = lang === 'ar';

  const handleCardClick = () => {
    trackEvent('product_view', { productId: product.id, title: displayTitle });
    onOpen(product);
  };

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    trackEvent('wishlist_toggle', { productId: product.id, isAdded: !isWishlisted, title: displayTitle });
    if (onToggleWishlist) {
      onToggleWishlist(product.id);
    }
  };

  const availability = product.availability ?? 'in_stock';

  let badgeText = '';
  let badgeClasses = '';
  let dotClass = '';

  switch (availability) {
    case 'sold_out':
      badgeText = isAr ? 'العرض منتهي' : 'Sold Out';
      badgeClasses =
        'bg-black/75 dark:bg-black/85 text-white/70 dark:text-white/60 border-white/10 shadow-2xs';
      dotClass = 'bg-neutral-400 dark:bg-neutral-500';
      break;
    case 'coming_soon':
      badgeText = isAr ? 'قريباً' : 'Coming Soon';
      badgeClasses =
        'bg-[#15171c]/90 dark:bg-white/12 text-white border-white/15 dark:border-white/20 shadow-2xs';
      dotClass = 'bg-sky-400 animate-pulse';
      break;
    case 'limited':
      badgeText = isAr ? 'قطع محدودة' : 'Limited Stock';
      badgeClasses =
        'bg-white/90 dark:bg-[#14171f]/90 text-[#15171c] dark:text-white border-black/8 dark:border-white/12 shadow-2xs';
      dotClass = 'bg-amber-500';
      break;
    case 'in_stock':
    default:
      badgeText = isAr ? 'متوفر' : 'In Stock';
      badgeClasses =
        'bg-white/90 dark:bg-[#14171f]/90 text-[#15171c] dark:text-white border-black/8 dark:border-white/12 shadow-2xs';
      dotClass = 'bg-emerald-500';
      break;
  }

  return (
    <motion.article
      layout="position"
      custom={index}
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      data-preload-product-id={product.id}
      className="mb-3 break-inside-avoid sm:mb-4 group cursor-pointer relative select-none"
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="block w-full text-start outline-none">
        {/* Main Image Container with Precision Dynamic Aspect Ratio */}
        <div
          className="relative overflow-hidden rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] transition-all duration-300 group-hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)] dark:group-hover:shadow-[0_14px_36px_rgba(0,0,0,0.45)] group-hover:-translate-y-1 w-full"
          style={dynamicRatioStyle}
        >
          {/* Shimmer skeleton behind loading image with cross-fade fadeout */}
          {!imgError && (
            <div
              className={`absolute inset-0 bg-black/[0.03] dark:bg-white/[0.04] overflow-hidden transition-opacity duration-700 ease-out ${
                loaded ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/[0.06] dark:via-white/[0.07] to-transparent animate-shimmer" />
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
                  const target = e.currentTarget;
                  if (target.naturalWidth && target.naturalHeight) {
                    setNaturalRatio(`${target.naturalWidth} / ${target.naturalHeight}`);
                  }
                  setLoaded(true);
                }}
                onError={() => setImgError(true)}
                className={`h-full w-full object-cover object-center transition-all duration-700 ease-out will-change-transform ${
                  availability === 'sold_out' ? 'saturate-[85%]' : ''
                } ${
                  loaded
                    ? isHovered && secondaryImage
                      ? 'opacity-0 scale-105'
                      : 'opacity-100 scale-100 group-hover:scale-105'
                    : 'opacity-0 scale-[1.01]'
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
                  className={`absolute inset-0 h-full w-full object-cover object-center transition-all duration-700 ease-out will-change-transform ${
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

          {/* Top Status & Special Offer Badges Stack */}
          <div className="absolute top-2.5 sm:top-3 ltr:left-2.5 rtl:right-2.5 ltr:sm:left-3 rtl:sm:right-3 z-20 flex flex-col items-start gap-1.5 pointer-events-none select-none">
            {/* Availability Status Badge */}
            <div
              className={`pointer-events-auto inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] sm:text-[10.5px] font-semibold tracking-wide backdrop-blur-md border shadow-xs select-none transition-all duration-200 ${badgeClasses}`}
            >
              {dotClass && <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotClass}`} />}
              <span>{badgeText}</span>
            </div>

            {/* Special Offer Badge */}
            {product.is_offer && (
              <div className="pointer-events-auto inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] sm:text-[9.5px] font-bold tracking-wider bg-[#15171c]/90 dark:bg-white/95 text-white dark:text-[#15171c] shadow-2xs border border-white/15 dark:border-black/10 backdrop-blur-md">
                <Tag className="h-2.5 w-2.5 stroke-[2.2]" />
                <span>{isAr ? 'عرض خاص' : 'Special Offer'}</span>
              </div>
            )}
          </div>

          {/* Wishlist Heart Button - Sculpted Frosted Glass in Signature Brand Blue */}
          <button
            type="button"
            onClick={handleHeartClick}
            className={`absolute top-2.5 sm:top-3 ltr:right-2.5 rtl:left-2.5 ltr:sm:right-3 rtl:sm:left-3 z-20 flex h-8 w-8 sm:h-8.5 sm:w-8.5 items-center justify-center rounded-full transition-all duration-200 cursor-pointer backdrop-blur-md active:scale-90 hover:scale-105 group/heart ${
              isWishlisted
                ? 'bg-[#004ad7] dark:bg-[#3b82f6] text-white shadow-md shadow-[#004ad7]/25 border border-[#004ad7]/40 dark:border-[#3b82f6]/50'
                : 'bg-white/90 dark:bg-[#12141a]/90 text-neutral-600 dark:text-neutral-300 hover:text-[#004ad7] dark:hover:text-[#3b82f6] hover:bg-white dark:hover:bg-[#181a22] border border-black/8 dark:border-white/12 shadow-2xs'
            }`}
            aria-label={isWishlisted ? (isAr ? 'إزالة من المفضلة' : 'Remove from Wishlist') : (isAr ? 'إضافة إلى المفضلة' : 'Add to Wishlist')}
            title={isWishlisted ? (isAr ? 'في المفضلة' : 'Wishlisted') : (isAr ? 'إضافة للمفضلة' : 'Add to Wishlist')}
          >
            <Heart
              className={`h-4 w-4 sm:h-[17px] sm:w-[17px] transition-all duration-200 ${
                isWishlisted
                  ? 'fill-white stroke-white stroke-[2.2] scale-105'
                  : 'stroke-[2] group-hover/heart:scale-110 group-hover/heart:stroke-[#004ad7] dark:group-hover/heart:stroke-[#3b82f6]'
              }`}
            />
          </button>
        </div>

        {/* Product Meta (Title, Category, Price) */}
        <div className="mt-2.5 space-y-1">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-xs sm:text-sm font-bold text-[#15171c] dark:text-white line-clamp-1 group-hover:text-[#004ad7] dark:group-hover:text-[#3b82f6] transition-colors">
              {displayTitle}
            </h3>
          </div>

          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-[11px] text-black/50 dark:text-white/50 line-clamp-1">
              {lang === 'ar' && product.category_ar ? product.category_ar : product.category}
            </span>

            <span className="font-mono font-bold text-xs sm:text-sm text-[#004ad7] dark:text-[#3b82f6] tabular-nums">
              {formatPrice(product.price)}
            </span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
