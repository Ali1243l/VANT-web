/**
 * VANT Lookbook Types matching the Supabase Schema
 * File: src/types/catalog.ts
 */

export interface ProductMedia {
  id: string;
  product_id: string;
  media_url: string;
  media_type: 'image' | 'video';
  display_order: number;
}

export interface Product {
  id: string;
  title: string;
  title_ar?: string;
  description: string;
  description_ar?: string;
  price: number;
  category: 'All' | 'T-Shirts' | 'Hoodies' | 'Pants' | 'Outerwear' | 'Coming Soon';
  sizes: string[];
  colors: string[];
  colors_ar?: string[];
  fit_details?: string;
  fit_details_ar?: string;
  material?: string;
  material_ar?: string;
  is_exclusive_drop?: boolean;
  status?: 'AVAILABLE' | 'SOLD_OUT' | 'COMING_SOON';
  created_at: string;
  media: ProductMedia[];
  product_media?: { media_url: string }[];
}

export interface AppSettings {
  id?: number;
  splash_enabled: boolean;
  splash_media_url: string;
  parallax_enabled?: boolean;
  smart_header_enabled?: boolean;
  show_fit_guide?: boolean;
  show_material_info?: boolean;
  enable_whatsapp?: boolean;
  whatsapp_number?: string;
  enable_instagram?: boolean;
  instagram_handle?: string;
}

export type CategoryFilter = 'All' | 'T-Shirts' | 'Hoodies' | 'Pants' | 'Outerwear' | 'Coming Soon';
