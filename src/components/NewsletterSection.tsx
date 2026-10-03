import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Mail, Sparkles, RefreshCw } from 'lucide-react';
import type { Language } from '../types';

interface Props {
  lang: Language;
}

export default function NewsletterSection({ lang }: Props) {
  const isAr = lang === 'ar';
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [lastSubmittedEmail, setLastSubmittedEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
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

    try {
      localStorage.setItem('vant_subscribed_email', cleanEmail);
      const existing = JSON.parse(localStorage.getItem('vant_newsletter_subscribers') || '[]');
      if (!existing.includes(cleanEmail)) {
        existing.push(cleanEmail);
        localStorage.setItem('vant_newsletter_subscribers', JSON.stringify(existing));
      }
    } catch {
      // Storage safe
    }

    setErrorMsg('');
    setLastSubmittedEmail(cleanEmail);
    setIsSubscribed(true);
  };

  const handleReset = () => {
    setIsSubscribed(false);
    setEmail('');
    setErrorMsg('');
  };

  return (
    <section
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
            {isAr ? 'ابقَ على اطّلاع على أحدث القطع' : 'Stay Updated on New Releases'}
          </h2>

          {/* Editorial Subtitle */}
          <p className="mt-1.5 text-xs sm:text-[13px] text-[#15171c]/75 dark:text-white/75 leading-relaxed max-w-xs sm:max-w-sm mx-auto">
            {isAr
              ? 'أدخل بريدك لتصلك إشعارات العروض الحصرية وإعادة توفير القطع فوراً.'
              : 'Enter your email for private previews, restock alerts, and exclusive releases.'}
          </p>

          {/* Subscription State Form / Inline Confirmation */}
          <div className="mt-4 sm:mt-6">
            <AnimatePresence mode="wait">
              {!isSubscribed ? (
                /* High-visibility, prominent single-line email input */
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
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder={isAr ? 'أدخل بريدك الإلكتروني هنا...' : 'Enter your email address here...'}
                    aria-label={isAr ? 'عنوان البريد الإلكتروني' : 'Email address'}
                    className="w-full min-w-0 bg-transparent px-2.5 py-1.5 text-xs sm:text-[13px] text-[#15171c] dark:text-white placeholder-[#6b7280] dark:placeholder-white/50 outline-none"
                  />

                  <button
                    type="submit"
                    className="shrink-0 inline-flex items-center justify-center gap-1.5 rounded-full bg-[#004ad7] hover:bg-[#003db3] dark:bg-[#3b82f6] dark:hover:bg-[#2563eb] px-4 py-2 text-xs font-semibold text-white transition-all active:scale-95 shadow-sm cursor-pointer"
                  >
                    <span>{isAr ? 'اشتراك' : 'Subscribe'}</span>
                    <ArrowRight className={`h-3.5 w-3.5 transition-transform ${isAr ? 'rotate-180' : ''}`} />
                  </button>
                </motion.form>
              ) : (
                /* Inline Confirmation with elegant thank-you note AND reset button */
                <motion.div
                  key="newsletter-success"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  className="rounded-2xl border border-[#004ad7]/25 bg-[#004ad7]/[0.07] dark:bg-[#3b82f6]/[0.12] p-4 text-center shadow-xs"
                >
                  <div className="flex items-center justify-center gap-2 text-[#004ad7] dark:text-[#3b82f6] font-semibold text-xs sm:text-sm">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#004ad7] text-white dark:bg-[#3b82f6] dark:text-white">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </span>
                    <span>{isAr ? 'تم الاشتراك بنجاح في دار ڤانت!' : 'Successfully Subscribed to Maison VANT!'}</span>
                  </div>
                  <p className="mt-1 text-xs text-[#15171c]/75 dark:text-white/75">
                    {isAr
                      ? `تم تسجيل بريدك (${lastSubmittedEmail}) — ستصلك الإشعارات والقطع الحصرية فوراً.`
                      : `Registered (${lastSubmittedEmail}) — you will receive exclusive drops and alerts.`}
                  </p>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-[#004ad7] dark:text-[#3b82f6] hover:underline cursor-pointer"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>{isAr ? 'إدخال بريد إلكتروني آخر' : 'Enter another email'}</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message if invalid format */}
            {errorMsg && (
              <p className="mt-2 text-xs font-semibold text-[#004ad7] dark:text-[#3b82f6]">
                {errorMsg}
              </p>
            )}

            <p className="mt-2.5 text-[10px] text-[#6b7280] dark:text-[#9ca3af]">
              {isAr
                ? 'خصوصيتك محمية دائماً. يمكنك إلغاء الاشتراك في أي وقت بنقرة واحدة.'
                : 'Privacy guaranteed. Unsubscribe at any time with a single click.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
