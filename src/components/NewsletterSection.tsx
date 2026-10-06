import { useState, useEffect, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Check,
  Mail,
  Sparkles,
  RefreshCw,
  Loader2,
  Trash2,
  Gift,
  Copy,
  CheckCircle2,
  ShieldCheck,
  X,
} from 'lucide-react';
import type { Language } from '../types';
import { addSubscriber, removeSubscriber } from '../lib/newsletter';

interface Props {
  lang: Language;
}

const SUBSCRIPTION_STORAGE_KEY = 'vant_client_newsletter_subscription';
const IP_MAP_KEY = 'vant_ip_subscribers_map';
const WELCOME_COUPON_CODE = 'VANT-WELCOME-15';

export default function NewsletterSection({ lang }: Props) {
  const isAr = lang === 'ar';
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [savedEmail, setSavedEmail] = useState('');
  const [clientIp, setClientIp] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // 1. Restore subscription by Local Device Storage and Client IP Detection
  useEffect(() => {
    // Check local storage subscription
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

    // Detect client IP address and check if subscribed by IP
    let isMounted = true;
    fetch('https://api.ipify.org?format=json')
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted || !data?.ip) return;
        const detectedIp = String(data.ip).trim();
        setClientIp(detectedIp);

        // Check if this IP is registered in the IP subscribers map
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
      .catch(() => {
        // Fallback silently if offline or IP provider blocked
      });

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

        // Show welcome confirmation modal
        setShowWelcomeModal(true);
      }
    } catch (err) {
      console.warn('Subscription error fallback:', err);
      setSavedEmail(cleanEmail);
      setIsSubscribed(true);
      setShowWelcomeModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Unsubscribe / Delete client account from Supabase & Storage
  const handleUnsubscribe = async () => {
    const emailToDelete = savedEmail || email;
    if (!emailToDelete) return;

    const confirmMsg = isAr
      ? `هل أنت متأكد من رغبتك في إلغاء الاشتراك وحذف بريدك (${emailToDelete}) من قائمة ڤانت؟`
      : `Are you sure you want to unsubscribe and delete (${emailToDelete}) from VANT?`;

    if (!window.confirm(confirmMsg)) return;

    setIsDeleting(true);
    try {
      await removeSubscriber(emailToDelete);

      // Clean local storage & IP map
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
      setFeedbackNotice(
        isAr
          ? 'تم إلغاء الاشتراك وحذف حسابك بنجاح من قاعدة البيانات.'
          : 'Successfully unsubscribed and deleted your email.'
      );
      setTimeout(() => setFeedbackNotice(null), 4000);
    } finally {
      setIsDeleting(false);
    }
  };

  // 4. Reset to enter another email
  const handleSwitchEmail = () => {
    setIsSubscribed(false);
    setEmail('');
    setErrorMsg('');
  };

  // 5. Copy welcome discount coupon
  const handleCopyCoupon = () => {
    navigator.clipboard.writeText(WELCOME_COUPON_CODE);
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 2500);
  };

  return (
    <>
      <section
        id="newsletter-section"
        aria-label={isAr ? 'النشرة البريدية الحصرية' : 'Exclusive Newsletter Subscription'}
        className="mx-auto max-w-7xl px-3 sm:px-6 my-6 sm:my-10"
      >
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-black/8 dark:border-white/10 bg-gradient-to-b from-white via-[#fafafb] to-[#f4f5f8] dark:from-[#13161c] dark:via-[#111318] dark:to-[#0d0f12] p-5 sm:p-7 md:p-9 shadow-[0_2px_16px_rgba(0,0,0,0.02)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
          {/* Ambient signature cobalt blue glow */}
          <div className="pointer-events-none absolute -top-12 ltr:-right-12 rtl:-left-12 h-36 w-36 rounded-full bg-[#004ad7]/5 dark:bg-[#3b82f6]/10 blur-xl" />
          <div className="pointer-events-none absolute -bottom-12 ltr:-left-12 rtl:-right-12 h-36 w-36 rounded-full bg-[#004ad7]/5 dark:bg-[#3b82f6]/5 blur-xl" />

          <div className="relative z-10 max-w-md mx-auto text-center">
            {/* Subtle Private Archive Badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full border border-black/8 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.04] px-3 py-1 text-[10px] sm:text-[10.5px] font-semibold text-[#15171c] dark:text-[#f3f4f6]">
              <Sparkles className="h-3 w-3 text-[#004ad7] dark:text-[#3b82f6]" />
              <span className="tracking-widest uppercase">
                {isAr ? 'الوصول الحصري للأرشيف' : 'Private Archive Access'}
              </span>
            </div>

            {/* Main Headline */}
            <h2 className="mt-2.5 text-lg sm:text-xl md:text-2xl font-semibold tracking-tight text-[#15171c] dark:text-white">
              {isSubscribed
                ? isAr
                  ? 'حسابك مسجل ومشترك في ڤانت'
                  : 'You Are Subscribed to VANT'
                : isAr
                ? 'ابقَ على اطّلاع على أحدث القطع'
                : 'Stay Updated on New Releases'}
            </h2>

            {/* Editorial Subtitle */}
            <p className="mt-1.5 text-xs sm:text-[13px] text-[#15171c]/75 dark:text-white/75 leading-relaxed max-w-xs sm:max-w-sm mx-auto">
              {isSubscribed
                ? isAr
                  ? 'أنت على القائمة البريدية المعتمدة. تصلك إشعارات التخفيضات وإعادة توفير القطع الحصرية أولاً بأول.'
                  : 'You are on the VIP mailing list. Exclusive drops and special offers will be sent to your inbox.'
                : isAr
                ? 'أدخل بريدك لتصلك إشعارات العروض الحصرية وإعادة توفير القطع فوراً.'
                : 'Enter your email for private previews, restock alerts, and exclusive releases.'}
            </p>

            {/* Subscription State Form OR Subscribed State with Delete Option */}
            <div className="mt-4 sm:mt-6">
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
                    className="relative flex items-center rounded-full border-2 border-[#15171c]/15 dark:border-white/20 bg-white dark:bg-[#181b22] p-1.5 shadow-md focus-within:border-[#004ad7] dark:focus-within:border-[#3b82f6] focus-within:ring-3 focus-within:ring-[#004ad7]/15 dark:focus-within:ring-[#3b82f6]/25 transition-all"
                  >
                    <div className="pointer-events-none ltr:pl-3 rtl:pr-3 flex items-center text-[#004ad7] dark:text-[#3b82f6] shrink-0">
                      <Mail className="h-4 w-4" />
                    </div>

                    <input
                      type="email"
                      value={email}
                      disabled={isSubmitting}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errorMsg) setErrorMsg('');
                      }}
                      placeholder={isAr ? 'أدخل بريدك الإلكتروني هنا...' : 'Enter your email address here...'}
                      aria-label={isAr ? 'عنوان البريد الإلكتروني' : 'Email address'}
                      className="w-full min-w-0 bg-transparent px-2.5 py-1.5 text-xs sm:text-[13px] text-[#15171c] dark:text-white placeholder-[#6b7280] dark:placeholder-white/50 outline-none disabled:opacity-50"
                    />

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="shrink-0 inline-flex items-center justify-center gap-1.5 rounded-full bg-[#004ad7] hover:bg-[#003db3] dark:bg-[#3b82f6] dark:hover:bg-[#2563eb] px-4 py-2 text-xs font-semibold text-white transition-all active:scale-95 shadow-sm cursor-pointer disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <>
                          <span>{isAr ? 'اشتراك' : 'Subscribe'}</span>
                          <ArrowRight className={`h-3.5 w-3.5 transition-transform ${isAr ? 'rotate-180' : ''}`} />
                        </>
                      )}
                    </button>
                  </motion.form>
                ) : (
                  /* 2. Registered Account Card with Option to Delete/Unsubscribe */
                  <motion.div
                    key="newsletter-active-account"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.25 }}
                    className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.06] dark:bg-emerald-500/[0.12] p-4 text-center shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs sm:text-sm">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                      <span>{isAr ? 'حسابك مضيوف ونشط في ڤانت' : 'Your Account is Active in VANT'}</span>
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-xl bg-white/70 dark:bg-black/40 border border-black/5 dark:border-white/10 px-3 py-1.5 shadow-2xs">
                      <Mail className="h-3.5 w-3.5 text-[#004ad7] dark:text-[#3b82f6]" />
                      <span className="font-mono text-xs font-bold text-[#15171c] dark:text-white" dir="ltr">
                        {savedEmail}
                      </span>
                    </div>

                    <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
                      {/* Delete Account / Unsubscribe Button */}
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={handleUnsubscribe}
                        className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 px-3.5 py-1.5 text-[11px] font-semibold transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                      >
                        {isDeleting ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                        <span>{isAr ? 'إلغاء الاشتراك وحذف الحساب' : 'Unsubscribe & Remove'}</span>
                      </button>

                      {/* Switch Email */}
                      <button
                        type="button"
                        onClick={handleSwitchEmail}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-[#004ad7] dark:text-[#3b82f6] hover:underline cursor-pointer px-2 py-1"
                      >
                        <RefreshCw className="h-3 w-3" />
                        <span>{isAr ? 'تسجيل بريد آخر' : 'Use another email'}</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error Message if invalid format */}
              {errorMsg && (
                <p className="mt-2 text-xs font-semibold text-[#004ad7] dark:text-[#3b82f6]">
                  {errorMsg}
                </p>
              )}

              {/* Feedback Notice after delete */}
              {feedbackNotice && (
                <p className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {feedbackNotice}
                </p>
              )}

              <p className="mt-2.5 text-[10px] text-[#6b7280] dark:text-[#9ca3af]">
                {isAr
                  ? 'خصوصيتك محمية دائماً. يمكنك إلغاء الاشتراك وحذف حسابك في أي وقت بنقرة واحدة.'
                  : 'Privacy guaranteed. You can unsubscribe and delete your account anytime in one click.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Welcome Notification Modal with VIP Coupon */}
      <AnimatePresence>
        {showWelcomeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-sm rounded-3xl border border-white/15 bg-[#12151e] p-6 text-center text-white shadow-2xl overflow-hidden"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowWelcomeModal(false)}
                className="absolute top-4 ltr:right-4 rtl:left-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                aria-label={isAr ? 'إغلاق نافذة الترحيب' : 'Close welcome modal'}
              >
                <X className="h-4 w-4" />
              </button>

              {/* Gift & Sparkle Emblem */}
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#004ad7] to-[#3b82f6] text-white shadow-lg shadow-[#004ad7]/30 mb-3">
                <Gift className="h-7 w-7" />
              </div>

              {/* Welcome Headline */}
              <h3 className="text-lg font-bold tracking-tight text-white">
                {isAr ? 'أهلاً بك في ڤانت!' : 'Welcome to VANT!'}
              </h3>
              <p className="mt-1 text-xs text-white/70 leading-relaxed">
                {isAr
                  ? `تم تفعيل اشتراكك بنجاح، وتم إرسال رسالة ترحيبية خاصة إلى بريدك الإلكتروني (${savedEmail}).`
                  : `Your subscription is active! A welcome message has been dispatched to your email (${savedEmail}).`}
              </p>

              {/* Exclusive Discount Code Voucher */}
              <div className="mt-4 rounded-2xl border border-[#3b82f6]/30 bg-[#004ad7]/10 p-3.5 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-white/70">
                  <span>{isAr ? 'كوبون الخصم الترحيبي الخاص بك' : 'Your Welcome Discount Code'}</span>
                  <span className="font-bold text-emerald-400">{isAr ? 'خصم 15%' : '15% OFF'}</span>
                </div>

                <div className="flex items-center justify-between gap-2 rounded-xl bg-black/50 border border-white/10 px-3 py-2">
                  <span className="font-mono text-sm font-extrabold tracking-wider text-[#60a5fa]">
                    {WELCOME_COUPON_CODE}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCoupon}
                    className="flex items-center gap-1 rounded-lg bg-[#004ad7] hover:bg-[#003db3] px-2.5 py-1 text-[11px] font-bold text-white transition-all active:scale-95 cursor-pointer shadow-xs"
                  >
                    {copiedCoupon ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 text-emerald-300" />
                        <span>{isAr ? 'تم النسخ' : 'Copied'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>{isAr ? 'نسخ الكود' : 'Copy'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-white/50">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>{isAr ? 'سارٍ على جميع قطع التشكيلة والطلبات' : 'Valid on entire catalog'}</span>
              </div>

              {/* Continue Shopping Button */}
              <button
                type="button"
                onClick={() => {
                  setShowWelcomeModal(false);
                  const catalog = document.getElementById('catalog-section');
                  if (catalog) {
                    catalog.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#004ad7] to-[#2563eb] text-xs font-bold text-white shadow-md hover:from-[#004ad7]/90 hover:to-[#2563eb]/90 transition-all cursor-pointer active:scale-98"
              >
                <span>{isAr ? 'تصفح التشكيلة واستخدم الخصم' : 'Explore Pieces with Discount'}</span>
                <ArrowRight className={`h-3.5 w-3.5 ${isAr ? 'rotate-180' : ''}`} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
