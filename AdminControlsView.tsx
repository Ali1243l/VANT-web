import React, { useState } from 'react';
import { useAdminBridge } from './useAdminBridge';
import { useSiteControls, type SiteControlItem } from '../context/SiteControlsContext';
import {
  Sliders,
  Check,
  RotateCcw,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react';

export const AdminControlsView: React.FC = () => {
  const { lang } = useAdminBridge();
  const {
    controls,
    updateControl,
    toggleVisibility,
    resetAllControls,
  } = useSiteControls();

  const isAr = lang === 'ar';
  const [filterCategory, setFilterCategory] = useState<'all' | 'header' | 'banner' | 'product' | 'global' | 'filter'>('all');
  const [search, setSearch] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const controlsList = Object.values(controls) as SiteControlItem[];

  const filteredControls = controlsList.filter((item) => {
    if (filterCategory !== 'all' && item.category !== filterCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchLabel = (item.label_en && item.label_en.toLowerCase().includes(q)) || (item.label_ar && item.label_ar.includes(q));
      const matchKey = item.id.toLowerCase().includes(q);
      return matchLabel || matchKey;
    }
    return true;
  });

  const categories = [
    { id: 'all', label: isAr ? 'كافة العناصر' : 'All Controls' },
    { id: 'header', label: isAr ? 'الترويسة والتنقل' : 'Header' },
    { id: 'banner', label: isAr ? 'البانرات والواجهة' : 'Banners' },
    { id: 'product', label: isAr ? 'الكتالوج والقطع' : 'Catalog' },
    { id: 'global', label: isAr ? 'عناصر عامة' : 'Global' },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-6 start-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-emerald-950 border border-emerald-500/50 text-emerald-300 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 end-0 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">
                  {isAr ? 'التحكم بأزرار وخصائص تفاعل المتجر' : 'Interactive Buttons & Store Controls'}
                </h1>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400">
                  {controlsList.length} {isAr ? 'عنصر تحكم' : 'controls'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {isAr
                  ? 'إظهار أو إخفاء أي زر بالموقع بنقرة واحدة، وتعديل النصوص وروابط الإجراءات فورا بدون كود.'
                  : 'Toggle visibility and customize labels and actions for every button across the boutique.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (window.confirm(isAr ? 'هل أنت متأكد من استعادة كافة الأزرار للوضع الافتراضي؟' : 'Reset all controls to defaults?')) {
                  resetAllControls();
                  showToast(isAr ? 'تمت استعادة الإعدادات الافتراضية' : 'Reset to defaults');
                }
              }}
              className="px-3.5 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isAr ? 'استعادة الافتراضي' : 'Reset Defaults'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Categories Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setFilterCategory(c.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
              filterCategory === c.id
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border-slate-800'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Controls List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredControls.map((item) => {
          const isVisible = item.visible !== false;
          return (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition-all ${
                isVisible
                  ? 'bg-slate-900/80 border-slate-800 shadow-sm'
                  : 'bg-slate-950/60 border-slate-900 opacity-70'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      {item.id}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                      {item.category}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1.5 truncate">
                    {isAr ? item.name_ar || item.label_ar : item.name_en || item.label_en}
                  </h3>
                  {item.description_ar && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {isAr ? item.description_ar : item.description_en || item.description_ar}
                    </p>
                  )}
                </div>

                {/* Visibility Toggle Button */}
                <button
                  onClick={() => {
                    toggleVisibility(item.id);
                    showToast(
                      isVisible
                        ? isAr ? `تم إخفاء: ${item.name_ar || item.id}` : `Disabled ${item.name_en || item.id}`
                        : isAr ? `تم إظهار: ${item.name_ar || item.id}` : `Enabled ${item.name_en || item.id}`
                    );
                  }}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isVisible
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                      : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-white'
                  }`}
                  title={isVisible ? isAr ? 'انقر للتعطيل والإخفاء' : 'Click to disable' : isAr ? 'انقر للتشغيل والإظهار' : 'Click to enable'}
                >
                  {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>

              {/* Editable Fields */}
              <div className="space-y-3 pt-3 border-t border-slate-800/80 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-medium text-slate-400 block mb-1">
                      {isAr ? 'النص بالعربية' : 'Arabic Label'}
                    </label>
                    <input
                      type="text"
                      value={item.label_ar || ''}
                      onChange={(e) => updateControl(item.id, { label_ar: e.target.value })}
                      placeholder="النص..."
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-400 block mb-1">
                      {isAr ? 'النص بالإنجليزية' : 'English Label'}
                    </label>
                    <input
                      type="text"
                      value={item.label_en || ''}
                      onChange={(e) => updateControl(item.id, { label_en: e.target.value })}
                      placeholder="Label..."
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>

                {item.actionValue !== undefined && (
                  <div>
                    <label className="text-[11px] font-medium text-slate-400 block mb-1">
                      {isAr ? 'قيمة الإجراء أو الرابط / رقم الهاتف' : 'Action Value / Link / Phone'}
                    </label>
                    <input
                      type="text"
                      value={item.actionValue || ''}
                      onChange={(e) => updateControl(item.id, { actionValue: e.target.value })}
                      placeholder="#section or +9647..."
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:border-indigo-500 outline-none"
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminControlsView;
