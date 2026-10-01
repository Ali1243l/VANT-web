/**
 * VANT Streetwear Lookbook — Admin Panel Overhaul (Phase 7)
 * Path: src/pages/AdminPage.tsx
 *
 * Real Supabase Storage File Uploads (Drag & Drop / File zone),
 * Real Database CRUD, SaaS Input Polish, Mobile Responsive Product Cards.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  Mail,
  Key,
  Plus,
  ArrowLeft,
  LogOut,
  Package,
  Layers,
  Sparkles,
  Check,
  AlertCircle,
  X,
  ExternalLink,
  Trash2,
  Pencil,
  RefreshCw,
  Database,
  UploadCloud,
  FileImage,
  ImageIcon,
  Sun,
  Moon,
  Globe,
  Settings,
  Film,
  Play,
  MessageCircle,
  Instagram,
  Ruler,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  supabase,
  isSupabaseConfigured,
  fetchAdminProducts,
  formatSupabaseProduct,
  deleteProductFromDb,
  insertProductToDb,
  updateProductInDb,
  uploadMediaToStorage,
  uploadMultipleMediaToStorage,
  fetchAppSettings,
  updateAppSettingsInDb,
} from '../lib/supabase';
import { Product, AppSettings } from '../types/catalog';
import { compressMultipleImages } from '../lib/imageCompression';

const ADMIN_DICT = {
  ar: {
    adminConsole: 'لوحة التحكم',
    adminBadge: 'إدارة VANT',
    adminEmail: 'البريد الإلكتروني للمسؤول',
    password: 'كلمة المرور',
    signIn: 'تسجيل الدخول',
    authenticating: 'جارٍ التحقق...',
    returnLookbook: 'العودة إلى لوك بوك العام',
    liveFeed: 'المتجر المباشر',
    addProduct: 'إضافة منتج',
    editDropTitle: 'تعديل القطعة',
    saveChanges: 'حفظ التعديلات',
    signOut: 'تسجيل خروج',
    totalDrops: 'إجمالي القطع في القاعدة',
    exclusiveCount: 'قطع حصرية محدودة',
    activeCategories: 'التصنيفات النشطة',
    storageActive: 'سحابة Supabase نشطة',
    localPreview: 'وضع المعاينة المحلي',
    refresh: 'تحديث من القاعدة',
    loggedInAs: 'تم تسجيل الدخول كـ',
    productsCatalog: 'كتالوج منتجات Supabase',
    syncedDb: 'متزامن مع PostgreSQL وSupabase Storage',
    noProducts: 'لا توجد منتجات مسجلة في قاعدة البيانات',
    addFirstPrompt: 'أضف أول قطعة ستريت وير وارفع صور زواياها المتعددة.',
    addFirstBtn: 'إضافة أول منتج',
    exclusive: 'حصري',
    standard: 'قياسي',
    sizes: 'المقاسات',
    colors: 'الألوان',
    edit: 'تعديل',
    delete: 'حذف',
    dragDropTitle: 'اسحب وأفلت صور القطعة هنا، أو اضغط للتصفح',
    dragDropSub: 'يدعم صور JPG, PNG, WEBP بدقة عالية',
    selectedAngles: 'الزوايا المحددة',
    clearAll: 'مسح الكل',
    addAngle: 'إضافة زاوية',
    cover: 'الغلاف',
    angle: 'زاوية',
    titleLabel: 'عنوان القطعة',
    categoryLabel: 'التصنيف',
    priceLabel: 'السعر ($)',
    sizesLabel: 'المقاسات المتاحة',
    colorsLabel: 'الألوان المتاحة',
    descLabel: 'الوصف التفصيلي',
    fitLabel: 'تفاصيل القصة (Fit Details)',
    materialLabel: 'الخامة والوزن (GSM)',
    exclusiveDrop: 'تحديد كإصدار حصري محدود (Exclusive Drop)',
    cancel: 'إلغاء',
    uploadBtn: 'رفع وحفظ في Supabase',
    uploading: 'جارٍ الرفع إلى Supabase...',
    publishing: 'جاري النشر...',
    compressingImages: 'جاري ضغط الصور...',
    uploadingToStorage: 'جاري الرفع...',
    savingToDb: 'جاري الحفظ...',
    uploadSuccessToast: 'تم نشر القطعة بنجاح إلى كتالوج المتجر وقاعدة البيانات!',
    uploadErrorToast: 'حدث خطأ أثناء نشر القطعة',
    updateSuccessToast: 'تم حفظ التعديلات بنجاح في قاعدة البيانات!',
    updateErrorToast: 'حدث خطأ أثناء حفظ التعديلات',
    deleteSuccessToast: 'تم حذف المنتج بنجاح وإزالة صوره من التخزين السحابي',
    deleteErrorToast: 'فشل حذف المنتج من قاعدة البيانات',
    editFeatureNotice: 'ميزة التعديل قيد التطوير',
    selectPhotoRequired: 'يرجى إرفاق صورة واحدة على الأقل للقطعة',
    fillRequiredFields: 'يرجى إدخال اسم القطعة وسعرها بشكل صحيح',
    heicBlockedToast: 'يرجى تحويل صور HEIC إلى JPG أو WEBP قبل الرفع.',
    catalogTab: 'إدارة الكتالوج والمنتجات',
    settingsTab: 'إعدادات المتجر العامة',
    splashSettingsTitle: 'شاشة البداية السينمائية (Cinematic Splash Screen)',
    splashSettingsDesc: 'التحكم في شاشة الترحيب الافتتاحية للمتجر، مع إمكانية عرض فيديو أو صورة عالية الجودة في الخلفية.',
    splashToggleLabel: 'تفعيل شاشة البداية السينمائية',
    splashToggleSub: 'عند التفعيل، ستظهر شاشة ترحيب سينمائية لمدة 3 ثوانٍ بشعار VANT عند فتح المتجر لأول مرة.',
    splashMediaTitle: 'وسائط خلفية شاشة البداية (فيديو أو صورة)',
    splashMediaSub: 'يدعم مقاطع فيديو MP4, WebM وصور JPG, PNG, WEBP بدقة عالية.',
    splashMediaDropTitle: 'اسحب وأفلت فيديو أو صورة الخلفية هنا، أو اضغط للتصفح',
    splashMediaUrlLabel: 'أو أدخل رابط وسائط مباشر (فيديو / صورة)',
    splashMediaUrlPlaceholder: 'https://example.com/video.mp4',
    saveSettings: 'حفظ الإعدادات',
    savingSettings: 'جارٍ الحفظ...',
    settingsSavedToast: 'تم حفظ إعدادات شاشة البداية بنجاح!',
    removeSplashMedia: 'إزالة وسائط الخلفية',
    previewSplash: 'معاينة شاشة البداية (3 ثوانٍ)',
    feedUxTitle: 'تجربة الخلاصة التفاعلية (Dynamic Feed UX)',
    feedUxDesc: 'التحكم في المؤثرات البصرية وتفاعل شريط الترويسة والصور في الخلاصة الرئيسية للمتجر.',
    parallaxToggleLabel: 'تفعيل تأثير بارالاكس للصور (Breathing Parallax)',
    parallaxToggleSub: 'يمنح صور المنتجات في الخلاصة حركة هادئة وانسيابية (Breathing Scale) عند المشاهدة لإضفاء طابع الموضة الفاخرة.',
    smartHeaderToggleLabel: 'تفعيل إخفاء الترويسة الذكي (Auto-Hiding Smart Header)',
    smartHeaderToggleSub: 'إخفاء شريط العنوان تلقائياً عند التمرير لأسفل وإظهاره بسلاسة عند التمرير لأعلى لتوفير مساحة عرض كاملة.',
    productDetailsUxTitle: 'تفاصيل المنتج وتوجيه أزرار الطلب (Product Details & Smart CTA)',
    productDetailsUxDesc: 'التحكم في ظهور تفاصيل القصة والخامة، وتفعيل وتوجيه أزرار الطلب المباشر عبر واتساب وانستغرام.',
    showFitGuideLabel: 'إظهار دليل القصة (Fit Guide)',
    showFitGuideSub: 'عرض قسم تفاصيل القصة والقصّات العصرية للمنتج داخل نافذة تفاصيل القطعة.',
    showMaterialInfoLabel: 'إظهار تفاصيل الخامة (Material Info)',
    showMaterialInfoSub: 'عرض مواصفات القماش، الكثافة والوزن (GSM) داخل نافذة التفاصيل.',
    enableWhatsappLabel: 'تفعيل الطلب عبر واتساب (WhatsApp CTA)',
    enableWhatsappSub: 'إظهار زر الطلب المباشر عبر واتساب مع رسالة تلقائية مجهزة باسم القطعة وسعرها.',
    whatsappNumberLabel: 'رقم الواتساب للطلبات',
    whatsappNumberPlaceholder: '+9647700000000 أو 0770...',
    enableInstagramLabel: 'تفعيل الطلب عبر انستغرام (Instagram CTA)',
    enableInstagramSub: 'إظهار زر الطلب والمراسلة المباشرة عبر حساب انستغرام.',
    instagramHandleLabel: 'يوزر حساب الانستغرام',
    instagramHandlePlaceholder: '@vant... أو vant.streetwear',
    saveCtaSettings: 'حفظ إعدادات الطلب والتفاصيل',
    dropStatusLabel: 'حالة الإصدار (Drop Status)',
    statusAvailable: 'متوفر للطلب (AVAILABLE)',
    statusSoldOut: 'نفدت الكمية / أرشيف (SOLD OUT)',
    statusComingSoon: 'قريباً / إطلاق قادم (COMING SOON)',
  },
  en: {
    adminConsole: 'Admin Console',
    adminBadge: 'VANT ADMIN',
    adminEmail: 'Admin Email',
    password: 'Password',
    signIn: 'Sign In',
    authenticating: 'Authenticating...',
    returnLookbook: 'Return to Public Lookbook',
    liveFeed: 'Live Feed',
    addProduct: 'Add Product',
    editDropTitle: 'Edit Drop',
    saveChanges: 'Save Changes',
    signOut: 'Sign Out',
    totalDrops: 'Total Drops in DB',
    exclusiveCount: 'Exclusive Drops',
    activeCategories: 'Active Categories',
    storageActive: 'Supabase Storage Active',
    localPreview: 'Local Preview Mode',
    refresh: 'Refresh from DB',
    loggedInAs: 'Logged in as',
    productsCatalog: 'Supabase Products Catalog',
    syncedDb: 'Synchronized with PostgreSQL & Storage',
    noProducts: 'No products found in the database',
    addFirstPrompt: 'Add your first streetwear drop and upload its photography.',
    addFirstBtn: 'Add First Product',
    exclusive: 'Exclusive',
    standard: 'Standard',
    sizes: 'Sizes',
    colors: 'Colors',
    edit: 'Edit',
    delete: 'Delete',
    dragDropTitle: 'Drag & drop product angles here, or click to browse',
    dragDropSub: 'Supports high-res JPG, PNG, WEBP photography',
    selectedAngles: 'Selected Angles',
    clearAll: 'Clear all',
    addAngle: 'Add Angle',
    cover: 'Cover',
    angle: 'Angle',
    titleLabel: 'Product Title',
    categoryLabel: 'Category',
    priceLabel: 'Price (USD)',
    sizesLabel: 'Available Sizes',
    colorsLabel: 'Available Colors',
    descLabel: 'Detailed Description',
    fitLabel: 'Fit Details',
    materialLabel: 'Material & GSM',
    exclusiveDrop: 'Mark as Exclusive Limited Drop',
    cancel: 'Cancel',
    uploadBtn: 'Upload to Supabase',
    uploading: 'Uploading to Supabase...',
    publishing: 'Publishing...',
    compressingImages: 'Compressing Images...',
    uploadingToStorage: 'Uploading to Storage...',
    savingToDb: 'Saving to Database...',
    uploadSuccessToast: 'Product published successfully to catalog and database!',
    uploadErrorToast: 'Failed to publish product',
    updateSuccessToast: 'Changes saved successfully to database!',
    updateErrorToast: 'Failed to save changes',
    deleteSuccessToast: 'Product deleted successfully and media removed from storage.',
    deleteErrorToast: 'Failed to delete product from database.',
    editFeatureNotice: 'Edit feature coming soon',
    selectPhotoRequired: 'Please upload at least one product photo.',
    fillRequiredFields: 'Product Title and Price are required.',
    heicBlockedToast: 'Please convert HEIC images to JPG or WEBP before uploading.',
    catalogTab: 'Catalog Management',
    settingsTab: 'Store Settings',
    splashSettingsTitle: 'Cinematic Splash Screen',
    splashSettingsDesc: 'Control the full-screen 3-second opening welcome animation, with high-definition video or image background.',
    splashToggleLabel: 'Enable Cinematic Splash Screen',
    splashToggleSub: 'When enabled, visitors will see the full-screen 3-second intro animation with the VANT wordmark.',
    splashMediaTitle: 'Splash Background Media (Video or Image)',
    splashMediaSub: 'Supports MP4, WebM videos or high-resolution JPG, PNG, WEBP images.',
    splashMediaDropTitle: 'Drag & drop splash background video or image here, or click to browse',
    splashMediaUrlLabel: 'Or paste a direct media URL (video / image)',
    splashMediaUrlPlaceholder: 'https://example.com/video.mp4',
    saveSettings: 'Save Settings',
    savingSettings: 'Saving...',
    settingsSavedToast: 'Splash screen settings saved successfully!',
    removeSplashMedia: 'Remove Background Media',
    previewSplash: 'Preview Splash Screen (3s)',
    feedUxTitle: 'Dynamic Feed UX Settings',
    feedUxDesc: 'Control visual motion and interactive header/image behaviors on the live store feed.',
    parallaxToggleLabel: 'Enable Image Parallax Effect',
    parallaxToggleSub: 'Applies a subtle, breathing motion to product images on the feed for an ultra-luxury feel.',
    smartHeaderToggleLabel: 'Enable Auto-Hiding Smart Header',
    smartHeaderToggleSub: 'Automatically hides the header when scrolling down and smoothly reveals it when scrolling up.',
    productDetailsUxTitle: 'Product Details & Smart CTA Settings',
    productDetailsUxDesc: 'Control visibility of streetwear Fit Guide & Material specs, and configure WhatsApp/Instagram conversion CTAs.',
    showFitGuideLabel: 'Show Fit Guide',
    showFitGuideSub: 'Display the streetwear fit details and cut balancing section in the product modal.',
    showMaterialInfoLabel: 'Show Material & GSM Info',
    showMaterialInfoSub: 'Display fabric composition and weight specifications in the product modal.',
    enableWhatsappLabel: 'Enable WhatsApp Ordering (WhatsApp CTA)',
    enableWhatsappSub: 'Show direct WhatsApp order button with pre-filled drop name and price message.',
    whatsappNumberLabel: 'WhatsApp Order Number',
    whatsappNumberPlaceholder: '+964... or international format',
    enableInstagramLabel: 'Enable Instagram Ordering (Instagram CTA)',
    enableInstagramSub: 'Show direct Instagram DM order button routing directly to your profile.',
    instagramHandleLabel: 'Instagram Username / Handle',
    instagramHandlePlaceholder: '@vant... or username without @',
    saveCtaSettings: 'Save CTA & Details Settings',
    dropStatusLabel: 'Drop Status',
    statusAvailable: 'Available',
    statusSoldOut: 'Sold Out / Archived',
    statusComingSoon: 'Dropping Soon',
  }
};

export default function AdminPage() {
  // Dark Mode Theme State
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vant_theme');
      if (saved) return saved === 'dark';
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('vant_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('vant_theme', 'light');
    }
  }, [isDark]);

  // Language State with RTL / LTR sync
  const [lang, setLang] = useState<'ar' | 'en'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vant_lang');
      if (saved === 'ar' || saved === 'en') return saved;
      return (document.documentElement.lang as 'ar' | 'en') || 'ar';
    }
    return 'ar';
  });

  const t = ADMIN_DICT[lang];

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    localStorage.setItem('vant_lang', lang);
  }, [lang]);

  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [email, setEmail] = useState('admin@vant.co');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [adminUserEmail, setAdminUserEmail] = useState<string | null>('admin@vant.co');

  // Products from Supabase DB
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  // Modals & Action States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [statusToast, setStatusToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Add Product Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'T-Shirts' | 'Hoodies' | 'Pants' | 'Outerwear' | 'Coming Soon'>('T-Shirts');
  const [newPrice, setNewPrice] = useState('');
  const [newSizes, setNewSizes] = useState('S, M, L, XL');
  const [newColors, setNewColors] = useState('Black, Cobalt Blue');
  const [newDescription, setNewDescription] = useState('');
  const [newFitDetails, setNewFitDetails] = useState('');
  const [newMaterial, setNewMaterial] = useState('');
  const [newIsExclusive, setNewIsExclusive] = useState(false);
  const [newStatus, setNewStatus] = useState<'AVAILABLE' | 'SOLD_OUT' | 'COMING_SOON'>('AVAILABLE');

  // Real Multi-File Upload State (Phase 8 Requirement 3 & Phase 16 Edit State)
  const [selectedFiles, setSelectedFiles] = useState<{ file?: File; previewUrl: string; id: string; isExisting?: boolean }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload Loading State (Phase 10 Requirement 3)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState<string>('');

  // Phase 27: Store Settings & Splash Screen Engine State
  const [adminTab, setAdminTab] = useState<'catalog' | 'settings'>('catalog');
  const [appSettings, setAppSettings] = useState<AppSettings>({
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
  });
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
  const [isUploadingSplashMedia, setIsUploadingSplashMedia] = useState(false);
  const [splashCustomUrl, setSplashCustomUrl] = useState('');
  const [whatsappNumberInput, setWhatsappNumberInput] = useState('+9647700000000');
  const [instagramHandleInput, setInstagramHandleInput] = useState('vant.streetwear');
  const [isDraggingSplash, setIsDraggingSplash] = useState(false);
  const [previewingSplash, setPreviewingSplash] = useState(false);
  const splashFileInputRef = useRef<HTMLInputElement>(null);

  // Check Supabase session
  useEffect(() => {
    async function checkSession() {
      if (!isSupabaseConfigured()) return;
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          setIsAuthenticated(true);
          setAdminUserEmail(data.session.user.email || 'admin@vant.co');
        }
      } catch (err) {
        console.warn('Session check:', err);
      }
    }
    checkSession();
  }, []);

  // Fetch real database products & app settings
  useEffect(() => {
    if (isAuthenticated) {
      loadDatabaseProducts();
      loadAppSettingsData();
    }
  }, [isAuthenticated]);

  const loadAppSettingsData = async () => {
    try {
      const data = await fetchAppSettings();
      setAppSettings(data);
      setSplashCustomUrl(data.splash_media_url || '');
      setWhatsappNumberInput(data.whatsapp_number || '+9647700000000');
      setInstagramHandleInput(data.instagram_handle || 'vant.streetwear');
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  const handleToggleSplash = async (enabled: boolean) => {
    setIsUpdatingSettings(true);
    setAppSettings((prev) => ({ ...prev, splash_enabled: enabled }));
    const res = await updateAppSettingsInDb({ splash_enabled: enabled });
    setIsUpdatingSettings(false);
    if (res.success) {
      triggerToast(
        lang === 'ar'
          ? (enabled ? 'تم تفعيل شاشة البداية السينمائية بنجاح' : 'تم تعطيل شاشة البداية السينمائية')
          : (enabled ? 'Cinematic Splash Screen enabled' : 'Cinematic Splash Screen disabled'),
        'success'
      );
    } else {
      triggerToast(res.error || 'Failed to update splash setting', 'error');
    }
  };

  const handleToggleParallax = async (enabled: boolean) => {
    setIsUpdatingSettings(true);
    setAppSettings((prev) => ({ ...prev, parallax_enabled: enabled }));
    const res = await updateAppSettingsInDb({ parallax_enabled: enabled });
    setIsUpdatingSettings(false);
    if (res.success) {
      triggerToast(
        lang === 'ar'
          ? (enabled ? 'تم تفعيل تأثير بارالاكس للصور بنجاح' : 'تم تعطيل تأثير بارالاكس للصور')
          : (enabled ? 'Image Parallax Effect enabled' : 'Image Parallax Effect disabled'),
        'success'
      );
    } else {
      triggerToast(res.error || 'Failed to update parallax setting', 'error');
    }
  };

  const handleToggleSmartHeader = async (enabled: boolean) => {
    setIsUpdatingSettings(true);
    setAppSettings((prev) => ({ ...prev, smart_header_enabled: enabled }));
    const res = await updateAppSettingsInDb({ smart_header_enabled: enabled });
    setIsUpdatingSettings(false);
    if (res.success) {
      triggerToast(
        lang === 'ar'
          ? (enabled ? 'تم تفعيل إخفاء الترويسة الذكي بنجاح' : 'تم تعطيل إخفاء الترويسة الذكي')
          : (enabled ? 'Smart Auto-Hiding Header enabled' : 'Smart Auto-Hiding Header disabled'),
        'success'
      );
    } else {
      triggerToast(res.error || 'Failed to update smart header setting', 'error');
    }
  };

  const handleToggleFitGuide = async (enabled: boolean) => {
    setIsUpdatingSettings(true);
    setAppSettings((prev) => ({ ...prev, show_fit_guide: enabled }));
    const res = await updateAppSettingsInDb({ show_fit_guide: enabled });
    setIsUpdatingSettings(false);
    if (res.success) {
      triggerToast(
        lang === 'ar'
          ? (enabled ? 'تم تفعيل إظهار دليل القصة' : 'تم إخفاء دليل القصة')
          : (enabled ? 'Fit Guide enabled' : 'Fit Guide disabled'),
        'success'
      );
    } else {
      triggerToast(res.error || 'Failed to update fit guide setting', 'error');
    }
  };

  const handleToggleMaterialInfo = async (enabled: boolean) => {
    setIsUpdatingSettings(true);
    setAppSettings((prev) => ({ ...prev, show_material_info: enabled }));
    const res = await updateAppSettingsInDb({ show_material_info: enabled });
    setIsUpdatingSettings(false);
    if (res.success) {
      triggerToast(
        lang === 'ar'
          ? (enabled ? 'تم تفعيل إظهار تفاصيل الخامة' : 'تم إخفاء تفاصيل الخامة')
          : (enabled ? 'Material info enabled' : 'Material info disabled'),
        'success'
      );
    } else {
      triggerToast(res.error || 'Failed to update material info setting', 'error');
    }
  };

  const handleToggleWhatsapp = async (enabled: boolean) => {
    setIsUpdatingSettings(true);
    setAppSettings((prev) => ({ ...prev, enable_whatsapp: enabled }));
    const res = await updateAppSettingsInDb({ enable_whatsapp: enabled });
    setIsUpdatingSettings(false);
    if (res.success) {
      triggerToast(
        lang === 'ar'
          ? (enabled ? 'تم تفعيل زر الطلب عبر واتساب' : 'تم تعطيل زر الطلب عبر واتساب')
          : (enabled ? 'WhatsApp ordering enabled' : 'WhatsApp ordering disabled'),
        'success'
      );
    } else {
      triggerToast(res.error || 'Failed to update WhatsApp setting', 'error');
    }
  };

  const handleToggleInstagram = async (enabled: boolean) => {
    setIsUpdatingSettings(true);
    setAppSettings((prev) => ({ ...prev, enable_instagram: enabled }));
    const res = await updateAppSettingsInDb({ enable_instagram: enabled });
    setIsUpdatingSettings(false);
    if (res.success) {
      triggerToast(
        lang === 'ar'
          ? (enabled ? 'تم تفعيل زر الطلب عبر انستغرام' : 'تم تعطيل زر الطلب عبر انستغرام')
          : (enabled ? 'Instagram ordering enabled' : 'Instagram ordering disabled'),
        'success'
      );
    } else {
      triggerToast(res.error || 'Failed to update Instagram setting', 'error');
    }
  };

  const handleSaveContactInfo = async () => {
    setIsUpdatingSettings(true);
    const cleanNumber = whatsappNumberInput.trim();
    const cleanHandle = instagramHandleInput.trim().replace(/^@/, '');
    setAppSettings((prev) => ({
      ...prev,
      whatsapp_number: cleanNumber,
      instagram_handle: cleanHandle,
    }));
    const res = await updateAppSettingsInDb({
      whatsapp_number: cleanNumber,
      instagram_handle: cleanHandle,
    });
    setIsUpdatingSettings(false);
    if (res.success) {
      triggerToast(
        lang === 'ar'
          ? 'تم حفظ إعدادات الواتساب وحساب الانستغرام بنجاح!'
          : 'WhatsApp number and Instagram handle saved successfully!',
        'success'
      );
    } else {
      triggerToast(res.error || 'Failed to save contact info', 'error');
    }
  };

  const handleSplashFileUpload = async (file: File) => {
    setIsUploadingSplashMedia(true);
    triggerToast(lang === 'ar' ? 'جارٍ رفع وسائط شاشة البداية إلى Supabase Storage...' : 'Uploading splash media to storage...', 'success');
    try {
      const { publicUrl, error } = await uploadMediaToStorage(file);
      if (error || !publicUrl) {
        throw new Error(error || 'Upload failed');
      }

      setAppSettings((prev) => ({ ...prev, splash_media_url: publicUrl }));
      setSplashCustomUrl(publicUrl);
      const res = await updateAppSettingsInDb({ splash_media_url: publicUrl });
      if (res.success) {
        triggerToast(lang === 'ar' ? 'تم تحديث وحفظ وسائط خلفية شاشة البداية بنجاح!' : 'Splash media uploaded and saved successfully!', 'success');
      } else {
        throw new Error(res.error || 'Failed to save settings');
      }
    } catch (err: any) {
      triggerToast(err.message || 'Error uploading media', 'error');
    } finally {
      setIsUploadingSplashMedia(false);
    }
  };

  const handleSaveSplashCustomUrl = async () => {
    setIsUpdatingSettings(true);
    const trimmed = splashCustomUrl.trim();
    setAppSettings((prev) => ({ ...prev, splash_media_url: trimmed }));
    const res = await updateAppSettingsInDb({ splash_media_url: trimmed });
    setIsUpdatingSettings(false);
    if (res.success) {
      triggerToast(lang === 'ar' ? 'تم حفظ رابط وسائط شاشة البداية بنجاح!' : 'Splash media URL saved successfully!', 'success');
    } else {
      triggerToast(res.error || 'Error saving URL', 'error');
    }
  };

  const handleRemoveSplashMedia = async () => {
    setIsUpdatingSettings(true);
    setAppSettings((prev) => ({ ...prev, splash_media_url: '' }));
    setSplashCustomUrl('');
    const res = await updateAppSettingsInDb({ splash_media_url: '' });
    setIsUpdatingSettings(false);
    if (res.success) {
      triggerToast(lang === 'ar' ? 'تمت إزالة وسائط خلفية شاشة البداية بنجاح' : 'Splash media removed successfully', 'success');
    }
  };

  const triggerLiveSplashSimulation = () => {
    setPreviewingSplash(true);
    setTimeout(() => {
      setPreviewingSplash(false);
    }, 3000);
  };

  const loadDatabaseProducts = async () => {
    setIsLoadingProducts(true);
    setDbError(null);

    if (!isSupabaseConfigured()) {
      const { products: fetched } = await fetchAdminProducts();
      setProducts(fetched);
      setIsLoadingProducts(false);
      return;
    }

    try {
      // Direct join query as requested in Phase 12
      const { data, error } = await supabase
        .from('products')
        .select('*, product_media(media_url)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching admin products from Supabase:', error);
        setDbError(error.message);
        setIsLoadingProducts(false);
        return;
      }

      const formatted: Product[] = (data || []).map((item: any) => {
        const base = formatSupabaseProduct(item);
        const joinedMedia = item.product_media || base.product_media || base.media || [];
        return {
          ...base,
          product_media: Array.isArray(joinedMedia) ? joinedMedia : [],
        };
      });

      setProducts(formatted);
    } catch (err: any) {
      console.error('Failed to load database products:', err);
      setDbError(err?.message || 'Failed to fetch products.');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoadingAuth(true);

    if (!isSupabaseConfigured()) {
      if (email && password) {
        setIsAuthenticated(true);
        setAdminUserEmail(email);
        triggerToast('Logged in (Local Preview Mode)', 'success');
      } else {
        setAuthError('Please enter an email and password.');
      }
      setIsLoadingAuth(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthError(error.message);
      } else if (data.user) {
        setIsAuthenticated(true);
        setAdminUserEmail(data.user.email || email);
        triggerToast('Welcome to VANT Admin Dashboard', 'success');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication error.');
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleSignOut = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setIsAuthenticated(false);
    setAdminUserEmail(null);
    triggerToast('Signed out successfully', 'success');
  };

  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setStatusToast({ message, type });
    setTimeout(() => setStatusToast(null), 3500);
  };

  // Multi-File Selection & Drag & Drop Handling (Phase 13: Guarantee JS File Objects)
  const handleFilesSelect = (filesInput: FileList | File[]) => {
    const rawFiles = Array.from(filesInput);
    console.log("handleFilesSelect received raw items:", rawFiles);

    const validFiles: File[] = [];
    let hasHeic = false;

    rawFiles.forEach((item) => {
      // Ensure the object is indeed a true JS File instance
      if (!(item instanceof File)) {
        console.warn("Item dropped/selected is not an instance of File:", item);
        return;
      }

      const file = item as File;
      const fileNameLower = file.name.toLowerCase();
      const fileTypeLower = (file.type || '').toLowerCase();

      // Block Apple HEIC / HEIF
      if (
        fileNameLower.endsWith('.heic') ||
        fileNameLower.endsWith('.heif') ||
        fileTypeLower.includes('heic') ||
        fileTypeLower.includes('heif')
      ) {
        hasHeic = true;
        return;
      }

      // Allow only web-safe image formats
      const isAllowed =
        fileTypeLower.startsWith('image/') ||
        fileNameLower.endsWith('.jpg') ||
        fileNameLower.endsWith('.jpeg') ||
        fileNameLower.endsWith('.png') ||
        fileNameLower.endsWith('.webp');

      if (isAllowed) {
        validFiles.push(file);
      }
    });

    if (hasHeic) {
      triggerToast(t.heicBlockedToast, 'error');
      alert(t.heicBlockedToast);
    }

    if (validFiles.length === 0) return;

    console.log("Valid JS File objects captured for state:", validFiles);

    const newItems: { file: File; previewUrl: string; id: string }[] = [];
    validFiles.forEach((file) => {
      const previewUrl = URL.createObjectURL(file);
      newItems.push({
        file,
        previewUrl,
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      });
    });
    setSelectedFiles((prev) => [...prev, ...newItems]);
  };

  const removeFileAtIndex = (index: number) => {
    setSelectedFiles((prev) => {
      const target = prev[index];
      if (target && target.file) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const clearAllSelectedFiles = () => {
    selectedFiles.forEach((item) => {
      if (item.file) {
        URL.revokeObjectURL(item.previewUrl);
      }
    });
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelect(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // Real CRUD: Delete Product from Supabase & Storage (Phase 10 Requirement 4)
  const handleDeleteProduct = async (productId: string, title: string) => {
    setDeletingProductId(productId);

    try {
      if (!isSupabaseConfigured()) {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        triggerToast(`${t.deleteSuccessToast}: "${title}"`, 'success');
        return;
      }

      const { success, error } = await deleteProductFromDb(productId);

      if (success) {
        // Immediate list refresh and notification
        await loadDatabaseProducts();
        triggerToast(`${t.deleteSuccessToast}: "${title}"`, 'success');
      } else {
        triggerToast(`${t.deleteErrorToast}: ${error || ''}`, 'error');
      }
    } catch (err: any) {
      triggerToast(`${t.deleteErrorToast}: ${err?.message || ''}`, 'error');
    } finally {
      setDeletingProductId(null);
    }
  };

  // Real CRUD: Edit Product - Populates form with product data & existing images (Phase 16)
  const handleEditProduct = (p: Product) => {
    setEditingProductId(p.id);
    setNewTitle(p.title || '');
    setNewCategory((p.category as any) || 'T-Shirts');
    setNewPrice(p.price ? p.price.toString() : '');
    setNewSizes(p.sizes && p.sizes.length > 0 ? p.sizes.join(', ') : 'S, M, L, XL');
    setNewColors(p.colors && p.colors.length > 0 ? p.colors.join(', ') : 'Black');
    setNewDescription(p.description || '');
    setNewFitDetails(p.fit_details || '');
    setNewMaterial(p.material || '');
    setNewIsExclusive(Boolean(p.is_exclusive_drop));
    setNewStatus(p.status || 'AVAILABLE');

    // Phase 16 Requirement 3: Load existing images from product_media into Dropzone preview state
    const existingMedia = (p.product_media && p.product_media.length > 0)
      ? p.product_media
      : (p.media && p.media.length > 0)
      ? p.media
      : [];

    const existingItems = existingMedia
      .map((m: any, idx: number) => {
        const url = typeof m === 'string' ? m : m.media_url;
        return {
          previewUrl: url,
          id: `existing-${p.id}-${idx}`,
          isExisting: true,
        };
      })
      .filter((item) => typeof item.previewUrl === 'string' && item.previewUrl.trim().length > 0);

    setSelectedFiles(existingItems);
    setIsAddModalOpen(true);
  };

  const openAddModal = () => {
    setEditingProductId(null);
    resetForm();
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setIsAddModalOpen(false);
    setEditingProductId(null);
    resetForm();
  };

  // Real CRUD: Client-Side Image Compression + Multi-File Upload + Database Insert (Phase 15)
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. AGGRESSIVE ERROR HANDLING: Wrap the ENTIRE submit function in a strict try...catch block
    try {
      // 2. FIX FILE CAPTURE: Ensure the state holding the images is actually storing JS File objects
      const files: File[] = selectedFiles
        .filter((item): item is { file: File; previewUrl: string; id: string; isExisting?: boolean } => item.file instanceof File)
        .map((item) => item.file);

      // 3. CONSOLE LOGS FOR DEBUGGING: at the very beginning of the submit function
      console.log("Starting upload process...", files);

      if (!newTitle.trim() || !newPrice.trim()) {
        triggerToast(t.fillRequiredFields, 'error');
        alert("Please fill in Title and Price!");
        return;
      }

      const sizesArr = newSizes.split(',').map((s) => s.trim()).filter(Boolean);
      const colorsArr = newColors.split(',').map((c) => c.trim()).filter(Boolean);

      // Handle Edit Mode (when editingProductId exists)
      if (editingProductId) {
        setIsSubmitting(true);

        const newFilesToUpload = selectedFiles
          .filter((item) => item.file instanceof File)
          .map((item) => item.file as File);

        const existingUrls = selectedFiles
          .filter((item) => item.isExisting && item.previewUrl)
          .map((item) => item.previewUrl);

        const uploadedUrls: string[] = [];
        if (newFilesToUpload.length > 0) {
          // a) Compress Images
          setUploadProgressText(t.compressingImages);
          const compressedFiles = await compressMultipleImages(newFilesToUpload, (curr, total) => {
            setUploadProgressText(
              lang === 'ar'
                ? `جاري ضغط الصور (${curr}/${total})...`
                : `Compressing Images (${curr}/${total})...`
            );
          });

          // b) Upload to Storage
          setUploadProgressText(t.uploadingToStorage);
          for (let i = 0; i < compressedFiles.length; i++) {
            const file = compressedFiles[i];
            const fileExt = file.name.split('.').pop() || 'jpg';
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;
            const { data: uploadData, error: uploadError } = await supabase.storage.from('product-images').upload(filePath, file);
            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(filePath);
            if (urlData?.publicUrl) {
              uploadedUrls.push(urlData.publicUrl);
            }
          }
        }

        const finalMediaUrls = [...existingUrls, ...uploadedUrls];

        // c) Saving to Database
        setUploadProgressText(t.savingToDb);
        if (isSupabaseConfigured()) {
          const { success, error: updateError } = await updateProductInDb(
            editingProductId,
            {
              title: newTitle.trim(),
              category: newCategory,
              price: parseFloat(newPrice),
              sizes: sizesArr,
              colors: colorsArr,
              description: newDescription.trim(),
              fit_details: newFitDetails.trim(),
              material: newMaterial.trim(),
              is_exclusive_drop: newIsExclusive,
              status: newStatus,
            },
            finalMediaUrls.length > 0 ? finalMediaUrls : undefined
          );

          if (!success) {
            throw new Error(updateError || 'Failed to update product record.');
          }

          triggerToast(t.updateSuccessToast, 'success');
          closeModal();
          await loadDatabaseProducts();
        }
        return;
      }

      // Check: Before uploading, add a check: if (!files || files.length === 0) { alert("No image selected!"); return; }
      if (!files || files.length === 0) {
        alert("No image selected!");
        return;
      }

      setIsSubmitting(true);

      // =========================================================================
      // ROBUST PIPELINE (Phase 15):
      // Compress -> Upload to Supabase Storage -> Get Public URL -> Insert products -> Insert product_media
      // =========================================================================

      // a) Step 1: Compress Images using native HTML5 Canvas utility
      setUploadProgressText(t.compressingImages);
      console.log("Compressing images before upload...");
      const compressedFiles = await compressMultipleImages(files, (curr, total) => {
        setUploadProgressText(
          lang === 'ar'
            ? `جاري ضغط الصور (${curr}/${total})...`
            : `Compressing Images (${curr}/${total})...`
        );
      });
      console.log("Images compressed successfully:", compressedFiles);

      // b) Step 2: Upload to Supabase Storage with exact requested syntax
      setUploadProgressText(t.uploadingToStorage);
      const publicUrls: string[] = [];

      for (let i = 0; i < compressedFiles.length; i++) {
        const file = compressedFiles[i];
        setUploadProgressText(
          lang === 'ar'
            ? `جاري الرفع (${i + 1}/${compressedFiles.length})...`
            : `Uploading to Storage (${i + 1}/${compressedFiles.length})...`
        );

        const fileExt = file.name.split('.').pop() || 'jpg';
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage.from('product-images').upload(filePath, file);
        if (uploadError) throw uploadError;

        // ONLY AFTER a successful storage upload, get the public URL using getPublicUrl
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(filePath);
        if (!urlData?.publicUrl) {
          throw new Error(`Failed to get public URL for ${filePath}`);
        }
        publicUrls.push(urlData.publicUrl);
      }

      console.log("Storage upload successful! Public URLs:", publicUrls);

      // c) Step 3: Saving to Database (products + product_media)
      setUploadProgressText(t.savingToDb);

      if (isSupabaseConfigured()) {
        // 1. Insert into products table and GET THE ID:
        const { data: newProduct, error: productError } = await supabase
          .from('products')
          .insert([
            {
              title: newTitle.trim(),
              category: newCategory,
              price: parseFloat(newPrice),
              sizes: sizesArr,
              colors: colorsArr,
              description: newDescription.trim() || null,
              fit_details: newFitDetails.trim() || null,
              material: newMaterial.trim() || null,
              is_exclusive_drop: newIsExclusive,
              status: newStatus,
            },
          ])
          .select()
          .single();

        if (productError) throw productError;
        if (!newProduct || !newProduct.id) {
          throw new Error('Failed to retrieve newly inserted product ID.');
        }

        console.log("Product inserted successfully. New Product ID:", newProduct.id);

        // 2. CRITICAL STEP - Insert into product_media:
        for (let idx = 0; idx < publicUrls.length; idx++) {
          const publicUrl = publicUrls[idx];
          console.log(`Inserting into product_media (${idx + 1}/${publicUrls.length}):`, {
            product_id: newProduct.id,
            media_url: publicUrl,
            display_order: idx + 1,
          });

          const { error: mediaError } = await supabase
            .from('product_media')
            .insert([
              {
                product_id: newProduct.id,
                media_url: publicUrl,
                display_order: idx + 1,
              },
            ]);

          if (mediaError) throw mediaError;
        }

        console.log("All media records successfully inserted into product_media table!");

        triggerToast(t.uploadSuccessToast, 'success');
        closeModal();
        await loadDatabaseProducts();
      } else {
        // Local preview fallback
        const localProduct: Product = {
          id: `vant-${Date.now()}`,
          title: newTitle.trim(),
          category: newCategory,
          price: parseFloat(newPrice),
          sizes: sizesArr,
          colors: colorsArr,
          description: newDescription.trim(),
          fit_details: newFitDetails.trim(),
          material: newMaterial.trim(),
          is_exclusive_drop: newIsExclusive,
          status: newStatus,
          created_at: new Date().toISOString(),
          media: publicUrls.map((url, i) => ({
            id: `media-${Date.now()}-${i}`,
            product_id: `vant-${Date.now()}`,
            media_url: url,
            media_type: 'image',
            display_order: i + 1,
          })),
          product_media: publicUrls.map((url) => ({ media_url: url })),
        };

        setProducts((prev) => [localProduct, ...prev]);
        closeModal();
        triggerToast(t.uploadSuccessToast, 'success');
      }
    } catch (error: any) {
      console.error("Upload Error:", error);
      alert("Upload Error: " + (error?.message || error));
      triggerToast(`${t.uploadErrorToast}: ${error?.message || 'Error'}`, 'error');
    } finally {
      setIsSubmitting(false);
      setUploadProgressText('');
    }
  };

  const resetForm = () => {
    setEditingProductId(null);
    setNewTitle('');
    setNewPrice('');
    setNewDescription('');
    setNewFitDetails('');
    setNewMaterial('');
    setNewIsExclusive(false);
    setNewStatus('AVAILABLE');
    clearAllSelectedFiles();
  };

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className={`min-h-screen overflow-y-auto font-sans antialiased transition-colors duration-300 ${
        isDark ? 'bg-[#0a0a0a] text-white' : 'bg-[#f8f9fa] text-[#111111]'
      }`}
    >
      {/* 1. Login View */}
      {!isAuthenticated ? (
        <div className="relative min-h-screen flex items-center justify-center p-4">
          {/* Top-Right Toggles for Login Page */}
          <div className="absolute top-5 right-5 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              title="Toggle Language"
              className={`h-9 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer ${
                isDark
                  ? 'bg-neutral-900 border-neutral-700 text-white hover:bg-neutral-800'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-[#004ad7]" />
              <span className="font-mono">{lang === 'ar' ? 'EN' : 'عربي'}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsDark(!isDark)}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className={`w-9 h-9 rounded-xl border flex items-center justify-center shadow-sm transition-all active:scale-95 cursor-pointer ${
                isDark
                  ? 'bg-neutral-900 border-neutral-700 text-amber-400 hover:bg-neutral-800'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className={`w-full max-w-sm rounded-3xl p-8 shadow-xl border ${
              isDark ? 'bg-[#141414] border-neutral-800 text-white' : 'bg-white border-slate-200/80 text-[#111111]'
            }`}
          >
            <div className="text-center mb-8">
              <span className={`text-3xl font-black tracking-[-0.07em] uppercase font-mono block ${
                isDark ? 'text-white' : 'text-[#111111]'
              }`}>
                VANT
              </span>
              <div className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                isDark ? 'bg-neutral-800 text-neutral-300' : 'bg-slate-100 text-slate-700'
              }`}>
                <Lock className="w-3 h-3 text-[#004ad7]" />
                <span>{t.adminConsole}</span>
              </div>
            </div>

            {authError && (
              <div className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{authError}</span>
              </div>
            )}

            {!isSupabaseConfigured() && (
              <div className="mb-5 p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-blue-800 dark:text-blue-300 text-[11px] leading-relaxed">
                <strong>Notice:</strong> Running in local preview mode. For full production cloud storage and persistence, configure <code className="font-mono">VITE_SUPABASE_URL</code> and <code className="font-mono">VITE_SUPABASE_ANON_KEY</code>.
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                  isDark ? 'text-neutral-300' : 'text-slate-700'
                }`}>
                  {t.adminEmail}
                </label>
                <div className="relative flex items-center">
                  <Mail className={`absolute ${lang === 'ar' ? 'right-3.5' : 'left-3.5'} w-4 h-4 text-slate-400`} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@vant.co"
                    required
                    className={`w-full ${lang === 'ar' ? 'pr-10 pl-3.5' : 'pl-10 pr-3.5'} py-2.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#004ad7] ${
                      isDark
                        ? 'bg-neutral-900 border-neutral-700 text-white placeholder-neutral-500'
                        : 'bg-slate-50 border-slate-200 text-[#111111]'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                  isDark ? 'text-neutral-300' : 'text-slate-700'
                }`}>
                  {t.password}
                </label>
                <div className="relative flex items-center">
                  <Key className={`absolute ${lang === 'ar' ? 'right-3.5' : 'left-3.5'} w-4 h-4 text-slate-400`} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className={`w-full ${lang === 'ar' ? 'pr-10 pl-3.5' : 'pl-10 pr-3.5'} py-2.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#004ad7] ${
                      isDark
                        ? 'bg-neutral-900 border-neutral-700 text-white placeholder-neutral-500'
                        : 'bg-slate-50 border-slate-200 text-[#111111]'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoadingAuth}
                className="w-full py-3 rounded-xl bg-[#004ad7] hover:bg-[#003cb0] text-white text-xs font-bold tracking-wider uppercase transition-all shadow-md shadow-[#004ad7]/20 disabled:opacity-50 cursor-pointer"
              >
                {isLoadingAuth ? t.authenticating : t.signIn}
              </button>
            </form>

            <div className={`mt-6 pt-4 border-t text-center ${
              isDark ? 'border-neutral-800' : 'border-slate-100'
            }`}>
              <Link
                to="/"
                className={`inline-flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                  isDark ? 'text-neutral-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <ArrowLeft className={`w-3.5 h-3.5 ${lang === 'ar' ? 'rotate-180' : ''}`} />
                <span>{t.returnLookbook}</span>
              </Link>
            </div>
          </motion.div>
        </div>
      ) : (
        /* 2. Authenticated Admin Dashboard */
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
          {/* Top Bar */}
          <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b mb-8 ${
            isDark ? 'border-neutral-800' : 'border-slate-200'
          }`}>
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className={`w-10 h-10 rounded-full border flex items-center justify-center shadow-sm transition-colors ${
                  isDark
                    ? 'bg-neutral-850 border-neutral-700 text-neutral-300 hover:text-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:text-slate-950'
                }`}
                title={t.returnLookbook}
              >
                <ArrowLeft className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`} />
              </Link>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-2xl font-black tracking-tight uppercase font-mono ${
                    isDark ? 'text-white' : 'text-[#111111]'
                  }`}>
                    VANT
                  </span>
                  <span className="text-[10px] font-bold text-[#004ad7] bg-[#004ad7]/10 px-2 py-0.5 rounded-md">
                    {t.adminBadge}
                  </span>

                  {/* Profile Quick Toggles */}
                  <div className="inline-flex items-center gap-1 p-0.5 rounded-lg border border-slate-200 dark:border-neutral-700 bg-white/70 dark:bg-neutral-800/80">
                    <button
                      type="button"
                      onClick={() => setIsDark(!isDark)}
                      className="p-1 rounded text-slate-700 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-neutral-700 cursor-pointer"
                      title={isDark ? 'Light Mode' : 'Dark Mode'}
                    >
                      {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
                      className="px-1.5 py-0.5 text-[10px] font-bold font-mono text-slate-700 dark:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-700 rounded cursor-pointer"
                      title="Switch Language"
                    >
                      {lang === 'ar' ? 'EN' : 'عربي'}
                    </button>
                  </div>

                  {isSupabaseConfigured() ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/60">
                      <Database className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                      {t.storageActive}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800/60">
                      {t.localPreview}
                    </span>
                  )}
                </div>
                <p className={`text-xs mt-0.5 ${
                  isDark ? 'text-neutral-400' : 'text-slate-500'
                }`}>
                  {t.loggedInAs} <strong className={isDark ? 'text-neutral-200' : 'text-slate-800'}>{adminUserEmail}</strong>
                </p>
              </div>
            </div>

            {/* Header Action Controls: IMMEDIATELY NEXT TO LIVE FEED */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={loadDatabaseProducts}
                title={t.refresh}
                className={`w-9 h-9 rounded-xl border flex items-center justify-center shadow-sm transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-neutral-800 border-neutral-700 text-neutral-200 hover:text-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingProducts ? 'animate-spin text-[#004ad7]' : ''}`} />
              </button>

              <Link
                to="/"
                target="_blank"
                className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors ${
                  isDark
                    ? 'bg-neutral-800 border-neutral-700 text-neutral-200 hover:text-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900'
                }`}
              >
                <span>{t.liveFeed}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              {/* Theme Switcher Toggle (Sun / Moon) - PLACED DIRECTLY NEXT TO LIVE FEED */}
              <button
                type="button"
                onClick={() => setIsDark(!isDark)}
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                className={`h-9 px-3 rounded-xl border flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer ${
                  isDark
                    ? 'bg-neutral-800 border-neutral-700 text-amber-400 hover:bg-neutral-700'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
                <span className="font-mono text-xs font-bold">{isDark ? 'LIGHT' : 'DARK'}</span>
              </button>

              {/* Language Switcher Toggle (AR / EN) - PLACED DIRECTLY NEXT TO LIVE FEED */}
              <button
                type="button"
                onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
                title="Toggle Language / تغيير اللغة"
                className={`h-9 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer ${
                  isDark
                    ? 'bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-[#004ad7]" />
                <span className="font-mono text-xs font-bold">{lang === 'ar' ? 'EN' : 'عربي'}</span>
              </button>

              <button
                onClick={openAddModal}
                className="px-4 py-2 rounded-xl bg-[#004ad7] hover:bg-[#003cb0] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#004ad7]/20 transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t.addProduct}</span>
              </button>

              <button
                onClick={handleSignOut}
                className={`p-2 rounded-xl border shadow-sm transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:text-red-400'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-red-600'
                }`}
                title={t.signOut}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Database Notice or Error */}
          {dbError && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>{dbError}</span>
            </div>
          )}

          {/* Phase 27: Toggle/Tab System [Catalog Management] | [Store Settings] */}
          <div className={`flex items-center gap-3 mb-8 border-b pb-4 ${
            isDark ? 'border-neutral-800' : 'border-slate-200'
          }`}>
            <button
              onClick={() => setAdminTab('catalog')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                adminTab === 'catalog'
                  ? 'bg-[#004ad7] text-white shadow-lg shadow-[#004ad7]/25'
                  : isDark
                  ? 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>{t.catalogTab}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                adminTab === 'catalog'
                  ? 'bg-white/20 text-white'
                  : isDark ? 'bg-neutral-800 text-neutral-300' : 'bg-slate-100 text-slate-700'
              }`}>
                {products.length}
              </span>
            </button>

            <button
              onClick={() => setAdminTab('settings')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                adminTab === 'settings'
                  ? 'bg-[#004ad7] text-white shadow-lg shadow-[#004ad7]/25'
                  : isDark
                  ? 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>{t.settingsTab}</span>
              {appSettings.splash_enabled && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>
          </div>

          {/* TAB 1: Catalog Management */}
          {adminTab === 'catalog' && (
            <>
              {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className={`rounded-2xl p-5 border shadow-sm ${
              isDark ? 'bg-[#141414] border-neutral-800 text-white' : 'bg-white border-slate-200 text-[#111111]'
            }`}>
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">{t.totalDrops}</span>
                <Package className="w-4 h-4 text-[#004ad7]" />
              </div>
              <p className={`text-3xl font-black font-mono ${
                isDark ? 'text-white' : 'text-[#111111]'
              }`}>
                {isLoadingProducts ? '...' : products.length}
              </p>
              <span className={`text-[10px] mt-1 block ${
                isDark ? 'text-neutral-400' : 'text-slate-400'
              }`}>{t.syncedDb}</span>
            </div>

            <div className={`rounded-2xl p-5 border shadow-sm ${
              isDark ? 'bg-[#141414] border-neutral-800 text-white' : 'bg-white border-slate-200 text-[#111111]'
            }`}>
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">{t.exclusiveCount}</span>
                <Sparkles className="w-4 h-4 text-[#004ad7]" />
              </div>
              <p className={`text-3xl font-black font-mono ${
                isDark ? 'text-white' : 'text-[#111111]'
              }`}>
                {isLoadingProducts ? '...' : products.filter((p) => p.is_exclusive_drop).length}
              </p>
              <span className={`text-[10px] mt-1 block ${
                isDark ? 'text-neutral-400' : 'text-slate-400'
              }`}>{t.exclusive}</span>
            </div>

            <div className={`rounded-2xl p-5 border shadow-sm ${
              isDark ? 'bg-[#141414] border-neutral-800 text-white' : 'bg-white border-slate-200 text-[#111111]'
            }`}>
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">{t.activeCategories}</span>
                <Layers className="w-4 h-4 text-[#004ad7]" />
              </div>
              <p className={`text-3xl font-black font-mono ${
                isDark ? 'text-white' : 'text-[#111111]'
              }`}>
                {isLoadingProducts ? '...' : new Set(products.map((p) => p.category)).size}
              </p>
              <span className={`text-[10px] mt-1 block ${
                isDark ? 'text-neutral-400' : 'text-slate-400'
              }`}>T-Shirts, Hoodies, Pants, etc.</span>
            </div>
          </div>

          {/* Products List: Mobile Cards + Desktop Table */}
          <div className={`rounded-2xl border shadow-sm overflow-hidden ${
            isDark ? 'bg-[#141414] border-neutral-800' : 'bg-white border-slate-200'
          }`}>
            <div className={`px-6 py-4 border-b flex items-center justify-between ${
              isDark ? 'border-neutral-800' : 'border-slate-100'
            }`}>
              <div>
                <h2 className={`text-base font-bold ${
                  isDark ? 'text-white' : 'text-[#111111]'
                }`}>{t.productsCatalog}</h2>
                <p className={`text-xs ${
                  isDark ? 'text-neutral-400' : 'text-slate-400'
                }`}>{t.syncedDb}</p>
              </div>
              <span className="text-xs font-mono font-bold text-[#004ad7] bg-[#004ad7]/10 px-2.5 py-1 rounded-full">
                {products.length} {t.productsCatalog.split(' ')[0]}
              </span>
            </div>

            {isLoadingProducts ? (
              <div className="p-16 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-6 h-6 animate-spin text-[#004ad7]" />
                <span>{t.authenticating}</span>
              </div>
            ) : products.length === 0 ? (
              <div className="p-16 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-3">
                <Package className="w-10 h-10 text-slate-300 dark:text-neutral-600 stroke-1" />
                <span className={`font-bold text-sm ${
                  isDark ? 'text-neutral-300' : 'text-slate-700'
                }`}>{t.noProducts}</span>
                <p className="text-slate-400 max-w-sm">
                  {t.addFirstPrompt}
                </p>
                <button
                  onClick={openAddModal}
                  className="mt-2 px-4 py-2 rounded-xl bg-[#004ad7] text-white text-xs font-bold cursor-pointer"
                >
                  {t.addFirstBtn}
                </button>
              </div>
            ) : (
              <>
                {/* Mobile Cards View */}
                <div className="block md:hidden p-4 space-y-3">
                  {products.map((p) => {
                    const imageUrl = p.product_media && p.product_media.length > 0 ? p.product_media[0].media_url : null;
                    return (
                    <div
                      key={p.id}
                      className={`p-3.5 rounded-2xl border flex flex-col gap-3 shadow-sm ${
                        isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-slate-200/90'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={p.title}
                            referrerPolicy="no-referrer"
                            className="w-16 h-20 object-cover rounded-xl bg-neutral-100 dark:bg-neutral-800 shrink-0 border border-neutral-200 dark:border-neutral-800"
                          />
                        ) : (
                          <div className="w-16 h-20 rounded-xl bg-neutral-200 dark:bg-neutral-800 flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-500 shrink-0 border border-neutral-300 dark:border-neutral-700">
                            <ImageIcon className="w-6 h-6 stroke-1 text-neutral-400 dark:text-neutral-500 mb-1" />
                            <span className="text-[9px] font-mono font-bold">NO IMG</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <span className="text-[10px] font-mono font-bold text-[#004ad7] uppercase">
                              {p.category}
                            </span>
                            {p.status === 'SOLD_OUT' ? (
                              <span className="text-[9px] font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/60 px-1.5 py-0.5 rounded border border-red-300 dark:border-red-900/60">
                                {lang === 'ar' ? 'نفدت الكمية' : 'SOLD OUT'}
                              </span>
                            ) : p.status === 'COMING_SOON' ? (
                              <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-300 dark:border-amber-900/60">
                                {lang === 'ar' ? 'قريباً' : 'SOON'}
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-300 dark:border-emerald-900/60">
                                {lang === 'ar' ? 'متوفر' : 'AVAILABLE'}
                              </span>
                            )}
                            {p.is_exclusive_drop && (
                              <span className="text-[9px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-950/60 px-1.5 py-0.5 rounded">
                                {t.exclusive}
                              </span>
                            )}
                          </div>
                          <h4 className={`text-sm font-bold truncate ${
                            isDark ? 'text-white' : 'text-[#111111]'
                          }`}>{p.title}</h4>
                          <span className="text-base font-black font-mono text-[#004ad7] block mt-0.5">
                            ${p.price.toFixed(2)}
                          </span>
                          <span className="text-[11px] text-slate-400 block truncate">
                            {t.sizes}: {p.sizes.join(', ')}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className={`pt-2.5 border-t flex items-center justify-end gap-2 ${
                        isDark ? 'border-neutral-800' : 'border-slate-100'
                      }`}>
                        <button
                          onClick={() => handleEditProduct(p)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                            isDark ? 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>{t.edit}</span>
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.title)}
                          disabled={deletingProductId === p.id}
                          className="px-3.5 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-1.5 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          {deletingProductId === p.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-red-500" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          )}
                          <span>{deletingProductId === p.id ? '...' : t.delete}</span>
                        </button>
                      </div>
                    </div>
                  );})}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className={`border-b font-bold uppercase tracking-wider ${
                        isDark
                          ? 'bg-neutral-900/80 border-neutral-800 text-neutral-400'
                          : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}>
                        <th className="py-3.5 px-6">Product</th>
                        <th className="py-3.5 px-4">Category</th>
                        <th className="py-3.5 px-4">Price</th>
                        <th className="py-3.5 px-4">Sizes</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${
                      isDark ? 'divide-neutral-800' : 'divide-slate-100'
                    }`}>
                      {products.map((p) => {
                        const imageUrl = p.product_media && p.product_media.length > 0 ? p.product_media[0].media_url : null;
                        return (
                        <tr key={p.id} className={`transition-colors ${
                          isDark ? 'hover:bg-neutral-800/40' : 'hover:bg-slate-50/70'
                        }`}>
                          <td className="py-3 px-6 flex items-center gap-3">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={p.title}
                                referrerPolicy="no-referrer"
                                className="w-12 h-14 object-cover rounded-lg bg-neutral-100 dark:bg-neutral-800 shrink-0 border border-neutral-200 dark:border-neutral-800"
                              />
                            ) : (
                              <div className="w-12 h-14 rounded-lg bg-neutral-200 dark:bg-neutral-800 flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-500 shrink-0 border border-neutral-300 dark:border-neutral-700">
                                <ImageIcon className="w-4 h-4 stroke-1 text-neutral-400 dark:text-neutral-500" />
                                <span className="text-[8px] font-mono font-bold mt-0.5">NO IMG</span>
                              </div>
                            )}
                            <div className="max-w-xs">
                              <span className={`font-bold block leading-tight truncate ${
                                isDark ? 'text-white' : 'text-[#111111]'
                              }`}>
                                {p.title}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                ID: {p.id.slice(0, 8)}...
                              </span>
                            </div>
                          </td>
                          <td className={`py-3 px-4 font-semibold ${
                            isDark ? 'text-neutral-300' : 'text-slate-700'
                          }`}>{p.category}</td>
                          <td className="py-3 px-4 font-mono font-bold text-[#004ad7]">${p.price.toFixed(2)}</td>
                          <td className={`py-3 px-4 ${
                            isDark ? 'text-neutral-400' : 'text-slate-600'
                          }`}>{p.sizes.join(', ')}</td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col gap-1 items-start">
                              {p.status === 'SOLD_OUT' ? (
                                <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 font-bold text-[10px] uppercase">
                                  {lang === 'ar' ? 'نفدت الكمية' : 'SOLD OUT'}
                                </span>
                              ) : p.status === 'COMING_SOON' ? (
                                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold text-[10px] uppercase">
                                  {lang === 'ar' ? 'قريباً' : 'COMING SOON'}
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold text-[10px] uppercase">
                                  {lang === 'ar' ? 'متوفر' : 'AVAILABLE'}
                                </span>
                              )}
                              {p.is_exclusive_drop && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold text-[#004ad7] bg-[#004ad7]/10 uppercase">
                                  {t.exclusive}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleEditProduct(p)}
                                className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                                  isDark
                                    ? 'border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                                    : 'border-slate-200 text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                                }`}
                                title={t.edit}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id, p.title)}
                                disabled={deletingProductId === p.id}
                                className="p-2 rounded-lg border border-red-200 dark:border-red-900/60 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50 cursor-pointer"
                                title={t.delete}
                              >
                                {deletingProductId === p.id ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-red-500" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
            </>
          )}

          {/* TAB 2: Phase 27 Store Settings & Cinematic Splash Screen Engine */}
          {adminTab === 'settings' && (
            <div className="space-y-6">
              {/* Header Card */}
              <div className={`p-6 rounded-2xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                isDark ? 'bg-[#141414] border-neutral-800' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#004ad7]/10 flex items-center justify-center text-[#004ad7]">
                    <Film className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className={`text-base font-bold ${
                      isDark ? 'text-white' : 'text-[#111111]'
                    }`}>
                      {t.splashSettingsTitle}
                    </h2>
                    <p className={`text-xs mt-0.5 max-w-xl ${
                      isDark ? 'text-neutral-400' : 'text-slate-500'
                    }`}>
                      {t.splashSettingsDesc}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={triggerLiveSplashSimulation}
                  className="px-4 py-2.5 rounded-xl bg-[#004ad7] hover:bg-[#003cb0] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-[#004ad7]/20 transition-all active:scale-95 cursor-pointer shrink-0"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{t.previewSplash}</span>
                </button>
              </div>

              {/* Settings Engine Card */}
              <div className={`p-6 md:p-8 rounded-2xl border shadow-sm space-y-8 ${
                isDark ? 'bg-[#141414] border-neutral-800 text-white' : 'bg-white border-slate-200 text-[#111111]'
              }`}>
                {/* 1. Toggle Switch: Enable Splash Screen */}
                <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{t.splashToggleLabel}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        appSettings.splash_enabled
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : 'bg-slate-200 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400'
                      }`}>
                        {appSettings.splash_enabled ? (lang === 'ar' ? 'مفعل' : 'Active') : (lang === 'ar' ? 'معطل' : 'Disabled')}
                      </span>
                    </div>
                    <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                      {t.splashToggleSub}
                    </p>
                  </div>

                  {/* UI Toggle Switch */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={appSettings.splash_enabled}
                    disabled={isUpdatingSettings}
                    onClick={() => handleToggleSplash(!appSettings.splash_enabled)}
                    className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#004ad7] ${
                      appSettings.splash_enabled ? 'bg-[#004ad7]' : isDark ? 'bg-neutral-700' : 'bg-slate-300'
                    } ${isUpdatingSettings ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        appSettings.splash_enabled ? (lang === 'ar' ? '-translate-x-7' : 'translate-x-7') : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* 2. Drag & Drop Media Upload Zone */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider">{t.splashMediaTitle}</h3>
                      <p className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                        {t.splashMediaSub}
                      </p>
                    </div>
                    {appSettings.splash_media_url && (
                      <span className="text-[10px] font-bold text-[#004ad7] bg-[#004ad7]/10 px-2 py-0.5 rounded-full">
                        {appSettings.splash_media_url.match(/\.(mp4|webm|mov|ogg)(\?.*)?$/i) ? 'Video Background' : 'Image Background'}
                      </span>
                    )}
                  </div>

                  {/* Upload Drop Zone */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingSplash(true);
                    }}
                    onDragLeave={() => setIsDraggingSplash(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingSplash(false);
                      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        const file = e.dataTransfer.files[0];
                        handleSplashFileUpload(file);
                      }
                    }}
                    onClick={() => splashFileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                      isDraggingSplash
                        ? 'border-[#004ad7] bg-[#004ad7]/10 scale-[0.99]'
                        : isDark
                        ? 'border-neutral-700 bg-neutral-900/40 hover:border-neutral-600 hover:bg-neutral-900/80'
                        : 'border-slate-300 bg-slate-50/70 hover:border-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      ref={splashFileInputRef}
                      type="file"
                      accept="image/*,video/mp4,video/webm,video/quicktime"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          const file = e.target.files[0];
                          handleSplashFileUpload(file);
                        }
                      }}
                    />

                    <div className="w-12 h-12 rounded-2xl bg-[#004ad7]/10 flex items-center justify-center text-[#004ad7]">
                      {isUploadingSplashMedia ? (
                        <RefreshCw className="w-6 h-6 animate-spin" />
                      ) : (
                        <UploadCloud className="w-6 h-6" />
                      )}
                    </div>

                    <div>
                      <p className="text-xs font-bold">{t.splashMediaDropTitle}</p>
                      <p className={`text-[11px] mt-1 ${isDark ? 'text-neutral-400' : 'text-slate-400'}`}>
                        {isUploadingSplashMedia ? 'Uploading to Supabase Storage (product-images bucket)...' : t.splashMediaSub}
                      </p>
                    </div>
                  </div>

                  {/* Active Media Preview (If media is configured) */}
                  {appSettings.splash_media_url && (
                    <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
                      isDark ? 'bg-neutral-900/80 border-neutral-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="relative w-24 h-16 rounded-xl overflow-hidden bg-black shrink-0 border border-white/10 flex items-center justify-center">
                          {appSettings.splash_media_url.match(/\.(mp4|webm|mov|ogg)(\?.*)?$/i) ? (
                            <video
                              src={appSettings.splash_media_url}
                              autoPlay
                              loop
                              muted
                              playsInline
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <img
                              src={appSettings.splash_media_url}
                              alt="Splash Preview"
                              className="w-full h-full object-cover"
                            />
                          )}
                          <div className="absolute inset-0 bg-black/20" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold truncate">
                            {appSettings.splash_media_url.split('/').pop()?.split('?')[0] || 'splash-media'}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate max-w-xs font-mono">
                            {appSettings.splash_media_url}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button
                          type="button"
                          onClick={triggerLiveSplashSimulation}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                            isDark ? 'border-neutral-700 hover:bg-neutral-800 text-neutral-200' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <Play className="w-3 h-3" />
                          <span>{lang === 'ar' ? 'معاينة' : 'Preview'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveSplashMedia}
                          disabled={isUpdatingSettings}
                          className="px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/60 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>{t.removeSplashMedia}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 3. Direct URL Input Alternative */}
                  <div className="pt-2">
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                      isDark ? 'text-neutral-300' : 'text-slate-700'
                    }`}>
                      {t.splashMediaUrlLabel}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        value={splashCustomUrl}
                        onChange={(e) => setSplashCustomUrl(e.target.value)}
                        placeholder={t.splashMediaUrlPlaceholder}
                        className={`flex-1 px-4 py-2.5 border rounded-xl text-xs focus:ring-2 focus:ring-[#004ad7]/20 focus:border-[#004ad7] focus:outline-none transition-all ${
                          isDark
                            ? 'bg-neutral-900 border-neutral-700 text-white placeholder-neutral-500'
                            : 'bg-slate-50 border-slate-200 text-[#111111]'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={handleSaveSplashCustomUrl}
                        disabled={isUpdatingSettings}
                        className="px-5 py-2.5 rounded-xl bg-[#004ad7] hover:bg-[#003cb0] text-white text-xs font-bold shrink-0 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {isUpdatingSettings ? t.savingSettings : t.saveSettings}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Feed UX (Parallax & Smart Header) Card */}
              <div className={`p-6 md:p-8 rounded-2xl border shadow-sm space-y-6 ${
                isDark ? 'bg-[#141414] border-neutral-800 text-white' : 'bg-white border-slate-200 text-[#111111]'
              }`}>
                <div>
                  <h3 className="text-base font-bold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#004ad7]" />
                    <span>{t.feedUxTitle}</span>
                  </h3>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                    {t.feedUxDesc}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* a) Parallax Breathing Effect Toggle */}
                  <div className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 ${
                    isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{t.parallaxToggleLabel}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          appSettings.parallax_enabled !== false
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : 'bg-slate-200 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400'
                        }`}>
                          {appSettings.parallax_enabled !== false ? (lang === 'ar' ? 'مفعل' : 'Active') : (lang === 'ar' ? 'معطل' : 'Disabled')}
                        </span>
                      </div>
                      <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                        {t.parallaxToggleSub}
                      </p>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={appSettings.parallax_enabled !== false}
                        disabled={isUpdatingSettings}
                        onClick={() => handleToggleParallax(appSettings.parallax_enabled === false)}
                        className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#004ad7] ${
                          appSettings.parallax_enabled !== false ? 'bg-[#004ad7]' : isDark ? 'bg-neutral-700' : 'bg-slate-300'
                        } ${isUpdatingSettings ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                            appSettings.parallax_enabled !== false ? (lang === 'ar' ? '-translate-x-7' : 'translate-x-7') : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* b) Smart Auto-Hiding Header Toggle */}
                  <div className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 ${
                    isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{t.smartHeaderToggleLabel}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          appSettings.smart_header_enabled !== false
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : 'bg-slate-200 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400'
                        }`}>
                          {appSettings.smart_header_enabled !== false ? (lang === 'ar' ? 'مفعل' : 'Active') : (lang === 'ar' ? 'معطل' : 'Disabled')}
                        </span>
                      </div>
                      <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                        {t.smartHeaderToggleSub}
                      </p>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={appSettings.smart_header_enabled !== false}
                        disabled={isUpdatingSettings}
                        onClick={() => handleToggleSmartHeader(appSettings.smart_header_enabled === false)}
                        className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#004ad7] ${
                          appSettings.smart_header_enabled !== false ? 'bg-[#004ad7]' : isDark ? 'bg-neutral-700' : 'bg-slate-300'
                        } ${isUpdatingSettings ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                            appSettings.smart_header_enabled !== false ? (lang === 'ar' ? '-translate-x-7' : 'translate-x-7') : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Phase 29: Dynamic Product Details & Smart CTA Card */}
              <div className={`p-6 md:p-8 rounded-2xl border shadow-sm space-y-6 ${
                isDark ? 'bg-[#141414] border-neutral-800 text-white' : 'bg-white border-slate-200 text-[#111111]'
              }`}>
                <div>
                  <h3 className="text-base font-bold flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-[#004ad7]" />
                    <span>{t.productDetailsUxTitle}</span>
                  </h3>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                    {t.productDetailsUxDesc}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* a) Show Fit Guide Toggle */}
                  <div className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 ${
                    isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Ruler className="w-4 h-4 text-[#004ad7]" />
                        <span className="text-sm font-bold">{t.showFitGuideLabel}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          appSettings.show_fit_guide !== false
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : 'bg-slate-200 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400'
                        }`}>
                          {appSettings.show_fit_guide !== false ? (lang === 'ar' ? 'مفعل' : 'Active') : (lang === 'ar' ? 'معطل' : 'Disabled')}
                        </span>
                      </div>
                      <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                        {t.showFitGuideSub}
                      </p>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={appSettings.show_fit_guide !== false}
                        disabled={isUpdatingSettings}
                        onClick={() => handleToggleFitGuide(appSettings.show_fit_guide === false)}
                        className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#004ad7] ${
                          appSettings.show_fit_guide !== false ? 'bg-[#004ad7]' : isDark ? 'bg-neutral-700' : 'bg-slate-300'
                        } ${isUpdatingSettings ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                            appSettings.show_fit_guide !== false ? (lang === 'ar' ? '-translate-x-7' : 'translate-x-7') : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* b) Show Material Info Toggle */}
                  <div className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 ${
                    isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#004ad7]" />
                        <span className="text-sm font-bold">{t.showMaterialInfoLabel}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          appSettings.show_material_info !== false
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : 'bg-slate-200 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400'
                        }`}>
                          {appSettings.show_material_info !== false ? (lang === 'ar' ? 'مفعل' : 'Active') : (lang === 'ar' ? 'معطل' : 'Disabled')}
                        </span>
                      </div>
                      <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                        {t.showMaterialInfoSub}
                      </p>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={appSettings.show_material_info !== false}
                        disabled={isUpdatingSettings}
                        onClick={() => handleToggleMaterialInfo(appSettings.show_material_info === false)}
                        className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#004ad7] ${
                          appSettings.show_material_info !== false ? 'bg-[#004ad7]' : isDark ? 'bg-neutral-700' : 'bg-slate-300'
                        } ${isUpdatingSettings ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                            appSettings.show_material_info !== false ? (lang === 'ar' ? '-translate-x-7' : 'translate-x-7') : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* c) Enable WhatsApp Ordering Toggle */}
                  <div className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 ${
                    isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm font-bold">{t.enableWhatsappLabel}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          appSettings.enable_whatsapp !== false
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : 'bg-slate-200 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400'
                        }`}>
                          {appSettings.enable_whatsapp !== false ? (lang === 'ar' ? 'مفعل' : 'Active') : (lang === 'ar' ? 'معطل' : 'Disabled')}
                        </span>
                      </div>
                      <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                        {t.enableWhatsappSub}
                      </p>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={appSettings.enable_whatsapp !== false}
                        disabled={isUpdatingSettings}
                        onClick={() => handleToggleWhatsapp(appSettings.enable_whatsapp === false)}
                        className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#004ad7] ${
                          appSettings.enable_whatsapp !== false ? 'bg-[#004ad7]' : isDark ? 'bg-neutral-700' : 'bg-slate-300'
                        } ${isUpdatingSettings ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                            appSettings.enable_whatsapp !== false ? (lang === 'ar' ? '-translate-x-7' : 'translate-x-7') : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* d) Enable Instagram Ordering Toggle */}
                  <div className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 ${
                    isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Instagram className="w-4 h-4 text-pink-500" />
                        <span className="text-sm font-bold">{t.enableInstagramLabel}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          appSettings.enable_instagram !== false
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : 'bg-slate-200 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400'
                        }`}>
                          {appSettings.enable_instagram !== false ? (lang === 'ar' ? 'مفعل' : 'Active') : (lang === 'ar' ? 'معطل' : 'Disabled')}
                        </span>
                      </div>
                      <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                        {t.enableInstagramSub}
                      </p>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={appSettings.enable_instagram !== false}
                        disabled={isUpdatingSettings}
                        onClick={() => handleToggleInstagram(appSettings.enable_instagram === false)}
                        className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#004ad7] ${
                          appSettings.enable_instagram !== false ? 'bg-[#004ad7]' : isDark ? 'bg-neutral-700' : 'bg-slate-300'
                        } ${isUpdatingSettings ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                            appSettings.enable_instagram !== false ? (lang === 'ar' ? '-translate-x-7' : 'translate-x-7') : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Input Details: WhatsApp Number and Instagram Handle */}
                <div className={`p-5 rounded-2xl border space-y-4 ${
                  isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                        isDark ? 'text-neutral-300' : 'text-slate-700'
                      }`}>
                        {t.whatsappNumberLabel}
                      </label>
                      <div className="relative flex items-center">
                        <MessageCircle className={`absolute ${lang === 'ar' ? 'right-3.5' : 'left-3.5'} w-4 h-4 text-emerald-500`} />
                        <input
                          type="text"
                          value={whatsappNumberInput}
                          onChange={(e) => setWhatsappNumberInput(e.target.value)}
                          placeholder={t.whatsappNumberPlaceholder}
                          dir="ltr"
                          className={`w-full ${lang === 'ar' ? 'pr-10 pl-3.5' : 'pl-10 pr-3.5'} py-2.5 border rounded-xl text-xs font-mono focus:ring-2 focus:ring-[#004ad7]/20 focus:border-[#004ad7] focus:outline-none transition-all ${
                            isDark
                              ? 'bg-neutral-900 border-neutral-700 text-white placeholder-neutral-500'
                              : 'bg-white border-slate-200 text-[#111111]'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                        isDark ? 'text-neutral-300' : 'text-slate-700'
                      }`}>
                        {t.instagramHandleLabel}
                      </label>
                      <div className="relative flex items-center">
                        <Instagram className={`absolute ${lang === 'ar' ? 'right-3.5' : 'left-3.5'} w-4 h-4 text-pink-500`} />
                        <input
                          type="text"
                          value={instagramHandleInput}
                          onChange={(e) => setInstagramHandleInput(e.target.value)}
                          placeholder={t.instagramHandlePlaceholder}
                          dir="ltr"
                          className={`w-full ${lang === 'ar' ? 'pr-10 pl-3.5' : 'pl-10 pr-3.5'} py-2.5 border rounded-xl text-xs font-mono focus:ring-2 focus:ring-[#004ad7]/20 focus:border-[#004ad7] focus:outline-none transition-all ${
                            isDark
                              ? 'bg-neutral-900 border-neutral-700 text-white placeholder-neutral-500'
                              : 'bg-white border-slate-200 text-[#111111]'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleSaveContactInfo}
                      disabled={isUpdatingSettings}
                      className="px-6 py-2.5 rounded-xl bg-[#004ad7] hover:bg-[#003cb0] text-white text-xs font-bold transition-all shadow-md shadow-[#004ad7]/20 disabled:opacity-50 cursor-pointer"
                    >
                      {isUpdatingSettings ? t.savingSettings : t.saveCtaSettings}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add/Edit Product Modal (Multi-Angle Media & SaaS Form) */}
          <AnimatePresence>
            {isAddModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={closeModal}
                  className="fixed inset-0 bg-black/70 backdrop-blur-sm"
                />

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`relative z-10 w-full max-w-2xl max-h-[92vh] rounded-3xl p-6 md:p-8 shadow-2xl border flex flex-col overflow-hidden ${
                    isDark ? 'bg-[#141414] border-neutral-800 text-white' : 'bg-white border-slate-200 text-[#111111]'
                  }`}
                >
                  <div className={`flex items-center justify-between pb-4 border-b mb-5 ${
                    isDark ? 'border-neutral-800' : 'border-slate-100'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#004ad7]/10 flex items-center justify-center text-[#004ad7]">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className={`text-base font-bold ${
                            isDark ? 'text-white' : 'text-[#111111]'
                          }`}>{editingProductId ? t.editDropTitle : t.addProduct}</h3>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                            Multi-Angle Media
                          </span>
                        </div>
                        <p className={`text-xs mt-0.5 ${
                          isDark ? 'text-neutral-400' : 'text-slate-400'
                        }`}>
                          Upload lookbook photography to Supabase Storage and publish directly to live catalog
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={closeModal}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                        isDark ? 'bg-neutral-800 text-neutral-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleAddProduct} className="flex-1 overflow-y-auto space-y-4 pr-1">
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                        isDark ? 'text-neutral-300' : 'text-slate-700'
                      }`}>
                        {t.titleLabel} *
                      </label>
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="e.g. VANT Heavyweight Boxy Tee"
                        required
                        className={`w-full px-4 py-2.5 border rounded-xl text-xs focus:ring-2 focus:ring-[#004ad7]/20 focus:border-[#004ad7] focus:outline-none transition-all ${
                          isDark
                            ? 'bg-neutral-900 border-neutral-700 text-white placeholder-neutral-500'
                            : 'bg-slate-50 border-slate-200 text-[#111111]'
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                          isDark ? 'text-neutral-300' : 'text-slate-700'
                        }`}>
                          {t.categoryLabel}
                        </label>
                        <select
                          value={newCategory}
                          onChange={(e: any) => setNewCategory(e.target.value)}
                          className={`w-full px-4 py-2.5 border rounded-xl text-xs focus:ring-2 focus:ring-[#004ad7]/20 focus:border-[#004ad7] focus:outline-none transition-all ${
                            isDark
                              ? 'bg-neutral-900 border-neutral-700 text-white'
                              : 'bg-slate-50 border-slate-200 text-[#111111]'
                          }`}
                        >
                          <option value="T-Shirts">T-Shirts</option>
                          <option value="Hoodies">Hoodies</option>
                          <option value="Pants">Pants</option>
                          <option value="Outerwear">Outerwear</option>
                          <option value="Coming Soon">Coming Soon</option>
                        </select>
                      </div>

                      <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                          isDark ? 'text-neutral-300' : 'text-slate-700'
                        }`}>
                          {t.priceLabel} *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={newPrice}
                          onChange={(e) => setNewPrice(e.target.value)}
                          placeholder="75.00"
                          required
                          className={`w-full px-4 py-2.5 border rounded-xl text-xs focus:ring-2 focus:ring-[#004ad7]/20 focus:border-[#004ad7] focus:outline-none font-mono transition-all ${
                            isDark
                              ? 'bg-neutral-900 border-neutral-700 text-white placeholder-neutral-500'
                              : 'bg-slate-50 border-slate-200 text-[#111111]'
                          }`}
                        />
                      </div>

                      <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                          isDark ? 'text-neutral-300' : 'text-slate-700'
                        }`}>
                          {t.dropStatusLabel}
                        </label>
                        <select
                          value={newStatus}
                          onChange={(e: any) => setNewStatus(e.target.value)}
                          className={`w-full px-4 py-2.5 border rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#004ad7]/20 focus:border-[#004ad7] focus:outline-none transition-all ${
                            newStatus === 'AVAILABLE'
                              ? 'text-emerald-500 border-emerald-500/30'
                              : newStatus === 'SOLD_OUT'
                              ? 'text-red-500 border-red-500/30'
                              : 'text-amber-500 border-amber-500/30'
                          } ${
                            isDark
                              ? 'bg-neutral-900'
                              : 'bg-slate-50'
                          }`}
                        >
                          <option value="AVAILABLE">{t.statusAvailable}</option>
                          <option value="SOLD_OUT">{t.statusSoldOut}</option>
                          <option value="COMING_SOON">{t.statusComingSoon}</option>
                        </select>
                      </div>
                    </div>

                    {/* Drag & Drop Upload Zone with Multi-Image Support */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className={`block text-xs font-bold uppercase tracking-wider ${
                          isDark ? 'text-neutral-300' : 'text-slate-700'
                        }`}>
                          {t.dragDropTitle.split('،')[0]} *
                        </label>
                        {selectedFiles.length > 0 && (
                          <span className="text-[11px] font-bold text-[#004ad7] bg-[#004ad7]/10 px-2.5 py-0.5 rounded-full">
                            {selectedFiles.length} {t.selectedAngles}
                          </span>
                        )}
                      </div>

                      <input
                        type="file"
                        ref={fileInputRef}
                        multiple
                        accept="image/jpeg, image/png, image/webp"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            handleFilesSelect(e.target.files);
                          }
                        }}
                        className="hidden"
                      />

                      {/* Large Distinct Drag & Drop Area */}
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        className={`w-full py-9 px-6 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                          isDragging
                            ? 'border-[#004ad7] bg-[#004ad7]/10 scale-[0.99] shadow-inner'
                            : isDark
                            ? 'border-neutral-700 bg-neutral-900/60 hover:border-[#004ad7]/80 hover:bg-blue-950/20'
                            : 'border-slate-300 bg-slate-50/80 hover:border-[#004ad7]/60 hover:bg-blue-50/20'
                        }`}
                      >
                        <div className={`w-14 h-14 rounded-2xl shadow-sm border flex items-center justify-center mb-3 text-[#004ad7] transition-transform group-hover:scale-105 ${
                          isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-slate-200'
                        }`}>
                          <UploadCloud className="w-7 h-7" />
                        </div>
                        <p className={`text-sm font-bold text-center ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}>
                          {t.dragDropTitle}
                        </p>
                        <p className={`text-xs mt-1 text-center ${
                          isDark ? 'text-neutral-400' : 'text-slate-500'
                        }`}>
                          {t.dragDropSub}
                        </p>
                        <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                          <span className={`px-2 py-0.5 rounded-md border ${
                            isDark ? 'bg-neutral-800 border-neutral-700 text-neutral-300' : 'bg-white border-slate-200 text-slate-600'
                          }`}>Multi-upload</span>
                          <span className={`px-2 py-0.5 rounded-md border ${
                            isDark ? 'bg-neutral-800 border-neutral-700 text-neutral-300' : 'bg-white border-slate-200 text-slate-600'
                          }`}>Supabase Storage</span>
                          <span className={`px-2 py-0.5 rounded-md border ${
                            isDark ? 'bg-neutral-800 border-neutral-700 text-neutral-300' : 'bg-white border-slate-200 text-slate-600'
                          }`}>Auto CDN</span>
                        </div>
                      </div>

                      {/* Gallery of Selected Angles */}
                      {selectedFiles.length > 0 && (
                        <div className="mt-3.5 space-y-2">
                          <div className={`flex items-center justify-between text-[11px] font-medium px-1 ${
                            isDark ? 'text-neutral-400' : 'text-slate-500'
                          }`}>
                            <span>{t.selectedAngles} ({selectedFiles.length})</span>
                            <button
                              type="button"
                              onClick={clearAllSelectedFiles}
                              className="text-red-500 hover:text-red-700 font-semibold cursor-pointer"
                            >
                              {t.clearAll}
                            </button>
                          </div>

                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto p-1">
                            {selectedFiles.map((item, idx) => (
                              <div
                                key={item.id}
                                className={`group relative rounded-xl border overflow-hidden aspect-[4/5] flex flex-col ${
                                  isDark ? 'border-neutral-700 bg-neutral-900' : 'border-slate-200 bg-slate-50'
                                }`}
                              >
                                <img
                                  src={item.previewUrl}
                                  alt={`Angle ${idx + 1}`}
                                  className="w-full h-full object-contain bg-black/40 dark:bg-black/60"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

                                <span className="absolute top-1.5 left-1.5 text-[9px] font-bold text-white bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded">
                                  {idx === 0 ? t.cover : `${t.angle} ${idx + 1}`}
                                </span>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeFileAtIndex(idx);
                                  }}
                                  className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 shadow-md transition-all opacity-90 group-hover:opacity-100 cursor-pointer"
                                  title="Remove image"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}

                            {/* Add More Files Tile */}
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className={`rounded-xl border-2 border-dashed aspect-[4/5] flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                                isDark
                                  ? 'border-neutral-700 hover:border-[#004ad7] hover:bg-blue-950/30 text-neutral-400 hover:text-white'
                                  : 'border-slate-300 hover:border-[#004ad7] hover:bg-blue-50/20 text-slate-500 hover:text-[#004ad7]'
                              }`}
                            >
                              <Plus className="w-5 h-5" />
                              <span className="text-[10px] font-bold">{t.addAngle}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                          isDark ? 'text-neutral-300' : 'text-slate-700'
                        }`}>
                          {t.sizesLabel}
                        </label>
                        <input
                          type="text"
                          value={newSizes}
                          onChange={(e) => setNewSizes(e.target.value)}
                          placeholder="S, M, L, XL"
                          className={`w-full px-4 py-2.5 border rounded-xl text-xs focus:ring-2 focus:ring-[#004ad7]/20 focus:border-[#004ad7] focus:outline-none transition-all ${
                            isDark
                              ? 'bg-neutral-900 border-neutral-700 text-white placeholder-neutral-500'
                              : 'bg-slate-50 border-slate-200 text-[#111111]'
                          }`}
                        />
                      </div>

                      <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                          isDark ? 'text-neutral-300' : 'text-slate-700'
                        }`}>
                          {t.colorsLabel}
                        </label>
                        <input
                          type="text"
                          value={newColors}
                          onChange={(e) => setNewColors(e.target.value)}
                          placeholder="Black, Cobalt Blue"
                          className={`w-full px-4 py-2.5 border rounded-xl text-xs focus:ring-2 focus:ring-[#004ad7]/20 focus:border-[#004ad7] focus:outline-none transition-all ${
                            isDark
                              ? 'bg-neutral-900 border-neutral-700 text-white placeholder-neutral-500'
                              : 'bg-slate-50 border-slate-200 text-[#111111]'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                        isDark ? 'text-neutral-300' : 'text-slate-700'
                      }`}>
                        {t.descLabel}
                      </label>
                      <textarea
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        rows={2}
                        placeholder="Custom milled heavy cotton jersey, drop shoulders..."
                        className={`w-full px-4 py-2.5 border rounded-xl text-xs focus:ring-2 focus:ring-[#004ad7]/20 focus:border-[#004ad7] focus:outline-none transition-all ${
                          isDark
                            ? 'bg-neutral-900 border-neutral-700 text-white placeholder-neutral-500'
                            : 'bg-slate-50 border-slate-200 text-[#111111]'
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                          isDark ? 'text-neutral-300' : 'text-slate-700'
                        }`}>
                          {t.fitLabel}
                        </label>
                        <input
                          type="text"
                          value={newFitDetails}
                          onChange={(e) => setNewFitDetails(e.target.value)}
                          placeholder="Oversized boxy drape..."
                          className={`w-full px-4 py-2.5 border rounded-xl text-xs focus:ring-2 focus:ring-[#004ad7]/20 focus:border-[#004ad7] focus:outline-none transition-all ${
                            isDark
                              ? 'bg-neutral-900 border-neutral-700 text-white placeholder-neutral-500'
                              : 'bg-slate-50 border-slate-200 text-[#111111]'
                          }`}
                        />
                      </div>

                      <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                          isDark ? 'text-neutral-300' : 'text-slate-700'
                        }`}>
                          {t.materialLabel}
                        </label>
                        <input
                          type="text"
                          value={newMaterial}
                          onChange={(e) => setNewMaterial(e.target.value)}
                          placeholder="380 GSM Heavy French Terry..."
                          className={`w-full px-4 py-2.5 border rounded-xl text-xs focus:ring-2 focus:ring-[#004ad7]/20 focus:border-[#004ad7] focus:outline-none transition-all ${
                            isDark
                              ? 'bg-neutral-900 border-neutral-700 text-white placeholder-neutral-500'
                              : 'bg-slate-50 border-slate-200 text-[#111111]'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="exclusiveDrop"
                        checked={newIsExclusive}
                        onChange={(e) => setNewIsExclusive(e.target.checked)}
                        className="w-4 h-4 text-[#004ad7] rounded border-slate-300 dark:border-neutral-700 focus:ring-[#004ad7]"
                      />
                      <label htmlFor="exclusiveDrop" className={`text-xs font-bold cursor-pointer ${
                        isDark ? 'text-neutral-300' : 'text-slate-700'
                      }`}>
                        {t.exclusiveDrop}
                      </label>
                    </div>

                    <div className={`pt-4 border-t flex items-center justify-end gap-3 ${
                      isDark ? 'border-neutral-800' : 'border-slate-100'
                    }`}>
                      <button
                        type="button"
                        onClick={closeModal}
                        disabled={isSubmitting}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                          isDark ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {t.cancel}
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2.5 rounded-xl bg-[#004ad7] hover:bg-[#003cb0] text-white text-xs font-bold shadow-md shadow-[#004ad7]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer transition-all"
                      >
                        {isSubmitting ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>{uploadProgressText || t.publishing}</span>
                          </>
                        ) : (
                          <span>{editingProductId ? t.saveChanges : t.uploadBtn}</span>
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Full-Screen Live Splash Simulation for Admin */}
          <AnimatePresence>
            {previewingSplash && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black text-white overflow-hidden select-none"
              >
                {appSettings.splash_media_url && (
                  <div className="absolute inset-0 w-full h-full overflow-hidden">
                    {appSettings.splash_media_url.match(/\.(mp4|webm|mov|ogg)(\?.*)?$/i) ? (
                      <video
                        src={appSettings.splash_media_url}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover absolute inset-0 opacity-40"
                      />
                    ) : (
                      <img
                        src={appSettings.splash_media_url}
                        alt="Splash Background"
                        className="w-full h-full object-cover absolute inset-0 opacity-40"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/40" />
                  </div>
                )}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative z-10 flex flex-col items-center text-center px-4"
                >
                  <div dir="ltr" className="flex items-center justify-center gap-3 sm:gap-6 my-3">
                    {['V', 'A', 'N', 'T'].map((char, index) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, y: 22, filter: 'blur(8px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        transition={{ delay: 0.2 + index * 0.12, duration: 0.8 }}
                        className="text-5xl sm:text-7xl font-black uppercase font-sans tracking-[0.25em] text-white drop-shadow-2xl"
                      >
                        {char}
                      </motion.span>
                    ))}
                  </div>
                  <div className="flex flex-col items-center gap-1.5 mt-2">
                    <span className="text-[10px] sm:text-xs font-mono tracking-[0.4em] text-[#004ad7] uppercase font-bold">
                      DIGITAL LOOKBOOK
                    </span>
                    <span className="text-[9px] tracking-[0.3em] uppercase text-neutral-400 font-medium">
                      RIYADH • STREETWEAR ARCHIVE
                    </span>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toast Notification */}
          <AnimatePresence>
            {statusToast && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className={`fixed bottom-6 right-6 z-50 px-4 py-3 text-xs font-bold rounded-2xl shadow-xl flex items-center gap-2 ${
                  statusToast.type === 'error'
                    ? 'bg-red-600 text-white'
                    : 'bg-[#111111] dark:bg-neutral-900 border border-white/10 text-white'
                }`}
              >
                {statusToast.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-white" />
                ) : (
                  <Check className="w-4 h-4 text-emerald-400" />
                )}
                <span>{statusToast.message}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
