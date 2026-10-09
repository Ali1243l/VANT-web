import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useAdminBridge } from './useAdminBridge';
import { Nav } from './Nav';

export interface AdminDrawerProps {
  onClose?: () => void;
}

export const AdminDrawer: React.FC<AdminDrawerProps> = ({ onClose }) => {
  const { isDrawerOpen, setIsDrawerOpen, lang } = useAdminBridge();
  const isAr = lang === 'ar';

  const handleClose = () => {
    setIsDrawerOpen(false);
    if (onClose) onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        handleClose();
      }
    };
    if (isDrawerOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDrawerOpen]);

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden lg:hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Drawer content panel */}
      <div
        className={`fixed inset-y-0 ${
          isAr ? 'right-0' : 'left-0'
        } max-w-xs w-full bg-slate-900 border-${
          isAr ? 'l' : 'r'
        } border-slate-800 shadow-2xl flex flex-col z-50 transform transition-transform duration-300 ease-out`}
      >
        {/* Mobile close button header */}
        <div className="absolute top-4 end-4 z-20">
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer navigation */}
        <div className="flex-1 overflow-y-auto">
          <Nav onItemClick={handleClose} collapsed={false} />
        </div>
      </div>
    </div>
  );
};
export default AdminDrawer;
