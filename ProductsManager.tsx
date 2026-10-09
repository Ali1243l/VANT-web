import React, { useState } from 'react';
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  Copy,
  ExternalLink,
  Package,
  Layers,
  ArrowUpDown,
  LayoutGrid,
  List,
  Tag,
  Link2,
  Check,
  Flame,
  Percent,
  CheckCircle2,
  X,
  Sparkles,
  Share2,
  Palette,
} from 'lucide-react';
import { useAdminBridge, Product, Offer } from './useAdminBridge';
import { formatCurrency, formatNumber } from './format';
import { Button, StatusBadge, Card, Modal, Input } from './ui';
import { ProductFormSheet } from './ProductFormSheet';
import { ProductOfferModal } from './ProductOfferModal';

export const ProductsManager: React.FC = () => {
  const { products, deleteProduct, addProduct, updateProduct, offers, addOffer, lang } = useAdminBridge();
  const isAr = lang === 'ar';

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'sales' | 'stock'>('default');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Sheet & Modal state
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Offer Customization Modal State
  const [selectedProductForOffer, setSelectedProductForOffer] = useState<Product | null>(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  // Quick Action Feedback State
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  // Categories list
  const categories = Array.from(new Set(products.map((p) => p.category)));

  // Show temporary toast notification
  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 3500);
  };

  // Filter products
  const filteredProducts = products
    .filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.nameEn && p.nameEn.toLowerCase().includes(search.toLowerCase())) ||
        p.sku.toLowerCase().includes(search.toLowerCase());

      const matchCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const matchStatus = selectedStatus === 'all' || p.status === selectedStatus;

      return matchSearch && matchCategory && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'sales') return b.salesCount - a.salesCount;
      if (sortBy === 'stock') return a.stock - b.stock;
      return 0;
    });

  // Open Offer Modal (Custom Promo or Campaign List like Winter Clearance)
  const handleOpenOfferModal = (p: Product) => {
    setSelectedProductForOffer(p);
    setIsOfferModalOpen(true);
  };

  // Apply Offer (Custom item promo or campaign list)
  const handleApplyOffer = (
    productId: string,
    updates: {
      isOnOffer: boolean;
      salePrice?: number;
      offerCampaign?: string;
      offerBadgeText?: string;
      discountPercent?: number;
    },
    applyToAllInCategory?: boolean
  ) => {
    const prod = products.find((item) => item.id === productId);
    const prodName = isAr ? prod?.name : prod?.nameEn || prod?.name;

    if (applyToAllInCategory && prod?.category) {
      const categoryProducts = products.filter((p) => p.category === prod.category);
      categoryProducts.forEach((p) => {
        let finalSalePrice = updates.salePrice;
        if (updates.discountPercent && updates.discountPercent > 0) {
          finalSalePrice = Math.round((p.price * (1 - updates.discountPercent / 100)) / 250) * 250;
        } else if (updates.offerCampaign) {
          const camp = offers.find((o) => o.title === updates.offerCampaign || o.titleEn === updates.offerCampaign);
          if (camp) {
            if (camp.discountType === 'percentage') {
              finalSalePrice = Math.round((p.price * (1 - camp.discountValue / 100)) / 250) * 250;
            } else {
              finalSalePrice = Math.max(0, p.price - camp.discountValue);
            }
          }
        }
        updateProduct(p.id, {
          isOnOffer: true,
          salePrice: finalSalePrice || updates.salePrice,
          offerCampaign: updates.offerCampaign,
          offerBadgeText: updates.offerBadgeText,
        });
      });

      showToast(
        isAr
          ? `تم تطبيق العرض بنجاح على جميع منتجات فئة "${prod.category}" (${categoryProducts.length} منتجات)!`
          : `Offer successfully applied to all ${categoryProducts.length} products in "${prod.category}"!`,
        'success'
      );
    } else {
      updateProduct(productId, updates);
      if (updates.offerCampaign) {
        showToast(
          isAr
            ? `تم ربط "${prodName}" بقائمة "${updates.offerCampaign}" وتطبيق الخصم بنجاح!`
            : `Product "${prodName}" assigned to campaign "${updates.offerCampaign}"!`,
          'success'
        );
      } else {
        showToast(
          isAr
            ? `تم تفعيل عرض خاص ومخصص لـ "${prodName}" بنجاح!`
            : `Custom promo offer applied to "${prodName}"!`,
          'success'
        );
      }
    }
  };

  // Remove Offer
  const handleRemoveOffer = (productId: string, removeFromAllInCategory?: boolean) => {
    const prod = products.find((item) => item.id === productId);
    const prodName = isAr ? prod?.name : prod?.nameEn || prod?.name;

    if (removeFromAllInCategory && prod?.category) {
      const categoryProducts = products.filter((p) => p.category === prod.category && (p.isOnOffer || !!p.salePrice));
      categoryProducts.forEach((p) => {
        updateProduct(p.id, {
          isOnOffer: false,
          salePrice: undefined,
          offerCampaign: undefined,
          offerBadgeText: undefined,
        });
      });
      showToast(
        isAr
          ? `تم إلغاء العروض من جميع منتجات فئة "${prod.category}" (${categoryProducts.length} منتجات).`
          : `Promo removed from all products in category "${prod.category}".`,
        'info'
      );
    } else {
      updateProduct(productId, {
        isOnOffer: false,
        salePrice: undefined,
        offerCampaign: undefined,
        offerBadgeText: undefined,
      });
      showToast(
        isAr
          ? `تم إلغاء العرض الترويجي وإعادة السعر الأصلي لـ "${prodName}".`
          : `Promo removed and original price restored for "${prodName}".`,
        'info'
      );
    }
  };

  // Quick Action 2: Quick Edit
  const handleQuickEdit = (p: Product) => {
    setEditingProduct(p);
    setIsSheetOpen(true);
  };

  // Quick Action 3: Copy Link
  const handleCopyLink = async (p: Product) => {
    const storeOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://store.iraq';
    const productLink = `${storeOrigin}/products/${encodeURIComponent(p.sku || p.id)}`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(productLink);
      }
    } catch {
      // Fallback
    }

    setCopiedId(p.id);
    setTimeout(() => {
      setCopiedId((prev) => (prev === p.id ? null : prev));
    }, 2500);

    showToast(
      isAr
        ? `تم نسخ رابط المنتج بنجاح: ${productLink}`
        : `Product link copied to clipboard: ${productLink}`,
      'success'
    );
  };

  const handleDuplicate = (p: Product) => {
    addProduct({
      name: `${p.name} (${isAr ? 'نسخة' : 'Copy'})`,
      nameEn: `${p.nameEn || p.name} (Copy)`,
      sku: `${p.sku}-CP`,
      category: p.category,
      price: p.price,
      salePrice: p.salePrice,
      stock: p.stock,
      status: 'draft',
      imageUrl: p.imageUrl,
      images: p.images,
      sizes: p.sizes,
      descriptionAr: p.descriptionAr,
      descriptionEn: p.descriptionEn,
      materialDetails: p.materialDetails,
      availabilityStatus: p.availabilityStatus,
      isOnOffer: p.isOnOffer,
    });
    showToast(
      isAr ? `تم نسخ المنتج "${p.name}" بنجاح!` : `Product "${p.nameEn || p.name}" duplicated!`,
      'info'
    );
  };

  const handleDelete = () => {
    if (deleteConfirmId) {
      deleteProduct(deleteConfirmId);
      setDeleteConfirmId(null);
      showToast(isAr ? 'تم حذف المنتج من الكتالوج.' : 'Product removed from catalog.', 'info');
    }
  };

  return (
    <div className="space-y-6 pb-12 relative w-full">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 start-6 z-50 max-w-md animate-in slide-in-from-bottom-5 duration-200">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md ${
              toastMessage.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-600/40 text-emerald-200'
                : 'bg-indigo-950/90 border-indigo-600/40 text-indigo-200'
            }`}
          >
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
            <span className="text-xs sm:text-sm font-medium">{toastMessage.text}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white ms-auto cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>{isAr ? 'كتالوج المنتجات والمخزون' : 'Products & Stock Inventory'}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono">
              CMS V3
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            {isAr
              ? `إدارة ${products.length} من السلع، الإجراءات السريعة (العروض، التعديل، مشاركة الرابط)، والمقاسات بالدينار العراقي.`
              : `Manage ${products.length} catalog items with Quick Actions (Toggle Offer, Quick Edit, Copy Link) and cloud media.`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle (Grid / Table) */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title={isAr ? 'عرض جدولي' : 'Table view'}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title={isAr ? 'عرض بطاقات' : 'Grid view'}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setEditingProduct(null);
              setIsSheetOpen(true);
            }}
          >
            {isAr ? 'إضافة منتج جديد' : 'New Product'}
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="w-full md:flex-1">
            <Input
              icon={Search}
              placeholder={isAr ? 'بحث بالاسم، الباركود أو الـ SKU...' : 'Search product title or SKU...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div className="w-full md:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-100 text-sm rounded-lg px-3 py-2 h-9.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">{isAr ? 'جميع الفئات' : 'All Categories'}</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-44">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-100 text-sm rounded-lg px-3 py-2 h-9.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">{isAr ? 'جميع الحالات' : 'All Statuses'}</option>
              <option value="active">{isAr ? 'متوفر نشط' : 'Active'}</option>
              <option value="lowStock">{isAr ? 'مخزون منخفض' : 'Low Stock'}</option>
              <option value="outOfStock">{isAr ? 'نفد من المخزون' : 'Out of Stock'}</option>
              <option value="draft">{isAr ? 'مسودة' : 'Draft'}</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="w-full md:w-44">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-100 text-sm rounded-lg px-3 py-2 h-9.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="default">{isAr ? 'الترتيب: الافتراضي' : 'Sort: Default'}</option>
              <option value="price-asc">{isAr ? 'السعر: الأقل أولاً' : 'Price: Low to High'}</option>
              <option value="price-desc">{isAr ? 'السعر: الأعلى أولاً' : 'Price: High to Low'}</option>
              <option value="sales">{isAr ? 'الأكثر مبيعاً' : 'Top Sales'}</option>
              <option value="stock">{isAr ? 'الأقل مخزوناً' : 'Lowest Stock'}</option>
            </select>
          </div>
        </div>

        {/* Quick status counters */}
        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-800/60 text-xs text-slate-400">
          <span>
            {isAr ? 'النتائج المعروضة:' : 'Results:'}{' '}
            <strong className="text-white">{filteredProducts.length}</strong>
          </span>
          <span>·</span>
          <span>
            {isAr ? 'إجمالي المخزون:' : 'Total Units:'}{' '}
            <strong className="text-emerald-400">
              {filteredProducts.reduce((sum, p) => sum + p.stock, 0)}
            </strong>{' '}
            {isAr ? 'قطعة' : 'units'}
          </span>
          <span>·</span>
          <span>
            {isAr ? 'عروض نشطة:' : 'Active Offers:'}{' '}
            <strong className="text-amber-400">
              {products.filter((p) => p.isOnOffer || !!p.salePrice).length}
            </strong>
          </span>
          <span>·</span>
          <span>
            {isAr ? 'نفد المخزون:' : 'Out of Stock:'}{' '}
            <strong className="text-rose-400">{products.filter((p) => p.stock === 0).length}</strong>
          </span>
        </div>
      </Card>

      {/* View Mode: Table */}
      {viewMode === 'table' ? (
        <Card className="p-0 overflow-hidden border border-slate-800/80 bg-slate-900/90 rounded-2xl shadow-xl w-full">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-start border-collapse min-w-[1020px]">
              <thead>
                <tr className="border-b border-slate-800/90 bg-slate-900/95 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="py-4.5 px-6 text-start">{isAr ? 'المنتج والتفاصيل' : 'Product & Details'}</th>
                  <th className="py-4.5 px-6 text-start">{isAr ? 'التصنيف' : 'Category'}</th>
                  <th className="py-4.5 px-6 text-start">{isAr ? 'المقاسات المتاحة' : 'Available Sizes'}</th>
                  <th className="py-4.5 px-6 text-start">{isAr ? 'السعر والعرض' : 'Price & Promo'}</th>
                  <th className="py-4.5 px-6 text-start">{isAr ? 'المخزون' : 'Stock'}</th>
                  <th className="py-4.5 px-6 text-start">{isAr ? 'الحالة' : 'Status'}</th>
                  <th className="py-4.5 px-6 text-end">
                    {isAr ? 'الإجراءات السريعة (Quick Actions)' : 'Quick Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {filteredProducts.map((p) => {
                  const hasOffer = p.isOnOffer || !!p.salePrice;
                  const isCopied = copiedId === p.id;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-850/60 transition-colors group cursor-default"
                    >
                      {/* Product Name, Image & Tags */}
                      <td className="py-4.5 px-6">
                        <div className="flex items-center gap-4">
                          <div className="relative shrink-0">
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover bg-slate-800 border border-slate-700/80 shadow-md group-hover:scale-[1.02] transition-transform"
                            />
                            {hasOffer && (
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenOfferModal(p);
                                }}
                                className="absolute -top-2 -start-2 w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-extrabold text-xs shadow-lg ring-2 ring-slate-950 cursor-pointer hover:scale-110 transition-transform"
                                title={isAr ? 'عرض ترويجي نشط (انقر للتعديل)' : 'Active Promo (Click to edit)'}
                              >
                                %
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-bold text-white text-sm sm:text-base leading-snug truncate max-w-md xl:max-w-xl 2xl:max-w-2xl">
                                {isAr ? p.name : p.nameEn || p.name}
                              </h4>
                              {hasOffer && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenOfferModal(p)}
                                  className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/35 hover:bg-amber-500/25 flex items-center gap-1 shadow-sm cursor-pointer transition-colors"
                                  title={isAr ? 'تعديل أو تغيير قائمة العرض' : 'Edit or change promo campaign'}
                                >
                                  <Sparkles className="w-3 h-3 text-amber-400" />
                                  <span>
                                    {p.offerCampaign ||
                                      p.offerBadgeText ||
                                      (isAr ? 'عرض نشط' : 'Active Offer')}
                                  </span>
                                </button>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-400 font-mono">
                              <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60 text-slate-300">
                                SKU: {p.sku}
                              </span>
                              {p.images && p.images.length > 1 && (
                                <span className="text-[11px] text-slate-400 font-sans">
                                  ({p.images.length} {isAr ? 'صور' : 'photos'})
                                </span>
                              )}
                              {p.hasVariants && p.variants && p.variants.length > 0 && (
                                <div className="flex items-center gap-1.5 ms-1">
                                  <div className="flex items-center -space-x-1 rtl:space-x-reverse">
                                    {p.variants.slice(0, 4).map((v) => (
                                      <span
                                        key={v.id}
                                        className="w-3.5 h-3.5 rounded-full border border-slate-700 shadow-sm inline-block shrink-0"
                                        style={{ backgroundColor: v.colorHex }}
                                        title={`${v.colorNameAr} (${v.colorNameEn})`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-[11px] font-sans font-semibold text-indigo-400 flex items-center gap-1">
                                    <Palette className="w-3 h-3" />
                                    {p.variants.length} {isAr ? 'ألوان' : 'colors'}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4.5 px-6 whitespace-nowrap">
                        <span className="px-3 py-1 rounded-lg bg-slate-800/70 border border-slate-700/60 text-slate-200 text-xs font-semibold">
                          {p.category}
                        </span>
                      </td>

                      {/* Sizes Matrix */}
                      <td className="py-4.5 px-6 whitespace-nowrap">
                        {p.sizes && p.sizes.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 max-w-[160px] xl:max-w-[260px]">
                            {p.sizes.slice(0, 3).map((s) => (
                              <span
                                key={s}
                                className="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700/80"
                              >
                                {s}
                              </span>
                            ))}
                            {p.sizes.length > 3 && (
                              <span className="px-1.5 py-0.5 rounded-md text-xs text-slate-400 bg-slate-800/60 border border-slate-700/40">
                                +{p.sizes.length - 3}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 text-xs">-</span>
                        )}
                      </td>

                      {/* Price in Iraqi Dinar & Discount Info */}
                      <td className="py-4.5 px-6 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <div className="text-sm sm:text-base font-extrabold text-white font-mono tracking-tight" dir="ltr">
                            {formatCurrency(p.salePrice || p.price, 'IQD', 'en')}
                          </div>
                          {p.salePrice && (
                            <div className="flex items-center gap-2" dir="ltr">
                              <span className="text-xs text-slate-500 line-through font-mono">
                                {formatCurrency(p.price, 'IQD', 'en')}
                              </span>
                              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30 font-mono">
                                {isAr ? 'توفير' : 'Save'}{' '}
                                {formatCurrency(p.price - p.salePrice, 'IQD', 'en')}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Stock */}
                      <td className="py-4.5 px-6 whitespace-nowrap">
                        <div
                          className={`text-sm font-bold flex items-center gap-1.5 ${
                            p.stock === 0
                              ? 'text-rose-400'
                              : p.stock <= 5
                              ? 'text-amber-400'
                              : 'text-slate-200'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              p.stock === 0
                                ? 'bg-rose-500'
                                : p.stock <= 5
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                          />
                          <span>
                            {p.stock} {isAr ? 'قطعة' : 'units'}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4.5 px-6 whitespace-nowrap">
                        <StatusBadge
                          status={p.status}
                          label={
                            p.status === 'active'
                              ? isAr
                                ? 'متوفر نشط'
                                : 'Active'
                              : p.status === 'lowStock'
                              ? isAr
                                ? 'مخزون منخفض'
                                : 'Low Stock'
                              : p.status === 'outOfStock'
                              ? isAr
                                ? 'نفد المخزون'
                                : 'Out of Stock'
                              : isAr
                              ? 'مسودة'
                              : 'Draft'
                          }
                        />
                      </td>

                      {/* Quick Actions (Quick Edit -> Configure/Toggle Offer -> Copy Link -> Duplicate -> Delete) */}
                      <td className="py-4.5 px-6 text-end whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {/* Quick Action 1: Quick Edit */}
                          <button
                            type="button"
                            onClick={() => handleQuickEdit(p)}
                            className="px-2.5 py-1.5 rounded-lg bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                            title={isAr ? 'تعديل بيانات المنتج' : 'Edit Product'}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>{isAr ? 'تعديل' : 'Edit'}</span>
                          </button>

                          {/* Quick Action 2: Configure / Toggle Offer (Opens Dedicated Offer Modal) */}
                          <button
                            type="button"
                            onClick={() => handleOpenOfferModal(p)}
                            className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
                              hasOffer
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30 shadow-sm shadow-amber-500/20'
                                : 'bg-slate-800/90 text-slate-300 border-slate-700/70 hover:text-amber-300 hover:border-amber-500/40 hover:bg-slate-800'
                            }`}
                            title={
                              isAr
                                ? hasOffer
                                  ? 'تعديل العرض الترويجي النشط أو إزالته'
                                  : 'تخصيص عرض خاص أو إضافة لقائمة عروض (تخفيضات الشتاء وغيرها)'
                                : 'Configure promo offer or assign to campaign'
                            }
                          >
                            <Tag className="w-3.5 h-3.5" />
                            <span>
                              {hasOffer ? (isAr ? 'عرض نشط' : 'On Sale') : (isAr ? 'إضافة عرض' : 'Offer')}
                            </span>
                          </button>

                          {/* Quick Action 3: Copy Link */}
                          <button
                            type="button"
                            onClick={() => handleCopyLink(p)}
                            className={`p-2 rounded-lg border transition-all cursor-pointer ${
                              isCopied
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                                : 'bg-slate-800/90 text-slate-400 border-slate-700/70 hover:text-white hover:border-slate-600'
                            }`}
                            title={isAr ? 'نسخ رابط المنتج المباشر' : 'Copy Product Link'}
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Link2 className="w-3.5 h-3.5" />}
                          </button>

                          {/* Quick Action 4: Duplicate */}
                          <button
                            type="button"
                            onClick={() => handleDuplicate(p)}
                            className="p-2 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800/90 border border-transparent hover:border-slate-700 transition-colors cursor-pointer"
                            title={isAr ? 'تكرار / مضاعفة المنتج' : 'Duplicate Product'}
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Action 5: Delete */}
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(p.id)}
                            className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/90 border border-transparent hover:border-rose-500/30 transition-colors cursor-pointer"
                            title={isAr ? 'حذف المنتج' : 'Delete Product'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer with Summary & Spacious Spacing */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 bg-slate-900/90 border-t border-slate-800 text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <span>
                {isAr ? 'عرض' : 'Showing'}{' '}
                <strong className="text-white">{filteredProducts.length}</strong>{' '}
                {isAr ? 'من أصل' : 'of'}{' '}
                <strong className="text-white">{products.length}</strong>{' '}
                {isAr ? 'منتجات في الكتالوج' : 'products in catalog'}
              </span>
              <span>·</span>
              <span className="text-amber-400 font-medium">
                {products.filter((p) => p.isOnOffer || !!p.salePrice).length}{' '}
                {isAr ? 'منتجات ضمن العروض النشطة' : 'active promotional items'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">
                {isAr ? 'نظام التسعير: الدينار العراقي (IQD)' : 'Pricing: Iraqi Dinar (IQD)'}
              </span>
            </div>
          </div>
        </Card>
      ) : (
        /* View Mode: Grid (Spacious Cards) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 sm:gap-7 w-full">
          {filteredProducts.map((p) => {
            const hasOffer = p.isOnOffer || !!p.salePrice;
            const isCopied = copiedId === p.id;

            return (
              <Card
                key={p.id}
                hoverable
                className="flex flex-col justify-between overflow-hidden p-0 relative group rounded-2xl border-slate-800/80 bg-slate-900/90 shadow-lg"
              >
                <div className="relative aspect-video w-full bg-slate-800 overflow-hidden">
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Badges on Image */}
                  <div className="absolute top-3 end-3 flex items-center gap-1.5">
                    <StatusBadge
                      status={p.status}
                      label={
                        p.status === 'active'
                          ? isAr
                            ? 'متوفر'
                            : 'Active'
                          : p.status === 'lowStock'
                          ? isAr
                            ? 'منخفض'
                            : 'Low'
                          : isAr
                          ? 'نفد'
                          : 'Out'
                      }
                    />
                  </div>

                  {/* Toggle / Open Offer Modal Button Overlay */}
                  <div className="absolute top-3 start-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenOfferModal(p);
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xl transition-all cursor-pointer backdrop-blur-md ${
                        hasOffer
                          ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 border border-amber-300'
                          : 'bg-slate-900/85 text-slate-200 hover:bg-amber-500 hover:text-slate-950 border border-slate-700/80'
                      }`}
                      title={
                        isAr
                          ? hasOffer
                            ? 'تعديل العرض أو إلغاؤه'
                            : 'تخصيص عرض خاص أو ربط بقائمة عروض'
                          : hasOffer
                          ? 'Edit or remove promo'
                          : 'Configure promo or assign to campaign'
                      }
                    >
                      <Tag className="w-3.5 h-3.5" />
                      <span>
                        {hasOffer
                          ? p.offerCampaign || (isAr ? 'عرض نشط' : 'Promo Active')
                          : isAr
                          ? 'تفعيل عرض'
                          : 'Add Offer'}
                      </span>
                    </button>
                  </div>

                  {/* Image count pill */}
                  {p.images && p.images.length > 1 && (
                    <div className="absolute bottom-2 end-2 px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-sm text-[11px] text-slate-300 border border-slate-800">
                      {p.images.length} {isAr ? 'صور' : 'photos'}
                    </div>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-indigo-400 font-semibold px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                        {p.category}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">SKU: {p.sku}</span>
                    </div>

                    <h3 className="font-bold text-white text-base line-clamp-1 mt-2">
                      {isAr ? p.name : p.nameEn || p.name}
                    </h3>

                    {/* Color Variants Swatches in Grid Card */}
                    {p.hasVariants && p.variants && p.variants.length > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center -space-x-1.5 rtl:space-x-reverse">
                          {p.variants.slice(0, 5).map((v) => (
                            <span
                              key={v.id}
                              className="w-4 h-4 rounded-full border-2 border-slate-900 shadow-sm inline-block shrink-0"
                              style={{ backgroundColor: v.colorHex }}
                              title={`${v.colorNameAr} (${v.colorNameEn})`}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1">
                          <Palette className="w-3 h-3" />
                          {p.variants.length} {isAr ? 'خيارات ألوان' : 'color variants'}
                        </span>
                      </div>
                    )}

                    {/* Sizing tags */}
                    {p.sizes && p.sizes.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {p.sizes.slice(0, 4).map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700/60"
                          >
                            {s}
                          </span>
                        ))}
                        {p.sizes.length > 4 && (
                          <span className="text-xs text-slate-500">+{p.sizes.length - 4}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Pricing row in Iraqi Dinars */}
                  <div className="flex items-center justify-between pt-3.5 border-t border-slate-800">
                    <div dir="ltr">
                      <span className="text-lg font-extrabold text-white font-mono tracking-tight">
                        {formatCurrency(p.salePrice || p.price, 'IQD', 'en')}
                      </span>
                      {p.salePrice && (
                        <span className="text-xs text-slate-500 line-through ms-2 font-mono">
                          {formatCurrency(p.price, 'IQD', 'en')}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">
                      {p.stock} {isAr ? 'في المخزن' : 'in stock'}
                    </span>
                  </div>

                  {/* Quick Actions Bar */}
                  <div className="pt-3 border-t border-slate-800/80 space-y-2">
                    <div className="flex items-center gap-2">
                      {/* Quick Edit */}
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                        onClick={() => handleQuickEdit(p)}
                        className="flex-1 text-xs"
                      >
                        {isAr ? 'تعديل سريع' : 'Quick Edit'}
                      </Button>

                      {/* Open Offer Modal */}
                      <button
                        type="button"
                        onClick={() => handleOpenOfferModal(p)}
                        className={`p-2 rounded-lg border transition-all cursor-pointer ${
                          hasOffer
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-amber-300 hover:border-amber-500/40'
                        }`}
                        title={
                          isAr
                            ? hasOffer
                              ? 'تعديل العرض النشط أو إزالته'
                              : 'تخصيص عرض خاص أو إضافة لقائمة عروض (تخفيضات الشتاء وغيرها)'
                            : 'Configure promo or assign to campaign'
                        }
                      >
                        <Tag className="w-4 h-4" />
                      </button>

                      {/* Copy Link */}
                      <button
                        type="button"
                        onClick={() => handleCopyLink(p)}
                        className={`p-2 rounded-lg border transition-all cursor-pointer ${
                          isCopied
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:border-slate-600'
                        }`}
                        title={isAr ? 'نسخ الرابط' : 'Copy Link'}
                      >
                        {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Link2 className="w-4 h-4" />}
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(p.id)}
                        className="p-2 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 hover:text-rose-400 hover:border-rose-500/40 transition-colors cursor-pointer"
                        title={isAr ? 'حذف' : 'Delete'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Product Form Slide-over Sheet */}
      <ProductFormSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        editingProduct={editingProduct}
      />

      {/* Product Offer Assignment / Customization Modal (User Requested) */}
      {isOfferModalOpen && selectedProductForOffer && (
        <ProductOfferModal
          isOpen={isOfferModalOpen}
          onClose={() => {
            setIsOfferModalOpen(false);
            setSelectedProductForOffer(null);
          }}
          product={selectedProductForOffer}
          products={products}
          offers={offers}
          onApplyOffer={handleApplyOffer}
          onRemoveOffer={handleRemoveOffer}
          onAddNewOfferCampaign={addOffer}
          isAr={isAr}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title={isAr ? 'تأكيد حذف المنتج' : 'Confirm Product Deletion'}
        maxWidth="sm"
      >
        <p className="text-sm text-slate-300 mb-6">
          {isAr
            ? 'هل أنت متأكد من رغبتك في إزالة هذا المنتج من الكتالوج؟ لا يمكن التراجع عن هذا الإجراء.'
            : 'Are you sure you want to permanently remove this product? This action cannot be reversed.'}
        </p>
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeleteConfirmId(null)}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            {isAr ? 'نعم، حذف الآن' : 'Delete'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ProductsManager;
