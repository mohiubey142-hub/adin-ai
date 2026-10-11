// src/components/BackupReminderPopup.tsx
// ✅ Friendly, plain-text backup reminder
// ✅ Shown once when user first opens Skills section
// ✅ Optional actions: Download Backup ID, Set PIN
// ✅ Clear message: both ID + PIN are important, PIN is private
// ✅ No pressure, no login, just awareness

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
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-7 animate-[slideUp_300ms_cubic-bezier(0.4,0,0.2,1)]">

        {/* Close X */}
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
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-tight">
              Keep your work safe
            </h2>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-3 mb-6">
          <p className="text-sm text-slate-600 leading-relaxed">
            Your CVs and cover letters are saved <strong className="text-slate-800">privately in the cloud</strong> — nobody else can see them.
          </p>

          <p className="text-sm text-slate-600 leading-relaxed">
            To restore everything later (if you log out or switch devices), you'll need <strong className="text-slate-800">both</strong> your Backup ID and your PIN. So it's good to have both ready.
          </p>

          {/* PIN privacy note */}
          <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-amber-50 border border-amber-100">
            <KeyRound size={14} className="text-amber-600 flex-shrink-0 mt-0.5" strokeWidth={2.2} />
            <p className="text-xs text-amber-800 leading-relaxed">
              <strong>Never share your PIN</strong> with anyone. It's like a key to your account — keep it private, just for yourself.
            </p>
          </div>

          {/* Reassurance */}
          <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-100">
            <Shield size={13} className="text-slate-400 flex-shrink-0 mt-0.5" strokeWidth={2.2} />
            <p className="text-xs text-slate-500 leading-relaxed">
              <strong className="text-slate-700">Don't worry</strong> — this is optional. You can download your ID and set a PIN anytime later from your profile. Take your time.
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-2 mb-5">
          <button
            type="button"
            onClick={onDownloadId}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border-[1.5px] border-slate-200 hover:border-purple-300 hover:bg-purple-50 text-slate-700 hover:text-purple-700 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-500/15"
          >
            <Download size={16} strokeWidth={2.4} />
            <span>Download Backup ID</span>
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

        {/* Got it button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white text-sm font-semibold shadow-md shadow-purple-600/20 hover:shadow-lg hover:shadow-purple-600/30 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-500/30"
        >
          Got it, thanks
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