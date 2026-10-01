/**
 * Supabase Client Initialization & Real CRUD Operations
 * Path: src/lib/supabase.ts
 */

import { createClient } from '@supabase/supabase-js';
import { Product, ProductMedia, AppSettings } from '../types/catalog';
import { INITIAL_PRODUCTS } from './mockData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
      supabaseUrl !== 'https://your-project.supabase.co' &&
      supabaseAnonKey &&
      supabaseAnonKey !== 'your-anon-public-key'
  );
};

// Initialize the real client or a fallback placeholder client
export const supabase = createClient(
  isSupabaseConfigured() ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured() ? supabaseAnonKey : 'placeholder-anon-key'
);

/**
 * Format raw Supabase data into the frontend Product interface
 */
export function formatSupabaseProduct(item: any): Product {
  const mediaSource = item.product_media || item.media || [];
  const mediaList: ProductMedia[] = (Array.isArray(mediaSource) ? mediaSource : [])
    .map((m: any, idx: number) => ({
      id: m.id || `media-${item.id}-${idx}`,
      product_id: m.product_id || item.id,
      media_url: typeof m === 'string' ? m : m.media_url,
      media_type: m.media_type || 'image',
      display_order: m.display_order ?? idx,
    }))
    .filter((m: any) => typeof m.media_url === 'string' && m.media_url.trim().length > 0);

  // If no items in product_media, check if direct image column exists on the product row
  if (mediaList.length === 0) {
    const directUrl = item.image_url || item.media_url || item.image || item.thumbnail;
    if (directUrl && typeof directUrl === 'string' && directUrl.trim().length > 0) {
      mediaList.push({
        id: `media-direct-${item.id}`,
        product_id: item.id,
        media_url: directUrl.trim(),
        media_type: 'image',
        display_order: 0,
      });
    }
  }

  mediaList.sort((a, b) => a.display_order - b.display_order);

  return {
    id: item.id,
    title: item.title,
    title_ar: item.title_ar,
    description: item.description || '',
    description_ar: item.description_ar,
    price: Number(item.price),
    category: item.category || 'T-Shirts',
    sizes: Array.isArray(item.sizes) ? item.sizes : ['S', 'M', 'L', 'XL'],
    colors: Array.isArray(item.colors) ? item.colors : ['Black'],
    colors_ar: Array.isArray(item.colors_ar) ? item.colors_ar : undefined,
    fit_details: item.fit_details,
    fit_details_ar: item.fit_details_ar,
    material: item.material,
    material_ar: item.material_ar,
    is_exclusive_drop: Boolean(item.is_exclusive_drop),
    status: item.status || 'AVAILABLE',
    created_at: item.created_at || new Date().toISOString(),
    media: mediaList,
    product_media: mediaList.map((m) => ({ media_url: m.media_url })),
  };
}

/**
 * Fetch all products for the public Lookbook.
 * Falls back to INITIAL_PRODUCTS only if database query fails or is empty.
 */
export async function fetchCatalogProducts(): Promise<{ products: Product[]; isFromSupabase: boolean }> {
  if (!isSupabaseConfigured()) {
    return { products: INITIAL_PRODUCTS, isFromSupabase: false };
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_media(media_url)')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      // Fallback try with *
      const fallback = await supabase
        .from('products')
        .select('*, product_media(*)')
        .order('created_at', { ascending: false });

      if (fallback.error || !fallback.data || fallback.data.length === 0) {
        return { products: INITIAL_PRODUCTS, isFromSupabase: false };
      }
      return { products: fallback.data.map(formatSupabaseProduct), isFromSupabase: true };
    }

    return { products: data.map(formatSupabaseProduct), isFromSupabase: true };
  } catch (err) {
    console.error('Unexpected error fetching from Supabase:', err);
    return { products: INITIAL_PRODUCTS, isFromSupabase: false };
  }
}

/**
 * Real Supabase Fetch for the Admin Panel (Strictly from Database, joins product_media)
 */
export async function fetchAdminProducts(): Promise<{ products: Product[]; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return {
      products: [],
      error: 'Supabase URL or Key not configured. Please check your environment variables.',
    };
  }

  try {
    // Explicitly join product_media(media_url) as requested in Phase 10
    const { data, error } = await supabase
      .from('products')
      .select('*, product_media(media_url)')
      .order('created_at', { ascending: false });

    if (error) {
      // Fallback in case PostgREST schema cache needs product_media(*)
      const fallback = await supabase
        .from('products')
        .select('*, product_media(*)')
        .order('created_at', { ascending: false });

      if (fallback.error) {
        return { products: [], error: error.message };
      }
      return { products: (fallback.data || []).map(formatSupabaseProduct), error: null };
    }

    const formatted = (data || []).map(formatSupabaseProduct);
    return { products: formatted, error: null };
  } catch (err: any) {
    return { products: [], error: err.message || 'Failed to fetch products from Supabase.' };
  }
}

/**
 * Real Supabase Delete Product by ID (cleans up media and storage files)
 */
export async function deleteProductFromDb(productId: string): Promise<{ success: boolean; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase is not configured.' };
  }

  try {
    // 1. Fetch media URLs to delete from Supabase Storage 'product-images' bucket
    const { data: mediaItems } = await supabase
      .from('product_media')
      .select('media_url')
      .eq('product_id', productId);

    if (mediaItems && mediaItems.length > 0) {
      const pathsToDelete: string[] = [];
      for (const item of mediaItems) {
        if (item.media_url && typeof item.media_url === 'string') {
          const parts = item.media_url.split('/product-images/');
          if (parts.length > 1) {
            pathsToDelete.push(decodeURIComponent(parts[1]));
          }
        }
      }
      if (pathsToDelete.length > 0) {
        try {
          await supabase.storage.from('product-images').remove(pathsToDelete);
        } catch (storageErr) {
          console.warn('Storage cleanup warning:', storageErr);
        }
      }
    }

    // 2. Delete product_media records
    await supabase.from('product_media').delete().eq('product_id', productId);

    // 3. Delete product record from products table
    const { error } = await supabase.from('products').delete().eq('id', productId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete product.' };
  }
}

/**
 * Update an existing product in Supabase
 */
export async function updateProductInDb(
  productId: string,
  updatedData: Partial<{
    title: string;
    title_ar: string;
    category: string;
    price: number;
    sizes: string[];
    colors: string[];
    description: string;
    fit_details: string;
    material: string;
    is_exclusive_drop: boolean;
    status: 'AVAILABLE' | 'SOLD_OUT' | 'COMING_SOON';
  }>,
  newMediaUrls?: string[]
): Promise<{ success: boolean; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase is not configured.' };
  }

  try {
    const { error } = await supabase
      .from('products')
      .update(updatedData)
      .eq('id', productId);

    if (error) {
      return { success: false, error: error.message };
    }

    if (newMediaUrls && newMediaUrls.length > 0) {
      const mediaRecords = newMediaUrls.map((url, index) => ({
        product_id: productId,
        media_url: url,
        display_order: index + 1,
      }));
      await supabase.from('product_media').insert(mediaRecords);
    }

    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update product.' };
  }
}

export const SQL_RLS_FIX_SCRIPT = `-- Fix Row Level Security (RLS) in Supabase SQL Editor:
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert for products" ON public.products FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow update for products" ON public.products FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete for products" ON public.products FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "Allow insert for product media" ON public.product_media FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow update for product media" ON public.product_media FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete for product media" ON public.product_media FOR DELETE TO anon, authenticated USING (true);`;

export function isRlsPolicyError(errMessage: string | null | undefined): boolean {
  if (!errMessage) return false;
  const lower = errMessage.toLowerCase();
  return lower.includes('row-level security') || lower.includes('rls') || lower.includes('violates row-level');
}

/**
 * Real Supabase Insert Product into \`products\` and \`product_media\`
 */
export async function insertProductToDb(
  productData: {
    title: string;
    title_ar?: string;
    category: string;
    price: number;
    sizes: string[];
    colors: string[];
    colors_ar?: string[];
    description?: string;
    description_ar?: string;
    fit_details?: string;
    fit_details_ar?: string;
    material?: string;
    material_ar?: string;
    is_exclusive_drop?: boolean;
    status?: 'AVAILABLE' | 'SOLD_OUT' | 'COMING_SOON';
  },
  mediaInput: string | string[]
): Promise<{ success: boolean; data: any; error: string | null; isRlsError?: boolean }> {
  if (!isSupabaseConfigured()) {
    return { success: false, data: null, error: 'Supabase is not configured.' };
  }

  try {
    // 1. Insert into products
    const { data: insertedProduct, error: prodError } = await supabase
      .from('products')
      .insert([
        {
          title: productData.title,
          category: productData.category,
          price: productData.price,
          sizes: productData.sizes,
          colors: productData.colors,
          description: productData.description || null,
          fit_details: productData.fit_details || null,
          material: productData.material || null,
          is_exclusive_drop: Boolean(productData.is_exclusive_drop),
          status: productData.status || 'AVAILABLE',
        },
      ])
      .select()
      .single();

    if (prodError || !insertedProduct) {
      const errorMsg = prodError?.message || 'Error creating product record.';
      const isRls = isRlsPolicyError(errorMsg);
      return {
        success: false,
        data: null,
        error: isRls
          ? "Row-Level Security (RLS) Policy Error: Please run the SQL fix script from 'supabase/fix_rls.sql' in Supabase SQL Editor to allow product additions."
          : errorMsg,
        isRlsError: isRls,
      };
    }

    // 2. Insert all media URLs into product_media
    const urls: string[] = Array.isArray(mediaInput)
      ? mediaInput.filter((u) => typeof u === 'string' && u.trim().length > 0)
      : [mediaInput].filter((u) => typeof u === 'string' && u.trim().length > 0);

    if (urls.length > 0) {
      const mediaRecords = urls.map((url, idx) => ({
        product_id: insertedProduct.id,
        media_url: url,
        display_order: idx + 1,
      }));

      const { error: mediaError } = await supabase.from('product_media').insert(mediaRecords);

      if (mediaError) {
        console.error('Step D Error: Failed to insert media record into product_media:', mediaError);
        return {
          success: false,
          data: insertedProduct,
          error: `Product created, but failed to insert into product_media: ${mediaError.message}`,
          isRlsError: isRlsPolicyError(mediaError.message),
        };
      }
    }

    return { success: true, data: insertedProduct, error: null };
  } catch (err: any) {
    const errorMsg = err.message || 'Failed to insert product.';
    return {
      success: false,
      data: null,
      error: errorMsg,
      isRlsError: isRlsPolicyError(errorMsg),
    };
  }
}

/**
 * Upload Image/Video file to Supabase Storage 'product-images' bucket
 * Returns the generated public URL.
 */
export async function uploadMediaToStorage(file: File): Promise<{ publicUrl: string | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    // Local development/preview fallback using Object URL
    const localUrl = URL.createObjectURL(file);
    return { publicUrl: localUrl, error: null };
  }

  try {
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `drops/${cleanFileName}`;

    const { data, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      return { publicUrl: null, error: uploadError.message };
    }

    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return { publicUrl: urlData.publicUrl, error: null };
  } catch (err: any) {
    return { publicUrl: null, error: err.message || 'Failed to upload media to Supabase storage.' };
  }
}

/**
 * Upload multiple media files in sequence to Supabase Storage
 */
export async function uploadMultipleMediaToStorage(files: File[]): Promise<{ publicUrls: string[]; errors: string[] }> {
  const publicUrls: string[] = [];
  const errors: string[] = [];

  for (const file of files) {
    const { publicUrl, error } = await uploadMediaToStorage(file);
    if (error || !publicUrl) {
      errors.push(error || `Failed to upload ${file.name}`);
    } else {
      publicUrls.push(publicUrl);
    }
  }

  return { publicUrls, errors };
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  id: 1,
  splash_enabled: true,
  splash_media_url: '',
  parallax_enabled: true,
  smart_header_enabled: true,
  show_fit_guide: true,
  show_material_info: true,
  enable_whatsapp: true,
  whatsapp_number: '+9647700000000',
  enable_instagram: true,
  instagram_handle: 'vant.streetwear',
};

/**
 * Fetch global app settings (specifically id=1, splash, feed UX, and CTA conversion settings)
 */
export async function fetchAppSettings(): Promise<AppSettings> {
  let fallbackSettings = { ...DEFAULT_APP_SETTINGS };
  try {
    const localStored = localStorage.getItem('vant_app_settings');
    if (localStored) {
      fallbackSettings = { ...DEFAULT_APP_SETTINGS, ...JSON.parse(localStored) };
    }
  } catch (e) {
    // Ignore JSON parse errors in localStorage
  }

  if (!isSupabaseConfigured()) {
    return fallbackSettings;
  }

  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error || !data) {
      // In case row with id=1 does not exist yet in Supabase, create it
      if (error && (error.code === 'PGRST116' || error.message.includes('0 rows'))) {
        try {
          const { data: insertedData } = await supabase
            .from('app_settings')
            .insert([{
              id: 1,
              splash_enabled: true,
              splash_media_url: '',
              parallax_enabled: true,
              smart_header_enabled: true,
              show_fit_guide: true,
              show_material_info: true,
              enable_whatsapp: true,
              whatsapp_number: '+9647700000000',
              enable_instagram: true,
              instagram_handle: 'vant.streetwear',
            }])
            .select()
            .single();

          if (insertedData) {
            const newSettings: AppSettings = {
              id: 1,
              splash_enabled: Boolean(insertedData.splash_enabled),
              splash_media_url: insertedData.splash_media_url || '',
              parallax_enabled: insertedData.parallax_enabled !== false,
              smart_header_enabled: insertedData.smart_header_enabled !== false,
              show_fit_guide: insertedData.show_fit_guide !== false,
              show_material_info: insertedData.show_material_info !== false,
              enable_whatsapp: insertedData.enable_whatsapp !== false,
              whatsapp_number: insertedData.whatsapp_number || '+9647700000000',
              enable_instagram: insertedData.enable_instagram !== false,
              instagram_handle: insertedData.instagram_handle || 'vant.streetwear',
            };
            localStorage.setItem('vant_app_settings', JSON.stringify(newSettings));
            return newSettings;
          }
        } catch (insertErr) {
          console.warn('Could not auto-insert default app_settings row:', insertErr);
        }
      }
      return fallbackSettings;
    }

    const settings: AppSettings = {
      id: data.id ?? 1,
      splash_enabled: Boolean(data.splash_enabled),
      splash_media_url: data.splash_media_url || '',
      parallax_enabled: data.parallax_enabled !== undefined ? Boolean(data.parallax_enabled) : true,
      smart_header_enabled: data.smart_header_enabled !== undefined ? Boolean(data.smart_header_enabled) : true,
      show_fit_guide: data.show_fit_guide !== undefined ? Boolean(data.show_fit_guide) : true,
      show_material_info: data.show_material_info !== undefined ? Boolean(data.show_material_info) : true,
      enable_whatsapp: data.enable_whatsapp !== undefined ? Boolean(data.enable_whatsapp) : true,
      whatsapp_number: data.whatsapp_number !== undefined ? data.whatsapp_number : '+9647700000000',
      enable_instagram: data.enable_instagram !== undefined ? Boolean(data.enable_instagram) : true,
      instagram_handle: data.instagram_handle !== undefined ? data.instagram_handle : 'vant.streetwear',
    };
    localStorage.setItem('vant_app_settings', JSON.stringify(settings));
    return settings;
  } catch (err) {
    console.error('Error fetching app settings:', err);
    return fallbackSettings;
  }
}

/**
 * Update app settings in Supabase where id=1 (or local fallback)
 */
export async function updateAppSettingsInDb(
  newSettings: Partial<AppSettings>
): Promise<{ success: boolean; data: AppSettings | null; error: string | null }> {
  const current = await fetchAppSettings();
  const updated: AppSettings = {
    ...current,
    ...newSettings,
    id: 1,
  };
  localStorage.setItem('vant_app_settings', JSON.stringify(updated));

  if (!isSupabaseConfigured()) {
    return { success: true, data: updated, error: null };
  }

  try {
    const payload: any = {
      id: 1,
      splash_enabled: updated.splash_enabled,
      splash_media_url: updated.splash_media_url,
    };
    if (updated.parallax_enabled !== undefined) payload.parallax_enabled = updated.parallax_enabled;
    if (updated.smart_header_enabled !== undefined) payload.smart_header_enabled = updated.smart_header_enabled;
    if (updated.show_fit_guide !== undefined) payload.show_fit_guide = updated.show_fit_guide;
    if (updated.show_material_info !== undefined) payload.show_material_info = updated.show_material_info;
    if (updated.enable_whatsapp !== undefined) payload.enable_whatsapp = updated.enable_whatsapp;
    if (updated.whatsapp_number !== undefined) payload.whatsapp_number = updated.whatsapp_number;
    if (updated.enable_instagram !== undefined) payload.enable_instagram = updated.enable_instagram;
    if (updated.instagram_handle !== undefined) payload.instagram_handle = updated.instagram_handle;

    // Attempt upsert first
    const { data, error } = await supabase
      .from('app_settings')
      .upsert(payload)
      .select()
      .single();

    if (error) {
      // Fallback: standard update
      const { data: updateData, error: updateError } = await supabase
        .from('app_settings')
        .update(payload)
        .eq('id', 1)
        .select()
        .single();

      if (updateError) {
        return { success: false, data: null, error: updateError.message };
      }
      const finalSettings: AppSettings = {
        id: 1,
        splash_enabled: Boolean(updateData.splash_enabled),
        splash_media_url: updateData.splash_media_url || '',
        parallax_enabled: Boolean(updateData.parallax_enabled),
        smart_header_enabled: Boolean(updateData.smart_header_enabled),
        show_fit_guide: Boolean(updateData.show_fit_guide),
        show_material_info: Boolean(updateData.show_material_info),
        enable_whatsapp: Boolean(updateData.enable_whatsapp),
        whatsapp_number: updateData.whatsapp_number || '',
        enable_instagram: Boolean(updateData.enable_instagram),
        instagram_handle: updateData.instagram_handle || '',
      };
      return { success: true, data: finalSettings, error: null };
    }

    const finalSettings: AppSettings = {
      id: 1,
      splash_enabled: Boolean(data.splash_enabled),
      splash_media_url: data.splash_media_url || '',
      parallax_enabled: Boolean(data.parallax_enabled),
      smart_header_enabled: Boolean(data.smart_header_enabled),
      show_fit_guide: Boolean(data.show_fit_guide),
      show_material_info: Boolean(data.show_material_info),
      enable_whatsapp: Boolean(data.enable_whatsapp),
      whatsapp_number: data.whatsapp_number || '',
      enable_instagram: Boolean(data.enable_instagram),
      instagram_handle: data.instagram_handle || '',
    };
    return { success: true, data: finalSettings, error: null };
  } catch (err: any) {
    return { success: false, data: null, error: err.message || 'Failed to update app settings.' };
  }
}

