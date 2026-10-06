import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { AnimatePresence, motion, useMotionValue, useTransform, animate, type Variants } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Check, AlertCircle, Copy, Ruler, MessageCircle, Truck, Share2, Sparkles, Tag } from 'lucide-react';
import { ALL_SIZES, type Product, type Language, type Size } from '../types';
import { formatPrice } from '../lib/supabase';
import { DEFAULT_WHATSAPP_PHONE } from '../lib/constants';
import ShareModal from './ShareModal';
import ProductDrawerSkeleton from './ProductDrawerSkeleton';
import { calculateRecommendedSize } from '../data/sizeGuide';
import { useSiteControls } from '../context/SiteControlsContext';
import { trackEvent } from '../lib/analytics';

interface Props {
  product: Product | null;
  loading?: boolean;
  lang: Language;
  onClose: () => void;
}

// Snappy, zero-glitch directional slide variants for carousel
const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 55 : -55,
    opacity: 0,
    scale: 0.98,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: 'spring' as const, stiffness: 480, damping: 38 },
      opacity: { duration: 0.16 },
      scale: { duration: 0.16 },
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 55 : -55,
    opacity: 0,
    scale: 0.98,
    transition: {
      x: { type: 'spring' as const, stiffness: 480, damping: 38 },
      opacity: { duration: 0.14 },
      scale: { duration: 0.14 },
    },
  }),
};


export default function ProductDrawer({ product, loading, lang, onClose }: Props) {
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 768 : false));

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState(1);
  const { getControl, formatPrice, masterSizes } = useSiteControls();
  const whatsappControl = getControl('btn_product_whatsapp');
  const shareControl = getControl('btn_product_share');
  const copyControl = getControl('btn_product_copy');
  const sizeGuideControl = getControl('btn_product_size_guide');
  const bespokeControl = getControl('btn_product_bespoke');
  const whatsappPhoneControl = getControl('cfg_whatsapp_phone');
  const bespokePhoneControl = getControl('cfg_bespoke_phone');

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sizeFeedback, setSizeFeedback] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [sizeGuideTab, setSizeGuideTab] = useState<'calculator' | 'table'>('calculator');
  const [showShareModal, setShowShareModal] = useState(false);
  const [calcHeight, setCalcHeight] = useState<string>('');
  const [calcWeight, setCalcWeight] = useState<string>('');

  const dynamicRecommendation = useMemo(() => {
    if (calcHeight.length !== 3) return null;
    if (calcWeight.length < 2) return null;
    const h = parseInt(calcHeight, 10);
    const w = parseInt(calcWeight, 10);
    if (isNaN(h) || isNaN(w) || h < 120 || h > 220 || w < 30 || w > 200) return null;
    return calculateRecommendedSize(h, w, masterSizes);
  }, [calcHeight, calcWeight, masterSizes]);

  // Robustly normalize images list with non-empty string validation
  const images = useMemo(() => {
    if (!product) return [];
    const list: string[] = [];
    if (Array.isArray(product.images)) {
      product.images.forEach((img) => {
        if (typeof img === 'string' && img.trim().length > 0) {
          list.push(img.trim());
        }
      });
    }
    if (list.length === 0 && product.image_url && product.image_url.trim().length > 0) {
      list.push(product.image_url.trim());
    }
    return list.length > 0 ? list : [product.image_url || ''];
  }, [product]);

  // Reset local state when product changes and pre-cache active images
  useEffect(() => {
    if (product) {
      setActiveImageIndex(0);
      setCarouselDragOffset(0);
      setIsSwipingCarousel(false);
      setSelectedSize(null);
      setSizeFeedback(null);
      setCopiedTitle(false);
      setShowSizeGuide(false);

      // Preload primary image immediately
      const firstImg = images[0];
      if (firstImg && !firstImg.startsWith('data:')) {
        const img = new Image();
        img.src = firstImg;
        img.onload = () => {
          setLoadedImages((prev) => new Set(prev).add(firstImg));
        };
      }
    }
  }, [product, images]);

  const carouselViewportRef = useRef<HTMLDivElement>(null);
  const slideItemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const thumbnailContainerRef = useRef<HTMLDivElement>(null);
  const thumbnailItemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const paginate = useCallback(
    (newDirection: number) => {
      if (images.length <= 1) return;
      setSlideDirection(newDirection);
      setActiveImageIndex((prev) => {
        const next = prev + newDirection;
        if (next < 0) return 0;
        if (next >= images.length) return images.length - 1;
        return next;
      });
    },
    [images.length]
  );

  // Auto-center active thumbnail smoothly strictly within its own scroll container
  useEffect(() => {
    const container = thumbnailContainerRef.current;
    const activeItem = thumbnailItemRefs.current[activeImageIndex];
    if (container && activeItem) {
      const containerWidth = container.clientWidth;
      const itemOffsetLeft = activeItem.offsetLeft;
      const itemWidth = activeItem.clientWidth;
      const targetScrollLeft = itemOffsetLeft - containerWidth / 2 + itemWidth / 2;
      container.scrollTo({
        left: targetScrollLeft,
        behavior: 'smooth',
      });
    }
  }, [activeImageIndex]);

  // Keyboard navigation: ESC to close, Left/Right for gallery + Zero-Reflow Body Lock
  useEffect(() => {
    if (!product) return;
    const prevBodyOverflow = document.body.style.overflow;
    const prevBodyPaddingRight = document.body.style.paddingRight;

    // Only apply desktop scrollbar gutter compensation to prevent layout shift
    if (!isMobile) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      document.body.style.overflow = 'hidden';
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showSizeGuide) {
          setShowSizeGuide(false);
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowRight') {
        paginate(1);
      } else if (e.key === 'ArrowLeft') {
        paginate(-1);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      if (!isMobile) {
        document.body.style.overflow = prevBodyOverflow;
        document.body.style.paddingRight = prevBodyPaddingRight;
      }
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [product, onClose, paginate, lang, showSizeGuide, isMobile]);

  const availability = product?.availability ?? 'in_stock';
  const isSoldOut = availability === 'sold_out';
  const availableSizes = isSoldOut
    ? new Set<string>()
    : new Set((product?.sizes ?? []).map((s) => s.toUpperCase()));

  const displayTitle = lang === 'ar' && product?.title_ar ? product.title_ar : product?.title;
  const displayCategory = lang === 'ar' && product?.category_ar ? product.category_ar : product?.category;
  const displayDescription = lang === 'ar' && product?.description_ar ? product.description_ar : product?.description;

  let statusBadgeLabel = '';
  let statusBadgeClasses = '';
  let statusBannerText = '';
  let statusDotClass = '';
  let buttonLabel = '';

  switch (availability) {
    case 'sold_out':
      statusBadgeLabel = lang === 'ar' ? 'العرض منتهي' : 'Sold Out';
      statusBadgeClasses =
        'bg-black/75 dark:bg-black/85 text-white/70 dark:text-white/60 border-white/10 shadow-2xs';
      statusDotClass = 'bg-neutral-400 dark:bg-neutral-500';
      statusBannerText =
        lang === 'ar'
          ? 'العرض منتهي — نعتذر، نفدت الكمية والمقاسات بالكامل. يمكنك اختيار مقاسك بالأسفل لطلب إعادة توفيره.'
          : 'Sold Out — All sizes and allocations are currently exhausted. Select your size below to request a restock.';
      buttonLabel = selectedSize
        ? lang === 'ar'
          ? `طلب إعادة توفير مقاس (${selectedSize}) عبر واتساب`
          : `Request Restock for Size (${selectedSize})`
        : lang === 'ar'
        ? 'طلب إعادة توفير أو استفسار عبر واتساب'
        : 'Inquire on Restock via WhatsApp';
      break;
    case 'coming_soon':
      statusBadgeLabel = lang === 'ar' ? 'قريباً' : 'Coming Soon';
      statusBadgeClasses =
        'bg-[#15171c]/90 dark:bg-white/12 text-white border-white/15 dark:border-white/20 shadow-2xs';
      statusDotClass = 'bg-sky-400 animate-pulse';
      statusBannerText =
        lang === 'ar'
          ? 'قريباً — هذه القطعة قيد التجهيز الفاخر ضمن التشكيلة القادمة. يمكنك حجز أسبقية الاستلام فور توفرها.'
          : 'Coming Soon — This piece is in production for the upcoming drop. You may pre-register priority allocation.';
      buttonLabel = selectedSize
        ? lang === 'ar'
          ? `حجز مسبق لمقاس (${selectedSize}) عبر واتساب`
          : `Pre-Order Size (${selectedSize}) via WhatsApp`
        : lang === 'ar'
        ? 'حجز مسبق واستفسار عبر واتساب'
        : 'Pre-Order & Inquire via WhatsApp';
      break;
    case 'limited':
      statusBadgeLabel = lang === 'ar' ? 'قطع محدودة' : 'Limited Stock';
      statusBadgeClasses =
        'bg-white/90 dark:bg-[#14171f]/90 text-[#15171c] dark:text-white border-black/8 dark:border-white/12 shadow-2xs';
      statusDotClass = 'bg-amber-500';
      statusBannerText =
        lang === 'ar'
          ? 'قطع محدودة — تتوفر أعداد قليلة جداً من هذا الإصدار في المخزون.'
          : 'Limited Allocation — Only a few pieces remain in current stock.';
      buttonLabel = selectedSize
        ? lang === 'ar'
          ? `طلب مقاس (${selectedSize}) عبر واتساب`
          : `Order Size (${selectedSize}) via WhatsApp`
        : lang === 'ar'
        ? 'طلب واستفسار عبر واتساب'
        : 'Order & Inquire via WhatsApp';
      break;
    case 'in_stock':
    default:
      statusBadgeLabel = lang === 'ar' ? 'متوفر' : 'In Stock';
      statusBadgeClasses =
        'bg-white/90 dark:bg-[#14171f]/90 text-[#15171c] dark:text-white border-black/8 dark:border-white/12 shadow-2xs';
      statusDotClass = 'bg-emerald-500';
      statusBannerText =
        lang === 'ar'
          ? 'متوفر وجاهز للشحن الفوري والتسليم.'
          : 'In Stock and ready for immediate complimentary dispatch.';
      buttonLabel = selectedSize
        ? lang === 'ar'
          ? `طلب مقاس (${selectedSize}) عبر واتساب`
          : `Order Size (${selectedSize}) via WhatsApp`
        : lang === 'ar'
        ? 'طلب واستفسار عبر واتساب'
        : 'Order & Inquire via WhatsApp';
      break;
  }

  const productCode = product?.id ? `#${product.id}` : '';
  const formattedProductPrice = product ? formatPrice(product.price) : '';

  const whatsappMessage = lang === 'ar'
    ? isSoldOut
      ? selectedSize
        ? `مرحباً ڤانت، أود الاستفسار عن إمكانية إعادة توفير مقاس (${selectedSize}) لقطعة "${displayTitle ?? ''}" (كود القطعة: ${productCode} - السعر: ${formattedProductPrice})`
        : `مرحباً ڤانت، أود الاستفسار عن إمكانية إعادة توفير قطعة "${displayTitle ?? ''}" (كود القطعة: ${productCode} - السعر: ${formattedProductPrice})`
      : availability === 'coming_soon'
      ? selectedSize
        ? `مرحباً ڤانت، أود حجز أسبقية لمقاس (${selectedSize}) من قطعة "${displayTitle ?? ''}" (كود القطعة: ${productCode} - السعر: ${formattedProductPrice})`
        : `مرحباً ڤانت، أود الاستفسار وحجز أسبقية لقطعة "${displayTitle ?? ''}" (كود القطعة: ${productCode} - السعر: ${formattedProductPrice})`
      : selectedSize
      ? `مرحباً ڤانت، أود طلب قطعة "${displayTitle ?? ''}" بمقاس (${selectedSize}) (كود القطعة: ${productCode} - السعر: ${formattedProductPrice})`
      : `مرحباً ڤانت، أود الاستفسار والطلب لقطعة "${displayTitle ?? ''}" (كود القطعة: ${productCode} - السعر: ${formattedProductPrice})`
    : isSoldOut
    ? selectedSize
      ? `Hello Maison VANT, I would like to inquire about restocking size (${selectedSize}) for "${displayTitle ?? ''}" (Code: ${productCode} - Price: ${formattedProductPrice})`
      : `Hello Maison VANT, I would like to inquire about restocking "${displayTitle ?? ''}" (Code: ${productCode} - Price: ${formattedProductPrice})`
    : availability === 'coming_soon'
    ? selectedSize
      ? `Hello Maison VANT, I would like to pre-register size (${selectedSize}) for "${displayTitle ?? ''}" (Code: ${productCode} - Price: ${formattedProductPrice})`
      : `Hello Maison VANT, I would like to pre-register/inquire about "${displayTitle ?? ''}" (Code: ${productCode} - Price: ${formattedProductPrice})`
    : selectedSize
    ? `Hello Maison VANT, I would like to order "${displayTitle ?? ''}" in size (${selectedSize}) (Code: ${productCode} - Price: ${formattedProductPrice})`
    : `Hello Maison VANT, I would like to order/inquire about "${displayTitle ?? ''}" (Code: ${productCode} - Price: ${formattedProductPrice})`;

  const whatsappText = encodeURIComponent(whatsappMessage);
  const targetPhone = (whatsappPhoneControl?.actionValue || '').replace(/[^0-9]/g, '') || DEFAULT_WHATSAPP_PHONE;
  const whatsappUrl = `https://wa.me/${targetPhone}?text=${whatsappText}`;

  const bespokeWhatsappText = encodeURIComponent(
    lang === 'ar'
      ? `مرحباً ڤانت، أود الاستفسار عن خدمة التفصيل الخاص (Made-to-Measure) لقطعة "${displayTitle ?? ''}" (كود القطعة: ${productCode} - الطول: ${calcHeight} سم، الوزن: ${calcWeight} كغم، السعر: ${formattedProductPrice})`
      : `Hello Maison VANT, I would like to inquire about Made-to-Measure bespoke tailoring for "${displayTitle ?? ''}" (Code: ${productCode} - Height: ${calcHeight} cm, Weight: ${calcWeight} kg, Price: ${formattedProductPrice})`
  );
  const targetBespokePhone = (bespokePhoneControl?.actionValue || '').replace(/[^0-9]/g, '') || targetPhone;
  const bespokeWhatsappUrl = `https://wa.me/${targetBespokePhone}?text=${bespokeWhatsappText}`;

  const handleCopyTitle = async () => {
    if (!displayTitle) return;
    try {
      await navigator.clipboard.writeText(displayTitle);
      setCopiedTitle(true);
      setTimeout(() => setCopiedTitle(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = displayTitle;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedTitle(true);
      setTimeout(() => setCopiedTitle(false), 2000);
    }
  };

  const handleSizeClick = (size: string) => {
    setSelectedSize(size);
    if (product) {
      trackEvent('size_select', { productId: product.id, size, title: displayTitle });
    }
    if (isSoldOut) {
      setSizeFeedback(
        lang === 'ar'
          ? `المقاس (${size}) منتهي حالياً ضمن هذا العرض — تم تحديده لطلب إعادة توفيره عبر واتساب بالأسفل`
          : `Size (${size}) is sold out — selected for restock request via WhatsApp below`
      );
    } else if (availableSizes.has(size)) {
      setSizeFeedback(
        lang === 'ar'
          ? `المقاس (${size}) متوفر وجاهز للشحن الفوري`
          : `Size (${size}) is currently in stock & ready for dispatch`
      );
    } else {
      setSizeFeedback(
        lang === 'ar'
          ? `عذراً، المقاس (${size}) نفد من المخزون لهذه القطعة`
          : `Apologies, size (${size}) is currently out of stock`
      );
    }
  };

  const renderedSizes = useMemo(() => {
    const activeMaster = masterSizes.filter((s) => s.enabled).map((s) => s.size);
    const prodSizes = (product?.sizes || []).map((s) => s);
    if (prodSizes.length > 0) {
      const list = [...activeMaster];
      for (const ps of prodSizes) {
        if (!list.includes(ps)) list.push(ps);
      }
      return list;
    }
    return activeMaster.length > 0 ? activeMaster : ALL_SIZES;
  }, [product?.sizes, masterSizes]);

  // Mobile & Modal Handlers
  const dragY = useMotionValue(0);
  const backdropOpacity = useTransform(dragY, [0, 280], [1, 0]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dragY.set(0);
  }, [product, dragY]);

  const touchStateRef = useRef<{
    startY: number;
    startX: number;
    startTime: number;
    isDragging: boolean;
  }>({
    startY: 0,
    startX: 0,
    startTime: 0,
    isDragging: false,
  });

  const onTouchStartDrag = (e: React.TouchEvent) => {
    if (!isMobile) return;
    const touch = e.touches[0];
    touchStateRef.current = {
      startY: touch.clientY,
      startX: touch.clientX,
      startTime: Date.now(),
      isDragging: true,
    };
  };

  const onTouchMoveDrag = (e: React.TouchEvent) => {
    if (!isMobile || !touchStateRef.current.isDragging) return;
    const touch = e.touches[0];
    const deltaY = touch.clientY - touchStateRef.current.startY;
    const deltaX = touch.clientX - touchStateRef.current.startX;

    // Follow finger directly when dragging downwards with ultra-high sensitivity
    if (deltaY > 0 && deltaY > Math.abs(deltaX) * 0.35) {
      dragY.set(deltaY);
    } else if (deltaY < 0) {
      // Elastic resistance if dragged upwards
      dragY.set(deltaY * 0.12);
    }
  };

  const onTouchEndDrag = () => {
    if (!isMobile || !touchStateRef.current.isDragging) return;
    touchStateRef.current.isDragging = false;

    const currentDeltaY = dragY.get();
    const elapsedTime = Math.max(1, Date.now() - touchStateRef.current.startTime);
    const velocity = currentDeltaY / elapsedTime;

    // Dismiss if dragged > 35px down or flicked with velocity > 0.15
    if (currentDeltaY > 35 || velocity > 0.15) {
      animate(dragY, typeof window !== 'undefined' ? window.innerHeight : 600, {
        duration: 0.20,
        ease: [0.32, 0.72, 0, 1],
        onComplete: () => {
          onClose();
        },
      });
    } else {
      // Snap back smoothly to open position
      animate(dragY, 0, { type: 'spring', damping: 28, stiffness: 350 });
    }
  };

  const handleClose = useCallback(() => {
    if (isMobile) {
      animate(dragY, typeof window !== 'undefined' ? window.innerHeight : 600, {
        duration: 0.20,
        ease: [0.32, 0.72, 0, 1],
        onComplete: () => {
          onClose();
        },
      });
    } else {
      onClose();
    }
  }, [isMobile, dragY, onClose]);

  // High-Performance Cross-Platform Pointer Carousel
  const [carouselDragOffset, setCarouselDragOffset] = useState(0);
  const [isSwipingCarousel, setIsSwipingCarousel] = useState(false);
  const carouselPointerRef = useRef<{
    pointerId: number | null;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    startTime: number;
    isLocked: boolean;
    lockDirection: 'horizontal' | 'vertical' | null;
  }>({
    pointerId: null,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    startTime: 0,
    isLocked: false,
    lockDirection: null,
  });

  const onCarouselPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only handle primary button
    if (e.button !== 0) return;

    // Do not capture or intercept pointer if clicking interactive buttons or dots
    if ((e.target as HTMLElement).closest('button, a, input, textarea')) {
      return;
    }
    
    // Prevent image drag default browser behavior
    e.preventDefault();

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture fails
    }

    carouselPointerRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
      startTime: Date.now(),
      isLocked: false,
      lockDirection: null,
    };
    setIsSwipingCarousel(true);
  };

  const onCarouselPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isSwipingCarousel || carouselPointerRef.current.pointerId !== e.pointerId) return;
    
    const clientX = e.clientX;
    const clientY = e.clientY;
    carouselPointerRef.current.currentX = clientX;
    carouselPointerRef.current.currentY = clientY;

    const deltaX = clientX - carouselPointerRef.current.startX;
    const deltaY = clientY - carouselPointerRef.current.startY;

    // Direction locking after 6px movement to eliminate scroll conflict
    if (!carouselPointerRef.current.isLocked) {
      if (Math.abs(deltaY) > 6 && Math.abs(deltaY) > Math.abs(deltaX)) {
        carouselPointerRef.current.isLocked = true;
        carouselPointerRef.current.lockDirection = 'vertical';
      } else if (Math.abs(deltaX) > 6 && Math.abs(deltaX) > Math.abs(deltaY)) {
        carouselPointerRef.current.isLocked = true;
        carouselPointerRef.current.lockDirection = 'horizontal';
      }
    }

    if (carouselPointerRef.current.lockDirection === 'horizontal') {
      if (images.length > 1) {
        // Natural 1:1 drag with rubber-band resistance at boundaries
        let offset = deltaX;
        if (activeImageIndex === 0 && deltaX > 0) {
          offset = deltaX * 0.25;
        } else if (activeImageIndex === images.length - 1 && deltaX < 0) {
          offset = deltaX * 0.25;
        }
        setCarouselDragOffset(offset);
      }
    }
  };

  const onCarouselPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isSwipingCarousel || carouselPointerRef.current.pointerId !== e.pointerId) return;
    setIsSwipingCarousel(false);

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore
    }

    const { startX, startY, currentX, currentY, startTime, lockDirection } = carouselPointerRef.current;
    carouselPointerRef.current.pointerId = null;

    const deltaX = currentX - startX;
    const duration = Math.max(1, Date.now() - startTime);
    const velocityX = deltaX / duration;

    if (lockDirection === 'horizontal' && images.length > 1) {
      const threshold = 40;
      const isFlick = Math.abs(velocityX) > 0.2;

      // Swiped LEFT (finger moved left, negative deltaX) -> Advance to NEXT image
      if (deltaX < -threshold || (isFlick && velocityX < 0)) {
        if (activeImageIndex < images.length - 1) {
          setSlideDirection(1);
          setActiveImageIndex((prev) => prev + 1);
        }
      }
      // Swiped RIGHT (finger moved right, positive deltaX) -> Return to PREVIOUS image
      else if (deltaX > threshold || (isFlick && velocityX > 0)) {
        if (activeImageIndex > 0) {
          setSlideDirection(-1);
          setActiveImageIndex((prev) => prev - 1);
        }
      }

      setCarouselDragOffset(0);
    } else {
      setCarouselDragOffset(0);
    }
  };

  // Trackpad horizontal wheel navigation
  const lastWheelTimeRef = useRef(0);
  const onCarouselWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (images.length <= 1) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 20) {
      const now = Date.now();
      if (now - lastWheelTimeRef.current > 350) {
        lastWheelTimeRef.current = now;
        if (e.deltaX > 0) {
          paginate(1);
        } else {
          paginate(-1);
        }
      }
    }
  };

  return (
    <AnimatePresence>
      {loading && !product && (
        <ProductDrawerSkeleton key="skeleton" lang={lang} onClose={onClose} />
      )}
      {product && (
        <div
          key="drawer-modal-container"
          className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none md:items-center p-0 md:p-6 lg:p-8 xl:p-10"
        >
          {/* Backdrop with click to dismiss */}
          <motion.div
            key="backdrop"
            style={isMobile ? { opacity: backdropOpacity } : undefined}
            className="fixed inset-0 bg-black/45 dark:bg-black/60 pointer-events-auto touch-none will-change-opacity"
            initial={{ opacity: 0 }}
            animate={isMobile ? undefined : { opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={isMobile ? { duration: 0 } : { duration: 0.22, ease: 'easeOut' }}
            onClick={handleClose}
          />

          {/* Responsive Sheet/Modal Panel */}
          <motion.div
            key={`sheet-panel-${product.id}`}
            role="dialog"
            aria-modal="true"
            aria-label={displayTitle}
            style={isMobile ? { y: dragY } : undefined}
            className="pointer-events-auto relative z-10 flex w-full flex-col overflow-hidden bg-[#f8f9fa] dark:bg-[#16191f] shadow-2xl transition-colors duration-250 
                       rounded-t-[28px] sm:rounded-t-[32px] h-[95dvh] max-h-[100dvh]
                       md:h-auto md:max-h-[88vh] md:max-w-4xl lg:max-w-5xl xl:max-w-6xl md:rounded-[32px] md:border md:border-black/5 md:dark:border-white/10 will-change-transform"
            initial={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.96, y: 12 }}
            animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1, y: 0 }}
            exit={isMobile ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 12 }}
            transition={
              isMobile
                ? { duration: 0 }
                : { duration: 0.22, ease: [0.16, 1, 0.3, 1] }
            }
          >
              {/* Mobile Drag to Close Zone (Direct 1:1 hardware follower) */}
              <div
                className="flex flex-col shrink-0 items-center justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing md:hidden select-none touch-none w-full"
                onTouchStart={onTouchStartDrag}
                onTouchMove={onTouchMoveDrag}
                onTouchEnd={onTouchEndDrag}
                onTouchCancel={onTouchEndDrag}
              >
                <div className="h-1.5 w-12 rounded-full bg-black/30 dark:bg-white/30 active:bg-black/50 transition-colors" />
                <span className="mt-1 text-[10px] font-medium text-black/40 dark:text-white/40 tracking-wider select-none">
                  {lang === 'ar' ? 'اسحب للأسفل للإغلاق' : 'Swipe down to close'}
                </span>
              </div>

              {/* Dedicated Close Button (Visible on both desktop and mobile) */}
              <button
                type="button"
                onClick={handleClose}
                className="absolute top-4 md:top-5 z-20 flex h-9 w-9 md:h-12 md:w-12 items-center justify-center rounded-full bg-white/80 dark:bg-[#0d0f12]/80 text-[#15171c] dark:text-white backdrop-blur-md shadow-xs border border-black/5 dark:border-white/10 transition-all hover:bg-white dark:hover:bg-[#0d0f12] active:scale-95 ltr:right-4 rtl:left-4 md:ltr:right-5 md:rtl:left-5 cursor-pointer"
                aria-label={lang === 'ar' ? 'إغلاق' : 'Close'}
              >
                <X className="h-4 w-4 md:h-5 md:w-5" />
              </button>

              {/* Responsive Layout Grid (Split screen on Desktop, Stack on Mobile) */}
              <div
                ref={scrollContainerRef}
                className="grid flex-1 overflow-y-auto overscroll-contain touch-pan-y md:grid-cols-12 md:overflow-hidden"
              >
                {/* GALLERY SECTION (Column 1-6 on desktop, Unified LTR Media Track for 100% Spatial Agreement) */}
                <div
                  dir="ltr"
                  className="relative flex flex-col justify-between bg-black/[0.02] dark:bg-black/20 p-4 sm:p-6 md:p-7 lg:p-8 md:col-span-6 md:border-e md:border-black/5 md:dark:border-white/10 md:overflow-y-auto [direction:ltr] no-scrollbar"
                >
                  {/* Main Active Image Viewport with Stable Luxury Aspect Ratio */}
                  <div
                    ref={carouselViewportRef}
                    dir="ltr"
                    className="relative flex items-center justify-center w-full max-w-full overflow-hidden rounded-3xl bg-gradient-to-b from-black/[0.03] to-black/[0.07] dark:from-white/[0.02] dark:to-white/[0.05] border border-black/5 dark:border-white/10 touch-pan-y select-none cursor-grab active:cursor-grabbing [direction:ltr] shadow-inner aspect-[3/4] max-h-[58vh] sm:max-h-[64vh] md:max-h-[580px] lg:max-h-[640px] xl:max-h-[680px] mx-auto"
                    onPointerDown={onCarouselPointerDown}
                    onPointerMove={onCarouselPointerMove}
                    onPointerUp={onCarouselPointerUp}
                    onPointerCancel={onCarouselPointerUp}
                    onWheel={onCarouselWheel}
                  >
                    {/* Ambient Luxury Spotlight Glow */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(0,74,215,0.06),transparent_70%)] dark:bg-[radial-gradient(circle_at_50%_40%,rgba(59,130,246,0.1),transparent_70%)] pointer-events-none" />

                    {/* Continuous Hardware-Accelerated Sliding Track */}
                    <div
                      dir="ltr"
                      className="flex h-full w-full will-change-transform [direction:ltr]"
                      style={{
                        transform: `translate3d(calc(-${activeImageIndex * 100}% + ${carouselDragOffset}px), 0, 0)`,
                        transition: isSwipingCarousel ? 'none' : 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    >
                      {images.map((imgSrc, idx) => {
                        const isImageLoaded = loadedImages.has(imgSrc);

                        return (
                          <div
                            key={idx}
                            ref={(el) => {
                              slideItemRefs.current[idx] = el;
                            }}
                            data-slide-index={idx}
                            dir="ltr"
                            className="relative flex h-full w-full shrink-0 items-center justify-center p-3 sm:p-5 select-none [direction:ltr]"
                          >
                            {/* High-fidelity shimmer skeleton placeholder while image is fetching */}
                            {!isImageLoaded && (
                              <div className="absolute inset-3 sm:inset-5 rounded-2xl bg-neutral-200/80 dark:bg-neutral-800/60 overflow-hidden flex items-center justify-center pointer-events-none border border-black/5 dark:border-white/10">
                                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/50 dark:via-white/12 to-transparent pointer-events-none" />
                                <div className="opacity-20 dark:opacity-10 pointer-events-none">
                                  <svg className="w-12 h-12 stroke-[1.2] text-neutral-400 dark:text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                  </svg>
                                </div>
                              </div>
                            )}

                            <img
                              src={imgSrc || product?.image_url}
                              alt={`${displayTitle} - ${idx + 1}`}
                              decoding="async"
                              loading={idx === 0 || idx === activeImageIndex ? 'eager' : 'lazy'}
                              referrerPolicy="no-referrer"
                              draggable={false}
                              className={`max-h-full max-w-full w-auto h-auto object-contain drop-shadow-md select-none pointer-events-none transition-opacity duration-250 ${
                                isImageLoaded ? 'opacity-100' : 'opacity-0'
                              }`}
                              onError={(e) => {
                                const target = e.currentTarget;
                                if (product?.image_url && target.src !== product.image_url) {
                                  target.src = product.image_url;
                                }
                              }}
                              onLoad={() => {
                                if (imgSrc) {
                                  setLoadedImages((prev) => new Set(prev).add(imgSrc));
                                }
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>

                    {/* Carousel Navigation Arrows (Responsive on Desktop, Tablet & Mobile) */}
                    {images.length > 1 && (
                      <>
                        <button
                          type="button"
                          disabled={activeImageIndex <= 0}
                          onPointerDown={(e) => e.stopPropagation()}
                          onPointerUp={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (activeImageIndex > 0) paginate(-1);
                          }}
                          className={`absolute left-2.5 sm:left-3.5 top-1/2 -translate-y-1/2 z-30 flex h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 lg:h-13 lg:w-13 items-center justify-center rounded-full bg-white/90 dark:bg-[#16191f]/90 text-[#15171c] dark:text-white backdrop-blur-md shadow-lg border border-black/10 dark:border-white/15 transition-all ${
                            activeImageIndex > 0
                              ? 'hover:scale-110 active:scale-95 cursor-pointer opacity-100'
                              : 'opacity-0 pointer-events-none'
                          }`}
                          aria-label={lang === 'ar' ? 'الصورة السابقة' : 'Previous image'}
                        >
                          <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 md:h-5.5 md:w-5.5 lg:h-6 lg:w-6" />
                        </button>

                        <button
                          type="button"
                          disabled={activeImageIndex >= images.length - 1}
                          onPointerDown={(e) => e.stopPropagation()}
                          onPointerUp={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (activeImageIndex < images.length - 1) paginate(1);
                          }}
                          className={`absolute right-2.5 sm:right-3.5 top-1/2 -translate-y-1/2 z-30 flex h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 lg:h-13 lg:w-13 items-center justify-center rounded-full bg-white/90 dark:bg-[#16191f]/90 text-[#15171c] dark:text-white backdrop-blur-md shadow-lg border border-black/10 dark:border-white/15 transition-all ${
                            activeImageIndex < images.length - 1
                              ? 'hover:scale-110 active:scale-95 cursor-pointer opacity-100'
                              : 'opacity-0 pointer-events-none'
                          }`}
                          aria-label={lang === 'ar' ? 'الصورة التالية' : 'Next image'}
                        >
                          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-5.5 md:w-5.5 lg:h-6 lg:w-6" />
                        </button>

                        {/* Refined Luxury Floating Image Counter Badge (Compact & Elegant) */}
                        <div className="absolute top-3 left-3 z-20 flex items-center gap-1 rounded-full bg-black/60 dark:bg-black/75 px-2.5 py-0.5 text-[10.5px] font-mono font-semibold tracking-wide text-white/95 backdrop-blur-md border border-white/15 shadow-xs select-none">
                          <span className="text-[#60a5fa] font-bold">{activeImageIndex + 1}</span>
                          <span className="text-white/35">/</span>
                          <span className="text-white/75">{images.length}</span>
                        </div>

                        {/* Subtle Dynamic Pagination Dots Indicator at Bottom with Spring Physics */}
                        <div
                          dir="ltr"
                          className="absolute bottom-3.5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 rounded-full bg-black/60 dark:bg-black/80 px-2.5 py-1 backdrop-blur-md border border-white/15 shadow-lg pointer-events-auto select-none [direction:ltr]"
                        >
                          {images.map((_, i) => {
                            const isCurrent = i === activeImageIndex;
                            return (
                              <button
                                key={i}
                                type="button"
                                onPointerDown={(e) => e.stopPropagation()}
                                onPointerUp={(e) => e.stopPropagation()}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSlideDirection(i > activeImageIndex ? 1 : -1);
                                  setActiveImageIndex(i);
                                }}
                                className="relative flex items-center justify-center p-0.5 cursor-pointer focus:outline-none"
                                aria-label={`Slide ${i + 1}`}
                              >
                                <motion.span
                                  layout
                                  transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                                  className={`block rounded-full ${
                                    isCurrent
                                      ? 'w-4.5 h-1.5 bg-gradient-to-r from-[#004ad7] to-[#3b82f6] shadow-sm shadow-[#3b82f6]/50'
                                      : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/75'
                                  }`}
                                />
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Refined Luxury Animated Thumbnail Navigation Strip with Auto-Centering (Matched LTR Direction) */}
                  {images.length > 1 && (
                    <div
                      ref={thumbnailContainerRef}
                      dir="ltr"
                      className="mt-4 flex items-center justify-center overflow-x-auto py-1 px-2 no-scrollbar scroll-smooth [direction:ltr] w-full"
                    >
                      <div className="flex items-center justify-center gap-2 sm:gap-2.5 mx-auto min-w-fit">
                        {images.map((img, idx) => {
                          const isActive = idx === activeImageIndex;
                          return (
                            <button
                              key={idx}
                              ref={(el) => {
                                thumbnailItemRefs.current[idx] = el;
                              }}
                              dir="ltr"
                              type="button"
                              onPointerDown={(e) => e.stopPropagation()}
                              onClick={() => {
                                setSlideDirection(idx > activeImageIndex ? 1 : -1);
                                setActiveImageIndex(idx);
                              }}
                              className={`group relative h-14 w-14 sm:h-16 sm:w-16 md:h-18 md:w-18 shrink-0 overflow-hidden rounded-2xl transition-all duration-200 active:scale-95 cursor-pointer [direction:ltr] ${
                                isActive
                                  ? 'ring-2 ring-[#004ad7] dark:ring-[#3b82f6] ring-offset-2 ring-offset-[#f8f9fa] dark:ring-offset-[#16191f] shadow-md scale-105'
                                  : 'opacity-60 hover:opacity-100 hover:scale-100 border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5'
                              }`}
                              aria-label={`View image ${idx + 1}`}
                            >
                              <img
                                src={img}
                                alt=""
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                              />

                              {/* Thumbnail Index Pill */}
                              <span className="absolute bottom-1 right-1 z-10 rounded-md bg-black/65 px-1 py-0.2 text-[8.5px] font-mono font-bold text-white backdrop-blur-xs">
                                {idx + 1}
                              </span>

                              {isActive && (
                                <motion.div
                                  layoutId="active-thumb-glow"
                                  className="absolute inset-0 bg-[#004ad7]/15 dark:bg-[#3b82f6]/20 ring-1 ring-inset ring-white/30"
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* DETAILS SECTION: Spacious, Architectural & Uncluttered Luxury Layout (50/50 Balanced on Desktop) */}
                <div className="flex flex-col justify-between p-4 sm:p-6 md:p-7 lg:p-8 md:col-span-6 lg:col-span-6 md:overflow-y-auto no-scrollbar">
                  {/* Top Details Body */}
                  <div className="space-y-4 sm:space-y-5 md:space-y-6">
                    {/* 1. Header Metadata: Category + Availability Badge (With Safe Clearance from Close Button) */}
                    <div className="flex items-center gap-2 flex-wrap ltr:pe-12 rtl:pe-12 md:ltr:pe-16 md:rtl:pe-16">
                      {displayCategory && (
                        <span className="text-[11px] md:text-xs font-bold tracking-widest uppercase text-[#6b7280] dark:text-[#9ca3af]">
                          {displayCategory}
                        </span>
                      )}
                      {displayCategory && <span className="text-black/20 dark:text-white/20">•</span>}
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 md:px-3 py-0.5 md:py-1 text-[10px] md:text-xs font-semibold border backdrop-blur-md ${statusBadgeClasses}`}>
                        {statusDotClass && <span className={`h-1.5 w-1.5 rounded-full ${statusDotClass}`} />}
                        <span>{statusBadgeLabel}</span>
                      </span>
                    </div>

                    {/* 2. Editorial Title */}
                    <h2
                      dir="auto"
                      className="text-xl sm:text-2xl md:text-2xl lg:text-[28px] xl:text-3xl font-extrabold leading-snug tracking-tight text-[#15171c] dark:text-white"
                    >
                      {displayTitle}
                    </h2>

                    {/* Quick Actions (Share & Copy Title) - Positioned safely and clearly below the title, free from close button overlap */}
                    {(shareControl.visible || copyControl.visible) && (
                      <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap pt-0.5">
                        {copyControl.visible && (
                          <button
                            type="button"
                            onClick={handleCopyTitle}
                            className="relative flex h-8.5 sm:h-9 md:h-10 lg:h-10.5 items-center gap-1.5 md:gap-2 rounded-full border border-black/10 dark:border-white/15 bg-black/[0.03] dark:bg-white/[0.05] hover:bg-black/[0.06] dark:hover:bg-white/10 px-3 sm:px-3.5 md:px-4 text-[11px] sm:text-xs md:text-[13px] text-[#15171c] dark:text-white hover:border-[#004ad7] dark:hover:border-[#3b82f6] hover:text-[#004ad7] dark:hover:text-[#3b82f6] transition-all active:scale-95 cursor-pointer shadow-2xs font-semibold select-none"
                            title={lang === 'ar' ? copyControl.label_ar : copyControl.label_en}
                          >
                            {copiedTitle ? (
                              <>
                                <Check className="h-3.5 w-3.5 md:h-4 md:w-4 text-[#004ad7] dark:text-[#3b82f6] shrink-0" />
                                <span className="font-bold text-[#004ad7] dark:text-[#3b82f6]">
                                  {lang === 'ar' ? 'تم النسخ' : 'Copied'}
                                </span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5 md:h-4 md:w-4 text-[#6b7280] dark:text-[#9ca3af] shrink-0" />
                                <span>
                                  {lang === 'ar' ? copyControl.label_ar : copyControl.label_en}
                                </span>
                              </>
                            )}
                          </button>
                        )}

                        {shareControl.visible && (
                          <button
                            type="button"
                            onClick={() => setShowShareModal(true)}
                            className="flex h-8.5 sm:h-9 md:h-10 lg:h-10.5 items-center gap-1.5 md:gap-2 rounded-full border border-black/10 dark:border-white/15 bg-black/[0.03] dark:bg-white/[0.05] hover:bg-black/[0.06] dark:hover:bg-white/10 px-3 sm:px-3.5 md:px-4 text-[11px] sm:text-xs md:text-[13px] text-[#15171c] dark:text-white hover:border-[#004ad7] dark:hover:border-[#3b82f6] hover:text-[#004ad7] dark:hover:text-[#3b82f6] transition-all active:scale-95 cursor-pointer shadow-2xs font-semibold select-none"
                            title={lang === 'ar' ? shareControl.label_ar : shareControl.label_en}
                            aria-label={lang === 'ar' ? shareControl.label_ar : shareControl.label_en}
                          >
                            <Share2 className="h-3.5 w-3.5 md:h-4 md:w-4 text-[#6b7280] dark:text-[#9ca3af] shrink-0" />
                            <span>
                              {lang === 'ar' ? shareControl.label_ar : shareControl.label_en}
                            </span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* 3. Luxury Price & Offer Showcase */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-baseline gap-2.5">
                          <p className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-extrabold tabular-nums text-[#004ad7] dark:text-[#3b82f6] tracking-tight">
                            {formatPrice(product.price)}
                          </p>
                          {product.is_offer && product.original_price && product.original_price > product.price && (
                            <span className="text-sm sm:text-base md:text-lg text-black/35 dark:text-white/40 line-through tabular-nums font-mono font-medium">
                              {formatPrice(product.original_price)}
                            </span>
                          )}
                        </div>

                        {product.is_offer && (
                          <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 md:px-3.5 md:py-1.5 lg:px-4 lg:py-2 text-xs md:text-sm lg:text-[15px] font-bold bg-[#004ad7]/10 dark:bg-[#3b82f6]/15 border border-[#004ad7]/25 dark:border-[#3b82f6]/35 text-[#004ad7] dark:text-[#60a5fa] shadow-2xs">
                            <Tag className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" />
                            <span>{lang === 'ar' ? (product.offer_badge_ar || 'عرض خاص') : (product.offer_badge_en || 'Special Offer')}</span>
                            {product.original_price && product.original_price > product.price && (
                              <span dir="ltr" className="rounded-md bg-[#004ad7] dark:bg-[#3b82f6] text-white px-1.5 py-0.2 font-mono font-black text-[10px] md:text-xs">
                                -{Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Single clean status strip if not regular in_stock */}
                      {availability !== 'in_stock' && (
                        <div className="flex items-center gap-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/10 px-3 py-2 text-xs md:text-sm text-[#15171c] dark:text-white/85">
                          <span className={`h-2 w-2 rounded-full shrink-0 ${statusDotClass || 'bg-[#004ad7]'}`} />
                          <span dir="auto" className="leading-snug">{statusBannerText}</span>
                        </div>
                      )}
                    </div>

                    {/* 4. Description */}
                    {displayDescription && (
                      <p
                        dir="auto"
                        className="text-xs sm:text-sm md:text-sm lg:text-[15px] leading-relaxed text-[#15171c]/70 dark:text-white/70"
                      >
                        {displayDescription}
                      </p>
                    )}

                    <div className="h-px w-full bg-black/5 dark:bg-white/5" />

                    {/* 5. Clean Sizing & Fit Section */}
                    <div className="space-y-3">
                      {/* Sizing Header Row: Title + Guide Trigger */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="text-xs md:text-sm font-bold text-[#15171c] dark:text-white uppercase tracking-wider">
                            {lang === 'ar' ? 'المقاس:' : 'Size:'}
                          </span>
                          {selectedSize ? (
                            <span className="rounded-lg bg-[#004ad7] text-white px-2 py-0.5 md:px-3 md:py-1 text-xs md:text-sm font-bold shadow-2xs">
                              {selectedSize}
                            </span>
                          ) : (
                            <span className="text-xs md:text-sm text-[#6b7280] dark:text-[#9ca3af]">
                              {lang === 'ar' ? 'يرجى اختيار مقاسك' : 'Please select'}
                            </span>
                          )}
                        </div>

                        {sizeGuideControl.visible && (
                          <button
                            type="button"
                            onClick={() => setShowSizeGuide(!showSizeGuide)}
                            className="inline-flex items-center gap-1.5 md:gap-2 rounded-full px-2.5 py-1 md:h-10 md:px-4 lg:h-10.5 lg:px-4.5 bg-black/[0.03] dark:bg-white/[0.05] border border-black/8 dark:border-white/10 text-xs md:text-sm font-semibold text-[#004ad7] dark:text-[#3b82f6] hover:bg-[#004ad7]/10 dark:hover:bg-[#3b82f6]/15 cursor-pointer transition-all active:scale-95"
                          >
                            <Ruler className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            <span>{lang === 'ar' ? sizeGuideControl.label_ar : sizeGuideControl.label_en}</span>
                          </button>
                        )}
                      </div>

                      {/* Size Selection Grid */}
                      <ul className="flex flex-wrap gap-2 md:gap-2.5 lg:gap-3">
                        {renderedSizes.map((size) => {
                          const isAvailable = availableSizes.has(size.toUpperCase());
                          const isSelected = selectedSize === size;

                          return (
                            <li key={size}>
                              <button
                                type="button"
                                onClick={() => handleSizeClick(size)}
                                className={`flex h-10 min-w-[48px] px-3.5 md:h-13.5 md:min-w-[60px] lg:h-14 lg:min-w-[66px] md:px-5 lg:px-6 items-center justify-center rounded-xl md:rounded-2xl border text-xs sm:text-sm md:text-[15px] lg:text-base font-bold transition-all active:scale-95 cursor-pointer ${
                                  isSelected
                                    ? 'border-[#004ad7] bg-[#004ad7] text-white shadow-md shadow-[#004ad7]/25 ring-2 ring-[#004ad7]/30 dark:border-[#3b82f6] dark:bg-[#3b82f6]'
                                    : isAvailable
                                    ? 'border-black/12 dark:border-white/15 bg-white dark:bg-[#20242c] text-[#15171c] dark:text-white hover:border-[#004ad7] dark:hover:border-[#3b82f6]'
                                    : 'border-black/8 dark:border-white/8 bg-black/[0.02] dark:bg-white/[0.02] text-black/30 dark:text-white/25 line-through hover:border-black/20'
                                }`}
                                aria-label={`${size} ${isAvailable ? 'available' : isSoldOut ? 'sold out' : 'out of stock'}`}
                              >
                                {size}
                              </button>
                            </li>
                          );
                        })}
                      </ul>

                      {/* Size selection feedback banner */}
                      {sizeFeedback && (
                        <div
                          className={`flex items-center gap-2 rounded-xl p-2.5 md:p-3 text-xs md:text-sm transition-colors ${
                            selectedSize && availableSizes.has(selectedSize)
                              ? 'bg-[#004ad7]/8 dark:bg-[#3b82f6]/15 text-[#004ad7] dark:text-[#3b82f6] border border-[#004ad7]/20 dark:border-[#3b82f6]/30'
                              : 'bg-black/[0.03] dark:bg-white/[0.05] text-[#15171c] dark:text-white/85 border border-black/5 dark:border-white/10'
                          }`}
                        >
                          {selectedSize && availableSizes.has(selectedSize) ? (
                            <Check className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0 text-[#004ad7] dark:text-[#3b82f6]" />
                          ) : (
                            <AlertCircle className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0 text-[#004ad7] dark:text-[#3b82f6]" />
                          )}
                          <span className="font-medium">{sizeFeedback}</span>
                        </div>
                      )}

                      {/* Tabbed Expandable Size Guide (Calculators & Tables) */}
                      <AnimatePresence>
                        {showSizeGuide && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.22, ease: 'easeInOut' }}
                            className="overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 bg-white/95 dark:bg-[#1e222a] p-3.5 sm:p-4 shadow-sm space-y-3"
                          >
                            <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/10">
                              {/* 2 Clean Tabs */}
                              <div className="flex items-center gap-1.5 bg-black/[0.04] dark:bg-white/[0.05] p-1 rounded-xl">
                                <button
                                  type="button"
                                  onClick={() => setSizeGuideTab('calculator')}
                                  className={`rounded-lg px-2.5 py-1 md:px-4 md:py-2 text-[11px] md:text-xs font-bold transition-all cursor-pointer ${
                                    sizeGuideTab === 'calculator'
                                      ? 'bg-white dark:bg-[#14171f] text-[#004ad7] dark:text-[#60a5fa] shadow-2xs'
                                      : 'text-[#6b7280] dark:text-[#9ca3af] hover:text-black dark:hover:text-white'
                                  }`}
                                >
                                  {lang === 'ar' ? 'حاسبة المقاس' : 'Fit Calculator'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setSizeGuideTab('table')}
                                  className={`rounded-lg px-2.5 py-1 md:px-4 md:py-2 text-[11px] md:text-xs font-bold transition-all cursor-pointer ${
                                    sizeGuideTab === 'table'
                                      ? 'bg-white dark:bg-[#14171f] text-[#004ad7] dark:text-[#60a5fa] shadow-2xs'
                                      : 'text-[#6b7280] dark:text-[#9ca3af] hover:text-black dark:hover:text-white'
                                  }`}
                                >
                                  {lang === 'ar' ? 'جدول المقاسات' : 'Size Table'}
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => setShowSizeGuide(false)}
                                className="text-[#6b7280] dark:text-[#9ca3af] hover:text-black dark:hover:text-white cursor-pointer p-1.5 md:p-2 rounded-lg"
                                aria-label={lang === 'ar' ? 'إغلاق الدليل' : 'Close guide'}
                              >
                                <X className="h-4 w-4 md:h-4.5 md:w-4.5" />
                              </button>
                            </div>

                            {/* TAB 1: Smart Fit Recommender */}
                            {sizeGuideTab === 'calculator' && (
                              <div className="space-y-3">
                                <span className="text-[11px] md:text-xs font-medium text-[#6b7280] dark:text-[#9ca3af] block">
                                  {lang === 'ar'
                                    ? 'أدخل طولك ووزنك لاقتراح المقاس المثالي فوراً:'
                                    : 'Enter your height and weight for an instant fit recommendation:'}
                                </span>

                                <div className="grid grid-cols-2 gap-2.5 md:gap-3.5">
                                  <div>
                                    <label className="text-[10px] md:text-xs text-[#6b7280] dark:text-[#9ca3af] block mb-1">
                                      {lang === 'ar' ? 'الطول (120 - 220 سم)' : 'Height (120 - 220 cm)'}
                                    </label>
                                    <input
                                      type="text"
                                      inputMode="numeric"
                                      maxLength={3}
                                      placeholder={lang === 'ar' ? 'مثال: 175' : 'e.g. 175'}
                                      value={calcHeight}
                                      onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 3);
                                        setCalcHeight(val);
                                      }}
                                      className="w-full rounded-lg md:rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-[#16191f] px-2.5 py-1.5 md:py-2.5 md:px-3 text-xs md:text-sm text-[#15171c] dark:text-white outline-none focus:border-[#004ad7]"
                                    />
                                  </div>

                                  <div>
                                    <label className="text-[10px] md:text-xs text-[#6b7280] dark:text-[#9ca3af] block mb-1">
                                      {lang === 'ar' ? 'الوزن (30 - 200 كغم)' : 'Weight (30 - 200 kg)'}
                                    </label>
                                    <input
                                      type="text"
                                      inputMode="numeric"
                                      maxLength={3}
                                      placeholder={lang === 'ar' ? 'مثال: 72' : 'e.g. 72'}
                                      value={calcWeight}
                                      onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 3);
                                        setCalcWeight(val);
                                      }}
                                      className="w-full rounded-lg md:rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-[#16191f] px-2.5 py-1.5 md:py-2.5 md:px-3 text-xs md:text-sm text-[#15171c] dark:text-white outline-none focus:border-[#004ad7]"
                                    />
                                  </div>
                                </div>

                                {dynamicRecommendation && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 3 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`rounded-xl md:rounded-2xl p-3 md:p-3.5 border flex flex-col gap-2 ${
                                      dynamicRecommendation.isBespoke
                                        ? 'border-amber-500/30 bg-amber-500/[0.08] dark:bg-amber-500/[0.1]'
                                        : 'border-[#004ad7]/20 bg-[#004ad7]/[0.05] dark:bg-[#3b82f6]/[0.08]'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-xs md:text-sm text-[#15171c] dark:text-white font-medium">
                                          {lang === 'ar' ? 'المقاس المقترح:' : 'Recommended Fit:'}
                                        </span>
                                        <span
                                          className={`rounded-md md:rounded-lg px-2 py-0.5 md:px-2.5 md:py-1 text-xs md:text-sm font-bold text-white shadow-2xs ${
                                            dynamicRecommendation.isBespoke
                                              ? 'bg-amber-600 dark:bg-amber-500'
                                              : 'bg-[#004ad7] dark:bg-[#3b82f6]'
                                          }`}
                                        >
                                          {dynamicRecommendation.displaySize}
                                        </span>
                                      </div>

                                      {dynamicRecommendation.isBespoke ? (
                                        bespokeControl.visible ? (
                                          <a
                                            href={bespokeWhatsappUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="rounded-lg md:rounded-xl bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 px-2.5 py-1 md:px-3.5 md:py-1.5 text-[11px] md:text-xs font-semibold text-white shadow-2xs cursor-pointer"
                                          >
                                            {lang === 'ar' ? bespokeControl.label_ar : bespokeControl.label_en}
                                          </a>
                                        ) : null
                                      ) : dynamicRecommendation.size ? (
                                        <button
                                          type="button"
                                          onClick={() => handleSizeClick(dynamicRecommendation.size!)}
                                          className="rounded-lg md:rounded-xl bg-[#004ad7] dark:bg-[#3b82f6] px-2.5 py-1 md:px-3.5 md:py-1.5 text-[11px] md:text-xs font-semibold text-white shadow-2xs cursor-pointer active:scale-95"
                                        >
                                          {lang === 'ar'
                                            ? `اختيار مقاس (${dynamicRecommendation.displaySize})`
                                            : `Select (${dynamicRecommendation.displaySize})`}
                                        </button>
                                      ) : null}
                                    </div>

                                    <p className="text-[10px] md:text-xs text-[#6b7280] dark:text-[#9ca3af] leading-relaxed">
                                      {lang === 'ar' ? dynamicRecommendation.note_ar : dynamicRecommendation.note_en}
                                    </p>
                                  </motion.div>
                                )}
                              </div>
                            )}

                            {/* TAB 2: Measurements Table (Only Height & Weight) */}
                            {sizeGuideTab === 'table' && (
                              <div className="space-y-2.5">
                                <div className="rounded-xl sm:rounded-2xl border border-black/8 dark:border-white/10 bg-black/[0.02] dark:bg-black/30 overflow-hidden">
                                  <table className="w-full text-center text-xs md:text-sm">
                                    <thead>
                                      <tr className="text-[#6b7280] dark:text-[#9ca3af] border-b border-black/8 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.04]">
                                        <th className="py-2.5 px-3 md:py-3 md:px-4 font-bold text-start w-[30%]">{lang === 'ar' ? 'المقاس' : 'Size'}</th>
                                        <th className="py-2.5 px-3 md:py-3 md:px-4 font-bold w-[35%]">{lang === 'ar' ? 'الطول' : 'Height'}</th>
                                        <th className="py-2.5 px-3 md:py-3 md:px-4 font-bold w-[35%]">{lang === 'ar' ? 'الوزن' : 'Weight'}</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-black/5 dark:divide-white/5 text-xs md:text-sm">
                                      {masterSizes.filter((r) => r.enabled).map((row) => {
                                        const isRowSelected = selectedSize === row.size;
                                        return (
                                          <tr
                                            key={row.id || row.size}
                                            onClick={() => handleSizeClick(row.size)}
                                            className={`transition-colors cursor-pointer ${
                                              isRowSelected
                                                ? 'bg-[#004ad7]/12 dark:bg-[#3b82f6]/20 font-bold text-[#004ad7] dark:text-[#3b82f6]'
                                                : 'text-[#15171c] dark:text-white/90 hover:bg-black/5 dark:hover:bg-white/5'
                                            }`}
                                            title={lang === 'ar' ? `انقر لاختيار مقاس (${row.size})` : `Click to select (${row.size})`}
                                          >
                                            <td className="py-2.5 px-3 md:py-3 md:px-4 font-bold text-start font-sans">
                                              <span className="inline-flex items-center gap-2">
                                                <span className={`h-2 w-2 rounded-full transition-transform ${isRowSelected ? 'bg-[#004ad7] dark:bg-[#3b82f6] scale-125' : 'bg-black/20 dark:bg-white/20'}`} />
                                                <span className="px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10 text-xs md:text-sm font-bold">{row.size}</span>
                                              </span>
                                            </td>
                                            <td className="py-2.5 px-3 md:py-3 md:px-4 tabular-nums font-medium text-zinc-700 dark:text-zinc-200">{row.height || '—'}</td>
                                            <td className="py-2.5 px-3 md:py-3 md:px-4 tabular-nums font-medium text-zinc-700 dark:text-zinc-200">{row.weight || '—'}</td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                                <p className="text-[10.5px] md:text-xs text-[#6b7280] dark:text-[#9ca3af] text-center">
                                  {lang === 'ar' ? 'انقر على أي مقاس لاعتماده فوراً للقطعة' : 'Tap any size row to select it instantly'}
                                </p>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="h-px w-full bg-black/5 dark:bg-white/5" />

                    {/* 6. Cohesive Micro Highlights Grid (Delivery & Craftsmanship) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 text-xs md:text-sm">
                      <div className="flex items-start gap-2.5 md:gap-3 rounded-xl md:rounded-2xl border border-black/6 dark:border-white/8 bg-black/[0.02] dark:bg-white/[0.03] p-2.5 md:p-3.5 lg:p-4">
                        <Truck className="h-4 w-4 md:h-5 md:w-5 shrink-0 text-[#004ad7] dark:text-[#3b82f6] mt-0.5" />
                        <div>
                          <span className="font-bold text-[11px] md:text-xs lg:text-[13px] text-[#15171c] dark:text-white block">
                            {lang === 'ar' ? 'توصيل سريع لكافة المحافظات' : 'Nationwide Fast Delivery'}
                          </span>
                          <span className="text-[10px] md:text-[11px] lg:text-xs text-[#6b7280] dark:text-[#9ca3af] leading-normal block mt-0.5">
                            {lang === 'ar' ? 'خلال 3 - 5 أيام مع حق الفحص والمعاينة عند الاستلام' : 'Within 3 - 5 days with inspection upon arrival'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 md:gap-3 rounded-xl md:rounded-2xl border border-black/6 dark:border-white/8 bg-black/[0.02] dark:bg-white/[0.03] p-2.5 md:p-3.5 lg:p-4">
                        <Sparkles className="h-4 w-4 md:h-5 md:w-5 shrink-0 text-[#004ad7] dark:text-[#3b82f6] mt-0.5" />
                        <div>
                          <span className="font-bold text-[11px] md:text-xs lg:text-[13px] text-[#15171c] dark:text-white block">
                            {lang === 'ar' ? 'تفصيل فاخر وقصة إيطالية' : 'Luxury Italian Tailoring'}
                          </span>
                          <span className="text-[10px] md:text-[11px] lg:text-xs text-[#6b7280] dark:text-[#9ca3af] leading-normal block mt-0.5">
                            {lang === 'ar' ? 'حرفية يدوية بإتقان مع ضمان أصالة المظهر' : 'Handcrafted precision & authentic lookbook drop'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 7. BOTTOM ORDER ACTION (WhatsApp Primary Button) */}
                  {whatsappControl.visible && (
                    <div className="pt-3 sm:pt-4 md:pt-5 mt-2 sm:mt-3 md:mt-4 pb-[env(safe-area-inset-bottom)]">
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          if (product) {
                            trackEvent('whatsapp_order', {
                              productId: product.id,
                              title: displayTitle,
                              size: selectedSize,
                              isBespoke: false,
                            });
                          }
                        }}
                        className="group relative flex h-12 md:h-14.5 lg:h-15.5 w-full items-center justify-center gap-2.5 md:gap-3 rounded-2xl md:rounded-[22px] bg-[#004ad7] hover:bg-[#003db3] dark:bg-[#3b82f6] dark:hover:bg-[#2563eb] text-white text-sm md:text-base lg:text-lg font-bold tracking-wide transition-all active:scale-[0.98] shadow-md md:shadow-xl shadow-[#004ad7]/25 dark:shadow-[#3b82f6]/30 cursor-pointer"
                      >
                        <MessageCircle className="h-4.5 w-4.5 md:h-5.5 md:w-5.5 lg:h-6 lg:w-6 fill-white/20 stroke-white stroke-[2]" />
                        <span>
                          {selectedSize
                            ? `${lang === 'ar' ? whatsappControl.label_ar : whatsappControl.label_en} (${selectedSize})`
                            : buttonLabel || (lang === 'ar' ? whatsappControl.label_ar : whatsappControl.label_en)}
                        </span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Share Modal Dialog */}
            <ShareModal
              isOpen={showShareModal}
              onClose={() => setShowShareModal(false)}
              product={product}
              lang={lang}
            />
          </div>
        )}
      </AnimatePresence>
    );
  }
