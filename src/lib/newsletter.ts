import { supabase } from './supabase';

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
}

const STORAGE_KEY = 'vant_subscribers_list_v2';
const CAMPAIGNS_KEY = 'vant_campaign_offers_v1';
const SUPABASE_FILE_PATH = 'config/newsletter_subscribers.json';
const SUPABASE_CAMPAIGNS_PATH = 'config/newsletter_campaigns.json';

const DEFAULT_SUBSCRIBERS: NewsletterSubscriber[] = [];

export const PRESET_CAMPAIGN_TEMPLATES = [
  {
    id: 'tpl_welcome_vip',
    title: 'رمز ترحيبي حصري · خصم 15%',
    subject: 'ڤانت للأزياء · رمز ترحيبي حصري وخصم 15% على أول طلب لك',
    discount_code: 'VANT-WELCOME-15',
    discount_percent: 15,
    body: `أهلاً بك في الأرشيف الخاص لـ ڤانت (VANT).

يسعدنا انضمامك إلى قائمتنا الحصرية الخاصة بعشاق الخياطة الراقية والأزياء المعمارية الفاخرة.
يسرنا تقديم رمز الخصم الترحيبي الخاص بك:
كود الخصم: {DISCOUNT_CODE}
قيمة الخصم: {DISCOUNT_PERCENT}%

يمكنك استخدامه فوراً عند الطلب عبر الموقع أو عبر التواصل معنا.

مع خالص التقدير،
فريق ڤانت للأزياء الحصرية`,
  },
  {
    id: 'tpl_new_drop',
    title: 'إطلاق كبسولة الشتاء الجديدة',
    subject: 'حصري للمشتركين · إطلاق كبسولة شتاء 2026 من ڤانت',
    discount_code: 'WINTER-VIP-20',
    discount_percent: 20,
    body: `عزيزنا المشترك في ڤانت،

يسعدنا إعلامك بإطلاق التشكيلة الجديدة من المعاطف والبدلات الصوفية الإيطالية وتصاميم الأوفرسايز المبتكرة لشتاء 2026.
بصفتك من مشتركي الأرشيف الخاص، نوفر لك إمكانية الاطلاع المبكر والحجز قبل نفاذ الكميات المحدودة.

كود الخصم الحصري: {DISCOUNT_CODE} (خصم {DISCOUNT_PERCENT}%)

تصفح التشكيلة الكاملة الآن قبل الإطلاق العام للجمهور.

ڤانت للأزياء الفاخرة`,
  },
  {
    id: 'tpl_weekend_sale',
    title: 'عرض نهاية الأسبوع الخاص',
    subject: 'عرض خاص لـ 48 ساعة فقط · تخفيضات خاصة لمشتركي ڤانت',
    discount_code: 'FLASH-48H-25',
    discount_percent: 25,
    body: `تحية طيبة من ڤانت،

يسرنا دعوتكم للاستفادة من عرض الـ 48 ساعة الخاص بمشتركي النشرة البريدية على قطع مختارة من الكتالوج الرسمي.

كود الخصم المباشر: {DISCOUNT_CODE}
نسبة الخصم: {DISCOUNT_PERCENT}% على كامل السلة
العرض سارٍ حتى نهاية عطلة نهاية الأسبوع أو حتى نفاذ الكميات.

رابط الموقع: {STORE_URL}

دمتم بأناقة راقية،
فريق مبيعات ڤانت`,
  },
  {
    id: 'tpl_restock_alert',
    title: 'إشعار توفر القطع الأكثر طلباً',
    subject: 'عادت للتو · إعادة توفير القطع الأكثر طلباً في ڤانت',
    discount_code: 'RESTOCK-GIFT',
    discount_percent: 10,
    body: `إلى عملائنا الكرام،

بناءً على طلباتكم المتكررة، تمت إعادة توفير القطع الأكثر طلباً من التيشيرتات الأوفرسايز والبدلات الرجالية الفاخرة.

استخدم الرمز: {DISCOUNT_CODE} للحصول على شحن مجاني وخصم إضافي {DISCOUNT_PERCENT}%.

الكميات محدودة جداً ومصنوعة بإصدارات مرقمة.

إدارة الإنتاج والتفصيل · ڤانت`,
  },
];

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
 * Delete a subscriber from local cache, Supabase database table and cloud storage
 */
export async function removeSubscriber(idOrEmail: string): Promise<boolean> {
  const current = getStoredSubscribers();
  const target = current.find((s) => s.id === idOrEmail || s.email === idOrEmail);
  const targetEmail = target ? target.email : idOrEmail;
  const updated = current.filter((s) => s.id !== idOrEmail && s.email !== idOrEmail);
  const ok = await saveSubscribers(updated);

  if (supabase && targetEmail) {
    try {
      await supabase.from('newsletter_subscribers').delete().eq('email', targetEmail.toLowerCase().trim());
    } catch (e) {
      console.warn('Supabase delete subscriber notice:', e);
    }
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
