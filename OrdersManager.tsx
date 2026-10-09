import React, { useState, useMemo } from 'react';
import {
  LayoutGrid,
  List,
  Search,
  Filter,
  Crown,
  Scissors,
  Clock,
  Truck,
  CheckCircle2,
  AlertCircle,
  Phone,
  Eye,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Plus,
  RefreshCw,
  ShoppingBag,
  DollarSign,
  User,
  Sparkles,
  Calendar,
  MessageCircle,
} from 'lucide-react';
import { useAdminBridge, Order, OrderStatus, OrderType } from './useAdminBridge';
import { StatusBadge } from './ui';
import { OrderDetailsSheet } from './OrderDetailsSheet';

type ViewMode = 'kanban' | 'table';
type FilterTab = 'all' | 'bespoke' | 'ready_to_wear' | 'pending';

export const OrdersManager: React.FC = () => {
  const { orders = [], lang, updateOrderStatus } = useAdminBridge();
  const isAr = lang === 'ar';

  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);

  const formatPrice = (num: number) => {
    return `${new Intl.NumberFormat('en-US').format(num)} IQD`;
  };

  // Metrics calculations
  const metrics = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === 'pending_payment').length;
    const inAtelier = orders.filter((o) => o.status === 'processing').length;
    const shipped = orders.filter((o) => o.status === 'shipped').length;
    const delivered = orders.filter((o) => o.status === 'delivered').length;
    const bespokeCount = orders.filter((o) => o.type === 'bespoke').length;
    const totalRevenue = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((acc, cur) => acc + cur.totalPrice, 0);

    return { total, pending, inAtelier, shipped, delivered, bespokeCount, totalRevenue };
  }, [orders]);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Tab filter
      if (activeFilter === 'bespoke' && order.type !== 'bespoke') return false;
      if (activeFilter === 'ready_to_wear' && order.type !== 'ready_to_wear') return false;
      if (activeFilter === 'pending' && order.status !== 'pending_payment') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesId = order.id.toLowerCase().includes(q);
        const matchesName = order.customerName.toLowerCase().includes(q);
        const matchesPhone = order.customerPhone.includes(q);
        const matchesItem = order.items.some(
          (i) => i.name.toLowerCase().includes(q) || i.nameEn.toLowerCase().includes(q)
        );
        return matchesId || matchesName || matchesPhone || matchesItem;
      }
      return true;
    });
  }, [orders, activeFilter, searchQuery]);

  const handleOpenOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const handleQuickAdvance = (e: React.MouseEvent, order: Order) => {
    e.stopPropagation();
    const sequence: Record<OrderStatus, OrderStatus | null> = {
      pending_payment: 'processing',
      processing: 'shipped',
      shipped: 'delivered',
      delivered: null,
      cancelled: null,
    };

    const next = sequence[order.status];
    if (next) {
      updateOrderStatus(order.id, next);
    }
  };

  const kanbanColumns: Array<{
    id: OrderStatus;
    titleAr: string;
    titleEn: string;
    icon: React.ElementType;
    badgeStatus: 'draft' | 'warning' | 'active' | 'success';
    headerBorder: string;
  }> = [
    {
      id: 'pending_payment',
      titleAr: 'بانتظار الدفع والتأكيد',
      titleEn: 'Pending Payment',
      icon: Clock,
      badgeStatus: 'draft',
      headerBorder: 'border-amber-500/40',
    },
    {
      id: 'processing',
      titleAr: 'قيد التفصيل في الأتيليه',
      titleEn: 'In Atelier / Tailoring',
      icon: Scissors,
      badgeStatus: 'warning',
      headerBorder: 'border-indigo-500/40',
    },
    {
      id: 'shipped',
      titleAr: 'تم الشحن للتوصيل',
      titleEn: 'Shipped & In Transit',
      icon: Truck,
      badgeStatus: 'active',
      headerBorder: 'border-cyan-500/40',
    },
    {
      id: 'delivered',
      titleAr: 'تم التسليم بنجاح',
      titleEn: 'Delivered',
      icon: CheckCircle2,
      badgeStatus: 'success',
      headerBorder: 'border-emerald-500/40',
    },
  ];

  return (
    <div className="space-y-6 text-start">
      {/* Top Header & Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>{isAr ? 'إدارة الطلبات والكونسيرج الملكي' : 'Order Management & VIP Concierge'}</span>
              <Crown className="w-5 h-5 text-amber-400" />
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              OMS v2.6
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isAr
              ? 'متابعة مراحل الإنتاج والتفصيل اليدوي في الأتيليه وشحن طلبات العملاء الفورية وكبار الشخصيات.'
              : 'Real-time tracking of atelier bespoke tailoring, express fulfillment, and VIP concierge client requests.'}
          </p>
        </div>

        {/* View Switcher Toggle */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>{isAr ? 'لوحة كانبان (Kanban)' : 'Kanban Board'}</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>{isAr ? 'جدول البيانات (Table)' : 'Data Table'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Metric 1: Total Orders */}
        <div className="rounded-xl bg-slate-900/90 border border-slate-800/80 p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs">{isAr ? 'إجمالي الطلبات' : 'Total Orders'}</span>
            <ShoppingBag className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-white">{metrics.total}</span>
            <span className="text-[11px] text-indigo-400">{metrics.bespokeCount} {isAr ? 'تفصيل ملكي' : 'Bespoke'}</span>
          </div>
        </div>

        {/* Metric 2: Pending Action (Glowing Amber) */}
        <div className="rounded-xl bg-slate-900/90 border border-amber-500/40 p-3.5 flex flex-col justify-between shadow-[0_0_15px_rgba(245,158,11,0.12)]">
          <div className="flex items-center justify-between text-amber-300 mb-2">
            <span className="text-xs font-semibold">{isAr ? 'بانتظار التأكيد' : 'Pending Action'}</span>
            <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-amber-300">{metrics.pending}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {isAr ? 'يتطلب إجراء' : 'Action Required'}
            </span>
          </div>
        </div>

        {/* Metric 3: In Atelier */}
        <div className="rounded-xl bg-slate-900/90 border border-indigo-500/30 p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-indigo-300 mb-2">
            <span className="text-xs">{isAr ? 'قيد الخياطة بالأتيليه' : 'In Atelier'}</span>
            <Scissors className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-indigo-300">{metrics.inAtelier}</span>
            <span className="text-[11px] text-slate-400">{isAr ? 'جاري التنفيذ' : 'In Progress'}</span>
          </div>
        </div>

        {/* Metric 4: Shipped */}
        <div className="rounded-xl bg-slate-900/90 border border-slate-800/80 p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs">{isAr ? 'تم الشحن للتسليم' : 'Shipped & Transit'}</span>
            <Truck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-cyan-300">{metrics.shipped}</span>
            <span className="text-[11px] text-emerald-400 font-mono">+{metrics.delivered} {isAr ? 'مستلم' : 'Done'}</span>
          </div>
        </div>

        {/* Metric 5: Total Revenue */}
        <div className="col-span-2 sm:col-span-3 lg:col-span-1 rounded-xl bg-slate-900/90 border border-emerald-500/30 p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-xs">{isAr ? 'عائدات الطلبات' : 'Total Revenue'}</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-lg font-bold font-mono text-emerald-300 truncate">
            {formatPrice(metrics.totalRevenue)}
          </span>
        </div>
      </div>

      {/* Search & Filter Tabs Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/80 border border-slate-800/80 p-3 rounded-2xl">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
            }`}
          >
            {isAr ? 'جميع الطلبات' : 'All Orders'} ({orders.length})
          </button>
          <button
            onClick={() => setActiveFilter('bespoke')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeFilter === 'bespoke'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800/70'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>{isAr ? 'طلبات التفصيل الخاص VIP' : 'Bespoke Atelier'}</span>
            <span className="text-[10px] bg-amber-500/30 px-1.5 py-0.2 rounded-full font-mono">
              {metrics.bespokeCount}
            </span>
          </button>
          <button
            onClick={() => setActiveFilter('ready_to_wear')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeFilter === 'ready_to_wear'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
            }`}
          >
            {isAr ? 'الملابس الجاهزة' : 'Ready-to-Wear'}
          </button>
          <button
            onClick={() => setActiveFilter('pending')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeFilter === 'pending'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{isAr ? 'بانتظار التأكيد' : 'Pending'}</span>
            {metrics.pending > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px] sm:max-w-xs">
          <Search className={`absolute ${isAr ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAr ? 'بحث برقم الطلب، العميل، الهاتف...' : 'Search order #, client, phone...'}
            className={`w-full text-xs ${
              isAr ? 'pr-9 pl-3' : 'pl-9 pr-3'
            } py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500`}
          />
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'kanban' ? (
        /* KANBAN BOARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {kanbanColumns.map((col) => {
            const ColIcon = col.icon;
            const columnOrders = filteredOrders.filter((o) => o.status === col.id);

            return (
              <div
                key={col.id}
                className="bg-slate-900/60 border border-slate-800/80 rounded-2xl flex flex-col max-h-[820px] overflow-hidden shadow-sm"
              >
                {/* Column Header */}
                <div
                  className={`p-3.5 bg-slate-900/95 border-b border-slate-800/80 border-t-2 ${col.headerBorder} flex items-center justify-between`}
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300">
                      <ColIcon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-white tracking-wide">
                      {isAr ? col.titleAr : col.titleEn}
                    </span>
                  </div>
                  <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {columnOrders.length}
                  </span>
                </div>

                {/* Column Cards Drop Area */}
                <div className="p-3 space-y-3 overflow-y-auto flex-1">
                  {columnOrders.length === 0 ? (
                    <div className="text-center py-10 px-4 border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
                      {isAr ? 'لا توجد طلبات في هذه المرحلة' : 'No orders in this stage'}
                    </div>
                  ) : (
                    columnOrders.map((order) => {
                      return (
                        <div
                          key={order.id}
                          onClick={() => handleOpenOrder(order)}
                          className={`group relative rounded-xl p-4 bg-slate-900 border transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:border-slate-700 text-start ${
                            order.isVip
                              ? 'border-amber-500/40 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 hover:border-amber-500/70'
                              : 'border-slate-800/90 hover:border-slate-700'
                          }`}
                        >
                          {/* Card Header: Order ID & VIP Badge */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs font-bold text-indigo-300">#{order.id}</span>
                              {order.isVip && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                  <Crown className="w-2.5 h-2.5" />
                                  <span>VIP</span>
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {order.orderDate.split(' ')[0]}
                            </span>
                          </div>

                          {/* Customer Name & Phone */}
                          <div className="mb-2.5">
                            <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                              {order.customerName}
                            </h4>
                            <p className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                              <Phone className="w-2.5 h-2.5 text-slate-500" />
                              <span>{order.customerPhone}</span>
                            </p>
                          </div>

                          {/* Bespoke Measurement / Atelier Flag */}
                          {order.type === 'bespoke' && (
                            <div className="mb-2.5 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-[10px] text-amber-300">
                              <span className="flex items-center gap-1 font-medium">
                                <Scissors className="w-3 h-3 text-amber-400" />
                                <span>{isAr ? 'تفصيل ملكي خاص' : 'Atelier Bespoke'}</span>
                              </span>
                              <span className="font-mono text-amber-400/90">
                                {order.bespokeDetails?.fittingDate ? (isAr ? 'بروفة قياس' : 'Fitting') : (isAr ? 'باترون' : 'Pattern')}
                              </span>
                            </div>
                          )}

                          {/* Items Preview thumbnails */}
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex -space-x-2 rtl:space-x-reverse overflow-hidden">
                              {order.items.slice(0, 3).map((item, i) => (
                                <img
                                  key={i}
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-7 h-7 rounded-full border-2 border-slate-900 object-cover bg-slate-800"
                                  title={`${item.name} (${item.selectedSize})`}
                                />
                              ))}
                            </div>
                            <span className="text-[11px] text-slate-400 truncate flex-1">
                              {order.items.length === 1
                                ? isAr
                                  ? order.items[0].name
                                  : order.items[0].nameEn
                                : `${order.items.length} ${isAr ? 'منتجات' : 'items'}`}
                            </span>
                          </div>

                          {/* Card Footer: Price & Quick Advance */}
                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                            <span className="text-xs font-bold font-mono text-emerald-400">
                              {formatPrice(order.totalPrice)}
                            </span>

                            {col.id !== 'delivered' && (
                              <button
                                onClick={(e) => handleQuickAdvance(e, order)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white text-[10px] font-semibold transition-all cursor-pointer border border-slate-700 hover:border-indigo-500"
                                title={isAr ? 'نقل للمرحلة التالية' : 'Advance Stage'}
                              >
                                <span>{isAr ? 'المرحلة التالية' : 'Advance'}</span>
                                {isAr ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* DENSE SLEEK DATA TABLE VIEW */
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-slate-950/70 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 text-start">{isAr ? 'رقم الطلب والتاريخ' : 'Order ID & Date'}</th>
                  <th className="py-3.5 px-4 text-start">{isAr ? 'العميل وبيانات التواصل' : 'Customer & Contact'}</th>
                  <th className="py-3.5 px-4 text-start">{isAr ? 'نوع الطلب' : 'Type'}</th>
                  <th className="py-3.5 px-4 text-start">{isAr ? 'القطع والمنتجات' : 'Purchased Items'}</th>
                  <th className="py-3.5 px-4 text-start">{isAr ? 'القيمة الإجمالية' : 'Total Price'}</th>
                  <th className="py-3.5 px-4 text-start">{isAr ? 'حالة الطلب' : 'Status'}</th>
                  <th className="py-3.5 px-4 text-end">{isAr ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                      {isAr ? 'لا توجد طلبات تطابق معايير البحث' : 'No matching orders found'}
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const statusBadgeMap: Record<
                      OrderStatus,
                      { labelAr: string; labelEn: string; status: 'draft' | 'warning' | 'active' | 'success' | 'danger' }
                    > = {
                      pending_payment: { labelAr: 'بانتظار الدفع', labelEn: 'Pending Payment', status: 'draft' },
                      processing: { labelAr: 'في الأتيليه', labelEn: 'In Atelier', status: 'warning' },
                      shipped: { labelAr: 'تم الشحن', labelEn: 'Shipped', status: 'active' },
                      delivered: { labelAr: 'تم التسليم', labelEn: 'Delivered', status: 'success' },
                      cancelled: { labelAr: 'ملغي', labelEn: 'Cancelled', status: 'danger' },
                    };

                    const badge = statusBadgeMap[order.status];

                    return (
                      <tr
                        key={order.id}
                        onClick={() => handleOpenOrder(order)}
                        className={`hover:bg-slate-800/40 transition-colors cursor-pointer ${
                          order.isVip ? 'bg-amber-500/[0.02]' : ''
                        }`}
                      >
                        {/* Order ID & Date */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-indigo-300">#{order.id}</span>
                            {order.isVip && (
                              <span title="VIP Client">
                                <Crown className="w-3.5 h-3.5 text-amber-400" />
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                            {order.orderDate}
                          </span>
                        </td>

                        {/* Customer */}
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-white block">{order.customerName}</span>
                          <span className="font-mono text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Phone className="w-2.5 h-2.5 text-slate-500" />
                            <span>{order.customerPhone}</span>
                          </span>
                        </td>

                        {/* Type */}
                        <td className="py-3.5 px-4">
                          {order.type === 'bespoke' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              <Crown className="w-3 h-3" />
                              <span>{isAr ? 'تفصيل ملكي' : 'VIP Bespoke'}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                              <span>{isAr ? 'جاهز للارتداء' : 'Ready-to-Wear'}</span>
                            </span>
                          )}
                        </td>

                        {/* Items */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-2 rtl:space-x-reverse overflow-hidden">
                              {order.items.slice(0, 2).map((item, i) => (
                                <img
                                  key={i}
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-6 h-6 rounded-full border border-slate-800 object-cover bg-slate-800"
                                />
                              ))}
                            </div>
                            <span className="text-xs text-slate-300 truncate max-w-[180px]">
                              {order.items.map((i) => (isAr ? i.name : i.nameEn)).join(', ')}
                            </span>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                          {formatPrice(order.totalPrice)}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <StatusBadge
                            status={badge.status}
                            label={isAr ? badge.labelAr : badge.labelEn}
                          />
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-end">
                          <div className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleOpenOrder(order)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                              title={isAr ? 'عرض التفاصيل' : 'View Details'}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            {order.status !== 'delivered' && order.status !== 'cancelled' && (
                              <button
                                onClick={(e) => handleQuickAdvance(e, order)}
                                className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-[11px] font-semibold border border-indigo-500/30 transition-all cursor-pointer"
                              >
                                {isAr ? 'المرحلة التالية' : 'Advance'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIP Concierge Order Details Sheet */}
      <OrderDetailsSheet
        order={selectedOrder}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedOrder(null);
        }}
      />
    </div>
  );
};

export default OrdersManager;
