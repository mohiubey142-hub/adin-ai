// src/components/BackupReminderPopup.tsx
// Plain, friendly backup reminder.
// Shown once when the user first opens the Skills section.
// Actions: Download User ID, Set PIN. Both are optional.
// Props and default export are unchanged.

import { Download, KeyRound, X, Shield } from 'lucide-react';

interface BackupReminderPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onDownloadId: () => void;
  onSetPin: () => void;
}

export default function BackupReminderPopup({
  isOpen,
  onClose,
  onDownloadId,
  onSetPin,
}: BackupReminderPopupProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-[fadeIn_200ms_ease-out]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="backup-reminder-title"
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-7 animate-[slideUp_300ms_cubic-bezier(0.4,0,0.2,1)]">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
          aria-label="Close"
        >
          <X size={18} strokeWidth={2} />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3 mb-5 pr-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center shadow-sm flex-shrink-0">
            <Shield size={18} className="text-white" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <h2
              id="backup-reminder-title"
              className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-tight"
            >
              Keep your work safe
            </h2>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-3 mb-6">
          <p className="text-sm text-slate-600 leading-relaxed">
            Your CVs and cover letters are saved privately in the cloud. To restore them on another
            device or after logging out, you need <strong className="text-slate-800">both</strong> your User ID and your PIN.
          </p>

          <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-amber-50 border border-amber-100">
            <KeyRound size={14} className="text-amber-600 flex-shrink-0 mt-0.5" strokeWidth={2.2} />
            <p className="text-xs text-amber-800 leading-relaxed">
              <strong>Never share your PIN.</strong> We cannot recover a lost PIN or User ID, so keep
              them somewhere safe.
            </p>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            There is no rush. You can download your User ID and set a PIN anytime from your profile.
            Without a PIN, your work cannot be restored on another device.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-2 mb-5">
          <button
            type="button"
            onClick={onDownloadId}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border-[1.5px] border-slate-200 hover:border-purple-300 hover:bg-purple-50 text-slate-700 hover:text-purple-700 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-500/15"
          >
            <Download size={16} strokeWidth={2.4} />
            <span>Download User ID</span>
          </button>

          <button
            type="button"
            onClick={onSetPin}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border-[1.5px] border-slate-200 hover:border-purple-300 hover:bg-purple-50 text-slate-700 hover:text-purple-700 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-500/15"
          >
            <KeyRound size={16} strokeWidth={2.4} />
            <span>Set 4-Digit PIN</span>
          </button>
        </div>

        {/* Dismiss */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white text-sm font-semibold shadow-md shadow-purple-600/20 hover:shadow-lg hover:shadow-purple-600/30 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-500/30"
        >
          Got it
        </button>
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}
