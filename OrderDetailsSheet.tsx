import React, { useState } from 'react';
import {
  X,
  Phone,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  Circle,
  Truck,
  Scissors,
  CreditCard,
  MessageCircle,
  Printer,
  ChevronDown,
  Edit3,
  Save,
  AlertCircle,
  Crown,
  Ruler,
  Layers,
  ArrowRight,
  User,
} from 'lucide-react';
import { Sheet } from './Sheet';
import { StatusBadge } from './ui';
import {
  Order,
  OrderStatus,
  OrderType,
  useAdminBridge,
} from './useAdminBridge';

interface OrderDetailsSheetProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderDetailsSheet: React.FC<OrderDetailsSheetProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  const { lang, updateOrderStatus, updateOrderArtisanNotes } = useAdminBridge();
  const isAr = lang === 'ar';

  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [artisanNotes, setArtisanNotes] = useState('');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [statusNoteInput, setStatusNoteInput] = useState('');

  // Keep notes synchronized when order changes
  React.useEffect(() => {
    if (order) {
      setArtisanNotes(order.bespokeDetails?.artisanNotes || '');
      setIsEditingNotes(false);
      setIsStatusDropdownOpen(false);
      setStatusNoteInput('');
    }
  }, [order]);

  if (!order) return null;

  const formatPrice = (num: number) => {
    return `${new Intl.NumberFormat('en-US').format(num)} IQD`;
  };

  const statusConfigs: Record<
    OrderStatus,
    { labelAr: string; labelEn: string; badgeStatus: 'draft' | 'warning' | 'active' | 'success' | 'danger'; icon: React.ElementType }
  > = {
    pending_payment: {
      labelAr: 'بانتظار الدفع',
      labelEn: 'Pending Payment',
      badgeStatus: 'draft',
      icon: Clock,
    },
    processing: {
      labelAr: 'قيد التفصيل / التجهيز',
      labelEn: 'In Atelier / Processing',
      badgeStatus: 'warning',
      icon: Scissors,
    },
    shipped: {
      labelAr: 'تم الشحن للتوصيل',
      labelEn: 'Shipped / In Transit',
      badgeStatus: 'active',
      icon: Truck,
    },
    delivered: {
      labelAr: 'تم التسليم بنجاح',
      labelEn: 'Delivered',
      badgeStatus: 'success',
      icon: CheckCircle2,
    },
    cancelled: {
      labelAr: 'تم الإلغاء',
      labelEn: 'Cancelled',
      badgeStatus: 'danger',
      icon: AlertCircle,
    },
  };

  const handleSaveNotes = () => {
    updateOrderArtisanNotes(order.id, artisanNotes);
    setIsEditingNotes(false);
  };

  const handleUpdateStatus = (newStatus: OrderStatus) => {
    updateOrderStatus(order.id, newStatus, statusNoteInput.trim() || undefined);
    setIsStatusDropdownOpen(false);
    setStatusNoteInput('');
  };

  const handleWhatsAppCustomer = () => {
    const cleanPhone = order.customerPhone.replace(/[^0-9]/g, '');
    const greeting = isAr ? `مرحباً ${order.customerName} العزيز` : `Dear ${order.customerName}`;
    const statusText = isAr
      ? statusConfigs[order.status].labelAr
      : statusConfigs[order.status].labelEn;

    const message = isAr
      ? `${greeting}،\nتحية طيبة من دار الرافدين للأزياء والتصميم الرفيع 🏛️✨\n\nنود إعلامكم بآخر مستجدات طلبكم رقم #${order.id} (${order.type === 'bespoke' ? 'تفصيل ملكي خاص Bespoke' : 'جاهز للارتداء'}):\nحالة الطلب الحالية: *${statusText}*.\n\n${
          order.type === 'bespoke' && order.bespokeDetails?.fittingDate
            ? `موعد جلسة البروفة / الفحص: ${order.bespokeDetails.fittingDate}\n`
            : ''
        }إذا كان لديكم أي استفسار أو تعديل، مستشار الكونسيرج الخاص بكم جاهز لخدمتكم دوماً.`
      : `${greeting},\nGreetings from Dar Al-Rafidain Haute Couture 🏛️✨\n\nRegarding your Order #${order.id} (${order.type === 'bespoke' ? 'Royal Bespoke Tailoring' : 'Ready-to-Wear'}):\nCurrent Status: *${statusText}*.\n\n${
          order.type === 'bespoke' && order.bespokeDetails?.fittingDate
            ? `Fitting Session: ${order.bespokeDetails.fittingDate}\n`
            : ''
        }Please reply here if you require bespoke assistance from our VIP concierge.`;

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handlePrintInvoice = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const itemsHtml = order.items
      .map(
        (item) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px 8px; font-weight: 600;">${item.name} <br/><small style="color: #64748b;">${item.nameEn} • Size: ${item.selectedSize} ${item.fabricOption ? `• ${item.fabricOption}` : ''}</small></td>
        <td style="padding: 12px 8px; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px 8px; text-align: right; font-family: monospace;">${item.price.toLocaleString('en-US')} IQD</td>
        <td style="padding: 12px 8px; text-align: right; font-weight: bold; font-family: monospace;">${(item.price * item.quantity).toLocaleString('en-US')} IQD</td>
      </tr>
    `
      )
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="${isAr ? 'rtl' : 'ltr'}" lang="${isAr ? 'ar' : 'en'}">
      <head>
        <title>فاتورة رسمية - دار الرافدين #${order.id}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 40px; color: #0f172a; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 30px; }
          .title { font-size: 24px; font-weight: bold; margin: 0; }
          .badge { display: inline-block; padding: 4px 10px; background: #e0e7ff; color: #4338ca; border-radius: 9999px; font-size: 12px; font-weight: bold; margin-top: 6px; }
          table { width: 100%; border-collapse: collapse; margin-top: 24px; }
          th { text-align: ${isAr ? 'right' : 'left'}; background: #f8fafc; padding: 10px 8px; border-bottom: 2px solid #cbd5e1; font-size: 13px; }
          .total-box { margin-top: 30px; display: flex; justify-content: flex-end; }
          .total-table { width: 300px; }
          .footer { margin-top: 50px; padding-top: 20px; border-top: 1px dashed #cbd5e1; font-size: 12px; color: #64748b; text-align: center; }
          @media print { button { display: none; } body { margin: 20mm; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">دار الرافدين للأزياء والتصميم الرفيع</h1>
            <p style="margin: 4px 0; color: #64748b;">Dar Al-Rafidain Haute Couture & Atelier</p>
            <span class="badge">${order.type === 'bespoke' ? 'طلب تفصيل خاص VIP BESPOKE' : 'طلب جاهز READY-TO-WEAR'}</span>
          </div>
          <div style="text-align: ${isAr ? 'left' : 'right'};">
            <h2 style="margin: 0; font-size: 20px; color: #4338ca;">#${order.id}</h2>
            <p style="margin: 4px 0; color: #64748b;">التاريخ: ${order.orderDate}</p>
            <p style="margin: 4px 0; color: #64748b;">طريقة الدفع: ${order.paymentMethod}</p>
          </div>
        </div>

        <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
          <h3 style="margin: 0 0 8px 0; font-size: 15px;">بيانات العميل والشحن:</h3>
          <p style="margin: 4px 0;"><strong>الاسم:</strong> ${order.customerName} ${order.isVip ? '★ (VIP Client)' : ''}</p>
          <p style="margin: 4px 0;"><strong>الهاتف:</strong> ${order.customerPhone}</p>
          <p style="margin: 4px 0;"><strong>العنوان:</strong> ${order.shippingAddress}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>العنصر / المواصفات</th>
              <th style="text-align: center;">الكمية</th>
              <th style="text-align: right;">سعر القطعة</th>
              <th style="text-align: right;">المجموع</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="total-box">
          <table class="total-table">
            <tr>
              <td style="padding: 6px 0;">المجموع الفرعي:</td>
              <td style="padding: 6px 0; text-align: right; font-family: monospace;">${order.totalPrice.toLocaleString('en-US')} IQD</td>
            </tr>
            <tr>
              <td style="padding: 6px 0;">رسوم التوصيل والكونسيرج:</td>
              <td style="padding: 6px 0; text-align: right; color: #10b981; font-weight: bold;">مجاناً (VIP Complimentary)</td>
            </tr>
            <tr style="border-top: 2px solid #0f172a; font-size: 18px; font-weight: bold;">
              <td style="padding: 10px 0;">الإجمالي الكلي:</td>
              <td style="padding: 10px 0; text-align: right; font-family: monospace; color: #4338ca;">${order.totalPrice.toLocaleString('en-US')} IQD</td>
            </tr>
          </table>
        </div>

        <div class="footer">
          <p>شكراً لثقتكم بدار الرافدين للأزياء • بغداد - المنصور - شارع الأميرات • هاتف الكونسيرج: +964 780 987 6543</p>
          <button onclick="window.print()" style="margin-top: 15px; padding: 8px 20px; background: #4338ca; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">طباعة الفاتورة الآن (Print Invoice)</button>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const stepsList: { status: OrderStatus; labelAr: string; labelEn: string; icon: React.ElementType }[] = [
    { status: 'pending_payment', labelAr: 'تسجيل الطلب', labelEn: 'Order Placed', icon: Clock },
    { status: 'processing', labelAr: 'الخياطة في الأتيليه', labelEn: 'In Atelier', icon: Scissors },
    { status: 'shipped', labelAr: 'تم الشحن', labelEn: 'Dispatched', icon: Truck },
    { status: 'delivered', labelAr: 'تم التسليم', labelEn: 'Delivered', icon: CheckCircle2 },
  ];

  const getStepState = (stepStatus: OrderStatus) => {
    const flow = ['pending_payment', 'processing', 'shipped', 'delivered'];
    const currentIndex = flow.indexOf(order.status);
    const stepIndex = flow.indexOf(stepStatus);

    if (order.status === 'cancelled') {
      return 'cancelled';
    }
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title={isAr ? `تفاصيل الطلب #${order.id}` : `Order Details #${order.id}`}
      description={
        isAr
          ? `تاريخ الإنشاء: ${order.orderDate} • نوع الطلب: ${order.type === 'bespoke' ? 'تفصيل ملكي خاص' : 'منتج جاهز'}`
          : `Created: ${order.orderDate} • Type: ${order.type === 'bespoke' ? 'VIP Bespoke Atelier' : 'Ready-to-Wear'}`
      }
      widthClass="max-w-2xl sm:max-w-3xl"
      footer={
        <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/95 backdrop-blur-md p-1 border-t border-slate-800">
          {/* Status Changer Trigger */}
          <div className="relative">
            <button
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium text-xs border border-slate-700/80 transition-all cursor-pointer shadow-sm"
            >
              <Edit3 className="w-4 h-4 text-indigo-400" />
              <span>{isAr ? 'تغيير مرحلة الطلب' : 'Update Stage'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Quick Status Dropdown Menu */}
            {isStatusDropdownOpen && (
              <div
                className={`absolute bottom-full mb-2 ${
                  isAr ? 'right-0' : 'left-0'
                } w-72 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95`}
              >
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 mb-1">
                  {isAr ? 'اختر الحالة الجديدة' : 'Select New Status'}
                </div>
                {(['pending_payment', 'processing', 'shipped', 'delivered', 'cancelled'] as OrderStatus[]).map((st) => {
                  const conf = statusConfigs[st];
                  const Icon = conf.icon;
                  const isCurrent = order.status === st;
                  return (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(st)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer text-start ${
                        isCurrent
                          ? 'bg-indigo-600/20 text-indigo-300 font-semibold'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5" />
                        <span>{isAr ? conf.labelAr : conf.labelEn}</span>
                      </span>
                      {isCurrent && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                    </button>
                  );
                })}

                <div className="mt-2 pt-2 border-t border-slate-800 px-1">
                  <input
                    type="text"
                    value={statusNoteInput}
                    onChange={(e) => setStatusNoteInput(e.target.value)}
                    placeholder={isAr ? 'ملاحظة التحديث (اختياري)...' : 'Update note (optional)...'}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* WhatsApp & Print Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintInvoice}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/80 transition-all cursor-pointer"
              title={isAr ? 'طباعة فاتورة رسمية' : 'Print Invoice'}
            >
              <Printer className="w-4 h-4 text-slate-300" />
              <span>{isAr ? 'طباعة الفاتورة' : 'Print Invoice'}</span>
            </button>

            <button
              onClick={handleWhatsAppCustomer}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium shadow-md shadow-emerald-950 transition-all cursor-pointer"
              title={isAr ? 'مراسلة العميل عبر واتساب كونسيرج' : 'Send WhatsApp Update'}
            >
              <MessageCircle className="w-4 h-4 text-white" />
              <span>{isAr ? 'تحديث واتساب كونسيرج' : 'WhatsApp Concierge'}</span>
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-6 pb-6 text-start">
        {/* Top Highlight Banner with VIP Indicator */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-indigo-950/40 border border-slate-800/80 p-5 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shadow-md ${
                  order.isVip
                    ? 'bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 shadow-amber-900/30 ring-2 ring-amber-400/40'
                    : 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                }`}
              >
                {order.isVip ? <Crown className="w-6 h-6 text-amber-950" /> : <Scissors className="w-6 h-6 text-indigo-400" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white tracking-wide">#{order.id}</h3>
                  {order.isVip && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.35)] animate-pulse">
                      <Crown className="w-3 h-3 text-amber-400" />
                      <span>{isAr ? 'عميل كبار الشخصيات VIP' : 'VIP Bespoke Client'}</span>
                    </span>
                  )}
                  {order.type === 'bespoke' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                      <Scissors className="w-3 h-3 text-indigo-400" />
                      <span>{isAr ? 'خياطة خاصة' : 'Atelier Bespoke'}</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {order.paymentMethod} {order.trackingNumber ? `• تتبع: ${order.trackingNumber}` : ''}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-xs text-slate-400">{isAr ? 'إجمالي الطلب' : 'Total Amount'}</span>
              <span className="text-xl font-bold font-mono text-emerald-400 tracking-tight">
                {formatPrice(order.totalPrice)}
              </span>
            </div>
          </div>
        </div>

        {/* 1. Fulfillment Journey Timeline Stepper */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800/80 p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>{isAr ? 'مسار رحلة الطلب والتجهيز' : 'Fulfillment Journey Timeline'}</span>
            </h4>
            <StatusBadge
              status={statusConfigs[order.status].badgeStatus}
              label={isAr ? statusConfigs[order.status].labelAr : statusConfigs[order.status].labelEn}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative">
            {stepsList.map((step, idx) => {
              const state = getStepState(step.status);
              const StepIcon = step.icon;

              return (
                <div
                  key={step.status}
                  className={`relative flex flex-col items-center text-center p-3 rounded-xl border transition-all ${
                    state === 'current'
                      ? 'bg-indigo-600/15 border-indigo-500/50 shadow-sm shadow-indigo-950/50'
                      : state === 'completed'
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-slate-950/50 border-slate-800/80 opacity-60'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center mb-2 text-xs font-bold ${
                      state === 'current'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/40 animate-pulse'
                        : state === 'completed'
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {state === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                    ) : (
                      <StepIcon className="w-4 h-4" />
                    )}
                  </div>
                  <span
                    className={`text-xs font-bold ${
                      state === 'current'
                        ? 'text-indigo-300'
                        : state === 'completed'
                        ? 'text-emerald-300'
                        : 'text-slate-400'
                    }`}
                  >
                    {isAr ? step.labelAr : step.labelEn}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    {state === 'completed'
                      ? isAr
                        ? 'مكتمل'
                        : 'Completed'
                      : state === 'current'
                      ? isAr
                        ? 'المرحلة الحالية'
                        : 'In Progress'
                      : isAr
                      ? 'بانتظار البدء'
                      : 'Upcoming'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Chronological History Log */}
          {order.timeline && order.timeline.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                {isAr ? 'سجل النشاطات والمحطات:' : 'Activity History Log:'}
              </span>
              {order.timeline.map((evt, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <span className="font-semibold text-slate-200">
                      {isAr ? evt.title : evt.titleEn}
                    </span>
                    {evt.note && <p className="text-slate-400 mt-0.5 text-[11px]">{evt.note}</p>}
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0 font-mono">{evt.timestamp}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. Customer & Delivery Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800/80 p-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-400" />
              <span>{isAr ? 'بيانات العميل' : 'Customer Profile'}</span>
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">{isAr ? 'الاسم:' : 'Name:'}</span>
                <span className="font-bold text-white">{order.customerName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">{isAr ? 'الهاتف:' : 'Phone:'}</span>
                <a
                  href={`tel:${order.customerPhone}`}
                  className="font-mono text-indigo-300 hover:underline flex items-center gap-1"
                >
                  <Phone className="w-3 h-3 text-indigo-400" />
                  <span>{order.customerPhone}</span>
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">{isAr ? 'البريد:' : 'Email:'}</span>
                <span className="font-mono text-slate-300 truncate max-w-[180px]">{order.customerEmail}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900/80 border border-slate-800/80 p-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>{isAr ? 'عنوان التوصيل والشحن' : 'Delivery Address'}</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              {order.shippingAddress}
            </p>
          </div>
        </div>

        {/* 3. Bespoke VIP Tailoring Measurement Card (If applicable) */}
        {order.type === 'bespoke' && (
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-900 border border-amber-500/30 p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300">
                  <Ruler className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>{isAr ? 'بطاقة قياسات الأتيليه الملكية (VIP Atelier Card)' : 'Royal Bespoke Measurement Card'}</span>
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                  </h4>
                  <p className="text-xs text-amber-300/80">
                    {order.bespokeDetails?.atelierMaster || (isAr ? 'إشراف كبير خياطي الأتيليه' : 'Head Master Tailor')}
                  </p>
                </div>
              </div>

              {order.bespokeDetails?.urgency && (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {order.bespokeDetails.urgency === 'royal_vip'
                    ? isAr
                      ? 'أولوية ملكية عاجلة'
                      : 'Royal VIP Priority'
                    : isAr
                    ? 'أولوية خاصة'
                    : 'High Priority'}
                </span>
              )}
            </div>

            {/* Measurement Grid */}
            {order.bespokeDetails?.clientMeasurements && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
                {Object.entries(order.bespokeDetails.clientMeasurements).map(([key, val]) => {
                  const measurementLabels: Record<string, { ar: string; en: string }> = {
                    chest: { ar: 'محيط الصدر', en: 'Chest' },
                    waist: { ar: 'محيط الخصر', en: 'Waist' },
                    shoulder: { ar: 'عرض الأكتاف', en: 'Shoulder' },
                    sleeveLength: { ar: 'طول الكم', en: 'Sleeve Length' },
                    jacketLength: { ar: 'طول السترة/الثوب', en: 'Jacket/Full Length' },
                    collar: { ar: 'محيط الياقة', en: 'Collar' },
                    height: { ar: 'الطول الكلي', en: 'Height' },
                    posture: { ar: 'هيئة القوام', en: 'Posture' },
                  };
                  const label = measurementLabels[key] || { ar: key, en: key };

                  return (
                    <div
                      key={key}
                      className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 flex flex-col text-start"
                    >
                      <span className="text-[10px] text-slate-400 truncate">{isAr ? label.ar : label.en}</span>
                      <span className="text-xs font-bold font-mono text-amber-200 mt-0.5 truncate">{val}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Artisan Atelier Notes Section */}
            <div className="mt-3 pt-3 border-t border-amber-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Scissors className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isAr ? 'ملاحظات الخياط ومسؤول الأتيليه:' : 'Master Tailor & Artisan Notes:'}</span>
                </span>
                {!isEditingNotes ? (
                  <button
                    onClick={() => setIsEditingNotes(true)}
                    className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{isAr ? 'تعديل الملاحظات' : 'Edit Notes'}</span>
                  </button>
                ) : (
                  <button
                    onClick={handleSaveNotes}
                    className="text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Save className="w-3 h-3" />
                    <span>{isAr ? 'حفظ' : 'Save'}</span>
                  </button>
                )}
              </div>

              {isEditingNotes ? (
                <textarea
                  value={artisanNotes}
                  onChange={(e) => setArtisanNotes(e.target.value)}
                  rows={3}
                  className="w-full text-xs p-3 rounded-xl bg-slate-950 border border-amber-500/50 text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 leading-relaxed"
                  placeholder={isAr ? 'اكتب ملاحظات التفصيل الدقيقة هنا...' : 'Enter artisan tailored notes here...'}
                />
              ) : (
                <p className="text-xs text-slate-300 bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl leading-relaxed">
                  {order.bespokeDetails?.artisanNotes || (isAr ? 'لا توجد ملاحظات إضافية مسجلة.' : 'No notes recorded.')}
                </p>
              )}
            </div>
          </div>
        )}

        {/* 4. Purchased Items List */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800/80 p-5">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>{isAr ? 'القطع والمنتجات المطلوبة' : 'Purchased Items'}</span>
            </span>
            <span className="text-slate-400 font-mono">
              {order.items.reduce((acc, cur) => acc + cur.quantity, 0)} {isAr ? 'قطع' : 'items'}
            </span>
          </h4>

          <div className="space-y-3">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3.5 bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl hover:border-slate-700 transition-colors"
              >
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-16 h-16 rounded-lg object-cover bg-slate-800 shrink-0 border border-slate-800"
                />
                <div className="flex-1 min-w-0">
                  <h5 className="text-xs font-bold text-white truncate">{isAr ? item.name : item.nameEn}</h5>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-400">
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">
                      {item.selectedSize}
                    </span>
                    {item.fabricOption && (
                      <span className="text-amber-300/90 truncate max-w-[200px]" title={item.fabricOption}>
                        • {item.fabricOption}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-slate-400 font-mono">
                      {isAr ? 'الكمية:' : 'Qty:'} {item.quantity} × {formatPrice(item.price)}
                    </span>
                    <span className="text-xs font-bold font-mono text-emerald-400">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Breakdown Summary */}
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>{isAr ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
              <span className="font-mono text-slate-200">{formatPrice(order.totalPrice)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>{isAr ? 'رسوم التوصيل والكونسيرج:' : 'Concierge White-Glove Delivery:'}</span>
              <span className="text-emerald-400 font-bold">{isAr ? 'مجاني (VIP)' : 'Complimentary'}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
              <span>{isAr ? 'المجموع الإجمالي:' : 'Grand Total:'}</span>
              <span className="font-mono text-emerald-400">{formatPrice(order.totalPrice)}</span>
            </div>
          </div>
        </div>
      </div>
    </Sheet>
  );
};
