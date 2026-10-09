import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Fingerprint, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { useAdminBridge } from './useAdminBridge';

export const LockScreen: React.FC = () => {
  const { isLocked, unlock, lang, currentStore } = useAdminBridge();
  const [pinInput, setPinInput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  const isAr = lang === 'ar';

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString(isAr ? 'ar-SA' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      );
      setCurrentDate(
        now.toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [isAr]);

  // Handle keyboard typing
  useEffect(() => {
    if (!isLocked) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        if (pinInput.length < 4) {
          const next = pinInput + e.key;
          setPinInput(next);
          if (next.length === 4) {
            verifyPin(next);
          }
        }
      } else if (e.key === 'Backspace') {
        setPinInput((prev) => prev.slice(0, -1));
        setError(null);
      } else if (e.key === 'Enter' && pinInput.length > 0) {
        verifyPin(pinInput);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLocked, pinInput]);

  const verifyPin = (candidate: string) => {
    const success = unlock(candidate);
    if (success) {
      setPinInput('');
      setError(null);
    } else {
      setError(isAr ? 'رمز PIN غير صحيح. جرب 1234' : 'Incorrect PIN. Try 1234');
      setTimeout(() => {
        setPinInput('');
      }, 600);
    }
  };

  const handleDigitClick = (digit: string) => {
    if (pinInput.length < 4) {
      const next = pinInput + digit;
      setPinInput(next);
      setError(null);
      if (next.length === 4) {
        verifyPin(next);
      }
    }
  };

  const handleClear = () => {
    setPinInput('');
    setError(null);
  };

  const handleBiometric = () => {
    // Simulated quick biometric
    unlock('1234');
  };

  if (!isLocked) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-2xl p-4 select-none animate-in fade-in duration-300">
      <div className="w-full max-w-sm flex flex-col items-center text-center">
        {/* Clock & Date */}
        <div className="mb-8">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-mono">
            {currentTime || '12:00'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">{currentDate}</p>
        </div>

        {/* Profile Card */}
        <div className="mb-6 flex flex-col items-center">
          <div className="relative mb-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-2xl font-bold text-white shadow-xl shadow-indigo-950 ring-4 ring-slate-800">
              F
            </div>
            <div className="absolute -bottom-1 -end-1 p-1 bg-amber-500 rounded-full text-slate-950 ring-2 ring-slate-900">
              <Lock className="w-3 h-3" />
            </div>
          </div>
          <h3 className="text-base font-bold text-white">{isAr ? 'فيصل المطيري' : 'Faisal Al-Mutairi'}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{currentStore}</p>
        </div>

        {/* PIN Indicators */}
        <div className="flex items-center gap-3 mb-6">
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pinInput.length > index;
            return (
              <div
                key={index}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                  isFilled
                    ? 'bg-indigo-400 scale-110 shadow-sm shadow-indigo-400/50'
                    : 'bg-slate-800 border border-slate-700'
                }`}
              />
            );
          })}
        </div>

        {/* Error notice */}
        {error ? (
          <div className="flex items-center gap-1.5 text-xs text-rose-400 mb-4 animate-bounce">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{error}</span>
          </div>
        ) : (
          <p className="text-xs text-slate-400 mb-4">
            {isAr ? 'أدخل رمز المرور لفتح لوحة التحكم (الافتراضي: 1234)' : 'Enter PIN to unlock (Default: 1234)'}
          </p>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 w-64 mb-6">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleDigitClick(digit)}
              className="h-13 rounded-2xl bg-slate-900 hover:bg-slate-800 active:bg-indigo-600 text-white text-xl font-semibold border border-slate-800 transition-all flex items-center justify-center shadow-sm cursor-pointer"
            >
              {digit}
            </button>
          ))}

          {/* Biometric simulation */}
          <button
            onClick={handleBiometric}
            className="h-13 rounded-2xl bg-slate-900/60 hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 text-xs font-medium border border-slate-800 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer"
            title={isAr ? 'الدخول السريع' : 'Quick Unlock'}
          >
            <Fingerprint className="w-5 h-5" />
            <span className="text-[10px]">{isAr ? 'بصمة' : 'Touch'}</span>
          </button>

          {/* 0 */}
          <button
            onClick={() => handleDigitClick('0')}
            className="h-13 rounded-2xl bg-slate-900 hover:bg-slate-800 active:bg-indigo-600 text-white text-xl font-semibold border border-slate-800 transition-all flex items-center justify-center shadow-sm cursor-pointer"
          >
            0
          </button>

          {/* Clear */}
          <button
            onClick={handleClear}
            className="h-13 rounded-2xl bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-medium border border-slate-800 transition-all flex items-center justify-center cursor-pointer"
          >
            {isAr ? 'مسح' : 'Clear'}
          </button>
        </div>

        {/* Unlock Button fallback */}
        <button
          onClick={() => verifyPin(pinInput || '1234')}
          className="text-xs text-indigo-400 hover:text-indigo-300 underline font-medium cursor-pointer"
        >
          {isAr ? 'فتح سريع بضغطة واحدة (1234)' : 'Quick Unlock (1234)'}
        </button>
      </div>
    </div>
  );
};
export default LockScreen;
