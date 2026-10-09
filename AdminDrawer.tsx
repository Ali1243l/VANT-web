import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Lock,
  Unlock,
  Sliders,
  Eye,
  EyeOff,
  RotateCcw,
  Copy,
  Check,
  Download,
  Upload,
  KeyRound,
  AlertTriangle,
  Plus,
  Trash2,
  Edit3,
  Search,
  Package,
  Coins,
  Sparkles,
  TrendingUp,
  Users,
  ShoppingBag,
  MessageCircle,
  BarChart3,
  Activity,
  Layers,
  Smartphone,
  Monitor,
  Tag,
  ArrowUpRight,
  ShieldCheck,
  Percent,
  Image as ImageIcon,
  Flame,
  LayoutDashboard,
  Filter,
  UploadCloud,
  Globe,
  Loader2,
  ChevronDown,
  ChevronUp,
  Heart,
  ExternalLink,
  Shirt,
  FileSpreadsheet,
  FileCode,
  FileText,
  Printer,
  Mail,
  Gift,
  Ruler,
  Type,
  SlidersHorizontal,
} from 'lucide-react';
import { useSiteControls, type SiteControlItem } from '../context/SiteControlsContext';
import { ALL_SIZES, type Product, type Language, type ProductAvailability, type TrendItem } from '../types';
import {
  getAggregatedAnalytics,
  resetAnalyticsData,
  downloadAnalyticsJSON,
  downloadAnalyticsCSV,
  downloadAnalyticsExcel,
  downloadAnalyticsHTMLReport,
  downloadAnalyticsMarkdown,
  syncFromSupabaseCloud,
  type UserBehaviorStats,
} from '../lib/analytics';
import { RECOMMENDED_IMAGE_SPECS } from '../data/trends';
import { uploadImageToSupabase } from '../lib/storage';
import ImageUploader from './ImageUploader';
import AdminAnalyticsDashboard from './AdminAnalyticsDashboard';
import SocialLinksManager from './SocialLinksManager';
import AdminNewsletterManager from './AdminNewsletterManager';
import AdminOffersManager from './AdminOffersManager';
import AdminSizesManager from './AdminSizesManager';
import AdminNewsletterBoxStudio from './AdminNewsletterBoxStudio';
import { getStoredSubscribers } from '../lib/newsletter';
import { AVAILABLE_SPLASH_MOTIFS } from './SplashLoader';
import type { SplashMotifType } from '../context/SiteControlsContext';
import NewAdminApp from '../admin/App';

interface Props {
  lang?: Language;
}

type TabType = 'analytics' | 'products' | 'sizes' | 'offers' | 'banners' | 'social' | 'controls' | 'newsletter' | 'welcome_modal' | 'backup' | 'security';

interface AdminNavItem {
  id: TabType;
  label: string;
  labelEn: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number | null;
  badgeColor?: 'emerald' | 'blue' | 'purple' | 'amber';
  description?: string;
}

interface AdminNavGroup {
  id: string;
  title: string;
  titleEn: string;
  icon: React.ComponentType<{ className?: string }>;
  items: AdminNavItem[];
}

export default function AdminDrawer({ lang = 'ar' }: Props) {
  const isAr = lang === 'ar';

  const {
    controls,
    toggleVisibility,
    updateControl,
    resetControl,
    resetAllControls,
    currencyCode,
    setCurrencyCode,
    formatPrice,
    products,
    loading,
    error: dbError,
    isLiveDatabase,
    lastSyncTime,
    refreshProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductAvailability,
    resetProductsToDefault,
    exportAllDataJSON,
    importAllDataJSON,
    trendItems,
    updateTrendItem,
    resetTrendsToDefault,
    isAdminOpen,
    setIsAdminOpen,
    isAdminUnlocked,
    unlockAdmin,
    lockAdmin,
    setAdminPin,
    siteSettings,
    updateSiteSettings,
    isPreviewSplash,
    setIsPreviewSplash,
    isPreviewMaintenance,
    setIsPreviewMaintenance,
    isPreviewWelcomeModal,
    setIsPreviewWelcomeModal,
    isCloudSynced,
    syncAllToSupabaseCloud,
  } = useSiteControls();

  const [activeTab, setActiveTab] = useState<TabType>('analytics');
  const [adminMode, setAdminMode] = useState<'new' | 'classic'>(() => {
    try {
      return (localStorage.getItem('vant_admin_interface_mode') as 'new' | 'classic') || 'new';
    } catch {
      return 'new';
    }
  });

  const toggleAdminMode = (mode: 'new' | 'classic') => {
    setAdminMode(mode);
    try {
      localStorage.setItem('vant_admin_interface_mode', mode);
    } catch {}
  };
  const [showTestsDropdown, setShowTestsDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const testsDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Group navigation definitions with live counts & badges
  const navGroups = useMemo<AdminNavGroup[]>(() => [
    {
      id: 'analytics_group',
      title: isAr ? 'التحليلات والمؤشرات' : 'Analytics & Insights',
      titleEn: 'Analytics',
      icon: BarChart3,
      items: [
        {
          id: 'analytics',
          label: isAr ? 'تحليل وسلوك الزوار المتقدم' : 'Behavior & Deep Analytics',
          labelEn: 'Analytics',
          icon: BarChart3,
          badge: null,
          description: isAr ? 'معدل التحويل، الزيارات المباشرة، وسلوك العملاء' : 'Conversion, visitors & telemetry',
        },
      ],
    },
    {
      id: 'catalog_group',
      title: isAr ? 'الكتالوج والمقاسات' : 'Catalog & Sizing',
      titleEn: 'Catalog & Sizing',
      icon: Package,
      items: [
        {
          id: 'products',
          label: isAr ? 'إدارة الكتالوج والمنتجات' : 'Catalog & Products',
          labelEn: 'Products',
          icon: Package,
          badge: products.length > 0 ? products.length : null,
          badgeColor: 'emerald',
          description: isAr ? 'إضافة وتعديل القطع، التوفر، وتحديث الأسعار' : 'Manage items, prices & availability',
        },
        {
          id: 'sizes',
          label: isAr ? 'دليل القياسات والأبعاد' : 'Size Guide & Specs',
          labelEn: 'Size Guide',
          icon: Ruler,
          badge: null,
          description: isAr ? 'جداول مقاسات الصدر والخصر وأبعاد القطع' : 'Measurements & fit guidelines',
        },
      ],
    },
    {
      id: 'marketing_group',
      title: isAr ? 'العروض والتسويق' : 'Marketing & Offers',
      titleEn: 'Marketing & Offers',
      icon: Sparkles,
      items: [
        {
          id: 'offers',
          label: isAr ? 'التحكم بالعروض والخصومات' : 'Offers & Discounts',
          labelEn: 'Offers',
          icon: Percent,
          badge: products.filter((p) => p.is_offer).length > 0 ? products.filter((p) => p.is_offer).length : null,
          badgeColor: 'blue',
          description: isAr ? 'عروض التخفيض ونسب الخصم الحصرية' : 'Active discounts & deals',
        },
        {
          id: 'banners',
          label: isAr ? 'البانرات واستوديو النصوص' : 'Banners & Site Copy',
          labelEn: 'Banners & Copy',
          icon: ImageIcon,
          badge: null,
          description: isAr ? 'تخصيص بنر الترويسة والصور والنصوص الرئيسية' : 'Hero media, captions & studio',
        },
        {
          id: 'welcome_modal',
          label: isAr ? 'النافذة الترحيبية والخصم' : 'Welcome Modal & Voucher',
          labelEn: 'Welcome Popup',
          icon: Gift,
          badge: siteSettings.welcome_coupon_code || '15%',
          badgeColor: 'emerald',
          description: isAr ? 'كوبون الخصم الترحيبي عند فتح الموقع' : 'New visitor coupon & voucher popup',
        },
        {
          id: 'newsletter',
          label: isAr ? 'النشرة البريدية والعروض' : 'Newsletter & VIP',
          labelEn: 'Newsletter',
          icon: Mail,
          badge: getStoredSubscribers().length > 0 ? getStoredSubscribers().length : null,
          badgeColor: 'blue',
          description: isAr ? 'قائمة المشتركين وتصدير الإيميلات' : 'VIP subscribers & export',
        },
      ],
    },
    {
      id: 'design_group',
      title: isAr ? 'واجهة المتجر والتخصيص' : 'Store Appearance',
      titleEn: 'Controls & Appearance',
      icon: Sliders,
      items: [
        {
          id: 'controls',
          label: isAr ? 'أزرار الموقع والتفاعل' : 'Buttons & Interactive Controls',
          labelEn: 'Controls',
          icon: Sliders,
          badge: null,
          description: isAr ? 'أزرار واتساب، الاتصال، الإجراء السريع والفوتر' : 'Action buttons & store toggles',
        },
        {
          id: 'social',
          label: isAr ? 'روابط المنصات والفوتر' : 'Social & Footer Links',
          labelEn: 'Social Links',
          icon: Globe,
          badge: null,
          description: isAr ? 'إنستغرام، واتساب، تيك توك، تلغرام، وباقي القنوات' : 'Brand social profiles & icons',
        },
      ],
    },
    {
      id: 'system_group',
      title: isAr ? 'النظام والأمان' : 'System & Security',
      titleEn: 'System & Security',
      icon: ShieldCheck,
      items: [
        {
          id: 'backup',
          label: isAr ? 'النسخ الاحتياطي والبيانات' : 'Backup & JSON Engine',
          labelEn: 'Backup',
          icon: Download,
          badge: null,
          description: isAr ? 'تصدير واستيراد الكتالوج وقاعدة البيانات كاملة' : 'Export & restore full database',
        },
        {
          id: 'security',
          label: isAr ? 'الأمان ورمز الدخول' : 'Security & PIN Access',
          labelEn: 'Security',
          icon: KeyRound,
          badge: null,
          description: isAr ? 'تغيير رمز المرور وقفل مركز العمليات' : 'Change credentials & access protection',
        },
      ],
    },
  ], [isAr, products, siteSettings.welcome_coupon_code]);

  // Find active group based on current active tab
  const currentActiveGroup = useMemo(() => {
    return navGroups.find((g) => g.items.some((item) => item.id === activeTab)) || navGroups[0];
  }, [navGroups, activeTab]);

  // Accordion open/collapse states for desktop navigation
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    catalog_group: true,
    marketing_group: true,
    design_group: true,
    system_group: true,
  });

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  // Close dropdown menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (testsDropdownRef.current && !testsDropdownRef.current.contains(e.target as Node)) {
        setShowTestsDropdown(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedJSON, setCopiedJSON] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState(false);
  const [isUploadingHeroBg, setIsUploadingHeroBg] = useState(false);
  const [uploadHeroBgSuccess, setUploadHeroBgSuccess] = useState(false);
  const [uploadingTrendId, setUploadingTrendId] = useState<string | null>(null);

  // WhatsApp Multi-Number Management State
  const WHATSAPP_NUMBERS_KEY = 'vant_custom_whatsapp_numbers_list_v1';
  const [whatsappNumbers, setWhatsappNumbers] = useState<Array<{ id: string; number: string; label: string; isActive: boolean }>>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(WHATSAPP_NUMBERS_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      }
    } catch {}
    const activeNum = controls['cfg_whatsapp_phone']?.actionValue || '9647000000000';
    return [
      {
        id: '1',
        number: activeNum,
        label: isAr ? 'رقم المبيعات والطلبات الرئيسي' : 'Primary Sales WhatsApp',
        isActive: true,
      },
    ];
  });

  const activePhoneEntry = whatsappNumbers.find((n) => n.isActive) || whatsappNumbers[0];
  const [primaryPhoneInput, setPrimaryPhoneInput] = useState<string>(() => activePhoneEntry?.number || '9647000000000');
  const [newPhoneInput, setNewPhoneInput] = useState('');
  const [newPhoneLabel, setNewPhoneLabel] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPhoneId, setEditingPhoneId] = useState<string | null>(null);
  const [editingPhoneInput, setEditingPhoneInput] = useState('');
  const [editingPhoneLabel, setEditingPhoneLabel] = useState('');
  const [phoneSaveSuccess, setPhoneSaveSuccess] = useState(false);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState('');

  // Keep primaryPhoneInput in sync when active phone changes externally
  useEffect(() => {
    if (activePhoneEntry && !editingPhoneId) {
      setPrimaryPhoneInput(activePhoneEntry.number);
    }
  }, [activePhoneEntry?.number]);

  const handleSavePrimaryPhone = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanNum = primaryPhoneInput.replace(/[^0-9+]/g, '').trim();
    if (!cleanNum) return;

    setWhatsappNumbers((prev) => {
      let updated: Array<{ id: string; number: string; label: string; isActive: boolean }>;
      const activeIndex = prev.findIndex((item) => item.isActive);
      if (activeIndex !== -1) {
        updated = prev.map((item, idx) => ({
          ...item,
          number: idx === activeIndex ? cleanNum : item.number,
        }));
      } else if (prev.length > 0) {
        updated = prev.map((item, idx) => ({
          ...item,
          isActive: idx === 0,
          number: idx === 0 ? cleanNum : item.number,
        }));
      } else {
        updated = [
          {
            id: '1',
            number: cleanNum,
            label: isAr ? 'الرقم الأساسي المعتمد' : 'Primary Adopted Line',
            isActive: true,
          },
        ];
      }

      try {
        localStorage.setItem(WHATSAPP_NUMBERS_KEY, JSON.stringify(updated));
      } catch {}

      updateControl('cfg_whatsapp_phone', { actionValue: cleanNum });
      updateControl('cfg_bespoke_phone', { actionValue: cleanNum });

      setSavedSuccessMsg(isAr ? `تم حفظ واعتماد الرقم (${cleanNum}) بنجاح للمتجر` : `Number (${cleanNum}) saved & adopted successfully`);
      setPhoneSaveSuccess(true);
      setTimeout(() => setPhoneSaveSuccess(false), 3500);

      return updated;
    });
  };

  const handleSetActivePhone = (id: string) => {
    setWhatsappNumbers((prev) => {
      const updated = prev.map((item) => ({
        ...item,
        isActive: item.id === id,
      }));
      try {
        localStorage.setItem(WHATSAPP_NUMBERS_KEY, JSON.stringify(updated));
      } catch {}

      const activeItem = updated.find((item) => item.id === id);
      if (activeItem) {
        setPrimaryPhoneInput(activeItem.number);
        updateControl('cfg_whatsapp_phone', { actionValue: activeItem.number });
        updateControl('cfg_bespoke_phone', { actionValue: activeItem.number });
        setSavedSuccessMsg(isAr ? `تم اعتماد الرقم (${activeItem.number}) كالرقم النشط لجميع الطلبات` : `Switched active line to (${activeItem.number})`);
      }

      setPhoneSaveSuccess(true);
      setTimeout(() => setPhoneSaveSuccess(false), 3500);
      return updated;
    });
  };

  const handleAddNewPhone = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNum = newPhoneInput.replace(/[^0-9+]/g, '').trim();
    if (!cleanNum) return;

    const newEntry = {
      id: Date.now().toString(),
      number: cleanNum,
      label: newPhoneLabel.trim() || (isAr ? `رقم واتساب #${whatsappNumbers.length + 1}` : `WhatsApp Line #${whatsappNumbers.length + 1}`),
      isActive: whatsappNumbers.length === 0,
    };

    const updated = [...whatsappNumbers, newEntry];
    setWhatsappNumbers(updated);
    try {
      localStorage.setItem(WHATSAPP_NUMBERS_KEY, JSON.stringify(updated));
    } catch {}

    if (newEntry.isActive) {
      setPrimaryPhoneInput(newEntry.number);
      updateControl('cfg_whatsapp_phone', { actionValue: newEntry.number });
      updateControl('cfg_bespoke_phone', { actionValue: newEntry.number });
    }

    setNewPhoneInput('');
    setNewPhoneLabel('');
    setShowAddForm(false);
    setSavedSuccessMsg(isAr ? `تمت إضافة الرقم (${cleanNum}) إلى القائمة بنجاح` : `Added (${cleanNum}) to directory`);
    setPhoneSaveSuccess(true);
    setTimeout(() => setPhoneSaveSuccess(false), 3500);
  };

  const handleStartEditPhone = (entry: { id: string; number: string; label: string }) => {
    setEditingPhoneId(entry.id);
    setEditingPhoneInput(entry.number);
    setEditingPhoneLabel(entry.label);
  };

  const handleSaveEditedPhone = (id: string) => {
    const cleanNum = editingPhoneInput.replace(/[^0-9+]/g, '').trim();
    if (!cleanNum) return;

    setWhatsappNumbers((prev) => {
      const updated = prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            number: cleanNum,
            label: editingPhoneLabel.trim() || item.label,
          };
        }
        return item;
      });

      try {
        localStorage.setItem(WHATSAPP_NUMBERS_KEY, JSON.stringify(updated));
      } catch {}

      const editedItem = updated.find((item) => item.id === id);
      if (editedItem?.isActive) {
        setPrimaryPhoneInput(cleanNum);
        updateControl('cfg_whatsapp_phone', { actionValue: cleanNum });
        updateControl('cfg_bespoke_phone', { actionValue: cleanNum });
      }

      setSavedSuccessMsg(isAr ? 'تم تعديل وحفظ بيانات الرقم بنجاح' : 'Number updated successfully');
      setPhoneSaveSuccess(true);
      setTimeout(() => setPhoneSaveSuccess(false), 3500);
      return updated;
    });

    setEditingPhoneId(null);
  };

  const handleDeletePhone = (id: string) => {
    setWhatsappNumbers((prev) => {
      if (prev.length <= 1) return prev;
      const updated = prev.filter((item) => item.id !== id);
      const hasActive = updated.some((item) => item.isActive);
      if (!hasActive && updated.length > 0) {
        updated[0].isActive = true;
        setPrimaryPhoneInput(updated[0].number);
        updateControl('cfg_whatsapp_phone', { actionValue: updated[0].number });
        updateControl('cfg_bespoke_phone', { actionValue: updated[0].number });
      }
      try {
        localStorage.setItem(WHATSAPP_NUMBERS_KEY, JSON.stringify(updated));
      } catch {}
      setSavedSuccessMsg(isAr ? 'تم حذف الرقم من القائمة' : 'Number removed from list');
      setPhoneSaveSuccess(true);
      setTimeout(() => setPhoneSaveSuccess(false), 3000);
      return updated;
    });
  };

  // Live Analytics Telemetry State
  const [analyticsStats, setAnalyticsStats] = useState<UserBehaviorStats>(() => getAggregatedAnalytics(products));

  // Lock background page scrollbars completely when Admin Command Center is open
  useEffect(() => {
    if (isAdminOpen) {
      const prevBodyOverflow = document.body.style.overflow;
      const prevHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = prevBodyOverflow;
        document.documentElement.style.overflow = prevHtmlOverflow;
      };
    }
  }, [isAdminOpen]);

  useEffect(() => {
    if (!isAdminOpen) return;
    const handleAnalyticsUpdate = () => {
      setTimeout(() => {
        setAnalyticsStats(getAggregatedAnalytics(products));
      }, 0);
    };
    window.addEventListener('vant_analytics_updated', handleAnalyticsUpdate);
    const interval = setInterval(() => {
      handleAnalyticsUpdate();
    }, 15000);

    // Auto-sync from Supabase cloud when drawer is active on analytics
    if (activeTab === 'analytics') {
      syncFromSupabaseCloud().then(() => {
        setAnalyticsStats(getAggregatedAnalytics(products));
      }).catch(() => {});
    }

    return () => {
      window.removeEventListener('vant_analytics_updated', handleAnalyticsUpdate);
      clearInterval(interval);
    };
  }, [products, isAdminOpen, activeTab]);

  // Keep analytics fresh when admin drawer opens
  useEffect(() => {
    if (isAdminOpen) {
      setAnalyticsStats(getAggregatedAnalytics(products));
    }
  }, [isAdminOpen, products]);

  // Catalog CMS State
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [onlyOffersFilter, setOnlyOffersFilter] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<string | number | null>(null);
  const [expandedProductIds, setExpandedProductIds] = useState<Set<string | number>>(new Set());
  const [copiedLinkProductId, setCopiedLinkProductId] = useState<string | number | null>(null);

  // Form State for Add / Edit Product
  const [formTitleAr, setFormTitleAr] = useState('');
  const [formTitleEn, setFormTitleEn] = useState('');
  const [formPrice, setFormPrice] = useState<number>(95000);
  const [formOriginalPrice, setFormOriginalPrice] = useState<number>(115000);
  const [formIsOffer, setFormIsOffer] = useState<boolean>(false);
  const [formOfferBadgeAr, setFormOfferBadgeAr] = useState('عرض خاص');
  const [formOfferBadgeEn, setFormOfferBadgeEn] = useState('Special Offer');
  const [formCategory, setFormCategory] = useState('Tailoring');
  const [formCategoryAr, setFormCategoryAr] = useState('الأزياء الرسمية');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formExtraImages, setFormExtraImages] = useState('');
  const [formImagesList, setFormImagesList] = useState<string[]>([]);
  const [formAvailability, setFormAvailability] = useState<ProductAvailability>('in_stock');
  const [formTags, setFormTags] = useState('');
  const [formDescAr, setFormDescAr] = useState('');
  const [formDescEn, setFormDescEn] = useState('');
  const [formMaterial, setFormMaterial] = useState('');
  const [formSizes, setFormSizes] = useState<string[]>(['S', 'M', 'L', 'XL']);

  const handleUnlock = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const success = unlockAdmin(passwordInput.trim());
    if (success) {
      setPasswordError(false);
      setPasswordInput('');
    } else {
      setPasswordError(true);
    }
  };

  const handleOpenAddModal = () => {
    setIsAddingNew(true);
    setEditingProduct(null);
    setFormTitleAr('');
    setFormTitleEn('');
    setFormPrice(95000);
    setFormOriginalPrice(115000);
    setFormIsOffer(false);
    setFormOfferBadgeAr('عرض خاص');
    setFormOfferBadgeEn('Special Offer');
    setFormCategory('Tailoring');
    setFormCategoryAr('الأزياء الرسمية');
    setFormImageUrl('');
    setFormExtraImages('');
    setFormImagesList([]);
    setFormAvailability('in_stock');
    setFormTags('');
    setFormDescAr('');
    setFormDescEn('');
    setFormMaterial('');
    setFormSizes(['S', 'M', 'L', 'XL']);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setIsAddingNew(false);
    setFormTitleAr(p.title_ar || p.title);
    setFormTitleEn(p.title);
    setFormPrice(p.price);
    setFormOriginalPrice(p.original_price || Math.round(p.price * 1.25));
    setFormIsOffer(Boolean(p.is_offer));
    setFormOfferBadgeAr(p.offer_badge_ar || 'عرض خاص');
    setFormOfferBadgeEn(p.offer_badge_en || 'Special Offer');
    setFormCategory(p.category);
    setFormCategoryAr(p.category_ar || p.category);
    const initialImages = p.images && p.images.length > 0 ? p.images : (p.image_url ? [p.image_url] : []);
    setFormImageUrl(p.image_url || initialImages[0] || '');
    setFormExtraImages(initialImages.slice(1).join('\n'));
    setFormImagesList(initialImages);
    setFormAvailability(p.availability || 'in_stock');
    setFormTags((p.tags || []).join(', '));
    setFormDescAr(p.description_ar || p.description || '');
    setFormDescEn(p.description || '');
    setFormMaterial(p.material || '');
    setFormSizes(p.sizes && p.sizes.length > 0 ? p.sizes : ['S', 'M', 'L', 'XL']);
  };

  const handleSaveProductForm = (e: React.FormEvent) => {
    e.preventDefault();
    const primaryImg = formImageUrl.trim() || formImagesList[0] || '';
    const allImages = formImagesList.length > 0 ? formImagesList : (primaryImg ? [primaryImg] : []);

    const cleanTags = formTags
      .split(/[,،]+/)
      .map((t) => t.trim())
      .filter(Boolean);

    const productPayload: Omit<Product, 'id'> = {
      title: formTitleEn.trim() || formTitleAr.trim(),
      title_ar: formTitleAr.trim() || formTitleEn.trim(),
      price: Number(formPrice),
      original_price: formIsOffer ? Number(formOriginalPrice) : undefined,
      is_offer: formIsOffer,
      offer_badge_ar: formIsOffer ? formOfferBadgeAr.trim() : undefined,
      offer_badge_en: formIsOffer ? formOfferBadgeEn.trim() : undefined,
      category: formCategory.trim(),
      category_ar: formCategoryAr.trim(),
      image_url: primaryImg,
      images: allImages,
      availability: formAvailability,
      tags: cleanTags,
      description: formDescEn.trim(),
      description_ar: formDescAr.trim(),
      material: formMaterial.trim(),
      sizes: formSizes.length > 0 ? formSizes : ['M', 'L'],
    };

    if (isAddingNew) {
      addProduct(productPayload);
    } else if (editingProduct) {
      updateProduct(editingProduct.id, productPayload);
    }

    setEditingProduct(null);
    setIsAddingNew(false);
  };

  const handleQuickToggleOffer = (p: Product) => {
    const updatedStatus = !p.is_offer;
    updateProduct(p.id, {
      is_offer: updatedStatus,
      original_price: updatedStatus ? (p.original_price || Math.round(p.price * 1.25)) : undefined,
      offer_badge_ar: updatedStatus ? (p.offer_badge_ar || 'عرض خاص') : undefined,
    });
  };

  const handleSavePassword = () => {
    if (newPassword.trim().length >= 4) {
      setAdminPin(newPassword.trim());
      setPasswordSuccess(true);
      setTimeout(() => {
        setPasswordSuccess(false);
        setNewPassword('');
      }, 2500);
    }
  };

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (onlyOffersFilter && !p.is_offer) return false;
      if (selectedCategoryFilter !== 'all' && p.category !== selectedCategoryFilter) return false;
      if (productSearch.trim()) {
        const q = productSearch.toLowerCase().trim();
        const matchesTitle = p.title.toLowerCase().includes(q) || (p.title_ar && p.title_ar.includes(q));
        const matchesCat = p.category.toLowerCase().includes(q) || (p.category_ar && p.category_ar.includes(q));
        const matchesTags = p.tags && p.tags.some((t) => t.toLowerCase().includes(q));
        return matchesTitle || matchesCat || matchesTags;
      }
      return true;
    });
  }, [products, productSearch, selectedCategoryFilter, onlyOffersFilter]);

  // Categories list
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.category));
    return Array.from(set);
  }, [products]);

  return (
    <AnimatePresence>
      {isAdminOpen && (
        <motion.div
          key="admin-drawer-root"
          initial={{ opacity: 0, scale: 0.985, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.985, y: 14 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] flex flex-col bg-[#08090d] text-[#f3f4f6] overflow-hidden select-none font-sans"
        >
          {/* Only show top operations command header when authenticated/unlocked */}
        {isAdminUnlocked && adminMode === 'classic' ? (
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-[#12151f] px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#004ad7]/20 border border-[#004ad7]/30 text-[#3b82f6] shadow-sm">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-base font-bold tracking-tight text-white">
                    {isAr ? 'مركز عمليات ڤانت المتكامل' : 'VANT Operations Command Center'}
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {isAr ? 'متصل مباشر' : 'Live Engine'}
                  </span>
                </div>
                <p className="text-[11px] text-white/50 hidden sm:block">
                  {isAr
                    ? 'إدارة العروض والكتالوج، تخصيص البنرات، وتحليل سلوك الزوار المتقدم'
                    : 'Live Catalog & Offers CMS, Banner Customizer & Deep Behavioral Analytics'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Quick 1-Click Store Maintenance Mode Toggle - Highly Accessible */}
              <button
                type="button"
                onClick={() => updateSiteSettings({ maintenance_mode: !siteSettings.maintenance_mode })}
                className={`flex items-center gap-2 rounded-xl border px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95 ${
                  siteSettings.maintenance_mode
                    ? 'border-[#004ad7] bg-[#004ad7]/25 text-white hover:bg-[#004ad7]/35 ring-1 ring-[#3b82f6]/50 shadow-md shadow-[#004ad7]/20'
                    : 'border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/[0.08] hover:text-white'
                }`}
                title={
                  isAr
                    ? 'تشغيل أو إيقاف شاشة الصيانة وإغلاق/فتح المتجر أمام الزبائن فوراً'
                    : 'Toggle Store Maintenance Mode (Storefront Offline / Online)'
                }
              >
                {siteSettings.maintenance_mode ? (
                  <Lock className="h-3.5 w-3.5 text-[#60a5fa] animate-pulse" />
                ) : (
                  <Globe className="h-3.5 w-3.5 text-white/40" />
                )}
                <span className="hidden lg:inline font-bold">
                  {isAr ? 'وضع الصيانة:' : 'Maintenance:'}
                </span>
                <span className="lg:hidden font-bold">
                  {isAr ? 'الصيانة:' : 'Maint:'}
                </span>
                <span
                  className={`font-mono text-[11px] font-bold ${
                    siteSettings.maintenance_mode ? 'text-[#60a5fa]' : 'text-white/40'
                  }`}
                >
                  {siteSettings.maintenance_mode ? (isAr ? 'مفعل (مغلق)' : 'ON') : (isAr ? 'معطل (مفتوح)' : 'OFF')}
                </span>
              </button>

              {/* Quick 1-Click Storefront Hero & Trends Banner Toggle - Highly Accessible */}
              <button
                type="button"
                onClick={() => toggleVisibility('banner_hero_visible')}
                className={`flex items-center gap-2 rounded-xl border px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95 ${
                  controls['banner_hero_visible']?.visible
                    ? 'border-[#004ad7]/40 bg-[#004ad7]/15 text-white hover:bg-[#004ad7]/25'
                    : 'border-white/10 bg-white/[0.04] text-white/50 hover:bg-white/[0.08] hover:text-white/80'
                }`}
                title={isAr ? 'تشغيل أو إيقاف واجهة التشكيلة والتريندات للزبائن في المتجر' : 'Toggle Storefront Welcome Hero & Trends Banner'}
              >
                {controls['banner_hero_visible']?.visible ? (
                  <Eye className="h-3.5 w-3.5 text-[#3b82f6]" />
                ) : (
                  <EyeOff className="h-3.5 w-3.5 text-white/40" />
                )}
                <span className="hidden lg:inline font-bold">
                  {isAr ? 'واجهة الترحيب والتريندات:' : 'Welcome Banner:'}
                </span>
                <span className="lg:hidden font-bold">
                  {isAr ? 'التريندات:' : 'Banner:'}
                </span>
                <span className={`font-mono text-[11px] font-bold ${controls['banner_hero_visible']?.visible ? 'text-[#60a5fa]' : 'text-white/40'}`}>
                  {controls['banner_hero_visible']?.visible ? (isAr ? 'مفعلة' : 'ON') : (isAr ? 'معطلة' : 'OFF')}
                </span>
              </button>

              {/* Live Visitors Counter Badge */}
              <div className="flex items-center gap-1.5 rounded-full bg-white/[0.04] border border-white/10 px-3 py-1 text-xs text-white/80">
                <Users className="h-3.5 w-3.5 text-[#3b82f6]" />
                <span className="tabular-nums font-semibold text-white">{analyticsStats.activeOnlineNow}</span>
                <span className="text-[10px] text-white/50">{isAr ? 'نشط الآن' : 'online'}</span>
              </div>

              {/* Supabase Cloud Sync Status / Action */}
              <button
                type="button"
                onClick={async () => {
                  setIsSyncing(true);
                  await syncAllToSupabaseCloud();
                  setIsSyncing(false);
                  setSyncToast(true);
                  setTimeout(() => setSyncToast(false), 3000);
                }}
                title={isAr ? 'مزامنة وحفظ فوري في سوبابيس' : 'Sync with Supabase Cloud'}
                className="hidden md:flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer"
              >
                {isSyncing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <UploadCloud className="h-3.5 w-3.5" />
                )}
                <span>{isAr ? 'مزامنة السحابة' : 'Cloud Sync'}</span>
              </button>

              {/* Consolidated Quick Screen Tests Dropdown */}
              <div className="relative" ref={testsDropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowTestsDropdown((prev) => !prev)}
                  className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-white/90 hover:bg-white/10 active:scale-95 transition-all cursor-pointer shadow-xs"
                  title={isAr ? 'اختبار ومعاينة شاشات وواجهات المتجر' : 'Quick Preview Tests'}
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  <span className="hidden sm:inline">{isAr ? 'معاينة الواجهات' : 'Preview Tests'}</span>
                  <span className="sm:hidden">{isAr ? 'معاينة' : 'Tests'}</span>
                  <ChevronDown className={`h-3 w-3 text-white/60 transition-transform duration-200 ${showTestsDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showTestsDropdown && (
                  <div className="absolute ltr:right-0 rtl:left-0 mt-2 w-64 rounded-2xl border border-white/15 bg-[#121522] p-2 shadow-2xl z-50 backdrop-blur-2xl">
                    <div className="px-2.5 py-1.5 border-b border-white/10 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                        {isAr ? 'معاينة شاشات الزوار' : 'Live Screen Tests'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setShowTestsDropdown(false);
                        setIsPreviewSplash(true);
                      }}
                      className="w-full flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-start text-xs font-medium text-white hover:bg-white/[0.06] transition-all cursor-pointer"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#004ad7]/25 text-[#60a5fa] border border-[#004ad7]/30">
                        <Sparkles className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">{isAr ? 'شاشة التحميل الافتتاحية' : 'Splash Preloader'}</div>
                        <div className="text-[10px] text-white/50">{isAr ? 'أنميشن الشعار عند فتح الموقع' : 'Opening animation & logo'}</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowTestsDropdown(false);
                        setIsPreviewMaintenance(true);
                      }}
                      className="w-full flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-start text-xs font-medium text-white hover:bg-white/[0.06] transition-all cursor-pointer"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        <Lock className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">{isAr ? 'شاشة وضع الصيانة' : 'Maintenance Mode'}</div>
                        <div className="text-[10px] text-white/50">{isAr ? 'تجربة إيقاف المتجر مؤقتاً' : 'Boutique offline screen'}</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowTestsDropdown(false);
                        setIsPreviewWelcomeModal(true);
                      }}
                      className="w-full flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-start text-xs font-medium text-white hover:bg-white/[0.06] transition-all cursor-pointer"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <Gift className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">{isAr ? 'نافذة الترحيب والكوبون' : 'Welcome Modal & Voucher'}</div>
                        <div className="text-[10px] text-white/50">{isAr ? 'رسالة الخصم الترحيبية للزوار' : 'Welcome gift popup with coupon'}</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Admin UI Style Mode Switcher (New Modern UI vs Classic Operations) */}
              <div className="flex items-center rounded-xl border border-white/10 bg-black/40 p-0.5">
                <button
                  type="button"
                  onClick={() => toggleAdminMode('new')}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    (adminMode as string) === 'new'
                      ? 'bg-gradient-to-r from-[#004ad7] to-indigo-600 text-white shadow-xs'
                      : 'text-white/60 hover:text-white'
                  }`}
                  title={isAr ? 'الواجهة الحديثة المطورة' : 'Modern Hub'}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden sm:inline">{isAr ? 'الواجهة المطورة' : 'Modern'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => toggleAdminMode('classic')}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    adminMode === 'classic'
                      ? 'bg-white/20 text-white shadow-xs'
                      : 'text-white/60 hover:text-white'
                  }`}
                  title={isAr ? 'الواجهة الكلاسيكية' : 'Classic Hub'}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{isAr ? 'الكلاسيكية' : 'Classic'}</span>
                </button>
              </div>

              {/* Currency Selector (Direct Supabase Cloud Sync) */}
              <div className="flex items-center rounded-lg border border-white/10 bg-black/40 p-0.5">
                {(['د.ع', 'IQD', 'USD'] as const).map((curr) => (
                  <button
                    key={curr}
                    type="button"
                    onClick={() => setCurrencyCode(curr)}
                    className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                      currencyCode === curr
                        ? 'bg-[#004ad7] text-white shadow-xs'
                        : 'text-white/60 hover:text-white'
                    }`}
                    title={isAr ? `تغيير العملة إلى ${curr} ومزامنتها لجميع الزبائن` : `Set currency to ${curr}`}
                  >
                    {curr}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={lockAdmin}
                title={isAr ? 'قفل الجلسة' : 'Lock session'}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
              >
                <Lock className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsAdminOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/70 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-all cursor-pointer"
                aria-label="Close Command Center"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </header>
        ) : null}

        {/* Locked Screen View (Discreet, Zero Info Leaks, Elegant Exit) */}
        {!isAdminUnlocked ? (
          <div className="relative flex flex-1 flex-col items-center justify-center p-4 sm:p-6 text-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#131726] via-[#090b12] to-[#05060a]">
            {/* Ambient luxury glow ring */}
            <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-[#004ad7]/10 blur-3xl" />

            {/* Quick discreet close button for anyone who opened by mistake */}
            <button
              type="button"
              onClick={() => setIsAdminOpen(false)}
              className="absolute top-4 sm:top-6 ltr:right-4 sm:ltr:right-6 rtl:left-4 sm:rtl:left-6 z-20 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/10 hover:text-white backdrop-blur-md transition-all active:scale-95 cursor-pointer"
              aria-label={isAr ? 'إغلاق والرجوع للمتجر' : 'Close and return to boutique'}
              title={isAr ? 'إغلاق والرجوع للمتجر' : 'Close and return to boutique'}
            >
              <X className="h-5 w-5" />
            </button>

            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={passwordError ? { x: [-8, 8, -6, 6, -3, 3, 0], scale: 1, opacity: 1 } : { x: 0, scale: 1, opacity: 1 }}
              transition={{ duration: 0.35 }}
              className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-[#10131d]/95 p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
            >
              {/* Shield Icon Badge */}
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-b from-[#004ad7]/25 to-[#004ad7]/5 border border-[#004ad7]/30 text-[#3b82f6] shadow-lg shadow-[#004ad7]/15 mb-4">
                <ShieldCheck className="h-8 w-8" />
              </div>

              <h2 className="text-lg font-bold text-white tracking-tight">
                {isAr ? 'بوابة ڤانت · وصول محمي' : 'VANT · Secure Portal'}
              </h2>
              <p className="mt-2 text-xs text-white/50 leading-relaxed">
                {isAr
                  ? 'هذه المنطقة مخصصة للإدارة، يرجى إدخال رمز التحقق الخاص بك للمتابعة'
                  : 'Restricted area. Please enter your authorization key to proceed'}
              </p>

              <form onSubmit={handleUnlock} className="mt-6 space-y-4">
                <div className="relative flex items-center">
                  <KeyRound className="pointer-events-none absolute ltr:left-3.5 rtl:right-3.5 h-4 w-4 text-white/40" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      if (passwordError) setPasswordError(false);
                    }}
                    placeholder="••••••••"
                    autoFocus
                    maxLength={40}
                    className={`h-12 w-full rounded-2xl border bg-black/60 px-10 text-center text-sm font-mono tracking-widest outline-none transition-all placeholder:text-white/20 ${
                      passwordError
                        ? 'border-[#3b82f6] ring-2 ring-[#3b82f6]/35 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                        : 'border-white/15 focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 text-white'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute ltr:right-3 rtl:left-3 flex h-7 w-7 items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                    title={showPassword ? 'إخفاء' : 'إظهار'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {passwordError && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-1.5 text-xs text-[#93c5fd] font-medium"
                  >
                    <AlertTriangle className="h-3.5 w-3.5 text-[#3b82f6] shrink-0" />
                    <span>{isAr ? 'رمز المرور غير صحيح، يرجى إعادة المحاولة' : 'Incorrect credentials, please retry'}</span>
                  </motion.div>
                )}

                <button
                  type="submit"
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#004ad7] to-[#2563eb] font-semibold text-xs text-white shadow-lg shadow-[#004ad7]/30 hover:from-[#004ad7]/90 hover:to-[#2563eb]/90 active:scale-98 transition-all cursor-pointer"
                >
                  <Unlock className="h-4 w-4" />
                  <span>{isAr ? 'تأكيد الدخول والمتابعة' : 'Authorize & Continue'}</span>
                </button>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAdminOpen(false)}
                    className="text-[11.5px] font-medium text-white/45 hover:text-white/80 transition-colors cursor-pointer"
                  >
                    {isAr ? 'الرجوع إلى المتجر والتشكيلة' : 'Return to Boutique & Collection'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        ) : (adminMode as string) === 'new' ? (
          /* New Modern Modular Admin Interface from GitHub */
          <div className="flex-1 overflow-y-auto bg-slate-950">
            <NewAdminApp onClose={() => setIsAdminOpen(false)} />
          </div>
        ) : (
          /* Unlocked Full-Screen Operations Dashboard */
          <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
            {/* Sidebar Command Navigation Tabs (Responsive: Grouped Accordions on Desktop, Mobile Dropdown + Pills on Mobile) */}
            <aside className="shrink-0 border-b md:border-b-0 md:border-e border-white/10 bg-[#0f121a] p-3 md:w-64 lg:w-72 flex flex-col justify-between overflow-x-hidden md:overflow-y-auto">
              {/* MOBILE VIEW (< md): Dropdown Group Selector + Horizontal Sub-Pills */}
              <div className="md:hidden flex flex-col gap-2.5 w-full" ref={mobileMenuRef}>
                {/* Mobile Quick Maintenance Mode Toggle */}
                <div className="flex items-center justify-between px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03]">
                  <div className="flex items-center gap-2">
                    <Lock className="h-3.5 w-3.5 text-[#3b82f6]" />
                    <span className="text-xs font-bold text-white">
                      {isAr ? 'وضع الصيانة للمتجر:' : 'Store Maintenance:'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateSiteSettings({ maintenance_mode: !siteSettings.maintenance_mode })}
                    className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold border transition-all cursor-pointer ${
                      siteSettings.maintenance_mode
                        ? 'border-[#004ad7]/50 bg-[#004ad7]/25 text-white ring-1 ring-[#3b82f6]/40'
                        : 'border-white/15 bg-white/[0.05] text-white/50'
                    }`}
                  >
                    {siteSettings.maintenance_mode ? <Lock className="h-3 w-3 text-[#60a5fa]" /> : <Globe className="h-3 w-3" />}
                    <span>{siteSettings.maintenance_mode ? (isAr ? 'مفعل (مغلق)' : 'ON') : (isAr ? 'معطل (مفتوح)' : 'OFF')}</span>
                  </button>
                </div>

                {/* Mobile Quick Storefront Banner Toggle */}
                <div className="flex items-center justify-between px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03]">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-[#3b82f6]" />
                    <span className="text-xs font-bold text-white">
                      {isAr ? 'واجهة الترحيب والتريندات:' : 'Welcome Banner:'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleVisibility('banner_hero_visible')}
                    className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold border transition-all cursor-pointer ${
                      controls['banner_hero_visible']?.visible
                        ? 'border-[#004ad7]/40 bg-[#004ad7]/20 text-white'
                        : 'border-white/15 bg-white/[0.05] text-white/50'
                    }`}
                  >
                    {controls['banner_hero_visible']?.visible ? <Eye className="h-3 w-3 text-[#3b82f6]" /> : <EyeOff className="h-3 w-3" />}
                    <span>{controls['banner_hero_visible']?.visible ? (isAr ? 'مفعلة' : 'ON') : (isAr ? 'معطلة' : 'OFF')}</span>
                  </button>
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen((v) => !v)}
                    className="w-full flex items-center justify-between rounded-xl border border-white/15 bg-white/[0.05] hover:bg-white/[0.08] px-3.5 py-2.5 text-xs font-bold text-white shadow-sm transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#004ad7]/25 text-[#60a5fa] border border-[#004ad7]/30">
                        <currentActiveGroup.icon className="h-4 w-4" />
                      </div>
                      <div className="text-start truncate">
                        <span className="block text-[10px] text-white/50 font-normal">{isAr ? 'القسم الحالي' : 'Active Section'}</span>
                        <span className="block text-xs font-bold text-white truncate">{currentActiveGroup.title}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 text-white/60">
                      <span className="text-[11px] font-semibold text-[#60a5fa]">
                        {currentActiveGroup.items.find((i) => i.id === activeTab)?.labelEn || currentActiveGroup.titleEn}
                      </span>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${mobileMenuOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {/* Mobile Full Dropdown Menu */}
                  {mobileMenuOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 rounded-2xl border border-white/15 bg-[#121524] p-2 shadow-2xl z-50 max-h-[75vh] overflow-y-auto backdrop-blur-2xl">
                      <div className="space-y-3 p-1">
                        {navGroups.map((group) => {
                          const GroupIcon = group.icon;
                          return (
                            <div key={group.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-1.5">
                              <div className="flex items-center gap-2 px-2 py-1 text-[11px] font-bold text-white/40 uppercase tracking-wider">
                                <GroupIcon className="h-3.5 w-3.5 text-[#3b82f6]" />
                                <span>{group.title}</span>
                              </div>
                              <div className="mt-1 space-y-1">
                                {group.items.map((item) => {
                                  const isActive = activeTab === item.id;
                                  const ItemIcon = item.icon;
                                  return (
                                    <button
                                      key={item.id}
                                      type="button"
                                      onClick={() => {
                                        setActiveTab(item.id);
                                        setMobileMenuOpen(false);
                                      }}
                                      className={`w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-all cursor-pointer ${
                                        isActive
                                          ? 'bg-[#004ad7] text-white font-bold shadow-sm'
                                          : 'text-white/70 hover:bg-white/[0.05] hover:text-white'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2 min-w-0">
                                        <ItemIcon className="h-3.5 w-3.5 shrink-0" />
                                        <span className="truncate">{item.label}</span>
                                      </div>
                                      {item.badge !== null && item.badge !== undefined && (
                                        <span
                                          className={`text-[9.5px] px-2 py-0.5 rounded-full font-mono font-bold ${
                                            isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-white/70'
                                          }`}
                                        >
                                          {item.badge}
                                        </span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile Sub-Item Navigation Pills (If current group has multiple items) */}
                {currentActiveGroup.items.length > 1 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
                    {currentActiveGroup.items.map((item) => {
                      const isActive = activeTab === item.id;
                      const ItemIcon = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setActiveTab(item.id)}
                          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs whitespace-nowrap transition-all cursor-pointer ${
                            isActive
                              ? 'bg-[#004ad7] text-white font-bold shadow-md shadow-[#004ad7]/25'
                              : 'bg-white/[0.04] border border-white/10 text-white/70 hover:text-white hover:bg-white/[0.08]'
                          }`}
                        >
                          <ItemIcon className="h-3.5 w-3.5" />
                          <span>{item.label}</span>
                          {item.badge !== null && item.badge !== undefined && (
                            <span
                              className={`rounded-full px-1.5 py-0.2 text-[9px] font-mono font-bold ${
                                isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-white/60'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* DESKTOP VIEW (>= md): Collapsible Accordion Group Dropdowns */}
              <nav className="hidden md:flex flex-col gap-2.5 w-full">
                {/* Quick Store Maintenance Mode Toggle Card */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 mb-0.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#004ad7]/20 border border-[#004ad7]/30 text-[#60a5fa]">
                        <Lock className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">
                          {isAr ? 'وضع الصيانة للمتجر' : 'Store Maintenance Mode'}
                        </div>
                        <div className="text-[10px] text-zinc-400">
                          {siteSettings.maintenance_mode
                            ? (isAr ? 'المتجر مغلق وتظهر شاشة الصيانة' : 'Store closed to visitors')
                            : (isAr ? 'المتجر متاح ومفتوح للزبائن' : 'Store is live to visitors')}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateSiteSettings({ maintenance_mode: !siteSettings.maintenance_mode })}
                      className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold border transition-all cursor-pointer ${
                        siteSettings.maintenance_mode
                          ? 'border-[#004ad7]/50 bg-[#004ad7]/25 text-white ring-1 ring-[#3b82f6]/40 shadow-xs'
                          : 'border-white/15 bg-white/[0.05] text-white/50 hover:text-white'
                      }`}
                    >
                      {siteSettings.maintenance_mode ? <Lock className="h-3 w-3 text-[#60a5fa]" /> : <Globe className="h-3 w-3" />}
                      <span>{siteSettings.maintenance_mode ? (isAr ? 'مفعل (مغلق)' : 'ON') : (isAr ? 'معطل (مفتوح)' : 'OFF')}</span>
                    </button>
                  </div>
                </div>

                {/* Quick Storefront Hero & Trends Banner Toggle Card */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 mb-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#004ad7]/20 border border-[#004ad7]/30 text-[#3b82f6]">
                        <Sparkles className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">
                          {isAr ? 'واجهة الترحيب والتريندات' : 'Storefront Welcome Banner'}
                        </div>
                        <div className="text-[10px] text-white/50">
                          {isAr ? 'الظهور لجميع زوار المتجر' : 'Visible to store visitors'}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleVisibility('banner_hero_visible')}
                      className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold border transition-all cursor-pointer ${
                        controls['banner_hero_visible']?.visible
                          ? 'border-[#004ad7]/40 bg-[#004ad7]/20 text-white'
                          : 'border-white/15 bg-white/[0.05] text-white/50 hover:text-white'
                      }`}
                    >
                      {controls['banner_hero_visible']?.visible ? <Eye className="h-3 w-3 text-[#3b82f6]" /> : <EyeOff className="h-3 w-3" />}
                      <span>{controls['banner_hero_visible']?.visible ? (isAr ? 'مفعلة' : 'ON') : (isAr ? 'معطلة' : 'OFF')}</span>
                    </button>
                  </div>
                </div>

                {navGroups.map((group) => {
                  const isExpanded = !!expandedGroups[group.id];
                  const hasActiveChild = group.items.some((i) => i.id === activeTab);
                  const GroupIcon = group.icon;

                  // Standalone item (like Analytics) without sub-children
                  if (group.items.length === 1) {
                    const singleItem = group.items[0];
                    const isActive = activeTab === singleItem.id;
                    return (
                      <button
                        key={group.id}
                        type="button"
                        onClick={() => setActiveTab(singleItem.id)}
                        className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#004ad7] text-white shadow-md shadow-[#004ad7]/25 font-bold ring-1 ring-[#3b82f6]/40'
                            : 'text-white/70 hover:bg-white/[0.05] hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <GroupIcon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-[#3b82f6]'}`} />
                          <span>{singleItem.label}</span>
                        </div>
                        <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      </button>
                    );
                  }

                  // Collapsible group with sub-items
                  return (
                    <div
                      key={group.id}
                      className={`rounded-2xl border transition-all ${
                        hasActiveChild
                          ? 'border-white/15 bg-white/[0.03]'
                          : 'border-white/5 bg-transparent hover:border-white/10'
                      }`}
                    >
                      {/* Group Header Toggle */}
                      <button
                        type="button"
                        onClick={() => toggleGroup(group.id)}
                        className="w-full flex items-center justify-between px-3 py-2 text-start text-xs font-bold text-white transition-all cursor-pointer hover:bg-white/[0.03] rounded-t-2xl"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`flex h-6 w-6 items-center justify-center rounded-lg border text-xs ${
                              hasActiveChild
                                ? 'bg-[#004ad7]/25 border-[#004ad7]/40 text-[#60a5fa]'
                                : 'bg-white/[0.04] border-white/10 text-white/60'
                            }`}
                          >
                            <GroupIcon className="h-3.5 w-3.5" />
                          </div>
                          <span className={hasActiveChild ? 'text-white font-bold' : 'text-white/80 font-semibold'}>
                            {group.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ChevronDown
                            className={`h-3.5 w-3.5 text-white/40 transition-transform duration-200 ${
                              isExpanded ? 'rotate-180 text-white/70' : ''
                            }`}
                          />
                        </div>
                      </button>

                      {/* Dropdown Items List */}
                      {isExpanded && (
                        <div className="px-1.5 pb-1.5 pt-0.5 space-y-1">
                          {group.items.map((item) => {
                            const isActive = activeTab === item.id;
                            const ItemIcon = item.icon;
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium transition-all cursor-pointer ${
                                  isActive
                                    ? 'bg-[#004ad7] text-white font-bold shadow-md shadow-[#004ad7]/25'
                                    : 'text-white/65 hover:bg-white/[0.05] hover:text-white'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <ItemIcon
                                    className={`h-3.5 w-3.5 shrink-0 ${
                                      isActive ? 'text-white' : 'text-white/50'
                                    }`}
                                  />
                                  <span className="truncate">{item.label}</span>
                                </div>
                                {item.badge !== null && item.badge !== undefined && (
                                  <span
                                    className={`rounded-full px-2 py-0.5 text-[9.5px] font-mono font-bold ${
                                      isActive
                                        ? 'bg-white/20 text-white'
                                        : 'bg-white/10 text-white/60'
                                    }`}
                                  >
                                    {item.badge}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>

              <div className="hidden md:block mt-6 pt-4 border-t border-white/10 text-[11px] text-white/40">
                <div className="flex items-center justify-between">
                  <span>VANT Master OS</span>
                  <span className="font-mono text-emerald-400 text-[10px]">v3.2 PRO</span>
                </div>
              </div>
            </aside>

            {/* Main Center Content Viewport */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#0c0e15]">
              {/* Group Secondary Sub-Tabs Nav Bar (Integrated Header for Multi-item Sections) */}
              {currentActiveGroup.items.length > 1 && (
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#121524]/90 p-3 sm:p-4 backdrop-blur-md shadow-lg">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#004ad7]/20 border border-[#004ad7]/30 text-[#3b82f6]">
                      <currentActiveGroup.icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-[#60a5fa] uppercase tracking-wider">
                          {currentActiveGroup.title}
                        </span>
                        <span className="text-white/30 text-xs">•</span>
                        <span className="text-xs font-bold text-white truncate">
                          {currentActiveGroup.items.find((i) => i.id === activeTab)?.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-white/50 mt-0.5 line-clamp-1">
                        {currentActiveGroup.items.find((i) => i.id === activeTab)?.description}
                      </p>
                    </div>
                  </div>

                  {/* Clean Sub-Tab Toggle Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto p-1 rounded-xl bg-black/40 border border-white/10 scrollbar-none">
                    {currentActiveGroup.items.map((item) => {
                      const isActive = activeTab === item.id;
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setActiveTab(item.id)}
                          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                            isActive
                              ? 'bg-[#004ad7] text-white shadow-md shadow-[#004ad7]/25'
                              : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                          }`}
                        >
                          <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-white/50'}`} />
                          <span>{item.label}</span>
                          {item.badge !== null && item.badge !== undefined && (
                            <span
                              className={`rounded-full px-1.5 py-0.2 text-[9.5px] font-mono font-bold ${
                                isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-white/70'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 1: DEEP BEHAVIORAL ANALYTICS & INTELLIGENCE SUITE */}
              {activeTab === 'analytics' && (
                <div className="space-y-6 max-w-6xl mx-auto">
                  <AdminAnalyticsDashboard
                    stats={analyticsStats}
                    products={products}
                    isAr={isAr}
                    onRefresh={async () => {
                      await syncFromSupabaseCloud();
                      setAnalyticsStats(getAggregatedAnalytics(products));
                    }}
                  />
                </div>
              )}

              {/* TAB 2: CATALOG & SPECIAL OFFERS CMS */}
              {activeTab === 'products' && (
                <div className="space-y-6 max-w-6xl mx-auto">
                  {/* Top Bar with Add and Filters */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                    <div>
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Package className="h-5 w-5 text-emerald-400" />
                        <span>{isAr ? 'إدارة الكتالوج والعروض والتخفيضات' : 'Catalog & Special Offers CMS'}</span>
                      </h2>
                      <p className="text-xs text-white/60 mt-0.5">
                        {isAr
                          ? `إجمالي القطع في المعرض: ${products.length} قطعة (${products.filter((p) => p.is_offer).length} عروض خاصة نشطة)`
                          : `Total pieces: ${products.length} (${products.filter((p) => p.is_offer).length} active offers)`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {syncToast && (
                        <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg animate-fade-in">
                          {isAr ? '✓ تم تحديث ومزامنة البيانات مع Supabase' : '✓ Synced with Supabase'}
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={handleOpenAddModal}
                        className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-600/25 transition-all cursor-pointer active:scale-95"
                      >
                        <Plus className="h-4 w-4" />
                        <span>{isAr ? 'إضافة قطعة جديدة' : 'Add New Piece'}</span>
                      </button>

                      <button
                        type="button"
                        disabled={isSyncing}
                        onClick={async () => {
                          setIsSyncing(true);
                          await refreshProducts();
                          setIsSyncing(false);
                          setSyncToast(true);
                          setTimeout(() => setSyncToast(false), 3000);
                        }}
                        title={isAr ? 'مزامنة مع قاعدة البيانات السحابية Supabase' : 'Sync with Supabase'}
                        className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.05] px-3 py-2 text-xs font-semibold text-white hover:bg-white/10 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <RotateCcw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin text-[#3b82f6]' : ''}`} />
                        <span className="hidden sm:inline">
                          {isSyncing ? (isAr ? 'جارِ المزامنة...' : 'Syncing...') : (isAr ? 'مزامنة Supabase' : 'Sync Supabase')}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Search & Filter Controls Bar */}
                  <div className="flex flex-wrap items-center gap-2.5 bg-white/[0.03] border border-white/10 rounded-2xl p-3">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                      <input
                        type="text"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder={isAr ? 'بحث بالاسم، الخامة، أو الوسم...' : 'Search pieces by title, fabric, tags...'}
                        className="h-10 w-full rounded-xl border border-white/10 bg-black/40 ltr:pl-9 rtl:pr-9 ltr:pr-3 rtl:pl-3 text-xs text-white placeholder-white/40 outline-none focus:border-[#3b82f6]"
                      />
                    </div>

                    {/* Offers Only Toggle */}
                    <button
                      type="button"
                      onClick={() => setOnlyOffersFilter(!onlyOffersFilter)}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold border transition-all cursor-pointer ${
                        onlyOffersFilter
                          ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-xs'
                          : 'border-white/10 bg-black/30 text-white/60 hover:text-white'
                      }`}
                    >
                      <Tag className="h-3.5 w-3.5" />
                      <span>{isAr ? 'عروض وتخفيضات فقط' : 'Offers Only'}</span>
                    </button>

                    {/* Category Filter Dropdown */}
                    <select
                      value={selectedCategoryFilter}
                      onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                      className="h-10 rounded-xl border border-white/10 bg-black/40 px-3 text-xs text-white outline-none cursor-pointer"
                    >
                      <option value="all">{isAr ? 'كافة الأقسام' : 'All Categories'}</option>
                      {availableCategories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Products Grid List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {filteredProducts.map((p) => {
                      const displayTitle = isAr && p.title_ar ? p.title_ar : p.title;
                      const isExpanded = expandedProductIds.has(p.id);
                      const allImages = p.images && p.images.length > 0 ? p.images : [p.image_url];
                      
                      // Calculate piece-specific live engagement from analyticsStats
                      const pieceStats = analyticsStats.topProducts.find((tp) => String(tp.id) === String(p.id)) || {
                        views: 0,
                        wishlistAdds: 0,
                        whatsappClicks: 0,
                        conversionPct: 0,
                      };

                      // Calculate Discount & Margin
                      const discountAmount = p.is_offer && p.original_price ? p.original_price - p.price : 0;
                      const discountPct = p.is_offer && p.original_price && p.original_price > 0
                        ? Math.round((discountAmount / p.original_price) * 100)
                        : 0;

                      return (
                        <div
                          key={p.id}
                          className={`rounded-2xl border transition-all flex flex-col justify-between ${
                            isExpanded
                              ? 'border-[#004ad7]/60 bg-[#12151f] shadow-2xl md:col-span-2 lg:col-span-3'
                              : 'border-white/10 bg-white/[0.025] hover:bg-white/[0.04]'
                          }`}
                        >
                          <div className="p-3.5">
                            {/* Card Header & Summary */}
                            <div className="flex gap-3">
                              {/* Thumbnail */}
                              <div
                                onClick={() => {
                                  const next = new Set(expandedProductIds);
                                  if (isExpanded) next.delete(p.id);
                                  else next.add(p.id);
                                  setExpandedProductIds(next);
                                }}
                                className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/40 cursor-pointer group"
                              >
                                <img
                                  src={p.image_url}
                                  alt={displayTitle}
                                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                />
                                {p.is_offer && (
                                  <span className="absolute top-1 ltr:left-1 rtl:right-1 rounded-md bg-rose-600 px-1 py-0.2 text-[8px] font-bold text-white shadow-xs">
                                    {p.offer_badge_ar || 'خصم'}
                                  </span>
                                )}
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[9px] font-bold">
                                  {isExpanded ? (isAr ? 'طي ▴' : 'Collapse') : (isAr ? 'توسيع ▾' : 'Expand')}
                                </div>
                              </div>

                              {/* Details */}
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-1">
                                  <h4
                                    onClick={() => {
                                      const next = new Set(expandedProductIds);
                                      if (isExpanded) next.delete(p.id);
                                      else next.add(p.id);
                                      setExpandedProductIds(next);
                                    }}
                                    className="text-xs font-bold text-white truncate cursor-pointer hover:text-[#3b82f6] transition-colors"
                                    title={displayTitle}
                                  >
                                    {displayTitle}
                                  </h4>

                                  {/* Quick Expand Toggle Button */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const next = new Set(expandedProductIds);
                                      if (isExpanded) next.delete(p.id);
                                      else next.add(p.id);
                                      setExpandedProductIds(next);
                                    }}
                                    className="text-white/40 hover:text-white transition-colors"
                                  >
                                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                  </button>
                                </div>
                                <span className="text-[10px] text-white/50 block font-mono">
                                  {p.category}
                                </span>

                                <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
                                  <span className={`text-xs font-bold ${p.is_offer ? 'text-rose-400' : 'text-[#3b82f6]'}`}>
                                    {formatPrice(p.price)}
                                  </span>
                                  {p.is_offer && p.original_price && (
                                    <span className="text-[10px] line-through text-white/40">
                                      {formatPrice(p.original_price)}
                                    </span>
                                  )}
                                  {p.is_offer && discountPct > 0 && (
                                    <span className="rounded bg-rose-500/20 px-1 py-0.2 text-[9px] font-bold text-rose-300">
                                      -{discountPct}%
                                    </span>
                                  )}
                                </div>

                                <div className="mt-1 flex items-center justify-between">
                                  <div className="flex items-center gap-1">
                                    <span
                                      className={`inline-block h-1.5 w-1.5 rounded-full ${
                                        p.availability === 'sold_out'
                                          ? 'bg-rose-500'
                                          : p.availability === 'coming_soon'
                                          ? 'bg-amber-400'
                                          : 'bg-emerald-400'
                                      }`}
                                    />
                                    <span className="text-[10px] text-white/60">
                                      {p.availability === 'sold_out'
                                        ? isAr ? 'منتهي' : 'Sold Out'
                                        : p.availability === 'coming_soon'
                                        ? isAr ? 'قريباً' : 'Coming'
                                        : isAr ? 'متوفر' : 'In Stock'}
                                    </span>
                                  </div>

                                  {/* Quick stats counter */}
                                  <div className="flex items-center gap-2 text-[10px] text-white/40 font-mono">
                                    <span>👁️ {pieceStats.views}</span>
                                    <span>💬 {pieceStats.whatsappClicks}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* ========================================================= */}
                            {/* EXPANDED RICH DETAILS SECTION (Visible when clicked) */}
                            {/* ========================================================= */}
                            {isExpanded && (
                              <div className="mt-4 pt-4 border-t border-white/10 space-y-4 animate-fade-in">
                                {/* 1. Piece Multi-Angle Gallery Thumbnails */}
                                <div>
                                  <span className="text-[11px] font-bold text-white/70 block mb-2">
                                    {isAr ? `معرض صور القطعة (${allImages.length} صور مرفوعة)` : `Gallery Angles (${allImages.length} images)`}
                                  </span>
                                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                                    {allImages.map((img, imgIdx) => (
                                      <a
                                        key={imgIdx}
                                        href={img}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="relative h-16 w-16 shrink-0 rounded-xl overflow-hidden border border-white/10 hover:border-[#3b82f6] transition-all"
                                      >
                                        <img src={img} alt="" className="h-full w-full object-cover" />
                                        <span className="absolute bottom-0.5 ltr:right-0.5 rtl:left-0.5 rounded bg-black/70 px-1 text-[8px] text-white/80 font-mono">
                                          #{imgIdx + 1}
                                        </span>
                                      </a>
                                    ))}
                                  </div>
                                </div>

                                {/* 2. Piece Live Analytics & CTR Breakdown */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                  <div className="rounded-xl border border-white/10 bg-black/40 p-2.5 text-center">
                                    <span className="text-[10px] text-white/50 block">{isAr ? 'المشاهدات' : 'Views'}</span>
                                    <span className="text-sm font-bold text-[#3b82f6] font-mono tabular-nums">{pieceStats.views}</span>
                                  </div>
                                  <div className="rounded-xl border border-white/10 bg-black/40 p-2.5 text-center">
                                    <span className="text-[10px] text-white/50 block">{isAr ? 'المفضلة' : 'Wishlist'}</span>
                                    <span className="text-sm font-bold text-rose-400 font-mono tabular-nums">{pieceStats.wishlistAdds}</span>
                                  </div>
                                  <div className="rounded-xl border border-white/10 bg-black/40 p-2.5 text-center">
                                    <span className="text-[10px] text-white/50 block">{isAr ? 'طلبات الواتساب' : 'WhatsApp'}</span>
                                    <span className="text-sm font-bold text-emerald-400 font-mono tabular-nums">{pieceStats.whatsappClicks}</span>
                                  </div>
                                  <div className="rounded-xl border border-white/10 bg-black/40 p-2.5 text-center">
                                    <span className="text-[10px] text-white/50 block">{isAr ? 'نسبة النقر (CTR)' : 'CTR %'}</span>
                                    <span className="text-sm font-bold text-amber-400 font-mono tabular-nums">{pieceStats.conversionPct}%</span>
                                  </div>
                                </div>

                                {/* 3. Sizing, Fabric, and Descriptions */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                  <div className="rounded-xl border border-white/10 bg-black/30 p-3 space-y-1.5">
                                    <span className="text-[11px] font-bold text-white/60 block">{isAr ? 'المقاسات المتاحة:' : 'Sizes:'}</span>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      {(p.sizes || ['S', 'M', 'L', 'XL']).map((sz) => (
                                        <span key={sz} className="rounded-lg bg-white/10 border border-white/10 px-2 py-0.5 text-[11px] font-bold font-mono text-white">
                                          {sz}
                                        </span>
                                      ))}
                                    </div>

                                    {p.material && (
                                      <div className="pt-1 text-[11px] text-white/70">
                                        <span className="text-white/40">{isAr ? 'الخامة والقماش: ' : 'Fabric: '}</span>
                                        <span className="font-medium text-white">{p.material}</span>
                                      </div>
                                    )}

                                    {p.tags && p.tags.length > 0 && (
                                      <div className="flex items-center gap-1 flex-wrap pt-1">
                                        {p.tags.map((t) => (
                                          <span key={t} className="rounded-md bg-[#004ad7]/15 text-[#3b82f6] px-1.5 py-0.2 text-[10px]">
                                            #{t}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  <div className="rounded-xl border border-white/10 bg-black/30 p-3 space-y-1">
                                    <span className="text-[11px] font-bold text-white/60 block">{isAr ? 'الوصف والتفاصيل:' : 'Description:'}</span>
                                    <p className="text-[11px] text-white/80 line-clamp-3 leading-relaxed">
                                      {isAr ? p.description_ar || p.description || 'لا يوجد وصف مخصص' : p.description || p.description_ar}
                                    </p>
                                  </div>
                                </div>

                                {/* 4. Quick Action Utilities */}
                                <div className="flex items-center gap-2 pt-1 flex-wrap">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(`${window.location.origin}/?product=${p.id}`);
                                      setCopiedLinkProductId(p.id);
                                      setTimeout(() => setCopiedLinkProductId(null), 2000);
                                    }}
                                    className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.05] px-3 py-1.5 text-xs text-white hover:bg-white/10 transition-all cursor-pointer"
                                  >
                                    {copiedLinkProductId === p.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                                    <span>{copiedLinkProductId === p.id ? (isAr ? 'تم نسخ الرابط!' : 'Copied!') : (isAr ? 'نسخ رابط القطعة' : 'Copy Link')}</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newPayload: Omit<Product, 'id'> = {
                                        title: `${p.title} (Copy)`,
                                        title_ar: p.title_ar ? `${p.title_ar} (نسخة)` : undefined,
                                        price: p.price,
                                        original_price: p.original_price,
                                        is_offer: p.is_offer,
                                        offer_badge_ar: p.offer_badge_ar,
                                        offer_badge_en: p.offer_badge_en,
                                        category: p.category,
                                        category_ar: p.category_ar,
                                        image_url: p.image_url,
                                        images: p.images,
                                        availability: p.availability,
                                        tags: p.tags,
                                        description: p.description,
                                        description_ar: p.description_ar,
                                        material: p.material,
                                        sizes: p.sizes,
                                      };
                                      addProduct(newPayload);
                                    }}
                                    className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.05] px-3 py-1.5 text-xs text-white hover:bg-white/10 transition-all cursor-pointer"
                                  >
                                    <Plus className="h-3.5 w-3.5 text-purple-400" />
                                    <span>{isAr ? 'استنساخ القطعة' : 'Duplicate Piece'}</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Quick Action Footer Buttons */}
                          <div className="p-3.5 pt-2 border-t border-white/10 flex items-center justify-between gap-1.5">
                            <div className="flex items-center gap-1">
                              {/* Toggle Offer Button */}
                              <button
                                type="button"
                                onClick={() => handleQuickToggleOffer(p)}
                                title={isAr ? 'تبديل حالة العرض الخاص' : 'Toggle Special Offer'}
                                className={`rounded-lg px-2 py-1 text-[10px] font-semibold border transition-all cursor-pointer ${
                                  p.is_offer
                                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                                    : 'border-white/10 bg-white/[0.04] text-white/60 hover:text-white'
                                }`}
                              >
                                {p.is_offer ? (isAr ? 'عرض نشط' : 'Offer ON') : (isAr ? '+ عرض' : 'Set Offer')}
                              </button>

                              {/* Toggle Availability Quick Selector */}
                              <select
                                value={p.availability || 'in_stock'}
                                onChange={(e) => toggleProductAvailability(p.id, e.target.value as ProductAvailability)}
                                className="h-7 rounded-lg border border-white/10 bg-black/40 px-1 text-[10px] text-white outline-none cursor-pointer"
                              >
                                <option value="in_stock">{isAr ? 'متوفر' : 'Stock'}</option>
                                <option value="sold_out">{isAr ? 'منتهي' : 'Sold'}</option>
                                <option value="coming_soon">{isAr ? 'قريباً' : 'Soon'}</option>
                              </select>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(p)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/80 hover:bg-[#004ad7] hover:text-white transition-all cursor-pointer"
                                title={isAr ? 'تعديل كامل' : 'Edit Piece'}
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(isAr ? `هل أنت متأكد من حذف قطعة "${displayTitle}"؟` : `Delete product "${p.title}"?`)) {
                                    deleteProduct(p.id);
                                  }
                                }}
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                                title={isAr ? 'حذف القطعة' : 'Delete Piece'}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2.2: MASTER SIZES & MEASUREMENTS CONTROL CENTER */}
              {activeTab === 'sizes' && (
                <div className="max-w-6xl mx-auto">
                  <AdminSizesManager isAr={isAr} />
                </div>
              )}

              {/* TAB 2.5: OFFERS & DISCOUNTS CONTROL CENTER */}
              {activeTab === 'offers' && (
                <div className="max-w-6xl mx-auto">
                  <AdminOffersManager
                    isAr={isAr}
                    onNavigateToStoreOffers={() => {
                      setIsAdminOpen(false);
                      // Trigger offers filter in store lookbook
                      const offersBtn = document.querySelector('[role="tab"][aria-selected="false"]') as HTMLElement;
                      if (offersBtn && offersBtn.innerText.includes('العروض')) {
                        offersBtn.click();
                      }
                    }}
                  />
                </div>
              )}

              {/* TAB 3: BANNERS & SITE COPY STUDIO */}
              {activeTab === 'banners' && (
                <div className="space-y-6 max-w-4xl mx-auto">
                  <div className="pb-2 border-b border-white/10 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <ImageIcon className="h-5 w-5 text-amber-400" />
                        <span>{isAr ? 'استوديو تعديل البنرات والوسائط ومقاسات الصور' : 'Banners, Media & Image Specs Studio'}</span>
                      </h2>
                      <p className="text-xs text-white/60 mt-0.5">
                        {isAr
                          ? 'تعديل صور وبنرات الموقع مع دليل المقاسات الهندسية الدقيقة للظهور بأعلى دقة وفخامة'
                          : 'Customize hero backdrops & trend cards with exact image dimension specs'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={resetTrendsToDefault}
                      className="rounded-xl border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                    >
                      {isAr ? 'استعادة التريندات الافتراضية' : 'Reset Default Trends'}
                    </button>
                  </div>

                  {/* HIGH-FASHION IMAGE DIMENSIONS SPECIFICATION GUIDE */}
                  <div className="rounded-3xl border border-amber-500/25 bg-gradient-to-b from-amber-500/10 via-black/40 to-black/60 p-5 sm:p-6 backdrop-blur-md shadow-xl">
                    <div className="flex items-center gap-2.5 mb-3 text-amber-400">
                      <Sparkles className="h-5 w-5" />
                      <h3 className="text-sm font-bold tracking-wide uppercase">
                        {isAr ? 'دليل المقاسات والأبعاد المثالية للصور (Image Dimension Specifications)' : 'Master Image Sizing & Aspect Ratio Specs'}
                      </h3>
                    </div>
                    <p className="text-xs text-white/70 leading-relaxed mb-4">
                      {isAr
                        ? 'لضمان ظهور الصور بأعلى نقاوة وفخامة معمارية دون تشويه أو اقتصاص غير مرغوب، يرجى الالتزام بالأبعاد التالية عند تصميم أو اختيار الصور:'
                        : 'To maintain pristine editorial visual fidelity, adhere to the recommended pixel dimensions and ratios:'}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* Spec 1: Hero Banner */}
                      <div className="rounded-2xl border border-white/10 bg-black/50 p-3.5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-amber-400" />
                            {isAr ? 'خلفية البنر الترحيبي العريض' : 'Welcome Hero Background'}
                          </span>
                          <span className="rounded-md bg-amber-400/20 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-300">
                            1920 × 600 px
                          </span>
                        </div>
                        <span className="text-[11px] text-white/50 block font-mono">النسبة: 16:5 (أفقي بانورامي عريض)</span>
                        <p className="text-[10px] text-white/60 mt-1">
                          {isAr ? 'صورة أفقية عريضة تغطي خلفية الترويسة بالكامل مع المحافظة على وضوح الخط' : 'Ultra-wide landscape banner backdrop'}
                        </p>
                      </div>

                      {/* Spec 2: Trend Cards */}
                      <div className="rounded-2xl border border-white/10 bg-black/50 p-3.5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-[#3b82f6]" />
                            {isAr ? 'كروت تريندات موسم 2026' : 'Seasonal Trend Cards'}
                          </span>
                          <span className="rounded-md bg-[#3b82f6]/20 px-2 py-0.5 text-[10px] font-mono font-bold text-[#3b82f6]">
                            800 × 1000 px
                          </span>
                        </div>
                        <span className="text-[11px] text-white/50 block font-mono">النسبة: 4:5 (عمودي بورتريه أزياء)</span>
                        <p className="text-[10px] text-white/60 mt-1">
                          {isAr ? 'تناسق طولي فاخر لإبراز قصات وتفاصيل المعاطف والتريكو والأقمشة' : 'Vertical fashion portrait ratio'}
                        </p>
                      </div>

                      {/* Spec 3: Product Primary */}
                      <div className="rounded-2xl border border-white/10 bg-black/50 p-3.5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-emerald-400" />
                            {isAr ? 'صورة القطعة الرئيسية بالكتالوج' : 'Catalog Primary Product'}
                          </span>
                          <span className="rounded-md bg-emerald-400/20 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-300">
                            1200 × 1500 px
                          </span>
                        </div>
                        <span className="text-[11px] text-white/50 block font-mono">النسبة: 4:5 (عالي الدقة)</span>
                        <p className="text-[10px] text-white/60 mt-1">
                          {isAr ? 'أفضل دقة للـ Zoom واستكشاف الخامات والتفاصيل بدون تشويش' : 'Crisp high-resolution product showcase'}
                        </p>
                      </div>

                      {/* Spec 4: Product Angles */}
                      <div className="rounded-2xl border border-white/10 bg-black/50 p-3.5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-purple-400" />
                            {isAr ? 'صور الزوايا والتفاصيل الإضافية' : 'Detail & Angle Images'}
                          </span>
                          <span className="rounded-md bg-purple-400/20 px-2 py-0.5 text-[10px] font-mono font-bold text-purple-300">
                            1200 × 1500 px
                          </span>
                        </div>
                        <span className="text-[11px] text-white/50 block font-mono">النسبة: 4:5 أو 1:1</span>
                        <p className="text-[10px] text-white/60 mt-1">
                          {isAr ? 'صور الدرزات، البطانة، الأزرار، والإطلالات الخلفية' : 'Detail zoom & fabric texture shots'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card 1: Welcome Hero Banner Editor */}
                  <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-[#3b82f6]" />
                          <span>{isAr ? 'البنر الترحيبي العريض (Welcome Hero Banner)' : 'Top Welcome Hero Banner'}</span>
                        </h3>
                        <span className="text-xs text-white/50">
                          {isAr ? 'المقاس الموصى به: 1920 × 600 px (نسبة 16:5)' : 'Recommended: 1920 × 600 px (16:5)'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleVisibility('banner_hero_visible')}
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border transition-all cursor-pointer ${
                          controls['banner_hero_visible']?.visible
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                            : 'bg-red-500/20 border-red-500/40 text-red-300'
                        }`}
                      >
                        {controls['banner_hero_visible']?.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                        <span>{controls['banner_hero_visible']?.visible ? (isAr ? 'ظاهر بالموقع' : 'Visible') : (isAr ? 'مخفي' : 'Hidden')}</span>
                      </button>
                    </div>

                    {/* Headline Arabic & English */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-xs font-semibold text-white/70 block mb-1">
                          {isAr ? 'العنوان الرئيسي (العربية)' : 'Main Headline (Arabic)'}
                        </label>
                        <input
                          type="text"
                          value={controls['banner_hero_title']?.label_ar || ''}
                          onChange={(e) => updateControl('banner_hero_title', { label_ar: e.target.value })}
                          className="h-10 w-full rounded-xl border border-white/15 bg-black/40 px-3 text-xs text-white outline-none focus:border-[#3b82f6]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-white/70 block mb-1">
                          {isAr ? 'العنوان الرئيسي (الإنجليزية)' : 'Main Headline (English)'}
                        </label>
                        <input
                          type="text"
                          value={controls['banner_hero_title']?.label_en || ''}
                          onChange={(e) => updateControl('banner_hero_title', { label_en: e.target.value })}
                          className="h-10 w-full rounded-xl border border-white/15 bg-black/40 px-3 text-xs text-white outline-none focus:border-[#3b82f6]"
                        />
                      </div>
                    </div>

                    {/* Subtitle / Manifesto Text */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-xs font-semibold text-white/70 block mb-1">
                          {isAr ? 'نص الفلسفة والبيان (العربية)' : 'Manifesto Description (Arabic)'}
                        </label>
                        <textarea
                          rows={2}
                          value={controls['banner_hero_subtitle']?.label_ar || ''}
                          onChange={(e) => updateControl('banner_hero_subtitle', { label_ar: e.target.value })}
                          className="w-full rounded-xl border border-white/15 bg-black/40 p-3 text-xs text-white outline-none focus:border-[#3b82f6]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-white/70 block mb-1">
                          {isAr ? 'نص الفلسفة والبيان (الإنجليزية)' : 'Manifesto Description (English)'}
                        </label>
                        <textarea
                          rows={2}
                          value={controls['banner_hero_subtitle']?.label_en || ''}
                          onChange={(e) => updateControl('banner_hero_subtitle', { label_en: e.target.value })}
                          className="w-full rounded-xl border border-white/15 bg-black/40 p-3 text-xs text-white outline-none focus:border-[#3b82f6]"
                        />
                      </div>
                    </div>

                    {/* Top Tag & Button Labels */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-xs font-semibold text-white/70 block mb-1">
                          {isAr ? 'الشريط الأرشيفي أعلى البنر' : 'Top Tag Line'}
                        </label>
                        <input
                          type="text"
                          value={controls['banner_hero_tag']?.label_ar || ''}
                          onChange={(e) => updateControl('banner_hero_tag', { label_ar: e.target.value, label_en: e.target.value })}
                          className="h-10 w-full rounded-xl border border-white/15 bg-black/40 px-3 text-xs text-white outline-none focus:border-[#3b82f6]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-white/70 block mb-1">
                          {isAr ? 'نص زر التصفح' : 'Action Button Label'}
                        </label>
                        <input
                          type="text"
                          value={controls['banner_hero_btn']?.label_ar || ''}
                          onChange={(e) => updateControl('banner_hero_btn', { label_ar: e.target.value, label_en: e.target.value })}
                          className="h-10 w-full rounded-xl border border-white/15 bg-black/40 px-3 text-xs text-white outline-none focus:border-[#3b82f6]"
                        />
                      </div>
                    </div>

                    {/* Background Image URL with Preview & Presets */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-white/70">
                          {isAr ? 'رابط صورة خلفية البنر الترحيبي' : 'Hero Background Image URL'}
                        </label>
                        <span className="text-[10px] text-amber-400 font-mono font-bold bg-amber-400/10 px-2 py-0.2 rounded border border-amber-400/20">
                          1920 × 600 px (16:5)
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={controls['banner_hero_bg']?.actionValue || ''}
                          onChange={(e) => updateControl('banner_hero_bg', { actionValue: e.target.value })}
                          placeholder="https://images.unsplash.com/..."
                          className="h-10 flex-1 rounded-xl border border-white/15 bg-black/40 px-3 text-xs text-white outline-none focus:border-[#3b82f6]"
                        />

                        {/* Direct File Upload to Supabase Storage */}
                        <label className={`flex items-center justify-center gap-1.5 rounded-xl px-4 h-10 text-xs font-bold text-white transition-all cursor-pointer shrink-0 ${
                          isUploadingHeroBg
                            ? 'bg-emerald-700/60 cursor-not-allowed opacity-80'
                            : 'bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-900/30'
                        }`}>
                          {isUploadingHeroBg ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin text-white" />
                              <span>{isAr ? 'جار الرفع للسوبابيس...' : 'Uploading to Supabase...'}</span>
                            </>
                          ) : (
                            <>
                              <UploadCloud className="h-4 w-4" />
                              <span>{isAr ? 'رفع ملف لسوبابيس' : 'Upload to Supabase'}</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            disabled={isUploadingHeroBg}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                try {
                                  setIsUploadingHeroBg(true);
                                  const url = await uploadImageToSupabase(file, 'banners');
                                  if (url) {
                                    updateControl('banner_hero_bg', { actionValue: url });
                                    setUploadHeroBgSuccess(true);
                                    setTimeout(() => setUploadHeroBgSuccess(false), 5000);
                                  }
                                } finally {
                                  setIsUploadingHeroBg(false);
                                }
                              }
                            }}
                            className="hidden"
                          />
                        </label>

                        {controls['banner_hero_bg']?.actionValue && (
                          <div className="h-10 w-24 shrink-0 rounded-xl overflow-hidden border border-white/20 relative group">
                            <img
                              src={controls['banner_hero_bg'].actionValue}
                              alt="Preview"
                              className="h-full w-full object-cover"
                            />
                            <a
                              href={controls['banner_hero_bg'].actionValue}
                              target="_blank"
                              rel="noreferrer"
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity"
                            >
                              {isAr ? 'عرض' : 'View'}
                            </a>
                          </div>
                        )}
                      </div>

                      {uploadHeroBgSuccess && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-1.5 animate-fade-in">
                          <Check className="h-4 w-4 shrink-0" />
                          <span>
                            {isAr
                              ? 'تم رفع الصورة وحفظها سحابياً في Supabase Storage بشكل دائم وبلا فقدان عند إعادة التحميل'
                              : 'Successfully uploaded and permanently synced to Supabase Cloud Storage'}
                          </span>
                        </div>
                      )}

                      {/* Quick Luxury Presets */}
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] text-white/40">{isAr ? 'خيارات سريعة جاهزة:' : 'Presets:'}</span>
                        {[
                          { name: isAr ? 'أزياء أرشيفية رمادية' : 'Minimalist Grey', url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1920&q=85' },
                          { name: isAr ? 'ستوديو معماري هادئ' : 'Architectural Studio', url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1920&q=85' },
                          { name: isAr ? 'صوف كشمير عاجي' : 'Cashmere Wool Texture', url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1920&q=85' },
                          { name: isAr ? 'خياطة إيطالية ليلية' : 'Nocturnal Atelier', url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1920&q=85' },
                        ].map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => updateControl('banner_hero_bg', { actionValue: preset.url })}
                            className="rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-[10px] text-white/70 hover:text-white hover:border-[#3b82f6] transition-all cursor-pointer"
                          >
                            {preset.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card 2: 5 Seasonal Trend Cards Studio */}
                  <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <Flame className="h-4 w-4 text-amber-400" />
                          <span>{isAr ? 'كروت تريندات الموسم الخمسة (Seasonal Trends 2026 Cards)' : 'Seasonal Trends Cards'}</span>
                        </h3>
                        <span className="text-xs text-white/50">
                          {isAr ? 'المقاس الموصى به لكل كارت: 800 × 1000 px (نسبة 4:5)' : 'Recommended for each card: 800 × 1000 px (4:5)'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-[#3b82f6] bg-[#3b82f6]/10 px-2 py-0.5 rounded-full border border-[#3b82f6]/20">
                          {trendItems.length} {isAr ? 'كروت نشطة' : 'Active Cards'}
                        </span>
                      </div>
                    </div>

                    {/* Trends Headline Setting */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-xs font-semibold text-white/70 block mb-1">
                          {isAr ? 'عنوان القسم الرئيسي (العربية)' : 'Section Title (Arabic)'}
                        </label>
                        <input
                          type="text"
                          value={controls['banner_trends_title']?.label_ar || ''}
                          onChange={(e) => updateControl('banner_trends_title', { label_ar: e.target.value })}
                          className="h-10 w-full rounded-xl border border-white/15 bg-black/40 px-3 text-xs text-white outline-none focus:border-[#3b82f6]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-white/70 block mb-1">
                          {isAr ? 'عنوان القسم الرئيسي (الإنجليزية)' : 'Section Title (English)'}
                        </label>
                        <input
                          type="text"
                          value={controls['banner_trends_title']?.label_en || ''}
                          onChange={(e) => updateControl('banner_trends_title', { label_en: e.target.value })}
                          className="h-10 w-full rounded-xl border border-white/15 bg-black/40 px-3 text-xs text-white outline-none focus:border-[#3b82f6]"
                        />
                      </div>
                    </div>

                    {/* 5 Trend Cards List */}
                    <div className="space-y-3 pt-2">
                      {trendItems.map((trend, idx) => (
                        <div
                          key={trend.id}
                          className="rounded-2xl border border-white/10 bg-black/40 p-4 transition-all hover:border-white/20 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#3b82f6] font-mono">
                              #{idx + 1} {trend.tagAr || trend.tagEn}
                            </span>
                            <span className="text-[10px] text-amber-400 font-mono font-bold bg-amber-400/10 px-2 py-0.2 rounded border border-amber-400/20">
                              800 × 1000 px (4:5)
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] text-white/70 block mb-1">{isAr ? 'العنوان (العربية)' : 'Title (AR)'}</label>
                              <input
                                type="text"
                                value={trend.titleAr}
                                onChange={(e) => updateTrendItem(trend.id, { titleAr: e.target.value })}
                                className="h-9 w-full rounded-lg border border-white/15 bg-black/60 px-2.5 text-xs text-white outline-none focus:border-[#3b82f6]"
                              />
                            </div>

                            <div>
                              <label className="text-[11px] text-white/70 block mb-1">{isAr ? 'العنوان (الإنجليزية)' : 'Title (EN)'}</label>
                              <input
                                type="text"
                                value={trend.titleEn}
                                onChange={(e) => updateTrendItem(trend.id, { titleEn: e.target.value })}
                                className="h-9 w-full rounded-lg border border-white/15 bg-black/60 px-2.5 text-xs text-white outline-none focus:border-[#3b82f6]"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="text-[11px] text-white/70 block mb-1">{isAr ? 'الوصف الفرعي (العربية)' : 'Subtitle (AR)'}</label>
                              <input
                                type="text"
                                value={trend.subtitleAr}
                                onChange={(e) => updateTrendItem(trend.id, { subtitleAr: e.target.value })}
                                className="h-9 w-full rounded-lg border border-white/15 bg-black/60 px-2.5 text-xs text-white outline-none focus:border-[#3b82f6]"
                              />
                            </div>

                            <div>
                              <label className="text-[11px] text-white/70 block mb-1">{isAr ? 'الوسم الأرشيفي' : 'Tag'}</label>
                              <input
                                type="text"
                                value={trend.tagAr}
                                onChange={(e) => updateTrendItem(trend.id, { tagAr: e.target.value, tagEn: e.target.value })}
                                className="h-9 w-full rounded-lg border border-white/15 bg-black/60 px-2.5 text-xs text-white outline-none focus:border-[#3b82f6]"
                              />
                            </div>

                            <div>
                              <label className="text-[11px] text-white/70 block mb-1">{isAr ? 'القسم المرتبط' : 'Category Target'}</label>
                              <select
                                value={trend.category}
                                onChange={(e) => updateTrendItem(trend.id, { category: e.target.value })}
                                className="h-9 w-full rounded-lg border border-white/15 bg-black/60 px-2 text-xs text-white outline-none cursor-pointer"
                              >
                                <option value="Tailoring">Tailoring</option>
                                <option value="Outerwear">Outerwear</option>
                                <option value="Knitwear">Knitwear</option>
                                <option value="Accessories">Accessories</option>
                                <option value="Leather Goods">Leather Goods</option>
                                <option value="Footwear">Footwear</option>
                              </select>
                            </div>
                          </div>

                          {/* Image URL with live preview thumbnail & file upload */}
                          <div>
                            <label className="text-[11px] text-white/70 block mb-1">
                              {isAr ? 'رابط أو رفع صورة الكارت' : 'Card Image'}
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="url"
                                value={trend.image}
                                onChange={(e) => updateTrendItem(trend.id, { image: e.target.value })}
                                placeholder="https://images.unsplash.com/..."
                                className="h-9 flex-1 rounded-lg border border-white/15 bg-black/60 px-2.5 text-xs text-white outline-none focus:border-[#3b82f6]"
                              />

                              <label className={`flex items-center gap-1 rounded-lg px-2.5 h-9 text-[11px] font-bold text-white transition-all cursor-pointer shrink-0 ${
                                uploadingTrendId === trend.id
                                  ? 'bg-emerald-700/60 cursor-not-allowed opacity-80'
                                  : 'bg-emerald-600 hover:bg-emerald-500'
                              }`}>
                                {uploadingTrendId === trend.id ? (
                                  <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    <span>{isAr ? 'جار الرفع...' : 'Uploading...'}</span>
                                  </>
                                ) : (
                                  <>
                                    <UploadCloud className="h-3.5 w-3.5" />
                                    <span>{isAr ? 'رفع' : 'Upload'}</span>
                                  </>
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  disabled={uploadingTrendId === trend.id}
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      try {
                                        setUploadingTrendId(trend.id);
                                        const url = await uploadImageToSupabase(file, 'trends');
                                        if (url) updateTrendItem(trend.id, { image: url });
                                      } finally {
                                        setUploadingTrendId(null);
                                      }
                                    }
                                  }}
                                  className="hidden"
                                />
                              </label>

                              {trend.image && (
                                <div className="h-9 w-12 shrink-0 rounded-lg overflow-hidden border border-white/20">
                                  <img src={trend.image} alt="" className="h-full w-full object-cover" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card 3: Multi-Number WhatsApp Concierge & Phone Manager */}
                  <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/[0.07] via-white/[0.02] to-black/40 p-6 space-y-6 shadow-2xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                      <div>
                        <h3 className="text-base font-bold text-white flex items-center gap-2.5">
                          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <MessageCircle className="h-4 w-4" />
                          </span>
                          <span>{isAr ? 'إدارة رقم الواتساب المعتمد وتعدد الأرقام' : 'WhatsApp Store Line & Multi-Number Manager'}</span>
                        </h3>
                        <p className="text-xs text-white/60 mt-1">
                          {isAr
                            ? 'ضع الرقم المعتمد للمتجر ليتم حفظه واعتماده فوراً لجميع طلبات الزبائن واستفسارات المقاسات، مع إمكانية إضافة عدة أرقام والتبديل بينها.'
                            : 'Set and adopt your store WhatsApp number instantly for customer inquiries, with support for multiple phone lines.'}
                        </p>
                      </div>

                      {phoneSaveSuccess && (
                        <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-3.5 py-1.5 text-xs font-bold text-emerald-300 animate-fade-in shadow-lg shrink-0">
                          <Check className="h-4 w-4 stroke-[3]" />
                          <span>{savedSuccessMsg || (isAr ? 'تم حفظ واعتماد الرقم بنجاح' : 'Saved & Adopted Successfully')}</span>
                        </div>
                      )}
                    </div>

                    {/* SECTION 1: PRIMARY SINGLE NUMBER INPUT & INSTANT ADOPT */}
                    <div className="rounded-2xl border border-emerald-500/30 bg-black/60 p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-white flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span>{isAr ? 'الرقم المعتمد والنشط حالياً للمتجر:' : 'Active & Adopted Store WhatsApp Number:'}</span>
                        </label>
                        <span className="text-[11px] font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                          {isAr ? 'يتم توجيه جميع الطلبات إليه' : 'All orders route here'}
                        </span>
                      </div>

                      <form onSubmit={handleSavePrimaryPhone} className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            required
                            dir="ltr"
                            placeholder={isAr ? 'أدخل رقم الواتساب (مثال: 9647800000000 أو +964...)' : 'Enter WhatsApp Number (e.g. 9647800000000)'}
                            value={primaryPhoneInput}
                            onChange={(e) => setPrimaryPhoneInput(e.target.value)}
                            className="h-12 w-full rounded-xl border border-emerald-500/30 bg-black/80 px-4 text-sm font-mono font-bold text-white placeholder:text-white/30 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 tracking-wider shadow-inner"
                          />
                        </div>

                        <button
                          type="submit"
                          className="h-12 px-6 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs tracking-wider uppercase transition-all active:scale-95 cursor-pointer shadow-lg shadow-emerald-500/20 shrink-0"
                        >
                          <Check className="h-4 w-4 stroke-[3]" />
                          <span>{isAr ? 'حفظ واعتماد هذا الرقم' : 'Save & Adopt Line'}</span>
                        </button>
                      </form>

                      {/* Live Adopted Banner Display */}
                      {(() => {
                        const activePhone = whatsappNumbers.find((n) => n.isActive) || whatsappNumbers[0];
                        const activeNum = activePhone ? activePhone.number : primaryPhoneInput;
                        const activeClean = activeNum.replace(/[^0-9]/g, '');
                        const testUrl = activeClean ? `https://wa.me/${activeClean}?text=${encodeURIComponent('تجربة اتصال من لوحة تحكم ڤانت')}` : '#';

                        return (
                          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                                <MessageCircle className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="flex items-baseline gap-2">
                                  <span className="font-mono text-base font-extrabold text-white tracking-widest" dir="ltr">
                                    {activeNum}
                                  </span>
                                  <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold text-emerald-300 border border-emerald-500/30 uppercase">
                                    {isAr ? 'معتمد ونشط' : 'Active'}
                                  </span>
                                </div>
                                <span className="text-[11px] text-white/50 block mt-0.5">
                                  {activePhone?.label || (isAr ? 'رقم الواتساب الرئيسي لـ ڤانت' : 'Primary VANT WhatsApp')}
                                </span>
                              </div>
                            </div>

                            <a
                              href={testUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 px-4 py-2 text-xs font-bold text-emerald-300 transition-all active:scale-95 cursor-pointer shrink-0"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              <span>{isAr ? 'تجربة فتح المحادثة على واتساب' : 'Test WhatsApp Chat'}</span>
                            </a>
                          </div>
                        );
                      })()}
                    </div>

                    {/* SECTION 2: MULTI-NUMBER MANAGEMENT & DIRECTORY */}
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-white flex items-center gap-2">
                            <span>{isAr ? `إدارة وتعدد الأرقام (${whatsappNumbers.length})` : `Saved Numbers Directory (${whatsappNumbers.length})`}</span>
                          </h4>
                          <p className="text-[11px] text-white/50 mt-0.5">
                            {isAr
                              ? 'يمكنك إضافة أكثر من رقم والتبديل بينها أو تعديلها في أي وقت بنقرة واحدة.'
                              : 'Add multiple numbers and switch or edit active lines anytime.'}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setShowAddForm(!showAddForm)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-3.5 py-1.5 text-xs font-bold text-white transition-all cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5 text-emerald-400" />
                          <span>{showAddForm ? (isAr ? 'إغلاق النموذج' : 'Close') : (isAr ? '+ إضافة رقم إضافي' : '+ Add Number')}</span>
                        </button>
                      </div>

                      {/* Add New Phone Accordion Form */}
                      {showAddForm && (
                        <form onSubmit={handleAddNewPhone} className="rounded-2xl border border-emerald-500/30 bg-black/60 p-4 space-y-3 animate-fade-in">
                          <h5 className="text-xs font-bold text-white flex items-center gap-2">
                            <Plus className="h-3.5 w-3.5 text-emerald-400" />
                            <span>{isAr ? 'إضافة رقم واتساب إضافي' : 'Add Additional WhatsApp Line'}</span>
                          </h5>

                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                            <div className="sm:col-span-6">
                              <input
                                type="text"
                                required
                                dir="ltr"
                                placeholder={isAr ? 'رقم الهاتف (مثال: 9647XXXXXXXXX)' : 'Phone number (e.g. 9647XXXXXXXXX)'}
                                value={newPhoneInput}
                                onChange={(e) => setNewPhoneInput(e.target.value)}
                                className="h-10 w-full rounded-xl border border-white/15 bg-black/80 px-3 text-xs text-white placeholder:text-white/30 outline-none focus:border-emerald-400 font-mono"
                              />
                            </div>

                            <div className="sm:col-span-4">
                              <input
                                type="text"
                                placeholder={isAr ? 'تسمية الرقم (مثال: مبيعات دبي / خدمة العملاء)' : 'Label (e.g. Sales / Customer Care)'}
                                value={newPhoneLabel}
                                onChange={(e) => setNewPhoneLabel(e.target.value)}
                                className="h-10 w-full rounded-xl border border-white/15 bg-black/80 px-3 text-xs text-white placeholder:text-white/30 outline-none focus:border-emerald-400"
                              />
                            </div>

                            <div className="sm:col-span-2">
                              <button
                                type="submit"
                                className="h-10 w-full flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
                              >
                                <Plus className="h-4 w-4" />
                                <span>{isAr ? 'إضافة' : 'Add'}</span>
                              </button>
                            </div>
                          </div>
                        </form>
                      )}

                      {/* Saved Numbers Directory List with Inline Editing */}
                      <div className="space-y-2">
                        {whatsappNumbers.map((entry) => {
                          const isEditing = editingPhoneId === entry.id;
                          const cleanNum = entry.number.replace(/[^0-9]/g, '');
                          const waUrl = cleanNum ? `https://wa.me/${cleanNum}` : '#';

                          return (
                            <div
                              key={entry.id}
                              className={`p-3.5 rounded-2xl border transition-all ${
                                entry.isActive
                                  ? 'border-emerald-500/50 bg-emerald-500/10 shadow-md'
                                  : 'border-white/10 bg-black/40 hover:border-white/20'
                              }`}
                            >
                              {isEditing ? (
                                <div className="space-y-3">
                                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                                    <div className="sm:col-span-6">
                                      <input
                                        type="text"
                                        dir="ltr"
                                        value={editingPhoneInput}
                                        onChange={(e) => setEditingPhoneInput(e.target.value)}
                                        className="h-9 w-full rounded-xl border border-emerald-500/40 bg-black px-3 text-xs font-mono text-white outline-none"
                                        placeholder="9647XXXXXXXXX"
                                      />
                                    </div>
                                    <div className="sm:col-span-6">
                                      <input
                                        type="text"
                                        value={editingPhoneLabel}
                                        onChange={(e) => setEditingPhoneLabel(e.target.value)}
                                        className="h-9 w-full rounded-xl border border-white/20 bg-black px-3 text-xs text-white outline-none"
                                        placeholder={isAr ? 'تسمية الرقم' : 'Label'}
                                      />
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setEditingPhoneId(null)}
                                      className="rounded-xl border border-white/10 px-3 py-1 text-xs text-white/60 hover:text-white"
                                    >
                                      {isAr ? 'إلغاء' : 'Cancel'}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleSaveEditedPhone(entry.id)}
                                      className="rounded-xl bg-emerald-500 text-black font-bold px-3 py-1 text-xs hover:bg-emerald-400"
                                    >
                                      {isAr ? 'حفظ التعديل' : 'Save'}
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                  <div className="flex items-center gap-3">
                                    <button
                                      type="button"
                                      onClick={() => handleSetActivePhone(entry.id)}
                                      className={`h-5 w-5 rounded-full border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                                        entry.isActive
                                          ? 'border-emerald-400 bg-emerald-500 text-black shadow-sm shadow-emerald-500/50'
                                          : 'border-white/30 hover:border-white/60 bg-transparent'
                                      }`}
                                      title={isAr ? 'اعتماد هذا الرقم' : 'Set as Active'}
                                    >
                                      {entry.isActive && <Check className="h-3 w-3 stroke-[3]" />}
                                    </button>

                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono text-sm font-bold text-white tracking-wider" dir="ltr">
                                          {entry.number}
                                        </span>
                                        {entry.isActive && (
                                          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9.5px] font-extrabold text-emerald-300 border border-emerald-500/30">
                                            {isAr ? 'معتمد ونشط' : 'Active'}
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[11px] text-white/50 block mt-0.5">{entry.label}</span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                                    {!entry.isActive && (
                                      <button
                                        type="button"
                                        onClick={() => handleSetActivePhone(entry.id)}
                                        className="rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 hover:text-white transition-all cursor-pointer"
                                      >
                                        {isAr ? 'اعتماد كالرقم النشط' : 'Adopt as Active'}
                                      </button>
                                    )}

                                    <button
                                      type="button"
                                      onClick={() => handleStartEditPhone(entry)}
                                      className="rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-2.5 py-1.5 text-xs text-white/70 hover:text-white transition-all cursor-pointer"
                                      title={isAr ? 'تعديل' : 'Edit'}
                                    >
                                      <Edit3 className="h-3.5 w-3.5" />
                                    </button>

                                    <a
                                      href={waUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition-all cursor-pointer"
                                    >
                                      {isAr ? 'واتساب' : 'WhatsApp'}
                                    </a>

                                    {whatsappNumbers.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => handleDeletePhone(entry.id)}
                                        className="h-8 w-8 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition-all cursor-pointer"
                                        title={isAr ? 'حذف الرقم' : 'Delete'}
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3.5: SOCIAL & GLOBAL PLATFORMS */}
              {activeTab === 'social' && (
                <div className="max-w-6xl mx-auto">
                  <SocialLinksManager isAr={isAr} />
                </div>
              )}

              {/* TAB 4: BUTTONS & INTERACTIVE CONTROLS */}
              {activeTab === 'controls' && (
                <div className="space-y-4 max-w-4xl mx-auto">
                  <div className="pb-2 border-b border-white/10 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Sliders className="h-5 w-5 text-purple-400" />
                        <span>{isAr ? 'التحكم بأزرار وخصائص الموقع' : 'Buttons & Interactive Controls'}</span>
                      </h2>
                      <p className="text-xs text-white/60 mt-0.5">
                        {isAr
                          ? 'إظهار أو إخفاء أي زر بالموقع بنقرة واحدة مع تحديث فوري'
                          : 'Toggle visibility of all buttons and modules'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={resetAllControls}
                      className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                    >
                      {isAr ? 'استعادة الافتراضي' : 'Reset Defaults'}
                    </button>
                  </div>

                  {/* CARD 0: GLOBAL MAINTENANCE MODE & CINEMATIC SPLASH SETTINGS */}
                  <div className="rounded-3xl border border-[#004ad7]/30 bg-gradient-to-b from-[#004ad7]/10 via-[#0e121b] to-[#0a0c10] p-6 space-y-6 shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`h-2.5 w-2.5 rounded-full ${siteSettings.maintenance_mode ? 'bg-[#3b82f6] animate-pulse shadow-sm shadow-[#3b82f6]' : 'bg-emerald-400'}`} />
                          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                            {isAr ? 'وضع الصيانة وإغلاق المتجر المؤقت (Maintenance Mode)' : 'Global Maintenance Mode Controller'}
                          </h3>
                        </div>
                        <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                          {isAr
                            ? 'عند التفعيل، يتم حجب المتجر بالكامل عن الزوار وعرض شاشة الصيانة الفاخرة (مع إمكانية دخول المشرفين فقط).'
                            : 'When active, locks store access and displays the high-fashion maintenance screen (Admin bypass enabled).'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => updateSiteSettings({ maintenance_mode: !siteSettings.maintenance_mode })}
                          className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold border transition-all cursor-pointer shadow-md ${
                            siteSettings.maintenance_mode
                              ? 'bg-[#004ad7] hover:bg-[#003db3] text-white border-[#3b82f6]/50 shadow-[#004ad7]/30 ring-1 ring-[#3b82f6]'
                              : 'bg-white/10 hover:bg-white/15 text-white/80 border-white/20'
                          }`}
                        >
                          <span className={`h-2 w-2 rounded-full ${siteSettings.maintenance_mode ? 'bg-white animate-pulse' : 'bg-emerald-400'}`} />
                          <span>
                            {siteSettings.maintenance_mode
                              ? (isAr ? 'وضع الصيانة مفعّل (المتجر مغلق)' : 'Maintenance ACTIVE (Offline)')
                              : (isAr ? 'المتجر متاح للجميع (Online)' : 'Store LIVE (Online)')}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* LIVE INTERACTIVE TEST & PREVIEW BUTTONS BAR */}
                    <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold text-white flex items-center gap-2">
                          <Eye className="h-4 w-4 text-[#3b82f6]" />
                          <span>{isAr ? 'أزرار اختبار وتجربة الشاشات (Live Test & Preview):' : 'Interactive Screen Testing & Previews:'}</span>
                        </span>
                        <p className="text-[11px] text-white/55 mt-0.5">
                          {isAr
                            ? 'انقر على أي زر لمعاينة الشاشة مباشرة وتجربة التصميم والنصوص وحركات الأنيميشن دون التأثير على الزوار'
                            : 'Test and preview the splash animation and maintenance screen in real time.'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap shrink-0">
                        {/* Test Splash Loader Button */}
                        <button
                          type="button"
                          onClick={() => setIsPreviewSplash(true)}
                          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#004ad7] to-[#3b82f6] hover:from-[#003db3] hover:to-[#2563eb] text-white px-4 py-2 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-md"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>{isAr ? 'معاينة شاشة التحميل (Splash)' : 'Test Splash Screen'}</span>
                        </button>

                        {/* Test Maintenance Screen Button */}
                        <button
                          type="button"
                          onClick={() => setIsPreviewMaintenance(true)}
                          className="inline-flex items-center gap-2 rounded-xl border border-[#004ad7]/40 bg-[#004ad7]/15 hover:bg-[#004ad7]/25 text-white px-4 py-2 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
                        >
                          <Lock className="h-3.5 w-3.5 text-[#60a5fa]" />
                          <span>{isAr ? 'معاينة شاشة الصيانة' : 'Test Maintenance'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Maintenance Messages Form */}
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-white flex items-center gap-2">
                          <Lock className="h-3.5 w-3.5 text-[#60a5fa]" />
                          <span>{isAr ? 'رسائل وتفاصيل شاشة الصيانة (Maintenance Messages):' : 'Maintenance Screen Messages:'}</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsPreviewMaintenance(true)}
                          className="text-[11px] font-semibold text-[#60a5fa] hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Eye className="h-3 w-3" />
                          <span>{isAr ? 'تجربة الظهور الآن' : 'Preview Live'}</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-white/80 block mb-1">
                            {isAr ? 'رسالة الصيانة (الإنجليزية)' : 'Maintenance Subtitle (English)'}
                          </label>
                          <input
                            type="text"
                            value={siteSettings.maintenance_message}
                            onChange={(e) => updateSiteSettings({ maintenance_message: e.target.value })}
                            placeholder="We are preparing Volume 02. Please check back later."
                            className="h-10 w-full rounded-xl border border-white/15 bg-black/50 px-3 text-xs text-white outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-white/80 block mb-1">
                            {isAr ? 'رسالة الصيانة (العربية)' : 'Maintenance Subtitle (Arabic)'}
                          </label>
                          <input
                            type="text"
                            dir="rtl"
                            value={siteSettings.maintenance_message_ar || ''}
                            onChange={(e) => updateSiteSettings({ maintenance_message_ar: e.target.value })}
                            placeholder="نعمل حالياً على تجهيز التشكيلة الجديدة وتحديث النظام. يرجى العودة لاحقاً."
                            className="h-10 w-full rounded-xl border border-white/15 bg-black/50 px-3 text-xs text-white outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Cinematic Splash Screen Texts */}
                    <div className="pt-4 border-t border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-[#3b82f6]" />
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                            {isAr ? 'نصوص شاشة التحميل الافتتاحية (Cinematic Splash Loader)' : 'Cinematic Splash Screen Subtitles'}
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsPreviewSplash(true)}
                          className="text-[11px] font-semibold text-[#3b82f6] hover:text-[#60a5fa] flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Eye className="h-3 w-3" />
                          <span>{isAr ? 'تشغيل ومعاينة التحميل' : 'Preview Loader'}</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-white/70 block mb-1">
                            {isAr ? 'نص التحميل الافتتاحي (الإنجليزية)' : 'Splash Loading Text (English)'}
                          </label>
                          <input
                            type="text"
                            value={siteSettings.loading_text_en}
                            onChange={(e) => updateSiteSettings({ loading_text_en: e.target.value })}
                            placeholder="INITIALIZING ARCHIVE"
                            className="h-10 w-full rounded-xl border border-white/15 bg-black/50 px-3 text-xs text-white outline-none focus:border-[#3b82f6] font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-white/70 block mb-1">
                            {isAr ? 'نص التحميل الافتتاحي (العربية)' : 'Splash Loading Text (Arabic)'}
                          </label>
                          <input
                            type="text"
                            dir="rtl"
                            value={siteSettings.loading_text_ar}
                            onChange={(e) => updateSiteSettings({ loading_text_ar: e.target.value })}
                            placeholder="جاري تحميل الأرشيف وتجهيز التشكيلة"
                            className="h-10 w-full rounded-xl border border-white/15 bg-black/50 px-3 text-xs text-white outline-none focus:border-[#3b82f6]"
                          />
                        </div>
                      </div>

                      {/* Fashion Motif Models Selector Grid */}
                      <div className="pt-4 border-t border-white/10 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Shirt className="h-4 w-4 text-[#3b82f6]" />
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                              {isAr ? 'نموذج حركة أيقونة الأزياء (Haute-Couture Animated Motif)' : 'Fashion Animation Motif Style'}
                            </h4>
                          </div>
                          <span className="text-[10.5px] font-mono text-white/50">
                            {isAr ? 'اختر النموذج المفضل ليظهر في شاشة البداية' : 'Select active splash motif'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                          {AVAILABLE_SPLASH_MOTIFS.map((item) => {
                            const isSelected = (siteSettings.splash_motif || 'hanger') === item.id;
                            const isPrintOrApparel = item.id === 'print_press' || item.id === 'tshirt_print' || item.id === 'embroidery';
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={async () => {
                                  await updateSiteSettings({ splash_motif: item.id });
                                }}
                                className={`flex flex-col text-start p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                                  isSelected
                                    ? 'bg-[#004ad7]/20 border-[#3b82f6] shadow-[0_0_20px_rgba(0,74,215,0.25)] ring-1 ring-[#3b82f6]'
                                    : 'bg-black/40 border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
                                }`}
                              >
                                <div className="flex items-center justify-between w-full mb-1.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className={`text-xs font-bold ${isSelected ? 'text-[#60a5fa]' : 'text-white'}`}>
                                      {isAr ? item.titleAr : item.titleEn}
                                    </span>
                                  </div>
                                  {isSelected ? (
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#004ad7] text-white text-[10px]">
                                      ✓
                                    </span>
                                  ) : isPrintOrApparel ? (
                                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                      {isAr ? 'طباعة' : 'PRINT'}
                                    </span>
                                  ) : null}
                                </div>
                                <p className="text-[11px] text-white/55 leading-relaxed">
                                  {isAr ? item.subtitleAr : item.subtitleEn}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dedicated Currency Cloud Setting Card */}
                  <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-bold text-white">
                          {isAr ? 'تنسيق عرض العملة للكتالوج (مزامنة سحابية مباشرة)' : 'Catalog Currency Format (Live Cloud Sync)'}
                        </span>
                      </div>
                      <p className="text-[11px] text-white/60 mt-0.5">
                        {isAr
                          ? 'أي تغيير هنا يُحفظ فوراً في السحابة ويظهر لجميع الزبائن على كافة الأجهزة فوراً'
                          : 'Changes immediately persist to Supabase and sync live across all visitors.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 self-start sm:self-auto bg-black/40 p-1 rounded-xl border border-white/10">
                      {(['د.ع', 'IQD', 'USD'] as const).map((curr) => (
                        <button
                          key={curr}
                          type="button"
                          onClick={() => setCurrencyCode(curr)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                            currencyCode === curr
                              ? 'bg-[#004ad7] text-white shadow-sm'
                              : 'text-white/60 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {curr}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.values(controls)
                      .filter((c) => !c.id.startsWith('banner_'))
                      .map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                        >
                          <div className="min-w-0 flex-1 pr-2 rtl:pr-0 rtl:pl-2">
                            <span className="text-xs font-bold text-white block truncate">
                              {isAr ? item.name_ar : item.name_en}
                            </span>
                            <span className="text-[11px] text-white/50 block line-clamp-1">
                              {isAr ? item.description_ar : item.description_en}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => toggleVisibility(item.id)}
                            className={`flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold border transition-all cursor-pointer ${
                              item.visible
                                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                : 'bg-red-500/20 border-red-500/40 text-red-300'
                            }`}
                          >
                            {item.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                            <span>{item.visible ? (isAr ? 'ظاهر' : 'Visible') : (isAr ? 'مخفي' : 'Hidden')}</span>
                          </button>
                        </div>
                      </div>
                      ))}
                  </div>
                </div>
              )}

              {/* TAB 5: BACKUP & MULTI-FORMAT EXPORT ENGINE */}
              {activeTab === 'backup' && (
                <div className="space-y-6 max-w-4xl mx-auto">
                  <div className="pb-2 border-b border-white/10">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Download className="h-5 w-5 text-cyan-400" />
                      <span>{isAr ? 'مركز تصدير البيانات والنسخ الاحتياطي متعدد الصيغ' : 'Multi-Format Export & Backup Hub'}</span>
                    </h2>
                    <p className="text-xs text-white/60 mt-0.5">
                      {isAr
                        ? 'تصدير وسحب بيانات المتجر والكتالوج وسلوكيات الزوار بكافة الصيغ العالمية بنقرة واحدة'
                        : 'Export catalog, customer behavior, and sales metrics in Excel, CSV, JSON, PDF & Markdown'}
                    </p>
                  </div>

                  {/* Multi-Format Export Station */}
                  <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Layers className="h-4 w-4 text-[#3b82f6]" />
                        <span>{isAr ? 'سحب وتصدير التحليلات وسجلات الزبائن (Multi-Format Downloads)' : 'Multi-Format Telemetry & Customer Exports'}</span>
                      </h3>
                      <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                        {isAr ? 'جاهز للتنزيل الفوري' : 'Instant Generation'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                      {/* Excel */}
                      <button
                        type="button"
                        onClick={() => downloadAnalyticsExcel(products)}
                        className="flex flex-col justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.05] hover:bg-emerald-500/[0.12] p-4 text-start transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
                            <FileSpreadsheet className="h-5 w-5" />
                          </div>
                          <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300 font-mono">.XLS / EXCEL</span>
                        </div>
                        <span className="font-bold text-xs text-white block">{isAr ? 'جدول إكسل متكامل' : 'Excel Workbook'}</span>
                        <span className="text-[10px] text-white/50 mt-1 block">{isAr ? 'أوراق عمل منسقة للـ KPIs والقطع والزبائن' : 'Multi-sheet workbook with styled KPIs'}</span>
                      </button>

                      {/* CSV */}
                      <button
                        type="button"
                        onClick={() => downloadAnalyticsCSV(products)}
                        className="flex flex-col justify-between rounded-2xl border border-blue-500/30 bg-blue-500/[0.05] hover:bg-blue-500/[0.12] p-4 text-start transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 group-hover:scale-105 transition-transform">
                            <Download className="h-5 w-5" />
                          </div>
                          <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[9px] font-bold text-blue-300 font-mono">.CSV / UTF-8</span>
                        </div>
                        <span className="font-bold text-xs text-white block">{isAr ? 'ملف بيانات CSV' : 'CSV Dataset'}</span>
                        <span className="text-[10px] text-white/50 mt-1 block">{isAr ? 'ترميز عربي متوافق 100% مع Excel' : 'UTF-8 with BOM encoding for Arabic'}</span>
                      </button>

                      {/* JSON */}
                      <button
                        type="button"
                        onClick={() => downloadAnalyticsJSON(products)}
                        className="flex flex-col justify-between rounded-2xl border border-purple-500/30 bg-purple-500/[0.05] hover:bg-purple-500/[0.12] p-4 text-start transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 group-hover:scale-105 transition-transform">
                            <FileCode className="h-5 w-5" />
                          </div>
                          <span className="rounded bg-purple-500/20 px-1.5 py-0.5 text-[9px] font-bold text-purple-300 font-mono">.JSON</span>
                        </div>
                        <span className="font-bold text-xs text-white block">{isAr ? 'ملف بيانات هيكلية JSON' : 'Structured JSON'}</span>
                        <span className="text-[10px] text-white/50 mt-1 block">{isAr ? 'بيانات كاملة للربط البرمجي السحابي' : 'Complete dataset for APIs & database'}</span>
                      </button>

                      {/* HTML / PDF */}
                      <button
                        type="button"
                        onClick={() => downloadAnalyticsHTMLReport(products)}
                        className="flex flex-col justify-between rounded-2xl border border-amber-500/30 bg-amber-500/[0.05] hover:bg-amber-500/[0.12] p-4 text-start transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 group-hover:scale-105 transition-transform">
                            <Printer className="h-5 w-5" />
                          </div>
                          <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-300 font-mono">.PDF / PRINT</span>
                        </div>
                        <span className="font-bold text-xs text-white block">{isAr ? 'تقرير تنفيذي PDF / طباعة' : 'Printable PDF Report'}</span>
                        <span className="text-[10px] text-white/50 mt-1 block">{isAr ? 'مستند فاخر للطباعة المباشرة والأرشفة' : 'Executive report formatted for print/PDF'}</span>
                      </button>

                      {/* Markdown */}
                      <button
                        type="button"
                        onClick={() => downloadAnalyticsMarkdown(products)}
                        className="flex flex-col justify-between rounded-2xl border border-cyan-500/30 bg-cyan-500/[0.05] hover:bg-cyan-500/[0.12] p-4 text-start transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 group-hover:scale-105 transition-transform">
                            <FileText className="h-5 w-5" />
                          </div>
                          <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[9px] font-bold text-cyan-300 font-mono">.MD</span>
                        </div>
                        <span className="font-bold text-xs text-white block">{isAr ? 'ملخص ماركداون' : 'Markdown Report'}</span>
                        <span className="text-[10px] text-white/50 mt-1 block">{isAr ? 'ملف نصي منسق للإرسال والمشاركة' : 'Text summary formatted for quick sharing'}</span>
                      </button>
                    </div>
                  </div>

                  {/* System Backup & JSON Restore */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
                      <h3 className="text-sm font-bold text-white">
                        {isAr ? 'تصدير نسخة احتياطية كاملة' : 'Export Full Backup'}
                      </h3>
                      <p className="text-xs text-white/60 leading-relaxed">
                        {isAr
                          ? 'يشمل كافة القطع والعروض والأسعار والصور والبنرات ونصوص الموقع في ملف واحد.'
                          : 'Downloads all catalog pieces, custom offers, banners and site controls.'}
                      </p>

                      <div className="flex gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => {
                            const json = exportAllDataJSON();
                            const blob = new Blob([json], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `vant_full_backup_${Date.now()}.json`;
                            a.click();
                            URL.revokeObjectURL(url);
                          }}
                          className="flex items-center gap-2 rounded-xl bg-[#004ad7] px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-[#004ad7]/90 transition-all cursor-pointer"
                        >
                          <Download className="h-4 w-4" />
                          <span>{isAr ? 'تحميل JSON' : 'Download JSON'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(exportAllDataJSON());
                            setCopiedJSON(true);
                            setTimeout(() => setCopiedJSON(false), 2000);
                          }}
                          className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white hover:bg-white/10 transition-all cursor-pointer"
                        >
                          {copiedJSON ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                          <span>{copiedJSON ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ' : 'Copy')}</span>
                        </button>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
                      <h3 className="text-sm font-bold text-white">
                        {isAr ? 'استيراد واستعادة من ملف JSON' : 'Import & Restore from JSON'}
                      </h3>
                      <textarea
                        rows={3}
                        value={importText}
                        onChange={(e) => setImportText(e.target.value)}
                        placeholder='{"controls": {...}, "products": [...]}'
                        className="w-full rounded-2xl border border-white/15 bg-black/40 p-3 text-xs font-mono text-white outline-none focus:border-[#3b82f6]"
                      />
                      {importError && (
                        <p className="text-xs text-red-400">{importError}</p>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          const success = importAllDataJSON(importText);
                          if (success) {
                            alert(isAr ? 'تمت استعادة البيانات بنجاح!' : 'Restored successfully!');
                            setImportText('');
                            setImportError(null);
                          } else {
                            setImportError(isAr ? 'صيغة JSON غير صالحة' : 'Invalid JSON format');
                          }
                        }}
                        className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2 text-xs font-bold text-white shadow-md transition-all cursor-pointer"
                      >
                        <Upload className="h-4 w-4" />
                        <span>{isAr ? 'استعادة وتطبيق الآن' : 'Import & Restore'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: NEWSLETTER SUBSCRIBERS & VIP CAMPAIGNS */}
              {activeTab === 'newsletter' && (
                <div className="space-y-6 max-w-5xl mx-auto">
                  <AdminNewsletterManager lang={isAr ? 'ar' : 'en'} embedded={true} initialTab="subscribers" />
                </div>
              )}

              {/* TAB: WELCOME MODAL & VIP VOUCHER SETTINGS */}
              {activeTab === 'welcome_modal' && (
                <div className="space-y-6 max-w-5xl mx-auto">
                  <AdminNewsletterManager lang={isAr ? 'ar' : 'en'} embedded={true} initialTab="welcome_settings" />
                </div>
              )}

              {/* TAB 6: SECURITY & PASSWORD */}
              {activeTab === 'security' && (
                <div className="space-y-6 max-w-md mx-auto">
                  <div className="pb-2 border-b border-white/10">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <KeyRound className="h-5 w-5 text-rose-400" />
                      <span>{isAr ? 'الأمان وتغيير كلمة المرور' : 'Security & Access Key'}</span>
                    </h2>
                    <p className="text-xs text-white/60 mt-0.5">
                      {isAr ? 'تغيير كلمة المرور الخاصة بالدخول لمركز العمليات' : 'Change master operations security key'}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-white/70 block mb-1">
                        {isAr ? 'كلمة المرور الجديدة' : 'New Master Password'}
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="h-11 w-full rounded-2xl border border-white/15 bg-black/40 px-4 text-sm text-white font-mono outline-none focus:border-[#3b82f6]"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleSavePassword}
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#004ad7] font-semibold text-xs text-white shadow-md hover:bg-[#004ad7]/90 transition-all cursor-pointer"
                    >
                      {passwordSuccess ? <Check className="h-4 w-4 text-emerald-400" /> : <KeyRound className="h-4 w-4" />}
                      <span>{passwordSuccess ? (isAr ? 'تم الحفظ وتحديث كلمة المرور!' : 'Saved successfully!') : (isAr ? 'حفظ كلمة المرور' : 'Save Password')}</span>
                    </button>
                  </div>
                </div>
              )}
            </main>
          </div>
        )}

        {/* ADD / EDIT PRODUCT MODAL */}
        {(isAddingNew || editingProduct) && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-hidden">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative flex flex-col w-full max-w-2xl h-[90vh] max-h-[90vh] rounded-3xl border border-white/15 bg-[#12151e] shadow-2xl overflow-hidden"
              dir={isAr ? 'rtl' : 'ltr'}
            >
              {/* Modal Header */}
              <div className="shrink-0 flex items-center justify-between border-b border-white/10 px-5 py-4 bg-[#151926]">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Package className="h-4 w-4 text-emerald-400" />
                  <span>
                    {isAddingNew
                      ? isAr ? 'إضافة قطعة جديدة للكتالوج' : 'Add New Piece to Catalog'
                      : isAr ? 'تعديل تفاصيل القطعة' : 'Edit Piece Details'}
                  </span>
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingProduct(null);
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Modal Form Scrollable */}
              <form
                onSubmit={handleSaveProductForm}
                className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4 touch-pan-y"
              >
                {/* Titles AR & EN */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-xs font-semibold text-white/70 block mb-1">
                      {isAr ? 'اسم القطعة (العربية)' : 'Title (Arabic)'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formTitleAr}
                      onChange={(e) => setFormTitleAr(e.target.value)}
                      placeholder="مثال: سترة صوف كشمير عاجية"
                      className="h-10 w-full rounded-xl border border-white/15 bg-black/40 px-3 text-xs text-white outline-none focus:border-[#3b82f6]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-white/70 block mb-1">
                      {isAr ? 'اسم القطعة (الإنجليزية)' : 'Title (English)'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formTitleEn}
                      onChange={(e) => setFormTitleEn(e.target.value)}
                      placeholder="e.g. Sculptural Double-Breasted Blazer"
                      className="h-10 w-full rounded-xl border border-white/15 bg-black/40 px-3 text-xs text-white outline-none focus:border-[#3b82f6]"
                    />
                  </div>
                </div>

                {/* Pricing & Offers Section */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Coins className="h-4 w-4 text-amber-400" />
                      <span>{isAr ? 'التسعير والعروض الخاصة' : 'Pricing & Offers'}</span>
                    </span>

                    {/* Offer Switch */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-xs text-white/70">{isAr ? 'تفعيل كعرض خاص (Discount Offer)' : 'Special Offer'}</span>
                      <input
                        type="checkbox"
                        checked={formIsOffer}
                        onChange={(e) => setFormIsOffer(e.target.checked)}
                        className="h-4 w-4 rounded accent-rose-500 cursor-pointer"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-white/70 block mb-1">
                        {formIsOffer ? (isAr ? 'سعر البيع بعد العرض (النهائي)' : 'Offer Price (Final)') : (isAr ? 'السعر' : 'Price')} *
                      </label>
                      <input
                        type="number"
                        required
                        value={formPrice}
                        onChange={(e) => setFormPrice(Number(e.target.value))}
                        className={`h-10 w-full rounded-xl border px-3 text-xs font-bold outline-none ${
                          formIsOffer
                            ? 'border-rose-500/50 bg-rose-500/10 text-rose-300'
                            : 'border-white/15 bg-black/40 text-white'
                        }`}
                      />
                    </div>

                    {formIsOffer && (
                      <div>
                        <label className="text-xs text-white/70 block mb-1">
                          {isAr ? 'السعر الأصلي قبل الخصم (للمقارنة والشطب)' : 'Original Price (Strikethrough)'}
                        </label>
                        <input
                          type="number"
                          value={formOriginalPrice}
                          onChange={(e) => setFormOriginalPrice(Number(e.target.value))}
                          className="h-10 w-full rounded-xl border border-white/15 bg-black/40 px-3 text-xs text-white/70 outline-none"
                        />
                        {formOriginalPrice > formPrice && (
                          <span className="text-[10px] text-emerald-400 mt-1 block font-semibold">
                            {isAr
                              ? `نسبة الخصم: ${Math.round(((formOriginalPrice - formPrice) / formOriginalPrice) * 100)}% توفير`
                              : `Savings: ${Math.round(((formOriginalPrice - formPrice) / formOriginalPrice) * 100)}% off`}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {formIsOffer && (
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="text-[11px] text-white/70 block mb-1">
                          {isAr ? 'نص شارة العرض (العربية)' : 'Offer Badge (AR)'}
                        </label>
                        <input
                          type="text"
                          value={formOfferBadgeAr}
                          onChange={(e) => setFormOfferBadgeAr(e.target.value)}
                          placeholder="عرض خاص / خصم 20%"
                          className="h-9 w-full rounded-lg border border-rose-500/30 bg-black/40 px-2.5 text-xs text-rose-200 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-white/70 block mb-1">
                          {isAr ? 'نص شارة العرض (الإنجليزية)' : 'Offer Badge (EN)'}
                        </label>
                        <input
                          type="text"
                          value={formOfferBadgeEn}
                          onChange={(e) => setFormOfferBadgeEn(e.target.value)}
                          placeholder="Special Offer / 20% OFF"
                          className="h-9 w-full rounded-lg border border-rose-500/30 bg-black/40 px-2.5 text-xs text-rose-200 outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Category & Availability */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-xs font-semibold text-white/70 block mb-1">
                      {isAr ? 'القسم (Category)' : 'Category'} *
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => {
                        setFormCategory(e.target.value);
                        if (e.target.value === 'Tailoring') setFormCategoryAr('الأزياء الرسمية');
                        else if (e.target.value === 'Outerwear') setFormCategoryAr('المعاطف والسترات');
                        else if (e.target.value === 'Knitwear') setFormCategoryAr('التريكو والصوف');
                        else if (e.target.value === 'Leather Goods') setFormCategoryAr('الجلود الراقية');
                        else if (e.target.value === 'Footwear') setFormCategoryAr('الأحذية');
                        else if (e.target.value === 'Bespoke') setFormCategoryAr('التفصيل الخاص');
                      }}
                      className="h-10 w-full rounded-xl border border-white/15 bg-black/40 px-3 text-xs text-white outline-none cursor-pointer"
                    >
                      <option value="Tailoring">Tailoring (الأزياء الرسمية)</option>
                      <option value="Outerwear">Outerwear (المعاطف والسترات)</option>
                      <option value="Knitwear">Knitwear (التريكو والصوف)</option>
                      <option value="Leather Goods">Leather Goods (الجلود الراقية)</option>
                      <option value="Footwear">Footwear (الأحذية)</option>
                      <option value="Bespoke">Bespoke (التفصيل الخاص)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-white/70 block mb-1">
                      {isAr ? 'حالة التوفر' : 'Availability'} *
                    </label>
                    <select
                      value={formAvailability}
                      onChange={(e) => setFormAvailability(e.target.value as ProductAvailability)}
                      className="h-10 w-full rounded-xl border border-white/15 bg-black/40 px-3 text-xs text-white outline-none cursor-pointer"
                    >
                      <option value="in_stock">{isAr ? 'متوفر وجاهز للشحن الفوري' : 'In Stock'}</option>
                      <option value="sold_out">{isAr ? 'منتهي من المخزون' : 'Sold Out'}</option>
                      <option value="coming_soon">{isAr ? 'إصدار قادم قريباً' : 'Coming Soon'}</option>
                      <option value="limited">{isAr ? 'كمية محدودة جداً' : 'Limited Archive'}</option>
                    </select>
                  </div>
                </div>

                {/* File, Folder, and URL Image Management with ImageUploader */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                  <ImageUploader
                    images={formImagesList}
                    primaryImage={formImageUrl || formImagesList[0]}
                    onPrimaryChange={(pri) => {
                      setFormImageUrl(pri);
                      const reordered = [pri, ...formImagesList.filter((x) => x !== pri)];
                      setFormImagesList(reordered);
                      setFormExtraImages(reordered.slice(1).join('\n'));
                    }}
                    onChange={(newImgs) => {
                      setFormImagesList(newImgs);
                      setFormImageUrl(newImgs[0] || '');
                      setFormExtraImages(newImgs.slice(1).join('\n'));
                    }}
                    isAr={isAr}
                    recommendedSpec="1200 × 1500 px (4:5)"
                    allowMultiple={true}
                  />
                </div>

                {/* Available Sizes Selection */}
                <div>
                  <label className="text-xs font-semibold text-white/70 block mb-1.5">
                    {isAr ? 'المقاسات المتوفرة للقطعة' : 'Available Sizes'}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ALL_SIZES.map((size) => {
                      const isSelected = formSizes.includes(size);
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setFormSizes(formSizes.filter((s) => s !== size));
                            } else {
                              setFormSizes([...formSizes, size]);
                            }
                          }}
                          className={`h-8 w-11 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#004ad7] border-[#004ad7] text-white shadow-xs'
                              : 'border-white/15 bg-black/30 text-white/60 hover:text-white'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Material & Description */}
                <div>
                  <label className="text-xs font-semibold text-white/70 block mb-1">
                    {isAr ? 'الخامة والقماش' : 'Material & Fabric'}
                  </label>
                  <input
                    type="text"
                    value={formMaterial}
                    onChange={(e) => setFormMaterial(e.target.value)}
                    placeholder="مثال: 100% صوف إيطالي عيار 150"
                    className="h-10 w-full rounded-xl border border-white/15 bg-black/40 px-3 text-xs text-white outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-xs font-semibold text-white/70 block mb-1">
                      {isAr ? 'الوصف (العربية)' : 'Description (Arabic)'}
                    </label>
                    <textarea
                      rows={2}
                      value={formDescAr}
                      onChange={(e) => setFormDescAr(e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-black/40 p-2.5 text-xs text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-white/70 block mb-1">
                      {isAr ? 'الوصف (الإنجليزية)' : 'Description (English)'}
                    </label>
                    <textarea
                      rows={2}
                      value={formDescEn}
                      onChange={(e) => setFormDescEn(e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-black/40 p-2.5 text-xs text-white outline-none"
                    />
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingNew(false);
                      setEditingProduct(null);
                    }}
                    className="rounded-xl border border-white/15 px-4 py-2 text-xs font-semibold text-white/70 hover:bg-white/10"
                  >
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>

                  <button
                    type="submit"
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 active:scale-95 transition-all cursor-pointer"
                  >
                    {isAddingNew
                      ? isAr ? 'إضافة القطعة للكتالوج' : 'Add Piece'
                      : isAr ? 'حفظ التعديلات' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
