import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, MessageCircle, ArrowRight, Lock, KeyRound, Sparkles, Clock, Crown, X } from 'lucide-react';
import { DEFAULT_WHATSAPP_PHONE } from '../lib/constants';

interface Props {
  maintenanceMessage?: string;
  maintenanceMessageAr?: string;
  isPreview?: boolean;
  onClosePreview?: () => void;
  onAdminUnlock: (pin: string) => boolean;
  onBypass: () => void;
}

export default function MaintenanceScreen({
  maintenanceMessage = 'We are refining our haute-couture collection and private archive. Please check back shortly.',
  maintenanceMessageAr = 'نعمل حالياً على تجهيز التشكيلة الحصرية القادمة وتحديث المعرض الخاص. سيتم الافتتاح قريباً.',
  isPreview = false,
  onClosePreview,
  onAdminUnlock,
  onBypass,
}: Props) {
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onAdminUnlock(pinInput);
    if (success) {
      setShowAdminModal(false);
      if (isPreview) {
        onClosePreview?.();
      }
      onBypass();
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  const whatsappUrl = `https://wa.me/${DEFAULT_WHATSAPP_PHONE}?text=${encodeURIComponent(
    'مرحباً دار ڤانت، أود الاستفسار والتواصل بخصوص التشكيلة أثناء فترة تجهيز المتجر.'
  )}`;

  return (
    <div
      className={`min-h-screen w-full bg-[#0a0c10] text-white flex flex-col justify-between p-5 sm:p-8 md:p-12 select-none relative overflow-x-hidden ${
        isPreview ? 'fixed inset-0 z-[9999] overflow-y-auto' : 'relative'
      }`}
    >
      {/* Background Architectural Luxury Glows (Primary Colors Only: Obsidian & Cobalt Blue) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,74,215,0.14),transparent_60%)] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[750px] w-[750px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,74,215,0.08),transparent_70%)] blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4.5rem_4.5rem] pointer-events-none" />

      {/* Floating Preview Banner (When tested via Admin Menu - Styled strictly in Primary Cobalt & Noir) */}
      {isPreview && (
        <div className="relative z-40 mb-6 -mt-2 -mx-2 sm:-mx-6 rounded-2xl border border-[#004ad7]/40 bg-gradient-to-r from-[#004ad7]/25 via-[#0e121b]/95 to-[#004ad7]/25 p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-2.5 text-xs font-bold text-white">
            <span className="flex h-2.5 w-2.5 rounded-full bg-[#3b82f6] animate-pulse shadow-sm shadow-[#3b82f6]" />
            <span className="tracking-wide">
              معاينة شاشة الصيانة وتحديث المعرض للزبائن (Live Maintenance Preview)
            </span>
          </div>

          <button
            type="button"
            onClick={onClosePreview}
            className="flex items-center gap-1.5 rounded-xl bg-[#004ad7] hover:bg-[#003db3] text-white px-4 py-1.5 font-bold text-xs cursor-pointer transition-all active:scale-95 shadow-md shadow-[#004ad7]/30 border border-[#3b82f6]/40"
          >
            <X className="h-3.5 w-3.5" />
            <span>إغلاق المعاينة والعودة للوحة الإدارة</span>
          </button>
        </div>
      )}

      {/* Haute-Couture Header Bar */}
      <header className="relative z-10 w-full flex items-center justify-between border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <span className="font-extrabold text-xl sm:text-2xl tracking-[0.28em] text-white pl-[0.28em]">
            VANT
          </span>
          <span className="hidden sm:inline-block text-white/40 font-mono text-[11px] tracking-widest uppercase">
            • PARIS / BAGHDAD ATELIER
          </span>
        </div>

        {/* Live Status Indicator - Primary Brand Cobalt */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#004ad7]/35 bg-[#004ad7]/10 px-3.5 py-1 text-xs font-mono text-[#60a5fa] backdrop-blur-md shadow-xs">
          <span className="h-2 w-2 rounded-full bg-[#3b82f6] animate-pulse shadow-sm shadow-[#3b82f6]" />
          <span className="tracking-wider">STATUS: PRIVATE ATELIER UPGRADE</span>
        </div>
      </header>

      {/* Main Haute-Couture Offline Presentation */}
      <main className="relative z-10 my-auto py-12 sm:py-16 max-w-4xl mx-auto text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6 sm:space-y-8 w-full"
        >
          {/* Top Editorial Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-4 py-1.5 text-xs font-mono tracking-widest text-zinc-300 uppercase backdrop-blur-md">
            <Lock className="h-3.5 w-3.5 text-[#3b82f6]" />
            <span>PRIVATE CURATION & DROP PREPARATION</span>
          </div>

          {/* Main Haute Titles */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight uppercase leading-[1.08] text-white">
              CURATING <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/85 to-[#93c5fd]">THE NEXT CHAPTER</span>
            </h1>

            <h2 dir="rtl" className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white/95 tracking-normal">
              نُجهّز التشكيلة الحصرية القادمة
            </h2>
          </div>

          {/* Dynamic Admin Maintenance Descriptions */}
          <div className="max-w-2xl mx-auto space-y-3 pt-2">
            <p dir="rtl" className="text-sm sm:text-base md:text-lg text-zinc-300 leading-relaxed font-normal">
              {maintenanceMessageAr}
            </p>
            <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed tracking-wide">
              {maintenanceMessage}
            </p>
          </div>

          {/* 3 Luxury Reassurance Cards (Primary Colors Only) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-3xl mx-auto pt-4 text-start">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4.5 backdrop-blur-md transition-all hover:border-[#004ad7]/40">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-7 w-7 rounded-lg bg-[#004ad7]/15 border border-[#004ad7]/30 flex items-center justify-center text-[#60a5fa]">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <h4 className="text-xs font-bold text-white">خدمة الزبائن الحصرية</h4>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                متاحون على مدار الساعة للرد على استفساراتكم وحجز القطع الخاصة مباشرة.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4.5 backdrop-blur-md transition-all hover:border-[#004ad7]/40">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-7 w-7 rounded-lg bg-[#004ad7]/15 border border-[#004ad7]/30 flex items-center justify-center text-[#60a5fa]">
                  <Crown className="h-4 w-4" />
                </div>
                <h4 className="text-xs font-bold text-white">إصدارات محدودة</h4>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                نعمل على أرشفة وإعداد قطع نادرة بجودة خياطة راقية من باريس إلى بغداد.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4.5 backdrop-blur-md transition-all hover:border-[#004ad7]/40">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-7 w-7 rounded-lg bg-[#004ad7]/15 border border-[#004ad7]/30 flex items-center justify-center text-[#60a5fa]">
                  <Clock className="h-4 w-4" />
                </div>
                <h4 className="text-xs font-bold text-white">إعادة الافتتاح الفوري</h4>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                سيُتاح المتجر للطلب العام فور إتمام مراجعة المعايير بنجاح وتجهيز التشكيلة.
              </p>
            </div>
          </div>

          {/* Action Row - Ultra Professional & Primary Colors */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-3.5">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-full bg-[#004ad7] hover:bg-[#003db3] border border-[#3b82f6]/40 text-white px-7 py-3.5 text-xs sm:text-sm font-bold tracking-wide transition-all shadow-[0_4px_24px_rgba(0,74,215,0.4)] active:scale-95 cursor-pointer"
            >
              <MessageCircle className="h-4 w-4" />
              <span>تواصل مع الكونسيرج (WhatsApp VIP)</span>
            </a>

            <button
              type="button"
              onClick={() => setShowAdminModal(true)}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] hover:bg-white/10 text-zinc-300 hover:text-white px-6 py-3.5 text-xs sm:text-sm font-semibold transition-all active:scale-95 cursor-pointer backdrop-blur-md"
            >
              <KeyRound className="h-4 w-4 text-[#60a5fa]" />
              <span>دخول الإدارة / Staff Bypass</span>
            </button>
          </div>
        </motion.div>
      </main>

      {/* Footer Meta */}
      <footer className="relative z-10 w-full flex flex-col sm:flex-row items-center justify-between border-t border-white/10 pt-6 gap-3 text-xs text-white/40 font-mono">
        <div>MAISON VANT © 2026 · ALL RIGHTS RESERVED</div>
        <div className="flex items-center gap-4">
          <span>HAUTE COUTURE ARCHIVE</span>
          <span>•</span>
          <span>PRIVATE ATELIER DISPATCH</span>
        </div>
      </footer>

      {/* Staff Pin Bypass Modal (Strictly Primary Noir & Cobalt Blue) */}
      <AnimatePresence>
        {showAdminModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-3xl border border-white/15 bg-[#0e121b] p-6 sm:p-8 text-white shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-[#004ad7]/20 border border-[#004ad7]/40 flex items-center justify-center text-[#60a5fa]">
                    <ShieldCheck className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">Staff Admin Bypass</h3>
                    <p className="text-[10px] text-zinc-400 font-mono">AUTHORIZED PERSONNEL ONLY</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminModal(false);
                    setPinError(false);
                    setPinInput('');
                  }}
                  className="text-zinc-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed" dir="rtl">
                أدخل رمز PIN الخاص بالإدارة لتجاوز شاشة الصيانة وفتح لوحة الإدارة والمتجر.
              </p>

              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <input
                  type="password"
                  inputMode="numeric"
                  placeholder="PIN (Default: 1234)"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(false);
                  }}
                  className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-center font-mono text-lg tracking-[0.35em] text-white placeholder:text-white/20 placeholder:tracking-normal placeholder:text-xs outline-none focus:border-[#004ad7] focus:ring-1 focus:ring-[#004ad7] transition-all"
                  autoFocus
                />

                {pinError && (
                  <p className="text-center text-xs font-semibold text-rose-400" dir="rtl">
                    رمز PIN غير صحيح. يرجى المحاولة مرة أخرى.
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#004ad7] hover:bg-[#003db3] border border-[#3b82f6]/40 py-3 text-xs font-bold text-white transition-all active:scale-95 cursor-pointer shadow-md shadow-[#004ad7]/30"
                >
                  <span>فتح المتجر والمتابعة</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
