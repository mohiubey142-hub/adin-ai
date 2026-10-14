// src/components/LogoutWarningPopup.tsx
// ============================================
// Adin AI — Logout Warning Popup
// ============================================
// ✅ Modern, clean, minimal UI
// ✅ Same content as before — nothing removed
// ✅ Emphasizes: BOTH ID + PIN are important
// ✅ Download ID + Copy ID buttons
// ✅ If PIN is not set, shows a clear warning + reminder

import React, { useState } from 'react';
import { AlertTriangle, Copy, Check, Download, X, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

interface LogoutWarningPopupProps {
  isOpen: boolean;
  userId: string;
  hasPinSet?: boolean;
  onConfirmLogout: () => void;
  onCancel: () => void;
}

const LogoutWarningPopup: React.FC<LogoutWarningPopupProps> = ({
  isOpen,
  userId,
  hasPinSet = false,
  onConfirmLogout,
  onCancel,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        navigator.clipboard.writeText(userId);
      } else {
        const ta = document.createElement('textarea');
        ta.value = userId;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      toast.success('Copied!', { duration: 1500 });
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Copy failed');
    }
  };

  const handleDownload = () => {
    try {
      const content = `ADIN AI — YOUR ACCOUNT ID
==========================

Your ID: ${userId}

Keep this safe.

You'll need BOTH this ID and your 4-digit PIN to restore your
CVs and Cover Letters on any browser or device.

${!hasPinSet ? `⚠️ YOU HAVEN'T SET A PIN YET
Set it before logging out:
Profile → Set PIN
(Without a PIN, you won't be able to restore your data on
another device.)

` : ''}How to restore:
1. Open Adin AI on any device
2. Profile → "Restore from another device"
3. Enter your ID + PIN

Never share your PIN with anyone.

Generated: ${new Date().toLocaleString()}
`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'adin-ai-user-id.txt';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Downloaded', { duration: 1500 });
    } catch {
      toast.error('Download failed');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-[400px] rounded-2xl bg-white shadow-[0_20px_70px_-15px_rgba(15,23,42,0.3)] overflow-hidden animate-in zoom-in-95 duration-200">

        {/* ═══════ HEADER ═══════ */}
        <div className="relative px-6 pt-6 pb-5">
          <button
            onClick={onCancel}
            aria-label="Close"
            className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all duration-150 active:scale-95"
          >
            <X size={16} strokeWidth={2.2} />
          </button>

          {/* Icon — soft gradient square */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20 mb-4">
            <AlertTriangle size={22} className="text-white" strokeWidth={2.4} />
          </div>

          <h2 className="text-[19px] font-bold text-slate-900 tracking-tight leading-tight">
            Before you log out
          </h2>
          <p className="text-[13px] text-slate-500 mt-1.5 leading-relaxed">
            To log back in later, you'll need <strong className="text-slate-800 font-semibold">both</strong> your ID and your PIN. Save them now if you haven't.
          </p>
        </div>

        {/* ═══════ ID BOX ═══════ */}
        <div className="px-6 pb-4">
          <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3.5">
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                Your ID
              </span>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50 text-slate-700 hover:text-purple-700 text-[11px] font-semibold transition-all duration-150 active:scale-95"
              >
                {copied ? <Check size={11} strokeWidth={2.6} /> : <Copy size={11} strokeWidth={2.4} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="text-[15px] font-bold text-slate-900 font-mono tracking-wide select-all break-all">
              {userId}
            </div>
          </div>
        </div>

        {/* ═══════ PIN WARNING (only if not set) ═══════ */}
        {!hasPinSet && (
          <div className="px-6 pb-4">
            <div className="flex items-start gap-2.5 rounded-xl bg-amber-50/70 border border-amber-200/70 px-3.5 py-3">
              <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                <Lock size={13} className="text-amber-700" strokeWidth={2.4} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-semibold text-amber-900 leading-snug">
                  You haven't set a PIN yet.
                </p>
                <p className="text-[11px] text-amber-800/80 mt-0.5 leading-relaxed">
                  Set one before logging out → <strong className="font-bold">Profile → Set PIN</strong>
                </p>
                <p className="text-[10.5px] text-amber-700/70 mt-1 leading-relaxed">
                  Without a PIN, you won't be able to restore your data on another device.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ═══════ PIN REMINDER (always shown) ═══════ */}
        <div className="px-6 pb-5">
          <p className="text-[12px] text-slate-500 leading-relaxed">
            🔒 {hasPinSet ? (
              <>You'll also need your <strong className="text-slate-800 font-semibold">4-digit PIN</strong>. Never share it with anyone.</>
            ) : (
              <>You'll also need a <strong className="text-slate-800 font-semibold">4-digit PIN</strong> — set one before logging out.</>
            )}
          </p>
        </div>

        {/* ═══════ DOWNLOAD BUTTON ═══════ */}
        <div className="px-6 pb-5">
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-[12.5px] font-semibold transition-all duration-150 active:scale-[0.98]"
          >
            <Download size={14} strokeWidth={2.2} />
            <span>Download ID as .txt file</span>
          </button>
        </div>

        {/* ═══════ DIVIDER ═══════ */}
        <div className="h-px bg-slate-100 mx-6" />

        {/* ═══════ ACTIONS ═══════ */}
        <div className="px-6 pt-4 pb-6 space-y-2">
          <button
            onClick={onCancel}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white text-[13px] font-semibold shadow-md shadow-purple-600/20 hover:shadow-lg hover:shadow-purple-600/30 transition-all duration-200 active:scale-[0.98]"
          >
            Cancel — stay logged in
          </button>
          <button
            onClick={onConfirmLogout}
            className="w-full py-2.5 rounded-xl text-red-600 hover:bg-red-50 text-[13px] font-semibold transition-all duration-150 active:scale-[0.98]"
          >
            Logout anyway
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutWarningPopup;