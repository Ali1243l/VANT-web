import React, { useState, useEffect, useMemo } from 'react';
import {
  Tag,
  Percent,
  Sparkles,
  Check,
  X,
  Plus,
  AlertTriangle,
  TrendingDown,
  Layers,
  ShieldCheck,
  Search,
  Flame,
  Zap,
  ShoppingBag,
  Coins,
  Sliders,
  RotateCcw,
  Package,
} from 'lucide-react';
import { Product, Offer } from './useAdminBridge';
import { formatCurrency, toEnglishDigits } from './format';
import { Modal, Button, Input } from './ui';

interface ProductOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  products?: Product[];
  offers: Offer[];
  onApplyOffer: (
    productId: string,
    updates: {
      isOnOffer: boolean;
      salePrice?: number;
      offerCampaign?: string;
      offerBadgeText?: string;
      discountPercent?: number;
    },
    applyToAllInCategory?: boolean
  ) => void;
  onRemoveOffer: (productId: string, removeFromAllInCategory?: boolean) => void;
  onAddNewOfferCampaign: (campaign: Omit<Offer, 'id' | 'usedCount'>) => void;
  isAr: boolean;
}

export const ProductOfferModal: React.FC<ProductOfferModalProps> = ({
  isOpen,
  onClose,
  product,
  products = [],
  offers,
  onApplyOffer,
  onRemoveOffer,
  onAddNewOfferCampaign,
  isAr,
}) => {
  // Hooks must ALWAYS be called unconditionally at the top of the component
  const [activeTab, setActiveTab] = useState<'custom' | 'campaign'>('custom');

  // Custom Offer Form State
  const [discountPercent, setDiscountPercent] = useState<number>(15);
  const [customSalePrice, setCustomSalePrice] = useState<string>('');
  const [customBadgeText, setCustomBadgeText] = useState<string>('');
  const [pricingMode, setPricingMode] = useState<'percent' | 'fixedPrice'>('percent');

  // Category Bulk Apply Convenience
  const [applyToCategory, setApplyToCategory] = useState<boolean>(false);

  // Campaign List Selection State
  const [selectedOfferId, setSelectedOfferId] = useState<string>('');
  const [campaignSearch, setCampaignSearch] = useState<string>('');
  const [showCreateCampaignForm, setShowCreateCampaignForm] = useState<boolean>(false);
  const [newCampaignTitle, setNewCampaignTitle] = useState<string>('');
  const [newCampaignCode, setNewCampaignCode] = useState<string>('');
  const [newCampaignPercent, setNewCampaignPercent] = useState<number>(20);

  // Initialize or reset when product opens
  useEffect(() => {
    if (product) {
      if (product.offerCampaign) {
        // If product already has a campaign assigned, set to campaign tab
        const matched = offers.find(
          (o) => o.title === product.offerCampaign || o.titleEn === product.offerCampaign
        );
        if (matched) {
          setSelectedOfferId(matched.id);
        }
        setActiveTab('campaign');
      } else if (product.salePrice) {
        setActiveTab('custom');
        const calculatedPct = Math.round(
          ((product.price - product.salePrice) / product.price) * 100
        );
        if (calculatedPct > 0) {
          setDiscountPercent(calculatedPct);
        }
        setCustomSalePrice(product.salePrice.toString());
      } else {
        setActiveTab('custom');
        setDiscountPercent(15);
        setCustomSalePrice('');
      }

      setCustomBadgeText(product.offerBadgeText || '');
      setShowCreateCampaignForm(false);
      setApplyToCategory(false);
      setCampaignSearch('');
    }
  }, [product, offers]);

  // Safe guard: Do not render modal if not open or product is missing
  if (!isOpen || !product) return null;

  const originalPrice = product.price || 0;

  // Calculate prices for Custom Offer safely
  const calculatedCustomPrice =
    pricingMode === 'percent'
      ? Math.max(0, Math.round((originalPrice * (1 - discountPercent / 100)) / 250) * 250)
      : parseFloat(customSalePrice) || 0;

  const currentFinalSalePrice =
    pricingMode === 'percent'
      ? calculatedCustomPrice
      : parseFloat(customSalePrice) || calculatedCustomPrice;

  const customSavings = Math.max(0, originalPrice - currentFinalSalePrice);
  const actualSavingsPct =
    originalPrice > 0
      ? Math.max(0, Math.round(((originalPrice - currentFinalSalePrice) / originalPrice) * 100))
      : 0;

  // Count items in category
  const categoryProducts = products.filter((p) => p.category === product.category);
  const categoryCount = categoryProducts.length;

  // Active campaigns filtered by search
  const filteredCampaigns = offers.filter((o) => {
    if (o.status !== 'active') return false;
    if (!campaignSearch.trim()) return true;
    const q = campaignSearch.toLowerCase();
    return (
      o.title.toLowerCase().includes(q) ||
      (o.titleEn && o.titleEn.toLowerCase().includes(q)) ||
      o.code.toLowerCase().includes(q)
    );
  });

  // Ready-made badge templates for fast 1-click selection
  const badgePresets = [
    { label: isAr ? '🔥 عرض خاص' : '🔥 Special Offer', value: isAr ? 'عرض خاص' : 'Special Offer' },
    { label: isAr ? '⚡ صفقة اليوم' : '⚡ Deal of Day', value: isAr ? 'صفقة اليوم' : 'Deal of Day' },
    { label: isAr ? '❄️ تخفيضات الشتاء' : '❄️ Winter Sale', value: isAr ? 'تخفيضات الشتاء' : 'Winter Sale' },
    { label: isAr ? '💥 تصفية نهائية' : '💥 Clearance', value: isAr ? 'تصفية نهائية' : 'Clearance' },
    { label: isAr ? '⭐ الأكثر طلباً' : '⭐ Bestseller', value: isAr ? 'الأكثر طلباً' : 'Bestseller' },
    { label: isAr ? '🚚 شحن مجاني' : '🚚 Free Delivery', value: isAr ? 'شحن مجاني' : 'Free Delivery' },
    { label: isAr ? '🎁 وفر الآن' : '🎁 Save Now', value: isAr ? 'وفر الآن' : 'Save Now' },
  ];

  // Quick fixed IQD deduction buttons
  const fixedDeductionPresets = [5000, 10000, 15000, 25000, 50000];

  // Quick steppers
  const adjustPriceBy = (amount: number) => {
    setPricingMode('fixedPrice');
    const base = currentFinalSalePrice > 0 ? currentFinalSalePrice : originalPrice;
    const target = Math.max(500, Math.min(originalPrice - 500, base + amount));
    setCustomSalePrice(target.toString());
  };

  // Neat Iraqi Dinar rounding (nearest 500 or 1000 IQD)
  const roundToNearestDinar = (unit: 500 | 1000) => {
    setPricingMode('fixedPrice');
    const base = currentFinalSalePrice > 0 ? currentFinalSalePrice : originalPrice;
    const rounded = Math.round(base / unit) * unit;
    const safeRounded = Math.max(500, Math.min(originalPrice - 500, rounded));
    setCustomSalePrice(safeRounded.toString());
  };

  // Quick campaign templates for fast inline creation
  const quickCampaignTemplates = [
    { title: 'تخفيضات الشتاء الكبرى', code: 'WINTER25', pct: 20 },
    { title: 'عروض نهاية الأسبوع', code: 'WEEKEND15', pct: 15 },
    { title: 'تصفية الموسم', code: 'CLEARANCE35', pct: 35 },
    { title: 'صفقة حصرية للعملاء', code: 'VIPDEAL25', pct: 25 },
  ];

  // Handle applying custom offer
  const handleApplyCustomOffer = () => {
    if (!product) return;
    if (currentFinalSalePrice <= 0 || currentFinalSalePrice >= product.price) {
      return;
    }

    onApplyOffer(
      product.id,
      {
        isOnOffer: true,
        salePrice: currentFinalSalePrice,
        offerCampaign: undefined, // custom offer not bound to a campaign
        offerBadgeText:
          customBadgeText.trim() ||
          (isAr ? `خصم ${actualSavingsPct}%` : `${actualSavingsPct}% OFF`),
        discountPercent: actualSavingsPct,
      },
      applyToCategory
    );
    onClose();
  };

  // Handle applying campaign list offer
  const handleApplyCampaignOffer = () => {
    if (!product) return;
    const selectedOffer = offers.find((o) => o.id === selectedOfferId);
    if (!selectedOffer) return;

    let computedPrice = product.price;
    if (selectedOffer.discountType === 'percentage') {
      computedPrice = Math.round((product.price * (1 - selectedOffer.discountValue / 100)) / 250) * 250;
    } else {
      computedPrice = Math.max(0, product.price - selectedOffer.discountValue);
    }

    onApplyOffer(
      product.id,
      {
        isOnOffer: true,
        salePrice: computedPrice,
        offerCampaign: isAr ? selectedOffer.title : selectedOffer.titleEn || selectedOffer.title,
        offerBadgeText: isAr ? selectedOffer.title : selectedOffer.titleEn || selectedOffer.title,
        discountPercent: selectedOffer.discountType === 'percentage' ? selectedOffer.discountValue : undefined,
      },
      applyToCategory
    );
    onClose();
  };

  // Handle creating new campaign on the fly
  const handleCreateNewCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignTitle.trim() || !newCampaignCode.trim()) return;

    const newOffer: Omit<Offer, 'id' | 'usedCount'> = {
      title: newCampaignTitle.trim(),
      titleEn: newCampaignTitle.trim(),
      code: newCampaignCode.toUpperCase().trim(),
      discountType: 'percentage',
      discountValue: newCampaignPercent,
      status: 'active',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '2026-12-31',
    };

    onAddNewOfferCampaign(newOffer);
    setShowCreateCampaignForm(false);
    setNewCampaignTitle('');
    setNewCampaignCode('');
  };

  const hasCurrentOffer = product.isOnOffer || !!product.salePrice;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isAr ? 'إدارة وتخصيص العروض الترويجية' : 'Manage Product Promotions'}
      description={
        isAr
          ? 'أدوات تسعير ذكية، خصومات مباشرة بالدينار العراقي، وإمكانية تطبيق العرض على فئة كاملة بنقرة واحدة.'
          : 'Smart pricing tools, instant IQD deductions, and one-click category-wide application.'
      }
      maxWidth="xl"
    >
      <div className="space-y-5">
        {/* ============================================================== */}
        {/* Product Identity & Quick Status Card */}
        {/* ============================================================== */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 p-3.5 sm:p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 shadow-md">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative shrink-0">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover bg-slate-800 border border-slate-700/80 shadow-md"
              />
              {hasCurrentOffer && (
                <span className="absolute -top-1.5 -start-1.5 px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] shadow-lg ring-2 ring-slate-950">
                  %
                </span>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60">
                  {product.sku}
                </span>
                <span className="text-[11px] text-indigo-400 font-semibold px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 truncate">
                  {product.category}
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-white truncate mt-1">
                {isAr ? product.name : product.nameEn || product.name}
              </h4>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 text-xs">
                <span className="text-slate-400">
                  {isAr ? 'السعر الأصلي: ' : 'Base Price: '}
                  <strong className="text-white font-bold font-mono tracking-tight" dir="ltr">
                    {formatCurrency(product.price, 'IQD', 'en')}
                  </strong>
                </span>
                {hasCurrentOffer && (
                  <>
                    <span className="text-slate-600 hidden sm:inline">|</span>
                    <span className="text-amber-400 font-semibold flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 shrink-0" />
                      {isAr ? 'العرض الحالي: ' : 'Active Sale: '}
                      <strong className="font-mono tracking-tight" dir="ltr">
                        {formatCurrency(product.salePrice || product.price, 'IQD', 'en')}
                      </strong>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Clear Offer if active */}
          {hasCurrentOffer && (
            <div className="flex items-center gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
              <button
                type="button"
                onClick={() => {
                  onRemoveOffer(product.id, false);
                  onClose();
                }}
                className="w-full sm:w-auto px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                title={isAr ? 'إلغاء العرض وإعادة السعر الأصلي' : 'Remove promo and restore price'}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isAr ? 'إلغاء العرض' : 'Clear Promo'}</span>
              </button>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* ADMIN CONVENIENCE 1: Bulk Category Application Toggle */}
        {/* ============================================================== */}
        {categoryCount > 1 && (
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-indigo-950/30 border border-indigo-500/30 flex items-start sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                <Package className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-white flex items-center gap-2">
                  <span>{isAr ? 'تطبيق جماعي على كامل الفئة' : 'Bulk Category Application'}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                    {categoryCount} {isAr ? 'منتجات' : 'products'}
                  </span>
                </p>
                <p className="text-slate-400 mt-0.5">
                  {isAr
                    ? `تطبيق نفس العرض فوراً على جميع السلع التابعة لقسم "${product.category}" دون الحاجة لتكرار العملية.`
                    : `Apply the same discount and badge to all items in category "${product.category}".`}
                </p>
              </div>
            </div>

            <label className="flex items-center gap-2 shrink-0 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={applyToCategory}
                onChange={(e) => setApplyToCategory(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-700 bg-slate-800 cursor-pointer"
              />
              <span className="text-xs font-bold text-indigo-300">
                {isAr ? 'تفعيل للكل' : 'Apply All'}
              </span>
            </label>
          </div>
        )}

        {/* ============================================================== */}
        {/* Mode Selector Tabs: (Custom Promo VS Campaign List) */}
        {/* ============================================================== */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-950/70 border border-slate-800/80 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'custom'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Tag className="w-4 h-4 shrink-0" />
            <span className="truncate">{isAr ? '1. عرض مخصص بالقطعة' : '1. Custom Promo'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('campaign')}
            className={`py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'campaign'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-4 h-4 shrink-0" />
            <span className="truncate">
              {isAr ? '2. ربط بقائمة عروض (تخفيضات الشتاء)' : '2. Campaign List'}
            </span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: CUSTOM ITEM OFFER (عرض خاص ومخصص) */}
        {/* ============================================================== */}
        {activeTab === 'custom' && (
          <div className="space-y-5 animate-in fade-in-50 duration-200">
            {/* Quick Percentage Presets with Live Price Indicators */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{isAr ? 'نسب التخفيض السريعة (مع السعر الناتج):' : 'Quick Discount Presets:'}</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  {isAr ? 'انقر لاختيار الخصم فوراً' : 'Click to select'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { pct: 10, tag: '' },
                  { pct: 15, tag: '' },
                  { pct: 20, tag: 'شائع' },
                  { pct: 25, tag: '' },
                  { pct: 30, tag: 'توفير' },
                  { pct: 40, tag: '' },
                  { pct: 50, tag: 'نصف السعر' },
                  { pct: 70, tag: 'تصفية' },
                ].map(({ pct, tag }) => {
                  const previewPrice = Math.round((originalPrice * (1 - pct / 100)) / 250) * 250;
                  const isSelected = pricingMode === 'percent' && discountPercent === pct;

                  return (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => {
                        setPricingMode('percent');
                        setDiscountPercent(pct);
                      }}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-950/50 ring-2 ring-indigo-400/30'
                          : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-sm font-extrabold">%{pct}</span>
                        {tag && (
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : 'bg-slate-800 text-indigo-300 border border-slate-700'
                            }`}
                          >
                            {tag}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-start" dir="ltr">
                        <span
                          className={`text-[11px] font-mono font-bold tracking-tight ${
                            isSelected ? 'text-indigo-100' : 'text-slate-400'
                          }`}
                        >
                          {formatCurrency(previewPrice, 'IQD', 'en')}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Dinar Deductions & Iraqi Rounding Steppers */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isAr ? 'تسهيلات التخفيض المباشر بالدينار:' : 'Quick IQD Deductions & Steps:'}</span>
                </span>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => roundToNearestDinar(500)}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-medium cursor-pointer"
                    title={isAr ? 'تقريب لأقرب 500 دينار عراقي' : 'Round to nearest 500 IQD'}
                  >
                    {isAr ? 'تقريب 500 د.ع' : 'Round 500 IQD'}
                  </button>
                  <button
                    type="button"
                    onClick={() => roundToNearestDinar(1000)}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-medium cursor-pointer"
                    title={isAr ? 'تقريب لأقرب 1,000 دينار عراقي' : 'Round to nearest 1,000 IQD'}
                  >
                    {isAr ? 'تقريب 1,000 د.ع' : 'Round 1,000 IQD'}
                  </button>
                </div>
              </div>

              {/* Deduction Chips */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-400 me-1">
                  {isAr ? 'خصم نقدي مباشر:' : 'Fixed drop:'}
                </span>
                {fixedDeductionPresets.map((amount) => {
                  const targetPrice = Math.max(500, originalPrice - amount);
                  return (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => {
                        setPricingMode('fixedPrice');
                        setCustomSalePrice(targetPrice.toString());
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-900 hover:bg-indigo-600 hover:text-white text-slate-200 border border-slate-800 hover:border-indigo-500 transition-colors cursor-pointer"
                    >
                      -{amount.toLocaleString('en-US')} IQD
                    </button>
                  );
                })}
              </div>

              {/* Price Steppers */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/70">
                <span className="text-[11px] text-slate-400">
                  {isAr ? 'تعديل تدريجي بالسعر الحالي:' : 'Fine-tune price:'}
                </span>
                <div className="flex items-center gap-1.5 font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => adjustPriceBy(-5000)}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                  >
                    -5,000
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustPriceBy(-1000)}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                  >
                    -1,000
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustPriceBy(1000)}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                  >
                    +1,000
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustPriceBy(5000)}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                  >
                    +5,000
                  </button>
                </div>
              </div>
            </div>

            {/* Custom Manual Price Input (Toggle Mode) */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-300">
                  {isAr ? 'أو كتابة السعر النهائي يدوياً (IQD):' : 'Or Manual Sale Price (IQD):'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (pricingMode === 'percent') {
                      setPricingMode('fixedPrice');
                      setCustomSalePrice(toEnglishDigits(calculatedCustomPrice).toString());
                    } else {
                      setPricingMode('percent');
                    }
                  }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 underline cursor-pointer font-medium"
                >
                  {pricingMode === 'percent'
                    ? isAr
                      ? 'التبديل إلى إدخال السعر يدوياً'
                      : 'Switch to Manual Price'
                    : isAr
                    ? 'التبديل إلى النسبة المئوية %'
                    : 'Switch to Percentage %'}
                </button>
              </div>

              {pricingMode === 'fixedPrice' && (
                <Input
                  type="text"
                  inputMode="numeric"
                  dir="ltr"
                  className="font-mono text-left tracking-wider font-bold text-white text-base"
                  placeholder="140000"
                  value={customSalePrice}
                  onChange={(e) =>
                    setCustomSalePrice(toEnglishDigits(e.target.value).replace(/[^0-9.]/g, ''))
                  }
                  icon={TrendingDown}
                  action={
                    <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      IQD
                    </span>
                  }
                />
              )}
            </div>

            {/* Ready-Made Badge Shortcuts (1-Click Fill) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {isAr
                  ? 'اختر شارة ترويجية جاهزة أو اكتب شارة مخصصة:'
                  : 'Choose Promo Badge Template or Custom Text:'}
              </label>
              <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                {badgePresets.map((b) => (
                  <button
                    key={b.value}
                    type="button"
                    onClick={() => setCustomBadgeText(b.value)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      customBadgeText === b.value
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-sm'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>

              <Input
                placeholder={
                  isAr ? 'مثال: خصم حصري، عرض لفترة محدودة، صفقة اليوم' : 'e.g. Exclusive Deal, Limited Offer'
                }
                value={customBadgeText}
                onChange={(e) => setCustomBadgeText(e.target.value)}
                icon={Sparkles}
              />
            </div>

            {/* Margin Safety & Profitability Indicator */}
            {actualSavingsPct > 50 ? (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>
                  {isAr
                    ? `تنبيه هامش الربح: نسبة التخفيض (${actualSavingsPct}%) مرتفعة جداً. تأكد أن سعر التكلفة مغطى بالكامل.`
                    : `Margin Warning: Discount (${actualSavingsPct}%) exceeds 50%. Ensure cost price is fully covered.`}
                </span>
              </div>
            ) : actualSavingsPct > 0 ? (
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>
                  {isAr
                    ? `هامش متوازن: خصم جذاب للعميل بنسبة ${actualSavingsPct}% لتحفيز الشراء السريع.`
                    : `Optimal promotional discount (${actualSavingsPct}%) to accelerate checkout.`}
                </span>
              </div>
            ) : null}

            {/* Live Interactive Storefront Preview Card */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-indigo-950/50 border border-indigo-500/35 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 shadow-xl">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">
                    {isAr ? 'معاينة السعر النهائي للزبون في المتجر:' : 'Final Storefront Sale Price Preview:'}
                  </span>
                  {customBadgeText.trim() && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>{customBadgeText.trim()}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-2.5 mt-1.5" dir="ltr">
                  <span className="text-2xl font-extrabold text-white font-mono tracking-tight">
                    {formatCurrency(currentFinalSalePrice, 'IQD', 'en')}
                  </span>
                  <span className="text-xs text-slate-400 line-through font-mono">
                    {formatCurrency(product.price, 'IQD', 'en')}
                  </span>
                </div>
              </div>

              <div className="px-3.5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold text-center sm:text-end shrink-0 shadow-sm">
                <span>
                  {isAr ? 'وفر للزبون: ' : 'Customer Saves: '}
                  <strong dir="ltr" className="font-mono inline-block">
                    {formatCurrency(customSavings, 'IQD', 'en')}
                  </strong>
                </span>
                <span className="block text-[11px] text-emerald-400/80 font-mono mt-0.5">
                  ({actualSavingsPct}% OFF)
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2.5 sm:gap-3 pt-4 border-t border-slate-800/80">
              <Button type="button" variant="ghost" onClick={onClose} className="w-full sm:w-auto">
                {isAr ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleApplyCustomOffer}
                leftIcon={<Check className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                {applyToCategory
                  ? isAr
                    ? `تطبيق العرض على جميع منتجات فئة ${product.category} (${categoryCount})`
                    : `Apply Promo to All ${categoryCount} ${product.category} Items`
                  : isAr
                  ? 'تطبيق العرض على هذه القطعة'
                  : 'Apply Promo to Item'}
              </Button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: CAMPAIGN LIST SELECTION (إضافة لقوائم العروض مثل تخفيضات الشتاء) */}
        {/* ============================================================== */}
        {activeTab === 'campaign' && (
          <div className="space-y-4 animate-in fade-in-50 duration-200">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-200">
                  {isAr
                    ? 'اختر إحدى قوائم وحملات العروض لربط القطعة بها:'
                    : 'Select a Campaign List to assign this item to:'}
                </label>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isAr
                    ? 'سيتم تطبيق نسبة الخصم المعتمدة وشارتها تلقائياً على السعر.'
                    : 'The campaign discount percentage and badge will be applied automatically.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateCampaignForm((prev) => !prev)}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold cursor-pointer py-1.5 px-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAr ? 'إنشاء قائمة حملة جديدة' : 'New Campaign List'}</span>
              </button>
            </div>

            {/* Campaign Search Input if multiple campaigns */}
            {offers.length > 3 && (
              <div className="relative">
                <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={
                    isAr ? 'بحث في قوائم العروض (تخفيضات الشتاء، عروض العيد...)' : 'Search campaigns...'
                  }
                  value={campaignSearch}
                  onChange={(e) => setCampaignSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl ps-9 pe-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            )}

            {/* Inline Form to create new Campaign list if desired */}
            {showCreateCampaignForm && (
              <form
                onSubmit={handleCreateNewCampaign}
                className="p-3.5 sm:p-4 rounded-xl bg-slate-950/80 border border-indigo-500/40 space-y-3 animate-in slide-in-from-top-2 duration-150"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    {isAr ? 'إنشاء قائمة عروض فورية وتجهيزها:' : 'Create New Campaign List:'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowCreateCampaignForm(false)}
                    className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Pre-made quick templates */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-slate-400 me-1">
                    {isAr ? 'قوالب سريعة جاهزة:' : 'Quick templates:'}
                  </span>
                  {quickCampaignTemplates.map((tmpl) => (
                    <button
                      key={tmpl.code}
                      type="button"
                      onClick={() => {
                        setNewCampaignTitle(tmpl.title);
                        setNewCampaignCode(tmpl.code);
                        setNewCampaignPercent(tmpl.pct);
                      }}
                      className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:bg-slate-700 cursor-pointer"
                    >
                      {tmpl.title} (%{tmpl.pct})
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <Input
                      label={isAr ? 'اسم قائمة العرض (مثلاً: تخفيضات الشتاء):' : 'Campaign Name:'}
                      placeholder={isAr ? 'تخفيضات الشتاء، عروض العيد...' : 'e.g. Winter Clearance, Eid Specials'}
                      value={newCampaignTitle}
                      onChange={(e) => setNewCampaignTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Input
                      label={isAr ? 'كود الكوبون:' : 'Promo Code:'}
                      placeholder="WINTER25"
                      value={newCampaignCode}
                      onChange={(e) => setNewCampaignCode(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-300 font-medium">
                      {isAr ? 'نسبة الخصم:' : 'Discount:'}
                    </span>
                    <div className="flex gap-1.5">
                      {[15, 20, 25, 30, 40].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setNewCampaignPercent(p)}
                          className={`px-2.5 py-1 rounded text-xs font-bold border transition-colors cursor-pointer ${
                            newCampaignPercent === p
                              ? 'bg-indigo-600 text-white border-indigo-500'
                              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                          }`}
                        >
                          %{p}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button type="submit" variant="emerald" size="sm" className="w-full sm:w-auto">
                    {isAr ? 'حفظ وإضافة للقوائم' : 'Save Campaign'}
                  </Button>
                </div>
              </form>
            )}

            {/* Campaign Options List */}
            <div className="space-y-2.5 max-h-80 overflow-y-auto pe-1 scrollbar-thin scrollbar-thumb-slate-700">
              {filteredCampaigns.map((campaign) => {
                const isSelected = selectedOfferId === campaign.id;

                // Calculate product price under this campaign
                let promoPrice = product.price;
                if (campaign.discountType === 'percentage') {
                  promoPrice =
                    Math.round((product.price * (1 - campaign.discountValue / 100)) / 250) * 250;
                } else {
                  promoPrice = Math.max(0, product.price - campaign.discountValue);
                }

                const savings = product.price - promoPrice;

                // Count items assigned to this campaign
                const assignedCount = products.filter(
                  (p) => p.offerCampaign === campaign.title || p.offerCampaign === campaign.titleEn
                ).length;

                return (
                  <div
                    key={campaign.id}
                    onClick={() => setSelectedOfferId(campaign.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-indigo-950/60 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-400'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {isSelected ? <Check className="w-4 h-4" /> : <Tag className="w-4 h-4" />}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h5 className="text-xs sm:text-sm font-bold text-white truncate">
                            {isAr ? campaign.title : campaign.titleEn || campaign.title}
                          </h5>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                            {campaign.code}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 flex flex-wrap items-center gap-2 sm:gap-3">
                          <span>
                            {campaign.discountType === 'percentage'
                              ? `${isAr ? 'خصم' : 'Discount'} %${campaign.discountValue}`
                              : `${isAr ? 'خصم ثابت' : 'Fixed'} ${formatCurrency(campaign.discountValue, 'IQD', 'en')}`}
                          </span>
                          <span>·</span>
                          <span className="text-emerald-400 font-medium">
                            {isAr ? 'توفير للزبون' : 'Saves'}{' '}
                            <span dir="ltr" className="font-mono">
                              {formatCurrency(savings, 'IQD', 'en')}
                            </span>
                          </span>
                          {assignedCount > 0 && (
                            <>
                              <span>·</span>
                              <span className="text-indigo-300">
                                {isAr ? `مطبق على ${assignedCount} سلع` : `${assignedCount} items`}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-start sm:text-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60 flex sm:flex-col items-center sm:items-end justify-between">
                      <span className="text-xs text-slate-400">
                        {isAr ? 'السعر بعد الخصم:' : 'Discounted Price:'}
                      </span>
                      <span className="text-sm font-extrabold text-white font-mono tracking-tight" dir="ltr">
                        {formatCurrency(promoPrice, 'IQD', 'en')}
                      </span>
                    </div>
                  </div>
                );
              })}

              {filteredCampaigns.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-800 rounded-xl">
                  {isAr ? 'لا توجد حملات تطابق البحث.' : 'No matching campaigns.'}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2.5 sm:gap-3 pt-4 border-t border-slate-800/80">
              <Button type="button" variant="ghost" onClick={onClose} className="w-full sm:w-auto">
                {isAr ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button
                type="button"
                variant="primary"
                disabled={!selectedOfferId}
                onClick={handleApplyCampaignOffer}
                leftIcon={<Check className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                {applyToCategory
                  ? isAr
                    ? `إضافة جميع منتجات فئة ${product.category} (${categoryCount}) للقائمة`
                    : `Add All ${categoryCount} ${product.category} Items to Campaign`
                  : isAr
                  ? 'تأكيد إضافة القطعة إلى قائمة العرض'
                  : 'Confirm & Add to Campaign'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ProductOfferModal;
