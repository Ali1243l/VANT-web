export interface CampaignTemplateConfig {
  id: string;
  type: 'welcome' | 'drop' | 'flash_sale' | 'loyalty' | 'restock' | 'custom';
  title: string;
  titleEn: string;
  subject: string;
  badgeText: string;
  badgeTextEn: string;
  headline: string;
  headlineEn: string;
  message: string;
  messageEn: string;
  discountCode: string;
  discountPercent: number;
  heroImage: string;
  ctaText: string;
  ctaTextEn: string;
  ctaUrl?: string;
  themeColor?: string;
  editionNote?: string;
}

export const DEFAULT_STORE_URL = 'https://vant-web.vercel.app/';

export const DEFAULT_CAMPAIGN_TEMPLATES: CampaignTemplateConfig[] = [
  {
    id: 'tpl_welcome_vip',
    type: 'welcome',
    title: 'الترحيب بالعضوية الحصرية · كود 15%',
    titleEn: 'VIP Welcome Invitation · 15% OFF',
    subject: 'Welcome to VANT // Access Granted (VANT-WELCOME-15)',
    badgeText: 'VIP PRIVILEGE ACCESS',
    badgeTextEn: 'VIP PRIVILEGE ACCESS',
    headline: 'أهلاً بك في الأرشيف الخاص لـ ڤانت',
    headlineEn: 'WELCOME TO THE VANT ARCHIVE',
    message: 'يسعدنا انضمامك إلى القائمة الحصرية لعشاق الخياطة الراقية والتصاميم المعمارية الفاخرة. استمتع بتجربة تسوق استثنائية مع كود الخصم الترحيبي الخاص بطلبك الأول.',
    messageEn: 'Your exclusive membership access is granted. Enjoy a bespoke curation experience with your private welcome discount code below.',
    discountCode: 'VANT-WELCOME-15',
    discountPercent: 15,
    heroImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
    ctaText: 'تصفح قائمة عروض الخصم الآن',
    ctaTextEn: 'EXPLORE OFFERS & SALE COLLECTION',
    ctaUrl: DEFAULT_STORE_URL,
    themeColor: '#004ad7',
    editionNote: 'EDITION NO. 01 · VIP VERIFIED',
  },
  {
    id: 'tpl_new_drop',
    type: 'drop',
    title: 'إطلاق كبسولة الشتاء الحصرية · كود مبكر',
    titleEn: 'Winter Runway Drop · Early Access 20%',
    subject: 'VANT Capsule Drop // Limited Edition Release (WINTER-VIP-20)',
    badgeText: 'LIMITED RUNWAY DROP',
    badgeTextEn: 'LIMITED RUNWAY DROP',
    headline: 'إطلاق كبسولة شتاء 2026 — كميات محدودة',
    headlineEn: 'WINTER 2026 ARCHIVE RELEASE',
    message: 'يسرنا إعلامك بإطلاق التشكيلة الجديدة من المعاطف والبدلات الصوفية الإيطالية وتصاميم الأوفرسايز المبتكرة. بصفتك من مشتركي الأرشيف الخاص، نوفر لك إمكانية الحجز المبكر قبل نفاذ الكميات.',
    messageEn: 'Announcing the latest runway drop of Italian wool overcoats and avant-garde tailored silhouettes. Priority reservation is now open for private members.',
    discountCode: 'WINTER-VIP-20',
    discountPercent: 20,
    heroImage: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80',
    ctaText: 'حجز قطع العرض وتطبيق الخصم',
    ctaTextEn: 'SECURE YOUR PIECE // EARLY ACCESS',
    ctaUrl: DEFAULT_STORE_URL,
    themeColor: '#004ad7',
    editionNote: 'RUNWAY CAPSULE · LIMITED RUN',
  },
  {
    id: 'tpl_weekend_sale',
    type: 'flash_sale',
    title: 'عرض الخزنة الخاصة لـ 48 ساعة · خصم 25%',
    titleEn: '48-Hour Vault Access · 25% OFF',
    subject: 'VANT Private Vault // 48-Hour Privilege (FLASH-48H-25)',
    badgeText: '48-HOUR FLASH PRIVILEGE',
    badgeTextEn: '48-HOUR FLASH PRIVILEGE',
    headline: 'فتح الخزنة الخاصة — تخفيض 25% لمدة 48 ساعة',
    headlineEn: 'PRIVATE VAULT UNLOCKED · 48H FLASH',
    message: 'دعوة خاصة ومحدودة للاستفادة من تخفيض فوري بنسبة 25% على قطع مختارة من الكتالوج الرسمي. العرض سارٍ لنهاية عطلة الأسبوع أو حتى نفاذ الكميات.',
    messageEn: 'A privileged 48-hour window has unlocked for archive members. Receive 25% off curated architectural garments before the vault closes.',
    discountCode: 'FLASH-48H-25',
    discountPercent: 25,
    heroImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',
    ctaText: 'تسوق قطع الخزنة المخفضة',
    ctaTextEn: 'ENTER PRIVATE VAULT // SHOP SALE',
    ctaUrl: DEFAULT_STORE_URL,
    themeColor: '#004ad7',
    editionNote: 'TIME-LIMITED CURATION · 48 HOURS',
  },
  {
    id: 'tpl_loyalty_gift',
    type: 'loyalty',
    title: 'هدية وشكر للعضوية الماسية · خصم 30%',
    titleEn: 'VIP Loyalty Reward · 30% Privilege',
    subject: 'VANT Noir Tier // Private Client Reward (LOYALTY-NOIR-30)',
    badgeText: 'VIP NOIR REWARD',
    badgeTextEn: 'VIP NOIR REWARD',
    headline: 'مكافأة الولاء الخاص — خصم 30% وشحن مجاني',
    headlineEn: 'PRIVATE CLIENT APPRECIATION · 30% OFF',
    message: 'تقديراً لثقتك الدائمة بدار ڤانت، يسرنا منحك رمز الخصم الأعلى لهذا الموسم مع خدمة التفصيل والتوصيل السريع مجاناً لكافة مشترياتك القادمة.',
    messageEn: 'In celebration of your continued patronage, we grant you our highest seasonal privilege code along with complimentary bespoke fitting and priority courier dispatch.',
    discountCode: 'LOYALTY-NOIR-30',
    discountPercent: 30,
    heroImage: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=80',
    ctaText: 'تصفح عروض العضوية الماسية',
    ctaTextEn: 'REDEEM NOIR PRIVILEGE',
    ctaUrl: DEFAULT_STORE_URL,
    themeColor: '#004ad7',
    editionNote: 'TIER NOIR · BESPOKE COURTESY',
  },
  {
    id: 'tpl_restock_alert',
    type: 'restock',
    title: 'إشعار توفر القطع الأكثر طلباً · كود خاص',
    titleEn: 'Restock Alert · Most Wanted Garments',
    subject: 'Restocked // Iconic Silhouettes Return (RESTOCK-VANT)',
    badgeText: 'RESTOCK NOTIFICATION',
    badgeTextEn: 'RESTOCK NOTIFICATION',
    headline: 'عادت للتو — إعادة توفير القطع الأكثر طلباً',
    headlineEn: 'ICONIC PIECES RESTOCKED',
    message: 'بناءً على طلباتكم المتكررة، تمت إعادة توفير القطع الأكثر طلباً من التيشيرتات المعمارية والبدلات الرجالية الفاخرة بإصدارات مرقمة جديدة.',
    messageEn: 'By private demand, our most sought-after oversized shirts and tailored architectural coats have been remanufactured in strictly limited quantities.',
    discountCode: 'RESTOCK-VANT',
    discountPercent: 10,
    heroImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
    ctaText: 'تصفح القطع المعاد توفيرها',
    ctaTextEn: 'VIEW RESTOCKED COLLECTION',
    ctaUrl: DEFAULT_STORE_URL,
    themeColor: '#004ad7',
    editionNote: 'LIMITED RESTOCK · SERIALIZED RUN',
  },
];

export interface EmailRenderParams {
  customerEmail?: string;
  couponCode?: string;
  discountPercent?: number;
  headline?: string;
  message?: string;
  badgeText?: string;
  heroImage?: string;
  imageUrl?: string;
  heroImageUrl?: string;
  ctaText?: string;
  ctaUrl?: string;
  themeColor?: string;
  editionNote?: string;
  subject?: string;
}

/**
 * Universal Ultra-Luxury HTML Email Template Generator
 * 100% Mobile & PC Client Safe (Gmail, Apple Mail, Outlook, Yahoo)
 * Eliminates broken images, fixes font rendering, and aligns RTL/LTR perfectly.
 */
export function buildUniversalVantEmailHtml(params: EmailRenderParams): string {
  const customerEmail = params.customerEmail || 'member@vant.archive';
  const couponCode = (params.couponCode || 'VANT-WELCOME-15').toUpperCase();
  const discountPercent = params.discountPercent ?? 15;
  const headline = params.headline || 'أهلاً بك في الأرشيف الخاص لـ ڤانت';
  const message = params.message || 'يسعدنا انضمامك إلى القائمة الحصرية لعشاق الخياطة الراقية والتصاميم المعمارية الفاخرة. استمتع بتجربة تسوق استثنائية مع كود الخصم الخاص بطلبك.';
  const badgeText = params.badgeText || 'VIP PRIVILEGE ACCESS';
  
  // Clean hero image (never send base64 data URI, ensure absolute public URL and Google Image Proxy compatibility)
  const rawHeroImage = (params.heroImage || params.imageUrl || params.heroImageUrl || '').trim();
  const defaultFallbackImage = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?fm=jpg&fit=crop&w=1200&q=85';
  let heroImage = '';

  if (rawHeroImage.startsWith('http://') || rawHeroImage.startsWith('https://')) {
    heroImage = rawHeroImage;
  } else if (rawHeroImage && !rawHeroImage.startsWith('data:')) {
    const cleanPath = rawHeroImage.replace(/^\/+/, '').replace(/^product-images\//, '');
    heroImage = `https://gjjsdnyfhhbacuciqwbq.supabase.co/storage/v1/object/public/product-images/${cleanPath}`;
  } else {
    heroImage = defaultFallbackImage;
  }

  if (!heroImage) {
    heroImage = defaultFallbackImage;
  }

  // If Unsplash URL, ensure it returns JPG instead of AVIF for Google Image Proxy
  if (heroImage.includes('unsplash.com')) {
    heroImage = heroImage.replace('auto=format', 'fm=jpg');
    if (!heroImage.includes('fm=jpg') && !heroImage.includes('fm=jpeg')) {
      heroImage += (heroImage.includes('?') ? '&' : '?') + 'fm=jpg&q=85';
    }
  }
  
  const ctaText = params.ctaText || 'تصفح قائمة عروض الخصم واستفد من الكوبون';
  const baseCtaUrl = (params.ctaUrl || DEFAULT_STORE_URL).trim();
  
  // Construct direct link to the Offers view with coupon parameter
  const separator = baseCtaUrl.includes('?') ? '&' : '?';
  const offersWithCouponUrl = `${baseCtaUrl}${separator}filter=offers&coupon=${encodeURIComponent(couponCode)}`;
  
  const editionNote = params.editionNote || 'EDITION NO. 01 · VIP VERIFIED';

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <title>VANT // VIP ACCESS</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body, table, td, p, a, li, blockquote {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Tahoma, Arial, 'Helvetica Neue', sans-serif;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    @media only screen and (max-width: 620px) {
      .vant-container {
        width: 100% !important;
        border-radius: 16px !important;
      }
      .vant-hero-img {
        width: 100% !important;
        height: auto !important;
      }
      .vant-headline {
        font-size: 18px !important;
      }
      .vant-code {
        font-size: 20px !important;
        letter-spacing: 3px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 20px 10px; background-color: #06070a; color: #f3f4f6; -webkit-font-smoothing: antialiased; direction: rtl; text-align: right;">
  
  <!-- OUTER WRAPPER CONTAINER -->
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" class="vant-container" style="max-width: 580px; background-color: #0d1017; border: 1px solid rgba(255, 255, 255, 0.14); border-radius: 24px; margin: 0 auto; box-shadow: 0 25px 60px rgba(0, 0, 0, 0.95); overflow: hidden;">
    
    <!-- 1. TOP METADATA BAR -->
    <tr>
      <td style="padding: 12px 24px; background-color: #06080d; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
        <table width="100%" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td align="right" dir="ltr" style="font-family: 'Courier New', monospace, Tahoma; font-size: 10px; color: #94a3b8; letter-spacing: 1px;">
              ${editionNote}
            </td>
            <td align="left" dir="ltr" style="font-family: 'Courier New', monospace, Tahoma; font-size: 10px; color: #3b82f6; font-weight: bold; letter-spacing: 1px;">
              &bull; OFFICIAL ARCHIVE
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- 2. BRAND LOGO HEADER -->
    <tr>
      <td align="center" style="padding: 32px 24px 24px 24px; background: linear-gradient(180deg, #131824 0%, #0d1017 100%); border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
        <table border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center">
              <a href="${offersWithCouponUrl}" target="_blank" style="text-decoration: none;">
                <h1 style="margin: 0; font-size: 34px; font-weight: 900; letter-spacing: 10px; color: #ffffff; text-transform: uppercase; line-height: 1; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Tahoma, Arial, sans-serif;">
                  VANT
                </h1>
              </a>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top: 8px;">
              <span dir="ltr" style="display: inline-block; font-size: 10px; letter-spacing: 3px; color: #94a3b8; text-transform: uppercase; font-family: 'Courier New', monospace, Tahoma; font-weight: bold;">
                HIGH-FASHION ARCHIVE &bull; HAUTE STREETWEAR
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- 3. HERO IMAGE BANNER (100% GMAIL / IPHONE / ANDROID COMPATIBLE) -->
    <tr>
      <td align="center" style="padding: 20px 20px 0 20px;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #121722; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.16); overflow: hidden;">
          <tr>
            <td align="center" style="line-height: 0;">
              <a href="${offersWithCouponUrl}" target="_blank" style="display: block; text-decoration: none;">
                <img
                  src="${heroImage}"
                  alt="VANT Luxury Haute Streetwear & Architecture Archive"
                  class="vant-hero-img"
                  width="540"
                  border="0"
                  style="display: block; width: 100% !important; max-width: 540px !important; height: auto !important; border: none; outline: none; text-decoration: none; margin: 0 auto; background-color: #121722;"
                />
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- 4. HEADLINE & MESSAGE CARD -->
    <tr>
      <td style="padding: 18px 20px 0 20px;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #121724; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 18px; padding: 22px;">
          <tr>
            <td align="right" dir="rtl" style="text-align: right;">
              <div style="display: inline-block; padding: 4px 12px; background-color: rgba(0, 74, 215, 0.3); border: 1px solid rgba(59, 130, 246, 0.5); border-radius: 20px; font-size: 10.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Tahoma, Arial, sans-serif; letter-spacing: 1px; color: #93c5fd; font-weight: bold; margin-bottom: 12px;">
                ${badgeText}
              </div>
              <h2 class="vant-headline" style="margin: 0 0 10px 0; font-size: 20px; font-weight: 800; color: #ffffff; line-height: 1.4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Tahoma, Arial, sans-serif;">
                ${headline}
              </h2>
              <p style="margin: 0; font-size: 13.5px; color: #cbd5e1; line-height: 1.7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Tahoma, Arial, sans-serif;">
                ${message}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- 5. VIP VOUCHER CARD (PRISTINE CODE DISPLAY) -->
    <tr>
      <td style="padding: 18px 20px 20px 20px;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background: linear-gradient(180deg, #151c2a 0%, #0f1420 100%); border: 1px solid rgba(59, 130, 246, 0.45); border-radius: 20px; padding: 22px; box-shadow: 0 10px 30px rgba(0, 74, 215, 0.2);">
          
          <!-- Top Tag Bar -->
          <tr>
            <td style="padding-bottom: 14px; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
              <table width="100%" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="right" dir="rtl" style="font-size: 13px; font-weight: bold; color: #ffffff; text-align: right; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Tahoma, Arial, sans-serif;">
                    كود الخصم الحصري الخاص بك
                  </td>
                  <td align="left" dir="ltr" style="text-align: left;">
                    <span style="display: inline-block; font-size: 11.5px; font-weight: 900; color: #ffffff; background-color: #004ad7; border-radius: 20px; padding: 4px 14px; letter-spacing: 0.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Tahoma, Arial, sans-serif;">
                      خصم ${discountPercent}%
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- High-Contrast Monospace Code Box -->
          <tr>
            <td align="center" style="padding: 16px 0 12px 0;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #040508; border: 1.5px solid #3b82f6; border-radius: 14px;">
                <tr>
                  <td align="center" style="padding: 16px 20px;">
                    <span class="vant-code" dir="ltr" style="font-family: 'Courier New', monospace; font-size: 24px; font-weight: 900; letter-spacing: 5px; color: #60a5fa; text-transform: uppercase; user-select: all; -webkit-user-select: all;">
                      ${couponCode}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Guidance Note -->
          <tr>
            <td align="center" dir="rtl" style="font-size: 11.5px; color: #cbd5e1; padding-top: 2px; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Tahoma, Arial, sans-serif;">
              &bull; انسخ الكود أعلاه، أو اضغط على الزر أدناه لتطبيقه تلقائياً وفتح قائمة التخفيضات
            </td>
          </tr>

        </table>
      </td>
    </tr>

    <!-- 6. PRIMARY CTA ACTION BUTTON -->
    <tr>
      <td align="center" style="padding: 0 20px 20px 20px;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="background-color: #004ad7; border-radius: 16px; box-shadow: 0 8px 25px rgba(0, 74, 215, 0.45);">
              <a href="${offersWithCouponUrl}" target="_blank" style="display: block; width: 100%; box-sizing: border-box; color: #ffffff; text-decoration: none; padding: 16px 24px; font-size: 14px; font-weight: 900; text-align: center; border-radius: 16px; letter-spacing: 0.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Tahoma, Arial, sans-serif;">
                ${ctaText} &larr;
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- 7. RECIPIENT VERIFICATION DOSSIER -->
    <tr>
      <td style="padding: 0 20px 20px 20px;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border: 1px solid rgba(255, 255, 255, 0.08); background-color: rgba(255, 255, 255, 0.02); border-radius: 14px; padding: 14px 18px;">
          <tr>
            <td align="right" dir="rtl" style="padding-bottom: 6px; font-size: 11.5px; color: #94a3b8; text-align: right; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Tahoma, Arial, sans-serif;">
              البريد المعتمد: <span dir="ltr" style="color: #ffffff; font-family: 'Courier New', monospace; font-weight: bold;">${customerEmail}</span>
            </td>
          </tr>
          <tr>
            <td align="right" dir="rtl" style="font-size: 11.5px; color: #94a3b8; text-align: right; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Tahoma, Arial, sans-serif;">
              رابط المتجر الرسمي: <a href="${baseCtaUrl}" target="_blank" dir="ltr" style="color: #60a5fa; text-decoration: underline; font-family: 'Courier New', monospace;">${baseCtaUrl}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- 8. FOOTER LEGAL & ARCHIVE SIGNATURE -->
    <tr>
      <td align="center" style="padding: 24px 20px; background-color: #06080d; border-top: 1px solid rgba(255, 255, 255, 0.08); font-size: 10px; color: #64748b; text-align: center;">
        <p dir="ltr" style="margin: 0 0 6px 0; color: #94a3b8; font-weight: bold; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Tahoma, Arial, sans-serif; letter-spacing: 1px;">
          VANT ATELIER &bull; ALL RIGHTS RESERVED &bull; 2026
        </p>
        <p dir="rtl" style="margin: 0; font-size: 10.5px; color: #475569; line-height: 1.5; max-width: 440px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Tahoma, Arial, sans-serif;">
          هذه الرسالة مخصصة للمشترك المعتمد في أرشيف ڤانت. يمكنك إلغاء الاشتراك في أي وقت عبر زيارة الموقع.
        </p>
      </td>
    </tr>

  </table>
</body>
</html>`;
}
