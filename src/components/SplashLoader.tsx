import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SplashMotifType } from '../context/SiteControlsContext';

export interface MotifOption {
  id: SplashMotifType;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
}

export const AVAILABLE_SPLASH_MOTIFS: MotifOption[] = [
  {
    id: 'print_press',
    titleAr: 'ماكينة السكرين برنت والطباعة الحرارية',
    titleEn: 'Screen Print Squeegee & Laser Press',
    subtitleAr: 'ماسحة الحبر وسحب طباعة الشعار الحرارية مباشرة على تيشيرت الدار',
    subtitleEn: 'Laser print squeegee pass stamping VANT emblem onto garment fabric',
  },
  {
    id: 'tshirt_print',
    titleAr: 'تيشيرت الدار وطباعة الشعار المباشرة',
    titleEn: 'VANT Streetwear T-Shirt & DTG Print',
    subtitleAr: 'قصّة تيشيرت الأوفرسايز الفاخرة مع طباعة الشعار على الصدر بالليزر',
    subtitleEn: 'Luxury streetwear crewneck silhouette with chest emblem graphic print',
  },
  {
    id: 'embroidery',
    titleAr: 'تطريز الخيط الملكي وإطار الأتيليه',
    titleEn: 'Atelier Embroidery Hoop & Stitches',
    subtitleAr: 'طارة التطريز اليدوي الفاخرة وإبرة غرز الخيوط المتقاطعة',
    subtitleEn: 'Royal embroidery hoop with needle stitching gold and cobalt crest',
  },
  {
    id: 'hanger',
    titleAr: 'علاقة الأزياء المعمارية والحرير',
    titleEn: 'Architectural Atelier Hanger',
    subtitleAr: 'علاقة أزياء هندسية مع انسياب خيط الحرير والختم الألماسي',
    subtitleEn: 'Bespoke coat hanger with draped silk thread & diamond seal',
  },
  {
    id: 'needle_thread',
    titleAr: 'إبرة الحياكة والخيط المنساب',
    titleEn: 'Sartorial Needle & Silk Thread',
    subtitleAr: 'إبرة خياطة فضية تحيك تموجات الحرير الملكية وغرز الأتيليه',
    subtitleEn: 'Silver tailor needle weaving cobalt silk waves and stitches',
  },
  {
    id: 'mannequin',
    titleAr: 'مانيكان التفصيل وشريط القياس',
    titleEn: 'Couture Mannequin & Ribbon',
    subtitleAr: 'جذع تمثال الخياطة الراقي مع شريط القياس الحريري المنسدل',
    subtitleEn: 'Atelier dressmaker dress form draped with measuring tape',
  },
  {
    id: 'scissors',
    titleAr: 'مقص الأتيليه وقماش الحرير',
    titleEn: 'Tailoring Shears & Silk Fabric',
    subtitleAr: 'مقص تفصيل الأقمشة الكلاسيكي مع خطوط طي الحرير الراقية',
    subtitleEn: 'Classic sartorial shears cutting and draping fine silk fibers',
  },
  {
    id: 'monogram',
    titleAr: 'شعار المونوغرام الهندسي الفاخر',
    titleEn: 'Geometric Monogram Emblem',
    subtitleAr: 'درع هندسي فاخر متداخل مع حلقة مدارية وبوصلة أزياء',
    subtitleEn: 'Interlocking diamond facet crest with subtle orbital halo',
  },
];

interface Props {
  isLoading: boolean;
  loadingTextEn?: string;
  loadingTextAr?: string;
  motif?: SplashMotifType;
  isPreview?: boolean;
  onClosePreview?: () => void;
  onFinished?: () => void;
}

function FashionMotifGraphic({ motif }: { motif: SplashMotifType }) {
  if (motif === 'print_press') {
    return (
      <div className="relative flex items-center justify-center h-20 w-28">
        <svg viewBox="0 0 100 70" className="h-full w-full stroke-white fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {/* T-shirt background outline */}
          <motion.path
            d="M30 18 L40 12 C44 18 56 18 60 12 L70 18 L64 26 L58 24 L58 58 L42 58 L42 24 L36 26 Z"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="stroke-white/40"
          />
          {/* Printed VANT Chest Emblem Stamped Line */}
          <motion.path
            d="M45 28 L50 38 L55 28"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.35, ease: 'easeInOut' }}
            strokeWidth="2.5"
            className="stroke-[#3b82f6]"
          />
          {/* Squeegee Bar sliding vertically */}
          <motion.g
            animate={{ y: [-10, 14, -10] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <line x1="32" y1="28" x2="68" y2="28" className="stroke-[#3b82f6]" strokeWidth="3" />
            <rect x="42" y="22" width="16" height="6" rx="1" className="fill-[#3b82f6] stroke-[#3b82f6]" />
          </motion.g>
        </svg>
        <div className="absolute bottom-2 h-1 w-12 bg-[#3b82f6]/30 blur-md rounded-full animate-pulse" />
      </div>
    );
  }

  if (motif === 'tshirt_print') {
    return (
      <div className="relative flex items-center justify-center h-20 w-28">
        <svg viewBox="0 0 100 70" className="h-full w-full stroke-white fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {/* Crewneck T-Shirt Contour */}
          <motion.path
            d="M28 20 L40 12 C45 18 55 18 60 12 L72 20 L65 29 L58 26 L58 60 L42 60 L42 26 L35 29 Z"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="stroke-white/90"
          />
          {/* Collar seam */}
          <motion.path
            d="M40 12 C45 18 55 18 60 12"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="stroke-[#3b82f6]"
          />
          {/* Laser DTG Printed Logo Emblem */}
          <motion.path
            d="M44 32 L50 44 L56 32"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4, ease: 'easeInOut' }}
            strokeWidth="2.8"
            className="stroke-[#3b82f6]"
          />
          {/* Chest Pocket Frame */}
          <motion.rect
            x="52" y="29" width="8" height="10" rx="1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 0.5 }}
            strokeWidth="1"
            className="stroke-white/60"
          />
        </svg>
      </div>
    );
  }

  if (motif === 'embroidery') {
    return (
      <div className="relative flex items-center justify-center h-20 w-28">
        <svg viewBox="0 0 100 70" className="h-full w-full stroke-white fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {/* Embroidery Hoop Circle */}
          <motion.circle
            cx="50"
            cy="35"
            r="24"
            initial={{ pathLength: 0, rotate: -90 }}
            animate={{ pathLength: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="stroke-white/70"
            strokeWidth="2.2"
          />
          {/* Hoop Screw Clamp */}
          <motion.rect
            x="46" y="7" width="8" height="5" rx="1"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            className="stroke-[#3b82f6] fill-[#3b82f6]"
          />
          {/* Embroidered V Logo inside */}
          <motion.path
            d="M40 28 L50 44 L60 28"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.7, delay: 0.35, ease: 'easeInOut' }}
            strokeWidth="2.8"
            className="stroke-[#3b82f6]"
          />
          {/* Needle Cross Stitches */}
          <motion.path
            d="M34 32 L38 38 M38 32 L34 38 M62 32 L66 38 M66 32 L62 38"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 0.5 }}
            strokeWidth="1.2"
            className="stroke-white/80"
          />
        </svg>
      </div>
    );
  }

  if (motif === 'needle_thread') {
    return (
      <div className="relative flex items-center justify-center h-16 w-24">
        <svg viewBox="0 0 100 60" className="h-full w-full stroke-white fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {/* Needle Body */}
          <motion.path
            d="M25 45 L70 15"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            strokeWidth="2.5"
            className="stroke-white"
          />
          {/* Needle Eyelet */}
          <motion.ellipse
            cx="68"
            cy="16.5"
            rx="2.5"
            ry="1.2"
            transform="rotate(-33 68 16.5)"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="stroke-[#3b82f6] fill-[#3b82f6]/20"
          />
          {/* Flowing Cobalt Silk Thread */}
          <motion.path
            d="M68 16.5 Q85 10 78 28 T50 35 T20 48 T10 40"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.9, delay: 0.2, ease: 'easeInOut' }}
            className="stroke-[#3b82f6]"
            strokeWidth="2"
          />
          {/* Subtle Cross Stitches */}
          <motion.path
            d="M32 30 L38 36 M38 30 L32 36 M52 42 L58 48 M58 42 L52 48"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            strokeWidth="1.2"
            className="stroke-white/60"
          />
        </svg>
        <div className="absolute top-[14px] right-[24px] h-1.5 w-1.5 rounded-full bg-[#3b82f6] shadow-[0_0_8px_#3b82f6] animate-pulse" />
      </div>
    );
  }

  if (motif === 'mannequin') {
    return (
      <div className="relative flex items-center justify-center h-16 w-24">
        <svg viewBox="0 0 100 65" className="h-full w-full stroke-white fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {/* Neck Finial */}
          <motion.circle
            cx="50"
            cy="10"
            r="3"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4 }}
            className="stroke-[#3b82f6] fill-[#3b82f6]/30"
          />
          <motion.line x1="50" y1="13" x2="50" y2="18" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} />
          {/* Torso Silhouette */}
          <motion.path
            d="M36 19 C38 28 42 32 40 46 L60 46 C58 32 62 28 64 19 Z"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
            className="stroke-white/90"
          />
          {/* Draped Measuring Tape */}
          <motion.path
            d="M38 23 Q50 34 62 23 M42 36 Q50 42 58 36"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.7, delay: 0.35, ease: 'easeInOut' }}
            className="stroke-[#3b82f6]"
            strokeDasharray="2 2"
          />
          {/* Stand Base */}
          <motion.line x1="50" y1="46" x2="50" y2="58" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3 }} />
          <motion.line x1="42" y1="58" x2="58" y2="58" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.4 }} className="stroke-white/60" />
        </svg>
      </div>
    );
  }

  if (motif === 'monogram') {
    return (
      <div className="relative flex items-center justify-center h-16 w-24">
        <svg viewBox="0 0 100 60" className="h-full w-full stroke-white fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {/* Outer Diamond Shield */}
          <motion.polygon
            points="50,8 80,30 50,52 20,30"
            initial={{ pathLength: 0, rotate: -10 }}
            animate={{ pathLength: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="stroke-white/80"
          />
          {/* Inner Monogram V */}
          <motion.path
            d="M36 22 L50 42 L64 22"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, delay: 0.25, ease: 'easeOut' }}
            strokeWidth="2.8"
            className="stroke-white"
          />
          {/* Center Cobalt Accent Diamond */}
          <motion.polygon
            points="50,22 55,27 50,32 45,27"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, delay: 0.45 }}
            className="stroke-[#3b82f6] fill-[#3b82f6]"
          />
          {/* Subtle Outer Orbital Arc */}
          <motion.path
            d="M15 30 A38 18 0 0 1 85 30"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.4 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="stroke-[#3b82f6]"
            strokeDasharray="3 3"
          />
        </svg>
      </div>
    );
  }

  if (motif === 'scissors') {
    return (
      <div className="relative flex items-center justify-center h-16 w-24">
        <svg viewBox="0 0 100 60" className="h-full w-full stroke-white fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {/* Scissors Left Blade & Loop */}
          <motion.path
            d="M26 44 C20 44 20 36 26 36 C30 36 36 40 48 29 L76 14"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="stroke-white/90"
          />
          {/* Scissors Right Blade & Loop */}
          <motion.path
            d="M26 16 C20 16 20 24 26 24 C30 24 36 20 48 31 L76 46"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
            className="stroke-white/90"
          />
          {/* Pivot Screw */}
          <motion.circle cx="48" cy="30" r="2" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }} className="fill-[#3b82f6] stroke-[#3b82f6]" />
          {/* Silk Drape Guide Line */}
          <motion.path
            d="M56 30 Q70 26 84 30"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.6 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="stroke-[#3b82f6]"
            strokeDasharray="2 2"
          />
        </svg>
      </div>
    );
  }

  // Default: Hanger
  return (
    <div className="relative flex items-center justify-center h-16 w-24">
      <svg viewBox="0 0 100 60" className="h-full w-full stroke-white/85 fill-none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        {/* Hook */}
        <motion.path
          d="M50 18 C50 10 56 6 60 10 C64 14 58 22 50 24 L50 27"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="stroke-[#3b82f6]"
        />
        {/* Hanger Shoulder Slopes */}
        <motion.path
          d="M50 27 L18 47 C15 49 19 51 25 51 L75 51 C81 51 85 49 82 47 Z"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
        />
        {/* Draped Fabric Curve */}
        <motion.path
          d="M30 51 Q50 56 70 51"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.65 }}
          transition={{ duration: 0.7, delay: 0.3, ease: 'easeInOut' }}
          className="stroke-white"
        />
      </svg>
      {/* Center diamond seal */}
      <div className="absolute top-[26px] left-1/2 -translate-x-1/2 h-1.5 w-1.5 rotate-45 bg-[#3b82f6] shadow-[0_0_10px_#3b82f6]" />
    </div>
  );
}

export default function SplashLoader({
  isLoading,
  loadingTextEn = 'INITIALIZING ARCHIVE',
  loadingTextAr = 'جاري تجهيز الكتالوج والقطع الحصرية',
  motif = 'hanger',
  isPreview = false,
  onClosePreview,
  onFinished,
}: Props) {
  const [progress, setProgress] = useState(0);
  const [shouldRender, setShouldRender] = useState(true);
  const [replayKey, setReplayKey] = useState(0);
  const [nameToggle, setNameToggle] = useState<'en' | 'ar'>('en');

  // Calm, luxury bilingual rhythm (switches every 2.8s)
  useEffect(() => {
    const interval = setInterval(() => {
      setNameToggle((prev) => (prev === 'en' ? 'ar' : 'en'));
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  // Smooth cinematic progress bar interpolation with balanced luxury pacing
  useEffect(() => {
    setProgress(0);
    setShouldRender(true);

    let timer: NodeJS.Timeout;
    const startTime = Date.now();
    const duration = isPreview ? 2200 : 1300; // Relaxed & smooth

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      if (pct < 100) {
        timer = setTimeout(updateProgress, 25);
      }
    };

    updateProgress();

    return () => clearTimeout(timer);
  }, [isPreview, replayKey]);

  // Real visitor auto-exit once progress reaches 100% and data is ready
  useEffect(() => {
    if (!isPreview && !isLoading && progress >= 100) {
      const timeout = setTimeout(() => {
        setShouldRender(false);
        onFinished?.();
      }, 350);
      return () => clearTimeout(timeout);
    }
  }, [isPreview, isLoading, progress, onFinished]);

  return (
    <AnimatePresence>
      {shouldRender && (
        <motion.div
          key={`vant-splash-screen-${replayKey}`}
          initial={{ opacity: 1, y: 0 }}
          exit={{
            y: '-100%',
            opacity: 0.95,
            transition: {
              duration: 0.75,
              ease: [0.16, 1, 0.3, 1],
            },
          }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-between bg-[#08090c] text-white select-none overflow-hidden"
        >
          {/* Pure Monochromatic Luxury Spotlight */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[550px] w-[550px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,74,215,0.15),transparent_70%)] blur-3xl pointer-events-none" />

          {/* Top Bar (Monochrome & Cobalt Blue Only) */}
          <div className="w-full pt-8 sm:pt-10 px-6 sm:px-12 flex flex-wrap items-center justify-between gap-3 z-10 text-[10.5px] font-mono tracking-widest text-white/40 uppercase">
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#004ad7] animate-pulse" />
              <span className="text-white/80 font-bold tracking-[0.25em]">VANT</span>
              <span className="hidden sm:inline text-white/30">• ARCHIVE</span>
            </span>

            {isPreview ? (
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-white/10 text-white/90 border border-white/20 px-3 py-1 font-bold text-[10px] tracking-wider uppercase">
                  {progress >= 100 ? 'PREVIEW READY' : 'PREVIEWING'}
                </span>

                <button
                  type="button"
                  onClick={() => setReplayKey((k) => k + 1)}
                  className="rounded-full bg-white/10 hover:bg-white/20 text-white px-3 py-1 font-bold text-[10.5px] cursor-pointer transition-all active:scale-95 border border-white/15"
                >
                  إعادة التشغيل ↻
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShouldRender(false);
                    onClosePreview?.();
                  }}
                  className="rounded-full bg-white hover:bg-white/90 text-black px-3.5 py-1 font-extrabold text-[11px] cursor-pointer transition-all active:scale-95 shadow-md"
                >
                  ✕ إغلاق
                </button>
              </div>
            ) : (
              <span className="text-white/40 tracking-[0.3em] font-light">COLLECTION 2026</span>
            )}
          </div>

          {/* Centerpiece: Selected Fashion Icon + VANT Bilingual Kinetic Reveal */}
          <div className="flex flex-col items-center justify-center text-center px-6 z-10 my-auto w-full max-w-xl space-y-6">
            {/* Fashion Motif Graphic with smooth entrance */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: -6 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex flex-col items-center"
            >
              <FashionMotifGraphic motif={motif} />

              <div className="flex items-center gap-2.5 mt-1.5">
                <span className="h-[1px] w-6 bg-gradient-to-r from-transparent to-white/30" />
                <span className="text-[9.5px] font-mono tracking-[0.4em] text-white/50 uppercase font-medium">
                  ATELIER & COUTURE
                </span>
                <span className="h-[1px] w-6 bg-gradient-to-l from-transparent to-white/30" />
              </div>
            </motion.div>

            {/* Calm, Silk-Smooth Bilingual Morphing Brand Name (VANT <-> ڤانت) */}
            <div className="h-28 sm:h-36 flex items-center justify-center relative w-full overflow-hidden">
              <AnimatePresence mode="wait">
                {nameToggle === 'en' ? (
                  <motion.div
                    key="brand-en"
                    initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -16, filter: 'blur(8px)' }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col items-center"
                  >
                    <h1 className="font-extrabold text-6xl sm:text-7xl md:text-8xl tracking-[0.28em] text-white drop-shadow-[0_0_45px_rgba(255,255,255,0.22)] pl-[0.28em] uppercase">
                      VANT
                    </h1>
                    <span className="block mt-2.5 text-[10.5px] sm:text-xs tracking-[0.45em] text-white/50 uppercase font-light pl-[0.45em]">
                      EDITORIAL STREETWEAR
                    </span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="brand-ar"
                    initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -16, filter: 'blur(8px)' }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col items-center"
                    dir="rtl"
                  >
                    <h1 className="font-black text-6xl sm:text-7xl md:text-8xl tracking-wider text-white drop-shadow-[0_0_45px_rgba(255,255,255,0.22)]">
                      ڤــانـت
                    </h1>
                    <span className="block mt-2.5 text-xs sm:text-sm tracking-widest text-white/60 font-medium">
                      أزياء راقية وتصاميم حصرية
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Dynamic Status / Loading Message (Clean High-Contrast Pill) */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="rounded-2xl border border-white/15 bg-white/[0.03] backdrop-blur-xl px-6 py-3.5 max-w-md w-full space-y-1.5 shadow-2xl"
            >
              <div className="flex items-center justify-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#004ad7] animate-ping" />
                <p className="text-xs font-mono tracking-widest text-white/90 uppercase font-bold">
                  {loadingTextEn}
                </p>
              </div>
              <p dir="rtl" className="text-xs sm:text-[13px] font-medium text-white/60">
                {loadingTextAr}
              </p>
            </motion.div>
          </div>

          {/* Bottom Hairline Progress Bar & Metrics */}
          <div className="w-full pb-8 sm:pb-10 px-6 sm:px-12 z-10 space-y-2.5 max-w-2xl mx-auto">
            <div className="flex items-center justify-between text-[10.5px] font-mono tracking-wider text-white/50">
              <span className="flex items-center gap-2">
                <span className="animate-spin inline-block h-2 w-2 rounded-full border border-white/30 border-t-[#3b82f6]" />
                <span className="tracking-widest uppercase">{progress >= 100 ? 'READY' : 'LOADING'}</span>
              </span>
              <span className="tabular-nums text-white font-extrabold text-xs">{progress}%</span>
            </div>

            {/* Minimalist 2px Monochrome & Blue Hairline Track */}
            <div className="relative h-[2px] w-full overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full bg-gradient-to-r from-[#004ad7] via-[#3b82f6] to-white"
                style={{ width: `${progress}%` }}
                transition={{ ease: 'linear' }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
