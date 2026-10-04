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

export interface SizeGuideRow {
  size: Size;
  height: string;
  weight: string;
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
  weightKg: number
): SizeRecommendationResult | null {
  // Strict boundary check:
  // Height: strictly 3 digits (120 to 220)
  // Weight: strictly 2-3 digits (30 to 200)
  if (!heightCm || !weightKg || heightCm < 120 || heightCm > 220 || weightKg < 30 || weightKg > 200) {
    return null;
  }

  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);

  // 1. HONEST BESPOKE TAILORING ASSESSMENT:
  // Off-the-rack luxury collections (XS - XXL) physically cannot accommodate weights > 118 kg
  // or extreme disproportion (BMI >= 40, such as 150 cm with 150 kg where BMI is 66.7).
  if (weightKg > 118 || bmi >= 40 || heightCm > 210) {
    return {
      status: 'bespoke_needed',
      displaySize: 'تفصيل خاص',
      isBespoke: true,
      confidence: 'exact',
      title_ar: 'خارج نطاق المقاسات الجاهزة',
      title_en: 'Out of Ready-to-Wear Range',
      reason_ar: 'يتطلب تفصيلاً خاصاً (Bespoke)',
      reason_en: 'Requires Bespoke Tailoring',
      note_ar: weightKg > 118
        ? 'المقاسات الجاهزة المتوفرة (من XS إلى XXL) مخصصة حتى وزن 118 كغم، ولن توفر الراحة أو الاتساع المطلوب لهذا القياس. ڤانت ترحب بطلب تفصيل قطعة خاصة لك بمقاساتك الدقيقة عبر خدمة التفصيل الخاص.'
        : 'نظراً لاختلاف تناسق الطول والوزن عن قوالب المقاسات الجاهزة، المقاسات الجاهزة ستكون غير متناسقة في طول الأكمام والكتفين. نوصي بالتفصيل الخاص لضمان قصة مثالية ومريحة.',
      note_en: weightKg > 118
        ? 'Current ready-to-wear sizes (XS–XXL) are tailored up to 118 kg and cannot accommodate this profile comfortably. Maison VANT welcomes bespoke Made-to-Measure orders tailored to your exact measurements.'
        : 'Due to distinct proportion differences from ready-to-wear patterns, custom bespoke tailoring is recommended for optimal fit and silhouette harmony.',
    };
  }

  // 2. Below Standard Adult Baseline (30kg to 44kg):
  if (weightKg < 45) {
    return {
      status: 'petite_note',
      size: 'XS',
      displaySize: 'XS',
      isBespoke: false,
      confidence: 'close',
      title_ar: 'مقاس (XS) — قصة واسعة',
      title_en: 'Size (XS) — Relaxed fit',
      reason_ar: 'الوزن أقل من 45 كغم لقالب البالغين',
      reason_en: 'Weight is below adult 45 kg standard',
      note_ar: 'مقاس (XS) هو أصغر مقاس جاهز للبالغين، وسيكون فضفاضاً وواسعاً نسبياً لأن وزنك تحت 45 كغم. يمكنك ارتداؤه بإطلالة فضفاضة عصرية (Oversized) أو طلب تعديل خياطة مخصص.',
      note_en: 'Size (XS) is our smallest adult ready-to-wear size, and will drape loosely on builds under 45 kg. It can be styled oversized or custom-altered.',
    };
  }

  // 3. Standard Ready-to-Wear Determination (45kg to 118kg):
  // Girth (Weight) is the primary foundation so the piece closes and buttons comfortably:
  let weightBasedSize: Size = 'M';
  if (weightKg <= 56) {
    weightBasedSize = 'XS';
  } else if (weightKg <= 65) {
    weightBasedSize = 'S';
  } else if (weightKg <= 75) {
    weightBasedSize = 'M';
  } else if (weightKg <= 85) {
    weightBasedSize = 'L';
  } else if (weightKg <= 96) {
    weightBasedSize = 'XL';
  } else {
    weightBasedSize = 'XXL';
  }

  const sizeOrder: Size[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  let finalIndex = sizeOrder.indexOf(weightBasedSize);

  // 4. Tall & Lean adjustment:
  const isTallForWeight = (
    (weightBasedSize === 'XS' && heightCm > 170) ||
    (weightBasedSize === 'S' && heightCm > 178) ||
    (weightBasedSize === 'M' && heightCm > 185) ||
    (weightBasedSize === 'L' && heightCm > 192)
  );

  if (isTallForWeight && finalIndex < sizeOrder.length - 1) {
    finalIndex += 1;
  }

  const recommendedSize = sizeOrder[finalIndex];
  const matchedRule = DYNAMIC_SIZE_RULES.find((r) => r.size === recommendedSize) || DYNAMIC_SIZE_RULES[2];

  let reason_ar = 'تناسق قياسي متوازن';
  let reason_en = 'Balanced standard fit';
  let note_ar = matchedRule.note_ar;
  let note_en = matchedRule.note_en;

  if (bmi >= 28 && bmi < 40) {
    reason_ar = 'موصى به لراحة محيط الصدر والخصر';
    reason_en = 'Optimized for torso & chest comfort';
    note_ar = `مقاس (${recommendedSize}) يضمن راحة ممتازة على محيط الصدر والخصر مع انسدال فاخر.`;
    note_en = `Size (${recommendedSize}) guarantees comfortable chest & waist room without constriction.`;
  } else if (isTallForWeight) {
    reason_ar = 'موصى به لطول الأكمام والقامة';
    reason_en = 'Optimized for height & sleeve length';
    note_ar = `مقاس (${recommendedSize}) يوفر طولاً ملائماً للأكمام والقامة مع الحفاظ على قصة رشيقة.`;
    note_en = `Size (${recommendedSize}) accommodates sleeve and body length while maintaining silhouette elegance.`;
  }

  return {
    status: 'standard',
    size: recommendedSize,
    displaySize: recommendedSize,
    isBespoke: false,
    confidence: 'exact',
    title_ar: `مقاس (${recommendedSize})`,
    title_en: `Size (${recommendedSize})`,
    reason_ar,
    reason_en,
    note_ar,
    note_en,
  };
}
