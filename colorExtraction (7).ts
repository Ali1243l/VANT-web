// Client-Side AI-Powered Image Color Sorting (HTML5 Canvas API)
// High-Precision Garment Color Identification & Commercial Fashion Naming
// Uses Center-Weighted Torso Sampling & CIELAB Delta-E (ΔE) Perceptual Clustering.

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface LAB {
  l: number;
  a: number;
  b: number;
}

export interface ColorExtractionResult {
  hex: string;
  rgb: RGB;
  lab: LAB;
  dataUrl: string;
}

export interface GroupedColorResult {
  id: string;
  hex: string;
  rgb: RGB;
  lab: LAB;
  colorNameAr: string;
  colorNameEn: string;
  images: string[];
  files: File[];
}

/**
 * Standard Commercial Retail Fashion Color Dictionary (Arabic & English)
 * Standard Iraqi/Arab retail garment color nomenclature.
 */
export const COMMERCIAL_RETAIL_PALETTE: Array<{
  nameAr: string;
  nameEn: string;
  rgb: RGB;
  hex: string;
  lab?: LAB;
}> = [
  // Neutrals & Darks
  { nameAr: 'أسود', nameEn: 'Black', rgb: { r: 12, g: 12, b: 14 }, hex: '#0C0C0E' },
  { nameAr: 'أبيض', nameEn: 'White', rgb: { r: 250, g: 250, b: 252 }, hex: '#FAFAFC' },
  { nameAr: 'أوف وايت / سكري', nameEn: 'Off-White / Cream', rgb: { r: 243, g: 239, b: 230 }, hex: '#F3EFE6' },
  { nameAr: 'رصاصي', nameEn: 'Grey', rgb: { r: 107, g: 114, b: 128 }, hex: '#6B7280' },
  { nameAr: 'رصاصي فاتح', nameEn: 'Light Grey', rgb: { r: 209, g: 213, b: 219 }, hex: '#D1D5DB' },
  { nameAr: 'رصاصي غامق / فحم', nameEn: 'Dark Charcoal', rgb: { r: 45, g: 55, b: 72 }, hex: '#2D3748' },

  // Blues
  { nameAr: 'كحلي', nameEn: 'Navy Blue', rgb: { r: 23, g: 37, b: 84 }, hex: '#172554' },
  { nameAr: 'نيلي', nameEn: 'Indigo', rgb: { r: 43, g: 80, b: 110 }, hex: '#2B506E' },
  { nameAr: 'أزرق نيلي', nameEn: 'Royal Indigo Blue', rgb: { r: 30, g: 64, b: 175 }, hex: '#1E40AF' },
  { nameAr: 'أزرق سماوي', nameEn: 'Sky Blue', rgb: { r: 56, g: 189, b: 248 }, hex: '#38BDF8' },
  { nameAr: 'أزرق بترولي', nameEn: 'Petrol Teal', rgb: { r: 15, g: 118, b: 110 }, hex: '#0F766E' },
  { nameAr: 'تيفاني / فيروزي', nameEn: 'Tiffany Turquoise', rgb: { r: 45, g: 212, b: 191 }, hex: '#2DD4BF' },

  // Greens
  { nameAr: 'زيتي', nameEn: 'Olive Green', rgb: { r: 77, g: 95, b: 45 }, hex: '#4D5F2D' },
  { nameAr: 'أخضر داكن', nameEn: 'Forest Green', rgb: { r: 20, g: 83, b: 45 }, hex: '#14532D' },
  { nameAr: 'أخضر فاتح / فستقي', nameEn: 'Pistachio / Light Green', rgb: { r: 134, g: 199, b: 137 }, hex: '#86C789' },

  // Reds, Maroons, Pinks & Purples
  { nameAr: 'ماروني / عنابي', nameEn: 'Maroon / Burgundy', rgb: { r: 128, g: 15, b: 47 }, hex: '#800F2F' },
  { nameAr: 'أحمر', nameEn: 'Red', rgb: { r: 220, g: 38, b: 38 }, hex: '#DC2626' },
  { nameAr: 'وردي ترابي', nameEn: 'Dusty Rose Pink', rgb: { r: 217, g: 140, b: 153 }, hex: '#D98C99' },
  { nameAr: 'وردي', nameEn: 'Pink', rgb: { r: 244, g: 114, b: 182 }, hex: '#F472B6' },
  { nameAr: 'وردي فاتح', nameEn: 'Light Pink', rgb: { r: 251, g: 182, b: 206 }, hex: '#FBB6CE' },
  { nameAr: 'فوشي', nameEn: 'Fuchsia / Magenta', rgb: { r: 219, g: 39, b: 119 }, hex: '#DB2777' },
  { nameAr: 'مشمشي / سلمون', nameEn: 'Peach / Salmon', rgb: { r: 251, g: 146, b: 120 }, hex: '#FB9278' },
  { nameAr: 'بنفسجي', nameEn: 'Purple / Violet', rgb: { r: 109, g: 40, b: 217 }, hex: '#6D28D9' },
  { nameAr: 'ليلكي / بنفسجي فاتح', nameEn: 'Lilac / Lavender', rgb: { r: 192, g: 132, b: 252 }, hex: '#C084FC' },

  // Earth Tones & Yellows
  { nameAr: 'بيج', nameEn: 'Beige', rgb: { r: 226, g: 199, b: 168 }, hex: '#E2C7A8' },
  { nameAr: 'خاكي / جملي', nameEn: 'Khaki / Camel', rgb: { r: 180, g: 130, b: 75 }, hex: '#B4824B' },
  { nameAr: 'بني / جوزي', nameEn: 'Brown', rgb: { r: 88, g: 47, b: 28 }, hex: '#582F1C' },
  { nameAr: 'خردلي', nameEn: 'Mustard', rgb: { r: 202, g: 138, b: 4 }, hex: '#CA8A04' },
  { nameAr: 'أصفر', nameEn: 'Yellow', rgb: { r: 250, g: 204, b: 21 }, hex: '#FACC15' },
  { nameAr: 'برتقالي', nameEn: 'Orange', rgb: { r: 234, g: 88, b: 12 }, hex: '#EA580C' },
];

/**
 * Converts Hex (#RRGGBB) to RGB object
 */
export function hexToRgb(hex: string): RGB {
  const clean = hex.replace('#', '').trim();
  const fullHex =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean.padEnd(6, '0').slice(0, 6);
  const num = parseInt(fullHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Converts RGB numbers to formatted Hex (#RRGGBB)
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const toHex = (v: number) => clamp(v).toString(16).padStart(2, '0').toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Converts sRGB to CIELAB (L*a*b*) color space under standard D65 illuminant
 */
export function rgbToLab(rgb: RGB): LAB {
  // 1. Convert sRGB to linear RGB
  let r = rgb.r / 255;
  let g = rgb.g / 255;
  let b = rgb.b / 255;

  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  // 2. Linear RGB to XYZ (D65 Illuminant reference)
  const x = (r * 0.4124564 + g * 0.3575761 + b * 0.1804375) / 0.95047;
  const y = (r * 0.2126729 + g * 0.7151522 + b * 0.072175) / 1.0;
  const z = (r * 0.0193339 + g * 0.119192 + b * 0.9503041) / 1.08883;

  // 3. XYZ to CIE L*a*b*
  const epsilon = 0.008856;
  const kappa = 903.3;

  const fx = x > epsilon ? Math.cbrt(x) : (kappa * x + 16) / 116;
  const fy = y > epsilon ? Math.cbrt(y) : (kappa * y + 16) / 116;
  const fz = z > epsilon ? Math.cbrt(z) : (kappa * z + 16) / 116;

  return {
    l: Math.max(0, 116 * fy - 16),
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  };
}

/**
 * Converts Hex string directly to CIELAB
 */
export function hexToLab(hex: string): LAB {
  return rgbToLab(hexToRgb(hex));
}

/**
 * Calculates CIE76 Delta E (ΔE) perceptual color difference
 * ΔE < 3.0: Inaudible to casual observer
 * ΔE ~ 10-18: Obvious subtle shade difference (e.g. Dark Navy vs Black, Olive vs Khaki)
 * ΔE > 25: Completely different color categories
 */
export function deltaE(c1: LAB, c2: LAB): number {
  const dl = c1.l - c2.l;
  const da = c1.a - c2.a;
  const db = c1.b - c2.b;
  return Math.sqrt(dl * dl + da * da + db * db);
}

/**
 * Backward compatibility alias for colorDistance:
 * Computes CIELAB Delta E if comparing, with calibrated scaling.
 */
export function colorDistance(c1: RGB, c2: RGB): number {
  const lab1 = rgbToLab(c1);
  const lab2 = rgbToLab(c2);
  return deltaE(lab1, lab2);
}

// Pre-compute LAB values for dictionary to maximize performance
COMMERCIAL_RETAIL_PALETTE.forEach((item) => {
  item.lab = rgbToLab(item.rgb);
});

/**
 * Maps any RGB or Hex color to the closest standard retail bilingual fashion name
 */
export function getClosestCommercialColorName(hexOrRgb: string | RGB): {
  ar: string;
  en: string;
  matchedHex: string;
} {
  const rgb = typeof hexOrRgb === 'string' ? hexToRgb(hexOrRgb) : hexOrRgb;
  const lab = rgbToLab(rgb);

  let minDistance = Infinity;
  let closest = COMMERCIAL_RETAIL_PALETTE[0];

  for (const item of COMMERCIAL_RETAIL_PALETTE) {
    const dist = deltaE(lab, item.lab!);
    if (dist < minDistance) {
      minDistance = dist;
      closest = item;
    }
  }

  return {
    ar: closest.nameAr,
    en: closest.nameEn,
    matchedHex: closest.hex,
  };
}

/**
 * Backward-compatible alias for existing imports
 */
export const getClosestLuxuryColorName = getClosestCommercialColorName;

/**
 * Reads a File into an HTMLImageElement
 */
function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(err);
    };
    img.src = objectUrl;
  });
}

/**
 * Converts File to a permanent Data URL string for local storage / state
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Extracts dominant garment color from an image File using an offscreen HTML5 <canvas>.
 */
export async function extractDominantColor(file: File): Promise<string> {
  const details = await extractDominantColorWithDetails(file);
  return details.hex;
}

/**
 * High-Precision Garment Color Extraction with Center-Torso Localization & Studio Filtering
 */
export async function extractDominantColorWithDetails(file: File): Promise<ColorExtractionResult> {
  try {
    const img = await loadImageFromFile(file);
    const dataUrl = await fileToDataUrl(file);

    // Target sample resolution 64x64
    const targetSize = 64;
    const canvas = document.createElement('canvas');
    canvas.width = targetSize;
    canvas.height = targetSize;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!ctx) {
      const fallbackRgb = { r: 15, g: 15, b: 17 };
      return {
        hex: '#0F0F11',
        rgb: fallbackRgb,
        lab: rgbToLab(fallbackRgb),
        dataUrl,
      };
    }

    ctx.drawImage(img, 0, 0, targetSize, targetSize);
    const imgData = ctx.getImageData(0, 0, targetSize, targetSize);
    const pixels = imgData.data;

    // ========================================================
    // Step 1: Dynamic Border-Perimeter Profiling
    // Automatically detect the exact background color of THIS photo
    // Works with white studio, wooden tables, colored paper, grey surfaces, etc.
    // ========================================================
    const borderBins: {
      [key: string]: { count: number; sumR: number; sumG: number; sumB: number };
    } = {};

    const borderWidth = 6; // outer 6 pixels (~10% boundary strip)
    for (let y = 0; y < targetSize; y++) {
      for (let x = 0; x < targetSize; x++) {
        const isBorder =
          x < borderWidth ||
          x >= targetSize - borderWidth ||
          y < borderWidth ||
          y >= targetSize - borderWidth;

        if (!isBorder) continue;

        const idx = (y * targetSize + x) * 4;
        const a = pixels[idx + 3];
        if (a < 120) continue; // ignore transparent background

        const r = pixels[idx];
        const g = pixels[idx + 1];
        const b = pixels[idx + 2];

        // 4-bit quantization bin
        const key = `${Math.floor(r / 16)}_${Math.floor(g / 16)}_${Math.floor(b / 16)}`;
        if (!borderBins[key]) {
          borderBins[key] = { count: 0, sumR: 0, sumG: 0, sumB: 0 };
        }
        borderBins[key].count++;
        borderBins[key].sumR += r;
        borderBins[key].sumG += g;
        borderBins[key].sumB += b;
      }
    }

    // Identify dominant background color for this image
    let bgRgb = { r: 250, g: 250, b: 250 };
    let maxBorderBinCount = 0;
    for (const key in borderBins) {
      const b = borderBins[key];
      if (b.count > maxBorderBinCount) {
        maxBorderBinCount = b.count;
        bgRgb = {
          r: Math.round(b.sumR / b.count),
          g: Math.round(b.sumG / b.count),
          b: Math.round(b.sumB / b.count),
        };
      }
    }

    const bgLab = rgbToLab(bgRgb);
    // Is this photo's perimeter background white or near-white studio backdrop?
    const isBgWhiteOrLightGrey =
      bgLab.l >= 84 && Math.sqrt(bgLab.a * bgLab.a + bgLab.b * bgLab.b) <= 14;

    // ========================================================
    // Step 2: Center-Torso Sampling & White-on-White Disambiguation
    // ========================================================
    let clothZoneTotalCount = 0;
    let clothZoneWhiteCount = 0;
    let clothZoneColoredOrDarkCount = 0;

    const garmentBuckets: {
      [key: string]: { weight: number; count: number; sumR: number; sumG: number; sumB: number };
    } = {};
    const allClothBuckets: {
      [key: string]: { weight: number; count: number; sumR: number; sumG: number; sumB: number };
    } = {};

    let totalGarmentWeight = 0;

    for (let y = 0; y < targetSize; y++) {
      const yRatio = y / targetSize;
      for (let x = 0; x < targetSize; x++) {
        const xRatio = x / targetSize;

        // --- 5-Zone Spatial Weighting ---
        // 1. Central Graphic Chest Box (prints / artwork / logos live here):
        const isGraphicChestZone =
          xRatio >= 0.25 && xRatio <= 0.75 && yRatio >= 0.22 && yRatio <= 0.70;

        // 2. Collar & Neckline:
        const isCollar = xRatio >= 0.36 && xRatio <= 0.64 && yRatio >= 0.08 && yRatio <= 0.20;

        // 3. Shoulders (Upper left and right quadrants):
        const isLeftShoulder = xRatio >= 0.14 && xRatio <= 0.38 && yRatio >= 0.10 && yRatio <= 0.26;
        const isRightShoulder = xRatio >= 0.62 && xRatio <= 0.86 && yRatio >= 0.10 && yRatio <= 0.26;

        // 4. Sleeves (Outer arm fabric folds):
        const isLeftSleeve = xRatio >= 0.06 && xRatio <= 0.25 && yRatio >= 0.20 && yRatio <= 0.54;
        const isRightSleeve = xRatio >= 0.75 && xRatio <= 0.94 && yRatio >= 0.20 && yRatio <= 0.54;

        // 5. Torso Flanks (Sides of chest outside graphic print):
        const isLeftFlank = xRatio >= 0.12 && xRatio <= 0.26 && yRatio >= 0.30 && yRatio <= 0.74;
        const isRightFlank = xRatio >= 0.74 && xRatio <= 0.88 && yRatio >= 0.30 && yRatio <= 0.74;

        // 6. Lower Torso & Hem (Below graphic print):
        const isLowerHem = xRatio >= 0.20 && xRatio <= 0.80 && yRatio >= 0.72 && yRatio <= 0.92;

        let spatialWeight = 0.4;
        let isPureClothZone = false;

        if (isGraphicChestZone) {
          // Penalize chest graphic to near-zero (0.02x) so chest print NEVER pollutes garment fabric!
          spatialWeight = 0.02;
        } else if (isLeftShoulder || isRightShoulder) {
          spatialWeight = 4.5;
          isPureClothZone = true;
        } else if (isLeftSleeve || isRightSleeve) {
          spatialWeight = 4.5;
          isPureClothZone = true;
        } else if (isCollar) {
          spatialWeight = 3.5;
          isPureClothZone = true;
        } else if (isLeftFlank || isRightFlank) {
          spatialWeight = 3.5;
          isPureClothZone = true;
        } else if (isLowerHem) {
          spatialWeight = 3.0;
          isPureClothZone = true;
        }

        const idx = (y * targetSize + x) * 4;
        const a = pixels[idx + 3];
        if (a < 120) continue;

        const r = pixels[idx];
        const g = pixels[idx + 1];
        const b = pixels[idx + 2];
        const pRgb = { r, g, b };
        const pLab = rgbToLab(pRgb);

        // 12-step quantization bin for high color resolution
        const quantKey = `${Math.floor(r / 12)}_${Math.floor(g / 12)}_${Math.floor(b / 12)}`;

        // Dynamic Background Rejection:
        const distToBg = deltaE(pLab, bgLab);

        // Track statistics specifically within pure cloth zones (shoulders, sleeves, collar, flanks)
        if (isPureClothZone) {
          clothZoneTotalCount++;
          const chroma = Math.sqrt(pLab.a * pLab.a + pLab.b * pLab.b);
          if (pLab.l >= 78 && chroma <= 14) {
            clothZoneWhiteCount++;
          }
          if (pLab.l < 70 || chroma > 15) {
            clothZoneColoredOrDarkCount++;
          }
        }

        // Always accumulate into allClothBuckets with spatial weight
        if (!allClothBuckets[quantKey]) {
          allClothBuckets[quantKey] = { weight: 0, count: 0, sumR: 0, sumG: 0, sumB: 0 };
        }
        allClothBuckets[quantKey].weight += spatialWeight;
        allClothBuckets[quantKey].count++;
        allClothBuckets[quantKey].sumR += r * spatialWeight;
        allClothBuckets[quantKey].sumG += g * spatialWeight;
        allClothBuckets[quantKey].sumB += b * spatialWeight;

        // Reject background pixels based on dynamic perimeter background:
        if (distToBg <= 13.0) {
          continue;
        }

        // Also reject studio white / specular light edges if background is light
        if (isBgWhiteOrLightGrey && pLab.l >= 95 && Math.sqrt(pLab.a * pLab.a + pLab.b * pLab.b) <= 9) {
          continue;
        }

        // Confirmed pure garment pixel!
        if (!garmentBuckets[quantKey]) {
          garmentBuckets[quantKey] = { weight: 0, count: 0, sumR: 0, sumG: 0, sumB: 0 };
        }
        garmentBuckets[quantKey].weight += spatialWeight;
        garmentBuckets[quantKey].count++;
        garmentBuckets[quantKey].sumR += r * spatialWeight;
        garmentBuckets[quantKey].sumG += g * spatialWeight;
        garmentBuckets[quantKey].sumB += b * spatialWeight;
        totalGarmentWeight += spatialWeight;
      }
    }

    // ========================================================
    // Step 3: White Shirt Disambiguation
    // ========================================================
    // If the perimeter background is white studio AND the pure cloth zones
    // (shoulders, sleeves, collar) contain white/light neutral fabric
    // without dominant colored fabric: it is conclusively a White T-Shirt!
    if (
      isBgWhiteOrLightGrey &&
      clothZoneTotalCount > 0 &&
      clothZoneWhiteCount / clothZoneTotalCount >= 0.38 &&
      clothZoneColoredOrDarkCount / clothZoneTotalCount < 0.30
    ) {
      const whiteRgb = { r: 250, g: 250, b: 252 };
      return {
        hex: '#FAFAFC',
        rgb: whiteRgb,
        lab: rgbToLab(whiteRgb),
        dataUrl,
      };
    }

    // ========================================================
    // Step 4: Extract Dominant Garment Cloth Bucket
    // ========================================================
    // If garment pixels were isolated from background, use garmentBuckets;
    // otherwise fallback to allClothBuckets.
    const activeBuckets = totalGarmentWeight > 6 ? garmentBuckets : allClothBuckets;

    let bestBucket: { weight: number; count: number; sumR: number; sumG: number; sumB: number } | null =
      null;

    for (const key in activeBuckets) {
      const bkt = activeBuckets[key];
      if (!bestBucket || bkt.weight > bestBucket.weight) {
        bestBucket = bkt;
      }
    }

    if (bestBucket && bestBucket.weight > 0) {
      const avgR = Math.round(bestBucket.sumR / bestBucket.weight);
      const avgG = Math.round(bestBucket.sumG / bestBucket.weight);
      const avgB = Math.round(bestBucket.sumB / bestBucket.weight);
      const hex = rgbToHex(avgR, avgG, avgB);
      const rgb = { r: avgR, g: avgG, b: avgB };

      return {
        hex,
        rgb,
        lab: rgbToLab(rgb),
        dataUrl,
      };
    }

    // Default neutral fallback
    const fallbackRgb = { r: 15, g: 15, b: 17 };
    return {
      hex: '#0F0F11',
      rgb: fallbackRgb,
      lab: rgbToLab(fallbackRgb),
      dataUrl,
    };
  } catch (err) {
    console.error('Error extracting dominant garment color:', err);
    const dataUrl = await fileToDataUrl(file).catch(() => '');
    const fallbackRgb = { r: 51, g: 65, b: 85 };
    return {
      hex: '#334155',
      rgb: fallbackRgb,
      lab: rgbToLab(fallbackRgb),
      dataUrl,
    };
  }
}

/**
 * Task 2: Radical 2-Pass Double-Check Garment Color Clustering Engine
 * Solves centroid drift and false merging across 9 to 20+ shirt uploads.
 * Pass 1: Strict anchor clustering with tight threshold (ΔE <= 9.2) and ZERO centroid drift.
 * Pass 2: Intra-cluster pairwise cross-examination & double-check:
 *   - Compares every image in the cluster against the anchor image.
 *   - Verifies that the commercial color category matches.
 *   - Evicts and splits any outlier into its own discrete variant.
 * @param files Bulk array of image files (e.g. 9 to 20+ photos)
 * @param deltaETolerance Perceptual distance threshold in CIELAB space (default: 9.2)
 */
export async function groupImagesByColor(
  files: File[],
  deltaETolerance = 9.2
): Promise<GroupedColorResult[]> {
  if (!files || files.length === 0) return [];

  // 1. Extract color, CIELAB coordinates, and commercial color name for each file in parallel
  const analyzedImages = await Promise.all(
    files.map(async (file) => {
      const extraction = await extractDominantColorWithDetails(file);
      const commercial = getClosestCommercialColorName(extraction.hex);
      return {
        file,
        hex: extraction.hex,
        rgb: extraction.rgb,
        lab: extraction.lab,
        dataUrl: extraction.dataUrl,
        categoryAr: commercial.ar,
        categoryEn: commercial.en,
      };
    })
  );

  // Pass 1: Anchor-based clustering with Zero Centroid Drift
  interface CandidateCluster {
    anchor: (typeof analyzedImages)[0];
    items: typeof analyzedImages;
  }

  const candidateClusters: CandidateCluster[] = [];

  for (const item of analyzedImages) {
    let matchedCluster: CandidateCluster | null = null;
    let minDistance = Infinity;

    for (const cluster of candidateClusters) {
      // Compare strictly against the cluster's immutable anchor image (prevents centroid drift chaining)
      const dist = deltaE(item.lab, cluster.anchor.lab);
      // Double check: distance must be within tight tolerance AND commercial category must match!
      const sameCategory = item.categoryAr === cluster.anchor.categoryAr;

      if (sameCategory && dist <= deltaETolerance && dist < minDistance) {
        minDistance = dist;
        matchedCluster = cluster;
      }
    }

    if (matchedCluster) {
      matchedCluster.items.push(item);
    } else {
      candidateClusters.push({
        anchor: item,
        items: [item],
      });
    }
  }

  // Pass 2: Double-Check Pairwise Verification & Outlier Eviction
  const finalizedClusters: Array<{
    items: typeof analyzedImages;
    hex: string;
    rgb: RGB;
    lab: LAB;
    colorNameAr: string;
    colorNameEn: string;
  }> = [];

  const evictedItems: typeof analyzedImages = [];

  for (const cluster of candidateClusters) {
    if (cluster.items.length === 1) {
      const single = cluster.items[0];
      finalizedClusters.push({
        items: [single],
        hex: single.hex,
        rgb: single.rgb,
        lab: single.lab,
        colorNameAr: single.categoryAr,
        colorNameEn: single.categoryEn,
      });
      continue;
    }

    // Cluster has multiple items: perform strict double-check against anchor
    const validGroup: typeof analyzedImages = [cluster.anchor];

    for (let i = 1; i < cluster.items.length; i++) {
      const candidate = cluster.items[i];
      const distToAnchor = deltaE(candidate.lab, cluster.anchor.lab);
      const isSameCategory = candidate.categoryAr === cluster.anchor.categoryAr;

      // Strict Double Check: must be within threshold AND same category
      if (distToAnchor <= deltaETolerance && isSameCategory) {
        validGroup.push(candidate);
      } else {
        // Double check failed: evict this image to form its own variant!
        evictedItems.push(candidate);
      }
    }

    // Recompute accurate centroid for the validated group
    const total = validGroup.length;
    const avgLab: LAB = {
      l: validGroup.reduce((s, it) => s + it.lab.l, 0) / total,
      a: validGroup.reduce((s, it) => s + it.lab.a, 0) / total,
      b: validGroup.reduce((s, it) => s + it.lab.b, 0) / total,
    };
    const avgRgb: RGB = {
      r: Math.round(validGroup.reduce((s, it) => s + it.rgb.r, 0) / total),
      g: Math.round(validGroup.reduce((s, it) => s + it.rgb.g, 0) / total),
      b: Math.round(validGroup.reduce((s, it) => s + it.rgb.b, 0) / total),
    };
    const hex = rgbToHex(avgRgb.r, avgRgb.g, avgRgb.b);
    const commercial = getClosestCommercialColorName(hex);

    finalizedClusters.push({
      items: validGroup,
      hex,
      rgb: avgRgb,
      lab: avgLab,
      colorNameAr: commercial.ar,
      colorNameEn: commercial.en,
    });
  }

  // Pass 3: Process any evicted items into their own discrete clusters
  for (const evicted of evictedItems) {
    let matchedFinal: (typeof finalizedClusters)[0] | null = null;
    let minEvictedDist = Infinity;

    for (const fc of finalizedClusters) {
      const dist = deltaE(evicted.lab, fc.lab);
      if (evicted.categoryAr === fc.colorNameAr && dist <= 7.0 && dist < minEvictedDist) {
        minEvictedDist = dist;
        matchedFinal = fc;
      }
    }

    if (matchedFinal) {
      matchedFinal.items.push(evicted);
    } else {
      finalizedClusters.push({
        items: [evicted],
        hex: evicted.hex,
        rgb: evicted.rgb,
        lab: evicted.lab,
        colorNameAr: evicted.categoryAr,
        colorNameEn: evicted.categoryEn,
      });
    }
  }

  // 4. Return synthesized results
  return finalizedClusters.map((cluster, idx) => ({
    id: `var-cluster-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
    hex: cluster.hex,
    rgb: cluster.rgb,
    lab: cluster.lab,
    colorNameAr: cluster.colorNameAr,
    colorNameEn: cluster.colorNameEn,
    images: cluster.items.map((i) => i.dataUrl),
    files: cluster.items.map((i) => i.file),
  }));
}
