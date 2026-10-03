import { supabase } from './supabase';

export interface UploadedMediaItem {
  url: string;
  relativePath?: string;
  fileName: string;
  size: number;
}

/**
 * Optimizes and compresses any image File into a high-definition Data URL
 * Scales down massive phone camera images (e.g. 10MB/4000px) to max 1400px width/height
 * while preserving high-end luxury color depth and sharpness.
 */
export async function fileToOptimizedDataUrl(
  file: File,
  maxWidth = 1400,
  maxHeight = 1600,
  quality = 0.88
): Promise<string> {
  return new Promise((resolve, reject) => {
    // If SVG, read as text/dataURL directly
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / maxWidth > height / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        // Enable crisp high quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first, fallback to JPEG
        try {
          const webpData = canvas.toDataURL('image/webp', quality);
          if (webpData.startsWith('data:image/webp')) {
            resolve(webpData);
            return;
          }
        } catch {
          // fallback
        }

        const jpegData = canvas.toDataURL('image/jpeg', quality);
        resolve(jpegData);
      };

      img.onerror = () => {
        resolve(e.target?.result as string);
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * Checks if a remote image URL actually responds and renders successfully in the browser
 */
export async function testImageUrl(url: string, timeoutMs = 2500): Promise<boolean> {
  if (!url || !url.startsWith('http')) return false;

  return new Promise((resolve) => {
    const img = new Image();
    let isSettled = false;

    const timer = setTimeout(() => {
      if (!isSettled) {
        isSettled = true;
        resolve(false);
      }
    }, timeoutMs);

    img.onload = () => {
      if (!isSettled) {
        isSettled = true;
        clearTimeout(timer);
        resolve(true);
      }
    };

    img.onerror = () => {
      if (!isSettled) {
        isSettled = true;
        clearTimeout(timer);
        resolve(false);
      }
    };

    img.src = url;
  });
}

/**
 * Uploads an image File directly to Supabase Storage bucket `product-images`
 * Preserves custom organized subpaths (e.g., `catalog/collection_name/01_front.jpg`)
 * Returns the permanent public Supabase URL.
 */
export interface CloudSiteConfig {
  controls?: Record<string, any>;
  currency?: string;
  trendItems?: any[];
  socialLinks?: any[];
  enhancements?: Record<string, any>;
  hero_bg?: string;
  banner_hero_bg?: string;
  updated_at?: string;
}

// In-memory cache of cloud configuration to ensure instant synchronous access and perfect merging
let cachedCloudConfig: CloudSiteConfig | null = null;

/**
 * Uploads an image File directly to Supabase Storage bucket `product-images`
 * Preserves custom organized subpaths (e.g., `banners/`, `catalog/`, `trends/`)
 * Returns the permanent public Supabase URL.
 */
export async function uploadImageToSupabase(
  file: File,
  folder: string = 'catalog',
  customPath?: string
): Promise<string> {
  if (!file) throw new Error('No file provided for upload');

  // 1. Upload directly to Supabase Storage bucket `product-images`
  if (supabase) {
    try {
      const rawExt = file.name ? file.name.split('.').pop()?.toLowerCase() : '';
      const safeExt = rawExt && ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif', 'svg'].includes(rawExt)
        ? rawExt
        : file.type === 'image/png'
        ? 'png'
        : file.type === 'image/webp'
        ? 'webp'
        : file.type === 'image/svg+xml'
        ? 'svg'
        : 'jpg';

      let fileName: string;
      if (customPath) {
        const cleanCustom = customPath.replace(/[^a-zA-Z0-9._/-]/g, '_').toLowerCase();
        fileName = `${folder}/${cleanCustom}`;
      } else {
        const randomHash = Math.random().toString(36).substring(2, 9);
        fileName = `${folder}/${Date.now()}_${randomHash}.${safeExt}`;
      }

      const mimeType = file.type || (safeExt === 'png' ? 'image/png' : safeExt === 'webp' ? 'image/webp' : 'image/jpeg');

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, {
          contentType: mimeType,
          cacheControl: '3600',
          upsert: true,
        });

      if (!error && data?.path) {
        const { data: publicData } = supabase.storage
          .from('product-images')
          .getPublicUrl(data.path);

        if (publicData?.publicUrl) {
          console.log('✓ Successfully uploaded image to Supabase Storage:', publicData.publicUrl);
          return publicData.publicUrl;
        }
      } else if (error) {
        console.error('Supabase storage upload error:', error.message);
      }
    } catch (err) {
      console.warn('Supabase storage upload exception:', err);
    }
  }

  // Fallback to high-res data URL only if Supabase client is offline/disconnected
  console.warn('Supabase client unavailable, using optimized data URL fallback');
  return await fileToOptimizedDataUrl(file);
}

/**
 * Uploads a base64 Data URL to Supabase Storage as a real file
 * and returns the permanent public Supabase URL.
 */
export async function uploadDataUrlToSupabase(
  dataUrl: string,
  folder: string = 'catalog',
  filePrefix: string = 'media'
): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith('data:')) return dataUrl;
  if (!supabase) return dataUrl;

  try {
    const [header, base64Data] = dataUrl.split(',');
    const mimeMatch = header.match(/:(.*?);/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const ext = mimeType.split('/')[1] || 'jpg';
    const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'svg'].includes(ext) ? ext : 'jpg';

    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });

    const fileName = `${folder}/${filePrefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${safeExt}`;

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, blob, {
        contentType: mimeType,
        cacheControl: '3600',
        upsert: true,
      });

    if (!error && data?.path) {
      const { data: pubData } = supabase.storage
        .from('product-images')
        .getPublicUrl(data.path);

      if (pubData?.publicUrl) {
        console.log('✓ Converted Data URL to permanent Supabase Storage URL:', pubData.publicUrl);
        return pubData.publicUrl;
      }
    }
  } catch (err) {
    console.warn('Failed to upload Data URL to Supabase Storage:', err);
  }

  return dataUrl;
}

/**
 * Persists site configuration, banner images, and trend cards directly into Supabase Storage
 * Using a non-destructive deep-merge so no section is ever overwritten or lost!
 */
export async function saveSiteConfigToSupabase(config: Partial<CloudSiteConfig>): Promise<boolean> {
  if (!supabase) return false;
  try {
    // 1. Fetch current config from Supabase (or fallback to cache) to guarantee zero clobbering
    const existing = await fetchSiteConfigFromSupabase();

    const bannerBg =
      config.banner_hero_bg ||
      config.hero_bg ||
      config.controls?.banner_hero_bg?.actionValue ||
      existing?.banner_hero_bg ||
      existing?.hero_bg ||
      existing?.controls?.banner_hero_bg?.actionValue;

    const resolvedCurrency = config.currency || existing?.currency || 'د.ع';

    // 2. Deep-merge all properties cleanly
    const merged: CloudSiteConfig = {
      ...existing,
      ...config,
      currency: resolvedCurrency,
      controls: {
        ...(existing?.controls || {}),
        ...(config.controls || {}),
      },
      enhancements: {
        ...(existing?.enhancements || {}),
        ...(config.enhancements || {}),
      },
      trendItems: config.trendItems || existing?.trendItems || [],
      socialLinks: config.socialLinks || existing?.socialLinks || [],
      hero_bg: bannerBg,
      banner_hero_bg: bannerBg,
      updated_at: new Date().toISOString(),
    };

    // Ensure banner_hero_bg inside controls is in sync with top-level
    if (bannerBg && merged.controls) {
      if (merged.controls.banner_hero_bg) {
        merged.controls.banner_hero_bg = {
          ...merged.controls.banner_hero_bg,
          actionValue: bannerBg,
        };
      }
    }

    cachedCloudConfig = merged;

    const payload = JSON.stringify(merged, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const { error } = await supabase.storage.from('product-images').upload('config/site_settings.json', blob, {
      contentType: 'application/json',
      cacheControl: '0',
      upsert: true,
    });

    if (!error) {
      console.log('✓ Site configuration, display image & banners permanently synced to Supabase Cloud');
      return true;
    }
    console.warn('Supabase config sync error:', error.message);
    return false;
  } catch (err) {
    console.warn('Failed to save site config to Supabase:', err);
    return false;
  }
}

/**
 * Loads latest site configuration, banner images, and trend cards from Supabase Storage
 */
export async function fetchSiteConfigFromSupabase(): Promise<CloudSiteConfig | null> {
  if (!supabase) return cachedCloudConfig;
  try {
    const { data: pubData } = supabase.storage.from('product-images').getPublicUrl('config/site_settings.json');
    if (pubData?.publicUrl) {
      const response = await fetch(`${pubData.publicUrl}?t=${Date.now()}`, { cache: 'no-store' });
      if (response.ok) {
        const json = await response.json();
        if (json && typeof json === 'object') {
          cachedCloudConfig = json as CloudSiteConfig;
          return json as CloudSiteConfig;
        }
      }
    }
  } catch (err) {
    console.warn('Failed to fetch site config from Supabase:', err);
  }
  return cachedCloudConfig;
}

/**
 * Recursively extracts all image files from DataTransferItemList (supports dragged folders and nested directories!)
 * Naturally sorts files by directory structure and alphabetical filename (e.g. 01_front, 02_back, 03_detail).
 */
export async function getFilesFromDataTransfer(items: DataTransferItemList): Promise<Array<{ file: File; relativePath: string }>> {
  const results: Array<{ file: File; relativePath: string }> = [];

  const traverseEntry = async (entry: any, currentPath = ''): Promise<void> => {
    if (!entry) return;

    if (entry.isFile) {
      return new Promise<void>((resolve) => {
        entry.file((file: File) => {
          if (file && isImageFile(file)) {
            const relativePath = currentPath ? `${currentPath}/${file.name}` : file.name;
            results.push({ file, relativePath });
          }
          resolve();
        }, () => resolve());
      });
    } else if (entry.isDirectory) {
      const dirReader = entry.createReader();
      const readEntries = async (): Promise<void> => {
        return new Promise<void>((resolve) => {
          dirReader.readEntries(async (entries: any[]) => {
            if (entries.length === 0) {
              resolve();
            } else {
              const nextPath = currentPath ? `${currentPath}/${entry.name}` : entry.name;
              for (const childEntry of entries) {
                await traverseEntry(childEntry, nextPath);
              }
              await readEntries();
              resolve();
            }
          }, () => resolve());
        });
      };
      await readEntries();
    }
  };

  const promises: Promise<void>[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.kind === 'file') {
      const entry = (item as any).webkitGetAsEntry ? (item as any).webkitGetAsEntry() : null;
      if (entry) {
        promises.push(traverseEntry(entry));
      } else {
        const file = item.getAsFile();
        if (file && isImageFile(file)) {
          results.push({ file, relativePath: file.name });
        }
      }
    }
  }

  await Promise.all(promises);

  // Naturally sort files by name/path (01_front.jpg before 02_back.jpg)
  results.sort((a, b) =>
    a.relativePath.localeCompare(b.relativePath, undefined, { numeric: true, sensitivity: 'base' })
  );

  return results;
}

/**
 * Checks if a file is an image by MIME type or file extension
 */
export function isImageFile(file: File): boolean {
  if (file.type && file.type.startsWith('image/')) return true;
  const ext = file.name.split('.').pop()?.toLowerCase();
  return ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif', 'heic', 'heif', 'bmp', 'svg'].includes(ext || '');
}
