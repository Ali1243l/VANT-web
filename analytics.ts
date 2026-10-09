/**
 * Maison VANT - Deep Real-Time Analytics & Telemetry Engine
 * 100% Real User Behavior Tracking directly connected to Supabase `logs` table.
 * Persists locally and synchronizes event streams to Supabase Database & Storage.
 */

import { supabase } from './supabase';

export interface AnalyticsEvent {
  id: string;
  type:
    | 'page_view'
    | 'product_view'
    | 'wishlist_toggle'
    | 'size_select'
    | 'whatsapp_order'
    | 'search_query'
    | 'category_filter'
    | 'availability_filter'
    | 'fit_calculator'
    | 'image_slide'
    | 'size_guide_open'
    | 'coupon_copied'
    | 'engagement_heartbeat';
  timestamp: number;
  device: 'mobile' | 'desktop' | 'tablet';
  sessionId: string;
  data: Record<string, any>;
}

// -------------------------------------------------------------
// ALGORITHM 1: HESITATION & ABANDONMENT WITH 1-CLICK RECOVERY
// -------------------------------------------------------------
export type HesitationType =
  | 'sizing_hesitation'
  | 'price_hesitation'
  | 'checkout_stalled'
  | 'catalog_bounce';

export interface HesitationSignal {
  id: string;
  sessionId: string;
  type: HesitationType;
  title: string;
  details: string;
  targetProductId?: string;
  targetProductTitle?: string;
  targetProductPrice?: number;
  targetSize?: string;
  dwellSeconds: number;
  hesitationScore: number; // 0 - 100
  urgency: 'critical' | 'high' | 'medium';
  suggestedAction: string;
  recoveryWhatsAppMessage: string;
  suggestedPromoCode?: string;
  timestamp: number;
}

// -------------------------------------------------------------
// ALGORITHM 2: CUSTOMER PERSONAS & INTENT SCORING (0 - 100)
// -------------------------------------------------------------
export type CustomerPersonaType =
  | 'vip'
  | 'high_intent'
  | 'hesitant_buyer'
  | 'deal_hunter'
  | 'fashion_enthusiast'
  | 'trend_explorer'
  | 'window_shopper';

export interface CustomerTasteFingerprint {
  primaryCategory: string;
  preferredSize?: string;
  avgViewedPrice: number;
  imageInteractionCount: number;
  fitCalculatorUsed: boolean;
  couponInteractions: number;
}

export interface CustomerSessionProfile {
  sessionId: string;
  device: 'mobile' | 'desktop' | 'tablet';
  governorate: string;
  firstSeen: number;
  lastSeen: number;
  durationSeconds: number;
  eventsCount: number;
  productsViewed: Array<{ id: string; title: string; views: number; lastTime: number }>;
  wishlistItems: Array<{ id: string; title: string }>;
  whatsappOrders: Array<{ id: string; title: string; size?: string; price?: number; time: number }>;
  sizesSelected: string[];
  searchQueries: string[];
  categoriesExplored: string[];
  leadScore: number; // 0 - 100
  intentTier: 'vip' | 'high_intent' | 'enthusiast' | 'explorer' | 'browser';
  isHesitantBuyer?: boolean;
  hesitationReason?: string;
  // Algorithmic Enrichments:
  persona: CustomerPersonaType;
  personaLabel: string;
  personaBadgeColor: string;
  tasteFingerprint: CustomerTasteFingerprint;
  hesitationSignal?: HesitationSignal;
  journeyTimeline: Array<{
    id: string;
    type: string;
    label: string;
    timestamp: number;
    elapsedFormatted: string;
    details?: string;
  }>;
}

// -------------------------------------------------------------
// ALGORITHM 3: PREDICTIVE DEMAND, SIZING MATRIX & SEARCH
// -------------------------------------------------------------
export interface DemandVelocityItem {
  id: string | number;
  title: string;
  views: number;
  wishlistAdds: number;
  whatsappClicks: number;
  velocityScore: number; // Dynamic real velocity rating
  demandStatus: 'hot_trending' | 'steady_interest' | 'cold_dormant';
  statusLabelAr: string;
  statusLabelEn: string;
  recommendedAction: string;
}

export interface UnmetSearchInsight {
  term: string;
  count: number;
  matchedResultsCount: number;
  status: 'found' | 'zero_results';
  suggestedAction: string;
}

export interface SizeDemandComparison {
  size: string;
  demandCount: number;
  demandPercentage: number;
  stockCount: number;
  stockPercentage: number;
  status: 'deficit_warning' | 'balanced' | 'surplus';
  statusLabelAr: string;
  recommendation: string;
}

export interface FunnelDropOffDiagnosis {
  catalogViews: number;
  productSheetOpens: number;
  sizeSelections: number;
  whatsappConversions: number;
  dropOffCatalogToProduct: number;
  dropOffProductToSize: number;
  dropOffSizeToOrder: number;
  step1ConversionRate: number; // % who inspect after viewing catalog
  step2ConversionRate: number; // % who select size after inspection
  step3ConversionRate: number; // % who order WhatsApp after choosing size
  overallConversionRate: number;
  primaryDropOffStage: 'inspection' | 'sizing' | 'whatsapp' | 'healthy';
  diagnosisMessage: string;
}

export interface UserBehaviorStats {
  totalPageViews: number;
  totalProductViews: number;
  totalWishlistAdds: number;
  totalWhatsAppClicks: number;
  uniqueVisitors: number;
  activeOnlineNow: number;
  avgSessionSeconds: number;
  conversionRate: number; // percentage
  topProducts: Array<{
    id: string | number;
    title: string;
    views: number;
    wishlistAdds: number;
    whatsappClicks: number;
    conversionPct: number;
  }>;
  popularSearches: Array<{
    term: string;
    count: number;
  }>;
  categoryDistribution: Record<string, number>;
  deviceBreakdown: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  governoratesDistribution: Array<{
    name_ar: string;
    name_en: string;
    count: number;
    percentage: number;
  }>;
  sizeDemandBreakdown: Array<{
    size: string;
    count: number;
    percentage: number;
  }>;
  customerSessions: CustomerSessionProfile[];
  hesitantBuyersCount: number;
  // Algorithmic Extensions:
  hesitationSignals: HesitationSignal[];
  demandVelocity: DemandVelocityItem[];
  unmetSearches: UnmetSearchInsight[];
  sizeStockMatrix: SizeDemandComparison[];
  personaDistribution: Record<CustomerPersonaType, number>;
  funnel: {
    catalogViews: number;
    productSheetOpens: number;
    sizeSelections: number;
    whatsappConversions: number;
  };
  funnelDiagnosis: FunnelDropOffDiagnosis;
  hourlyTraffic: Array<{
    hour: string;
    visitors: number;
  }>;
  lastEventTime: number | null;
}

const STORAGE_KEY = 'vant_real_analytics_events_v3';
const SESSION_ID_KEY = 'vant_visitor_session_id_v3';
const TELEMETRY_FILE = 'telemetry/events_stream.json';

// Detect real client device type
export function detectDevice(): 'mobile' | 'desktop' | 'tablet' {
  if (typeof window === 'undefined') return 'desktop';
  const ua = navigator.userAgent.toLowerCase();
  const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(ua);
  if (isTablet) return 'tablet';
  const isMobile = /mobile|iphone|ipod|android|blackberry|opera mini|iemobile|wpdesktop/.test(ua) || window.innerWidth < 768;
  if (isMobile) return 'mobile';
  return 'desktop';
}

// Get or initialize persistent visitor session ID
export function getVisitorSessionId(): string {
  try {
    if (typeof window === 'undefined') return 'v_server';
    let id = sessionStorage.getItem(SESSION_ID_KEY);
    if (!id) {
      id = 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);
      sessionStorage.setItem(SESSION_ID_KEY, id);
    }
    return id;
  } catch {
    return 'sess_anon';
  }
}

// Read stored real events from client storage
export function getStoredEvents(): AnalyticsEvent[] {
  try {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Failed to read analytics events', e);
  }
  return [];
}

// Track a real user action and dispatch reactive update + persist to Supabase `logs` table
export function trackEvent(
  type: AnalyticsEvent['type'],
  data: Record<string, any> = {}
) {
  try {
    const events = getStoredEvents();
    const eventId = 'ev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const deviceType = detectDevice();
    const sessId = getVisitorSessionId();
    const nowTimestamp = Date.now();

    const newEvent: AnalyticsEvent = {
      id: eventId,
      type,
      timestamp: nowTimestamp,
      device: deviceType,
      sessionId: sessId,
      data: {
        ...data,
        url: typeof window !== 'undefined' ? window.location.pathname : '',
        lang: typeof document !== 'undefined' ? document.documentElement.lang || 'ar' : 'ar',
      },
    };

    // Store up to 2,000 real events in ring buffer locally
    const updated = [newEvent, ...events].slice(0, 2000);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Dispatch event for instant UI telemetry reaction safely outside React render loop
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('vant_analytics_updated', { detail: newEvent }));
      }, 0);
    }

    // 1. Direct real-time write to Supabase `logs` table
    if (supabase) {
      (async () => {
        try {
          await supabase.from('logs').insert({
            event_type: type,
            device: deviceType,
            session_id: sessId,
            data: newEvent.data,
            created_at: new Date(nowTimestamp).toISOString(),
          });
        } catch {
          // Silent catch
        }
      })();
    }

    // 2. Periodically sync stream to Supabase Storage (debounced)
    scheduleSupabaseSync(updated);
  } catch (e) {
    console.warn('Telemetry recording failed', e);
  }
}

// Debounced background sync to Supabase Storage
let syncTimer: any = null;
function scheduleSupabaseSync(events: AnalyticsEvent[]) {
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(async () => {
    if (!supabase) return;
    try {
      const payload = JSON.stringify({
        synced_at: new Date().toISOString(),
        total_events: events.length,
        events: events.slice(0, 500),
      }, null, 2);

      const blob = new Blob([payload], { type: 'application/json' });
      await supabase.storage.from('product-images').upload(TELEMETRY_FILE, blob, {
        contentType: 'application/json',
        upsert: true,
      });
    } catch {
      // Background sync silent catch
    }
  }, 4000);
}

// Fetch telemetry events directly from Supabase `logs` database table & Storage
export async function syncFromSupabaseCloud(): Promise<AnalyticsEvent[]> {
  if (!supabase) return getStoredEvents();
  const local = getStoredEvents();
  const combinedMap = new Map<string, AnalyticsEvent>();
  local.forEach((ev) => combinedMap.set(ev.id, ev));

  try {
    const { data: dbLogs, error: dbErr } = await supabase
      .from('logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (!dbErr && Array.isArray(dbLogs) && dbLogs.length > 0) {
      dbLogs.forEach((row: any) => {
        const id = String(row.id || `log_${row.created_at}`);
        const timestamp = new Date(row.created_at).getTime() || Date.now();
        combinedMap.set(id, {
          id,
          type: (row.event_type || row.type || 'page_view') as AnalyticsEvent['type'],
          timestamp,
          device: (row.device || 'mobile') as 'mobile' | 'desktop' | 'tablet',
          sessionId: String(row.session_id || 'sess_cloud'),
          data: typeof row.data === 'object' && row.data !== null ? row.data : {},
        });
      });
    }
  } catch (err) {
    console.warn('Supabase logs query fallback:', err);
  }

  try {
    const { data, error } = await supabase.storage.from('product-images').download(TELEMETRY_FILE);
    if (!error && data) {
      const text = await data.text();
      const parsed = JSON.parse(text);
      if (parsed?.events && Array.isArray(parsed.events)) {
        parsed.events.forEach((ev: AnalyticsEvent) => combinedMap.set(ev.id, ev));
      }
    }
  } catch {
    // fallback
  }

  const merged = Array.from(combinedMap.values())
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 2000);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {}

  return merged;
}

// Extract real recorded customer location (if tracked from order/checkout or IP)
function extractSessionGovernorate(sEvents: AnalyticsEvent[]): string {
  for (const ev of sEvents) {
    if (ev.data?.governorate) return String(ev.data.governorate);
    if (ev.data?.city) return String(ev.data.city);
    if (ev.data?.location) return String(ev.data.location);
  }
  return 'غير محدد (Undetermined)';
}

// Compute 100% Real Aggregated Business Intelligence & Customer Session Journey
export function getAggregatedAnalytics(productsList: any[] = []): UserBehaviorStats {
  const events = getStoredEvents();

  const totalPageViews = events.filter((e) => e.type === 'page_view').length;
  const productViewEvents = events.filter((e) => e.type === 'product_view');
  const totalProductViews = productViewEvents.length;
  const wishlistEvents = events.filter((e) => e.type === 'wishlist_toggle' && (e.data?.isAdded ?? true));
  const totalWishlistAdds = wishlistEvents.length;
  const whatsappEvents = events.filter((e) => e.type === 'whatsapp_order');
  const totalWhatsAppClicks = whatsappEvents.length;
  const sizeSelectEvents = events.filter((e) => e.type === 'size_select');

  // Group events by session for deep Customer Intelligence
  const sessionEventsMap = new Map<string, AnalyticsEvent[]>();
  events.forEach((e) => {
    const sId = e.sessionId || 'sess_default';
    const list = sessionEventsMap.get(sId) || [];
    list.push(e);
    sessionEventsMap.set(sId, list);
  });

  const customerSessions: CustomerSessionProfile[] = [];

  sessionEventsMap.forEach((sEvents, sId) => {
    const sorted = [...sEvents].sort((a, b) => a.timestamp - b.timestamp);
    const firstSeen = sorted[0]?.timestamp || Date.now();
    const lastSeen = sorted[sorted.length - 1]?.timestamp || Date.now();
    const durationSeconds = Math.max(0, Math.round((lastSeen - firstSeen) / 1000));
    const device = sorted[0]?.device || 'mobile';
    const governorate = extractSessionGovernorate(sorted);

    const viewedMap = new Map<string, { title: string; count: number; lastTime: number }>();
    const wishlistSet = new Map<string, string>();
    const orders: Array<{ id: string; title: string; size?: string; price?: number; time: number }> = [];
    const sizesSet = new Set<string>();
    const searchSet = new Set<string>();
    const categoriesSet = new Set<string>();

    let imageSlideCount = 0;
    let fitCalculatorUsed = false;
    let sizeGuideOpened = false;
    let couponInteractions = 0;
    const viewedPrices: number[] = [];
    const lastTargetedProduct: { id?: string; title?: string; size?: string; price?: number } = {};

    const journeyTimeline: Array<{
      id: string;
      type: string;
      label: string;
      timestamp: number;
      elapsedFormatted: string;
      details?: string;
    }> = [];

    sorted.forEach((ev) => {
      let label = '';
      let details = '';
      const elapsedSec = Math.max(0, Math.round((ev.timestamp - firstSeen) / 1000));
      const elapsedFormatted = `+${Math.floor(elapsedSec / 60)}m ${String(elapsedSec % 60).padStart(2, '0')}s`;

      switch (ev.type) {
        case 'page_view':
          label = 'فتح الكتالوج الرئيسي';
          details = 'بدء تصفح تشكيلة المتجر';
          break;
        case 'category_filter':
          label = `تصفية حسب القسم: ${ev.data?.category || 'الكل'}`;
          if (ev.data?.category) categoriesSet.add(ev.data.category);
          break;
        case 'availability_filter':
          label = `تصفية حسب التوفر: ${ev.data?.availability || ''}`;
          break;
        case 'search_query':
          label = `بحث عن: "${ev.data?.query}"`;
          if (ev.data?.query) searchSet.add(ev.data.query);
          break;
        case 'product_view': {
          const pId = String(ev.data?.productId || '0');
          const pTitle = ev.data?.productTitle || `قطعة #${pId}`;
          label = `معاينة القطعة: ${pTitle}`;
          const curr = viewedMap.get(pId) || { title: pTitle, count: 0, lastTime: ev.timestamp };
          curr.count += 1;
          curr.lastTime = ev.timestamp;
          viewedMap.set(pId, curr);

          // Find price from catalog
          const matchedProd = productsList.find((p) => String(p.id) === pId);
          if (matchedProd && typeof matchedProd.price === 'number') {
            viewedPrices.push(matchedProd.price);
          }
          lastTargetedProduct.id = pId;
          lastTargetedProduct.title = pTitle;
          lastTargetedProduct.price = matchedProd?.price;
          break;
        }
        case 'image_slide':
          imageSlideCount += 1;
          label = 'تقليب معرض صور القطعة';
          details = `الاطلاع على زوايا إضافية لـ ${ev.data?.title || ''}`;
          break;
        case 'size_guide_open':
          sizeGuideOpened = true;
          label = 'استشارة دليل القياسات والأبعاد';
          details = `فحص محيط الصدر والخصر لـ ${ev.data?.title || ''}`;
          break;
        case 'fit_calculator':
          fitCalculatorUsed = true;
          label = 'استخدام حاسبة المقاس الفاخرة Fit Finder';
          details = ev.data?.recommendedSize ? `المقاس المقترح: [${ev.data.recommendedSize}]` : '';
          break;
        case 'size_select':
          label = `اختيار المقاس [${ev.data?.size}]`;
          details = `للقطعة: ${ev.data?.productTitle || ''}`;
          if (ev.data?.size) sizesSet.add(ev.data.size);
          if (lastTargetedProduct) {
            lastTargetedProduct.size = ev.data?.size;
          }
          break;
        case 'wishlist_toggle': {
          const pId = String(ev.data?.productId || '0');
          const pTitle = ev.data?.productTitle || `قطعة #${pId}`;
          if (ev.data?.isAdded ?? true) {
            label = `إضافة للمفضلة: ${pTitle}`;
            wishlistSet.set(pId, pTitle);
          } else {
            label = `إزالة من المفضلة: ${pTitle}`;
            wishlistSet.delete(pId);
          }
          break;
        }
        case 'coupon_copied':
          couponInteractions += 1;
          label = 'نسخ كود الخصم الترويجي';
          details = `كوبون: ${ev.data?.code || ''}`;
          break;
        case 'whatsapp_order': {
          const pId = String(ev.data?.productId || '0');
          const pTitle = ev.data?.productTitle || `قطعة #${pId}`;
          label = `طلب عبر الواتساب المباشر: ${pTitle}`;
          details = `المقاس: ${ev.data?.size || 'غير محدد'} · السعر: ${ev.data?.price || ''}`;
          orders.push({
            id: pId,
            title: pTitle,
            size: ev.data?.size,
            price: ev.data?.price,
            time: ev.timestamp,
          });
          break;
        }
        default:
          label = ev.type;
      }

      journeyTimeline.push({
        id: ev.id,
        type: ev.type,
        label,
        timestamp: ev.timestamp,
        elapsedFormatted,
        details,
      });
    });

    // -------------------------------------------------------------
    // ALGORITHM 2 IMPLEMENTATION: LEAD SCORING & BUYER PERSONAS
    // -------------------------------------------------------------
    let leadScore = 0;
    leadScore += Math.min(25, viewedMap.size * 8); // عمق تصفح القطع
    leadScore += Math.min(25, wishlistSet.size * 15); // إضافة للمفضلة
    leadScore += Math.min(30, sizesSet.size * 18); // تحديد المقاسات
    leadScore += Math.min(10, imageSlideCount * 3); // تقليب معرض الصور
    if (fitCalculatorUsed || sizeGuideOpened) leadScore += 10; // اهتمام بالقياس
    if (orders.length > 0) leadScore = 100; // تحويل فعلي للطلب
    if (durationSeconds >= 60) leadScore += 5;
    if (durationSeconds >= 180) leadScore += 10;
    leadScore = Math.min(100, Math.max(0, leadScore));

    // Basic legacy tier
    let intentTier: CustomerSessionProfile['intentTier'] = 'browser';
    if (orders.length > 0 || leadScore >= 80) {
      intentTier = 'vip';
    } else if (sizesSet.size > 0 || wishlistSet.size > 0 || leadScore >= 60) {
      intentTier = 'high_intent';
    } else if (viewedMap.size >= 3 || leadScore >= 35) {
      intentTier = 'enthusiast';
    } else if (searchSet.size > 0 || categoriesSet.size > 0) {
      intentTier = 'explorer';
    }

    // Customer Persona Classification
    let persona: CustomerPersonaType = 'window_shopper';
    let personaLabel = '👁️ متصفح عابر (Window Shopper)';
    let personaBadgeColor = 'bg-white/10 text-white/60 border-white/15';

    if (orders.length > 0 || leadScore >= 85) {
      persona = 'vip';
      personaLabel = '👑 عميل نخبوي جاهز للشراء (VIP Buyer)';
      personaBadgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    } else if (sizesSet.size > 0 && wishlistSet.size > 0) {
      persona = 'high_intent';
      personaLabel = '💎 جاهز للشراء عالي الاهتمام (High-Intent)';
      personaBadgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    } else if (sizesSet.size > 0 && orders.length === 0) {
      persona = 'hesitant_buyer';
      personaLabel = '⏳ عميل متردد في المقاس أو الطلب (Hesitant)';
      personaBadgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    } else if (couponInteractions > 0 || categoriesSet.has('offers')) {
      persona = 'deal_hunter';
      personaLabel = '🏷️ باحث عن العروض والخصومات (Deal Hunter)';
      personaBadgeColor = 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    } else if (viewedMap.size >= 3 || imageSlideCount >= 4) {
      persona = 'fashion_enthusiast';
      personaLabel = '👗 متذوق أزياء ومستكشف تشكيلات (Fashion Enthusiast)';
      personaBadgeColor = 'bg-[#3b82f6]/20 text-[#3b82f6] border-[#3b82f6]/30';
    } else if (searchSet.size > 0 || categoriesSet.size >= 2) {
      persona = 'trend_explorer';
      personaLabel = '🔍 مستكشف صيحات وتصنيفات (Trend Explorer)';
      personaBadgeColor = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
    }

    // Taste Fingerprint
    const avgPrice = viewedPrices.length > 0
      ? Math.round(viewedPrices.reduce((a, b) => a + b, 0) / viewedPrices.length)
      : 0;

    const tasteFingerprint: CustomerTasteFingerprint = {
      primaryCategory: Array.from(categoriesSet)[0] || 'الكل',
      preferredSize: Array.from(sizesSet)[0] || undefined,
      avgViewedPrice: avgPrice,
      imageInteractionCount: imageSlideCount,
      fitCalculatorUsed,
      couponInteractions,
    };

    // -------------------------------------------------------------
    // ALGORITHM 1 IMPLEMENTATION: HESITATION DETECTION & 1-CLICK RECOVERY
    // -------------------------------------------------------------
    const hasIntentSignals = sizesSet.size > 0 || wishlistSet.size > 0;
    const hasNotOrdered = orders.length === 0;
    const hasDwellTime = durationSeconds >= 25 || viewedMap.size >= 2;
    const isHesitantBuyer = hasIntentSignals && hasNotOrdered && hasDwellTime;

    let hesitationReason = '';
    let hesitationSignal: HesitationSignal | undefined = undefined;

    const targetProductTitle = lastTargetedProduct?.title || Array.from(viewedMap.values())[0]?.title || 'القطعة المختارة';
    const targetSize = lastTargetedProduct?.size || Array.from(sizesSet)[0] || 'المقاس المفضل';

    if (orders.length === 0) {
      if (sizesSet.size > 0) {
        hesitationReason = 'حدّد المقاس وتوقف قبل بدء محادثة الواتساب';
        hesitationSignal = {
          id: `hes_${sId}_checkout`,
          sessionId: sId,
          type: 'checkout_stalled',
          title: 'تردد اللحظة الأخيرة عند زر الطلب',
          details: `اختار المقاس [${targetSize}] لقطعة (${targetProductTitle}) لكنه لم يفتح محادثة الواتساب.`,
          targetProductId: lastTargetedProduct?.id,
          targetProductTitle,
          targetSize,
          targetProductPrice: lastTargetedProduct?.price,
          dwellSeconds: durationSeconds,
          hesitationScore: 92,
          urgency: 'critical',
          suggestedAction: 'متابعة فورية لتأكيد المقاس وتجهيز القطعة للشحن السريع',
          recoveryWhatsAppMessage: `مرحباً عزيزتي ✨ لاحظنا اختياركِ لقطعة (${targetProductTitle}) بمقاس [${targetSize}]. هل تحبين تأكيد طلبكِ الآن مع فحص تفصيلي للقياس والشحن الفوري؟ يسعدنا خدمتكِ في دار VANT.`,
          suggestedPromoCode: 'VANT-VIP',
          timestamp: lastSeen,
        };
      } else if (fitCalculatorUsed || sizeGuideOpened) {
        hesitationReason = 'استشار دليل القياسات أو الحاسبة وتوقف قبل تحديد المقاس';
        hesitationSignal = {
          id: `hes_${sId}_sizing`,
          sessionId: sId,
          type: 'sizing_hesitation',
          title: 'حيرة في اختيار المقاس المناسب',
          details: `استخدم حاسبة أو دليل القياسات لـ (${targetProductTitle}) وتوقف دون حسم المقاس.`,
          targetProductId: lastTargetedProduct?.id,
          targetProductTitle,
          targetSize,
          dwellSeconds: durationSeconds,
          hesitationScore: 78,
          urgency: 'high',
          suggestedAction: 'تقديم استشارة قياس وتفصيل مخصصة من خبيرات الأزياء بالمتجر',
          recoveryWhatsAppMessage: `أهلاً بكِ في دار VANT 🌸 لاحظنا استفساركِ عن مقاسات قطعة (${targetProductTitle}). خبيرات الأزياء لدينا جاهزات لمساعدتكِ فوراً باختيار المقاس الدقيق لطولكِ وقوامكِ.`,
          suggestedPromoCode: 'FIT-CARE',
          timestamp: lastSeen,
        };
      } else if (durationSeconds >= 25 && (wishlistSet.size > 0 || viewedMap.size >= 2)) {
        hesitationReason = 'أضاف قطعاً للمفضلة وتصفح طويلاً دون طلب';
        hesitationSignal = {
          id: `hes_${sId}_price`,
          sessionId: sId,
          type: 'price_hesitation',
          title: 'تردد في السعر أو مقارنة القيمة',
          details: `تصفح تفصيلي لعدة قطع أو حفظ بالمفضلة لمدة ${durationSeconds} ثانية دون طلب.`,
          targetProductId: lastTargetedProduct?.id,
          targetProductTitle,
          dwellSeconds: durationSeconds,
          hesitationScore: 68,
          urgency: 'high',
          suggestedAction: 'تقديم كود خصم حصري أو حافز شحن مجاني لحسم قرار الشراء',
          recoveryWhatsAppMessage: `مرحباً بكِ في دار VANT 💎 تقديراً لاهتمامكِ بقطعنا المميزة، يسعدنا إهداؤكِ كود خصم حصري [VANT10] وتوصيل مجاني لطلبكِ القادم لقطعة (${targetProductTitle}).`,
          suggestedPromoCode: 'VANT10',
          timestamp: lastSeen,
        };
      } else if (durationSeconds >= 15 && (searchSet.size > 0 || categoriesSet.size > 0)) {
        hesitationReason = 'تصفح التصنيفات والبحث دون فتح تفاصيل القطع';
        hesitationSignal = {
          id: `hes_${sId}_bounce`,
          sessionId: sId,
          type: 'catalog_bounce',
          title: 'استكشاف أولي دون الوصول للقطعة المطلوبة',
          details: `بحث وتصفية أقسام دون الانتقال لمعاينة تفاصيل قطعة بعينها.`,
          dwellSeconds: durationSeconds,
          hesitationScore: 42,
          urgency: 'medium',
          suggestedAction: 'توجيه الزائر نحو أكثر القطع رواجاً أو التشكيلة الأحدث',
          recoveryWhatsAppMessage: `أهلاً بكِ في دار VANT! دعينا نساعدكِ في استكشاف أحدث قطع التشكيلة الفاخرة المناسبة لذوقكِ واحتياجكِ.`,
          timestamp: lastSeen,
        };
      }
    }

    customerSessions.push({
      sessionId: sId,
      device,
      governorate,
      firstSeen,
      lastSeen,
      durationSeconds,
      eventsCount: sEvents.length,
      productsViewed: Array.from(viewedMap.entries()).map(([id, v]) => ({
        id,
        title: v.title,
        views: v.count,
        lastTime: v.lastTime,
      })),
      wishlistItems: Array.from(wishlistSet.entries()).map(([id, title]) => ({ id, title })),
      whatsappOrders: orders,
      sizesSelected: Array.from(sizesSet),
      searchQueries: Array.from(searchSet),
      categoriesExplored: Array.from(categoriesSet),
      leadScore,
      intentTier,
      isHesitantBuyer,
      hesitationReason,
      persona,
      personaLabel,
      personaBadgeColor,
      tasteFingerprint,
      hesitationSignal,
      journeyTimeline: journeyTimeline.reverse(),
    });
  });

  // Sort customer sessions: Most active & recent first
  customerSessions.sort((a, b) => b.lastSeen - a.lastSeen);

  const uniqueVisitors = customerSessions.length;

  // Active online now (sessions in the last 15 minutes)
  const fifteenMinutesAgo = Date.now() - 15 * 60 * 1000;
  const activeOnlineNow = customerSessions.filter((s) => s.lastSeen >= fifteenMinutesAgo).length;

  // Average session duration
  const totalSessionSeconds = customerSessions.reduce((acc, s) => acc + s.durationSeconds, 0);
  const avgSessionSeconds = uniqueVisitors > 0 ? Math.round(totalSessionSeconds / uniqueVisitors) : 0;

  // Real Conversion Rate
  const conversionRate = totalProductViews > 0
    ? parseFloat(((totalWhatsAppClicks / totalProductViews) * 100).toFixed(1))
    : 0;

  // Collect all real Hesitation Signals sorted by urgency
  const hesitationSignals: HesitationSignal[] = [];
  customerSessions.forEach((s) => {
    if (s.hesitationSignal) hesitationSignals.push(s.hesitationSignal);
  });
  hesitationSignals.sort((a, b) => {
    const urgencyWeight = { critical: 3, high: 2, medium: 1 };
    return (urgencyWeight[b.urgency] - urgencyWeight[a.urgency]) || (b.hesitationScore - a.hesitationScore);
  });

  // Persona Distribution Calculation
  const personaDistribution: Record<CustomerPersonaType, number> = {
    vip: 0,
    high_intent: 0,
    hesitant_buyer: 0,
    deal_hunter: 0,
    fashion_enthusiast: 0,
    trend_explorer: 0,
    window_shopper: 0,
  };
  customerSessions.forEach((s) => {
    if (personaDistribution[s.persona] !== undefined) {
      personaDistribution[s.persona] += 1;
    }
  });

  // Product metrics calculation
  const productMetrics: Record<string, { views: number; wishlist: number; whatsapp: number; title: string }> = {};

  productsList.forEach((p) => {
    const key = String(p.id);
    productMetrics[key] = {
      views: 0,
      wishlist: 0,
      whatsapp: 0,
      title: p.title_ar || p.title || 'قطعة أرشيفية',
    };
  });

  events.forEach((e) => {
    const pid = e.data?.productId ? String(e.data.productId) : null;
    if (pid) {
      if (!productMetrics[pid]) {
        productMetrics[pid] = {
          views: 0,
          wishlist: 0,
          whatsapp: 0,
          title: e.data?.productTitle || `Piece #${pid}`,
        };
      }
      if (e.type === 'product_view') productMetrics[pid].views += 1;
      if (e.type === 'wishlist_toggle' && (e.data?.isAdded ?? true)) productMetrics[pid].wishlist += 1;
      if (e.type === 'whatsapp_order') productMetrics[pid].whatsapp += 1;
    }
  });

  const topProducts = Object.entries(productMetrics)
    .map(([id, metrics]) => {
      const conversionPct = metrics.views > 0
        ? parseFloat(((metrics.whatsapp / metrics.views) * 100).toFixed(1))
        : 0;
      return {
        id,
        title: metrics.title,
        views: metrics.views,
        wishlistAdds: metrics.wishlist,
        whatsappClicks: metrics.whatsapp,
        conversionPct,
      };
    })
    .sort((a, b) => b.views - a.views || b.whatsappClicks - a.whatsappClicks);

  // -------------------------------------------------------------
  // ALGORITHM 3: PREDICTIVE DEMAND VELOCITY, SIZING & SEARCH
  // -------------------------------------------------------------
  const demandVelocity: DemandVelocityItem[] = Object.entries(productMetrics).map(([id, m]) => {
    const velocityScore = Number(((m.views * 1.0) + (m.wishlist * 3.5) + (m.whatsapp * 10.0)).toFixed(1));
    let demandStatus: DemandVelocityItem['demandStatus'] = 'cold_dormant';
    let statusLabelAr = '❄️ نشاط منخفض';
    let statusLabelEn = 'Cold / Dormant';
    let recommendedAction = 'يوصى بعرض القطعة في البانر أو تنشيط سعرها لتحفيز الاهتمام.';

    if (velocityScore >= 16 || m.whatsapp >= 2) {
      demandStatus = 'hot_trending';
      statusLabelAr = '🔥 إقبال مرتفع جداً';
      statusLabelEn = 'Hot Trending';
      recommendedAction = 'تأمين قطع إضافية فوراً لتجنب نفاد المخزون نتيجة الطلب المتصاعد.';
    } else if (velocityScore >= 4 || m.views >= 3) {
      demandStatus = 'steady_interest';
      statusLabelAr = '⚡ اهتمام مستقر';
      statusLabelEn = 'Steady Interest';
      recommendedAction = 'إبراز تفاصيل المقاسات والخامة للمساعدة في تحويل الزوار إلى طلبات واتساب.';
    }

    return {
      id,
      title: m.title,
      views: m.views,
      wishlistAdds: m.wishlist,
      whatsappClicks: m.whatsapp,
      velocityScore,
      demandStatus,
      statusLabelAr,
      statusLabelEn,
      recommendedAction,
    };
  }).sort((a, b) => b.velocityScore - a.velocityScore);

  // Popular searches & Unmet Search Intelligence
  const searchCounts: Record<string, number> = {};
  events.filter((e) => e.type === 'search_query').forEach((e) => {
    const q = (e.data?.query || '').trim().toLowerCase();
    if (q.length > 1) {
      searchCounts[q] = (searchCounts[q] || 0) + 1;
    }
  });

  const popularSearches = Object.entries(searchCounts)
    .map(([term, count]) => ({ term, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Unmet Search Intelligence (evaluating queries against live product catalog)
  const unmetSearches: UnmetSearchInsight[] = popularSearches.map(({ term, count }) => {
    const termLower = term.toLowerCase();
    const matchedProducts = productsList.filter((p) => {
      const matchTitle = (p.title || '').toLowerCase().includes(termLower);
      const matchTitleAr = (p.title_ar || '').toLowerCase().includes(termLower);
      const matchCat = (p.category || '').toLowerCase().includes(termLower);
      const matchCatAr = (p.category_ar || '').toLowerCase().includes(termLower);
      const matchDesc = (p.description || '').toLowerCase().includes(termLower);
      const matchDescAr = (p.description_ar || '').toLowerCase().includes(termLower);
      const matchTags = Array.isArray(p.tags) && p.tags.some((t: string) => t.toLowerCase().includes(termLower));
      return matchTitle || matchTitleAr || matchCat || matchCatAr || matchDesc || matchDescAr || matchTags;
    });

    const matchedResultsCount = matchedProducts.length;
    const status: UnmetSearchInsight['status'] = matchedResultsCount > 0 ? 'found' : 'zero_results';
    const suggestedAction = matchedResultsCount === 0
      ? `طلب مفقود: الزوار يبحثون عن "${term}" ولا توجد نتائج مطابقة! يوصى بتوفير قطع مطابقة أو تضمين الكلمة في الأوصاف.`
      : `متوفر: توجد ${matchedResultsCount} قطعة مطابقة في الكتالوج الحالي.`;

    return {
      term,
      count,
      matchedResultsCount,
      status,
      suggestedAction,
    };
  });

  // Category distribution
  const categoryDistribution: Record<string, number> = {};
  events.filter((e) => e.type === 'category_filter').forEach((e) => {
    const cat = e.data?.category || 'All';
    categoryDistribution[cat] = (categoryDistribution[cat] || 0) + 1;
  });

  // Device Breakdown
  let mobileCount = 0;
  let desktopCount = 0;
  let tabletCount = 0;
  events.forEach((e) => {
    if (e.device === 'mobile') mobileCount += 1;
    else if (e.device === 'tablet') tabletCount += 1;
    else desktopCount += 1;
  });

  const totalEventsCount = events.length;
  const deviceBreakdown = {
    mobile: totalEventsCount > 0 ? Math.round((mobileCount / totalEventsCount) * 100) : 0,
    desktop: totalEventsCount > 0 ? Math.round((desktopCount / totalEventsCount) * 100) : 0,
    tablet: totalEventsCount > 0 ? Math.round((tabletCount / totalEventsCount) * 100) : 0,
  };

  // Real Governorates Distribution (Only from genuine customer signals)
  const govMap: Record<string, number> = {};
  let totalDeterminedLocations = 0;
  customerSessions.forEach((s) => {
    if (s.governorate && !s.governorate.includes('غير محدد')) {
      govMap[s.governorate] = (govMap[s.governorate] || 0) + 1;
      totalDeterminedLocations += 1;
    }
  });

  const governoratesDistribution = Object.entries(govMap).map(([name, count]) => ({
    name_ar: name,
    name_en: name,
    count,
    percentage: totalDeterminedLocations > 0 ? Math.round((count / totalDeterminedLocations) * 100) : 0,
  })).sort((a, b) => b.count - a.count);

  // Size Demand Breakdown & Live Stock Comparison Matrix
  const standardSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const sizeCounts: Record<string, number> = { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 };
  sizeSelectEvents.forEach((ev) => {
    const s = (ev.data?.size || '').toUpperCase();
    if (s && sizeCounts[s] !== undefined) {
      sizeCounts[s] += 1;
    }
  });

  const totalSizeSelects = sizeSelectEvents.length;
  const sizeDemandBreakdown = Object.entries(sizeCounts).map(([size, count]) => ({
    size,
    count,
    percentage: totalSizeSelects > 0 ? Math.round((count / totalSizeSelects) * 100) : 0,
  })).sort((a, b) => b.count - a.count);

  // Live Stock Count per size
  const stockSizeCounts: Record<string, number> = { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 };
  let totalAvailableStockUnits = 0;
  productsList.forEach((p) => {
    if (Array.isArray(p.sizes) && p.availability !== 'sold_out') {
      p.sizes.forEach((sz: string) => {
        const upper = (sz || '').toUpperCase();
        if (stockSizeCounts[upper] !== undefined) {
          stockSizeCounts[upper] += 1;
          totalAvailableStockUnits += 1;
        }
      });
    }
  });

  const sizeStockMatrix: SizeDemandComparison[] = standardSizes.map((size) => {
    const demandCount = sizeCounts[size] || 0;
    const demandPercentage = totalSizeSelects > 0 ? Math.round((demandCount / totalSizeSelects) * 100) : 0;
    const stockCount = stockSizeCounts[size] || 0;
    const stockPercentage = totalAvailableStockUnits > 0 ? Math.round((stockCount / totalAvailableStockUnits) * 100) : 0;

    let status: SizeDemandComparison['status'] = 'balanced';
    let statusLabelAr = '✅ متوازن ومستقر';
    let recommendation = 'نسبة التوفر تتوافق مع معدل طلبات الزبائن.';

    if (totalSizeSelects > 0 && demandPercentage > stockPercentage + 12) {
      status = 'deficit_warning';
      statusLabelAr = '🚨 تحذير عجز محتمل';
      recommendation = `الطلب (${demandPercentage}%) أعلى بكثير من المعروض (${stockPercentage}%). يوصى بتجهيز كميات إضافية فوراً.`;
    } else if (totalAvailableStockUnits > 0 && stockPercentage > demandPercentage + 18) {
      status = 'surplus';
      statusLabelAr = '📦 فائض معروض';
      recommendation = `المعروض (${stockPercentage}%) يفوق الطلب (${demandPercentage}%). يوصى بتنشيط ترويجي لهذا المقاس.`;
    }

    return {
      size,
      demandCount,
      demandPercentage,
      stockCount,
      stockPercentage,
      status,
      statusLabelAr,
      recommendation,
    };
  });

  // 2. خوارزمية قمع التحويل ونقاط التسرب (Conversion Funnel & Drop-off Detection)
  const catalogViews = totalPageViews;
  const productSheetOpens = totalProductViews;
  const sizeSelections = sizeSelectEvents.length;
  const whatsappConversions = totalWhatsAppClicks;

  const dropOffCatalogToProduct = catalogViews > productSheetOpens ? catalogViews - productSheetOpens : 0;
  const dropOffProductToSize = productSheetOpens > sizeSelections ? productSheetOpens - sizeSelections : 0;
  const dropOffSizeToOrder = sizeSelections > whatsappConversions ? sizeSelections - whatsappConversions : 0;

  const step1ConversionRate = catalogViews > 0 ? Math.round((productSheetOpens / catalogViews) * 100) : 0;
  const step2ConversionRate = productSheetOpens > 0 ? Math.round((sizeSelections / productSheetOpens) * 100) : 0;
  const step3ConversionRate = sizeSelections > 0 ? Math.round((whatsappConversions / sizeSelections) * 100) : 0;
  const overallConversionRate = catalogViews > 0 ? parseFloat(((whatsappConversions / catalogViews) * 100).toFixed(1)) : 0;

  let primaryDropOffStage: 'inspection' | 'sizing' | 'whatsapp' | 'healthy' = 'healthy';
  let diagnosisMessage = '';

  if (catalogViews === 0) {
    diagnosisMessage = 'بانتظار تسجيل أولى زيارات الكتالوج لحساب نقاط التسرب في القمع بدقة.';
  } else if (productSheetOpens === 0) {
    primaryDropOffStage = 'inspection';
    diagnosisMessage = 'أعلى تسرب في الخطوة 1: الزوار يتصفحون الواجهة دون فتح القطع. يوصى بزيادة جاذبية صور الغلاف والبانرات.';
  } else if (step1ConversionRate < 30) {
    primaryDropOffStage = 'inspection';
    diagnosisMessage = 'تسرب ملحوظ عند تصفح الكتالوج: نسبة فتح القطع منخفضة نسبياً مقارنة بإجمالي الزوار.';
  } else if (step2ConversionRate < 35) {
    primaryDropOffStage = 'sizing';
    diagnosisMessage = 'نقطة الهدر الرئيسية هي اختيار المقاس: الزوار يفحصون القطع ولكن يترددون عند تحديد المقاس. تأكد من إبراز دليل القياسات.';
  } else if (step3ConversionRate < 45) {
    primaryDropOffStage = 'whatsapp';
    diagnosisMessage = 'نقطة التسرب الحرجة تقع عند زر الواتساب: تم اختيار المقاس لكن لم يتم إرسال الرسالة. قد يفيد تفعيل كود الخصم الترحيبي أو التوصيل المجاني.';
  } else {
    diagnosisMessage = 'مسار تحويل ممتاز: نسبة الانتقال بين فحص القطع واختيار المقاس والطلب سلسة وصحية.';
  }

  const funnel = {
    catalogViews,
    productSheetOpens,
    sizeSelections,
    whatsappConversions,
  };

  const funnelDiagnosis: FunnelDropOffDiagnosis = {
    catalogViews,
    productSheetOpens,
    sizeSelections,
    whatsappConversions,
    dropOffCatalogToProduct,
    dropOffProductToSize,
    dropOffSizeToOrder,
    step1ConversionRate,
    step2ConversionRate,
    step3ConversionRate,
    overallConversionRate,
    primaryDropOffStage,
    diagnosisMessage,
  };

  const hesitantBuyersCount = customerSessions.filter((s) => s.isHesitantBuyer).length;

  // Hourly Traffic (24 hours)
  const hourlyBuckets: Record<number, number> = {};
  for (let i = 0; i < 24; i++) hourlyBuckets[i] = 0;

  events.forEach((e) => {
    const hour = new Date(e.timestamp).getHours();
    hourlyBuckets[hour] = (hourlyBuckets[hour] || 0) + 1;
  });

  const hourlyTraffic = Array.from({ length: 24 }, (_, h) => {
    const hourFormatted = `${h.toString().padStart(2, '0')}:00`;
    return {
      hour: hourFormatted,
      visitors: hourlyBuckets[h] || 0,
    };
  });

  const lastEventTime = events.length > 0 ? events[0].timestamp : null;

  return {
    totalPageViews,
    totalProductViews,
    totalWishlistAdds,
    totalWhatsAppClicks,
    uniqueVisitors,
    activeOnlineNow,
    avgSessionSeconds,
    conversionRate,
    topProducts,
    popularSearches,
    categoryDistribution,
    deviceBreakdown,
    governoratesDistribution,
    sizeDemandBreakdown,
    customerSessions,
    hesitantBuyersCount,
    hesitationSignals,
    demandVelocity,
    unmetSearches,
    sizeStockMatrix,
    personaDistribution,
    funnel,
    funnelDiagnosis,
    hourlyTraffic,
    lastEventTime,
  };
}

// Reset telemetry data
export function resetAnalyticsData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('vant_analytics_updated', { detail: null }));
      }, 0);
    }
  } catch {}
}

/**
 * ============================================================================
 * MULTI-FORMAT EXPORT ENGINE (CSV, EXCEL XML, JSON, EXECUTIVE HTML/PDF, MARKDOWN)
 * ============================================================================
 */

/**
 * 1. Export as UTF-8 BOM CSV (Optimized for Arabic Excel)
 */
export function generateAnalyticsCSV(productsList: any[] = []): string {
  const stats = getAggregatedAnalytics(productsList);
  const BOM = '\uFEFF';
  let csv = BOM;

  // Header & Summary
  csv += `تقرير تحليلات وسلوكيات زوار مايزون VANT المتقدم\n`;
  csv += `تاريخ التصدير,${new Date().toLocaleString('en-GB')}\n\n`;

  // Section 1: KPI Metrics
  csv += `المؤشرات الرئيسية (KPIs),القيمة\n`;
  csv += `إجمالي مشاهدات الكتالوج,${stats.totalPageViews}\n`;
  csv += `معاينات تفاصيل القطع,${stats.totalProductViews}\n`;
  csv += `إضافات المفضلة,${stats.totalWishlistAdds}\n`;
  csv += `نقرات طلب الواتساب,${stats.totalWhatsAppClicks}\n`;
  csv += `الزوار الفريدين,${stats.uniqueVisitors}\n`;
  csv += `الزوار النشطون حالياً,${stats.activeOnlineNow}\n`;
  csv += `متوسط وقت الجلسة (ثواني),${stats.avgSessionSeconds}\n`;
  csv += `معدل التحويل (CTR %),${stats.conversionRate}%\n`;
  csv += `نسبة الموبايل,${stats.deviceBreakdown.mobile}%\n`;
  csv += `نسبة أجهزة الكمبيوتر,${stats.deviceBreakdown.desktop}%\n\n`;

  // Section 2: Customer Profiles & Sessions
  csv += `جلسة الزائر,الجهاز,المحافظة,المدة (ثواني),نقاط الاهتمام Lead Score,مستوى الشراء,القطع المشاهدة,الطلبات عبر الواتساب,المقاسات المحددة\n`;
  stats.customerSessions.forEach((s) => {
    const viewedList = s.productsViewed.map((p) => p.title).join(' | ').replace(/"/g, '""');
    const orderList = s.whatsappOrders.map((o) => `${o.title} (${o.size || 'M'})`).join(' | ').replace(/"/g, '""');
    const sizesList = s.sizesSelected.join(', ');
    csv += `"${s.sessionId}","${s.device}","${s.governorate}",${s.durationSeconds},${s.leadScore},"${s.intentTier}","${viewedList}","${orderList}","${sizesList}"\n`;
  });
  csv += `\n`;

  // Section 3: Piece-by-Piece Performance & CTR
  csv += `معرف القطعة,اسم القطعة,المشاهدات,إضافات المفضلة,طلبات الواتساب,نسبة النقر CTR %\n`;
  stats.topProducts.forEach((p) => {
    const cleanTitle = p.title.replace(/"/g, '""');
    csv += `"${p.id}","${cleanTitle}",${p.views},${p.wishlistAdds},${p.whatsappClicks},${p.conversionPct}%\n`;
  });
  csv += `\n`;

  // Section 4: Regional Distribution
  csv += `المحافظة,العدد,النسبة المئوية %\n`;
  stats.governoratesDistribution.forEach((g) => {
    csv += `"${g.name_ar}",${g.count},${g.percentage}%\n`;
  });

  return csv;
}

export function downloadAnalyticsCSV(productsList: any[] = []) {
  const csvContent = generateAnalyticsCSV(productsList);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `VANT_Analytics_Report_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * 2. Export as Native Microsoft Excel XML Spreadsheet (.xls) with full formatting & worksheets
 */
export function generateAnalyticsExcelXML(productsList: any[] = []): string {
  const stats = getAggregatedAnalytics(productsList);
  const nowStr = new Date().toLocaleString('en-GB');

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:html="http://www.w3.org/TR/REC-html40">
  <Styles>
    <Style ss:ID="Default" ss:Name="Normal">
      <Alignment ss:Vertical="Center"/>
      <Borders/>
      <Font ss:FontName="Segoe UI" x:CharSet="1" ss:Size="11" ss:Color="#000000"/>
    </Style>
    <Style ss:ID="Header">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CCCCCC"/>
      </Borders>
      <Font ss:FontName="Segoe UI" ss:Size="12" ss:Color="#FFFFFF" ss:Bold="1"/>
      <Interior ss:Color="#004AD7" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="SubHeader">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Font ss:FontName="Segoe UI" ss:Size="11" ss:Color="#004AD7" ss:Bold="1"/>
      <Interior ss:Color="#F0F4FF" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="BoldCell">
      <Font ss:FontName="Segoe UI" ss:Size="11" ss:Bold="1"/>
    </Style>
    <Style ss:ID="CurrencyCell">
      <NumberFormat ss:Format="#,##0"/>
      <Alignment ss:Horizontal="Right"/>
    </Style>
  </Styles>

  <!-- SHEET 1: KPIs & Summary -->
  <Worksheet ss:Name="KPIs Summary">
    <Table ss:DefaultColumnWidth="160">
      <Row ss:Height="28">
        <Cell ss:StyleID="Header" ss:MergeAcross="2"><Data ss:Type="String">تقرير تحليلات مايزون VANT الشامل - ${nowStr}</Data></Cell>
      </Row>
      <Row><Cell><Data ss:Type="String"></Data></Cell></Row>
      <Row ss:Height="20">
        <Cell ss:StyleID="SubHeader"><Data ss:Type="String">المؤشر (Metric)</Data></Cell>
        <Cell ss:StyleID="SubHeader"><Data ss:Type="String">القيمة (Value)</Data></Cell>
        <Cell ss:StyleID="SubHeader"><Data ss:Type="String">ملاحظات التحليل</Data></Cell>
      </Row>
      <Row>
        <Cell ss:StyleID="BoldCell"><Data ss:Type="String">إجمالي مشاهدات الكتالوج</Data></Cell>
        <Cell ss:StyleID="CurrencyCell"><Data ss:Type="Number">${stats.totalPageViews}</Data></Cell>
        <Cell><Data ss:Type="String">مشاهدات الواجهة الرئيسية والمعرض</Data></Cell>
      </Row>
      <Row>
        <Cell ss:StyleID="BoldCell"><Data ss:Type="String">معاينات تفاصيل القطع</Data></Cell>
        <Cell ss:StyleID="CurrencyCell"><Data ss:Type="Number">${stats.totalProductViews}</Data></Cell>
        <Cell><Data ss:Type="String">فتح نافذة درور تفاصيل القطعة</Data></Cell>
      </Row>
      <Row>
        <Cell ss:StyleID="BoldCell"><Data ss:Type="String">إضافات المفضلة</Data></Cell>
        <Cell ss:StyleID="CurrencyCell"><Data ss:Type="Number">${stats.totalWishlistAdds}</Data></Cell>
        <Cell><Data ss:Type="String">إشارات رغبة شراء قوية</Data></Cell>
      </Row>
      <Row>
        <Cell ss:StyleID="BoldCell"><Data ss:Type="String">طلبات وتحويلات الواتساب</Data></Cell>
        <Cell ss:StyleID="CurrencyCell"><Data ss:Type="Number">${stats.totalWhatsAppClicks}</Data></Cell>
        <Cell><Data ss:Type="String">ضغطات زر الشراء المباشر</Data></Cell>
      </Row>
      <Row>
        <Cell ss:StyleID="BoldCell"><Data ss:Type="String">الزوار الفريدين</Data></Cell>
        <Cell ss:StyleID="CurrencyCell"><Data ss:Type="Number">${stats.uniqueVisitors}</Data></Cell>
        <Cell><Data ss:Type="String">إجمالي جلسات المستخدمين الفريدة</Data></Cell>
      </Row>
      <Row>
        <Cell ss:StyleID="BoldCell"><Data ss:Type="String">متوسط مدة الجلسة (ثواني)</Data></Cell>
        <Cell ss:StyleID="CurrencyCell"><Data ss:Type="Number">${stats.avgSessionSeconds}</Data></Cell>
        <Cell><Data ss:Type="String">معدل التفاعل ومكوث الزائر</Data></Cell>
      </Row>
      <Row>
        <Cell ss:StyleID="BoldCell"><Data ss:Type="String">معدل التحويل الإجمالي (CTR)</Data></Cell>
        <Cell><Data ss:Type="String">${stats.conversionRate}%</Data></Cell>
        <Cell><Data ss:Type="String">نسبة النقرات إلى المشاهدات</Data></Cell>
      </Row>
    </Table>
  </Worksheet>

  <!-- SHEET 2: Piece Analytics -->
  <Worksheet ss:Name="Piece Performance">
    <Table ss:DefaultColumnWidth="140">
      <Row ss:Height="24">
        <Cell ss:StyleID="Header"><Data ss:Type="String">معرف القطعة</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">اسم القطعة</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">المشاهدات</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">إضافات المفضلة</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">طلبات الواتساب</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">معدل CTR %</Data></Cell>
      </Row>
      ${stats.topProducts.map(p => `
      <Row>
        <Cell><Data ss:Type="String">${p.id}</Data></Cell>
        <Cell ss:StyleID="BoldCell"><Data ss:Type="String">${p.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</Data></Cell>
        <Cell ss:StyleID="CurrencyCell"><Data ss:Type="Number">${p.views}</Data></Cell>
        <Cell ss:StyleID="CurrencyCell"><Data ss:Type="Number">${p.wishlistAdds}</Data></Cell>
        <Cell ss:StyleID="CurrencyCell"><Data ss:Type="Number">${p.whatsappClicks}</Data></Cell>
        <Cell><Data ss:Type="String">${p.conversionPct}%</Data></Cell>
      </Row>`).join('')}
    </Table>
  </Worksheet>

  <!-- SHEET 3: Customer Intelligence -->
  <Worksheet ss:Name="Customer Intelligence">
    <Table ss:DefaultColumnWidth="150">
      <Row ss:Height="24">
        <Cell ss:StyleID="Header"><Data ss:Type="String">جلسة الزائر</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">الجهاز</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">المحافظة</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">المدة (ثواني)</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">نقاط العميل (Lead Score)</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">مستوى العميل</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">القطع المشاهدة</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">الطلبات</Data></Cell>
      </Row>
      ${stats.customerSessions.map(s => `
      <Row>
        <Cell><Data ss:Type="String">${s.sessionId}</Data></Cell>
        <Cell><Data ss:Type="String">${s.device}</Data></Cell>
        <Cell ss:StyleID="BoldCell"><Data ss:Type="String">${s.governorate}</Data></Cell>
        <Cell ss:StyleID="CurrencyCell"><Data ss:Type="Number">${s.durationSeconds}</Data></Cell>
        <Cell ss:StyleID="CurrencyCell"><Data ss:Type="Number">${s.leadScore}</Data></Cell>
        <Cell ss:StyleID="BoldCell"><Data ss:Type="String">${s.intentTier.toUpperCase()}</Data></Cell>
        <Cell><Data ss:Type="String">${s.productsViewed.map(p => p.title).join(' | ').replace(/&/g, '&amp;')}</Data></Cell>
        <Cell><Data ss:Type="String">${s.whatsappOrders.map(o => o.title).join(' | ').replace(/&/g, '&amp;')}</Data></Cell>
      </Row>`).join('')}
    </Table>
  </Worksheet>
</Workbook>`;
}

export function downloadAnalyticsExcel(productsList: any[] = []) {
  const xmlContent = generateAnalyticsExcelXML(productsList);
  const blob = new Blob([xmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `VANT_Enterprise_Analytics_${Date.now()}.xls`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * 3. Export as Structured JSON Dataset
 */
export function generateAnalyticsJSON(productsList: any[] = []): string {
  const stats = getAggregatedAnalytics(productsList);
  const rawEvents = getStoredEvents();
  return JSON.stringify({
    metadata: {
      platform: 'Maison VANT Official Intelligence Engine',
      version: '4.0.0-PRO',
      exported_at: new Date().toISOString(),
      locale: 'ar-IQ',
    },
    summary_kpis: stats,
    customer_intelligence: stats.customerSessions,
    catalog_breakdown: stats.topProducts,
    regional_insights: stats.governoratesDistribution,
    size_demand: stats.sizeDemandBreakdown,
    raw_telemetry_events: rawEvents.slice(0, 1500),
  }, null, 2);
}

export function downloadAnalyticsJSON(productsList: any[] = []) {
  const jsonContent = generateAnalyticsJSON(productsList);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `VANT_Intelligence_Data_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * 4. Export as Executive HTML Report / PDF Printable Format
 */
export function generateAnalyticsHTMLReport(productsList: any[] = []): string {
  const stats = getAggregatedAnalytics(productsList);
  const dateStr = new Date().toLocaleString('en-GB');

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>تقرير التحليلات التنفيذي الشامل - ڤانت للأزياء</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap');
    body { font-family: 'Tajawal', -apple-system, BlinkMacSystemFont, sans-serif; background: #0c0e15; color: #fff; padding: 40px 20px; margin: 0; }
    .container { max-width: 1000px; margin: auto; background: #12151f; border-radius: 24px; padding: 36px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px; }
    h1 { color: #3b82f6; margin: 0; font-size: 24px; }
    .badge-live { background: rgba(16,185,129,0.15); color: #10b981; border: 1px solid rgba(16,185,129,0.3); padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: bold; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 24px 0; }
    .card { background: rgba(255,255,255,0.04); padding: 20px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); text-align: center; }
    .card .val { font-size: 28px; font-weight: 800; color: #fff; font-family: monospace; }
    .card .lbl { font-size: 12px; color: rgba(255,255,255,0.6); margin-top: 6px; }
    table { width: 100%; border-collapse: collapse; margin-top: 24px; font-size: 13px; }
    th { background: rgba(255,255,255,0.06); padding: 14px; text-align: right; border-bottom: 1px solid rgba(255,255,255,0.12); color: rgba(255,255,255,0.8); }
    td { padding: 14px; border-bottom: 1px solid rgba(255,255,255,0.06); color: rgba(255,255,255,0.85); }
    .badge { background: rgba(59,130,246,0.15); color: #3b82f6; padding: 4px 8px; border-radius: 6px; font-weight: bold; font-family: monospace; }
    .badge-vip { background: rgba(245,158,11,0.2); color: #fbbf24; padding: 4px 10px; border-radius: 8px; font-weight: bold; }
    .section-title { font-size: 17px; margin-top: 36px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; color: #fff; font-weight: 700; }
    .footer { margin-top: 40px; font-size: 12px; color: rgba(255,255,255,0.4); text-align: center; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 20px; }
    @media print {
      body { background: #fff; color: #000; padding: 0; }
      .container { border: none; background: #fff; color: #000; box-shadow: none; padding: 10px; max-width: 100%; }
      .card { background: #f8fafc; border: 1px solid #e2e8f0; color: #000; }
      .card .val { color: #000; }
      .card .lbl { color: #64748b; }
      th { background: #f1f5f9; color: #000; border-bottom: 2px solid #cbd5e1; }
      td { color: #000; border-bottom: 1px solid #e2e8f0; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <h1>👑 MAISON VANT · التقرير التحليلي التنفيذي</h1>
        <p style="color: rgba(255,255,255,0.6); font-size: 13px; margin: 4px 0 0 0;">تاريخ الإصدار: ${dateStr}</p>
      </div>
      <span class="badge-live">● نظام التحليلات المتصل المباشر</span>
    </div>

    <div class="grid">
      <div class="card"><div class="val">${stats.totalPageViews}</div><div class="lbl">مشاهدات الكتالوج</div></div>
      <div class="card"><div class="val">${stats.totalProductViews}</div><div class="lbl">معاينات تفاصيل القطع</div></div>
      <div class="card"><div class="val" style="color: #f43f5e;">${stats.totalWishlistAdds}</div><div class="lbl">إضافات المفضلة</div></div>
      <div class="card"><div class="val" style="color: #10b981;">${stats.totalWhatsAppClicks}</div><div class="lbl">طلبات الواتساب المباشرة</div></div>
    </div>

    <div class="grid" style="grid-template-columns: repeat(3, 1fr);">
      <div class="card"><div class="val">${stats.uniqueVisitors}</div><div class="lbl">الزوار الفريدين (Unique Visitors)</div></div>
      <div class="card"><div class="val" style="color: #10b981;">${Math.floor(stats.avgSessionSeconds / 60)}m ${stats.avgSessionSeconds % 60}s</div><div class="lbl">متوسط مدة الجلسة (Engagement)</div></div>
      <div class="card"><div class="val" style="color: #f59e0b;">${stats.conversionRate}%</div><div class="lbl">معدل التحويل الكلي (CTR)</div></div>
    </div>

    <div class="section-title">👥 سجل وتصنيف العملاء المتقدم (Customer Journeys & Leads)</div>
    <table>
      <thead>
        <tr>
          <th>جلسة الزائر</th>
          <th>المحافظة</th>
          <th>الجهاز</th>
          <th>المدة</th>
          <th>نقاط العميل</th>
          <th>التصنيف</th>
          <th>الطلبات / الواتساب</th>
        </tr>
      </thead>
      <tbody>
        ${stats.customerSessions.slice(0, 15).map(s => `
          <tr>
            <td><code>${s.sessionId.substring(0, 14)}...</code></td>
            <td><strong>${s.governorate}</strong></td>
            <td>${s.device === 'mobile' ? '📱 هاتف' : '💻 كمبيوتر'}</td>
            <td>${s.durationSeconds} ثانية</td>
            <td><strong>${s.leadScore} / 100</strong></td>
            <td><span class="badge-vip">${s.intentTier.toUpperCase()}</span></td>
            <td>${s.whatsappOrders.length > 0 ? `<strong style="color:#10b981;">${s.whatsappOrders.map(o => o.title).join(', ')}</strong>` : '<span style="color:#666;">-</span>'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="section-title">👗 أداء القطع ومعدل النقر (CTR) في المعرض</div>
    <table>
      <thead>
        <tr>
          <th>اسم القطعة</th>
          <th style="text-align:center;">المشاهدات</th>
          <th style="text-align:center;">المفضلة</th>
          <th style="text-align:center;">طلبات الواتساب</th>
          <th style="text-align:center;">نسبة النقر (CTR)</th>
        </tr>
      </thead>
      <tbody>
        ${stats.topProducts.map(p => `
          <tr>
            <td><strong>${p.title}</strong></td>
            <td style="text-align:center; font-family: monospace;">${p.views}</td>
            <td style="text-align:center; color:#f43f5e; font-family: monospace;">${p.wishlistAdds}</td>
            <td style="text-align:center; color:#10b981; font-weight:bold; font-family: monospace;">${p.whatsappClicks}</td>
            <td style="text-align:center;"><span class="badge">${p.conversionPct}%</span></td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="footer">
      تم توليد هذا التقرير آلياً عبر محرك التحليلات الفوري لمايزون VANT وقاعدة بيانات Supabase · جميع الحقوق محفوظة
    </div>
  </div>
  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>`;
}

export function downloadAnalyticsHTMLReport(productsList: any[] = []) {
  const htmlContent = generateAnalyticsHTMLReport(productsList);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, '_blank');
  if (!printWindow) {
    const a = document.createElement('a');
    a.href = url;
    a.download = `VANT_Executive_Report_${Date.now()}.html`;
    a.click();
  }
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

/**
 * 5. Export as Markdown Document (.md)
 */
export function generateAnalyticsMarkdown(productsList: any[] = []): string {
  const stats = getAggregatedAnalytics(productsList);
  const dateStr = new Date().toLocaleString('en-GB');

  let md = `# 👑 MAISON VANT · تقرير ذكاء الأعمال والتحليلات الشاملة\n\n`;
  md += `**تاريخ التصدير:** ${dateStr}  \n`;
  md += `**المنصة:** Maison VANT Atelier Live Intelligence  \n\n`;

  md += `## 📊 المؤشرات الرئيسية (Executive KPIs)\n\n`;
  md += `- **إجمالي مشاهدات الكتالوج:** ${stats.totalPageViews}\n`;
  md += `- **معاينات تفاصيل القطع:** ${stats.totalProductViews}\n`;
  md += `- **إضافات المفضلة:** ${stats.totalWishlistAdds}\n`;
  md += `- **نقرات طلب الواتساب المباشرة:** ${stats.totalWhatsAppClicks}\n`;
  md += `- **الزوار الفريدين:** ${stats.uniqueVisitors}\n`;
  md += `- **الزوار النشطون حالياً:** ${stats.activeOnlineNow}\n`;
  md += `- **متوسط مدة الجلسة:** ${Math.floor(stats.avgSessionSeconds / 60)} دقيقة و ${stats.avgSessionSeconds % 60} ثانية\n`;
  md += `- **معدل التحويل الكلي (CTR):** ${stats.conversionRate}%\n\n`;

  md += `## 👗 أداء القطع وتفاعل الزبائن\n\n`;
  md += `| القطعة | المشاهدات | المفضلة | طلبات الواتساب | نسبة النقر CTR % |\n`;
  md += `| :--- | :---: | :---: | :---: | :---: |\n`;
  stats.topProducts.forEach((p) => {
    md += `| **${p.title}** | ${p.views} | ${p.wishlistAdds} | ${p.whatsappClicks} | ${p.conversionPct}% |\n`;
  });
  md += `\n`;

  md += `## 👥 تحليل شرائح الزوار والعملاء\n\n`;
  md += `| الجلسة | المحافظة | الجهاز | المدة | نقاط العميل | المستوى |\n`;
  md += `| :--- | :--- | :---: | :---: | :---: | :--- |\n`;
  stats.customerSessions.slice(0, 15).forEach((s) => {
    md += `| \`${s.sessionId.substring(0, 12)}\` | ${s.governorate} | ${s.device} | ${s.durationSeconds}s | ${s.leadScore}/100 | **${s.intentTier.toUpperCase()}** |\n`;
  });

  return md;
}

export function downloadAnalyticsMarkdown(productsList: any[] = []) {
  const mdContent = generateAnalyticsMarkdown(productsList);
  const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `VANT_Analytics_Summary_${Date.now()}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

// Clear stored local analytics
export function clearStoredAnalytics() {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('vant_analytics_updated'));
      }, 0);
    }
  } catch {}
}

// Interactive Simulation Engine for live algorithm testing & database verification
export async function simulateCustomerJourney(
  scenario: 'hesitation' | 'vip_order' | 'zero_search',
  sampleProduct?: any
): Promise<number> {
  const simSessionId = 'sess_sim_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
  const now = Date.now();
  const title = sampleProduct?.title_ar || sampleProduct?.title || 'طقم كلاسيك من الحرير الإيطالي المطرز';
  const pid = sampleProduct?.id || 'prod_sim_1';
  const price = typeof sampleProduct?.price === 'number' ? sampleProduct.price : 125000;
  const size = (Array.isArray(sampleProduct?.sizes) && sampleProduct.sizes[0]) || 'M';

  const eventsToCreate: Array<{ type: AnalyticsEvent['type']; data: any; delayOffset: number }> = [];

  if (scenario === 'hesitation') {
    // Customer browses, inspects piece, checks sizing, selects size, but stalls before ordering
    eventsToCreate.push(
      { type: 'page_view', data: { page: 'catalog' }, delayOffset: 55000 },
      { type: 'category_filter', data: { category: sampleProduct?.category || 'Evening' }, delayOffset: 45000 },
      { type: 'product_view', data: { productId: pid, productTitle: title, price }, delayOffset: 35000 },
      { type: 'image_slide', data: { productId: pid, title }, delayOffset: 25000 },
      { type: 'fit_calculator', data: { productId: pid, recommendedSize: size }, delayOffset: 15000 },
      { type: 'size_select', data: { productId: pid, productTitle: title, size }, delayOffset: 8000 }
    );
  } else if (scenario === 'vip_order') {
    // High-value VIP buyer inspects piece, saves to wishlist, selects size, and completes WhatsApp order
    eventsToCreate.push(
      { type: 'page_view', data: { page: 'catalog' }, delayOffset: 95000 },
      { type: 'product_view', data: { productId: pid, productTitle: title, price }, delayOffset: 70000 },
      { type: 'wishlist_toggle', data: { productId: pid, productTitle: title, isAdded: true }, delayOffset: 50000 },
      { type: 'size_select', data: { productId: pid, productTitle: title, size }, delayOffset: 25000 },
      {
        type: 'whatsapp_order',
        data: { productId: pid, productTitle: title, size, price, governorate: 'بغداد' },
        delayOffset: 2000,
      }
    );
  } else if (scenario === 'zero_search') {
    // Zero results search for unmet demand
    const unmetList = ['فستان حرير مخملي كشميري', 'بشت صوف أسود ملكي', 'طقم كتان مطرز فاخر'];
    const q = unmetList[Math.floor(Math.random() * unmetList.length)];
    eventsToCreate.push(
      { type: 'page_view', data: { page: 'catalog' }, delayOffset: 20000 },
      { type: 'search_query', data: { query: q }, delayOffset: 5000 }
    );
  }

  const existing = getStoredEvents();
  const generated: AnalyticsEvent[] = eventsToCreate.map((ev, idx) => ({
    id: `ev_sim_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
    type: ev.type,
    timestamp: now - ev.delayOffset,
    device: 'mobile',
    sessionId: simSessionId,
    data: {
      ...ev.data,
      governorate: ev.data?.governorate || 'بغداد (محاكاة حية)',
      isSimulation: true,
    },
  }));

  const updated = [...generated, ...existing].slice(0, 2000);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('vant_analytics_updated'));
      }, 0);
    }
  } catch {}

  // Also write to Supabase if connected
  if (supabase) {
    try {
      for (const gev of generated) {
        await supabase.from('logs').insert({
          event_type: gev.type,
          device: gev.device,
          session_id: gev.sessionId,
          data: gev.data,
          created_at: new Date(gev.timestamp).toISOString(),
        });
      }
    } catch {}
  }

  return generated.length;
}
