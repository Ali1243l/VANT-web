import React, { useState, useEffect, useRef } from 'react';
import {
  Sliders,
  ShieldAlert,
  Sparkles,
  Image as ImageIcon,
  MessageCircle,
  KeyRound,
  Store,
  Bell,
  Check,
  AlertTriangle,
  Play,
  X,
  Upload,
  Link as LinkIcon,
  Eye,
  EyeOff,
  Cloud,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Scissors,
  Crown,
  Shirt,
  Compass,
  Clock,
  Layers,
  HelpCircle,
  Copy,
} from 'lucide-react';
import { motion, AnimatePresence } from './motion';
import { useAdminBridge, SiteSettings } from './useAdminBridge';
import { Button, Input, Card, Switch } from './ui';

// Splash motifs definition
type MotifKey = 'hanger' | 'scissors' | 'monogram' | 'needle' | 'crown';

interface MotifOption {
  key: MotifKey;
  labelAr: string;
  labelEn: string;
  descAr: string;
  descEn: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SPLASH_MOTIFS: MotifOption[] = [
  {
    key: 'hanger',
    labelAr: 'شماعة الأزياء الراقية',
    labelEn: 'Luxury Haute Coat Hanger',
    descAr: 'رمز الأناقة والتصميم الرفيع للأزياء المخصصة',
    descEn: 'Symbol of couture silhouettes and bespoke tailoring',
    icon: Shirt,
  },
  {
    key: 'scissors',
    labelAr: 'مقص الخياطة الذهبي',
    labelEn: 'Master Tailor Shears',
    descAr: 'رمز الدقة والحرفية اليدوية الإيطالية العريقة',
    descEn: 'Represents hand-cut precision and artisanal tailoring',
    icon: Scissors,
  },
  {
    key: 'monogram',
    labelAr: 'المونوغرام الملكي (AR)',
    labelEn: 'Royal Monogram Emblem',
    descAr: 'شعار دار الرافدين المحفور بماء الذهب',
    descEn: 'Classic royal heraldic seal engraved in gold',
    icon: Compass,
  },
  {
    key: 'needle',
    labelAr: 'إبرة وخيط الحرير',
    labelEn: 'Silk Needle & Thread',
    descAr: 'رمز التطريز الدقيق والأقمشة الكشميرية الفاخرة',
    descEn: 'Intricate embroidery and pure mulberry silk stitching',
    icon: Layers,
  },
  {
    key: 'crown',
    labelAr: 'التاج الإمبراطوري',
    labelEn: 'Imperial Sovereign Crown',
    descAr: 'رمز الفخامة والسيادة والأزياء الملكية الحصرية',
    descEn: 'Exclusivity, heritage, and royal bespoke prestige',
    icon: Crown,
  },
];

// Presets for splash screen text
const SPLASH_TEXT_PRESETS = [
  {
    ar: 'دار الرافدين للأزياء • أصالة الحرفة العراقية',
    en: 'Dar Al-Rafidain • Iraqi Haute Couture & Craftsmanship',
  },
  {
    ar: 'أناقة ملكية مستوحاة من عراقة بلاد الرافدين',
    en: 'Royal Elegance Inspired by Mesopotamian Heritage',
  },
  {
    ar: 'جاري تحميل أحدث تشكيلات 2026 الحصرية وتفاصيل الكشمير',
    en: 'Loading 2026 Exclusive Bespoke & Cashmere Collection',
  },
  {
    ar: 'التفصيل الرفيع • أقمشة إيطالية وأيدي ماهرة تصنع الفارق',
    en: 'Haute Couture • Italian Fabrics & Master Tailors Crafting Excellence',
  },
];

// Preset luxury banner backgrounds
const BANNER_PRESETS = [
  {
    name: 'Atelier Cashmere',
    nameAr: 'استوديو الكشمير الإيطالي',
    url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Bespoke Fitting Suite',
    nameAr: 'جناح التفصيل والقياس الخاص',
    url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Luxury Fabrics Loom',
    nameAr: 'نسيج الحرير والصوف الملكي',
    url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Royal Boutique Facade',
    nameAr: 'واجهة البوتيك الفاخر',
    url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Artisan Tailoring Workshop',
    nameAr: 'مشغل الحياكة اليدوية الدقيقة',
    url: 'https://images.unsplash.com/photo-1520006403909-838d6b92c22e?w=1600&auto=format&fit=crop&q=80',
  },
];

export const SettingsView: React.FC = () => {
  const { lang, siteSettings, updateSiteSettings, pin, setPin, setCurrentStore } = useAdminBridge();
  const isAr = lang === 'ar';

  // Local form state cloned from siteSettings
  const [formData, setFormData] = useState<SiteSettings>(siteSettings);
  const [tempPin, setTempPin] = useState<string>(pin || siteSettings.pin || '1234');
  const [showPin, setShowPin] = useState(false);

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; sub?: string } | null>(null);
  const [isTestSplashOpen, setIsTestSplashOpen] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [bannerUploadNotice, setBannerUploadNotice] = useState<string | null>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  // Sync when siteSettings change externally
  useEffect(() => {
    setFormData(siteSettings);
    if (siteSettings.pin) setTempPin(siteSettings.pin);
  }, [siteSettings]);

  // Handle setting updates
  const handleChange = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Immediate toggle for critical flags (like Maintenance Mode) with auto-sync
  const handleImmediateToggle = async (key: keyof SiteSettings, value: any) => {
    handleChange(key, value);
    const result = await updateSiteSettings({ [key]: value });
    showToast(
      isAr ? 'تم تحديث الإعدادات فورياً' : 'Setting updated instantly',
      result.syncedWithCloud
        ? (isAr ? 'متزامن مع سحابة Supabase' : 'Synced with Supabase Cloud')
        : (isAr ? 'تم الحفظ محلياً' : 'Saved locally')
    );
  };

  const showToast = (text: string, sub?: string) => {
    setToastMessage({ text, sub });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Save all settings
  const handleSaveAll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);

    try {
      // Validate pin
      const finalPin = tempPin.length === 4 ? tempPin : pin;
      setPin(finalPin);
      setCurrentStore(formData.storeName);

      const payload = {
        ...formData,
        pin: finalPin,
      };

      const res = await updateSiteSettings(payload);

      showToast(
        isAr ? 'تم حفظ كافة إعدادات المتجر بنجاح' : 'All store settings saved successfully',
        res.syncedWithCloud
          ? (isAr ? 'تمت المزامنة الحية مع Supabase' : 'Synced live with Supabase cloud')
          : (isAr ? 'تم الحفظ في التخزين المحلي الآمن' : 'Saved to local storage')
      );
    } catch (err) {
      console.error(err);
      showToast(isAr ? 'حدث خطأ أثناء الحفظ' : 'Error saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle banner image upload with Supabase Storage support
  const handleBannerUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      setBannerUploadNotice(isAr ? 'يرجى اختيار ملف صورة صالح' : 'Please select a valid image file');
      return;
    }

    setIsUploadingBanner(true);
    setBannerUploadNotice(null);

    const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
    const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        const fileName = `banner-${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
        const uploadRes = await fetch(
          `${supabaseUrl}/storage/v1/object/product-images/${fileName}`,
          {
            method: 'POST',
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
              'Content-Type': file.type,
            },
            body: file,
          }
        );

        if (uploadRes.ok) {
          const publicUrl = `${supabaseUrl}/storage/v1/object/public/product-images/${fileName}`;
          handleChange('heroBannerBg', publicUrl);
          setBannerUploadNotice(
            isAr ? 'تم رفع البنر بنجاح إلى Supabase Storage' : 'Banner uploaded to Supabase Storage'
          );
          setIsUploadingBanner(false);
          return;
        }
      } catch (err) {
        console.warn('Supabase banner upload error, falling back to local preview:', err);
      }
    }

    // Local data URL preview fallback
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        handleChange('heroBannerBg', dataUrl);
        setBannerUploadNotice(
          isAr
            ? 'تم تحميل البنر للمعاينة المحلية الفورية'
            : 'Banner loaded for instant local preview'
        );
      }
      setIsUploadingBanner(false);
    };
    reader.onerror = () => {
      setBannerUploadNotice(isAr ? 'فشل تحميل الصورة' : 'Failed to read image');
      setIsUploadingBanner(false);
    };
    reader.readAsDataURL(file);
  };

  // Keyboard shortcut (Escape) to close splash preview
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isTestSplashOpen) {
        setIsTestSplashOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTestSplashOpen]);

  return (
    <div className="space-y-8 max-w-5xl pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500/20 to-indigo-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sliders className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {isAr ? 'الإعدادات والتحكم الشامل بالمتجر' : 'Master Site Controls & Settings'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            {isAr
              ? 'التحكم المباشر في جاهزية واجهة المتجر للعملاء، شاشة التحميل السينمائية، البنرات الترويجية، وأرقام خدمة الواتساب.'
              : 'Govern storefront accessibility, cinematic splash branding, promotional hero banners, and VIP WhatsApp concierges.'}
          </p>
        </div>

        {/* Global Save Button */}
        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={handleSaveAll}
            isLoading={isSaving}
            variant="primary"
            className="px-5 shadow-lg shadow-indigo-950/50"
            leftIcon={<Check className="w-4 h-4" />}
          >
            {isAr ? 'حفظ كافة الإعدادات' : 'Save All Settings'}
          </Button>
        </div>
      </div>

      {/* Floating Animated Feedback Toast (Framer Motion) */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-5 end-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/95 border border-emerald-500/40 text-emerald-300 shadow-2xl backdrop-blur-md"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-white">{toastMessage.text}</p>
              {toastMessage.sub && (
                <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                  <Cloud className="w-3 h-3 text-indigo-400" />
                  {toastMessage.sub}
                </p>
              )}
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white ms-2 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSaveAll} className="space-y-8">
        {/* ====================================================================
            SECTION 1: GLOBAL MAINTENANCE MODE
            ==================================================================== */}
        <Card
          className={`space-y-6 transition-all duration-300 ${
            formData.maintenanceMode
              ? 'border-amber-500/40 bg-gradient-to-b from-amber-950/20 to-slate-900/90 shadow-lg shadow-amber-950/20'
              : 'border-slate-800'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800/80">
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  formData.maintenanceMode
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}
              >
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">
                    {isAr ? 'وضع الصيانة العام وقفل المتجر' : 'Global Maintenance Mode'}
                  </h3>
                  {formData.maintenanceMode ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      {isAr ? 'المتجر مقفل حالياً' : 'Store Locked'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {isAr ? 'المتجر متاح ومباشر للعملاء' : 'Storefront Live'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isAr
                    ? 'عند تفعيل هذا الخيار، يتم حجب الكتالوج والشراء عن الزوار وعرض شاشة توقف راقية مخصصة مع إبقاء لوحة الإدارة مفتوحة.'
                    : 'Locks the customer storefront with an exquisite downtime splash while keeping admin access intact.'}
                </p>
              </div>
            </div>

            {/* Premium Toggle Switch */}
            <div className="shrink-0 flex items-center gap-3">
              <Switch
                checked={formData.maintenanceMode}
                onChange={(checked) => handleImmediateToggle('maintenanceMode', checked)}
                label={
                  formData.maintenanceMode
                    ? isAr
                      ? 'مفعّل (قيد الصيانة)'
                      : 'Enabled (Locked)'
                    : isAr
                    ? 'معطل (مفتوح)'
                    : 'Disabled (Live)'
                }
              />
            </div>
          </div>

          {/* Maintenance Customization Details */}
          {formData.maintenanceMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 pt-2 border-t border-slate-800/60"
            >
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 flex items-start gap-2.5">
                <AlertTriangle className="w-4.5 h-4.5 text-amber-400 shrink-0 mt-0.5" />
                <p>
                  {isAr
                    ? 'تنبيه: المتجر حالياً لا يستقبل أي طلبات شراء جديدة من العملاء العاديين. يمكنك تعديل رسالة الاعتذار والوقت المقدر للعودة أدناه.'
                    : 'Notice: Normal visitors currently see the maintenance screen and cannot place orders. Configure the public apology message below.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-start">
                    {isAr ? 'رسالة الصيانة للعملاء (بالعربية)' : 'Maintenance Notice (Arabic)'}
                  </label>
                  <textarea
                    rows={3}
                    value={formData.maintenanceMessageAr}
                    onChange={(e) => handleChange('maintenanceMessageAr', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-100 text-sm rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="نعتذر عن استقبال الطلبات مؤقتاً..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-start">
                    {isAr ? 'رسالة الصيانة للعملاء (بالإنجليزية)' : 'Maintenance Notice (English)'}
                  </label>
                  <textarea
                    rows={3}
                    value={formData.maintenanceMessageEn}
                    onChange={(e) => handleChange('maintenanceMessageEn', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-100 text-sm rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="We are currently upgrading our store..."
                  />
                </div>
              </div>

              <div className="max-w-md">
                <Input
                  label={isAr ? 'الموعد المقدر للعودة واستئناف البيع' : 'Estimated Return Time / Reopen ETA'}
                  value={formData.maintenanceEstimatedBack}
                  onChange={(e) => handleChange('maintenanceEstimatedBack', e.target.value)}
                  placeholder={isAr ? 'خلال ساعتين (2 Hours)' : 'Within 2 Hours'}
                  icon={Clock}
                />
              </div>
            </motion.div>
          )}
        </Card>

        {/* ====================================================================
            SECTION 2: SPLASH SCREEN CUSTOMIZER & TEST LAUNCHER
            ==================================================================== */}
        <Card className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {isAr ? 'مخصص شاشة الترحيب والتحميل السينمائية' : 'Cinematic Splash Screen Customizer'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isAr
                    ? 'تخصيص الرمز الملكي، نصوص التحميل الفاخرة، ومدة العرض عند فتح التطبيق لأول مرة.'
                    : 'Customize royal motif emblems, luxury loading typography, and duration on app entry.'}
                </p>
              </div>
            </div>

            {/* Test Splash Screen Button */}
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsTestSplashOpen(true)}
              className="text-amber-300 border-amber-500/30 hover:bg-amber-500/10 gap-2 shrink-0"
              leftIcon={<Play className="w-4 h-4 fill-amber-400 text-amber-400" />}
            >
              {isAr ? 'معاينة شاشة البداية الحية' : 'Test Splash Screen'}
            </Button>
          </div>

          {/* Motif Selector */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-300 text-start">
              {isAr ? '1. الرمز الملكي لشاشة التحميل (Splash Motif)' : '1. Splash Emblem Motif'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {SPLASH_MOTIFS.map((motif) => {
                const IconComp = motif.icon;
                const isSelected = formData.splashMotif === motif.key;
                return (
                  <button
                    key={motif.key}
                    type="button"
                    onClick={() => handleChange('splashMotif', motif.key)}
                    className={`p-3.5 rounded-xl border text-start transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-600/15 border-indigo-500 ring-2 ring-indigo-500/30 shadow-md shadow-indigo-950'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        <IconComp className="w-5 h-5" />
                      </div>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                      )}
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                        {isAr ? motif.labelAr : motif.labelEn}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {isAr ? motif.descAr : motif.descEn}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Text Customization & Presets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 text-start">
                  {isAr ? '2. نص التحميل بالعربية' : '2. Loading Text (Arabic)'}
                </label>
                <span className="text-[10px] text-slate-500">
                  {isAr ? 'اختر نموذجاً أدناه أو اكتب يدوياً' : 'Preset or manual'}
                </span>
              </div>
              <Input
                value={formData.splashTextAr}
                onChange={(e) => handleChange('splashTextAr', e.target.value)}
                placeholder="دار الرافدين للأزياء..."
              />
              {/* Presets chips */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {SPLASH_TEXT_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleChange('splashTextAr', p.ar)}
                    className="text-[10px] px-2 py-1 rounded bg-slate-800/70 hover:bg-slate-700 text-slate-300 border border-slate-700/50 truncate max-w-full text-start"
                    title={p.ar}
                  >
                    {p.ar}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 text-start">
                  {isAr ? 'نص التحميل بالإنجليزية' : 'Loading Text (English)'}
                </label>
                <span className="text-[10px] text-slate-500">English Headline</span>
              </div>
              <Input
                value={formData.splashTextEn}
                onChange={(e) => handleChange('splashTextEn', e.target.value)}
                placeholder="Dar Al-Rafidain Haute Couture..."
              />
              {/* Presets chips */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {SPLASH_TEXT_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleChange('splashTextEn', p.en)}
                    className="text-[10px] px-2 py-1 rounded bg-slate-800/70 hover:bg-slate-700 text-slate-300 border border-slate-700/50 truncate max-w-full text-start"
                    title={p.en}
                  >
                    {p.en}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Duration Selector */}
          <div className="pt-2 border-t border-slate-800/60 max-w-sm">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-start">
              {isAr ? 'مدة عرض شاشة التحميل (بالثواني)' : 'Splash Display Duration'}
            </label>
            <div className="flex items-center gap-2">
              {[1500, 2500, 3500, 4500].map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => handleChange('splashDurationMs', dur)}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all ${
                    formData.splashDurationMs === dur
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {(dur / 1000).toFixed(1)}s
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* ====================================================================
            SECTION 3: STORE FRONT BANNERS (HERO BANNER)
            ==================================================================== */}
        <Card className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {isAr ? 'بنرات واجهة المتجر الرئيسية (Hero Banners)' : 'Storefront Hero Banners'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isAr
                    ? 'إدارة خلفية الواجهة البصرية، العناوين التسويقية، الشارات الحصرية، وزر الشراء المباشر.'
                    : 'Manage main hero background, promotional badges, headlines, and call-to-actions.'}
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Live Mini-Banner Preview */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300 block text-start">
              {isAr ? 'المعاينة الحية لبنر الواجهة (Live Hero Preview):' : 'Live Hero Banner Preview:'}
            </span>
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 aspect-[21/9] sm:aspect-[24/8] bg-slate-950 flex flex-col justify-end p-4 sm:p-8 group shadow-2xl">
              {/* Background image */}
              <img
                src={formData.heroBannerBg}
                alt="Hero Banner"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Gradient scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
              <div className="absolute inset-0 bg-indigo-950/20 mix-blend-overlay" />

              {/* Overlay Content */}
              <div className="relative z-10 max-w-2xl text-start space-y-2">
                {(formData.heroBadgeAr || formData.heroBadgeEn) && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-md">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    {isAr ? formData.heroBadgeAr : formData.heroBadgeEn}
                  </span>
                )}
                <h2 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
                  {isAr ? formData.heroHeadlineAr : formData.heroHeadlineEn}
                </h2>
                <p className="text-xs sm:text-sm text-slate-200/90 line-clamp-2 max-w-xl drop-shadow">
                  {isAr ? formData.heroSubtitleAr : formData.heroSubtitleEn}
                </p>
                <div className="pt-1">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-950">
                    {isAr ? formData.heroCtaTextAr : formData.heroCtaTextEn}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Banner Preset Gallery */}
          <div className="space-y-2.5 pt-2">
            <label className="block text-xs font-semibold text-slate-300 text-start">
              {isAr ? '1. معرض الصور الحصرية الجاهزة (Preset Gallery)' : '1. Curated Luxury Presets'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {BANNER_PRESETS.map((preset, idx) => {
                const isSelected = formData.heroBannerBg === preset.url;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleChange('heroBannerBg', preset.url)}
                    className={`relative rounded-xl overflow-hidden border aspect-video group cursor-pointer text-start transition-all ${
                      isSelected
                        ? 'border-indigo-500 ring-2 ring-indigo-500/40 shadow-lg'
                        : 'border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-end p-2">
                      <p className="text-[10px] font-semibold text-white truncate">
                        {isAr ? preset.nameAr : preset.name}
                      </p>
                    </div>
                    {isSelected && (
                      <span className="absolute top-1.5 end-1.5 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Upload to Supabase Storage & URL Input */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800/60">
            {/* Supabase Upload Button */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-start">
                {isAr ? '2. رفع صورة بنر مخصصة (Supabase Storage)' : '2. Upload Custom Banner (Supabase Storage)'}
              </label>
              <input
                ref={bannerFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleBannerUpload(e.target.files)}
              />
              <button
                type="button"
                onClick={() => bannerFileInputRef.current?.click()}
                disabled={isUploadingBanner}
                className="w-full h-24 rounded-xl border border-dashed border-slate-700 hover:border-indigo-500/70 bg-slate-900/50 hover:bg-slate-800/40 transition-all flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:text-white cursor-pointer"
              >
                {isUploadingBanner ? (
                  <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
                ) : (
                  <Upload className="w-6 h-6 text-indigo-400" />
                )}
                <span className="text-xs font-semibold">
                  {isUploadingBanner
                    ? isAr
                      ? 'جاري الرفع إلى سحابة Supabase...'
                      : 'Uploading to Supabase...'
                    : isAr
                    ? 'اضغط لاختيار صورة بنر عالية الدقة'
                    : 'Click to select high-res banner'}
                </span>
                <span className="text-[10px] text-slate-500">
                  {isAr ? 'حاوية التخزين: product-images / store-banners' : 'Storage bucket: product-images'}
                </span>
              </button>

              {bannerUploadNotice && (
                <p className="text-[11px] text-emerald-400 font-medium mt-1.5 flex items-center gap-1 text-start">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  {bannerUploadNotice}
                </p>
              )}
            </div>

            {/* Direct URL Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-start">
                {isAr ? 'أو رابط صورة البنر المباشر (URL CDN)' : 'Or Direct Image URL (CDN)'}
              </label>
              <Input
                value={formData.heroBannerBg}
                onChange={(e) => handleChange('heroBannerBg', e.target.value)}
                placeholder="https://images.unsplash.com/..."
                icon={LinkIcon}
              />
              <p className="text-[11px] text-slate-500 mt-2 text-start leading-relaxed">
                {isAr
                  ? 'يمكنك وضع أي رابط صورة خارجي عالي الدقة (WebP, JPG, PNG).'
                  : 'Direct URL to any cloud image or CDN asset.'}
              </p>
            </div>
          </div>

          {/* Banner Headlines & Subtitles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800/60">
            <Input
              label={isAr ? 'العنوان الرئيسي للبنر (بالعربية)' : 'Banner Headline (Arabic)'}
              value={formData.heroHeadlineAr}
              onChange={(e) => handleChange('heroHeadlineAr', e.target.value)}
            />
            <Input
              label={isAr ? 'العنوان الرئيسي للبنر (بالإنجليزية)' : 'Banner Headline (English)'}
              value={formData.heroHeadlineEn}
              onChange={(e) => handleChange('heroHeadlineEn', e.target.value)}
            />
            <Input
              label={isAr ? 'العنوان الفرعي للبنر (بالعربية)' : 'Banner Subtitle (Arabic)'}
              value={formData.heroSubtitleAr}
              onChange={(e) => handleChange('heroSubtitleAr', e.target.value)}
            />
            <Input
              label={isAr ? 'العنوان الفرعي للبنر (بالإنجليزية)' : 'Banner Subtitle (English)'}
              value={formData.heroSubtitleEn}
              onChange={(e) => handleChange('heroSubtitleEn', e.target.value)}
            />
            <Input
              label={isAr ? 'الشارة العلوية (Badge AR)' : 'Top Badge (Arabic)'}
              value={formData.heroBadgeAr}
              onChange={(e) => handleChange('heroBadgeAr', e.target.value)}
              placeholder="الموسم الجديد 2026"
            />
            <Input
              label={isAr ? 'الشارة العلوية (Badge EN)' : 'Top Badge (English)'}
              value={formData.heroBadgeEn}
              onChange={(e) => handleChange('heroBadgeEn', e.target.value)}
              placeholder="New Season 2026"
            />
            <Input
              label={isAr ? 'نص زر الشراء (CTA Text AR)' : 'Call To Action (Arabic)'}
              value={formData.heroCtaTextAr}
              onChange={(e) => handleChange('heroCtaTextAr', e.target.value)}
            />
            <Input
              label={isAr ? 'نص زر الشراء (CTA Text EN)' : 'Call To Action (English)'}
              value={formData.heroCtaTextEn}
              onChange={(e) => handleChange('heroCtaTextEn', e.target.value)}
            />
          </div>
        </Card>

        {/* ====================================================================
            SECTION 4: WHATSAPP MULTI-NUMBER MANAGEMENT
            ==================================================================== */}
        <Card className="space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isAr ? 'إدارة أرقام واتساب المعتمدة (WhatsApp Multi-Number)' : 'WhatsApp Multi-Number Hub'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr
                  ? 'إدارة رقم استلام الطلبات الفورية ورقم كونسيرج الخياطة الراقية (Bespoke Concierge).'
                  : 'Manage active customer orders channel and dedicated VIP Bespoke concierge hotline.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Number 1: Direct Orders */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  {isAr ? 'رقم طلبات الشراء المباشرة' : 'Direct Orders Hotline'}
                </span>
                <a
                  href={`https://wa.me/${formData.whatsappOrdersNumber.replace(/\+/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                >
                  <ExternalLink className="w-3 h-3" />
                  {isAr ? 'اختبار المحادثة' : 'Test Chat'}
                </a>
              </div>

              <Input
                label={isAr ? 'مسمى القسم / القناة' : 'Department Name'}
                value={formData.whatsappOrdersName}
                onChange={(e) => handleChange('whatsappOrdersName', e.target.value)}
              />

              <Input
                label={isAr ? 'رقم الواتساب بالصيغة الدولية' : 'WhatsApp Number (Intl)'}
                value={formData.whatsappOrdersNumber}
                onChange={(e) => handleChange('whatsappOrdersNumber', e.target.value)}
                placeholder="+9647701234567"
              />
            </div>

            {/* Number 2: Bespoke Tailoring Concierge */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  {isAr ? 'كونسيرج التفصيل الخاص (Bespoke)' : 'Bespoke Tailoring Concierge'}
                </span>
                <a
                  href={`https://wa.me/${formData.whatsappConciergeNumber.replace(/\+/g, '')}?text=${encodeURIComponent(
                    formData.whatsappDefaultMsg
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                >
                  <ExternalLink className="w-3 h-3" />
                  {isAr ? 'اختبار الكونسيرج' : 'Test VIP'}
                </a>
              </div>

              <Input
                label={isAr ? 'مسمى الخدمة' : 'Concierge Service Label'}
                value={formData.whatsappConciergeName}
                onChange={(e) => handleChange('whatsappConciergeName', e.target.value)}
              />

              <Input
                label={isAr ? 'رقم الواتساب بالصيغة الدولية' : 'WhatsApp Number (Intl)'}
                value={formData.whatsappConciergeNumber}
                onChange={(e) => handleChange('whatsappConciergeNumber', e.target.value)}
                placeholder="+9647809876543"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-start">
              {isAr ? 'رسالة الاستفسار الافتراضية التلقائية' : 'Default Pre-filled Inquiry Message'}
            </label>
            <Input
              value={formData.whatsappDefaultMsg}
              onChange={(e) => handleChange('whatsappDefaultMsg', e.target.value)}
              placeholder="مرحباً، أود الاستفسار عن تفصيل قطعة خاصة..."
            />
          </div>
        </Card>

        {/* ====================================================================
            SECTION 5: STORE PROFILE & CURRENCY & PIN SECURITY
            ==================================================================== */}
        <Card className="space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isAr ? 'بيانات المتجر والعملة ورمز الأمان' : 'Store Identity & Security'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr
                  ? 'الاسم الرسمي للمؤسسة، العملة المعتمدة، ورمز PIN لقفل لوحة التحكم.'
                  : 'Official store naming, baseline currency, and admin security PIN.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Input
              label={isAr ? 'اسم المتجر (بالعربية)' : 'Store Name (Arabic)'}
              value={formData.storeName}
              onChange={(e) => handleChange('storeName', e.target.value)}
              required
            />

            <Input
              label={isAr ? 'اسم المتجر (بالإنجليزية)' : 'Store Name (English)'}
              value={formData.storeNameEn}
              onChange={(e) => handleChange('storeNameEn', e.target.value)}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-start">
                {isAr ? 'العملة الأساسية للمتجر' : 'Base Currency'}
              </label>
              <select
                value={formData.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-100 text-sm rounded-lg px-3 py-2 h-9.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="IQD">IQD - دينار عراقي (IQD)</option>
                <option value="USD">USD - دولار أمريكي ($)</option>
                <option value="AED">AED - درهم إماراتي</option>
                <option value="SAR">SAR - ريال سعودي</option>
                <option value="EUR">EUR - يورو (€)</option>
              </select>
            </div>
          </div>

          {/* Security PIN Code */}
          <div className="pt-4 border-t border-slate-800/60 grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div>
              <Input
                label={isAr ? 'رمز قفل الأمان للوحة الإدارة (PIN مكون من 4 أرقام)' : 'Security Lock PIN (4 digits)'}
                type={showPin ? 'text' : 'password'}
                maxLength={4}
                value={tempPin}
                onChange={(e) => setTempPin(e.target.value)}
                placeholder="1234"
                icon={KeyRound}
                action={
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="text-slate-400 hover:text-white"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
            </div>
            <p className="text-xs text-slate-400 pb-2 text-start">
              {isAr
                ? 'يستخدم هذا الرمز لإلغاء قفل لوحة التحكم فوراً عند الضغط على قفل اللوحة أو بعد فترات الخمول.'
                : 'Protects the administrative console from unauthorized access.'}
            </p>
          </div>

          {/* Notifications Toggles */}
          <div className="pt-4 border-t border-slate-800/60 space-y-3">
            <span className="text-xs font-semibold text-slate-300 block text-start">
              {isAr ? 'قنوات التنبيهات التلقائية:' : 'Automated Notifications:'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <Switch
                  checked={formData.emailAlerts}
                  onChange={(checked) => handleChange('emailAlerts', checked)}
                  label={isAr ? 'تنبيهات البريد للطلبات الجديدة' : 'Email Alerts on Orders'}
                  description={isAr ? 'إشعار عند كل عملية بيع' : 'Instant mail alert'}
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <Switch
                  checked={formData.smsAlerts}
                  onChange={(checked) => handleChange('smsAlerts', checked)}
                  label={isAr ? 'رسائل SMS للمخزون المنخفض' : 'SMS Low Stock Alerts'}
                  description={isAr ? 'تنبيه عند اقتراب النفاذ' : 'SMS when < 5 units'}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <p className="text-xs text-slate-400">
            {isAr
              ? 'تتم المزامنة التلقائية مع Supabase عند توفر المفاتيح، مع حفظ احتياطي محلي دائم.'
              : 'Auto-syncs with Supabase if configured, with resilient local storage backup.'}
          </p>

          <Button
            type="submit"
            variant="primary"
            isLoading={isSaving}
            className="px-8 shadow-lg shadow-indigo-950/40"
            leftIcon={<Check className="w-4 h-4" />}
          >
            {isAr ? 'حفظ كافة التغييرات' : 'Save Changes'}
          </Button>
        </div>
      </form>

      {/* ====================================================================
          FULL-SCREEN CINEMATIC TEST SPLASH SCREEN OVERLAY
          ==================================================================== */}
      <AnimatePresence>
        {isTestSplashOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden"
          >
            {/* Ambient Background Aura */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.15),_transparent_70%)] pointer-events-none" />
            <div className="absolute w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none animate-pulse" />

            {/* Close Button Header */}
            <div className="absolute top-6 end-6 z-20 flex items-center gap-3">
              <span className="text-xs text-slate-400 hidden sm:inline-block">
                {isAr ? 'اضغط ESC أو الزر للخروج' : 'Press ESC or Click Exit'}
              </span>
              <button
                type="button"
                onClick={() => setIsTestSplashOpen(false)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-white text-xs font-bold transition-all shadow-xl cursor-pointer"
              >
                <X className="w-4 h-4 text-rose-400" />
                <span>{isAr ? 'إغلاق المعاينة' : 'Exit Preview'}</span>
              </button>
            </div>

            {/* Central Animated Motif */}
            <div className="relative z-10 flex flex-col items-center max-w-lg mx-auto space-y-6">
              {/* Golden Ring & Motif */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="relative"
              >
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-amber-500/20 via-indigo-600/30 to-amber-300/20 border-2 border-amber-400/40 flex items-center justify-center text-amber-300 shadow-2xl shadow-amber-500/20 backdrop-blur-xl">
                  {(() => {
                    const activeMotif = SPLASH_MOTIFS.find((m) => m.key === formData.splashMotif) || SPLASH_MOTIFS[0];
                    const IconComp = activeMotif.icon;
                    return <IconComp className="w-14 h-14 sm:w-16 sm:h-16 text-amber-300 drop-shadow-md animate-pulse" />;
                  })()}
                </div>

                {/* Pulsing ring around icon */}
                <span className="absolute -inset-2 rounded-3xl border border-amber-500/30 animate-ping pointer-events-none" />
              </motion.div>

              {/* Headlines */}
              <div className="space-y-2">
                <motion.h2
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow"
                >
                  {formData.splashTextAr || 'دار الرافدين للأزياء الرفيعة'}
                </motion.h2>
                <motion.p
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-xs sm:text-sm text-slate-400 tracking-wider uppercase font-medium"
                >
                  {formData.splashTextEn || 'Dar Al-Rafidain Haute Couture'}
                </motion.p>
              </div>

              {/* Animated Progress Bar */}
              <div className="w-64 sm:w-80 space-y-2 pt-2">
                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{
                      duration: formData.splashDurationMs / 1000,
                      ease: 'easeInOut',
                      repeat: Infinity,
                      repeatDelay: 1,
                    }}
                    className="h-full bg-gradient-to-r from-amber-400 via-indigo-500 to-amber-300 rounded-full shadow-sm shadow-amber-400"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>{isAr ? 'جاري التحميل...' : 'Loading bespoke catalog...'}</span>
                  <span>{((formData.splashDurationMs || 2500) / 1000).toFixed(1)}s</span>
                </div>
              </div>

              {/* Maintenance badge if enabled */}
              {formData.maintenanceMode && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-300">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>{isAr ? 'وضع الصيانة نشط حالياً' : 'Maintenance Mode Active'}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SettingsView;
