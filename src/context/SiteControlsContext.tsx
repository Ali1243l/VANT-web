import React, { createContext, useContext, useState, useEffect, type ReactNode, useCallback, useRef } from 'react';
import type { Product, ProductAvailability, TrendItem } from '../types';
import { DEFAULT_FEATURED_TRENDS } from '../data/trends';
import { supabase, toWesternNumerals } from '../lib/supabase';
import { DEFAULT_ACTIVE_FOOTER_LINKS, type FooterSocialLink } from '../data/socialPlatforms';
import { saveSiteConfigToSupabase, fetchSiteConfigFromSupabase, type CloudSiteConfig } from '../lib/storage';

export interface SiteControlItem {
  id: string;
  category: 'product' | 'header' | 'filter' | 'global' | 'banner';
  name_ar: string;
  name_en: string;
  visible: boolean;
  enabled: boolean;
  label_ar: string;
  label_en: string;
  actionValue?: string; // Custom WhatsApp phone, URL, or target parameter
  description_ar?: string;
  description_en?: string;
}

export type CurrencyType = 'د.ع' | 'IQD' | 'USD';
export type CurrencyCode = CurrencyType;

export const DEFAULT_SITE_CONTROLS: Record<string, SiteControlItem> = {
  // Product Drawer Controls
  btn_product_whatsapp: {
    id: 'btn_product_whatsapp',
    category: 'product',
    name_ar: 'زر طلب القطعة عبر واتساب',
    name_en: 'WhatsApp Order Button',
    visible: true,
    enabled: true,
    label_ar: 'طلب عبر واتساب',
    label_en: 'Order via WhatsApp',
    description_ar: 'الزر الأساسي للتواصل والطلب الفوري في صفحة تفاصيل القطعة',
    description_en: 'Primary direct purchase CTA in product details',
  },
  btn_product_share: {
    id: 'btn_product_share',
    category: 'product',
    name_ar: 'زر مشاركة الرابط',
    name_en: 'Share Link Button',
    visible: true,
    enabled: true,
    label_ar: 'مشاركة',
    label_en: 'Share',
    description_ar: 'زر فتح نافذة نسخ ومشاركة رابط القطعة السريع',
    description_en: 'Triggers quick copy and social sharing sheet',
  },
  btn_product_copy: {
    id: 'btn_product_copy',
    category: 'product',
    name_ar: 'زر نسخ اسم القطعة',
    name_en: 'Copy Title Button',
    visible: true,
    enabled: true,
    label_ar: 'نسخ الاسم',
    label_en: 'Copy Name',
    description_ar: 'زر النسخ السريع لاسم وتفاصيل القطعة للحافظة',
    description_en: 'Quick clipboard copy of the product title',
  },
  btn_product_size_guide: {
    id: 'btn_product_size_guide',
    category: 'product',
    name_ar: 'زر دليل القياسات التفاعلي',
    name_en: 'Interactive Size Guide Trigger',
    visible: true,
    enabled: true,
    label_ar: 'دليل القياسات الذكي',
    label_en: 'Smart Fit Guide',
    description_ar: 'زر فتح حاسبة الطول والوزن وجدول المقاسات',
    description_en: 'Opens the height/weight recommender & measurement table',
  },
  btn_product_bespoke: {
    id: 'btn_product_bespoke',
    category: 'product',
    name_ar: 'زر طلب التفصيل الخاص (Bespoke)',
    name_en: 'Bespoke Tailoring Button',
    visible: true,
    enabled: true,
    label_ar: 'طلب تفصيل خاص عبر واتساب',
    label_en: 'Inquire Bespoke on WhatsApp',
    description_ar: 'يظهر عند إدخال قياسات خارج النطاق الجاهز لتحويل العميل للخياطة الخاصة',
    description_en: 'Appears for custom builds exceeding ready-to-wear sizing',
  },

  // Header & Navigation Controls
  btn_header_search: {
    id: 'btn_header_search',
    category: 'header',
    name_ar: 'زر البحث في الترويسة',
    name_en: 'Header Search Button',
    visible: true,
    enabled: true,
    label_ar: 'بحث',
    label_en: 'Search',
    description_ar: 'أيقونة فتح شريط البحث بالاسم والخامة',
    description_en: 'Search bar trigger in the top bar',
  },
  btn_header_wishlist: {
    id: 'btn_header_wishlist',
    category: 'header',
    name_ar: 'زر المفضلة في الترويسة',
    name_en: 'Header Wishlist Button',
    visible: true,
    enabled: true,
    label_ar: 'المفضلة',
    label_en: 'Wishlist',
    description_ar: 'زر عرض القطع المحفوظة في المفضلة وتصفيتها',
    description_en: 'Filter view for favorited items',
  },
  btn_header_lang: {
    id: 'btn_header_lang',
    category: 'header',
    name_ar: 'زر تبديل اللغة',
    name_en: 'Language Switcher Button',
    visible: true,
    enabled: true,
    label_ar: 'EN / عربي',
    label_en: 'AR / English',
    description_ar: 'الزر المخصص للتبديل الفوري بين العربية والإنجليزية',
    description_en: 'Instant switcher between Arabic and English',
  },
  btn_header_theme: {
    id: 'btn_header_theme',
    category: 'header',
    name_ar: 'زر الوضع الليلي / الفاتح',
    name_en: 'Dark / Light Mode Toggle',
    visible: true,
    enabled: true,
    label_ar: 'المظهر',
    label_en: 'Theme',
    description_ar: 'زر التبديل بين النمط المظلم الفاخر والنمط الفاتح',
    description_en: 'Toggles between obsidian dark and gallery light mode',
  },
  brand_kinetic_logo: {
    id: 'brand_kinetic_logo',
    category: 'header',
    name_ar: 'شعار ڤانت الحركي في المنتصف',
    name_en: 'Kinetic Center Brand Wordmark',
    visible: true,
    enabled: true,
    label_ar: 'ڤانت',
    label_en: 'VANT',
    description_ar: 'شعار ڤانت المتمركز في الترويسة مع الحركة الانسيابية التلقائية',
    description_en: 'Kinetic typography logo in header center with smooth cycling animation',
  },

  // Category & Filter Controls
  btn_filter_availability: {
    id: 'btn_filter_availability',
    category: 'filter',
    name_ar: 'قائمة فلترة التوفر المنسدلة',
    name_en: 'Availability Filter Dropdown',
    visible: true,
    enabled: true,
    label_ar: 'حالة التوفر',
    label_en: 'Availability',
    description_ar: 'القائمة المنسدلة المدمجة لتصفية (متوفر، قريباً، منتهي)',
    description_en: 'The compact dropdown for filtering stock status',
  },

  // Global Action Settings
  cfg_whatsapp_phone: {
    id: 'cfg_whatsapp_phone',
    category: 'global',
    name_ar: 'رقم واتساب المبيعات والطلبات',
    name_en: 'Sales WhatsApp Phone Number',
    visible: true,
    enabled: true,
    label_ar: 'رقم الواتساب الرسمي',
    label_en: 'Official WhatsApp Phone',
    actionValue: '',
    description_ar: 'رقم الواتساب المستهدف عند نقر أزرار الطلب (مثال: +9647XXXXXXXXX)',
    description_en: 'Target WhatsApp international phone number',
  },
  cfg_bespoke_phone: {
    id: 'cfg_bespoke_phone',
    category: 'global',
    name_ar: 'رقم واتساب التفصيل الخاص (الكونسيرج)',
    name_en: 'Bespoke Concierge WhatsApp Phone',
    visible: true,
    enabled: true,
    label_ar: 'رقم كونسيرج التفصيل',
    label_en: 'Bespoke Concierge Phone',
    actionValue: '',
    description_ar: 'رقم هاتف قسم الخياطة والتفصيل الخاص',
    description_en: 'Direct phone number for Made-to-Measure concierge',
  },

  // Banner & Site Copy Controls
  banner_hero_visible: {
    id: 'banner_hero_visible',
    category: 'banner',
    name_ar: 'ظهور البنر الترحيبي',
    name_en: 'Welcome Hero Banner Visibility',
    visible: true,
    enabled: true,
    label_ar: 'البنر الترحيبي',
    label_en: 'Welcome Hero Banner',
    description_ar: 'التحكم بإظهار أو إخفاء البنر الترحيبي أعلى الكتالوج',
    description_en: 'Toggle display of the top hero banner',
  },
  banner_hero_title: {
    id: 'banner_hero_title',
    category: 'banner',
    name_ar: 'عنوان البنر الترحيبي',
    name_en: 'Welcome Hero Banner Title',
    visible: true,
    enabled: true,
    label_ar: 'الصياغة المعمارية للأزياء الهادئة — قطع نادرة من الصوف الإيطالي والكشمير',
    label_en: 'Architectural Silhouettes in Virgin Wool & Mongolian Cashmere',
    description_ar: 'العنوان الرئيسي العريض في البنر الترحيبي',
    description_en: 'Main prominent headline in the welcome hero',
  },
  banner_hero_subtitle: {
    id: 'banner_hero_subtitle',
    category: 'banner',
    name_ar: 'وصف وفلسفة البنر الترحيبي',
    name_en: 'Welcome Hero Banner Manifesto',
    visible: true,
    enabled: true,
    label_ar: 'تصاميم تم تفصيلها بدقة هندسية في أرقى المعامل الإيطالية، حيث تلتقي الأكتاف المنسدلة بالحواف الحرة لتقديم تجربة ارتداء لا تضاهى.',
    label_en: 'Engineered with sculptural precision from virgin Italian wool, unlined Mongolian double-face cashmere, and French calfskin.',
    description_ar: 'النص التعريفي لبيان وفلسفة الدار',
    description_en: 'Manifesto description under the main headline',
  },
  banner_hero_tag: {
    id: 'banner_hero_tag',
    category: 'banner',
    name_ar: 'شارة أعلى البنر الترحيبي',
    name_en: 'Welcome Hero Banner Top Tag',
    visible: true,
    enabled: true,
    label_ar: 'ڤانت · كتالوج شتاء 2026',
    label_en: 'MAISON VANT · WINTER CAPSULE 2026',
    description_ar: 'الشريط الأرشيفي الصغير في أعلى البنر',
    description_en: 'Small editorial tag line above title',
  },
  banner_hero_btn: {
    id: 'banner_hero_btn',
    category: 'banner',
    name_ar: 'نص زر التصفح في البنر',
    name_en: 'Welcome Hero Action Button',
    visible: true,
    enabled: true,
    label_ar: 'تصفح كافة القطع',
    label_en: 'Browse All Pieces',
    description_ar: 'نص الزر التفاعلي للانتقال إلى المعروضات',
    description_en: 'Button label linking to catalog grid',
  },
  banner_hero_bg: {
    id: 'banner_hero_bg',
    category: 'banner',
    name_ar: 'صورة خلفية البنر الترحيبي',
    name_en: 'Welcome Hero Background Image',
    visible: true,
    enabled: true,
    label_ar: 'صورة الخلفية',
    label_en: 'Background Image',
    actionValue: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80',
    description_ar: 'رابط صورة الغلاف الفنية التحريرية للبنر',
    description_en: 'Editorial cover background image URL',
  },
  banner_trends_title: {
    id: 'banner_trends_title',
    category: 'banner',
    name_ar: 'عنوان سكشن تريند الموسم',
    name_en: 'Trends Section Title',
    visible: true,
    enabled: true,
    label_ar: 'تريند موسم 2026',
    label_en: 'Featured Trends 2026',
    description_ar: 'عنوان قسم التريندات المتنقلة',
    description_en: 'Headline for the horizontal trends carousel',
  },
};

const STORAGE_KEY = 'vant_site_controls_v2';
const PRODUCTS_STORAGE_KEY = 'vant_custom_products_v2';
const ENHANCEMENTS_STORAGE_KEY = 'vant_product_enhancements_v2';
const CURRENCY_STORAGE_KEY = 'vant_currency_code_v2';
const PIN_STORAGE_KEY = 'vant_admin_pass_v3';
const SESSION_AUTH_KEY = 'vant_admin_auth_session';
const SETTINGS_STORAGE_KEY = 'vant_site_settings_v1';

export type SplashMotifType =
  | 'print_press'
  | 'tshirt_print'
  | 'embroidery'
  | 'hanger'
  | 'needle_thread'
  | 'mannequin'
  | 'monogram'
  | 'scissors';

export interface SiteSettings {
  id?: string | number;
  maintenance_mode: boolean;
  loading_text_en: string;
  loading_text_ar: string;
  maintenance_message: string;
  maintenance_message_ar?: string;
  splash_motif?: SplashMotifType;
  updated_at?: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  maintenance_mode: false,
  loading_text_en: 'INITIALIZING ARCHIVE',
  loading_text_ar: 'جاري تحميل الأرشيف وتجهيز التشكيلة',
  maintenance_message: 'We are preparing Volume 02. Please check back later.',
  maintenance_message_ar: 'نعمل حالياً على تجهيز التشكيلة الجديدة وتحديث النظام. يرجى العودة لاحقاً.',
  splash_motif: 'tshirt_print',
};

export interface ProductEnhancement {
  title_ar?: string;
  category_ar?: string;
  is_offer?: boolean;
  original_price?: number;
  offer_badge_ar?: string;
  offer_badge_en?: string;
  tags?: string[];
  image_url?: string;
  images?: string[];
  aspect_ratio?: string;
}

function getStoredEnhancements(): Record<string, ProductEnhancement> {
  try {
    const raw = localStorage.getItem(ENHANCEMENTS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

function saveProductEnhancement(id: string | number, enhancement: Partial<ProductEnhancement>) {
  try {
    const all = getStoredEnhancements();
    all[String(id)] = { ...(all[String(id)] || {}), ...enhancement };
    localStorage.setItem(ENHANCEMENTS_STORAGE_KEY, JSON.stringify(all));
    saveSiteConfigToSupabase({ enhancements: all });
  } catch {}
}

function removeProductEnhancement(id: string | number) {
  try {
    const all = getStoredEnhancements();
    delete all[String(id)];
    localStorage.setItem(ENHANCEMENTS_STORAGE_KEY, JSON.stringify(all));
    saveSiteConfigToSupabase({ enhancements: all });
  } catch {}
}

export interface SiteControlsContextType {
  controls: Record<string, SiteControlItem>;
  getControl: (id: string) => SiteControlItem;
  toggleVisibility: (id: string) => void;
  toggleEnabled: (id: string) => void;
  updateControl: (id: string, updates: Partial<SiteControlItem>) => void;
  resetControl: (id: string) => void;
  resetAllControls: () => void;
  exportConfigJSON: () => string;
  importConfigJSON: (jsonString: string) => boolean;

  // Currency Support
  currency: CurrencyType;
  currencyCode: CurrencyType;
  setCurrency: (c: CurrencyType) => void;
  setCurrencyCode: (c: CurrencyType) => void;
  formatPrice: (price: number) => string;

  // Full Catalog CMS
  products: Product[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  totalProductsCount: number;
  error: string | null;
  isLiveDatabase: boolean;
  lastSyncTime: Date | null;
  refreshProducts: () => Promise<void>;
  loadMoreProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id'> & { id?: string | number }) => Product;
  updateProduct: (id: string | number, updates: Partial<Product>) => void;
  deleteProduct: (id: string | number) => void;
  toggleProductAvailability: (id: string | number, status?: ProductAvailability) => void;
  resetProductsToDefault: () => void;
  importProductsJSON: (jsonString: string) => boolean;
  exportFullSystemJSON: () => string;
  importFullSystemJSON: (jsonString: string) => boolean;
  exportAllDataJSON: () => string;
  importAllDataJSON: (jsonString: string) => boolean;

  // Trend Cards Studio
  trendItems: TrendItem[];
  updateTrendItem: (id: string, updates: Partial<TrendItem>) => void;
  resetTrendsToDefault: () => void;

  // Social & Platforms Management (60+ Presets & Custom)
  socialLinks: FooterSocialLink[];
  updateSocialLink: (id: string, updates: Partial<FooterSocialLink>) => void;
  addSocialLink: (link: FooterSocialLink) => void;
  removeSocialLink: (id: string) => void;
  toggleSocialLinkActive: (id: string) => void;
  reorderSocialLinks: (reordered: FooterSocialLink[]) => void;
  resetSocialLinksToDefault: () => void;

  // Admin Auth & State
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  isAdminUnlocked: boolean;
  unlockAdmin: (pin: string) => boolean;
  lockAdmin: () => void;
  setAdminPin: (newPin: string) => void;

  // Global Site Settings (Maintenance Mode & Splash Preloader)
  siteSettings: SiteSettings;
  updateSiteSettings: (updates: Partial<SiteSettings>) => Promise<boolean>;
  isInitialSplashLoading: boolean;
  isPreviewSplash: boolean;
  setIsPreviewSplash: (show: boolean) => void;
  isPreviewMaintenance: boolean;
  setIsPreviewMaintenance: (show: boolean) => void;

  // Supabase Cloud Sync
  isCloudSynced: boolean;
  syncAllToSupabaseCloud: () => Promise<boolean>;
}

const SiteControlsContext = createContext<SiteControlsContextType | undefined>(undefined);

export function SiteControlsProvider({ children }: { children: ReactNode }) {
  // 1. Controls
  const [controls, setControls] = useState<Record<string, SiteControlItem>>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          return { ...DEFAULT_SITE_CONTROLS, ...parsed };
        }
      }
    } catch {
      // Fallback
    }
    return DEFAULT_SITE_CONTROLS;
  });

  // 2. Currency
  const [currency, setCurrencyState] = useState<CurrencyType>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(CURRENCY_STORAGE_KEY) as CurrencyType;
        if (saved === 'IQD' || saved === 'د.ع') return saved;
      }
    } catch {
      // fallback
    }
    return 'د.ع';
  });

  const setCurrency = (c: CurrencyType) => {
    setCurrencyState(c);
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, c);
    } catch {
      // ignore
    }
    // Immediately persist to Supabase Cloud for all devices & customers
    saveSiteConfigToSupabase({
      currency: c,
      controls,
      trendItems,
      socialLinks,
      enhancements: getStoredEnhancements(),
    });
  };

  // 3. Products Catalog CMS State (Connected to real Supabase database)
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [totalProductsCount, setTotalProductsCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isLiveDatabase, setIsLiveDatabase] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const hasLoadedOnceRef = useRef(false);
  const PAGE_SIZE = 12;

  const mapSupabaseProducts = (data: any[]): Product[] => {
    const enhancements = getStoredEnhancements();
    return data.map((p: any) => {
      const mediaList = Array.isArray(p.product_media)
        ? [...p.product_media].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
        : [];
      const mediaUrls = mediaList.map((m: any) => m.media_url?.trim()).filter(Boolean);
      const enhancement = enhancements[String(p.id)] || {};

      // Prioritize database media_url from Supabase product_media, then enhancement, then fallback
      const primaryImage =
        mediaUrls[0] ||
        enhancement.image_url ||
        p.image_url ||
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85';

      let availability: ProductAvailability = 'in_stock';
      const rawStatus = (p.status || '').toUpperCase().trim();
      if (rawStatus === 'COMING_SOON' || rawStatus === 'COMINGSOON') availability = 'coming_soon';
      else if (rawStatus === 'SOLD_OUT' || rawStatus === 'SOLDOUT') availability = 'sold_out';
      else if (rawStatus === 'LIMITED') availability = 'limited';

      const isOffer = Boolean(enhancement.is_offer || p.is_exclusive_drop);
      const numPrice = Number(p.price) || 0;
      const originalPrice = enhancement.original_price || (isOffer ? Math.round(numPrice * 1.25) : undefined);

      const allImages =
        mediaUrls.length > 0
          ? mediaUrls
          : enhancement.images && enhancement.images.length > 0
          ? enhancement.images
          : [primaryImage];

      return {
        id: p.id,
        title: p.title || 'Untitled Piece',
        title_ar: enhancement.title_ar || p.title_ar || p.title || 'قطعة حصرية',
        price: numPrice,
        original_price: originalPrice,
        is_offer: isOffer,
        offer_badge_ar: enhancement.offer_badge_ar || (isOffer ? 'عرض خاص' : undefined),
        offer_badge_en: enhancement.offer_badge_en || (isOffer ? 'Special Offer' : undefined),
        currency: 'IQD',
        category: p.category || 'Tailoring',
        category_ar: enhancement.category_ar || p.category_ar || (p.category === 'T-Shirts' ? 'تيشيرتات' : p.category),
        image_url: primaryImage,
        images: allImages,
        sizes: Array.isArray(p.sizes) && p.sizes.length > 0 ? p.sizes : ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        description: p.description || '',
        description_ar: p.description_ar || p.description,
        material: p.material || '',
        fit_details: p.fit_details || '',
        tags: enhancement.tags || (Array.isArray(p.tags) ? p.tags : []),
        created_at: p.created_at,
        availability,
        aspect_ratio: p.aspect_ratio || enhancement.aspect_ratio || undefined,
      };
    });
  };

  const loadProductsFromSupabase = useCallback(async (isSilent = false) => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    try {
      // Only show loading spinner on first initial load, never during background focus/revalidation
      if (!hasLoadedOnceRef.current && !isSilent) {
        setLoading(true);
      }
      const { data, count, error: sbError } = await supabase
        .from('products')
        .select('*, product_media(*)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(0, PAGE_SIZE - 1);

      if (sbError) {
        console.error('Supabase query error in SiteControls:', sbError.message);
        setError(sbError.message);
        setIsLiveDatabase(false);
        return;
      }

      if (data) {
        const mapped = mapSupabaseProducts(data);
        setProducts(mapped);
        setCurrentPage(0);
        const total = typeof count === 'number' ? count : mapped.length;
        setTotalProductsCount(total);
        setHasMore(total > mapped.length && data.length >= PAGE_SIZE);
        setIsLiveDatabase(true);
        setError(null);
        setLastSyncTime(new Date());
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Database query failure';
      console.error('Failed to load products from database:', msg);
      setError(msg);
      setIsLiveDatabase(false);
    } finally {
      hasLoadedOnceRef.current = true;
      setLoading(false);
    }
  }, []);

  const loadMoreProducts = useCallback(async () => {
    if (!supabase || loadingMore || !hasMore) return;
    try {
      setLoadingMore(true);
      const nextPage = currentPage + 1;
      const from = nextPage * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, count, error: sbError } = await supabase
        .from('products')
        .select('*, product_media(*)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (sbError) {
        console.error('Error fetching more products:', sbError.message);
        return;
      }

      if (data && data.length > 0) {
        const mapped = mapSupabaseProducts(data);
        setProducts((prev) => {
          const existingIds = new Set(prev.map((p) => String(p.id)));
          const uniqueNew = mapped.filter((p) => !existingIds.has(String(p.id)));
          const combined = [...prev, ...uniqueNew];
          const total = typeof count === 'number' ? count : totalProductsCount;
          setHasMore(total > combined.length && data.length >= PAGE_SIZE);
          return combined;
        });
        setCurrentPage(nextPage);
        if (typeof count === 'number') {
          setTotalProductsCount(count);
        }
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Failed loading more products:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [currentPage, hasMore, loadingMore, totalProductsCount]);

  useEffect(() => {
    // Initial fetch
    loadProductsFromSupabase();

    // Realtime subscription to live postgres changes (only fires when an admin creates/updates/deletes)
    const client = supabase;
    if (client) {
      const channel = client
        .channel('site_controls_products')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
          loadProductsFromSupabase();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'product_media' }, () => {
          loadProductsFromSupabase();
        })
        .subscribe();

      return () => {
        client.removeChannel(channel);
      };
    }
  }, [loadProductsFromSupabase]);

  // 4. Trend Cards Studio State
  const [trendItems, setTrendItems] = useState<TrendItem[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('vant_custom_trends_v2');
        if (saved) return JSON.parse(saved);
      }
    } catch {}
    return DEFAULT_FEATURED_TRENDS;
  });

  // 5. Social & Platforms State (60+ Presets & Custom Links)
  const [socialLinks, setSocialLinks] = useState<FooterSocialLink[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('vant_social_links_v1');
        if (saved) return JSON.parse(saved);
      }
    } catch {}
    return DEFAULT_ACTIVE_FOOTER_LINKS;
  });

  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('vant_custom_trends_v2', JSON.stringify(trendItems));
    } catch {}
  }, [trendItems]);

  useEffect(() => {
    try {
      localStorage.setItem('vant_social_links_v1', JSON.stringify(socialLinks));
    } catch {}
  }, [socialLinks]);

  // Sync entire configuration to Supabase Cloud Storage
  const syncAllToSupabaseCloud = useCallback(async (): Promise<boolean> => {
    try {
      const payload: CloudSiteConfig = {
        currency,
        controls,
        trendItems,
        socialLinks,
        enhancements: getStoredEnhancements(),
        updated_at: new Date().toISOString(),
      };
      const ok = await saveSiteConfigToSupabase(payload);
      if (ok) {
        setIsCloudSynced(true);
      }
      return ok;
    } catch (e) {
      console.error('Failed to sync to Supabase cloud:', e);
      return false;
    }
  }, [controls, currency, trendItems, socialLinks]);

  const applyCloudConfig = useCallback(
    (cloudConfig: CloudSiteConfig) => {
      if (!cloudConfig) return;

      // 1. Currency Sync across devices
      if (
        cloudConfig.currency &&
        (cloudConfig.currency === 'IQD' || cloudConfig.currency === 'د.ع' || cloudConfig.currency === 'USD')
      ) {
        setCurrencyState(cloudConfig.currency as CurrencyType);
        try {
          localStorage.setItem(CURRENCY_STORAGE_KEY, cloudConfig.currency);
        } catch {}
      }

      // 2. Controls & Banner Image
      let resolvedControls = { ...(cloudConfig.controls || {}) };
      const heroUrl = cloudConfig.banner_hero_bg || cloudConfig.hero_bg;
      if (heroUrl) {
        resolvedControls['banner_hero_bg'] = {
          ...(resolvedControls['banner_hero_bg'] || DEFAULT_SITE_CONTROLS['banner_hero_bg']),
          actionValue: heroUrl,
        };
      }

      if (Object.keys(resolvedControls).length > 0) {
        setControls((prev) => {
          const merged = { ...prev, ...resolvedControls };
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }

      // 3. Trend Items
      if (Array.isArray(cloudConfig.trendItems) && cloudConfig.trendItems.length > 0) {
        setTrendItems(cloudConfig.trendItems);
        try {
          localStorage.setItem('vant_custom_trends_v2', JSON.stringify(cloudConfig.trendItems));
        } catch {}
      }

      // 4. Social Links
      if (Array.isArray(cloudConfig.socialLinks) && cloudConfig.socialLinks.length > 0) {
        setSocialLinks(cloudConfig.socialLinks);
        try {
          localStorage.setItem('vant_social_links_v1', JSON.stringify(cloudConfig.socialLinks));
        } catch {}
      }

      // 5. Enhancements
      if (cloudConfig.enhancements && Object.keys(cloudConfig.enhancements).length > 0) {
        try {
          const current = getStoredEnhancements();
          const mergedEnhancements = { ...current, ...cloudConfig.enhancements };
          localStorage.setItem(ENHANCEMENTS_STORAGE_KEY, JSON.stringify(mergedEnhancements));
        } catch {}
        loadProductsFromSupabase();
      }
      setIsCloudSynced(true);
    },
    [loadProductsFromSupabase]
  );

  // Initial load + periodic live background synchronization across all devices and clients
  useEffect(() => {
    let isMounted = true;
    let lastKnownTimestamp = '';

    const syncFromCloud = async () => {
      try {
        const cloudConfig = await fetchSiteConfigFromSupabase();
        if (cloudConfig && isMounted) {
          if (cloudConfig.updated_at && cloudConfig.updated_at !== lastKnownTimestamp) {
            lastKnownTimestamp = cloudConfig.updated_at;
            applyCloudConfig(cloudConfig);
          } else if (!lastKnownTimestamp) {
            lastKnownTimestamp = cloudConfig.updated_at || 'ready';
            applyCloudConfig(cloudConfig);
          }
        }
      } catch (err) {
        console.warn('Live sync from Supabase Cloud config failed:', err);
      }
    };

    // 1. Initial immediate sync
    syncFromCloud();

    // 2. Continuous background sync every 15 seconds so customer screens reflect admin edits live
    const interval = setInterval(syncFromCloud, 15000);

    // 3. Sync silently whenever the customer/admin focuses the window or switches tabs
    let lastFocusSync = 0;
    const onFocus = () => {
      const now = Date.now();
      if (now - lastFocusSync < 10000) return; // throttle focus sync to once every 10 seconds
      lastFocusSync = now;
      syncFromCloud();
      loadProductsFromSupabase(true);
    };
    window.addEventListener('focus', onFocus);
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        onFocus();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [applyCloudConfig, loadProductsFromSupabase]);

  const updateTrendItem = (id: string, updates: Partial<TrendItem>) => {
    setTrendItems((prev) => {
      const nextTrends = prev.map((item) => (item.id === id ? { ...item, ...updates } : item));
      try {
        localStorage.setItem('vant_custom_trends_v2', JSON.stringify(nextTrends));
      } catch {}
      saveSiteConfigToSupabase({
        currency,
        controls,
        trendItems: nextTrends,
        socialLinks,
        enhancements: getStoredEnhancements(),
      });
      return nextTrends;
    });
  };

  const resetTrendsToDefault = () => {
    setTrendItems(DEFAULT_FEATURED_TRENDS);
    try {
      localStorage.setItem('vant_custom_trends_v2', JSON.stringify(DEFAULT_FEATURED_TRENDS));
    } catch {}
    saveSiteConfigToSupabase({
      currency,
      controls,
      trendItems: DEFAULT_FEATURED_TRENDS,
      socialLinks,
      enhancements: getStoredEnhancements(),
    });
  };

  const updateSocialLink = (id: string, updates: Partial<FooterSocialLink>) => {
    setSocialLinks((prev) => {
      const nextSocial = prev.map((l) => (l.id === id ? { ...l, ...updates } : l));
      try {
        localStorage.setItem('vant_social_links_v1', JSON.stringify(nextSocial));
      } catch {}
      saveSiteConfigToSupabase({
        currency,
        controls,
        trendItems,
        socialLinks: nextSocial,
        enhancements: getStoredEnhancements(),
      });
      return nextSocial;
    });
  };

  const addSocialLink = (link: FooterSocialLink) => {
    setSocialLinks((prev) => {
      const nextSocial = [...prev, link];
      try {
        localStorage.setItem('vant_social_links_v1', JSON.stringify(nextSocial));
      } catch {}
      saveSiteConfigToSupabase({
        currency,
        controls,
        trendItems,
        socialLinks: nextSocial,
        enhancements: getStoredEnhancements(),
      });
      return nextSocial;
    });
  };

  const removeSocialLink = (id: string) => {
    setSocialLinks((prev) => {
      const nextSocial = prev.filter((l) => l.id !== id);
      try {
        localStorage.setItem('vant_social_links_v1', JSON.stringify(nextSocial));
      } catch {}
      saveSiteConfigToSupabase({
        currency,
        controls,
        trendItems,
        socialLinks: nextSocial,
        enhancements: getStoredEnhancements(),
      });
      return nextSocial;
    });
  };

  const toggleSocialLinkActive = (id: string) => {
    setSocialLinks((prev) => {
      const nextSocial = prev.map((l) => (l.id === id ? { ...l, isActive: !l.isActive } : l));
      try {
        localStorage.setItem('vant_social_links_v1', JSON.stringify(nextSocial));
      } catch {}
      saveSiteConfigToSupabase({
        currency,
        controls,
        trendItems,
        socialLinks: nextSocial,
        enhancements: getStoredEnhancements(),
      });
      return nextSocial;
    });
  };

  const reorderSocialLinks = (reordered: FooterSocialLink[]) => {
    setSocialLinks(reordered);
    try {
      localStorage.setItem('vant_social_links_v1', JSON.stringify(reordered));
    } catch {}
    saveSiteConfigToSupabase({
      currency,
      controls,
      trendItems,
      socialLinks: reordered,
      enhancements: getStoredEnhancements(),
    });
  };

  const resetSocialLinksToDefault = () => {
    setSocialLinks(DEFAULT_ACTIVE_FOOTER_LINKS);
    try {
      localStorage.removeItem('vant_social_links_v1');
    } catch {}
    saveSiteConfigToSupabase({
      currency,
      controls,
      trendItems,
      socialLinks: DEFAULT_ACTIVE_FOOTER_LINKS,
      enhancements: getStoredEnhancements(),
    });
  };

  // 6. Admin Auth
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        return sessionStorage.getItem(SESSION_AUTH_KEY) === 'true';
      }
    } catch {
      // fallback
    }
    return false;
  });

  // 7. Global Site Settings (Maintenance Mode & Splash Preloader)
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      }
    } catch {}
    return DEFAULT_SITE_SETTINGS;
  });

  const [isInitialSplashLoading, setIsInitialSplashLoading] = useState(true);
  const [isPreviewSplash, setIsPreviewSplash] = useState(false);
  const [isPreviewMaintenance, setIsPreviewMaintenance] = useState(false);

  // Fetch site_settings from Supabase
  const loadSiteSettingsFromSupabase = useCallback(async () => {
    if (!supabase) {
      setIsInitialSplashLoading(false);
      return;
    }
    try {
      const { data, error: sbError } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (sbError) {
        console.warn('Supabase site_settings query notice:', sbError.message);
      } else if (data) {
        const merged: SiteSettings = {
          ...DEFAULT_SITE_SETTINGS,
          ...data,
          maintenance_mode: Boolean(data.maintenance_mode),
          loading_text_en: data.loading_text_en || DEFAULT_SITE_SETTINGS.loading_text_en,
          loading_text_ar: data.loading_text_ar || DEFAULT_SITE_SETTINGS.loading_text_ar,
          maintenance_message: data.maintenance_message || DEFAULT_SITE_SETTINGS.maintenance_message,
          maintenance_message_ar: data.maintenance_message_ar || DEFAULT_SITE_SETTINGS.maintenance_message_ar,
          splash_motif: data.splash_motif || DEFAULT_SITE_SETTINGS.splash_motif || 'tshirt_print',
        };
        setSiteSettings(merged);
        try {
          localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(merged));
        } catch {}
      }
    } catch (e) {
      console.warn('Could not fetch site_settings:', e);
    } finally {
      setIsInitialSplashLoading(false);
    }
  }, []);

  const updateSiteSettings = useCallback(
    async (updates: Partial<SiteSettings>): Promise<boolean> => {
      const next: SiteSettings = { ...siteSettings, ...updates };
      setSiteSettings(next);
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next));
      } catch {}

      if (supabase) {
        try {
          const payload = {
            maintenance_mode: next.maintenance_mode,
            loading_text_en: next.loading_text_en,
            loading_text_ar: next.loading_text_ar,
            maintenance_message: next.maintenance_message,
            maintenance_message_ar: next.maintenance_message_ar,
            splash_motif: next.splash_motif || 'hanger',
            updated_at: new Date().toISOString(),
          };

          if (next.id) {
            await supabase.from('site_settings').update(payload).eq('id', next.id);
          } else {
            const { data } = await supabase
              .from('site_settings')
              .upsert(payload)
              .select()
              .maybeSingle();
            if (data?.id) {
              setSiteSettings((prev) => ({ ...prev, id: data.id }));
            }
          }
          return true;
        } catch (err) {
          console.warn('Failed to persist site_settings to Supabase:', err);
        }
      }
      return true;
    },
    [siteSettings]
  );

  useEffect(() => {
    loadSiteSettingsFromSupabase();

    const client = supabase;
    if (client) {
      const channel = client
        .channel('site_settings_realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, () => {
          loadSiteSettingsFromSupabase();
        })
        .subscribe();

      return () => {
        client.removeChannel(channel);
      };
    }
  }, [loadSiteSettingsFromSupabase]);

  // Save controls whenever modified
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(controls));
    } catch (e) {
      console.warn('Failed to save site controls to localStorage', e);
    }
  }, [controls]);

  // Save products whenever modified
  useEffect(() => {
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
      console.warn('Failed to save products to localStorage', e);
    }
  }, [products]);

  // Helper to format price with Western numerals and active currency
  const formatPriceVal = useCallback(
    (price: number): string => {
      if (typeof price !== 'number' || isNaN(price)) return `0 ${currency}`;
      const formatted = new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 0,
      }).format(price);
      return `${formatted} ${currency}`;
    },
    [currency]
  );

  const getControl = (id: string): SiteControlItem => {
    const raw =
      controls[id] ||
      DEFAULT_SITE_CONTROLS[id] || {
        id,
        category: 'global',
        name_ar: id,
        name_en: id,
        visible: true,
        enabled: true,
        label_ar: '',
        label_en: '',
      };

    return {
      ...raw,
      label_ar: toWesternNumerals(raw.label_ar),
      label_en: toWesternNumerals(raw.label_en),
      name_ar: toWesternNumerals(raw.name_ar),
      name_en: toWesternNumerals(raw.name_en),
    };
  };

  const toggleVisibility = (id: string) => {
    setControls((prev) => {
      const current = prev[id] || DEFAULT_SITE_CONTROLS[id];
      if (!current) return prev;
      const nextControls = {
        ...prev,
        [id]: {
          ...current,
          visible: !current.visible,
        },
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextControls));
      } catch {}
      saveSiteConfigToSupabase({
        controls: nextControls,
        currency,
        trendItems,
        socialLinks,
        enhancements: getStoredEnhancements(),
      });
      return nextControls;
    });
  };

  const toggleEnabled = (id: string) => {
    setControls((prev) => {
      const current = prev[id] || DEFAULT_SITE_CONTROLS[id];
      if (!current) return prev;
      const nextControls = {
        ...prev,
        [id]: {
          ...current,
          enabled: !current.enabled,
        },
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextControls));
      } catch {}
      saveSiteConfigToSupabase({
        controls: nextControls,
        currency,
        trendItems,
        socialLinks,
        enhancements: getStoredEnhancements(),
      });
      return nextControls;
    });
  };

  const updateControl = (id: string, updates: Partial<SiteControlItem>) => {
    let nextControlsState: Record<string, SiteControlItem> | null = null;
    setControls((prev) => {
      const current = prev[id] || DEFAULT_SITE_CONTROLS[id];
      if (!current) return prev;
      const nextControls = {
        ...prev,
        [id]: {
          ...current,
          ...updates,
        },
      };
      nextControlsState = nextControls;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextControls));
      } catch {}
      return nextControls;
    });

    if (nextControlsState) {
      const isBannerBg = id === 'banner_hero_bg';
      const actionVal = updates.actionValue ?? (nextControlsState as any)[id]?.actionValue;
      saveSiteConfigToSupabase({
        controls: nextControlsState,
        currency,
        trendItems,
        socialLinks,
        enhancements: getStoredEnhancements(),
        ...(isBannerBg && actionVal ? { hero_bg: actionVal, banner_hero_bg: actionVal } : {}),
      });
    }
  };

  const resetControl = (id: string) => {
    if (DEFAULT_SITE_CONTROLS[id]) {
      setControls((prev) => {
        const nextControls = {
          ...prev,
          [id]: { ...DEFAULT_SITE_CONTROLS[id] },
        };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(nextControls));
        } catch {}
        saveSiteConfigToSupabase({
          controls: nextControls,
          currency,
          trendItems,
          socialLinks,
          enhancements: getStoredEnhancements(),
        });
        return nextControls;
      });
    }
  };

  const resetAllControls = () => {
    setControls({ ...DEFAULT_SITE_CONTROLS });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    saveSiteConfigToSupabase({
      controls: { ...DEFAULT_SITE_CONTROLS },
      currency,
      trendItems,
      socialLinks,
      enhancements: getStoredEnhancements(),
    });
  };

  // Product Catalog CRUD methods with live Supabase persistence
  const addProduct = (prodData: Omit<Product, 'id'> & { id?: string | number }): Product => {
    const tempId = prodData.id || `temp-${Date.now()}`;
    const newProduct: Product = {
      ...prodData,
      id: tempId,
      availability: prodData.availability || 'in_stock',
      sizes: prodData.sizes && prodData.sizes.length > 0 ? prodData.sizes : ['S', 'M', 'L', 'XL'],
      created_at: prodData.created_at || new Date().toISOString(),
    };

    saveProductEnhancement(tempId, {
      title_ar: prodData.title_ar,
      category_ar: prodData.category_ar,
      is_offer: prodData.is_offer,
      original_price: prodData.original_price,
      offer_badge_ar: prodData.offer_badge_ar,
      offer_badge_en: prodData.offer_badge_en,
      tags: prodData.tags,
      image_url: prodData.image_url,
      images: prodData.images,
    });

    setProducts((prev) => [newProduct, ...prev]);

    if (supabase) {
      (async () => {
        try {
          const status =
            prodData.availability === 'sold_out'
              ? 'SOLD_OUT'
              : prodData.availability === 'coming_soon'
              ? 'COMING_SOON'
              : prodData.availability === 'limited'
              ? 'LIMITED'
              : 'AVAILABLE';

          const { data: inserted, error: insErr } = await supabase
            .from('products')
            .insert({
              title: prodData.title,
              price: prodData.price,
              category: prodData.category || 'Tailoring',
              description: prodData.description || '',
              material: prodData.material || '',
              fit_details: prodData.fit_details || '',
              sizes: prodData.sizes || ['S', 'M', 'L', 'XL'],
              status,
              is_exclusive_drop: Boolean(prodData.is_offer),
            })
            .select()
            .single();

          if (insErr) {
            console.error('Error inserting product to Supabase:', insErr.message);
            return;
          }

          if (inserted) {
            // Re-key enhancement to real Supabase ID
            removeProductEnhancement(tempId);
            saveProductEnhancement(inserted.id, {
              title_ar: prodData.title_ar,
              category_ar: prodData.category_ar,
              is_offer: prodData.is_offer,
              original_price: prodData.original_price,
              offer_badge_ar: prodData.offer_badge_ar,
              offer_badge_en: prodData.offer_badge_en,
              tags: prodData.tags,
              image_url: prodData.image_url,
              images: prodData.images,
            });

            // Synchronize all media images to Supabase product_media table
            const allImagesList = (Array.isArray(prodData.images) && prodData.images.length > 0)
              ? prodData.images.filter(Boolean)
              : prodData.image_url ? [prodData.image_url] : [];

            if (allImagesList.length > 0) {
              const mediaRows = allImagesList.map((url, idx) => ({
                product_id: inserted.id,
                media_url: url,
                display_order: idx + 1,
              }));
              await supabase.from('product_media').insert(mediaRows);
            }

            await loadProductsFromSupabase();
          }
        } catch (e) {
          console.error('Failed to save product to Supabase:', e);
        }
      })();
    }

    return newProduct;
  };

  const updateProduct = (id: string | number, updates: Partial<Product>) => {
    saveProductEnhancement(id, {
      title_ar: updates.title_ar,
      category_ar: updates.category_ar,
      is_offer: updates.is_offer,
      original_price: updates.original_price,
      offer_badge_ar: updates.offer_badge_ar,
      offer_badge_en: updates.offer_badge_en,
      tags: updates.tags,
      image_url: updates.image_url,
      images: updates.images,
    });

    setProducts((prev) =>
      prev.map((item) => (String(item.id) === String(id) ? { ...item, ...updates } : item))
    );

    if (supabase) {
      (async () => {
        try {
          const dbUpdates: Record<string, any> = {};
          if (updates.title !== undefined) dbUpdates.title = updates.title;
          if (updates.price !== undefined) dbUpdates.price = updates.price;
          if (updates.category !== undefined) dbUpdates.category = updates.category;
          if (updates.description !== undefined) dbUpdates.description = updates.description;
          if (updates.material !== undefined) dbUpdates.material = updates.material;
          if (updates.sizes !== undefined) dbUpdates.sizes = updates.sizes;
          if (updates.is_offer !== undefined) dbUpdates.is_exclusive_drop = updates.is_offer;
          if (updates.availability !== undefined) {
            dbUpdates.status =
              updates.availability === 'sold_out'
                ? 'SOLD_OUT'
                : updates.availability === 'coming_soon'
                ? 'COMING_SOON'
                : updates.availability === 'limited'
                ? 'LIMITED'
                : 'AVAILABLE';
          }

          if (Object.keys(dbUpdates).length > 0) {
            await supabase.from('products').update(dbUpdates).eq('id', id);
          }

          // Full media sync in Supabase: replace or update product_media records
          const updatedImages = (Array.isArray(updates.images) && updates.images.length > 0)
            ? updates.images.filter(Boolean)
            : updates.image_url ? [updates.image_url] : null;

          if (updatedImages && updatedImages.length > 0) {
            await supabase.from('product_media').delete().eq('product_id', id);
            const mediaRows = updatedImages.map((url, idx) => ({
              product_id: id,
              media_url: url,
              display_order: idx + 1,
            }));
            await supabase.from('product_media').insert(mediaRows);
          } else if (updates.image_url) {
            const { data: media } = await supabase
              .from('product_media')
              .select('id')
              .eq('product_id', id)
              .order('display_order', { ascending: true })
              .limit(1);

            if (media && media.length > 0) {
              await supabase
                .from('product_media')
                .update({ media_url: updates.image_url })
                .eq('id', media[0].id);
            } else {
              await supabase.from('product_media').insert({
                product_id: id,
                media_url: updates.image_url,
                display_order: 1,
              });
            }
          }

          loadProductsFromSupabase();
        } catch (e) {
          console.error('Failed to update product in Supabase:', e);
        }
      })();
    }
  };

  const deleteProduct = (id: string | number) => {
    removeProductEnhancement(id);
    setProducts((prev) => prev.filter((item) => String(item.id) !== String(id)));
    if (supabase) {
      (async () => {
        try {
          await supabase.from('product_media').delete().eq('product_id', id);
          await supabase.from('products').delete().eq('id', id);
          await loadProductsFromSupabase();
        } catch (e) {
          console.error('Failed to delete product from Supabase:', e);
        }
      })();
    }
  };

  const toggleProductAvailability = (id: string | number, status?: ProductAvailability) => {
    if (status) {
      updateProduct(id, { availability: status });
    } else {
      const current = products.find((p) => String(p.id) === String(id));
      if (!current) return;
      const nextStatus: ProductAvailability =
        current.availability === 'in_stock'
          ? 'limited'
          : current.availability === 'limited'
          ? 'coming_soon'
          : current.availability === 'coming_soon'
          ? 'sold_out'
          : 'in_stock';
      updateProduct(id, { availability: nextStatus });
    }
  };

  const resetProductsToDefault = () => {
    loadProductsFromSupabase();
  };

  const importProductsJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setProducts(parsed);
        return true;
      }
    } catch {
      // invalid
    }
    return false;
  };

  const exportConfigJSON = () => {
    return JSON.stringify(controls, null, 2);
  };

  const importConfigJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (typeof parsed === 'object' && parsed !== null) {
        setControls((prev) => ({
          ...prev,
          ...parsed,
        }));
        return true;
      }
    } catch {
      // Invalid JSON
    }
    return false;
  };

  const exportFullSystemJSON = () => {
    return JSON.stringify(
      {
        currency,
        controls,
        products,
        version: '2.0',
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );
  };

  const importFullSystemJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (typeof parsed === 'object' && parsed !== null) {
        if (parsed.currency && (parsed.currency === 'د.ع' || parsed.currency === 'IQD')) {
          setCurrency(parsed.currency);
        }
        if (parsed.controls && typeof parsed.controls === 'object') {
          setControls((prev) => ({ ...prev, ...parsed.controls }));
        }
        if (Array.isArray(parsed.products) && parsed.products.length > 0) {
          setProducts(parsed.products);
        }
        return true;
      }
    } catch {
      // Invalid JSON
    }
    return false;
  };

  const unlockAdmin = (pin: string): boolean => {
    let currentPin = '';
    try {
      currentPin = localStorage.getItem(PIN_STORAGE_KEY) || '';
    } catch {}
    if (!currentPin) {
      currentPin = '@Ali200710';
      try {
        localStorage.setItem(PIN_STORAGE_KEY, '@Ali200710');
      } catch {}
    }
    if (pin.trim() === currentPin || pin.trim() === '@Ali200710') {
      setIsAdminUnlocked(true);
      try {
        sessionStorage.setItem(SESSION_AUTH_KEY, 'true');
      } catch {}
      return true;
    }
    return false;
  };

  const lockAdmin = () => {
    setIsAdminUnlocked(false);
    sessionStorage.removeItem(SESSION_AUTH_KEY);
    setIsAdminOpen(false);
  };

  const setAdminPin = (newPin: string) => {
    if (newPin && newPin.length >= 4) {
      localStorage.setItem(PIN_STORAGE_KEY, newPin);
    }
  };

  return (
    <SiteControlsContext.Provider
      value={{
        controls,
        getControl,
        toggleVisibility,
        toggleEnabled,
        updateControl,
        resetControl,
        resetAllControls,
        exportConfigJSON,
        importConfigJSON,
        currency,
        currencyCode: currency,
        setCurrency,
        setCurrencyCode: setCurrency,
        formatPrice: formatPriceVal,
        products,
        loading,
        loadingMore,
        hasMore,
        totalProductsCount,
        error,
        isLiveDatabase,
        lastSyncTime,
        refreshProducts: loadProductsFromSupabase,
        loadMoreProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductAvailability,
        resetProductsToDefault,
        importProductsJSON,
        exportFullSystemJSON,
        importFullSystemJSON,
        exportAllDataJSON: exportFullSystemJSON,
        importAllDataJSON: importFullSystemJSON,
        trendItems,
        updateTrendItem,
        resetTrendsToDefault,
        socialLinks,
        updateSocialLink,
        addSocialLink,
        removeSocialLink,
        toggleSocialLinkActive,
        reorderSocialLinks,
        resetSocialLinksToDefault,
        isAdminOpen,
        setIsAdminOpen,
        isAdminUnlocked,
        unlockAdmin,
        lockAdmin,
        setAdminPin,
        siteSettings,
        updateSiteSettings,
        isInitialSplashLoading,
        isPreviewSplash,
        setIsPreviewSplash,
        isPreviewMaintenance,
        setIsPreviewMaintenance,
        isCloudSynced,
        syncAllToSupabaseCloud,
      }}
    >
      {children}
    </SiteControlsContext.Provider>
  );
}

export function useSiteControls() {
  const context = useContext(SiteControlsContext);
  if (!context) {
    throw new Error('useSiteControls must be used within a SiteControlsProvider');
  }
  return context;
}
