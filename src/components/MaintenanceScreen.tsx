import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, MessageCircle, ArrowRight, Lock, KeyRound } from 'lucide-react';
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
  maintenanceMessage = 'We are preparing Volume 02. Please check back later.',
  maintenanceMessageAr = 'نعمل حالياً على تجهيز التشكيلة الجديدة وتحديث النظام. يرجى العودة لاحقاً.',
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
    'مرحباً ڤانت، أود الاستفسار أثناء فترة تحديث المتجر.'
  )}`;

  return (
    <div className={`min-h-screen w-full bg-[#0a0a0c] text-white flex flex-col justify-between p-6 sm:p-10 select-none ${
      isPreview ? 'fixed inset-0 z-[9999] overflow-y-auto' : 'relative overflow-hidden'
    }`}>
      {/* Background Subtle Grid Texture & Ambient Radial Spotlight */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f232b15_1px,transparent_1px),linear-gradient(to_bottom,#1f232b15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,74,215,0.08),transparent_70%)] blur-3xl pointer-events-none" />

      {/* Floating Preview Banner */}
      {isPreview && (
        <div className="relative z-30 mb-4 -mt-2 -mx-2 sm:-mx-6 rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/20 via-black/80 to-amber-500/20 p-3 flex flex-wrap items-center justify-between gap-3 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
            <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span>معاينة شاشة الصيانة المباشرة (Live Maintenance Preview Mode)</span>
          </div>

          <button
            type="button"
            onClick={onClosePreview}
            className="rounded-xl bg-amber-500 hover:bg-amber-400 text-black px-4 py-1.5 font-bold text-xs cursor-pointer transition-all active:scale-95 shadow-md"
          >
            ✕ إغلاق المعاينة والعودة للوحة التحكم
          </button>
        </div>
      )}

      {/* Header Bar */}
      <header className="relative z-10 w-full flex items-center justify-between border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <span className="font-extrabold text-xl sm:text-2xl tracking-[0.25em] text-white pl-[0.25em]">
            VANT
          </span>
          <span className="text-white/30 font-mono text-xs">• PARIS / BAGHDAD</span>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-mono text-amber-400">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          <span>STATUS: UPGRADING</span>
        </div>
      </header>

      {/* Main Neo-Brutalist Offline Statement */}
      <main className="relative z-10 my-auto py-12 max-w-4xl mx-auto text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-mono tracking-widest text-white/70 uppercase">
            <Lock className="h-3.5 w-3.5 text-[#3b82f6]" />
            <span>EXCLUSIVE DROP MAINTENANCE</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight uppercase leading-tight">
            SYSTEM <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40">OFFLINE</span>
          </h1>

          <h2 dir="rtl" className="text-2xl sm:text-4xl font-bold text-white/90">
            المتجر قيد التحديث والاستعداد
          </h2>

          <div className="pt-4 max-w-2xl mx-auto space-y-3">
            <p className="text-sm sm:text-base text-white/70 font-light leading-relaxed">
              {maintenanceMessage}
            </p>
            <p dir="rtl" className="text-sm sm:text-base text-white/60 leading-relaxed font-medium">
              {maintenanceMessageAr}
            </p>
          </div>

          {/* Action Row */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#004ad7] hover:bg-[#003db3] text-white px-6 py-3 text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-[0_4px_20px_rgba(0,74,215,0.35)] active:scale-95 cursor-pointer"
            >
              <MessageCircle className="h-4 w-4" />
              <span>تواصل مع خدمة العملاء (WhatsApp)</span>
            </a>

            <button
              type="button"
              onClick={() => setShowAdminModal(true)}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white px-6 py-3 text-xs sm:text-sm font-semibold transition-all active:scale-95 cursor-pointer"
            >
              <KeyRound className="h-4 w-4" />
              <span>دخول المشرفين / Staff Bypass</span>
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
          <span>ENCRYPTED TELEMETRY</span>
        </div>
      </footer>

      {/* Staff Pin Bypass Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm rounded-3xl border border-white/15 bg-[#14171f] p-6 sm:p-8 text-white shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#3b82f6]" />
                <h3 className="font-bold text-sm">Staff Admin Bypass</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAdminModal(false);
                  setPinError(false);
                  setPinInput('');
                }}
                className="text-white/40 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-white/60">
              أدخل رمز PIN الخاص بالإدارة لتجاوز شاشة الصيانة واستعراض المتجر بالكامل.
            </p>

            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <input
                type="password"
                inputMode="numeric"
                placeholder="Enter PIN (Default: 1234)"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 text-center font-mono text-lg tracking-[0.3em] text-white placeholder:text-white/20 placeholder:tracking-normal placeholder:text-xs outline-none focus:border-[#004ad7]"
                autoFocus
              />

              {pinError && (
                <p className="text-center text-xs font-semibold text-red-400">
                  رمز المرور غير صحيح. حاول مجدداً.
                </p>
              )}

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#004ad7] hover:bg-[#003db3] py-3 text-xs font-bold text-white transition-all active:scale-95 cursor-pointer shadow-md"
              >
                <span>فتح المتجر والمتابعة</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
