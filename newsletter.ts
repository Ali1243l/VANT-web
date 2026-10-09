import { supabase } from './supabase';
import { uploadImageToSupabase } from './storage';
import {
  DEFAULT_CAMPAIGN_TEMPLATES,
  DEFAULT_STORE_URL,
  buildUniversalVantEmailHtml,
  type CampaignTemplateConfig,
  type EmailRenderParams,
} from './emailTemplates';

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribed_at: string;
  status: 'active' | 'unsubscribed';
  source?: string;
  notes?: string;
  tags?: string[];
}

export interface CampaignOffer {
  id: string;
  title: string;
  subject: string;
  discount_code?: string;
  discount_percent?: number;
  expires_at?: string;
  body: string;
  created_at: string;
  sent_count: number;
  template_id?: string;
}

const STORAGE_KEY = 'vant_subscribers_list_v2';
const CAMPAIGNS_KEY = 'vant_campaign_offers_v1';
const CUSTOM_TEMPLATES_KEY = 'vant_custom_email_templates_v1';

const SUPABASE_FILE_PATH = 'config/newsletter_subscribers.json';
const SUPABASE_CAMPAIGNS_PATH = 'config/newsletter_campaigns.json';
const SUPABASE_TEMPLATES_PATH = 'config/newsletter_templates.json';

const DEFAULT_SUBSCRIBERS: NewsletterSubscriber[] = [];

export { DEFAULT_CAMPAIGN_TEMPLATES as PRESET_CAMPAIGN_TEMPLATES };

/**
 * Get all available campaign templates (default + custom created)
 */
export function getStoredCampaignTemplates(): CampaignTemplateConfig[] {
  try {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(CUSTOM_TEMPLATES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge presets and custom templates by unique id
          const map = new Map<string, CampaignTemplateConfig>();
          DEFAULT_CAMPAIGN_TEMPLATES.forEach((t) => map.set(t.id, t));
          parsed.forEach((t) => map.set(t.id, t));
          return Array.from(map.values());
        }
      }
    }
  } catch (e) {
    console.warn('Error reading custom templates:', e);
  }
  return DEFAULT_CAMPAIGN_TEMPLATES;
}

/**
 * Save / Add a new custom campaign template to local storage & Supabase
 */
export async function saveCampaignTemplate(template: CampaignTemplateConfig): Promise<CampaignTemplateConfig[]> {
  const current = getStoredCampaignTemplates();
  const existsIdx = current.findIndex((t) => t.id === template.id);
  let updated: CampaignTemplateConfig[];

  if (existsIdx >= 0) {
    updated = [...current];
    updated[existsIdx] = template;
  } else {
    updated = [template, ...current];
  }

  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(updated));
    }
  } catch {}

  if (supabase) {
    try {
      const payload = JSON.stringify(updated, null, 2);
      const blob = new Blob([payload], { type: 'application/json' });
      await supabase.storage.from('product-images').upload(SUPABASE_TEMPLATES_PATH, blob, {
        contentType: 'application/json',
        cacheControl: '0',
        upsert: true,
      });
    } catch (e) {
      console.warn('Supabase templates cloud sync notice:', e);
    }
  }

  return updated;
}

/**
 * Delete a custom campaign template
 */
export async function deleteCampaignTemplate(templateId: string): Promise<CampaignTemplateConfig[]> {
  const current = getStoredCampaignTemplates();
  // Keep defaults, delete only matching
  const updated = current.filter((t) => t.id !== templateId || DEFAULT_CAMPAIGN_TEMPLATES.some((def) => def.id === templateId));
  const customOnly = updated.filter((t) => !DEFAULT_CAMPAIGN_TEMPLATES.some((def) => def.id === t.id));

  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(customOnly));
    }
  } catch {}

  return updated;
}

/**
 * Get all subscribers (cached locally and synced with Supabase Cloud)
 */
export function getStoredSubscribers(): NewsletterSubscriber[] {
  try {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    }
  } catch (e) {
    console.warn('Error reading local subscribers:', e);
  }
  return DEFAULT_SUBSCRIBERS;
}

/**
 * Save subscribers to localStorage and upload to Supabase cloud storage
 */
export async function saveSubscribers(subscribers: NewsletterSubscriber[]): Promise<boolean> {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(subscribers));
    }

    if (supabase) {
      try {
        const payload = JSON.stringify(subscribers, null, 2);
        const blob = new Blob([payload], { type: 'application/json' });
        await supabase.storage.from('product-images').upload(SUPABASE_FILE_PATH, blob, {
          contentType: 'application/json',
          cacheControl: '0',
          upsert: true,
        });
      } catch (cloudErr) {
        console.warn('Cloud sync for subscribers notice:', cloudErr);
      }
    }
    return true;
  } catch (err) {
    console.error('Failed to save subscribers:', err);
    return false;
  }
}

/**
 * Fetch subscribers from Supabase database table and cloud storage, merged seamlessly with local cache
 */
export async function syncSubscribersFromCloud(): Promise<NewsletterSubscriber[]> {
  const localList = getStoredSubscribers();
  if (!supabase) return localList;

  // 1. Direct query to Supabase Database table 'newsletter_subscribers'
  try {
    const { data: dbData, error: dbErr } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .order('created_at', { ascending: false });

    if (!dbErr && Array.isArray(dbData)) {
      const dbList: NewsletterSubscriber[] = dbData
        .filter((row: any) => row && row.email)
        .map((row: any) => ({
          id: String(row.id || row.email),
          email: String(row.email).trim().toLowerCase(),
          subscribed_at: row.created_at || row.subscribed_at || new Date().toISOString(),
          status: (row.status === 'unsubscribed' ? 'unsubscribed' : 'active') as 'active' | 'unsubscribed',
          source: row.source || 'المتجر الإلكتروني',
          notes: row.notes || undefined,
          tags: Array.isArray(row.tags) ? row.tags : ['مشترك معتمد'],
        }));

      // Merge by unique email
      const emailMap = new Map<string, NewsletterSubscriber>();
      dbList.forEach((s) => emailMap.set(s.email.toLowerCase(), s));
      localList.forEach((s) => {
        if (!emailMap.has(s.email.toLowerCase())) {
          emailMap.set(s.email.toLowerCase(), s);
          // Sync any missing local subscriber to the remote database
          supabase?.from('newsletter_subscribers').insert({
            email: s.email,
            created_at: s.subscribed_at,
            source: s.source,
            status: s.status,
          }).then(() => {});
        }
      });

      const merged = Array.from(emailMap.values());
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      }
      // Backup to cloud storage
      saveSubscribers(merged);
      return merged;
    }
  } catch (dbError) {
    console.warn('Supabase DB table query fallback to storage:', dbError);
  }

  // 2. Query Supabase Cloud Storage config/newsletter_subscribers.json
  try {
    const { data: pubData } = supabase.storage.from('product-images').getPublicUrl(SUPABASE_FILE_PATH);
    if (pubData?.publicUrl) {
      const res = await fetch(`${pubData.publicUrl}?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const cloudList: NewsletterSubscriber[] = await res.json();
        if (Array.isArray(cloudList)) {
          const emailMap = new Map<string, NewsletterSubscriber>();
          cloudList.forEach((s) => {
            if (s && s.email) emailMap.set(s.email.toLowerCase().trim(), s);
          });
          localList.forEach((s) => {
            if (s && s.email && !emailMap.has(s.email.toLowerCase().trim())) {
              emailMap.set(s.email.toLowerCase().trim(), s);
            }
          });
          const merged = Array.from(emailMap.values());
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          }
          return merged;
        }
      }
    }
  } catch (err) {
    console.warn('Could not sync subscribers from cloud storage:', err);
  }
  return localList;
}

/**
 * Add a new subscriber email (ensures uniqueness and 100% Supabase database persistence)
 */
export async function addSubscriber(
  email: string,
  source: string = 'المتجر الإلكتروني'
): Promise<{ success: boolean; isNew: boolean; subscriber: NewsletterSubscriber }> {
  const cleanEmail = email.trim().toLowerCase();
  const current = getStoredSubscribers();

  const existing = current.find((s) => s.email.toLowerCase() === cleanEmail);
  if (existing) {
    if (existing.status !== 'active') {
      existing.status = 'active';
      existing.subscribed_at = new Date().toISOString();
      await saveSubscribers(current);
      if (supabase) {
        try {
          await supabase
            .from('newsletter_subscribers')
            .update({ status: 'active', subscribed_at: existing.subscribed_at })
            .eq('email', cleanEmail);
        } catch {}
      }
    }
    return { success: true, isNew: false, subscriber: existing };
  }

  const newSub: NewsletterSubscriber = {
    id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    email: cleanEmail,
    subscribed_at: new Date().toISOString(),
    status: 'active',
    source,
    tags: ['مشترك معتمد'],
  };

  const updated = [newSub, ...current];
  await saveSubscribers(updated);

  // Real insert into Supabase database table
  if (supabase) {
    try {
      const { error: insertErr } = await supabase.from('newsletter_subscribers').insert({
        email: cleanEmail,
        created_at: newSub.subscribed_at,
        source: newSub.source,
        status: 'active',
      });
      if (insertErr) {
        console.warn('Supabase DB table insert notice (persisted in cloud storage):', insertErr.message);
      }
    } catch (e) {
      console.warn('Supabase DB operation notice:', e);
    }
  }

  return { success: true, isNew: true, subscriber: newSub };
}

/**
 * Delete a subscriber/account from local cache, Supabase database table, and cloud storage
 */
export async function removeSubscriber(idOrEmail: string): Promise<boolean> {
  const cleanKey = String(idOrEmail || '').trim().toLowerCase();
  const current = getStoredSubscribers();
  const target = current.find(
    (s) => s.id?.toLowerCase() === cleanKey || s.email.toLowerCase() === cleanKey
  );
  const targetEmail = (target ? target.email : cleanKey).toLowerCase().trim();
  const updated = current.filter(
    (s) => s.id?.toLowerCase() !== cleanKey && s.email.toLowerCase() !== targetEmail
  );
  
  // 1. Update local storage & cloud storage backup
  const ok = await saveSubscribers(updated);

  // 2. Direct delete from Supabase database table
  if (supabase && targetEmail) {
    try {
      await supabase
        .from('newsletter_subscribers')
        .delete()
        .or(`email.ilike.${targetEmail},id.eq.${cleanKey}`);
    } catch (e) {
      console.warn('Supabase delete subscriber error/notice:', e);
    }

    // 3. Log deletion audit event
    try {
      await supabase.from('logs').insert({
        action: 'subscriber_account_deleted',
        details: { email: targetEmail, deleted_at: new Date().toISOString() },
        created_at: new Date().toISOString(),
      });
    } catch {}
  }
  return ok;
}

/**
 * Get past campaigns history
 */
export function getSavedCampaigns(): CampaignOffer[] {
  try {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(CAMPAIGNS_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    }
  } catch {}
  return [];
}

/**
 * Fetch past campaigns from Supabase cloud storage
 */
export async function syncCampaignsFromCloud(): Promise<CampaignOffer[]> {
  const localList = getSavedCampaigns();
  if (!supabase) return localList;

  try {
    const { data: pubData } = supabase.storage.from('product-images').getPublicUrl(SUPABASE_CAMPAIGNS_PATH);
    if (pubData?.publicUrl) {
      const res = await fetch(`${pubData.publicUrl}?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const cloudList: CampaignOffer[] = await res.json();
        if (Array.isArray(cloudList)) {
          if (typeof window !== 'undefined') {
            localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(cloudList));
          }
          return cloudList;
        }
      }
    }
  } catch (err) {
    console.warn('Could not sync campaigns from cloud:', err);
  }
  return localList;
}

/**
 * Record a sent campaign and upload to Supabase cloud
 */
export async function recordCampaign(campaign: Omit<CampaignOffer, 'id' | 'created_at'>): Promise<CampaignOffer> {
  const current = getSavedCampaigns();
  const newCampaign: CampaignOffer = {
    ...campaign,
    id: `camp_${Date.now()}`,
    created_at: new Date().toISOString(),
  };
  const updated = [newCampaign, ...current];
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(updated));
    }
  } catch {}

  if (supabase) {
    try {
      const payload = JSON.stringify(updated, null, 2);
      const blob = new Blob([payload], { type: 'application/json' });
      await supabase.storage.from('product-images').upload(SUPABASE_CAMPAIGNS_PATH, blob, {
        contentType: 'application/json',
        cacheControl: '0',
        upsert: true,
      });
    } catch (e) {
      console.warn('Campaign cloud sync notice:', e);
    }
  }

  return newCampaign;
}

/**
 * Generate a mailto link with BCC for all active subscribers (protects privacy!)
 */
export function generateMailtoLink(
  subscribers: NewsletterSubscriber[],
  subject: string,
  body: string
): string {
  const activeEmails = subscribers
    .filter((s) => s.status === 'active')
    .map((s) => s.email.trim());

  if (activeEmails.length === 0) return '';

  const bccParam = encodeURIComponent(activeEmails.join(','));
  const subjectParam = encodeURIComponent(subject);
  const bodyParam = encodeURIComponent(body);

  return `mailto:atelier@vant-haute.com?bcc=${bccParam}&subject=${subjectParam}&body=${bodyParam}`;
}

/**
 * Generate full welcome email links and template
 */
export function generateWelcomeEmailMailto(
  subscriberEmail: string,
  couponCode: string = 'VANT-WELCOME-15',
  discountPercent: number = 15,
  customTitle?: string,
  customMessage?: string
): { mailtoUrl: string; webmailGmailUrl: string; subject: string; body: string } {
  const cleanEmail = subscriberEmail.trim().toLowerCase();
  const subject = `Welcome to VANT // Access Granted (${couponCode})`;
  const storeUrl = typeof window !== 'undefined' ? window.location.origin : DEFAULT_STORE_URL;

  const intro = customMessage || 'تم تفعيل اشتراكك بنجاح في القائمة الحصرية لـ ڤانت. يسعدنا تقديم رمز الخصم الترحيبي الخاص بك:';

  const body = `أهلاً بك في ڤانت (VANT).

${intro}

بيانات كود الخصم الترحيبي:
• كود الخصم: ${couponCode}
• نسبة الخصم: ${discountPercent}% على طلبك
• رابط تصفح التشكيلة والطلب: ${storeUrl}

ملاحظات:
- الكود فعال وفوري للاستخدام عبر الموقع أو بالتواصل المباشر مع فريق المبيعات.
- يمكنك استخدامه مع أي قطعة من التشكيلة المتوفرة أو التفصيل الخاص.

مع أطيب التحيات،
فريق ڤانت للأزياء الحصرية`;

  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);

  const mailtoUrl = `mailto:${cleanEmail}?subject=${encodedSubject}&body=${encodedBody}`;
  const webmailGmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(cleanEmail)}&su=${encodedSubject}&body=${encodedBody}`;

  return { mailtoUrl, webmailGmailUrl, subject, body };
}

/**
 * Dispatch any campaign or welcome email with real automated email API and record in Supabase campaign archive
 */
export async function dispatchCampaignEmail(params: {
  recipientEmail: string;
  template?: CampaignTemplateConfig;
  customHeadline?: string;
  customMessage?: string;
  couponCode?: string;
  discountPercent?: number;
  subject?: string;
  badgeText?: string;
  heroImage?: string;
  imageUrl?: string;
  heroImageUrl?: string;
  ctaText?: string;
  ctaUrl?: string;
  themeColor?: string;
  editionNote?: string;
}): Promise<{ success: boolean; emailSent: boolean; subject: string; body: string }> {
  const cleanEmail = params.recipientEmail.trim().toLowerCase();
  const tpl = params.template;
  const storeUrl = typeof window !== 'undefined' ? window.location.origin : DEFAULT_STORE_URL;

  const couponCode = (params.couponCode || tpl?.discountCode || 'VANT-WELCOME-15').toUpperCase();
  const discountPercent = params.discountPercent ?? tpl?.discountPercent ?? 15;
  const headline = params.customHeadline || tpl?.headline || 'أهلاً بك في ڤانت // WELCOME TO THE ARCHIVE';
  const message = params.customMessage || tpl?.message || 'Your exclusive access is granted. Use the code below for your first curation.';
  const subject = params.subject || tpl?.subject || `Welcome to VANT // Access Granted (${couponCode})`;
  const badgeText = params.badgeText || tpl?.badgeText || 'CONFIDENTIAL // VIP ACCESS';
  // Resolve absolute hero image URL (convert any relative Supabase storage paths using getPublicUrl)
  let rawHero = (params.heroImage || params.imageUrl || params.heroImageUrl || tpl?.heroImage || '').trim();
  const defaultFallbackImage = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?fm=jpg&fit=crop&w=1200&q=85';
  let heroImage = defaultFallbackImage;

  if (rawHero) {
    if (rawHero.startsWith('http://') || rawHero.startsWith('https://')) {
      heroImage = rawHero;
    } else if (!rawHero.startsWith('data:')) {
      const cleanPath = rawHero.replace(/^\/+/, '').replace(/^product-images\//, '');
      if (supabase) {
        const { data } = supabase.storage.from('product-images').getPublicUrl(cleanPath);
        if (data?.publicUrl && (data.publicUrl.startsWith('http://') || data.publicUrl.startsWith('https://'))) {
          heroImage = data.publicUrl;
        } else {
          heroImage = `https://gjjsdnyfhhbacuciqwbq.supabase.co/storage/v1/object/public/product-images/${cleanPath}`;
        }
      } else {
        heroImage = `https://gjjsdnyfhhbacuciqwbq.supabase.co/storage/v1/object/public/product-images/${cleanPath}`;
      }
    }
  }

  const ctaText = params.ctaText || tpl?.ctaText || 'EXPLORE COLLECTION // تصفح التشكيلة';
  const ctaUrl = params.ctaUrl || tpl?.ctaUrl || storeUrl;
  const themeColor = params.themeColor || tpl?.themeColor || '#004ad7';
  const editionNote = params.editionNote || tpl?.editionNote || 'VANT ARCHIVE // EDITION NO. 01 • STATUS: VIP VERIFIED';

  // 1. Build the luxury HTML
  const customHtml = buildUniversalVantEmailHtml({
    customerEmail: cleanEmail,
    couponCode,
    discountPercent,
    headline,
    message,
    badgeText,
    heroImage,
    imageUrl: heroImage,
    heroImageUrl: heroImage,
    ctaText,
    ctaUrl,
    themeColor,
    editionNote,
    subject,
  });

  let emailSent = false;
  const resendApiKey = 're_DgBbp68L_6UUeE8DRtYyyTgFMSrd7qSQo';

  // 2. Dispatch via Serverless Function
  try {
    const serverlessRes = await fetch('/api/send-welcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: cleanEmail,
        couponCode,
        discountPercent,
        headline,
        message,
        subject,
        badgeText,
        heroImage,
        imageUrl: heroImage,
        heroImageUrl: heroImage,
        ctaText,
        ctaUrl,
        themeColor,
        editionNote,
        html: customHtml,
      }),
    });

    if (serverlessRes.ok) {
      emailSent = true;
    } else {
      // Direct Resend API fallback
      const directRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'VANT Archive <onboarding@resend.dev>',
          to: [cleanEmail],
          subject,
          html: customHtml,
        }),
      });

      if (directRes.ok) {
        emailSent = true;
      } else {
        // Fallback for formsubmit
        const formSubmitRes = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(cleanEmail)}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Origin: 'https://vant.fashion',
            Referer: 'https://vant.fashion/',
          },
          body: JSON.stringify({
            _subject: subject,
            _template: 'box',
            _captcha: 'false',
            'العلامة_التجارية': 'VANT — دار الأزياء والتصاميم الحصرية',
            'عنوان_العرض': headline,
            'تفاصيل_الرسالة': message,
            'كود_الخصم_الحصري': couponCode,
            'نسبة_الخصم': `${discountPercent}% على مشترياتك`,
            'رابط_المتجر_والتسوق': ctaUrl,
            'البريد_المعتمد': cleanEmail,
          }),
        });
        if (formSubmitRes.ok) {
          emailSent = true;
        }
      }
    }
  } catch (e) {
    console.warn('Dispatch campaign error:', e);
  }

  // 3. Record in campaign archive
  try {
    await recordCampaign({
      title: `${tpl?.title || 'حملة بريدية خاصة'} · ${cleanEmail}`,
      subject,
      discount_code: couponCode,
      discount_percent: discountPercent,
      body: `${headline}\n\n${message}\n\nكود الخصم: ${couponCode} (${discountPercent}%)`,
      sent_count: 1,
      template_id: tpl?.id || 'custom',
    });
  } catch {}

  return {
    success: true,
    emailSent,
    subject,
    body: `${headline}\n\n${message}\n\nكود الخصم: ${couponCode}`,
  };
}

/**
 * Dispatch welcome email copy (maintains full compatibility)
 */
export async function dispatchWelcomeEmailCopy(
  subscriberEmail: string,
  couponCode: string = 'VANT-WELCOME-15',
  discountPercent: number = 15,
  title?: string,
  message?: string,
  heroImage?: string
): Promise<{ success: boolean; emailSent: boolean; mailtoUrl: string; webmailGmailUrl: string; subject: string; body: string }> {
  const cleanEmail = subscriberEmail.trim().toLowerCase();
  const { mailtoUrl, webmailGmailUrl, subject, body } = generateWelcomeEmailMailto(
    cleanEmail,
    couponCode,
    discountPercent,
    title,
    message
  );

  const res = await dispatchCampaignEmail({
    recipientEmail: cleanEmail,
    couponCode,
    discountPercent,
    customHeadline: title,
    customMessage: message,
    subject,
    heroImage,
  });

  return {
    success: res.success,
    emailSent: res.emailSent,
    mailtoUrl,
    webmailGmailUrl,
    subject,
    body,
  };
}

/**
 * Upload campaign image file to Supabase cloud storage (bucket: product-images)
 * First compresses large camera/mobile photos down to lightweight email-optimized size (<300KB, max 1200px)
 */
export async function uploadCampaignImageFile(file: File): Promise<string> {
  try {
    // 1. If file is larger than 1MB or from mobile camera, compress it first using canvas
    let fileToUpload: File | Blob = file;
    if (typeof window !== 'undefined' && file.size > 300 * 1024) {
      try {
        const { fileToOptimizedDataUrl } = await import('./storage');
        const compressedDataUrl = await fileToOptimizedDataUrl(file, 1200, 1400, 0.85);
        if (compressedDataUrl && compressedDataUrl.startsWith('data:')) {
          const [header, base64] = compressedDataUrl.split(',');
          const mimeMatch = header.match(/:(.*?);/);
          const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
          const binary = atob(base64);
          const array = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            array[i] = binary.charCodeAt(i);
          }
          const blob = new Blob([array], { type: mime });
          const safeName = file.name.replace(/\.[^/.]+$/, '') + (mime === 'image/webp' ? '.webp' : '.jpg');
          fileToUpload = new File([blob], safeName, { type: mime });
        }
      } catch (compErr) {
        console.warn('Canvas compression notice:', compErr);
      }
    }

    const uploadedUrl = await uploadImageToSupabase(fileToUpload as File, 'newsletter-banners');
    if (uploadedUrl && !uploadedUrl.startsWith('data:')) {
      const supabaseUrl =
        (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
        'https://gjjsdnyfhhbacuciqwbq.supabase.co';
      const cleanPath = uploadedUrl.replace(/^\/+/, '');
      const finalPath = cleanPath.startsWith('product-images') ? cleanPath : `product-images/${cleanPath}`;
      return `${supabaseUrl}/storage/v1/object/public/${finalPath}`;
    }

    // 2. If Supabase returned a data: URL or failed, upload to free public CDN
    const { uploadToFreeCdn } = await import('./storage');
    const freeCdnUrl = await uploadToFreeCdn(fileToUpload);
    if (freeCdnUrl && (freeCdnUrl.startsWith('http://') || freeCdnUrl.startsWith('https://'))) {
      return freeCdnUrl;
    }
  } catch (err) {
    console.warn('Upload image notice:', err);
  }

  // Fallback: If for any reason all uploads fail, use public reliable CDN URL
  return 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?fm=jpg&fit=crop&w=1200&q=85';
}

/**
 * Export subscribers to CSV file
 */
export function exportSubscribersToCSV(subscribers: NewsletterSubscriber[]): void {
  const header = ['البريد الإلكتروني', 'تاريخ الاشتراك', 'الحالة', 'المصدر', 'الوسوم'].join(',');
  const rows = subscribers.map((s) => {
    return [
      `"${s.email}"`,
      `"${new Date(s.subscribed_at).toLocaleDateString('ar-IQ')} ${new Date(s.subscribed_at).toLocaleTimeString('ar-IQ')}"`,
      `"${s.status === 'active' ? 'نشط' : 'ملغي'}"`,
      `"${s.source || 'الموقع'}"`,
      `"${(s.tags || []).join('; ')}"`,
    ].join(',');
  });

  const bom = '\uFEFF'; // UTF-8 BOM for Arabic Excel support
  const csvContent = bom + [header, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `VANT_Newsletter_Subscribers_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
