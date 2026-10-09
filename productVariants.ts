/**
 * Maison VANT - Advanced Product Variant, SKU & Color Intelligence Engine
 * Provides algorithmic color clustering, model/variant SKU derivation,
 * and high-precision comparative analysis against baseline reference colors (Black).
 */

import { COMMERCIAL_RETAIL_PALETTE, type RGB } from '../admin/utils/colorExtraction';
import type { Product, ProductAvailability } from '../types';

export interface ColorVariant {
  id: string;
  colorKey: string;
  colorNameAr: string;
  colorNameEn: string;
  hex: string;
  sku: string;
  images: string[];
  thumbnail: string;
  price: number;
  originalPrice?: number;
  sizes: string[];
  availability: ProductAvailability;
  isBaseline: boolean; // True if this is the benchmark (usually Black)
  toneAnalysis: {
    category: 'neutral' | 'earth' | 'cool' | 'warm';
    categoryAr: string;
    temperatureAr: string;
    descriptionAr: string;
  };
  comparisonWithBaseline: {
    priceDelta: number; // e.g. +5000, 0, -2000
    priceDeltaFormatted: string;
    priceDeltaType: 'equal' | 'higher' | 'lower';
    sizeDiff: {
      addedSizes: string[];
      missingSizes: string[];
      commonSizes: string[];
      summaryAr: string;
    };
    stockDiffAr: string;
    isIdenticalToBase: boolean;
  };
}

export interface ResolvedProductVariants {
  modelCode: string;
  baselineVariant: ColorVariant;
  variants: ColorVariant[];
  hasMultipleColors: boolean;
  colorsList: string[];
}

/**
 * Standard SKU color code abbreviations
 */
const COLOR_CODE_MAP: Record<string, string> = {
  black: 'BLK',
  أسود: 'BLK',
  white: 'WHT',
  أبيض: 'WHT',
  grey: 'GRY',
  gray: 'GRY',
  رمادي: 'GRY',
  رصاصي: 'GRY',
  'light grey': 'LGR',
  'رصاصي فاتح': 'LGR',
  'dark charcoal': 'CHR',
  'رصاصي غامق': 'CHR',
  فحم: 'CHR',
  charcoal: 'CHR',
  'navy blue': 'NVY',
  كحلي: 'NVY',
  navy: 'NVY',
  indigo: 'IND',
  نيلي: 'IND',
  'أزرق نيلي': 'IND',
  blue: 'BLU',
  أزرق: 'BLU',
  'cobalt blue': 'CBL',
  'sky blue': 'SKY',
  سماوي: 'SKY',
  'olive green': 'OLV',
  زيتي: 'OLV',
  olive: 'OLV',
  green: 'GRN',
  أخضر: 'GRN',
  khaki: 'KHK',
  camel: 'KHK',
  خاكي: 'KHK',
  جملي: 'KHK',
  'khaki / camel': 'KHK',
  beige: 'BGE',
  بيج: 'BGE',
  brown: 'BRN',
  بني: 'BRN',
  جوزي: 'BRN',
  'dusty rose pink': 'PNK',
  'dusty rose': 'PNK',
  pink: 'PNK',
  وردي: 'PNK',
  'وردي ترابي': 'PNK',
  maroon: 'MRN',
  burgundy: 'MRN',
  عنابي: 'MRN',
  ماروني: 'MRN',
  red: 'RED',
  أحمر: 'RED',
  purple: 'PUR',
  بنفسجي: 'PUR',
  yellow: 'YLW',
  أصفر: 'YLW',
  mustard: 'MST',
  خردلي: 'MST',
  orange: 'ORG',
  برتقالي: 'ORG',
};

/**
 * Extracts a normalized 3-letter SKU color abbreviation
 */
export function getColorAbbreviation(colorName: string): string {
  const normalized = colorName.toLowerCase().trim();
  for (const [key, code] of Object.entries(COLOR_CODE_MAP)) {
    if (normalized.includes(key.toLowerCase())) {
      return code;
    }
  }
  const clean = normalized.replace(/[^a-z0-9]/g, '');
  return clean.length >= 3 ? clean.substring(0, 3).toUpperCase() : 'CLR';
}

/**
 * Derives a consistent, high-fashion model code for a product
 */
export function deriveProductModelCode(product: Partial<Product>): string {
  if (product.sku && product.sku.trim()) {
    return product.sku.trim().toUpperCase();
  }

  // Derive model code from title or ID
  const title = (product.title || '').trim();
  const titleNumMatch = title.match(/\b\d{3,4}\b/);
  const numSuffix = titleNumMatch ? titleNumMatch[0] : '';

  let prefix = 'VNT-TSH';
  const cat = (product.category || '').toLowerCase();
  if (cat.includes('hoodie')) prefix = 'VNT-HOD';
  else if (cat.includes('jacket') || cat.includes('outerwear')) prefix = 'VNT-JKT';
  else if (cat.includes('tailor') || cat.includes('suit')) prefix = 'VNT-TLR';
  else if (cat.includes('pant') || cat.includes('trouser')) prefix = 'VNT-PNT';

  if (numSuffix) {
    return `${prefix}-${numSuffix}`;
  }

  const idStr = String(product.id || '0').replace(/-/g, '').slice(-4).toUpperCase();
  return `${prefix}-${idStr || '01'}`;
}

/**
 * Matches a color name against the COMMERCIAL_RETAIL_PALETTE to resolve hex, Arabic and English labels
 */
export function resolvePaletteInfo(colorStr: string): {
  colorNameAr: string;
  colorNameEn: string;
  hex: string;
  rgb: RGB;
} {
  const normalized = colorStr.toLowerCase().trim();

  // 1. Try exact match in palette first
  for (const item of COMMERCIAL_RETAIL_PALETTE) {
    const enLower = item.nameEn.toLowerCase();
    const arLower = item.nameAr.toLowerCase();
    if (normalized === enLower || normalized === arLower) {
      return {
        colorNameAr: item.nameAr,
        colorNameEn: item.nameEn,
        hex: item.hex,
        rgb: item.rgb,
      };
    }
  }

  // 2. Specific retail nomenclature overrides
  if (normalized.includes('light grey') || normalized.includes('رصاصي فاتح')) {
    return { colorNameAr: 'رصاصي فاتح', colorNameEn: 'Light Grey', hex: '#D1D5DB', rgb: { r: 209, g: 213, b: 219 } };
  }
  if (normalized.includes('charcoal') || normalized.includes('فحم') || normalized.includes('dark grey')) {
    return { colorNameAr: 'رصاصي فحم', colorNameEn: 'Dark Charcoal', hex: '#2D3748', rgb: { r: 45, g: 55, b: 72 } };
  }
  if (normalized.includes('indigo') || normalized.includes('نيلي')) {
    return { colorNameAr: 'نيلي', colorNameEn: 'Indigo', hex: '#2B506E', rgb: { r: 43, g: 80, b: 110 } };
  }
  if (normalized.includes('grey') || normalized.includes('gray') || normalized.includes('رمادي') || normalized.includes('رصاصي')) {
    return { colorNameAr: 'رصاصي', colorNameEn: 'Grey', hex: '#6B7280', rgb: { r: 107, g: 114, b: 128 } };
  }

  // 3. Match longer palette terms first (e.g. "Royal Indigo Blue" before "Blue")
  const sortedPalette = [...COMMERCIAL_RETAIL_PALETTE].sort((a, b) => b.nameEn.length - a.nameEn.length);
  for (const item of sortedPalette) {
    const enLower = item.nameEn.toLowerCase();
    const arLower = item.nameAr.toLowerCase();
    if (normalized.includes(enLower) || normalized.includes(arLower)) {
      return {
        colorNameAr: item.nameAr,
        colorNameEn: item.nameEn,
        hex: item.hex,
        rgb: item.rgb,
      };
    }
  }

  // Fallbacks for common keywords
  if (normalized.includes('black') || normalized.includes('أسود')) {
    return { colorNameAr: 'أسود', colorNameEn: 'Black', hex: '#0C0C0E', rgb: { r: 12, g: 12, b: 14 } };
  }
  if (normalized.includes('white') || normalized.includes('أبيض')) {
    return { colorNameAr: 'أبيض', colorNameEn: 'White', hex: '#FAFAFC', rgb: { r: 250, g: 250, b: 252 } };
  }
  if (normalized.includes('charcoal') || normalized.includes('فحم') || normalized.includes('dark grey')) {
    return { colorNameAr: 'رصاصي فحم', colorNameEn: 'Dark Charcoal', hex: '#2D3748', rgb: { r: 45, g: 55, b: 72 } };
  }
  if (normalized.includes('indigo') || normalized.includes('نيلي')) {
    return { colorNameAr: 'نيلي', colorNameEn: 'Indigo', hex: '#2B506E', rgb: { r: 43, g: 80, b: 110 } };
  }
  if (normalized.includes('grey') || normalized.includes('رمادي') || normalized.includes('رصاصي')) {
    return { colorNameAr: 'رصاصي', colorNameEn: 'Grey', hex: '#6B7280', rgb: { r: 107, g: 114, b: 128 } };
  }
  if (normalized.includes('khaki') || normalized.includes('camel') || normalized.includes('خاكي') || normalized.includes('جملي')) {
    return { colorNameAr: 'خاكي / جملي', colorNameEn: 'Khaki / Camel', hex: '#B4824B', rgb: { r: 180, g: 130, b: 75 } };
  }
  if (normalized.includes('brown') || normalized.includes('بني') || normalized.includes('جوزي') || normalized.includes('chocolate')) {
    return { colorNameAr: 'بني شوكولا', colorNameEn: 'Brown', hex: '#4A3528', rgb: { r: 74, g: 53, b: 40 } };
  }
  if (normalized.includes('olive') || normalized.includes('زيتي')) {
    return { colorNameAr: 'زيتي', colorNameEn: 'Olive Green', hex: '#4D5F2D', rgb: { r: 77, g: 95, b: 45 } };
  }
  if (normalized.includes('pink') || normalized.includes('وردي')) {
    return { colorNameAr: 'وردي ترابي', colorNameEn: 'Dusty Rose Pink', hex: '#D98C99', rgb: { r: 217, g: 140, b: 153 } };
  }
  if (normalized.includes('blue') || normalized.includes('أزرق') || normalized.includes('كحلي')) {
    return { colorNameAr: 'كحلي', colorNameEn: 'Navy Blue', hex: '#172554', rgb: { r: 23, g: 37, b: 84 } };
  }

  return {
    colorNameAr: colorStr,
    colorNameEn: colorStr,
    hex: '#1E293B',
    rgb: { r: 30, g: 41, b: 59 },
  };
}

/**
 * Categorizes and explains the color tone characteristics
 */
function analyzeColorTone(colorNameEn: string, hex: string) {
  const lower = colorNameEn.toLowerCase();
  if (lower.includes('black') || lower.includes('white') || lower.includes('grey') || lower.includes('charcoal')) {
    return {
      category: 'neutral' as const,
      categoryAr: 'محايد كلاسيكي',
      temperatureAr: 'معتدل ومتوازن',
      descriptionAr: 'لون أساسي متعدد الاستخدامات يسهل تنسيقه مع جميع الإطلالات',
    };
  }
  if (lower.includes('olive') || lower.includes('khaki') || lower.includes('camel') || lower.includes('brown') || lower.includes('beige')) {
    return {
      category: 'earth' as const,
      categoryAr: 'درجات ترابية وأرضية',
      temperatureAr: 'دافئ وطبيعي',
      descriptionAr: 'درجة مستوحاة من الطبيعة والتربة تمنح إطلالة فاخرة ودافئة',
    };
  }
  if (lower.includes('blue') || lower.includes('teal') || lower.includes('tiffany') || lower.includes('navy')) {
    return {
      category: 'cool' as const,
      categoryAr: 'درجات بحرية وباردة',
      temperatureAr: 'بارد وعميق',
      descriptionAr: 'درجة غنية تعكس الهدوء والثقة وتبرز تفاصيل القماش',
    };
  }
  return {
    category: 'warm' as const,
    categoryAr: 'درجات حيوية دافئة',
    temperatureAr: 'دافئ ومشرق',
    descriptionAr: 'درجة حيوية تضيف لمسة من التميز والجاذبية للمظهر',
  };
}

/**
 * Robust extraction of color name from an image URL.
 * Handles patterns such as:
 * - shirt_Black_1791500137735_5btnj.png -> "Black"
 * - shirt_Khaki%20/%20Camel_1791500134844_lfyi1.png -> "Khaki / Camel"
 * - shirt_Olive%20Green_... -> "Olive Green"
 * - /colors/navy/...
 */
export function extractColorFromImageUrl(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const decoded = decodeURIComponent(url);

  // Specific user uploads:
  // b4niw is the Brown shirt variant
  if (decoded.includes('b4niw') || decoded.toLowerCase().includes('shirt_brown') || decoded.toLowerCase().includes('_brown_')) {
    return 'Brown';
  }

  // atvq0 is the true Indigo / Navy Blue variant (نيلي), previously mislabeled as Dark Charcoal
  if (decoded.includes('atvq0')) {
    return 'Indigo';
  }

  // jkryq is the true Slate Grey variant (رصاصي)
  if (decoded.includes('jkryq')) {
    return 'Grey';
  }

  // i6ei0 is the Light Grey variant (رصاصي فاتح)
  if (decoded.includes('i6ei0')) {
    return 'Light Grey';
  }

  // Pattern: shirt_<ColorName>_<timestamp>
  const shirtMatch = decoded.match(/shirt_([^_]+)_[0-9]+/i);
  if (shirtMatch && shirtMatch[1]) {
    return shirtMatch[1].trim();
  }

  // Pattern: /catalog/<ColorName>_ or _<ColorName>_
  for (const item of COMMERCIAL_RETAIL_PALETTE) {
    if (decoded.includes(`shirt_${item.nameEn}`) || decoded.includes(`_${item.nameEn}_`)) {
      return item.nameEn;
    }
  }

  return null;
}

/**
 * Intelligent Algorithm: Resolves all color variants for a product,
 * associates strictly each color's own images, builds SKUs,
 * and computes differences vs. the baseline Black color.
 */
export function resolveProductColorVariants(
  product: Product,
  currency: string = 'IQD'
): ResolvedProductVariants {
  const modelCode = deriveProductModelCode(product);
  const images = (product.images && product.images.length > 0
    ? product.images
    : product.image_url
    ? [product.image_url]
    : []) as string[];

  // 1. Group images by detected color name from their URLs
  const colorImageBuckets = new Map<string, string[]>();
  const unassignedImages: string[] = [];

  for (const imgUrl of images) {
    const detectedColor = extractColorFromImageUrl(imgUrl);
    if (detectedColor) {
      const existing = colorImageBuckets.get(detectedColor) || [];
      existing.push(imgUrl);
      colorImageBuckets.set(detectedColor, existing);
    } else {
      unassignedImages.push(imgUrl);
    }
  }

  // 2. Aggregate all candidate colors and deduplicate by resolved canonical color
  const candidateColorMap = new Map<string, { rawName: string; palette: ReturnType<typeof resolvePaletteInfo> }>();

  const registerCandidate = (cRaw: string) => {
    if (!cRaw || typeof cRaw !== 'string' || !cRaw.trim()) return;
    const cleanRaw = cRaw.trim();
    const pal = resolvePaletteInfo(cleanRaw);
    // Use canonical English color name as dedup key (e.g. 'Grey')
    const key = pal.colorNameEn.toLowerCase().trim();
    if (!candidateColorMap.has(key)) {
      candidateColorMap.set(key, { rawName: cleanRaw, palette: pal });
    }
  };

  // Colors found in image URLs
  colorImageBuckets.forEach((_, cName) => registerCandidate(cName));

  // Colors listed in product.colors
  if (Array.isArray(product.colors)) {
    product.colors.forEach((c) => {
      registerCandidate(c);
    });
  }

  // 3. If no colors are found, default to Black (or single default color)
  if (candidateColorMap.size === 0) {
    registerCandidate('Black');
  }

  // 4. Build variant objects
  const rawVariants: Array<{
    colorNameEn: string;
    colorNameAr: string;
    hex: string;
    rgb: RGB;
    images: string[];
    price: number;
    originalPrice?: number;
    sizes: string[];
    availability: ProductAvailability;
  }> = [];

  candidateColorMap.forEach(({ rawName, palette }) => {
    let matchedImages = colorImageBuckets.get(rawName) || [];

    // Fallback: check case-insensitive or partial
    if (matchedImages.length === 0) {
      colorImageBuckets.forEach((imgs, key) => {
        if (
          key.toLowerCase().includes(rawName.toLowerCase()) ||
          rawName.toLowerCase().includes(key.toLowerCase()) ||
          key.toLowerCase().includes(palette.colorNameEn.toLowerCase()) ||
          palette.colorNameEn.toLowerCase().includes(key.toLowerCase())
        ) {
          matchedImages = imgs;
        }
      });
    }

    // If still no images, use unassigned or product primary
    if (matchedImages.length === 0) {
      matchedImages = unassignedImages.length > 0 ? unassignedImages : images;
    }

    // Determine variant-specific sizes or pricing if configured
    let variantPrice = product.price;
    let variantOriginalPrice = product.original_price;
    let variantSizes = Array.isArray(product.sizes) && product.sizes.length > 0 ? [...product.sizes] : ['S', 'M', 'L', 'XL'];
    let variantAvailability: ProductAvailability = product.availability || 'in_stock';

    // Algorithmic nuance: some colors might have slight size variation or price difference
    const isSpecialShade = palette.colorNameEn === 'Olive Green' || palette.colorNameEn === 'Dusty Rose Pink';
    if (isSpecialShade && product.category === 'T-Shirts' && product.price >= 20000) {
      // E.g. special dyes or limited washes may have distinctive size allocations
      if (palette.colorNameEn === 'Olive Green') {
        variantSizes = ['S', 'M', 'L'];
      }
    }

    rawVariants.push({
      colorNameEn: palette.colorNameEn,
      colorNameAr: palette.colorNameAr,
      hex: palette.hex,
      rgb: palette.rgb,
      images: matchedImages,
      price: variantPrice,
      originalPrice: variantOriginalPrice,
      sizes: variantSizes,
      availability: variantAvailability,
    });
  });

  // 5. Identify baseline variant (Black or first variant)
  let baseIndex = rawVariants.findIndex(
    (v) =>
      v.colorNameEn.toLowerCase().includes('black') ||
      v.colorNameAr.includes('أسود') ||
      v.colorNameEn.toLowerCase().includes('charcoal')
  );
  if (baseIndex === -1) {
    baseIndex = 0;
  }

  const rawBase = rawVariants[baseIndex];
  const baseSkuAbbr = getColorAbbreviation(rawBase.colorNameEn);
  const baseSku = `${modelCode}-${baseSkuAbbr}`;

  // 6. Build the full ColorVariant objects with comparison logic
  const usedVariantIds = new Set<string>();
  const variants: ColorVariant[] = rawVariants.map((rv, idx) => {
    const isBaseline = idx === baseIndex;
    const skuAbbr = getColorAbbreviation(rv.colorNameEn);
    const sku = `${modelCode}-${skuAbbr}`;

    // Algorithmic comparison vs baseline
    const priceDelta = rv.price - rawBase.price;
    const priceDeltaType: 'equal' | 'higher' | 'lower' =
      priceDelta === 0 ? 'equal' : priceDelta > 0 ? 'higher' : 'lower';

    let priceDeltaFormatted = 'مطابق للأساسي';
    if (priceDelta > 0) {
      priceDeltaFormatted = `+${new Intl.NumberFormat('en-US').format(priceDelta)} ${currency}`;
    } else if (priceDelta < 0) {
      priceDeltaFormatted = `-${new Intl.NumberFormat('en-US').format(Math.abs(priceDelta))} ${currency}`;
    }

    // Size set comparison
    const baseSizesSet = new Set(rawBase.sizes);
    const thisSizesSet = new Set(rv.sizes);

    const addedSizes = rv.sizes.filter((s) => !baseSizesSet.has(s));
    const missingSizes = rawBase.sizes.filter((s) => !thisSizesSet.has(s));
    const commonSizes = rv.sizes.filter((s) => baseSizesSet.has(s));

    let sizeSummaryAr = 'جميع المقاسات متطابقة مع اللون الأسود المعتمد';
    if (addedSizes.length > 0 && missingSizes.length > 0) {
      sizeSummaryAr = `يتوفر مقاس إضافي (${addedSizes.join('، ')})، بينما ينقص مقاس (${missingSizes.join('، ')})`;
    } else if (addedSizes.length > 0) {
      sizeSummaryAr = `يتوفر مقاس إضافي (${addedSizes.join('، ')}) مقارنة باللون الأساسي`;
    } else if (missingSizes.length > 0) {
      sizeSummaryAr = `نفد مقاس (${missingSizes.join('، ')}) مقارنة باللون الأساسي`;
    }

    let stockDiffAr = 'حالة التوفر مطابقة للون الأسود المعتمد';
    if (rv.availability !== rawBase.availability) {
      stockDiffAr = `حالة هذا اللون: ${
        rv.availability === 'limited' ? 'قطع محدودة' : rv.availability === 'coming_soon' ? 'قريباً' : 'متوفر'
      }`;
    }

    const varId = `${product.id}_${skuAbbr}`;
    const uniqueVarId = usedVariantIds.has(varId) ? `${varId}_${idx}` : varId;
    usedVariantIds.add(uniqueVarId);

    return {
      id: uniqueVarId,
      colorKey: rv.colorNameEn.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      colorNameAr: rv.colorNameAr,
      colorNameEn: rv.colorNameEn,
      hex: rv.hex,
      sku,
      images: rv.images.length > 0 ? rv.images : images,
      thumbnail: rv.images[0] || images[0] || '',
      price: rv.price,
      originalPrice: rv.originalPrice,
      sizes: rv.sizes,
      availability: rv.availability,
      isBaseline,
      toneAnalysis: analyzeColorTone(rv.colorNameEn, rv.hex),
      comparisonWithBaseline: {
        priceDelta,
        priceDeltaFormatted,
        priceDeltaType,
        sizeDiff: {
          addedSizes,
          missingSizes,
          commonSizes,
          summaryAr: sizeSummaryAr,
        },
        stockDiffAr,
        isIdenticalToBase: priceDelta === 0 && addedSizes.length === 0 && missingSizes.length === 0,
      },
    };
  });

  const baselineVariant = variants[baseIndex];

  return {
    modelCode,
    baselineVariant,
    variants,
    hasMultipleColors: variants.length > 1,
    colorsList: variants.map((v) => v.colorNameAr),
  };
}
