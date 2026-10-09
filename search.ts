import type { Product } from '../types';

/**
 * Normalizes text for search by stripping Arabic diacritics, unifying
 * letter variants (Alef, Taa Marbuta, Alef Maksura), and lowercasing.
 */
export function normalizeSearchText(text?: string | null): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, '') // Remove Arabic tashkeel / accents
    .replace(/[أإآٱ]/g, 'ا') // Unify Alif variants
    .replace(/ة/g, 'ه') // Normalize Taa Marbuta
    .replace(/ى/g, 'ي') // Normalize Alif Maksura
    .trim();
}

/**
 * Checks if a product matches a search query across titles, descriptions,
 * categories, and tags in both English and Arabic.
 */
export function productMatchesQuery(product: Product, query: string): boolean {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return true;

  const terms = normalizedQuery.split(/\s+/).filter(Boolean);

  const searchableText = normalizeSearchText(
    [
      product.title,
      product.title_ar,
      product.category,
      product.category_ar,
      product.description,
      product.description_ar,
      ...(product.tags || []),
    ]
      .filter(Boolean)
      .join(' ')
  );

  return terms.every((term) => searchableText.includes(term));
}
