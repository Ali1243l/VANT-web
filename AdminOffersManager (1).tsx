import React, { useState } from 'react';
import {
  Tag,
  Plus,
  Copy,
  Check,
  Calendar,
  Percent,
  DollarSign,
  TrendingUp,
  Trash2,
  Edit2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAdminBridge, Offer } from './useAdminBridge';
import { formatCurrency, formatNumber, formatDate, toEnglishDigits } from './format';
import { Card, Button, StatusBadge, Modal, Input } from './ui';

export const AdminOffersManager: React.FC = () => {
  const { offers, addOffer, updateOffer, deleteOffer, lang, isOfferModalOpen, setIsOfferModalOpen } = useAdminBridge();
  const isAr = lang === 'ar';

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formTitleEn, setFormTitleEn] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formType, setFormType] = useState<'percentage' | 'fixed'>('percentage');
  const [formValue, setFormValue] = useState('');
  const [formMinSpend, setFormMinSpend] = useState('');
  const [formMaxUses, setFormMaxUses] = useState('');
  const [formEndDate, setFormEndDate] = useState('2026-12-31');

  const filteredOffers = offers.filter((o) => {
    if (filterStatus === 'all') return true;
    return o.status === filterStatus;
  });

  const handleCopy = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreateOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode || !formValue || !formTitle) return;

    addOffer({
      title: formTitle,
      titleEn: formTitleEn || formTitle,
      code: formCode.toUpperCase().trim(),
      discountType: formType,
      discountValue: parseFloat(formValue) || 0,
      minSpend: formMinSpend ? parseFloat(formMinSpend) : undefined,
      maxUses: formMaxUses ? parseInt(formMaxUses, 10) : undefined,
      status: 'active',
      startDate: new Date().toISOString().split('T')[0],
      endDate: formEndDate,
    });

    // Reset
    setFormTitle('');
    setFormTitleEn('');
    setFormCode('');
    setFormValue('');
    setFormMinSpend('');
    setFormMaxUses('');
    setIsOfferModalOpen(false);
  };

  const totalUsed = offers.reduce((acc, curr) => acc + curr.usedCount, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {isAr ? 'إدارة العروض وقسائم التخفيض' : 'Offers & Promotional Coupons'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            {isAr
              ? 'إنشاء أكواد الخصم، متابعة معدلات الاستخدام، وتفعيل الحملات الترويجية.'
              : 'Create promotional vouchers, track redemption rates, and boost conversions.'}
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsOfferModalOpen(true)}
        >
          {isAr ? 'إنشاء كود خصم جديد' : 'Create New Coupon'}
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>{isAr ? 'القسائم النشطة حالياً' : 'Active Coupons'}</span>
            <Tag className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {offers.filter((o) => o.status === 'active').length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {isAr ? 'جاهزة للاستخدام عند الدفع' : 'Ready for checkout redemption'}
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>{isAr ? 'إجمالي عمليات الاستخدام' : 'Total Redemptions'}</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            {formatNumber(totalUsed, isAr ? 'ar' : 'en')}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {isAr ? 'في جميع فروع ومنافذ المتجر' : 'Across all channels'}
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>{isAr ? 'القسائم المنتهية' : 'Expired Coupons'}</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-slate-300">
            {offers.filter((o) => o.status === 'expired').length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {isAr ? 'أنهت فترة الصلاحية المحددة' : 'Exceeded validity period'}
          </p>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'all', labelAr: 'جميع العروض', labelEn: 'All Offers' },
          { id: 'active', labelAr: 'النشطة', labelEn: 'Active' },
          { id: 'expired', labelAr: 'المنتهية', labelEn: 'Expired' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              filterStatus === tab.id
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {isAr ? tab.labelAr : tab.labelEn}
          </button>
        ))}
      </div>

      {/* Offers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredOffers.map((offer) => {
          const isExpired = offer.status === 'expired';
          const isCopied = copiedCode === offer.code;

          return (
            <Card key={offer.id} hoverable className="space-y-4">
              {/* Header with Title and Status */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-white text-base">
                    {isAr ? offer.title : offer.titleEn}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <span>{isAr ? 'الصلاحية حتى:' : 'Valid until:'} {offer.endDate}</span>
                    {offer.minSpend && (
                      <>
                        <span>·</span>
                        <span>{isAr ? 'الحد الأدنى:' : 'Min Spend:'} {formatCurrency(offer.minSpend, 'IQD', isAr ? 'ar' : 'en')}</span>
                      </>
                    )}
                  </div>
                </div>

                <StatusBadge
                  status={isExpired ? 'inactive' : 'active'}
                  label={
                    isExpired
                      ? isAr
                        ? 'منتهي'
                        : 'Expired'
                      : isAr
                      ? 'نشط'
                      : 'Active'
                  }
                />
              </div>

              {/* Coupon Ticket Box */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-dashed border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                    {offer.discountType === 'percentage' ? (
                      <span className="text-sm">%{offer.discountValue}</span>
                    ) : (
                      <span className="text-[11px] leading-tight text-center font-mono">{offer.discountValue.toLocaleString('en-US')}<br/>IQD</span>
                    )}
                  </div>
                  <div>
                    <div className="font-mono text-base font-extrabold text-white tracking-widest">
                      {offer.code}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {offer.discountType === 'percentage'
                        ? isAr
                          ? `خصم ${offer.discountValue}% على الطلب`
                          : `${offer.discountValue}% off order`
                        : isAr
                        ? `خصم ${offer.discountValue.toLocaleString('en-US')} IQD`
                        : `${offer.discountValue.toLocaleString('en-US')} IQD flat discount`}
                    </div>
                  </div>
                </div>

                <Button
                  variant={isCopied ? 'emerald' : 'secondary'}
                  size="sm"
                  onClick={() => handleCopy(offer.code)}
                  leftIcon={isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                >
                  {isCopied ? (isAr ? 'تم النسخ' : 'Copied') : isAr ? 'نسخ' : 'Copy'}
                </Button>
              </div>

              {/* Progress & Stats */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    {isAr ? 'استخدامات الكود:' : 'Redemptions:'}{' '}
                    <strong className="text-white">{offer.usedCount}</strong>
                    {offer.maxUses ? ` / ${offer.maxUses}` : ''}
                  </span>
                  <span className="text-slate-500 font-mono text-[11px]">
                    {offer.maxUses
                      ? `${Math.round((offer.usedCount / offer.maxUses) * 100)}%`
                      : isAr
                      ? 'غير محدود'
                      : 'Unlimited'}
                  </span>
                </div>

                {offer.maxUses && (
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${Math.min(100, (offer.usedCount / offer.maxUses) * 100)}%` }}
                      className="h-full bg-indigo-500 rounded-full"
                    />
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    updateOffer(offer.id, {
                      status: offer.status === 'active' ? 'expired' : 'active',
                    })
                  }
                >
                  {offer.status === 'active'
                    ? isAr
                      ? 'إيقاف مؤقت'
                      : 'Deactivate'
                    : isAr
                    ? 'إعادة التفعيل'
                    : 'Activate'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteOffer(offer.id)}
                  className="text-rose-400 hover:text-rose-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* New Offer Modal */}
      <Modal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        title={isAr ? 'إنشاء كود خصم أو عرض جديد' : 'Create New Promotional Offer'}
        description={isAr ? 'أدخل تفاصيل القسيمة ونسبة الخصم والشروط.' : 'Configure coupon code, discounts and rules.'}
        maxWidth="md"
      >
        {/* Quick Offer Templates for Admin Convenience */}
        <div className="space-y-1.5 pb-2 border-b border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 block">
            {isAr ? 'قوالب سريعة لتسهيل الإنشاء:' : 'Quick Templates:'}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { title: 'تخفيضات الشتاء 20%', titleEn: 'Winter Sale 20%', code: 'WINTER20', type: 'percentage' as const, val: '20' },
              { title: 'عرض نهاية الأسبوع 15%', titleEn: 'Weekend Deal 15%', code: 'WEEKEND15', type: 'percentage' as const, val: '15' },
              { title: 'خصم خاص 25,000 د.ع', titleEn: 'Special 25,000 IQD', code: 'SAVE25K', type: 'fixed' as const, val: '25000' },
              { title: 'شحن مجاني للطلبات', titleEn: 'Free Delivery', code: 'FREESHIP', type: 'fixed' as const, val: '5000' },
            ].map((tmpl) => (
              <button
                key={tmpl.code}
                type="button"
                onClick={() => {
                  setFormTitle(tmpl.title);
                  setFormTitleEn(tmpl.titleEn);
                  setFormCode(tmpl.code);
                  setFormType(tmpl.type);
                  setFormValue(tmpl.val);
                }}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 border border-slate-700 transition-colors cursor-pointer"
              >
                {tmpl.title}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleCreateOffer} className="space-y-4 pt-2">
          <Input
            label={isAr ? 'عنوان العرض (عربي)' : 'Offer Title (Arabic)'}
            placeholder={isAr ? 'مثال: تخفيضات الصيف الكبرى 20%' : 'e.g. Summer Sale 20%'}
            required
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
          />

          <Input
            label={isAr ? 'عنوان العرض (إنجليزي)' : 'Offer Title (English)'}
            placeholder="e.g. Grand Summer Discount"
            value={formTitleEn}
            onChange={(e) => setFormTitleEn(e.target.value)}
          />

          <Input
            label={isAr ? 'رمز الكود الترويجي' : 'Coupon Code'}
            placeholder="SUMMER20"
            required
            value={formCode}
            onChange={(e) => setFormCode(toEnglishDigits(e.target.value).toUpperCase())}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {isAr ? 'نوع الخصم' : 'Discount Type'}
              </label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 text-slate-100 text-sm rounded-lg px-3 py-2 h-9.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="percentage">{isAr ? 'نسبة مئوية (%)' : 'Percentage (%)'}</option>
                <option value="fixed">{isAr ? 'مبلغ ثابت (IQD)' : 'Fixed Amount (IQD)'}</option>
              </select>
            </div>

            <Input
              label={isAr ? 'قيمة الخصم' : 'Discount Value'}
              type="text"
              inputMode="numeric"
              dir="ltr"
              placeholder={formType === 'percentage' ? '20' : '15000'}
              required
              value={formValue}
              onChange={(e) => setFormValue(toEnglishDigits(e.target.value).replace(/[^0-9.]/g, ''))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label={isAr ? 'الحد الأدنى للشراء (IQD)' : 'Min Spend (IQD)'}
              type="text"
              inputMode="numeric"
              dir="ltr"
              placeholder="35000"
              value={formMinSpend}
              onChange={(e) => setFormMinSpend(toEnglishDigits(e.target.value).replace(/[^0-9.]/g, ''))}
            />

            <Input
              label={isAr ? 'الحد الأقصى للاستخدام' : 'Max Redemptions'}
              type="text"
              inputMode="numeric"
              dir="ltr"
              placeholder="500"
              value={formMaxUses}
              onChange={(e) => setFormMaxUses(toEnglishDigits(e.target.value).replace(/[^0-9]/g, ''))}
            />
          </div>

          <Input
            label={isAr ? 'تاريخ انتهاء الصلاحية' : 'Expiry Date'}
            type="date"
            value={formEndDate}
            onChange={(e) => setFormEndDate(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="ghost" onClick={() => setIsOfferModalOpen(false)}>
              {isAr ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button variant="primary" type="submit">
              {isAr ? 'إنشاء وتفعيل الآن' : 'Publish Offer'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default AdminOffersManager;
