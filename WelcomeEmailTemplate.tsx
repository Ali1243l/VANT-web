import React, { useState, useMemo } from 'react';
import { Copy, Check, Smartphone, Monitor, Code2, CheckCircle2, ShieldCheck, Sparkles, ExternalLink, Gift, Tag, Zap } from 'lucide-react';
import { buildUniversalVantEmailHtml, DEFAULT_STORE_URL } from '../lib/emailTemplates';

export interface WelcomeEmailProps {
  customerEmail?: string;
  couponCode?: string;
  discountPercent?: number;
  welcomeTitle?: string;
  welcomeMessage?: string;
  badgeText?: string;
  heroImage?: string;
  ctaText?: string;
  ctaUrl?: string;
  themeColor?: string;
  editionNote?: string;
  storeUrl?: string;
  isInteractive?: boolean;
  campaignType?: string;
}

/**
 * Ultra-Luxury High-Fashion Email Component
 * Designed to mirror the exact UI design language of VANT Storefront (Alexandria/Outfit, smooth rounded-2xl cards, Royal Cobalt accents)
 */
export default function WelcomeEmailTemplate({
  customerEmail = 'member@vant.archive',
  couponCode = 'VANT-WELCOME-15',
  discountPercent = 15,
  welcomeTitle = 'أهلاً بك في الأرشيف الخاص لـ ڤانت',
  welcomeMessage = 'يسعدنا انضمامك إلى القائمة الحصرية لعشاق الخياطة الراقية والتصاميم المعمارية الفاخرة. استمتع بتجربة تسوق استثنائية مع كود الخصم الترحيبي الخاص بطلبك الأول.',
  badgeText = 'VIP PRIVILEGE ACCESS',
  heroImage = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
  ctaText = 'تطبيق الخصم وتصفح التشكيلة الآن',
  ctaUrl = DEFAULT_STORE_URL,
  themeColor = '#004ad7',
  editionNote = 'VANT ARCHIVE · VIP VERIFIED',
  storeUrl,
  isInteractive = true,
}: WelcomeEmailProps) {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [copiedHtml, setCopiedHtml] = useState(false);

  const baseCtaUrl = (ctaUrl || storeUrl || DEFAULT_STORE_URL).trim();
  const separator = baseCtaUrl.includes('?') ? '&' : '?';
  const offersWithCouponUrl = `${baseCtaUrl}${separator}filter=offers&coupon=${encodeURIComponent(couponCode)}`;

  const resolvedHeroImage = useMemo(() => {
    const raw = (heroImage || '').trim();
    if (!raw) return 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?fm=jpg&fit=crop&w=1200&q=85';
    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
    const cleanPath = raw.replace(/^\/+/, '').replace(/^product-images\//, '');
    return `https://gjjsdnyfhhbacuciqwbq.supabase.co/storage/v1/object/public/product-images/${cleanPath}`;
  }, [heroImage]);

  const handleCopyCode = () => {
    if (!isInteractive) return;
    navigator.clipboard.writeText(couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyHtml = () => {
    const rawHtml = buildUniversalVantEmailHtml({
      customerEmail,
      couponCode,
      discountPercent,
      headline: welcomeTitle,
      message: welcomeMessage,
      badgeText,
      heroImage: resolvedHeroImage,
      ctaText,
      ctaUrl: baseCtaUrl,
      themeColor,
      editionNote,
    });
    navigator.clipboard.writeText(rawHtml);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2500);
  };

  return (
    <div className="w-full space-y-3 font-sans select-text text-start">
      {/* Top Viewport Switcher & Copy Controls */}
      {isInteractive && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-white/80 dark:bg-[#14171d]/90 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-2xl text-xs shadow-sm">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setViewMode('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer font-medium ${
                viewMode === 'desktop'
                  ? 'bg-[#004ad7] text-white font-bold shadow-md shadow-[#004ad7]/20'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white bg-black/5 dark:bg-white/5'
              }`}
            >
              <Monitor className="h-3.5 w-3.5" />
              <span>كمبيوتر (Desktop)</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer font-medium ${
                viewMode === 'mobile'
                  ? 'bg-[#004ad7] text-white font-bold shadow-md shadow-[#004ad7]/20'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white bg-black/5 dark:bg-white/5'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>موبايل (Mobile)</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopyHtml}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#004ad7]/10 dark:bg-[#004ad7]/20 border border-[#004ad7]/30 hover:bg-[#004ad7]/20 text-[#004ad7] dark:text-[#60a5fa] font-bold transition-all cursor-pointer text-xs rounded-xl"
          >
            {copiedHtml ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-emerald-500 font-bold">تم نسخ كود HTML</span>
              </>
            ) : (
              <>
                <Code2 className="h-3.5 w-3.5" />
                <span>نسخ كود الإيميل HTML</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Main Email Preview Frame */}
      <div
        className={`mx-auto transition-all duration-300 ${
          viewMode === 'mobile' ? 'max-w-[390px]' : 'max-w-[580px]'
        }`}
      >
        <div className="w-full bg-[#0d1017] text-[#f3f4f6] border border-white/15 shadow-2xl rounded-3xl overflow-hidden text-start">
          
          {/* 1. TOP METADATA & TRANSMISSION BAR */}
          <div className="bg-[#06080d] px-6 py-3 border-b border-white/10 flex items-center justify-between text-[10.5px] text-zinc-400 font-mono">
            <span className="truncate">{editionNote}</span>
            <span className="text-[#3b82f6] shrink-0 font-bold flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3b82f6] animate-pulse" />
              <span>OFFICIAL ARCHIVE</span>
            </span>
          </div>

          {/* 2. HEADER BRAND LOGO */}
          <header className="px-6 py-8 text-center border-b border-white/10 bg-gradient-to-b from-[#131824] to-[#0d1017]">
            <a href={offersWithCouponUrl} target="_blank" rel="noreferrer" className="no-underline">
              <h1 className="text-3xl sm:text-4xl font-black tracking-[0.3em] text-white uppercase m-0 leading-none">
                VANT
              </h1>
            </a>
            <p className="mt-2.5 text-[10px] tracking-[0.25em] uppercase text-zinc-400 font-mono font-bold">
              HIGH-FASHION ARCHIVE &bull; HAUTE STREETWEAR
            </p>
          </header>

          {/* 3. HERO IMAGE BANNER (Mobile-Safe direct image) */}
          <div className="p-5 sm:p-6 space-y-4">
            <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-[#121722] shadow-md group">
              <img
                src={resolvedHeroImage}
                alt="VANT Luxury Haute Streetwear & Architecture Archive"
                style={{ display: 'block', maxWidth: '100%', height: 'auto', border: 'none' }}
                className="w-full object-cover"
              />
            </div>

            {/* 4. HEADLINE & MESSAGE CARD */}
            <div className="bg-[#121724] border border-white/12 p-5 rounded-2xl space-y-2.5">
              <div className="inline-block bg-[#004ad7]/30 border border-[#3b82f6]/50 px-3 py-0.5 text-[10.5px] font-mono tracking-wider uppercase text-[#93c5fd] font-bold rounded-full">
                {badgeText}
              </div>

              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-snug">
                {welcomeTitle}
              </h2>

              <p className="text-xs text-zinc-300 leading-relaxed">
                {welcomeMessage}
              </p>
            </div>

            {/* 5. VIP VOUCHER CARD WITH 1-CLICK AUTO-APPLY LINK */}
            <div className="bg-gradient-to-b from-[#151c2a] to-[#0f1420] border border-[#3b82f6]/45 p-5 rounded-2xl space-y-3.5 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <Gift className="h-4 w-4 text-[#60a5fa]" />
                  <span>كود الخصم الحصري الخاص بك</span>
                </div>
                <span className="text-xs font-extrabold text-white bg-[#004ad7] px-3 py-1 rounded-full shadow-md">
                  خصم {discountPercent}%
                </span>
              </div>

              {/* Monospace Code Box */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                <div className="flex-1 bg-[#040508] border border-[#3b82f6] px-4 py-3 text-center sm:text-start rounded-xl">
                  <span className="text-xl sm:text-2xl font-mono font-black tracking-widest text-[#60a5fa] select-all">
                    {couponCode}
                  </span>
                </div>

                {isInteractive && (
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="inline-flex items-center justify-center gap-1.5 bg-white text-black hover:bg-zinc-200 active:bg-zinc-300 px-4 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md shrink-0"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span>تم النسخ</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-zinc-700" />
                        <span>نسخ الكود</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* 1-Click Link Preview */}
              <div className="pt-1 text-center sm:text-start space-y-1">
                <div className="text-xs text-[#93c5fd] font-bold flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400 shrink-0" />
                  <span>اضغط على الزر أدناه لتطبيق الخصم تلقائياً عند فتح المتجر:</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  (أو انسخ الرمز أعلاه وأدخله في خانة الكوبون عند الدفع)
                </p>
              </div>
            </div>

            {/* 6. PRIMARY CTA ACTION BUTTON */}
            <a
              href={offersWithCouponUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full block text-center bg-[#004ad7] hover:bg-[#003db3] active:bg-[#002f8a] text-white py-4 px-6 text-sm font-extrabold tracking-wide rounded-2xl transition-all cursor-pointer shadow-xl shadow-[#004ad7]/35 border border-[#3b82f6]/40"
            >
              {ctaText} &larr;
            </a>

            {/* 7. RECIPIENT VERIFICATION DOSSIER */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] text-zinc-400">
              <div className="border border-white/10 bg-white/[0.02] p-3 rounded-xl">
                <span className="text-zinc-500 block text-[10px] mb-0.5">البريد الإلكتروني المعتمد:</span>
                <span className="text-white font-mono break-all">{customerEmail}</span>
              </div>
              <div className="border border-white/10 bg-white/[0.02] p-3 rounded-xl">
                <span className="text-zinc-500 block text-[10px] mb-0.5">رابط المتجر الرسمي:</span>
                <span className="text-[#60a5fa] font-mono break-all">{baseCtaUrl}</span>
              </div>
            </div>
          </div>

          {/* 8. FOOTER */}
          <footer className="px-6 py-5 bg-[#06080d] border-t border-white/10 text-center space-y-1">
            <p className="text-[10px] tracking-wider uppercase text-zinc-400 font-bold font-mono">
              VANT ATELIER &bull; ALL RIGHTS RESERVED &bull; 2026
            </p>
            <p className="text-[9.5px] text-zinc-500 leading-relaxed max-w-sm mx-auto">
              هذه الرسالة مخصصة للمشترك المعتمد في أرشيف ڤانت. يمكنك إلغاء الاشتراك في أي وقت عبر الموقع.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}

export { buildUniversalVantEmailHtml as generateVantEmailHTML };
