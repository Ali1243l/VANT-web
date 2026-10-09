import React from 'react';
import { useAdminBridge } from './useAdminBridge';
import AdminNewsletterManager from '../components/AdminNewsletterManager';
import { Gift, Sparkles } from 'lucide-react';

export const AdminWelcomeModalView: React.FC = () => {
  const { lang } = useAdminBridge();
  const isAr = lang === 'ar';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 end-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">
                  {isAr ? 'النافذة الترحيبية وقسيمة الخصم للزوار' : 'Welcome Modal & VIP Voucher Studio'}
                </h1>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  {isAr ? 'أوتوماتيكي للزوار الجدد' : 'New Visitor Automation'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {isAr
                  ? 'تخصيص النافذة المنبثقة الترحيبية، نسبة الخصم الممنوحة للزائر، كود الكوبون، ومدة الظهور.'
                  : 'Customize the luxury welcoming popup, initial voucher discount code, and appearance triggers.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Manager configured for welcome modal */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 backdrop-blur-sm">
        <AdminNewsletterManager lang={isAr ? 'ar' : 'en'} embedded={true} initialTab="welcome_settings" />
      </div>
    </div>
  );
};

export default AdminWelcomeModalView;
