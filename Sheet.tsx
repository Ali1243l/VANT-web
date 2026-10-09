import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  side?: 'start' | 'end';
  widthClass?: string;
}

export const Sheet: React.FC<SheetProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  side = 'end',
  widthClass = 'max-w-2xl',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop with smooth fade-in */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over panel */}
      <div
        className={`fixed inset-y-0 ${
          side === 'end' ? 'end-0' : 'start-0'
        } flex max-w-full pointer-events-auto`}
      >
        <div
          className={`w-screen ${widthClass} bg-slate-900 border-x border-slate-800/90 shadow-2xl flex flex-col h-full z-10 animate-in duration-300 ease-out slide-in-from-right rtl:slide-in-from-left`}
        >
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-800/80 flex items-start justify-between bg-slate-900/95 backdrop-blur-md sticky top-0 z-10 shrink-0">
            <div className="space-y-1 pe-3">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">{title}</h2>
              {description && <p className="text-xs text-slate-400 leading-relaxed">{description}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              aria-label="Close panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-6 overscroll-contain scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-t border-slate-800/80 bg-slate-900/95 backdrop-blur-md sticky bottom-0 z-10 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 sm:gap-3 shrink-0">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Sheet;
