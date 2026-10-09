import { Resend } from 'resend';

export const config = {
  runtime: 'nodejs',
};

const DEFAULT_STORE_URL = 'https://vant-web.vercel.app/';

export default async function handler(req: any, res: any) {
  // Enable CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const recipientEmail = (body.email || body.to || '').trim().toLowerCase();
    const couponCode = (body.couponCode || 'VANT-WELCOME-15').toUpperCase();
    const discountPercent = body.discountPercent ?? 15;
    const headline = body.headline || body.welcomeTitle || 'أهلاً بك في الأرشيف الخاص لـ ڤانت';
    const message =
      body.message ||
      body.welcomeMessage ||
      'يسعدنا انضمامك إلى القائمة الحصرية لعشاق الخياطة الراقية والتصاميم المعمارية الفاخرة. استمتع بتجربة تسوق استثنائية مع كود الخصم الخاص بطلبك.';
    const badgeText = body.badgeText || 'VIP PRIVILEGE ACCESS';
    
    // Clean hero image (never send base64 data URI to email clients, ensure absolute Supabase public URL and Google Image Proxy compatibility)
    const rawHeroImage = (body.heroImage || body.imageUrl || body.heroImageUrl || body.image || body.welcomeImage || '').trim();
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

    if (heroImage.includes('unsplash.com')) {
      heroImage = heroImage.replace('auto=format', 'fm=jpg');
      if (!heroImage.includes('fm=jpg') && !heroImage.includes('fm=jpeg')) {
        heroImage += (heroImage.includes('?') ? '&' : '?') + 'fm=jpg&q=85';
      }
    }

    const ctaText = body.ctaText || 'تصفح قائمة عروض الخصم واستفد من الكوبون';
    const baseCtaUrl = (body.ctaUrl || body.storeUrl || DEFAULT_STORE_URL).trim();
    const separator = baseCtaUrl.includes('?') ? '&' : '?';
    const offersWithCouponUrl = `${baseCtaUrl}${separator}filter=offers&coupon=${encodeURIComponent(couponCode)}`;

    const editionNote = body.editionNote || 'EDITION NO. 01 · VIP VERIFIED';
    const subject =
      body.subject ||
      `Welcome to VANT // Access Granted (${couponCode})`;

    if (!recipientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      return res.status(400).json({ success: false, error: 'Invalid recipient email address' });
    }

    const resendApiKey =
      process.env.RESEND_API_KEY ||
      process.env.VITE_RESEND_API_KEY ||
      're_DgBbp68L_6UUeE8DRtYyyTgFMSrd7qSQo';

    // Bulletproof HTML email with mobile image support & direct offers routing
    const htmlContent = body.html || `<!DOCTYPE html>
<html lang="ar" dir="rtl" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <title>VANT // VIP ARCHIVE</title>
  <style>
    body, table, td, p, a { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Tahoma, Arial, sans-serif; }
    @media only screen and (max-width: 620px) {
      .vant-container { width: 100% !important; border-radius: 16px !important; }
      .vant-hero-img { width: 100% !important; height: auto !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 20px 10px; background-color: #06070a; color: #f3f4f6; -webkit-font-smoothing: antialiased; direction: rtl; text-align: right;">
  
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" class="vant-container" style="max-width: 580px; background-color: #0d1017; border: 1px solid rgba(255, 255, 255, 0.14); border-radius: 24px; margin: 0 auto; box-shadow: 0 25px 60px rgba(0, 0, 0, 0.95); overflow: hidden;">
    
    <!-- TOP STATUS BAR -->
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

    <!-- BRAND LOGO HEADER -->
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

    <!-- HERO IMAGE -->
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

    <!-- HEADLINE & MESSAGE CARD -->
    <tr>
      <td style="padding: 18px 20px 0 20px;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #121724; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 18px; padding: 22px;">
          <tr>
            <td align="right" dir="rtl" style="text-align: right;">
              <div style="display: inline-block; padding: 4px 12px; background-color: rgba(0, 74, 215, 0.3); border: 1px solid rgba(59, 130, 246, 0.5); border-radius: 20px; font-size: 10.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Tahoma, Arial, sans-serif; letter-spacing: 1px; color: #93c5fd; font-weight: bold; margin-bottom: 12px;">
                ${badgeText}
              </div>
              <h2 style="margin: 0 0 10px 0; font-size: 20px; font-weight: 800; color: #ffffff; line-height: 1.4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Tahoma, Arial, sans-serif;">
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

    <!-- VIP VOUCHER CARD -->
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

    <!-- CTA ACTION BUTTON -->
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

    <!-- RECIPIENT VERIFICATION DOSSIER -->
    <tr>
      <td style="padding: 0 20px 20px 20px;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border: 1px solid rgba(255, 255, 255, 0.08); background-color: rgba(255, 255, 255, 0.02); border-radius: 14px; padding: 14px 18px;">
          <tr>
            <td align="right" dir="rtl" style="padding-bottom: 6px; font-size: 11.5px; color: #94a3b8; text-align: right; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Tahoma, Arial, sans-serif;">
              البريد المعتمد: <span dir="ltr" style="color: #ffffff; font-family: 'Courier New', monospace; font-weight: bold;">${recipientEmail}</span>
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

    <!-- FOOTER LEGAL -->
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

    // Ensure all <img> tags in htmlContent strictly have absolute https:// URLs (prevents Gmail from stripping src)
    let finalHtml = htmlContent;
    finalHtml = finalHtml.replace(/src=["']product-images\/([^"']+)["']/g, 'src="https://gjjsdnyfhhbacuciqwbq.supabase.co/storage/v1/object/public/product-images/$1"');
    finalHtml = finalHtml.replace(/src=["']newsletter-banners\/([^"']+)["']/g, 'src="https://gjjsdnyfhhbacuciqwbq.supabase.co/storage/v1/object/public/product-images/newsletter-banners/$1"');
    finalHtml = finalHtml.replace(/src=["']catalog\/([^"']+)["']/g, 'src="https://gjjsdnyfhhbacuciqwbq.supabase.co/storage/v1/object/public/product-images/catalog/$1"');

    if (!resendApiKey) {
      return res.status(200).json({
        success: true,
        previewOnly: true,
        message: 'Resend API key missing on server, simulated email dispatch successfully.',
        subject,
        htmlPreview: finalHtml,
      });
    }

    const resend = new Resend(resendApiKey);

    const data = await resend.emails.send({
      from: 'VANT Archive <onboarding@resend.dev>',
      to: [recipientEmail],
      subject,
      html: finalHtml,
    });

    return res.status(200).json({
      success: true,
      message: 'Luxury Welcome Email sent successfully',
      data,
    });
  } catch (error: any) {
    console.error('Error in /api/send-welcome:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal Server Error',
    });
  }
}
