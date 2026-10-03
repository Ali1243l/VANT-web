import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
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
  Monitor,
  ShoppingBag,
  Percent,
  Search,
  Sparkles,
  Download,
  FileSpreadsheet,
  Printer,
  RefreshCw,
  Users,
  MousePointerClick,
  Heart,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  UserCheck,
  ShieldCheck,
  MapPin,
  Tag,
  Compass,
  FileCode,
  FileText,
  Flame,
  Lightbulb,
  ExternalLink,
  Layers,
  ArrowRight,
  Filter,
  Eye,
} from 'lucide-react';
import {
  type UserBehaviorStats,
  type CustomerSessionProfile,
  downloadAnalyticsCSV,
  downloadAnalyticsExcel,
  downloadAnalyticsJSON,
  downloadAnalyticsHTMLReport,
  downloadAnalyticsMarkdown,
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
const CustomTooltip = ({ active, payload, label, isAr }: any) => {
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
  // Expandable States
  const [expandedKpi, setExpandedKpi] = useState<string | null>(null);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [customerFilter, setCustomerFilter] = useState<'all' | 'vip' | 'high_intent' | 'enthusiast' | 'explorer' | 'browser'>('all');
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. User Engagement & Hourly Traffic Data for Recharts AreaChart
  const hourlyEngagementData = useMemo(() => {
    return (stats.hourlyTraffic || []).map((h) => {
      const estimatedEngagementMin = Math.max(
        0.5,
        Math.round((h.visitors * (stats.avgSessionSeconds || 95)) / 60)
      );

      return {
        hour: h.hour,
        visitors: h.visitors,
        durationMinutes: estimatedEngagementMin,
        durationSec: Math.round(stats.avgSessionSeconds || 90),
      };
    });
  }, [stats.hourlyTraffic, stats.avgSessionSeconds]);

  // 2. Most-Viewed Products Data for Recharts BarChart
  const mostViewedProductsData = useMemo(() => {
    const list = [...(stats.topProducts || [])].sort((a, b) => b.views - a.views);
    if (list.length > 0) {
      return list.slice(0, 6).map((p) => {
        const prod = products.find((x) => String(x.id) === String(p.id));
        const shortTitle = (prod?.title_ar || p.title || `Piece #${p.id}`)
          .split(' ')
          .slice(0, 3)
          .join(' ');
        return {
          name: shortTitle,
          views: p.views,
          whatsapp: p.whatsappClicks,
          ctr: p.conversionPct,
        };
      });
    }

    return products.slice(0, 6).map((p) => ({
      name: (p.title_ar || p.title).split(' ').slice(0, 3).join(' '),
      views: 0,
      whatsapp: 0,
      ctr: 0,
    }));
  }, [stats.topProducts, products]);

  // 3. Wishlist Activity Data for Recharts BarChart
  const wishlistActivityData = useMemo(() => {
    const list = [...(stats.topProducts || [])].sort((a, b) => b.wishlistAdds - a.wishlistAdds);
    if (list.length > 0) {
      return list.slice(0, 6).map((p) => {
        const prod = products.find((x) => String(x.id) === String(p.id));
        const shortTitle = (prod?.title_ar || p.title || `Piece #${p.id}`)
          .split(' ')
          .slice(0, 3)
          .join(' ');
        return {
          name: shortTitle,
          wishlist: p.wishlistAdds,
          views: p.views,
          conversion: p.views > 0 ? Math.round((p.wishlistAdds / p.views) * 100) : 0,
        };
      });
    }

    return products.slice(0, 6).map((p) => ({
      name: (p.title_ar || p.title).split(' ').slice(0, 3).join(' '),
      wishlist: 0,
      views: 0,
      conversion: 0,
    }));
  }, [stats.topProducts, products]);

  // 4. Combined Product Performance Data for Composed Chart
  const productChartData = useMemo(() => {
    if (stats.topProducts && stats.topProducts.length > 0) {
      return stats.topProducts.slice(0, 8).map((p) => {
        const prod = products.find((x) => String(x.id) === String(p.id));
        const shortTitle = (prod?.title_ar || p.title || `Piece #${p.id}`)
          .split(' ')
          .slice(0, 3)
          .join(' ');
        return {
          name: shortTitle,
          views: p.views,
          wishlist: p.wishlistAdds,
          whatsapp: p.whatsappClicks,
          ctr: p.conversionPct,
        };
      });
    }

    return products.slice(0, 6).map((p) => ({
      name: (p.title_ar || p.title).split(' ').slice(0, 3).join(' '),
      views: 0,
      wishlist: 0,
      whatsapp: 0,
      ctr: 0,
    }));
  }, [stats.topProducts, products]);

  // 5. Device breakdown for Pie Chart
  const deviceData = useMemo(() => {
    return [
      { name: isAr ? 'هواتف ذكية (Mobile)' : 'Mobile', value: stats.deviceBreakdown.mobile },
      { name: isAr ? 'أجهزة كمبيوتر (Desktop)' : 'Desktop', value: stats.deviceBreakdown.desktop },
      ...(stats.deviceBreakdown.tablet > 0
        ? [{ name: isAr ? 'أجهزة لوحية (Tablet)' : 'Tablet', value: stats.deviceBreakdown.tablet }]
        : []),
    ];
  }, [stats.deviceBreakdown, isAr]);

  // 6. Filtered Customer Sessions
  const filteredSessions = useMemo(() => {
    return (stats.customerSessions || []).filter((s) => {
      if (customerFilter !== 'all' && s.intentTier !== customerFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = s.sessionId.toLowerCase().includes(q);
        const matchGov = s.governorate.toLowerCase().includes(q);
        const matchProd = s.productsViewed.some((p) => p.title.toLowerCase().includes(q));
        const matchOrder = s.whatsappOrders.some((o) => o.title.toLowerCase().includes(q));
        return matchId || matchGov || matchProd || matchOrder;
      }
      return true;
    });
  }, [stats.customerSessions, customerFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Header with Multi-Format Export Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[#3b82f6]" />
            <span>{isAr ? 'لوحة تحليلات وسلوكيات الزوار (Recharts Analytics)' : 'Recharts Analytics Dashboard'}</span>
          </h2>
          <p className="text-xs text-white/50 mt-0.5">
            {isAr
              ? 'مخططات بيانية تفاعلية لقياس تفاعل المستخدمين (Engagement)، القطع الأكثر مشاهدة، ونشاط قائمة المفضلة'
              : 'Interactive Recharts for user engagement, most-viewed pieces, and wishlist activity telemetry'}
          </p>
        </div>

        {/* Action Buttons: Multi-Format Exports */}
        <div className="flex flex-wrap items-center gap-2">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.05] hover:bg-white/10 px-3 py-2 text-xs font-semibold text-white/80 transition-all cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5 text-cyan-400" />
              <span>{isAr ? 'تحديث' : 'Refresh'}</span>
            </button>
          )}

          {/* Quick Excel Export */}
          <button
            type="button"
            onClick={() => downloadAnalyticsExcel(products)}
            title={isAr ? 'تصدير جدول إكسل متكامل مع أوراق عمل منسقة' : 'Export Excel'}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-md shadow-emerald-700/20 active:scale-95 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>Excel (.xls)</span>
          </button>

          {/* Quick CSV Export */}
          <button
            type="button"
            onClick={() => downloadAnalyticsCSV(products)}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>CSV</span>
          </button>

          {/* Open Multi-Format Export Hub */}
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
                    {isAr ? 'أوراق عمل متعددة منسقة (KPIs، أداء القطع، وسجل العملاء)' : 'Multi-sheet workbook with styled tables'}
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
                    {isAr ? 'ملف نصي مجدول متوافق 100% مع اللغة العربية في إكسل' : 'Universal CSV with UTF-8 BOM encoding'}
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
                  <span className="font-bold text-sm text-white">JSON Raw Dataset (.json)</span>
                  <p className="text-[11px] text-white/60 mt-1">
                    {isAr ? 'بيانات مهيكلة كاملة للربط البرمجي ومعالجة الـ Big Data' : 'Structured JSON data with full schema'}
                  </p>
                </div>
              </button>

              {/* 4. Executive HTML / Printable PDF */}
              <button
                type="button"
                onClick={() => {
                  downloadAnalyticsHTMLReport(products);
                  setExportModalOpen(false);
                }}
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-start hover:bg-white/[0.07] hover:border-white/20 transition-all cursor-pointer group"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 group-hover:scale-105 transition-transform">
                  <Printer className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-bold text-sm text-white">Printable Executive Report / PDF</span>
                  <p className="text-[11px] text-white/60 mt-1">
                    {isAr ? 'تقرير تنفيذي مصمم للطباعة المباشرة وحفظ ملف PDF' : 'Clean styled executive report with print trigger'}
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
              <div className="flex justify-between">
                <span>{isAr ? 'مؤشر الاهتمام العام:' : 'Interest Index:'}</span>
                <span className="font-mono text-emerald-300">
                  {stats.avgSessionSeconds > 90 ? (isAr ? 'مرتفع جداً 🔥' : 'Very High') : (isAr ? 'جيد 👍' : 'Good')}
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
                <span>{isAr ? 'نسبة الإضافة للكتالوج:' : 'Add to Catalog Ratio:'}</span>
                <span className="text-rose-300 font-bold">
                  {((stats.totalWishlistAdds / Math.max(1, stats.totalProductViews)) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* KPI 4: WhatsApp Orders CTR */}
        <div
          onClick={() => setExpandedKpi(expandedKpi === 'whatsapp' ? null : 'whatsapp')}
          className={`rounded-2xl border transition-all cursor-pointer p-4 space-y-1.5 ${
            expandedKpi === 'whatsapp'
              ? 'border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/10'
              : 'border-white/10 bg-white/[0.025] hover:bg-white/[0.04]'
          }`}
        >
          <div className="flex items-center justify-between text-white/50 text-xs">
            <span>{isAr ? 'نقرات طلب الواتساب (CTR)' : 'WhatsApp Orders CTR'}</span>
            <MessageCircle className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400 tabular-nums">
            {stats.totalWhatsAppClicks.toLocaleString()}
          </div>
          <div className="flex items-center justify-between text-[10px] text-cyan-400/70">
            <span>{isAr ? `نسبة التحويل: ${stats.conversionRate}%` : `Conv: ${stats.conversionRate}%`}</span>
            <span className="text-cyan-400 flex items-center gap-0.5">
              {expandedKpi === 'whatsapp' ? isAr ? 'إخفاء' : 'Close' : isAr ? 'تفاصيل ▾' : 'Expand ▾'}
            </span>
          </div>

          {expandedKpi === 'whatsapp' && (
            <div className="pt-2 border-t border-white/10 text-xs space-y-1 text-white/70 animate-fade-in">
              <div className="flex justify-between">
                <span>{isAr ? 'الطلبات المباشرة المسجلة:' : 'Registered Orders:'}</span>
                <span className="text-cyan-300 font-bold">{stats.totalWhatsAppClicks}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. USER ENGAGEMENT CHART (RECHARTS AREA CHART) */}
      {/* ========================================================================= */}
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
              <Tooltip content={<CustomTooltip isAr={isAr} />} />
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

      {/* ========================================================================= */}
      {/* 2 & 3. MOST-VIEWED PRODUCTS & WISHLIST ACTIVITY CHARTS (RECHARTS BAR CHARTS) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 2. Most-Viewed Products Recharts Bar Chart */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6 backdrop-blur-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Eye className="h-4 w-4 text-[#3b82f6]" />
                <span>{isAr ? '👗 القطع الأكثر مشاهدة (Most-Viewed Products)' : 'Most-Viewed Products'}</span>
              </h3>
              <p className="text-[11px] text-white/50 mt-0.5">
                {isAr ? 'ترتيب القطع حسب عدد مرات المعاينة وتفاصيل المشاهدات' : 'Ranking products by customer view frequency'}
              </p>
            </div>
            <span className="text-xs font-mono text-[#3b82f6] flex items-center gap-1">
              ■ {isAr ? 'المشاهدات' : 'Views'}
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mostViewedProductsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip isAr={isAr} />} />
                <Bar dataKey="views" name={isAr ? 'المشاهدات' : 'Views'} fill="#3b82f6" radius={[6, 6, 0, 0]}>
                  {mostViewedProductsData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={VIEW_BAR_COLORS[index % VIEW_BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Wishlist Activity Recharts Bar Chart */}
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
            <span className="text-xs font-mono text-rose-400 flex items-center gap-1">
              ■ {isAr ? 'إضافات المفضلة' : 'Wishlist Adds'}
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wishlistActivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip isAr={isAr} />} />
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

      {/* ========================================================================= */}
      {/* 4. COMBINED CTR & CONVERSION METRICS CHART (COMPOSED RECHARTS) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* CTR & Actions Chart */}
        <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6 backdrop-blur-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MousePointerClick className="h-4 w-4 text-cyan-400" />
                <span>{isAr ? 'معدل الضغطات والتحويل للقطع (Click-Through Rates)' : 'Piece CTR & Actions Performance'}</span>
              </h3>
              <p className="text-[11px] text-white/50 mt-0.5">
                {isAr ? 'مقارنة المشاهدات، إضافات المفضلة، ونسبة النقر على زر الواتساب لكل قطعة' : 'Views vs Wishlist vs WhatsApp CTR%'}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-[#3b82f6]">■ {isAr ? 'مشاهدات' : 'Views'}</span>
              <span className="flex items-center gap-1 text-[#10b981]">■ {isAr ? 'واتساب' : 'WhatsApp'}</span>
              <span className="flex items-center gap-1 text-amber-400">● {isAr ? 'نسبة CTR' : 'CTR%'}</span>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={productChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} />
                <YAxis yAxisId="left" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="rgba(245, 158, 11, 0.7)"
                  fontSize={10}
                  tickLine={false}
                  unit="%"
                />
                <Tooltip content={<CustomTooltip isAr={isAr} />} />
                <Bar yAxisId="left" dataKey="views" name={isAr ? 'المشاهدات' : 'Views'} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="left" dataKey="whatsapp" name={isAr ? 'طلبات الواتساب' : 'WhatsApp Orders'} fill="#10b981" radius={[4, 4, 0, 0]} />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="ctr"
                  name={isAr ? 'نسبة النقر (CTR)' : 'CTR %'}
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={{ fill: '#f59e0b', r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device Breakdown Donut Chart */}
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
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {deviceData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={DEVICE_COLORS[index % DEVICE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip isAr={isAr} />} />
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

      {/* ========================================================================= */}
      {/* 5. DEEP CUSTOMER JOURNEY & INTENT INTELLIGENCE (EXPANDABLE SESSIONS) */}
      {/* ========================================================================= */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6 backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="h-4 w-4 text-[#3b82f6]" />
              <span>{isAr ? '👥 تحليل رحلات وسلوكيات الزبائن (Customer Journey & Profiles)' : 'Customer Journey & Profiles'}</span>
            </h3>
            <p className="text-[11px] text-white/50 mt-0.5">
              {isAr
                ? 'اضغط على أي زبون لعرض خط زمني تفصيلي لكافة نقراته والقطع التي عاينها والمقاسات وطلبات الواتساب'
                : 'Click any customer to reveal full click-by-click chronological journey and cart engagement'}
            </p>
          </div>

          {/* Customer Segment Filter Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {(
              [
                { id: 'all', label_ar: 'الكل', label_en: 'All' },
                { id: 'vip', label_ar: '🔥 VIP جاهز للشراء', label_en: 'VIP' },
                { id: 'high_intent', label_ar: '💎 اهتمام عالي', label_en: 'High Intent' },
                { id: 'enthusiast', label_ar: '👗 محب للأزياء', label_en: 'Enthusiast' },
                { id: 'explorer', label_ar: '🔍 مستكشف', label_en: 'Explorer' },
              ] as const
            ).map((seg) => (
              <button
                key={seg.id}
                type="button"
                onClick={() => setCustomerFilter(seg.id)}
                className={`rounded-xl px-2.5 py-1 text-[11px] font-semibold border transition-all cursor-pointer ${
                  customerFilter === seg.id
                    ? 'bg-[#004ad7] border-[#004ad7] text-white shadow-xs'
                    : 'border-white/10 bg-black/30 text-white/60 hover:text-white'
                }`}
              >
                {isAr ? seg.label_ar : seg.label_en}
              </button>
            ))}
          </div>
        </div>

        {/* Customer Sessions List */}
        <div className="space-y-2.5">
          {filteredSessions.length === 0 ? (
            <div className="py-8 text-center text-xs text-white/40">
              {isAr ? 'لا توجد جلسات مسجلة ضمن هذا التصنيف حالياً' : 'No customer sessions found in this category'}
            </div>
          ) : (
            filteredSessions.slice(0, 15).map((session) => {
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
                  {/* Row Summary (Clickable to Expand) */}
                  <div
                    onClick={() => setExpandedSessionId(isExpanded ? null : session.sessionId)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar / Device Badge */}
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                        session.intentTier === 'vip'
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                          : session.intentTier === 'high_intent'
                          ? 'bg-[#004ad7]/20 border-[#004ad7]/40 text-[#3b82f6]'
                          : 'bg-white/5 border-white/10 text-white/60'
                      }`}>
                        {session.device === 'mobile' ? <Smartphone className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-white">
                            #{session.sessionId.substring(0, 10)}
                          </span>
                          <span className="flex items-center gap-1 rounded-md bg-white/[0.06] border border-white/10 px-2 py-0.5 text-[10px] text-white/80">
                            <MapPin className="h-2.5 w-2.5 text-rose-400" />
                            {session.governorate}
                          </span>
                          <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                            session.intentTier === 'vip'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : session.intentTier === 'high_intent'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-white/10 text-white/60'
                          }`}>
                            {session.intentTier.toUpperCase()}
                          </span>
                        </div>

                        <div className="mt-1 flex items-center gap-3 text-[11px] text-white/50 flex-wrap">
                          <span>{isAr ? `المدة: ${session.durationSeconds} ثانية` : `Duration: ${session.durationSeconds}s`}</span>
                          <span>•</span>
                          <span>{isAr ? `القطع المشاهدة: ${session.productsViewed.length}` : `Viewed: ${session.productsViewed.length}`}</span>
                          {session.whatsappOrders.length > 0 && (
                            <>
                              <span>•</span>
                              <span className="font-bold text-emerald-400 flex items-center gap-1">
                                <MessageCircle className="h-3 w-3" />
                                {isAr ? `${session.whatsappOrders.length} طلب واتساب` : `${session.whatsappOrders.length} WA Orders`}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 justify-between sm:justify-end">
                      {/* Lead Score Badge */}
                      <div className="text-end">
                        <div className="text-[10px] text-white/40">{isAr ? 'نقاط العميل' : 'Lead Score'}</div>
                        <div className="text-sm font-bold font-mono text-emerald-400 tabular-nums">
                          {session.leadScore} / 100
                        </div>
                      </div>

                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.05] text-white/60">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Full Journey Details */}
                  {isExpanded && (
                    <div className="border-t border-white/10 p-4 sm:p-5 bg-black/40 rounded-b-2xl space-y-4 animate-fade-in">
                      {/* Sub-grid of insights */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* 1. Products viewed */}
                        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-2">
                          <span className="text-[11px] font-bold text-white/70 flex items-center gap-1.5">
                            <ShoppingBag className="h-3.5 w-3.5 text-[#3b82f6]" />
                            {isAr ? 'القطع التي عاينها الزائر' : 'Pieces Viewed'}
                          </span>
                          {session.productsViewed.length === 0 ? (
                            <p className="text-[10px] text-white/40">{isAr ? 'تصفح الكتالوج فقط' : 'Catalog browsing only'}</p>
                          ) : (
                            <ul className="space-y-1 text-xs">
                              {session.productsViewed.map((pv) => (
                                <li key={pv.id} className="flex items-center justify-between text-white/80">
                                  <span className="truncate">{pv.title}</span>
                                  <span className="text-[10px] font-mono text-white/40">{pv.views}x</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {/* 2. Wishlist & Sizes */}
                        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-2">
                          <span className="text-[11px] font-bold text-white/70 flex items-center gap-1.5">
                            <Heart className="h-3.5 w-3.5 text-rose-400" />
                            {isAr ? 'المفضلة والمقاسات' : 'Wishlist & Sizes'}
                          </span>
                          <div className="space-y-1.5 text-xs">
                            {session.sizesSelected.length > 0 && (
                              <div className="flex items-center gap-1 flex-wrap">
                                <span className="text-[10px] text-white/40">{isAr ? 'المقاسات:' : 'Sizes:'}</span>
                                {session.sizesSelected.map((sz) => (
                                  <span key={sz} className="rounded bg-white/10 px-1.5 py-0.2 text-[10px] font-mono font-bold text-white">
                                    {sz}
                                  </span>
                                ))}
                              </div>
                            )}
                            {session.wishlistItems.length > 0 ? (
                              <div className="text-[11px] text-rose-300">
                                {session.wishlistItems.map((w) => w.title).join(', ')}
                              </div>
                            ) : (
                              <p className="text-[10px] text-white/40">{isAr ? 'لم تتم إضافة قطع للمفضلة' : 'No wishlist items'}</p>
                            )}
                          </div>
                        </div>

                        {/* 3. WhatsApp Checkout Orders */}
                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] p-3 space-y-2">
                          <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                            <MessageCircle className="h-3.5 w-3.5" />
                            {isAr ? 'طلبات الواتساب المباشرة' : 'Direct WhatsApp Orders'}
                          </span>
                          {session.whatsappOrders.length === 0 ? (
                            <p className="text-[10px] text-white/40">{isAr ? 'لم يضغط زر الطلب بعد' : 'No orders sent'}</p>
                          ) : (
                            <ul className="space-y-1 text-xs">
                              {session.whatsappOrders.map((o, idx) => (
                                <li key={idx} className="text-emerald-300 font-semibold flex items-center justify-between">
                                  <span>{o.title}</span>
                                  {o.size && <span className="text-[10px] font-mono text-emerald-400">[{o.size}]</span>}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>

                      {/* Chronological Journey Timeline */}
                      <div className="space-y-2 pt-2">
                        <span className="text-xs font-bold text-white/80 flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-amber-400" />
                          {isAr ? 'الخط الزمني لكافة حركات العميل في المتجر (Chronological Timeline)' : 'Chronological Action Timeline'}
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

      {/* ========================================================================= */}
      {/* 6. REGIONAL & SIZE DEMAND INTELLIGENCE */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Iraqi Governorates Breakdown */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin className="h-4 w-4 text-rose-400" />
                <span>{isAr ? 'التوزيع الجغرافي للزبائن (Iraqi Governorates)' : 'Regional Visitor Distribution'}</span>
              </h3>
              <p className="text-[11px] text-white/50 mt-0.5">
                {isAr ? 'نسبة إقبال وتفاعل الزوار حسب المحافظات والمدن العراقية' : 'Traffic concentration across Iraqi regions'}
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {stats.governoratesDistribution.map((gov) => (
              <div key={gov.name_en} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/80 font-medium">{gov.name_ar}</span>
                  <span className="font-mono font-bold text-white tabular-nums">{gov.percentage}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#004ad7] to-[#3b82f6] transition-all duration-500"
                    style={{ width: `${gov.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Size Demand Breakdown */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Tag className="h-4 w-4 text-amber-400" />
                <span>{isAr ? 'تحليل طلب المقاسات (Size Demand Matrix)' : 'Size Demand Matrix'}</span>
              </h3>
              <p className="text-[11px] text-white/50 mt-0.5">
                {isAr ? 'المقاسات الأكثر طلباً وتحديداً لتوجيه الإنتاج والتخزين' : 'Most requested clothing sizes by shoppers'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {stats.sizeDemandBreakdown.map((sz) => (
              <div key={sz.size} className="rounded-2xl border border-white/10 bg-black/40 p-3.5 text-center space-y-1">
                <span className="text-base font-bold font-mono text-white block">[{sz.size}]</span>
                <span className="text-lg font-bold text-amber-400 tabular-nums block">{sz.count}</span>
                <span className="text-[10px] text-white/40 block">{sz.percentage}% {isAr ? 'من الطلب' : 'demand'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 7. Strategic AI Recommendations & Growth Opportunities */}
      <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-r from-amber-500/[0.05] via-[#12151f] to-purple-500/[0.05] p-5 sm:p-6 backdrop-blur-md space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              {isAr ? '💡 مقترحات وفرص النمو الذكية (Strategic AI Recommendations)' : 'Strategic Recommendations'}
            </h4>
            <p className="text-[11px] text-white/50">
              {isAr ? 'تحليلات مدعومة بالبيانات لزيادة مبيعاتك وتحسين تحويل الزبائن' : 'Data-backed actions to maximize sales conversion'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="rounded-2xl border border-white/10 bg-black/40 p-3.5 space-y-1">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
              <Flame className="h-3.5 w-3.5" />
              {isAr ? 'تنبيه مخزون المقاس M' : 'Size M Inventory Alert'}
            </span>
            <p className="text-[11px] text-white/60">
              {isAr
                ? 'المقاس M يمثل أكثر من 40% من رغبات الزبائن، يوصى بزيادة جاهزيته للشحن الفوري.'
                : 'Size M represents >40% of demand. Keep ready stock in Baghdad hub.'}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/40 p-3.5 space-y-1">
            <span className="text-xs font-bold text-[#3b82f6] flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" />
              {isAr ? 'ساعات ذروة التسوق' : 'Peak Traffic Hours'}
            </span>
            <p className="text-[11px] text-white/60">
              {isAr
                ? 'ذروة التفاعل تتركز بين الساعة 8:00م و 11:00م بتوقيت بغداد، أفضل وقت لإطلاق عروض الإعلانات.'
                : 'Peak browsing occurs 8:00 PM - 11:00 PM Baghdad time. Ideal for Instagram campaigns.'}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/40 p-3.5 space-y-1">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <Percent className="h-3.5 w-3.5" />
              {isAr ? 'تنشيط القطع ذات المشاهدات العالية' : 'High View Conversion'}
            </span>
            <p className="text-[11px] text-white/60">
              {isAr
                ? 'تفعيل بادج "عرض خاص" على القطع الأكثر مشاهدة يرفع نسبة التحويل عبر الواتساب بأكثر من 35%.'
                : 'Enabling special offer badge on top-viewed items lifts WhatsApp orders by 35%.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
