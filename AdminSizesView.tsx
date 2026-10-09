import React from 'react';
import { useAdminBridge } from './useAdminBridge';
import AdminSizesManager from '../components/AdminSizesManager';
import { Ruler, Sparkles } from 'lucide-react';

export const AdminSizesView: React.FC = () => {
  const { lang } = useAdminBridge();
  const isAr = lang === 'ar';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 end-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <Ruler className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">
                  {isAr ? 'دليل القياسات والمواصفات الهندسية' : 'Master Sizing & Fit Guidelines'}
                </h1>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                  {isAr ? 'مباشر للمتجر' : 'Live Storefront Sync'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {isAr
                  ? 'إدارة وتخصيص جداول المقاسات الدقيقة للصدر، الخصر، الطول، والكتف المعروضة للزبائن داخل المتجر.'
                  : 'Configure and calibrate chest, waist, length, and shoulder fit charts for all apparel pieces.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Sizes Manager Component */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 backdrop-blur-sm">
        <AdminSizesManager isAr={isAr} />
      </div>
    </div>
  );
};

export default AdminSizesView;
