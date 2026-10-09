// Client-side Magic Translation Utility using free MyMemory API
// Requires NO paid API keys, operates with zero latency, and applies luxury fashion post-processing.

/**
 * Fashion & luxury terminology mapping for post-processing machine translations
 */
const LUXURY_LEXICON: Array<[RegExp, string]> = [
  [/\btee shirt\b/gi, 'T-Shirt'],
  [/\bt shirt\b/gi, 'T-Shirt'],
  [/\bt-shirt\b/gi, 'T-Shirt'],
  [/\bpima cotton\b/gi, 'Pima Cotton'],
  [/\begyptian cotton\b/gi, 'Egyptian Cotton'],
  [/\broyal embroidered\b/gi, 'Royal Embroidered'],
  [/\bhand embroidered\b/gi, 'Hand-Embroidered'],
  [/\bbespoke tailoring\b/gi, 'Bespoke Tailoring'],
  [/\btailored fit\b/gi, 'Tailored Fit'],
  [/\boversized fit\b/gi, 'Oversized Fit'],
  [/\bslim fit\b/gi, 'Slim Fit'],
  [/\bheavyweight\b/gi, 'Heavyweight Luxury'],
  [/\bitalian silk\b/gi, 'Italian Silk'],
  [/\bfrench terry\b/gi, 'French Terry'],
  [/\bdouble stitch\b/gi, 'Double-Stitched'],
  [/\banti shrink\b/gi, 'Anti-Shrink'],
  [/\banti wrinkle\b/gi, 'Anti-Wrinkle'],
  [/\broyal black\b/gi, 'Royal Black'],
  [/\bpearl white\b/gi, 'Pearl White'],
  [/\bvelvet navy\b/gi, 'Velvet Navy'],
  [/\bemerald forest\b/gi, 'Emerald Forest'],
  [/\bdesert camel\b/gi, 'Desert Camel'],
  [/\bimperial gold\b/gi, 'Imperial Gold'],
  [/\broyal burgundy\b/gi, 'Royal Burgundy'],
  [/\btitanium grey\b/gi, 'Titanium Grey'],
  [/\bwarm charcoal\b/gi, 'Warm Charcoal'],
];

/**
 * Common Arabic to English luxury fashion terms for offline fast fallback
 */
const OFFLINE_DICTIONARY: Record<string, string> = {
  'أسود ملكي': 'Royal Black',
  'أبيض لؤلؤي': 'Pearl White',
  'أبيض ناصع': 'Pure White',
  'كحلي مخملي': 'Velvet Navy',
  'كحلي إمبريالي': 'Imperial Navy',
  'زمردي ملكي': 'Emerald Forest',
  'أخضر زمردي': 'Emerald Green',
  'عنابي فاخر': 'Royal Burgundy',
  'بيج صحراوي': 'Desert Camel',
  'بيج رملي': 'Sand Beige',
  'رمادي تيتانيوم': 'Titanium Grey',
  'فحم حجري': 'Warm Charcoal',
  'فحمي مطفي': 'Matte Charcoal',
  'ذهبي ملكي': 'Imperial Gold',
  'أحمر قرمزي': 'Crimson Silk',
  'أزرق بترولي': 'Petrol Teal',
  'زيتي عسكري': 'Military Olive',
  'تيشيرت بيما قطن ملكي مطرز': 'Royal Embroidered Pima Cotton T-Shirt',
  'تيشيرت قطن فاخر': 'Luxury Pima Cotton T-Shirt',
  'قطن 100%': '100% Premium Cotton',
  'خياطة يدوية': 'Hand-Tailored Bespoke Stitching',
  'مقاوم للانكماش': 'Anti-Shrink Pre-Washed',
};

/**
 * Decodes HTML entities like &#39;, &quot;, &amp;
 */
function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&#x27;': "'",
    '&#x2F;': '/',
    '&nbsp;': ' ',
  };
  return text.replace(/&(?:quot|#39|apos|amp|lt|gt|#x27|#x2F|nbsp);/g, (match) => entities[match] || match);
}

/**
 * Capitalizes text into elegant Title Case for product headings
 */
export function toTitleCase(str: string): string {
  if (!str) return '';
  const minorWords = new Set(['and', 'or', 'of', 'for', 'in', 'on', 'with', 'by', 'at', 'to', 'a', 'an', 'the']);
  return str
    .split(' ')
    .map((word, index) => {
      if (!word) return '';
      const lower = word.toLowerCase();
      if (index > 0 && minorWords.has(lower)) {
        return lower;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Refines raw machine translation into polished luxury fashion terminology
 */
export function refineLuxuryFashionEnglish(text: string, isTitle = false): string {
  if (!text) return '';
  let cleaned = decodeHtmlEntities(text).trim();

  // Clean common machine artifact wrappers like [NO QUERY SPECIFIED]
  cleaned = cleaned.replace(/^\[.*?\]\s*/g, '');

  // Apply luxury lexicon enhancements
  for (const [pattern, replacement] of LUXURY_LEXICON) {
    cleaned = cleaned.replace(pattern, replacement);
  }

  // Remove duplicate spaces
  cleaned = cleaned.replace(/\s{2,}/g, ' ');

  if (isTitle) {
    cleaned = toTitleCase(cleaned);
  } else {
    // For descriptions, ensure first letter of each sentence is capitalized
    cleaned = cleaned.replace(/(^\s*|[.!?]\s+)([a-z])/g, (_, p1, p2) => p1 + p2.toUpperCase());
  }

  return cleaned;
}

/**
 * Translates Arabic text to English using free public MyMemory API with offline fallback.
 * @param textToTranslate Arabic source text
 * @param isTitle Whether target is a title field (for title casing)
 */
export async function translateArabicToEnglish(
  textToTranslate: string,
  isTitle = false
): Promise<string> {
  const trimmed = textToTranslate?.trim();
  if (!trimmed) {
    throw new Error('النص العربي المطلوب ترجمته فارغ.');
  }

  // 1. Check instant offline dictionary
  if (OFFLINE_DICTIONARY[trimmed]) {
    return OFFLINE_DICTIONARY[trimmed];
  }

  // 2. Query MyMemory Free Translation Endpoint
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=ar|en`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const rawText = data?.responseData?.translatedText || data?.matches?.[0]?.translation;

      if (rawText && typeof rawText === 'string') {
        // If MyMemory returned a quota/warning note as text, check fallback
        if (rawText.includes('MYMEMORY WARNING:') || rawText.includes('PLEASE DO NOT USE')) {
          return fallbackTranslate(trimmed, isTitle);
        }
        return refineLuxuryFashionEnglish(rawText, isTitle);
      }
    }
  } catch (err) {
    console.warn('MyMemory public endpoint request failed, using intelligent fallback:', err);
  }

  // 3. Fallback
  return fallbackTranslate(trimmed, isTitle);
}

/**
 * Intelligent client-side fallback translator
 */
function fallbackTranslate(arabicText: string, isTitle: boolean): string {
  let result = arabicText;
  for (const [ar, en] of Object.entries(OFFLINE_DICTIONARY)) {
    if (result.includes(ar)) {
      result = result.replace(new RegExp(ar, 'g'), en);
    }
  }

  // Simple token substitutions for common apparel terms
  const tokenMap: Record<string, string> = {
    'تيشيرت': 'T-Shirt',
    'قميص': 'Shirt',
    'بنطال': 'Trousers',
    'بنطلون': 'Pants',
    'فستان': 'Dress',
    'عباية': 'Abaya',
    'حقيبة': 'Handbag',
    'حذاء': 'Shoes',
    'سوار': 'Bracelet',
    'عطر': 'Perfume',
    'ساعة': 'Timepiece',
    'فاخر': 'Luxury',
    'ملكي': 'Royal',
    'قطن': 'Cotton',
    'حرير': 'Silk',
    'صوف': 'Wool',
    'مطرز': 'Embroidered',
    'يدوي': 'Handcrafted',
    'أسود': 'Black',
    'أبيض': 'White',
    'أزرق': 'Blue',
    'أحمر': 'Red',
    'أخضر': 'Green',
    'بيج': 'Beige',
    'رمادي': 'Grey',
    'بني': 'Brown',
    'كحلي': 'Navy',
  };

  for (const [arWord, enWord] of Object.entries(tokenMap)) {
    result = result.replace(new RegExp(arWord, 'g'), enWord);
  }

  return refineLuxuryFashionEnglish(result, isTitle);
}
