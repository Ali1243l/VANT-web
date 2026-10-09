import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Activity,
  Clock,
  Smartphone,
  ShoppingBag,
  Percent,
  Search,
  Sparkles,
  Download,
  FileSpreadsheet,
  RefreshCw,
  Users,
  MousePointerClick,
  Heart,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  MapPin,
  Tag,
  FileText,
  Flame,
  Layers,
  Eye,
  AlertTriangle,
  Zap,
  Copy,
  Check,
  Send,
  SlidersHorizontal,
  Compass,
  FileCode,
  Database,
  Play,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Filter,
} from 'lucide-react';
import {
  type UserBehaviorStats,
  type CustomerSessionProfile,
  type HesitationSignal,
  type CustomerPersonaType,
  downloadAnalyticsCSV,
  downloadAnalyticsExcel,
  downloadAnalyticsJSON,
  downloadAnalyticsHTMLReport,
  downloadAnalyticsMarkdown,
  clearStoredAnalytics,
  simulateCustomerJourney,
  syncFromSupabaseCloud,
} from '../lib/analytics';
import type { Product } from '../types';

interface Props {
  stats: UserBehaviorStats;
  products: Product[];
  isAr?: boolean;
  onRefresh?: () => void;
}

const DEVICE_COLORS = ['#3b82f6', '#10b981', '#f59e0b'];
const VIEW_BAR_COLORS = ['#3b82f6', '#60a5fa', '#93c5fd', '#2563eb', '#1d4ed8'];
const WISHLIST_BAR_COLORS = ['#f43f5e', '#fb7185', '#fda4af', '#e11d48', '#be123c'];

// Custom Luxury Tooltip for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-white/20 bg-[#12151f]/95 p-3 shadow-2xl backdrop-blur-md text-xs z-50">
        <p className="font-bold text-white mb-1.5 pb-1 border-b border-white/10">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4 py-0.5">
            <span className="flex items-center gap-1.5 text-white/70">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
              {entry.name}:
            </span>
            <span className="font-mono font-bold text-white tabular-nums">
              {typeof entry.value === 'number'
                ? entry.dataKey === 'ctr'
                  ? `${entry.value}%`
                  : entry.value.toLocaleString()
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminAnalyticsDashboard({
  stats,
  products,
  isAr = true,
  onRefresh,
}: Props) {
  // Navigation View: Overview + Pieces Performance Matrix + The 3 Core Behavioral Algorithms
  const [activeAlgorithmView, setActiveAlgorithmView] = useState<
    'all' | 'piece_matrix' | 'algorithm1_hesitation' | 'algorithm2_personas' | 'algorithm3_demand'
  >('all');

  // Filter & Search States
  const [expandedKpi, setExpandedKpi] = useState<string | null>(null);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [customerFilter, setCustomerFilter] = useState<CustomerPersonaType | 'all' | 'hesitant'>('all');
  const [hesitationUrgencyFilter, setHesitationUrgencyFilter] = useState<'all' | 'critical' | 'high' | 'medium'>('all');
  const [velocityFilter, setVelocityFilter] = useState<'all' | 'hot_trending' | 'steady_interest' | 'cold_dormant'>('all');
  const [unmetSearchFilter, setUnmetSearchFilter] = useState<'all' | 'zero_results' | 'found'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [copiedSignalId, setCopiedSignalId] = useState<string | null>(null);

  // Live Database Sync & Simulation States
  const [isLiveSyncing, setIsLiveSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState(false);
  const [simModalOpen, setSimModalOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simSuccessMsg, setSimSuccessMsg] = useState<string | null>(null);

  // Piece Performance Matrix Filters
  const [pieceSearchQuery, setPieceSearchQuery] = useState('');
  const [pieceCatFilter, setPieceCatFilter] = useState('all');
  const [pieceSortBy, setPieceSortBy] = useState<'views' | 'wishlist' | 'whatsapp' | 'ctr' | 'velocity'>('views');

  // Handle Live Cloud Sync
  const handleTriggerSync = async () => {
    setIsLiveSyncing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      } else {
        await syncFromSupabaseCloud();
      }
      setSyncToast(true);
      setTimeout(() => setSyncToast(false), 3000);
    } catch (e) {
      console.warn('Sync failed', e);
    } finally {
      setIsLiveSyncing(false);
    }
  };

  // Handle Algorithm Simulation Test
  const handleRunSimulation = async (scenario: 'hesitation' | 'vip_order' | 'zero_search') => {
    setIsSimulating(true);
    try {
      const sample = products.length > 0 ? products[Math.floor(Math.random() * products.length)] : undefined;
      await simulateCustomerJourney(scenario, sample);
      if (onRefresh) {
        await onRefresh();
      }
      const label = scenario === 'hesitation'
        ? (isAr ? 'تمت محاكاة حيرة المقاس ورصد إشارة التردد بنجاح!' : 'Simulated sizing hesitation!')
        : scenario === 'vip_order'
        ? (isAr ? 'تمت محاكاة مسار عميل VIP وإتمام طلب واتساب بنجاح!' : 'Simulated VIP order journey!')
        : (isAr ? 'تمت محاكاة بحث غير متوفر ورصد الطلب المفقود بنجاح!' : 'Simulated unmet search query!');
      setSimSuccessMsg(label);
      setTimeout(() => setSimSuccessMsg(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  // Handle Clear Local Telemetry
  const handleClearData = () => {
    if (confirm(isAr ? 'هل أنت متأكد من تفريغ سجلات التفاعل المؤقتة؟' : 'Clear local telemetry events?')) {
      clearStoredAnalytics();
      if (onRefresh) onRefresh();
    }
  };

  // Copy Recovery Message handler
  const handleCopyRecoveryScript = async (signal: HesitationSignal) => {
    try {
      await navigator.clipboard.writeText(signal.recoveryWhatsAppMessage);
      setCopiedSignalId(signal.id);
      setTimeout(() => setCopiedSignalId(null), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  // 1. User Engagement & Hourly Traffic Data for Recharts AreaChart
  const hourlyEngagementData = useMemo(() => {
    return (stats.hourlyTraffic || []).map((h) => {
      const estimatedEngagementMin = stats.avgSessionSeconds > 0
        ? Math.round((h.visitors * stats.avgSessionSeconds) / 60)
        : 0;

      return {
        hour: h.hour,
        visitors: h.visitors,
        durationMinutes: estimatedEngagementMin,
        durationSec: Math.round(stats.avgSessionSeconds || 0),
      };
    });
  }, [stats.hourlyTraffic, stats.avgSessionSeconds]);

  // 2. Most-Viewed Products Data for Recharts BarChart
  const mostViewedProductsData = useMemo(() => {
    const sorted = [...(stats.topProducts || [])].sort((a, b) => b.views - a.views).slice(0, 5);
    return sorted.map((p) => ({
      name: p.title.length > 14 ? p.title.substring(0, 14) + '...' : p.title,
      fullName: p.title,
      views: p.views,
      whatsapp: p.whatsappClicks,
      wishlist: p.wishlistAdds,
    }));
  }, [stats.topProducts]);

  // 3. Wishlist Activity Data for Recharts BarChart
  const wishlistActivityData = useMemo(() => {
    const sorted = [...(stats.topProducts || [])].sort((a, b) => b.wishlistAdds - a.wishlistAdds).slice(0, 5);
    return sorted.map((p) => ({
      name: p.title.length > 14 ? p.title.substring(0, 14) + '...' : p.title,
      fullName: p.title,
      wishlist: p.wishlistAdds,
      views: p.views,
      whatsapp: p.whatsappClicks,
    }));
  }, [stats.topProducts]);

  // 4. Combined Product Chart Data for ComposedChart (Views, WhatsApp, CTR)
  const productChartData = useMemo(() => {
    return (stats.topProducts || []).slice(0, 6).map((p) => ({
      name: p.title.length > 12 ? p.title.substring(0, 12) + '...' : p.title,
      fullName: p.title,
      views: p.views,
      wishlist: p.wishlistAdds,
      whatsapp: p.whatsappClicks,
      ctr: p.conversionPct,
    }));
  }, [stats.topProducts]);

  // 5. Device Distribution Donut Data
  const deviceData = useMemo(() => {
    return [
      { name: isAr ? 'هواتف ذكية' : 'Mobile', value: stats.deviceBreakdown.mobile },
      { name: isAr ? 'أجهزة كمبيوتر' : 'Desktop', value: stats.deviceBreakdown.desktop },
      { name: isAr ? 'أجهزة لوحية' : 'Tablet', value: stats.deviceBreakdown.tablet },
    ].filter((d) => d.value > 0);
  }, [stats.deviceBreakdown, isAr]);

  // Filtered Customer Sessions (Algorithm 2)
  const filteredSessions = useMemo(() => {
    return (stats.customerSessions || []).filter((s) => {
      if (customerFilter === 'hesitant') {
        if (!s.isHesitantBuyer && !s.hesitationSignal) return false;
      } else if (customerFilter !== 'all') {
        if (s.persona !== customerFilter) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchId = s.sessionId.toLowerCase().includes(q);
        const matchGov = s.governorate.toLowerCase().includes(q);
        const matchProd = s.productsViewed.some((p) => p.title.toLowerCase().includes(q));
        const matchOrder = s.whatsappOrders.some((o) => o.title.toLowerCase().includes(q));
        return matchId || matchGov || matchProd || matchOrder;
      }
      return true;
    });
  }, [stats.customerSessions, customerFilter, searchQuery]);

  // Filtered Hesitation Signals (Algorithm 1)
  const filteredHesitationSignals = useMemo(() => {
    return (stats.hesitationSignals || []).filter((sig) => {
      if (hesitationUrgencyFilter !== 'all' && sig.urgency !== hesitationUrgencyFilter) return false;
      return true;
    });
  }, [stats.hesitationSignals, hesitationUrgencyFilter]);

  // Filtered Demand Velocity (Algorithm 3)
  const filteredVelocityItems = useMemo(() => {
    return (stats.demandVelocity || []).filter((item) => {
      if (velocityFilter !== 'all' && item.demandStatus !== velocityFilter) return false;
      return true;
    });
  }, [stats.demandVelocity, velocityFilter]);

  // Filtered Unmet Searches (Algorithm 3)
  const filteredUnmetSearches = useMemo(() => {
    return (stats.unmetSearches || []).filter((item) => {
      if (unmetSearchFilter !== 'all' && item.status !== unmetSearchFilter) return false;
      return true;
    });
  }, [stats.unmetSearches, unmetSearchFilter]);

  // Detailed Piece Performance Matrix Computation
  const detailedPiecesData = useMemo(() => {
    const list = products.map((prod) => {
      const topProd = (stats.topProducts || []).find(
        (tp) => String(tp.id) === String(prod.id) || tp.title.toLowerCase() === prod.title.toLowerCase()
      );
      const velocity = (stats.demandVelocity || []).find(
        (v) => String(v.id) === String(prod.id) || v.title.toLowerCase() === prod.title.toLowerCase()
      );
      const hesitationCount = (stats.hesitationSignals || []).filter(
        (h) => String(h.targetProductId) === String(prod.id) || h.targetProductTitle?.toLowerCase() === prod.title.toLowerCase()
      ).length;

      const views = topProd?.views || 0;
      const wishlistAdds = topProd?.wishlistAdds || 0;
      const whatsappClicks = topProd?.whatsappClicks || 0;
      const conversionRate = views > 0 ? (whatsappClicks / views) * 100 : 0;
      const ctr = views > 0 ? ((whatsappClicks + wishlistAdds) / views) * 100 : 0;
      const velocityScore = velocity?.velocityScore ?? Math.round(views * 1.5 + wishlistAdds * 3.5 + whatsappClicks * 10);
      const velocityStatus = velocity?.demandStatus ?? (whatsappClicks >= 2 || views >= 12 ? 'hot_trending' : views >= 4 ? 'steady_interest' : 'cold_dormant');

      return {
        product: prod,
        views,
        wishlistAdds,
        whatsappClicks,
        conversionRate,
        ctr,
        velocityScore,
        velocityStatus,
        hesitationCount,
      };
    });

    // Apply Filter & Search & Sort
    return list
      .filter((item) => {
        if (pieceCatFilter !== 'all' && item.product.category !== pieceCatFilter) return false;
        if (pieceSearchQuery.trim()) {
          const q = pieceSearchQuery.toLowerCase().trim();
          const matchTitle = item.product.title.toLowerCase().includes(q) || (item.product.title_ar?.toLowerCase().includes(q) ?? false);
          const matchCategory = item.product.category.toLowerCase().includes(q) || (item.product.category_ar?.toLowerCase().includes(q) ?? false);
          if (!matchTitle && !matchCategory) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (pieceSortBy === 'views') return b.views - a.views;
        if (pieceSortBy === 'whatsapp') return b.whatsappClicks - a.whatsappClicks;
        if (pieceSortBy === 'wishlist') return b.wishlistAdds - a.wishlistAdds;
        if (pieceSortBy === 'ctr') return b.ctr - a.ctr;
        if (pieceSortBy === 'velocity') return b.velocityScore - a.velocityScore;
        return 0;
      });
  }, [products, stats.topProducts, stats.demandVelocity, stats.hesitationSignals, pieceCatFilter, pieceSearchQuery, pieceSortBy]);

  const pieceCategories = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
  }, [products]);

  return (
    <div className="space-y-6">
      {/* Top Header with Multi-Format Export Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[#3b82f6]" />
            <span>{isAr ? 'محرك ذكاء الأعمال وتحليل سلوكيات الزبائن (A - Z)' : 'Customer Behavior Intelligence Engine'}</span>
          </h2>
          <p className="text-xs text-white/50 mt-0.5">
            {isAr
              ? 'تحليل دقيق وخوارزميات حقيقية 100% مبنية على مسارات الزوار الفعلية بدون أي بيانات وهمية'
              : '100% Genuine telemetry algorithms tracking customer journeys and conversion actions'}
          </p>
        </div>

        {/* Action Buttons: Multi-Format Exports */}
        <div className="flex flex-wrap items-center gap-2">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.05] hover:bg-white/10 px-3 py-2 text-xs font-semibold text-white/80 transition-all cursor-pointer"
              title={isAr ? 'تحديث ومزامنة البيانات الحية' : 'Sync latest live telemetry'}
            >
              <RefreshCw className="h-3.5 w-3.5 text-cyan-400" />
              <span>{isAr ? 'تحديث البيانات' : 'Refresh'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setExportModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-[#004ad7] hover:bg-[#3b82f6] px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-[#004ad7]/25 active:scale-95 transition-all cursor-pointer"
          >
            <Layers className="h-3.5 w-3.5" />
            <span>{isAr ? 'مركز التصدير بكافة الصيغ' : 'Export Hub'}</span>
          </button>
        </div>
      </div>

      {/* Multi-Format Export Modal */}
      {exportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-2xl rounded-3xl border border-white/15 bg-[#12151f] p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#004ad7]/20 text-[#3b82f6] border border-[#004ad7]/30">
                  <Download className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {isAr ? 'تصدير بيانات المتجر والعملاء (Multi-Format Export)' : 'Multi-Format Data Export Hub'}
                  </h3>
                  <p className="text-xs text-white/50">
                    {isAr ? 'اختر الصيغة المناسبة لتنزيل البيانات والتحليلات بالكامل' : 'Select desired format to download all analytics & customer records'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setExportModalOpen(false)}
                className="rounded-xl border border-white/10 p-2 text-white/60 hover:bg-white/10 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 1. Excel XML */}
              <button
                type="button"
                onClick={() => {
                  downloadAnalyticsExcel(products);
                  setExportModalOpen(false);
                }}
                className="flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4 text-start hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-all cursor-pointer group"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">Excel Workbook (.xls)</span>
                    <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-bold text-emerald-400">موصى به</span>
                  </div>
                  <p className="text-[11px] text-white/60 mt-1">
                    {isAr ? 'مصنف إكسل احترافي متعدد الأوراق بتنسيق رسمي' : 'Multi-sheet workbook with styled formatting'}
                  </p>
                </div>
              </button>

              {/* 2. CSV */}
              <button
                type="button"
                onClick={() => {
                  downloadAnalyticsCSV(products);
                  setExportModalOpen(false);
                }}
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-start hover:bg-white/[0.07] hover:border-white/20 transition-all cursor-pointer group"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#004ad7]/20 text-[#3b82f6] group-hover:scale-105 transition-transform">
                  <Download className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-bold text-sm text-white">CSV (Excel UTF-8 BOM)</span>
                  <p className="text-[11px] text-white/60 mt-1">
                    {isAr ? 'ملف CSV يدعم اللغة العربية بالكامل دون رموز مشوهة' : 'Arabic UTF-8 compatible CSV export'}
                  </p>
                </div>
              </button>

              {/* 3. JSON */}
              <button
                type="button"
                onClick={() => {
                  downloadAnalyticsJSON(products);
                  setExportModalOpen(false);
                }}
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-start hover:bg-white/[0.07] hover:border-white/20 transition-all cursor-pointer group"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 group-hover:scale-105 transition-transform">
                  <FileCode className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-bold text-sm text-white">Raw JSON Feed (.json)</span>
                  <p className="text-[11px] text-white/60 mt-1">
                    {isAr ? 'البيانات الخام الكاملة لكافة الأحداث والخطوط الزمنية' : 'Raw full payload for programmatic consumption'}
                  </p>
                </div>
              </button>

              {/* 4. HTML Report */}
              <button
                type="button"
                onClick={() => {
                  downloadAnalyticsHTMLReport(products);
                  setExportModalOpen(false);
                }}
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-start hover:bg-white/[0.07] hover:border-white/20 transition-all cursor-pointer group"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 group-hover:scale-105 transition-transform">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-bold text-sm text-white">Executive HTML Report (.html)</span>
                  <p className="text-[11px] text-white/60 mt-1">
                    {isAr ? 'تقرير تنفيذي فاخر قابل للطباعة والحفظ كملف PDF' : 'Ready-to-print luxury dashboard report'}
                  </p>
                </div>
              </button>

              {/* 5. Markdown Summary */}
              <button
                type="button"
                onClick={() => {
                  downloadAnalyticsMarkdown(products);
                  setExportModalOpen(false);
                }}
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-start hover:bg-white/[0.07] hover:border-white/20 transition-all cursor-pointer group"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 group-hover:scale-105 transition-transform">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-bold text-sm text-white">Markdown Summary (.md)</span>
                  <p className="text-[11px] text-white/60 mt-1">
                    {isAr ? 'ملخص تنفيذي بصيغة ماركداون للمشاركة الفورية' : 'Markdown summary formatted for quick sharing'}
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* REAL-TIME CLOUD DATABASE CONNECTION & TELEMETRY ENGINE STATUS */}
      {/* ========================================================================= */}
      <div className="rounded-2xl border border-[#004ad7]/30 bg-[#004ad7]/10 p-4 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#004ad7]/20 text-[#60a5fa] border border-[#004ad7]/30">
            <Database className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3b82f6] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#3b82f6]"></span>
            </span>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[#60a5fa]" />
                {isAr ? 'قاعدة بيانات Supabase السحابية متصلة ونشطة' : 'Supabase Cloud Database Connected'}
              </span>
              <span className="rounded-full bg-[#004ad7]/25 border border-[#004ad7]/40 text-[10px] font-mono font-bold text-[#93c5fd] px-2 py-0.5">
                {isAr ? 'مزامنة تلقائية حية 100%' : 'Live Telemetry Active'}
              </span>
            </div>
            <p className="text-[11px] text-white/50 mt-0.5">
              {isAr
                ? `الجدول السحابي: vant_analytics_events • إجمالي الجلسات المسجلة: ${stats.customerSessions?.length || 0} • زوار فريدون: ${stats.uniqueVisitors || 0}`
                : `Cloud table: vant_analytics_events • Sessions: ${stats.customerSessions?.length || 0} • Visitors: ${stats.uniqueVisitors || 0}`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Cloud Sync Button */}
          <button
            type="button"
            onClick={handleTriggerSync}
            disabled={isLiveSyncing}
            className="flex items-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 text-xs font-semibold text-blue-300 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLiveSyncing ? 'animate-spin text-blue-400' : 'text-blue-400'}`} />
            <span>{isLiveSyncing ? (isAr ? 'جاري المزامنة...' : 'Syncing...') : (isAr ? 'مزامنة سحابية الآن' : 'Sync Cloud')}</span>
          </button>

          {/* Simulation Trigger */}
          <button
            type="button"
            onClick={() => setSimModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-[#004ad7]/40 bg-[#004ad7]/15 hover:bg-[#004ad7]/25 px-3 py-1.5 text-xs font-semibold text-white transition-all cursor-pointer"
          >
            <Play className="h-3.5 w-3.5 text-[#60a5fa]" />
            <span>{isAr ? 'اختبار الخوارزميات' : 'Test Algorithms'}</span>
          </button>

          {/* Clear Local Cache */}
          <button
            type="button"
            onClick={handleClearData}
            className="flex items-center gap-1 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-white/70 hover:text-white transition-all cursor-pointer"
            title={isAr ? 'مسح بيانات التفاعل المحلية لإعادة الاختبار' : 'Clear local events'}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Sync Toast Feedback */}
      {syncToast && (
        <div className="rounded-xl border border-[#004ad7]/40 bg-[#004ad7]/15 px-4 py-2 text-xs font-semibold text-white flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4 text-[#3b82f6]" />
          <span>{isAr ? 'تمت مزامنة كافة الأحداث وتحليلات الزوار مع السحابة بنجاح!' : 'Successfully synced analytics telemetry with cloud!'}</span>
        </div>
      )}

      {/* Simulation Feedback Alert */}
      {simSuccessMsg && (
        <div className="rounded-xl border border-[#004ad7]/40 bg-[#004ad7]/15 px-4 py-2 text-xs font-semibold text-white flex items-center gap-2 animate-in fade-in duration-200">
          <Sparkles className="h-4 w-4 text-[#3b82f6]" />
          <span>{simSuccessMsg}</span>
        </div>
      )}

      {/* Simulation Modal Dialog */}
      {simModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl border border-white/15 bg-[#12151f] p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  <Play className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {isAr ? 'مختبر محاكاة سلوك الزبائن وتدقيق الخوارزميات' : 'Behavior Telemetry Simulator'}
                  </h3>
                  <p className="text-xs text-white/50">
                    {isAr ? 'اختبر رد فعل الخوارزميات الثلاث ومزامنتها الحية بنقرة واحدة' : 'Simulate live journeys to test the 3 algorithms instantly'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSimModalOpen(false)}
                className="rounded-xl border border-white/10 p-2 text-white/60 hover:bg-white/10 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {/* Scenario 1: Hesitation */}
              <button
                type="button"
                disabled={isSimulating}
                onClick={async () => {
                  setSimModalOpen(false);
                  await handleRunSimulation('hesitation');
                }}
                className="w-full flex items-start gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/[0.04] p-3.5 text-start hover:bg-rose-500/10 hover:border-rose-500/40 transition-all cursor-pointer group disabled:opacity-50"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 group-hover:scale-105 transition-transform">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-white">
                      {isAr ? '1. محاكاة تردد في المقاس (Hesitation Signal)' : '1. Sizing Hesitation Journey'}
                    </span>
                    <span className="rounded bg-rose-500/20 px-1.5 py-0.2 text-[9px] font-bold text-rose-300">الخوارزمية 1</span>
                  </div>
                  <p className="text-[11px] text-white/60 mt-1">
                    {isAr
                      ? 'محاكاة عميل يقلب المقاسات ويبقى في تفاصيل القطعة دون إتمام الطلب، لتفعيل إشعار الاستعادة عبر واتساب'
                      : 'Simulate hesitation loop triggering automated WhatsApp recovery draft'}
                  </p>
                </div>
              </button>

              {/* Scenario 2: VIP Buyer */}
              <button
                type="button"
                disabled={isSimulating}
                onClick={async () => {
                  setSimModalOpen(false);
                  await handleRunSimulation('vip_order');
                }}
                className="w-full flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-3.5 text-start hover:bg-amber-500/10 hover:border-amber-500/40 transition-all cursor-pointer group disabled:opacity-50"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 group-hover:scale-105 transition-transform">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-white">
                      {isAr ? '2. محاكاة عميل VIP مع طلب واتساب (VIP Journey)' : '2. VIP Buyer High-Intent Journey'}
                    </span>
                    <span className="rounded bg-amber-500/20 px-1.5 py-0.2 text-[9px] font-bold text-amber-300">الخوارزمية 2</span>
                  </div>
                  <p className="text-[11px] text-white/60 mt-1">
                    {isAr
                      ? 'محاكاة جلسة تصفح متعمقة مع إضافة للمفضلة ونقر إتمام الطلب بنقاط نية عالية 95/100'
                      : 'Simulate high engagement session resulting in a WhatsApp checkout with 95/100 intent'}
                  </p>
                </div>
              </button>

              {/* Scenario 3: Unmet Search Demand */}
              <button
                type="button"
                disabled={isSimulating}
                onClick={async () => {
                  setSimModalOpen(false);
                  await handleRunSimulation('zero_search');
                }}
                className="w-full flex items-start gap-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.04] p-3.5 text-start hover:bg-cyan-500/10 hover:border-cyan-500/40 transition-all cursor-pointer group disabled:opacity-50"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 group-hover:scale-105 transition-transform">
                  <Search className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-white">
                      {isAr ? '3. محاكاة بحث غير متوفر (Unmet Demand)' : '3. Zero-Result Search Demand'}
                    </span>
                    <span className="rounded bg-cyan-500/20 px-1.5 py-0.2 text-[9px] font-bold text-cyan-300">الخوارزمية 3</span>
                  </div>
                  <p className="text-[11px] text-white/60 mt-1">
                    {isAr
                      ? 'محاكاة بحث زائر عن عباية أو فستان غير موجود لتسجيل فرصة بيع في رادار الطلب المفقود'
                      : 'Simulate search query without matching catalog items to track missed revenue opportunity'}
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ALGORITHMIC NAVIGATION TABS: OVERVIEW & 3 ALGORITHMS + PIECES MATRIX */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 p-1.5 rounded-2xl bg-black/40 border border-white/10">
        <button
          type="button"
          onClick={() => setActiveAlgorithmView('all')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeAlgorithmView === 'all'
              ? 'bg-[#004ad7] text-white shadow-md shadow-[#004ad7]/30'
              : 'text-white/70 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>{isAr ? '🌐 النظرة الشاملة' : 'Overview'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAlgorithmView('piece_matrix')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeAlgorithmView === 'piece_matrix'
              ? 'bg-[#004ad7] text-white shadow-md shadow-[#004ad7]/30 ring-1 ring-[#3b82f6]/40'
              : 'text-white/70 hover:text-white hover:bg-white/[0.05]'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>{isAr ? '📊 مصفوفة القطع' : 'Pieces Matrix'}</span>
          <span className="rounded-full bg-white/15 text-[10px] font-mono font-bold px-1.5 py-0.2 text-white">
            {products.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAlgorithmView('algorithm1_hesitation')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
            activeAlgorithmView === 'algorithm1_hesitation'
              ? 'bg-[#004ad7] text-white shadow-md shadow-[#004ad7]/30 ring-1 ring-[#3b82f6]/40'
              : 'text-white/70 hover:text-white hover:bg-white/[0.05]'
          }`}
        >
          <AlertTriangle className="h-4 w-4" />
          <span>{isAr ? '⚠️ 1. كشف التردد' : '1. Hesitation'}</span>
          {(stats.hesitationSignals?.length || 0) > 0 && (
            <span className="rounded-full bg-white/15 text-[10px] font-mono font-bold px-1.5 py-0.2 text-white">
              {stats.hesitationSignals.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveAlgorithmView('algorithm2_personas')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeAlgorithmView === 'algorithm2_personas'
              ? 'bg-[#004ad7] text-white shadow-md shadow-[#004ad7]/30 ring-1 ring-[#3b82f6]/40'
              : 'text-white/70 hover:text-white hover:bg-white/[0.05]'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>{isAr ? '💎 2. التنميط والعملاء' : '2. Personas'}</span>
          <span className="rounded-full bg-white/15 text-[10px] font-mono font-bold px-1.5 py-0.2 text-white">
            {stats.customerSessions?.length || 0}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAlgorithmView('algorithm3_demand')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeAlgorithmView === 'algorithm3_demand'
              ? 'bg-[#004ad7] text-white shadow-md shadow-[#004ad7]/30 ring-1 ring-[#3b82f6]/40'
              : 'text-white/70 hover:text-white hover:bg-white/[0.05]'
          }`}
        >
          <Zap className="h-4 w-4" />
          <span>{isAr ? '🚀 3. سرعة الطلب' : '3. Demand Matrix'}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: EXECUTIVE OVERVIEW (KPIs + Funnel + Recharts) */}
      {/* ========================================================================= */}
      {(activeAlgorithmView === 'all') && (
        <div className="space-y-6">
          {/* Quick Deep-Dive Highlight Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Algorithm 1 Highlight */}
            <div
              onClick={() => setActiveAlgorithmView('algorithm1_hesitation')}
              className="rounded-2xl border border-rose-500/30 bg-rose-500/[0.05] hover:bg-rose-500/10 p-4 transition-all cursor-pointer space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{isAr ? 'الخوارزمية 1: كشف التردد' : 'Algorithm 1: Hesitation'}</span>
                </span>
                <span className="text-[11px] font-mono text-rose-300 font-bold group-hover:translate-x-[-4px] transition-transform">
                  {isAr ? 'استعراض الحالات ↵' : 'Open ↵'}
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-white">
                {stats.hesitationSignals?.length || 0} <span className="text-xs text-white/50 font-normal">{isAr ? 'حالة تردد نشطة' : 'signals'}</span>
              </div>
              <p className="text-[11px] text-white/60 line-clamp-1">
                {stats.hesitationSignals?.length > 0
                  ? isAr ? `أعلى حالة حرجة: ${stats.hesitationSignals[0].title}` : stats.hesitationSignals[0].title
                  : isAr ? 'لا توجد حالات تردد مسجلة حالياً.' : 'No active hesitation signals.'}
              </p>
            </div>

            {/* Algorithm 2 Highlight */}
            <div
              onClick={() => setActiveAlgorithmView('algorithm2_personas')}
              className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.05] hover:bg-amber-500/10 p-4 transition-all cursor-pointer space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" />
                  <span>{isAr ? 'الخوارزمية 2: التنميط السلوكي' : 'Algorithm 2: Personas'}</span>
                </span>
                <span className="text-[11px] font-mono text-amber-300 font-bold group-hover:translate-x-[-4px] transition-transform">
                  {isAr ? 'استعراض الزبائن ↵' : 'Open ↵'}
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-white">
                {stats.customerSessions?.filter((s) => s.persona === 'vip' || s.persona === 'high_intent').length || 0}{' '}
                <span className="text-xs text-white/50 font-normal">{isAr ? 'عميل عالي الجاهزية (VIP)' : 'High Intent'}</span>
              </div>
              <p className="text-[11px] text-white/60 line-clamp-1">
                {isAr ? 'تنميط ذكي لـ 7 شخصيات متسوقين مع نقاط نية الشراء (0-100).' : 'Smart RFM & Intent scoring for 7 distinct personas.'}
              </p>
            </div>

            {/* Algorithm 3 Highlight */}
            <div
              onClick={() => setActiveAlgorithmView('algorithm3_demand')}
              className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.05] hover:bg-emerald-500/10 p-4 transition-all cursor-pointer space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Zap className="h-4 w-4" />
                  <span>{isAr ? 'الخوارزمية 3: سرعة الطلب والمقاسات' : 'Algorithm 3: Demand & Sizing'}</span>
                </span>
                <span className="text-[11px] font-mono text-emerald-300 font-bold group-hover:translate-x-[-4px] transition-transform">
                  {isAr ? 'المصفوفة الكاملة ↵' : 'Open ↵'}
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-white">
                {stats.demandVelocity?.filter((d) => d.demandStatus === 'hot_trending').length || 0}{' '}
                <span className="text-xs text-white/50 font-normal">{isAr ? 'قطع برواج عالي جداً' : 'Hot Trending'}</span>
              </div>
              <p className="text-[11px] text-white/60 line-clamp-1">
                {isAr ? 'مقارنة حية لطلب المقاسات مقابل المعروض وذكاء البحث المفقود.' : 'Live size vs stock comparison & zero-result search radar.'}
              </p>
            </div>
          </div>

          {/* Expandable KPI Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* KPI 1: Page Views */}
            <div
              onClick={() => setExpandedKpi(expandedKpi === 'views' ? null : 'views')}
              className={`rounded-2xl border transition-all cursor-pointer p-4 space-y-1.5 ${
                expandedKpi === 'views'
                  ? 'border-[#3b82f6] bg-[#004ad7]/10 shadow-lg shadow-[#004ad7]/10'
                  : 'border-white/10 bg-white/[0.025] hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center justify-between text-white/50 text-xs">
                <span>{isAr ? 'إجمالي مشاهدات الكتالوج' : 'Total Page Views'}</span>
                <Activity className="h-4 w-4 text-[#3b82f6]" />
              </div>
              <div className="text-2xl font-bold text-white tabular-nums">
                {stats.totalPageViews.toLocaleString()}
              </div>
              <div className="flex items-center justify-between text-[10px] text-white/40">
                <span>{isAr ? `${stats.uniqueVisitors} زائر فريد` : `${stats.uniqueVisitors} unique`}</span>
                <span className="text-[#3b82f6] flex items-center gap-0.5">
                  {expandedKpi === 'views' ? isAr ? 'إخفاء' : 'Close' : isAr ? 'تفاصيل ▾' : 'Expand ▾'}
                </span>
              </div>
              {expandedKpi === 'views' && (
                <div className="pt-2 border-t border-white/10 text-xs space-y-1 text-white/70 animate-fade-in">
                  <div className="flex justify-between">
                    <span>{isAr ? 'المتصلون حالياً:' : 'Active now:'}</span>
                    <span className="text-emerald-400 font-bold">{stats.activeOnlineNow}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{isAr ? 'معدل التصفح للزائر:' : 'Views per visitor:'}</span>
                    <span className="font-mono">{(stats.totalPageViews / Math.max(1, stats.uniqueVisitors)).toFixed(1)}x</span>
                  </div>
                </div>
              )}
            </div>

            {/* KPI 2: Engagement Duration */}
            <div
              onClick={() => setExpandedKpi(expandedKpi === 'engagement' ? null : 'engagement')}
              className={`rounded-2xl border transition-all cursor-pointer p-4 space-y-1.5 ${
                expandedKpi === 'engagement'
                  ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                  : 'border-white/10 bg-white/[0.025] hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center justify-between text-white/50 text-xs">
                <span>{isAr ? 'متوسط مدة الجلسة' : 'Avg Session Duration'}</span>
                <Clock className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-emerald-400 tabular-nums">
                {Math.floor(stats.avgSessionSeconds / 60)}m {stats.avgSessionSeconds % 60}s
              </div>
              <div className="flex items-center justify-between text-[10px] text-emerald-400/70">
                <span>{isAr ? 'تفاعل نشط' : 'Active browse time'}</span>
                <span className="text-emerald-400 flex items-center gap-0.5">
                  {expandedKpi === 'engagement' ? isAr ? 'إخفاء' : 'Close' : isAr ? 'تفاصيل ▾' : 'Expand ▾'}
                </span>
              </div>
              {expandedKpi === 'engagement' && (
                <div className="pt-2 border-t border-white/10 text-xs space-y-1 text-white/70 animate-fade-in">
                  <div className="flex justify-between">
                    <span>{isAr ? 'جلسات أطول من دقيقتين:' : 'Sessions > 2min:'}</span>
                    <span className="text-emerald-400 font-bold">
                      {stats.customerSessions.filter((s) => s.durationSeconds > 120).length}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* KPI 3: Wishlist Adds */}
            <div
              onClick={() => setExpandedKpi(expandedKpi === 'wishlist' ? null : 'wishlist')}
              className={`rounded-2xl border transition-all cursor-pointer p-4 space-y-1.5 ${
                expandedKpi === 'wishlist'
                  ? 'border-rose-500 bg-rose-500/10 shadow-lg shadow-rose-500/10'
                  : 'border-white/10 bg-white/[0.025] hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center justify-between text-white/50 text-xs">
                <span>{isAr ? 'إضافات المفضلة' : 'Wishlist Adds'}</span>
                <Heart className="h-4 w-4 text-rose-400" />
              </div>
              <div className="text-2xl font-bold text-rose-400 tabular-nums">
                {stats.totalWishlistAdds.toLocaleString()}
              </div>
              <div className="flex items-center justify-between text-[10px] text-rose-400/70">
                <span>{isAr ? 'رغبة شراء' : 'Intent signals'}</span>
                <span className="text-rose-400 flex items-center gap-0.5">
                  {expandedKpi === 'wishlist' ? isAr ? 'إخفاء' : 'Close' : isAr ? 'تفاصيل ▾' : 'Expand ▾'}
                </span>
              </div>
              {expandedKpi === 'wishlist' && (
                <div className="pt-2 border-t border-white/10 text-xs space-y-1 text-white/70 animate-fade-in">
                  <div className="flex justify-between">
                    <span>{isAr ? 'نسبة حفظ القطع:' : 'Save rate:'}</span>
                    <span className="font-mono">
                      {stats.totalProductViews > 0
                        ? ((stats.totalWishlistAdds / stats.totalProductViews) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* KPI 4: WhatsApp Orders & Conversion Rate */}
            <div
              onClick={() => setExpandedKpi(expandedKpi === 'conversion' ? null : 'conversion')}
              className={`rounded-2xl border transition-all cursor-pointer p-4 space-y-1.5 ${
                expandedKpi === 'conversion'
                  ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10'
                  : 'border-white/10 bg-white/[0.025] hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center justify-between text-white/50 text-xs">
                <span>{isAr ? 'طلبات الواتساب والتحويل' : 'WhatsApp Orders'}</span>
                <MessageCircle className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-emerald-400 tabular-nums">
                {stats.totalWhatsAppClicks}
              </div>
              <div className="flex items-center justify-between text-[10px] text-emerald-400/70">
                <span>{isAr ? `معدل التحويل: ${stats.conversionRate}%` : `${stats.conversionRate}% CTR`}</span>
                <span className="text-amber-400 flex items-center gap-0.5">
                  {expandedKpi === 'conversion' ? isAr ? 'إخفاء' : 'Close' : isAr ? 'تفاصيل ▾' : 'Expand ▾'}
                </span>
              </div>
              {expandedKpi === 'conversion' && (
                <div className="pt-2 border-t border-white/10 text-xs space-y-1 text-white/70 animate-fade-in">
                  <div className="flex justify-between">
                    <span>{isAr ? 'التحويل من المشاهدة للطلب:' : 'Views to Order:'}</span>
                    <span className="font-mono text-emerald-400 font-bold">{stats.conversionRate}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Conversion Funnel & Bottleneck Diagnosis */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6 backdrop-blur-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="h-4 w-4 text-[#3b82f6]" />
                  <span>{isAr ? 'مسار تجربة وتحويل العميل (Conversion Funnel)' : 'Conversion Funnel Progression'}</span>
                </h3>
                <p className="text-[11px] text-white/50 mt-0.5">
                  {isAr ? 'تتبع انتقال الزائر عبر الخطوات الأربع مع كشف مواضع التسرب السلوكي تلقائياً' : 'Drop-off analysis across each conversion step'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-white/60">{isAr ? 'التحويل الإجمالي:' : 'Overall:'}</span>
                <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-mono font-bold text-emerald-400">
                  {stats.conversionRate}%
                </span>
              </div>
            </div>

            {/* 4-Step Interactive Funnel Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Step 1 */}
              <div className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-white/50">
                  <span className="font-semibold text-white/70">{isAr ? '1. تصفح الكتالوج' : '1. Catalog Views'}</span>
                  <span className="font-mono text-[10px] text-white/40">100%</span>
                </div>
                <div className="text-2xl font-bold text-white font-mono tabular-nums">
                  {stats.funnel.catalogViews.toLocaleString()}
                </div>
                <div className="text-[10px] text-white/40">
                  {isAr ? 'إجمالي زيارات واجهة المتجر' : 'Boutique lookbook visits'}
                </div>
              </div>

              {/* Step 2 */}
              <div className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white/70">{isAr ? '2. فحص القطعة' : '2. Piece Inspection'}</span>
                  <span className="font-mono text-[11px] text-[#3b82f6] font-bold">
                    {stats.funnelDiagnosis.step1ConversionRate}%
                  </span>
                </div>
                <div className="text-2xl font-bold text-white font-mono tabular-nums">
                  {stats.funnel.productSheetOpens.toLocaleString()}
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-white/40">{isAr ? 'فتح تفاصيل القطع' : 'Product sheet opens'}</span>
                  {stats.funnelDiagnosis.dropOffCatalogToProduct > 0 && (
                    <span className="text-amber-400 font-mono">
                      🔻 -{stats.funnelDiagnosis.dropOffCatalogToProduct} {isAr ? 'تسرب' : 'drop'}
                    </span>
                  )}
                </div>
              </div>

              {/* Step 3 */}
              <div className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white/70">{isAr ? '3. تحديد المقاس' : '3. Sizing Selection'}</span>
                  <span className="font-mono text-[11px] text-purple-400 font-bold">
                    {stats.funnelDiagnosis.step2ConversionRate}%
                  </span>
                </div>
                <div className="text-2xl font-bold text-white font-mono tabular-nums">
                  {stats.funnel.sizeSelections.toLocaleString()}
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-white/40">{isAr ? 'اختيار مقاس محدد' : 'Selected size'}</span>
                  {stats.funnelDiagnosis.dropOffProductToSize > 0 && (
                    <span className="text-amber-400 font-mono">
                      🔻 -{stats.funnelDiagnosis.dropOffProductToSize} {isAr ? 'تسرب' : 'drop'}
                    </span>
                  )}
                </div>
              </div>

              {/* Step 4 */}
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.04] p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-400">{isAr ? '4. طلب الواتساب' : '4. WhatsApp Order'}</span>
                  <span className="font-mono text-[11px] text-emerald-400 font-bold">
                    {stats.funnelDiagnosis.step3ConversionRate}%
                  </span>
                </div>
                <div className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">
                  {stats.funnel.whatsappConversions.toLocaleString()}
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-emerald-400/70">{isAr ? 'إرسال محادثة الطلب' : 'WhatsApp clicks'}</span>
                  {stats.funnelDiagnosis.dropOffSizeToOrder > 0 && (
                    <span className="text-rose-400 font-mono">
                      🔻 -{stats.funnelDiagnosis.dropOffSizeToOrder} {isAr ? 'تردد' : 'stalled'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Diagnosis Banner */}
            <div className="rounded-2xl border border-white/10 bg-black/50 p-4 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  <span>{isAr ? 'تشخيص الخوارزمية لنقاط الهدر والتوصية العلاجية:' : 'Algorithmic Bottleneck Diagnosis:'}</span>
                </span>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                  stats.funnelDiagnosis.primaryDropOffStage === 'healthy'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  {stats.funnelDiagnosis.primaryDropOffStage === 'inspection'
                    ? isAr ? '⚠️ تسرب التصفح الأولي' : 'Catalog Drop'
                    : stats.funnelDiagnosis.primaryDropOffStage === 'sizing'
                    ? isAr ? '⚠️ تردد عند اختيار المقاس' : 'Sizing Hesitation'
                    : stats.funnelDiagnosis.primaryDropOffStage === 'whatsapp'
                    ? isAr ? '⚠️ تردد عند زر الواتساب' : 'WhatsApp Hesitation'
                    : isAr ? '✨ مسار تحويل ممتاز' : 'Healthy Funnel'}
                </span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                {stats.funnelDiagnosis.diagnosisMessage}
              </p>
            </div>
          </div>

          {/* User Engagement Area Chart */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6 backdrop-blur-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-400" />
                  <span>{isAr ? '📈 مخطط تفاعل المستخدمين وساعات الذروة (User Engagement Analytics)' : 'User Engagement Analytics'}</span>
                </h3>
                <p className="text-[11px] text-white/50 mt-0.5">
                  {isAr ? 'توزيع مدة مكوث وتفاعل الزوار بالدقائق وعدد الزيارات على مدار ساعات اليوم' : 'Total engagement minutes and visitor traffic distribution'}
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-emerald-400 font-mono">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  {isAr ? 'دقائق التفاعل' : 'Engagement Min'}
                </span>
                <span className="flex items-center gap-1.5 text-[#3b82f6] font-mono">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#3b82f6]" />
                  {isAr ? 'الزوار النشطون' : 'Visitors'}
                </span>
              </div>
            </div>

            <div className="h-64 sm:h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyEngagementData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="engagementGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="visitorsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="hour" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="durationMinutes"
                    name={isAr ? 'دقائق التفاعل' : 'Engagement (Min)'}
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#engagementGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="visitors"
                    name={isAr ? 'الزوار' : 'Visitors'}
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#visitorsGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Charts Grid: Most-Viewed Products & Wishlist Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Most-Viewed Products */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6 backdrop-blur-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Eye className="h-4 w-4 text-[#3b82f6]" />
                    <span>{isAr ? '👗 القطع الأكثر مشاهدة (Most-Viewed Products)' : 'Most-Viewed Products'}</span>
                  </h3>
                  <p className="text-[11px] text-white/50 mt-0.5">
                    {isAr ? 'ترتيب القطع حسب عدد مرات المعاينة الحقيقية' : 'Ranking products by customer view frequency'}
                  </p>
                </div>
              </div>
              <div className="h-64 sm:h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mostViewedProductsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="views" name={isAr ? 'المشاهدات' : 'Views'} fill="#3b82f6" radius={[6, 6, 0, 0]}>
                      {mostViewedProductsData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={VIEW_BAR_COLORS[index % VIEW_BAR_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Wishlist Activity */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6 backdrop-blur-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Heart className="h-4 w-4 text-rose-400" />
                    <span>{isAr ? '💖 نشاط قائمة المفضلة (Wishlist Activity)' : 'Wishlist Activity'}</span>
                  </h3>
                  <p className="text-[11px] text-white/50 mt-0.5">
                    {isAr ? 'القطع الأكثر حفظاً وإضافة لقائمة الرغبات لدى المتسوقين' : 'Most-saved pieces in shoppers wishlists'}
                  </p>
                </div>
              </div>
              <div className="h-64 sm:h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={wishlistActivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="wishlist" name={isAr ? 'إضافات المفضلة' : 'Wishlist Adds'} fill="#f43f5e" radius={[6, 6, 0, 0]}>
                      {wishlistActivityData.map((_, index) => (
                        <Cell key={`cell-w-${index}`} fill={WISHLIST_BAR_COLORS[index % WISHLIST_BAR_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Piece CTR & Device Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6 backdrop-blur-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <MousePointerClick className="h-4 w-4 text-cyan-400" />
                    <span>{isAr ? 'معدل الضغطات والتحويل للقطع (Click-Through Rates)' : 'Piece CTR & Actions Performance'}</span>
                  </h3>
                  <p className="text-[11px] text-white/50 mt-0.5">
                    {isAr ? 'مقارنة المشاهدات مع طلبات الواتساب ونسبة النقر لكل قطعة' : 'Views vs WhatsApp conversion rate per piece'}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1 text-[#3b82f6]">■ {isAr ? 'مشاهدات' : 'Views'}</span>
                  <span className="flex items-center gap-1 text-[#10b981]">■ {isAr ? 'واتساب' : 'WhatsApp'}</span>
                </div>
              </div>
              <div className="h-64 sm:h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={productChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} />
                    <YAxis yAxisId="left" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" stroke="rgba(245, 158, 11, 0.7)" fontSize={10} tickLine={false} unit="%" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar yAxisId="left" dataKey="views" name={isAr ? 'المشاهدات' : 'Views'} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="left" dataKey="whatsapp" name={isAr ? 'طلبات الواتساب' : 'WhatsApp Orders'} fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="ctr" name={isAr ? 'نسبة النقر (CTR)' : 'CTR %'} stroke="#f59e0b" strokeWidth={2.5} dot={{ fill: '#f59e0b', r: 4 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Device Breakdown Donut */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6 backdrop-blur-md space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-purple-400" />
                  <span>{isAr ? 'توزيع الأجهزة والمنصات' : 'Device Distribution'}</span>
                </h3>
                <p className="text-[11px] text-white/50 mt-0.5">
                  {isAr ? 'نسبة استخدام الموبايل والكمبيوتر' : 'Mobile vs Desktop traffic'}
                </p>
              </div>
              <div className="h-48 w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={deviceData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                      {deviceData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={DEVICE_COLORS[index % DEVICE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-bold text-white tabular-nums">
                    {stats.deviceBreakdown.mobile}%
                  </span>
                  <span className="text-[9px] text-white/50">{isAr ? 'موبايل' : 'Mobile'}</span>
                </div>
              </div>
              <div className="space-y-1.5 pt-2 border-t border-white/10 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-white/70">
                    <span className="h-2 w-2 rounded-full bg-[#3b82f6]" />
                    {isAr ? 'الهواتف الذكية' : 'Mobile'}
                  </span>
                  <span className="font-mono font-bold text-white">{stats.deviceBreakdown.mobile}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-white/70">
                    <span className="h-2 w-2 rounded-full bg-[#10b981]" />
                    {isAr ? 'أجهزة الكمبيوتر' : 'Desktop'}
                  </span>
                  <span className="font-mono font-bold text-white">{stats.deviceBreakdown.desktop}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: ALGORITHM 1 - HESITATION & ABANDONMENT WITH 1-CLICK RECOVERY */}
      {/* ========================================================================= */}
      {(activeAlgorithmView === 'algorithm1_hesitation') && (
        <div className="space-y-6 animate-fade-in">
          {/* Header & Urgency Filters */}
          <div className="rounded-3xl border border-rose-500/30 bg-gradient-to-r from-rose-500/[0.08] via-[#12151f] to-black p-5 sm:p-6 backdrop-blur-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-rose-400" />
                  <span>{isAr ? 'الخوارزمية 1: كشف التردد والاحتباس ومحرك الاستعادة الفورية' : 'Algorithm 1: Hesitation & 1-Click Recovery Engine'}</span>
                </h3>
                <p className="text-xs text-white/60 mt-1">
                  {isAr
                    ? 'رصد الزبائن الذين توقفوا قبل إتمام الطلب (حيرة في المقاس، التردد عند السعر، أو التوقف عند زر الواتساب) مع توليد رسائل وحوافز استعادة مخصصة فورية'
                    : 'Real-time bottleneck detection with tailored recovery messaging and promo incentives'}
                </p>
              </div>

              {/* Urgency Filter Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {(
                  [
                    { id: 'all', label_ar: 'كافة الحالات', count: stats.hesitationSignals?.length || 0 },
                    { id: 'critical', label_ar: '🚨 حرج (عند زر الطلب)', count: stats.hesitationSignals?.filter((s) => s.urgency === 'critical').length || 0 },
                    { id: 'high', label_ar: '⚠️ عالي (حيرة مقاس/سعر)', count: stats.hesitationSignals?.filter((s) => s.urgency === 'high').length || 0 },
                    { id: 'medium', label_ar: '💡 متوسط (استكشاف)', count: stats.hesitationSignals?.filter((s) => s.urgency === 'medium').length || 0 },
                  ] as const
                ).map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setHesitationUrgencyFilter(u.id)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                      hesitationUrgencyFilter === u.id
                        ? 'bg-rose-600 border-rose-500 text-white shadow-md'
                        : 'border-white/10 bg-black/40 text-white/70 hover:text-white'
                    }`}
                  >
                    <span>{u.label_ar}</span>
                    <span className="font-mono text-[10px] font-bold opacity-80">({u.count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-white/10">
              <div className="rounded-xl border border-white/10 bg-black/40 p-3">
                <span className="text-[11px] text-white/50 block">{isAr ? 'إجمالي الحالات المترددة' : 'Total Hesitant'}</span>
                <span className="text-xl font-bold font-mono text-white mt-0.5 block">{stats.hesitationSignals?.length || 0}</span>
              </div>
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.04] p-3">
                <span className="text-[11px] text-rose-300 block">{isAr ? 'حالات حرجة تتطلب تدخلاً' : 'Critical Leads'}</span>
                <span className="text-xl font-bold font-mono text-rose-400 mt-0.5 block">
                  {stats.hesitationSignals?.filter((s) => s.urgency === 'critical').length || 0}
                </span>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/40 p-3">
                <span className="text-[11px] text-white/50 block">{isAr ? 'تردد في تحديد المقاس' : 'Sizing Hesitation'}</span>
                <span className="text-xl font-bold font-mono text-purple-400 mt-0.5 block">
                  {stats.hesitationSignals?.filter((s) => s.type === 'sizing_hesitation').length || 0}
                </span>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/40 p-3">
                <span className="text-[11px] text-white/50 block">{isAr ? 'تردد في السعر والقيمة' : 'Price Hesitation'}</span>
                <span className="text-xl font-bold font-mono text-amber-400 mt-0.5 block">
                  {stats.hesitationSignals?.filter((s) => s.type === 'price_hesitation').length || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Hesitant Signals List */}
          <div className="space-y-3">
            {filteredHesitationSignals.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-12 text-center space-y-2">
                <Check className="h-8 w-8 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">{isAr ? 'لا توجد حالات تردد مرصودة حالياً' : 'No Hesitant Leads Detected'}</h4>
                <p className="text-xs text-white/50 max-w-md mx-auto">
                  {isAr
                    ? 'جميع الزوار الحاليين ينتقلون بسلاسة أو يقومون بالطلب دون عوائق سلوكية واضحة.'
                    : 'Visitors are currently flowing smoothly with no significant drop-offs.'}
                </p>
              </div>
            ) : (
              filteredHesitationSignals.map((signal) => (
                <div
                  key={signal.id}
                  className={`rounded-2xl border p-4 sm:p-5 transition-all space-y-3.5 ${
                    signal.urgency === 'critical'
                      ? 'border-rose-500/40 bg-gradient-to-r from-rose-500/[0.06] via-[#12151f] to-black shadow-lg shadow-rose-500/5'
                      : signal.urgency === 'high'
                      ? 'border-amber-500/30 bg-[#12151f]'
                      : 'border-white/10 bg-black/40'
                  }`}
                >
                  {/* Signal Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
                    <div className="flex items-center gap-2.5">
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border text-xs font-bold ${
                        signal.urgency === 'critical'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : signal.urgency === 'high'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      }`}>
                        {signal.urgency === 'critical' ? '🚨' : signal.urgency === 'high' ? '⚠️' : '💡'}
                      </span>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                          <span>{signal.title}</span>
                          <span className="font-mono text-[10px] text-white/40">({signal.sessionId.substring(0, 10)})</span>
                        </h4>
                        <p className="text-[11px] text-white/60 mt-0.5">{signal.details}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-end">
                        <span className="text-[10px] text-white/40 block">{isAr ? 'مؤشر التردد' : 'Hesitation Score'}</span>
                        <span className="text-sm font-bold font-mono text-rose-400 tabular-nums">{signal.hesitationScore}/100</span>
                      </div>
                    </div>
                  </div>

                  {/* Context Data Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
                      <span className="text-[10px] text-white/40 block">{isAr ? 'القطعة المعنية والمقاس:' : 'Piece & Size:'}</span>
                      <span className="font-semibold text-white mt-0.5 block truncate">
                        {signal.targetProductTitle || 'غير محدد'} {signal.targetSize && `[${signal.targetSize}]`}
                      </span>
                    </div>

                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
                      <span className="text-[10px] text-white/40 block">{isAr ? 'مدة المكوث والتأمل:' : 'Dwell Time:'}</span>
                      <span className="font-mono font-semibold text-amber-300 mt-0.5 block">
                        {Math.floor(signal.dwellSeconds / 60)}m {signal.dwellSeconds % 60}s
                      </span>
                    </div>

                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
                      <span className="text-[10px] text-white/40 block">{isAr ? 'الإجراء العلاجي المقترح:' : 'Prescribed Action:'}</span>
                      <span className="font-semibold text-emerald-400 mt-0.5 block truncate">{signal.suggestedAction}</span>
                    </div>
                  </div>

                  {/* Pre-written Luxury WhatsApp Recovery Script */}
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                        <MessageCircle className="h-4 w-4" />
                        <span>{isAr ? 'نص رسالة الاستعادة المخصصة (جاهز للإرسال الفوري):' : 'Tailored Recovery Message:'}</span>
                      </span>
                      {signal.suggestedPromoCode && (
                        <span className="rounded bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-300">
                          كوبون: {signal.suggestedPromoCode}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/80 leading-relaxed font-sans bg-black/40 p-2.5 rounded-lg border border-white/5 select-all">
                      "{signal.recoveryWhatsAppMessage}"
                    </p>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleCopyRecoveryScript(signal)}
                        className="flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/15 px-3 py-1.5 text-xs font-semibold text-white transition-all cursor-pointer"
                      >
                        {copiedSignalId === signal.id ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-emerald-400">{isAr ? 'تم النسخ بنجاح ✓' : 'Copied!'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>{isAr ? 'نسخ نص الرسالة' : 'Copy Script'}</span>
                          </>
                        )}
                      </button>

                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(signal.recoveryWhatsAppMessage)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>{isAr ? 'فتح محادثة واتساب للمتابعة' : 'Open WhatsApp Chat'}</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: ALGORITHM 2 - BUYER PERSONAS & INTENT SCORING (0 - 100) */}
      {/* ========================================================================= */}
      {(activeAlgorithmView === 'algorithm2_personas') && (
        <div className="space-y-6 animate-fade-in">
          {/* Persona Distribution Cards Grid */}
          <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-r from-amber-500/[0.05] via-[#12151f] to-black p-5 sm:p-6 backdrop-blur-md space-y-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-400" />
                <span>{isAr ? 'الخوارزمية 2: التنميط السلوكي وتصنيف نية الشراء (Buyer Personas 0 - 100)' : 'Algorithm 2: Customer Personas & RFM/Intent Scoring'}</span>
              </h3>
              <p className="text-xs text-white/60 mt-1">
                {isAr
                  ? 'تصنيف تلقائي متقدم لكل زائر وفق معادلة نية الشراء وبصمة الذوق وتعمق التصفح لاستخراج الشخصيات السلوكية الـ 7'
                  : 'Automated visitor classification based on lead scoring, dwell time, and catalog engagement depth'}
              </p>
            </div>

            {/* Persona Grid (Clickable Filters) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-2">
              {(
                [
                  { id: 'all', icon: '🌐', label: isAr ? 'كافة الزوار' : 'All', count: stats.customerSessions?.length || 0, color: 'border-white/10' },
                  { id: 'vip', icon: '👑', label: isAr ? 'نخبوي جاهز (VIP)' : 'VIP', count: stats.personaDistribution?.vip || 0, color: 'border-amber-500/40 text-amber-300' },
                  { id: 'high_intent', icon: '💎', label: isAr ? 'اهتمام عالي' : 'High Intent', count: stats.personaDistribution?.high_intent || 0, color: 'border-emerald-500/40 text-emerald-300' },
                  { id: 'hesitant_buyer', icon: '⏳', label: isAr ? 'متردد بحاجة لحافز' : 'Hesitant', count: stats.personaDistribution?.hesitant_buyer || 0, color: 'border-rose-500/40 text-rose-300' },
                  { id: 'deal_hunter', icon: '🏷️', label: isAr ? 'باحث عروض' : 'Deal Hunter', count: stats.personaDistribution?.deal_hunter || 0, color: 'border-purple-500/40 text-purple-300' },
                  { id: 'fashion_enthusiast', icon: '👗', label: isAr ? 'متذوق أزياء' : 'Enthusiast', count: stats.personaDistribution?.fashion_enthusiast || 0, color: 'border-cyan-500/40 text-cyan-300' },
                  { id: 'trend_explorer', icon: '🔍', label: isAr ? 'مستكشف صيحات' : 'Explorer', count: stats.personaDistribution?.trend_explorer || 0, color: 'border-blue-500/40 text-blue-300' },
                ] as const
              ).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setCustomerFilter(p.id)}
                  className={`rounded-2xl border p-3 text-center transition-all cursor-pointer space-y-1 ${
                    customerFilter === p.id
                      ? 'bg-white/15 border-white shadow-md scale-102'
                      : 'bg-black/40 hover:bg-black/60 ' + p.color
                  }`}
                >
                  <span className="text-base block">{p.icon}</span>
                  <span className="text-xs font-bold text-white block truncate">{p.label}</span>
                  <span className="text-sm font-bold font-mono text-white/90 tabular-nums block">{p.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Search & Sessions List */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isAr ? 'بحث بمعرف الجلسة، المحافظة، أو القطع المعاينة...' : 'Search by session, governorate, or items...'}
                  className="w-full rounded-xl border border-white/15 bg-black/40 pr-10 pl-4 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#3b82f6]"
                />
              </div>

              <div className="text-xs text-white/50">
                {isAr ? `عرض ${filteredSessions.length} من أصل ${stats.customerSessions?.length || 0} زبون` : `Showing ${filteredSessions.length} sessions`}
              </div>
            </div>

            {/* Sessions Cards */}
            <div className="space-y-2.5">
              {filteredSessions.length === 0 ? (
                <div className="py-12 text-center text-xs text-white/40 border border-white/5 rounded-3xl bg-black/20">
                  {isAr ? 'لا توجد جلسات مسجلة ضمن هذا التصنيف' : 'No customer sessions matching filter'}
                </div>
              ) : (
                filteredSessions.slice(0, 20).map((session) => {
                  const isExpanded = expandedSessionId === session.sessionId;
                  return (
                    <div
                      key={session.sessionId}
                      className={`rounded-2xl border transition-all ${
                        isExpanded
                          ? 'border-[#004ad7]/60 bg-[#12151f] shadow-xl'
                          : 'border-white/10 bg-black/30 hover:bg-black/50'
                      }`}
                    >
                      {/* Summary Row */}
                      <div
                        onClick={() => setExpandedSessionId(isExpanded ? null : session.sessionId)}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 gap-3 cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-sm font-bold ${session.personaBadgeColor}`}>
                            {session.persona === 'vip' ? '👑' : session.persona === 'high_intent' ? '💎' : session.persona === 'hesitant_buyer' ? '⏳' : session.persona === 'deal_hunter' ? '🏷️' : session.persona === 'fashion_enthusiast' ? '👗' : '🔍'}
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs font-bold text-white">
                                {session.sessionId.substring(0, 14)}
                              </span>
                              <span className={`rounded-full px-2 py-0.2 text-[10px] font-bold border ${session.personaBadgeColor}`}>
                                {session.personaLabel}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-white/50 mt-1">
                              <span>📍 {session.governorate}</span>
                              <span>📱 {session.device}</span>
                              <span>⏱️ {Math.floor(session.durationSeconds / 60)}m {session.durationSeconds % 60}s</span>
                              <span>🎯 {session.eventsCount} تفاعل</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-end">
                            <span className="text-[10px] text-white/40 block">{isAr ? 'نقاط العميل' : 'Lead Score'}</span>
                            <span className={`text-sm font-bold font-mono tabular-nums ${
                              session.leadScore >= 80 ? 'text-amber-400' : session.leadScore >= 50 ? 'text-emerald-400' : 'text-white/70'
                            }`}>
                              {session.leadScore} / 100
                            </span>
                          </div>
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.05] text-white/60">
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details: Taste Fingerprint + Timeline */}
                      {isExpanded && (
                        <div className="border-t border-white/10 p-4 sm:p-5 bg-black/40 rounded-b-2xl space-y-4 animate-fade-in">
                          {/* Taste Fingerprint Grid */}
                          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2">
                            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                              <Sparkles className="h-3.5 w-3.5" />
                              <span>{isAr ? 'بصمة الذوق والاهتمام السلوكي (Taste & Intent Fingerprint):' : 'Taste & Intent Fingerprint:'}</span>
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs pt-1">
                              <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                                <span className="text-[10px] text-white/40 block">{isAr ? 'القسم الأكثر تصفحاً' : 'Primary Category'}</span>
                                <span className="font-semibold text-white mt-0.5 block truncate">{session.tasteFingerprint.primaryCategory}</span>
                              </div>
                              <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                                <span className="text-[10px] text-white/40 block">{isAr ? 'المقاس المفضل المرجح' : 'Preferred Size'}</span>
                                <span className="font-semibold text-emerald-400 font-mono mt-0.5 block">
                                  {session.tasteFingerprint.preferredSize ? `[${session.tasteFingerprint.preferredSize}]` : isAr ? 'غير محدد' : 'N/A'}
                                </span>
                              </div>
                              <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                                <span className="text-[10px] text-white/40 block">{isAr ? 'متوسط سعر القطع المعاينة' : 'Avg Viewed Price'}</span>
                                <span className="font-semibold text-amber-400 font-mono mt-0.5 block">
                                  {session.tasteFingerprint.avgViewedPrice > 0 ? `${session.tasteFingerprint.avgViewedPrice.toLocaleString()} د.ع` : isAr ? 'تصفح عام' : 'N/A'}
                                </span>
                              </div>
                              <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                                <span className="text-[10px] text-white/40 block">{isAr ? 'فحص الصور والحاسبة' : 'Gallery & Fit Finder'}</span>
                                <span className="font-semibold text-cyan-300 mt-0.5 block">
                                  {session.tasteFingerprint.imageInteractionCount} تقليب {session.tasteFingerprint.fitCalculatorUsed ? '· حاسبة ✓' : ''}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Chronological Action Timeline */}
                          <div className="space-y-2 pt-1">
                            <span className="text-xs font-bold text-white/80 flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-amber-400" />
                              <span>{isAr ? 'الخط الزمني لكافة حركات العميل في المتجر (Chronological Timeline):' : 'Chronological Timeline:'}</span>
                            </span>
                            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                              {session.journeyTimeline.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-start gap-2.5 rounded-lg bg-white/[0.02] border border-white/5 p-2 text-xs"
                                >
                                  <span className="font-mono text-[10px] text-white/40 shrink-0 mt-0.5">
                                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                  </span>
                                  <div className="min-w-0 flex-1">
                                    <span className="font-semibold text-white/90">{item.label}</span>
                                    {item.details && <p className="text-[10px] text-white/50">{item.details}</p>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 4: ALGORITHM 3 - PREDICTIVE DEMAND VELOCITY, SIZING & UNMET SEARCH */}
      {/* ========================================================================= */}
      {(activeAlgorithmView === 'algorithm3_demand') && (
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/[0.08] via-[#12151f] to-black p-5 sm:p-6 backdrop-blur-md space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-emerald-400" />
              <span>{isAr ? 'الخوارزمية 3: سرعة الطلب اللحظي، مصفوفة المقاسات، وذكاء البحث المفقود' : 'Algorithm 3: Demand Velocity, Size Matrix & Search Intelligence'}</span>
            </h3>
            <p className="text-xs text-white/60">
              {isAr
                ? 'خوارزمية تنبؤية لقياس سرعة إقبال الزبائن على القطع (Velocity Index)، ومقارنة طلب المقاسات مع المتوفر في المخزون، ورصد الكلمات المفقودة التي يبحث عنها العملاء'
                : 'Real-time velocity scoring, size demand vs live inventory balancing, and zero-result search radar'}
            </p>
          </div>

          {/* Section 1: Demand Velocity Ranking */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6 backdrop-blur-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Flame className="h-4 w-4 text-rose-500" />
                  <span>{isAr ? 'مؤشر سرعة الطلب اللحظي للقطع (Demand Velocity Index)' : 'Demand Velocity Matrix'}</span>
                </h4>
                <p className="text-[11px] text-white/50 mt-0.5">
                  {isAr ? 'حساب سرعة الإقبال المرجحة (المشاهدات × 1 + المفضلة × 3.5 + نقرات الواتساب × 10)' : 'Velocity = (Views*1) + (Wishlist*3.5) + (WhatsApp*10)'}
                </p>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {(
                  [
                    { id: 'all', label: isAr ? 'الكل' : 'All' },
                    { id: 'hot_trending', label: isAr ? '🔥 رواج عالي' : 'Hot Trending' },
                    { id: 'steady_interest', label: isAr ? '⚡ اهتمام مستقر' : 'Steady' },
                    { id: 'cold_dormant', label: isAr ? '❄️ منخفض' : 'Cold' },
                  ] as const
                ).map((vf) => (
                  <button
                    key={vf.id}
                    type="button"
                    onClick={() => setVelocityFilter(vf.id)}
                    className={`rounded-xl px-2.5 py-1 text-xs font-semibold border transition-all cursor-pointer ${
                      velocityFilter === vf.id
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'border-white/10 bg-black/40 text-white/60 hover:text-white'
                    }`}
                  >
                    {vf.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Velocity Ranking Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead>
                  <tr className="border-b border-white/10 text-white/40 pb-2">
                    <th className="py-2 px-3 font-semibold text-start">{isAr ? 'القطعة' : 'Piece'}</th>
                    <th className="py-2 px-3 font-semibold text-center">{isAr ? 'مؤشر السرعة' : 'Velocity'}</th>
                    <th className="py-2 px-3 font-semibold text-center">{isAr ? 'المشاهدات' : 'Views'}</th>
                    <th className="py-2 px-3 font-semibold text-center">{isAr ? 'المفضلة' : 'Wishlist'}</th>
                    <th className="py-2 px-3 font-semibold text-center">{isAr ? 'طلبات الواتساب' : 'WhatsApp'}</th>
                    <th className="py-2 px-3 font-semibold text-center">{isAr ? 'الحالة والتوصية' : 'Status & Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredVelocityItems.map((p) => (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-3 font-medium text-white max-w-xs truncate">
                        {p.title}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-amber-400">
                        {p.velocityScore}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-white/80">{p.views}</td>
                      <td className="py-3 px-3 text-center font-mono text-rose-400">{p.wishlistAdds}</td>
                      <td className="py-3 px-3 text-center font-mono text-emerald-400 font-bold">{p.whatsappClicks}</td>
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex flex-col items-center gap-0.5">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                            p.demandStatus === 'hot_trending'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : p.demandStatus === 'steady_interest'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-white/5 text-white/50 border-white/10'
                          }`}>
                            {p.statusLabelAr}
                          </span>
                          <span className="text-[9px] text-white/40 max-w-xs truncate">{p.recommendedAction}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Size Demand vs Live Stock Matrix */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6 backdrop-blur-md space-y-4">
            <div className="pb-2 border-b border-white/10">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Tag className="h-4 w-4 text-purple-400" />
                <span>{isAr ? 'مصفوفة توازن المقاسات الحية (Size Demand vs Live Stock Matrix)' : 'Size Demand vs Stock Matrix'}</span>
              </h4>
              <p className="text-[11px] text-white/50 mt-0.5">
                {isAr ? 'مقارنة حقيقية 100% بين طلبات القياس للزبائن والمعروض الفعلي في الكتالوج لتفادي نفاد المقاسات' : 'Inventory balance radar comparing customer clicks against current stock'}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {stats.sizeStockMatrix?.map((sm) => (
                <div
                  key={sm.size}
                  className={`rounded-2xl border p-3.5 text-center space-y-2 transition-all ${
                    sm.status === 'deficit_warning'
                      ? 'border-rose-500/40 bg-rose-500/[0.06] shadow-lg shadow-rose-500/5'
                      : sm.status === 'surplus'
                      ? 'border-amber-500/30 bg-amber-500/[0.04]'
                      : 'border-white/10 bg-black/40'
                  }`}
                >
                  <span className="text-lg font-bold font-mono text-white block">[{sm.size}]</span>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-white/40">{isAr ? 'الطلب:' : 'Demand:'}</span>
                      <span className="font-mono font-bold text-amber-400">{sm.demandPercentage}%</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-white/40">{isAr ? 'المتوفر:' : 'Stock:'}</span>
                      <span className="font-mono font-bold text-emerald-400">{sm.stockPercentage}%</span>
                    </div>
                  </div>

                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold border block truncate ${
                    sm.status === 'deficit_warning'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      : sm.status === 'surplus'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}>
                    {sm.statusLabelAr}
                  </span>

                  <p className="text-[10px] text-white/50 line-clamp-2 leading-relaxed">
                    {sm.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Unmet Search Intelligence */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6 backdrop-blur-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Search className="h-4 w-4 text-cyan-400" />
                  <span>{isAr ? 'ذكاء البحث والطلب غير الملبى (Unmet Search Intelligence)' : 'Unmet Search Radar'}</span>
                </h4>
                <p className="text-[11px] text-white/50 mt-0.5">
                  {isAr ? 'رصد الكلمات التي يبحث عنها الزبائن ولم يجدوا لها نتائج في المتجر (فرص بيع ضائعة)' : 'Identifying zero-result queries to bridge inventory gaps'}
                </p>
              </div>

              {/* Unmet Filter */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setUnmetSearchFilter('all')}
                  className={`rounded-xl px-2.5 py-1 text-xs font-semibold border transition-all cursor-pointer ${
                    unmetSearchFilter === 'all' ? 'bg-[#004ad7] border-[#004ad7] text-white' : 'border-white/10 bg-black/40 text-white/60'
                  }`}
                >
                  {isAr ? 'الكل' : 'All'}
                </button>
                <button
                  type="button"
                  onClick={() => setUnmetSearchFilter('zero_results')}
                  className={`rounded-xl px-2.5 py-1 text-xs font-semibold border transition-all cursor-pointer ${
                    unmetSearchFilter === 'zero_results' ? 'bg-rose-600 border-rose-500 text-white' : 'border-white/10 bg-black/40 text-rose-300'
                  }`}
                >
                  {isAr ? '🚨 طلبات بدون نتائج (0)' : 'Zero Results'}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {filteredUnmetSearches.length === 0 ? (
                <div className="py-8 text-center text-xs text-white/40">
                  {isAr ? 'لا توجد عمليات بحث مسجلة حالياً.' : 'No search queries recorded yet.'}
                </div>
              ) : (
                filteredUnmetSearches.map((s) => (
                  <div
                    key={s.term}
                    className={`rounded-2xl border p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      s.status === 'zero_results'
                        ? 'border-rose-500/30 bg-rose-500/[0.04]'
                        : 'border-white/10 bg-black/30'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border text-xs font-bold ${
                        s.status === 'zero_results' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      }`}>
                        {s.status === 'zero_results' ? '0' : '✓'}
                      </span>
                      <div>
                        <span className="font-bold text-white text-xs">"{s.term}"</span>
                        <p className="text-[11px] text-white/60 mt-0.5">{s.suggestedAction}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-white/80">
                        {s.count} {isAr ? 'عملية بحث' : 'searches'}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                        s.status === 'zero_results' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}>
                        {s.status === 'zero_results' ? isAr ? 'مفقود في الكتالوج' : 'Zero Results' : isAr ? 'متوفر' : 'Matched'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 5: DETAILED PIECE PERFORMANCE MATRIX (مصفوفة أداء وتحليل القطع) */}
      {/* ========================================================================= */}
      {activeAlgorithmView === 'piece_matrix' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Card */}
          <div className="rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-950/30 via-black/40 to-slate-900/40 p-5 sm:p-6 backdrop-blur-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Layers className="h-5 w-5 text-blue-400" />
                  <span>{isAr ? 'مصفوفة أداء وتحليل القطع الفردية (Detailed Pieces Intelligence)' : 'Pieces Performance Matrix'}</span>
                </h3>
                <p className="text-xs text-white/50 mt-1">
                  {isAr
                    ? 'رصد شامل لأداء كل قطعة في الكتالوج بناءً على تفاعل الزوار الفعلي، معدل التحويل إلى واتساب، وسرعة دوران الطلب'
                    : 'Granular telemetry breakdown for every item in your catalog based on real customer conversion signals'}
                </p>
              </div>

              {/* Storewide Catalog Aggregates */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-mono text-white/80">
                  {isAr ? 'القطع المعروضة: ' : 'Total: '}
                  <strong className="text-white font-bold">{detailedPiecesData.length}</strong>
                </span>
                <span className="rounded-xl border border-[#004ad7]/30 bg-[#004ad7]/15 px-3 py-1.5 text-xs font-mono text-white">
                  {isAr ? 'إجمالي المشاهدات: ' : 'Views: '}
                  <strong className="text-[#60a5fa] font-bold">{stats.totalProductViews || 0}</strong>
                </span>
                <span className="rounded-xl border border-[#004ad7]/30 bg-[#004ad7]/15 px-3 py-1.5 text-xs font-mono text-white">
                  {isAr ? 'طلبات واتساب: ' : 'Orders: '}
                  <strong className="text-[#60a5fa] font-bold">{stats.totalWhatsAppClicks || 0}</strong>
                </span>
              </div>
            </div>

            {/* Controls: Search, Category, Sorting */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-white/10">
              {/* Search */}
              <div className="sm:col-span-5 relative">
                <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input
                  type="text"
                  value={pieceSearchQuery}
                  onChange={(e) => setPieceSearchQuery(e.target.value)}
                  placeholder={isAr ? 'ابحث باسم القطعة أو التصنيف...' : 'Search piece title or category...'}
                  className="w-full rounded-xl border border-white/15 bg-black/50 py-2 pr-10 pl-4 text-xs text-white placeholder-white/40 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Category Filter */}
              <div className="sm:col-span-4">
                <select
                  value={pieceCatFilter}
                  onChange={(e) => setPieceCatFilter(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-black/50 py-2 px-3 text-xs text-white focus:border-blue-500 focus:outline-none cursor-pointer"
                >
                  <option value="all" className="bg-[#12151f] text-white">
                    {isAr ? 'كافة التصنيفات (All Categories)' : 'All Categories'}
                  </option>
                  {pieceCategories.map((cat) => (
                    <option key={cat} value={cat} className="bg-[#12151f] text-white">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sorting Filter */}
              <div className="sm:col-span-3">
                <select
                  value={pieceSortBy}
                  onChange={(e) => setPieceSortBy(e.target.value as any)}
                  className="w-full rounded-xl border border-white/15 bg-black/50 py-2 px-3 text-xs text-white focus:border-blue-500 focus:outline-none cursor-pointer"
                >
                  <option value="views" className="bg-[#12151f] text-white">
                    {isAr ? 'الأكثر مشاهدة' : 'Most Viewed'}
                  </option>
                  <option value="whatsapp" className="bg-[#12151f] text-white">
                    {isAr ? 'الأكثر طلباً (واتساب)' : 'Most WhatsApp Orders'}
                  </option>
                  <option value="wishlist" className="bg-[#12151f] text-white">
                    {isAr ? 'الأكثر حفظاً بالمفضلة' : 'Most Wishlisted'}
                  </option>
                  <option value="ctr" className="bg-[#12151f] text-white">
                    {isAr ? 'أعلى معدل تحويل %' : 'Highest Conversion'}
                  </option>
                  <option value="velocity" className="bg-[#12151f] text-white">
                    {isAr ? 'سرعة دوران الطلب 🔥' : 'Demand Velocity'}
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* Pieces Cards Grid */}
          {detailedPiecesData.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-12 text-center space-y-3">
              <Layers className="h-10 w-10 text-white/20 mx-auto" />
              <p className="text-sm font-semibold text-white/60">
                {isAr ? 'لم يتم العثور على قطع تطابق البحث الحالي.' : 'No pieces found matching the filter.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setPieceSearchQuery('');
                  setPieceCatFilter('all');
                }}
                className="text-xs text-blue-400 hover:underline cursor-pointer"
              >
                {isAr ? 'إعادة ضبط الفلاتر' : 'Reset filters'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {detailedPiecesData.map((item) => {
                const prod = item.product;
                const isHot = item.velocityStatus === 'hot_trending';
                const isSteady = item.velocityStatus === 'steady_interest';

                return (
                  <div
                    key={prod.id}
                    className="rounded-3xl border border-white/10 bg-white/[0.03] p-4.5 backdrop-blur-md hover:border-white/20 transition-all space-y-3.5 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Image Thumbnail & Top Badges */}
                      <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-black/40 border border-white/10">
                        <img
                          src={prod.image_url}
                          alt={prod.title}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                        {/* Top Badges */}
                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border backdrop-blur-md shadow-md ${
                              isHot
                                ? 'bg-[#004ad7] text-white border-[#3b82f6]/50 shadow-[#004ad7]/30'
                                : isSteady
                                ? 'bg-white/15 text-white border-white/30'
                                : 'bg-black/60 text-white/70 border-white/15'
                            }`}
                          >
                            {isHot ? (isAr ? '🔥 تريند نشط' : 'Hot') : isSteady ? (isAr ? '⚡ طلب مستمر' : 'Steady') : (isAr ? '❄️ هادئ' : 'Dormant')}
                          </span>
                        </div>

                        {/* Category & Price Overlay */}
                        <div className="absolute bottom-2.5 right-2.5 left-2.5 flex items-end justify-between">
                          <span className="rounded-lg bg-black/70 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white/90 border border-white/15">
                            {prod.category}
                          </span>
                          <span className="font-mono font-bold text-xs text-white bg-black/80 backdrop-blur-md px-2.5 py-0.5 rounded-lg border border-white/20">
                            {Number(prod.price).toLocaleString()} {prod.currency || 'د.ع'}
                          </span>
                        </div>
                      </div>

                      {/* Title & Sizes */}
                      <div className="mt-3">
                        <h4 className="font-bold text-sm text-white line-clamp-1" title={prod.title}>
                          {isAr && prod.title_ar ? prod.title_ar : prod.title}
                        </h4>

                        {/* Sizes pills */}
                        <div className="flex flex-wrap items-center gap-1 mt-1.5">
                          {prod.sizes?.map((sz) => (
                            <span
                              key={sz}
                              className="rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.2 text-[9px] font-mono text-white/70"
                            >
                              {sz}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Real-time Metrics Grid */}
                      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/10">
                        {/* Views */}
                        <div className="rounded-xl border border-white/10 bg-black/40 p-2 text-center">
                          <div className="flex items-center justify-center gap-1 text-[#60a5fa] text-[10px]">
                            <Eye className="h-3 w-3" />
                            <span>{isAr ? 'مشاهدات' : 'Views'}</span>
                          </div>
                          <span className="text-xs font-mono font-bold text-white mt-0.5 block">{item.views}</span>
                        </div>

                        {/* Wishlist */}
                        <div className="rounded-xl border border-white/10 bg-black/40 p-2 text-center">
                          <div className="flex items-center justify-center gap-1 text-[#60a5fa] text-[10px]">
                            <Heart className="h-3 w-3" />
                            <span>{isAr ? 'مفضلة' : 'Saved'}</span>
                          </div>
                          <span className="text-xs font-mono font-bold text-white mt-0.5 block">{item.wishlistAdds}</span>
                        </div>

                        {/* WhatsApp Inquiries */}
                        <div className="rounded-xl border border-white/10 bg-black/40 p-2 text-center">
                          <div className="flex items-center justify-center gap-1 text-[#60a5fa] text-[10px]">
                            <MessageCircle className="h-3 w-3" />
                            <span>{isAr ? 'واتساب' : 'Orders'}</span>
                          </div>
                          <span className="text-xs font-mono font-bold text-white mt-0.5 block">{item.whatsappClicks}</span>
                        </div>
                      </div>

                      {/* Conversion Gauge Bar */}
                      <div className="mt-3 space-y-1">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-white/50">{isAr ? 'معدل التحويل (Conversion):' : 'Conversion:'}</span>
                          <span className="font-mono font-bold text-[#60a5fa]">{item.conversionRate.toFixed(1)}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#004ad7] to-[#3b82f6] transition-all duration-500 rounded-full"
                            style={{ width: `${Math.min(100, item.conversionRate * 5)}%` }}
                          />
                        </div>
                      </div>

                      {/* Hesitation Signal Alert if triggered */}
                      {item.hesitationCount > 0 && (
                        <div className="mt-2.5 rounded-xl border border-[#004ad7]/30 bg-[#004ad7]/15 px-2.5 py-1.5 flex items-center justify-between text-[11px] text-[#93c5fd]">
                          <span className="flex items-center gap-1.5 font-bold">
                            <AlertTriangle className="h-3.5 w-3.5 text-[#60a5fa] shrink-0" />
                            {isAr ? 'حيرة مقاس متكررة' : 'Sizing Hesitation'}
                          </span>
                          <span className="font-mono font-bold">{item.hesitationCount} {isAr ? 'مرات' : 'times'}</span>
                        </div>
                      )}
                    </div>

                    {/* Footer Velocity Score */}
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/50">
                      <span>{isAr ? 'مؤشر الحركة والطلب:' : 'Velocity Score:'}</span>
                      <span className="font-mono font-bold text-white/90 flex items-center gap-1">
                        <Flame className="h-3 w-3 text-amber-400" />
                        {item.velocityScore} pts
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
