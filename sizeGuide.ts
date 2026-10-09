import type { Size } from '../types';

/**
 * Dynamic Sizing Configuration & Rules for Maison VANT
 * Engineered strictly per professional fashion tailoring:
 * - Ready-to-wear sizes: XS, S, M, L, XL, XXL.
 * - Body girth (circumference of chest & waist) is determined by Weight.
 * - Minimum adult height: 120 cm, Maximum: 220 cm (strictly 3 digits).
 * - Minimum adult weight: 30 kg, Maximum: 200 kg (min 2 digits, max 3 digits).
 * - Honest bespoke handling: Weights > 118 kg or BMI >= 40 cannot wear ready-to-wear XS-XXL
 *   and are respectfully routed to Bespoke Made-to-Measure tailoring.
 */

export interface MasterSizeItem {
  id: string;
  size: string;
  height: string;
  weight: string;
  chest?: string;
  waist?: string;
  shoulder?: string;
  length?: string;
  note_ar?: string;
  note_en?: string;
  minHeight: number;
  maxHeight: number;
  minWeight: number;
  maxWeight: number;
  enabled: boolean;
  order?: number;
}

export const DEFAULT_MASTER_SIZES: MasterSizeItem[] = [
  {
    id: 'size_xs',
    size: 'XS',
    height: '150 - 164 سم',
    weight: '45 - 56 كغم',
    chest: '88 - 92 سم',
    waist: '70 - 74 سم',
    shoulder: '42 سم',
    length: '68 سم',
    note_ar: 'قصة انسيابية مريحة ومضبوطة للقامة الناعمة',
    note_en: 'Refined tailored silhouette for petite frames',
    minHeight: 150,
    maxHeight: 164,
    minWeight: 45,
    maxWeight: 56,
    enabled: true,
    order: 1,
  },
  {
    id: 'size_s',
    size: 'S',
    height: '165 - 172 سم',
    weight: '57 - 65 كغم',
    chest: '93 - 97 سم',
    waist: '75 - 79 سم',
    shoulder: '44 سم',
    length: '70 سم',
    note_ar: 'قصة عصرية متناسقة ومريحة على الأكتاف',
    note_en: 'Contemporary regular cut with balanced shoulders',
    minHeight: 165,
    maxHeight: 172,
    minWeight: 57,
    maxWeight: 65,
    enabled: true,
    order: 2,
  },
  {
    id: 'size_m',
    size: 'M',
    height: '173 - 178 سم',
    weight: '66 - 75 كغم',
    chest: '98 - 103 سم',
    waist: '80 - 85 سم',
    shoulder: '46 سم',
    length: '72 سم',
    note_ar: 'المقاس الأكثر توازناً، يمنحك مظهراً راقياً ومريحاً',
    note_en: 'Most balanced fit, delivering effortless luxury styling',
    minHeight: 173,
    maxHeight: 178,
    minWeight: 66,
    maxWeight: 75,
    enabled: true,
    order: 3,
  },
  {
    id: 'size_l',
    size: 'L',
    height: '179 - 184 سم',
    weight: '76 - 85 كغم',
    chest: '104 - 109 سم',
    waist: '86 - 91 سم',
    shoulder: '48 سم',
    length: '74 سم',
    note_ar: 'قصة فاخرة واسعة بلمسة عصرية راقية',
    note_en: 'Relaxed modern drape with premium ease of motion',
    minHeight: 179,
    maxHeight: 184,
    minWeight: 76,
    maxWeight: 85,
    enabled: true,
    order: 4,
  },
  {
    id: 'size_xl',
    size: 'XL',
    height: '185 - 190 سم',
    weight: '86 - 95 كغم',
    chest: '110 - 116 سم',
    waist: '92 - 98 سم',
    shoulder: '50 سم',
    length: '76 سم',
    note_ar: 'قصة واسعة مريحة تمنحك إطلالة فخمة وحرية حركة',
    note_en: 'Generous silhouette offering commanding presence',
    minHeight: 185,
    maxHeight: 190,
    minWeight: 86,
    maxWeight: 95,
    enabled: true,
    order: 5,
  },
  {
    id: 'size_xxl',
    size: 'XXL',
    height: '191 - 205 سم',
    weight: '96 - 118 كغم',
    chest: '117 - 126 سم',
    waist: '99 - 108 سم',
    shoulder: '52 سم',
    length: '78 سم',
    note_ar: 'قصة رحبة جداً للأطوال والأوزان العالية',
    note_en: 'Extra spacious cut engineered for taller & heavier builds',
    minHeight: 191,
    maxHeight: 205,
    minWeight: 96,
    maxWeight: 118,
    enabled: true,
    order: 6,
  },
];

export interface SizeGuideRow {
  size: Size | string;
  height: string;
  weight: string;
  chest?: string;
  waist?: string;
  shoulder?: string;
  length?: string;
}

export interface SizeFitRule {
  size: Size;
  minHeight: number; // in cm
  maxHeight: number; // in cm
  minWeight: number; // in kg
  maxWeight: number; // in kg
  idealHeight: number;
  idealWeight: number;
  note_ar: string;
  note_en: string;
}

/**
 * Visual reference table data for the ready-to-wear fit guide
 */
export const SIZE_GUIDE_DATA: SizeGuideRow[] = [
  { size: 'XS', height: '150 - 164', weight: '45 - 56' },
  { size: 'S',  height: '165 - 172', weight: '57 - 65' },
  { size: 'M',  height: '173 - 178', weight: '66 - 75' },
  { size: 'L',  height: '179 - 184', weight: '76 - 85' },
  { size: 'XL', height: '185 - 190', weight: '86 - 95' },
  { size: 'XXL', height: '191 - 205', weight: '96 - 118' },
];

/**
 * Dynamic calculation rules for automatic ready-to-wear size recommendations.
 */
export const DYNAMIC_SIZE_RULES: SizeFitRule[] = [
  {
    size: 'XS',
    minHeight: 150,
    maxHeight: 164,
    minWeight: 45,
    maxWeight: 56,
    idealHeight: 158,
    idealWeight: 52,
    note_ar: 'قصة انسيابية مريحة ومضبوطة للقامة الناعمة',
    note_en: 'Refined tailored silhouette for petite frames',
  },
  {
    size: 'S',
    minHeight: 165,
    maxHeight: 172,
    minWeight: 57,
    maxWeight: 65,
    idealHeight: 168,
    idealWeight: 61,
    note_ar: 'قصة عصرية متناسقة ومريحة على الأكتاف',
    note_en: 'Contemporary regular cut with balanced shoulders',
  },
  {
    size: 'M',
    minHeight: 173,
    maxHeight: 178,
    minWeight: 66,
    maxWeight: 75,
    idealHeight: 175,
    idealWeight: 70,
    note_ar: 'المقاس الأكثر توازناً، يمنحك مظهراً راقياً ومريحاً',
    note_en: 'Most balanced fit, delivering effortless luxury styling',
  },
  {
    size: 'L',
    minHeight: 179,
    maxHeight: 184,
    minWeight: 76,
    maxWeight: 85,
    idealHeight: 181,
    idealWeight: 80,
    note_ar: 'قصة فاخرة واسعة بلمسة عصرية راقية',
    note_en: 'Relaxed modern drape with premium ease of motion',
  },
  {
    size: 'XL',
    minHeight: 185,
    maxHeight: 190,
    minWeight: 86,
    maxWeight: 95,
    idealHeight: 187,
    idealWeight: 90,
    note_ar: 'قصة واسعة مريحة تمنحك إطلالة فخمة وحرية حركة',
    note_en: 'Generous silhouette offering commanding presence',
  },
  {
    size: 'XXL',
    minHeight: 191,
    maxHeight: 205,
    minWeight: 96,
    maxWeight: 118,
    idealHeight: 193,
    idealWeight: 102,
    note_ar: 'قصة رحبة جداً للأطوال والأوزان العالية',
    note_en: 'Extra spacious cut engineered for taller & heavier builds',
  },
];

export type RecommendationStatus = 'standard' | 'petite_note' | 'tall_note' | 'bespoke_needed';

export interface SizeRecommendationResult {
  status: RecommendationStatus;
  size?: Size;
  displaySize: string;
  isBespoke: boolean;
  title_ar: string;
  title_en: string;
  note_ar: string;
  note_en: string;
  reason_ar?: string;
  reason_en?: string;
  confidence: 'exact' | 'close';
}

/**
 * Robust, highly transparent apparel sizing engine:
 * 1. Strict boundaries: Height 120-220 cm (3 digits), Weight 30-200 kg (2-3 digits).
 * 2. Uncompromising honesty: Disproportionate builds or weights > 118kg (e.g. 150cm / 150kg)
 *    are never given inappropriate off-the-rack sizes. They are truthfully offered bespoke tailoring.
 * 3. Weights 45-118 kg mapped accurately with girth precedence over height.
 */
export function calculateRecommendedSize(
  heightCm: number,
  weightKg: number,
  customMasterSizes?: MasterSizeItem[]
): SizeRecommendationResult | null {
  // Strict boundary check:
  // Height: strictly 3 digits (120 to 220)
  // Weight: strictly 2-3 digits (30 to 200)
  if (!heightCm || !weightKg || heightCm < 120 || heightCm > 220 || weightKg < 30 || weightKg > 200) {
    return null;
  }

  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);

  const activeSizes = (customMasterSizes && customMasterSizes.length > 0)
    ? customMasterSizes.filter((s) => s.enabled)
    : DEFAULT_MASTER_SIZES;

  const maxSupportedWeight = activeSizes.length > 0
    ? Math.max(...activeSizes.map((s) => s.maxWeight))
    : 118;

  // 1. HONEST BESPOKE TAILORING ASSESSMENT:
  // Off-the-rack luxury collections physically cannot accommodate weights exceeding max supported
  // or extreme disproportion (BMI >= 40, such as 150 cm with 150 kg where BMI is 66.7).
  if (weightKg > maxSupportedWeight || bmi >= 40 || heightCm > 215) {
    return {
      status: 'bespoke_needed',
      displaySize: 'تفصيل خاص',
      isBespoke: true,
      confidence: 'exact',
      title_ar: 'خارج نطاق المقاسات الجاهزة',
      title_en: 'Out of Ready-to-Wear Range',
      reason_ar: 'يتطلب تفصيلاً خاصاً (Bespoke)',
      reason_en: 'Requires Bespoke Tailoring',
      note_ar: weightKg > maxSupportedWeight
        ? `المقاسات الجاهزة المتوفرة مخصصة حتى وزن ${maxSupportedWeight} كغم، ولن توفر الراحة أو الاتساع المطلوب لهذا القياس. ڤانت ترحب بطلب تفصيل قطعة خاصة لك بمقاساتك الدقيقة عبر خدمة التفصيل الخاص.`
        : 'نظراً لاختلاف تناسق الطول والوزن عن قوالب المقاسات الجاهزة، المقاسات الجاهزة ستكون غير متناسقة في طول الأكمام والكتفين. نوصي بالتفصيل الخاص لضمان قصة مثالية ومريحة.',
      note_en: weightKg > maxSupportedWeight
        ? `Current ready-to-wear sizes are tailored up to ${maxSupportedWeight} kg and cannot accommodate this profile comfortably. Maison VANT welcomes bespoke Made-to-Measure orders tailored to your exact measurements.`
        : 'Due to distinct proportion differences from ready-to-wear patterns, custom bespoke tailoring is recommended for optimal fit and silhouette harmony.',
    };
  }

  // 2. Below Standard Adult Baseline:
  const minSupportedWeight = activeSizes.length > 0
    ? Math.min(...activeSizes.map((s) => s.minWeight))
    : 45;

  if (weightKg < minSupportedWeight) {
    const smallestSize = activeSizes[0]?.size || 'XS';
    return {
      status: 'petite_note',
      size: smallestSize as Size,
      displaySize: smallestSize,
      isBespoke: false,
      confidence: 'close',
      title_ar: `مقاس (${smallestSize}) — قصة واسعة`,
      title_en: `Size (${smallestSize}) — Relaxed fit`,
      reason_ar: `الوزن أقل من ${minSupportedWeight} كغم لقالب البالغين`,
      reason_en: `Weight is below adult ${minSupportedWeight} kg standard`,
      note_ar: `مقاس (${smallestSize}) هو أصغر مقاس جاهز للبالغين، وسيكون فضفاضاً وواسعاً نسبياً لأن وزنك تحت ${minSupportedWeight} كغم. يمكنك ارتداؤه بإطلالة فضفاضة عصرية (Oversized) أو طلب تعديل خياطة مخصص.`,
      note_en: `Size (${smallestSize}) is our smallest adult ready-to-wear size, and will drape loosely on builds under ${minSupportedWeight} kg. It can be styled oversized or custom-altered.`,
    };
  }

  // 3. Dynamic search across active master sizes:
  // First priority: matching both weight and height
  let matched = activeSizes.find((s) => weightKg >= s.minWeight && weightKg <= s.maxWeight);

  // If no direct weight match, find the closest active size by weight distance
  if (!matched && activeSizes.length > 0) {
    let closestDist = Infinity;
    for (const s of activeSizes) {
      const mid = (s.minWeight + s.maxWeight) / 2;
      const dist = Math.abs(weightKg - mid);
      if (dist < closestDist) {
        closestDist = dist;
        matched = s;
      }
    }
  }

  const selectedMaster = matched || activeSizes[Math.min(2, activeSizes.length - 1)];
  const sizeIndex = activeSizes.findIndex((s) => s.id === selectedMaster.id);

  // 4. Tall & Lean adjustment:
  const isTall = heightCm > selectedMaster.maxHeight + 5 && sizeIndex < activeSizes.length - 1;
  const finalMaster = isTall ? activeSizes[sizeIndex + 1] : selectedMaster;

  const displaySize = finalMaster.size;
  const reason_ar = isTall
    ? 'موصى به لطول الأكمام والقامة'
    : bmi >= 28 && bmi < 40
    ? 'موصى به لراحة محيط الصدر والخصر'
    : 'تناسق قياسي متوازن ومريح';
  const reason_en = isTall
    ? 'Optimized for height & sleeve length'
    : bmi >= 28 && bmi < 40
    ? 'Optimized for torso & chest comfort'
    : 'Balanced standard luxury fit';

  const note_ar = finalMaster.note_ar || `مقاس (${displaySize}) مناسب للطول والوزن المدخلين مع انسدال عصري مريح.`;
  const note_en = finalMaster.note_en || `Size (${displaySize}) matches your measurements for an effortless silhouette.`;

  return {
    status: 'standard',
    size: displaySize as Size,
    displaySize,
    isBespoke: false,
    confidence: 'exact',
    title_ar: `مقاس (${displaySize})`,
    title_en: `Size (${displaySize})`,
    reason_ar,
    reason_en,
    note_ar,
    note_en,
  };
}
