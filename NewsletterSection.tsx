import { useState, useEffect, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Mail,
  Sparkles,
  Loader2,
  Trash2,
  Gift,
  CheckCircle2,
  X,
  AlertTriangle,
  Copy,
  Check,
  Bell,
  ShieldCheck,
} from 'lucide-react';
import type { Language } from '../types';
import {
  addSubscriber,
  removeSubscriber,
  dispatchWelcomeEmailCopy,
} from '../lib/newsletter';
import { useSiteControls } from '../context/SiteControlsContext';

interface Props {
  lang: Language;
}

const SUBSCRIPTION_STORAGE_KEY = 'vant_client_newsletter_subscription';
const IP_MAP_KEY = 'vant_ip_subscribers_map';

export default function NewsletterSection({ lang }: Props) {
  const isAr = lang === 'ar';
  const {
    siteSettings,
    isPreviewWelcomeModal,
    setIsPreviewWelcomeModal,
  } = useSiteControls();

  const welcomeTitle = isAr
    ? siteSettings.welcome_title_ar || 'أهلاً بك في ڤانت!'
    : siteSettings.welcome_title_en || 'Welcome to VANT!';

  const welcomeMessage = isAr
    ? siteSettings.welcome_message_ar ||
      'تم تفعيل اشتراكك بنجاح، وتم إرسال نسخة من العرض الترحيبي وكود الخصم إلى بريدك الإلكتروني.'
    : siteSettings.welcome_message_en ||
      'Your subscription is active! A welcome voucher and discount code have been dispatched to your email.';

  const welcomeCouponCode = siteSettings.welcome_coupon_code || 'VANT-WELCOME-15';
  const welcomeDiscountPercent = siteSettings.welcome_discount_percent ?? 15;
  const gradientTheme = siteSettings.newsletter_gradient_theme || 'classic';
  const showGlow = siteSettings.newsletter_glow_enabled !== false;

  const getNewsletterGradientClasses = (t?: string) => {
    switch (t) {
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
        return 'bg-gradient-to-b md:bg-gradient-to-br from-amber-500/15 via-[#fffdfa] to-amber-600/10 dark:from-amber-950/40 dark:via-[#16130e] dark:to-[#0a0805] border-amber-500/30 dark:border-amber-500/40 shadow-amber-500/5';
      case 'custom':
        return 'border-black/10 dark:border-white/15';
      default:
        return 'bg-gradient-to-b md:bg-gradient-to-br from-white via-[#fafafb] to-[#f4f5f8] dark:from-[#13161c] dark:via-[#111318] dark:to-[#0d0f12] border-black/8 dark:border-white/10';
    }
  };

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [savedEmail, setSavedEmail] = useState('');
  const [clientIp, setClientIp] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // 1. Restore subscription by Local Device Storage and Client IP Detection
  useEffect(() => {
    try {
      const localSub = localStorage.getItem(SUBSCRIPTION_STORAGE_KEY);
      if (localSub) {
        const parsed = JSON.parse(localSub);
        if (parsed?.email) {
          setSavedEmail(parsed.email);
          setIsSubscribed(true);
        }
      }
    } catch (e) {
      console.warn('Notice reading local subscriber:', e);
    }

    let isMounted = true;
    fetch('https://api.ipify.org?format=json')
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted || !data?.ip) return;
        const detectedIp = String(data.ip).trim();
        setClientIp(detectedIp);

        try {
          const mapRaw = localStorage.getItem(IP_MAP_KEY);
          if (mapRaw) {
            const map = JSON.parse(mapRaw);
            if (map && map[detectedIp]) {
              setSavedEmail(map[detectedIp]);
              setIsSubscribed(true);
            }
          }
        } catch {}
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  // 2. Submit new email subscription
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMsg(isAr ? 'يرجى كتابة البريد الإلكتروني في الحقل' : 'Please enter your email address');
      return;
    }
    if (!validateEmail(cleanEmail)) {
      setErrorMsg(
        isAr
          ? 'يرجى إدخال بريد إلكتروني صحيح (مثال: name@domain.com)'
          : 'Please enter a valid email address (e.g. name@domain.com)'
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const sourceTag = clientIp ? `الموقع - IP: ${clientIp}` : 'الموقع';
      const res = await addSubscriber(cleanEmail, sourceTag);

      if (res.success) {
        setSavedEmail(cleanEmail);
        setIsSubscribed(true);

        // Save by device storage
        try {
          localStorage.setItem(
            SUBSCRIPTION_STORAGE_KEY,
            JSON.stringify({
              email: cleanEmail,
              subscribed_at: new Date().toISOString(),
              ip: clientIp || undefined,
            })
          );
        } catch {}

        // Save to IP map
        if (clientIp) {
          try {
            const mapRaw = localStorage.getItem(IP_MAP_KEY);
            const map = mapRaw ? JSON.parse(mapRaw) : {};
            map[clientIp] = cleanEmail;
            localStorage.setItem(IP_MAP_KEY, JSON.stringify(map));
          } catch {}
        }

        // Automatically dispatch welcome email copy
        if (siteSettings.welcome_auto_dispatch !== false) {
          try {
            const dispatchResult = await dispatchWelcomeEmailCopy(
              cleanEmail,
              welcomeCouponCode,
              welcomeDiscountPercent,
              welcomeTitle,
              welcomeMessage
            );
            if (dispatchResult.emailSent) {
              setFeedbackNotice(
                isAr
                  ? `✓ تم إرسال كود الخصم والرسالة الترحيبية إلى بريدك (${cleanEmail}) بنجاح.`
                  : `✓ Welcome voucher dispatched to (${cleanEmail}) successfully.`
              );
              setTimeout(() => setFeedbackNotice(null), 6000);
            }
          } catch (e) {
            console.warn('Dispatch error:', e);
          }
        }

        // Show welcome popup modal if enabled
        if (siteSettings.welcome_modal_enabled !== false) {
          setShowWelcomeModal(true);
        }
      }
    } catch (err: any) {
      setErrorMsg(isAr ? 'حدث خطأ أثناء الاشتراك، يرجى المحاولة ثانية' : 'Error subscribing, please retry');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Genuine Unsubscribe / Delete client account from Supabase & Storage
  const handleConfirmDeleteAccount = async () => {
    const emailToDelete = savedEmail || email;
    if (!emailToDelete) {
      setShowDeleteConfirmModal(false);
      return;
    }

    setIsDeleting(true);
    try {
      await removeSubscriber(emailToDelete);

      try {
        localStorage.removeItem(SUBSCRIPTION_STORAGE_KEY);
        if (clientIp) {
          const mapRaw = localStorage.getItem(IP_MAP_KEY);
          if (mapRaw) {
            const map = JSON.parse(mapRaw);
            delete map[clientIp];
            localStorage.setItem(IP_MAP_KEY, JSON.stringify(map));
          }
        }
      } catch {}

      setIsSubscribed(false);
      setSavedEmail('');
      setEmail('');
      setShowDeleteConfirmModal(false);
      setFeedbackNotice(
        isAr
          ? '✓ تم إلغاء الاشتراك وحذف حسابك نهائياً من قاعدة البيانات.'
          : '✓ Successfully unsubscribed and deleted your account from the database.'
      );
      setTimeout(() => setFeedbackNotice(null), 4500);
    } finally {
      setIsDeleting(false);
    }
  };

  // 4. Copy coupon helper
  const handleCopyCoupon = () => {
    if (!welcomeCouponCode) return;
    navigator.clipboard.writeText(welcomeCouponCode);
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 2000);
  };

  return (
    <>
      <section
        id="newsletter-section"
        aria-label={isAr ? 'النشرة البريدية وحساب المشترك' : 'Newsletter & Member Account'}
        className="mx-auto max-w-[1920px] w-full px-3 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 mt-2 sm:mt-3 mb-6 sm:mb-8"
      >
        <div className={`relative mx-auto max-w-4xl lg:max-w-5xl xl:max-w-6xl overflow-hidden rounded-2xl sm:rounded-3xl md:rounded-[32px] border ${getNewsletterGradientClasses(gradientTheme)} p-5 sm:p-7 md:p-9 lg:p-11 shadow-[0_4px_24px_rgba(0,0,0,0.02)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]`}>
          {/* Ambient signature cobalt blue glow */}
          {showGlow && (
            <>
              <div className="pointer-events-none absolute -top-12 ltr:-right-12 rtl:-left-12 h-44 w-44 md:h-56 md:w-56 rounded-full bg-[#004ad7]/10 dark:bg-[#3b82f6]/10 blur-2xl md:blur-3xl" />
              <div className="pointer-events-none absolute -bottom-12 ltr:-left-12 rtl:-right-12 h-44 w-44 md:h-56 md:w-56 rounded-full bg-[#004ad7]/10 dark:bg-[#3b82f6]/5 blur-2xl md:blur-3xl" />
            </>
          )}

          {/* Balanced Responsive Layout: Centered on Mobile, Editorial Two-Column Showcase on Desktop */}
          <div className="relative z-10 flex flex-col md:grid md:grid-cols-12 md:items-center md:gap-8 lg:gap-12">
            {/* Column 1: Brand statement, badges & benefits (Centered on mobile, start-aligned on desktop) */}
            <div className="text-center md:text-start md:col-span-6 lg:col-span-7 space-y-2.5 sm:space-y-3">
              {/* Subtle Private Archive Badge */}
              <div className="inline-flex items-center gap-1.5 rounded-full border border-black/8 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.04] px-3.5 py-1 text-[10.5px] sm:text-[11px] font-semibold text-[#15171c] dark:text-[#f3f4f6]">
                <Sparkles className="h-3.5 w-3.5 text-[#004ad7] dark:text-[#3b82f6]" />
                <span className="tracking-widest uppercase">
                  {isSubscribed
                    ? isAr
                      ? 'عضوية معتمدة'
                      : 'Verified Member'
                    : isAr
                    ? siteSettings.newsletter_badge_ar || 'الوصول الحصري للأرشيف'
                    : siteSettings.newsletter_badge_en || 'Private Archive Access'}
                </span>
              </div>

              {/* Main Headline */}
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-[28px] font-bold tracking-tight text-[#15171c] dark:text-white leading-snug">
                {isSubscribed
                  ? isAr
                    ? 'حسابك مسجل ومشترك في ڤانت'
                    : 'You Are Subscribed to VANT'
                  : isAr
                  ? siteSettings.newsletter_title_ar || 'ابقَ على اطّلاع على أحدث القطع'
                  : siteSettings.newsletter_title_en || 'Stay Updated on New Releases'}
              </h2>

              {/* Editorial Subtitle */}
              <p className="text-xs sm:text-[13px] md:text-sm text-[#15171c]/75 dark:text-white/75 leading-relaxed max-w-sm md:max-w-none mx-auto md:mx-0">
                {isSubscribed
                  ? isAr
                    ? 'أنت مسجل في القائمة الرسمية. تصلك إشعارات التخفيضات وإعادة توفير القطع الحصرية أولاً بأول.'
                    : 'You are on the official list. Restock alerts and private releases are dispatched directly to your inbox.'
                  : isAr
                  ? siteSettings.newsletter_subtitle_ar || 'أدخل بريدك لتصلك إشعارات العروض الحصرية وإعادة توفير القطع فوراً.'
                  : siteSettings.newsletter_subtitle_en || 'Enter your email for private previews, restock alerts, and exclusive releases.'}
              </p>

              {/* Mini Perk Pills (Visible on Desktop for Rich Visual Balance) */}
              {!isSubscribed && (
                <div className="hidden md:flex items-center gap-2 pt-1 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#004ad7]/8 dark:bg-[#3b82f6]/10 px-3 py-1 text-[11px] font-semibold text-[#004ad7] dark:text-[#60a5fa] border border-[#004ad7]/15 dark:border-[#3b82f6]/20">
                    <Sparkles className="h-3 w-3" />
                    <span>
                      {isAr
                        ? siteSettings.newsletter_perk1_ar || `خصم ${welcomeDiscountPercent}% ترحيبي`
                        : siteSettings.newsletter_perk1_en || `${welcomeDiscountPercent}% Welcome Voucher`}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-black/[0.03] dark:bg-white/[0.05] px-3 py-1 text-[11px] font-medium text-[#15171c]/70 dark:text-white/70 border border-black/5 dark:border-white/10">
                    <Bell className="h-3 w-3 text-[#004ad7] dark:text-[#3b82f6]" />
                    <span>
                      {isAr
                        ? siteSettings.newsletter_perk2_ar || 'تنبيهات فورية'
                        : siteSettings.newsletter_perk2_en || 'Instant Alerts'}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-black/[0.03] dark:bg-white/[0.05] px-3 py-1 text-[11px] font-medium text-[#15171c]/70 dark:text-white/70 border border-black/5 dark:border-white/10">
                    <ShieldCheck className="h-3 w-3 text-[#004ad7] dark:text-[#3b82f6]" />
                    <span>
                      {isAr
                        ? siteSettings.newsletter_perk3_ar || 'إلغاء بنقرة واحدة'
                        : siteSettings.newsletter_perk3_en || '1-Click Unsubscribe'}
                    </span>
                  </span>
                </div>
              )}
            </div>

            {/* Column 2: Subscription State Form OR Subscribed Clean Account View */}
            <div className="mt-4 sm:mt-6 md:mt-0 md:col-span-6 lg:col-span-5 w-full">
              <AnimatePresence mode="wait">
                {!isSubscribed ? (
                  /* 1. Subscription Input Form */
                  <motion.form
                    key="newsletter-form"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleSubmit}
                    className="relative flex items-center rounded-full border-2 border-[#15171c]/15 dark:border-white/20 bg-white dark:bg-[#181b22] p-1.5 md:p-2 shadow-md focus-within:border-[#004ad7] dark:focus-within:border-[#3b82f6] focus-within:ring-3 focus-within:ring-[#004ad7]/15 dark:focus-within:ring-[#3b82f6]/25 transition-all"
                  >
                    <div className="pointer-events-none ltr:pl-3 rtl:pr-3 md:ltr:pl-4 md:rtl:pr-4 flex items-center text-[#004ad7] dark:text-[#3b82f6] shrink-0">
                      <Mail className="h-4 w-4 md:h-5 md:w-5" />
                    </div>

                    <input
                      type="email"
                      value={email}
                      disabled={isSubmitting}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errorMsg) setErrorMsg('');
                      }}
                      placeholder={
                        isAr
                          ? siteSettings.newsletter_input_placeholder_ar || 'أدخل بريدك الإلكتروني هنا...'
                          : siteSettings.newsletter_input_placeholder_en || 'Enter your email address here...'
                      }
                      aria-label={isAr ? 'عنوان البريد الإلكتروني' : 'Email address'}
                      className="w-full min-w-0 bg-transparent px-2.5 py-1.5 md:px-3.5 md:py-2 text-xs sm:text-[13px] md:text-sm text-[#15171c] dark:text-white placeholder-[#6b7280] dark:placeholder-white/50 outline-none disabled:opacity-50"
                    />

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="shrink-0 inline-flex items-center justify-center gap-1.5 md:gap-2 rounded-full bg-[#004ad7] hover:bg-[#003db3] dark:bg-[#3b82f6] dark:hover:bg-[#2563eb] px-4 py-2 md:h-12 md:px-6 text-xs md:text-sm font-bold text-white transition-all active:scale-95 shadow-sm cursor-pointer disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>{isAr ? 'جاري التوثيق...' : 'ENCRYPTING...'}</span>
                        </>
                      ) : (
                        <>
                          <span>{isAr ? siteSettings.newsletter_button_ar || 'اشتراك' : siteSettings.newsletter_button_en || 'Subscribe'}</span>
                          <ArrowRight className={`h-3.5 w-3.5 transition-transform ${isAr ? 'rotate-180' : ''}`} />
                        </>
                      )}
                    </button>
                  </motion.form>
                ) : (
                  /* 2. Clean, Minimalist Logged-in Account Card */
                  <motion.div
                    key="newsletter-active-account"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.2 }}
                    className="relative rounded-2xl border border-[#004ad7]/20 dark:border-[#3b82f6]/25 bg-white/80 dark:bg-[#141720] p-4 text-center shadow-sm space-y-3.5"
                  >
                    {/* Active Status Badge */}
                    <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#004ad7] dark:text-[#60a5fa]">
                      <CheckCircle2 className="h-4 w-4 text-[#004ad7] dark:text-[#3b82f6]" />
                      <span>{isAr ? 'الحساب نشط ومسجل في قاعدة البيانات' : 'Active Account in Database'}</span>
                    </div>

                    {/* Email Display Container */}
                    <div className="flex items-center justify-center gap-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/10 px-3.5 py-2">
                      <Mail className="h-4 w-4 text-[#004ad7] dark:text-[#3b82f6] shrink-0" />
                      <span className="font-mono text-xs sm:text-[13px] font-bold text-[#15171c] dark:text-white" dir="ltr">
                        {savedEmail}
                      </span>
                    </div>

                    {/* Real Delete / Cancel Account Action */}
                    <div className="pt-1 flex justify-center">
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirmModal(true)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/25 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 px-4 py-2 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>{isAr ? 'إلغاء الاشتراك وحذف الحساب' : 'Unsubscribe & Delete Account'}</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error Message if invalid format */}
              {errorMsg && (
                <p className="mt-2.5 text-xs font-semibold text-[#004ad7] dark:text-[#3b82f6] text-center md:text-start">
                  {errorMsg}
                </p>
              )}

              {/* Feedback Notice after delete or action */}
              {feedbackNotice && (
                <div className="mt-3 rounded-xl border border-[#004ad7]/30 dark:border-[#3b82f6]/30 bg-[#004ad7]/10 dark:bg-[#3b82f6]/15 p-2.5 text-center text-xs font-semibold text-[#004ad7] dark:text-[#60a5fa] animate-fade-in">
                  {feedbackNotice}
                </div>
              )}

              <p className="mt-2.5 text-[10.5px] text-[#6b7280] dark:text-[#9ca3af] text-center md:text-start">
                {isAr
                  ? siteSettings.newsletter_privacy_ar || 'خصوصيتك محمية. يمكنك إلغاء الاشتراك وحذف حسابك في أي وقت بنقرة واحدة.'
                  : siteSettings.newsletter_privacy_en || 'Privacy guaranteed. You can unsubscribe and delete your account anytime in one click.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Real Account Deletion In-App Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md rounded-3xl border border-rose-500/30 bg-[#12141c] p-6 sm:p-7 text-center text-white shadow-2xl overflow-hidden"
            >
              {/* Alert Icon */}
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-500 shadow-lg shadow-rose-500/20 mb-4">
                <AlertTriangle className="h-7 w-7" />
              </div>

              {/* Modal Headline */}
              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                {isAr ? 'تأكيد إلغاء الاشتراك وحذف الحساب' : 'Confirm Account Deletion'}
              </h3>

              {/* Explanation Body */}
              <p className="mt-2 text-xs sm:text-[13px] text-white/75 leading-relaxed">
                {isAr
                  ? `هل أنت متأكد من رغبتك في حذف البريد (${savedEmail || email}) نهائياً من قاعدة البيانات؟`
                  : `Are you sure you want to permanently delete (${savedEmail || email}) from the database?`}
              </p>

              {/* Action Buttons */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Cancel Button */}
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setShowDeleteConfirmModal(false)}
                  className="w-full flex items-center justify-center rounded-xl border border-white/20 bg-white/10 hover:bg-white/15 active:scale-98 text-xs font-bold text-white py-2.5 transition-all cursor-pointer disabled:opacity-50 min-h-[42px]"
                >
                  {isAr ? 'تراجع والاحتفاظ بالحساب' : 'Cancel & Keep Account'}
                </button>

                {/* Confirm Delete Button */}
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDeleteAccount}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-98 text-xs font-bold text-white py-2.5 transition-all cursor-pointer disabled:opacity-60 shadow-md shadow-rose-600/30 min-h-[42px]"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{isAr ? 'جاري الحذف...' : 'Deleting...'}</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      <span>{isAr ? 'نعم، احذف حسابي' : 'Yes, Delete Account'}</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Upgraded Luxury Welcome Notification Modal (Selected Element) */}
      <AnimatePresence>
        {(showWelcomeModal || isPreviewWelcomeModal) && siteSettings.welcome_modal_enabled !== false && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="relative w-full max-w-md rounded-3xl border border-white/15 bg-[#0f121a]/95 backdrop-blur-2xl p-6 sm:p-7 text-center text-white shadow-[0_24px_60px_rgba(0,0,0,0.6)] overflow-hidden"
            >
              {/* Subtle top ambient cobalt glow */}
              <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-44 w-64 rounded-full bg-[#004ad7]/25 blur-3xl" />

              {/* Top Controls Bar */}
              <div className="relative z-10 flex items-center justify-end mb-3">
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => {
                    setShowWelcomeModal(false);
                    setIsPreviewWelcomeModal(false);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors cursor-pointer"
                  title={isAr ? 'إغلاق' : 'Close'}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Gift Emblem with polished gradient ring */}
              <div className="relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#004ad7] to-[#3b82f6] text-white shadow-lg shadow-[#004ad7]/35 ring-4 ring-[#004ad7]/20 mb-3.5">
                <Gift className="h-7 w-7 stroke-[2.2]" />
              </div>

              {/* Welcome Headline */}
              <h3 className="relative z-10 text-xl font-bold tracking-tight text-white">
                {welcomeTitle}
              </h3>
              <p className="relative z-10 mt-1.5 text-xs sm:text-[13px] text-white/70 leading-relaxed max-w-sm mx-auto">
                {welcomeMessage}
              </p>

              {/* Exclusive Discount Code Voucher Card */}
              <div className="relative z-10 mt-4.5 rounded-2xl border border-white/12 bg-white/[0.04] p-3.5 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-medium text-white/70 px-0.5">
                  <span>{isAr ? 'كوبون الخصم الترحيبي' : 'Welcome Discount Coupon'}</span>
                  <span className="font-bold text-[#60a5fa]">{isAr ? `خصم ${welcomeDiscountPercent}%` : `${welcomeDiscountPercent}% OFF`}</span>
                </div>

                <div className="flex items-center justify-between gap-2 rounded-xl bg-black/50 border border-white/10 px-3 py-2">
                  <span className="font-mono text-sm sm:text-base font-extrabold tracking-wider text-[#60a5fa]">
                    {welcomeCouponCode}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCoupon}
                    className="inline-flex items-center gap-1 rounded-lg bg-[#004ad7] hover:bg-[#003db3] px-2.5 py-1 text-[11px] font-bold text-white transition-all active:scale-95 cursor-pointer shadow-xs"
                  >
                    {copiedCoupon ? (
                      <>
                        <Check className="h-3 w-3 text-white" />
                        <span>{isAr ? 'تم النسخ' : 'Copied'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>{isAr ? 'نسخ' : 'Copy'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Explore Collection Button */}
              <button
                type="button"
                onClick={() => {
                  setShowWelcomeModal(false);
                  setIsPreviewWelcomeModal(false);
                  const catalog = document.getElementById('catalog-section');
                  if (catalog) {
                    catalog.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="relative z-10 mt-4.5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#004ad7] hover:bg-[#003db3] text-xs sm:text-sm font-bold text-white shadow-lg shadow-[#004ad7]/30 transition-all cursor-pointer active:scale-98"
              >
                <span>{isAr ? 'تصفح التشكيلة واستخدم الخصم' : 'Explore Pieces with Discount'}</span>
                <ArrowRight className={`h-4 w-4 ${isAr ? 'rotate-180' : ''}`} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
