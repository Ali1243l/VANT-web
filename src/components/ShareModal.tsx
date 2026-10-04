import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, MessageCircle, Send, Share2 } from 'lucide-react';
import type { Product, Language } from '../types';
import { formatPrice } from '../lib/supabase';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  lang: Language;
}

export default function ShareModal({ isOpen, onClose, product, lang }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const isAr = lang === 'ar';

  if (!isOpen || !product) return null;

  const displayTitle = isAr && product.title_ar ? product.title_ar : product.title;
  const priceFormatted = formatPrice(product.price, lang);

  // Construct clean direct item URL
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}?item=${product.id}`
    : `https://vant-fashion.com?item=${product.id}`;

  const shareText = isAr
    ? `ڤانت — ${displayTitle} (${priceFormatted})\n${shareUrl}`
    : `VANT — ${displayTitle} (${priceFormatted})\n${shareUrl}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = shareUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleWhatsAppShare = () => {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleTelegramShare = () => {
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(tgUrl, '_blank', 'noopener,noreferrer');
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `VANT — ${displayTitle}`,
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // Canceled
      }
    } else {
      handleCopyLink();
    }
  };

  const hasNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-60 flex items-center justify-center p-3">
        {/* Subtle Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-2xs"
        />

        {/* Minimalist, Compact Share Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ type: 'spring', damping: 28, stiffness: 400 }}
          role="dialog"
          aria-modal="true"
          className="relative z-10 w-full max-w-[315px] sm:max-w-[335px] rounded-2xl border border-black/10 dark:border-white/15 bg-white dark:bg-[#181b22] p-3.5 sm:p-4 shadow-xl text-[#15171c] dark:text-[#f3f4f6]"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/10">
            <span className="text-xs font-semibold text-[#15171c] dark:text-white">
              {isAr ? 'نسخ ومشاركة الرابط' : 'Copy & Share Link'}
            </span>

            <button
              type="button"
              onClick={onClose}
              className="flex h-6 w-6 items-center justify-center rounded-full text-[#6b7280] dark:text-[#9ca3af] hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
              aria-label={isAr ? 'إغلاق' : 'Close'}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Simple Standard Copy-Link Box */}
          <div className="mt-3 flex items-center gap-1.5 rounded-xl border border-black/10 dark:border-white/15 bg-black/[0.03] dark:bg-white/[0.04] p-1.5">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-transparent px-2 text-xs text-[#6b7280] dark:text-[#9ca3af] outline-none select-all truncate"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className={`flex shrink-0 items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 cursor-pointer ${
                copied
                  ? 'bg-[#004ad7] dark:bg-[#3b82f6] text-white shadow-2xs'
                  : 'bg-[#15171c] dark:bg-white text-white dark:text-[#15171c] hover:opacity-90'
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>{isAr ? 'تم النسخ!' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>{isAr ? 'نسخ' : 'Copy'}</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Share Actions */}
          <div className="mt-2.5 flex items-center gap-1.5">
            {/* WhatsApp */}
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-black/8 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] hover:bg-[#25D366]/10 hover:border-[#25D366]/30 hover:text-[#128C7E] dark:hover:text-[#25D366] py-1.5 text-[11px] font-medium transition-colors cursor-pointer"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>{isAr ? 'واتساب' : 'WhatsApp'}</span>
            </button>

            {/* Native Share or Telegram */}
            {hasNativeShare ? (
              <button
                type="button"
                onClick={handleNativeShare}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-black/8 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] hover:bg-[#004ad7]/10 hover:border-[#004ad7]/30 hover:text-[#004ad7] dark:hover:text-[#3b82f6] py-1.5 text-[11px] font-medium transition-colors cursor-pointer"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>{isAr ? 'تطبيقات أخرى' : 'More Apps'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleTelegramShare}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-black/8 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] hover:bg-[#0088cc]/10 hover:border-[#0088cc]/30 hover:text-[#0088cc] dark:hover:text-[#38a9e6] py-1.5 text-[11px] font-medium transition-colors cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{isAr ? 'تليغرام' : 'Telegram'}</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
