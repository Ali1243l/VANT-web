import React, { useState } from 'react';
import { useAdminBridge } from './useAdminBridge';
import { useSiteControls } from '../context/SiteControlsContext';
import {
  Image as ImageIcon,
  Sparkles,
  RotateCcw,
  Check,
  Eye,
  EyeOff,
  Layers,
} from 'lucide-react';

export const AdminBannersView: React.FC = () => {
  const { lang } = useAdminBridge();
  const {
    controls,
    updateControl,
    toggleVisibility,
    trendItems,
    updateTrendItem,
    resetTrendsToDefault,
  } = useSiteControls();

  const isAr = lang === 'ar';
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-6 start-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-emerald-950 border border-emerald-500/50 text-emerald-300 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 end-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">
                  {isAr ? 'البانرات واستوديو وسائط المتجر والمقاسات' : 'Banners, Media & Specs Studio'}
                </h1>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  {isAr ? 'دقة فائقة' : 'Ultra High-Res'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {isAr
                  ? 'تعديل خلفيات البنرات الرئيسية، بطاقات التريندات، ونصوص الترويسة مع دليل المقاسات الهندسية الدقيقة.'
                  : 'Customize hero backdrops, seasonal trend cards, and headline banners with strict aspect ratio guides.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (window.confirm(isAr ? 'هل تريد استعادة التريندات الافتراضية؟' : 'Reset trend items?')) {
                resetTrendsToDefault();
                showToast(isAr ? 'تمت استعادة التريندات' : 'Trends reset');
              }
            }}
            className="px-3.5 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isAr ? 'استعادة التريندات' : 'Reset Trends'}</span>
          </button>
        </div>
      </div>

      {/* High-Fashion Image Dimensions Specification Guide */}
      <div className="bg-gradient-to-b from-amber-500/10 via-slate-900 to-slate-950 border border-amber-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-2 text-amber-400 mb-3">
          <Sparkles className="w-5 h-5" />
          <h2 className="text-sm font-bold uppercase tracking-wider">
            {isAr ? 'دليل المقاسات والأبعاد المثالية للصور (Image Dimension Specifications)' : 'Master Image Sizing & Specs'}
          </h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          {isAr
            ? 'لضمان ظهور الصور بأعلى نقاوة وفخامة معمارية دون تشويه أو اقتصاص غير مرغوب، يرجى الالتزام بالأبعاد التالية عند تصميم أو اختيار الصور:'
            : 'Adhere to recommended resolutions for pristine editorial reproduction:'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white">{isAr ? 'خلفية البنر الترحيبي' : 'Hero Backdrop'}</span>
              <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">1920 × 600 px</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">16:5 (أفقي بانورامي)</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white">{isAr ? 'كروت تريندات 2026' : 'Trend Cards'}</span>
              <span className="text-[10px] font-mono text-indigo-400 font-bold bg-indigo-500/10 px-1.5 py-0.5 rounded">800 × 1000 px</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">4:5 (بورتريه أزياء)</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white">{isAr ? 'صورة المنتج الرئيسية' : 'Primary Product'}</span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">1200 × 1500 px</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">4:5 (عالي الدقة)</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white">{isAr ? 'صور الزوايا والتفاصيل' : 'Angles & Zoom'}</span>
              <span className="text-[10px] font-mono text-purple-400 font-bold bg-purple-500/10 px-1.5 py-0.5 rounded">1200 × 1500 px</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">4:5 أو 1:1</div>
          </div>
        </div>
      </div>

      {/* Card 1: Welcome Hero Banner Customizer */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-amber-400" />
              <span>{isAr ? 'البنر الترحيبي العريض (Hero Banner)' : 'Storefront Hero Banner'}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr ? 'تخصيص صورة خلفية الترويسة الرئيسية وعنوان الحملة' : 'Configure headline and wide backdrop image'}
            </p>
          </div>

          <button
            onClick={() => {
              toggleVisibility('banner_hero_visible');
              showToast(isAr ? 'تم تحديث ظهور البنر' : 'Toggled banner visibility');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
              controls['banner_hero_visible']?.visible
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-slate-800 border-slate-700 text-slate-500'
            }`}
          >
            {controls['banner_hero_visible']?.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{controls['banner_hero_visible']?.visible ? (isAr ? 'ظاهر للزبائن' : 'Visible') : (isAr ? 'مخفي' : 'Hidden')}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              {isAr ? 'العنوان الترويجي (عربي)' : 'Headline (Arabic)'}
            </label>
            <input
              type="text"
              value={controls['banner_hero_title']?.label_ar || ''}
              onChange={(e) => updateControl('banner_hero_title', { label_ar: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              {isAr ? 'العنوان الترويجي (إنجليزي)' : 'Headline (English)'}
            </label>
            <input
              type="text"
              value={controls['banner_hero_title']?.label_en || ''}
              onChange={(e) => updateControl('banner_hero_title', { label_en: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none focus:border-indigo-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              {isAr ? 'رابط صورة الخلفية (أو ارفع صورة مباشرة)' : 'Hero Backdrop Image URL'}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={controls['banner_hero_bg']?.actionValue || ''}
                onChange={(e) => updateControl('banner_hero_bg', { actionValue: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Live Hero Backdrop Preview */}
        {controls['banner_hero_bg']?.actionValue && (
          <div className="relative h-32 sm:h-44 rounded-xl overflow-hidden border border-slate-800">
            <img
              src={controls['banner_hero_bg'].actionValue}
              alt="Hero Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center p-4 text-center">
              <div>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest block mb-1">
                  {controls['banner_hero_tag']?.label_ar || 'ڤانت · كتالوج 2026'}
                </span>
                <h4 className="text-sm sm:text-base font-bold text-white">
                  {controls['banner_hero_title']?.label_ar || 'الصياغة المعمارية للأزياء'}
                </h4>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Card 2: Trend Items Studio */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>{isAr ? 'بطاقات تريندات وتصنيفات الموسم' : 'Seasonal Trends & Curations'}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr ? 'تخصيص صور وعناوين وتصنيفات بطاقات التريندات في الواجهة' : 'Edit images, category badges and headlines for trend highlights'}
            </p>
          </div>
          <span className="text-xs font-mono text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded">
            {trendItems.length} {isAr ? 'تريندات' : 'items'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {trendItems.map((item, idx) => (
            <div key={item.id || idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="relative h-40 rounded-lg overflow-hidden border border-slate-800">
                <img src={item.image} alt={item.titleAr} className="w-full h-full object-cover" />
                <span className="absolute top-2 start-2 px-2 py-0.5 rounded bg-black/75 text-[10px] font-bold text-amber-300 backdrop-blur-xs">
                  {item.tagAr}
                </span>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  {isAr ? 'العنوان بالعربية' : 'Arabic Title'}
                </label>
                <input
                  type="text"
                  value={item.titleAr || ''}
                  onChange={(e) => updateTrendItem(item.id, { titleAr: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  {isAr ? 'رابط الصورة' : 'Image URL'}
                </label>
                <input
                  type="text"
                  value={item.image || ''}
                  onChange={(e) => updateTrendItem(item.id, { image: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs font-mono outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminBannersView;
