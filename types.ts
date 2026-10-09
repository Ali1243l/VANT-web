export const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;
export type Size = typeof ALL_SIZES[number];

export type ProductAvailability = 'in_stock' | 'sold_out' | 'coming_soon' | 'limited';

export interface Product {
  id: string | number;
  title: string;
  title_ar?: string;
  price: number;
  currency?: string;
  image_url: string;
  images?: string[];
  category: string;
  category_ar?: string;
  sizes: string[];
  width?: number | null;
  height?: number | null;
  description?: string;
  description_ar?: string;
  material?: string;
  fit_details?: string;
  colors?: string[];
  tags?: string[];
  created_at?: string;
  availability?: ProductAvailability;
  aspect_ratio?: string;
  is_offer?: boolean;
  original_price?: number;
  offer_badge_ar?: string;
  offer_badge_en?: string;
  sku?: string;
  variants?: any[];
}

export type Language = 'en' | 'ar';
export type Theme = 'light' | 'dark';

export interface TrendItem {
  id: string;
  category: string;
  titleEn: string;
  titleAr: string;
  subtitleEn: string;
  subtitleAr: string;
  tagEn: string;
  tagAr: string;
  image: string;
}
