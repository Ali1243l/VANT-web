import React, { useState, useMemo } from 'react';
import {
  Tag,
  Percent,
  Sparkles,
  Check,
  Search,
  Sliders,
  RotateCcw,
  Zap,
  TrendingDown,
  Layers,
  ArrowUpRight,
  Filter,
  Save,
  AlertCircle,
  Copy,
  CheckCheck,
} from 'lucide-react';
import { useSiteControls } from '../context/SiteControlsContext';
import type { Product } from '../types';

interface Props {
  isAr: boolean;
  onNavigateToStoreOffers?: () => void;
}

export default function AdminOffersManager({ isAr, onNavigateToStoreOffers }: Props) {
  const {
    products,
    updateProduct,
    formatPrice,
    siteSettings,
    updateSiteSettings,
  } = useSiteControls();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [filterMode, setFilterMode] = useState<'all' | 'offers_only' | 'regular_only'>('all');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Bulk discount states
  const [bulkPct, setBulkPct] = useState<number>(20);
  const [bulkScope, setBulkScope] = useState<'all' | string>('all');
  const [isApplyingBulk, setIsApplyingBulk] = useState(false);

  // Banner settings form states
  const [bannerTitleAr, setBannerTitleAr] = useState(
    siteSettings.offers_banner_title_ar || 'قائمة العروض والخصومات الحصرية'
  );
  const [bannerTitleEn, setBannerTitleEn] = useState(
    siteSettings.offers_banner_title_en || 'Exclusive Offers & Private Archive Allocations'
  );
  const [promoCode, setPromoCode] = useState(
    siteSettings.offers_promo_code || 'VANT-OFFERS-20'
  );
  const [isSavingBanner, setIsSavingBanner] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Distinct categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  // Offers metrics
  const offerProducts = useMemo(() => products.filter((p) => p.is_offer), [products]);
  const totalOffersCount = offerProducts.length;

  const averageDiscountPct = useMemo(() => {
    const discounted = offerProducts.filter(
      (p) => p.original_price && p.original_price > p.price
    );
    if (discounted.length === 0) return 0;
    const sum = discounted.reduce((acc, p) => {
      const pct = ((p.original_price! - p.price) / p.original_price!) * 100;
      return acc + pct;
    }, 0);
    return Math.round(sum / discounted.length);
  }, [offerProducts]);

  const maxDiscountPct = useMemo(() => {
    let max = 0;
    offerProducts.forEach((p) => {
      if (p.original_price && p.original_price > p.price) {
        const pct = Math.round(((p.original_price - p.price) / p.original_price) * 100);
        if (pct > max) max = pct;
      }
    });
    return max;
  }, [offerProducts]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // 1. Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const titleMatch = (p.title || '').toLowerCase().includes(q);
        const titleArMatch = (p.title_ar || '').toLowerCase().includes(q);
        const catMatch = (p.category || '').toLowerCase().includes(q);
        const catArMatch = (p.category_ar || '').toLowerCase().includes(q);
        if (!titleMatch && !titleArMatch && !catMatch && !catArMatch) return false;
      }

      // 2. Category filter
      if (selectedCategory !== 'ALL' && p.category !== selectedCategory) {
        return false;
      }

      // 3. Offer status filter
      if (filterMode === 'offers_only' && !p.is_offer) return false;
      if (filterMode === 'regular_only' && p.is_offer) return false;

      return true;
    });
  }, [products, searchQuery, selectedCategory, filterMode]);

  // Toggle single product offer status
  const handleToggleOffer = (product: Product) => {
    const nextOfferState = !product.is_offer;
    const numPrice = Number(product.price) || 0;
    
    // Automatically set original_price if turning on and not set
    let originalPrice = product.original_price;
    if (nextOfferState && (!originalPrice || originalPrice <= numPrice)) {
      originalPrice = Math.round(numPrice * 1.25);
    }

    updateProduct(product.id, {
      is_offer: nextOfferState,
      original_price: originalPrice,
      offer_badge_ar: nextOfferState ? 'عرض خاص' : undefined,
      offer_badge_en: nextOfferState ? 'Special Offer' : undefined,
    });

    setFeedbackMsg({
      type: 'success',
      text: isAr
        ? `تم ${nextOfferState ? 'تفعيل العرض لقطعة' : 'إلغاء العرض عن'} (${product.title_ar || product.title})`
        : `${nextOfferState ? 'Activated offer for' : 'Removed offer from'} (${product.title})`,
    });
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  // Quick preset discount application to a single product
  const handleApplySingleDiscount = (product: Product, discountPercentage: number) => {
    const basePrice = product.original_price && product.original_price > product.price
      ? product.original_price
      : product.price;

    const newSalePrice = Math.round(basePrice * (1 - discountPercentage / 100));

    updateProduct(product.id, {
      is_offer: true,
      original_price: basePrice,
      price: newSalePrice,
      offer_badge_ar: `خصم ${discountPercentage}%`,
      offer_badge_en: `${discountPercentage}% OFF`,
    });

    setFeedbackMsg({
      type: 'success',
      text: isAr
        ? `تم تطبيق خصم ${discountPercentage}% على (${product.title_ar || product.title}) بنجاح!`
        : `Applied ${discountPercentage}% discount to (${product.title})!`,
    });
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  // Bulk Apply Discount
  const handleApplyBulkDiscount = async () => {
    if (bulkPct <= 0 || bulkPct > 90) {
      alert(isAr ? 'يرجى إدخال نسبة خصم صحيحة بين 1% و 90%' : 'Please enter valid discount between 1% and 90%');
      return;
    }

    const targetProducts = bulkScope === 'all'
      ? products
      : products.filter((p) => p.category === bulkScope);

    if (targetProducts.length === 0) {
      alert(isAr ? 'لا توجد قطع مطابقة لتطبيق الخصم عليها' : 'No matching pieces found');
      return;
    }

    const confirmMsg = isAr
      ? `هل أنت متأكد من تطبيق خصم ${bulkPct}% على (${targetProducts.length}) قطعة؟ سيتم حفظ السعر الأصلي وتحديث سعر العرض تلقائياً.`
      : `Apply ${bulkPct}% discount across ${targetProducts.length} pieces? Original prices will be preserved.`;

    if (!window.confirm(confirmMsg)) return;

    setIsApplyingBulk(true);
    try {
      targetProducts.forEach((p) => {
        const basePrice = p.original_price && p.original_price > p.price ? p.original_price : p.price;
        const newPrice = Math.round(basePrice * (1 - bulkPct / 100));
        updateProduct(p.id, {
          is_offer: true,
          original_price: basePrice,
          price: newPrice,
          offer_badge_ar: `خصم ${bulkPct}%`,
          offer_badge_en: `${bulkPct}% OFF`,
        });
      });

      setFeedbackMsg({
        type: 'success',
        text: isAr
          ? `✓ تم تطبيق خصم ${bulkPct}% على (${targetProducts.length}) قطعة بنجاح!`
          : `✓ Applied ${bulkPct}% discount across ${targetProducts.length} pieces!`,
      });
      setTimeout(() => setFeedbackMsg(null), 4000);
    } finally {
      setIsApplyingBulk(false);
    }
  };

  // Bulk Clear All Offers
  const handleClearAllOffers = () => {
    const confirmMsg = isAr
      ? 'هل أنت متأكد من إيقاف وإلغاء كافة العروض في المتجر؟ ستعود كافة القطع لحالتها الطبيعية.'
      : 'Reset all active offers? Pieces will return to regular catalog pricing.';

    if (!window.confirm(confirmMsg)) return;

    products.forEach((p) => {
      if (p.is_offer) {
        updateProduct(p.id, {
          is_offer: false,
          price: p.original_price && p.original_price > p.price ? p.original_price : p.price,
          original_price: undefined,
          offer_badge_ar: undefined,
          offer_badge_en: undefined,
        });
      }
    });

    setFeedbackMsg({
      type: 'success',
      text: isAr ? '✓ تم إيقاف وإعادة ضبط كافة العروض بنجاح' : '✓ All offers reset successfully',
    });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  // Save Banner Settings
  const handleSaveBannerSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBanner(true);
    try {
      await updateSiteSettings({
        offers_banner_title_ar: bannerTitleAr.trim(),
        offers_banner_title_en: bannerTitleEn.trim(),
        offers_promo_code: promoCode.trim().toUpperCase(),
      });
      setFeedbackMsg({
        type: 'success',
        text: isAr ? '✓ تم حفظ وتحديث إعدادات وبنر العروض سحابياً بنجاح!' : '✓ Offers banner settings saved to cloud!',
      });
      setTimeout(() => setFeedbackMsg(null), 3500);
    } finally {
      setIsSavingBanner(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(promoCode.trim().toUpperCase());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-[#004ad7] to-[#3b82f6] flex items-center justify-center text-white shadow-lg shadow-[#004ad7]/25">
              <Percent className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>{isAr ? 'التحكم المركزي بالعروض والخصومات' : 'Offers & Discounts Control Center'}</span>
                <span className="rounded-full bg-[#004ad7]/20 border border-[#3b82f6]/40 px-2.5 py-0.5 text-[11px] font-mono font-bold text-[#60a5fa]">
                  {totalOffersCount} {isAr ? 'قطعة مخفضة' : 'on sale'}
                </span>
              </h2>
              <p className="text-xs text-white/60 mt-0.5">
                {isAr
                  ? 'إدارة جذرية لأسعار العروض، تطبيق الخصومات الجماعية، والتحكم ببنر واجهة المتجر بنظام الألوان المعتمد'
                  : 'Radical control over special pricing, bulk discounts, and storefront promotion banners'}
              </p>
            </div>
          </div>
        </div>

        {onNavigateToStoreOffers && (
          <button
            type="button"
            onClick={onNavigateToStoreOffers}
            className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 px-4 py-2 text-xs font-semibold text-white transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
          >
            <span>{isAr ? 'معاينة العروض في المتجر' : 'Preview Storefront Offers'}</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-[#3b82f6]" />
          </button>
        )}
      </div>

      {/* Floating Notification */}
      {feedbackMsg && (
        <div
          className={`flex items-center gap-2.5 rounded-2xl p-4 text-xs font-semibold transition-all shadow-xl animate-fade-in ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/15 border border-red-500/30 text-red-300'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <Check className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* 1. Real-time Metric Cards (Brand Blue / Neutral Aesthetic - NO RED) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Offers */}
        <div className="rounded-2xl border border-white/10 bg-[#12151e]/80 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white/60">{isAr ? 'القطع في العرض' : 'Active Offers'}</span>
            <Tag className="h-4 w-4 text-[#3b82f6]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">{totalOffersCount}</span>
            <span className="text-[11px] text-white/40">/ {products.length} {isAr ? 'إجمالي' : 'total'}</span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#004ad7] to-[#3b82f6] rounded-full transition-all duration-500"
              style={{ width: `${products.length > 0 ? (totalOffersCount / products.length) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Average Discount % */}
        <div className="rounded-2xl border border-white/10 bg-[#12151e]/80 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white/60">{isAr ? 'متوسط نسبة الخصم' : 'Avg Discount'}</span>
            <TrendingDown className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400 font-mono">
              {averageDiscountPct > 0 ? `${averageDiscountPct}%` : '—'}
            </span>
            <span className="text-[11px] text-white/40">{isAr ? 'لكل قطعة' : 'per piece'}</span>
          </div>
          <p className="mt-2 text-[10px] text-white/50">
            {isAr ? 'محسوب تلقائياً من الفارق بين السعرين' : 'Auto-computed from price delta'}
          </p>
        </div>

        {/* Max Discount % */}
        <div className="rounded-2xl border border-white/10 bg-[#12151e]/80 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white/60">{isAr ? 'أعلى نسبة تخفيض' : 'Max Discount'}</span>
            <Zap className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-300 font-mono">
              {maxDiscountPct > 0 ? `${maxDiscountPct}%` : '—'}
            </span>
            <span className="text-[11px] text-white/40">{isAr ? 'أعلى توفير' : 'highest savings'}</span>
          </div>
          <p className="mt-2 text-[10px] text-white/50">
            {isAr ? 'أكبر تخفيض معروض للعملاء' : 'Peak discount currently live'}
          </p>
        </div>

        {/* Promo Voucher */}
        <div className="rounded-2xl border border-white/10 bg-[#12151e]/80 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white/60">{isAr ? 'كود الخصم الترويجي' : 'Live Promo Code'}</span>
            <button
              type="button"
              onClick={handleCopyCode}
              className="text-[#60a5fa] hover:text-white p-0.5 rounded cursor-pointer transition-colors"
              title={isAr ? 'نسخ الكود' : 'Copy Code'}
            >
              {copiedCode ? <CheckCheck className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm font-black font-mono tracking-wider text-[#60a5fa] bg-[#004ad7]/20 border border-[#3b82f6]/40 px-2 py-0.5 rounded-lg">
              {promoCode}
            </span>
          </div>
          <p className="mt-2 text-[10px] text-white/50">
            {isAr ? 'سارٍ على بنر العروض والروابط' : 'Linked to active banner'}
          </p>
        </div>
      </div>

      {/* 2. Bulk Root Actions Card (إجراءات جذرية بنقرة واحدة) */}
      <div className="rounded-3xl border border-[#004ad7]/30 bg-gradient-to-b from-[#004ad7]/[0.09] via-black/40 to-black/60 p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-[#004ad7]/30 border border-[#3b82f6]/50 flex items-center justify-center text-[#60a5fa]">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {isAr ? 'الإجراءات الجذرية والسريعة (تطبيق الخصم الجماعي)' : 'Bulk Discounts & Root Actions'}
              </h3>
              <p className="text-xs text-white/60">
                {isAr
                  ? 'طبق نسبة خصم موحدة بنقرة واحدة على تصنيف كامل أو على كافة قطع المتجر'
                  : 'Instantly compute and apply unified discount % across an entire category or lookbook'}
              </p>
            </div>
          </div>

          {totalOffersCount > 0 && (
            <button
              type="button"
              onClick={handleClearAllOffers}
              className="rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white/80 hover:text-white transition-all cursor-pointer self-start sm:self-auto"
            >
              {isAr ? 'إيقاف وإلغاء كافة العروض' : 'Reset All Offers'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end pt-1">
          {/* Scope Selection */}
          <div className="sm:col-span-4">
            <label className="block text-[11px] font-bold text-white/70 mb-1.5">
              {isAr ? 'نطاق التطبيق (القسم أو التشكيلة):' : 'Application Scope:'}
            </label>
            <select
              value={bulkScope}
              onChange={(e) => setBulkScope(e.target.value)}
              className="h-10 w-full rounded-xl border border-white/15 bg-black/70 px-3 text-xs text-white outline-none focus:border-[#3b82f6] cursor-pointer"
            >
              <option value="all">{isAr ? 'كافة القطع بالمتجر بالكامل' : 'All Products in Store'}</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {isAr ? `قسم: ${c}` : `Category: ${c}`}
                </option>
              ))}
            </select>
          </div>

          {/* Preset Buttons */}
          <div className="sm:col-span-5">
            <label className="block text-[11px] font-bold text-white/70 mb-1.5">
              {isAr ? 'اختر أو حدد نسبة الخصم %:' : 'Select Discount %:'}
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[10, 15, 20, 25, 30, 40].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setBulkPct(pct)}
                  className={`rounded-xl px-2.5 py-2 text-xs font-mono font-bold transition-all cursor-pointer ${
                    bulkPct === pct
                      ? 'bg-[#004ad7] text-white shadow-md shadow-[#004ad7]/30 ring-1 ring-[#3b82f6]'
                      : 'border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {pct}%
                </button>
              ))}
              <div className="flex items-center gap-1 bg-black/60 border border-white/15 rounded-xl px-2 h-9">
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={bulkPct}
                  onChange={(e) => setBulkPct(Number(e.target.value))}
                  className="w-10 text-xs font-mono font-bold text-white bg-transparent outline-none text-center"
                />
                <span className="text-[10px] text-white/50 font-bold">%</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="sm:col-span-3">
            <button
              type="button"
              disabled={isApplyingBulk}
              onClick={handleApplyBulkDiscount}
              className="h-10 w-full rounded-xl bg-gradient-to-r from-[#004ad7] to-[#2563eb] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-[#004ad7]/25 hover:opacity-95 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <Zap className="h-4 w-4" />
              <span>{isAr ? `تطبيق خصم ${bulkPct}% الآن` : `Apply ${bulkPct}% Now`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Storefront Banner Settings Card */}
      <form
        onSubmit={handleSaveBannerSettings}
        className="rounded-3xl border border-white/10 bg-[#11141c]/90 p-5 sm:p-6 shadow-xl space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-[#3b82f6]" />
            <h3 className="text-sm font-bold text-white">
              {isAr ? 'التحكم ببنر وكود الخصم في واجهة المتجر' : 'Storefront Offers Banner & Promo Settings'}
            </h3>
          </div>
          <span className="text-[11px] text-white/50">
            {isAr ? 'ينعكس فوراً على واجهة المتجر وبنر العروض' : 'Instantly reflected on store lookbook'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Banner Title AR */}
          <div>
            <label className="block text-[11px] font-bold text-white/70 mb-1">
              {isAr ? 'عنوان بنر العروض (عربي):' : 'Banner Headline (Arabic):'}
            </label>
            <input
              type="text"
              value={bannerTitleAr}
              onChange={(e) => setBannerTitleAr(e.target.value)}
              className="h-10 w-full rounded-xl border border-white/15 bg-black/60 px-3 text-xs text-white outline-none focus:border-[#3b82f6]"
              placeholder="قائمة العروض والخصومات الحصرية"
            />
          </div>

          {/* Banner Title EN */}
          <div>
            <label className="block text-[11px] font-bold text-white/70 mb-1">
              {isAr ? 'عنوان بنر العروض (إنجليزي):' : 'Banner Headline (English):'}
            </label>
            <input
              type="text"
              value={bannerTitleEn}
              onChange={(e) => setBannerTitleEn(e.target.value)}
              className="h-10 w-full rounded-xl border border-white/15 bg-black/60 px-3 text-xs text-white outline-none focus:border-[#3b82f6]"
              placeholder="Exclusive Offers & Private Archive Allocations"
            />
          </div>

          {/* Promo Code */}
          <div>
            <label className="block text-[11px] font-bold text-white/70 mb-1">
              {isAr ? 'كود الخصم المعتمد بالعروض:' : 'Active Promo Code:'}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                className="h-10 w-full rounded-xl border border-white/15 bg-black/60 px-3 text-xs font-mono font-bold text-[#60a5fa] outline-none focus:border-[#3b82f6]"
                placeholder="VANT-OFFERS-20"
              />
              <button
                type="submit"
                disabled={isSavingBanner}
                className="h-10 shrink-0 px-4 rounded-xl bg-[#004ad7] hover:bg-[#004ad7]/90 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{isAr ? 'حفظ' : 'Save'}</span>
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* 4. Product-by-Product Live Table & Quick Controls */}
      <div className="rounded-3xl border border-white/10 bg-[#11141c]/90 p-5 sm:p-6 shadow-xl space-y-4">
        {/* Table Filters Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-[#3b82f6]" />
            <h3 className="text-sm font-bold text-white">
              {isAr ? 'التحكم بالقطع والخصومات الفردية' : 'Piece-by-Piece Offer Management'}
            </h3>
            <span className="text-xs text-white/50 font-mono">({filteredProducts.length})</span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`rounded-xl px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-white text-black font-bold'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              {isAr ? 'كافة القطع' : 'All'}
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('offers_only')}
              className={`rounded-xl px-3 py-1 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                filterMode === 'offers_only'
                  ? 'bg-[#004ad7] text-white font-bold shadow-md shadow-[#004ad7]/25'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              <Tag className="h-3 w-3" />
              <span>{isAr ? `في العرض (${totalOffersCount})` : `On Sale (${totalOffersCount})`}</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('regular_only')}
              className={`rounded-xl px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
                filterMode === 'regular_only'
                  ? 'bg-white text-black font-bold'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              {isAr ? 'بدون عرض' : 'Regular'}
            </button>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative flex items-center">
            <Search className="pointer-events-none absolute ltr:left-3 rtl:right-3 h-4 w-4 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'ابحث بالاسم أو التصنيف...' : 'Search piece by title or category...'}
              className="h-10 w-full rounded-xl border border-white/15 bg-black/50 px-9 text-xs text-white placeholder:text-white/40 outline-none focus:border-[#3b82f6]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                selectedCategory === 'ALL'
                  ? 'bg-[#004ad7] text-white font-bold'
                  : 'bg-white/5 text-white/60 hover:text-white'
              }`}
            >
              {isAr ? 'كافة الأقسام' : 'All Categories'}
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#004ad7] text-white font-bold'
                    : 'bg-white/5 text-white/60 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products List / Grid */}
        <div className="space-y-2.5 pt-2 max-h-[600px] overflow-y-auto pr-1">
          {filteredProducts.length === 0 ? (
            <div className="py-12 text-center text-white/40 text-xs">
              {isAr ? 'لا توجد قطع مطابقة للبحث أو التصفية الحالية' : 'No matching pieces found'}
            </div>
          ) : (
            filteredProducts.map((p) => {
              const numPrice = Number(p.price) || 0;
              const originalPrice = p.original_price;
              const hasDiscount = Boolean(p.is_offer && originalPrice && originalPrice > numPrice);
              const discountPct = hasDiscount
                ? Math.round(((originalPrice! - numPrice) / originalPrice!) * 100)
                : 0;

              return (
                <div
                  key={p.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border transition-all ${
                    p.is_offer
                      ? 'border-[#004ad7]/40 bg-[#004ad7]/[0.06]'
                      : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]'
                  }`}
                >
                  {/* Left: Product Thumbnail + Title + Current Status */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative h-14 w-14 rounded-xl overflow-hidden border border-white/10 bg-black/40 shrink-0">
                      <img
                        src={p.image_url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                      {p.is_offer && (
                        <span className="absolute top-1 ltr:left-1 rtl:right-1 h-2 w-2 rounded-full bg-[#3b82f6] shadow-sm shadow-[#3b82f6]" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white truncate max-w-[200px] sm:max-w-xs">
                          {isAr && p.title_ar ? p.title_ar : p.title}
                        </span>
                        {p.is_offer && (
                          <span className="rounded-full bg-[#004ad7]/20 border border-[#3b82f6]/40 px-2 py-0.2 text-[9px] font-bold text-[#60a5fa]">
                            {hasDiscount ? `-${discountPct}%` : (isAr ? 'عرض' : 'Offer')}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-[11px] text-white/50">
                        <span>{p.category}</span>
                        <span>•</span>
                        <span className="font-mono text-white/80 font-bold">{formatPrice(numPrice)}</span>
                        {hasDiscount && (
                          <span className="line-through text-white/40 font-mono text-[10px]">
                            {formatPrice(originalPrice!)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Quick Action Controls */}
                  <div className="flex items-center gap-2 shrink-0 flex-wrap self-end sm:self-auto">
                    {/* Fast Presets */}
                    <div className="flex items-center gap-1">
                      {[15, 20, 30].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => handleApplySingleDiscount(p, pct)}
                          className="rounded-lg border border-white/10 bg-white/5 hover:bg-[#004ad7] hover:border-[#3b82f6] px-2 py-1 text-[10.5px] font-mono font-bold text-white/70 hover:text-white transition-all cursor-pointer"
                          title={isAr ? `تطبيق خصم ${pct}%` : `Apply -${pct}%`}
                        >
                          -{pct}%
                        </button>
                      ))}
                    </div>

                    {/* Master Offer Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => handleToggleOffer(p)}
                      className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                        p.is_offer
                          ? 'bg-[#004ad7] text-white shadow-md shadow-[#004ad7]/30 ring-1 ring-[#3b82f6]'
                          : 'border border-white/20 bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Tag className="h-3 w-3" />
                      <span>{p.is_offer ? (isAr ? 'في العرض ✓' : 'On Sale ✓') : (isAr ? 'تفعيل العرض' : 'Set as Offer')}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
