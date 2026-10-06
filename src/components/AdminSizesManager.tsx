import React, { useState } from 'react';
import {
  Ruler,
  Plus,
  Trash2,
  RotateCcw,
  Check,
  Edit2,
  Eye,
  Sliders,
  Sparkles,
  Info,
  Save,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useSiteControls } from '../context/SiteControlsContext';
import type { MasterSizeItem } from '../data/sizeGuide';

interface Props {
  isAr?: boolean;
}

export default function AdminSizesManager({ isAr = true }: Props) {
  const {
    masterSizes,
    updateMasterSize,
    addMasterSize,
    deleteMasterSize,
    toggleMasterSize,
    resetMasterSizesToDefault,
  } = useSiteControls();

  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<MasterSizeItem>>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Size Initial State
  const [newSize, setNewSize] = useState<Omit<MasterSizeItem, 'id'>>({
    size: '',
    height: '',
    weight: '',
    chest: '',
    waist: '',
    shoulder: '',
    length: '',
    note_ar: '',
    note_en: '',
    minHeight: 160,
    maxHeight: 185,
    minWeight: 55,
    maxWeight: 80,
    enabled: true,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleStartEdit = (sizeItem: MasterSizeItem) => {
    setEditingId(sizeItem.id);
    setEditForm({ ...sizeItem });
  };

  const handleSaveEdit = (id: string) => {
    if (!editForm.size?.trim()) {
      alert(isAr ? 'يرجى كتابة رمز أو اسم المقاس' : 'Please provide size label');
      return;
    }
    updateMasterSize(id, editForm);
    setEditingId(null);
    setEditForm({});
    showToast(isAr ? 'تم حفظ تعديلات المقاس بنجاح' : 'Size measurements updated successfully');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleCreateNewSize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSize.size.trim()) {
      alert(isAr ? 'يرجى إدخال رمز المقاس (مثال: 3XL)' : 'Please enter size name (e.g. 3XL)');
      return;
    }

    addMasterSize({
      ...newSize,
      size: newSize.size.trim().toUpperCase(),
      height: newSize.height || '175 - 185 سم',
      weight: newSize.weight || '80 - 95 كغم',
      note_ar: newSize.note_ar || 'قصة متناسقة ومريحة',
      note_en: newSize.note_en || 'Tailored relaxed cut',
    });

    setIsAddModalOpen(false);
    setNewSize({
      size: '',
      height: '',
      weight: '',
      chest: '',
      waist: '',
      shoulder: '',
      length: '',
      note_ar: '',
      note_en: '',
      minHeight: 160,
      maxHeight: 185,
      minWeight: 55,
      maxWeight: 80,
      enabled: true,
    });
    showToast(isAr ? 'تمت إضافة المقاس الجديد بنجاح' : 'New size added successfully');
  };

  const filteredSizes = masterSizes.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.size.toLowerCase().includes(q) ||
      s.height.toLowerCase().includes(q) ||
      s.weight.toLowerCase().includes(q) ||
      (s.chest && s.chest.toLowerCase().includes(q)) ||
      (s.note_ar && s.note_ar.includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 ltr:right-6 rtl:left-6 z-50 flex items-center gap-2 rounded-2xl bg-emerald-600 text-white px-4 py-3 shadow-xl backdrop-blur-md text-xs font-semibold animate-in fade-in slide-in-from-top-4">
          <Check className="h-4 w-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-[#004ad7]/20 border border-[#3b82f6]/30 flex items-center justify-center text-[#3b82f6]">
              <Ruler className="h-4 w-4" />
            </div>
            <span>{isAr ? 'التحكم الشامل بالمقاسات (الطول والوزن)' : 'Master Size Guide (Height & Weight)'}</span>
          </h2>
          <p className="text-xs text-white/60 mt-1 max-w-2xl leading-relaxed">
            {isAr
              ? 'تحكم جذري في كافة المقاسات المعروضة للزبائن (الطول والوزن المقترح فقط)، مع مزامنة فورية لحاسبة المقاسات التلقائية.'
              : 'Configure ready-to-wear sizing based exclusively on recommended height and weight.'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#004ad7] to-[#3b82f6] hover:from-[#003db3] hover:to-[#2563eb] px-3.5 py-2 text-xs font-bold text-white shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{isAr ? 'إضافة مقاس جديد' : 'Add New Size'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (confirm(isAr ? 'هل أنت متأكد من استعادة كافة المقاسات والأبعاد الافتراضية؟' : 'Reset all sizes to factory default standards?')) {
                resetMasterSizesToDefault();
                showToast(isAr ? 'تمت استعادة المقاسات الافتراضية بنجاح' : 'Reset to default sizes');
              }
            }}
            className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.04] hover:bg-white/10 px-3 py-2 text-xs font-semibold text-white/70 hover:text-white transition-all cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{isAr ? 'استعادة الافتراضي' : 'Reset Default'}</span>
          </button>
        </div>
      </div>

      {/* Info Notice Banner */}
      <div className="rounded-2xl border border-[#004ad7]/20 bg-[#004ad7]/[0.06] p-4 flex items-start gap-3">
        <Sparkles className="h-4 w-4 text-[#3b82f6] shrink-0 mt-0.5" />
        <div className="text-xs text-white/80 leading-relaxed space-y-1">
          <p className="font-semibold text-white">
            {isAr ? 'مزامنة فورية حية مع شيت تفاصيل المنتج وحاسبة المقاس التلقائية:' : 'Live real-time synchronization with product details & dynamic fit calculator:'}
          </p>
          <p className="text-white/60">
            {isAr
              ? 'أي تعديل على أرقام الطول أو الوزن يظهر فوراً في جدول القياسات التفاعلي للزبائن، ويتم اعتماده مباشرة في حاسبة المقاسات الذكية المقترحة.'
              : 'Every numerical edit to height or weight boundaries instantly updates in the size table and smart fit recommender.'}
          </p>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/[0.025] border border-white/10 rounded-2xl p-3">
        <div className="relative flex-1 min-w-[220px]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAr ? 'بحث في المقاسات أو الأرقام...' : 'Search sizes or numbers...'}
            className="h-9 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-xs text-white placeholder-white/40 outline-none focus:border-[#3b82f6]"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowLivePreview(!showLivePreview)}
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
            showLivePreview
              ? 'border-[#3b82f6]/40 bg-[#004ad7]/15 text-[#60a5fa]'
              : 'border-white/10 bg-white/[0.03] text-white/60 hover:text-white'
          }`}
        >
          <Eye className="h-3.5 w-3.5" />
          <span>{isAr ? (showLivePreview ? 'إخفاء معاينة الزبون' : 'عرض معاينة الزبون') : 'Toggle Customer Preview'}</span>
        </button>
      </div>

      {/* LIVE CUSTOMER SIZING TABLE PREVIEW (Architectural Lookbook Style) */}
      {showLivePreview && (
        <div className="rounded-3xl border border-white/15 bg-gradient-to-b from-[#161a23] to-[#0f1218] p-5 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {isAr ? 'معاينة مباشرة: كيف يرى الزبائن جدول القياسات والأرقام' : 'Live Preview: Customer Sizing Matrix'}
              </span>
            </div>
            <span className="text-[11px] text-white/40 font-mono">
              {masterSizes.filter((s) => s.enabled).length} {isAr ? 'مقاسات نشطة' : 'Active Sizes'}
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/40">
            <table className="w-full text-center text-xs">
              <thead>
                <tr className="border-b border-white/10 text-white/60 bg-white/[0.03]">
                  <th className="py-2.5 px-3 font-semibold text-start">{isAr ? 'المقاس' : 'Size'}</th>
                  <th className="py-2.5 px-3 font-semibold">{isAr ? 'الطول المقترح' : 'Height'}</th>
                  <th className="py-2.5 px-3 font-semibold">{isAr ? 'الوزن المقترح' : 'Weight'}</th>
                  <th className="py-2.5 px-3 font-semibold text-end">{isAr ? 'الحالة' : 'Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {masterSizes.map((row) => (
                  <tr
                    key={row.id}
                    className={`transition-colors ${
                      row.enabled ? 'text-white hover:bg-white/[0.04]' : 'text-white/30 bg-black/30'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-bold text-start text-sm font-sans text-[#3b82f6]">
                      {row.size}
                    </td>
                    <td className="py-2.5 px-3 tabular-nums">{row.height || '—'}</td>
                    <td className="py-2.5 px-3 tabular-nums">{row.weight || '—'}</td>
                    <td className="py-2.5 px-3 text-end font-sans">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          row.enabled
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-white/10 text-white/40'
                        }`}
                      >
                        {row.enabled ? (isAr ? 'مفعّل' : 'Active') : (isAr ? 'معطّل' : 'Disabled')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SIZES EDITABLE CARDS LIST */}
      <div className="space-y-3.5">
        {filteredSizes.map((item) => {
          const isEditing = editingId === item.id;

          return (
            <div
              key={item.id}
              className={`rounded-2xl border transition-all p-4 ${
                isEditing
                  ? 'border-[#004ad7] bg-[#121620] shadow-xl'
                  : 'border-white/10 bg-white/[0.025] hover:bg-white/[0.04]'
              }`}
            >
              {!isEditing ? (
                /* READ-ONLY CARD ROW */
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-[120px]">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#004ad7] to-[#3b82f6] text-white font-extrabold text-sm shadow-md">
                      {item.size}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{isAr ? `مقاس (${item.size})` : `Size (${item.size})`}</span>
                        <span
                          className={`rounded-full px-2 py-0.2 text-[9px] font-semibold border ${
                            item.enabled
                              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                              : 'bg-white/5 border-white/10 text-white/40'
                          }`}
                        >
                          {item.enabled ? (isAr ? 'متاح بالمتجر' : 'Active in Store') : (isAr ? 'معطّل' : 'Hidden')}
                        </span>
                      </h4>
                      <p className="text-[11px] text-white/55 mt-0.5 line-clamp-1">
                        {isAr ? item.note_ar || 'قصة مريحة متناسقة' : item.note_en || 'Refined silhouette'}
                      </p>
                    </div>
                  </div>

                  {/* Numbers Grid Summary (Only Height & Weight) */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono max-w-xs">
                    <div className="rounded-xl border border-white/8 bg-black/30 p-2">
                      <span className="text-[10px] text-white/45 block font-sans">{isAr ? 'الطول' : 'Height'}</span>
                      <span className="text-white font-bold text-[11.5px] truncate block">{item.height}</span>
                    </div>

                    <div className="rounded-xl border border-white/8 bg-black/30 p-2">
                      <span className="text-[10px] text-white/45 block font-sans">{isAr ? 'الوزن' : 'Weight'}</span>
                      <span className="text-white font-bold text-[11.5px] truncate block">{item.weight}</span>
                    </div>
                  </div>

                  {/* Actions Buttons */}
                  <div className="flex items-center gap-1.5 self-end md:self-auto shrink-0">
                    {/* Toggle Active Button */}
                    <button
                      type="button"
                      onClick={() => toggleMasterSize(item.id)}
                      className={`flex h-8 px-2.5 items-center gap-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        item.enabled
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                          : 'border-white/10 bg-black/40 text-white/40 hover:text-white'
                      }`}
                      title={isAr ? 'تفعيل أو تعطيل المقاس' : 'Toggle Size'}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${item.enabled ? 'bg-emerald-400' : 'bg-white/30'}`} />
                      <span>{item.enabled ? (isAr ? 'متاح' : 'Enabled') : (isAr ? 'معطّل' : 'Disabled')}</span>
                    </button>

                    {/* Edit Button */}
                    <button
                      type="button"
                      onClick={() => handleStartEdit(item)}
                      className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/15 bg-white/[0.05] hover:bg-[#004ad7] text-white transition-all cursor-pointer shadow-xs"
                      title={isAr ? 'تعديل الأرقام والبيانات' : 'Edit Measurements'}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>

                    {/* Delete Custom Size Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(isAr ? `هل أنت متأكد من حذف مقاس (${item.size})؟` : `Delete size (${item.size})?`)) {
                          deleteMasterSize(item.id);
                          showToast(isAr ? 'تم حذف المقاس' : 'Size removed');
                        }
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white transition-all cursor-pointer shadow-xs"
                      title={isAr ? 'حذف المقاس' : 'Delete Size'}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                /* INLINE EDIT FORM */
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-xs font-bold text-[#3b82f6] flex items-center gap-1.5">
                      <Edit2 className="h-3.5 w-3.5" />
                      <span>{isAr ? `تعديل أبعاد ومقاسات (${item.size}):` : `Edit Size Measurements (${item.size}):`}</span>
                    </span>

                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="text-white/40 hover:text-white cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Size Symbol */}
                    <div>
                      <label className="text-[11px] font-semibold text-white/70 block mb-1">
                        {isAr ? 'رمز المقاس (مثال: S, M, 3XL)' : 'Size Code'}
                      </label>
                      <input
                        type="text"
                        value={editForm.size || ''}
                        onChange={(e) => setEditForm({ ...editForm, size: e.target.value.toUpperCase() })}
                        className="h-9 w-full rounded-xl border border-white/15 bg-black/50 px-3 text-xs text-white outline-none focus:border-[#3b82f6]"
                      />
                    </div>

                    {/* Height Range */}
                    <div>
                      <label className="text-[11px] font-semibold text-white/70 block mb-1">
                        {isAr ? 'مدى الطول المقترح (مثال: 173 - 178 سم)' : 'Height Range'}
                      </label>
                      <input
                        type="text"
                        value={editForm.height || ''}
                        onChange={(e) => setEditForm({ ...editForm, height: e.target.value })}
                        placeholder="173 - 178 سم"
                        className="h-9 w-full rounded-xl border border-white/15 bg-black/50 px-3 text-xs text-white outline-none focus:border-[#3b82f6]"
                      />
                    </div>

                    {/* Weight Range */}
                    <div>
                      <label className="text-[11px] font-semibold text-white/70 block mb-1">
                        {isAr ? 'مدى الوزن المقترح (مثال: 66 - 75 كغم)' : 'Weight Range'}
                      </label>
                      <input
                        type="text"
                        value={editForm.weight || ''}
                        onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })}
                        placeholder="66 - 75 كغم"
                        className="h-9 w-full rounded-xl border border-white/15 bg-black/50 px-3 text-xs text-white outline-none focus:border-[#3b82f6]"
                      />
                    </div>
                  </div>

                  {/* Min / Max Weight Calculator Bounds */}
                  <div className="p-3 rounded-2xl bg-black/30 border border-white/10 space-y-2">
                    <span className="text-[11px] font-semibold text-[#3b82f6] block">
                      {isAr ? 'حدود حاسبة القياس التلقائية (الأطوال والأوزان):' : 'Fit Calculator Ranges:'}
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div>
                        <label className="text-[10px] text-white/50 block mb-1">
                          {isAr ? 'أدنى طول (سم)' : 'Min Height (cm)'}
                        </label>
                        <input
                          type="number"
                          value={editForm.minHeight ?? 160}
                          onChange={(e) => setEditForm({ ...editForm, minHeight: parseInt(e.target.value, 10) || 150 })}
                          className="h-8 w-full rounded-lg border border-white/15 bg-black/50 px-2 text-xs text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-white/50 block mb-1">
                          {isAr ? 'أعلى طول (سم)' : 'Max Height (cm)'}
                        </label>
                        <input
                          type="number"
                          value={editForm.maxHeight ?? 185}
                          onChange={(e) => setEditForm({ ...editForm, maxHeight: parseInt(e.target.value, 10) || 190 })}
                          className="h-8 w-full rounded-lg border border-white/15 bg-black/50 px-2 text-xs text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-white/50 block mb-1">
                          {isAr ? 'أدنى وزن (كغم)' : 'Min Weight (kg)'}
                        </label>
                        <input
                          type="number"
                          value={editForm.minWeight ?? 50}
                          onChange={(e) => setEditForm({ ...editForm, minWeight: parseInt(e.target.value, 10) || 40 })}
                          className="h-8 w-full rounded-lg border border-white/15 bg-black/50 px-2 text-xs text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-white/50 block mb-1">
                          {isAr ? 'أعلى وزن (كغم)' : 'Max Weight (kg)'}
                        </label>
                        <input
                          type="number"
                          value={editForm.maxWeight ?? 80}
                          onChange={(e) => setEditForm({ ...editForm, maxWeight: parseInt(e.target.value, 10) || 90 })}
                          className="h-8 w-full rounded-lg border border-white/15 bg-black/50 px-2 text-xs text-white outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Fit Note */}
                  <div>
                    <label className="text-[11px] font-semibold text-white/70 block mb-1">
                      {isAr ? 'وصف القصة والملاءمة (يظهر للزبون عند اختيار المقاس)' : 'Fit Silhouette Note'}
                    </label>
                    <input
                      type="text"
                      value={editForm.note_ar || ''}
                      onChange={(e) => setEditForm({ ...editForm, note_ar: e.target.value })}
                      placeholder="المقاس الأكثر توازناً، يمنحك مظهراً راقياً ومريحاً"
                      className="h-9 w-full rounded-xl border border-white/15 bg-black/50 px-3 text-xs text-white outline-none focus:border-[#3b82f6]"
                    />
                  </div>

                  {/* Save or Cancel */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-white/70 hover:text-white cursor-pointer"
                    >
                      {isAr ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(item.id)}
                      className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#004ad7] to-[#3b82f6] px-4 py-2 text-xs font-bold text-white shadow-md active:scale-95 cursor-pointer"
                    >
                      <Save className="h-3.5 w-3.5" />
                      <span>{isAr ? 'حفظ التعديلات' : 'Save Changes'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ADD NEW SIZE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-xl rounded-3xl border border-white/15 bg-[#121620] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="h-4 w-4 text-[#3b82f6]" />
                <span>{isAr ? 'إضافة مقاس جديد للتشكيلة' : 'Add New Ready-to-Wear Size'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-white/40 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewSize} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-white/80 block mb-1">
                    {isAr ? 'رمز المقاس (مثال: 3XL أو OVERSIZED)' : 'Size Name / Code'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newSize.size}
                    onChange={(e) => setNewSize({ ...newSize, size: e.target.value.toUpperCase() })}
                    placeholder="3XL"
                    className="h-10 w-full rounded-xl border border-white/15 bg-black/50 px-3 text-xs text-white outline-none focus:border-[#3b82f6]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-white/80 block mb-1">
                    {isAr ? 'مدى الطول المقترح' : 'Height Range'}
                  </label>
                  <input
                    type="text"
                    value={newSize.height}
                    onChange={(e) => setNewSize({ ...newSize, height: e.target.value })}
                    placeholder="195 - 210 سم"
                    className="h-10 w-full rounded-xl border border-white/15 bg-black/50 px-3 text-xs text-white outline-none focus:border-[#3b82f6]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-white/80 block mb-1">
                    {isAr ? 'مدى الوزن المقترح' : 'Weight Range'}
                  </label>
                  <input
                    type="text"
                    value={newSize.weight}
                    onChange={(e) => setNewSize({ ...newSize, weight: e.target.value })}
                    placeholder="110 - 125 كغم"
                    className="h-10 w-full rounded-xl border border-white/15 bg-black/50 px-3 text-xs text-white outline-none focus:border-[#3b82f6]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-white/80 block mb-1">
                  {isAr ? 'وصف القصة (بالعربية)' : 'Fit Description (Arabic)'}
                </label>
                <input
                  type="text"
                  value={newSize.note_ar}
                  onChange={(e) => setNewSize({ ...newSize, note_ar: e.target.value })}
                  placeholder="قصة رحبة جداً للأطوال والأوزان العالية"
                  className="h-10 w-full rounded-xl border border-white/15 bg-black/50 px-3 text-xs text-white outline-none focus:border-[#3b82f6]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-white/70 hover:text-white cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#004ad7] to-[#3b82f6] px-5 py-2 text-xs font-bold text-white shadow-md active:scale-95 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{isAr ? 'إضافة المقاس وتثبيته' : 'Save & Publish Size'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
