import React, { useState } from 'react';
import { useAdminBridge } from './useAdminBridge';
import { useSiteControls } from '../context/SiteControlsContext';
import {
  KeyRound,
  ShieldCheck,
  Check,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const AdminSecurityView: React.FC = () => {
  const { lang, pin, setPin, lock } = useAdminBridge();
  const { setAdminPin: setContextPin } = useSiteControls();
  const isAr = lang === 'ar';

  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [showPins, setShowPins] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (currentPinInput !== pin) {
      setErrorMsg(isAr ? 'رمز PIN الحالي غير صحيح' : 'Current PIN is incorrect');
      return;
    }

    if (!newPinInput || newPinInput.length < 4) {
      setErrorMsg(isAr ? 'يجب أن يتكون رمز PIN الجديد من 4 خانات على الأقل' : 'New PIN must be at least 4 digits');
      return;
    }

    if (newPinInput !== confirmPinInput) {
      setErrorMsg(isAr ? 'تأكيد الرمز غير متطابق' : 'New PIN confirmation does not match');
      return;
    }

    setPin(newPinInput);
    setContextPin(newPinInput);
    setSuccessMsg(isAr ? 'تم تحديث رمز PIN الخاص بالإدارة بنجاح!' : 'Admin access PIN updated successfully!');
    setCurrentPinInput('');
    setNewPinInput('');
    setConfirmPinInput('');
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 end-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">
                {isAr ? 'الأمان وتغيير رمز مرور الإدارة' : 'Security & Master Access PIN'}
              </h1>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400">
                {isAr ? 'حماية مشفرة' : 'Encrypted Shield'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isAr
                ? 'تغيير رمز المرور والـ PIN الخاص بقفل ودخول لوحة إدارة دار ڤانت.'
                : 'Update your personal master authentication PIN for accessing the administrative portal.'}
            </p>
          </div>
        </div>
      </div>

      {/* PIN Change Form Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <form onSubmit={handleUpdatePin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              {isAr ? 'رمز PIN الحالي' : 'Current PIN'}
            </label>
            <input
              type={showPins ? 'text' : 'password'}
              value={currentPinInput}
              onChange={(e) => setCurrentPinInput(e.target.value)}
              placeholder="••••"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:border-rose-500 outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                {isAr ? 'رمز PIN الجديد' : 'New PIN'}
              </label>
              <input
                type={showPins ? 'text' : 'password'}
                value={newPinInput}
                onChange={(e) => setNewPinInput(e.target.value)}
                placeholder="••••"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:border-rose-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                {isAr ? 'تأكيد الرمز الجديد' : 'Confirm New PIN'}
              </label>
              <input
                type={showPins ? 'text' : 'password'}
                value={confirmPinInput}
                onChange={(e) => setConfirmPinInput(e.target.value)}
                placeholder="••••"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:border-rose-500 outline-none"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setShowPins(!showPins)}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {showPins ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showPins ? (isAr ? 'إخفاء الأرقام' : 'Hide Digits') : (isAr ? 'إظهار الأرقام' : 'Show Digits')}</span>
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="pt-3 flex items-center gap-3">
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-950 cursor-pointer"
            >
              {isAr ? 'حفظ وتحديث رمز الدخول' : 'Save & Update Master PIN'}
            </button>

            <button
              type="button"
              onClick={lock}
              className="px-4 py-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Lock className="w-4 h-4 text-amber-400" />
              <span>{isAr ? 'تجربة قفل الشاشة' : 'Lock Screen'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSecurityView;
