import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Mail,
  Palette,
  RotateCcw,
  Save,
  Check,
  CheckCircle2,
  Sliders,
  Eye,
  Monitor,
  Smartphone,
  ShieldCheck,
  Bell,
  ArrowRight,
  Gift,
  HelpCircle,
} from 'lucide-react';
import {
  useSiteControls,
  type NewsletterGradientTheme,
} from '../context/SiteControlsContext';

interface Props {
  isAr?: boolean;
}

const GRADIENT_THEMES: {
  id: NewsletterGradientTheme;
  nameAr: string;
  nameEn: string;
  badge: string;
  preview: string;
}[] = [
  {
    id: 'classic',
    nameAr: 'كلاسيكي رخامي فاخر',
    nameEn: 'Classic Marble Luxe',
    badge: 'رخامي فاتح / داكن نقي',
    preview: 'from-white via-[#fafafb] to-[#f4f5f8] dark:from-[#13161c] dark:to-[#0d0f12]',
  },
  {
    id: 'cobalt',
    nameAr: 'الكوبالت الملكي الأزرق',
    nameEn: 'Signature Cobalt Royale',
    badge: 'تدرج كحلي أزرق أيقوني',
    preview: 'from-[#004ad7]/15 via-white to-[#004ad7]/20 dark:from-[#004ad7]/30 dark:to-[#07090e]',
  },
  {
    id: 'midnight',
    nameAr: 'منتصف الليل الأسود الفاحم',
    nameEn: 'Midnight Obsidian Black',
    badge: 'أسود فخم حالك مع إطار فضي',
    preview: 'from-[#0d0f14] via-[#090b0e] to-black',
  },
  {
    id: 'minimal',
    nameAr: 'مينيمالي نقي مونوكروم',
    nameEn: 'Minimalist Monochrome',
    badge: 'نظيف جداً وبسيط',
    preview: 'from-white to-white dark:from-[#13161c] dark:to-[#13161c]',
  },
  {
    id: 'emerald',
    nameAr: 'الزمرد الملكي المخملي',
    nameEn: 'Emerald Velvet Atelier',
    badge: 'زمردي أخضر راقٍ',
    preview: 'from-emerald-500/15 via-white to-emerald-500/20 dark:from-emerald-950/40 dark:to-[#06090e]',
  },
  {
    id: 'amber',
    nameAr: 'البرونز والعنبر الدافئ',
    nameEn: 'Amber Bronze Warmth',
    badge: 'عنبر برونزي متدرج',
    preview: 'from-amber-500/15 via-white to-amber-500/20 dark:from-amber-950/40 dark:to-[#090806]',
  },
  {
    id: 'gold_royal',
    nameAr: 'الذهب الملكي الخالص',
    nameEn: 'Royal Imperial Gold',
    badge: 'ذهب إمبراطوري فاخر',
    preview: 'from-amber-500/20 via-yellow-100 to-amber-600/20 dark:from-amber-950/50 dark:to-[#0a0805]',
  },
];

export default function AdminNewsletterBoxStudio({ isAr = true }: Props) {
  const { siteSettings, updateSiteSettings } = useSiteControls();

  // Local form draft state
  const [badgeAr, setBadgeAr] = useState(siteSettings.newsletter_badge_ar || 'الوصول الحصري للأرشيف');
  const [badgeEn, setBadgeEn] = useState(siteSettings.newsletter_badge_en || 'Private Archive Access');
  const [titleAr, setTitleAr] = useState(siteSettings.newsletter_title_ar || 'ابقَ على اطّلاع على أحدث القطع');
  const [titleEn, setTitleEn] = useState(siteSettings.newsletter_title_en || 'Stay Updated on New Releases');
  const [subtitleAr, setSubtitleAr] = useState(siteSettings.newsletter_subtitle_ar || 'أدخل بريدك لتصلك إشعارات العروض الحصرية وإعادة توفير القطع فوراً.');
  const [subtitleEn, setSubtitleEn] = useState(siteSettings.newsletter_subtitle_en || 'Enter your email for private previews, restock alerts, and exclusive releases.');
  const [perk1Ar, setPerk1Ar] = useState(siteSettings.newsletter_perk1_ar || 'خصم 15% ترحيبي');
  const [perk1En, setPerk1En] = useState(siteSettings.newsletter_perk1_en || '15% Welcome Voucher');
  const [perk2Ar, setPerk2Ar] = useState(siteSettings.newsletter_perk2_ar || 'تنبيهات فورية');
  const [perk2En, setPerk2En] = useState(siteSettings.newsletter_perk2_en || 'Instant Alerts');
  const [perk3Ar, setPerk3Ar] = useState(siteSettings.newsletter_perk3_ar || 'إلغاء بنقرة واحدة');
  const [perk3En, setPerk3En] = useState(siteSettings.newsletter_perk3_en || '1-Click Unsubscribe');
  const [placeholderAr, setPlaceholderAr] = useState(siteSettings.newsletter_input_placeholder_ar || 'أدخل بريدك الإلكتروني هنا...');
  const [placeholderEn, setPlaceholderEn] = useState(siteSettings.newsletter_input_placeholder_en || 'Enter your email address here...');
  const [buttonAr, setButtonAr] = useState(siteSettings.newsletter_button_ar || 'اشتراك');
  const [buttonEn, setButtonEn] = useState(siteSettings.newsletter_button_en || 'Subscribe');
  const [privacyAr, setPrivacyAr] = useState(siteSettings.newsletter_privacy_ar || 'خصوصيتك محمية. يمكنك إلغاء الاشتراك وحذف حسابك في أي وقت بنقرة واحدة.');
  const [privacyEn, setPrivacyEn] = useState(siteSettings.newsletter_privacy_en || 'Privacy guaranteed. You can unsubscribe and delete your account anytime in one click.');
  const [gradientTheme, setGradientTheme] = useState<NewsletterGradientTheme>(siteSettings.newsletter_gradient_theme || 'classic');
  const [glowEnabled, setGlowEnabled] = useState(siteSettings.newsletter_glow_enabled !== false);
  const [welcomeDiscount, setWelcomeDiscount] = useState(siteSettings.welcome_discount_percent ?? 15);
  const [welcomeCoupon, setWelcomeCoupon] = useState(siteSettings.welcome_coupon_code || 'VANT-WELCOME-15');

  // Preview interactive state
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [previewLang, setPreviewLang] = useState<'ar' | 'en'>('ar');
  const [previewAccountState, setPreviewAccountState] = useState<'unsubscribed' | 'subscribed'>('unsubscribed');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const getGradientClasses = (themeId: NewsletterGradientTheme) => {
    switch (themeId) {
      case 'cobalt':
        return 'bg-gradient-to-b md:bg-gradient-to-br from-[#004ad7]/8 via-white to-[#004ad7]/12 dark:from-[#004ad7]/20 dark:via-[#0e1118] dark:to-[#07090e] border-[#004ad7]/25 dark:border-[#3b82f6]/30';
      case 'midnight':
        return 'bg-gradient-to-b md:bg-gradient-to-br from-[#0d0f14] via-[#090b0e] to-black dark:from-[#090b0e] dark:via-black dark:to-[#040507] border-white/15 text-white shadow-2xl';
      case 'minimal':
        return 'bg-white dark:bg-[#13161c] border-black/10 dark:border-white/10';
      case 'emerald':
        return 'bg-gradient-to-b md:bg-gradient-to-br from-emerald-500/8 via-white to-emerald-500/12 dark:from-emerald-950/30 dark:via-[#0d1218] dark:to-[#06090e] border-emerald-500/25 dark:border-emerald-500/30';
      case 'amber':
        return 'bg-gradient-to-b md:bg-gradient-to-br from-amber-500/8 via-white to-amber-500/12 dark:from-amber-950/30 dark:via-[#14120e] dark:to-[#090806] border-amber-500/25 dark:border-amber-500/30';
      case 'gold_royal':
        return 'bg-gradient-to-b md:bg-gradient-to-br from-amber-500/15 via-[#fffdfa] to-amber-600/10 dark:from-amber-950/40 dark:via-[#16130e] dark:to-[#0a0805] border-amber-500/30 dark:border-amber-500/40';
      default:
        return 'bg-gradient-to-b md:bg-gradient-to-br from-white via-[#fafafb] to-[#f4f5f8] dark:from-[#13161c] dark:via-[#111318] dark:to-[#0d0f12] border-black/8 dark:border-white/10';
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateSiteSettings({
        newsletter_badge_ar: badgeAr,
        newsletter_badge_en: badgeEn,
        newsletter_title_ar: titleAr,
        newsletter_title_en: titleEn,
        newsletter_subtitle_ar: subtitleAr,
        newsletter_subtitle_en: subtitleEn,
        newsletter_perk1_ar: perk1Ar,
        newsletter_perk1_en: perk1En,
        newsletter_perk2_ar: perk2Ar,
        newsletter_perk2_en: perk2En,
        newsletter_perk3_ar: perk3Ar,
        newsletter_perk3_en: perk3En,
        newsletter_input_placeholder_ar: placeholderAr,
        newsletter_input_placeholder_en: placeholderEn,
        newsletter_button_ar: buttonAr,
        newsletter_button_en: buttonEn,
        newsletter_privacy_ar: privacyAr,
        newsletter_privacy_en: privacyEn,
        newsletter_gradient_theme: gradientTheme,
        newsletter_glow_enabled: glowEnabled,
        welcome_discount_percent: welcomeDiscount,
        welcome_coupon_code: welcomeCoupon,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    setBadgeAr('الوصول الحصري للأرشيف');
    setBadgeEn('Private Archive Access');
    setTitleAr('ابقَ على اطّلاع على أحدث القطع');
    setTitleEn('Stay Updated on New Releases');
    setSubtitleAr('أدخل بريدك لتصلك إشعارات العروض الحصرية وإعادة توفير القطع فوراً.');
    setSubtitleEn('Enter your email for private previews, restock alerts, and exclusive releases.');
    setPerk1Ar('خصم 15% ترحيبي');
    setPerk1En('15% Welcome Voucher');
    setPerk2Ar('تنبيهات فورية');
    setPerk2En('Instant Alerts');
    setPerk3Ar('إلغاء بنقرة واحدة');
    setPerk3En('1-Click Unsubscribe');
    setPlaceholderAr('أدخل بريدك الإلكتروني هنا...');
    setPlaceholderEn('Enter your email address here...');
    setButtonAr('اشتراك');
    setButtonEn('Subscribe');
    setPrivacyAr('خصوصيتك محمية. يمكنك إلغاء الاشتراك وحذف حسابك في أي وقت بنقرة واحدة.');
    setPrivacyEn('Privacy guaranteed. You can unsubscribe and delete your account anytime in one click.');
    setGradientTheme('classic');
    setGlowEnabled(true);
    setWelcomeDiscount(15);
    setWelcomeCoupon('VANT-WELCOME-15');

    await updateSiteSettings({
      newsletter_badge_ar: 'الوصول الحصري للأرشيف',
      newsletter_badge_en: 'Private Archive Access',
      newsletter_title_ar: 'ابقَ على اطّلاع على أحدث القطع',
      newsletter_title_en: 'Stay Updated on New Releases',
      newsletter_subtitle_ar: 'أدخل بريدك لتصلك إشعارات العروض الحصرية وإعادة توفير القطع فوراً.',
      newsletter_subtitle_en: 'Enter your email for private previews, restock alerts, and exclusive releases.',
      newsletter_perk1_ar: 'خصم 15% ترحيبي',
      newsletter_perk1_en: '15% Welcome Voucher',
      newsletter_perk2_ar: 'تنبيهات فورية',
      newsletter_perk2_en: 'Instant Alerts',
      newsletter_perk3_ar: 'إلغاء بنقرة واحدة',
      newsletter_perk3_en: '1-Click Unsubscribe',
      newsletter_input_placeholder_ar: 'أدخل بريدك الإلكتروني هنا...',
      newsletter_input_placeholder_en: 'Enter your email address here...',
      newsletter_button_ar: 'اشتراك',
      newsletter_button_en: 'Subscribe',
      newsletter_privacy_ar: 'خصوصيتك محمية. يمكنك إلغاء الاشتراك وحذف حسابك في أي وقت بنقرة واحدة.',
      newsletter_privacy_en: 'Privacy guaranteed. You can unsubscribe and delete your account anytime in one click.',
      newsletter_gradient_theme: 'classic',
      newsletter_glow_enabled: true,
      welcome_discount_percent: 15,
      welcome_coupon_code: 'VANT-WELCOME-15',
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-8">
      {/* Top Header */}
      <div className="pb-3 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Mail className="h-5 w-5 text-emerald-400" />
              <span>{isAr ? 'ستوديو وتخصيص مستطيل النشرة البريدية (Newsletter Box)' : 'Newsletter Box Customizer & Studio'}</span>
            </h2>
          </div>
          <p className="text-xs text-white/60 mt-0.5">
            {isAr
              ? 'التحكم بكافة نصوص وعناوين ومزايا وألوان وتدرجات مستطيل الاشتراك بالمتجر مع تجربة حية فورية'
              : 'Customize all headlines, perks, badges, colors, and gradients of the newsletter box live'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{isAr ? 'استعادة الافتراضي' : 'Reset'}</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 px-4 py-1.5 text-xs font-bold text-white transition-all shadow-md shadow-emerald-600/25 flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            {isSaving ? (
              <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            <span>{isAr ? 'حفظ ونشر التعديل' : 'Save & Publish'}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="rounded-2xl border border-emerald-500/40 bg-emerald-500/15 p-3.5 flex items-center justify-between text-emerald-300 text-xs font-bold shadow-md shadow-emerald-500/10"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
            <span>
              {isAr
                ? 'تم حفظ واعتماد تصميم ونصوص مستطيل النشرة البريدية بنجاح! يتم الآن عرضها في المتجر.'
                : 'Newsletter box settings saved and published to the live store!'}
            </span>
          </div>
          <span className="text-[10.5px] font-mono text-emerald-400/80">LIVE IN BOUTIQUE</span>
        </motion.div>
      )}

      {/* 1. LIVE SIMULATED PREVIEW OF CSS SELECTOR 1 */}
      <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-[#101918] via-[#090f0e] to-[#050808] p-6 space-y-4 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">
                {isAr ? 'معاينة حية للمستطيل كما يظهر للزبون (Live Preview Canvas):' : 'Live Preview Canvas:'}
              </h3>
            </div>
            <p className="text-[11px] text-white/55 mt-0.5">
              {isAr
                ? 'تتحدث المعاينة تلقائياً عند تغيير أي نص أو تدرج لوني أدناه'
                : 'Preview updates instantly as you tweak any text or theme below'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Device switch: Desktop vs Mobile */}
            <div className="flex items-center rounded-xl border border-white/15 bg-black/50 p-1">
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                  previewDevice === 'desktop' ? 'bg-emerald-600 text-white' : 'text-white/60 hover:text-white'
                }`}
              >
                <Monitor className="h-3.5 w-3.5" />
                <span>بيسي / دسك توب</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                  previewDevice === 'mobile' ? 'bg-emerald-600 text-white' : 'text-white/60 hover:text-white'
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span>موبايل</span>
              </button>
            </div>

            {/* Language switch */}
            <div className="flex items-center rounded-xl border border-white/15 bg-black/50 p-1">
              <button
                type="button"
                onClick={() => setPreviewLang('ar')}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                  previewLang === 'ar' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'
                }`}
              >
                عربي
              </button>
              <button
                type="button"
                onClick={() => setPreviewLang('en')}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                  previewLang === 'en' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

            {/* Account state toggle */}
            <div className="flex items-center rounded-xl border border-white/15 bg-black/50 p-1">
              <button
                type="button"
                onClick={() => setPreviewAccountState(previewAccountState === 'unsubscribed' ? 'subscribed' : 'unsubscribed')}
                className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 px-2 py-0.5 cursor-pointer"
              >
                {previewAccountState === 'unsubscribed' ? 'معاينة حالة (مشترك)' : 'معاينة حالة (غير مشترك)'}
              </button>
            </div>
          </div>
        </div>

        {/* The Live Rendered Newsletter Rectangle */}
        <div className={`mx-auto transition-all duration-300 ${previewDevice === 'mobile' ? 'max-w-sm' : 'max-w-4xl'}`}>
          <div className={`relative overflow-hidden rounded-2xl sm:rounded-3xl border ${getGradientClasses(gradientTheme)} p-5 sm:p-7 shadow-lg`}>
            {glowEnabled && (
              <>
                <div className="pointer-events-none absolute -top-10 ltr:-right-10 rtl:-left-10 h-36 w-36 rounded-full bg-[#004ad7]/15 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-10 ltr:-left-10 rtl:-right-10 h-36 w-36 rounded-full bg-[#004ad7]/15 blur-2xl" />
              </>
            )}

            <div className={`relative z-10 flex flex-col ${previewDevice === 'desktop' ? 'md:grid md:grid-cols-12 md:items-center md:gap-6' : ''}`}>
              <div className={`${previewDevice === 'desktop' ? 'text-start md:col-span-7 space-y-2' : 'text-center space-y-2'}`}>
                {/* Badge */}
                <div className="inline-flex items-center gap-1.5 rounded-full border border-black/10 dark:border-white/15 bg-black/[0.04] dark:bg-white/[0.05] px-3 py-0.5 text-[10.5px] font-semibold text-[#15171c] dark:text-[#f3f4f6]">
                  <Sparkles className="h-3 w-3 text-[#004ad7] dark:text-[#3b82f6]" />
                  <span className="tracking-widest uppercase">
                    {previewAccountState === 'subscribed'
                      ? previewLang === 'ar' ? 'عضوية معتمدة' : 'Verified Member'
                      : previewLang === 'ar' ? badgeAr : badgeEn}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base sm:text-lg font-bold tracking-tight text-[#15171c] dark:text-white leading-snug">
                  {previewAccountState === 'subscribed'
                    ? previewLang === 'ar' ? 'حسابك مسجل ومشترك في ڤانت' : 'You Are Subscribed to VANT'
                    : previewLang === 'ar' ? titleAr : titleEn}
                </h3>

                {/* Subtitle */}
                <p className="text-xs text-[#15171c]/75 dark:text-white/75 leading-relaxed">
                  {previewAccountState === 'subscribed'
                    ? previewLang === 'ar'
                      ? 'أنت مسجل في القائمة الرسمية. تصلك إشعارات التخفيضات أولاً بأول.'
                      : 'You are on the official list. Restock alerts are dispatched to your inbox.'
                    : previewLang === 'ar' ? subtitleAr : subtitleEn}
                </p>

                {/* Mini Perk Pills */}
                {previewAccountState === 'unsubscribed' && previewDevice === 'desktop' && (
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#004ad7]/10 px-2.5 py-0.5 text-[10.5px] font-semibold text-[#004ad7] dark:text-[#60a5fa] border border-[#004ad7]/20">
                      <Sparkles className="h-2.5 w-2.5" />
                      <span>{previewLang === 'ar' ? perk1Ar : perk1En}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-black/5 dark:bg-white/5 px-2.5 py-0.5 text-[10.5px] font-medium text-[#15171c]/70 dark:text-white/70 border border-black/5">
                      <Bell className="h-2.5 w-2.5 text-[#004ad7] dark:text-[#3b82f6]" />
                      <span>{previewLang === 'ar' ? perk2Ar : perk2En}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-black/5 dark:bg-white/5 px-2.5 py-0.5 text-[10.5px] font-medium text-[#15171c]/70 dark:text-white/70 border border-black/5">
                      <ShieldCheck className="h-2.5 w-2.5 text-[#004ad7] dark:text-[#3b82f6]" />
                      <span>{previewLang === 'ar' ? perk3Ar : perk3En}</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Form Column */}
              <div className={`mt-3 ${previewDevice === 'desktop' ? 'md:mt-0 md:col-span-5' : ''}`}>
                {previewAccountState === 'unsubscribed' ? (
                  <div className="flex items-center rounded-full border border-black/15 dark:border-white/20 bg-white dark:bg-[#181b22] p-1 shadow-sm">
                    <div className="px-2.5 text-[#004ad7] dark:text-[#3b82f6]">
                      <Mail className="h-3.5 w-3.5" />
                    </div>
                    <span className="flex-1 text-[11px] text-zinc-400 select-none">
                      {previewLang === 'ar' ? placeholderAr : placeholderEn}
                    </span>
                    <button
                      type="button"
                      className="shrink-0 rounded-full bg-[#004ad7] px-3.5 py-1.5 text-[11px] font-bold text-white flex items-center gap-1"
                    >
                      <span>{previewLang === 'ar' ? buttonAr : buttonEn}</span>
                      <ArrowRight className={`h-3 w-3 ${previewLang === 'ar' ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                ) : (
                  <div className="rounded-xl border border-[#004ad7]/20 bg-white/80 dark:bg-[#141720] p-3 text-center space-y-2">
                    <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-[#004ad7]">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{previewLang === 'ar' ? 'الحساب نشط ومسجل' : 'Active Account'}</span>
                    </div>
                    <span className="font-mono text-xs text-white block">client@example.com</span>
                  </div>
                )}
                <p className="mt-1.5 text-[9.5px] text-[#6b7280] dark:text-[#9ca3af] text-center md:text-start">
                  {previewLang === 'ar' ? privacyAr : privacyEn}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. EDITING ALL TEXTS & CONTENT */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {isAr ? '1. نصوص وعناوين المستطيل باللغتين العربية والإنجليزية:' : '1. Box Headlines & Copy (AR & EN):'}
            </h3>
          </div>
        </div>

        {/* Main Headline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-white/80 block mb-1">
              {isAr ? 'العنوان الرئيسي (العربية):' : 'Main Headline (Arabic):'}
            </label>
            <input
              type="text"
              value={titleAr}
              onChange={(e) => setTitleAr(e.target.value)}
              className="h-10 w-full rounded-xl border border-white/15 bg-black/50 px-3 text-xs text-white outline-none focus:border-emerald-400"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-white/80 block mb-1">
              {isAr ? 'العنوان الرئيسي (الإنجليزية):' : 'Main Headline (English):'}
            </label>
            <input
              type="text"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              className="h-10 w-full rounded-xl border border-white/15 bg-black/50 px-3 text-xs text-white outline-none focus:border-emerald-400"
            />
          </div>
        </div>

        {/* Subtitle / Description */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-white/80 block mb-1">
              {isAr ? 'النص التوضيحي والفلسفة (العربية):' : 'Subtitle / Description (Arabic):'}
            </label>
            <textarea
              rows={2}
              value={subtitleAr}
              onChange={(e) => setSubtitleAr(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/50 p-2.5 text-xs text-white outline-none focus:border-emerald-400"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-white/80 block mb-1">
              {isAr ? 'النص التوضيحي والفلسفة (الإنجليزية):' : 'Subtitle / Description (English):'}
            </label>
            <textarea
              rows={2}
              value={subtitleEn}
              onChange={(e) => setSubtitleEn(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/50 p-2.5 text-xs text-white outline-none focus:border-emerald-400"
            />
          </div>
        </div>

        {/* Archive Badge */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-white/80 block mb-1">
              {isAr ? 'شارة أعلى المستطيل (العربية):' : 'Top Archive Badge (Arabic):'}
            </label>
            <input
              type="text"
              value={badgeAr}
              onChange={(e) => setBadgeAr(e.target.value)}
              className="h-10 w-full rounded-xl border border-white/15 bg-black/50 px-3 text-xs text-white outline-none focus:border-emerald-400"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-white/80 block mb-1">
              {isAr ? 'شارة أعلى المستطيل (الإنجليزية):' : 'Top Archive Badge (English):'}
            </label>
            <input
              type="text"
              value={badgeEn}
              onChange={(e) => setBadgeEn(e.target.value)}
              className="h-10 w-full rounded-xl border border-white/15 bg-black/50 px-3 text-xs text-white outline-none focus:border-emerald-400"
            />
          </div>
        </div>

        {/* 3 Perks Pills */}
        <div className="pt-2 border-t border-white/10 space-y-3">
          <label className="text-xs font-bold text-white block">
            {isAr ? 'كبسولات المزايا الثلاثة الترويجية (The 3 Perks Pills):' : 'The 3 Perk Pills:'}
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5 p-3 rounded-xl bg-black/40 border border-white/10">
              <span className="text-[11px] font-bold text-emerald-400 block">الميزة 1 (الخصم الترحيبي)</span>
              <input
                type="text"
                value={perk1Ar}
                onChange={(e) => setPerk1Ar(e.target.value)}
                placeholder="خصم 15% ترحيبي"
                className="h-8 w-full rounded-lg border border-white/15 bg-black px-2.5 text-xs text-white outline-none"
              />
              <input
                type="text"
                value={perk1En}
                onChange={(e) => setPerk1En(e.target.value)}
                placeholder="15% Welcome Voucher"
                className="h-8 w-full rounded-lg border border-white/15 bg-black px-2.5 text-xs text-white outline-none"
              />
            </div>

            <div className="space-y-1.5 p-3 rounded-xl bg-black/40 border border-white/10">
              <span className="text-[11px] font-bold text-blue-400 block">الميزة 2 (التنبيهات)</span>
              <input
                type="text"
                value={perk2Ar}
                onChange={(e) => setPerk2Ar(e.target.value)}
                placeholder="تنبيهات فورية"
                className="h-8 w-full rounded-lg border border-white/15 bg-black px-2.5 text-xs text-white outline-none"
              />
              <input
                type="text"
                value={perk2En}
                onChange={(e) => setPerk2En(e.target.value)}
                placeholder="Instant Alerts"
                className="h-8 w-full rounded-lg border border-white/15 bg-black px-2.5 text-xs text-white outline-none"
              />
            </div>

            <div className="space-y-1.5 p-3 rounded-xl bg-black/40 border border-white/10">
              <span className="text-[11px] font-bold text-purple-400 block">الميزة 3 (المرونة والخصوصية)</span>
              <input
                type="text"
                value={perk3Ar}
                onChange={(e) => setPerk3Ar(e.target.value)}
                placeholder="إلغاء بنقرة واحدة"
                className="h-8 w-full rounded-lg border border-white/15 bg-black px-2.5 text-xs text-white outline-none"
              />
              <input
                type="text"
                value={perk3En}
                onChange={(e) => setPerk3En(e.target.value)}
                placeholder="1-Click Unsubscribe"
                className="h-8 w-full rounded-lg border border-white/15 bg-black px-2.5 text-xs text-white outline-none"
              />
            </div>
          </div>
        </div>

        {/* Input Placeholder & Button & Privacy */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div>
            <label className="text-[11px] font-semibold text-white/70 block mb-1">
              {isAr ? 'نص تلميح الحقل (Placeholder):' : 'Input Placeholder:'}
            </label>
            <input
              type="text"
              value={placeholderAr}
              onChange={(e) => setPlaceholderAr(e.target.value)}
              className="h-9 w-full rounded-xl border border-white/15 bg-black/50 px-3 text-xs text-white outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-white/70 block mb-1">
              {isAr ? 'نص زر الاشتراك (CTA):' : 'Button Label:'}
            </label>
            <input
              type="text"
              value={buttonAr}
              onChange={(e) => setButtonAr(e.target.value)}
              className="h-9 w-full rounded-xl border border-white/15 bg-black/50 px-3 text-xs text-white outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-white/70 block mb-1">
              {isAr ? 'كود الخصم الترحيبي والنسبة:' : 'Coupon Code & Percent:'}
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={welcomeCoupon}
                onChange={(e) => setWelcomeCoupon(e.target.value.toUpperCase())}
                className="h-9 flex-1 rounded-xl border border-white/15 bg-black/50 px-2.5 text-xs font-mono font-bold text-blue-400 outline-none"
              />
              <div className="relative flex items-center">
                <input
                  type="number"
                  min="5"
                  max="70"
                  value={welcomeDiscount}
                  onChange={(e) => setWelcomeDiscount(Number(e.target.value))}
                  className="h-9 w-14 rounded-xl border border-white/15 bg-black/50 px-2 text-xs font-bold text-center text-white outline-none"
                />
                <span className="absolute ltr:right-2 rtl:left-2 text-[10px] text-white/50 pointer-events-none">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy notice */}
        <div>
          <label className="text-[11px] font-semibold text-white/70 block mb-1">
            {isAr ? 'رسالة حماية الخصوصية وإمكانية الحذف:' : 'Privacy Protection Notice:'}
          </label>
          <input
            type="text"
            value={privacyAr}
            onChange={(e) => setPrivacyAr(e.target.value)}
            className="h-9 w-full rounded-xl border border-white/15 bg-black/50 px-3 text-xs text-white outline-none"
          />
        </div>
      </div>

      {/* 3. GRADIENT THEME & GLOW EFFECTS */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {isAr ? '2. ستايل وتدرج خلفية المستطيل (Box Gradient Themes):' : '2. Box Gradient Themes:'}
            </h3>
          </div>
          <span className="text-[11px] font-mono text-cyan-400 font-bold bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
            {GRADIENT_THEMES.find((g) => g.id === gradientTheme)?.nameAr}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {GRADIENT_THEMES.map((gt) => {
            const isSelected = gradientTheme === gt.id;
            return (
              <button
                key={gt.id}
                type="button"
                onClick={() => setGradientTheme(gt.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-start space-y-2 ${
                  isSelected
                    ? 'bg-emerald-500/20 border-emerald-400 shadow-md ring-1 ring-emerald-400'
                    : 'bg-black/40 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isSelected ? 'text-emerald-300' : 'text-white'}`}>
                    {isAr ? gt.nameAr : gt.nameEn}
                  </span>
                  {isSelected && <Check className="h-4 w-4 text-emerald-400" />}
                </div>

                <div className={`h-6 rounded-lg bg-gradient-to-r ${gt.preview} border border-white/10`} />

                <span className="text-[10px] text-white/50 block font-mono">
                  {gt.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Ambient Glow Toggle */}
        <div className="pt-2 flex items-center justify-between p-3 rounded-2xl border border-white/10 bg-black/40">
          <div>
            <span className="text-xs font-bold text-white block">
              {isAr ? 'تأثير الهالة المضيئة الجانبية (Ambient Glow Orbs)' : 'Ambient Glow Orbs'}
            </span>
            <span className="text-[11px] text-white/50 block mt-0.5">
              {isAr ? 'هالات ضوئية ناعمة في زوايا المستطيل تمنحه عمقاً وفخامة بصرية' : 'Adds subtle ambient blur lighting in the box corners'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setGlowEnabled(!glowEnabled)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              glowEnabled
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white/10 text-white/60 hover:text-white'
            }`}
          >
            {glowEnabled ? (isAr ? 'مفعّلة' : 'Enabled') : (isAr ? 'معطلة' : 'Disabled')}
          </button>
        </div>
      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="p-4 rounded-2xl border border-white/15 bg-black/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky bottom-4 backdrop-blur-xl z-20 shadow-2xl">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-white">
            {isAr ? 'التعديلات جاهزة للاعتماد الفوري في المستطيل' : 'Ready to publish newsletter box updates'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-white/70 hover:text-white transition-all cursor-pointer"
          >
            {isAr ? 'استعادة الافتراضي' : 'Reset'}
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 px-6 py-2.5 text-xs font-bold text-white transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isSaving ? (
              <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{isAr ? 'اعتماد ونشر تعديلات المستطيل الآن' : 'Publish Box Updates Live'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
