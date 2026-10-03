import React, { useState } from 'react';
import {
  Globe,
  Plus,
  Trash2,
  CheckCircle2,
  Search,
  MoveUp,
  MoveDown,
  Edit2,
  ExternalLink,
  Sparkles,
  Link as LinkIcon,
  RotateCcw,
  Layers,
  Save,
  X,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useSiteControls } from '../context/SiteControlsContext';
import { PRESET_SOCIAL_PLATFORMS, type FooterSocialLink, type SocialPlatformItem } from '../data/socialPlatforms';
import SocialIconRenderer from './SocialIconRenderer';

interface Props {
  isAr?: boolean;
}

const AVAILABLE_ICONS = [
  'Globe',
  'Instagram',
  'Pinterest',
  'TikTok',
  'Twitter',
  'Facebook',
  'Threads',
  'Youtube',
  'Linkedin',
  'Reddit',
  'Discord',
  'Telegram',
  'WhatsApp',
  'Phone',
  'Mail',
  'MapPin',
  'Star',
  'Sparkles',
  'Crown',
  'ShoppingBag',
  'Tag',
  'ShieldCheck',
  'TrendingUp',
  'Heart',
  'Palette',
  'Camera',
  'Github',
  'Music',
  'Radio',
  'Headphones',
  'Tv',
  'Film',
  'Book',
];

export default function SocialLinksManager({ isAr = true }: Props) {
  const {
    socialLinks,
    updateSocialLink,
    addSocialLink,
    removeSocialLink,
    toggleSocialLinkActive,
    reorderSocialLinks,
    resetSocialLinksToDefault,
  } = useSiteControls();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);

  // Custom link form state
  const [customName, setCustomName] = useState('');
  const [customHandle, setCustomHandle] = useState('');
  const [customHref, setCustomHref] = useState('');
  const [customIcon, setCustomIcon] = useState('Globe');

  // Filter 60+ Preset Platforms
  const filteredPresets = PRESET_SOCIAL_PLATFORMS.filter((platform) => {
    const matchesCategory = selectedCategory === 'all' || platform.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      platform.name.toLowerCase().includes(query) ||
      platform.name_ar.includes(query) ||
      platform.defaultHandle.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  // Check if a platform is already in active links
  const isPlatformAdded = (platformId: string) => {
    return socialLinks.some((l) => l.platformId === platformId || l.id === platformId);
  };

  // Add platform from presets
  const handleAddPreset = (platform: SocialPlatformItem) => {
    if (isPlatformAdded(platform.id)) return;

    const newLink: FooterSocialLink = {
      id: `link_${platform.id}_${Date.now()}`,
      platformId: platform.id,
      name: platform.name,
      handle: platform.defaultHandle,
      href: platform.defaultUrl,
      iconName: platform.iconName,
      isActive: true,
      displayOrder: socialLinks.length + 1,
    };

    addSocialLink(newLink);
  };

  // Handle saving new custom link
  const handleSaveCustomLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customHref.trim()) return;

    const newLink: FooterSocialLink = {
      id: `custom_link_${Date.now()}`,
      name: customName.trim(),
      handle: customHandle.trim() || customName.trim(),
      href: customHref.trim(),
      iconName: customIcon,
      isActive: true,
      displayOrder: socialLinks.length + 1,
    };

    addSocialLink(newLink);
    setIsCustomModalOpen(false);
    setCustomName('');
    setCustomHandle('');
    setCustomHref('');
    setCustomIcon('Globe');
  };

  // Move Link
  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= socialLinks.length) return;

    const reordered = [...socialLinks];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    reorderSocialLinks(reordered);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Globe className="h-5 w-5 text-[#3b82f6]" />
            <span>{isAr ? 'إدارة روابط وحسابات التواصل والمنصات العالمية' : 'Social Platforms & Global Links'}</span>
          </h2>
          <p className="text-xs text-white/50 mt-0.5">
            {isAr
              ? 'تخصيص كامل للروابط الظاهرة في الفوتر، تفعيل من أكثر من 60 منصة عالمية أو إضافة روابط مخصصة'
              : 'Manage footer links: pick from 60+ luxury & global platforms or add custom websites'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Add Custom Link Button */}
          <button
            type="button"
            onClick={() => setIsCustomModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 text-xs font-bold text-white shadow-md transition-all cursor-pointer active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>{isAr ? 'إضافة موقع مخصص' : 'Add Custom Link'}</span>
          </button>

          {/* Reset to Default */}
          <button
            type="button"
            onClick={() => {
              if (confirm(isAr ? 'هل تريد استعادة الروابط الافتراضية؟' : 'Reset to default footer links?')) {
                resetSocialLinksToDefault();
              }
            }}
            className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.05] hover:bg-white/10 px-3 py-2 text-xs font-semibold text-white/70 hover:text-white transition-all cursor-pointer"
            title={isAr ? 'استعادة الروابط الافتراضية' : 'Reset defaults'}
          >
            <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">{isAr ? 'استعادة الافتراضي' : 'Reset'}</span>
          </button>
        </div>
      </div>

      {/* 1. CURRENTLY ACTIVE FOOTER LINKS (REORDERABLE & EDITABLE) */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-4 sm:p-6 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              {isAr ? 'الروابط المعروضة حالياً في الفوتر' : 'Active Links in Footer'}
            </h3>
            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.2 text-[10px] font-mono font-bold text-emerald-300">
              {socialLinks.filter((l) => l.isActive).length} {isAr ? 'نشط' : 'Active'}
            </span>
          </div>

          <span className="text-[11px] text-white/40">
            {isAr ? 'يمكنك تعديل الاسم والرابط وإعادة الترتيب' : 'Drag or click arrows to reorder'}
          </span>
        </div>

        {socialLinks.length === 0 ? (
          <div className="py-8 text-center border border-dashed border-white/15 rounded-2xl">
            <Globe className="h-8 w-8 text-white/20 mx-auto mb-2" />
            <p className="text-xs text-white/50">{isAr ? 'لا توجد روابط مضافة حالياً. اختر من الدليل بالأسفل أو أضف رابطاً مخصصاً.' : 'No active links. Add platforms below.'}</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {socialLinks.map((link, index) => {
              const isEditing = editingLinkId === link.id;

              return (
                <div
                  key={link.id}
                  className={`rounded-2xl border p-3.5 transition-all ${
                    link.isActive
                      ? 'border-white/15 bg-black/40 hover:border-white/25'
                      : 'border-white/5 bg-white/[0.01] opacity-60'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Left: Icon, Name & Handle */}
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.07] border border-white/10 text-white shadow-xs">
                        <SocialIconRenderer iconName={link.iconName} customSvg={link.customIconSvg} className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white truncate">{link.name}</span>
                          <span className="rounded-md bg-white/[0.06] px-1.5 py-0.2 text-[10px] font-mono text-[#3b82f6] direction-ltr">
                            {link.handle}
                          </span>
                        </div>
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-white/50 hover:text-white flex items-center gap-1 mt-0.5 truncate max-w-sm direction-ltr"
                        >
                          <span className="truncate">{link.href}</span>
                          <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                        </a>
                      </div>
                    </div>

                    {/* Right: Actions (Toggle Active, Move, Edit, Delete) */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      {/* Toggle Visibility */}
                      <button
                        type="button"
                        onClick={() => toggleSocialLinkActive(link.id)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          link.isActive
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                            : 'border-white/10 bg-white/[0.03] text-white/40'
                        }`}
                        title={link.isActive ? (isAr ? 'إخفاء من الفوتر' : 'Hide') : (isAr ? 'إظهار في الفوتر' : 'Show')}
                      >
                        {link.isActive ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      </button>

                      {/* Move Up */}
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => handleMove(index, 'up')}
                          className="p-1.5 rounded-lg border border-white/10 bg-black/40 text-white/70 hover:text-white hover:bg-black cursor-pointer"
                          title={isAr ? 'تحريك لأعلى' : 'Move Up'}
                        >
                          <MoveUp className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {/* Move Down */}
                      {index < socialLinks.length - 1 && (
                        <button
                          type="button"
                          onClick={() => handleMove(index, 'down')}
                          className="p-1.5 rounded-lg border border-white/10 bg-black/40 text-white/70 hover:text-white hover:bg-black cursor-pointer"
                          title={isAr ? 'تحريك لأسفل' : 'Move Down'}
                        >
                          <MoveDown className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => setEditingLinkId(isEditing ? null : link.id)}
                        className="p-1.5 rounded-lg border border-white/10 bg-white/[0.05] text-white/70 hover:text-white hover:bg-white/10 cursor-pointer"
                        title={isAr ? 'تعديل المعرف أو الرابط' : 'Edit'}
                      >
                        <Edit2 className="h-3.5 w-3.5 text-cyan-400" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => removeSocialLink(link.id)}
                        className="p-1.5 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 cursor-pointer"
                        title={isAr ? 'حذف الرابط' : 'Delete'}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Inline Edit Form when Open */}
                  {isEditing && (
                    <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[10px] text-white/60 block mb-0.5">{isAr ? 'المعرف الظاهر (Handle):' : 'Display Handle:'}</label>
                        <input
                          type="text"
                          value={link.handle}
                          onChange={(e) => updateSocialLink(link.id, { handle: e.target.value })}
                          className="h-8 w-full rounded-lg border border-white/15 bg-black/50 px-2 text-xs text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-white/60 block mb-0.5">{isAr ? 'الرابط المباشر (URL):' : 'Direct URL:'}</label>
                        <input
                          type="text"
                          value={link.href}
                          onChange={(e) => updateSocialLink(link.id, { href: e.target.value })}
                          className="h-8 w-full rounded-lg border border-white/15 bg-black/50 px-2 text-xs text-white outline-none direction-ltr"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. PRESET PLATFORMS DIRECTORY (60+ PLATFORMS) */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-4 sm:p-6 backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>{isAr ? 'دليل المنصات والمواقع العالمية (أكثر من 60 منصة جاهزة)' : 'Global Platforms Library (60+ Presets)'}</span>
            </h3>
            <p className="text-[11px] text-white/50 mt-0.5">
              {isAr ? 'انقر على أي منصة لإضافتها مباشرة إلى فوتر الموقع وتخصيصها' : 'Click to instantly add any platform to your footer'}
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'بحث في المنصات...' : 'Search platforms...'}
              className="h-9 w-full rounded-xl border border-white/15 bg-black/40 ltr:pl-9 ltr:pr-3 rtl:pr-9 rtl:pl-3 text-xs text-white outline-none focus:border-[#3b82f6]"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5 pb-1">
          {[
            { id: 'all', label_ar: 'الكل (68+)', label_en: 'All (68+)' },
            { id: 'social', label_ar: 'شبكات التواصل', label_en: 'Social Media' },
            { id: 'contact', label_ar: 'تواصل مباشر و VIP', label_en: 'Direct & VIP' },
            { id: 'fashion_media', label_ar: 'إعلام وأزياء', label_en: 'Fashion Media' },
            { id: 'luxury_ecommerce', label_ar: 'متاجر وبوتيكات', label_en: 'E-Commerce' },
            { id: 'creative', label_ar: 'فنون وتصميم', label_en: 'Creative & Design' },
            { id: 'music_media', label_ar: 'موسيقى وبودكاست', label_en: 'Audio & Music' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#004ad7] text-white shadow-xs'
                  : 'bg-black/30 border border-white/10 text-white/60 hover:text-white'
              }`}
            >
              {isAr ? cat.label_ar : cat.label_en}
            </button>
          ))}
        </div>

        {/* Platforms Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-96 overflow-y-auto pr-1">
          {filteredPresets.map((platform) => {
            const added = isPlatformAdded(platform.id);

            return (
              <div
                key={platform.id}
                className={`flex items-center justify-between gap-2 p-2.5 rounded-xl border transition-all ${
                  added
                    ? 'border-emerald-500/40 bg-emerald-500/[0.07]'
                    : 'border-white/10 bg-black/40 hover:border-white/25 hover:bg-black/60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.08] text-white">
                    <SocialIconRenderer iconName={platform.iconName} className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white block truncate">{isAr ? platform.name_ar : platform.name}</span>
                    <span className="text-[10px] text-white/40 block truncate direction-ltr">{platform.defaultHandle}</span>
                  </div>
                </div>

                {added ? (
                  <span className="flex items-center gap-1 rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 shrink-0">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>{isAr ? 'مضاف' : 'Added'}</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleAddPreset(platform)}
                    className="flex items-center gap-1 rounded-md bg-[#004ad7] hover:bg-[#3b82f6] px-2 py-1 text-[10px] font-bold text-white shadow-xs transition-all cursor-pointer shrink-0 active:scale-95"
                  >
                    <Plus className="h-3 w-3" />
                    <span>{isAr ? 'إضافة' : 'Add'}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. ADD CUSTOM PLATFORM MODAL */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl border border-white/15 bg-[#12151e] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-emerald-400" />
                <span>{isAr ? 'إضافة منصة أو موقع مخصص' : 'Add Custom Platform'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCustomModalOpen(false)}
                className="text-white/60 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomLink} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-white/70 block mb-1">
                  {isAr ? 'اسم المنصة / الموقع' : 'Platform Name'} *
                </label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="مثال: متجر باريس الحصري"
                  className="h-10 w-full rounded-xl border border-white/15 bg-black/40 px-3 text-xs text-white outline-none focus:border-[#3b82f6]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-white/70 block mb-1">
                  {isAr ? 'المعرف الظاهر (Handle / Text)' : 'Display Handle / Text'} *
                </label>
                <input
                  type="text"
                  required
                  value={customHandle}
                  onChange={(e) => setCustomHandle(e.target.value)}
                  placeholder="@vant.exclusive / paris.boutique"
                  className="h-10 w-full rounded-xl border border-white/15 bg-black/40 px-3 text-xs text-white outline-none focus:border-[#3b82f6]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-white/70 block mb-1">
                  {isAr ? 'الرابط المباشر (URL)' : 'Destination URL'} *
                </label>
                <input
                  type="url"
                  required
                  value={customHref}
                  onChange={(e) => setCustomHref(e.target.value)}
                  placeholder="https://example.com/vant"
                  className="h-10 w-full rounded-xl border border-white/15 bg-black/40 px-3 text-xs text-white outline-none focus:border-[#3b82f6] direction-ltr"
                />
              </div>

              {/* Icon Selector */}
              <div>
                <label className="text-xs font-semibold text-white/70 block mb-1.5">
                  {isAr ? 'اختر أيقونة المنصة' : 'Select Platform Icon'}
                </label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 rounded-xl bg-black/40 border border-white/10">
                  {AVAILABLE_ICONS.map((iconName) => {
                    const isSelected = customIcon === iconName;
                    return (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setCustomIcon(iconName)}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 ring-2 ring-emerald-500/40'
                            : 'border-white/10 bg-white/[0.04] text-white/70 hover:text-white'
                        }`}
                        title={iconName}
                      >
                        <SocialIconRenderer iconName={iconName} className="h-4 w-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(false)}
                  className="rounded-xl border border-white/15 px-4 py-2 text-xs font-semibold text-white/70 hover:bg-white/10"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2 text-xs font-bold text-white shadow-md transition-all cursor-pointer"
                >
                  {isAr ? 'إضافة المنصة' : 'Add Platform'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
