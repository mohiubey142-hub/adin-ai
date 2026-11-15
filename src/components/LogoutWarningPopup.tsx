// src/components/LogoutWarningPopup.tsx
import React from 'react';
import { LogOut, X } from 'lucide-react';

interface LogoutWarningPopupProps {
  isOpen: boolean;
  onConfirmLogout: () => void;
  onCancel: () => void;
}

const LogoutWarningPopup: React.FC<LogoutWarningPopupProps> = ({
  isOpen,
  onConfirmLogout,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-[400px] rounded-2xl bg-white shadow-[0_20px_70px_-15px_rgba(15,23,42,0.3)] overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="relative px-6 pt-6 pb-5">
          <button
            onClick={onCancel}
            aria-label="Close"
            className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all duration-150 active:scale-95"
          >
            <X size={16} strokeWidth={2.2} />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20 mb-4">
            <LogOut size={22} className="text-white" strokeWidth={2.4} />
          </div>

          <h2 className="text-[19px] font-bold text-slate-900 tracking-tight leading-tight">
            Sign out?
          </h2>
          <p className="text-[13px] text-slate-500 mt-1.5 leading-relaxed">
            Your data is safely stored in the cloud. You can sign back in anytime with your email and password.
          </p>
        </div>

        <div className="h-px bg-slate-100 mx-6" />

        <div className="px-6 pt-4 pb-6 space-y-2">
          <button
            onClick={onCancel}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white text-[13px] font-semibold shadow-md shadow-purple-600/20 hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
          >
            Cancel — stay logged in
          </button>
          <button
            onClick={onConfirmLogout}
            className="w-full py-2.5 rounded-xl text-red-600 hover:bg-red-50 text-[13px] font-semibold transition-all duration-150 active:scale-[0.98]"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutWarningPopup;