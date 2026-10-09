import React from 'react';
import { useAdminBridge } from './useAdminBridge';
import SocialLinksManager from '../components/SocialLinksManager';
import { Globe, Share2 } from 'lucide-react';

export const AdminSocialView: React.FC = () => {
  const { lang } = useAdminBridge();
  const isAr = lang === 'ar';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 end-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">
                  {isAr ? 'روابط المنصات وقنوات التواصل الاجتماعي' : 'Social Platforms & Brand Channels'}
                </h1>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  {isAr ? 'الفوتر والترويسة' : 'Footer & Header Sync'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {isAr
                  ? 'إدارة حسابات المتجر الرسمية (إنستغرام، تيك توك، واتساب، تلغرام، سناب شات) وترتيب ظهورها في الفوتر والصفحات.'
                  : 'Manage official brand handles across Instagram, TikTok, WhatsApp, and Telegram with live drag/sort.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Social Links Manager Component */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 backdrop-blur-sm">
        <SocialLinksManager isAr={isAr} />
      </div>
    </div>
  );
};

export default AdminSocialView;
