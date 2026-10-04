import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SplashMotifType } from '../context/SiteControlsContext';
import type { Theme } from '../types';

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
    subtitleAr: 'سحب مساحة الحبر وطباعة شعار ڤانت مباشرة على قماش التيشيرت بالليزر',
    subtitleEn: 'Laser print squeegee pass stamping VANT emblem onto garment fabric',
  },
  {
    id: 'tshirt_print',
    titleAr: 'تيشيرت ڤانت وطباعة الشعار الأرشيفية',
    titleEn: 'VANT Streetwear T-Shirt & DTG Print',
    subtitleAr: 'قصّة تيشيرت الأوفرسايز الفاخرة مع دروز الياقة وطباعة الشعار على الصدر',
    subtitleEn: 'Luxury streetwear crewneck silhouette with chest emblem graphic print',
  },
  {
    id: 'embroidery',
    titleAr: 'تطريز الخيط الملكي وإطار الأتيليه',
    titleEn: 'Atelier Embroidery Hoop & Stitches',
    subtitleAr: 'طارة التطريز اليدوي الفاخرة وإبرة حياكة الغرز المتقاطعة الدقيقة',
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
    titleAr: 'إبرة الحياكة وخيط الحرير المنساب',
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
  theme?: Theme;
  onToggleTheme?: () => void;
  isPreview?: boolean;
  onClosePreview?: () => void;
  onFinished?: () => void;
}

/**
 * Bold, Clean Chiseled Luxury V Monogram (Haute-Couture Architectural Typography)
 * Completely removed any cutting lines, slashes, or crystals; pure, prestigious typographic clarity.
 */
function ChiseledLuxuryV({
  isDark,
  cobalt,
  mainStroke,
  delay = 0.35,
}: {
  isDark: boolean;
  cobalt: string;
  mainStroke: string;
  delay?: number;
}) {
  return (
    <motion.g
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24, delay }}
    >
      {/* Soft Ambient Print Aura behind the V (Calibrated for Dark & Light Mode) */}
      <motion.ellipse
        cx="50"
        cy="48"
        rx="16"
        ry="11"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{
          opacity: isDark ? [0.15, 0.45, 0.15] : [0.08, 0.22, 0.08],
          scale: [0.85, 1.25, 0.85],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay }}
        fill={cobalt}
        className="blur-md pointer-events-none"
      />

      {/* Left Serif (Top) */}
      <motion.line
        x1="36"
        y1="33"
        x2="45"
        y2="33"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: delay + 0.1, ease: [0.16, 1, 0.3, 1] }}
        stroke={cobalt}
        strokeWidth="2.8"
        strokeLinecap="round"
      />

      {/* Bold Architectural Left Stem */}
      <motion.line
        x1="41"
        y1="33"
        x2="50"
        y2="62"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.65, delay: delay + 0.15, ease: [0.16, 1, 0.3, 1] }}
        stroke={cobalt}
        strokeWidth="3.8"
        strokeLinecap="round"
      />

      {/* Right Serif (Top) */}
      <motion.line
        x1="55"
        y1="33"
        x2="64"
        y2="33"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: delay + 0.1, ease: [0.16, 1, 0.3, 1] }}
        stroke={mainStroke}
        strokeWidth="2.4"
        strokeLinecap="round"
      />

      {/* Refined Hairline Right Stem */}
      <motion.line
        x1="59"
        y1="33"
        x2="50"
        y2="62"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.65, delay: delay + 0.15, ease: [0.16, 1, 0.3, 1] }}
        stroke={mainStroke}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </motion.g>
  );
}

function FashionMotifGraphic({ motif, isDark }: { motif: SplashMotifType; isDark: boolean }) {
  const mainStroke = isDark ? '#ffffff' : '#090a0f';
  const subStroke = isDark ? '#94a3b8' : '#334155';
  const faintStroke = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(9,10,15,0.22)';
  const cobalt = isDark ? '#3b82f6' : '#004ad7';
  const garmentFill = isDark ? 'rgba(255,255,255,0.035)' : 'rgba(9,10,15,0.025)';

  // 1. Screen Print Squeegee & Laser Heat Press on Authentic Streetwear Tee
  if (motif === 'print_press') {
    return (
      <motion.div
        animate={{ y: [0, -3.5, 0] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
        className={`relative flex items-center justify-center h-24 w-24 xs:h-28 xs:w-28 sm:h-32 sm:w-32 md:h-36 md:w-36 ${
          isDark
            ? 'filter drop-shadow-[0_12px_28px_rgba(59,130,246,0.18)]'
            : 'filter drop-shadow-[0_12px_28px_rgba(0,74,215,0.10)]'
        }`}
      >
        <svg viewBox="0 0 100 95" className="h-full w-full fill-none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          {/* Subtle Garment Fill (Underneath, No Center Stroke) */}
          <path
            d="M50 25 C40 25 34 22 34 18 L14 27 L17 47 L28 42 L27 82 Q50 86 73 82 L72 42 L83 47 L86 27 L66 18 C60 22 40 25 50 25 Z"
            fill={garmentFill}
            stroke="none"
          />

          {/* Left Half of T-Shirt Silhouette (Outer boundary only, NO center line) */}
          <motion.path
            d="M50 25 C40 25 34 22 34 18 L14 27 L17 47 L28 42 L27 82 Q38 85 50 86"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            stroke={mainStroke}
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Right Half of T-Shirt Silhouette (Outer boundary only, NO center line) */}
          <motion.path
            d="M50 25 C60 25 66 22 66 18 L86 27 L83 47 L72 42 L73 82 Q62 85 50 86"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            stroke={mainStroke}
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Ribbed Collar Band */}
          <motion.path
            d="M34 18 C40 25 60 25 66 18"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            stroke={cobalt}
            strokeWidth="2.6"
            strokeLinecap="round"
          />

          {/* Back Collar Line */}
          <motion.path
            d="M34 18 C42 14 58 14 66 18"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.6 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            stroke={subStroke}
            strokeWidth="1.4"
            strokeLinecap="round"
          />

          {/* Sleeve Fold Lines */}
          <motion.line
            x1="16" y1="43" x2="26" y2="39"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 0.45 }}
            stroke={subStroke}
            strokeWidth="1.2"
            strokeDasharray="1.5 1.5"
          />
          <motion.line
            x1="84" y1="43" x2="74" y2="39"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 0.45 }}
            stroke={subStroke}
            strokeWidth="1.2"
            strokeDasharray="1.5 1.5"
          />

          {/* Bottom Hem Stitching */}
          <motion.path
            d="M28 80 Q50 84 72 80"
            initial={{ opacity: 0, pathLength: 0 }}
            animate={{ opacity: 0.7, pathLength: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            stroke={subStroke}
            strokeWidth="1.2"
            strokeDasharray="2 1.5"
          />

          {/* Chiseled Roman V Monogram on Chest */}
          <ChiseledLuxuryV
            isDark={isDark}
            cobalt={cobalt}
            mainStroke={mainStroke}
            delay={0.35}
          />
        </svg>

        {/* Ambient Print Curing Glow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className={`absolute bottom-2 h-3 w-20 rounded-full blur-md ${isDark ? 'bg-[#3b82f6]/30' : 'bg-[#004ad7]/20'} animate-pulse`}
        />
      </motion.div>
    );
  }

  // 2. VANT Streetwear Crewneck T-Shirt & DTG Print (Iconic, Simple, Clear)
  if (motif === 'tshirt_print') {
    return (
      <motion.div
        animate={{ y: [0, -3.5, 0] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
        className={`relative flex items-center justify-center h-24 w-24 xs:h-28 xs:w-28 sm:h-32 sm:w-32 md:h-36 md:w-36 ${
          isDark
            ? 'filter drop-shadow-[0_12px_28px_rgba(59,130,246,0.18)]'
            : 'filter drop-shadow-[0_12px_28px_rgba(0,74,215,0.10)]'
        }`}
      >
        <svg viewBox="0 0 100 95" className="h-full w-full fill-none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          {/* Subtle Garment Fill (Underneath, No Center Stroke) */}
          <path
            d="M50 25 C40 25 34 22 34 18 L14 27 L17 47 L28 42 L27 82 Q50 86 73 82 L72 42 L83 47 L86 27 L66 18 C60 22 40 25 50 25 Z"
            fill={garmentFill}
            stroke="none"
          />

          {/* Left Half of T-Shirt Silhouette (Outer boundary only, NO center line) */}
          <motion.path
            d="M50 25 C40 25 34 22 34 18 L14 27 L17 47 L28 42 L27 82 Q38 85 50 86"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            stroke={mainStroke}
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Right Half of T-Shirt Silhouette (Outer boundary only, NO center line) */}
          <motion.path
            d="M50 25 C60 25 66 22 66 18 L86 27 L83 47 L72 42 L73 82 Q62 85 50 86"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            stroke={mainStroke}
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Ribbed Crewneck Collar */}
          <motion.path
            d="M34 18 C40 25 60 25 66 18"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            stroke={cobalt}
            strokeWidth="2.6"
            strokeLinecap="round"
          />

          {/* Back Collar Line */}
          <motion.path
            d="M34 18 C42 14 58 14 66 18"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.6 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            stroke={subStroke}
            strokeWidth="1.4"
            strokeLinecap="round"
          />

          {/* Clean Sleeve Stitch Accents */}
          <motion.line
            x1="16" y1="43" x2="26" y2="39"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 0.45 }}
            stroke={subStroke}
            strokeWidth="1.2"
            strokeDasharray="1.5 1.5"
          />
          <motion.line
            x1="84" y1="43" x2="74" y2="39"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 0.45 }}
            stroke={subStroke}
            strokeWidth="1.2"
            strokeDasharray="1.5 1.5"
          />

          {/* Bottom Hem Double Stitch Line */}
          <motion.path
            d="M28 80 Q50 84 72 80"
            initial={{ opacity: 0, pathLength: 0 }}
            animate={{ opacity: 0.7, pathLength: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            stroke={subStroke}
            strokeWidth="1.2"
            strokeDasharray="2 1.5"
          />

          {/* Screen Print Registration Corner Markers */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.65 }}
            transition={{ delay: 0.5 }}
            stroke={faintStroke}
            strokeWidth="1.2"
          >
            <path d="M35 34 H38 M35 34 V37" />
            <path d="M65 34 H62 M65 34 V37" />
            <path d="M35 64 H38 M35 64 V61" />
            <path d="M65 64 H62 M65 64 V61" />
          </motion.g>

          {/* Chiseled Roman V Monogram on Chest */}
          <ChiseledLuxuryV
            isDark={isDark}
            cobalt={cobalt}
            mainStroke={mainStroke}
            delay={0.35}
          />
        </svg>

        {/* Dynamic Fabric Print Sheen Sweep */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-16 rounded-full blur-xl pointer-events-none ${isDark ? 'bg-[#3b82f6]/15' : 'bg-[#004ad7]/10'} animate-pulse`}
        />
      </motion.div>
    );
  }

  // 3. Royal Atelier Embroidery Hoop & Stitches
  if (motif === 'embroidery') {
    return (
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        className="relative flex items-center justify-center h-24 w-24 xs:h-28 xs:w-28 sm:h-32 sm:w-32 md:h-36 md:w-36"
      >
        <svg viewBox="0 0 100 95" className="h-full w-full fill-none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          {/* Outer Bamboo Embroidery Hoop */}
          <motion.circle
            cx="50"
            cy="50"
            r="32"
            initial={{ pathLength: 0, rotate: -90 }}
            animate={{ pathLength: 1, rotate: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            stroke={mainStroke}
            strokeWidth="2.6"
          />
          {/* Hoop Metal Screw Tightener */}
          <motion.rect
            x="44"
            y="12"
            width="12"
            height="6"
            rx="1.5"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            fill={cobalt}
            stroke={cobalt}
          />
          <line x1="42" y1="15" x2="58" y2="15" stroke={mainStroke} strokeWidth="1.6" />

          {/* Chiseled Monogram V Embroidered inside Fabric */}
          <ChiseledLuxuryV
            isDark={isDark}
            cobalt={cobalt}
            mainStroke={mainStroke}
            delay={0.25}
          />

          {/* Fine Embroidery Cross Stitches Around Hoop Fabric */}
          <motion.path
            d="M32 46 L36 50 M36 46 L32 50 M64 46 L68 50 M68 46 L64 50 M48 30 L52 34 M52 30 L48 34 M48 70 L52 74 M52 70 L48 74"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.75 }}
            transition={{ delay: 0.55 }}
            stroke={subStroke}
            strokeWidth="1.4"
          />
        </svg>
      </motion.div>
    );
  }

  // 4. Architectural Coat Hanger & Silk Drape
  if (motif === 'hanger') {
    return (
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        className="relative flex items-center justify-center h-24 w-24 xs:h-28 xs:w-28 sm:h-32 sm:w-32 md:h-36 md:w-36"
      >
        <svg viewBox="0 0 100 95" className="h-full w-full fill-none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          {/* Chrome Swivel Hook */}
          <motion.path
            d="M50 24 C50 15 58 11 64 16 C69 22 62 30 50 33 L50 38"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            stroke={cobalt}
            strokeWidth="2.8"
          />
          {/* Sculpted Wood Coat Hanger Shoulders */}
          <motion.path
            d="M50 38 L14 60 C9 63 13 67 20 67 L80 67 C87 67 91 63 86 60 Z"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
            stroke={mainStroke}
            strokeWidth="2.6"
          />
          {/* Flowing Silk Drape Line */}
          <motion.path
            d="M26 67 Q50 76 74 67"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.8 }}
            transition={{ duration: 0.7, delay: 0.35, ease: 'easeInOut' }}
            stroke={cobalt}
            strokeWidth="2.2"
          />
        </svg>
        {/* Center Faceted Diamond Stud */}
        <div className={`absolute top-[40px] left-1/2 -translate-x-1/2 h-2.5 w-2.5 rotate-45 ${isDark ? 'bg-[#3b82f6] shadow-[0_0_12px_#3b82f6]' : 'bg-[#004ad7] shadow-[0_0_10px_#004ad7]'}`} />
      </motion.div>
    );
  }

  // 5. Sartorial Tailor Needle & Silk Thread
  if (motif === 'needle_thread') {
    return (
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        className="relative flex items-center justify-center h-24 w-24 xs:h-28 xs:w-28 sm:h-32 sm:w-32 md:h-36 md:w-36"
      >
        <svg viewBox="0 0 100 95" className="h-full w-full fill-none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          {/* Polished Sewing Needle */}
          <motion.path
            d="M26 72 L78 26"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            stroke={mainStroke}
            strokeWidth="3"
          />
          {/* Needle Eyelet */}
          <motion.ellipse
            cx="76"
            cy="28"
            rx="3.4"
            ry="1.6"
            transform="rotate(-40 76 28)"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            stroke={cobalt}
            fill={cobalt}
          />
          {/* Undulating Cobalt Silk Thread Wave */}
          <motion.path
            d="M76 28 Q96 18 88 40 T54 48 T20 62 T10 52"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: 'easeInOut' }}
            stroke={cobalt}
            strokeWidth="2.6"
          />
          {/* Stitch Seam Guidelines */}
          <motion.path
            d="M32 50 L38 56 M38 50 L32 56 M58 64 L64 70 M64 64 L58 70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.55 }}
            transition={{ delay: 0.5 }}
            stroke={subStroke}
            strokeWidth="1.4"
          />
        </svg>
      </motion.div>
    );
  }

  // 6. Couture Mannequin & Ribbon Measuring Tape
  if (motif === 'mannequin') {
    return (
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        className="relative flex items-center justify-center h-24 w-24 xs:h-28 xs:w-28 sm:h-32 sm:w-32 md:h-36 md:w-36"
      >
        <svg viewBox="0 0 100 95" className="h-full w-full fill-none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          {/* Neck Finial */}
          <motion.circle
            cx="50"
            cy="18"
            r="3.5"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4 }}
            stroke={cobalt}
            fill={cobalt}
          />
          <motion.line x1="50" y1="21.5" x2="50" y2="28" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} stroke={mainStroke} />
          {/* Tailor Torso Form */}
          <motion.path
            d="M34 29 C36 40 40 44 38 60 L62 60 C60 44 64 40 66 29 Z"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
            stroke={mainStroke}
          />
          {/* Measuring Tape with Tick Marks winding around torso */}
          <motion.path
            d="M36 35 Q50 47 64 35 M40 49 Q50 56 60 49"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.7, delay: 0.35, ease: 'easeInOut' }}
            stroke={cobalt}
            strokeDasharray="2.5 2"
          />
          {/* Stand Base */}
          <motion.line x1="50" y1="60" x2="50" y2="78" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} stroke={mainStroke} transition={{ delay: 0.3 }} />
          <motion.line x1="38" y1="78" x2="62" y2="78" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} stroke={subStroke} transition={{ delay: 0.4 }} strokeWidth="2.5" />
        </svg>
      </motion.div>
    );
  }

  // 7. Tailoring Shears & Silk Fabric
  if (motif === 'scissors') {
    return (
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        className="relative flex items-center justify-center h-24 w-24 xs:h-28 xs:w-28 sm:h-32 sm:w-32 md:h-36 md:w-36"
      >
        <svg viewBox="0 0 100 95" className="h-full w-full fill-none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          {/* Left Blade & Loop */}
          <motion.path
            d="M26 62 C18 62 18 52 26 52 C32 52 38 57 52 45 L86 28"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            stroke={mainStroke}
          />
          {/* Right Blade & Loop */}
          <motion.path
            d="M26 32 C18 32 18 42 26 42 C32 42 38 37 52 49 L86 66"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
            stroke={mainStroke}
          />
          {/* Pivot Screw */}
          <motion.circle cx="52" cy="47" r="3" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }} fill={cobalt} stroke={cobalt} />
          {/* Fabric Drape Guidelines */}
          <motion.path
            d="M62 47 Q78 42 94 47"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.75 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            stroke={cobalt}
            strokeDasharray="2.5 2"
          />
        </svg>
      </motion.div>
    );
  }

  // 8. Geometric Monogram Emblem
  return (
    <motion.div
      animate={{ y: [0, -3, 0] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      className="relative flex items-center justify-center h-24 w-24 xs:h-28 xs:w-28 sm:h-32 sm:w-32 md:h-36 md:w-36"
    >
      <svg viewBox="0 0 100 95" className="h-full w-full fill-none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        {/* Outer Diamond Shield */}
        <motion.polygon
          points="50,15 88,47 50,79 12,47"
          initial={{ pathLength: 0, rotate: -10 }}
          animate={{ pathLength: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          stroke={mainStroke}
          strokeWidth="2.6"
        />
        {/* Chiseled Monogram V inside Emblem */}
        <ChiseledLuxuryV
          isDark={isDark}
          cobalt={cobalt}
          mainStroke={mainStroke}
          delay={0.25}
        />
        {/* Orbital Compass Arc */}
        <motion.path
          d="M8 47 A42 22 0 0 1 92 47"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.65 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          stroke={cobalt}
          strokeDasharray="3 3"
        />
      </svg>
    </motion.div>
  );
}

export default function SplashLoader({
  isLoading,
  loadingTextEn = 'INITIALIZING ARCHIVE',
  loadingTextAr = 'جاري تجهيز الكتالوج والقطع الحصرية',
  motif = 'hanger',
  theme = 'dark',
  onToggleTheme,
  isPreview = false,
  onClosePreview,
  onFinished,
}: Props) {
  const [progress, setProgress] = useState(0);
  const [shouldRender, setShouldRender] = useState(true);
  const [replayKey, setReplayKey] = useState(0);
  const [nameToggle, setNameToggle] = useState<'en' | 'ar'>('en');

  const isDark = theme === 'dark';

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
    const duration = isPreview ? 2200 : 1900; // Relaxed & smooth cinematic load for initial visit

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
    if (!isPreview && progress >= 100) {
      const exitDelay = isLoading ? 350 : 200;
      const timeout = setTimeout(() => {
        setShouldRender(false);
      }, exitDelay);
      return () => clearTimeout(timeout);
    }
  }, [isPreview, isLoading, progress]);

  const handleExitComplete = () => {
    onFinished?.();
    if (isPreview) {
      onClosePreview?.();
    }
  };

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {shouldRender && (
        <motion.div
          key={`vant-splash-screen-${replayKey}`}
          initial={{ opacity: 1, y: 0 }}
          exit={{
            y: '-100%',
            opacity: 0.98,
            transition: {
              duration: 0.52,
              ease: [0.76, 0, 0.24, 1], // Couture velvet curtain lift (faster & silky)
            },
          }}
          className={`fixed inset-0 h-[100dvh] min-h-[100dvh] w-full z-[9999] flex flex-col items-center justify-between select-none overflow-hidden transition-colors duration-500 font-sans border-b ${
            isDark
              ? 'bg-[#07090e] text-white border-white/10 shadow-[0_30px_70px_rgba(0,0,0,0.8)]'
              : 'bg-gradient-to-b from-[#ffffff] via-[#f7f9fd] to-[#edf2f9] text-[#06080e] border-black/10 shadow-[0_20px_50px_rgba(0,74,215,0.15)]'
          }`}
        >
          {/* Ambient Luxury Spotlight (Responsive to Dark / Blue Mode vs White Mode) */}
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[320px] w-[320px] sm:h-[560px] sm:w-[560px] rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
              isDark
                ? 'bg-[radial-gradient(ellipse_at_center,rgba(0,74,215,0.24),transparent_70%)]'
                : 'bg-[radial-gradient(ellipse_at_center,rgba(0,74,215,0.14)_0%,rgba(99,102,241,0.06)_42%,transparent_70%)]'
            }`}
          />

          {/* Top Bar with Brand Badge & Controls */}
          <motion.div
            exit={{ opacity: 0, y: -20, transition: { duration: 0.25, ease: 'easeIn' } }}
            className="w-full pt-4 sm:pt-10 px-4 sm:px-12 flex flex-wrap items-center justify-between gap-2 sm:gap-3 z-10 text-[9.5px] sm:text-[10.5px] font-mono tracking-wider sm:tracking-widest uppercase"
          >
            <div className="flex items-center gap-2 sm:gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#004ad7] animate-pulse" />
              <span className={`font-bold tracking-[0.2em] sm:tracking-[0.25em] ${isDark ? 'text-white/80' : 'text-[#06080e]'}`}>
                VANT
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isPreview ? (
                <>
                  <span
                    className={`rounded-full px-2.5 sm:px-3 py-1 font-bold text-[9.5px] sm:text-[10px] tracking-wider uppercase border ${
                      isDark
                        ? 'bg-white/10 text-white/90 border-white/20'
                        : 'bg-white/80 text-[#06080e] border-black/15 shadow-sm'
                    }`}
                  >
                    {progress >= 100 ? 'PREVIEW READY' : 'PREVIEWING'}
                  </span>

                  <button
                    type="button"
                    onClick={() => setReplayKey((k) => k + 1)}
                    className={`rounded-full px-2.5 sm:px-3 py-1 font-bold text-[9.5px] sm:text-[10.5px] cursor-pointer transition-all active:scale-95 border ${
                      isDark
                        ? 'bg-white/10 hover:bg-white/20 text-white border-white/15'
                        : 'bg-white/90 hover:bg-white text-[#06080e] border-black/15 shadow-sm'
                    }`}
                  >
                    إعادة التشغيل ↻
                  </button>

                  <button
                    type="button"
                    onClick={() => setShouldRender(false)}
                    className={`rounded-full px-3 sm:px-3.5 py-1 font-extrabold text-[10px] sm:text-[11px] cursor-pointer transition-all active:scale-95 shadow-md ${
                      isDark ? 'bg-white hover:bg-white/90 text-black' : 'bg-[#06080e] hover:bg-black text-white'
                    }`}
                  >
                    ✕ إغلاق
                  </button>
                </>
              ) : (
                <span className={`tracking-[0.2em] sm:tracking-[0.3em] font-light text-[9.5px] sm:text-[10.5px] ${isDark ? 'text-white/40' : 'text-[#06080e]/60'}`}>
                  COLLECTION 2026
                </span>
              )}
            </div>
          </motion.div>

          {/* Centerpiece: Precision Fashion Graphic + Bilingual Kinetic VANT */}
          <motion.div
            exit={{
              scale: 1.04,
              y: -25,
              opacity: 0,
              filter: 'blur(10px)',
              transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
            }}
            className="flex flex-col items-center justify-center text-center px-4 sm:px-6 z-10 my-auto w-full max-w-xl space-y-3.5 sm:space-y-6"
          >
            {/* Fashion Graphic Container with Balanced Proportions */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex flex-col items-center"
            >
              <FashionMotifGraphic motif={motif} isDark={isDark} />
            </motion.div>

            {/* Calm, Silk-Smooth Bilingual Morphing Brand Name (VANT <-> ڤانت) */}
            <div className="h-20 sm:h-36 flex items-center justify-center relative w-full overflow-hidden">
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
                    <h1
                      className={`font-black text-4xl xs:text-5xl sm:text-7xl md:text-8xl tracking-[0.22em] sm:tracking-[0.28em] pl-[0.22em] sm:pl-[0.28em] uppercase ${
                        isDark
                          ? 'text-white drop-shadow-[0_0_40px_rgba(59,130,246,0.35)]'
                          : 'text-[#06080e] drop-shadow-[0_8px_32px_rgba(0,74,215,0.18)]'
                      }`}
                    >
                      VANT
                    </h1>
                    <span
                      className={`block mt-1.5 sm:mt-2.5 text-[9px] xs:text-[10px] sm:text-xs tracking-[0.3em] sm:tracking-[0.45em] uppercase font-semibold pl-[0.3em] sm:pl-[0.45em] ${
                        isDark ? 'text-white/50' : 'text-[#06080e]/75'
                      }`}
                    >
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
                    <h1
                      className={`font-black text-4xl xs:text-5xl sm:text-7xl md:text-8xl tracking-wide sm:tracking-wider ${
                        isDark
                          ? 'text-white drop-shadow-[0_0_40px_rgba(59,130,246,0.35)]'
                          : 'text-[#06080e] drop-shadow-[0_8px_32px_rgba(0,74,215,0.18)]'
                      }`}
                    >
                      ڤــانـت
                    </h1>
                    <span
                      className={`block mt-1.5 sm:mt-2.5 text-[11px] sm:text-sm tracking-wide sm:tracking-widest font-semibold ${
                        isDark ? 'text-white/60' : 'text-[#06080e]/80'
                      }`}
                    >
                      أزياء راقية وتصاميم حصرية
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Dynamic Status / Loading Message (High-Contrast Glass Pill) */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className={`rounded-xl sm:rounded-2xl border px-4 py-2.5 sm:px-6 sm:py-3.5 max-w-xs sm:max-w-md w-full space-y-1 sm:space-y-1.5 backdrop-blur-2xl transition-all ${
                isDark
                  ? 'border-white/10 bg-white/[0.03] shadow-2xl text-white'
                  : 'border-black/[0.08] bg-white/80 shadow-[0_12px_40px_rgba(0,74,215,0.10),0_2px_8px_rgba(0,0,0,0.04)] text-[#06080e]'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    progress >= 100
                      ? 'bg-emerald-400 shadow-[0_0_12px_#34d399]'
                      : 'bg-[#004ad7] animate-ping'
                  }`}
                />
                <p
                  className={`text-[10.5px] sm:text-xs font-mono tracking-wider sm:tracking-widest uppercase font-bold ${
                    isDark ? 'text-white/90' : 'text-[#06080e]'
                  }`}
                >
                  {progress >= 100 ? 'READY FOR ARCHIVE' : loadingTextEn}
                </p>
              </div>
              <p
                dir="rtl"
                className={`text-[11px] sm:text-[13px] font-semibold ${
                  isDark ? 'text-white/60' : 'text-[#06080e]/80'
                }`}
              >
                {progress >= 100 ? 'اكتمل التجهيز · جاري عرض التشكيلة' : loadingTextAr}
              </p>
            </motion.div>
          </motion.div>

          {/* Bottom Hairline Progress Bar & Metrics */}
          <motion.div
            exit={{ opacity: 0, y: 20, transition: { duration: 0.25, ease: 'easeIn' } }}
            className="w-full pb-5 sm:pb-10 px-5 sm:px-12 z-10 space-y-2 sm:space-y-2.5 max-w-2xl mx-auto"
          >
            <div
              className={`flex items-center justify-between text-[9.5px] sm:text-[10.5px] font-mono tracking-wider ${
                isDark ? 'text-white/50' : 'text-[#06080e]/75'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="animate-spin inline-block h-2 w-2 rounded-full border border-current border-t-[#004ad7]" />
                <span className="tracking-widest uppercase font-semibold">{progress >= 100 ? 'READY' : 'LOADING'}</span>
              </span>
              <span className={`tabular-nums font-black text-xs ${isDark ? 'text-white' : 'text-[#004ad7]'}`}>{progress}%</span>
            </div>

            {/* Minimalist 2px Monochrome & Blue Hairline Track */}
            <div
              className={`relative h-[2px] w-full overflow-hidden rounded-full ${
                isDark ? 'bg-white/10' : 'bg-black/[0.08]'
              }`}
            >
              <motion.div
                className={`h-full bg-gradient-to-r ${
                  isDark
                    ? 'from-[#004ad7] via-[#3b82f6] to-white'
                    : 'from-[#004ad7] via-[#2563eb] to-[#06080e]'
                }`}
                style={{ width: `${progress}%` }}
                transition={{ ease: 'linear' }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
