import React from 'react';

export interface EmailCampaignData {
  id?: string;
  templateType: 'welcome' | 'flash_sale' | 'launch' | 'clearance' | 'newsletter';
  subject: string;
  preheader: string;
  headline: string;
  bodyText: string;
  discountCode?: string;
  discountPercent?: string;
  heroImage: string;
  ctaText: string;
  ctaUrl: string;
  audience: string;
  storeName?: string;
  senderEmail?: string;
  expireDate?: string;
  items?: Array<{
    name: string;
    price: number | string;
    originalPrice?: number | string;
    image: string;
    badge?: string;
  }>;
}

export const defaultCampaignData: EmailCampaignData = {
  templateType: 'welcome',
  subject: '🎉 مرحباً بك في عائلتنا! خصم 20% بانتظارك على أول طلب',
  preheader: 'استخدم الكود WELCOME20 واستمتع بأرقى التشكيلات مع توصيل سريع لجميع المحافظات.',
  headline: 'أهلاً بك في متجرنا الفاخر',
  bodyText: 'يسعدنا جداً انضمامك إلى مجتمعنا الحصري. لتجربة تسوق لا تُنسى، نقدم لك هدية ترحيبية خاصة صالحة على جميع التشكيلات والإلكترونيات الفاخرة.',
  discountCode: 'WELCOME20',
  discountPercent: '20% خصم فوري',
  heroImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80',
  ctaText: 'تسوق التشكيلة الآن',
  ctaUrl: 'https://store.example.com/shop',
  audience: 'active',
  storeName: 'متجر الرافدين الفاخر',
  senderEmail: 'vip@iraq-store.com',
  expireDate: 'خلال 48 ساعة فقط',
  items: [
    {
      name: 'سماعات برو اللاسلكية',
      price: '125,000 IQD',
      originalPrice: '160,000 IQD',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80',
      badge: 'الأكثر طلباً',
    },
    {
      name: 'ساعة ذكية تيتانيوم فاخرة',
      price: '185,000 IQD',
      originalPrice: '220,000 IQD',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=80',
      badge: 'جديد',
    },
  ],
};

/**
 * Generate standard HTML string compatible with email clients (Resend, SendGrid, etc.)
 */
export function generateEmailHtml(data: EmailCampaignData): string {
  const isFlash = data.templateType === 'flash_sale';
  const isLaunch = data.templateType === 'launch';
  const isClearance = data.templateType === 'clearance';
  const isNewsletter = data.templateType === 'newsletter';

  const themeColor = isFlash ? '#ef4444' : isLaunch ? '#8b5cf6' : isClearance ? '#f59e0b' : isNewsletter ? '#06b6d4' : '#4f46e5';

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.subject}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0; direction: rtl; }
    table { border-spacing: 0; border-collapse: collapse; }
    td { padding: 0; }
    img { border: 0; max-width: 100%; height: auto; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #0f172a; padding: 30px 10px; }
    .main { background-color: #1e293b; margin: 0 auto; width: 100%; max-width: 600px; border-radius: 16px; overflow: hidden; border: 1px solid #334155; }
    .header { padding: 24px 30px; text-align: center; background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%); border-bottom: 1px solid #334155; }
    .hero-img { width: 100%; max-height: 280px; object-fit: cover; display: block; }
    .content { padding: 32px 30px; }
    .badge { display: inline-block; padding: 4px 12px; font-size: 11px; font-weight: bold; border-radius: 9999px; text-transform: uppercase; background-color: ${themeColor}22; color: ${themeColor}; border: 1px solid ${themeColor}44; margin-bottom: 14px; }
    .headline { font-size: 24px; font-weight: 800; color: #ffffff; line-height: 1.3; margin: 0 0 16px 0; }
    .body-p { font-size: 15px; line-height: 1.7; color: #94a3b8; margin: 0 0 24px 0; }
    .coupon-box { background: #0f172a; border: 2px dashed ${themeColor}; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
    .coupon-code { font-family: monospace; font-size: 22px; font-weight: 900; letter-spacing: 3px; color: #ffffff; margin: 8px 0; }
    .btn-cta { display: inline-block; background-color: ${themeColor}; color: #ffffff !important; text-decoration: none; font-size: 15px; font-weight: bold; padding: 14px 36px; border-radius: 10px; box-shadow: 0 4px 14px ${themeColor}66; }
    .items-grid { margin-top: 30px; padding-top: 24px; border-top: 1px solid #334155; }
    .footer { padding: 24px 30px; text-align: center; font-size: 12px; color: #64748b; background-color: #0f172a; border-top: 1px solid #334155; }
  </style>
</head>
<body>
  <div class="wrapper">
    <table class="main" align="center">
      <!-- Preheader (Hidden Preview Text) -->
      <div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
        ${data.preheader}
      </div>

      <!-- Header / Store Brand -->
      <tr>
        <td class="header">
          <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
            ${data.storeName || 'متجر الرافدين الفاخر'}
          </h1>
          <p style="margin: 4px 0 0; font-size: 12px; color: #94a3b8;">${data.senderEmail || 'عروض وتحديثات حصرية'}</p>
        </td>
      </tr>

      <!-- Hero Banner -->
      ${
        data.heroImage
          ? `<tr>
        <td>
          <img src="${data.heroImage}" alt="${data.headline}" class="hero-img" style="width:100%;height:auto;display:block;">
        </td>
      </tr>`
          : ''
      }

      <!-- Main Body -->
      <tr>
        <td class="content">
          <span class="badge">
            ${
              isFlash
                ? '⚡ عرض عاجل ومؤقت'
                : isLaunch
                ? '✨ إطلاق منتج جديد'
                : isClearance
                ? '🔥 تصفية موسمية كبرى'
                : isNewsletter
                ? '📰 النشرة البريدية الأسبوعية'
                : '🎁 هدية ترحيبية حصرية'
            }
          </span>

          <h2 class="headline">${data.headline}</h2>
          <p class="body-p">${data.bodyText}</p>

          ${
            data.discountCode
              ? `<div class="coupon-box">
            <div style="font-size: 12px; color: #94a3b8; font-weight: 600;">${data.discountPercent || 'كود الخصم الحصري'}</div>
            <div class="coupon-code">${data.discountCode}</div>
            <div style="font-size: 11px; color: #64748b;">${data.expireDate ? `صالح ${data.expireDate}` : 'يطبق عند إتمام الطلب في سلة التسوق'}</div>
          </div>`
              : ''
          }

          <div style="text-align: center; margin: 28px 0 16px;">
            <a href="${data.ctaUrl || '#'}" class="btn-cta" target="_blank">
              ${data.ctaText || 'تسوق الآن'}
            </a>
          </div>

          ${
            data.items && data.items.length > 0
              ? `
          <div class="items-grid">
            <h4 style="margin: 0 0 16px; font-size: 14px; font-weight: 700; color: #cbd5e1; text-align: center;">تشكيلات مميزة ننصحك بها</h4>
            <table width="100%">
              <tr>
                ${data.items
                  .map(
                    (it) => `
                <td style="width: 50%; padding: 8px; vertical-align: top;">
                  <div style="background: #0f172a; border: 1px solid #334155; border-radius: 12px; overflow: hidden; padding: 10px; text-align: center;">
                    <img src="${it.image}" alt="${it.name}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;">
                    <div style="font-size: 13px; font-weight: 700; color: #f8fafc; margin-bottom: 4px;">${it.name}</div>
                    <div style="font-size: 13px; font-weight: 800; color: #10b981;">${it.price}</div>
                    ${it.originalPrice ? `<div style="font-size: 11px; text-decoration: line-through; color: #64748b;">${it.originalPrice}</div>` : ''}
                  </div>
                </td>`
                  )
                  .join('')}
              </tr>
            </table>
          </div>`
              : ''
          }
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td class="footer">
          <p style="margin: 0 0 8px;">وصلك هذا البريد لأنك مسجل في القائمة البريدية لـ ${data.storeName || 'متجرنا'}.</p>
          <p style="margin: 0 0 8px;">بغداد، العراق • خدمة العملاء المباشرة: 07700000000</p>
          <p style="margin: 0;">
            <a href="#" style="color: #94a3b8; text-decoration: underline;">إلغاء الاشتراك</a> • 
            <a href="#" style="color: #94a3b8; text-decoration: underline;">سياسة الخصوصية</a>
          </p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
}

interface WelcomeEmailTemplateProps {
  data: EmailCampaignData;
  previewDevice?: 'desktop' | 'mobile';
}

export const WelcomeEmailTemplate: React.FC<WelcomeEmailTemplateProps> = ({
  data,
  previewDevice = 'desktop',
}) => {
  const isFlash = data.templateType === 'flash_sale';
  const isLaunch = data.templateType === 'launch';
  const isClearance = data.templateType === 'clearance';
  const isNewsletter = data.templateType === 'newsletter';

  const themeBorder = isFlash
    ? 'border-red-500/40'
    : isLaunch
    ? 'border-purple-500/40'
    : isClearance
    ? 'border-amber-500/40'
    : isNewsletter
    ? 'border-cyan-500/40'
    : 'border-indigo-500/40';

  const themeBtn = isFlash
    ? 'bg-red-600 hover:bg-red-500 shadow-red-500/30'
    : isLaunch
    ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-500/30'
    : isClearance
    ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/30'
    : isNewsletter
    ? 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-500/30'
    : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/30';

  const themeBadge = isFlash
    ? 'bg-red-500/20 text-red-400 border-red-500/40'
    : isLaunch
    ? 'bg-purple-500/20 text-purple-400 border-purple-500/40'
    : isClearance
    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
    : isNewsletter
    ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
    : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40';

  return (
    <div
      className={`mx-auto transition-all duration-300 ${
        previewDevice === 'mobile' ? 'max-w-[375px]' : 'max-w-[620px]'
      }`}
    >
      {/* Container simulating an email body */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl font-sans text-slate-100">
        {/* Header Bar */}
        <div className="bg-slate-950/80 px-6 py-4 border-b border-slate-800/80 text-center">
          <div className="font-extrabold text-base text-white tracking-wide">
            {data.storeName || 'متجر الرافدين الفاخر'}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {data.senderEmail || 'vip@iraq-store.com'}
          </div>
        </div>

        {/* Hero Image */}
        {data.heroImage && (
          <div className="w-full relative bg-slate-950 overflow-hidden max-h-64 sm:max-h-72">
            <img
              src={data.heroImage}
              alt={data.headline}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 sm:p-8 space-y-5">
          {/* Tag / Badge */}
          <div className="flex items-center justify-between">
            <span
              className={`inline-block text-[11px] font-bold px-3 py-1 rounded-full border ${themeBadge}`}
            >
              {isFlash
                ? '⚡ عرض عاجل ومؤقت'
                : isLaunch
                ? '✨ إطلاق منتج جديد'
                : isClearance
                ? '🔥 تصفية موسمية كبرى'
                : isNewsletter
                ? '📰 النشرة البريدية الأسبوعية'
                : '🎁 هدية ترحيبية حصرية'}
            </span>
            {data.expireDate && (
              <span className="text-[11px] text-slate-400 font-mono">
                {data.expireDate}
              </span>
            )}
          </div>

          {/* Headline */}
          <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
            {data.headline}
          </h2>

          {/* Body Text */}
          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
            {data.bodyText}
          </p>

          {/* Coupon Code Block */}
          {data.discountCode && (
            <div
              className={`p-4 sm:p-5 rounded-xl bg-slate-950/90 border-2 border-dashed ${themeBorder} text-center space-y-1.5`}
            >
              <div className="text-xs font-semibold text-slate-400">
                {data.discountPercent || 'كوبون الخصم الخاص بك'}
              </div>
              <div className="font-mono text-2xl font-black text-white tracking-widest selection:bg-indigo-500">
                {data.discountCode}
              </div>
              <div className="text-[11px] text-slate-500">
                انسخ الكود وطبقه في صفحة الدفع للاستفادة من الخصم
              </div>
            </div>
          )}

          {/* CTA Button */}
          <div className="text-center pt-2">
            <a
              href={data.ctaUrl || '#'}
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center justify-center px-8 py-3.5 text-sm font-bold text-white rounded-xl shadow-lg transition-transform active:scale-95 ${themeBtn}`}
            >
              {data.ctaText || 'تسوق التشكيلة الآن'}
            </a>
          </div>

          {/* Featured Items Grid if provided */}
          {data.items && data.items.length > 0 && (
            <div className="pt-6 border-t border-slate-800/80">
              <div className="text-xs font-bold text-slate-400 text-center mb-4 uppercase tracking-wider">
                منتجات مختارة لك
              </div>
              <div className="grid grid-cols-2 gap-3">
                {data.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 text-center flex flex-col justify-between"
                  >
                    <div className="aspect-square w-full rounded-lg overflow-hidden bg-slate-900 mb-2">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white line-clamp-1">
                        {item.name}
                      </div>
                      <div className="text-xs font-bold text-emerald-400 mt-1">
                        {item.price}
                      </div>
                      {item.originalPrice && (
                        <div className="text-[10px] text-slate-500 line-through">
                          {item.originalPrice}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Email Footer */}
        <div className="bg-slate-950 px-6 py-6 border-t border-slate-800 text-center text-[11px] text-slate-500 space-y-2">
          <p>
            تصلك هذه الرسالة لاشتراكك في {data.storeName || 'متجرنا'}. نحن نحترم خصوصيتك دوماً.
          </p>
          <div className="flex items-center justify-center gap-3 text-slate-400">
            <span className="hover:underline cursor-pointer">إلغاء الاشتراك</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">المساعدة والدعم</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">زيارة المتجر</span>
          </div>
          <p className="text-[10px] text-slate-600">
            بغداد، جمهورية العراق © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeEmailTemplate;
